<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function getStats(Request $request)
    {
        try {
            // User statistics
            $totalUsers = User::count();
            $totalClients = User::where('role', User::ROLE_CLIENT)->count();
            $totalProviders = User::where('role', User::ROLE_SERVICE_PROVIDER)->count();
            $totalStaff = User::where('role', User::ROLE_STAFF)->count();
            $activeUsers = User::where('is_active', true)->count();
            $inactiveUsers = User::where('is_active', false)->count();

            // Recent user registrations (last 30 days)
            $recentRegistrations = User::where('created_at', '>=', Carbon::now()->subDays(30))
                ->whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                ->count();

            // Service statistics
            $totalServices = Service::count();
            $activeServices = Service::where('is_active', true)->count();
            $totalCategories = ServiceCategory::count();

            // Appointment statistics (if you have appointments)
            $appointmentStats = [];
            if (class_exists('\App\Models\Appointment')) {
                $appointmentStats = [
                    'total_appointments' => Appointment::count(),
                    'pending_appointments' => Appointment::where('status', 'pending')->count(),
                    'completed_appointments' => Appointment::where('status', 'completed')->count(),
                    'cancelled_appointments' => Appointment::where('status', 'cancelled')->count(),
                ];
            }

            // User growth over last 12 months
            $userGrowth = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $monthlyUsers = User::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                    ->count();

                $userGrowth[] = [
                    'month' => $month->format('M Y'),
                    'users' => $monthlyUsers
                ];
            }

            // Top service categories by service count
            $topCategories = ServiceCategory::withCount('services')
                ->orderBy('services_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($category) {
                    return [
                        'name' => $category->name,
                        'service_count' => $category->services_count
                    ];
                });

            // Recent users (last 10)
            $recentUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                        'is_active' => $user->is_active
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => [
                        'total' => $totalUsers,
                        'clients' => $totalClients,
                        'providers' => $totalProviders,
                        'staff' => $totalStaff,
                        'active' => $activeUsers,
                        'inactive' => $inactiveUsers,
                        'recent_registrations' => $recentRegistrations
                    ],
                    'services' => [
                        'total' => $totalServices,
                        'active' => $activeServices,
                        'categories' => $totalCategories
                    ],
                    'appointments' => $appointmentStats,
                    'charts' => [
                        'user_growth' => $userGrowth,
                        'top_categories' => $topCategories
                    ],
                    'recent_users' => $recentUsers
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get admin dashboard overview
     */
    public function index(Request $request)
    {
        try {
            // Get basic stats for dashboard
            $stats = $this->getStats($request);

            if (!$stats->getData()->success) {
                return $stats;
            }

            // Additional dashboard-specific data
            $dashboardData = [
                'welcome_message' => 'Welcome to HireMe Admin Dashboard',
                'user' => [
                    'name' => auth()->user()->full_name,
                    'email' => auth()->user()->email,
                    'last_login' => auth()->user()->updated_at->format('Y-m-d H:i:s')
                ],
                'quick_actions' => [
                    [
                        'title' => 'Manage Staff',
                        'description' => 'Create and manage staff accounts',
                        'icon' => 'fas fa-users-cog',
                        'url' => '/api/admin/staff',
                        'color' => 'primary'
                    ],
                    [
                        'title' => 'User Management',
                        'description' => 'View and manage all users',
                        'icon' => 'fas fa-users',
                        'url' => '/api/admin/users',
                        'color' => 'info'
                    ],
                    [
                        'title' => 'System Reports',
                        'description' => 'Generate system reports',
                        'icon' => 'fas fa-chart-bar',
                        'url' => '/api/admin/reports',
                        'color' => 'success'
                    ],
                    [
                        'title' => 'Settings',
                        'description' => 'System configuration',
                        'icon' => 'fas fa-cogs',
                        'url' => '/api/admin/settings',
                        'color' => 'warning'
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => array_merge($stats->getData()->data, $dashboardData)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get overview report for admin
     */
    public function getOverviewReport(Request $request)
    {
        try {
            // Default to last 30 days if not specified
            $days = $request->get('days', 30);
            $startDate = Carbon::now()->subDays($days);

            // User statistics for the period
            $userStats = [
                'new_users' => User::where('created_at', '>=', $startDate)
                    ->whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                    ->count(),
                'new_clients' => User::where('created_at', '>=', $startDate)
                    ->where('role', User::ROLE_CLIENT)
                    ->count(),
                'new_providers' => User::where('created_at', '>=', $startDate)
                    ->where('role', User::ROLE_SERVICE_PROVIDER)
                    ->count(),
            ];

            // Service statistics for the period
            $serviceStats = [
                'new_services' => Service::where('created_at', '>=', $startDate)->count(),
                'active_services' => Service::where('is_active', true)->count(),
            ];

            // Daily breakdown
            $dailyBreakdown = [];
            for ($i = $days - 1; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dailyUsers = User::whereDate('created_at', $date->toDateString())
                    ->whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                    ->count();

                $dailyBreakdown[] = [
                    'date' => $date->format('Y-m-d'),
                    'users' => $dailyUsers
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'period' => $days,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => Carbon::now()->format('Y-m-d'),
                    'user_stats' => $userStats,
                    'service_stats' => $serviceStats,
                    'daily_breakdown' => $dailyBreakdown
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate overview report',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get activities report
     */
    public function getActivitiesReport(Request $request)
    {
        try {
            // Default limit for recent activities
            $limit = $request->get('limit', 10);

            // Recent user activities (registrations, profile updates)
            $recentActivities = collect();

            // Recent user registrations
            $recentRegistrations = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
                ->orderBy('created_at', 'desc')
                ->take($limit)
                ->get()
                ->map(function ($user) {
                    return [
                        'type' => 'user_registration',
                        'description' => "New {$user->role} registered: {$user->full_name}",
                        'user' => $user->full_name,
                        'timestamp' => $user->created_at,
                        'details' => [
                            'user_id' => $user->id,
                            'role' => $user->role,
                            'email' => $user->email
                        ]
                    ];
                });

            // Merge recent registrations into activities
            $recentActivities = $recentActivities->merge($recentRegistrations);

            // Recent service creations
            $recentServices = Service::with('provider')
                ->orderBy('created_at', 'desc')
                ->take($limit)
                ->get()
                ->map(function ($service) {
                    return [
                        'type' => 'service_creation',
                        'description' => "New service created: {$service->title}",
                        'user' => $service->provider->full_name,
                        'timestamp' => $service->created_at,
                        'details' => [
                            'service_id' => $service->id,
                            'service_title' => $service->title,
                            'provider_id' => $service->provider_id
                        ]
                    ];
                });

            // Merge recent services into activities
            $recentActivities = $recentActivities->merge($recentServices);

            // Sort by timestamp and take the most recent
            $sortedActivities = $recentActivities
                ->sortByDesc('timestamp')
                ->take($limit)
                ->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'activities' => $sortedActivities,
                    'total_count' => $sortedActivities->count()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activities report',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }
}
