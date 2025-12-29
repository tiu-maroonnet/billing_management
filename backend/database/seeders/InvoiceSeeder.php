<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InvoiceSeeder extends Seeder
{
    public function run(): void
    {
        $invoices = [
            [
                'uuid' => Str::uuid(),
                'invoice_number' => 'INV/MRN/2024/0001',
                'customer_id' => 1,
                'service_id' => 1,
                'period_start' => '2024-04-01',
                'period_end' => '2024-04-30',
                'amount' => 150000,
                'tax' => 16500,
                'discount' => 0,
                'total' => 166500,
                'due_date' => '2024-04-15',
                'status' => 'paid',
                'payment_method' => 'transfer',
                'items' => json_encode([
                    [
                        'description' => 'Paket Maroon Basic 10 Mbps - April 2024',
                        'quantity' => 1,
                        'price' => 150000,
                        'total' => 150000,
                    ],
                ]),
                'paid_at' => '2024-04-10 14:30:00',
            ],
            [
                'uuid' => Str::uuid(),
                'invoice_number' => 'INV/MRN/2024/0002',
                'customer_id' => 2,
                'service_id' => 2,
                'period_start' => '2024-04-01',
                'period_end' => '2024-04-30',
                'amount' => 750000,
                'tax' => 82500,
                'discount' => 0,
                'total' => 832500,
                'due_date' => '2024-04-01',
                'status' => 'paid',
                'payment_method' => 'midtrans',
                'items' => json_encode([
                    [
                        'description' => 'Paket Business Static IP 50 Mbps - April 2024',
                        'quantity' => 1,
                        'price' => 750000,
                        'total' => 750000,
                    ],
                ]),
                'paid_at' => '2024-03-28 09:15:00',
            ],
            [
                'uuid' => Str::uuid(),
                'invoice_number' => 'INV/MRN/2024/0003',
                'customer_id' => 3,
                'service_id' => 3,
                'period_start' => '2024-04-01',
                'period_end' => '2024-04-30',
                'amount' => 300000,
                'tax' => 33000,
                'discount' => 0,
                'total' => 333000,
                'due_date' => '2024-04-10',
                'status' => 'unpaid',
                'payment_method' => null,
                'items' => json_encode([
                    [
                        'description' => 'Paket Maroon Premium 30 Mbps - April 2024',
                        'quantity' => 1,
                        'price' => 300000,
                        'total' => 300000,
                    ],
                ]),
                'paid_at' => null,
            ],
            [
                'uuid' => Str::uuid(),
                'invoice_number' => 'INV/MRN/2024/0004',
                'customer_id' => 4,
                'service_id' => 4,
                'period_start' => '2024-03-01',
                'period_end' => '2024-03-31',
                'amount' => 150000,
                'tax' => 16500,
                'discount' => 0,
                'total' => 166500,
                'due_date' => '2024-03-20',
                'status' => 'overdue',
                'payment_method' => null,
                'items' => json_encode([
                    [
                        'description' => 'Paket Maroon Basic 10 Mbps - Maret 2024',
                        'quantity' => 1,
                        'price' => 150000,
                        'total' => 150000,
                    ],
                ]),
                'paid_at' => null,
            ],
        ];

        foreach ($invoices as $invoice) {
            DB::table('invoices')->insert($invoice);
        }
    }
}