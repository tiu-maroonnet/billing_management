<?php

// database/seeders/CustomersSeeder.php
class CustomersSeeder extends Seeder
{
    public function run()
    {
        $customers = [
            [
                'customer_code' => 'CUST' . date('Ymd') . '001',
                'type' => 'residential',
                'name' => 'Ahmad Fauzi',
                'email' => 'ahmad.fauzi@gmail.com',
                'phone' => '+6281111222333',
                'address' => 'Jl. Melati No. 123, Cimanggis, Depok',
                'province' => 'Jawa Barat',
                'city' => 'Depok',
                'district' => 'Cimanggis',
                'postal_code' => '16951',
                'id_card_number' => '3174030101900001',
                'subscription_date' => Carbon::now()->subMonths(6),
                'status' => 'active',
                'created_by' => 1,
            ],
            [
                'customer_code' => 'CUST' . date('Ymd') . '002',
                'type' => 'soho',
                'name' => 'Toko Sembako Sejahtera',
                'email' => 'sejahtera.toko@gmail.com',
                'phone' => '+6282222333444',
                'address' => 'Jl. Raya Bogor KM 45, Cimanggis, Depok',
                'province' => 'Jawa Barat',
                'city' => 'Depok',
                'district' => 'Cimanggis',
                'postal_code' => '16952',
                'id_card_number' => '3174030202900002',
                'subscription_date' => Carbon::now()->subMonths(3),
                'status' => 'active',
                'created_by' => 1,
            ],
            [
                'customer_code' => 'CUST' . date('Ymd') . '003',
                'type' => 'corporate',
                'name' => 'CV. Teknik Maju Jaya',
                'email' => 'info@tekmaju.co.id',
                'phone' => '+6283333444555',
                'address' => 'Jl. Industri No. 45, Cibubur, Jakarta Timur',
                'province' => 'DKI Jakarta',
                'city' => 'Jakarta Timur',
                'district' => 'Cibubur',
                'postal_code' => '13720',
                'id_card_number' => '3174030303900003',
                'subscription_date' => Carbon::now()->subMonths(1),
                'status' => 'active',
                'created_by' => 1,
            ],
            [
                'customer_code' => 'CUST' . date('Ymd') . '004',
                'type' => 'residential',
                'name' => 'Sari Dewi',
                'email' => 'sari.dewi@yahoo.com',
                'phone' => '+6284444555666',
                'address' => 'Jl. Anggrek No. 78, Beji, Depok',
                'province' => 'Jawa Barat',
                'city' => 'Depok',
                'district' => 'Beji',
                'postal_code' => '16421',
                'id_card_number' => '3174030404900004',
                'subscription_date' => Carbon::now()->subDays(15),
                'status' => 'suspended',
                'created_by' => 1,
            ],
            [
                'customer_code' => 'CUST' . date('Ymd') . '005',
                'type' => 'residential',
                'name' => 'Bambang Sutrisno',
                'email' => 'bambang.s@gmail.com',
                'phone' => '+6285555666777',
                'address' => 'Jl. Kenanga No. 56, Sukmajaya, Depok',
                'province' => 'Jawa Barat',
                'city' => 'Depok',
                'district' => 'Sukmajaya',
                'postal_code' => '16412',
                'id_card_number' => '3174030505900005',
                'subscription_date' => Carbon::now()->subDays(30),
                'status' => 'active',
                'created_by' => 1,
            ],
        ];

        foreach ($customers as $customer) {
            \App\Models\Customer::create($customer);
        }
    }
}

?>