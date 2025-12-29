<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Reminder;
use App\Jobs\SendWhatsappReminder;
use App\Jobs\SendEmailReminder;
use Carbon\Carbon;

class RunDailyReminder extends Command
{
    protected $signature = 'reminders:run';
    protected $description = 'Process and send scheduled reminders';

    public function handle(): void
    {
        $this->info('Starting reminder processing...');
        
        $now = Carbon::now();
        $pendingReminders = Reminder::where('status', 'pending')
            ->where('scheduled_at', '<=', $now)
            ->get();

        $this->info("Found {$pendingReminders->count()} pending reminders");

        foreach ($pendingReminders as $reminder) {
            try {
                switch ($reminder->channel) {
                    case 'email':
                        SendEmailReminder::dispatch($reminder);
                        $this->info("Dispatched email reminder for invoice {$reminder->invoice_id}");
                        break;
                    case 'whatsapp':
                        SendWhatsappReminder::dispatch($reminder);
                        $this->info("Dispatched WhatsApp reminder for invoice {$reminder->invoice_id}");
                        break;
                }
            } catch (\Exception $e) {
                $this->error("Failed to dispatch reminder {$reminder->id}: " . $e->getMessage());
                $reminder->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
            }
        }

        $this->info('Reminder processing completed.');
    }
}