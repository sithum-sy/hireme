<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('role', User::ROLE_ADMIN)->first();

        if ($existingAdmin) {
            $this->command->info('Admin user already exists: ' . $existingAdmin->email);
            return;
        }

        // Create the admin user
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@hireme.com',
            'password' => Hash::make('AdminPassword123!'),
            'role' => User::ROLE_ADMIN,
            'date_of_birth' => null, // Optional for admin
            'address' => 'HireMe Headquarters',
            'contact_number' => '+1234567890',
            'profile_picture' => null,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: ' . $admin->email);
        $this->command->info('Password: AdminPassword123!');
        $this->command->warn('Please change the default password after first login!');
    }
}
