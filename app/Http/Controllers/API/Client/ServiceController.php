<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceSearch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;

class ServiceController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Service Browsing Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Browse all services with optional location filtering
     */
    public function index(Request $request)
    {
        $request->validate([
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'sort_by' => 'nullable|in:distance,price,rating,popularity,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->where('is_active', true);

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $radius = $request->radius ?? 15;
            $query->servingLocation($request->latitude, $request->longitude);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'distance':
                // Already sorted by distance if location provided
                break;
            case 'price':
                $query->orderBy('base_price');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'popularity':
                $query->orderByDesc('views_count')->orderByDesc('bookings_count');
                break;
            case 'recent':
                $query->orderByDesc('created_at');
                break;
            default:
                $query->orderByDesc('created_at');
        }

        $perPage = $request->get('per_page', 12);
        $services = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => collect($services->items())->map(function ($service) {
                return $this->formatServiceForClient($service);
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
     * Get service details with provider information
     */
    public function show(Service $service)
    {
        try {
            // Increment view count
            $service->incrementViews();

            // Load related data
            $service->load([
                'category',
                'provider.providerProfile',
                'appointments' => function ($query) {
                    $query->completed()
                        ->whereNotNull('provider_rating')
                        ->with('client:id,first_name,last_name')
                        ->latest()
                        ->limit(5);
                }
            ]);

            // Format service data
            $serviceData = [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'base_price' => $service->base_price,
                'formatted_price' => $service->formatted_price,
                'pricing_type' => $service->pricing_type,
                'duration_hours' => $service->duration_hours,
                'service_image_urls' => $service->service_image_urls,
                'first_image_url' => $service->first_image_url,
                'average_rating' => $service->average_rating,
                'reviews_count' => $service->appointments()->completed()->whereNotNull('provider_rating')->count(),
                'includes' => $service->includes,
                'requirements' => $service->requirements,
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'icon' => $service->category->icon,
                    'color' => $service->category->color,
                ],
                'location' => $service->location,
                'distance' => $service->distance ?? null,
            ];

            // Format provider data
            $provider = $service->provider;
            $providerProfile = $provider->providerProfile;

            $providerData = [
                'id' => $provider->id,
                'first_name' => $provider->first_name,
                'last_name' => $provider->last_name,
                'business_name' => $providerProfile->business_name ?? null,
                'profile_image_url' => $provider->profile_picture ? Storage::url($provider->profile_picture) : null,
                'bio' => $providerProfile->bio ?? null,
                'is_verified' => $providerProfile->isVerified() ?? false,
                'city' => $provider->address ?? null,
                'province' => 'Western Province',
                'service_radius' => $providerProfile->service_area_radius ?? 25,
                'travel_fee' => 0,
                'average_rating' => $providerProfile->average_rating ?? 0,
                'reviews_count' => $providerProfile->total_reviews ?? 0,
                'years_experience' => $providerProfile->years_of_experience ?? 0,
                'response_time' => '2 hours',
                'total_services' => $provider->services()->where('is_active', true)->count(),
                'completed_bookings' => $provider->providerAppointments()->where('status', 'completed')->count(),
                'other_services' => $provider->services()
                    ->where('is_active', true)
                    ->where('id', '!=', $service->id)
                    ->with('category')
                    ->limit(3)
                    ->get()
                    ->map(function ($otherService) {
                        return [
                            'id' => $otherService->id,
                            'title' => $otherService->title,
                            'formatted_price' => $otherService->formatted_price,
                            'category' => [
                                'name' => $otherService->category->name
                            ]
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'data' => $serviceData,
                'provider' => $providerData,
                'is_favorite' => false,
                'message' => 'Service details retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve service details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular services with caching
     */
    public function getPopularServices(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:20'
        ]);

        // Create cache key
        $lat = $request->latitude ? round($request->latitude, 2) : null;
        $lng = $request->longitude ? round($request->longitude, 2) : null;
        $radius = $request->radius ?? 20;
        $limit = $request->limit ?? 10;

        $cacheKey = "popular_services_" . md5($lat . '_' . $lng . '_' . $radius . '_' . $limit);

        // Cache for 5 minutes
        $services = Cache::remember($cacheKey, 300, function () use ($request) {
            $query = Service::with(['category', 'provider.providerProfile'])
                ->popular($request->get('limit', 10));

            // Apply location filter if provided
            if ($request->latitude && $request->longitude) {
                $radius = $request->radius ?? 20;
                $query->servingLocation($request->latitude, $request->longitude);
            }

            return $query->get()->map(function ($service) {
                return $this->formatServiceForClient($service);
            });
        });

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * Get recent services with caching
     */
    public function getRecentServices(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'days' => 'nullable|integer|min:1|max:90',
            'limit' => 'nullable|integer|min:1|max:20'
        ]);

        // Create cache key
        $lat = $request->latitude ? round($request->latitude, 2) : null;
        $lng = $request->longitude ? round($request->longitude, 2) : null;
        $radius = $request->radius ?? 15;
        $days = $request->days ?? 30;
        $limit = $request->limit ?? 10;

        $cacheKey = "recent_services_" . md5($lat . '_' . $lng . '_' . $radius . '_' . $days . '_' . $limit);

        // Cache for 5 minutes
        $services = Cache::remember($cacheKey, 300, function () use ($request) {
            $days = $request->get('days', 30);
            $limit = $request->get('limit', 10);

            $query = Service::with(['category', 'provider.providerProfile'])
                ->recent($days)
                ->limit($limit);

            // Apply location filter if provided
            if ($request->latitude && $request->longitude) {
                $radius = $request->radius ?? 15;
                $query->servingLocation($request->latitude, $request->longitude);
            }

            return $query->get()->map(function ($service) {
                return $this->formatServiceForClient($service);
            });
        });

        return response()->json([
            'success' => true,
            'data' => $services
        ]);
    }

    /**
     * Get service categories with caching
     */
    public function getCategories(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
        ]);

        // Create cache key based on location (rounded to reduce cache variations)
        $lat = $request->latitude ? round($request->latitude, 2) : null;
        $lng = $request->longitude ? round($request->longitude, 2) : null;
        $radius = $request->radius ?? 15;

        $cacheKey = "categories_" . md5($lat . '_' . $lng . '_' . $radius);

        // Cache for 10 minutes
        $categories = Cache::remember($cacheKey, 600, function () use ($request) {
            $query = ServiceCategory::with(['activeServices' => function ($serviceQuery) use ($request) {
                if ($request->latitude && $request->longitude) {
                    $radius = $request->radius ?? 15;
                    $serviceQuery->servingLocation($request->latitude, $request->longitude);
                }
            }])
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name');

            return $query->get()->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'color' => $category->color,
                    'service_count' => $category->activeServices->count(),
                    'sort_order' => $category->sort_order,
                ];
            });
        });

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get similar services
     */
    public function getSimilarServices(Service $service, Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:10'
        ]);

        $limit = $request->get('limit', 5);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->where('category_id', $service->category_id)
            ->where('id', '!=', $service->id)
            ->where('is_active', true)
            ->limit($limit);

        // Apply location filter if provided
        if ($request->latitude && $request->longitude) {
            $radius = $request->radius ?? 15;
            $query->servingLocation($request->latitude, $request->longitude);
        } else {
            $query->orderByDesc('average_rating')->orderByDesc('views_count');
        }

        $similarServices = $query->get();

        return response()->json([
            'success' => true,
            'data' => $similarServices->map(function ($service) {
                return $this->formatServiceForClient($service);
            })
        ]);
    }

    /**
     * Check service availability for a specific date/time
     */
    public function checkAvailability(Service $service, Request $request)
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
        ]);

        try {
            $provider = $service->provider;
            $date = $request->date;
            $startTime = $request->start_time;
            $endTime = $request->end_time ?? \Carbon\Carbon::parse($startTime)
                ->addHours($service->duration_hours)
                ->format('H:i');

            // Use existing availability service
            $availabilityService = app(\App\Services\AvailabilityService::class);
            $availability = $availabilityService->isAvailableAt(
                $provider,
                $date,
                $startTime,
                $endTime
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'available' => $availability['available'],
                    'reason' => $availability['reason'] ?? null,
                    'suggested_times' => $availability['suggested_times'] ?? [],
                    'date' => $date,
                    'requested_time' => $startTime . ' - ' . $endTime,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check availability',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Service Search Methods (Merged from SearchController)
    |--------------------------------------------------------------------------
    */

    /**
     * Search services with location-based filtering
     */
    public function searchServices(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'min_rating' => 'nullable|numeric|between:1,5',
            'pricing_type' => 'nullable|in:hourly,fixed,custom',
            'sort_by' => 'nullable|in:distance,price,rating,popularity,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $filters = $request->only([
            'search',
            'category_id',
            'min_price',
            'max_price',
            'min_rating',
            'pricing_type',
            'is_active' => true,
        ]);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->advancedSearch($filters);

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $lat = $request->latitude;
            $lng = $request->longitude;
            $radius = $request->radius ?? 15;

            Log::info('Location-based search:', [
                'lat' => $request->latitude,
                'lng' => $request->longitude,
                'radius' => $radius,
                'results_count' => $query->count()
            ]);

            $query->servingLocation($lat, $lng);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'distance':
                // Already sorted by distance in servingLocation scope
                break;
            case 'price':
                $query->orderBy('base_price');
                break;
            case 'rating':
                $query->orderByDesc('average_rating');
                break;
            case 'popularity':
                $query->orderByDesc('views_count')->orderByDesc('bookings_count');
                break;
            case 'recent':
                $query->orderByDesc('created_at');
                break;
            default:
                if (!($request->latitude && $request->longitude)) {
                    $query->orderByDesc('created_at');
                }
        }

        // Text search
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('description', 'like', "%{$request->search}%");
            });
        }

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $perPage = $request->get('per_page', 12);
        $services = $query->paginate($perPage);

        // Track search for analytics
        if ($request->search || $request->category_id) {
            ServiceSearch::trackSearch(
                $request->search,
                $filters,
                $request->latitude,
                $request->longitude,
                $request->radius,
                $services->total(),
                Auth::id()
            );
        }

        return response()->json([
            'success' => true,
            'data' => $services->through(function ($service) {
                return $this->formatServiceForClient($service);
            }),
            'meta' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'search_info' => [
                    'location_based' => $request->latitude && $request->longitude,
                    'radius' => $request->radius ?? 15,
                    'filters_applied' => count(array_filter($filters))
                ]
            ]
        ]);
    }

    /**
     * Get search suggestions for autocomplete
     */
    public function getSearchSuggestions(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $suggestions = collect();

        // Service title suggestions
        $serviceSuggestions = Service::where('title', 'like', "%{$query}%")
            ->where('is_active', true)
            ->limit(3)
            ->get(['id', 'title'])
            ->map(function ($service) {
                return [
                    'type' => 'service',
                    'id' => $service->id,
                    'text' => $service->title,
                    'category' => 'Services',
                    'icon' => 'fas fa-cogs'
                ];
            });

        // Category suggestions
        $categorySuggestions = ServiceCategory::where('name', 'like', "%{$query}%")
            ->where('is_active', true)
            ->limit(2)
            ->get(['id', 'name', 'icon'])
            ->map(function ($category) {
                return [
                    'type' => 'category',
                    'id' => $category->id,
                    'text' => $category->name,
                    'category' => 'Categories',
                    'icon' => $category->icon ?: 'fas fa-folder'
                ];
            });

        // Provider/Business name suggestions
        $providerSuggestions = User::where('role', 'service_provider')
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$query}%"]);
            })
            ->with('providerProfile')
            ->limit(2)
            ->get()
            ->map(function ($provider) {
                return [
                    'type' => 'provider',
                    'id' => $provider->id,
                    'text' => $provider->full_name,
                    'category' => 'Providers',
                    'icon' => 'fas fa-user'
                ];
            });

        // Business name suggestions
        $businessSuggestions = ProviderProfile::where('business_name', 'like', "%{$query}%")
            ->whereNotNull('business_name')
            ->with('user')
            ->limit(2)
            ->get()
            ->map(function ($profile) {
                return [
                    'type' => 'business',
                    'id' => $profile->user_id,
                    'text' => $profile->business_name,
                    'category' => 'Businesses',
                    'icon' => 'fas fa-building'
                ];
            });

        // Combine all suggestions
        $suggestions = $serviceSuggestions
            ->concat($categorySuggestions)
            ->concat($providerSuggestions)
            ->concat($businessSuggestions)
            ->take(8); // Limit total suggestions

        return response()->json([
            'success' => true,
            'data' => $suggestions
        ]);
    }

    /**
     * Get popular searches
     */
    public function getPopularSearches()
    {
        $popularSearches = ServiceSearch::getPopularSearches(10);

        return response()->json([
            'success' => true,
            'data' => $popularSearches
        ]);
    }

    /**
     * Track search (for analytics)
     */
    public function trackSearch(Request $request)
    {
        $request->validate([
            'search_term' => 'nullable|string|max:255',
            'filters' => 'nullable|array',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'radius' => 'nullable|integer',
            'results_count' => 'nullable|integer'
        ]);

        ServiceSearch::trackSearch(
            $request->search_term,
            $request->filters,
            $request->latitude,
            $request->longitude,
            $request->radius,
            $request->results_count ?? 0,
            Auth::id()
        );

        return response()->json(['success' => true]);
    }

    /*
    |--------------------------------------------------------------------------
    | Private Helper Methods
    |--------------------------------------------------------------------------
    */

    /**
     * Format service for client listing
     */
    private function formatServiceForClient($service)
    {
        // Calculate service-specific review count
        $serviceReviewsCount = $service->appointments()
            ->completed()
            ->whereNotNull('provider_rating')
            ->count();

        return [
            'id' => $service->id,
            'title' => $service->title,
            'description' => Str::limit($service->description, 150),
            'category' => [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'icon' => $service->category->icon,
                'color' => $service->category->color,
            ],
            'provider' => [
                'id' => $service->provider->id,
                'name' => $service->provider->full_name,
                'business_name' => $service->provider->providerProfile?->business_name,
                'average_rating' => $service->provider->providerProfile?->average_rating ?? 0,
                'total_reviews' => $service->provider->providerProfile?->total_reviews ?? 0,
                'verified' => $service->provider->providerProfile?->isVerified() ?? false,
            ],
            'pricing_type' => $service->pricing_type,
            'base_price' => $service->base_price,
            'formatted_price' => $service->formatted_price,
            'duration_hours' => $service->duration_hours,
            'average_rating' => $service->average_rating ?? 0,
            'reviews_count' => $serviceReviewsCount,
            'views_count' => $service->views_count,
            'bookings_count' => $service->bookings_count,
            'first_image_url' => $service->first_image_url,
            'location' => $service->location,
            'distance' => isset($service->distance) ? round($service->distance, 2) : null,
            'service_areas' => $service->service_areas,
            'created_at' => $service->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Format service detail for client
     */
    private function formatServiceDetailForClient($service)
    {
        $baseData = $this->formatServiceForClient($service);

        // Add detailed information
        $detailedData = array_merge($baseData, [
            'full_description' => $service->description,
            'includes' => $service->includes,
            'requirements' => $service->requirements,
            'service_images' => $service->service_images,
            'service_image_urls' => $service->service_image_urls,
            'first_image_url' => $service->first_image_url,
            'provider_details' => [
                'id' => $service->provider->id,
                'name' => $service->provider->full_name,
                'business_name' => $service->provider->providerProfile?->business_name,
                'bio' => $service->provider->providerProfile?->bio,
                'years_of_experience' => $service->provider->providerProfile?->years_of_experience,
                'average_rating' => $service->provider->providerProfile?->average_rating ?? 0,
                'total_reviews' => $service->provider->providerProfile?->total_reviews ?? 0,
                'total_earnings' => $service->provider->providerProfile?->total_earnings ?? 0,
                'verified' => $service->provider->providerProfile?->isVerified() ?? false,
                'verification_status' => $service->provider->providerProfile?->verification_status,
                'is_available' => $service->provider->providerProfile?->is_available ?? true,
                'service_area_radius' => $service->provider->providerProfile?->service_area_radius,
                'profile_picture' => $service->provider->profile_picture
                    ? Storage::url($service->provider->profile_picture)
                    : null,
            ],
            'recent_reviews' => $service->appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'rating' => $appointment->provider_rating,
                    'review' => $appointment->provider_review,
                    'client_name' => $appointment->client->first_name . ' ' . substr($appointment->client->last_name, 0, 1) . '.',
                    'completed_at' => $appointment->completed_at?->format('M j, Y'),
                ];
            }),
            'stats' => [
                'total_bookings' => $service->bookings_count,
                'total_views' => $service->views_count,
                'completion_rate' => $this->calculateCompletionRate($service),
                'average_response_time' => $this->calculateAverageResponseTime($service),
            ]
        ]);

        return $detailedData;
    }

    /**
     * Calculate completion rate for service
     */
    private function calculateCompletionRate($service)
    {
        $totalAppointments = $service->appointments()->count();
        if ($totalAppointments === 0) return 0;

        $completedAppointments = $service->appointments()
            ->where('status', 'completed')
            ->count();

        return round(($completedAppointments / $totalAppointments) * 100, 1);
    }

    /**
     * Calculate average response time for provider
     */
    private function calculateAverageResponseTime($service)
    {
        $appointments = $service->appointments()
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
