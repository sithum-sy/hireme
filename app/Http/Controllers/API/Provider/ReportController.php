<?php

namespace App\Http\Controllers\API\Provider;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    /**
     * Get simple analytics data for provider dashboard
     */
    public function analytics(Request $request)
    {
        $request->validate([
            'start_date' => 'nullable|date|before_or_equal:today',
            'end_date' => 'nullable|date|after_or_equal:start_date|before_or_equal:today',
        ]);

        try {
            $user = Auth::user();
            
            if ($user->role !== 'service_provider') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only service providers can access analytics'
                ], 403);
            }

            $startDate = $request->start_date ?? now()->subDays(30)->toDateString();
            $endDate = $request->end_date ?? now()->toDateString();
            
            // Log the received dates for debugging
            \Log::info('Analytics request', [
                'user_id' => $user->id,
                'requested_start_date' => $request->start_date,
                'requested_end_date' => $request->end_date,
                'computed_start_date' => $startDate,
                'computed_end_date' => $endDate
            ]);

            $data = [
                'summary' => $this->getSummaryData($user, $startDate, $endDate),
                'income_chart' => $this->getIncomeChartData($user, $startDate, $endDate),
                'success_rate' => $this->getSuccessRateData($user, $startDate, $endDate),
                'appointment_trend' => $this->getAppointmentTrendData($user, $startDate, $endDate),
                'service_performance' => $this->getServicePerformanceData($user, $startDate, $endDate),
            ];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            \Log::error('Analytics Error: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'start_date' => $startDate ?? 'null',
                'end_date' => $endDate ?? 'null',
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function getSummaryData($user, $startDate, $endDate)
    {
        try {
            // Get total income from completed appointments with payments
            $totalIncome = 0;
            
            // Method 1: Get income from completed payments (most accurate)
            $completedPayments = Payment::where('provider_id', $user->id)
                ->where('status', Payment::STATUS_COMPLETED)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->sum('amount');
            
            // No platform fee - providers get 100% of payments
            $totalIncome = $completedPayments;
            
            // Method 2: Fallback to completed appointments if no payments data
            if ($totalIncome == 0) {
                $completedAppointmentsIncome = Appointment::where('provider_id', $user->id)
                    ->whereIn('status', [
                        Appointment::STATUS_COMPLETED,
                        Appointment::STATUS_PAID,
                        Appointment::STATUS_CLOSED
                    ])
                    ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                    ->sum('total_price');
                
                // No platform fee - providers get 100% of appointment value
                $totalIncome = $completedAppointmentsIncome;
            }

            // Total appointments in the period
            $totalAppointments = Appointment::where('provider_id', $user->id)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();
                
            \Log::info('Total appointments query', [
                'user_id' => $user->id,
                'date_range' => [$startDate . ' 00:00:00', $endDate . ' 23:59:59'],
                'total_appointments' => $totalAppointments
            ]);

            // Completed appointments (all successful statuses)
            $completedAppointments = Appointment::where('provider_id', $user->id)
                ->whereIn('status', [
                    Appointment::STATUS_COMPLETED,
                    Appointment::STATUS_INVOICE_SENT,
                    Appointment::STATUS_PAYMENT_PENDING,
                    Appointment::STATUS_PAID,
                    Appointment::STATUS_REVIEWED,
                    Appointment::STATUS_CLOSED
                ])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            // Calculate success rate (completed vs total)
            $completedRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 1) : 0;

            // Active services count
            $activeServices = Service::where('provider_id', $user->id)
                ->where('is_active', true)
                ->count();

            $result = [
                'total_income' => 'LKR ' . number_format($totalIncome, 2),
                'total_appointments' => $totalAppointments,
                'completed_rate' => $completedRate,
                'active_services' => $activeServices
            ];
            
            // Log the computed summary for debugging
            \Log::info('Summary computed', [
                'user_id' => $user->id,
                'date_range' => [$startDate, $endDate],
                'summary' => $result,
                'raw_income' => $totalIncome,
                'completed_payments' => $completedPayments ?? 0
            ]);
            
            return $result;
        } catch (\Exception $e) {
            \Log::error('Summary Data Error: ' . $e->getMessage());
            return [
                'total_income' => 'LKR 0.00',
                'total_appointments' => 0,
                'completed_rate' => 0,
                'active_services' => 0
            ];
        }
    }

    private function getIncomeChartData($user, $startDate, $endDate)
    {
        try {
            $labels = [];
            $data = [];
            
            // Parse start and end dates
            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);
            
            // If date range is less than 35 days, show daily data
            if ($start->diffInDays($end) <= 35) {
                // Generate daily labels within the date range
                $current = $start->copy();
                while ($current->lte($end)) {
                    $labels[] = $current->format('M d');
                    
                    // Get income for this day
                    $dailyIncome = Payment::where('provider_id', $user->id)
                        ->where('status', Payment::STATUS_COMPLETED)
                        ->whereBetween('created_at', [
                            $current->toDateString() . ' 00:00:00',
                            $current->toDateString() . ' 23:59:59'
                        ])
                        ->sum('amount');
                    
                    // Fallback to appointments if no payment data
                    if ($dailyIncome == 0) {
                        $dailyIncome = Appointment::where('provider_id', $user->id)
                            ->whereIn('status', [
                                Appointment::STATUS_COMPLETED,
                                Appointment::STATUS_PAID,
                                Appointment::STATUS_CLOSED
                            ])
                            ->whereBetween('created_at', [
                                $current->toDateString() . ' 00:00:00',
                                $current->toDateString() . ' 23:59:59'
                            ])
                            ->sum('total_price');
                    }
                    
                    $data[] = (float) $dailyIncome;
                    $current->addDay();
                }
            } else {
                // For longer periods, show monthly data within the range
                $current = $start->copy()->startOfMonth();
                $endMonth = $end->copy()->endOfMonth();
                
                while ($current->lte($endMonth)) {
                    $labels[] = $current->format('M Y');
                    
                    // Get the overlap period between current month and filter range
                    $monthStart = max($current->startOfMonth()->toDateString(), $startDate);
                    $monthEnd = min($current->endOfMonth()->toDateString(), $endDate);
                    
                    // Get income for this month period
                    $monthlyIncome = Payment::where('provider_id', $user->id)
                        ->where('status', Payment::STATUS_COMPLETED)
                        ->whereBetween('created_at', [$monthStart . ' 00:00:00', $monthEnd . ' 23:59:59'])
                        ->sum('amount');
                    
                    // Fallback to appointments if no payment data
                    if ($monthlyIncome == 0) {
                        $monthlyIncome = Appointment::where('provider_id', $user->id)
                            ->whereIn('status', [
                                Appointment::STATUS_COMPLETED,
                                Appointment::STATUS_PAID,
                                Appointment::STATUS_CLOSED
                            ])
                            ->whereBetween('created_at', [$monthStart . ' 00:00:00', $monthEnd . ' 23:59:59'])
                            ->sum('total_price');
                    }
                    
                    $data[] = (float) $monthlyIncome;
                    $current->addMonth();
                }
            }

            return ['labels' => $labels, 'data' => $data];
        } catch (\Exception $e) {
            \Log::error('Income Chart Error: ' . $e->getMessage());
            return ['labels' => [], 'data' => []];
        }
    }

    private function getSuccessRateData($user, $startDate, $endDate)
    {
        try {
            // Completed appointments (all successful statuses)
            $completed = Appointment::where('provider_id', $user->id)
                ->whereIn('status', [
                    Appointment::STATUS_COMPLETED,
                    Appointment::STATUS_INVOICE_SENT,
                    Appointment::STATUS_PAYMENT_PENDING,
                    Appointment::STATUS_PAID,
                    Appointment::STATUS_REVIEWED,
                    Appointment::STATUS_CLOSED
                ])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            // Cancelled appointments
            $cancelled = Appointment::where('provider_id', $user->id)
                ->whereIn('status', [
                    Appointment::STATUS_CANCELLED_BY_CLIENT,
                    Appointment::STATUS_CANCELLED_BY_PROVIDER,
                    Appointment::STATUS_NO_SHOW,
                    Appointment::STATUS_EXPIRED
                ])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            // In Progress appointments (separate category)
            $inProgress = Appointment::where('provider_id', $user->id)
                ->where('status', Appointment::STATUS_IN_PROGRESS)
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            // Pending appointments (waiting for confirmation or disputed)
            $pending = Appointment::where('provider_id', $user->id)
                ->whereIn('status', [
                    Appointment::STATUS_PENDING,
                    Appointment::STATUS_CONFIRMED,
                    Appointment::STATUS_DISPUTED
                ])
                ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
                ->count();

            return [$completed, $cancelled, $inProgress, $pending];
        } catch (\Exception $e) {
            \Log::error('Success Rate Error: ' . $e->getMessage());
            return [0, 0, 0, 0];
        }
    }

    private function getAppointmentTrendData($user, $startDate, $endDate)
    {
        try {
            $labels = [];
            $data = [];
            
            // Parse start and end dates
            $start = \Carbon\Carbon::parse($startDate);
            $end = \Carbon\Carbon::parse($endDate);
            
            \Log::info('Appointment Trend Data', [
                'user_id' => $user->id,
                'startDate' => $startDate,
                'endDate' => $endDate,
                'start_carbon' => $start->toDateString(),
                'end_carbon' => $end->toDateString(),
                'diff_in_days' => $start->diffInDays($end)
            ]);
            
            // If date range is less than 32 days, show daily data
            if ($start->diffInDays($end) <= 31) {
                // Generate daily data within the filter range
                $current = $start->copy();
                while ($current->lte($end)) {
                    $labels[] = $current->format('M d');
                    
                    $dailyCount = Appointment::where('provider_id', $user->id)
                        ->whereBetween('created_at', [
                            $current->toDateString() . ' 00:00:00',
                            $current->toDateString() . ' 23:59:59'
                        ])
                        ->count();
                    
                    $data[] = $dailyCount;
                    $current->addDay();
                }
            } else {
                // For longer periods, show weekly data
                $current = $start->copy()->startOfWeek();
                
                while ($current->lte($end)) {
                    $weekEnd = min($current->copy()->endOfWeek()->toDateString(), $endDate);
                    $weekStart = max($current->toDateString(), $startDate);
                    
                    $labels[] = $current->format('M d') . ' - ' . \Carbon\Carbon::parse($weekEnd)->format('M d');
                    
                    $weeklyCount = Appointment::where('provider_id', $user->id)
                        ->whereBetween('created_at', [$weekStart . ' 00:00:00', $weekEnd . ' 23:59:59'])
                        ->count();
                    
                    $data[] = $weeklyCount;
                    $current->addWeek();
                }
            }

            return ['labels' => $labels, 'data' => $data];
        } catch (\Exception $e) {
            \Log::error('Appointment Trend Error: ' . $e->getMessage());
            return ['labels' => [], 'data' => []];
        }
    }

    private function getServicePerformanceData($user, $startDate, $endDate)
    {
        try {
            $services = Service::where('provider_id', $user->id)
                ->withCount(['appointments' => function($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);
                }])
                ->having('appointments_count', '>', 0)
                ->orderBy('appointments_count', 'desc')
                ->limit(5)
                ->get();

            $labels = [];
            $data = [];

            foreach ($services as $service) {
                $labels[] = strlen($service->title) > 20 ? substr($service->title, 0, 20) . '...' : $service->title;
                $data[] = $service->appointments_count;
            }

            // If no services have appointments, show placeholder
            if (empty($labels)) {
                $labels = ['No bookings yet'];
                $data = [0];
            }

            return ['labels' => $labels, 'data' => $data];
        } catch (\Exception $e) {
            \Log::error('Service Performance Error: ' . $e->getMessage());
            return ['labels' => ['No data'], 'data' => [0]];
        }
    }
}