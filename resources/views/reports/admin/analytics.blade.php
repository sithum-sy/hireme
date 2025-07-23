<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HireMe - Platform Analytics Report</title>
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
            border-bottom: 3px solid #007bff;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 10px;
        }
        
        .report-title {
            font-size: 20px;
            margin: 10px 0;
            color: #2c3e50;
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
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
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
            background-color: #007bff;
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
            background: #e3f2fd;
            padding: 15px;
            border-left: 4px solid #007bff;
            margin-bottom: 20px;
        }
        
        .growth-positive {
            color: #28a745;
        }
        
        .growth-negative {
            color: #dc3545;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">HireMe</div>
        <div class="report-title">Platform Analytics Report</div>
        <div class="report-period">{{ $period['start_date'] }} - {{ $period['end_date'] }} ({{ $period['days'] }} days)</div>
        <div class="generated-date">Generated on {{ $generated_at }}</div>
    </div>

    <!-- Platform Overview -->
    <div class="section">
        <div class="section-title">Platform Overview</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['total_users']) }}</span>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['new_users']) }}</span>
                    <div class="stat-label">New Users</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['total_providers']) }}</span>
                    <div class="stat-label">Service Providers</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['total_clients']) }}</span>
                    <div class="stat-label">Clients</div>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['total_services']) }}</span>
                    <div class="stat-label">Total Services</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['active_services']) }}</span>
                    <div class="stat-label">Active Services</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['total_appointments']) }}</span>
                    <div class="stat-label">Total Bookings</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($overview['completed_appointments']) }}</span>
                    <div class="stat-label">Completed</div>
                </div>
            </div>
        </div>

        <div class="summary-box">
            <strong>Financial Summary</strong><br>
            Total Revenue: <span class="currency">LKR {{ number_format($overview['total_revenue'], 2) }}</span><br>
            Average Booking Value: <span class="currency">LKR {{ number_format($overview['average_booking_value'], 2) }}</span>
        </div>
    </div>

    <!-- Financial Performance -->
    <div class="section">
        <div class="section-title">Financial Performance</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Revenue</td>
                    <td class="text-right currency">{{ number_format($financial_summary['total_revenue'], 2) }}</td>
                </tr>
                <tr>
                    <td>Platform Fees Collected</td>
                    <td class="text-right currency">{{ number_format($financial_summary['platform_fees'], 2) }}</td>
                </tr>
                <tr>
                    <td>Provider Earnings</td>
                    <td class="text-right currency">{{ number_format($financial_summary['provider_earnings'], 2) }}</td>
                </tr>
            </tbody>
        </table>

        @if($financial_summary['payment_methods']->isNotEmpty())
        <div class="section-title">Payment Methods Breakdown</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Payment Method</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Total Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($financial_summary['payment_methods'] as $method)
                <tr>
                    <td>{{ ucfirst($method->method) }}</td>
                    <td class="text-center">{{ number_format($method->count) }}</td>
                    <td class="text-right currency">{{ number_format($method->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- User Analytics -->
    <div class="section page-break">
        <div class="section-title">User Growth Analytics</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Metric</th>
                    <th class="text-right">Count</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>New Providers</td>
                    <td class="text-right">{{ number_format($user_analytics['user_growth']['providers']) }}</td>
                </tr>
                <tr>
                    <td>New Clients</td>
                    <td class="text-right">{{ number_format($user_analytics['user_growth']['clients']) }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Service Analytics -->
    <div class="section">
        <div class="section-title">Service Analytics</div>
        
        @if($service_analytics['popular_categories']->isNotEmpty())
        <div class="section-title">Popular Service Categories</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Category</th>
                    <th class="text-right">Bookings</th>
                </tr>
            </thead>
            <tbody>
                @foreach($service_analytics['popular_categories'] as $category)
                <tr>
                    <td>{{ $category->name }}</td>
                    <td class="text-right">{{ number_format($category->bookings) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="summary-box">
            <strong>Service Metrics</strong><br>
            New Services Added: {{ number_format($service_analytics['new_services']) }}<br>
            Average Service Price: <span class="currency">LKR {{ number_format($service_analytics['average_service_price'], 2) }}</span>
        </div>
    </div>

    <!-- Appointment Trends -->
    <div class="section">
        <div class="section-title">Appointment Status Breakdown</div>
        @if($appointment_trends['status_breakdown']->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Status</th>
                    <th class="text-right">Count</th>
                </tr>
            </thead>
            <tbody>
                @foreach($appointment_trends['status_breakdown'] as $status)
                <tr>
                    <td>{{ ucfirst($status->status) }}</td>
                    <td class="text-right">{{ number_format($status->count) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Top Performers -->
    <div class="section page-break">
        <div class="section-title">Top Performing Providers</div>
        @if($top_performers['top_providers']->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Provider Name</th>
                    <th>Email</th>
                    <th class="text-right">Completed Appointments</th>
                </tr>
            </thead>
            <tbody>
                @foreach($top_performers['top_providers'] as $provider)
                <tr>
                    <td>{{ $provider->first_name }} {{ $provider->last_name }}</td>
                    <td>{{ $provider->email }}</td>
                    <td class="text-right">{{ number_format($provider->completed_appointments) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="section-title">Top Performing Services</div>
        @if($top_performers['top_services']->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Service Title</th>
                    <th class="text-right">Base Price (LKR)</th>
                    <th class="text-right">Bookings</th>
                </tr>
            </thead>
            <tbody>
                @foreach($top_performers['top_services'] as $service)
                <tr>
                    <td>{{ $service->title }}</td>
                    <td class="text-right currency">{{ number_format($service->base_price, 2) }}</td>
                    <td class="text-right">{{ number_format($service->bookings) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>
</body>
</html>