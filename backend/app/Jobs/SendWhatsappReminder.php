<?php

namespace App\Jobs;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsappReminder implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $reminder;
    public $tries = 3;
    public $backoff = [60, 300, 600];

    public function __construct(Reminder $reminder)
    {
        $this->reminder = $reminder;
    }

    public function handle(): void
    {
        try {
            $invoice = $this->reminder->invoice;
            $customer = $invoice->customer;
            $company = \App\Models\Company::first();

            // Prepare message content
            $templateData = $this->prepareTemplateData($invoice, $customer, $company);
            
            // Send via WhatsApp API
            $response = $this->sendWhatsAppMessage(
                $customer->phone,
                $this->reminder->template_id,
                $templateData
            );

            if ($response->successful()) {
                $this->reminder->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'metadata' => ['message_id' => $response->json('messages.0.id')],
                ]);
            } else {
                throw new \Exception('WhatsApp API returned error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('Failed to send WhatsApp reminder: ' . $e->getMessage());
            $this->reminder->update([
                'status' => 'failed',
                'error_message' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    private function prepareTemplateData($invoice, $customer, $company): array
    {
        $dueDate = \Carbon\Carbon::parse($invoice->due_date)->format('d F Y');
        $amount = number_format($invoice->total, 0, ',', '.');
        
        return [
            'customer_name' => $customer->name,
            'invoice_number' => $invoice->invoice_number,
            'due_date' => $dueDate,
            'amount' => $amount,
            'company_name' => $company->brand,
            'company_phone' => $company->phone,
            'payment_link' => url("/pay/{$invoice->uuid}"),
        ];
    }

    private function sendWhatsAppMessage($phone, $template, $data)
    {
        $url = config('services.whatsapp.api_url') . '/' . 
               config('services.whatsapp.phone_number_id') . '/messages';

        $response = Http::withToken(config('services.whatsapp.access_token'))
            ->post($url, [
                'messaging_product' => 'whatsapp',
                'to' => $this->formatPhoneNumber($phone),
                'type' => 'template',
                'template' => [
                    'name' => $template,
                    'language' => ['code' => 'id'],
                    'components' => $this->buildComponents($data),
                ],
            ]);

        return $response;
    }

    private function formatPhoneNumber($phone): string
    {
        // Remove non-numeric characters
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Add country code if missing
        if (!str_starts_with($phone, '62')) {
            $phone = '62' . ltrim($phone, '0');
        }
        
        return $phone;
    }

    private function buildComponents($data): array
    {
        $components = [];

        // Body parameters
        $bodyParams = [];
        foreach (['customer_name', 'invoice_number', 'due_date', 'amount', 'company_name'] as $param) {
            if (isset($data[$param])) {
                $bodyParams[] = ['type' => 'text', 'text' => $data[$param]];
            }
        }

        if (!empty($bodyParams)) {
            $components[] = [
                'type' => 'body',
                'parameters' => $bodyParams,
            ];
        }

        // Button parameters if payment link exists
        if (isset($data['payment_link'])) {
            $components[] = [
                'type' => 'button',
                'sub_type' => 'url',
                'index' => 0,
                'parameters' => [
                    ['type' => 'text', 'text' => $data['payment_link']],
                ],
            ];
        }

        return $components;
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendWhatsappReminder job failed: ' . $exception->getMessage());
        $this->reminder->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
}