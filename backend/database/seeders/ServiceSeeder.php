<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'uuid' => Str::uuid(),
                'customer_id' => 1,
                'plan_id' => 1,
                'router_id' => 1,
                'type' => 'pppoe',
                'username' => 'budi123',
                'password' => encrypt('PasswordBudi123'),
                'static_ip' => null,
                'mac_address' => 'AA:BB:CC:DD:EE:01',
                'interface' => 'pppoe-out1',
                'start_date' => '2024-01-15',
                'due_day' => 15,
                'status' => 'active',
                'mikrotik_secret_id' => '*1A',
                'mikrotik_queue_id' => '*2B',
            ],
            [
                'uuid' => Str::uuid(),
                'customer_id' => 2,
                'plan_id' => 3,
                'router_id' => 1,
                'type' => 'static',
                'username' => null,
                'password' => null,
                'static_ip' => '192.168.100.100',
                'mac_address' => 'AA:BB:CC:DD:EE:02',
                'interface' => 'ether1',
                'start_date' => '2024-02-01',
                'due_day' => 1,
                'status' => 'active',
                'mikrotik_address_list_id' => '*3C',
                'mikrotik_queue_id' => '*4D',
            ],
            [
                'uuid' => Str::uuid(),
                'customer_id' => 3,
                'plan_id' => 2,
                'router_id' => 1,
                'type' => 'pppoe',
                'username' => 'abadijaya',
                'password' => encrypt('PasswordAbadi123'),
                'static_ip' => null,
                'mac_address' => 'AA:BB:CC:DD:EE:03',
                'interface' => 'pppoe-out1',
                'start_date' => '2024-03-10',
                'due_day' => 10,
                'status' => 'active',
                'mikrotik_secret_id' => '*5E',
                'mikrotik_queue_id' => '*6F',
            ],
            [
                'uuid' => Str::uuid(),
                'customer_id' => 4,
                'plan_id' => 1,
                'router_id' => 2,
                'type' => 'pppoe',
                'username' => 'sari456',
                'password' => encrypt('PasswordSari123'),
                'static_ip' => null,
                'mac_address' => 'AA:BB:CC:DD:EE:04',
                'interface' => 'pppoe-out1',
                'start_date' => '2024-01-20',
                'due_day' => 20,
                'status' => 'suspended',
                'mikrotik_secret_id' => '*7G',
                'mikrotik_queue_id' => '*8H',
                'suspended_at' => '2024-04-01 10:00:00',
            ],
        ];

        foreach ($services as $service) {
            DB::table('services')->insert($service);
        }
    }
}