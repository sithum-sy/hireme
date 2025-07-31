<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:send-reminders {--dry-run : Run without sending notifications}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send 24-hour reminder notifications for confirmed appointments';

    protected NotificationService $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        parent::__construct();
        $this->notificationService = $notificationService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('🔍 Running in DRY RUN mode - no notifications will be sent');
        }

        $this->info('⏰ Processing 24-hour appointment reminders...');
        
        // Find confirmed appointments happening in 23-25 hours that haven't received reminders
        $targetStart = now()->addHours(23);
        $targetEnd = now()->addHours(25);
        
        $appointments = Appointment::where('status', Appointment::STATUS_CONFIRMED)
            ->whereNull('reminder_24h_sent_at')
            ->where(function ($query) use ($targetStart, $targetEnd) {
                $query->whereBetween('appointment_date', [
                    $targetStart->toDateString(),
                    $targetEnd->toDateString()
                ]);
            })
            ->with(['client', 'provider', 'service'])
            ->get()
            ->filter(function ($appointment) use ($targetStart, $targetEnd) {
                $appointmentDateTime = Carbon::parse($appointment->appointment_date->format('Y-m-d') . ' ' . $appointment->appointment_time);
                return $appointmentDateTime->between($targetStart, $targetEnd);
            });

        if ($appointments->isEmpty()) {
            $this->info('✅ No appointments found requiring 24-hour reminders.');
            return Command::SUCCESS;
        }

        $this->info("📋 Found {$appointments->count()} appointment(s) requiring reminders");

        $processed = 0;
        $errors = 0;

        foreach ($appointments as $appointment) {
            try {
                $appointmentDateTime = Carbon::parse($appointment->appointment_date->format('Y-m-d') . ' ' . $appointment->appointment_time);
                $hoursUntil = $appointmentDateTime->diffInHours(now(), false);
                
                $this->line("📅 Processing appointment #{$appointment->id} (in {$hoursUntil}h)");
                
                if (!$isDryRun) {
                    // Send reminder to client
                    if ($appointment->client) {
                        $this->sendReminderNotification($appointment, $appointment->client, 'client');
                    }
                    
                    // Send reminder to provider
                    if ($appointment->provider) {
                        $this->sendReminderNotification($appointment, $appointment->provider, 'provider');
                    }
                    
                    // Mark reminder as sent
                    $appointment->update(['reminder_24h_sent_at' => now()]);
                    
                    $this->info("   ✅ Reminders sent for appointment #{$appointment->id}");
                } else {
                    $this->line("   [DRY RUN] Would send reminders for appointment #{$appointment->id}");
                }
                
                $processed++;
                
            } catch (\Exception $e) {
                $errors++;
                $this->error("   ❌ Failed to process appointment #{$appointment->id}: {$e->getMessage()}");
                
                Log::error('Failed to send appointment reminder', [
                    'appointment_id' => $appointment->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
            }
        }

        // Summary
        $this->newLine();
        if ($isDryRun) {
            $this->info("🔍 DRY RUN COMPLETE:");
            $this->info("   Would process: {$processed} appointments");
            if ($errors > 0) {
                $this->warn("   Errors encountered: {$errors}");
            }
        } else {
            $this->info("✅ PROCESSING COMPLETE:");
            $this->info("   Processed: {$processed} appointments");
            if ($errors > 0) {
                $this->warn("   Errors: {$errors}");
            }
        }

        Log::info('Appointment reminders processing completed', [
            'processed' => $processed,
            'errors' => $errors,
            'dry_run' => $isDryRun
        ]);

        return Command::SUCCESS;
    }

    private function sendReminderNotification(Appointment $appointment, $user, string $userType)
    {
        try {
            $result = $this->notificationService->sendAppointmentNotification(
                'appointment_reminder_24h',
                $user,
                [
                    'appointment' => $appointment,
                    'appointment_id' => $appointment->id,
                    'service_id' => $appointment->service_id,
                    'user_type' => $userType
                ],
                true, // Send email
                true  // Send in-app notification
            );

            if ($result) {
                $this->line("   📧 {$userType} reminder sent to {$user->email}");
            } else {
                $this->warn("   ⚠️ {$userType} reminder failed for {$user->email}");
            }

        } catch (\Exception $e) {
            $this->warn("   ⚠️ Failed to send {$userType} reminder: {$e->getMessage()}");
            
            Log::warning('Failed to send appointment reminder notification', [
                'appointment_id' => $appointment->id,
                'user_id' => $user->id,
                'user_type' => $userType,
                'error' => $e->getMessage()
            ]);
        }
    }
}
