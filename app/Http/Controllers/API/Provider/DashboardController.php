<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get comprehensive business statistics for provider dashboard
     */
    public function getBusinessStatistics(Request $request)
    {
        try {
            $provider = Auth::user();
            $period = $request->get('period', 'all');
            
            // Build date range based on period
            $dateRange = $this->getDateRange($period);
            
            // Get basic counts
            $totalAppointments = $provider->providerAppointments()->count();
            $completedJobs = $provider->providerAppointments()
                ->where('status', 'completed')
                ->count();
            
            $activeServices = $provider->services()
                ->where('is_active', true)
                ->count();
            
            // Today's appointments
            $todaysAppointments = $provider->providerAppointments()
                ->whereDate('appointment_date', Carbon::today())
                ->count();
            
            // Pending requests (appointments with pending status)
            $pendingRequests = $provider->providerAppointments()
                ->where('status', 'pending')
                ->count();
            
            // Calculate earnings (assuming there's a payment relationship)
            $totalEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $monthlyEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereMonth('appointment_date', Carbon::now()->month)
                ->whereYear('appointment_date', Carbon::now()->year)
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $weeklyEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereBetween('appointment_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $todaysEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereDate('appointment_date', Carbon::today())
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            // Calculate average rating
            $averageRating = $provider->services()
                ->join('reviews', 'services.id', '=', 'reviews.service_id')
                ->avg('reviews.rating') ?: 0;
            
            // Calculate response rate (assuming there's a way to track response times)
            // For now, we'll calculate based on appointments responded to vs total requests
            $totalRequests = $provider->providerAppointments()->count();
            $respondedRequests = $provider->providerAppointments()
                ->whereIn('status', ['confirmed', 'declined', 'completed', 'cancelled'])
                ->count();
            $responseRate = $totalRequests > 0 ? ($respondedRequests / $totalRequests) * 100 : 100;
            
            // Calculate total profile/service views (if tracked)
            $totalViews = $provider->services()->sum('views_count') ?: 0;
            
            // Calculate conversion rate (completed appointments / total views)
            $conversionRate = $totalViews > 0 ? ($completedJobs / $totalViews) * 100 : 0;
            
            $businessStats = [
                'totalEarnings' => round($totalEarnings, 2),
                'monthlyEarnings' => round($monthlyEarnings, 2),
                'weeklyEarnings' => round($weeklyEarnings, 2),
                'todaysEarnings' => round($todaysEarnings, 2),
                'totalAppointments' => $totalAppointments,
                'todaysAppointments' => $todaysAppointments,
                'pendingRequests' => $pendingRequests,
                'averageRating' => round($averageRating, 1),
                'responseRate' => round($responseRate, 1),
                'completedJobs' => $completedJobs,
                'activeServices' => $activeServices,
                'totalViews' => $totalViews,
                'conversionRate' => round($conversionRate, 2),
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Business statistics retrieved successfully',
                'data' => $businessStats
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve business statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get dashboard metrics including recent appointments, earnings, reviews, etc.
     */
    public function getDashboardMetrics(Request $request)
    {
        try {
            $provider = Auth::user();
            
            
            // Recent appointments (last 10)
            $recentAppointments = $provider->providerAppointments()
                ->with(['client', 'service'])
                ->orderBy('appointment_date', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'client' => $appointment->client->full_name ?? 'Unknown Client',
                        'service' => $appointment->service->title ?? 'Unknown Service',
                        'date' => $appointment->appointment_date ? $appointment->appointment_date->format('Y-m-d') : null,
                        'time' => $appointment->appointment_time,
                        'status' => $appointment->status,
                        'location' => $appointment->client_address ?? 'Not specified',
                        'earnings' => $appointment->status === 'completed' ? ($appointment->service->base_price ?? 0) : 0,
                    ];
                });
            
            // Recent earnings (last 7 days)
            $recentEarnings = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayEarnings = $provider->providerAppointments()
                    ->where('status', 'completed')
                    ->whereDate('appointment_date', $date)
                    ->join('services', 'appointments.service_id', '=', 'services.id')
                    ->sum('services.base_price');
                
                $recentEarnings[] = [
                    'date' => $date->format('D'),
                    'amount' => round($dayEarnings, 2)
                ];
            }
            
            // Performance indicators
            $totalAppointments = $provider->providerAppointments()->count();
            $completedJobs = $provider->providerAppointments()->where('status', 'completed')->count();
            $averageRating = $provider->services()
                ->join('reviews', 'services.id', '=', 'reviews.service_id')
                ->avg('reviews.rating') ?: 0;
            
            $responseRate = $totalAppointments > 0 ? 
                ($provider->providerAppointments()
                    ->whereIn('status', ['confirmed', 'declined', 'completed', 'cancelled'])
                    ->count() / $totalAppointments) * 100 : 100;
            
            $performanceIndicators = [
                'responseRate' => [
                    'value' => round($responseRate, 1),
                    'status' => $responseRate >= 90 ? 'excellent' : ($responseRate >= 75 ? 'good' : 'needs_improvement'),
                    'trend' => 'stable'
                ],
                'rating' => [
                    'value' => round($averageRating, 1),
                    'status' => $averageRating >= 4.5 ? 'excellent' : ($averageRating >= 4.0 ? 'good' : 'needs_improvement'),
                    'trend' => 'stable'
                ],
                'bookingRate' => [
                    'value' => $totalAppointments > 0 ? round(($completedJobs / $totalAppointments) * 100, 1) : 0,
                    'status' => 'good',
                    'trend' => 'up'
                ]
            ];
            
            // Monthly trends (last 6 months)
            $monthlyTrends = [];
            for ($i = 5; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i);
                $bookings = $provider->providerAppointments()
                    ->whereMonth('appointment_date', $month->month)
                    ->whereYear('appointment_date', $month->year)
                    ->count();
                
                $earnings = $provider->providerAppointments()
                    ->where('status', 'completed')
                    ->whereMonth('appointment_date', $month->month)
                    ->whereYear('appointment_date', $month->year)
                    ->join('services', 'appointments.service_id', '=', 'services.id')
                    ->sum('services.base_price');
                
                $monthlyTrends[] = [
                    'month' => $month->format('M'),
                    'bookings' => $bookings,
                    'earnings' => round($earnings, 2)
                ];
            }
            
            // Top services by bookings
            $topServices = $provider->services()
                ->withCount(['appointments' => function ($query) {
                    $query->where('status', 'completed');
                }])
                ->with(['reviews'])
                ->orderBy('appointments_count', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($service) {
                    $earnings = $service->appointments()
                        ->where('status', 'completed')
                        ->count() * $service->base_price;
                    
                    return [
                        'id' => $service->id,
                        'title' => $service->title,
                        'bookings' => $service->appointments_count,
                        'earnings' => round($earnings, 2),
                        'rating' => round($service->reviews->avg('rating') ?: 0, 1)
                    ];
                });
            
            // Recent client reviews (last 5)
            $clientReviews = Review::whereHas('service', function ($query) use ($provider) {
                    $query->where('provider_id', $provider->id);
                })
                ->with(['client', 'service'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'client' => $review->client->full_name ?? 'Anonymous',
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'service' => $review->service->title ?? 'Unknown Service',
                        'date' => $review->created_at->format('M j, Y')
                    ];
                });
            
            $dashboardMetrics = [
                'recentAppointments' => $recentAppointments,
                'recentEarnings' => $recentEarnings,
                'performanceIndicators' => $performanceIndicators,
                'monthlyTrends' => $monthlyTrends,
                'topServices' => $topServices,
                'clientReviews' => $clientReviews,
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Dashboard metrics retrieved successfully',
                'data' => $dashboardMetrics
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve dashboard metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get earnings data with breakdown
     */
    public function getEarningsData(Request $request)
    {
        try {
            $provider = Auth::user();
            $period = $request->get('period', 'month');
            
            // Current earnings
            $totalEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $monthlyEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereMonth('appointment_date', Carbon::now()->month)
                ->whereYear('appointment_date', Carbon::now()->year)
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $weeklyEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereBetween('appointment_date', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek()
                ])
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            $todaysEarnings = $provider->providerAppointments()
                ->where('status', 'completed')
                ->whereDate('appointment_date', Carbon::today())
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->sum('services.base_price');
            
            // Earnings history (last 30 days)
            $history = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dayEarnings = $provider->providerAppointments()
                    ->where('status', 'completed')
                    ->whereDate('appointment_date', $date)
                    ->join('services', 'appointments.service_id', '=', 'services.id')
                    ->sum('services.base_price');
                
                if ($dayEarnings > 0) {
                    $appointments = $provider->providerAppointments()
                        ->where('status', 'completed')
                        ->whereDate('appointment_date', $date)
                        ->with('service')
                        ->get();
                    
                    foreach ($appointments as $appointment) {
                        $history[] = [
                            'date' => $date->format('Y-m-d'),
                            'amount' => $appointment->service->base_price ?? 0,
                            'service' => $appointment->service->title ?? 'Unknown Service'
                        ];
                    }
                }
            }
            
            // Earnings breakdown by service
            $breakdown = [];
            try {
                $services = $provider->services()->get();
                foreach ($services as $service) {
                    $earnings = $service->appointments()
                        ->where('status', 'completed')
                        ->count() * $service->base_price;
                    if ($earnings > 0) {
                        $breakdown[$service->title] = $earnings;
                    }
                }
            } catch (\Exception $e) {
                \Log::error('Breakdown calculation error: ' . $e->getMessage());
                $breakdown = [];
            }
            
            $earningsData = [
                'current' => [
                    'total' => round($totalEarnings, 2),
                    'thisMonth' => round($monthlyEarnings, 2),
                    'thisWeek' => round($weeklyEarnings, 2),
                    'today' => round($todaysEarnings, 2),
                ],
                'history' => $history,
                'breakdown' => $breakdown,
            ];
            
            return response()->json([
                'success' => true,
                'message' => 'Earnings data retrieved successfully',
                'data' => $earningsData
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve earnings data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Helper method to get date range based on period
     */
    private function getDateRange($period)
    {
        switch ($period) {
            case 'today':
                return [Carbon::today(), Carbon::today()];
            case 'week':
                return [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()];
            case 'month':
                return [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()];
            case 'year':
                return [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()];
            default:
                return [null, null];
        }
    }
}