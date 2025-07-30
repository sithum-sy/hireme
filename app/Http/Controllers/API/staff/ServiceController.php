<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\LogsActivity;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\User;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ServiceController extends Controller
{
    use LogsActivity;

    /**
     * Get all services with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $category = $request->get('category'); // category ID
            $status = $request->get('status'); // 'active', 'inactive', or null for all
            $provider = $request->get('provider'); // provider ID
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = Service::query();

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('provider', function ($providerQuery) use ($search) {
                            $providerQuery->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('category', function ($categoryQuery) use ($search) {
                            $categoryQuery->where('name', 'like', "%{$search}%");
                        });
                });
            }

            // Apply category filter
            if ($category) {
                $query->where('category_id', $category);
            }

            // Apply provider filter
            if ($provider) {
                $query->where('provider_id', $provider);
            }

            // Apply status filter
            if ($status !== null) {
                $isActive = $status === 'active';
                $query->where('is_active', $isActive);
            }

            // Apply sorting
            $allowedSortFields = ['title', 'base_price', 'created_at', 'updated_at', 'is_active'];
            if (in_array($sortBy, $allowedSortFields)) {
                $sortColumn = $sortBy === 'price' ? 'base_price' : $sortBy;
                $query->orderBy($sortColumn, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            $services = $query->paginate($perPage);

            // Load relationships
            $services->load([
                'provider:id,first_name,last_name,email,profile_picture',
                'category:id,name,color,icon'
            ]);

            // Transform the data
            $services->getCollection()->transform(function ($service) {
                return [
                    'id' => $service->id,
                    'title' => $service->title,
                    'description' => $service->description,
                    'price' => $service->base_price,
                    'duration' => $service->duration_hours,
                    'location_type' => $service->location_address ? 'fixed_location' : 'client_location',
                    'service_area' => $service->service_areas,
                    'is_active' => $service->is_active,
                    'images' => $service->service_images ?: [],
                    'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),
                    'provider' => [
                        'id' => $service->provider->id,
                        'full_name' => $service->provider->full_name,
                        'email' => $service->provider->email,
                        'profile_picture' => $service->provider->profile_picture,
                    ],
                    'category' => [
                        'id' => $service->category->id,
                        'name' => $service->category->name,
                        'color' => $service->category->color,
                        'icon' => $service->category->icon,
                    ],
                    'statistics' => [
                        'total_appointments' => 0, // Temporary to avoid query issues
                        'completed_appointments' => 0,
                        'total_revenue' => 0,
                    ]
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $services,
                'meta' => [
                    'total_services' => Service::count(),
                    'active_services' => Service::where('is_active', true)->count(),
                    'inactive_services' => Service::where('is_active', false)->count(),
                    'categories' => ServiceCategory::where('is_active', true)->get(['id', 'name', 'color', 'icon']),
                    'providers' => User::where('role', 'service_provider')
                        ->where('is_active', true)
                        ->get(['id', 'first_name', 'last_name'])
                        ->map(function ($provider) {
                            return [
                                'id' => $provider->id,
                                'full_name' => $provider->full_name,
                            ];
                        })
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch services: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch services',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific service with detailed information
     */
    public function show(Service $service)
    {
        try {
            $service->load([
                'provider:id,first_name,last_name,email,profile_picture',
                'provider.providerProfile:user_id,business_name,verification_status',
                'category:id,name,color,icon',
                'appointments.client:id,first_name,last_name'
            ]);

            $serviceData = [
                'id' => $service->id,
                'title' => $service->title,
                'description' => $service->description,
                'price' => $service->base_price,
                'duration' => $service->duration_hours,
                'location_type' => $service->location_address ? 'fixed_location' : 'client_location',
                'service_area' => $service->service_areas,
                'is_active' => $service->is_active,
                'images' => $service->service_images ?: [],
                'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),
                'provider' => [
                    'id' => $service->provider->id,
                    'full_name' => $service->provider->full_name,
                    'email' => $service->provider->email,
                    'profile_picture' => $service->provider->profile_picture,
                    'business_name' => $service->provider->providerProfile->business_name ?? null,
                    'verification_status' => $service->provider->providerProfile->verification_status ?? 'pending',
                ],
                'category' => [
                    'id' => $service->category->id,
                    'name' => $service->category->name,
                    'color' => $service->category->color,
                    'icon' => $service->category->icon,
                ],
                'statistics' => [
                    'total_appointments' => $service->appointments()->count(),
                    'completed_appointments' => $service->appointments()->where('status', 'completed')->count(),
                    'pending_appointments' => $service->appointments()->where('status', 'pending')->count(),
                    'cancelled_appointments' => $service->appointments()->whereIn('status', ['cancelled_by_client', 'cancelled_by_provider'])->count(),
                    'total_revenue' => $service->appointments()->where('status', 'completed')->sum('total_price'),
                    'average_rating' => $service->appointments()->where('status', 'completed')->avg('client_rating') ?? 0,
                    'total_reviews' => $service->appointments()->where('status', 'completed')->whereNotNull('client_review')->count(),
                ],
                'recent_appointments' => $service->appointments()
                    ->with(['client:id,first_name,last_name'])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($appointment) {
                        return [
                            'id' => $appointment->id,
                            'client_name' => $appointment->client->full_name,
                            'appointment_date' => $appointment->appointment_date,
                            'appointment_time' => $appointment->appointment_time,
                            'status' => $appointment->status,
                            'total_price' => $appointment->total_price,
                        ];
                    })
            ];

            // Log activity
            $this->logUserActivity(StaffActivity::ACTION_VIEW, $service, [
                'view_type' => 'detailed_service',
                'service_title' => $service->title,
                'provider_id' => $service->provider_id
            ]);

            return response()->json([
                'success' => true,
                'data' => $serviceData
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch service details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service details',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Toggle service status (active/inactive)
     */
    public function toggleStatus(Service $service)
    {
        try {
            // Load the provider relationship
            $service->load('provider');
            
            $service->is_active = !$service->is_active;
            $service->save();

            $status = $service->is_active ? 'activated' : 'deactivated';

            // Log activity
            $this->logUserActivity(
                $service->is_active ? StaffActivity::ACTION_ACTIVATE : StaffActivity::ACTION_DEACTIVATE,
                $service->provider, // Pass the provider user instead of service
                [
                    'new_status' => $service->is_active,
                    'service_title' => $service->title,
                    'service_id' => $service->id,
                    'provider_id' => $service->provider_id
                ]
            );

            return response()->json([
                'success' => true,
                'message' => "Service '{$service->title}' has been {$status} successfully",
                'data' => [
                    'service' => [
                        'id' => $service->id,
                        'title' => $service->title,
                        'is_active' => $service->is_active,
                        'updated_at' => $service->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle service status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle service status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete a service
     */
    public function destroy(Service $service)
    {
        try {
            // Check if service has any appointments
            $appointmentsCount = $service->appointments()->count();
            
            if ($appointmentsCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete service with existing appointments. Please deactivate instead.'
                ], 400);
            }

            $serviceTitle = $service->title;
            $providerId = $service->provider_id;

            $service->delete();

            // Log activity
            $this->logUserActivity(StaffActivity::ACTION_DELETE, null, [
                'deleted_service_title' => $serviceTitle,
                'deleted_service_id' => $service->id,
                'provider_id' => $providerId
            ]);

            return response()->json([
                'success' => true,
                'message' => "Service '{$serviceTitle}' has been deleted successfully"
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete service: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get service statistics
     */
    public function statistics(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);

            $stats = [
                'total_services' => Service::count(),
                'active_services' => Service::where('is_active', true)->count(),
                'inactive_services' => Service::where('is_active', false)->count(),
                'new_services' => Service::where('created_at', '>=', $startDate)->count(),
                'by_category' => ServiceCategory::withCount('services')
                    ->where('is_active', true)
                    ->get()
                    ->map(function ($category) {
                        return [
                            'name' => $category->name,
                            'color' => $category->color,
                            'icon' => $category->icon,
                            'services_count' => $category->services_count,
                        ];
                    }),
                'top_providers' => User::where('role', 'service_provider')
                    ->withCount('services')
                    ->orderByDesc('services_count')
                    ->take(5)
                    ->get()
                    ->map(function ($provider) {
                        return [
                            'id' => $provider->id,
                            'full_name' => $provider->full_name,
                            'services_count' => $provider->services_count,
                        ];
                    }),
                'revenue_data' => $this->getServiceRevenueData($days),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch service statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get service revenue data for charts
     */
    private function getServiceRevenueData($days = 30)
    {
        $data = [];
        $startDate = now()->subDays($days);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $revenue = Service::join('appointments', 'services.id', '=', 'appointments.service_id')
                ->where('appointments.status', 'completed')
                ->whereDate('appointments.created_at', $date->format('Y-m-d'))
                ->sum('appointments.total_price');

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'revenue' => $revenue,
            ];
        }

        return $data;
    }
}