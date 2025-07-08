<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Http\Requests\QuoteRequest;
use App\Http\Requests\QuoteResponseRequest;
use App\Models\Appointment;
use App\Models\Quote;
use App\Services\AppointmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AppointmentController extends Controller
{
    protected $appointmentService;

    public function __construct(AppointmentService $appointmentService)
    {
        $this->appointmentService = $appointmentService;
    }

    /**
     * Create booking (appointment or quote request)
     */
    public function createBooking(BookingRequest $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can create bookings'
                ], 403);
            }

            $result = $this->appointmentService->createBooking($user, $request->validated());

            $message = $result['type'] === 'quote_request'
                ? 'Quote request sent successfully'
                : 'Appointment booked successfully';

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => [
                    'type' => $result['type'],
                    $result['type'] === 'quote_request' ? 'quote' : 'appointment' => $this->formatAppointmentOrQuote($result['data'])
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create booking',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's appointments
     */
    public function getAppointments(Request $request)
    {
        try {
            $user = Auth::user();
            $filters = $request->only(['status', 'date_from', 'date_to', 'service_id']);
            $perPage = $request->get('per_page', 15);

            $query = $this->appointmentService->getAppointments($user, $filters);
            $appointments = $query->paginate($perPage);

            $formattedAppointments = $appointments->through(function ($appointment) {
                return $this->formatAppointmentResponse($appointment);
            });

            return response()->json([
                'success' => true,
                'data' => $formattedAppointments,
                'meta' => [
                    'total' => $appointments->total(),
                    'per_page' => $appointments->perPage(),
                    'current_page' => $appointments->currentPage(),
                    'last_page' => $appointments->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific appointment
     */
    public function getAppointment(Appointment $appointment)
    {
        try {
            $user = Auth::user();

            // Check if user has access to this appointment
            if ($user->role === 'client' && $appointment->client_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if ($user->role === 'service_provider' && $appointment->provider_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $appointment->load(['client', 'provider', 'service.category']);

            return response()->json([
                'success' => true,
                'data' => $this->formatAppointmentResponse($appointment, true)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Provider responds to appointment
     */
    public function respondToAppointment(Request $request, Appointment $appointment)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can respond to appointments'
                ], 403);
            }

            $request->validate([
                'action' => 'required|in:confirm,cancel,start,complete',
                'provider_notes' => 'nullable|string|max:500',
            ]);

            $updatedAppointment = $this->appointmentService->respondToAppointment(
                $user,
                $appointment,
                $request->action,
                $request->only(['provider_notes'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Appointment ' . $request->action . 'ed successfully',
                'data' => $this->formatAppointmentResponse($updatedAppointment)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to respond to appointment',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Create quote (Provider only)
     */
    public function createQuote(QuoteRequest $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can create quotes'
                ], 403);
            }

            $quote = $this->appointmentService->createQuote($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Quote created successfully',
                'data' => $this->formatQuoteResponse($quote)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's quotes
     */
    public function getQuotes(Request $request)
    {
        try {
            $user = Auth::user();
            $filters = $request->only(['status', 'service_id']);
            $perPage = $request->get('per_page', 15);

            $query = $this->appointmentService->getQuotes($user, $filters);
            $quotes = $query->paginate($perPage);

            $formattedQuotes = $quotes->through(function ($quote) {
                return $this->formatQuoteResponse($quote);
            });

            return response()->json([
                'success' => true,
                'data' => $formattedQuotes,
                'meta' => [
                    'total' => $quotes->total(),
                    'per_page' => $quotes->perPage(),
                    'current_page' => $quotes->currentPage(),
                    'last_page' => $quotes->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quotes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific quote
     */
    public function getQuote(Quote $quote)
    {
        try {
            $user = Auth::user();

            // Check if user has access to this quote
            if ($user->role === 'client' && $quote->client_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if ($user->role === 'service_provider' && $quote->provider_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            $quote->load(['client', 'provider', 'service.category']);

            return response()->json([
                'success' => true,
                'data' => $this->formatQuoteResponse($quote, true)
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Client responds to quote
     */
    public function respondToQuote(QuoteResponseRequest $request, Quote $quote)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can respond to quotes'
                ], 403);
            }

            $result = $this->appointmentService->respondToQuote(
                $user,
                $quote,
                $request->action,
                $request->only(['notes', 'appointment_date', 'appointment_time'])
            );

            $message = $request->action === 'accept'
                ? 'Quote accepted and appointment created successfully'
                : 'Quote rejected successfully';

            $responseData = [
                'quote' => $this->formatQuoteResponse($result['quote'])
            ];

            if ($result['appointment']) {
                $responseData['appointment'] = $this->formatAppointmentResponse($result['appointment']);
            }

            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $responseData
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to respond to quote',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Cancel appointment (Client or Provider)
     */
    public function cancelAppointment(Request $request, Appointment $appointment)
    {
        try {
            $user = Auth::user();

            // Check if user has permission to cancel
            if ($user->role === 'client' && $appointment->client_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if ($user->role === 'service_provider' && $appointment->provider_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if (!$appointment->canBeCancelled()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This appointment cannot be cancelled'
                ], 422);
            }

            $request->validate([
                'reason' => 'nullable|string|max:500',
            ]);

            $cancelledBy = $user->role === 'client' ? 'client' : 'provider';
            $appointment->cancel($cancelledBy);

            if ($request->reason) {
                $noteField = $cancelledBy === 'client' ? 'client_notes' : 'provider_notes';
                $appointment->update([$noteField => $request->reason]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Appointment cancelled successfully',
                'data' => $this->formatAppointmentResponse($appointment->fresh())
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel appointment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Withdraw quote (Provider only)
     */
    public function withdrawQuote(Request $request, Quote $quote)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can withdraw quotes'
                ], 403);
            }

            if ($quote->provider_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            if (!$quote->canBeWithdrawn()) {
                return response()->json([
                    'success' => false,
                    'message' => 'This quote cannot be withdrawn'
                ], 422);
            }

            $request->validate([
                'reason' => 'nullable|string|max:500',
            ]);

            $quote->withdraw($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Quote withdrawn successfully',
                'data' => $this->formatQuoteResponse($quote->fresh())
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to withdraw quote',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add review and rating (Post-completion)
     */
    public function addReview(Request $request, Appointment $appointment)
    {
        try {
            $user = Auth::user();

            // Check permissions and appointment status
            if (!$appointment->isCompleted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only review completed appointments'
                ], 422);
            }

            $request->validate([
                'rating' => 'required|numeric|between:1,5',
                'review' => 'nullable|string|max:1000',
            ]);

            if ($user->role === 'client' && $appointment->client_id === $user->id) {
                // Client rating provider
                $appointment->update([
                    'provider_rating' => $request->rating,
                    'provider_review' => $request->review,
                ]);

                // Update provider's average rating
                $appointment->provider->providerProfile->updateRating($request->rating);
                $appointment->service->updateRating($request->rating);
            } elseif ($user->role === 'service_provider' && $appointment->provider_id === $user->id) {
                // Provider rating client
                $appointment->update([
                    'client_rating' => $request->rating,
                    'client_review' => $request->review,
                ]);
            } else {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }

            return response()->json([
                'success' => true,
                'message' => 'Review added successfully',
                'data' => $this->formatAppointmentResponse($appointment->fresh())
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get appointment statistics
     */
    public function getStatistics()
    {
        try {
            $user = Auth::user();
            $statistics = $this->appointmentService->getAppointmentStatistics($user);

            return response()->json([
                'success' => true,
                'data' => $statistics
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming appointments
     */
    public function getUpcomingAppointments()
    {
        try {
            $user = Auth::user();

            $query = $this->appointmentService->getAppointments($user);
            $upcomingAppointments = $query->upcoming()
                ->take(5)
                ->get()
                ->map(function ($appointment) {
                    return $this->formatAppointmentResponse($appointment);
                });

            return response()->json([
                'success' => true,
                'data' => $upcomingAppointments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark expired quotes (Utility endpoint for cron jobs)
     */
    public function markExpiredQuotes()
    {
        try {
            $expiredCount = $this->appointmentService->markExpiredQuotes();

            return response()->json([
                'success' => true,
                'message' => "Marked {$expiredCount} quotes as expired",
                'data' => ['expired_count' => $expiredCount]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark expired quotes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper Methods

    /**
     * Format appointment response
     */
    private function formatAppointmentResponse(Appointment $appointment, bool $detailed = false): array
    {
        $baseResponse = [
            'id' => $appointment->id,
            'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
            'appointment_time' => $appointment->appointment_time->format('H:i'),
            'formatted_date_time' => $appointment->formatted_date_time,
            'duration_hours' => $appointment->duration_hours,
            'total_price' => $appointment->total_price,
            'status' => $appointment->status,
            'status_text' => $appointment->status_text,
            'status_badge' => $appointment->status_badge,
            'client_address' => $appointment->client_address,
            'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
        ];

        // Add service information
        if ($appointment->relationLoaded('service')) {
            $baseResponse['service'] = [
                'id' => $appointment->service->id,
                'title' => $appointment->service->title,
                'category' => $appointment->service->category->name ?? 'Unknown',
                'first_image_url' => $appointment->service->first_image_url,
            ];
        }

        // Add client information (for providers)
        if ($appointment->relationLoaded('client')) {
            $baseResponse['client'] = [
                'id' => $appointment->client->id,
                'name' => $appointment->client->full_name,
                'email' => $appointment->client->email,
                'contact_number' => $appointment->client->contact_number,
                'profile_picture' => $appointment->client->profile_picture
                    ? \Storage::url($appointment->client->profile_picture)
                    : null,
            ];
        }

        // Add provider information (for clients)
        if ($appointment->relationLoaded('provider')) {
            $baseResponse['provider'] = [
                'id' => $appointment->provider->id,
                'name' => $appointment->provider->full_name,
                'email' => $appointment->provider->email,
                'contact_number' => $appointment->provider->contact_number,
                'profile_picture' => $appointment->provider->profile_picture
                    ? \Storage::url($appointment->provider->profile_picture)
                    : null,
            ];

            if ($appointment->provider->providerProfile) {
                $baseResponse['provider']['business_name'] = $appointment->provider->providerProfile->business_name;
                $baseResponse['provider']['average_rating'] = $appointment->provider->providerProfile->average_rating;
            }
        }

        // Add detailed information if requested
        if ($detailed) {
            $baseResponse = array_merge($baseResponse, [
                'client_notes' => $appointment->client_notes,
                'provider_notes' => $appointment->provider_notes,
                'client_location' => $appointment->client_location,
                'client_rating' => $appointment->client_rating,
                'client_review' => $appointment->client_review,
                'provider_rating' => $appointment->provider_rating,
                'provider_review' => $appointment->provider_review,
                'confirmed_at' => $appointment->confirmed_at?->format('Y-m-d H:i:s'),
                'started_at' => $appointment->started_at?->format('Y-m-d H:i:s'),
                'completed_at' => $appointment->completed_at?->format('Y-m-d H:i:s'),
                'cancelled_at' => $appointment->cancelled_at?->format('Y-m-d H:i:s'),
            ]);
        }

        return $baseResponse;
    }

    /**
     * Format quote response
     */
    private function formatQuoteResponse(Quote $quote, bool $detailed = false): array
    {
        $baseResponse = [
            'id' => $quote->id,
            'title' => $quote->title,
            'description' => $quote->description,
            'quoted_price' => $quote->quoted_price,
            'formatted_price' => $quote->formatted_price,
            'duration_hours' => $quote->duration_hours,
            'status' => $quote->status,
            'status_badge' => $quote->status_badge,
            'valid_until' => $quote->valid_until->format('Y-m-d H:i:s'),
            'time_remaining' => $quote->time_remaining,
            'created_at' => $quote->created_at->format('Y-m-d H:i:s'),
        ];

        // Add service information
        if ($quote->relationLoaded('service')) {
            $baseResponse['service'] = [
                'id' => $quote->service->id,
                'title' => $quote->service->title,
                'category' => $quote->service->category->name ?? 'Unknown',
                'first_image_url' => $quote->service->first_image_url,
            ];
        }

        // Add client information (for providers)
        if ($quote->relationLoaded('client')) {
            $baseResponse['client'] = [
                'id' => $quote->client->id,
                'name' => $quote->client->full_name,
                'email' => $quote->client->email,
                'contact_number' => $quote->client->contact_number,
            ];
        }

        // Add provider information (for clients)
        if ($quote->relationLoaded('provider')) {
            $baseResponse['provider'] = [
                'id' => $quote->provider->id,
                'name' => $quote->provider->full_name,
                'business_name' => $quote->provider->providerProfile->business_name ?? null,
                'average_rating' => $quote->provider->providerProfile->average_rating ?? 0,
            ];
        }

        // Add detailed information if requested
        if ($detailed) {
            $baseResponse = array_merge($baseResponse, [
                'client_requirements' => $quote->client_requirements,
                'quote_details' => $quote->quote_details,
                'terms_and_conditions' => $quote->terms_and_conditions,
                'client_notes' => $quote->client_notes,
                'provider_notes' => $quote->provider_notes,
                'responded_at' => $quote->responded_at?->format('Y-m-d H:i:s'),
            ]);
        }

        return $baseResponse;
    }

    /**
     * Format appointment or quote response (helper for createBooking)
     */
    private function formatAppointmentOrQuote($data): array
    {
        if ($data instanceof Appointment) {
            return $this->formatAppointmentResponse($data);
        } elseif ($data instanceof Quote) {
            return $this->formatQuoteResponse($data);
        }

        return [];
    }
}
