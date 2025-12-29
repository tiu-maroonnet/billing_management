<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\BillingService;

class GenerateMonthlyInvoices extends Command
{
    protected $signature = 'invoices:generate-monthly';
    protected $description = 'Generate monthly invoices for all active services';

    public function handle(BillingService $billingService): void
    {
        $this->info('Starting monthly invoice generation...');
        
        $count = $billingService->generateMonthlyInvoices();
        
        $this->info("Successfully generated {$count} invoices");
        
        // Also process overdue invoices
        $overdueCount = $billingService->processOverdueInvoices();
        $this->info("Processed {$overdueCount} overdue invoices");
    }
}