<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UserGroupsSeeder::class,
            UsersSeeder::class,
            CompanySeeder::class,
            RoutersSeeder::class,
            PlansSeeder::class,
            CustomersSeeder::class,
            ServicesSeeder::class,
            InvoicesSeeder::class,
            WhatsAppTemplatesSeeder::class,
            EmailTemplatesSeeder::class,
        ]);
    }
}
?>