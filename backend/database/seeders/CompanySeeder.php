<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('company')->insert([
            'name' => 'PT. Trira Inti Utama',
            'brand' => 'Maroon-NET',
            'logo' => null,
            'brand_logo' => null,
            'address' => 'Jl. Contoh No. 123, Jakarta Selatan, Indonesia 12560',
            'phone' => '+62 21 12345678',
            'email' => 'info@maroonnet.id',
            'npwp' => '01.234.567.8-912.000',
            'tax_rate' => '11',
            'bank_accounts' => json_encode([
                [
                    'bank_name' => 'Bank Mandiri',
                    'account_number' => '1234567890',
                    'account_holder' => 'PT. Trira Inti Utama',
                    'branch' => 'Jakarta Selatan',
                    'currency' => 'IDR',
                    'is_default' => true,
                ],
                [
                    'bank_name' => 'BCA',
                    'account_number' => '0987654321',
                    'account_holder' => 'PT. Trira Inti Utama',
                    'branch' => 'Jakarta Pusat',
                    'currency' => 'IDR',
                    'is_default' => false,
                ],
            ]),
            'settings' => json_encode([
                'invoice_prefix' => 'INV/MRN/',
                'payment_due_days' => 7,
                'grace_period_days' => 3,
                'auto_suspend' => true,
                'auto_generate_invoice' => true,
                'reminder_days' => [7, 3, 1, 0, -3],
                'whatsapp_enabled' => true,
                'email_enabled' => true,
                'timezone' => 'Asia/Jakarta',
                'currency' => 'IDR',
                'language' => 'id',
            ]),
        ]);
    }
}