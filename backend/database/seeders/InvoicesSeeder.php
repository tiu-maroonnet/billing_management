<?php

// database/seeders/InvoicesSeeder.php
class InvoicesSeeder extends Seeder
{
    public function run()
    {
        $invoices = [
            [
                'invoice_number' => 'MAR' . date('Ym') . '001',
                'customer_id' => 1,
                'service_id' => 1,
                'period_start' => Carbon::now()->subMonth(),
                'period_end' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(7),
                'amount' => 150000,
                'tax' => 16500,
                'total' => 166500,
                'status' => 'paid',
                'payment_method' => 'bank_transfer',
                'paid_at' => Carbon::now()->subDays(2),
                'created_by' => 1,
            ],
            [
                'invoice_number' => 'MAR' . date('Ym') . '002',
                'customer_id' => 2,
                'service_id' => 2,
                'period_start' => Carbon::now()->subMonth(),
                'period_end' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(5),
                'amount' => 250000,
                'tax' => 27500,
                'total' => 277500,
                'status' => 'unpaid',
                'created_by' => 1,
            ],
            [
                'invoice_number' => 'MAR' . date('Ym') . '003',
                'customer_id' => 3,
                'service_id' => 3,
                'period_start' => Carbon::now()->subMonth(),
                'period_end' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(3),
                'amount' => 1500000,
                'tax' => 165000,
                'total' => 1665000,
                'status' => 'unpaid',
                'created_by' => 1,
            ],
            [
                'invoice_number' => 'MAR' . date('Ym') . '004',
                'customer_id' => 4,
                'service_id' => 4,
                'period_start' => Carbon::now()->subMonth(),
                'period_end' => Carbon::now(),
                'due_date' => Carbon::now()->subDays(5),
                'amount' => 150000,
                'tax' => 16500,
                'late_fee' => 30000,
                'total' => 196500,
                'status' => 'overdue',
                'created_by' => 1,
            ],
            [
                'invoice_number' => 'MAR' . date('Ym') . '005',
                'customer_id' => 5,
                'service_id' => 5,
                'period_start' => Carbon::now()->subMonth(),
                'period_end' => Carbon::now(),
                'due_date' => Carbon::now()->addDays(10),
                'amount' => 500000,
                'tax' => 55000,
                'total' => 555000,
                'status' => 'unpaid',
                'created_by' => 1,
            ],
        ];

        foreach ($invoices as $invoice) {
            \App\Models\Invoice::create($invoice);
        }
    }
}

?>