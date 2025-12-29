<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $customers = [
            [
                'uuid' => Str::uuid(),
                'code' => 'CUST-0001',
                'type' => 'resident',
                'name' => 'Budi Santoso',
                'email' => 'budi.santoso@example.com',
                'phone' => '+6281111222333',
                'address' => 'Jl. Merdeka No. 45, BSD City, Tangerang',
                'id_card_number' => '1234567890123456',
                'subscription_date' => '2024-01-15',
                'status' => 'active',
                'notes' => 'Pelanggan setia sejak 2024',
            ],
            [
                'uuid' => Str::uuid(),
                'code' => 'CUST-0002',
                'type' => 'soho',
                'name' => 'CV. Tekno Maju',
                'email' => 'info@teknomaju.com',
                'phone' => '+6282222333444',
                'address' => 'Ruko Plaza BSD Blok A1 No. 12, Tangerang',
                'id_card_number' => null,
                'subscription_date' => '2024-02-01',
                'status' => 'active',
                'notes' => 'Small office home office dengan 5 karyawan',
            ],
            [
                'uuid' => Str::uuid(),
                'code' => 'CUST-0003',
                'type' => 'corporate',
                'name' => 'PT. Abadi Jaya',
                'email' => 'it@abadijaya.co.id',
                'phone' => '+6283333444555',
                'address' => 'Gedung Graha Kencana Lt. 8, Jakarta Selatan',
                'id_card_number' => null,
                'subscription_date' => '2024-03-10',
                'status' => 'active',
                'notes' => 'Perusahaan dengan 50 karyawan, perlu dedicated support',
            ],
            [
                'uuid' => Str::uuid(),
                'code' => 'CUST-0004',
                'type' => 'resident',
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@example.com',
                'phone' => '+6284444555666',
                'address' => 'Cluster Green Ville No. 23, Serpong',
                'id_card_number' => '2345678901234567',
                'subscription_date' => '2024-01-20',
                'status' => 'suspended',
                'notes' => 'Tagihan tertunggak 2 bulan',
            ],
        ];

        foreach ($customers as $customer) {
            DB::table('customers')->insert($customer);
        }
    }
}