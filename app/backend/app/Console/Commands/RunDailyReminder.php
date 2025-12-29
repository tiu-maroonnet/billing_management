<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use App\Jobs\SendEmailReminderJob;
use App\Jobs\SendWhatsAppReminderJob;
use Carbon\Carbon;

class RunDailyReminder extends Command
{
    protected $signature = 'reminders:daily';
    protected $description = 'Send daily payment reminders';

    public function handle()
    {
        $today = Carbon::today();
        
        // Find invoices due in 7 days
        $dueIn7Days = $today->copy()->addDays(7);
        $invoices7Days = Invoice::where('due_date', $dueIn7Days)
            ->where('status', 'unpaid')
            ->whereDoesntHave('reminders', function ($query) use ($dueIn7Days) {
                $query->where('type', 'due_reminder')
                      ->whereDate('created_at', $dueIn7Days);
            })
            ->get();

        foreach ($invoices7Days as $invoice) {
            SendEmailReminderJob::dispatch($invoice, 'due_reminder');
            SendWhatsAppReminderJob::dispatch($invoice, 'due_reminder');
        }

        // Find invoices due in 3 days
        $dueIn3Days = $today->copy()->addDays(3);
        $invoices3Days = Invoice::where('due_date', $dueIn3Days)
            ->where('status', 'unpaid')
            ->whereDoesntHave('reminders', function ($query) use ($dueIn3Days) {
                $query->where('type', 'due_reminder')
                      ->whereDate('created_at', $dueIn3Days);
            })
            ->get();

        foreach ($invoices3Days as $invoice) {
            SendEmailReminderJob::dispatch($invoice, 'due_reminder');
            SendWhatsAppReminderJob::dispatch($invoice, 'due_reminder');
        }

        // Find overdue invoices
        $overdueInvoices = Invoice::where('due_date', '<', $today)
            ->where('status', 'unpaid')
            ->whereDoesntHave('reminders', function ($query) use ($today) {
                $query->where('type', 'overdue_notice')
                      ->whereDate('created_at', $today);
            })
            ->get();

        foreach ($overdueInvoices as $invoice) {
            SendEmailReminderJob::dispatch($invoice, 'overdue_notice');
            SendWhatsAppReminderJob::dispatch($invoice, 'overdue_notice');
        }

        // Find invoices for suspension (5 days overdue)
        $suspensionDate = $today->copy()->subDays(5);
        $suspensionInvoices = Invoice::where('due_date', '<=', $suspensionDate)
            ->where('status', 'unpaid')
            ->whereDoesntHave('reminders', function ($query) use ($today) {
                $query->where('type', 'suspension_warning')
                      ->whereDate('created_at', $today);
            })
            ->get();

        foreach ($suspensionInvoices as $invoice) {
            // Send suspension warning
            SendEmailReminderJob::dispatch($invoice, 'suspension_warning');
            SendWhatsAppReminderJob::dispatch($invoice, 'suspension_warning');
            
            // Auto suspend service
            $service = $invoice->service;
            if ($service && $service->status === 'active') {
                $service->update(['status' => 'suspended']);
                // Dispatch suspend job
                // SuspendServiceJob::dispatch($service);
            }
        }

        $this->info('Daily reminders processed successfully.');
        return 0;
    }
}