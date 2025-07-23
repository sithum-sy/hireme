<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HireMe - Provider Performance Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
            line-height: 1.4;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #28a745;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #28a745;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 20px;
            margin: 10px 0;
            color: #2c3e50;
        }
        
        .provider-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .report-period {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
        }
        
        .generated-date {
            font-size: 12px;
            color: #999;
        }
        
        .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2c3e50;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        
        .stats-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
        }
        
        .stat-row {
            display: table-row;
        }
        
        .stat-item {
            display: table-cell;
            width: 33.33%;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            text-align: center;
            vertical-align: middle;
        }
        
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            display: block;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        
        .table th,
        .table td {
            padding: 8px 12px;
            border: 1px solid #dee2e6;
            text-align: left;
        }
        
        .table th {
            background-color: #28a745;
            color: white;
            font-weight: bold;
        }
        
        .table tbody tr:nth-child(even) {
            background-color: #f8f9fa;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .currency {
            color: #28a745;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .summary-box {
            background: #e8f5e8;
            padding: 15px;
            border-left: 4px solid #28a745;
            margin-bottom: 20px;
        }
        
        .growth-positive {
            color: #28a745;
        }
        
        .growth-negative {
            color: #dc3545;
        }
        
        .rating-stars {
            color: #ffc107;
        }
        
        .verification-badge {
            background: #007bff;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">HireMe</div>
        <div class="report-title">Provider Performance Report</div>
        <div class="provider-info">
            <strong>{{ $provider['name'] }}</strong>
            @if($provider['business_name'])
                <br>{{ $provider['business_name'] }}
            @endif
            <br>{{ $provider['email'] }} | {{ $provider['phone'] }}
            <br>Member since {{ $provider['member_since'] }}
            @if($provider['verification_status'] === 'verified')
                <span class="verification-badge">Verified Provider</span>
            @endif
        </div>
        <div class="report-period">{{ $period['start_date'] }} - {{ $period['end_date'] }} ({{ $period['days'] }} days)</div>
        <div class="generated-date">Generated on {{ $generated_at }}</div>
    </div>

    <!-- Performance Summary -->
    <div class="section">
        <div class="section-title">Performance Summary</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value currency">LKR {{ number_format($performance_summary['total_earnings'], 2) }}</span>
                    <div class="stat-label">Total Earnings</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($performance_summary['total_bookings']) }}</span>
                    <div class="stat-label">Total Bookings</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($performance_summary['completed_appointments']) }}</span>
                    <div class="stat-label">Completed Services</div>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value rating-stars">{{ number_format($performance_summary['average_rating'], 1) }}/5</span>
                    <div class="stat-label">Average Rating</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($performance_summary['total_reviews']) }}</span>
                    <div class="stat-label">Reviews Received</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($performance_summary['response_rate'], 1) }}%</span>
                    <div class="stat-label">Quote Response Rate</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Earnings Breakdown -->
    <div class="section">
        <div class="section-title">Earnings Breakdown</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Gross Earnings</td>
                    <td class="text-right currency">{{ number_format($earnings_breakdown['gross_earnings'], 2) }}</td>
                </tr>
                <tr>
                    <td>Platform Fees</td>
                    <td class="text-right">{{ number_format($earnings_breakdown['platform_fees'], 2) }}</td>
                </tr>
                <tr style="background-color: #e8f5e8; font-weight: bold;">
                    <td>Net Earnings</td>
                    <td class="text-right currency">{{ number_format($earnings_breakdown['net_earnings'], 2) }}</td>
                </tr>
            </tbody>
        </table>

        @if($earnings_breakdown['by_service']->isNotEmpty())
        <div class="section-title">Earnings by Service</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-right">Net Earnings (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($earnings_breakdown['by_service'] as $service)
                <tr>
                    <td>{{ $service->title }}</td>
                    <td class="text-right currency">{{ number_format($service->earnings, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Service Performance -->
    <div class="section page-break">
        <div class="section-title">Service Performance</div>
        @if($service_performance->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-center">Total Bookings</th>
                    <th class="text-center">Completed</th>
                    <th class="text-center">Rating</th>
                    <th class="text-right">Base Price (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($service_performance as $service)
                <tr>
                    <td>{{ $service->title }}</td>
                    <td class="text-center">{{ number_format($service->total_bookings) }}</td>
                    <td class="text-center">{{ number_format($service->completed_bookings) }}</td>
                    <td class="text-center rating-stars">{{ number_format($service->average_rating ?? 0, 1) }}</td>
                    <td class="text-right currency">{{ number_format($service->base_price, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Appointment Analytics -->
    <div class="section">
        <div class="section-title">Appointment Analytics</div>
        
        @if($appointment_analytics['by_status']->isNotEmpty())
        <div class="section-title">Appointments by Status</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th class="text-right">Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($appointment_analytics['by_status'] as $status)
                <tr>
                    <td>{{ ucfirst($status->status) }}</td>
                    <td class="text-right">{{ number_format($status->count) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if($appointment_analytics['by_month']->isNotEmpty())
        <div class="section-title">Monthly Appointment Trends</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="text-right">Appointments</th>
                </tr>
            </thead>
            <tbody>
                @foreach($appointment_analytics['by_month'] as $month)
                <tr>
                    <td>{{ DateTime::createFromFormat('!m', $month->month)->format('F') }} {{ $month->year }}</td>
                    <td class="text-right">{{ number_format($month->count) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Customer Feedback -->
    <div class="section page-break">
        <div class="section-title">Customer Feedback</div>
        
        @if($customer_feedback['rating_distribution']->isNotEmpty())
        <div class="section-title">Rating Distribution</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Rating</th>
                    <th class="text-right">Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($customer_feedback['rating_distribution'] as $rating)
                <tr>
                    <td class="rating-stars">{{ $rating->rating }} Stars</td>
                    <td class="text-right">{{ number_format($rating->count) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if($customer_feedback['recent_reviews']->isNotEmpty())
        <div class="section-title">Recent Customer Reviews</div>
        @foreach($customer_feedback['recent_reviews']->take(5) as $review)
        <div class="summary-box">
            <strong class="rating-stars">{{ $review->rating }}/5 Stars</strong> - {{ $review->appointment->service->title }}<br>
            <em>"{{ $review->comment ?: 'No comment provided' }}"</em><br>
            <small>- {{ $review->reviewer->first_name }} {{ $review->reviewer->last_name }} on {{ $review->created_at->format('M d, Y') }}</small>
        </div>
        @endforeach
        @endif
    </div>

    <!-- Growth Metrics -->
    <div class="section">
        <div class="section-title">Growth Metrics</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Change</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Earnings Growth</td>
                    <td class="text-right {{ $growth_metrics['earnings_growth'] >= 0 ? 'growth-positive' : 'growth-negative' }}">
                        {{ number_format($growth_metrics['earnings_growth'], 1) }}%
                    </td>
                </tr>
                <tr>
                    <td>Booking Growth</td>
                    <td class="text-right {{ $growth_metrics['booking_growth'] >= 0 ? 'growth-positive' : 'growth-negative' }}">
                        {{ number_format($growth_metrics['booking_growth'], 1) }}%
                    </td>
                </tr>
                <tr>
                    <td>Rating Trend</td>
                    <td class="text-right {{ $growth_metrics['rating_trend'] >= 0 ? 'growth-positive' : 'growth-negative' }}">
                        {{ $growth_metrics['rating_trend'] >= 0 ? '+' : '' }}{{ number_format($growth_metrics['rating_trend'], 2) }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</body>
</html>