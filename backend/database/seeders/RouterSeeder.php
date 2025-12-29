<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RouterSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('routers')->insert([
            [
                'uuid' => Str::uuid(),
                'name' => 'Router Utama - BSD',
                'ip_address' => '192.168.88.1',
                'api_port' => 8728,
                'username' => 'api_user',
                'password' => encrypt('RouterOSPassword123'),
                'api_certificate' => null,
                'use_tls' => false,
                'status' => 'active',
                'location' => 'BSD City, Tangerang',
                'description' => 'Router utama untuk area BSD dan sekitarnya',
                'capabilities' => json_encode(['pppoe', 'queue', 'firewall']),
                'max_connections' => 1000,
                'current_connections' => 150,
            ],
            [
                'uuid' => Str::uuid(),
                'name' => 'Router Backup - Serpong',
                'ip_address' => '192.168.89.1',
                'api_port' => 8729,
                'username' => 'api_user',
                'password' => encrypt('RouterOSPassword123'),
                'api_certificate' => null,
                'use_tls' => false,
                'status' => 'active',
                'location' => 'Serpong, Tangerang Selatan',
                'description' => 'Router backup untuk area Serpong',
                'capabilities' => json_encode(['pppoe', 'hotspot']),
                'max_connections' => 500,
                'current_connections' => 80,
            ],
        ]);
    }
}