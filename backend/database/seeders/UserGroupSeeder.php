<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            [
                'name' => 'Administrator',
                'slug' => 'administrator',
                'permissions' => json_encode(['*']),
                'description' => 'Super admin with full access',
                'is_active' => true,
            ],
            [
                'name' => 'Supervisor',
                'slug' => 'supervisor',
                'permissions' => json_encode([
                    'view_dashboard',
                    'manage_customers',
                    'manage_services',
                    'view_reports',
                    'manage_tickets',
                    'view_billing',
                ]),
                'description' => 'Team supervisor with management access',
                'is_active' => true,
            ],
            [
                'name' => 'Finance',
                'slug' => 'finance',
                'permissions' => json_encode([
                    'view_dashboard',
                    'view_customers',
                    'manage_invoices',
                    'manage_payments',
                    'view_reports',
                    'export_data',
                ]),
                'description' => 'Finance department staff',
                'is_active' => true,
            ],
            [
                'name' => 'Teller',
                'slug' => 'teller',
                'permissions' => json_encode([
                    'view_dashboard',
                    'view_customers',
                    'process_payments',
                    'print_invoices',
                ]),
                'description' => 'Front desk payment processor',
                'is_active' => true,
            ],
            [
                'name' => 'Support',
                'slug' => 'support',
                'permissions' => json_encode([
                    'view_dashboard',
                    'view_customers',
                    'manage_tickets',
                    'view_services',
                ]),
                'description' => 'Customer support staff',
                'is_active' => true,
            ],
            [
                'name' => 'Technician',
                'slug' => 'technician',
                'permissions' => json_encode([
                    'view_dashboard',
                    'view_customers',
                    'manage_services',
                    'manage_routers',
                    'manage_tickets',
                ]),
                'description' => 'Network technician',
                'is_active' => true,
            ],
        ];

        foreach ($groups as $group) {
            DB::table('user_groups')->insert($group);
        }
    }
}