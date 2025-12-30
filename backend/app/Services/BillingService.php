<?php
// app/Services/BillingService.php

namespace App\Services;

use App\Models\Customer;
use App\Models\Service;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Company;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BillingService
{
    private $company;

    public function __construct()
    {
        $this->company = Company::first();
    }

    public function generateMonthlyInvoices(): array
    {
        $generated = [];
        $errors = [];

        // Get all active services with due date in the next 7 days
        $services = Service::where('status', 'active')
            ->whereDate('next_billing_date', '<=', Carbon::now()->addDays(7))
            ->with(['customer', 'plan'])
            ->get();

        foreach ($services as $service) {
            try {
                DB::beginTransaction();

                $invoice = $this->createInvoiceForService($service);
                
                // Update service next billing date
                $service->update([
                    'next_billing_date' => Carbon::parse($service->next_billing_date)->addMonth(),
                ]);

                DB::commit();
                $generated[] = $invoice;

                Log::info('Invoice generated', [
                    'invoice_id' => $invoice->id,
                    'service_id' => $service->id,
                    'customer_id' => $service->customer_id,
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                $errors[] = [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ];
                Log::error('Failed to generate invoice', [
                    'service_id' => $service->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'generated' => count($generated),
            'errors' => count($errors),
            'details' => [
                'invoices' => $generated,
                'errors' => $errors,
            ],
        ];
    }

    public function createInvoiceForService(Service $service): Invoice
    {
        $customer = $service->customer;
        $plan = $service->plan;

        // Calculate period
        $periodStart = Carbon::now()->startOfMonth();
        $periodEnd = Carbon::now()->endOfMonth();
        $dueDate = Carbon::now()->addDays(7); // 7 days from generation

        // Calculate amount
        $amount = $plan->price;
        $tax = $amount * ($plan->tax_rate / 100);
        $total = $amount + $tax;

        // Generate invoice number
        $invoiceNumber = $this->generateInvoiceNumber();

        // Create invoice
        $invoice = Invoice::create([
            'invoice_number' => $invoiceNumber,
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'period_start' => $periodStart,
            'period_end' => $periodEnd,
            'due_date' => $dueDate,
            'amount' => $amount,
            'tax' => $tax,
            'total' => $total,
            'status' => 'unpaid',
            'created_by' => 1, // System user
        ]);

        // Schedule reminders
        $this->scheduleReminders($invoice);

        return $invoice;
    }

    private function generateInvoiceNumber(): string
    {
        $prefix = $this->company->invoice_prefix ?? 'INV';
        $yearMonth = date('Ym');
        $lastInvoice = Invoice::where('invoice_number', 'like', "{$prefix}{$yearMonth}%")
            ->orderBy('invoice_number', 'desc')
            ->first();

        if ($lastInvoice) {
            $lastNumber = intval(substr($lastInvoice->invoice_number, -4));
            $nextNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $nextNumber = str_pad($this->company->invoice_start_number ?? 1, 4, '0', STR_PAD_LEFT);
        }

        return "{$prefix}{$yearMonth}{$nextNumber}";
    }

    private function scheduleReminders(Invoice $invoice): void
    {
        $dueDate = Carbon::parse($invoice->due_date);
        $customer = $invoice->customer;

        // Schedule reminders at H-7, H-3, H (due date), H+3
        $reminderDates = [
            $dueDate->copy()->subDays(7),  // H-7
            $dueDate->copy()->subDays(3),  // H-3
            $dueDate,                       // H
            $dueDate->copy()->addDays(3),  // H+3
        ];

        foreach ($reminderDates as $scheduleDate) {
            // Only schedule future reminders
            if ($scheduleDate->isFuture()) {
                // Schedule email reminder for business hours (9 AM)
                $emailSchedule = $scheduleDate->copy()->setTime(9, 0, 0);
                \App\Models\Reminder::create([
                    'invoice_id' => $invoice->id,
                    'channel' => 'email',
                    'recipient' => $customer->email,
                    'subject' => 'Pengingat Pembayaran Invoice #' . $invoice->invoice_number,
                    'message' => $this->generateEmailReminderMessage($invoice),
                    'scheduled_at' => $emailSchedule,
                    'status' => 'pending',
                ]);

                // Schedule WhatsApp reminder for afternoon (2 PM)
                if ($customer->phone) {
                    $whatsAppSchedule = $scheduleDate->copy()->setTime(14, 0, 0);
                    \App\Models\Reminder::create([
                        'invoice_id' => $invoice->id,
                        'channel' => 'whatsapp',
                        'template_id' => 'invoice_reminder',
                        'recipient' => $customer->phone,
                        'message' => json_encode([
                            'customer_name' => $customer->name,
                            'total_amount' => number_format($invoice->total, 0, ',', '.'),
                            'due_date' => $dueDate->format('d/m/Y'),
                            'days_left' => $scheduleDate->diffInDays($dueDate),
                            'payment_link' => url('/pay/' . $invoice->id),
                        ]),
                        'scheduled_at' => $whatsAppSchedule,
                        'status' => 'pending',
                    ]);
                }
            }
        }
    }

    private function generateEmailReminderMessage(Invoice $invoice): string
    {
        $company = $this->company;
        $customer = $invoice->customer;
        $service = $invoice->service;

        return "
        Yth. {$customer->name},
        
        Ini adalah pengingat untuk pembayaran tagihan internet Anda.
        
        Detail Tagihan:
        - No. Invoice: {$invoice->invoice_number}
        - Periode: {$invoice->period_start->format('d/m/Y')} - {$invoice->period_end->format('d/m/Y')}
        - Total: Rp " . number_format($invoice->total, 0, ',', '.') . "
        - Jatuh Tempo: {$invoice->due_date->format('d/m/Y')}
        
        Layanan: {$service->service_code}
        
        Metode Pembayaran:
        1. Transfer Bank:
           Bank: {$company->bank_name}
           No. Rekening: {$company->bank_account}
           Atas Nama: {$company->bank_account_name}
        
        2. Virtual Account: (akan diinformasikan setelah pembayaran via gateway)
        
        3. QRIS: Scan QR code melalui aplikasi e-wallet
        
        Silakan melakukan pembayaran sebelum jatuh tempo untuk menghindari penangguhan layanan.
        
        Hubungi kami jika ada pertanyaan:
        Telepon: {$company->phone}
        Email: {$company->email}
        
        Terima kasih,
        {$company->name}
        {$company->brand}
        ";
    }

    public function processOverdueInvoices(): array
    {
        $processed = [];
        $errors = [];

        // Get overdue invoices (more than 3 days overdue)
        $overdueInvoices = Invoice::where('status', 'overdue')
            ->where('due_date', '<=', Carbon::now()->subDays(3))
            ->with(['service', 'customer'])
            ->get();

        foreach ($overdueInvoices as $invoice) {
            try {
                $service = $invoice->service;
                
                if ($service && $service->status === 'active') {
                    // Suspend the service
                    $mikrotikService = new MikrotikService($service->router);
                    $result = $mikrotikService->suspendService($service);
                    
                    if ($result['success']) {
                        $service->update([
                            'status' => 'suspended',
                            'suspended_at' => Carbon::now(),
                            'suspension_reason' => 'Overdue payment',
                        ]);

                        // Send suspension notification
                        $this->sendSuspensionNotification($invoice);

                        $processed[] = [
                            'invoice_id' => $invoice->id,
                            'service_id' => $service->id,
                            'action' => 'suspended',
                        ];
                    } else {
                        $errors[] = [
                            'invoice_id' => $invoice->id,
                            'error' => 'Failed to suspend service: ' . $result['message'],
                        ];
                    }
                }
            } catch (\Exception $e) {
                $errors[] = [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ];
                Log::error('Failed to process overdue invoice', [
                    'invoice_id' => $invoice->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return [
            'processed' => count($processed),
            'errors' => count($errors),
            'details' => [
                'processed' => $processed,
                'errors' => $errors,
            ],
        ];
    }

    private function sendSuspensionNotification(Invoice $invoice): void
    {
        $customer = $invoice->customer;
        
        // Send email notification
        if ($customer->email) {
            \App\Jobs\SendEmailReminder::dispatch(
                $customer->email,
                'Layanan Internet Ditangguhkan',
                $this->generateSuspensionEmailMessage($invoice)
            )->delay(now()->addMinutes(1));
        }

        // Send WhatsApp notification
        if ($customer->phone) {
            \App\Jobs\SendWhatsAppReminder::dispatch(
                $customer->phone,
                'service_suspended',
                [
                    'customer_name' => $customer->name,
                    'invoice_number' => $invoice->invoice_number,
                    'total_amount' => number_format($invoice->total, 0, ',', '.'),
                    'contact_number' => $this->company->phone,
                ]
            )->delay(now()->addMinutes(5));
        }
    }

    private function generateSuspensionEmailMessage(Invoice $invoice): string
    {
        $customer = $invoice->customer;
        $company = $this->company;

        return "
        Yth. {$customer->name},
        
        Dengan berat hati kami informasikan bahwa layanan internet Anda telah ditangguhkan karena pembayaran tagihan yang terlambat.
        
        Detail:
        - No. Invoice: {$invoice->invoice_number}
        - Total Tagihan: Rp " . number_format($invoice->total, 0, ',', '.') . "
        - Jatuh Tempo: {$invoice->due_date->format('d/m/Y')}
        
        Untuk mengaktifkan kembali layanan, silakan lakukan pembayaran tagihan tersebut.
        
        Setelah pembayaran, layanan akan diaktifkan kembali dalam waktu 1x24 jam.
        
        Hubungi kami jika sudah melakukan pembayaran:
        Telepon: {$company->phone}
        Email: {$company->email}
        
        Terima kasih,
        {$company->name}
        {$company->brand}
        ";
    }

    public function processPayment(Payment $payment): array
    {
        try {
            DB::beginTransaction();

            $invoice = $payment->invoice;
            $service = $invoice->service;
            $customer = $invoice->customer;

            // Update invoice status
            $invoice->update([
                'status' => 'paid',
                'paid_at' => Carbon::now(),
                'payment_method' => $payment->method,
                'payment_reference' => $payment->reference_number,
            ]);

            // Update payment status
            $payment->update([
                'status' => 'completed',
                'verified_at' => Carbon::now(),
                'verified_by' => auth()->id() ?? 1,
            ]);

            // If service was suspended, reactivate it
            if ($service && $service->status === 'suspended') {
                $plan = $service->plan;
                $mikrotikService = new MikrotikService($service->router);
                $result = $mikrotikService->reactivateService($service, $plan);

                if ($result['success']) {
                    $service->update([
                        'status' => 'active',
                        'suspended_at' => null,
                        'suspension_reason' => null,
                    ]);

                    // Send reactivation notification
                    $this->sendReactivationNotification($customer, $service);
                }
            }

            // Send payment confirmation
            $this->sendPaymentConfirmation($customer, $invoice, $payment);

            // Create audit log
            \App\Models\AuditLog::create([
                'user_id' => auth()->id() ?? 1,
                'action' => 'payment.processed',
                'resource_type' => 'invoice',
                'resource_id' => $invoice->id,
                'payload' => [
                    'payment_id' => $payment->id,
                    'amount' => $payment->amount,
                    'method' => $payment->method,
                ],
            ]);

            DB::commit();

            return [
                'success' => true,
                'message' => 'Payment processed successfully',
                'invoice' => $invoice,
                'payment' => $payment,
            ];

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to process payment', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => 'Failed to process payment: ' . $e->getMessage(),
            ];
        }
    }

    private function sendPaymentConfirmation(Customer $customer, Invoice $invoice, Payment $payment): void
    {
        // Send email confirmation
        if ($customer->email) {
            \App\Jobs\SendEmailReminder::dispatch(
                $customer->email,
                'Konfirmasi Pembayaran Berhasil',
                $this->generatePaymentConfirmationMessage($invoice, $payment)
            )->delay(now()->addMinutes(1));
        }

        // Send WhatsApp confirmation
        if ($customer->phone) {
            \App\Jobs\SendWhatsAppReminder::dispatch(
                $customer->phone,
                'payment_confirmation',
                [
                    'customer_name' => $customer->name,
                    'invoice_number' => $invoice->invoice_number,
                    'amount_paid' => number_format($payment->amount, 0, ',', '.'),
                    'payment_date' => $payment->created_at->format('d/m/Y H:i'),
                    'reference' => $payment->reference_number,
                ]
            )->delay(now()->addMinutes(5));
        }
    }

    private function sendReactivationNotification(Customer $customer, Service $service): void
    {
        // Send reactivation email
        if ($customer->email) {
            $message = "
            Yth. {$customer->name},
            
            Layanan internet Anda telah diaktifkan kembali.
            
            Detail Layanan:
            - Kode Layanan: {$service->service_code}
            - Tipe: " . strtoupper($service->type) . "
            " . ($service->type === 'pppoe' ? "- Username: {$service->username}\n- Password: {$service->password}" : "- IP Address: {$service->static_ip}") . "
            
            Terima kasih telah melakukan pembayaran.
            
            Hubungi kami jika ada kendala:
            Telepon: {$this->company->phone}
            Email: {$this->company->email}
            
            Salam,
            {$this->company->name}
            {$this->company->brand}
            ";

            \App\Jobs\SendEmailReminder::dispatch(
                $customer->email,
                'Layanan Internet Diaktifkan Kembali',
                $message
            )->delay(now()->addMinutes(1));
        }
    }

    private function generatePaymentConfirmationMessage(Invoice $invoice, Payment $payment): string
    {
        $company = $this->company;
        $customer = $invoice->customer;

        return "
        Yth. {$customer->name},
        
        Pembayaran Anda telah berhasil diproses.
        
        Detail Pembayaran:
        - No. Invoice: {$invoice->invoice_number}
        - Total Dibayar: Rp " . number_format($payment->amount, 0, ',', '.') . "
        - Metode Pembayaran: " . ucfirst(str_replace('_', ' ', $payment->method)) . "
        - No. Referensi: {$payment->reference_number}
        - Tanggal: {$payment->created_at->format('d/m/Y H:i')}
        
        Terima kasih telah membayar tagihan tepat waktu.
        
        Untuk informasi lebih lanjut, hubungi:
        Telepon: {$company->phone}
        Email: {$company->email}
        
        Salam,
        {$company->name}
        {$company->brand}
        ";
    }

    public function getDashboardStats(): array
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        return [
            'customers' => [
                'total' => Customer::count(),
                'active' => Customer::where('status', 'active')->count(),
                'suspended' => Customer::where('status', 'suspended')->count(),
                'new_this_month' => Customer::whereBetween('created_at', [$startOfMonth, $endOfMonth])->count(),
            ],
            'services' => [
                'total' => Service::count(),
                'active' => Service::where('status', 'active')->count(),
                'pppoe' => Service::where('type', 'pppoe')->count(),
                'static' => Service::where('type', 'static')->count(),
            ],
            'financial' => [
                'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
                'monthly_revenue' => Payment::where('status', 'completed')
                    ->whereBetween('created_at', [$startOfMonth, $endOfMonth])
                    ->sum('amount'),
                'outstanding' => Invoice::where('status', 'unpaid')->sum('total'),
                'overdue' => Invoice::where('status', 'overdue')->sum('total'),
            ],
            'invoices' => [
                'unpaid' => Invoice::where('status', 'unpaid')->count(),
                'overdue' => Invoice::where('status', 'overdue')->count(),
                'paid_today' => Invoice::whereDate('paid_at', $today)->count(),
                'generated_today' => Invoice::whereDate('created_at', $today)->count(),
            ],
            'tickets' => [
                'open' => \App\Models\Ticket::where('status', 'open')->count(),
                'in_progress' => \App\Models\Ticket::where('status', 'in_progress')->count(),
                'resolved_today' => \App\Models\Ticket::whereDate('resolved_at', $today)->count(),
            ],
        ];
    }
}
?>