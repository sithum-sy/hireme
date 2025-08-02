<?php

namespace App\Services;

use App\Models\User;
use App\Models\ServiceCategory;
use App\Models\Service;
use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatisticsService
{
    /**
     * Get comprehensive platform statistics
     */
    public function getPlatformStats($cacheMinutes = 5)
    {
        return Cache::remember('platform_stats', $cacheMinutes, function () {
            return [
                'users' => $this->getUserStatistics(),
                'services' => $this->getServiceStatistics(),
                'categories' => $this->getCategoryStatistics(),
                'appointments' => $this->getAppointmentStatistics(),
                'platform_health' => $this->getPlatformHealthStats(),
                'trends' => $this->getTrendData(),
            ];
        });
    }

    /**
     * Get user statistics
     */
    public function getUserStatistics()
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Base user counts
        $totalUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])->count();
        $activeUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
            ->where('is_active', true)->count();

        // Client statistics
        $clientStats = [
            'total' => User::where('role', User::ROLE_CLIENT)->count(),
            'active' => User::where('role', User::ROLE_CLIENT)->where('is_active', true)->count(),
            'new_today' => User::where('role', User::ROLE_CLIENT)->whereDate('created_at', $today)->count(),
            'new_this_week' => User::where('role', User::ROLE_CLIENT)->where('created_at', '>=', $thisWeek)->count(),
            'new_this_month' => User::where('role', User::ROLE_CLIENT)->where('created_at', '>=', $thisMonth)->count(),
        ];

        // Provider statistics
        $providerStats = [
            'total' => User::where('role', User::ROLE_SERVICE_PROVIDER)->count(),
            'active' => User::where('role', User::ROLE_SERVICE_PROVIDER)->where('is_active', true)->count(),
            'verified' => User::where('role', User::ROLE_SERVICE_PROVIDER)
                ->whereHas('providerProfile', function ($query) {
                    $query->where('verification_status', 'verified');
                })->count(),
            'pending' => User::where('role', User::ROLE_SERVICE_PROVIDER)
                ->whereHas('providerProfile', function ($query) {
                    $query->where('verification_status', 'pending');
                })->count(),
            'new_today' => User::where('role', User::ROLE_SERVICE_PROVIDER)->whereDate('created_at', $today)->count(),
            'new_this_week' => User::where('role', User::ROLE_SERVICE_PROVIDER)->where('created_at', '>=', $thisWeek)->count(),
        ];

        // Growth calculations
        $userGrowth = $this->calculateUserGrowth($thisMonth, $lastMonth);

        return [
            'overview' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'inactive' => $totalUsers - $activeUsers,
                'growth_rate' => $userGrowth['total_growth'],
            ],
            'clients' => array_merge($clientStats, [
                'growth_rate' => $userGrowth['client_growth'],
                'inactive' => $clientStats['total'] - $clientStats['active'],
            ]),
            'providers' => array_merge($providerStats, [
                'growth_rate' => $userGrowth['provider_growth'],
                'inactive' => $providerStats['total'] - $providerStats['active'],
                'unverified' => $providerStats['total'] - $providerStats['verified'],
            ]),
            'activity' => [
                'recent_logins' => $this->getRecentLoginStats(),
                'top_active_users' => $this->getTopActiveUsers(),
            ],
        ];
    }

    /**
     * Get service statistics
     */
    public function getServiceStatistics()
    {
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        $totalServices = Service::count();
        $activeServices = Service::where('is_active', true)->count();

        return [
            'overview' => [
                'total' => $totalServices,
                'active' => $activeServices,
                'inactive' => $totalServices - $activeServices,
                'new_this_week' => Service::where('created_at', '>=', $thisWeek)->count(),
                'new_this_month' => Service::where('created_at', '>=', $thisMonth)->count(),
            ],
            'by_category' => $this->getServicesByCategoryStats(),
            'by_provider' => $this->getServicesByProviderStats(),
            'performance' => [
                'most_popular' => $this->getMostPopularServices(),
                'recently_added' => $this->getRecentlyAddedServices(),
            ],
        ];
    }

    /**
     * Get category statistics
     */
    public function getCategoryStatistics()
    {
        $totalCategories = ServiceCategory::count();
        $activeCategories = ServiceCategory::where('is_active', true)->count();

        return [
            'overview' => [
                'total' => $totalCategories,
                'active' => $activeCategories,
                'inactive' => $totalCategories - $activeCategories,
            ],
            'usage' => ServiceCategory::withCount('services')
                ->orderBy('services_count', 'desc')
                ->get()
                ->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'services_count' => $category->services_count,
                        'is_active' => $category->is_active,
                        'color' => $category->color,
                        'icon' => $category->icon,
                    ];
                }),
            'popular' => ServiceCategory::withCount('services')
                ->orderBy('services_count', 'desc')
                ->take(5)
                ->get()
                ->map(function ($category) {
                    return [
                        'name' => $category->name,
                        'count' => $category->services_count,
                        'color' => $category->color,
                    ];
                }),
        ];
    }

    /**
     * Get appointment statistics
     */
    public function getAppointmentStatistics()
    {
        if (!class_exists('App\Models\Appointment')) {
            return [
                'overview' => [
                    'total' => 0,
                    'today' => 0,
                    'this_week' => 0,
                    'this_month' => 0,
                ],
                'by_status' => [],
                'recent' => [],
            ];
        }

        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'overview' => [
                'total' => Appointment::count(),
                'today' => Appointment::whereDate('created_at', $today)->count(),
                'this_week' => Appointment::where('created_at', '>=', $thisWeek)->count(),
                'this_month' => Appointment::where('created_at', '>=', $thisMonth)->count(),
            ],
            'by_status' => [
                'pending' => Appointment::where('status', 'pending')->count(),
                'confirmed' => Appointment::where('status', 'confirmed')->count(),
                'completed' => Appointment::where('status', 'completed')->count(),
                'cancelled' => Appointment::where('status', 'cancelled')->count(),
            ],
            'recent' => Appointment::with(['client', 'provider'])
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'client_name' => $appointment->client->full_name,
                        'provider_name' => $appointment->provider->full_name,
                        'status' => $appointment->status,
                        'created_at' => $appointment->created_at->diffForHumans(),
                    ];
                }),
        ];
    }

    /**
     * Get platform health statistics
     */
    public function getPlatformHealthStats()
    {
        return [
            'database_status' => $this->checkDatabaseHealth(),
            'active_sessions' => $this->getActiveSessionsCount(),
            'system_performance' => [
                'avg_response_time' => '< 200ms', // This would come from monitoring
                'uptime' => '99.9%', // This would come from monitoring
                'error_rate' => '< 0.1%', // This would come from logs
            ],
            'storage' => [
                'disk_usage' => $this->getDiskUsage(),
                'database_size' => $this->getDatabaseSize(),
            ],
            'security' => [
                'failed_logins_today' => $this->getFailedLoginsToday(),
                'active_staff' => User::where('role', User::ROLE_STAFF)->where('is_active', true)->count(),
            ],
        ];
    }

    /**
     * Get trend data for charts
     */
    public function getTrendData($days = 30)
    {
        $startDate = Carbon::now()->subDays($days);

        // Get individual trend data
        $userTrend = $this->getUserRegistrationTrend($startDate);
        $serviceTrend = $this->getServiceCreationTrend($startDate);
        $appointmentTrend = $this->getAppointmentBookingTrend($startDate);

        // Combine all trends into a single chart format
        $combinedTrend = $this->combineTrendData($userTrend, $serviceTrend, $appointmentTrend, $days);

        return [
            'user_registrations' => $combinedTrend,
            'service_creation' => $this->getServiceCreationTrend($startDate),
            'appointment_bookings' => $this->getAppointmentBookingTrend($startDate),
            'category_usage' => $this->getCategoryUsageTrend($startDate),
        ];
    }

    // =====================================
    // PRIVATE HELPER METHODS
    // =====================================

    /**
     * Calculate user growth rates
     */
    private function calculateUserGrowth($thisMonth, $lastMonth)
    {
        $thisMonthUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
            ->where('created_at', '>=', $thisMonth)->count();
        $lastMonthUsers = User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
            ->whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        $thisMonthClients = User::where('role', User::ROLE_CLIENT)
            ->where('created_at', '>=', $thisMonth)->count();
        $lastMonthClients = User::where('role', User::ROLE_CLIENT)
            ->whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        $thisMonthProviders = User::where('role', User::ROLE_SERVICE_PROVIDER)
            ->where('created_at', '>=', $thisMonth)->count();
        $lastMonthProviders = User::where('role', User::ROLE_SERVICE_PROVIDER)
            ->whereBetween('created_at', [$lastMonth, $thisMonth])->count();

        return [
            'total_growth' => $this->calculateGrowthRate($thisMonthUsers, $lastMonthUsers),
            'client_growth' => $this->calculateGrowthRate($thisMonthClients, $lastMonthClients),
            'provider_growth' => $this->calculateGrowthRate($thisMonthProviders, $lastMonthProviders),
        ];
    }

    /**
     * Calculate growth rate percentage
     */
    private function calculateGrowthRate($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    /**
     * Get recent login statistics
     */
    private function getRecentLoginStats()
    {
        return [
            'last_hour' => User::where('last_login_at', '>=', now()->subHour())->count(),
            'last_day' => User::where('last_login_at', '>=', now()->subDay())->count(),
            'last_week' => User::where('last_login_at', '>=', now()->subWeek())->count(),
        ];
    }

    /**
     * Get top active users
     */
    private function getTopActiveUsers()
    {
        return User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
            ->whereNotNull('last_login_at')
            ->orderBy('last_login_at', 'desc')
            ->take(5)
            ->get(['id', 'first_name', 'last_name', 'role', 'last_login_at'])
            ->map(function ($user) {
                return [
                    'name' => $user->full_name,
                    'role' => $user->role,
                    'last_login' => $user->last_login_at->diffForHumans(),
                ];
            });
    }

    /**
     * Get services by category statistics
     */
    private function getServicesByCategoryStats()
    {
        return ServiceCategory::withCount('services')
            ->having('services_count', '>', 0)
            ->orderBy('services_count', 'desc')
            ->get()
            ->map(function ($category) {
                return [
                    'category' => $category->name ?? 'Unknown',
                    'count' => $category->services_count ?? 0,
                    'color' => $category->color ?? '#000000',
                ];
            });
    }

    /**
     * Get services by provider statistics
     */
    private function getServicesByProviderStats()
    {
        return User::where('role', User::ROLE_SERVICE_PROVIDER)
            ->withCount('services')
            ->having('services_count', '>', 0)
            ->orderBy('services_count', 'desc')
            ->take(10)
            ->get()
            ->map(function ($provider) {
                return [
                    'provider' => $provider->full_name ?? 'Unknown Provider',
                    'count' => $provider->services_count ?? 0,
                ];
            });
    }

    /**
     * Get most popular services
     */
    private function getMostPopularServices()
    {
        return Service::with(['provider', 'category'])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc') // This could be by bookings/views when available
            ->take(5)
            ->get()
            ->map(function ($service) {
                return [
                    'title' => $service->title,
                    'provider' => $service->provider->full_name,
                    'category' => $service->category->name,
                    'created_at' => $service->created_at->diffForHumans(),
                ];
            });
    }

    /**
     * Get recently added services
     */
    private function getRecentlyAddedServices()
    {
        return Service::with(['provider', 'category'])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($service) {
                return [
                    'title' => $service->title,
                    'provider' => $service->provider->full_name,
                    'category' => $service->category->name,
                    'is_active' => $service->is_active,
                    'created_at' => $service->created_at->diffForHumans(),
                ];
            });
    }

    /**
     * Get user registration trend
     */
    private function getUserRegistrationTrend($startDate)
    {
        return User::whereIn('role', [User::ROLE_CLIENT, User::ROLE_SERVICE_PROVIDER])
            ->where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Get service creation trend
     */
    private function getServiceCreationTrend($startDate)
    {
        return Service::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Get appointment booking trend
     */
    private function getAppointmentBookingTrend($startDate)
    {
        if (!class_exists('App\Models\Appointment')) {
            return collect();
        }

        return Appointment::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Get category usage trend
     */
    private function getCategoryUsageTrend($startDate)
    {
        return Service::join('service_categories', 'services.category_id', '=', 'service_categories.id')
            ->where('services.created_at', '>=', $startDate)
            ->selectRaw('service_categories.name as category, COUNT(*) as count')
            ->groupBy('service_categories.name')
            ->orderBy('count', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category,
                    'count' => $item->count,
                ];
            });
    }

    /**
     * Check database health
     */
    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            return 'healthy';
        } catch (\Exception $e) {
            return 'unhealthy';
        }
    }

    /**
     * Get active sessions count
     */
    private function getActiveSessionsCount()
    {
        return User::where('last_login_at', '>=', now()->subMinutes(30))->count();
    }

    /**
     * Get disk usage (mock implementation)
     */
    private function getDiskUsage()
    {
        return [
            'used' => '2.5 GB',
            'total' => '100 GB',
            'percentage' => 2.5,
        ];
    }

    /**
     * Get database size (mock implementation)
     */
    private function getDatabaseSize()
    {
        return [
            'size' => '150 MB',
            'tables' => DB::connection()->getDoctrineSchemaManager()->listTableNames(),
        ];
    }

    /**
     * Get failed logins today
     */
    private function getFailedLoginsToday()
    {
        // This would typically come from a login_attempts table
        return 0;
    }

    /**
     * Combine different trend data into a single format for the chart
     */
    private function combineTrendData($userTrend, $serviceTrend, $appointmentTrend, $days)
    {
        // Create date range for the chart
        $dates = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $dates[] = Carbon::now()->subDays($i)->format('Y-m-d');
        }

        // Initialize combined data
        $combinedData = [];
        
        foreach ($dates as $date) {
            // Find data for this date - handle both array and object formats
            $userItem = $userTrend->firstWhere('date', $date);
            $serviceItem = $serviceTrend->firstWhere('date', $date);
            $appointmentItem = $appointmentTrend->firstWhere('date', $date);

            $userCount = 0;
            $serviceCount = 0;
            $appointmentCount = 0;

            // Handle different data formats
            if ($userItem) {
                $userCount = is_array($userItem) ? $userItem['count'] : $userItem->count;
            }
            if ($serviceItem) {
                $serviceCount = is_array($serviceItem) ? $serviceItem['count'] : $serviceItem->count;
            }
            if ($appointmentItem) {
                $appointmentCount = is_array($appointmentItem) ? $appointmentItem['count'] : $appointmentItem->count;
            }

            $combinedData[] = [
                'date' => $date,
                'users' => (int) $userCount,
                'services' => (int) $serviceCount,
                'appointments' => (int) $appointmentCount,
                'user_registrations' => (int) $userCount, // Alternative field name
                'services_created' => (int) $serviceCount, // Alternative field name
                'appointments_created' => (int) $appointmentCount, // Alternative field name
            ];
        }

        return $combinedData;
    }
}
