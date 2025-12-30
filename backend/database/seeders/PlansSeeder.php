<?php

// database/seeders/PlansSeeder.php
class PlansSeeder extends Seeder
{
    public function run()
    {
        $plans = [
            [
                'name' => 'Maroon Lite',
                'code' => 'MAR-LITE',
                'description' => 'Paket untuk pemakaian ringan, cocok untuk single user',
                'rate_limit_up' => 1024,
                'rate_limit_down' => 2048,
                'burst_limit_up' => 2048,
                'burst_limit_down' => 4096,
                'price' => 150000,
                'tax_rate' => 11.0,
                'suspension_grace_days' => 3,
                'soft_limit_speed' => 512,
                'mikrotik_profile_name' => 'MAROON-LITE',
                'mikrotik_queue_profile' => 'QUEUE-LITE',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Family',
                'code' => 'MAR-FAMILY',
                'description' => 'Paket untuk keluarga, support 5-10 devices',
                'rate_limit_up' => 2048,
                'rate_limit_down' => 4096,
                'burst_limit_up' => 4096,
                'burst_limit_down' => 8192,
                'price' => 250000,
                'tax_rate' => 11.0,
                'suspension_grace_days' => 5,
                'soft_limit_speed' => 1024,
                'mikrotik_profile_name' => 'MAROON-FAMILY',
                'mikrotik_queue_profile' => 'QUEUE-FAMILY',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Business',
                'code' => 'MAR-BIZ',
                'description' => 'Paket untuk usaha kecil dan menengah',
                'rate_limit_up' => 5120,
                'rate_limit_down' => 10240,
                'burst_limit_up' => 10240,
                'burst_limit_down' => 20480,
                'price' => 500000,
                'tax_rate' => 11.0,
                'suspension_grace_days' => 7,
                'soft_limit_speed' => 2048,
                'mikrotik_profile_name' => 'MAROON-BIZ',
                'mikrotik_queue_profile' => 'QUEUE-BIZ',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Corporate',
                'code' => 'MAR-CORP',
                'description' => 'Paket untuk perusahaan dengan SLA 99.9%',
                'rate_limit_up' => 10240,
                'rate_limit_down' => 20480,
                'burst_limit_up' => 20480,
                'burst_limit_down' => 40960,
                'price' => 1500000,
                'tax_rate' => 11.0,
                'suspension_grace_days' => 10,
                'soft_limit_speed' => 5120,
                'mikrotik_profile_name' => 'MAROON-CORP',
                'mikrotik_queue_profile' => 'QUEUE-CORP',
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            \App\Models\Plan::create($plan);
        }
    }
}

?>