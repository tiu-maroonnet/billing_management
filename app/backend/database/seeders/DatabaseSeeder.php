<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\UserGroup;
use App\Models\Company;
use App\Models\Plan;
use App\Models\Router;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed User Groups
        $groups = [
            [
                'name' => 'Administrator',
                'permissions' => json_encode(['*']),
            ],
            [
                'name' => 'Supervisor',
                'permissions' => json_encode([
                    'customers.view', 'customers.create', 'customers.edit',
                    'invoices.view', 'invoices.create', 'invoices.edit',
                    'payments.view', 'payments.verify',
                    'reports.view',
                ]),
            ],
            [
                'name' => 'Finance',
                'permissions' => json_encode([
                    'invoices.view', 'invoices.create', 'invoices.edit',
                    'payments.view', 'payments.verify', 'payments.create',
                    'reports.view',
                ]),
            ],
            [
                'name' => 'Teller',
                'permissions' => json_encode([
                    'customers.view', 'customers.create',
                    'invoices.view', 'payments.create',
                ]),
            ],
            [
                'name' => 'Technician',
                'permissions' => json_encode([
                    'customers.view', 'services.view', 'services.edit',
                    'tickets.view', 'tickets.create', 'tickets.edit',
                ]),
            ],
            [
                'name' => 'Support',
                'permissions' => json_encode([
                    'customers.view', 'tickets.view', 'tickets.create', 'tickets.edit',
                ]),
            ],
        ];

        foreach ($groups as $group) {
            UserGroup::create($group);
        }

        // Seed Admin User
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@maroon-net.com',
            'phone' => '+628112345678',
            'password' => Hash::make('Admin@12345'),
            'group_id' => 1,
            'status' => 'active',
            'email_verified_at' => now(),
        ]);

        // Seed Company Data
        Company::create([
            'name' => 'PT. Trira Inti Utama',
            'logo' => null,
            'brand' => 'Maroon-NET',
            'brand_logo' => null,
            'address' => 'Jl. Contoh No. 123, Jakarta Selatan, DKI Jakarta 12560',
            'phone' => '+622178901234',
            'email' => 'info@maroon-net.com',
            'npwp' => '12.345.678.9-012.345',
            'bank_details' => json_encode([
                [
                    'bank_name' => 'Bank Mandiri',
                    'account_number' => '1234567890',
                    'account_name' => 'PT. Trira Inti Utama',
                    'branch' => 'Jakarta Selatan'
                ],
                [
                    'bank_name' => 'BCA',
                    'account_number' => '0987654321',
                    'account_name' => 'PT. Trira Inti Utama',
                    'branch' => 'Jakarta Pusat'
                ]
            ]),
            'tax_settings' => json_encode([
                'tax_rate' => 11,
                'tax_inclusive' => false,
                'tax_number_format' => 'INV/{YYYY}/{MM}/{0000}'
            ]),
        ]);

        // Seed Internet Plans
        $plans = [
            [
                'name' => 'Maroon Home 10 Mbps',
                'code' => 'MH10',
                'rate_limit_up' => 10000,
                'rate_limit_down' => 10000,
                'burst_limit_up' => 20000,
                'burst_limit_down' => 20000,
                'burst_threshold_up' => 80,
                'burst_threshold_down' => 80,
                'burst_time_up' => 30,
                'burst_time_down' => 30,
                'price' => 250000,
                'tax_rate' => 11,
                'suspension_grace_days' => 5,
                'description' => 'Paket rumahan 10 Mbps unlimited',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Home 20 Mbps',
                'code' => 'MH20',
                'rate_limit_up' => 20000,
                'rate_limit_down' => 20000,
                'burst_limit_up' => 40000,
                'burst_limit_down' => 40000,
                'burst_threshold_up' => 80,
                'burst_threshold_down' => 80,
                'burst_time_up' => 30,
                'burst_time_down' => 30,
                'price' => 350000,
                'tax_rate' => 11,
                'suspension_grace_days' => 5,
                'description' => 'Paket rumahan 20 Mbps unlimited',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Business 50 Mbps',
                'code' => 'MB50',
                'rate_limit_up' => 50000,
                'rate_limit_down' => 50000,
                'burst_limit_up' => 100000,
                'burst_limit_down' => 100000,
                'burst_threshold_up' => 90,
                'burst_threshold_down' => 90,
                'burst_time_up' => 60,
                'burst_time_down' => 60,
                'price' => 750000,
                'tax_rate' => 11,
                'suspension_grace_days' => 7,
                'description' => 'Paket bisnis 50 Mbps dengan SLA 99.9%',
                'is_active' => true,
            ],
            [
                'name' => 'Maroon Business 100 Mbps',
                'code' => 'MB100',
                'rate_limit_up' => 100000,
                'rate_limit_down' => 100000,
                'burst_limit_up' => 200000,
                'burst_limit_down' => 200000,
                'burst_threshold_up' => 90,
                'burst_threshold_down' => 90,
                'burst_time_up' => 60,
                'burst_time_down' => 60,
                'price' => 1200000,
                'tax_rate' => 11,
                'suspension_grace_days' => 7,
                'description' => 'Paket bisnis 100 Mbps dengan SLA 99.9%',
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::create($plan);
        }

        // Seed Example Router
        Router::create([
            'name' => 'Router Utama - Tower A',
            'ip_address' => '192.168.88.1',
            'api_port' => 8729,
            'username' => 'admin_api',
            'password_encrypted' => encrypt('router_password_here'),
            'tls_enabled' => true,
            'status' => 'online',
            'capabilities' => json_encode([
                'pppoe_server' => true,
                'queue_simple' => true,
                'firewall_address_list' => true,
                'api_ssl' => true,
            ]),
            'notes' => 'Router utama untuk coverage area Jakarta Selatan',
        ]);

        $this->command->info('Database seeded successfully!');
        $this->command->info('Admin Login: admin@maroon-net.com / Admin@12345');
    }
}