<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    protected $serviceService;

    public function __construct(ServiceService $serviceService)
    {
        $this->serviceService = $serviceService;
    }

    /**
     * Display a listing of services (Public)
     */
    public function index(Request $request)
    {
        try {
            $filters = $request->only([
                'category_id',
                'pricing_type',
                'min_price',
                'max_price',
                'service_area',
                'min_rating',
                'search',
                'sort_by',
                'sort_order',
                // New location filters
                'lat',
                'lng',
                'radius'
            ]);

            $query = $this->serviceService->getServicesWithFilters($filters);

            // If location is provided, filter by services that cover that location
            if ($request->has('lat') && $request->has('lng')) {
                $query = $query->servingLocation(
                    $request->lat,
                    $request->lng
                );
            }

            $perPage = $request->get('per_page', 15);
            $services = $query->paginate($perPage);

            $formattedServices = $services->through(function ($service) {
                return $this->formatServiceResponse($service);
            });

            return response()->json([
                'success' => true,
                'data' => $formattedServices,
                'meta' => [
                    'total' => $services->total(),
                    'per_page' => $services->perPage(),
                    'current_page' => $services->currentPage(),
                    'last_page' => $services->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created service (Provider only)
     */
    public function store(ServiceRequest $request)
    {
        try {
            $user = Auth::user();

            // Check if user is a service provider
            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can create services'
                ], 403);
            }

            // Check if provider profile is verified
            // if (!$user->providerProfile || !$user->providerProfile->isVerified()) {
            //     return response()->json([
            //         'success' => false,
            //         'message' => 'Your provider profile must be verified before creating services'
            //     ], 403);
            // }

            $service = $this->serviceService->createService($user, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Service created successfully',
                'data' => $this->formatServiceResponse($service)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified service (Public)
     */
    public function show(Service $service)
    {
        try {
            // Increment view count
            $service->incrementViews();

            $service->load(['category', 'provider.providerProfile', 'appointments' => function ($query) {
                $query->completed()->with('client:id,first_name,last_name');
            }]);

            $formattedService = $this->formatServiceResponse($service, true);

            return response()->json([
                'success' => true,
                'data' => $formattedService
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get service details for editing (Provider only)
     */
    // In ServiceController.php, update the edit method to return more complete data:

    public function edit(Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only edit your own services'
                ], 403);
            }

            // Load related data
            $service->load(['category']);

            // Calculate performance metrics
            $totalEarnings = $service->appointments()
                ->where('status', 'completed')
                ->sum('total_amount') ?? 0;

            $last30DaysBookings = $service->appointments()
                ->where('created_at', '>=', now()->subDays(30))
                ->count();

            $last30DaysViews = $service->views_count ? floor($service->views_count * 0.3) : 0;

            // Format service data for editing
            $serviceData = [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'category_id' => $service->category_id,
                'pricing_type' => $service->pricing_type,
                'base_price' => $service->base_price,
                'duration_hours' => $service->duration_hours,
                'custom_pricing_description' => $service->custom_pricing_description,

                // Location data
                'latitude' => $service->latitude,
                'longitude' => $service->longitude,
                'location_address' => $service->location_address,
                'location_city' => $service->location_city,
                'location_neighborhood' => $service->location_neighborhood,
                'service_radius' => $service->service_radius,

                // Service areas
                'service_areas' => $service->service_areas ?? [],

                // Additional details
                'includes' => $service->includes,
                'requirements' => $service->requirements,

                // Images
                'existing_images' => $service->service_image_urls ?? [],

                // Stats
                'average_rating' => $service->average_rating ?? 0,
                'views_count' => $service->views_count ?? 0,
                'bookings_count' => $service->bookings_count ?? 0,
                'total_earnings' => $totalEarnings,

                // Performance data
                'performance' => [
                    'last_30_days' => [
                        'views' => $last30DaysViews,
                        'bookings' => $last30DaysBookings,
                        'earnings' => floor($totalEarnings * 0.3),
                        'rating' => $service->average_rating ?? 0
                    ]
                ],

                // Metadata
                'is_active' => $service->is_active,
                'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),

                // Category info
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'icon' => $service->category->icon,
                    'color' => $service->category->color,
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $serviceData
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error fetching service for details:', [
                'service_id' => $service->id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified service (Provider only)
     */
    public function update(ServiceRequest $request, Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only update your own services'
                ], 403);
            }

            \Log::info('Service update request:', [
                'service_id' => $service->id,
                'user_id' => $user->id,
                'request_data' => $request->except(['service_images'])
            ]);

            $updatedService = $this->serviceService->updateService($service, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $this->formatServiceResponse($updatedService)
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Service update error:', [
                'service_id' => $service->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified service (Provider only)
     */
    public function destroy(Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only delete your own services'
                ], 403);
            }

            // Check if service has active appointments
            $activeAppointments = $service->appointments()
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->count();

            if ($activeAppointments > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete service with active appointments'
                ], 422);
            }

            $this->serviceService->deleteService($service);

            return response()->json([
                'success' => true,
                'message' => 'Service deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle service active status (Provider only)
     */
    public function toggleStatus(Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only modify your own services'
                ], 403);
            }

            $updatedService = $this->serviceService->toggleServiceStatus($service);

            return response()->json([
                'success' => true,
                'message' => 'Service status updated successfully',
                'data' => [
                    'id' => $updatedService->id,
                    'is_active' => $updatedService->is_active,
                    'status' => $updatedService->is_active ? 'Active' : 'Inactive'
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get provider's own services
     */
    public function myServices(Request $request)
    {
        try {
            $user = Auth::user();

            // Add debug logging
            \Log::info('User accessing myServices:', ['user_id' => $user->id, 'role' => $user->role]);

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access this endpoint'
                ], 403);
            }

            $status = $request->get('status');
            $perPage = $request->get('per_page', 15);

            $query = Service::with(['category'])
                ->where('provider_id', $user->id);

            // Add debug logging
            \Log::info('Service query count:', ['count' => $query->count()]);

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            $services = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Add debug logging
            \Log::info('Services found:', ['total' => $services->total()]);

            $formattedServices = $services->map(function ($service) {
                return $this->formatServiceResponse($service);
            })->values();

            // Add this debug logging:
            \Log::info('Formatted services sample:', [
                'first_service' => $formattedServices->first(),
                'services_collection_type' => get_class($formattedServices),
                'response_structure' => [
                    'success' => true,
                    'data_type' => get_class($formattedServices),
                    'data_count' => $formattedServices->count()
                ]
            ]);

            return response()->json([
                'success' => true,
                'data' => $formattedServices,
                'meta' => [
                    'total' => $services->total(),
                    'per_page' => $services->perPage(),
                    'current_page' => $services->currentPage(),
                    'last_page' => $services->lastPage(),
                ]
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error in myServices:', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch your services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format service response
     */
    private function formatServiceResponse(Service $service, bool $detailed = false): array
    {
        $baseResponse = [
            'id' => $service->id,
            'title' => $service->title,
            'description' => $detailed ? $service->description : \Str::limit($service->description, 150),
            'category' => [
                'id' => $service->category->id,
                'name' => $service->category->name,
                'slug' => $service->category->slug,
                'icon' => $service->category->icon,
                'color' => $service->category->color,
            ],
            'pricing_type' => $service->pricing_type,
            'base_price' => $service->base_price,
            'formatted_price' => $service->formatted_price,
            'duration_hours' => $service->duration_hours,
            'service_areas' => $service->service_areas,
            'service_images' => $service->service_image_urls,
            'first_image_url' => $service->first_image_url,
            'average_rating' => $service->average_rating,
            'rating_stars' => $service->rating_stars,
            'views_count' => $service->views_count,
            'bookings_count' => $service->bookings_count,
            'is_active' => $service->is_active,
            'location' => $service->location,
            'service_radius' => $service->service_radius,
            'distance' => $service->distance ?? null,
            'created_at' => $service->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),
        ];

        // Add additional fields for detailed view
        if ($detailed) {
            $baseResponse['includes'] = $service->includes;
            $baseResponse['requirements'] = $service->requirements;
            $baseResponse['custom_pricing_description'] = $service->custom_pricing_description;

            // Add provider info for detailed view
            if ($service->relationLoaded('provider')) {
                $baseResponse['provider'] = [
                    'id' => $service->provider->id,
                    'name' => $service->provider->full_name,
                    'profile_image' => $service->provider->profile_image_url,
                    'verification_status' => $service->provider->providerProfile?->verification_status,
                ];
            }
        }

        return $baseResponse;
    }
}
