<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\LogsActivity;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ServiceCategoryController extends Controller
{
    use LogsActivity;
    /**
     * Get all service categories with staff-specific data
     */

    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $status = $request->get('status'); // 'active', 'inactive', or null for all
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');

            $query = ServiceCategory::query();

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($status !== null) {
                $isActive = $status === 'active';
                $query->where('is_active', $isActive);
            }

            // Apply sorting
            $allowedSortFields = ['name', 'sort_order', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('sort_order', 'asc')->orderBy('name', 'asc');
            }

            $categories = $query->paginate($perPage);

            // Transform the data with staff-specific information
            $categories->getCollection()->transform(function ($category) {
                $totalServices = $category->services()->count();
                $activeServices = $category->activeServices()->count();
                $inactiveServices = $totalServices - $activeServices;

                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'description' => $category->description,
                    'icon' => $category->icon,
                    'color' => $category->color,
                    'is_active' => $category->is_active,
                    'sort_order' => $category->sort_order,
                    'services_count' => $totalServices,
                    'services' => [
                        'total' => $totalServices,
                        'active' => $activeServices,
                        'inactive' => $inactiveServices,
                    ],
                    'created_at' => $category->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $category->updated_at->format('Y-m-d H:i:s'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $categories,
                'meta' => [
                    'total_categories' => ServiceCategory::count(),
                    'active_categories' => ServiceCategory::where('is_active', true)->count(),
                    'inactive_categories' => ServiceCategory::where('is_active', false)->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service categories',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific service category with detailed analytics
     */
    public function show(ServiceCategory $category)
    {
        try {
            $totalServices = $category->services()->count();
            $activeServices = $category->activeServices()->count();
            $inactiveServices = $totalServices - $activeServices;

            // Get recent services in this category
            $recentServices = $category->services()
                ->with(['provider:id,first_name,last_name', 'providerProfile:user_id,average_rating'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->title,
                        'provider_name' => $service->provider->full_name,
                        'provider_rating' => $service->providerProfile->average_rating ?? 0,
                        'is_active' => $service->is_active,
                        'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                    ];
                });

            // Get provider statistics for this category
            $providerStats = $category->services()
                ->selectRaw('provider_id, COUNT(*) as service_count')
                ->groupBy('provider_id')
                ->with('provider:id,first_name,last_name')
                ->get()
                ->map(function ($stat) {
                    return [
                        'provider_name' => $stat->provider->full_name,
                        'service_count' => $stat->service_count,
                    ];
                })
                ->sortByDesc('service_count')
                ->take(10);

            $categoryData = [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'icon' => $category->icon,
                'color' => $category->color,
                'is_active' => $category->is_active,
                'sort_order' => $category->sort_order,
                'services_count' => [
                    'total' => $totalServices,
                    'active' => $activeServices,
                    'inactive' => $inactiveServices,
                ],
                'recent_services' => $recentServices,
                'top_providers' => $providerStats,
                'created_at' => $category->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $category->updated_at->format('Y-m-d H:i:s'),
            ];

            return response()->json([
                'success' => true,
                'data' => $categoryData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch service category',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Create a new service category
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255|unique:service_categories,name',
                'description' => 'required|string|max:1000',
                'icon' => 'required|string|max:100',
                'color' => 'required|string|max:20',
                'sort_order' => 'nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Get the next sort order if not provided
            $sortOrder = $request->input('sort_order');
            if ($sortOrder === null) {
                $sortOrder = ServiceCategory::max('sort_order') + 1;
            }

            $categoryData = [
                'name' => $request->input('name'),
                'description' => $request->input('description'),
                'icon' => $request->input('icon'),
                'color' => $request->input('color'),
                'sort_order' => $sortOrder,
                'is_active' => true,
            ];

            $category = ServiceCategory::create($categoryData);

            // Log activity
            $this->logCategoryActivity(StaffActivity::ACTION_CREATE, $category, [
                'fields_updated' => array_keys($categoryData),
                'sort_order' => $sortOrder,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service category created successfully',
                'data' => [
                    'category' => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'icon' => $category->icon,
                        'color' => $category->color,
                        'is_active' => $category->is_active,
                        'sort_order' => $category->sort_order,
                        'created_at' => $category->created_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create service category',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Update a service category
     */
    public function update(Request $request, ServiceCategory $category)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255|unique:service_categories,name,' . $category->id,
                'description' => 'sometimes|required|string|max:1000',
                'icon' => 'sometimes|required|string|max:100',
                'color' => 'sometimes|required|string|max:20',
                'sort_order' => 'sometimes|nullable|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->only([
                'name',
                'description',
                'icon',
                'color',
                'sort_order'
            ]);

            // Remove empty values
            $updateData = array_filter($updateData, function ($value) {
                return $value !== null && $value !== '';
            });

            $category->update($updateData);

            // Log activity
            $this->logCategoryActivity(StaffActivity::ACTION_UPDATE, $category, [
                'fields_updated' => array_keys($updateData),
                'changes' => $updateData,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Service category updated successfully',
                'data' => [
                    'category' => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'icon' => $category->icon,
                        'color' => $category->color,
                        'is_active' => $category->is_active,
                        'sort_order' => $category->sort_order,
                        'updated_at' => $category->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update service category',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete a service category
     */
    public function destroy(ServiceCategory $category)
    {
        try {
            // Check if category has any services
            $servicesCount = $category->services()->count();

            if ($servicesCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete category '{$category->name}' because it has {$servicesCount} associated services. Please move or remove these services first."
                ], 400);
            }

            $categoryName = $category->name;
            $category->delete();

            // Log activity
            $this->logCategoryActivity(StaffActivity::ACTION_DELETE, $category, [
                'category_name' => $categoryName,
                'services_count' => $servicesCount,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Service category '{$categoryName}' has been deleted successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete service category',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Toggle category status (active/inactive)
     */
    public function toggleStatus(ServiceCategory $category)
    {
        try {
            $category->is_active = !$category->is_active;
            $category->save();

            $status = $category->is_active ? 'activated' : 'deactivated';

            // Log activity
            $this->logCategoryActivity(
                $category->is_active ? StaffActivity::ACTION_ACTIVATE : StaffActivity::ACTION_DEACTIVATE,
                $category,
                ['new_status' => $category->is_active]
            );

            return response()->json([
                'success' => true,
                'message' => "Category '{$category->name}' has been {$status} successfully",
                'data' => [
                    'category' => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'is_active' => $category->is_active,
                        'updated_at' => $category->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle category status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Bulk update sort order
     */
    public function updateSortOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'categories' => 'required|array',
                'categories.*.id' => 'required|exists:service_categories,id',
                'categories.*.sort_order' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updates = $request->input('categories');

            foreach ($updates as $update) {
                ServiceCategory::where('id', $update['id'])
                    ->update(['sort_order' => $update['sort_order']]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Sort order updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update sort order',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get category analytics
     */
    public function analytics(ServiceCategory $category)
    {
        try {
            $totalServices = $category->services()->count();
            $activeServices = $category->activeServices()->count();

            // Service growth over last 12 months
            $serviceGrowth = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthlyServices = $category->services()
                    ->whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count();

                $serviceGrowth[] = [
                    'month' => $month->format('M Y'),
                    'services' => $monthlyServices
                ];
            }

            // Top providers in this category
            $topProviders = $category->services()
                ->selectRaw('provider_id, COUNT(*) as service_count')
                ->groupBy('provider_id')
                ->orderByDesc('service_count')
                ->with('provider:id,first_name,last_name')
                ->take(10)
                ->get()
                ->map(function ($stat) {
                    return [
                        'provider_name' => $stat->provider->full_name,
                        'service_count' => $stat->service_count,
                    ];
                });

            // Average rating for services in this category
            $avgRating = $category->services()
                ->join('provider_profiles', 'services.provider_id', '=', 'provider_profiles.user_id')
                ->avg('provider_profiles.average_rating') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'basic_stats' => [
                        'total_services' => $totalServices,
                        'active_services' => $activeServices,
                        'inactive_services' => $totalServices - $activeServices,
                        'average_rating' => round($avgRating, 2),
                    ],
                    'service_growth' => $serviceGrowth,
                    'top_providers' => $topProviders,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch category analytics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
}
