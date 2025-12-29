<?php

namespace App\Jobs;

use App\Models\Service;
use App\Services\MikrotikService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessMikrotikProvisioning implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $service;
    public $action;
    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(Service $service, string $action)
    {
        $this->service = $service;
        $this->action = $action;
    }

    public function handle(): void
    {
        try {
            $router = $this->service->router;
            $mikrotik = new MikrotikService($router);
            $plan = $this->service->plan;

            $log = [];
            $timestamp = now()->toDateTimeString();

            switch ($this->action) {
                case 'create':
                    $log[] = "[{$timestamp}] Starting service creation";
                    
                    if ($this->service->type === 'pppoe') {
                        // Create PPPoE secret
                        $secretId = $mikrotik->createPppoeSecret(
                            $this->service,
                            $plan->mikrotik_profile['profile_name'] ?? 'default'
                        );
                        $this->service->mikrotik_secret_id = $secretId;
                        $log[] = "[{$timestamp}] Created PPPoE secret: {$secretId}";

                        // Create queue
                        $queueId = $mikrotik->createSimpleQueue($this->service, [
                            'down' => $plan->rate_limit_down,
                            'up' => $plan->rate_limit_up,
                            'burst_down' => $plan->burst_limit_down ?? $plan->rate_limit_down,
                            'burst_up' => $plan->burst_limit_up ?? $plan->rate_limit_up,
                            'threshold' => $plan->burst_threshold,
                            'burst_time' => $plan->burst_time,
                        ]);
                        $this->service->mikrotik_queue_id = $queueId;
                        $log[] = "[{$timestamp}] Created queue: {$queueId}";
                    } else {
                        // Static IP configuration
                        $addressListId = $mikrotik->addToAddressList(
                            $this->service,
                            $plan->mikrotik_profile['address_list'] ?? 'active_clients'
                        );
                        $this->service->mikrotik_address_list_id = $addressListId;
                        $log[] = "[{$timestamp}] Added to address list: {$addressListId}";

                        $queueId = $mikrotik->createSimpleQueue($this->service, [
                            'down' => $plan->rate_limit_down,
                            'up' => $plan->rate_limit_up,
                            'burst_down' => $plan->burst_limit_down ?? $plan->rate_limit_down,
                            'burst_up' => $plan->burst_limit_up ?? $plan->rate_limit_up,
                            'threshold' => $plan->burst_threshold,
                            'burst_time' => $plan->burst_time,
                        ]);
                        $this->service->mikrotik_queue_id = $queueId;
                        $log[] = "[{$timestamp}] Created queue: {$queueId}";
                    }

                    $this->service->status = 'active';
                    $this->service->last_provisioned_at = now();
                    $log[] = "[{$timestamp}] Service activated successfully";
                    break;

                case 'suspend':
                    $log[] = "[{$timestamp}] Starting service suspension";
                    
                    if ($this->service->type === 'pppoe' && $this->service->mikrotik_secret_id) {
                        $mikrotik->suspendPppoeService($this->service->mikrotik_secret_id);
                        $log[] = "[{$timestamp}] PPPoE secret suspended";
                    } elseif ($this->service->mikrotik_address_list_id) {
                        $mikrotik->suspendStaticService(
                            $this->service->mikrotik_address_list_id,
                            $this->service->static_ip
                        );
                        $log[] = "[{$timestamp}] Static service suspended";
                    }

                    $this->service->status = 'suspended';
                    $this->service->suspended_at = now();
                    $log[] = "[{$timestamp}] Service suspended successfully";
                    break;

                case 'reactivate':
                    $log[] = "[{$timestamp}] Starting service reactivation";
                    
                    if ($this->service->type === 'pppoe' && $this->service->mikrotik_secret_id) {
                        $mikrotik->reactivatePppoeService($this->service->mikrotik_secret_id);
                        $log[] = "[{$timestamp}] PPPoE secret reactivated";
                    }

                    $this->service->status = 'active';
                    $this->service->suspended_at = null;
                    $this->service->last_provisioned_at = now();
                    $log[] = "[{$timestamp}] Service reactivated successfully";
                    break;
            }

            $this->service->provisioning_log = implode("\n", $log);
            $this->service->save();

        } catch (\Exception $e) {
            Log::error("Mikrotik provisioning failed for service {$this->service->id}: " . $e->getMessage());
            $this->service->provisioning_log .= "\n[ERROR] " . $e->getMessage();
            $this->service->save();
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('ProcessMikrotikProvisioning job failed: ' . $exception->getMessage());
        
        // Update service status to indicate provisioning failure
        $this->service->update([
            'provisioning_log' => $this->service->provisioning_log . "\n[FAILED] " . $exception->getMessage(),
        ]);
    }
}