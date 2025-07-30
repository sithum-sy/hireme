<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\ServiceCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get staff analytics data for management-level reporting
     */
    public function analytics(Request $request)
    {
        \Log::info('Staff analytics endpoint called', [
            'user_id' => Auth::id(),
            'user_role' => Auth::user() ? Auth::user()->role : 'no user',
            'filters' => $request->all()
        ]);

        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff members can access management analytics'
                ], 403);
            }

            $startDate = $request->start_date ?? now()->subDays(30)->toDateString();
            $endDate = $request->end_date ?? now()->toDateString();

            $data = [
                'summary' => $this->getPlatformSummary($startDate, $endDate),
                'user_growth' => $this->getUserGrowthData($startDate, $endDate),
                'service_statistics' => $this->getServiceStatisticsData($startDate, $endDate),
                'appointment_analytics' => $this->getAppointmentAnalyticsData($startDate, $endDate),
                'revenue_analytics' => $this->getRevenueAnalyticsData($startDate, $endDate),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get platform summary data
     */
    private function getPlatformSummary($startDate, $endDate)
    {
        $totalUsers = User::whereBetween('created_at', [$startDate, $endDate])->count();
        $totalProviders = User::where('role', 'service_provider')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        $totalClients = User::where('role', 'client')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        $totalServices = Service::whereBetween('created_at', [$startDate, $endDate])->count();
        $activeServices = Service::where('is_active', true)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        $totalAppointments = Appointment::whereBetween('created_at', [$startDate, $endDate])->count();
        $completedAppointments = Appointment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
        
        $totalRevenue = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        $successRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 1) : 0;

        return [
            'total_users' => $totalUsers,
            'total_providers' => $totalProviders,
            'total_clients' => $totalClients,
            'total_services' => $totalServices,
            'active_services' => $activeServices,
            'total_appointments' => $totalAppointments,
            'completed_appointments' => $completedAppointments,
            'success_rate' => $successRate,
            'total_revenue' => 'LKR ' . number_format($totalRevenue, 2),
            'avg_revenue_per_appointment' => $totalAppointments > 0 ? 'LKR ' . number_format($totalRevenue / $totalAppointments, 2) : 'LKR 0.00'
        ];
    }

    /**
     * Get user growth chart data
     */
    private function getUserGrowthData($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $diffInDays = $start->diffInDays($end);

        // Determine granularity based on date range
        if ($diffInDays <= 7) {
            // Daily data for week or less
            $data = $this->getDailyUserGrowth($start, $end);
        } elseif ($diffInDays <= 90) {
            // Weekly data for 3 months or less
            $data = $this->getWeeklyUserGrowth($start, $end);
        } else {
            // Monthly data for longer periods
            $data = $this->getMonthlyUserGrowth($start, $end);
        }

        return $data;
    }

    private function getDailyUserGrowth($start, $end)
    {
        $labels = [];
        $clientData = [];
        $providerData = [];

        $current = $start->copy();
        while ($current->lte($end)) {
            $labels[] = $current->format('M j');
            
            $clientCount = User::where('role', 'client')
                ->whereDate('created_at', $current)
                ->count();
            $providerCount = User::where('role', 'service_provider')
                ->whereDate('created_at', $current)
                ->count();
            
            $clientData[] = $clientCount;
            $providerData[] = $providerCount;
            
            $current->addDay();
        }

        return [
            'labels' => $labels,
            'clients' => $clientData,
            'providers' => $providerData,
        ];
    }

    private function getWeeklyUserGrowth($start, $end)
    {
        $labels = [];
        $clientData = [];
        $providerData = [];

        $current = $start->copy()->startOfWeek();
        while ($current->lte($end)) {
            $weekEnd = $current->copy()->endOfWeek();
            if ($weekEnd->gt($end)) {
                $weekEnd = $end->copy();
            }

            $labels[] = $current->format('M j') . ' - ' . $weekEnd->format('M j');
            
            $clientCount = User::where('role', 'client')
                ->whereBetween('created_at', [$current, $weekEnd])
                ->count();
            $providerCount = User::where('role', 'service_provider')
                ->whereBetween('created_at', [$current, $weekEnd])
                ->count();
            
            $clientData[] = $clientCount;
            $providerData[] = $providerCount;
            
            $current->addWeek();
        }

        return [
            'labels' => $labels,
            'clients' => $clientData,
            'providers' => $providerData,
        ];
    }

    private function getMonthlyUserGrowth($start, $end)
    {
        $labels = [];
        $clientData = [];
        $providerData = [];

        $current = $start->copy()->startOfMonth();
        while ($current->lte($end)) {
            $monthEnd = $current->copy()->endOfMonth();
            if ($monthEnd->gt($end)) {
                $monthEnd = $end->copy();
            }

            $labels[] = $current->format('M Y');
            
            $clientCount = User::where('role', 'client')
                ->whereBetween('created_at', [$current, $monthEnd])
                ->count();
            $providerCount = User::where('role', 'service_provider')
                ->whereBetween('created_at', [$current, $monthEnd])
                ->count();
            
            $clientData[] = $clientCount;
            $providerData[] = $providerCount;
            
            $current->addMonth();
        }

        return [
            'labels' => $labels,
            'clients' => $clientData,
            'providers' => $providerData,
        ];
    }

    /**
     * Get service statistics data
     */
    private function getServiceStatisticsData($startDate, $endDate)
    {
        $categories = ServiceCategory::withCount(['services' => function ($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }])
            ->having('services_count', '>', 0)
            ->orderBy('services_count', 'desc')
            ->take(10)
            ->get();

        return [
            'labels' => $categories->pluck('name')->toArray(),
            'data' => $categories->pluck('services_count')->toArray(),
        ];
    }

    /**
     * Get appointment analytics data
     */
    private function getAppointmentAnalyticsData($startDate, $endDate)
    {
        $statusData = Appointment::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('status')
            ->get();

        $labels = [];
        $data = [];
        $colors = [
            'completed' => '#28a745',
            'confirmed' => '#17a2b8',
            'pending' => '#ffc107',
            'cancelled' => '#dc3545',
        ];

        foreach ($statusData as $status) {
            $labels[] = ucfirst($status->status);
            $data[] = $status->count;
        }

        return [
            'labels' => $labels,
            'data' => $data,
            'colors' => array_values($colors),
        ];
    }

    /**
     * Get revenue analytics data
     */
    private function getRevenueAnalyticsData($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $diffInDays = $start->diffInDays($end);

        // Determine granularity based on date range
        if ($diffInDays <= 7) {
            // Daily data for week or less
            $data = $this->getDailyRevenue($start, $end);
        } elseif ($diffInDays <= 90) {
            // Weekly data for 3 months or less
            $data = $this->getWeeklyRevenue($start, $end);
        } else {
            // Monthly data for longer periods
            $data = $this->getMonthlyRevenue($start, $end);
        }

        return $data;
    }

    private function getDailyRevenue($start, $end)
    {
        $labels = [];
        $data = [];

        $current = $start->copy();
        while ($current->lte($end)) {
            $labels[] = $current->format('M j');
            
            $revenue = Payment::where('status', 'completed')
                ->whereDate('created_at', $current)
                ->sum('amount');
            
            $data[] = floatval($revenue);
            
            $current->addDay();
        }

        return [
            'labels' => $labels,
            'data' => $data,
        ];
    }

    private function getWeeklyRevenue($start, $end)
    {
        $labels = [];
        $data = [];

        $current = $start->copy()->startOfWeek();
        while ($current->lte($end)) {
            $weekEnd = $current->copy()->endOfWeek();
            if ($weekEnd->gt($end)) {
                $weekEnd = $end->copy();
            }

            $labels[] = $current->format('M j') . ' - ' . $weekEnd->format('M j');
            
            $revenue = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$current, $weekEnd])
                ->sum('amount');
            
            $data[] = floatval($revenue);
            
            $current->addWeek();
        }

        return [
            'labels' => $labels,
            'data' => $data,
        ];
    }

    private function getMonthlyRevenue($start, $end)
    {
        $labels = [];
        $data = [];

        $current = $start->copy()->startOfMonth();
        while ($current->lte($end)) {
            $monthEnd = $current->copy()->endOfMonth();
            if ($monthEnd->gt($end)) {
                $monthEnd = $end->copy();
            }

            $labels[] = $current->format('M Y');
            
            $revenue = Payment::where('status', 'completed')
                ->whereBetween('created_at', [$current, $monthEnd])
                ->sum('amount');
            
            $data[] = floatval($revenue);
            
            $current->addMonth();
        }

        return [
            'labels' => $labels,
            'data' => $data,
        ];
    }
}