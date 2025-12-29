<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'uuid' => Str::uuid(),
                'group_id' => 1, // Administrator
                'name' => 'Admin Maroon-NET',
                'email' => 'admin@maroonnet.id',
                'phone' => '+6281234567890',
                'password' => Hash::make('password'),
                'status' => 'active',
                'avatar' => null,
                'settings' => json_encode(['theme' => 'light', 'language' => 'id']),
                'email_verified_at' => now(),
            ],
            [
                'uuid' => Str::uuid(),
                'group_id' => 3, // Finance
                'name' => 'Finance Manager',
                'email' => 'finance@maroonnet.id',
                'phone' => '+6281234567891',
                'password' => Hash::make('password'),
                'status' => 'active',
                'avatar' => null,
                'settings' => json_encode(['theme' => 'light', 'language' => 'id']),
                'email_verified_at' => now(),
            ],
            [
                'uuid' => Str::uuid(),
                'group_id' => 5, // Support
                'name' => 'Support Staff',
                'email' => 'support@maroonnet.id',
                'phone' => '+6281234567892',
                'password' => Hash::make('password'),
                'status' => 'active',
                'avatar' => null,
                'settings' => json_encode(['theme' => 'light', 'language' => 'id']),
                'email_verified_at' => now(),
            ],
            [
                'uuid' => Str::uuid(),
                'group_id' => 6, // Technician
                'name' => 'Network Technician',
                'email' => 'tech@maroonnet.id',
                'phone' => '+6281234567893',
                'password' => Hash::make('password'),
                'status' => 'active',
                'avatar' => null,
                'settings' => json_encode(['theme' => 'light', 'language' => 'id']),
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->insert($user);
        }
    }
}