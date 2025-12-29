<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        
        // Clear existing data
        $this->truncateTables();
        
        // Seed data
        $this->call([
            UserGroupSeeder::class,
            UserSeeder::class,
            CompanySeeder::class,
            RouterSeeder::class,
            PlanSeeder::class,
            CustomerSeeder::class,
            ServiceSeeder::class,
            InvoiceSeeder::class,
        ]);
        
        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
    
    private function truncateTables(): void
    {
        $tables = [
            'users',
            'user_groups',
            'company',
            'customers',
            'routers',
            'plans',
            'services',
            'invoices',
            'payments',
            'reminders',
            'tickets',
            'audit_logs',
        ];
        
        foreach ($tables as $table) {
            DB::table($table)->truncate();
        }
    }
}