<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientQuoteRequest;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Models\Appointment;
use App\Services\AvailabilityService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class QuoteController extends Controller
{
    public function store(ClientQuoteRequest $request)
    {
        try {
            Log::info('Quote request received', ['data' => $request->validated(), 'user_id' => Auth::id()]);

            $validatedData = $request->validated();

            // Get service and provider details
            $service = Service::findOrFail($validatedData['service_id']);
            $provider = User::findOrFail($validatedData['provider_id']);

            DB::beginTransaction();

            $quote = Quote::create([
                'client_id' => Auth::id(),
                'provider_id' => $validatedData['provider_id'],
                'service_id' => $validatedData['service_id'],
                'title' => "Quote Request: {$service->title}",
                // 'description' => "Quote request for {$service->title} by " . trim($provider->first_name . ' ' . $provider->last_name),
                'description' => "Quote request for {$service->title} by " . ($provider->name ?? 'Provider'),

                // Store all request data as JSON
                'quote_request_data' => $validatedData,
                'client_requirements' => $validatedData['message'],

                // Initial status
                'status' => Quote::STATUS_PENDING,
            ]);

            // Load relationships for response
            $quote->load(['service', 'provider', 'client']);

            DB::commit();

            Log::info('Quote request created successfully', ['quote_id' => $quote->id, 'client_id' => Auth::id()]);

            return response()->json([
                'success' => true,
                'message' => 'Quote request sent successfully! The provider will respond within 24 hours.',
                'data' => [
                    'id' => $quote->id,
                    'quote_number' => $quote->quote_number,
                    'status' => $quote->status,
                    'status_text' => $quote->status_text,
                    'service_title' => $quote->service->title,
                    // 'provider_name' => trim($quote->provider->first_name . ' ' . $quote->provider->last_name),
                    'provider_name' => $quote->provider->name ?? 'Unknown Provider',
                    'urgency' => $quote->urgency,
                    'location_summary' => $quote->location_summary,
                    'created_at' => $quote->created_at->toISOString(),
                ],
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::warning('Quote request validation failed', ['errors' => $e->errors(), 'user_id' => Auth::id()]);

            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Quote request creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'client_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create quote request. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            ], 500);
        }
    }

    /**
     * Get all quotes for the authenticated client
     */
    public function index(Request $request)
    {
        try {
            $user = auth()->user();

            // Build query - load the correct relationships
            $query = Quote::where('client_id', $user->id)
                ->with(['service', 'provider']) // Just load provider as User
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Handle count_only requests
            if ($request->boolean('count_only')) {
                $count = $query->count();
                return response()->json([
                    'success' => true,
                    'count' => $count,
                    'data' => [],
                    'message' => 'Quote count retrieved successfully'
                ]);
            }

            $quotes = $query->get();

            Log::info("Found {$quotes->count()} quotes for user {$user->id}");

            // Transform the data to match frontend expectations
            $transformedQuotes = $quotes->map(function ($quote) {
                // Get provider profile if it exists
                $providerProfile = null;
                if ($quote->provider) {
                    // Check if provider has a provider_profile relationship
                    try {
                        $providerProfile = $quote->provider->provider_profile ?? null;
                    } catch (\Exception $e) {
                        // If provider_profile relationship doesn't exist, use fallback
                        $providerProfile = null;
                    }
                }

                return [
                    'id' => $quote->id,
                    'quote_number' => $quote->quote_number, // Uses accessor
                    'status' => $quote->status,

                    // Service information
                    'service_title' => $quote->service->title ?? $quote->title ?? 'Unknown Service',
                    'service_description' => $quote->service->description ?? $quote->description ?? '',
                    'service_image' => $quote->service->first_image_url ?? null,

                    // Provider information - handle missing provider_profile
                    'provider_id' => $quote->provider_id,
                    // 'provider_name' => $quote->provider ?
                    //     trim($quote->provider->first_name . ' ' . $quote->provider->last_name) :
                    //     'Unknown Provider',
                    'provider_name' => $quote->provider ?
                        ($quote->provider->name ?? 'Unknown Provider') :
                        'Unknown Provider',
                    'provider_image' => $quote->provider->profile_picture ?? null,
                    'provider_rating' => $providerProfile->average_rating ?? 0,
                    'provider_reviews' => $providerProfile->total_reviews ?? 0,

                    // Request data (from JSON field via accessors)
                    'message' => $quote->client_requirements ?? '',
                    'requested_date' => $quote->requested_date, // Uses accessor
                    'requested_time' => $quote->requested_time, // Uses accessor
                    'location_summary' => $quote->location_summary, // Uses accessor
                    'special_requirements' => $quote->special_requirements, // Uses accessor
                    'urgency' => $quote->urgency, // Uses accessor

                    // Quote response data
                    'quoted_price' => $quote->quoted_price,
                    'travel_fee' => $quote->travel_fee ?? 0,
                    'estimated_duration' => $quote->duration_hours,
                    'provider_response' => $quote->quote_details,
                    'quote_notes' => $quote->provider_notes,
                    'validity_days' => $quote->valid_until ?
                        now()->diffInDays($quote->valid_until) : null,

                    // Timestamps
                    'created_at' => $quote->created_at,
                    'updated_at' => $quote->updated_at,
                    'quoted_at' => $quote->responded_at,
                    'expires_at' => $quote->valid_until,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedQuotes,
                'total' => $quotes->count(),
                'message' => 'Quotes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching quotes: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quotes',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    public function show(Request $request, Quote $quote)
    {
        try {
            // Ensure user can only view their own quotes
            if ($quote->client_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }

            // Load relationships - be careful with provider_profile
            $quote->load(['service', 'provider']);

            // Get provider profile safely
            $providerProfile = null;
            if ($quote->provider) {
                try {
                    $providerProfile = $quote->provider->provider_profile ?? null;
                } catch (\Exception $e) {
                    $providerProfile = null;
                }
            }

            // Transform single quote data
            $transformedQuote = [
                'id' => $quote->id,
                'quote_number' => $quote->quote_number,
                'status' => $quote->status,

                // Service information
                'service_title' => $quote->service->title ?? $quote->title ?? 'Unknown Service',
                'service_description' => $quote->service->description ?? $quote->description ?? '',
                'service_image' => $quote->service->first_image_url ?? null,

                // Provider information
                'provider_id' => $quote->provider_id,
                // 'provider_name' => $quote->provider ?
                //     trim($quote->provider->first_name . ' ' . $quote->provider->last_name) :
                //     'Unknown Provider',
                'provider_name' => $quote->provider ?
                    ($quote->provider->name ?? 'Unknown Provider') :
                    'Unknown Provider',
                'provider_image' => $quote->provider->profile_picture ?? null,
                'provider_rating' => $providerProfile->average_rating ?? 0,
                'provider_reviews' => $providerProfile->total_reviews ?? 0,

                // Request data
                'message' => $quote->client_requirements ?? '',
                'requested_date' => $quote->requested_date,
                'requested_time' => $quote->requested_time,
                'location_summary' => $quote->location_summary,
                'special_requirements' => $quote->special_requirements,
                'urgency' => $quote->urgency,

                // Quote response data
                'quoted_price' => $quote->quoted_price,
                'travel_fee' => $quote->travel_fee ?? 0,
                'estimated_duration' => $quote->duration_hours,
                'provider_response' => $quote->quote_details,
                'quote_notes' => $quote->provider_notes,
                'validity_days' => $quote->valid_until ?
                    now()->diffInDays($quote->valid_until) : null,

                // Status helpers
                'time_remaining' => $quote->time_remaining,
                'can_be_accepted' => $quote->canBeAccepted(),
                'can_be_rejected' => $quote->canBeRejected(),

                // Timestamps
                'created_at' => $quote->created_at,
                'updated_at' => $quote->updated_at,
                'quoted_at' => $quote->responded_at,
                'expires_at' => $quote->valid_until,
                'accepted_at' => $quote->client_responded_at && $quote->status === 'accepted' ? $quote->client_responded_at : null,
                'declined_at' => $quote->client_responded_at && $quote->status === 'rejected' ? $quote->client_responded_at : null,
            ];

            return response()->json([
                'success' => true,
                'data' => $transformedQuote,
                'message' => 'Quote details retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching quote details: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quote details',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update quote with provider response
     */
    public function accept(Request $request, Quote $quote)
    {
        try {
            // Validation
            if ($quote->client_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }

            if (!$quote->canBeAccepted()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote cannot be accepted at this time'
                ], 422);
            }

            // Validate appointment details if creating appointment
            if ($request->input('create_appointment', false)) {
                $appointmentDetails = $request->input('appointment_details', []);

                $validator = Validator::make($appointmentDetails, [
                    'date' => 'required|date|after:today',
                    'time' => 'required|string',
                    'duration' => 'required|numeric|min:0.5',
                    'provider_id' => 'required|exists:users,id',
                    'service_id' => 'required|exists:services,id',
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid appointment details',
                        'errors' => $validator->errors()
                    ], 422);
                }

                // Real availability check using AvailabilityService
                $availabilityCheck = $this->checkProviderAvailability(
                    $appointmentDetails['provider_id'],
                    $appointmentDetails['date'],
                    $appointmentDetails['time'],
                    $appointmentDetails['duration']
                );

                if (!$availabilityCheck['available']) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Selected time slot is no longer available',
                        'availability_info' => $availabilityCheck
                    ], 422);
                }
            }

            DB::beginTransaction();

            try {
                // Accept the quote
                $quote->accept($request->input('notes'));

                $appointment = null;

                // Create appointment if requested
                if ($request->input('create_appointment', false)) {
                    $appointmentDetails = $request->input('appointment_details');

                    $appointment = Appointment::create([
                        'client_id' => auth()->id(),
                        'provider_id' => $appointmentDetails['provider_id'],
                        'service_id' => $appointmentDetails['service_id'],
                        'quote_id' => $quote->id,
                        'appointment_date' => $appointmentDetails['date'],
                        'appointment_time' => $appointmentDetails['time'],
                        'duration_hours' => $appointmentDetails['duration'],
                        'total_price' => $quote->quoted_price + ($quote->travel_fee ?? 0),
                        'status' => 'pending_confirmation',
                        'client_notes' => $request->input('notes', ''),
                        'booking_source' => 'quote_acceptance',
                    ]);

                    // Update quote with appointment reference
                    $quote->update(['appointment_id' => $appointment->id]);

                    // Block the time slot in provider's availability
                    $availabilityService = app(AvailabilityService::class);
                    $provider = User::find($appointmentDetails['provider_id']);

                    $availabilityService->blockTimeForAppointment(
                        $provider,
                        $appointmentDetails['date'],
                        $appointmentDetails['time'],
                        $appointmentDetails['duration'],
                        "Appointment #{$appointment->id} - {$quote->service->title}"
                    );

                    // TODO: Send notifications to provider about appointment
                    Log::info("Appointment created and time blocked for provider {$provider->id}");
                }

                DB::commit();

                // Load fresh data with relationships
                $quote->load(['service', 'provider', 'appointment']);

                return response()->json([
                    'success' => true,
                    'data' => [
                        'quote' => $quote,
                        'appointment' => $appointment,
                    ],
                    'message' => $appointment
                        ? 'Quote accepted and appointment created successfully'
                        : 'Quote accepted successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error accepting quote: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept quote'
            ], 500);
        }
    }


    /**
     * Decline a quote
     */
    public function decline(Request $request, Quote $quote)
    {
        try {
            // Validation
            if ($quote->client_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }

            if (!$quote->canBeRejected()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote cannot be declined at this time'
                ], 422);
            }

            // Decline the quote
            $quote->reject($request->input('notes'));

            return response()->json([
                'success' => true,
                'data' => $quote->fresh(),
                'message' => 'Quote declined successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error declining quote: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline quote'
            ], 500);
        }
    }

    // Helper method to check provider availability
    private function checkProviderAvailability($providerId, $date, $time, $duration)
    {
        try {
            $provider = User::where('id', $providerId)
                ->where('role', 'service_provider')
                ->firstOrFail();

            $startTime = Carbon::parse($time);
            $endTime = $startTime->copy()->addHours($duration);

            // Use the AvailabilityService to check
            $availabilityService = app(AvailabilityService::class);

            $availability = $availabilityService->isAvailableAt(
                $provider,
                $date,
                $startTime->format('H:i'),
                $endTime->format('H:i')
            );

            return $availability;
        } catch (\Exception $e) {
            Log::error('Error checking provider availability: ' . $e->getMessage());

            return [
                'available' => false,
                'reason' => 'Error checking availability',
                'error' => $e->getMessage()
            ];
        }
    }
}
