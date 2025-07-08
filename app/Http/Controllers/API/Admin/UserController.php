<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Get all users (clients and service providers)
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $role = $request->get('role'); // 'client', 'service_provider', or null for all
            $status = $request->get('status'); // 'active', 'inactive', or null for all
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');

            $query = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER]);

            // Apply search filter
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Apply role filter
            if ($role) {
                $query->where('role', $role);
            }

            // Apply status filter
            if ($status !== null) {
                $isActive = $status === 'active';
                $query->where('is_active', $isActive);
            }

            // Apply sorting
            $allowedSorts = ['created_at', 'first_name', 'last_name', 'email'];
            if (in_array($sortBy, $allowedSorts)) {
                $query->orderBy($sortBy, $sortOrder);
            }

            $users = $query->paginate($perPage);

            // Transform the data
            $users->getCollection()->transform(function ($user) {
                $userData = [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'contact_number' => $user->contact_number,
                    'address' => $user->address,
                    'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                    'age' => $user->age,
                    'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                    'is_active' => $user->is_active,
                    'last_login_at' => $user->last_login_at?->format('Y-m-d H:i:s'),
                    'last_login_human' => $user->last_login_human,
                    'has_recent_activity' => $user->hasRecentActivity(),
                    'created_by' => $user->created_by,
                    'creator_name' => $user->creator?->full_name,
                    'was_created_by_admin' => $user->wasCreatedByAdmin(),
                    'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                ];

                // Add provider-specific data if applicable
                if ($user->role === User::ROLE_SERVICE_PROVIDER && $user->providerProfile) {
                    $userData['provider_profile'] = [
                        'business_name' => $user->providerProfile->business_name,
                        'verification_status' => $user->providerProfile->verification_status,
                        'is_available' => $user->providerProfile->is_available,
                        'average_rating' => $user->providerProfile->average_rating,
                        'total_reviews' => $user->providerProfile->total_reviews,
                    ];
                }

                return $userData;
            });

            return response()->json([
                'success' => true,
                'data' => $users,
                'meta' => [
                    'total_users' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])->count(),
                    'total_clients' => User::where('role', User::ROLE_CLIENT)->count(),
                    'total_providers' => User::where('role', User::ROLE_SERVICE_PROVIDER)->count(),
                    'active_users' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])->where('is_active', true)->count(),
                    'inactive_users' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])->where('is_active', false)->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getStats(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = Carbon::now()->subDays($days);

            $stats = [
                'total_users' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])->count(),
                'new_users_period' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                    ->where('created_at', '>=', $startDate)->count(),
                'clients' => [
                    'total' => User::where('role', User::ROLE_CLIENT)->count(),
                    'active' => User::where('role', User::ROLE_CLIENT)->where('is_active', true)->count(),
                    'new_period' => User::where('role', User::ROLE_CLIENT)->where('created_at', '>=', $startDate)->count(),
                ],
                'providers' => [
                    'total' => User::where('role', User::ROLE_SERVICE_PROVIDER)->count(),
                    'active' => User::where('role', User::ROLE_SERVICE_PROVIDER)->where('is_active', true)->count(),
                    'verified' => User::where('role', User::ROLE_SERVICE_PROVIDER)
                        ->whereHas('providerProfile', function ($q) {
                            $q->where('verification_status', 'verified');
                        })->count(),
                    'new_period' => User::where('role', User::ROLE_SERVICE_PROVIDER)->where('created_at', '>=', $startDate)->count(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get a specific user
     */
    public function show(User $user)
    {
        try {
            // Ensure the user is not admin or staff (only show clients and providers)
            if (in_array($user->role, [User::ROLE_ADMIN, User::ROLE_STAFF])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $userData = [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'role' => $user->role,
                'contact_number' => $user->contact_number,
                'address' => $user->address,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'age' => $user->age,
                'profile_picture' => $user->profile_picture ? Storage::url($user->profile_picture) : null,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at?->format('Y-m-d H:i:s'),
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            ];

            // Add provider-specific data if applicable
            if ($user->role === User::ROLE_SERVICE_PROVIDER && $user->providerProfile) {
                $profile = $user->providerProfile;
                $userData['provider_profile'] = [
                    'business_name' => $profile->business_name,
                    'years_of_experience' => $profile->years_of_experience,
                    'service_area_radius' => $profile->service_area_radius,
                    'bio' => $profile->bio,
                    'verification_status' => $profile->verification_status,
                    'is_available' => $profile->is_available,
                    'average_rating' => $profile->average_rating,
                    'total_reviews' => $profile->total_reviews,
                    'total_earnings' => $profile->total_earnings,
                    'verified_at' => $profile->verified_at?->format('Y-m-d H:i:s'),
                    'created_at' => $profile->created_at->format('Y-m-d H:i:s'),
                ];

                // Add services count
                $userData['services_count'] = $user->services()->count();
                $userData['active_services_count'] = $user->services()->where('is_active', true)->count();
            }

            // Add appointments count (if appointments table exists)
            if (class_exists('\App\Models\Appointment')) {
                if ($user->role === User::ROLE_CLIENT) {
                    $userData['appointments_count'] = $user->clientAppointments()->count();
                } else {
                    $userData['appointments_count'] = $user->providerAppointments()->count();
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => $userData
                ]
            ]);
        } catch (\Exception $e) {
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
            // Ensure the user is not admin or staff
            if (in_array($user->role, [User::ROLE_ADMIN, User::ROLE_STAFF])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot modify admin or staff accounts'
                ], 403);
            }

            $user->is_active = !$user->is_active;
            $user->save();

            $status = $user->is_active ? 'activated' : 'deactivated';

            return response()->json([
                'success' => true,
                'message' => "User has been {$status} successfully",
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'full_name' => $user->full_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'is_active' => $user->is_active,
                        'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle user status',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Delete a user
     */
    public function destroy(User $user)
    {
        try {
            // Ensure the user is not admin or staff
            if (in_array($user->role, [User::ROLE_ADMIN, User::ROLE_STAFF])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete admin or staff accounts'
                ], 403);
            }

            // Store user name before deletion
            $userName = $user->full_name;
            $userRole = $user->role;

            // Delete profile picture if exists
            if ($user->profile_picture) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // If service provider, handle provider profile deletion
            if ($user->role === User::ROLE_SERVICE_PROVIDER && $user->providerProfile) {
                // Delete provider documents
                if ($user->providerProfile->business_license_url) {
                    Storage::disk('public')->delete($user->providerProfile->business_license_url);
                }

                if ($user->providerProfile->certification_urls) {
                    $certifications = json_decode($user->providerProfile->certification_urls, true);
                    if (is_array($certifications)) {
                        foreach ($certifications as $cert) {
                            Storage::disk('public')->delete($cert);
                        }
                    }
                }

                if ($user->providerProfile->portfolio_image_urls) {
                    $portfolios = json_decode($user->providerProfile->portfolio_image_urls, true);
                    if (is_array($portfolios)) {
                        foreach ($portfolios as $portfolio) {
                            Storage::disk('public')->delete($portfolio);
                        }
                    }
                }
            }

            $user->delete();

            return response()->json([
                'success' => true,
                'message' => "{$userRole} '{$userName}' has been deleted successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete user',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get users report
     */
    public function getUsersReport(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $startDate = Carbon::now()->subDays($days);

            // Registration trends
            $registrationTrends = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $clientsCount = User::where('role', User::ROLE_CLIENT)
                    ->whereDate('created_at', $date->toDateString())
                    ->count();
                $providersCount = User::where('role', User::ROLE_SERVICE_PROVIDER)
                    ->whereDate('created_at', $date->toDateString())
                    ->count();

                $registrationTrends[] = [
                    'date' => $date->format('Y-m-d'),
                    'clients' => $clientsCount,
                    'providers' => $providersCount,
                    'total' => $clientsCount + $providersCount
                ];
            }

            // Top performing providers
            $topProviders = User::where('role', User::ROLE_SERVICE_PROVIDER)
                ->whereHas('providerProfile')
                ->with('providerProfile')
                ->get()
                ->sortByDesc(function ($user) {
                    return $user->providerProfile->average_rating ?? 0;
                })
                ->take(10)
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'business_name' => $user->providerProfile->business_name,
                        'rating' => $user->providerProfile->average_rating,
                        'reviews' => $user->providerProfile->total_reviews,
                        'services_count' => $user->services()->count(),
                    ];
                });

            // Most active users (recent activity)
            $activeUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                ->where('updated_at', '>=', $startDate)
                ->orderBy('updated_at', 'desc')
                ->take(20)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'role' => $user->role,
                        'last_activity' => $user->updated_at->format('Y-m-d H:i:s'),
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $days,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => Carbon::now()->format('Y-m-d'),
                    'registration_trends' => $registrationTrends,
                    'top_providers' => $topProviders,
                    'active_users' => $activeUsers,
                    'summary' => [
                        'new_registrations' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                            ->where('created_at', '>=', $startDate)->count(),
                        'total_active' => User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                            ->where('is_active', true)->count(),
                        'verification_pending' => User::where('role', User::ROLE_SERVICE_PROVIDER)
                            ->whereHas('providerProfile', function ($q) {
                                $q->where('verification_status', 'pending');
                            })->count(),
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate users report',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
}
