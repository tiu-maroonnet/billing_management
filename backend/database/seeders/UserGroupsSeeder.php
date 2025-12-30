<?php

// database/seeders/UserGroupsSeeder.php
class UserGroupsSeeder extends Seeder
{
    public function run()
    {
        $groups = [
            [
                'name' => 'Super Administrator',
                'permissions' => json_encode([
                    'users.*',
                    'customers.*',
                    'services.*',
                    'invoices.*',
                    'payments.*',
                    'routers.*',
                    'settings.*',
                    'reports.*',
                    'tickets.*',
                ])
            ],
            [
                'name' => 'Administrator',
                'permissions' => json_encode([
                    'users.read',
                    'users.create',
                    'users.update',
                    'customers.*',
                    'services.*',
                    'invoices.*',
                    'payments.*',
                    'routers.read',
                    'settings.read',
                    'reports.*',
                    'tickets.*',
                ])
            ],
            [
                'name' => 'Finance',
                'permissions' => json_encode([
                    'customers.read',
                    'invoices.*',
                    'payments.*',
                    'reports.financial',
                ])
            ],
            [
                'name' => 'Teller',
                'permissions' => json_encode([
                    'customers.read',
                    'invoices.read',
                    'payments.create',
                    'payments.update',
                ])
            ],
            [
                'name' => 'Technician',
                'permissions' => json_encode([
                    'customers.read',
                    'services.read',
                    'services.update',
                    'routers.read',
                    'tickets.*',
                ])
            ],
            [
                'name' => 'Supervisor',
                'permissions' => json_encode([
                    'customers.*',
                    'services.*',
                    'invoices.*',
                    'payments.*',
                    'tickets.*',
                    'reports.*',
                ])
            ],
            [
                'name' => 'Customer Service',
                'permissions' => json_encode([
                    'customers.read',
                    'customers.update',
                    'invoices.read',
                    'tickets.*',
                ])
            ],
        ];

        foreach ($groups as $group) {
            \App\Models\UserGroup::create($group);
        }
    }
}

?>