<?php

namespace App\Http\Controllers\API\provider;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    protected $serviceService;
    protected $notificationService;

    public function __construct(ServiceService $serviceService, NotificationService $notificationService)
    {
        $this->serviceService = $serviceService;
        $this->notificationService = $notificationService;
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

            $service = $this->serviceService->createService($user, $request->validated());

            // Send notification
            $this->notificationService->sendServiceNotification(
                'service_created',
                $user,
                [
                    'service' => $service,
                    'service_id' => $service->id
                ]
            );

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
    // public function show(Service $service)
    // {
    //     try {
    //         // Increment view count
    //         $service->incrementViews();

    //         $service->load(['category', 'provider.providerProfile', 'appointments' => function ($query) {
    //             $query->completed()->with('client:id,first_name,last_name');
    //         }]);

    //         $formattedService = $this->formatServiceResponse($service, true);

    //         return response()->json([
    //             'success' => true,
    //             'data' => $formattedService
    //         ], 200);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to fetch service',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }

    // public function show(Service $service)
    // {
    //     try {
    //         // Increment view count
    //         $service->incrementViews();

    //         // Load related data
    //         $service->load([
    //             'category',
    //             'provider.providerProfile',
    //             'appointments' => function ($query) {
    //                 $query->completed()
    //                     ->whereNotNull('provider_rating')
    //                     ->with('client:id,first_name,last_name')
    //                     ->latest()
    //                     ->limit(5);
    //             }
    //         ]);

    //         // Format service data with ALL details
    //         $serviceData = [
    //             'id' => $service->id,
    //             'title' => $service->title,
    //             'description' => $service->description,

    //             // Pricing information
    //             'base_price' => $service->base_price,
    //             'formatted_price' => $service->formatted_price,
    //             'pricing_type' => $service->pricing_type,

    //             // Service details
    //             'duration_hours' => $service->duration_hours,
    //             'duration' => $service->duration_hours ? ($service->duration_hours . ' hours') : 'Flexible duration',

    //             // Service content
    //             'includes' => $service->includes, // What's included in the service
    //             'requirements' => $service->requirements, // Client requirements
    //             'service_areas' => $service->service_areas, // Areas served

    //             // Images
    //             'service_images' => $service->service_image_urls,
    //             'service_image_urls' => $service->service_image_urls,
    //             'first_image_url' => $service->first_image_url,
    //             'images' => collect($service->service_image_urls)->map(function ($url) {
    //                 return ['url' => $url, 'alt' => 'Service image'];
    //             })->toArray(),

    //             // Ratings and reviews
    //             'average_rating' => $service->average_rating,
    //             'reviews_count' => $service->appointments()->completed()->whereNotNull('provider_rating')->count(),

    //             // Category
    //             'category' => [
    //                 'id' => $service->category->id,
    //                 'name' => $service->category->name,
    //                 'icon' => $service->category->icon,
    //                 'color' => $service->category->color,
    //             ],

    //             // Location and availability
    //             'location' => $service->location,
    //             'distance' => $service->distance ?? null,
    //             'availability_status' => 'available', // Default, can be dynamic
    //             'next_available' => 'Today',

    //             // Additional service info
    //             'service_location' => 'At your location', // Default
    //             'cancellation_policy' => 'Free cancellation up to 24 hours before service',
    //             'languages' => ['English', 'Sinhala'], // Default or from provider

    //             // Stats
    //             'views_count' => $service->views_count,
    //             'bookings_count' => $service->bookings_count,
    //         ];

    //         // Format provider data (without personal address)
    //         $provider = $service->provider;
    //         $providerProfile = $provider->providerProfile;

    //         $providerData = [
    //             'id' => $provider->id,
    //             'first_name' => $provider->first_name,
    //             'last_name' => $provider->last_name,
    //             'name' => $provider->first_name . ' ' . $provider->last_name,
    //             'business_name' => $providerProfile->business_name ?? null,
    //             'profile_image_url' => $provider->profile_picture ? \Storage::url($provider->profile_picture) : null,
    //             'bio' => $providerProfile->bio ?? 'Professional service provider with experience.',
    //             'is_verified' => $providerProfile->isVerified() ?? false,

    //             // Service area (not personal address)
    //             'city' => $providerProfile->city ?? 'Colombo',
    //             'province' => $providerProfile->province ?? 'Western Province',
    //             'service_radius' => $providerProfile->service_area_radius ?? 25,
    //             'travel_fee' => 0, // Add if you have this field

    //             // Performance stats
    //             'average_rating' => $providerProfile->average_rating ?? 0,
    //             'reviews_count' => $providerProfile->total_reviews ?? 0,
    //             'years_experience' => $providerProfile->years_of_experience ?? 0,
    //             'response_time' => $this->calculateAverageResponseTime($service) ?? '2 hours',
    //             'total_services' => $provider->services()->where('is_active', true)->count(),
    //             'completed_bookings' => $provider->providerAppointments()->where('status', 'completed')->count(),

    //             // Other services by this provider
    //             'other_services' => $provider->services()
    //                 ->where('is_active', true)
    //                 ->where('id', '!=', $service->id)
    //                 ->with('category')
    //                 ->limit(3)
    //                 ->get()
    //                 ->map(function ($otherService) {
    //                     return [
    //                         'id' => $otherService->id,
    //                         'title' => $otherService->title,
    //                         'formatted_price' => $otherService->formatted_price,
    //                         'category' => [
    //                             'name' => $otherService->category->name
    //                         ]
    //                     ];
    //                 })
    //         ];

    //         return response()->json([
    //             'success' => true,
    //             'data' => $serviceData,
    //             'provider' => $providerData,
    //             'is_favorite' => false, // TODO: Check if user favorited this service
    //             'message' => 'Service details retrieved successfully'
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to retrieve service details',
    //             'error' => $e->getMessage()
    //         ], 500);
    //     }
    // }


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

            // Helper function to safely parse JSON fields
            $parseJsonField = function ($field) {
                if (is_null($field)) return null;
                if (is_array($field)) return $field;
                if (is_string($field)) {
                    try {
                        $decoded = json_decode($field, true);
                        return is_array($decoded) ? $decoded : [$field];
                    } catch (\Exception $e) {
                        // If not valid JSON, split by common delimiters
                        return array_map('trim', preg_split('/[,\n;]/', $field));
                    }
                }
                return null;
            };

            // Format service data with ALL details
            $serviceData = [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,

                // Pricing information
                'base_price' => $service->base_price,
                'formatted_price' => $service->formatted_price,
                'pricing_type' => $service->pricing_type,

                // Service details
                'duration_hours' => $service->duration_hours,
                'duration' => $service->duration_hours ? ($service->duration_hours . ' hours') : 'Flexible duration',

                // Service content - safely parsed JSON fields
                'includes' => $parseJsonField($service->includes),
                'requirements' => $parseJsonField($service->requirements),
                'service_areas' => $parseJsonField($service->service_areas),

                // Images
                'service_images' => $service->service_image_urls,
                'service_image_urls' => $service->service_image_urls,
                'first_image_url' => $service->first_image_url,
                'images' => collect($service->service_image_urls)->map(function ($url) {
                    return ['url' => $url, 'alt' => 'Service image'];
                })->toArray(),

                // Ratings and reviews
                'average_rating' => $service->average_rating,
                'reviews_count' => $service->appointments()->completed()->whereNotNull('provider_rating')->count(),

                // Category
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'icon' => $service->category->icon,
                    'color' => $service->category->color,
                ],

                // Location and availability
                'location' => $service->location,
                'distance' => $service->distance ?? null,
                'availability_status' => 'available', // Default, can be dynamic
                'next_available' => 'Today',

                // Additional service info
                'service_location' => 'At your location', // Default
                'cancellation_policy' => 'Free cancellation up to 24 hours before service',
                'languages' => ['English', 'Sinhala'], // Default or from provider

                // Stats
                'views_count' => $service->views_count,
                'bookings_count' => $service->bookings_count,
            ];

            // Format provider data (same as before)
            $provider = $service->provider;
            $providerProfile = $provider->providerProfile;

            $providerData = [
                'id' => $provider->id,
                'first_name' => $provider->first_name,
                'last_name' => $provider->last_name,
                'name' => $provider->first_name . ' ' . $provider->last_name,
                'business_name' => $providerProfile->business_name ?? null,
                'profile_image_url' => $provider->profile_picture ? asset($provider->profile_picture) : null,
                'bio' => $providerProfile->bio ?? 'Professional service provider with experience.',
                'is_verified' => $providerProfile->isVerified() ?? false,

                // Service area (not personal address)
                'city' => $providerProfile->city ?? 'Colombo',
                'province' => $providerProfile->province ?? 'Western Province',
                'service_radius' => $providerProfile->service_area_radius ?? 25,
                'travel_fee' => 0, // Add if you have this field

                // Performance stats
                'average_rating' => $providerProfile->average_rating ?? 0,
                'reviews_count' => $providerProfile->total_reviews ?? 0,
                'years_experience' => $providerProfile->years_of_experience ?? 0,
                'response_time' => $this->calculateAverageResponseTime($service) ?? '2 hours',
                'total_services' => $provider->services()->where('is_active', true)->count(),
                'completed_bookings' => $provider->providerAppointments()->where('status', 'completed')->count(),

                // Other services by this provider
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
                'is_favorite' => false, // TODO: Check if user favorited this service
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
     * Get service details for editing (Provider only)
     */
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

                // Basic stats (no appointments dependency)
                'average_rating' => $service->average_rating ?? 0,
                'views_count' => $service->views_count ?? 0,
                'bookings_count' => $service->bookings_count ?? 0,
                'total_earnings' => 0, // Set to 0 for now

                // Metadata
                'is_active' => $service->is_active,
                'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),

                // Category info
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'icon' => $service->category->icon ?? 'fas fa-cog',
                    'color' => $service->category->color ?? 'primary',
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $serviceData
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error fetching service for details:', [
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

            Log::info('Service update request:', [
                'service_id' => $service->id,
                'user_id' => $user->id,
                'request_data' => $request->except(['service_images'])
            ]);

            $updatedService = $this->serviceService->updateService($service, $request->validated());

            // Send notification
            $this->notificationService->sendServiceNotification(
                'service_updated',
                $user,
                [
                    'service' => $updatedService,
                    'service_id' => $updatedService->id
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $this->formatServiceResponse($updatedService)
            ], 200);
        } catch (\Exception $e) {
            Log::error('Service update error:', [
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

            // Store service title before deletion
            $serviceTitle = $service->title;
            
            $this->serviceService->deleteService($service);

            // Send notification
            $this->notificationService->sendServiceNotification(
                'service_deleted',
                $user,
                [
                    'service_title' => $serviceTitle
                ]
            );

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

            // Send notification based on new status
            $notificationType = $updatedService->is_active ? 'service_activated' : 'service_deactivated';
            $this->notificationService->sendServiceNotification(
                $notificationType,
                $user,
                [
                    'service' => $updatedService,
                    'service_id' => $updatedService->id
                ]
            );

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
            Log::info('User accessing myServices:', ['user_id' => $user->id, 'role' => $user->role]);

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
            Log::info('Service query count:', ['count' => $query->count()]);

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            $services = $query->orderBy('created_at', 'desc')->paginate($perPage);

            // Add debug logging
            Log::info('Services found:', ['total' => $services->total()]);

            $formattedServices = $services->map(function ($service) {
                return $this->formatServiceResponse($service);
            })->values();

            // Add this debug logging:
            Log::info('Formatted services sample:', [
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
            Log::error('Error in myServices:', ['error' => $e->getMessage()]);
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
            'description' => $detailed ? $service->description : Str::limit($service->description, 150),
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

    /**
     * Get service appointments (Provider only)
     */
    public function getServiceAppointments(Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view appointments for your own services'
                ], 403);
            }

            // Get appointments for this service with client data
            $appointments = $service->appointments()
                ->with(['client', 'clientReview'])
                ->orderBy('appointment_date', 'desc')
                ->orderBy('appointment_time', 'desc')
                ->limit(20) // Limit to recent 20 appointments
                ->get();

            $formattedAppointments = $appointments->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'appointment_date' => $appointment->appointment_date->format('Y-m-d'),
                    'appointment_time' => $appointment->appointment_time,
                    'duration_hours' => $appointment->duration_hours,
                    'total_price' => $appointment->total_price,
                    'status' => $appointment->status,
                    'client_address' => $appointment->client_address,
                    'client_city' => $appointment->client_city,
                    'client_notes' => $appointment->client_notes,
                    'created_at' => $appointment->created_at->format('Y-m-d H:i:s'),
                    'client' => $appointment->client ? [
                        'id' => $appointment->client->id,
                        'first_name' => $appointment->client->first_name,
                        'last_name' => $appointment->client->last_name,
                        'email' => $appointment->client->email,
                        'profile_image_url' => $appointment->client->profile_image_url,
                    ] : null,
                    'client_review' => $appointment->clientReview ? [
                        'id' => $appointment->clientReview->id,
                        'rating' => $appointment->clientReview->rating,
                        'comment' => $appointment->clientReview->comment,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedAppointments,
                'message' => 'Service appointments retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve service appointments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get service reviews (Provider only)
     */
    public function getServiceReviews(Service $service)
    {
        try {
            $user = Auth::user();

            // Check if user owns this service
            if ($service->provider_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only view reviews for your own services'
                ], 403);
            }

            // Get reviews for this service with reviewer data
            $reviews = $service->clientReviews()
                ->with(['reviewer', 'appointment'])
                ->where('status', 'published')
                ->where('is_hidden', false)
                ->orderBy('created_at', 'desc')
                ->limit(20) // Limit to recent 20 reviews
                ->get();

            $formattedReviews = $reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'quality_rating' => $review->quality_rating,
                    'punctuality_rating' => $review->punctuality_rating,
                    'communication_rating' => $review->communication_rating,
                    'value_rating' => $review->value_rating,
                    'would_recommend' => $review->would_recommend,
                    'provider_response' => $review->provider_response,
                    'provider_responded_at' => $review->provider_responded_at?->format('Y-m-d H:i:s'),
                    'is_verified' => $review->is_verified,
                    'is_featured' => $review->is_featured,
                    'helpful_count' => $review->helpful_count,
                    'created_at' => $review->created_at->format('Y-m-d H:i:s'),
                    'reviewer' => $review->reviewer ? [
                        'id' => $review->reviewer->id,
                        'first_name' => $review->reviewer->first_name,
                        'last_name' => $review->reviewer->last_name,
                        'profile_image_url' => $review->reviewer->profile_image_url,
                    ] : null,
                    'appointment' => $review->appointment ? [
                        'id' => $review->appointment->id,
                        'appointment_date' => $review->appointment->appointment_date->format('Y-m-d'),
                        'status' => $review->appointment->status,
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedReviews,
                'message' => 'Service reviews retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve service reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
