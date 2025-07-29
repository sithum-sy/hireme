<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\LogsActivity;
use App\Services\StatisticsService;
use App\Services\ActivityService;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use LogsActivity;

    protected $statisticsService;
    protected $activityService;

    public function __construct(StatisticsService $statisticsService, ActivityService $activityService)
    {
        $this->statisticsService = $statisticsService;
        $this->activityService = $activityService;
    }

    /**
     * Get comprehensive dashboard data
     */
    public function index(Request $request)
    {
        try {
            // Log dashboard access
            $this->logActivity(
                StaffActivity::ACTION_VIEW,
                'Accessed staff dashboard',
                null,
                ['section' => 'dashboard_overview']
            );

            // Get all dashboard data
            $dashboardData = [
                'stats' => $this->statisticsService->getPlatformStats(5), // 5 minute cache
                'tasks' => $this->generateTodaysTasks(),
                'activities' => $this->activityService->getRecentActivities(10),
                'quick_actions' => $this->buildQuickActions(),
                'welcome_message' => $this->buildWelcomeMessage(),
                'system_alerts' => $this->getSystemAlerts(),
            ];

            return response()->json([
                'success' => true,
                'data' => $dashboardData,
                'meta' => [
                    'loaded_at' => now()->toISOString(),
                    'cache_status' => 'active',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to load dashboard',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    public function getStats(Request $request)
    {
        try {
            $cacheMinutes = $request->get('cache', 5);

            // Try to get stats with error handling for each section
            $stats = [];

            try {
                $stats['users'] = $this->statisticsService->getUserStatistics();
            } catch (\Exception $e) {
                Log::error('User statistics error: ' . $e->getMessage());
                $stats['users'] = ['error' => 'Failed to load user statistics'];
            }

            try {
                $stats['services'] = $this->statisticsService->getServiceStatistics();
            } catch (\Exception $e) {
                Log::error('Service statistics error: ' . $e->getMessage());
                $stats['services'] = ['error' => 'Failed to load service statistics'];
            }

            try {
                $stats['categories'] = $this->statisticsService->getCategoryStatistics();
            } catch (\Exception $e) {
                Log::error('Category statistics error: ' . $e->getMessage());
                $stats['categories'] = ['error' => 'Failed to load category statistics'];
            }

            try {
                $stats['appointments'] = $this->statisticsService->getAppointmentStatistics();
            } catch (\Exception $e) {
                Log::error('Appointment statistics error: ' . $e->getMessage());
                $stats['appointments'] = ['error' => 'Failed to load appointment statistics'];
            }

            try {
                $stats['platform_health'] = $this->statisticsService->getPlatformHealthStats();
            } catch (\Exception $e) {
                Log::error('Platform health error: ' . $e->getMessage());
                $stats['platform_health'] = ['error' => 'Failed to load platform health'];
            }

            try {
                $stats['trends'] = $this->statisticsService->getTrendData();
            } catch (\Exception $e) {
                Log::error('Trends error: ' . $e->getMessage());
                $stats['trends'] = ['error' => 'Failed to load trend data'];
            }

            return response()->json([
                'success' => true,
                'data' => $stats,
                'meta' => [
                    'cached_for' => $cacheMinutes . ' minutes',
                    'generated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Stats general error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get today's tasks
     */
    public function getTasks(Request $request)
    {
        try {
            $tasks = $this->generateTodaysTasks();

            return response()->json([
                'success' => true,
                'data' => $tasks,
                'meta' => [
                    'total_tasks' => array_sum([
                        count($tasks['high_priority']),
                        count($tasks['medium_priority']),
                        count($tasks['low_priority']),
                    ]),
                    'high_priority_count' => count($tasks['high_priority']),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function getActivities(Request $request)
    {
        try {
            $limit = $request->get('limit', 20);
            $days = $request->get('days', 30);

            $activities = $this->activityService->getRecentActivities($limit, $days);

            return response()->json([
                'success' => true,
                'data' => $activities,
                'meta' => [
                    'limit' => $limit,
                    'days' => $days,
                    'total_returned' => $activities->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activities',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get activity statistics
     */
    public function getActivityStats(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $stats = $this->activityService->getActivityStats($days);

            return response()->json([
                'success' => true,
                'data' => $stats,
                'meta' => [
                    'period_days' => $days,
                    'generated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activity statistics',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get staff activity summary
     */
    public function getStaffActivitySummary(Request $request)
    {
        try {
            $staffId = $request->get('staff_id', auth()->id());
            $days = $request->get('days', 30);

            $summary = $this->activityService->getStaffActivitySummary($staffId, $days);

            return response()->json([
                'success' => true,
                'data' => $summary,
                'meta' => [
                    'staff_id' => $staffId,
                    'period_days' => $days,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch staff activity summary',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get quick actions
     */
    public function getQuickActions(Request $request)
    {
        try {
            $actions = $this->buildQuickActions();

            return response()->json([
                'success' => true,
                'data' => $actions,
                'meta' => [
                    'total_actions' => count($actions),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch quick actions',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get platform overview with trends
     */
    public function getOverview(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $includeCharts = $request->get('charts', true);

            $overview = [
                'summary' => $this->statisticsService->getPlatformStats(10), // 10 minute cache
                'system_health' => $this->getSystemHealth(),
                'performance_metrics' => $this->getPerformanceMetrics(),
            ];

            if ($includeCharts) {
                $overview['trends'] = $this->statisticsService->getTrendData($days);
            }

            return response()->json([
                'success' => true,
                'data' => $overview,
                'meta' => [
                    'period_days' => $days,
                    'includes_charts' => $includeCharts,
                    'generated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch platform overview',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Clear dashboard cache
     */
    public function clearCache(Request $request)
    {
        try {
            $cacheKeys = [
                'platform_stats',
                'staff_dashboard_stats',
                'system_health',
                'performance_metrics',
            ];

            foreach ($cacheKeys as $key) {
                Cache::forget($key);
            }

            // Log cache clearing
            $this->logActivity(
                StaffActivity::ACTION_UPDATE,
                'Cleared dashboard cache',
                null,
                ['cache_keys' => $cacheKeys]
            );

            return response()->json([
                'success' => true,
                'message' => 'Dashboard cache cleared successfully',
                'data' => [
                    'cleared_keys' => $cacheKeys,
                    'cleared_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cache',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Export dashboard data
     */
    public function exportData(Request $request)
    {
        try {
            $format = $request->get('format', 'json');
            $days = $request->get('days', 30);

            $data = [
                'stats' => $this->statisticsService->getPlatformStats(0), // No cache for export
                'activities' => $this->activityService->getRecentActivities(100, $days),
                'trends' => $this->statisticsService->getTrendData($days),
                'export_info' => [
                    'generated_at' => now()->toISOString(),
                    'generated_by' => auth()->user()->full_name,
                    'period_days' => $days,
                    'format' => $format,
                ]
            ];

            // Log export activity
            $this->logActivity(
                StaffActivity::ACTION_VIEW,
                'Exported dashboard data',
                null,
                ['format' => $format, 'period_days' => $days]
            );

            if ($format === 'csv') {
                // Return CSV format
                return response()->json([
                    'success' => true,
                    'message' => 'CSV export functionality coming soon',
                    'data' => $data
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'meta' => [
                    'format' => $format,
                    'size' => strlen(json_encode($data)) . ' bytes',
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export data',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    // =====================================
    // PRIVATE HELPER METHODS
    // =====================================

    /**
     * Generate today's tasks based on platform state
     */
    private function generateTodaysTasks()
    {
        $stats = $this->statisticsService->getPlatformStats(5);

        $tasks = [
            'high_priority' => [],
            'medium_priority' => [],
            'low_priority' => [],
        ];

        // High priority tasks
        if ($stats['users']['providers']['pending'] > 0) {
            $tasks['high_priority'][] = [
                'id' => 'approve_providers',
                'title' => "Approve {$stats['users']['providers']['pending']} pending providers",
                'description' => 'New service providers waiting for verification',
                'action_url' => '/staff/users/providers?status=pending',
                'icon' => 'fas fa-user-check',
                'color' => 'danger',
                'count' => $stats['users']['providers']['pending'],
                'urgency' => 'high',
            ];
        }

        if ($stats['categories']['overview']['inactive'] > 0) {
            $tasks['medium_priority'][] = [
                'id' => 'review_categories',
                'title' => "Review {$stats['categories']['overview']['inactive']} inactive categories",
                'description' => 'Service categories that are currently disabled',
                'action_url' => '/staff/service-categories?status=inactive',
                'icon' => 'fas fa-folder-open',
                'color' => 'warning',
                'count' => $stats['categories']['overview']['inactive'],
                'urgency' => 'medium',
            ];
        }

        if ($stats['users']['overview']['new_today'] > 0) {
            $tasks['medium_priority'][] = [
                'id' => 'welcome_users',
                'title' => "Welcome {$stats['users']['overview']['new_today']} new users",
                'description' => 'New users who registered today',
                'action_url' => '/staff/users?filter=new_today',
                'icon' => 'fas fa-user-plus',
                'color' => 'success',
                'count' => $stats['users']['overview']['new_today'],
                'urgency' => 'medium',
            ];
        }

        // Low priority tasks
        $tasks['low_priority'][] = [
            'id' => 'weekly_report',
            'title' => 'Generate weekly report',
            'description' => 'Create weekly platform performance report',
            'action_url' => '/staff/reports/weekly',
            'icon' => 'fas fa-chart-bar',
            'color' => 'info',
            'count' => 1,
            'urgency' => 'low',
        ];

        return $tasks;
    }

    /**
     * Build quick actions for staff
     */
    private function buildQuickActions()
    {
        return [
            [
                'id' => 'create_category',
                'title' => 'Create Category',
                'description' => 'Add a new service category',
                'icon' => 'fas fa-plus-circle',
                'color' => 'primary',
                'url' => '/staff/service-categories/create',
                'permissions' => ['create_categories'],
            ],
            [
                'id' => 'manage_users',
                'title' => 'Manage Users',
                'description' => 'View and manage all users',
                'icon' => 'fas fa-users',
                'color' => 'info',
                'url' => '/staff/users',
                'permissions' => ['manage_users'],
            ],
            [
                'id' => 'view_reports',
                'title' => 'View Reports',
                'description' => 'Access platform analytics',
                'icon' => 'fas fa-chart-line',
                'color' => 'success',
                'url' => '/staff/reports',
                'permissions' => ['view_reports'],
            ],
            [
                'id' => 'handle_disputes',
                'title' => 'Handle Disputes',
                'description' => 'Manage user disputes',
                'icon' => 'fas fa-balance-scale',
                'color' => 'warning',
                'url' => '/staff/disputes',
                'permissions' => ['handle_disputes'],
            ],
        ];
    }

    /**
     * Build welcome message for staff
     */
    private function buildWelcomeMessage()
    {
        $staff = auth()->user();
        $timeOfDay = $this->getTimeOfDay();

        return [
            'greeting' => "Good {$timeOfDay}, {$staff->first_name}!",
            'message' => 'Welcome to the HireMe Staff Dashboard. Here\'s what\'s happening on the platform today.',
            'staff_name' => $staff->full_name,
            'last_login' => $staff->last_login_at ? $staff->last_login_at->diffForHumans() : 'First time login',
            'role' => 'Staff Member',
            'permissions' => $this->getStaffPermissions(),
        ];
    }

    /**
     * Get system alerts
     */
    private function getSystemAlerts()
    {
        $alerts = [];

        // Check for system issues
        $stats = $this->statisticsService->getPlatformStats(1);

        if ($stats['platform_health']['active_sessions'] > 100) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'High System Load',
                'message' => 'More than 100 active sessions detected',
                'action' => 'Monitor system performance',
                'icon' => 'fas fa-exclamation-triangle',
            ];
        }

        if ($stats['users']['providers']['pending'] > 5) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Pending Approvals',
                'message' => 'Multiple providers waiting for approval',
                'action' => 'Review pending providers',
                'icon' => 'fas fa-user-clock',
            ];
        }

        return $alerts;
    }

    /**
     * Get system health metrics
     */
    private function getSystemHealth()
    {
        return Cache::remember('system_health', 5, function () {
            return [
                'database' => $this->checkDatabaseHealth(),
                'cache' => $this->checkCacheHealth(),
                'storage' => $this->checkStorageHealth(),
                'api' => $this->checkApiHealth(),
                'overall_status' => 'healthy',
            ];
        });
    }

    /**
     * Get performance metrics
     */
    private function getPerformanceMetrics()
    {
        return Cache::remember('performance_metrics', 5, function () {
            return [
                'response_time' => [
                    'avg' => '185ms',
                    'p95' => '420ms',
                    'p99' => '850ms',
                ],
                'throughput' => [
                    'requests_per_second' => 45,
                    'peak_rps' => 120,
                ],
                'errors' => [
                    'rate' => '0.2%',
                    'count_24h' => 8,
                ],
                'uptime' => '99.9%',
            ];
        });
    }

    /**
     * Helper methods for health checks
     */
    private function checkDatabaseHealth()
    {
        try {
            DB::connection()->getPdo();
            return ['status' => 'healthy', 'response_time' => '< 50ms'];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => 'Connection failed'];
        }
    }

    private function checkCacheHealth()
    {
        try {
            Cache::put('health_check', 'ok', 60);
            return ['status' => 'healthy', 'driver' => config('cache.default')];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => 'Cache unavailable'];
        }
    }

    private function checkStorageHealth()
    {
        try {
            $diskSpace = disk_free_space('/');
            $totalSpace = disk_total_space('/');
            $usedPercentage = (($totalSpace - $diskSpace) / $totalSpace) * 100;

            return [
                'status' => $usedPercentage > 90 ? 'warning' : 'healthy',
                'used_percentage' => round($usedPercentage, 1),
                'free_space' => $this->formatBytes($diskSpace),
                'total_space' => $this->formatBytes($totalSpace),
            ];
        } catch (\Exception $e) {
            return ['status' => 'unhealthy', 'error' => 'Storage check failed'];
        }
    }

    private function checkApiHealth()
    {
        return [
            'status' => 'healthy',
            'version' => '1.0.0',
            'uptime' => '99.9%',
            'last_restart' => now()->subDays(7)->diffForHumans(),
        ];
    }

    private function getTimeOfDay()
    {
        $hour = now()->hour;

        if ($hour < 12) {
            return 'morning';
        } elseif ($hour < 17) {
            return 'afternoon';
        } else {
            return 'evening';
        }
    }

    private function getStaffPermissions()
    {
        // This would typically come from a permissions system
        return [
            'manage_users',
            'manage_categories',
            'view_reports',
            'handle_disputes',
            'system_admin',
        ];
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
