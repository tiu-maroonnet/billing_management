<?php
// app/Services/MikrotikService.php

namespace App\Services;

use App\Models\Router;
use App\Models\Service;
use App\Models\Plan;
use App\Traits\MikrotikCommands;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use RouterOS\Client;
use RouterOS\Query;
use RouterOS\Exceptions\ClientException;
use RouterOS\Exceptions\ConfigException;
use RouterOS\Exceptions\QueryException;

class MikrotikService
{
    use MikrotikCommands;

    private $client;
    private $router;
    private $connected = false;

    public function __construct(Router $router)
    {
        $this->router = $router;
        $this->connect();
    }

    private function connect(): bool
    {
        try {
            $config = [
                'host' => $this->router->ip_address,
                'user' => $this->router->api_username,
                'pass' => $this->router->api_password,
                'port' => $this->router->api_port,
            ];

            if ($this->router->tls_enabled) {
                $config['ssl'] = true;
                $config['ssl_options'] = [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ];
            }

            $this->client = new Client($config);
            $this->connected = true;
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to connect to Mikrotik', [
                'router_id' => $this->router->id,
                'error' => $e->getMessage(),
            ]);
            $this->connected = false;
            return false;
        }
    }

    public function testConnection(): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Failed to connect to router',
            ];
        }

        try {
            $query = new Query('/system/resource/get');
            $response = $this->client->query($query)->read();
            
            return [
                'success' => true,
                'message' => 'Connection successful',
                'data' => $response[0] ?? [],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function createPPPoESecret(Service $service, Plan $plan): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Not connected to router',
            ];
        }

        try {
            // Create PPPoE secret
            $query = (new Query('/ppp/secret/add'))
                ->equal('name', $service->username)
                ->equal('password', $service->password)
                ->equal('service', 'pppoe')
                ->equal('profile', $plan->mikrotik_profile_name)
                ->equal('comment', 'CUST-' . $service->customer_id);

            $response = $this->client->query($query)->read();
            $secretId = $response['ret'] ?? null;

            if (!$secretId) {
                throw new \Exception('Failed to get secret ID');
            }

            // Create queue for the service
            $queueResponse = $this->createSimpleQueue($service, $plan);
            
            if (!$queueResponse['success']) {
                // Rollback: delete the secret if queue creation failed
                $this->deletePPPoESecret($secretId);
                return $queueResponse;
            }

            // Update service with Mikrotik IDs
            $service->update([
                'mikrotik_secret_id' => $secretId,
                'mikrotik_queue_id' => $queueResponse['queue_id'],
            ]);

            return [
                'success' => true,
                'message' => 'PPPoE service created successfully',
                'data' => [
                    'secret_id' => $secretId,
                    'queue_id' => $queueResponse['queue_id'],
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create PPPoE secret', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function createStaticIPService(Service $service, Plan $plan): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Not connected to router',
            ];
        }

        try {
            // Add to address list for filtering
            $addressListQuery = (new Query('/ip/firewall/address-list/add'))
                ->equal('address', $service->static_ip)
                ->equal('list', $plan->mikrotik_profile_name)
                ->equal('comment', 'CUST-' . $service->customer_id);

            $addressListResponse = $this->client->query($addressListQuery)->read();
            $addressListId = $addressListResponse['ret'] ?? null;

            // Create queue
            $queueResponse = $this->createSimpleQueue($service, $plan);
            
            if (!$queueResponse['success']) {
                // Rollback: remove from address list
                if ($addressListId) {
                    $this->removeFromAddressList($addressListId);
                }
                return $queueResponse;
            }

            // Add MAC binding if provided
            if ($service->mac_address) {
                $this->addMACBinding($service);
            }

            // Update service with Mikrotik IDs
            $service->update([
                'mikrotik_address_list_id' => $addressListId,
                'mikrotik_queue_id' => $queueResponse['queue_id'],
            ]);

            return [
                'success' => true,
                'message' => 'Static IP service created successfully',
                'data' => [
                    'address_list_id' => $addressListId,
                    'queue_id' => $queueResponse['queue_id'],
                ],
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create static IP service', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function suspendService(Service $service): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Not connected to router',
            ];
        }

        try {
            if ($service->type === 'pppoe') {
                // For PPPoE, change to suspended profile
                $query = (new Query('/ppp/secret/set'))
                    ->equal('.id', $service->mikrotik_secret_id)
                    ->equal('profile', 'SUSPENDED');

                $this->client->query($query)->read();
            } else {
                // For static IP, move to suspended address list
                if ($service->mikrotik_address_list_id) {
                    // Remove from current address list
                    $removeQuery = (new Query('/ip/firewall/address-list/remove'))
                        ->equal('.id', $service->mikrotik_address_list_id);
                    $this->client->query($removeQuery)->read();
                }

                // Add to suspended address list
                $addQuery = (new Query('/ip/firewall/address-list/add'))
                    ->equal('address', $service->static_ip)
                    ->equal('list', 'SUSPENDED')
                    ->equal('comment', 'CUST-' . $service->customer_id . '-SUSPENDED');

                $response = $this->client->query($addQuery)->read();
                $newAddressListId = $response['ret'] ?? null;

                // Update queue to limit speed
                if ($service->mikrotik_queue_id) {
                    $this->limitQueueSpeed($service->mikrotik_queue_id, 1024, 1024); // Limit to 1 Mbps
                }

                $service->update([
                    'mikrotik_address_list_id' => $newAddressListId,
                ]);
            }

            return [
                'success' => true,
                'message' => 'Service suspended successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to suspend service', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function reactivateService(Service $service, Plan $plan): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Not connected to router',
            ];
        }

        try {
            if ($service->type === 'pppoe') {
                // For PPPoE, restore original profile
                $query = (new Query('/ppp/secret/set'))
                    ->equal('.id', $service->mikrotik_secret_id)
                    ->equal('profile', $plan->mikrotik_profile_name);

                $this->client->query($query)->read();
            } else {
                // For static IP, remove from suspended list and add back to plan list
                if ($service->mikrotik_address_list_id) {
                    $removeQuery = (new Query('/ip/firewall/address-list/remove'))
                        ->equal('.id', $service->mikrotik_address_list_id);
                    $this->client->query($removeQuery)->read();
                }

                // Add back to plan address list
                $addQuery = (new Query('/ip/firewall/address-list/add'))
                    ->equal('address', $service->static_ip)
                    ->equal('list', $plan->mikrotik_profile_name)
                    ->equal('comment', 'CUST-' . $service->customer_id);

                $response = $this->client->query($addQuery)->read();
                $newAddressListId = $response['ret'] ?? null;

                // Restore queue speed
                if ($service->mikrotik_queue_id) {
                    $this->restoreQueueSpeed($service->mikrotik_queue_id, $plan);
                }

                $service->update([
                    'mikrotik_address_list_id' => $newAddressListId,
                ]);
            }

            return [
                'success' => true,
                'message' => 'Service reactivated successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to reactivate service', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function deleteService(Service $service): array
    {
        if (!$this->connected && !$this->connect()) {
            return [
                'success' => false,
                'message' => 'Not connected to router',
            ];
        }

        try {
            // Delete PPPoE secret if exists
            if ($service->mikrotik_secret_id) {
                $query = (new Query('/ppp/secret/remove'))
                    ->equal('.id', $service->mikrotik_secret_id);
                $this->client->query($query)->read();
            }

            // Delete queue if exists
            if ($service->mikrotik_queue_id) {
                $query = (new Query('/queue/simple/remove'))
                    ->equal('.id', $service->mikrotik_queue_id);
                $this->client->query($query)->read();
            }

            // Remove from address list if exists
            if ($service->mikrotik_address_list_id) {
                $query = (new Query('/ip/firewall/address-list/remove'))
                    ->equal('.id', $service->mikrotik_address_list_id);
                $this->client->query($query)->read();
            }

            return [
                'success' => true,
                'message' => 'Service deleted from router successfully',
            ];

        } catch (\Exception $e) {
            Log::error('Failed to delete service from router', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    public function getActiveConnections(): array
    {
        if (!$this->connected && !$this->connect()) {
            return [];
        }

        try {
            $query = new Query('/ppp/active/print');
            $connections = $this->client->query($query)->read();
            
            return $connections;
        } catch (\Exception $e) {
            Log::error('Failed to get active connections', [
                'router_id' => $this->router->id,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function getSystemResources(): array
    {
        if (!$this->connected && !$this->connect()) {
            return [];
        }

        try {
            $query = new Query('/system/resource/get');
            $resources = $this->client->query($query)->read();
            
            return $resources[0] ?? [];
        } catch (\Exception $e) {
            Log::error('Failed to get system resources', [
                'router_id' => $this->router->id,
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    public function __destruct()
    {
        if ($this->client) {
            try {
                $this->client->close();
            } catch (\Exception $e) {
                // Ignore errors during cleanup
            }
        }
    }
}
?>