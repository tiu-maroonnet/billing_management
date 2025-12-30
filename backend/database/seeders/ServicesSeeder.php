<?php

// database/seeders/ServicesSeeder.php
class ServicesSeeder extends Seeder
{
    public function run()
    {
        $services = [
            [
                'service_code' => 'SVC' . date('Ymd') . '001',
                'customer_id' => 1,
                'plan_id' => 1,
                'router_id' => 1,
                'type' => 'pppoe',
                'username' => 'ahmadf001',
                'password' => 'Pass123!',
                'start_date' => Carbon::now()->subMonths(6),
                'due_day' => 15,
                'next_billing_date' => Carbon::now()->addMonth()->day(15),
                'status' => 'active',
                'installation_address' => 'Jl. Melati No. 123, Cimanggis, Depok',
                'created_by' => 1,
            ],
            [
                'service_code' => 'SVC' . date('Ymd') . '002',
                'customer_id' => 2,
                'plan_id' => 2,
                'router_id' => 2,
                'type' => 'static',
                'static_ip' => '10.10.2.100',
                'mac_address' => '00:1A:2B:3C:4D:5E',
                'start_date' => Carbon::now()->subMonths(3),
                'due_day' => 20,
                'next_billing_date' => Carbon::now()->addMonth()->day(20),
                'status' => 'active',
                'installation_address' => 'Jl. Raya Bogor KM 45, Cimanggis, Depok',
                'created_by' => 1,
            ],
            [
                'service_code' => 'SVC' . date('Ymd') . '003',
                'customer_id' => 3,
                'plan_id' => 4,
                'router_id' => 1,
                'type' => 'static',
                'static_ip' => '10.10.1.50',
                'mac_address' => '00:2B:3C:4D:5E:6F',
                'start_date' => Carbon::now()->subMonths(1),
                'due_day' => 5,
                'next_billing_date' => Carbon::now()->addMonth()->day(5),
                'status' => 'active',
                'installation_address' => 'Jl. Industri No. 45, Cibubur, Jakarta Timur',
                'created_by' => 1,
            ],
            [
                'service_code' => 'SVC' . date('Ymd') . '004',
                'customer_id' => 4,
                'plan_id' => 1,
                'router_id' => 2,
                'type' => 'pppoe',
                'username' => 'saridew001',
                'password' => 'Pass456!',
                'start_date' => Carbon::now()->subDays(15),
                'due_day' => 10,
                'next_billing_date' => Carbon::now()->addMonth()->day(10),
                'status' => 'suspended',
                'suspended_at' => Carbon::now()->subDays(3),
                'suspension_reason' => 'Overdue payment',
                'installation_address' => 'Jl. Anggrek No. 78, Beji, Depok',
                'created_by' => 1,
            ],
            [
                'service_code' => 'SVC' . date('Ymd') . '005',
                'customer_id' => 5,
                'plan_id' => 3,
                'router_id' => 3,
                'type' => 'pppoe',
                'username' => 'bambangs001',
                'password' => 'Pass789!',
                'start_date' => Carbon::now()->subDays(30),
                'due_day' => 25,
                'next_billing_date' => Carbon::now()->addMonth()->day(25),
                'status' => 'active',
                'installation_address' => 'Jl. Kenanga No. 56, Sukmajaya, Depok',
                'created_by' => 1,
            ],
        ];

        foreach ($services as $service) {
            \App\Models\Service::create($service);
        }
    }
}

?>