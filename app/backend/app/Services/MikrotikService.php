<?php

namespace App\Services;

use App\Models\Router;
use App\Models\Service;
use App\Models\Plan;
use App\Models\MikrotikLog;
use Illuminate\Support\Facades\Log;
use RouterOS\Client;
use RouterOS\Query;
use RouterOS\Exceptions\ClientException;
use RouterOS\Exceptions\ConfigException;
use RouterOS\Exceptions\QueryException;

class MikrotikService
{
    public function testConnection(Router $router)
    {
        try {
            $client = $this->getClient($router);
            $query = (new Query('/system/resource/print'));
            $response = $client->query($query)->read();

            return [
                'success' => true,
                'message' => 'Connection successful',
                'data' => $response[0] ?? [],
                'timestamp' => now()
            ];
        } catch (\Exception $e) {
            Log::error('Mikrotik connection test failed', [
                'router_id' => $router->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Connection failed',
                'error' => $e->getMessage(),
                'timestamp' => now()
            ];
        }
    }

    public function createPppoeUser(Service $service, $password)
    {
        try {
            $router = $service->router;
            $client = $this->getClient($router);

            // Get plan configuration
            $plan = $service->plan;
            $profileName = $this->ensurePppoeProfile($client, $plan);

            // Create PPPoE secret
            $query = (new Query('/ppp/secret/add'))
                ->equal('name', $service->username)
                ->equal('password', $password)
                ->equal('service', 'pppoe')
                ->equal('profile', $profileName)
                ->equal('comment', "customer_{$service->customer_id}_service_{$service->id}");

            $response = $client->query($query)->read();

            // Create queue for bandwidth limiting
            $this->createQueue($client, $service, $plan);

            // Log the action
            MikrotikLog::create([
                'router_id' => $router->id,
                'service_id' => $service->id,
                'command' => '/ppp/secret/add',
                'parameters' => [
                    'username' => $service->username,
                    'profile' => $profileName
                ],
                'status' => 'success',
                'response' => json_encode($response),
            ]);

            return [
                'success' => true,
                'message' => 'PPPoE user created successfully',
                'data' => $response
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create PPPoE user', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            MikrotikLog::create([
                'router_id' => $router->id ?? null,
                'service_id' => $service->id,
                'command' => '/ppp/secret/add',
                'parameters' => [
                    'username' => $service->username,
                ],
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create PPPoE user',
                'error' => $e->getMessage()
            ];
        }
    }

    public function createStaticIpService(Service $service)
    {
        try {
            $router = $service->router;
            $client = $this->getClient($router);
            $plan = $service->plan;

            // Add to address list
            $query = (new Query('/ip/firewall/address-list/add'))
                ->equal('address', $service->static_ip)
                ->equal('list', "PLAN_{$plan->code}")
                ->equal('comment', "customer_{$service->customer_id}_service_{$service->id}");

            $client->query($query)->read();

            // Create simple queue
            $this->createQueue($client, $service, $plan);

            // Add ARP binding if MAC address provided
            if ($service->mac_address) {
                $query = (new Query('/ip/arp/add'))
                    ->equal('address', $service->static_ip)
                    ->equal('mac-address', $service->mac_address)
                    ->equal('comment', "customer_{$service->customer_id}_service_{$service->id}");

                $client->query($query)->read();
            }

            MikrotikLog::create([
                'router_id' => $router->id,
                'service_id' => $service->id,
                'command' => 'static_ip_setup',
                'parameters' => [
                    'ip' => $service->static_ip,
                    'plan' => $plan->code
                ],
                'status' => 'success',
            ]);

            return [
                'success' => true,
                'message' => 'Static IP service configured successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to create static IP service', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to configure static IP service',
                'error' => $e->getMessage()
            ];
        }
    }

    public function suspendService(Service $service)
    {
        try {
            $router = $service->router;
            $client = $this->getClient($router);

            if ($service->type === 'pppoe') {
                // Disable PPPoE secret or move to suspended profile
                $query = (new Query('/ppp/secret/print'))
                    ->where('name', $service->username);
                
                $secrets = $client->query($query)->read();
                
                if (!empty($secrets)) {
                    $secretId = $secrets[0]['.id'];
                    $query = (new Query('/ppp/secret/set'))
                        ->equal('.id', $secretId)
                        ->equal('disabled', 'yes');

                    $client->query($query)->read();
                }
            } else {
                // For static IP, move to SUSPENDED address list
                $this->moveToSuspendedList($client, $service);
            }

            MikrotikLog::create([
                'router_id' => $router->id,
                'service_id' => $service->id,
                'command' => 'suspend_service',
                'parameters' => ['type' => $service->type],
                'status' => 'success',
            ]);

            return [
                'success' => true,
                'message' => 'Service suspended successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to suspend service', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to suspend service',
                'error' => $e->getMessage()
            ];
        }
    }

    public function reactivateService(Service $service)
    {
        try {
            $router = $service->router;
            $client = $this->getClient($router);

            if ($service->type === 'pppoe') {
                // Enable PPPoE secret
                $query = (new Query('/ppp/secret/print'))
                    ->where('name', $service->username);
                
                $secrets = $client->query($query)->read();
                
                if (!empty($secrets)) {
                    $secretId = $secrets[0]['.id'];
                    $query = (new Query('/ppp/secret/set'))
                        ->equal('.id', $secretId)
                        ->equal('disabled', 'no');

                    $client->query($query)->read();
                }
            } else {
                // Move back to plan address list
                $this->moveToPlanList($client, $service);
            }

            MikrotikLog::create([
                'router_id' => $router->id,
                'service_id' => $service->id,
                'command' => 'reactivate_service',
                'parameters' => ['type' => $service->type],
                'status' => 'success',
            ]);

            return [
                'success' => true,
                'message' => 'Service reactivated successfully'
            ];
        } catch (\Exception $e) {
            Log::error('Failed to reactivate service', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'Failed to reactivate service',
                'error' => $e->getMessage()
            ];
        }
    }

    private function getClient(Router $router)
    {
        return new Client([
            'host' => $router->ip_address,
            'user' => $router->username,
            'pass' => decrypt($router->password_encrypted),
            'port' => $router->api_port,
            'ssl' => $router->tls_enabled,
        ]);
    }

    private function ensurePppoeProfile($client, Plan $plan)
    {
        $profileName = "PROFILE_{$plan->code}";
        
        try {
            // Check if profile exists
            $query = (new Query('/ppp/profile/print'))
                ->where('name', $profileName);
            
            $profiles = $client->query($query)->read();
            
            if (empty($profiles)) {
                // Create new profile
                $query = (new Query('/ppp/profile/add'))
                    ->equal('name', $profileName)
                    ->equal('rate-limit', "{$plan->rate_limit_up}/{$plan->rate_limit_down}")
                    ->equal('comment', "Auto-generated for plan {$plan->code}");
                
                $client->query($query)->read();
            }

            return $profileName;
        } catch (\Exception $e) {
            throw new \Exception("Failed to ensure PPPoE profile: " . $e->getMessage());
        }
    }

    private function createQueue($client, Service $service, Plan $plan)
    {
        $queueName = "customer_{$service->customer_id}_service_{$service->id}";
        
        if ($service->type === 'pppoe') {
            $target = $service->username;
        } else {
            $target = $service->static_ip;
        }

        $query = (new Query('/queue/simple/add'))
            ->equal('name', $queueName)
            ->equal('target', $target)
            ->equal('max-limit', "{$plan->rate_limit_up}/{$plan->rate_limit_down}")
            ->equal('burst-limit', "{$plan->burst_limit_up}/{$plan->burst_limit_down}")
            ->equal('burst-threshold', "{$plan->burst_threshold_up}/{$plan->burst_threshold_down}")
            ->equal('burst-time', "{$plan->burst_time_up}/{$plan->burst_time_down}")
            ->equal('comment', "customer_{$service->customer_id}_service_{$service->id}");

        return $client->query($query)->read();
    }

    private function moveToSuspendedList($client, Service $service)
    {
        // Remove from current address list
        $query = (new Query('/ip/firewall/address-list/print'))
            ->where('address', $service->static_ip);
        
        $entries = $client->query($query)->read();
        
        foreach ($entries as $entry) {
            if ($entry['list'] !== 'SUSPENDED') {
                $query = (new Query('/ip/firewall/address-list/remove'))
                    ->equal('.id', $entry['.id']);
                $client->query($query)->read();
            }
        }

        // Add to SUSPENDED list
        $query = (new Query('/ip/firewall/address-list/add'))
            ->equal('address', $service->static_ip)
            ->equal('list', 'SUSPENDED')
            ->equal('comment', "suspended_customer_{$service->customer_id}_service_{$service->id}");

        return $client->query($query)->read();
    }

    private function moveToPlanList($client, Service $service)
    {
        $plan = $service->plan;
        
        // Remove from SUSPENDED list
        $query = (new Query('/ip/firewall/address-list/print'))
            ->where('address', $service->static_ip)
            ->where('list', 'SUSPENDED');
        
        $entries = $client->query($query)->read();
        
        foreach ($entries as $entry) {
            $query = (new Query('/ip/firewall/address-list/remove'))
                ->equal('.id', $entry['.id']);
            $client->query($query)->read();
        }

        // Add to plan list
        $query = (new Query('/ip/firewall/address-list/add'))
            ->equal('address', $service->static_ip)
            ->equal('list', "PLAN_{$plan->code}")
            ->equal('comment', "customer_{$service->customer_id}_service_{$service->id}");

        return $client->query($query)->read();
    }
}