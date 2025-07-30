<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\LogsActivity;
use App\Models\User;
use App\Models\ProviderProfile;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    use LogsActivity;

    /**
     * Get all users with filtering and pagination
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $role = $request->get('role'); // 'client', 'provider', or null for all
            $status = $request->get('status'); // 'active', 'inactive', or null for all
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = User::query()
                ->whereIn('role', ['client', 'service_provider']); // Exclude admin and staff

            // Apply role filter
            if ($role) {
                if ($role === 'provider') {
                    $query->where('role', 'service_provider');
                } elseif ($role === 'client') {
                    $query->where('role', 'client');
                }
            }

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('contact_number', 'like', "%{$search}%");
                });
            }

            // Apply status filter
            if ($status !== null) {
                $isActive = $status === 'active';
                $query->where('is_active', $isActive);
            }

            // Apply sorting
            $allowedSortFields = ['first_name', 'last_name', 'email', 'role', 'created_at', 'updated_at'];
            if (in_array($sortBy, $allowedSortFields)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Load relationships for providers
            $query->with(['providerProfile:user_id,business_name,verification_status,years_of_experience,total_earnings']);

            $users = $query->paginate($perPage);

            // Transform the data
            $users->getCollection()->transform(function ($user) {

                $userData = [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'contact_number' => $user->contact_number,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'profile_picture' => $user->profile_picture,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];

                // Add provider-specific data
                if ($user->role === 'service_provider' && $user->providerProfile) {
                    $userData['provider_profile'] = [
                        'business_name' => $user->providerProfile->business_name,
                        'verification_status' => $user->providerProfile->verification_status,
                        'is_verified' => $user->providerProfile->verification_status === 'verified',
                        'years_of_experience' => $user->providerProfile->years_of_experience,
                        'total_earnings' => $user->providerProfile->total_earnings,
                        'services_count' => $user->services()->count(),
                    ];
                }


                return $userData;
            });

            return response()->json([
                'success' => true,
                'data' => $users,
                'meta' => [
                    'total_users' => User::whereIn('role', ['client', 'provider'])->count(),
                    'total_clients' => User::where('role', 'client')->count(),
                    'total_providers' => User::where('role', 'provider')->count(),
                    'active_users' => User::whereIn('role', ['client', 'provider'])->where('is_active', true)->count(),
                    'inactive_users' => User::whereIn('role', ['client', 'provider'])->where('is_active', false)->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch users: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get clients only
     */
    public function clients(Request $request)
    {
        $request->merge(['role' => 'client']);
        return $this->index($request);
    }

    /**
     * Get providers only
     */
    public function providers(Request $request)
    {
        $request->merge(['role' => 'provider']); // This gets mapped to service_provider in the main method
        return $this->index($request);
    }

    /**
     * Get a specific user with detailed information
     */
    public function show(User $user)
    {
        try {
            // Check if user is client or provider
            if (!in_array($user->role, ['client', 'service_provider'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found or access denied'
                ], 404);
            }

            $userData = [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'contact_number' => $user->contact_number,
                'role' => $user->role,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
                'profile_picture' => $user->profile_picture,
                'date_of_birth' => $user->date_of_birth,
                'address' => $user->address,
                'city' => $user->city,
                'state' => $user->state,
                'country' => $user->country,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            ];

            // Add provider-specific data
            if ($user->role === 'service_provider') {
                $user->load(['providerProfile', 'services']);

                if ($user->providerProfile) {
                    $userData['provider_profile'] = [
                        'business_name' => $user->providerProfile->business_name,
                        'bio' => $user->providerProfile->bio,
                        'years_of_experience' => $user->providerProfile->years_of_experience,
                        'service_area_radius' => $user->providerProfile->service_area_radius,
                        'verification_status' => $user->providerProfile->verification_status,
                        'is_verified' => $user->providerProfile->verification_status === 'verified',
                        'verification_notes' => $user->providerProfile->verification_notes,
                        'certifications' => $user->providerProfile->certifications,
                        'portfolio_images' => $user->providerProfile->portfolio_images,
                        'business_license' => $user->providerProfile->business_license,
                        'total_earnings' => $user->providerProfile->total_earnings,
                        'is_available' => $user->providerProfile->is_available,
                        'verified_at' => $user->providerProfile->verified_at,
                    ];
                }

                // Get provider services
                $userData['services'] = $user->services()->with('category:id,name,color,icon')->get()->map(function ($service) {
                    return [
                        'id' => $service->id,
                        'title' => $service->title,
                        'category' => $service->category,
                        'price' => $service->price,
                        'is_active' => $service->is_active,
                        'created_at' => $service->created_at->format('Y-m-d H:i:s'),
                    ];
                });

                // Get provider statistics
                $userData['statistics'] = [
                    'total_services' => $user->services()->count(),
                    'active_services' => $user->services()->where('is_active', true)->count(),
                    'total_appointments' => $user->providerAppointments()->count(),
                    'completed_appointments' => $user->providerAppointments()->where('status', 'completed')->count(),
                    'total_earnings' => $user->providerAppointments()->where('status', 'completed')->sum('total_amount'),
                ];
            }

            // Add client-specific data
            if ($user->role === 'client') {
                $user->load(['clientAppointments.service', 'clientAppointments.provider']);

                // Get client appointments
                $userData['recent_appointments'] = $user->clientAppointments()
                    ->with(['service:id,title', 'provider:id,first_name,last_name'])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($appointment) {
                        return [
                            'id' => $appointment->id,
                            'service_title' => $appointment->service->title,
                            'provider_name' => $appointment->provider->full_name,
                            'scheduled_at' => $appointment->scheduled_at,
                            'status' => $appointment->status,
                            'total_amount' => $appointment->total_amount,
                        ];
                    });

                // Get client statistics
                $userData['statistics'] = [
                    'total_appointments' => $user->clientAppointments()->count(),
                    'completed_appointments' => $user->clientAppointments()->where('status', 'completed')->count(),
                    'total_spent' => $user->clientAppointments()->where('status', 'completed')->sum('total_amount'),
                    'favorite_categories' => $this->getFavoriteCategories($user),
                ];
            }

            // Log activity
            // $this->logUserActivity(StaffActivity::ACTION_VIEW, $user, [
            //     'view_type' => 'detailed_profile',
            //     'role' => $user->role,
            // ]);

            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user details',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Toggle user status (active/inactive)
     */
    public function toggleStatus(User $user)
    {
        try {
            // Check if user is client or provider
            if (!in_array($user->role, ['client', 'service_provider'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found or access denied'
                ], 404);
            }

            $user->is_active = !$user->is_active;
            $user->save();

            $status = $user->is_active ? 'activated' : 'deactivated';

            // Log activity
            // $this->logUserActivity(
            //     $user->is_active ? StaffActivity::ACTION_ACTIVATE : StaffActivity::ACTION_DEACTIVATE,
            //     $user,
            //     ['new_status' => $user->is_active, 'role' => $user->role]
            // );

            return response()->json([
                'success' => true,
                'message' => ucfirst($user->role) . " '{$user->full_name}' has been {$status} successfully",
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'is_active' => $user->is_active,
                        'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to toggle user status: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle user status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function statistics(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);

            $stats = [
                'total_users' => User::whereIn('role', ['client', 'service_provider'])->count(),
                'total_clients' => User::where('role', 'client')->count(),
                'total_providers' => User::where('role', 'service_provider')->count(),
                'active_users' => User::whereIn('role', ['client', 'service_provider'])->where('is_active', true)->count(),
                'inactive_users' => User::whereIn('role', ['client', 'service_provider'])->where('is_active', false)->count(),
                'verified_providers' => ProviderProfile::where('verification_status', 'verified')->count(),
                'unverified_providers' => ProviderProfile::where('verification_status', '!=', 'verified')->count(),
                'new_registrations' => [
                    'clients' => User::where('role', 'client')->where('created_at', '>=', $startDate)->count(),
                    'providers' => User::where('role', 'service_provider')->where('created_at', '>=', $startDate)->count(),
                ],
                'growth_data' => $this->getUserGrowthData($days),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user statistics: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get user growth data for charts
     */
    private function getUserGrowthData($days = 30)
    {
        $data = [];
        $startDate = now()->subDays($days);

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i);
            $clients = User::where('role', 'client')
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->count();
            $providers = User::where('role', 'service_provider')
                ->whereDate('created_at', $date->format('Y-m-d'))
                ->count();

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'clients' => $clients,
                'providers' => $providers,
                'total' => $clients + $providers,
            ];
        }

        return $data;
    }

    /**
     * Get client's favorite service categories
     */
    private function getFavoriteCategories($client)
    {
        return $client->clientAppointments()
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->join('service_categories', 'services.category_id', '=', 'service_categories.id')
            ->selectRaw('service_categories.name, service_categories.color, service_categories.icon, COUNT(*) as count')
            ->groupBy('service_categories.id', 'service_categories.name', 'service_categories.color', 'service_categories.icon')
            ->orderByDesc('count')
            ->take(3)
            ->get()
            ->map(function ($category) {
                return [
                    'name' => $category->name,
                    'color' => $category->color,
                    'icon' => $category->icon,
                    'appointments_count' => $category->count,
                ];
            });
    }
}
