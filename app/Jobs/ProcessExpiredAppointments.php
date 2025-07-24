<?php

namespace App\Jobs;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\User;
use App\Mail\AppointmentExpiredClient;
use App\Mail\AppointmentExpiredProvider;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ProcessExpiredAppointments implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info('Processing expired appointments job started');

        try {
            // Find all expired appointments that haven't been processed yet
            $expiredAppointments = Appointment::where('status', 'pending')
                ->where('expires_at', '<=', now())
                ->where('auto_expired', false)
                ->with(['client', 'provider', 'service.category'])
                ->get();

            $processedCount = 0;
            $failedCount = 0;

            foreach ($expiredAppointments as $appointment) {
                try {
                    DB::beginTransaction();

                    // Update appointment status
                    $appointment->update([
                        'status' => 'expired',
                        'auto_expired' => true,
                        'cancellation_reason' => 'Appointment expired - provider did not respond within 24 hours',
                        'cancelled_at' => now(),
                    ]);

                    // Send notification emails
                    $this->sendExpiredNotifications($appointment);

                    // Find alternative providers for the client
                    $alternativeProviders = $this->findAlternativeProviders($appointment);

                    DB::commit();
                    $processedCount++;

                    Log::info('Appointment expired and processed', [
                        'appointment_id' => $appointment->id,
                        'client_id' => $appointment->client_id,
                        'provider_id' => $appointment->provider_id,
                        'alternative_providers_found' => count($alternativeProviders)
                    ]);

                } catch (\Exception $e) {
                    DB::rollBack();
                    $failedCount++;
                    
                    Log::error('Failed to process expired appointment', [
                        'appointment_id' => $appointment->id,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            Log::info('Expired appointments processing completed', [
                'total_found' => $expiredAppointments->count(),
                'processed' => $processedCount,
                'failed' => $failedCount
            ]);

        } catch (\Exception $e) {
            Log::error('Expired appointments job failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Send expiration notification emails
     */
    private function sendExpiredNotifications(Appointment $appointment)
    {
        try {
            // Send email to client
            if ($appointment->client && $appointment->client->email) {
                Mail::to($appointment->client->email)->send(
                    new AppointmentExpiredClient($appointment)
                );
            }

            // Send email to provider (for their records)
            if ($appointment->provider && $appointment->provider->email) {
                Mail::to($appointment->provider->email)->send(
                    new AppointmentExpiredProvider($appointment)
                );
            }

        } catch (\Exception $e) {
            Log::error('Failed to send expiration notifications', [
                'appointment_id' => $appointment->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Find alternative providers for the same service
     */
    private function findAlternativeProviders(Appointment $appointment): array
    {
        try {
            $alternativeProviders = User::where('role', 'service_provider')
                ->where('id', '!=', $appointment->provider_id)
                ->whereHas('services', function ($query) use ($appointment) {
                    $query->where('services.id', $appointment->service_id);
                })
                ->where('is_active', true)
                ->with(['providerProfile', 'services' => function ($query) use ($appointment) {
                    $query->where('services.id', $appointment->service_id);
                }])
                ->limit(3)
                ->get()
                ->toArray();

            return $alternativeProviders;

        } catch (\Exception $e) {
            Log::error('Failed to find alternative providers', [
                'appointment_id' => $appointment->id,
                'service_id' => $appointment->service_id,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
