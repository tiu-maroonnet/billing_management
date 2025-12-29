<?php

namespace App\Services;

use App\Models\Router;
use App\Models\Service;
use App\Exceptions\MikrotikException;
use Illuminate\Support\Facades\Log;
use RouterOS\Client;
use RouterOS\Query;
use RouterOS\Exceptions\ClientException;
use RouterOS\Exceptions\ConfigException;
use RouterOS\Exceptions\QueryException;

class MikrotikService
{
    private $client;
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
        $this->connect();
    }

    private function connect(): void
    {
        try {
            $config = [
                'host' => $this->router->ip_address,
                'user' => $this->router->username,
                'pass' => decrypt($this->router->password),
                'port' => $this->router->api_port,
                'ssl' => $this->router->use_tls,
            ];

            $this->client = new Client($config);
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to connect to router: " . $e->getMessage());
        }
    }

    public function testConnection(): bool
    {
        try {
            $query = new Query('/system/resource/print');
            $response = $this->client->query($query)->read();
            return !empty($response);
        } catch (\Exception $e) {
            return false;
        }
    }

    public function createPppoeSecret(Service $service, string $profileName): string
    {
        try {
            $query = (new Query('/ppp/secret/add'))
                ->equal('name', $service->username)
                ->equal('password', $service->password)
                ->equal('service', 'pppoe')
                ->equal('profile', $profileName)
                ->equal('remote-address', $service->static_ip)
                ->equal('comment', $service->customer_id);

            $response = $this->client->query($query)->read();
            
            if (empty($response)) {
                throw new MikrotikException('Failed to create PPPoE secret');
            }

            return $response[0]['.id'];
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to create PPPoE secret: " . $e->getMessage());
        }
    }

    public function createSimpleQueue(Service $service, array $rateLimits): string
    {
        try {
            $query = (new Query('/queue/simple/add'))
                ->equal('name', "customer_{$service->customer_id}")
                ->equal('target', $service->static_ip ?: "{$service->username}@pppoe")
                ->equal('max-limit', "{$rateLimits['down']}/{$rateLimits['up']}")
                ->equal('burst-limit', "{$rateLimits['burst_down']}/{$rateLimits['burst_up']}")
                ->equal('burst-threshold', "{$rateLimits['threshold']}")
                ->equal('burst-time', "{$rateLimits['burst_time']}")
                ->equal('comment', $service->customer_id);

            $response = $this->client->query($query)->read();
            
            if (empty($response)) {
                throw new MikrotikException('Failed to create queue');
            }

            return $response[0]['.id'];
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to create queue: " . $e->getMessage());
        }
    }

    public function addToAddressList(Service $service, string $listName): string
    {
        try {
            $query = (new Query('/ip/firewall/address-list/add'))
                ->equal('list', $listName)
                ->equal('address', $service->static_ip)
                ->equal('comment', $service->customer_id);

            $response = $this->client->query($query)->read();
            
            if (empty($response)) {
                throw new MikrotikException('Failed to add to address list');
            }

            return $response[0]['.id'];
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to add to address list: " . $e->getMessage());
        }
    }

    public function suspendPppoeService(string $secretId): bool
    {
        try {
            $query = (new Query('/ppp/secret/set'))
                ->equal('.id', $secretId)
                ->equal('disabled', 'yes');

            $this->client->query($query)->read();
            return true;
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to suspend PPPoE service: " . $e->getMessage());
        }
    }

    public function reactivatePppoeService(string $secretId): bool
    {
        try {
            $query = (new Query('/ppp/secret/set'))
                ->equal('.id', $secretId)
                ->equal('disabled', 'no');

            $this->client->query($query)->read();
            return true;
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to reactivate PPPoE service: " . $e->getMessage());
        }
    }

    public function suspendStaticService(string $addressListId, string $ipAddress): bool
    {
        try {
            // Remove from active list
            $query = (new Query('/ip/firewall/address-list/remove'))
                ->equal('.id', $addressListId);
            $this->client->query($query)->read();

            // Add to suspended list
            $query = (new Query('/ip/firewall/address-list/add'))
                ->equal('list', 'SUSPENDED')
                ->equal('address', $ipAddress);
            $this->client->query($query)->read();

            return true;
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to suspend static service: " . $e->getMessage());
        }
    }

    public function getActiveConnections(): array
    {
        try {
            $query = new Query('/ppp/active/print');
            $response = $this->client->query($query)->read();
            return $response;
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to get active connections: " . $e->getMessage());
        }
    }

    public function getSystemResource(): array
    {
        try {
            $query = new Query('/system/resource/print');
            $response = $this->client->query($query)->read();
            return $response[0] ?? [];
        } catch (\Exception $e) {
            throw new MikrotikException("Failed to get system resource: " . $e->getMessage());
        }
    }
}