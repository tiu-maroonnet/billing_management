<?php

// database/seeders/UsersSeeder.php
class UsersSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'group_id' => 1,
                'name' => 'Super Admin',
                'email' => 'admin@maroon-net.id',
                'phone' => '+6281122334455',
                'password' => Hash::make('4Sehat&5Sempurna'),
                'status' => 'active',
            ],
            [
                'group_id' => 2,
                'name' => 'Budi Santoso',
                'email' => 'budi@maroon-net.id',
                'phone' => '+6281234567890',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ],
            [
                'group_id' => 3,
                'name' => 'Siti Rahayu',
                'email' => 'siti@maroon-net.id',
                'phone' => '+6282345678901',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ],
            [
                'group_id' => 4,
                'name' => 'Rina Wijaya',
                'email' => 'rina@maroon-net.id',
                'phone' => '+6283456789012',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ],
            [
                'group_id' => 5,
                'name' => 'Agus Teknik',
                'email' => 'agus@maroon-net.id',
                'phone' => '+6284567890123',
                'password' => Hash::make('password123'),
                'status' => 'active',
            ],
        ];

        foreach ($users as $user) {
            \App\Models\User::create($user);
        }
    }
}

?>