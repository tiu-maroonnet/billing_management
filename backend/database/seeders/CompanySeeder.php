<?php

// database/seeders/CompanySeeder.php
class CompanySeeder extends Seeder
{
    public function run()
    {
        \App\Models\Company::create([
            'name' => 'PT. Trira Inti Utama',
            'brand' => 'Maroon-NET',
            'logo' => null,
            'brand_logo' => null,
            'address' => 'Jl. Raya Bogor KM 46, Cimanggis, Depok, Jawa Barat 16953',
            'phone' => '+62217771234',
            'email' => 'info@maroon-net.id',
            'website' => 'https://maroon-net.id',
            'npwp' => '01.234.567.8-912.000',
            'tax_rate' => 11.0,
            'bank_name' => 'Bank Central Asia',
            'bank_account' => '1234567890',
            'bank_account_name' => 'PT. Trira Inti Utama',
            'currency' => 'IDR',
            'timezone' => 'Asia/Jakarta',
            'language' => 'id',
            'invoice_prefix' => 'MAR',
            'invoice_start_number' => 1001,
            'invoice_terms' => 'Pembayaran jatuh tempo 7 hari setelah invoice diterima. Keterlambatan pembayaran dikenakan denda 2% per bulan.',
        ]);
    }
}

?>