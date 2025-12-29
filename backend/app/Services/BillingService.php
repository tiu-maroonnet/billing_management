<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Service;
use App\Models\Invoice;
use App\Models\Plan;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    public function generateMonthlyInvoices(): int
    {
        $count = 0;
        $services = Service::where('status', 'active')->get();

        foreach ($services as $service) {
            try {
                $this->generateInvoiceForService($service);
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to generate invoice for service {$service->id}: " . $e->getMessage());
            }
        }

        return $count;
    }

    public function generateInvoiceForService(Service $service): Invoice
    {
        // Check if invoice already exists for current period
        $currentMonth = Carbon::now()->startOfMonth();
        $existingInvoice = Invoice::where('service_id', $service->id)
            ->where('period_start', $currentMonth->format('Y-m-d'))
            ->first();

        if ($existingInvoice) {
            return $existingInvoice;
        }

        $plan = $service->plan;
        $customer = $service->customer;

        // Calculate period
        $periodStart = $currentMonth;
        $periodEnd = $currentMonth->copy()->endOfMonth();
        $dueDate = Carbon::now()->setDay($service->due_day);

        // Adjust due date if it's in the past
        if ($dueDate->lt(Carbon::now())) {
            $dueDate->addMonth();
        }

        // Calculate amounts
        $amount = $plan->price;
        $tax = $amount * ($plan->tax_rate / 100);
        $total = $amount + $tax;

        // Generate invoice number
        $invoiceNumber = $this->generateInvoiceNumber();

        // Create invoice
        $invoice = Invoice::create([
            'uuid' => \Illuminate\Support\Str::uuid(),
            'invoice_number' => $invoiceNumber,
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'amount' => $amount,
            'tax' => $tax,
            'discount' => 0,
            'total' => $total,
            'due_date' => $dueDate,
            'status' => 'unpaid',
            'items' => [
                [
                    'description' => "Paket {$plan->name} - {$periodStart->format('F Y')}",
                    'quantity' => 1,
                    'price' => $amount,
                    'total' => $amount,
                ]
            ],
        ]);

        // Create reminder schedule
        $this->scheduleReminders($invoice);

        return $invoice;
    }

    private function generateInvoiceNumber(): string
    {
        $prefix = 'INV/MRN/';
        $year = Carbon::now()->format('Y');
        $month = Carbon::now()->format('m');
        
        $lastInvoice = Invoice::where('invoice_number', 'like', "{$prefix}{$year}/%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = (int) substr($lastInvoice->invoice_number, -4);
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = '0001';
        }

        return "{$prefix}{$year}/{$month}/{$nextNumber}";
    }

    private function scheduleReminders(Invoice $invoice): void
    {
        $dueDate = Carbon::parse($invoice->due_date);
        $customer = $invoice->customer;
        
        // Reminder schedule: 7 days, 3 days, 1 day before due date, on due date, 3 days after
        $reminderDays = [7, 3, 1, 0, -3];
        
        foreach ($reminderDays as $days) {
            $scheduledAt = $dueDate->copy()->addDays(-$days)->setTime(9, 0);
            
            // Skip if reminder is in the past
            if ($scheduledAt->lt(Carbon::now())) {
                continue;
            }

            // Email reminder
            \App\Models\Reminder::create([
                'uuid' => \Illuminate\Support\Str::uuid(),
                'invoice_id' => $invoice->id,
                'channel' => 'email',
                'template_id' => $days >= 0 ? 'invoice_reminder' : 'invoice_overdue',
                'content' => '',
                'recipient' => $customer->email,
                'scheduled_at' => $scheduledAt,
                'status' => 'pending',
            ]);

            // WhatsApp reminder if customer has phone
            if ($customer->phone) {
                \App\Models\Reminder::create([
                    'uuid' => \Illuminate\Support\Str::uuid(),
                    'invoice_id' => $invoice->id,
                    'channel' => 'whatsapp',
                    'template_id' => $days >= 0 ? 'invoice_reminder' : 'invoice_overdue',
                    'content' => '',
                    'recipient' => $customer->phone,
                    'scheduled_at' => $scheduledAt,
                    'status' => 'pending',
                ]);
            }
        }
    }

    public function processOverdueInvoices(): int
    {
        $count = 0;
        $overdueInvoices = Invoice::where('status', 'unpaid')
            ->where('due_date', '<', Carbon::now())
            ->get();

        foreach ($overdueInvoices as $invoice) {
            try {
                $invoice->status = 'overdue';
                $invoice->save();
                
                // Trigger overdue reminders
                $this->triggerOverdueReminders($invoice);
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to process overdue invoice {$invoice->id}: " . $e->getMessage());
            }
        }

        return $count;
    }

    private function triggerOverdueReminders(Invoice $invoice): void
    {
        // Logic for overdue reminders
        // This would typically trigger immediate notifications
    }
}