<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Service;
use App\Models\Invoice;
use Carbon\Carbon;
use App\Jobs\ProcessMikrotikProvisioning;

class AutoSuspendServices extends Command
{
    protected $signature = 'services:auto-suspend';
    protected $description = 'Automatically suspend services with overdue invoices';

    public function handle(): void
    {
        $this->info('Starting automatic service suspension...');
        
        // Find services with overdue invoices beyond grace period
        $overdueDate = Carbon::now()->subDays(3); // 3 days grace period
        
        $services = Service::where('status', 'active')
            ->whereHas('invoices', function ($query) use ($overdueDate) {
                $query->where('status', 'overdue')
                    ->where('due_date', '<=', $overdueDate);
            })
            ->get();

        $this->info("Found {$services->count()} services to suspend");

        foreach ($services as $service) {
            try {
                $this->info("Suspending service {$service->id} for customer {$service->customer->name}");
                
                ProcessMikrotikProvisioning::dispatch($service, 'suspend');
                
                // Log the action
                \App\Models\AuditLog::create([
                    'user_id' => null,
                    'action' => 'auto_suspend',
                    'resource_type' => 'Service',
                    'resource_id' => $service->id,
                    'payload' => [
                        'reason' => 'Overdue invoice beyond grace period',
                        'service_id' => $service->id,
                        'customer_id' => $service->customer_id,
                    ],
                ]);
                
            } catch (\Exception $e) {
                $this->error("Failed to suspend service {$service->id}: " . $e->getMessage());
            }
        }

        $this->info('Automatic service suspension completed.');
    }
}