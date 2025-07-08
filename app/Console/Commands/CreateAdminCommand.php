<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class CreateAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hireme:create-admin 
                            {--email= : Admin email address}
                            {--password= : Admin password}
                            {--first-name= : Admin first name}
                            {--last-name= : Admin last name}
                            {--force : Force creation even if admin exists}';


    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new admin user for HireMe application';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating HireMe Admin User...');
        $this->newLine();

        // Check if admin already exists
        if (!$this->option('force') && User::where('role', User::ROLE_ADMIN)->exists()) {
            $this->error('Admin user already exists!');

            if ($this->confirm('Do you want to create another admin user?')) {
                // Continue with creation
            } else {
                return Command::FAILURE;
            }
        }

        // Get admin details
        $email = $this->option('email') ?: $this->ask('Enter admin email address');
        $firstName = $this->option('first-name') ?: $this->ask('Enter admin first name', 'Admin');
        $lastName = $this->option('last-name') ?: $this->ask('Enter admin last name', 'User');

        // Get password
        $password = $this->option('password');
        if (!$password) {
            $password = $this->secret('Enter admin password (min 8 characters)');
            $confirmPassword = $this->secret('Confirm admin password');

            if ($password !== $confirmPassword) {
                $this->error('Passwords do not match!');
                return Command::FAILURE;
            }
        }

        // Validate input
        $validator = Validator::make([
            'email' => $email,
            'password' => $password,
            'first_name' => $firstName,
            'last_name' => $lastName,
        ], [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            $this->error('Validation failed:');
            foreach ($validator->errors()->all() as $error) {
                $this->error('- ' . $error);
            }
            return Command::FAILURE;
        }

        // Get optional details
        $contactNumber = $this->ask('Enter contact number (optional)', '+1234567890');
        $address = $this->ask('Enter address (optional)', 'HireMe Headquarters');

        try {
            // Create admin user
            $admin = User::create([
                'first_name' => $firstName,
                'last_name' => $lastName,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => User::ROLE_ADMIN,
                'date_of_birth' => null,
                'address' => $address,
                'contact_number' => $contactNumber,
                'profile_picture' => null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $this->newLine();
            $this->info('✅ Admin user created successfully!');
            $this->newLine();

            // Display created admin details
            $this->table(
                ['Field', 'Value'],
                [
                    ['ID', $admin->id],
                    ['Name', $admin->full_name],
                    ['Email', $admin->email],
                    ['Role', $admin->role],
                    ['Contact', $admin->contact_number],
                    ['Address', $admin->address],
                    ['Created At', $admin->created_at->format('Y-m-d H:i:s')],
                ]
            );

            $this->newLine();
            $this->warn('⚠️  Please store the login credentials securely!');
            $this->info('The admin can now login at: ' . config('app.url') . '/admin/login');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Failed to create admin user: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
