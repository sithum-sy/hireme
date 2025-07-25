<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\ProviderProfile;
use App\Models\Review;
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
            'search' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:service_categories,id',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'min_rating' => 'nullable|numeric|between:1,5',
            'pricing_type' => 'nullable|in:hourly,fixed,custom',
            'verified_only' => 'nullable|in:true,1,false,0',
            'instant_booking' => 'nullable|in:true,1,false,0',
            'available_today' => 'nullable|in:true,1,false,0',
            'sort_by' => 'nullable|in:distance,price,rating,popularity,recent',
            'per_page' => 'nullable|integer|min:1|max:50'
        ]);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->where('is_active', true);

        // Text search filter
        if ($request->search) {
            $searchTerm = $request->search;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhereHas('category', function ($categoryQuery) use ($searchTerm) {
                        $categoryQuery->where('name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('provider', function ($providerQuery) use ($searchTerm) {
                        $providerQuery->where(function ($nameQuery) use ($searchTerm) {
                            $nameQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"])
                                ->orWhere('first_name', 'like', "%{$searchTerm}%")
                                ->orWhere('last_name', 'like', "%{$searchTerm}%");
                        })
                            ->orWhereHas('providerProfile', function ($profileQuery) use ($searchTerm) {
                                $profileQuery->where('business_name', 'like', "%{$searchTerm}%");
                            });
                    });
            });
        }

        // Category filter
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Price range filters
        if ($request->min_price) {
            $query->where('base_price', '>=', $request->min_price);
        }
        if ($request->max_price) {
            $query->where('base_price', '<=', $request->max_price);
        }

        // Rating filter - now handled post-query since ratings are calculated
        // Removed database-level filtering as ratings are now calculated from reviews table

        // Pricing type filter
        if ($request->pricing_type) {
            $query->where('pricing_type', $request->pricing_type);
        }

        // Verified providers only
        if ($request->verified_only && in_array($request->verified_only, ['true', '1', 1, true])) {
            $query->whereHas('provider.providerProfile', function ($q) {
                $q->where('verification_status', 'verified');
            });
        }

        // Available today filter
        if ($request->available_today && in_array($request->available_today, ['true', '1', 1, true])) {
            $today = now()->format('Y-m-d');
            $query->whereHas('provider', function ($q) use ($today) {
                // This would need to be implemented based on your availability system
                // For now, just include all active providers
                $q->whereHas('providerProfile', function ($profile) {
                    $profile->where('is_available', true);
                });
            });
        }

        // Location-based filtering
        if ($request->latitude && $request->longitude) {
            $radius = $request->radius ?? 5;  // Use 5km as default instead of 10km
            $query->nearLocation($request->latitude, $request->longitude, $radius);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'distance':
                // Already sorted by distance if location provided
                if (!($request->latitude && $request->longitude)) {
                    $query->orderByDesc('created_at');
                }
                break;
            case 'price':
                $query->orderBy('base_price');
                break;
            case 'rating':
                // Rating is now calculated from reviews, sort by views_count as proxy
                $query->orderByDesc('views_count')->orderByDesc('bookings_count');
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

        // Apply rating filter post-query since ratings are calculated dynamically
        $filteredServices = collect($services->items());
        if ($request->min_rating) {
            $filteredServices = $filteredServices->filter(function ($service) use ($request) {
                return $service->average_rating >= $request->min_rating;
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'data' => $filteredServices->map(function ($service) {
                    return $this->formatServiceForClient($service);
                }),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'per_page' => $services->perPage(),
                'total' => $services->total(),
            ],
            'meta' => [
                'total' => $services->total(),
                'per_page' => $services->perPage(),
                'current_page' => $services->currentPage(),
                'last_page' => $services->lastPage(),
                'search_info' => [
                    'location_based' => $request->latitude && $request->longitude,
                    'radius' => $request->radius ?? 5,
                    'filters_applied' => [
                        'search' => !!$request->search,
                        'category' => !!$request->category_id,
                        'price_range' => !!($request->min_price || $request->max_price),
                        'rating' => !!$request->min_rating,
                        'pricing_type' => !!$request->pricing_type,
                        'verified_only' => $request->verified_only && in_array($request->verified_only, ['true', '1', 1, true]),
                        'available_today' => $request->available_today && in_array($request->available_today, ['true', '1', 1, true]),
                    ]
                ]
            ]
        ]);
    }

    /**
     * Get service details with provider information
     */
    public function show(Service $service, Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            // Increment view count
            $service->incrementViews();

            // Load related data
            $service->load([
                'category',
                'provider.providerProfile',
            ]);

            $distance = null;
            if ($request->latitude && $request->longitude && $service->latitude && $service->longitude) {
                $distance = $this->calculateDistance(
                    $request->latitude,
                    $request->longitude,
                    $service->latitude,
                    $service->longitude
                );

                Log::info('Distance calculated for service detail:', [
                    'service_id' => $service->id,
                    'client_lat' => $request->latitude,
                    'client_lng' => $request->longitude,
                    'service_lat' => $service->latitude,
                    'service_lng' => $service->longitude,
                    'distance' => $distance
                ]);
            }

            // Calculate reviews count from Review model
            $reviewsCount = Review::where('service_id', $service->id)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                ->where('status', Review::STATUS_PUBLISHED)
                ->where('is_hidden', false)
                ->count();

            // Calculate average rating from Review model  
            $averageRating = Review::where('service_id', $service->id)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                ->where('status', Review::STATUS_PUBLISHED)
                ->where('is_hidden', false)
                ->avg('rating');

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
                'average_rating' => round($averageRating ?: 0, 1),
                'reviews_count' => $reviewsCount,
                'includes' => $service->includes,
                'requirements' => $service->requirements,
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'icon' => $service->category->icon,
                    'color' => $service->category->color,
                ],
                'location' => $service->location,
                'distance' => $distance,
                'views_count' => $service->views_count,
                'bookings_count' => $service->bookings_count,
            ];

            // Format provider data
            $provider = $service->provider;
            $providerProfile = $provider->providerProfile;

            $providerData = [
                'id' => $provider->id,
                'first_name' => $provider->first_name,
                'last_name' => $provider->last_name,
                'business_name' => $providerProfile->business_name ?? null,
                'email' => $provider->email,
                'contact_number' => $provider->contact_number,
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
     * Calculate the distance between two latitude/longitude points using the Haversine formula.
     *
     * @param float $lat1 Latitude of the first point
     * @param float $lon1 Longitude of the first point
     * @param float $lat2 Latitude of the second point
     * @param float $lon2 Longitude of the second point
     * @return float Distance in kilometers, rounded to 2 decimal places
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // Earth radius in kilometers

        // Convert latitude and longitude differences to radians
        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);

        // Haversine formula to calculate the great-circle distance
        $a = sin($latDiff / 2) * sin($latDiff / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($lonDiff / 2) * sin($lonDiff / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distance = $earthRadius * $c;

        // Return the distance rounded to 2 decimal places
        return round($distance, 2);
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
                $radius = $request->radius ?? 5;
                $query->nearLocation($request->latitude, $request->longitude, $radius);
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
                $radius = $request->radius ?? 5;
                $query->nearLocation($request->latitude, $request->longitude, $radius);
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
                    $radius = $request->radius ?? 5;
                    $serviceQuery->nearLocation($request->latitude, $request->longitude, $radius);
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
            $radius = $request->radius ?? 5;
            $query->nearLocation($request->latitude, $request->longitude, $radius);
        } else {
            $query->orderByDesc('views_count');
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
            $radius = $request->radius ?? 5;

            Log::info('Location-based search:', [
                'lat' => $request->latitude,
                'lng' => $request->longitude,
                'radius' => $radius,
                'results_count' => $query->count()
            ]);

            $query->nearLocation($lat, $lng, $radius);
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
                // Rating is now calculated from reviews, sort by views_count as proxy
                $query->orderByDesc('views_count')->orderByDesc('bookings_count');
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
                    'radius' => $request->radius ?? 5,
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
        // Calculate service-specific review count from Review model
        $serviceReviewsCount = Review::where('service_id', $service->id)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            ->where('status', Review::STATUS_PUBLISHED)
            ->where('is_hidden', false)
            ->count();

        $averageRating = Review::where('service_id', $service->id)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            ->where('status', Review::STATUS_PUBLISHED)
            ->where('is_hidden', false)
            ->avg('rating') ?: 0;

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
            'average_rating' => round($averageRating, 1), // From Review model
            'reviews_count' => $serviceReviewsCount, // From Review model
            'views_count' => $service->views_count ?? 0,
            'bookings_count' => $service->bookings_count ?? 0,
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

    /**
     * Get service reviews with filtering and pagination
     */
    public function getServiceReviews(Service $service, Request $request)
    {
        $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:50',
            'sort_by' => 'nullable|in:recent,rating_high,rating_low,helpful',
            'rating' => 'nullable|integer|between:1,5',
        ]);

        try {
            Log::info('Getting reviews for service:', ['service_id' => $service->id]);

            // Query reviews for this service where clients reviewed providers
            $query = Review::where('service_id', $service->id)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                ->where('status', Review::STATUS_PUBLISHED)
                ->where('is_hidden', false)
                ->with([
                    'reviewer:id,first_name,last_name,profile_picture',
                    'appointment:id,appointment_date,completed_at'
                ])
                ->whereHas('reviewer');

            // Apply rating filter
            if ($request->rating) {
                $query->where('rating', $request->rating);
            }

            // Apply sorting
            switch ($request->sort_by) {
                case 'rating_high':
                    $query->orderByDesc('rating')->orderByDesc('created_at');
                    break;
                case 'rating_low':
                    $query->orderBy('rating')->orderByDesc('created_at');
                    break;
                case 'helpful':
                    $query->orderByDesc('helpful_count')->orderByDesc('created_at');
                    break;
                case 'recent':
                default:
                    $query->orderByDesc('created_at');
                    break;
            }

            $perPage = $request->get('per_page', 10);
            $reviews = $query->paginate($perPage);

            Log::info('Reviews query results:', [
                'total_reviews' => $reviews->total(),
                'current_page' => $reviews->currentPage()
            ]);

            // Format the reviews
            $formattedReviews = $reviews->through(function ($review) {
                // Handle case where reviewer might be null
                $reviewerName = 'Anonymous User';
                $reviewerImage = null;

                if ($review->reviewer) {
                    $reviewerName = $review->reviewer->first_name . ' ' . substr($review->reviewer->last_name, 0, 1) . '.';
                    $reviewerImage = $review->reviewer->profile_picture
                        ? Storage::url($review->reviewer->profile_picture)
                        : null;
                }

                return [
                    'id' => $review->id,
                    'rating' => (int) $review->rating,
                    'comment' => $review->comment,
                    'client' => [
                        'name' => $reviewerName,
                        'profile_image_url' => $reviewerImage,
                    ],
                    'is_verified_purchase' => $review->is_verified,
                    'created_at' => $review->created_at,
                    'helpful_count' => $review->helpful_count,
                    'images' => $review->review_images ?: [],
                    'provider_response' => $review->provider_response ? [
                        'message' => $review->provider_response,
                        'created_at' => $review->provider_responded_at
                    ] : null,
                    // Additional rating breakdowns if available
                    'quality_rating' => $review->quality_rating,
                    'punctuality_rating' => $review->punctuality_rating,
                    'communication_rating' => $review->communication_rating,
                    'value_rating' => $review->value_rating,
                    'would_recommend' => $review->would_recommend,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedReviews,
                'meta' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                ],
                'message' => 'Service reviews retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get service reviews:', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve service reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
