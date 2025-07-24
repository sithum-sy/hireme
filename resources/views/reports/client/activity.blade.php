<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HireMe - Client Activity Report</title>
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
            border-bottom: 3px solid #6f42c1;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #6f42c1;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 20px;
            margin: 10px 0;
            color: #2c3e50;
        }
        
        .client-info {
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
            width: 25%;
            padding: 15px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            text-align: center;
            vertical-align: middle;
        }
        
        .stat-value {
            font-size: 20px;
            font-weight: bold;
            color: #6f42c1;
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
            background-color: #6f42c1;
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
            background: #f3e5f5;
            padding: 15px;
            border-left: 4px solid #6f42c1;
            margin-bottom: 20px;
        }
        
        .rating-stars {
            color: #ffc107;
        }
        
        .status-completed {
            color: #28a745;
            font-weight: bold;
        }
        
        .status-pending {
            color: #ffc107;
            font-weight: bold;
        }
        
        .status-cancelled {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">HireMe</div>
        <div class="report-title">Client Activity Report</div>
        <div class="client-info">
            <strong>{{ $client['name'] }}</strong><br>
            {{ $client['email'] }}<br>
            Member since {{ $client['member_since'] }}
        </div>
        <div class="report-period">{{ $period['start_date'] }} - {{ $period['end_date'] }} ({{ $period['days'] }} days)</div>
        <div class="generated-date">Generated on {{ $generated_at }}</div>
    </div>

    <!-- Activity Summary -->
    <div class="section">
        <div class="section-title">Activity Summary</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($activity_summary['total_bookings']) }}</span>
                    <div class="stat-label">Total Bookings</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($activity_summary['completed_services']) }}</span>
                    <div class="stat-label">Completed Services</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value currency">LKR {{ number_format($activity_summary['total_spent'], 2) }}</span>
                    <div class="stat-label">Total Spent</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($activity_summary['reviews_given']) }}</span>
                    <div class="stat-label">Reviews Given</div>
                </div>
            </div>
        </div>

        <div class="summary-box">
            <strong>Client Profile</strong><br>
            Favorite Service Category: {{ $activity_summary['favorite_category'] }}<br>
            @if($activity_summary['completed_services'] > 0)
            Average Spend per Service: <span class="currency">LKR {{ number_format($activity_summary['total_spent'] / $activity_summary['completed_services'], 2) }}</span><br>
            @endif
            Completion Rate: {{ $activity_summary['total_bookings'] > 0 ? number_format(($activity_summary['completed_services'] / $activity_summary['total_bookings']) * 100, 1) : 0 }}%
        </div>
    </div>

    <!-- Booking History -->
    <div class="section">
        <div class="section-title">Recent Booking History</div>
        @if($booking_history->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Service</th>
                    <th>Provider</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($booking_history->take(15) as $booking)
                <tr>
                    <td>{{ $booking['date'] }}</td>
                    <td>{{ $booking['service'] }}</td>
                    <td>{{ $booking['provider'] }}</td>
                    <td>{{ $booking['category'] }}</td>
                    <td class="status-{{ $booking['status'] }}">{{ ucfirst($booking['status']) }}</td>
                    <td class="text-right currency">{{ number_format($booking['amount'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @else
        <div class="summary-box">
            No bookings found for the selected period.
        </div>
        @endif
    </div>

    <!-- Spending Analysis -->
    <div class="section page-break">
        <div class="section-title">Spending Analysis</div>
        
        @if($spending_analysis['by_category']->isNotEmpty())
        <div class="section-title">Spending by Category</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="text-right">Total Spent (LKR)</th>
                    <th class="text-right">Percentage</th>
                </tr>
            </thead>
            <tbody>
                @php $totalSpent = $spending_analysis['by_category']->sum('total'); @endphp
                @foreach($spending_analysis['by_category'] as $category)
                <tr>
                    <td>{{ $category->name }}</td>
                    <td class="text-right currency">{{ number_format($category->total, 2) }}</td>
                    <td class="text-right">{{ $totalSpent > 0 ? number_format(($category->total / $totalSpent) * 100, 1) : 0 }}%</td>
                </tr>
                @endforeach
                <tr style="background-color: #f3e5f5; font-weight: bold;">
                    <td><strong>Total</strong></td>
                    <td class="text-right currency"><strong>{{ number_format($totalSpent, 2) }}</strong></td>
                    <td class="text-right"><strong>100%</strong></td>
                </tr>
            </tbody>
        </table>
        @endif

        @if($spending_analysis['monthly_spending']->isNotEmpty())
        <div class="section-title">Monthly Spending Trends</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($spending_analysis['monthly_spending'] as $month)
                <tr>
                    <td>{{ DateTime::createFromFormat('!m', $month->month)->format('F') }} {{ $month->year }}</td>
                    <td class="text-right currency">{{ number_format($month->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Service Preferences -->
    <div class="section">
        <div class="section-title">Service Preferences</div>
        
        @if($service_preferences['most_booked_services']->isNotEmpty())
        <div class="section-title">Most Booked Services</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-right">Times Booked</th>
                </tr>
            </thead>
            <tbody>
                @foreach($service_preferences['most_booked_services'] as $service)
                <tr>
                    <td>{{ $service->title }}</td>
                    <td class="text-right">{{ number_format($service->bookings) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        @if($service_preferences['preferred_providers']->isNotEmpty())
        <div class="section-title">Preferred Providers</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Provider</th>
                    <th class="text-right">Times Booked</th>
                </tr>
            </thead>
            <tbody>
                @foreach($service_preferences['preferred_providers'] as $provider)
                <tr>
                    <td>{{ $provider->provider_name }}</td>
                    <td class="text-right">{{ number_format($provider->bookings) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Review Summary -->
    <div class="section page-break">
        <div class="section-title">Review Activity</div>
        
        <div class="summary-box">
            <strong>Review Statistics</strong><br>
            Total Reviews Given: {{ number_format($review_summary['reviews_given']) }}<br>
            Average Rating Given: <span class="rating-stars">{{ number_format($review_summary['average_rating_given'], 1) }}/5 Stars</span><br>
            Review Rate: {{ $activity_summary['completed_services'] > 0 ? number_format(($review_summary['reviews_given'] / $activity_summary['completed_services']) * 100, 1) : 0 }}%
        </div>

        @if($review_summary['recent_reviews']->isNotEmpty())
        <div class="section-title">Recent Reviews</div>
        @foreach($review_summary['recent_reviews'] as $review)
        <div class="summary-box">
            <strong class="rating-stars">{{ $review->rating }}/5 Stars</strong> - {{ $review->appointment->service->title }}<br>
            <strong>Provider:</strong> {{ $review->reviewee->first_name }} {{ $review->reviewee->last_name }}<br>
            @if($review->comment)
            <em>"{{ $review->comment }}"</em><br>
            @endif
            <small>Reviewed on {{ $review->created_at->format('M d, Y') }}</small>
        </div>
        @endforeach
        @endif
    </div>

    <!-- Recommendations -->
    <div class="section">
        <div class="section-title">Personalized Insights</div>
        
        <div class="summary-box">
            <strong>Activity Insights</strong><br>
            
            @if($activity_summary['total_bookings'] > 0)
                @if($activity_summary['completed_services'] / $activity_summary['total_bookings'] > 0.9)
                    🎉 Excellent completion rate! You consistently follow through with your bookings.<br>
                @elseif($activity_summary['completed_services'] / $activity_summary['total_bookings'] > 0.7)
                    👍 Good completion rate. Consider planning ahead to reduce cancellations.<br>
                @else
                    📅 Consider planning your bookings more carefully to improve your completion rate.<br>
                @endif
            @endif
            
            @if($review_summary['reviews_given'] > 0)
                @if($review_summary['average_rating_given'] > 4.0)
                    ⭐ You're a generous reviewer! Your positive feedback helps providers improve.<br>
                @endif
                
                @if($activity_summary['completed_services'] > 0 && ($review_summary['reviews_given'] / $activity_summary['completed_services']) > 0.8)
                    💬 Great job leaving reviews! Your feedback is valuable to the community.<br>
                @elseif($activity_summary['completed_services'] > 0 && ($review_summary['reviews_given'] / $activity_summary['completed_services']) < 0.5)
                    💭 Consider leaving more reviews to help other clients and providers.<br>
                @endif
            @endif
            
            @if($spending_analysis['by_category']->count() == 1)
                🔍 You might enjoy exploring services in other categories too!<br>
            @elseif($spending_analysis['by_category']->count() > 3)
                🌟 You're exploring diverse services - great way to discover new experiences!<br>
            @endif
        </div>

        <div class="summary-box">
            <strong>Savings Opportunities</strong><br>
            
            @if($activity_summary['total_spent'] > 0 && $activity_summary['completed_services'] > 0)
                @php $avgSpend = $activity_summary['total_spent'] / $activity_summary['completed_services']; @endphp
                Your average spend per service: <span class="currency">LKR {{ number_format($avgSpend, 2) }}</span><br>
                
                @if($service_preferences['preferred_providers']->isNotEmpty())
                    💡 Consider booking packages with your preferred providers for potential discounts.<br>
                @endif
                
                📊 Track monthly spending to stay within your service budget.<br>
            @endif
            
            🔔 Enable notifications for special offers from your favorite service categories.
        </div>
    </div>
</body>
</html>