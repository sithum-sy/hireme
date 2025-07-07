<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ServiceRequest;
use App\Models\Service;
use App\Services\ServiceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
                'sort_order'
            ]);

            $query = $this->serviceService->getServicesWithFilters($filters);

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
            if (!$user->providerProfile || !$user->providerProfile->isVerified()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your provider profile must be verified before creating services'
                ], 403);
            }

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

            $updatedService = $this->serviceService->updateService($service, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Service updated successfully',
                'data' => $this->formatServiceResponse($updatedService)
            ], 200);
        } catch (\Exception $e) {
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

            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access this endpoint'
                ], 403);
            }

            $status = $request->get('status'); // 'active', 'inactive', or null for all
            $perPage = $request->get('per_page', 15);

            $query = Service::with(['category'])
                ->where('provider_id', $user->id);

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            $services = $query->orderBy('created_at', 'desc')->paginate($perPage);

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
            'service_image_urls' => $service->service_image_urls,
            'first_image_url' => $service->first_image_url,
            'average_rating' => $service->average_rating,
            'rating_stars' => $service->rating_stars,
            'views_count' => $service->views_count,
            'bookings_count' => $service->bookings_count,
            'is_active' => $service->is_active,
            'created_at' => $service->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),
        ];

        // Add provider information
        if ($service->relationLoaded('provider')) {
            $baseResponse['provider'] = [
                'id' => $service->provider->id,
                'name' => $service->provider->full_name,
                'profile_picture' => $service->provider->profile_picture
                    ? \Storage::url($service->provider->profile_picture)
                    : null,
            ];

            if ($service->provider->relationLoaded('providerProfile')) {
                $profile = $service->provider->providerProfile;
                $baseResponse['provider'] = array_merge($baseResponse['provider'], [
                    'business_name' => $profile->business_name,
                    'years_of_experience' => $profile->years_of_experience,
                    'average_rating' => $profile->average_rating,
                    'total_reviews' => $profile->total_reviews,
                    'verification_status' => $profile->verification_status,
                    'is_available' => $profile->is_available,
                ]);
            }
        }

        // Add detailed information if requested
        if ($detailed) {
            $baseResponse = array_merge($baseResponse, [
                'requirements' => $service->requirements,
                'includes' => $service->includes,
            ]);

            // Add recent reviews if appointments are loaded
            if ($service->relationLoaded('appointments')) {
                $baseResponse['recent_reviews'] = $service->appointments
                    ->filter(function ($appointment) {
                        return $appointment->provider_review && $appointment->provider_rating;
                    })
                    ->take(5)
                    ->map(function ($appointment) {
                        return [
                            'client_name' => $appointment->client->first_name,
                            'rating' => $appointment->provider_rating,
                            'review' => $appointment->provider_review,
                            'date' => $appointment->completed_at->format('Y-m-d'),
                        ];
                    })
                    ->values();
            }
        }

        return $baseResponse;
    }
}
