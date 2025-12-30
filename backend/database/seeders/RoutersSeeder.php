<?php

// database/seeders/RoutersSeeder.php
class RoutersSeeder extends Seeder
{
    public function run()
    {
        $routers = [
            [
                'name' => 'Core Router - Main Office',
                'description' => 'Main router untuk pelanggan corporate',
                'ip_address' => '10.10.1.1',
                'api_port' => 8729,
                'api_username' => 'api_user',
                'api_password' => 'SecurePassword123!',
                'tls_enabled' => true,
                'status' => 'active',
            ],
            [
                'name' => 'POP Cibubur',
                'description' => 'Point of Presence wilayah Cibubur',
                'ip_address' => '10.10.2.1',
                'api_port' => 8728,
                'api_username' => 'api_user',
                'api_password' => 'SecurePassword456!',
                'tls_enabled' => false,
                'status' => 'active',
            ],
            [
                'name' => 'POP Depok',
                'description' => 'Point of Presence wilayah Depok',
                'ip_address' => '10.10.3.1',
                'api_port' => 8728,
                'api_username' => 'api_user',
                'api_password' => 'SecurePassword789!',
                'tls_enabled' => false,
                'status' => 'active',
            ],
        ];

        foreach ($routers as $router) {
            \App\Models\Router::create($router);
        }
    }
}

?>