<?php

namespace App\Http\Controllers\API\Client;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReportController extends Controller
{
    protected $reportService;

    public function __construct(ReportService $reportService)
    {
        $this->reportService = $reportService;
    }

    /**
     * Generate Personal Activity Report
     */
    public function personalActivity(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'format' => 'nullable|in:pdf,json'
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can generate personal activity reports'
                ], 403);
            }

            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(90)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString()
            ];

            $format = $request->get('format', 'pdf');

            if ($format === 'json') {
                // Return JSON data for dashboard display
                $data = $this->getPersonalActivityData($user, $filters);
                return response()->json([
                    'success' => true,
                    'data' => $data
                ]);
            }

            // Generate PDF report
            $pdf = $this->reportService->generateClientActivityReport($user, $filters);
            $filename = 'activity-report-' . $user->id . '-' . now()->format('Y-m-d') . '.pdf';

            return $pdf->download($filename);
        } catch (\Exception $e) {
            \Log::error('Client Report Generation Error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'filters' => $filters,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate personal activity report',
                'error' => $e->getMessage(),
                'debug' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ] : null
            ], 500);
        }
    }

    /**
     * Generate Spending Analysis Report
     */
    public function spendingAnalysis(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'category_id' => 'nullable|exists:categories,id'
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can generate spending analysis reports'
                ], 403);
            }

            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(365)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString(),
                'category_id' => $request->category_id
            ];

            $data = $this->getSpendingAnalysisData($user, $filters);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate spending analysis report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Service History Report
     */
    public function serviceHistory(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'status' => 'nullable|in:completed,pending,cancelled',
            'provider_id' => 'nullable|exists:users,id'
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can generate service history reports'
                ], 403);
            }

            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(365)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString(),
                'status' => $request->status,
                'provider_id' => $request->provider_id
            ];

            $data = $this->getServiceHistoryData($user, $filters);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate service history report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Saved Services & Preferences Report
     */
    public function preferences(Request $request)
    {
        try {
            $user = Auth::user();
            
            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can generate preferences reports'
                ], 403);
            }

            $data = $this->getPreferencesData($user);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate preferences report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate Transaction History Report
     */
    public function transactionHistory(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
            'payment_method' => 'nullable|in:cash,card,bank_transfer,online',
            'status' => 'nullable|in:completed,pending,failed,refunded'
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'client') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only clients can generate transaction history reports'
                ], 403);
            }

            $filters = [
                'start_date' => $request->start_date ?? now()->subDays(365)->toDateString(),
                'end_date' => $request->end_date ?? now()->toDateString(),
                'payment_method' => $request->payment_method,
                'status' => $request->status
            ];

            $data = $this->getTransactionHistoryData($user, $filters);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate transaction history report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Helper methods for data retrieval
    private function getPersonalActivityData($user, $filters)
    {
        // This would integrate with the ReportService methods
        return [
            'activity_summary' => [
                'total_bookings' => 0,
                'completed_services' => 0,
                'total_spent' => 0,
                'reviews_given' => 0
            ],
            'booking_history' => [],
            'spending_analysis' => [],
            'service_preferences' => []
        ];
    }

    private function getSpendingAnalysisData($user, $filters)
    {
        return [
            'spending_summary' => [
                'total_spent' => 0,
                'average_per_booking' => 0,
                'most_expensive_service' => null,
                'savings_potential' => 0
            ],
            'spending_by_category' => [],
            'monthly_trends' => [],
            'budget_insights' => []
        ];
    }

    private function getServiceHistoryData($user, $filters)
    {
        return [
            'service_summary' => [
                'total_services' => 0,
                'unique_providers' => 0,
                'completion_rate' => 0,
                'average_rating' => 0
            ],
            'service_timeline' => [],
            'provider_relationships' => [],
            'service_categories' => []
        ];
    }

    private function getPreferencesData($user)
    {
        return [
            'favorite_categories' => [],
            'preferred_providers' => [],
            'saved_services' => [],
            'booking_patterns' => [
                'preferred_times' => [],
                'booking_frequency' => '',
                'advance_booking_days' => 0
            ],
            'communication_preferences' => [],
            'location_preferences' => []
        ];
    }

    private function getTransactionHistoryData($user, $filters)
    {
        return [
            'transaction_summary' => [
                'total_transactions' => 0,
                'total_amount' => 0,
                'successful_payments' => 0,
                'failed_payments' => 0
            ],
            'payment_methods' => [],
            'transaction_timeline' => [],
            'refund_history' => []
        ];
    }
}