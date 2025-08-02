<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\ClientQuoteRequest;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Models\Appointment;
use App\Services\AvailabilityService;
use App\Events\QuoteStatusChanged;
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
            // Log::info('Quote request received', ['data' => $request->validated(), 'user_id' => Auth::id()]);

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
                'description' => "Quote request for {$service->title} by " . ($provider->full_name ?? 'Provider'),

                // Store all request data as JSON
                'quote_request_data' => $validatedData,
                'client_requirements' => $validatedData['message'],

                // Initial status
                'status' => Quote::STATUS_PENDING,
            ]);

            // Load relationships for response
            $quote->load(['service', 'provider', 'client']);

            DB::commit();

            // Dispatch quote status changed event for notifications
            event(new QuoteStatusChanged($quote, null, $quote->status));

            // Log::info('Quote request created successfully', ['quote_id' => $quote->id, 'client_id' => Auth::id()]);

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
                    'provider_name' => $quote->provider->full_name ?? 'Unknown Provider',
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
        // Validate request parameters
        $request->validate([
            'status' => 'nullable|in:pending,quoted,accepted,declined,expired',
            'per_page' => 'nullable|integer|min:1|max:50',
            'page' => 'nullable|integer|min:1',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'provider' => 'nullable|string|max:255',
            'service_category' => 'nullable|string|max:255',
            'price_min' => 'nullable|numeric|min:0',
            'price_max' => 'nullable|numeric|min:0',
            'sort_field' => 'nullable|in:created_at,quoted_price,status,requested_date,provider_name,service_title',
            'sort_direction' => 'nullable|in:asc,desc',
        ]);

        try {
            $user = auth()->user();

            // Build query - load the correct relationships
            $query = Quote::where('client_id', $user->id)
                ->with(['service.category', 'provider']); // Load service with category and provider as User

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }

            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Provider name filter
            if ($request->provider) {
                $query->whereHas('provider', function($q) use ($request) {
                    $q->where('first_name', 'like', '%' . $request->provider . '%')
                      ->orWhere('last_name', 'like', '%' . $request->provider . '%')
                      ->orWhere('business_name', 'like', '%' . $request->provider . '%')
                      ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $request->provider . '%']);
                });
            }

            // Service category filter
            if ($request->service_category && $request->service_category !== 'all') {
                $query->whereHas('service.category', function($q) use ($request) {
                    $q->where('slug', $request->service_category)
                      ->orWhere('name', 'like', '%' . $request->service_category . '%');
                });
            }

            // Price range filters
            if ($request->price_min) {
                $query->where('quoted_price', '>=', $request->price_min);
            }

            if ($request->price_max) {
                $query->where('quoted_price', '<=', $request->price_max);
            }

            // Sorting
            $sortField = $request->get('sort_field', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            
            // Handle special sort fields
            if ($sortField === 'provider_name') {
                $query->leftJoin('users as providers', 'quotes.provider_id', '=', 'providers.id')
                      ->orderByRaw("COALESCE(providers.business_name, CONCAT(providers.first_name, ' ', providers.last_name)) {$sortDirection}")
                      ->select('quotes.*'); // Make sure we only select quote columns
            } elseif ($sortField === 'service_title') {
                $query->leftJoin('services', 'quotes.service_id', '=', 'services.id')
                      ->orderBy('services.title', $sortDirection)
                      ->select('quotes.*');
            } else {
                $query->orderBy($sortField, $sortDirection);
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

            // Handle pagination
            if ($request->per_page) {
                $quotes = $query->paginate($request->per_page);
                $quotesData = $quotes->items();
                $meta = [
                    'current_page' => $quotes->currentPage(),
                    'last_page' => $quotes->lastPage(),
                    'per_page' => $quotes->perPage(),
                    'total' => $quotes->total(),
                ];
            } else {
                $quotesData = $query->get();
                $meta = null;
            }

            // Log::info("Found {$quotesData->count()} quotes for user {$user->id}");

            // Transform the data to match frontend expectations
            $transformedQuotes = collect($quotesData)->map(function ($quote) {
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
                    'service_category' => $quote->service && $quote->service->category ? [
                        'id' => $quote->service->category->id,
                        'name' => $quote->service->category->name,
                        'color' => $quote->service->category->color ?? 'primary',
                        'icon' => $quote->service->category->icon ?? 'fas fa-cog',
                    ] : [
                        'name' => 'Service',
                        'color' => 'primary',
                        'icon' => 'fas fa-cog'
                    ],

                    // Provider information - handle missing provider_profile
                    'provider_id' => $quote->provider_id,
                    // 'provider_name' => $quote->provider ?
                    //     trim($quote->provider->first_name . ' ' . $quote->provider->last_name) :
                    //     'Unknown Provider',
                    'provider_name' => $quote->provider ?
                        ($quote->provider->full_name ?? 'Unknown Provider') :
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

            $response = [
                'success' => true,
                'data' => $transformedQuotes,
                'message' => 'Quotes retrieved successfully'
            ];

            // Add pagination meta if applicable
            if ($meta) {
                $response['meta'] = $meta;
            } else {
                $response['total'] = $transformedQuotes->count();
            }

            return response()->json($response);
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

    // public function show(Request $request, Quote $quote)
    // {
    //     try {
    //         // Ensure user can only view their own quotes
    //         if ($quote->client_id !== auth()->id()) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Quote not found'
    //             ], 404);
    //         }

    //         // Load relationships - be careful with provider_profile
    //         $quote->load(['service', 'provider', 'client', 'providerUser, appointment']);

    //         // Get provider profile safely
    //         $providerProfile = null;
    //         if ($quote->provider) {
    //             try {
    //                 $providerProfile = $quote->provider->provider_profile ?? null;
    //             } catch (\Exception $e) {
    //                 $providerProfile = null;
    //             }
    //         }

    //         // Transform single quote data
    //         $transformedQuote = [
    //             'id' => $quote->id,
    //             'quote_number' => $quote->quote_number,
    //             'status' => $quote->status,

    //             // 'service_id' => $quote->service_id,
    //             // 'provider_id' => $quote->provider_id,

    //             // Service information with real data
    //             'service_id' => $quote->service_id,
    //             'service_title' => $quote->service->title ?? 'Unknown Service',
    //             'service_description' => $quote->service->description ?? '',
    //             'service_image' => $quote->service->first_image_url ?? null,

    //             // // Service information
    //             // 'service_title' => $quote->service->title ?? $quote->title ?? 'Unknown Service',
    //             // 'service_description' => $quote->service->description ?? $quote->description ?? '',
    //             // 'service_image' => $quote->service->first_image_url ?? null,

    //             // Real category data
    //             'service_category' => $quote->service->category ? [
    //                 'id' => $quote->service->category->id,
    //                 'name' => $quote->service->category->name,
    //                 'color' => $quote->service->category->color ?? 'primary',
    //                 'icon' => $quote->service->category->icon ?? 'fas fa-cog',
    //             ] : [
    //                 'name' => 'Service',
    //                 'color' => 'primary',
    //                 'icon' => 'fas fa-cog'
    //             ],

    //             // Provider information
    //             // 'provider_id' => $quote->provider_id,
    //             // // 'provider_name' => $quote->provider ?
    //             // //     trim($quote->provider->first_name . ' ' . $quote->provider->last_name) :
    //             // //     'Unknown Provider',
    //             // 'provider_name' => $quote->provider ?
    //             //     ($quote->provider->name ?? 'Unknown Provider') :
    //             //     'Unknown Provider',
    //             // 'provider_image' => $quote->provider->profile_picture ?? null,

    //             // Provider information with real data
    //             'provider_id' => $quote->provider_id,
    //             'provider_name' => $quote->provider->name ?? 'Unknown Provider',
    //             'provider_image' => $quote->provider->profile_picture ?? null,

    //             // 'provider_rating' => $providerProfile->average_rating ?? 0,
    //             // 'provider_reviews' => $providerProfile->total_reviews ?? 0,
    //             // Real provider profile data
    //             'provider_business_name' => $quote->provider->provider_profile->business_name ?? $quote->provider->name ?? 'Unknown Provider',
    //             'provider_rating' => $quote->provider->provider_profile->average_rating ?? 0,
    //             'provider_reviews' => $quote->provider->provider_profile->total_reviews ?? 0,
    //             'provider_bio' => $quote->provider->provider_profile->bio ?? 'Professional service provider',
    //             'provider_verified' => $quote->provider->provider_profile->is_verified ?? false,


    //             // Request data
    //             'message' => $quote->client_requirements ?? '',
    //             'requested_date' => $quote->requested_date,
    //             'requested_time' => $quote->requested_time,
    //             'location_summary' => $quote->location_summary,
    //             'special_requirements' => $quote->special_requirements,
    //             'urgency' => $quote->urgency,

    //             // Quote response data
    //             'quoted_price' => $quote->quoted_price,
    //             'travel_fee' => $quote->travel_fee ?? 0,
    //             'estimated_duration' => $quote->duration_hours,
    //             'provider_response' => $quote->quote_details,
    //             'quote_notes' => $quote->provider_notes,
    //             'validity_days' => $quote->valid_until ?
    //                 now()->diffInDays($quote->valid_until) : null,

    //             // Status helpers
    //             'time_remaining' => $quote->time_remaining,
    //             'can_be_accepted' => $quote->canBeAccepted(),
    //             'can_be_rejected' => $quote->canBeRejected(),

    //             // Timestamps
    //             'created_at' => $quote->created_at,
    //             'updated_at' => $quote->updated_at,
    //             'quoted_at' => $quote->responded_at,
    //             'expires_at' => $quote->valid_until,
    //             'accepted_at' => $quote->client_responded_at && $quote->status === 'accepted' ? $quote->client_responded_at : null,
    //             'declined_at' => $quote->client_responded_at && $quote->status === 'rejected' ? $quote->client_responded_at : null,
    //         ];

    //         return response()->json([
    //             'success' => true,
    //             'data' => $transformedQuote,
    //             'message' => 'Quote details retrieved successfully'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching quote details: ' . $e->getMessage());
    //         Log::error('Stack trace: ' . $e->getTraceAsString());

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch quote details',
    //             'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
    //         ], 500);
    //     }
    // }

    // public function show(Request $request, Quote $quote)
    // {
    //     try {
    //         // Ensure user can only view their own quotes
    //         if ($quote->client_id !== auth()->id()) {
    //             return response()->json([
    //                 'success' => false,
    //                 'message' => 'Quote not found'
    //             ], 404);
    //         }

    //         // Load relationships carefully to avoid 500 errors
    //         $quote->load([
    //             'service.category',
    //             'provider', // This is the User model
    //             'providerProfile' // This is the ProviderProfile model
    //         ]);

    //         // Get provider profile safely
    //         $providerProfile = null;
    //         $providerUser = $quote->provider;

    //         if ($providerUser) {
    //             try {
    //                 $providerProfile = $providerUser->provider_profile;
    //             } catch (\Exception $e) {
    //                 Log::warning('Provider profile not found for user: ' . $providerUser->id);
    //             }
    //         }

    //         // Transform single quote data with safe data access
    //         $transformedQuote = [
    //             'id' => $quote->id,
    //             'quote_number' => $quote->quote_number,
    //             'status' => $quote->status,

    //             // Service information with real data
    //             'service_id' => $quote->service_id,
    //             'service_title' => $quote->service->title ?? 'Unknown Service',
    //             'service_description' => $quote->service->description ?? '',
    //             'service_image' => $quote->service->first_image_url ?? null,

    //             // Real category data (safely accessed)
    //             'service_category' => $quote->service && $quote->service->category ? [
    //                 'id' => $quote->service->category->id,
    //                 'name' => $quote->service->category->name,
    //                 'color' => $quote->service->category->color ?? 'primary',
    //                 'icon' => $quote->service->category->icon ?? 'fas fa-cog',
    //             ] : [
    //                 'name' => 'Service',
    //                 'color' => 'primary',
    //                 'icon' => 'fas fa-cog'
    //             ],

    //             // Provider information with real data
    //             'provider_id' => $quote->provider_id,
    //             'provider_name' => $providerUser->name ?? 'Unknown Provider',
    //             'provider_image' => $providerUser->profile_picture ?? null,

    //             // Real provider profile data (safely accessed)
    //             'provider_business_name' => $providerProfile->business_name ?? ($providerUser->name ?? 'Unknown Provider'),
    //             'provider_rating' => $providerProfile->average_rating ?? 0,
    //             'provider_reviews' => $providerProfile->total_reviews ?? 0,
    //             'provider_bio' => $providerProfile->bio ?? 'Professional service provider',
    //             'provider_verified' => $providerProfile->is_verified ?? false,

    //             // Request data from accessors
    //             'message' => $quote->client_requirements ?? '',
    //             'requested_date' => $quote->requested_date,
    //             'requested_time' => $quote->requested_time,
    //             'location_summary' => $quote->location_summary,
    //             'special_requirements' => $quote->special_requirements,
    //             'urgency' => $quote->urgency,

    //             // Quote response data
    //             'quoted_price' => $quote->quoted_price,
    //             'travel_fee' => $quote->travel_fee ?? 0,
    //             'estimated_duration' => $quote->duration_hours,
    //             'provider_response' => $quote->quote_details,
    //             'quote_notes' => $quote->provider_notes,
    //             'validity_days' => $quote->valid_until ? now()->diffInDays($quote->valid_until) : null,

    //             // Status helpers
    //             'time_remaining' => $quote->time_remaining,
    //             'can_be_accepted' => $quote->canBeAccepted(),
    //             'can_be_rejected' => $quote->canBeRejected(),

    //             // Timestamps
    //             'created_at' => $quote->created_at,
    //             'updated_at' => $quote->updated_at,
    //             'quoted_at' => $quote->responded_at,
    //             'expires_at' => $quote->valid_until,
    //             'accepted_at' => $quote->client_responded_at && $quote->status === 'accepted' ? $quote->client_responded_at : null,
    //             'declined_at' => $quote->client_responded_at && $quote->status === 'rejected' ? $quote->client_responded_at : null,
    //         ];

    //         return response()->json([
    //             'success' => true,
    //             'data' => $transformedQuote,
    //             'message' => 'Quote details retrieved successfully'
    //         ]);
    //     } catch (\Exception $e) {
    //         Log::error('Error fetching quote details: ' . $e->getMessage());
    //         Log::error('Stack trace: ' . $e->getTraceAsString());

    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch quote details',
    //             'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
    //         ], 500);
    //     }
    // }

    public function show(Request $request, Quote $quote)
    {
        try {
            // Log::info('Loading quote: ' . $quote->id);

            if ($quote->client_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }

            // Log::info('Loading relationships');
            // Load relationships step by step to see which one fails
            $quote->load([
                'service.category',
                'provider' // This is the User model
            ]);

            // Log::info('All relationships loaded successfully');

            // Get provider profile safely
            $providerProfile = null;
            $providerUser = $quote->provider;

            if ($providerUser) {
                try {
                    $providerProfile = $providerUser->provider_profile;
                    // Log::info('Provider profile loaded: ' . ($providerProfile ? 'Yes' : 'No'));
                } catch (\Exception $e) {
                    Log::warning('Provider profile not found for user: ' . $providerUser->id);
                }
            }

            // Transform single quote data with safe data access
            $transformedQuote = [
                'id' => $quote->id,
                'quote_number' => $quote->quote_number,
                'status' => $quote->status,

                // Service information with real data
                'service_id' => $quote->service_id,
                'service_title' => $quote->service->title ?? 'Unknown Service',
                'service_description' => $quote->service->description ?? '',
                'service_image' => $quote->service->first_image_url ?? null,

                // Real category data (safely accessed)
                'service_category' => $quote->service && $quote->service->category ? [
                    'id' => $quote->service->category->id,
                    'name' => $quote->service->category->name,
                    'color' => $quote->service->category->color ?? 'primary',
                    'icon' => $quote->service->category->icon ?? 'fas fa-cog',
                ] : [
                    'name' => 'Service',
                    'color' => 'primary',
                    'icon' => 'fas fa-cog'
                ],

                // Provider information with real data
                'provider_id' => $quote->provider_id,
                'provider_name' => $providerUser->full_name ?? 'Unknown Provider',
                'provider_image' => $providerUser->profile_picture ?? null,

                // Real provider profile data (safely accessed)
                'provider_business_name' => $providerProfile->business_name ?? ($providerUser->full_name ?? 'Unknown Provider'),
                'provider_rating' => $providerProfile->average_rating ?? 0,
                'provider_reviews' => $providerProfile->total_reviews ?? 0,
                'provider_bio' => $providerProfile->bio ?? 'Professional service provider',
                'provider_verified' => $providerProfile->is_verified ?? false,

                // Request data from accessors
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
                'validity_days' => $quote->valid_until ? now()->diffInDays($quote->valid_until) : null,

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

            // Log::info('Quote data transformed successfully');

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
     * Update quote and optionally create appointment using existing booking system
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

                // Create appointment using existing booking system if requested
                if ($request->input('create_appointment', false)) {
                    $appointmentDetails = $request->input('appointment_details');

                    // Get quote request data for additional details
                    $quoteRequestData = $quote->quote_request_data ?? [];

                    // Prepare booking data in the same format as direct booking
                    $bookingData = [
                        // Basic appointment info
                        'service_id' => $appointmentDetails['service_id'],
                        'provider_id' => $appointmentDetails['provider_id'],
                        'appointment_date' => $appointmentDetails['date'],
                        'appointment_time' => $appointmentDetails['time'],
                        'duration_hours' => $appointmentDetails['duration'],

                        // Pricing from quote
                        'total_price' => $quote->quoted_price + ($quote->travel_fee ?? 0),
                        'base_price' => $quote->quoted_price,
                        'travel_fee' => $quote->travel_fee ?? 0,

                        // Location from quote request
                        'location_type' => $quoteRequestData['location_type'] ?? 'client_address',
                        'client_address' => $quoteRequestData['address'] ?? '',
                        'client_city' => $quoteRequestData['city'] ?? '',
                        'client_postal_code' => $quoteRequestData['postal_code'] ?? '',
                        'location_instructions' => $quoteRequestData['location_instructions'] ?? '',

                        // Contact info from quote request
                        'client_phone' => $quoteRequestData['phone'] ?? '',
                        'client_email' => $quoteRequestData['email'] ?? '',
                        'contact_preference' => $quoteRequestData['contact_preference'] ?? 'phone',
                        'emergency_contact' => $quoteRequestData['emergency_contact'] ?? '',

                        // Notes and instructions
                        'client_notes' => $request->input('notes', '') . "\n\nFrom Quote #" . $quote->quote_number,
                        'special_instructions' => $quote->client_requirements ?? '',

                        // Quote reference
                        'quote_id' => $quote->id,
                        'booking_source' => 'quote_acceptance',
                        'payment_method' => 'cash', // Default, can be changed
                        'status' => 'pending', // Use your model's default status

                        // Additional services if any
                        'additional_services' => [],

                        // System fields
                        'booking_type' => 'quote_acceptance',
                        'agreed_to_terms' => true, // Assumed since they're accepting quote
                        'timezone' => $request->header('timezone', 'Asia/Colombo'),
                        'user_agent' => $request->header('User-Agent', ''),
                    ];

                    // Use the existing AppointmentService to create the appointment
                    $appointmentService = app(\App\Services\AppointmentService::class);
                    $user = auth()->user();

                    $bookingResult = $appointmentService->createBooking($user, $bookingData);

                    if ($bookingResult['type'] === 'appointment') {
                        $appointment = $bookingResult['data'];

                        // Update quote with appointment reference
                        $quote->update(['appointment_id' => $appointment->id]);
                    } else {
                        throw new \Exception('Failed to create appointment from quote');
                    }
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

    // In App/Http/Controllers/API/Client/QuoteController.php - Add this method:

    /**
     * Create appointment from accepted quote (separate from quote acceptance)
     */
    public function createAppointmentFromQuote(Request $request, Quote $quote)
    {
        try {
            // Validation
            if ($quote->client_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote not found'
                ], 404);
            }

            if ($quote->status !== 'quoted') {
                return response()->json([
                    'success' => false,
                    'message' => 'Quote must be in quoted status to create appointment'
                ], 422);
            }

            // Validate appointment data
            $validatedData = $request->validate([
                'appointment_date' => 'required|date|after_or_equal:today',
                'appointment_time' => 'required|string',
                'duration_hours' => 'required|numeric|min:1|max:24',
                'client_phone' => 'nullable|string|max:20',
                'client_email' => 'nullable|email',
                'client_address' => 'nullable|string|max:255',
                'client_city' => 'nullable|string|max:255',
                'client_postal_code' => 'nullable|string|max:20',
                'location_instructions' => 'nullable|string',
                'client_notes' => 'nullable|string',
                'contact_preference' => 'nullable|in:phone,email,whatsapp',
                'emergency_contact' => 'nullable|string|max:20',
                'payment_method' => 'required|in:cash,card,bank_transfer',
                'agreed_to_terms' => 'required|boolean|accepted',
                'location_type' => 'nullable|in:client_address,provider_location,custom_location',
            ]);

            // Ensure contact method
            if (empty($validatedData['client_phone']) && empty($validatedData['client_email'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Either phone number or email is required',
                    'errors' => ['contact' => ['Contact information is required']]
                ], 422);
            }

            // Check availability
            $availabilityCheck = $this->checkProviderAvailability(
                $quote->provider_id,
                $validatedData['appointment_date'],
                $validatedData['appointment_time'],
                $validatedData['duration_hours']
            );

            if (!$availabilityCheck['available']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Selected time slot is no longer available',
                    'availability_info' => $availabilityCheck
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Get quote request data for defaults
                $quoteRequestData = $quote->quote_request_data ?? [];

                // Create appointment using similar structure to BookingController
                $appointment = Appointment::create([
                    'client_id' => auth()->id(),
                    'provider_id' => $quote->provider_id,
                    'service_id' => $quote->service_id,
                    'appointment_date' => $validatedData['appointment_date'],
                    'appointment_time' => $validatedData['appointment_time'],
                    'duration_hours' => $validatedData['duration_hours'],

                    // Pricing from quote
                    'total_price' => ($quote->quoted_price ?? 0) + ($quote->travel_fee ?? 0),
                    'base_price' => $quote->quoted_price ?? 0,
                    'travel_fee' => $quote->travel_fee ?? 0,

                    // Location data
                    'location_type' => $validatedData['location_type'] ?? 'client_address',
                    'client_address' => $validatedData['client_address'] ?? $quoteRequestData['address'] ?? '',
                    'client_city' => $validatedData['client_city'] ?? $quoteRequestData['city'] ?? '',
                    'client_postal_code' => $validatedData['client_postal_code'] ?? $quoteRequestData['postal_code'] ?? '',
                    'location_instructions' => $validatedData['location_instructions'] ?? $quoteRequestData['location_instructions'] ?? '',

                    // Contact info
                    'client_phone' => $validatedData['client_phone'] ?? $quoteRequestData['phone'] ?? '',
                    'client_email' => $validatedData['client_email'] ?? $quoteRequestData['email'] ?? '',
                    'contact_preference' => $validatedData['contact_preference'] ?? $quoteRequestData['contact_preference'] ?? 'phone',
                    'emergency_contact' => $validatedData['emergency_contact'] ?? $quoteRequestData['emergency_contact'] ?? '',

                    // Notes and metadata
                    'client_notes' => ($validatedData['client_notes'] ?? '') . "\n\nFrom Quote #" . $quote->quote_number,
                    'special_instructions' => $quote->client_requirements ?? '',
                    'payment_method' => $validatedData['payment_method'],

                    // Status and tracking
                    'status' => 'pending',
                    'booking_source' => 'quote_acceptance',
                    'quote_id' => $quote->id,

                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Accept the quote
                $quote->update([
                    'status' => 'accepted',
                    'client_responded_at' => now(),
                    'client_response_notes' => $request->input('notes', 'Quote accepted via appointment booking'),
                    'appointment_id' => $appointment->id,
                ]);

                // Load relationships for response
                $appointment->load(['service', 'provider', 'client']);

                DB::commit();

                // Log::info('Appointment created from quote', [
                //     'appointment_id' => $appointment->id,
                //     'quote_id' => $quote->id,
                //     'client_id' => auth()->id()
                // ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Quote accepted and appointment created successfully!',
                    'data' => [
                        'appointment' => [
                            'id' => $appointment->id,
                            'confirmation_code' => $appointment->confirmation_code,
                            'status' => $appointment->status,
                            'appointment_date' => $appointment->appointment_date,
                            'appointment_time' => $appointment->appointment_time,
                            'total_price' => $appointment->total_price,
                            'service' => [
                                'id' => $appointment->service->id,
                                'title' => $appointment->service->title,
                            ],
                            'provider' => [
                                'id' => $appointment->provider->id,
                                'name' => $appointment->provider->full_name ?? 'Provider',
                            ],
                        ],
                        'quote' => $quote->fresh(),
                    ],
                ], 201);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error creating appointment from quote: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'success' => false,
                'message' => 'Failed to create appointment from quote',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
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
