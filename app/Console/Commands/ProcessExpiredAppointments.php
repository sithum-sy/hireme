<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Mail\AppointmentExpiredNotification;
use App\Mail\AppointmentAutoExpiredNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class ProcessExpiredAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'appointments:process-expired {--dry-run : Run without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Auto-cancel pending appointments that providers haven\'t responded to within 6 hours';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('🔍 Running in DRY RUN mode - no changes will be made');
        }

        $this->info('🕒 Processing expired appointments...');
        
        // Find pending appointments that were created more than 6 hours ago
        $expiredAppointments = Appointment::where('status', Appointment::STATUS_PENDING)
            ->where('created_at', '<=', now()->subHours(6))
            ->where(function($query) {
                $query->whereNull('auto_expired')
                      ->orWhere('auto_expired', false);
            })
            ->with(['client', 'provider', 'service'])
            ->get();

        if ($expiredAppointments->isEmpty()) {
            $this->info('✅ No expired appointments found.');
            return Command::SUCCESS;
        }

        $this->info("📋 Found {$expiredAppointments->count()} expired appointment(s)");

        $processed = 0;
        $errors = 0;

        foreach ($expiredAppointments as $appointment) {
            try {
                $hoursAgo = $appointment->created_at->diffInHours(now());
                
                $this->line("⏰ Processing appointment #{$appointment->id} (created {$hoursAgo}h ago)");
                
                if (!$isDryRun) {
                    // Update appointment status
                    $appointment->update([
                        'status' => Appointment::STATUS_EXPIRED,
                        'auto_expired' => true,
                        'cancelled_at' => now(),
                        'cancellation_reason' => 'Auto-expired due to provider non-response after 6 hours'
                    ]);

                    // Send notifications
                    $this->sendExpirationNotifications($appointment);
                    
                    $this->info("   ✅ Expired appointment #{$appointment->id}");
                } else {
                    $this->line("   [DRY RUN] Would expire appointment #{$appointment->id}");
                }
                
                $processed++;
                
            } catch (\Exception $e) {
                $errors++;
                $this->error("   ❌ Failed to process appointment #{$appointment->id}: {$e->getMessage()}");
                
                Log::error('Failed to process expired appointment', [
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

        Log::info('Expired appointments processing completed', [
            'processed' => $processed,
            'errors' => $errors,
            'dry_run' => $isDryRun
        ]);

        return Command::SUCCESS;
    }

    /**
     * Send expiration notifications to both client and provider
     */
    private function sendExpirationNotifications(Appointment $appointment)
    {
        try {
            // Notify client about expired appointment
            if ($appointment->client && $appointment->client->email) {
                Mail::to($appointment->client->email)->send(
                    new AppointmentExpiredNotification($appointment, 'client')
                );
                
                $this->line("   📧 Client notification sent to {$appointment->client->email}");
            }

            // Notify provider about missed opportunity
            if ($appointment->provider && $appointment->provider->email) {
                Mail::to($appointment->provider->email)->send(
                    new AppointmentExpiredNotification($appointment, 'provider')
                );
                
                $this->line("   📧 Provider notification sent to {$appointment->provider->email}");
            }

        } catch (\Exception $e) {
            $this->warn("   ⚠️ Failed to send notifications: {$e->getMessage()}");
            
            Log::warning('Failed to send expiration notifications', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}