<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {--verification : Test verification email specifically}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration and SMTP connection';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Testing email configuration...');
        
        // Show current config
        $this->line('Current mail configuration:');
        $this->line('Host: ' . config('mail.mailers.smtp.host'));
        $this->line('Port: ' . config('mail.mailers.smtp.port'));
        $this->line('Username: ' . config('mail.mailers.smtp.username'));
        $this->line('Encryption: ' . config('mail.mailers.smtp.encryption'));
        $this->line('From Address: ' . config('mail.from.address'));
        $this->line('From Name: ' . config('mail.from.name'));
        $this->line('');
        
        // Test 1: Direct email (sync)
        $this->info('Test 1: Direct email (sync)...');
        try {
            Mail::raw('Test email from HireMe - Direct SMTP Test', function ($message) {
                $message->to('test@example.com')
                       ->subject('Direct Email Test')
                       ->from(config('mail.from.address'), config('mail.from.name'));
            });
            
            $this->info('✓ Direct email sent successfully!');
            
        } catch (\Exception $e) {
            $this->error('✗ Direct email failed!');
            $this->error('Error: ' . $e->getMessage());
            return;
        }
        
        $this->line('');
        
        // Test 2: Verification email specifically  
        if ($this->option('verification')) {
            $this->info('Test 2: Verification email notification...');
            try {
                $testUser = new \App\Models\User([
                    'first_name' => 'Test',
                    'last_name' => 'User',
                    'email' => 'test@example.com',
                    'is_active' => false,
                    'email_verified_at' => null,
                ]);
                
                $token = hash('sha256', \Illuminate\Support\Str::random(60) . 'test@example.com' . time());
                
                $testUser->notify(new \App\Notifications\VerifyEmailNotification($token));
                
                $this->info('✓ Verification email queued successfully!');
                $this->line('Check your queue worker terminal and Mailtrap inbox.');
                
            } catch (\Exception $e) {
                $this->error('✗ Verification email failed!');
                $this->error('Error: ' . $e->getMessage());
                
                if (method_exists($e, 'getPrevious') && $e->getPrevious()) {
                    $this->error('Previous exception: ' . $e->getPrevious()->getMessage());
                }
            }
        }
        
        // Test 3: Appointment notification through NotificationService
        $this->line('');
        $this->info('Test 3: Appointment notification via NotificationService...');
        try {
            $notificationService = app(\App\Services\NotificationService::class);
            
            // Create a test verified user (this is required for NotificationService)
            $testUser = new \App\Models\User([
                'first_name' => 'Test',
                'last_name' => 'User', 
                'email' => 'test@example.com',
                'role' => 'client', // Add role for NotificationService
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            
            $result = $notificationService->sendAppointmentNotification(
                'appointment_request_received',
                $testUser,
                [
                    'appointment_id' => 999,
                    'service_name' => 'Test Service',
                    'client_name' => 'Test Client',
                    'appointment_date' => now()->format('M j, Y'),
                    'appointment_time' => now()->format('g:i A'),
                ],
                true, // Send email
                false // Don't send in-app (to avoid DB issues)
            );
            
            if ($result && $result['email']) {
                $this->info('✓ Appointment email queued via NotificationService!');
            } else {
                $this->error('✗ Appointment email was not sent via NotificationService!');
                $this->line('Result: ' . json_encode($result));
            }
            
        } catch (\Exception $e) {
            $this->error('✗ Appointment notification failed!');
            $this->error('Error: ' . $e->getMessage());
            
            if (method_exists($e, 'getPrevious') && $e->getPrevious()) {
                $this->error('Previous exception: ' . $e->getPrevious()->getMessage());
            }
        }
    }
}
