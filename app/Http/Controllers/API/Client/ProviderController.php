<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    /**
     * Browse all providers with location filtering
     */
    public function index(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'category_id' => 'nullable|exists:service_categories,id',
            'min_rating' => 'nullable|numeric|between:1,5',
            'verified_only' => 'nullable|boolean',
            'sort_by' => 'nullable|in:distance,rating,experience,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = User::with(['providerProfile', 'services.category'])
            ->where('role', 'service_provider')
            ->where('is_active', true)
            ->whereHas('providerProfile', function ($profileQuery) use ($request) {
                if ($request->verified_only) {
                    $profileQuery->where('verification_status', 'verified');
                }
                if ($request->min_rating) {
                    $profileQuery->where('average_rating', '>=', $request->min_rating);
                }
            });

        // Category filter through services
        if ($request->category_id) {
            $query->whereHas('services', function ($serviceQuery) use ($request) {
                $serviceQuery->where('category_id', $request->category_id)
                    ->where('is_active', true);
            });
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius ?? 15;

            // Filter providers who have services serving the location
            $query->whereHas('services', function ($serviceQuery) use ($lat, $lng) {
                $serviceQuery->where('is_active', true)
                    ->servingLocation($lat, $lng);
            });
        }

        // Sorting
        switch ($request->sort_by) {
            case 'rating':
                $query->join('provider_profiles', 'users.id', '=', 'provider_profiles.user_id')
                    ->orderByDesc('provider_profiles.average_rating');
                break;
            case 'experience':
                $query->join('provider_profiles', 'users.id', '=', 'provider_profiles.user_id')
                    ->orderByDesc('provider_profiles.years_of_experience');
                break;
            case 'recent':
                $query->orderByDesc('users.created_at');
                break;
            case 'distance':
            default:
                $query->orderByDesc('users.created_at');
        }

        $perPage = $request->get('per_page', 12);
        $providers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $providers->through(function ($provider) use ($request) {
                return $this->formatProviderForClient($provider, $request);
            }),
            'meta' => [
                'total' => $providers->total(),
                'per_page' => $providers->perPage(),
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
            ]
        ]);
    }

    /**
     * Search providers
     */
    public function search(Request $request)
    {
        $request->validate([
            'search' => 'required|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $searchTerm = $request->search;

        $query = User::with(['providerProfile', 'services.category'])
            ->where('role', 'service_provider')
            ->where('is_active', true)
            ->where(function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhereHas('providerProfile', function ($profileQuery) use ($searchTerm) {
                        $profileQuery->where('business_name', 'like', "%{$searchTerm}%")
                            ->orWhere('bio', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('services', function ($serviceQuery) use ($searchTerm) {
                        $serviceQuery->where('title', 'like', "%{$searchTerm}%")
                            ->orWhere('description', 'like', "%{$searchTerm}%");
                    });
            });

        // Location filtering
        if ($request->latitude && $request->longitude) {
            $query->whereHas('services', function ($serviceQuery) use ($request) {
                $serviceQuery->where('is_active', true)
                    ->servingLocation($request->latitude, $request->longitude);
            });
        }

        $perPage = $request->get('per_page', 12);
        $providers = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $providers->through(function ($provider) use ($request) {
                return $this->formatProviderForClient($provider, $request);
            }),
            'meta' => [
                'total' => $providers->total(),
                'per_page' => $providers->perPage(),
                'current_page' => $providers->currentPage(),
                'last_page' => $providers->lastPage(),
            ]
        ]);
    }

    /**
     * Get provider details
     */
    public function show(User $provider)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $provider->load([
            'providerProfile',
            'services' => function ($query) {
                $query->where('is_active', true)->with('category');
            },
            'providerAppointments' => function ($query) {
                $query->completed()
                    ->whereNotNull('provider_rating')
                    ->with('client:id,first_name,last_name', 'service:id,title')
                    ->latest()
                    ->limit(10);
            }
        ]);

        return response()->json([
            'success' => true,
            'data' => $this->formatProviderDetailForClient($provider)
        ]);
    }

    /**
     * Get provider's services
     */
    public function getServices(User $provider, Request $request)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = $provider->services()
            ->with(['category'])
            ->where('is_active', true);

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $query->servingLocation($request->latitude, $request->longitude);
        }

        $perPage = $request->get('per_page', 12);
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $services->through(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'description' => \Str::limit($service->description, 150),
                    'category' => [
                        'id' => $service->category->id,
                        'name' => $service->category->name,
                        'icon' => $service->category->icon,
                        'color' => $service->category->color,
                    ],
                    'pricing_type' => $service->pricing_type,
                    'base_price' => $service->base_price,
                    'formatted_price' => $service->formatted_price,
                    'duration_hours' => $service->duration_hours,
                    'average_rating' => $service->average_rating,
                    'first_image_url' => $service->first_image_url,
                    'distance' => isset($service->distance) ? round($service->distance, 2) : null,
                ];
            }),
            'meta' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
            ]
        ]);
    }

    /**
     * Get provider availability
     */
    public function getAvailability(User $provider, Request $request)
    {
        if ($provider->role !== 'service_provider') {
            return response()->json([
                'success' => false,
                'message' => 'Provider not found'
            ], 404);
        }

        $request->validate([
            'date' => 'nullable|date|after_or_equal:today',
            'service_duration' => 'nullable|numeric|min:0.5|max:8',
        ]);

        try {
            $availabilityService = app(\App\Services\AvailabilityService::class);

            if ($request->date) {
                // Get available slots for specific date
                $serviceDuration = $request->service_duration ?? 1;
                $slots = $availabilityService->getAvailableSlots(
                    $provider,
                    $request->date,
                    $serviceDuration
                );

                return response()->json([
                    'success' => true,
                    'data' => [
                        'date' => $request->date,
                        'available_slots' => $slots,
                        'total_slots' => count($slots),
                    ]
                ]);
            } else {
                // Get general availability summary
                $summary = $availabilityService->getAvailabilitySummary($provider);

                return response()->json([
                    'success' => true,
                    'data' => $summary
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format provider for client listing
     */
    private function formatProviderForClient($provider, $request = null)
    {
        $profile = $provider->providerProfile;
        $activeServices = $provider->services->where('is_active', true);

        return [
            'id' => $provider->id,
            'name' => $provider->full_name,
            'business_name' => $profile?->business_name,
            'bio' => \Str::limit($profile?->bio, 150),
            'average_rating' => $profile?->average_rating ?? 0,
            'total_reviews' => $profile?->total_reviews ?? 0,
            'years_of_experience' => $profile?->years_of_experience,
            'verified' => $profile?->isVerified() ?? false,
            'verification_status' => $profile?->verification_status,
            'is_available' => $profile?->is_available ?? true,
            'profile_picture' => $provider->profile_picture
                ? \Storage::url($provider->profile_picture)
                : null,
            'services_count' => $activeServices->count(),
            'categories' => $activeServices->pluck('category.name')->unique()->values(),
            'price_range' => [
                'min' => $activeServices->min('base_price') ?? 0,
                'max' => $activeServices->max('base_price') ?? 0,
            ],
            'created_at' => $provider->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format provider detail for client
     */
    private function formatProviderDetailForClient($provider)
    {
        $profile = $provider->providerProfile;
        $activeServices = $provider->services->where('is_active', true);

        return [
            'id' => $provider->id,
            'name' => $provider->full_name,
            'email' => $provider->email,
            'contact_number' => $provider->contact_number,
            'address' => $provider->address,
            'profile_picture' => $provider->profile_picture
                ? \Storage::url($provider->profile_picture)
                : null,
            'business_details' => [
                'business_name' => $profile?->business_name,
                'bio' => $profile?->bio,
                'years_of_experience' => $profile?->years_of_experience,
                'service_area_radius' => $profile?->service_area_radius,
                'verification_status' => $profile?->verification_status,
                'verified' => $profile?->isVerified() ?? false,
                'verified_at' => $profile?->verified_at?->format('Y-m-d H:i:s'),
                'is_available' => $profile?->is_available ?? true,
            ],
            'ratings' => [
                'average_rating' => $profile?->average_rating ?? 0,
                'total_reviews' => $profile?->total_reviews ?? 0,
                'rating_breakdown' => $this->getRatingBreakdown($provider),
            ],
            'services' => $activeServices->map(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'category' => $service->category->name,
                    'pricing_type' => $service->pricing_type,
                    'base_price' => $service->base_price,
                    'formatted_price' => $service->formatted_price,
                    'average_rating' => $service->average_rating,
                    'first_image_url' => $service->first_image_url,
                ];
            }),
            'recent_reviews' => $provider->providerAppointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'rating' => $appointment->provider_rating,
                    'review' => $appointment->provider_review,
                    'service_title' => $appointment->service->title,
                    'client_name' => $appointment->client->first_name . ' ' . substr($appointment->client->last_name, 0, 1) . '.',
                    'completed_at' => $appointment->completed_at?->format('M j, Y'),
                ];
            }),
            'statistics' => [
                'total_services' => $activeServices->count(),
                'total_bookings' => $provider->providerAppointments()->count(),
                'completed_bookings' => $provider->providerAppointments()->where('status', 'completed')->count(),
                'completion_rate' => $this->calculateProviderCompletionRate($provider),
                'average_response_time' => $this->calculateProviderResponseTime($provider),
                'categories_served' => $activeServices->pluck('category.name')->unique()->values(),
                'member_since' => $provider->created_at->format('M Y'),
            ],
            'portfolio' => [
                'certification_urls' => $profile?->certification_urls ?? [],
                'portfolio_image_urls' => $profile?->portfolio_image_urls ?? [],
            ],
            'created_at' => $provider->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get rating breakdown for provider
     */
    private function getRatingBreakdown($provider)
    {
        $appointments = $provider->providerAppointments()
            ->whereNotNull('provider_rating')
            ->get();

        if ($appointments->isEmpty()) {
            return [
                '5' => 0,
                '4' => 0,
                '3' => 0,
                '2' => 0,
                '1' => 0
            ];
        }

        $breakdown = $appointments->groupBy('provider_rating')
            ->map(function ($group) {
                return $group->count();
            });

        // Fill missing ratings with 0
        for ($i = 1; $i <= 5; $i++) {
            if (!isset($breakdown[$i])) {
                $breakdown[$i] = 0;
            }
        }

        return $breakdown->sortKeysDesc();
    }

    /**
     * Calculate provider completion rate
     */
    private function calculateProviderCompletionRate($provider)
    {
        $totalAppointments = $provider->providerAppointments()->count();
        if ($totalAppointments === 0) return 0;

        $completedAppointments = $provider->providerAppointments()
            ->where('status', 'completed')
            ->count();

        return round(($completedAppointments / $totalAppointments) * 100, 1);
    }

    /**
     * Calculate provider average response time
     */
    private function calculateProviderResponseTime($provider)
    {
        $appointments = $provider->providerAppointments()
            ->whereNotNull('confirmed_at')
            ->whereColumn('confirmed_at', '>', 'created_at')
            ->get();

        if ($appointments->isEmpty()) return null;

        $totalMinutes = $appointments->sum(function ($appointment) {
            return $appointment->created_at->diffInMinutes($appointment->confirmed_at);
        });

        $averageMinutes = $totalMinutes / $appointments->count();

        if ($averageMinutes < 60) {
            return round($averageMinutes) . ' minutes';
        } else {
            return round($averageMinutes / 60, 1) . ' hours';
        }
    }
}
