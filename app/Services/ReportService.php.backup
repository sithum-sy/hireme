<?php

namespace App\Services;

use App\Models\User;
use App\Models\Appointment;
use App\Models\Service;
use App\Models\Quote;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Review;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportService
{
    /**
     * Generate Admin Platform Analytics Report
     */
    public function generateAdminAnalyticsReport(array $filters = [])
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $data = [
            'period' => [
                'start_date' => $startDate->format('M d, Y'),
                'end_date' => $endDate->format('M d, Y'),
                'days' => $startDate->diffInDays($endDate) + 1
            ],
            'overview' => $this->getAdminOverviewStats($startDate, $endDate),
            'user_analytics' => $this->getUserAnalytics($startDate, $endDate),
            'financial_summary' => $this->getFinancialSummary($startDate, $endDate),
            'service_analytics' => $this->getServiceAnalytics($startDate, $endDate),
            'appointment_trends' => $this->getAppointmentTrends($startDate, $endDate),
            'top_performers' => $this->getTopPerformers($startDate, $endDate),
            'generated_at' => now()->format('M d, Y \a\t g:i A')
        ];

        $pdf = Pdf::loadView('reports.admin.analytics', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf;
    }

    /**
     * Generate Provider Business Performance Report
     */
    public function generateProviderPerformanceReport(User $provider, array $filters = [])
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $data = [
            'provider' => [
                'name' => $provider->full_name,
                'business_name' => $provider->providerProfile->business_name ?? null,
                'email' => $provider->email,
                'phone' => $provider->phone,
                'member_since' => $provider->created_at->format('M Y'),
                'verification_status' => $provider->providerProfile->verification_status ?? 'pending'
            ],
            'period' => [
                'start_date' => $startDate->format('M d, Y'),
                'end_date' => $endDate->format('M d, Y'),
                'days' => $startDate->diffInDays($endDate) + 1
            ],
            'performance_summary' => $this->getProviderPerformanceSummary($provider, $startDate, $endDate),
            'earnings_breakdown' => $this->getProviderEarningsBreakdown($provider, $startDate, $endDate),
            'service_performance' => $this->getProviderServicePerformance($provider, $startDate, $endDate),
            'appointment_analytics' => $this->getProviderAppointmentAnalytics($provider, $startDate, $endDate),
            'customer_feedback' => $this->getProviderCustomerFeedback($provider, $startDate, $endDate),
            'growth_metrics' => $this->getProviderGrowthMetrics($provider, $startDate, $endDate),
            'generated_at' => now()->format('M d, Y \a\t g:i A')
        ];

        $pdf = Pdf::loadView('reports.provider.performance', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf;
    }

    /**
     * Generate Provider Financial & Earnings Report
     */
    public function generateProviderFinancialReport(User $provider, array $filters = [])
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(30));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        $data = [
            'provider' => [
                'name' => $provider->full_name,
                'business_name' => $provider->providerProfile->business_name ?? null,
                'email' => $provider->email,
                'tax_id' => $provider->providerProfile->tax_identification ?? null
            ],
            'period' => [
                'start_date' => $startDate->format('M d, Y'),
                'end_date' => $endDate->format('M d, Y'),
                'days' => $startDate->diffInDays($endDate) + 1
            ],
            'earnings_summary' => $this->getProviderEarningsSummary($provider, $startDate, $endDate),
            'income_breakdown' => $this->getProviderIncomeBreakdown($provider, $startDate, $endDate),
            'payment_analytics' => $this->getProviderPaymentAnalytics($provider, $startDate, $endDate),
            'invoice_summary' => $this->getProviderInvoiceSummary($provider, $startDate, $endDate),
            'tax_information' => $this->getProviderTaxInformation($provider, $startDate, $endDate),
            'monthly_trends' => $this->getProviderMonthlyTrends($provider, $startDate, $endDate),
            'generated_at' => now()->format('M d, Y \a\t g:i A')
        ];

        $pdf = Pdf::loadView('reports.provider.financial', $data);
        $pdf->setPaper('A4', 'portrait');
        
        return $pdf;
    }

    /**
     * Generate Client Activity Report
     */
    public function generateClientActivityReport(User $client, array $filters = [])
    {
        $startDate = Carbon::parse($filters['start_date'] ?? now()->subDays(90));
        $endDate = Carbon::parse($filters['end_date'] ?? now());

        // Start with basic data and expand gradually for debugging
        $data = [
            'client' => [
                'name' => $client->full_name ?? ($client->first_name . ' ' . $client->last_name) ?? 'Unknown User',
                'email' => $client->email,
                'member_since' => $client->created_at ? $client->created_at->format('M Y') : 'Unknown'
            ],
            'period' => [
                'start_date' => $startDate->format('M d, Y'),
                'end_date' => $endDate->format('M d, Y'),
                'days' => $startDate->diffInDays($endDate) + 1
            ],
            'activity_summary' => [
                'total_bookings' => 0,
                'completed_services' => 0,
                'pending_requests' => 0,
                'total_spent' => 0,
                'average_rating_given' => 0,
                'reviews_given' => 0,
                'favorite_category' => 'N/A'
            ],
            'booking_history' => [],
            'spending_analysis' => [
                'by_category' => collect([]),
                'monthly_trend' => collect([]),
                'monthly_spending' => collect([]),
                'total_amount' => 0
            ],
            'service_preferences' => [
                'most_booked_services' => collect([]),
                'preferred_providers' => collect([]),
                'favorite_categories' => collect([])
            ],
            'review_summary' => [
                'total_reviews' => 0,
                'average_rating_given' => 0,
                'reviews_given' => 0,
                'recent_reviews' => collect([])
            ],
            'generated_at' => now()->format('M d, Y \a\t g:i A')
        ];

        // Try to load the view safely
        try {
            $pdf = Pdf::loadView('reports.client.activity', $data);
            $pdf->setPaper('A4', 'portrait');
            return $pdf;
        } catch (\Exception $e) {
            \Log::error('PDF Generation Error: ' . $e->getMessage());
            throw new \Exception('Failed to generate PDF: ' . $e->getMessage());
        }
    }

    // Admin Analytics Helper Methods
    private function getAdminOverviewStats($startDate, $endDate)
    {
        return [
            'total_users' => User::count(),
            'new_users' => User::whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_providers' => User::where('role', 'service_provider')->count(),
            'total_clients' => User::where('role', 'client')->count(),
            'total_services' => Service::count(),
            'active_services' => Service::where('is_active', true)->count(),
            'total_appointments' => Appointment::whereBetween('created_at', [$startDate, $endDate])->count(),
            'completed_appointments' => Appointment::where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])->count(),
            'total_revenue' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount'),
            'average_booking_value' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->avg('amount') ?? 0
        ];
    }

    private function getUserAnalytics($startDate, $endDate)
    {
        return [
            'new_registrations' => User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count'),
                'role'
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date', 'role')
            ->orderBy('date')
            ->get(),
            'user_growth' => [
                'providers' => User::where('role', 'service_provider')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count(),
                'clients' => User::where('role', 'client')
                    ->whereBetween('created_at', [$startDate, $endDate])
                    ->count()
            ]
        ];
    }

    private function getFinancialSummary($startDate, $endDate)
    {
        return [
            'total_revenue' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount'),
            'platform_fees' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('platform_fee'),
            'provider_earnings' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'payment_methods' => Payment::where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->groupBy('method')
                ->select('method', DB::raw('COUNT(*) as count'), DB::raw('SUM(amount) as total'))
                ->get()
        ];
    }

    private function getServiceAnalytics($startDate, $endDate)
    {
        return [
            'popular_categories' => Service::join('categories', 'services.category_id', '=', 'categories.id')
                ->join('appointments', 'services.id', '=', 'appointments.service_id')
                ->whereBetween('appointments.created_at', [$startDate, $endDate])
                ->groupBy('categories.id', 'categories.name')
                ->select('categories.name', DB::raw('COUNT(*) as bookings'))
                ->orderBy('bookings', 'desc')
                ->limit(10)
                ->get(),
            'new_services' => Service::whereBetween('created_at', [$startDate, $endDate])->count(),
            'average_service_price' => Service::where('pricing_type', 'fixed')->avg('base_price') ?? 0
        ];
    }

    private function getAppointmentTrends($startDate, $endDate)
    {
        return [
            'daily_bookings' => Appointment::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy('date')
            ->orderBy('date')
            ->get(),
            'status_breakdown' => Appointment::whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('status')
                ->select('status', DB::raw('COUNT(*) as count'))
                ->get()
        ];
    }

    private function getTopPerformers($startDate, $endDate)
    {
        return [
            'top_providers' => User::where('role', 'service_provider')
                ->withCount(['providerAppointments as completed_appointments' => function ($query) use ($startDate, $endDate) {
                    $query->where('status', 'completed')
                        ->whereBetween('created_at', [$startDate, $endDate]);
                }])
                ->orderBy('completed_appointments', 'desc')
                ->limit(10)
                ->get(['id', 'first_name', 'last_name', 'email']),
            'top_services' => Service::withCount(['appointments as bookings' => function ($query) use ($startDate, $endDate) {
                    $query->whereBetween('created_at', [$startDate, $endDate]);
                }])
                ->orderBy('bookings', 'desc')
                ->limit(10)
                ->get(['id', 'title', 'base_price'])
        ];
    }

    // Provider Performance Helper Methods
    private function getProviderPerformanceSummary($provider, $startDate, $endDate)
    {
        return [
            'total_earnings' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'total_bookings' => Appointment::where('provider_id', $provider->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'completed_appointments' => Appointment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'average_rating' => Review::where('reviewee_id', $provider->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('rating') ?? 0,
            'total_reviews' => Review::where('reviewee_id', $provider->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'response_rate' => $this->calculateProviderResponseRate($provider, $startDate, $endDate)
        ];
    }

    private function getProviderEarningsBreakdown($provider, $startDate, $endDate)
    {
        return [
            'gross_earnings' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount'),
            'platform_fees' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('platform_fee'),
            'net_earnings' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'by_service' => Payment::join('appointments', 'payments.appointment_id', '=', 'appointments.id')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->where('payments.provider_id', $provider->id)
                ->where('payments.status', 'completed')
                ->whereBetween('payments.processed_at', [$startDate, $endDate])
                ->groupBy('services.id', 'services.title')
                ->select('services.title', DB::raw('SUM(payments.provider_amount) as earnings'))
                ->get()
        ];
    }

    private function getProviderServicePerformance($provider, $startDate, $endDate)
    {
        return Service::where('provider_id', $provider->id)
            ->withCount(['appointments as total_bookings' => function ($query) use ($startDate, $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withCount(['appointments as completed_bookings' => function ($query) use ($startDate, $endDate) {
                $query->where('status', 'completed')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }])
            ->withAvg(['reviews as average_rating' => function ($query) use ($startDate, $endDate) {
                $query->where('review_type', 'client_to_provider')
                    ->whereBetween('created_at', [$startDate, $endDate]);
            }], 'rating')
            ->get(['id', 'title', 'base_price', 'pricing_type']);
    }

    private function getProviderAppointmentAnalytics($provider, $startDate, $endDate)
    {
        return [
            'by_status' => Appointment::where('provider_id', $provider->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('status')
                ->select('status', DB::raw('COUNT(*) as count'))
                ->get(),
            'by_month' => Appointment::where('provider_id', $provider->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('YEAR(created_at) as year'),
                    DB::raw('MONTH(created_at) as month'),
                    DB::raw('COUNT(*) as count')
                )
                ->groupBy('year', 'month')
                ->orderBy('year')
                ->orderBy('month')
                ->get()
        ];
    }

    private function getProviderCustomerFeedback($provider, $startDate, $endDate)
    {
        return [
            'recent_reviews' => Review::where('reviewee_id', $provider->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with(['reviewer', 'appointment.service'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'rating_distribution' => Review::where('reviewee_id', $provider->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->groupBy('rating')
                ->select('rating', DB::raw('COUNT(*) as count'))
                ->orderBy('rating', 'desc')
                ->get()
        ];
    }

    private function getProviderGrowthMetrics($provider, $startDate, $endDate)
    {
        $previousPeriod = [
            $startDate->copy()->subDays($startDate->diffInDays($endDate) + 1),
            $startDate->copy()->subDay()
        ];

        $currentEarnings = Payment::where('provider_id', $provider->id)
            ->where('status', 'completed')
            ->whereBetween('processed_at', [$startDate, $endDate])
            ->sum('provider_amount');

        $previousEarnings = Payment::where('provider_id', $provider->id)
            ->where('status', 'completed')
            ->whereBetween('processed_at', $previousPeriod)
            ->sum('provider_amount');

        return [
            'earnings_growth' => $previousEarnings > 0 ? 
                (($currentEarnings - $previousEarnings) / $previousEarnings) * 100 : 0,
            'booking_growth' => $this->calculateBookingGrowth($provider, $startDate, $endDate),
            'rating_trend' => $this->calculateRatingTrend($provider, $startDate, $endDate)
        ];
    }

    // Provider Financial Helper Methods
    private function getProviderEarningsSummary($provider, $startDate, $endDate)
    {
        return [
            'total_gross_income' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount'),
            'platform_fees_paid' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('platform_fee'),
            'net_earnings' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'pending_payments' => Payment::where('provider_id', $provider->id)
                ->where('status', 'pending')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'refunded_amount' => Payment::where('provider_id', $provider->id)
                ->where('status', 'refunded')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount')
        ];
    }

    private function getProviderIncomeBreakdown($provider, $startDate, $endDate)
    {
        return [
            'by_service' => Payment::join('appointments', 'payments.appointment_id', '=', 'appointments.id')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->where('payments.provider_id', $provider->id)
                ->where('payments.status', 'completed')
                ->whereBetween('payments.processed_at', [$startDate, $endDate])
                ->groupBy('services.id', 'services.title')
                ->select(
                    'services.title',
                    DB::raw('COUNT(*) as transactions'),
                    DB::raw('SUM(payments.amount) as gross_income'),
                    DB::raw('SUM(payments.provider_amount) as net_income')
                )
                ->get(),
            'by_payment_method' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->groupBy('method')
                ->select(
                    'method',
                    DB::raw('COUNT(*) as transactions'),
                    DB::raw('SUM(provider_amount) as total')
                )
                ->get()
        ];
    }

    private function getProviderPaymentAnalytics($provider, $startDate, $endDate)
    {
        return [
            'payment_timeline' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(processed_at) as date'),
                    DB::raw('COUNT(*) as transactions'),
                    DB::raw('SUM(provider_amount) as amount')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get(),
            'average_transaction_value' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->avg('provider_amount') ?? 0
        ];
    }

    private function getProviderInvoiceSummary($provider, $startDate, $endDate)
    {
        return [
            'total_invoices' => Invoice::where('provider_id', $provider->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'paid_invoices' => Invoice::where('provider_id', $provider->id)
                ->where('status', 'paid')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'pending_invoices' => Invoice::where('provider_id', $provider->id)
                ->where('status', 'sent')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'overdue_invoices' => Invoice::where('provider_id', $provider->id)
                ->where('status', 'overdue')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count()
        ];
    }

    private function getProviderTaxInformation($provider, $startDate, $endDate)
    {
        return [
            'total_income' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('provider_amount'),
            'business_expenses' => 0, // To be implemented based on expense tracking
            'tax_year' => $startDate->year,
            'quarterly_breakdown' => Payment::where('provider_id', $provider->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->select(
                    DB::raw('QUARTER(processed_at) as quarter'),
                    DB::raw('SUM(provider_amount) as income')
                )
                ->groupBy('quarter')
                ->get()
        ];
    }

    private function getProviderMonthlyTrends($provider, $startDate, $endDate)
    {
        return Payment::where('provider_id', $provider->id)
            ->where('status', 'completed')
            ->whereBetween('processed_at', [$startDate, $endDate])
            ->select(
                DB::raw('YEAR(processed_at) as year'),
                DB::raw('MONTH(processed_at) as month'),
                DB::raw('COUNT(*) as transactions'),
                DB::raw('SUM(provider_amount) as earnings')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();
    }

    // Client Activity Helper Methods
    private function getClientActivitySummary($client, $startDate, $endDate)
    {
        return [
            'total_bookings' => Appointment::where('client_id', $client->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'completed_services' => Appointment::where('client_id', $client->id)
                ->where('status', 'completed')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'total_spent' => Payment::where('client_id', $client->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->sum('amount'),
            'reviews_given' => Review::where('reviewer_id', $client->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'favorite_category' => $this->getClientFavoriteCategory($client, $startDate, $endDate)
        ];
    }

    private function getClientBookingHistory($client, $startDate, $endDate)
    {
        return Appointment::where('client_id', $client->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->with(['service.category', 'provider'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'date' => $appointment->created_at->format('M d, Y'),
                    'service' => $appointment->service->title,
                    'provider' => $appointment->provider->full_name,
                    'category' => $appointment->service->category->name,
                    'status' => $appointment->status,
                    'amount' => $appointment->total_amount
                ];
            });
    }

    private function getClientSpendingAnalysis($client, $startDate, $endDate)
    {
        return [
            'by_category' => Payment::join('appointments', 'payments.appointment_id', '=', 'appointments.id')
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->join('categories', 'services.category_id', '=', 'categories.id')
                ->where('payments.client_id', $client->id)
                ->where('payments.status', 'completed')
                ->whereBetween('payments.processed_at', [$startDate, $endDate])
                ->groupBy('categories.id', 'categories.name')
                ->select('categories.name', DB::raw('SUM(payments.amount) as total'))
                ->get(),
            'monthly_spending' => Payment::where('client_id', $client->id)
                ->where('status', 'completed')
                ->whereBetween('processed_at', [$startDate, $endDate])
                ->select(
                    DB::raw('YEAR(processed_at) as year'),
                    DB::raw('MONTH(processed_at) as month'),
                    DB::raw('SUM(amount) as total')
                )
                ->groupBy('year', 'month')
                ->get()
        ];
    }

    private function getClientServicePreferences($client, $startDate, $endDate)
    {
        return [
            'most_booked_services' => Appointment::where('client_id', $client->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->join('services', 'appointments.service_id', '=', 'services.id')
                ->groupBy('services.id', 'services.title')
                ->select('services.title', DB::raw('COUNT(*) as bookings'))
                ->orderBy('bookings', 'desc')
                ->limit(5)
                ->get(),
            'preferred_providers' => Appointment::where('client_id', $client->id)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->join('users', 'appointments.provider_id', '=', 'users.id')
                ->groupBy('users.id', 'users.first_name', 'users.last_name')
                ->select(
                    DB::raw('CONCAT(users.first_name, " ", users.last_name) as provider_name'),
                    DB::raw('COUNT(*) as bookings')
                )
                ->orderBy('bookings', 'desc')
                ->limit(5)
                ->get()
        ];
    }

    private function getClientReviewSummary($client, $startDate, $endDate)
    {
        return [
            'reviews_given' => Review::where('reviewer_id', $client->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count(),
            'average_rating_given' => Review::where('reviewer_id', $client->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->avg('rating') ?? 0,
            'recent_reviews' => Review::where('reviewer_id', $client->id)
                ->where('review_type', 'client_to_provider')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->with(['appointment.service', 'reviewee'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];
    }

    // Helper calculation methods
    private function calculateProviderResponseRate($provider, $startDate, $endDate)
    {
        $totalQuotes = Quote::where('provider_id', $provider->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $respondedQuotes = Quote::where('provider_id', $provider->id)
            ->whereNotNull('responded_at')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        return $totalQuotes > 0 ? ($respondedQuotes / $totalQuotes) * 100 : 0;
    }

    private function calculateBookingGrowth($provider, $startDate, $endDate)
    {
        $periodDays = $startDate->diffInDays($endDate) + 1;
        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousEnd = $startDate->copy()->subDay();

        $currentBookings = Appointment::where('provider_id', $provider->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        $previousBookings = Appointment::where('provider_id', $provider->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        return $previousBookings > 0 ? 
            (($currentBookings - $previousBookings) / $previousBookings) * 100 : 0;
    }

    private function calculateRatingTrend($provider, $startDate, $endDate)
    {
        $currentRating = Review::where('reviewee_id', $provider->id)
            ->where('review_type', 'client_to_provider')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->avg('rating') ?? 0;

        $periodDays = $startDate->diffInDays($endDate) + 1;
        $previousStart = $startDate->copy()->subDays($periodDays);
        $previousEnd = $startDate->copy()->subDay();

        $previousRating = Review::where('reviewee_id', $provider->id)
            ->where('review_type', 'client_to_provider')
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->avg('rating') ?? 0;

        return $currentRating - $previousRating;
    }

    private function getClientFavoriteCategory($client, $startDate, $endDate)
    {
        $category = Appointment::where('client_id', $client->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->join('services', 'appointments.service_id', '=', 'services.id')
            ->join('categories', 'services.category_id', '=', 'categories.id')
            ->groupBy('categories.id', 'categories.name')
            ->select('categories.name', DB::raw('COUNT(*) as bookings'))
            ->orderBy('bookings', 'desc')
            ->first();

        return $category ? $category->name : 'No bookings yet';
    }
}