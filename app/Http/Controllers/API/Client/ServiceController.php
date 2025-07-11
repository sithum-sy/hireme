<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ServiceController extends Controller
{
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
            'data' => $services->through(function ($service) {
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

            $serviceData = $this->formatServiceDetailForClient($service);

            return response()->json([
                'success' => true,
                'data' => $serviceData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get popular services
     */
    public function getPopularServices(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:20'
        ]);

        $query = Service::with(['category', 'provider.providerProfile'])
            ->popular($request->get('limit', 10));

        // Apply location filter if provided
        if ($request->latitude && $request->longitude) {
            $radius = $request->radius ?? 20; // Wider radius for popular services
            $query->servingLocation($request->latitude, $request->longitude);
        }

        $services = $query->get();

        return response()->json([
            'success' => true,
            'data' => $services->map(function ($service) {
                return $this->formatServiceForClient($service);
            })
        ]);
    }

    /**
     * Get recent services
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

        $services = $query->get();

        return response()->json([
            'success' => true,
            'data' => $services->map(function ($service) {
                return $this->formatServiceForClient($service);
            })
        ]);
    }

    /**
     * Get service categories with service counts
     */
    public function getCategories(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'radius' => 'nullable|integer|min:1|max:50',
        ]);

        $query = ServiceCategory::with(['activeServices' => function ($serviceQuery) use ($request) {
            if ($request->latitude && $request->longitude) {
                $radius = $request->radius ?? 15;
                $serviceQuery->servingLocation($request->latitude, $request->longitude);
            }
        }])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        $categories = $query->get();

        return response()->json([
            'success' => true,
            'data' => $categories->map(function ($category) {
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
            })
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

    /**
     * Format service for client listing
     */
    private function formatServiceForClient($service)
    {
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
            'average_rating' => $service->average_rating,
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
            'service_images' => $service->service_image_urls,
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
                    ? \Storage::url($service->provider->profile_picture)
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
