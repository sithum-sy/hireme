<?php

namespace App\Http\Controllers\API\Staff;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Service;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\ServiceCategory;
use App\Models\Quote;
use App\Models\Review;
use App\Models\Invoice;
use App\Models\ProviderProfile;
use App\Models\StaffActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
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
            
            // Convert to proper datetime boundaries for accurate filtering
            $startDateTime = Carbon::parse($startDate)->startOfDay();
            $endDateTime = Carbon::parse($endDate)->endOfDay();

            $data = [
                'summary' => $this->getPlatformSummary($startDateTime, $endDateTime),
                'user_growth' => $this->getUserGrowthData($startDate, $endDate),
                'service_statistics' => $this->getServiceStatisticsData($startDateTime, $endDateTime),
                'appointment_analytics' => $this->getAppointmentAnalyticsData($startDateTime, $endDateTime),
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
    private function getPlatformSummary($startDateTime, $endDateTime)
    {
        // Summary cards show data within selected date range
        $totalUsers = User::whereBetween('created_at', [$startDateTime, $endDateTime])->count();
        $totalProviders = User::where('role', 'service_provider')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->count();
        $totalClients = User::where('role', 'client')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->count();
        
        $totalServices = Service::whereBetween('created_at', [$startDateTime, $endDateTime])->count();
        $activeServices = Service::where('is_active', true)
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->count();

        // Appointments filtered by date range for activity tracking
        $totalAppointments = Appointment::whereBetween('created_at', [$startDateTime, $endDateTime])->count();
        $completedAppointments = Appointment::where('status', 'completed')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
            ->count();

        // Total Money Exchanged: Show ALL completed payments (cumulative platform total)
        // This represents total money flow through the platform since launch
        $totalMoneyExchanged = Payment::where('status', 'completed')->sum('amount');

        // For average calculation, use payments within date range
        $dateRangePayments = Payment::where('status', 'completed')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
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
            'total_money_exchanged' => 'LKR ' . number_format($totalMoneyExchanged, 2),
            'avg_money_per_appointment' => $totalAppointments > 0 ? 'LKR ' . number_format($dateRangePayments / $totalAppointments, 2) : 'LKR 0.00'
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
        if ($diffInDays == 0) {
            // Single day (Today) - show hourly or just single point
            $data = $this->getDailyUserGrowth($start, $end);
        } elseif ($diffInDays <= 7) {
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
        $diffInDays = $start->diffInDays($end);
        
        while ($current->lte($end)) {
            // For single day, show more descriptive label
            if ($diffInDays == 0) {
                $labels[] = 'Today (' . $current->format('M j') . ')';
            } else {
                $labels[] = $current->format('M j');
            }

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
    private function getServiceStatisticsData($startDateTime, $endDateTime)
    {
        $categories = ServiceCategory::withCount(['services' => function ($query) use ($startDateTime, $endDateTime) {
            $query->whereBetween('created_at', [$startDateTime, $endDateTime]);
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
    private function getAppointmentAnalyticsData($startDateTime, $endDateTime)
    {
        $statusData = Appointment::selectRaw('status, COUNT(*) as count')
            ->whereBetween('created_at', [$startDateTime, $endDateTime])
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
        if ($diffInDays == 0) {
            // Single day (Today) - show single point
            $data = $this->getDailyRevenue($start, $end);
        } elseif ($diffInDays <= 7) {
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
        $diffInDays = $start->diffInDays($end);
        
        while ($current->lte($end)) {
            // For single day, show more descriptive label
            if ($diffInDays == 0) {
                $labels[] = 'Today (' . $current->format('M j') . ')';
            } else {
                $labels[] = $current->format('M j');
            }

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

    /**
     * Get available data sources for custom reports
     */
    public function getDataSources(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff members can access custom reports'
                ], 403);
            }

            $dataSources = [
                'appointments' => [
                    'display_name' => 'Appointments',
                    'description' => 'Booking and appointment data',
                    'icon' => 'fas fa-calendar-alt',
                    'model' => Appointment::class,
                    'default_fields' => ['id', 'client_name', 'provider_name', 'service_title', 'service_category', 'status', 'appointment_date', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'client_name' => ['type' => 'string', 'label' => 'Client Name', 'sortable' => true, 'relation' => 'client.first_name,client.last_name'],
                        'client_email' => ['type' => 'string', 'label' => 'Client Email', 'sortable' => true, 'relation' => 'client.email'],
                        'client_phone' => ['type' => 'string', 'label' => 'Client Phone', 'sortable' => true, 'relation' => 'client.phone'],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'provider_email' => ['type' => 'string', 'label' => 'Provider Email', 'sortable' => true, 'relation' => 'provider.email'],
                        'provider_phone' => ['type' => 'string', 'label' => 'Provider Phone', 'sortable' => true, 'relation' => 'provider.phone'],
                        'service_title' => ['type' => 'string', 'label' => 'Service', 'sortable' => true, 'relation' => 'service.title'],
                        'service_category' => ['type' => 'string', 'label' => 'Category', 'sortable' => true, 'relation' => 'service.category.name'],
                        'service_price' => ['type' => 'decimal', 'label' => 'Service Price', 'sortable' => true, 'relation' => 'service.price'],
                        'status' => ['type' => 'enum', 'label' => 'Status', 'sortable' => true, 'options' => [
                            'pending',
                            'confirmed',
                            'in_progress',
                            'completed',
                            'invoice_sent',
                            'payment_pending',
                            'paid',
                            'reviewed',
                            'closed',
                            'cancelled_by_client',
                            'cancelled_by_provider',
                            'cancelled_by_staff',
                            'no_show',
                            'disputed',
                            'expired'
                        ]],
                        'appointment_date' => ['type' => 'date', 'label' => 'Appointment Date', 'sortable' => true],
                        'appointment_time' => ['type' => 'time', 'label' => 'Appointment Time', 'sortable' => true],
                        'duration_hours' => ['type' => 'integer', 'label' => 'Duration (hours)', 'sortable' => true],
                        'total_price' => ['type' => 'decimal', 'label' => 'Total Price', 'sortable' => true],
                        'base_price' => ['type' => 'decimal', 'label' => 'Base Price', 'sortable' => true],
                        'travel_fee' => ['type' => 'decimal', 'label' => 'Travel Fee', 'sortable' => true],
                        'location_type' => ['type' => 'string', 'label' => 'Location Type', 'sortable' => true],

                        // Client location fields (broken down from client_location object)
                        'client_location_address' => ['type' => 'string', 'label' => 'Client Location - Address', 'sortable' => true, 'json_field' => 'client_location.address'],
                        'client_location_city' => ['type' => 'string', 'label' => 'Client Location - City', 'sortable' => true, 'json_field' => 'client_location.city'],
                        'client_location_state' => ['type' => 'string', 'label' => 'Client Location - State', 'sortable' => true, 'json_field' => 'client_location.state'],
                        'client_location_postal_code' => ['type' => 'string', 'label' => 'Client Location - Postal Code', 'sortable' => true, 'json_field' => 'client_location.postal_code'],
                        'client_location_country' => ['type' => 'string', 'label' => 'Client Location - Country', 'sortable' => true, 'json_field' => 'client_location.country'],

                        // Legacy fields (keep for backward compatibility)
                        'client_address' => ['type' => 'string', 'label' => 'Client Address (Legacy)', 'sortable' => false],
                        'client_city' => ['type' => 'string', 'label' => 'Client City (Legacy)', 'sortable' => true],
                        'payment_method' => ['type' => 'string', 'label' => 'Payment Method', 'sortable' => true],
                        'booking_source' => ['type' => 'string', 'label' => 'Booking Source', 'sortable' => true],
                        'client_notes' => ['type' => 'text', 'label' => 'Client Notes', 'sortable' => false],
                        'provider_notes' => ['type' => 'text', 'label' => 'Provider Notes', 'sortable' => false],
                        'cancellation_reason' => ['type' => 'text', 'label' => 'Cancellation Reason', 'sortable' => false],
                        'confirmed_at' => ['type' => 'datetime', 'label' => 'Confirmed At', 'sortable' => true],
                        'completed_at' => ['type' => 'datetime', 'label' => 'Completed At', 'sortable' => true],
                        'cancelled_at' => ['type' => 'datetime', 'label' => 'Cancelled At', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Created Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'users' => [
                    'display_name' => 'Users',
                    'description' => 'Client and provider user data',
                    'icon' => 'fas fa-users',
                    'model' => User::class,
                    'default_fields' => ['id', 'first_name', 'last_name', 'email', 'role', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'first_name' => ['type' => 'string', 'label' => 'First Name', 'sortable' => true],
                        'last_name' => ['type' => 'string', 'label' => 'Last Name', 'sortable' => true],
                        'email' => ['type' => 'string', 'label' => 'Email', 'sortable' => true],
                        'phone' => ['type' => 'string', 'label' => 'Phone', 'sortable' => true],
                        'role' => ['type' => 'enum', 'label' => 'Role', 'sortable' => true, 'options' => ['client', 'service_provider', 'staff', 'admin']],
                        'is_active' => ['type' => 'boolean', 'label' => 'Active Status', 'sortable' => true],
                        'email_verified_at' => ['type' => 'datetime', 'label' => 'Email Verified', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Registration Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'services' => [
                    'display_name' => 'Services',
                    'description' => 'Service listings and details',
                    'icon' => 'fas fa-concierge-bell',
                    'model' => Service::class,
                    'default_fields' => ['id', 'title', 'provider_name', 'category_name', 'base_price', 'is_active', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'title' => ['type' => 'string', 'label' => 'Service Title', 'sortable' => true],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'category_name' => ['type' => 'string', 'label' => 'Category', 'sortable' => true, 'relation' => 'category.name'],
                        'description' => ['type' => 'text', 'label' => 'Description', 'sortable' => false],
                        'base_price' => ['type' => 'decimal', 'label' => 'Price', 'sortable' => true],
                        'duration' => ['type' => 'integer', 'label' => 'Duration (mins)', 'sortable' => true],
                        'is_active' => ['type' => 'boolean', 'label' => 'Active Status', 'sortable' => true],

                        // Location fields (broken down from location object)
                        'location_address' => ['type' => 'string', 'label' => 'Location - Address', 'sortable' => true, 'json_field' => 'location.address'],
                        'location_city' => ['type' => 'string', 'label' => 'Location - City', 'sortable' => true, 'json_field' => 'location.city'],
                        'location_state' => ['type' => 'string', 'label' => 'Location - State/Province', 'sortable' => true, 'json_field' => 'location.state'],
                        'location_postal_code' => ['type' => 'string', 'label' => 'Location - Postal Code', 'sortable' => true, 'json_field' => 'location.postal_code'],
                        'location_country' => ['type' => 'string', 'label' => 'Location - Country', 'sortable' => true, 'json_field' => 'location.country'],
                        'location_type' => ['type' => 'string', 'label' => 'Location - Type', 'sortable' => true, 'json_field' => 'location.type'],
                        'location_name' => ['type' => 'string', 'label' => 'Location - Name/Area', 'sortable' => true, 'json_field' => 'location.name'],
                        'location_coordinates' => ['type' => 'string', 'label' => 'Location - Coordinates', 'sortable' => false, 'json_field' => 'location.coordinates'],

                        'created_at' => ['type' => 'datetime', 'label' => 'Created Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'service_categories' => [
                    'display_name' => 'Service Categories',
                    'description' => 'Service category management data',
                    'icon' => 'fas fa-tags',
                    'model' => ServiceCategory::class,
                    'default_fields' => ['id', 'name', 'services_count', 'is_active', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'name' => ['type' => 'string', 'label' => 'Category Name', 'sortable' => true],
                        'description' => ['type' => 'text', 'label' => 'Description', 'sortable' => false],
                        'services_count' => ['type' => 'integer', 'label' => 'Services Count', 'sortable' => true, 'computed' => 'services_count'],
                        'is_active' => ['type' => 'boolean', 'label' => 'Active Status', 'sortable' => true],
                        'sort_order' => ['type' => 'integer', 'label' => 'Sort Order', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Created Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'quotes' => [
                    'display_name' => 'Quotes',
                    'description' => 'Quote requests and responses',
                    'icon' => 'fas fa-quote-left',
                    'model' => Quote::class,
                    'default_fields' => ['id', 'client_name', 'provider_name', 'service_title', 'status', 'quoted_price', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'client_name' => ['type' => 'string', 'label' => 'Client Name', 'sortable' => true, 'relation' => 'client.first_name,client.last_name'],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'service_title' => ['type' => 'string', 'label' => 'Service', 'sortable' => true, 'relation' => 'service.title'],
                        'status' => ['type' => 'enum', 'label' => 'Status', 'sortable' => true, 'options' => ['pending', 'quoted', 'accepted', 'rejected', 'expired']],
                        'message' => ['type' => 'text', 'label' => 'Request Message', 'sortable' => false],
                        'quoted_price' => ['type' => 'decimal', 'label' => 'Quoted Price', 'sortable' => true],
                        'provider_message' => ['type' => 'text', 'label' => 'Provider Response', 'sortable' => false],
                        'expires_at' => ['type' => 'datetime', 'label' => 'Expires At', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Created Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'reviews' => [
                    'display_name' => 'Reviews',
                    'description' => 'Service reviews and ratings',
                    'icon' => 'fas fa-star',
                    'model' => Review::class,
                    'default_fields' => ['id', 'client_name', 'provider_name', 'service_title', 'rating', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'client_name' => ['type' => 'string', 'label' => 'Client Name', 'sortable' => true, 'relation' => 'client.first_name,client.last_name'],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'service_title' => ['type' => 'string', 'label' => 'Service', 'sortable' => true, 'relation' => 'service.title'],
                        'appointment_id' => ['type' => 'integer', 'label' => 'Appointment ID', 'sortable' => true],
                        'rating' => ['type' => 'integer', 'label' => 'Rating (1-5)', 'sortable' => true],
                        'comment' => ['type' => 'text', 'label' => 'Comment', 'sortable' => false],
                        'created_at' => ['type' => 'datetime', 'label' => 'Review Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'payments' => [
                    'display_name' => 'Payments',
                    'description' => 'Payment transactions',
                    'icon' => 'fas fa-credit-card',
                    'model' => Payment::class,
                    'default_fields' => ['id', 'client_name', 'provider_name', 'amount', 'status', 'payment_method', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'client_name' => ['type' => 'string', 'label' => 'Client Name', 'sortable' => true, 'relation' => 'client.first_name,client.last_name'],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'appointment_id' => ['type' => 'integer', 'label' => 'Appointment ID', 'sortable' => true],
                        'amount' => ['type' => 'decimal', 'label' => 'Amount', 'sortable' => true],
                        'platform_fee' => ['type' => 'decimal', 'label' => 'Platform Fee', 'sortable' => true],
                        'status' => ['type' => 'enum', 'label' => 'Status', 'sortable' => true, 'options' => ['pending', 'completed', 'failed', 'refunded']],
                        'payment_method' => ['type' => 'string', 'label' => 'Payment Method', 'sortable' => true, 'field_map' => 'method'],
                        'stripe_payment_intent_id' => ['type' => 'string', 'label' => 'Stripe ID', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Payment Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'invoices' => [
                    'display_name' => 'Invoices',
                    'description' => 'Invoice and billing data',
                    'icon' => 'fas fa-file-invoice',
                    'model' => Invoice::class,
                    'default_fields' => ['id', 'client_name', 'provider_name', 'invoice_number', 'total_amount', 'status', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'client_name' => ['type' => 'string', 'label' => 'Client Name', 'sortable' => true, 'relation' => 'client.first_name,client.last_name'],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'provider.first_name,provider.last_name'],
                        'invoice_number' => ['type' => 'string', 'label' => 'Invoice Number', 'sortable' => true],
                        'appointment_id' => ['type' => 'integer', 'label' => 'Appointment ID', 'sortable' => true],
                        'subtotal' => ['type' => 'decimal', 'label' => 'Subtotal', 'sortable' => true],
                        'tax_amount' => ['type' => 'decimal', 'label' => 'Tax Amount', 'sortable' => true],
                        'total_amount' => ['type' => 'decimal', 'label' => 'Total Amount', 'sortable' => true],
                        'status' => ['type' => 'enum', 'label' => 'Status', 'sortable' => true, 'options' => ['draft', 'sent', 'paid', 'overdue', 'cancelled']],
                        'due_date' => ['type' => 'date', 'label' => 'Due Date', 'sortable' => true],
                        'paid_at' => ['type' => 'datetime', 'label' => 'Paid Date', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Created Date', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ],
                'provider_profiles' => [
                    'display_name' => 'Provider Profiles',
                    'description' => 'Extended provider information',
                    'icon' => 'fas fa-user-tie',
                    'model' => ProviderProfile::class,
                    'default_fields' => ['id', 'provider_name', 'business_name', 'services_count', 'average_rating', 'is_verified', 'created_at'],
                    'fields' => [
                        'id' => ['type' => 'integer', 'label' => 'ID', 'sortable' => true],
                        'provider_name' => ['type' => 'string', 'label' => 'Provider Name', 'sortable' => true, 'relation' => 'user.first_name,user.last_name'],
                        'business_name' => ['type' => 'string', 'label' => 'Business Name', 'sortable' => true],
                        'bio' => ['type' => 'text', 'label' => 'Bio', 'sortable' => false],
                        'experience_years' => ['type' => 'integer', 'label' => 'Experience (Years)', 'sortable' => true],
                        'hourly_rate' => ['type' => 'decimal', 'label' => 'Hourly Rate', 'sortable' => true],
                        'services_count' => ['type' => 'integer', 'label' => 'Services Count', 'sortable' => true, 'computed' => 'services_count'],
                        'average_rating' => ['type' => 'decimal', 'label' => 'Average Rating', 'sortable' => true, 'computed' => 'average_rating'],
                        'total_reviews' => ['type' => 'integer', 'label' => 'Total Reviews', 'sortable' => true, 'computed' => 'total_reviews'],
                        'is_verified' => ['type' => 'boolean', 'label' => 'Verified Status', 'sortable' => true],
                        'availability_radius' => ['type' => 'integer', 'label' => 'Service Radius (km)', 'sortable' => true],
                        'created_at' => ['type' => 'datetime', 'label' => 'Profile Created', 'sortable' => true],
                        'updated_at' => ['type' => 'datetime', 'label' => 'Last Updated', 'sortable' => true],
                    ]
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $dataSources
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch data sources',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Get dropdown options for enum fields and categories
     */
    public function getFieldOptions(Request $request)
    {
        $request->validate([
            'data_source' => 'required|string',
            'field' => 'required|string'
        ]);

        try {
            $user = Auth::user();

            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff members can access field options'
                ], 403);
            }

            $dataSource = $request->data_source;
            $field = $request->field;

            // Get data source configuration
            $dataSources = $this->getDataSources(new Request())->getData(true)['data'];

            if (!isset($dataSources[$dataSource])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data source'
                ], 400);
            }

            $sourceConfig = $dataSources[$dataSource];
            $fieldConfig = $sourceConfig['fields'][$field] ?? null;

            if (!$fieldConfig) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid field'
                ], 400);
            }

            $options = [];

            // Handle different field types that need dynamic options
            if ($fieldConfig['type'] === 'enum' && isset($fieldConfig['options'])) {
                // For enum fields with predefined options
                $options = array_map(function ($option) {
                    return [
                        'value' => $option,
                        'label' => ucwords(str_replace('_', ' ', $option))
                    ];
                }, $fieldConfig['options']);
            } elseif ($field === 'service_category' || $field === 'category_name') {
                // For service categories - get from database
                $categories = ServiceCategory::where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name']);

                $options = $categories->map(function ($category) {
                    return [
                        'value' => $category->name,
                        'label' => $category->name
                    ];
                })->toArray();
            } elseif (strpos($field, '_name') !== false && isset($fieldConfig['relation'])) {
                // For other relational fields, get unique values from the database
                $modelClass = $sourceConfig['model'];
                $relationParts = explode('.', $fieldConfig['relation']);

                if (count($relationParts) >= 2) {
                    $relation = $relationParts[0];
                    $relationField = $relationParts[1];

                    // Get unique values for this relation field
                    $values = $modelClass::with($relation)
                        ->get()
                        ->pluck($relation . '.' . $relationField)
                        ->filter()
                        ->unique()
                        ->sort()
                        ->values();

                    $options = $values->map(function ($value) {
                        return [
                            'value' => $value,
                            'label' => $value
                        ];
                    })->toArray();
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'field' => $field,
                    'field_type' => $fieldConfig['type'],
                    'options' => $options
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Field options fetch failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch field options',
                'error' => app()->environment('local') ? $e->getMessage() : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Test simple report generation (for debugging)
     */
    public function testSimpleReport(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff members can generate reports'
                ], 403);
            }

            // Simple test with basic appointments data
            $results = Appointment::select(['id', 'status', 'appointment_date', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $results->toArray(),
                    'count' => $results->count(),
                    'test' => 'Basic appointment query successful'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Test failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate custom report
     */
    public function generateCustomReport(Request $request)
    {
        $request->validate([
            'data_source' => 'required|string',
            'fields' => 'required|array|min:1',
            'fields.*' => 'required|string',
            'filters' => 'nullable|array',
            'filters.*.field' => 'required_with:filters|string',
            'filters.*.operator' => 'required_with:filters|string|in:equals,not_equals,contains,not_contains,starts_with,ends_with,greater_than,less_than,between,in,not_in,is_null,is_not_null',
            'filters.*.value' => 'nullable',
            'sorting' => 'nullable|array',
            'sorting.*.field' => 'required_with:sorting|string',
            'sorting.*.direction' => 'required_with:sorting|string|in:asc,desc',
            'pagination' => 'nullable|array',
            'pagination.page' => 'nullable|integer|min:1',
            'pagination.per_page' => 'nullable|integer|min:1|max:1000',
        ]);

        try {
            $user = Auth::user();

            if ($user->role !== 'staff') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only staff members can generate custom reports'
                ], 403);
            }

            $dataSource = $request->data_source;
            $fields = $request->fields;
            $filters = $request->filters ?? [];
            $sorting = $request->sorting ?? [];
            $pagination = $request->pagination ?? ['page' => 1, 'per_page' => 50];

            // Get data source configuration
            $dataSources = $this->getDataSources(new Request())->getData(true)['data'];

            if (!isset($dataSources[$dataSource])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid data source'
                ], 400);
            }

            $sourceConfig = $dataSources[$dataSource];
            $modelClass = $sourceConfig['model'];

            // Build query
            $query = $this->buildCustomQuery($modelClass, $sourceConfig, $fields, $filters, $sorting);

            // Get total count before pagination (clone query to avoid issues)
            $totalCount = (clone $query)->count();

            // Apply pagination
            $page = $pagination['page'];
            $perPage = $pagination['per_page'];
            $offset = ($page - 1) * $perPage;

            $results = $query->offset($offset)->limit($perPage)->get();

            // Format results
            $formattedResults = $this->formatReportResults($results, $sourceConfig, $fields);

            // Final safety check to ensure no objects are passed to frontend
            $formattedResults = array_map(function ($row) {
                return array_map(function ($value) {
                    if (is_object($value) || is_array($value)) {
                        \Log::warning('Object/Array value detected in report results', [
                            'value' => $value,
                            'type' => gettype($value)
                        ]);
                        return is_array($value) ? implode(', ', $value) : (string) $value;
                    }
                    return $value;
                }, $row);
            }, $formattedResults);

            return response()->json([
                'success' => true,
                'data' => [
                    'results' => $formattedResults,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $perPage,
                        'total' => $totalCount,
                        'total_pages' => ceil($totalCount / $perPage),
                        'from' => $offset + 1,
                        'to' => min($offset + $perPage, $totalCount)
                    ],
                    'meta' => [
                        'data_source' => $dataSource,
                        'fields' => $fields,
                        'filters_applied' => count($filters),
                        'generated_at' => now()->toISOString()
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Custom report generation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate custom report',
                'error' => app()->environment('local') ? [
                    'message' => $e->getMessage(),
                    'line' => $e->getLine(),
                    'file' => basename($e->getFile())
                ] : 'An error occurred'
            ], 500);
        }
    }

    /**
     * Build custom query based on parameters
     */
    private function buildCustomQuery($modelClass, $sourceConfig, $fields, $filters, $sorting)
    {
        $query = $modelClass::query();

        // Handle computed fields that need special query handling
        $needsWithCount = false;
        foreach ($fields as $field) {
            $fieldConfig = $sourceConfig['fields'][$field] ?? null;
            if ($fieldConfig && isset($fieldConfig['computed'])) {
                switch ($fieldConfig['computed']) {
                    case 'services_count':
                        $needsWithCount = true;
                        $query->withCount('services');
                        break;
                    case 'average_rating':
                    case 'total_reviews':
                        // These will be computed at format time
                        break;
                }
            }
        }

        // Handle relations for selected fields
        $relations = [];
        foreach ($fields as $field) {
            if (isset($sourceConfig['fields'][$field]['relation'])) {
                $relationPath = $sourceConfig['fields'][$field]['relation'];

                // Handle comma-separated fields from same relation (e.g., 'client.first_name,client.last_name')
                if (strpos($relationPath, ',') !== false) {
                    $relationFields = explode(',', $relationPath);
                    foreach ($relationFields as $relationField) {
                        $relationParts = explode('.', trim($relationField));

                        // Build nested relation paths
                        $currentPath = '';
                        for ($i = 0; $i < count($relationParts) - 1; $i++) {
                            if ($currentPath !== '') {
                                $currentPath .= '.';
                            }
                            $currentPath .= $relationParts[$i];

                            if (!in_array($currentPath, $relations)) {
                                $relations[] = $currentPath;
                            }
                        }
                    }
                } else {
                    // Single relation field
                    $relationParts = explode('.', $relationPath);

                    // Build nested relation paths (e.g., service.category from service.category.name)
                    $currentPath = '';
                    for ($i = 0; $i < count($relationParts) - 1; $i++) {
                        if ($currentPath !== '') {
                            $currentPath .= '.';
                        }
                        $currentPath .= $relationParts[$i];

                        if (!in_array($currentPath, $relations)) {
                            $relations[] = $currentPath;
                        }
                    }
                }
            }
        }

        if (!empty($relations)) {
            try {
                $query->with($relations);
            } catch (\Exception $e) {
                \Log::error("Error loading relations: " . $e->getMessage(), [
                    'relations' => $relations,
                    'model' => $modelClass
                ]);
                // Continue without relations if there's an error
            }
        }

        // Apply filters
        foreach ($filters as $filter) {
            try {
                $field = $filter['field'];
                $operator = $filter['operator'];
                $value = $filter['value'] ?? null;

                // Skip empty filters
                if (empty($field) || empty($operator)) {
                    continue;
                }

                // Handle different field types in filters
                if (isset($sourceConfig['fields'][$field]['json_field'])) {
                    // Handle JSON field filters
                    $this->applyJsonFieldFilter($query, $sourceConfig['fields'][$field]['json_field'], $operator, $value);
                } elseif (isset($sourceConfig['fields'][$field]['relation'])) {
                    // Handle relation field filters
                    $this->applyRelationFilter($query, $sourceConfig['fields'][$field]['relation'], $operator, $value);
                } else {
                    // Handle direct field filters
                    $this->applyDirectFilter($query, $field, $operator, $value);
                }
            } catch (\Exception $e) {
                \Log::warning("Error applying filter", [
                    'filter' => $filter,
                    'error' => $e->getMessage()
                ]);
                // Skip this filter and continue
            }
        }

        // Apply sorting
        foreach ($sorting as $sort) {
            try {
                $field = $sort['field'];
                $direction = $sort['direction'];

                // Skip empty sort rules
                if (empty($field) || empty($direction)) {
                    continue;
                }

                // Validate direction
                if (!in_array($direction, ['asc', 'desc'])) {
                    $direction = 'asc';
                }

                // Handle sorting for different field types
                if (isset($sourceConfig['fields'][$field]['json_field'])) {
                    // Handle JSON field sorting
                    $jsonPath = $sourceConfig['fields'][$field]['json_field'];
                    $parts = explode('.', $jsonPath);

                    if (count($parts) >= 2) {
                        $jsonField = $parts[0];
                        $jsonKey = implode('.', array_slice($parts, 1));
                        $query->orderByRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) $direction");
                    }
                } elseif (!isset($sourceConfig['fields'][$field]['relation'])) {
                    // Only sort by direct fields to avoid complex join issues
                    $query->orderBy($field, $direction);
                }
                // TODO: Implement relation-based sorting later if needed
            } catch (\Exception $e) {
                \Log::warning("Error applying sort", [
                    'sort' => $sort,
                    'error' => $e->getMessage()
                ]);
                // Skip this sort and continue
            }
        }

        // Default sorting if none applied successfully
        try {
            $hasValidSort = false;
            foreach ($sorting as $sort) {
                if (!empty($sort['field']) && !empty($sort['direction']) && !isset($sourceConfig['fields'][$sort['field']]['relation'])) {
                    $hasValidSort = true;
                    break;
                }
            }

            if (!$hasValidSort) {
                $query->orderBy('created_at', 'desc');
            }
        } catch (\Exception $e) {
            // Fallback to ID ordering if created_at doesn't exist
            $query->orderBy('id', 'desc');
        }

        return $query;
    }

    /**
     * Apply JSON field filter (e.g., location.city)
     */
    private function applyJsonFieldFilter($query, $jsonPath, $operator, $value)
    {
        try {
            $parts = explode('.', $jsonPath);

            if (count($parts) < 2) {
                // If no dot notation, treat as regular field
                $this->applyDirectFilter($query, $jsonPath, $operator, $value);
                return;
            }

            // Get the JSON field and path
            $jsonField = $parts[0];
            $jsonKey = implode('.', array_slice($parts, 1));

            // Use JSON_EXTRACT for MySQL/MariaDB
            switch ($operator) {
                case 'equals':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) = ?", [$value]);
                    break;
                case 'not_equals':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) != ?", [$value]);
                    break;
                case 'contains':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) LIKE ?", ["%{$value}%"]);
                    break;
                case 'not_contains':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) NOT LIKE ?", ["%{$value}%"]);
                    break;
                case 'starts_with':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) LIKE ?", ["{$value}%"]);
                    break;
                case 'ends_with':
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) LIKE ?", ["%{$value}"]);
                    break;
                case 'is_null':
                    $query->whereRaw("JSON_EXTRACT($jsonField, '$.{$jsonKey}') IS NULL");
                    break;
                case 'is_not_null':
                    $query->whereRaw("JSON_EXTRACT($jsonField, '$.{$jsonKey}') IS NOT NULL");
                    break;
                default:
                    // For other operators, fall back to basic equals
                    $query->whereRaw("JSON_UNQUOTE(JSON_EXTRACT($jsonField, '$.{$jsonKey}')) = ?", [$value]);
                    break;
            }
        } catch (\Exception $e) {
            \Log::warning("Error applying JSON field filter for '$jsonPath': " . $e->getMessage());
            // Skip this filter if it fails
        }
    }

    /**
     * Apply direct field filter
     */
    private function applyDirectFilter($query, $field, $operator, $value)
    {
        switch ($operator) {
            case 'equals':
                $query->where($field, '=', $value);
                break;
            case 'not_equals':
                $query->where($field, '!=', $value);
                break;
            case 'contains':
                $query->where($field, 'LIKE', '%' . $value . '%');
                break;
            case 'not_contains':
                $query->where($field, 'NOT LIKE', '%' . $value . '%');
                break;
            case 'starts_with':
                $query->where($field, 'LIKE', $value . '%');
                break;
            case 'ends_with':
                $query->where($field, 'LIKE', '%' . $value);
                break;
            case 'greater_than':
                $query->where($field, '>', $value);
                break;
            case 'less_than':
                $query->where($field, '<', $value);
                break;
            case 'between':
                if (is_array($value) && count($value) === 2) {
                    $query->whereBetween($field, $value);
                }
                break;
            case 'in':
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                }
                break;
            case 'not_in':
                if (is_array($value)) {
                    $query->whereNotIn($field, $value);
                }
                break;
            case 'is_null':
                $query->whereNull($field);
                break;
            case 'is_not_null':
                $query->whereNotNull($field);
                break;
        }
    }

    /**
     * Apply relation field filter (simplified implementation)
     */
    private function applyRelationFilter($query, $relation, $operator, $value)
    {
        try {
            \Log::info("Applying relation filter", [
                'relation' => $relation,
                'operator' => $operator,
                'value' => $value
            ]);

            // Handle comma-separated complete relation paths (e.g., 'client.first_name,client.last_name')
            if (strpos($relation, ',') !== false) {
                $relationPaths = explode(',', $relation);

                $query->where(function ($orQuery) use ($relationPaths, $operator, $value) {
                    foreach ($relationPaths as $singlePath) {
                        $singlePath = trim($singlePath);
                        $orQuery->orWhere(function ($pathQuery) use ($singlePath, $operator, $value) {
                            $this->applySingleRelationFilter($pathQuery, $singlePath, $operator, $value);
                        });
                    }
                });

                return;
            }

            // Handle single relation path
            $this->applySingleRelationFilter($query, $relation, $operator, $value);
        } catch (\Exception $e) {
            \Log::warning("Error applying relation filter for '$relation': " . $e->getMessage());
            // Skip this filter if it fails
        }
    }

    /**
     * Apply single relation filter (helper method)
     */
    private function applySingleRelationFilter($query, $relation, $operator, $value)
    {
        try {
            $relationParts = explode('.', $relation);

            // Handle nested relations recursively
            if (count($relationParts) === 1) {
                // Direct field on current model
                $this->applyDirectFilter($query, $relationParts[0], $operator, $value);
            } else if (count($relationParts) === 2) {
                // Single relation level (e.g., service.title)
                $relationName = $relationParts[0];
                $field = $relationParts[1];

                $query->whereHas($relationName, function ($q) use ($field, $operator, $value) {
                    $this->applyDirectFilter($q, $field, $operator, $value);
                });
            } else if (count($relationParts) >= 3) {
                // Nested relations (e.g., service.category.name)
                $firstRelation = $relationParts[0];
                $remainingRelation = implode('.', array_slice($relationParts, 1));

                $query->whereHas($firstRelation, function ($q) use ($remainingRelation, $operator, $value) {
                    // Recursively handle the remaining relation path
                    $this->applySingleRelationFilter($q, $remainingRelation, $operator, $value);
                });
            }
        } catch (\Exception $e) {
            \Log::warning("Error applying single relation filter for '$relation': " . $e->getMessage());
        }
    }

    /**
     * Format report results
     */
    private function formatReportResults($results, $sourceConfig, $fields)
    {
        return $results->map(function ($item) use ($sourceConfig, $fields) {
            $formatted = [];

            foreach ($fields as $field) {
                $fieldConfig = $sourceConfig['fields'][$field] ?? null;

                if (!$fieldConfig) {
                    continue;
                }

                // Handle different field types
                if (isset($fieldConfig['json_field'])) {
                    // Handle JSON field extraction (e.g., location.address)
                    $value = $this->getJsonFieldValue($item, $fieldConfig['json_field']);
                } elseif (isset($fieldConfig['relation'])) {
                    // Handle relation fields
                    $value = $this->getRelationValue($item, $fieldConfig['relation']);
                } elseif (isset($fieldConfig['computed'])) {
                    // Handle computed fields
                    $value = $this->getComputedValue($item, $fieldConfig['computed']);
                } elseif (isset($fieldConfig['field_map'])) {
                    // Handle field mapping (e.g., payment_method -> method)
                    $value = $item->{$fieldConfig['field_map']};
                } else {
                    // Direct field
                    $value = $item->{$field};
                }

                // Format value based on type
                $formatted[$field] = $this->formatFieldValue($value, $fieldConfig['type']);

                // Additional safety check - ensure we never return objects to frontend
                if (is_object($formatted[$field]) || is_array($formatted[$field])) {
                    $formatted[$field] = is_array($formatted[$field]) ? implode(', ', $formatted[$field]) : (string) $formatted[$field];
                }
            }

            return $formatted;
        })->toArray();
    }

    /**
     * Get value from JSON field (e.g., location.address)
     */
    private function getJsonFieldValue($item, $jsonPath)
    {
        try {
            $parts = explode('.', $jsonPath);

            if (count($parts) < 2) {
                // If no dot notation, treat as regular field
                return $item->{$jsonPath} ?? null;
            }

            // Get the JSON field (first part)
            $jsonField = $parts[0];
            $jsonData = $item->{$jsonField};

            // If the field is null or empty, return null
            if (!$jsonData) {
                return null;
            }

            // If it's a string, try to decode it as JSON
            if (is_string($jsonData)) {
                $jsonData = json_decode($jsonData, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    return null;
                }
            }

            // If it's still not an array/object, return null
            if (!is_array($jsonData)) {
                return null;
            }

            // Navigate through the remaining path parts
            $current = $jsonData;
            for ($i = 1; $i < count($parts); $i++) {
                $key = $parts[$i];

                if (!is_array($current) || !isset($current[$key])) {
                    return null;
                }

                $current = $current[$key];
            }

            return $current;
        } catch (\Exception $e) {
            \Log::warning("Error extracting JSON field value for '$jsonPath': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get relation value
     */
    private function getRelationValue($item, $relationPath)
    {
        try {
            // Handle comma-separated complete relation paths (e.g., 'client.first_name,client.last_name')
            if (strpos($relationPath, ',') !== false) {
                $relationPaths = explode(',', $relationPath);
                $values = [];

                foreach ($relationPaths as $singlePath) {
                    $singlePath = trim($singlePath);
                    $value = $this->getSingleRelationValue($item, $singlePath);
                    if ($value) {
                        $values[] = $value;
                    }
                }

                return implode(' ', $values);
            }

            // Handle single relation path
            return $this->getSingleRelationValue($item, $relationPath);
        } catch (\Exception $e) {
            \Log::warning("Error getting relation value for '$relationPath': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get single relation value (helper method)
     */
    private function getSingleRelationValue($item, $relationPath)
    {
        try {
            $parts = explode('.', $relationPath);
            $current = $item;

            // Traverse the relation path
            for ($i = 0; $i < count($parts) - 1; $i++) {
                $relation = $parts[$i];

                if (!$current || !$current->relationLoaded($relation) || !$current->$relation) {
                    return null;
                }

                $current = $current->$relation;
            }

            // Get the final field value
            $finalField = $parts[count($parts) - 1];
            return $current->{$finalField} ?? null;
        } catch (\Exception $e) {
            \Log::warning("Error getting single relation value for '$relationPath': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get computed value (for counts, averages, etc.)
     */
    private function getComputedValue($item, $computation)
    {
        try {
            switch ($computation) {
                case 'services_count':
                    // Check if withCount was used (preferred)
                    if (isset($item->services_count)) {
                        return (int) $item->services_count;
                    }
                    // Fallback to relationship count
                    if (method_exists($item, 'services') && $item->services) {
                        return (int) $item->services->count();
                    }
                    // Fallback to accessor if available
                    if (method_exists($item, 'getServicesCountAttribute')) {
                        return (int) $item->services_count;
                    }
                    return 0;

                case 'average_rating':
                    // Try accessor method first
                    if (method_exists($item, 'getAverageRatingAttribute')) {
                        return round((float) $item->average_rating, 2);
                    }
                    // Fallback to reviews relationship
                    if (method_exists($item, 'reviews') && $item->reviews) {
                        $avg = $item->reviews->avg('rating');
                        return $avg ? round((float) $avg, 2) : 0.0;
                    }
                    return 0.0;

                case 'total_reviews':
                    // Try accessor method first
                    if (method_exists($item, 'getTotalReviewsAttribute')) {
                        return (int) $item->total_reviews;
                    }
                    // Fallback to reviews relationship
                    if (method_exists($item, 'reviews') && $item->reviews) {
                        return (int) $item->reviews->count();
                    }
                    return 0;

                default:
                    return null;
            }
        } catch (\Exception $e) {
            \Log::warning("Error computing value for '$computation': " . $e->getMessage());
            return null;
        }
    }

    /**
     * Format field value based on type
     */
    private function formatFieldValue($value, $type)
    {
        if ($value === null) {
            return null;
        }

        // Handle objects and arrays first
        if (is_object($value)) {
            if ($value instanceof Carbon) {
                // Handle Carbon dates
                switch ($type) {
                    case 'date':
                        return $value->format('Y-m-d');
                    case 'datetime':
                        return $value->format('Y-m-d H:i:s');
                    case 'time':
                        return $value->format('H:i');
                    default:
                        return $value->format('Y-m-d H:i:s');
                }
            } else {
                // Handle other types of objects
                return $this->formatObjectForReport($value, $type);
            }
        }

        if (is_array($value)) {
            return implode(', ', $value);
        }

        switch ($type) {
            case 'boolean':
                return $value ? 'Yes' : 'No';
            case 'date':
                return is_string($value) ? $value : (string) $value;
            case 'datetime':
                return is_string($value) ? $value : (string) $value;
            case 'time':
                return is_string($value) ? $value : (string) $value;
            case 'decimal':
                return is_numeric($value) ? number_format((float) $value, 2) : (string) $value;
            case 'integer':
                return is_numeric($value) ? (int) $value : (string) $value;
            case 'text':
                // Truncate long text fields for display
                $stringValue = (string) $value;
                return strlen($stringValue) > 100 ? substr($stringValue, 0, 100) . '...' : $stringValue;
            default:
                return (string) $value;
        }
    }

    /**
     * Format objects for report display
     */
    private function formatObjectForReport($value, $type)
    {
        // Convert object to array if it's a model instance
        if (method_exists($value, 'toArray')) {
            $valueArray = $value->toArray();
        } else {
            $valueArray = (array) $value;
        }

        // Handle location objects
        if (isset($valueArray['address']) || isset($valueArray['city']) || isset($valueArray['coordinates'])) {
            $locationParts = [];

            if (!empty($valueArray['address'])) $locationParts[] = $valueArray['address'];
            if (!empty($valueArray['city'])) $locationParts[] = $valueArray['city'];
            if (!empty($valueArray['state'])) $locationParts[] = $valueArray['state'];
            if (!empty($valueArray['postal_code'])) $locationParts[] = $valueArray['postal_code'];
            if (!empty($valueArray['country'])) $locationParts[] = $valueArray['country'];

            // If no standard location fields, try other common properties
            if (empty($locationParts)) {
                if (!empty($valueArray['name'])) $locationParts[] = $valueArray['name'];
                if (!empty($valueArray['area'])) $locationParts[] = $valueArray['area'];
                if (!empty($valueArray['region'])) $locationParts[] = $valueArray['region'];
                if (!empty($valueArray['district'])) $locationParts[] = $valueArray['district'];
            }

            return !empty($locationParts) ? implode(', ', $locationParts) : 'Location data';
        }

        // Handle user/person objects
        if (isset($valueArray['first_name']) || isset($valueArray['last_name'])) {
            $nameParts = [];
            if (!empty($valueArray['first_name'])) $nameParts[] = $valueArray['first_name'];
            if (!empty($valueArray['last_name'])) $nameParts[] = $valueArray['last_name'];
            if (empty($nameParts) && !empty($valueArray['name'])) $nameParts[] = $valueArray['name'];
            return !empty($nameParts) ? implode(' ', $nameParts) : 'User';
        }

        // Handle category objects
        if (isset($valueArray['name']) && !isset($valueArray['first_name'])) {
            return $valueArray['name'];
        }

        // Handle service objects
        if (isset($valueArray['title'])) {
            return $valueArray['title'];
        }

        // Handle appointment objects
        if (isset($valueArray['appointment_date']) || isset($valueArray['status'])) {
            $parts = [];
            if (!empty($valueArray['appointment_date'])) $parts[] = $valueArray['appointment_date'];
            if (!empty($valueArray['status'])) $parts[] = '(' . $valueArray['status'] . ')';
            return !empty($parts) ? implode(' ', $parts) : 'Appointment';
        }

        // Handle payment/invoice objects
        if (isset($valueArray['amount']) || isset($valueArray['total_amount'])) {
            $amount = $valueArray['amount'] ?? $valueArray['total_amount'];
            $currency = $valueArray['currency'] ?? 'LKR';
            return $currency . ' ' . number_format((float) $amount, 2);
        }

        // Handle objects with meaningful single fields
        $meaningfulFields = ['title', 'name', 'label', 'value', 'description', 'message'];
        foreach ($meaningfulFields as $field) {
            if (!empty($valueArray[$field])) {
                $val = (string) $valueArray[$field];
                return strlen($val) > 50 ? substr($val, 0, 50) . '...' : $val;
            }
        }

        // Handle objects with ID
        if (isset($valueArray['id'])) {
            if (count($valueArray) <= 3) {
                return 'ID: ' . $valueArray['id'];
            }
        }

        // Last resort: convert to simple string representation
        $keys = array_keys($valueArray);
        if (count($keys) === 1) {
            return (string) $valueArray[$keys[0]];
        } elseif (count($keys) <= 3) {
            $pairs = [];
            foreach ($keys as $key) {
                $pairs[] = $key . ': ' . $valueArray[$key];
            }
            return implode(', ', $pairs);
        } else {
            return 'Object (' . count($keys) . ' properties)';
        }
    }
}
