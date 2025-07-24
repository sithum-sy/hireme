<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate Platform Analytics Report
     */
    public function platformAnalytics(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'format' => 'nullable|in:pdf,json'
        ]);

        try {
            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(30)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString()
            ];

            $format = $request->get('format', 'pdf');

            if ($format === 'json') {
                // Return JSON data for dashboard display
                $data = $this->reportService->getAdminAnalyticsData($filters);
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // Generate PDF report
            $pdf = $this->reportService->generateAdminAnalyticsReport($filters);
            $filename = 'platform-analytics-' . now()->format('Y-m-d') . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate platform analytics report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate User Management Report
     */
    public function userManagement(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'user_role' => 'nullable|in:client,service_provider,staff',
            'status' => 'nullable|in:active,inactive,suspended'
        ]);

        try {
            $filters = $request->only(['start_date', 'end_date', 'user_role', 'status']);
            
            // Get user management data
            $data = $this->getUserManagementData($filters);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate user management report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Financial Performance Report
     */
    public function financialPerformance(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'format' => 'nullable|in:pdf,json'
        ]);

        try {
            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(30)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString()
            ];

            $data = $this->getFinancialPerformanceData($filters);

            if ($request->get('format') === 'json') {
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // Generate PDF (could extend ReportService for this)
            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => 'Financial performance data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate financial performance report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Service Category Analytics Report
     */
    public function serviceCategoryAnalytics(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        try {
            $filters = $request->only(['start_date', 'end_date', 'category_id']);
            $data = $this->getServiceCategoryAnalytics($filters);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate service category analytics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Provider Performance Report
     */
    public function providerPerformance(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'provider_id' => 'nullable|exists:users,id',
            'min_rating' => 'nullable|numeric|min:0|max:5',
            'sort_by' => 'nullable|in:earnings,bookings,rating',
            'limit' => 'nullable|integer|min:1|max:100'
        ]);

        try {
            $filters = $request->only(['start_date', 'end_date', 'provider_id', 'min_rating', 'sort_by']);
            $limit = $request->get('limit', 20);

            $data = $this->getProviderPerformanceData($filters, $limit);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate provider performance report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper methods for data retrieval
    private function getUserManagementData($filters)
    {
        // Implementation for user management data
        return [
            'summary' => [
                'total_users' => 0,
                'active_users' => 0,
                'new_registrations' => 0
            ],
            'by_role' => [],
            'recent_activities' => []
        ];
    }

    private function getFinancialPerformanceData($filters)
    {
        // Implementation for financial performance data
        return [
            'revenue_summary' => [
                'total_revenue' => 0,
                'platform_fees' => 0,
                'provider_earnings' => 0
            ],
            'payment_trends' => [],
            'top_earning_categories' => []
        ];
    }

    private function getServiceCategoryAnalytics($filters)
    {
        // Implementation for service category analytics
        return [
            'category_performance' => [],
            'booking_trends' => [],
            'popular_services' => []
        ];
    }

    private function getProviderPerformanceData($filters, $limit)
    {
        // Implementation for provider performance data
        return [
            'top_providers' => [],
            'performance_metrics' => [],
            'growth_trends' => []
        ];
    }
}