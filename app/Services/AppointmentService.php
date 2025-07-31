<?php

namespace App\Services;

use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Quote;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * AppointmentService - Core business logic for appointment and quote management
 * 
 * Handles the complete booking workflow including direct appointments, 
 * quote requests, appointment confirmations, and conflict resolution.
 * Implements advanced features like retry logic for race conditions 
 * and database locking to prevent double bookings.
 */
class AppointmentService
{
    protected $availabilityService;

    public function __construct(AvailabilityService $availabilityService)
    {
        $this->availabilityService = $availabilityService;
    }
    /**
     * Create a booking request with intelligent routing between direct bookings and quote requests
     * Implements retry logic for direct appointments to handle concurrent booking conflicts
     */
    public function createBooking(User $client, array $data): array
    {
        // If it's a direct appointment (not quote request), use retry logic for race conditions
        if (!($data['request_quote'] ?? false) && isset($data['appointment_date']) && isset($data['appointment_time'])) {
            return $this->createBookingWithRetry($client, $data);
        }

        // Regular booking flow for quotes
        DB::beginTransaction();

        try {
            // Get provider and service
            $provider = User::findOrFail($data['provider_id']);
            $service = Service::findOrFail($data['service_id']);

            if ($data['request_quote'] ?? false) {
                // Create quote request instead of direct booking
                $result = $this->createQuoteRequest($client, $service, $data);
                $type = 'quote_request';
            } else {
                // Create direct appointment
                $appointment = $this->createDirectAppointment($client, $service, $data);
                $result = $appointment;
                $type = 'appointment';
            }

            DB::commit();

            return [
                'type' => $type,
                'data' => $result,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw new \Exception('Failed to create booking: ' . $e->getMessage());
        }
    }

    /**
     * Create booking with retry logic for handling concurrent booking race conditions
     * Implements exponential backoff with random jitter to avoid thundering herd problems
     */
    private function createBookingWithRetry(User $client, array $data, int $maxRetries = 3): array
    {
        $retryCount = 0;
        $lastException = null;

        while ($retryCount < $maxRetries) {
            DB::beginTransaction();
            
            try {
                $provider = User::findOrFail($data['provider_id']);
                $service = Service::findOrFail($data['service_id']);

                $appointment = $this->createAppointmentWithLocking($client, $service, $data);
                DB::commit();
                
                return [
                    'type' => 'appointment',
                    'data' => $appointment->load(['client', 'provider', 'service'])
                ];
            } catch (\Exception $e) {
                DB::rollBack();
                $lastException = $e;
                
                // Check if this is a booking conflict that might resolve with retry
                if (strpos($e->getMessage(), 'conflicts with existing appointment') !== false ||
                    strpos($e->getMessage(), 'no longer available') !== false) {
                    
                    $retryCount++;
                    
                    if ($retryCount < $maxRetries) {
                        // Wait a short random time before retry (100-300ms) to reduce contention
                        usleep(rand(100000, 300000));
                        Log::info("Booking conflict detected, retrying... Attempt {$retryCount}/{$maxRetries}");
                        continue;
                    }
                }
                
                // For other exceptions or max retries reached, throw immediately
                break;
            }
        }

        // If we get here, all retries failed
        throw new \Exception('Failed to create booking after ' . $maxRetries . ' attempts: ' . $lastException->getMessage());
    }

    /**
     * Create appointment with database locking to prevent double-booking race conditions
     * Uses SELECT...FOR UPDATE to ensure atomic check-and-create operations
     */
    private function createAppointmentWithLocking(User $client, Service $service, array $data): Appointment
    {
        $provider = User::findOrFail($service->provider_id);
        $duration = $data['duration_hours'] ?? $service->duration_hours ?? 1;
        $endTime = Carbon::parse($data['appointment_time'])->addHours($duration)->format('H:i');

        // Lock the provider's appointments table for this date to prevent concurrent bookings
        // This ensures atomic check-and-create operation by locking relevant rows
        $conflictingAppointment = Appointment::where('provider_id', $provider->id)
            ->where('appointment_date', $data['appointment_date'])
            ->whereNotIn('status', [
                'cancelled_by_client',
                'cancelled_by_provider', 
                'cancelled_by_staff',
                'expired'
            ])
            ->lockForUpdate() // Critical: prevents other concurrent bookings for this provider/date
            ->get();

        // Check for time conflicts with the locked results using interval overlap logic
        $requestedStart = Carbon::parse($data['appointment_time']);
        $requestedEnd = $requestedStart->copy()->addHours($duration);

        foreach ($conflictingAppointment as $existing) {
            $existingStart = Carbon::parse($existing->appointment_time);
            $existingEnd = $existingStart->copy()->addHours($existing->duration_hours);

            // Check for overlap using standard interval overlap formula: start < existing_end AND end > existing_start
            if ($requestedStart->lt($existingEnd) && $requestedEnd->gt($existingStart)) {
                throw new \Exception(
                    "Selected time slot conflicts with existing appointment. Please choose a different time."
                );
            }
        }

        // Additional availability check using the service
        $availabilityCheck = $this->availabilityService->isAvailableAt(
            $provider,
            $data['appointment_date'],
            $data['appointment_time'],
            $endTime
        );

        if (!$availabilityCheck['available']) {
            throw new \Exception(
                "Selected time slot is no longer available: " . $availabilityCheck['reason']
            );
        }

        // If we reach here, the slot is available - create the appointment
        return $this->createDirectAppointment($client, $service, $data);
    }

    /**
     * Create direct appointment
     */
    private function createDirectAppointment(User $client, Service $service, array $data): Appointment
    {
        $appointment = Appointment::create([
            'client_id' => $client->id,
            'provider_id' => $service->provider_id,
            'service_id' => $service->id,
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'duration_hours' => $service->duration_hours,
            'total_price' => $service->base_price,
            'status' => 'pending',
            'client_address' => $data['client_address'],
            'client_notes' => $data['client_notes'] ?? null,
            'client_location' => $data['client_location'] ?? null,
        ]);

        // Increment service booking count
        $service->incrementBookings();

        return $appointment->load(['client', 'provider', 'service']);
    }

    /**
     * Create quote request
     */
    private function createQuoteRequest(User $client, Service $service, array $data): Quote
    {
        $quote = Quote::create([
            'client_id' => $client->id,
            'provider_id' => $service->provider_id,
            'service_id' => $service->id,
            'title' => 'Quote Request for ' . $service->title,
            'description' => $data['requirements'] ?? 'Quote requested for ' . $service->title,
            'client_requirements' => $data['requirements'] ?? null,
            'quoted_price' => 0, // Will be filled by provider
            'duration_hours' => $service->duration_hours,
            'quote_details' => '', // Will be filled by provider
            'status' => 'pending',
            'valid_until' => now()->addDays(7), // Default 7 days validity
        ]);

        return $quote->load(['client', 'provider', 'service']);
    }

    /**
     * Provider responds to appointment request
     */
    public function respondToAppointment(User $provider, Appointment $appointment, string $action, array $data = []): Appointment
    {
        if ($appointment->provider_id !== $provider->id) {
            throw new \Exception('You can only respond to your own appointment requests');
        }

        if (!$appointment->canBeConfirmed() && $action === 'confirm') {
            throw new \Exception('This appointment cannot be confirmed');
        }

        if (!$appointment->canBeCancelled() && $action === 'cancel') {
            throw new \Exception('This appointment cannot be cancelled');
        }

        switch ($action) {
            case 'confirm':
                $appointment->confirm();
                break;
            case 'cancel':
                $appointment->cancel('provider');
                break;
            case 'start':
                $appointment->start();
                break;
            case 'complete':
                $appointment->complete();
                break;
            default:
                throw new \Exception('Invalid action');
        }

        if (isset($data['provider_notes'])) {
            $appointment->update(['provider_notes' => $data['provider_notes']]);
        }

        return $appointment->fresh();
    }

    /**
     * Create quote response
     */
    public function createQuote(User $provider, array $data): Quote
    {
        // If this is a response to an appointment request, mark appointment as quoted
        if (isset($data['appointment_id'])) {
            $appointment = Appointment::findOrFail($data['appointment_id']);
            if ($appointment->provider_id !== $provider->id) {
                throw new \Exception('You can only quote for your own appointment requests');
            }
        }

        $quote = Quote::create([
            'client_id' => $data['client_id'],
            'provider_id' => $provider->id,
            'service_id' => $data['service_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'client_requirements' => $data['client_requirements'] ?? null,
            'quoted_price' => $data['quoted_price'],
            'duration_hours' => $data['duration_hours'],
            'quote_details' => $data['quote_details'],
            'terms_and_conditions' => $data['terms_and_conditions'] ?? null,
            'status' => 'pending',
            'valid_until' => $data['valid_until'],
        ]);

        return $quote->load(['client', 'provider', 'service']);
    }

    /**
     * Client responds to quote
     */
    public function respondToQuote(User $client, Quote $quote, string $action, array $data = []): array
    {
        if ($quote->client_id !== $client->id) {
            throw new \Exception('You can only respond to your own quotes');
        }

        if (!$quote->canBeAccepted() && $action === 'accept') {
            throw new \Exception('This quote cannot be accepted');
        }

        if (!$quote->canBeRejected() && $action === 'reject') {
            throw new \Exception('This quote cannot be rejected');
        }

        DB::beginTransaction();

        try {
            $appointment = null;

            if ($action === 'accept') {
                $quote->accept($data['notes'] ?? null);

                // Create appointment from accepted quote
                $appointment = Appointment::create([
                    'client_id' => $quote->client_id,
                    'provider_id' => $quote->provider_id,
                    'service_id' => $quote->service_id,
                    'appointment_date' => $data['appointment_date'],
                    'appointment_time' => $data['appointment_time'],
                    'duration_hours' => $quote->duration_hours,
                    'total_price' => $quote->quoted_price,
                    'status' => 'confirmed',
                    'client_address' => $client->address, // Use client's default address
                    'client_notes' => $data['notes'] ?? null,
                    'confirmed_at' => now(),
                ]);

                $appointment->load(['client', 'provider', 'service']);
            } else {
                $quote->reject($data['notes'] ?? null);
            }

            DB::commit();

            return [
                'quote' => $quote->fresh(),
                'appointment' => $appointment,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get appointments with filters
     */
    public function getAppointments($user, $filters = [])
    {
        $query = Appointment::where('provider_id', $user->id)
            ->with(['client', 'service', 'quote', 'invoice', 'pendingRescheduleRequest']);

        // Apply filters
        if (isset($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['date_from']) && $filters['date_from']) {
            $query->whereDate('appointment_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to']) && $filters['date_to']) {
            $query->whereDate('appointment_date', '<=', $filters['date_to']);
        }

        // Smart sorting: Active appointments first, then by date/time
        $query->orderByRaw("
        CASE 
            WHEN status IN ('pending', 'confirmed', 'in_progress') THEN 1
            WHEN status = 'completed' THEN 2 
            WHEN status IN ('cancelled_by_client', 'cancelled_by_provider', 'no_show') THEN 3
            ELSE 4 
        END
    ");

        // Then sort by date and time (closest first)
        $query->orderBy('appointment_date', 'asc')
            ->orderBy('appointment_time', 'asc');

        return $query;
    }

    /**
     * Get quotes with filters
     */
    public function getQuotes(User $user, array $filters = [])
    {
        $query = Quote::with(['client', 'provider', 'service.category']);

        // Filter by user role
        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'service_provider') {
            $query->where('provider_id', $user->id);
        }

        // Apply filters
        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['service_id'])) {
            $query->where('service_id', $filters['service_id']);
        }

        // Default ordering
        $query->orderBy('created_at', 'desc');

        return $query;
    }

    /**
     * Mark expired quotes
     */
    public function markExpiredQuotes(): int
    {
        return Quote::where('status', 'pending')
            ->where('valid_until', '<=', now())
            ->update(['status' => 'expired']);
    }


    public function getAppointmentStatistics(User $user): array
    {
        $query = Appointment::query();

        if ($user->role === 'service_provider') {
            $query->where('provider_id', $user->id);
        } elseif ($user->role === 'client') {
            $query->where('client_id', $user->id);
        }

        return [
            'total' => $query->count(),
            'pending' => $query->where('status', 'pending')->count(),
            'confirmed' => $query->where('status', 'confirmed')->count(),
            'completed' => $query->where('status', 'completed')->count(),
            'cancelled' => $query->where('status', 'like', 'cancelled%')->count(),
            'this_month' => $query->whereMonth('appointment_date', now()->month)
                ->whereYear('appointment_date', now()->year)
                ->count(),
        ];
    }
}
