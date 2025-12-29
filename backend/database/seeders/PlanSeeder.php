<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'uuid' => Str::uuid(),
                'name' => 'Maroon Basic 10 Mbps',
                'code' => 'MRN-BASIC-10',
                'price' => 150000,
                'tax_rate' => 11,
                'rate_limit_up' => '10M',
                'rate_limit_down' => '10M',
                'burst_limit_up' => '20M',
                'burst_limit_down' => '20M',
                'burst_threshold' => 80,
                'burst_time' => 15,
                'suspension_grace_days' => 3,
                'validity_days' => 30,
                'type' => 'pppoe',
                'is_active' => true,
                'description' => 'Paket dasar untuk perumahan, cocok untuk browsing dan sosial media',
                'mikrotik_profile' => json_encode([
                    'profile_name' => 'MRN-BASIC-10',
                    'local_address' => '192.168.100.1',
                    'remote_address' => 'pppoe_pool',
                    'queue_name' => 'queue-basic-10',
                ]),
            ],
            [
                'uuid' => Str::uuid(),
                'name' => 'Maroon Premium 30 Mbps',
                'code' => 'MRN-PREMIUM-30',
                'price' => 300000,
                'tax_rate' => 11,
                'rate_limit_up' => '30M',
                'rate_limit_down' => '30M',
                'burst_limit_up' => '50M',
                'burst_limit_down' => '50M',
                'burst_threshold' => 80,
                'burst_time' => 15,
                'suspension_grace_days' => 5,
                'validity_days' => 30,
                'type' => 'pppoe',
                'is_active' => true,
                'description' => 'Paket premium untuk keluarga, streaming 4K dan gaming',
                'mikrotik_profile' => json_encode([
                    'profile_name' => 'MRN-PREMIUM-30',
                    'local_address' => '192.168.100.1',
                    'remote_address' => 'pppoe_pool_premium',
                    'queue_name' => 'queue-premium-30',
                ]),
            ],
            [
                'uuid' => Str::uuid(),
                'name' => 'Business Static IP 50 Mbps',
                'code' => 'BIZ-STATIC-50',
                'price' => 750000,
                'tax_rate' => 11,
                'rate_limit_up' => '50M',
                'rate_limit_down' => '50M',
                'burst_limit_up' => '80M',
                'burst_limit_down' => '80M',
                'burst_threshold' => 80,
                'burst_time' => 15,
                'suspension_grace_days' => 7,
                'validity_days' => 30,
                'type' => 'static',
                'is_active' => true,
                'description' => 'Paket bisnis dengan IP statis untuk server dan kantor',
                'mikrotik_profile' => json_encode([
                    'address_list' => 'business_clients',
                    'queue_name' => 'queue-business-50',
                ]),
            ],
            [
                'uuid' => Str::uuid(),
                'name' => 'Hotspot Unlimited',
                'code' => 'HOTSPOT-UNL',
                'price' => 50000,
                'tax_rate' => 11,
                'rate_limit_up' => '5M',
                'rate_limit_down' => '5M',
                'burst_limit_up' => '10M',
                'burst_limit_down' => '10M',
                'burst_threshold' => 80,
                'burst_time' => 15,
                'suspension_grace_days' => 1,
                'validity_days' => 30,
                'type' => 'hotspot',
                'is_active' => true,
                'description' => 'Paket hotspot untuk warung internet dan area publik',
                'mikrotik_profile' => json_encode([
                    'profile_name' => 'hotspot-profile',
                    'user_profile' => 'hotspot-users',
                ]),
            ],
        ];

        foreach ($plans as $plan) {
            DB::table('plans')->insert($plan);
        }
    }
}