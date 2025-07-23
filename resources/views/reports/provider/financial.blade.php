<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>HireMe - Provider Financial Report</title>
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
            border-bottom: 3px solid #17a2b8;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #17a2b8;
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
            color: #17a2b8;
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
            background-color: #17a2b8;
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
        
        .currency-negative {
            color: #dc3545;
            font-weight: bold;
        }
        
        .page-break {
            page-break-before: always;
        }
        
        .summary-box {
            background: #e1f5fe;
            padding: 15px;
            border-left: 4px solid #17a2b8;
            margin-bottom: 20px;
        }
        
        .total-row {
            background-color: #e1f5fe;
            font-weight: bold;
        }
        
        .chart-placeholder {
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">HireMe</div>
        <div class="report-title">Financial & Earnings Report</div>
        <div class="provider-info">
            <strong>{{ $provider['name'] }}</strong>
            @if($provider['business_name'])
                <br>{{ $provider['business_name'] }}
            @endif
            <br>{{ $provider['email'] }}
            @if($provider['tax_id'])
                <br>Tax ID: {{ $provider['tax_id'] }}
            @endif
        </div>
        <div class="report-period">{{ $period['start_date'] }} - {{ $period['end_date'] }} ({{ $period['days'] }} days)</div>
        <div class="generated-date">Generated on {{ $generated_at }}</div>
    </div>

    <!-- Earnings Summary -->
    <div class="section">
        <div class="section-title">Earnings Summary</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value currency">LKR {{ number_format($earnings_summary['total_gross_income'], 2) }}</span>
                    <div class="stat-label">Gross Income</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value currency-negative">LKR {{ number_format($earnings_summary['platform_fees_paid'], 2) }}</span>
                    <div class="stat-label">Platform Fees</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value currency">LKR {{ number_format($earnings_summary['net_earnings'], 2) }}</span>
                    <div class="stat-label">Net Earnings</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value">LKR {{ number_format($earnings_summary['pending_payments'], 2) }}</span>
                    <div class="stat-label">Pending</div>
                </div>
            </div>
        </div>

        <div class="summary-box">
            <strong>Financial Overview</strong><br>
            Net Profit Margin: {{ $earnings_summary['total_gross_income'] > 0 ? number_format(($earnings_summary['net_earnings'] / $earnings_summary['total_gross_income']) * 100, 1) : 0 }}%<br>
            @if($earnings_summary['refunded_amount'] > 0)
            Refunded Amount: <span class="currency-negative">LKR {{ number_format($earnings_summary['refunded_amount'], 2) }}</span><br>
            @endif
            Tax Year: {{ date('Y', strtotime($period['start_date'])) }}
        </div>
    </div>

    <!-- Income Breakdown -->
    <div class="section">
        <div class="section-title">Income Breakdown by Service</div>
        @if($income_breakdown['by_service']->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Service</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Gross Income (LKR)</th>
                    <th class="text-right">Net Income (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @php $totalGross = 0; $totalNet = 0; $totalTransactions = 0; @endphp
                @foreach($income_breakdown['by_service'] as $service)
                @php 
                    $totalGross += $service->gross_income; 
                    $totalNet += $service->net_income; 
                    $totalTransactions += $service->transactions;
                @endphp
                <tr>
                    <td>{{ $service->title }}</td>
                    <td class="text-center">{{ number_format($service->transactions) }}</td>
                    <td class="text-right currency">{{ number_format($service->gross_income, 2) }}</td>
                    <td class="text-right currency">{{ number_format($service->net_income, 2) }}</td>
                </tr>
                @endforeach
                <tr class="total-row">
                    <td><strong>Total</strong></td>
                    <td class="text-center"><strong>{{ number_format($totalTransactions) }}</strong></td>
                    <td class="text-right currency"><strong>{{ number_format($totalGross, 2) }}</strong></td>
                    <td class="text-right currency"><strong>{{ number_format($totalNet, 2) }}</strong></td>
                </tr>
            </tbody>
        </table>
        @endif

        @if($income_breakdown['by_payment_method']->isNotEmpty())
        <div class="section-title">Income by Payment Method</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Payment Method</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Total (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($income_breakdown['by_payment_method'] as $method)
                <tr>
                    <td>{{ ucfirst($method->method) }}</td>
                    <td class="text-center">{{ number_format($method->transactions) }}</td>
                    <td class="text-right currency">{{ number_format($method->total, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Payment Analytics -->
    <div class="section page-break">
        <div class="section-title">Payment Analytics</div>
        
        <div class="summary-box">
            <strong>Payment Performance</strong><br>
            Average Transaction Value: <span class="currency">LKR {{ number_format($payment_analytics['average_transaction_value'], 2) }}</span><br>
            Total Payments Received: {{ $payment_analytics['payment_timeline']->count() }} payments
        </div>

        @if($payment_analytics['payment_timeline']->isNotEmpty())
        <div class="section-title">Payment Timeline</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($payment_analytics['payment_timeline']->take(15) as $payment)
                <tr>
                    <td>{{ date('M d, Y', strtotime($payment->date)) }}</td>
                    <td class="text-center">{{ number_format($payment->transactions) }}</td>
                    <td class="text-right currency">{{ number_format($payment->amount, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif
    </div>

    <!-- Invoice Summary -->
    <div class="section">
        <div class="section-title">Invoice Summary</div>
        <div class="stats-grid">
            <div class="stat-row">
                <div class="stat-item">
                    <span class="stat-value">{{ number_format($invoice_summary['total_invoices']) }}</span>
                    <div class="stat-label">Total Invoices</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: #28a745;">{{ number_format($invoice_summary['paid_invoices']) }}</span>
                    <div class="stat-label">Paid</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: #ffc107;">{{ number_format($invoice_summary['pending_invoices']) }}</span>
                    <div class="stat-label">Pending</div>
                </div>
                <div class="stat-item">
                    <span class="stat-value" style="color: #dc3545;">{{ number_format($invoice_summary['overdue_invoices']) }}</span>
                    <div class="stat-label">Overdue</div>
                </div>
            </div>
        </div>

        @if($invoice_summary['total_invoices'] > 0)
        <div class="summary-box">
            Invoice Payment Rate: {{ number_format(($invoice_summary['paid_invoices'] / $invoice_summary['total_invoices']) * 100, 1) }}%
            @if($invoice_summary['overdue_invoices'] > 0)
                <br><span style="color: #dc3545;">⚠️ You have {{ $invoice_summary['overdue_invoices'] }} overdue invoice(s) requiring attention.</span>
            @endif
        </div>
        @endif
    </div>

    <!-- Monthly Trends -->
    <div class="section page-break">
        <div class="section-title">Monthly Earnings Trends</div>
        @if($monthly_trends->isNotEmpty())
        <table class="table">
            <thead>
                <tr>
                    <th>Month</th>
                    <th class="text-center">Transactions</th>
                    <th class="text-right">Earnings (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($monthly_trends as $trend)
                <tr>
                    <td>{{ DateTime::createFromFormat('!m', $trend->month)->format('F') }} {{ $trend->year }}</td>
                    <td class="text-center">{{ number_format($trend->transactions) }}</td>
                    <td class="text-right currency">{{ number_format($trend->earnings, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="chart-placeholder">
            Monthly Earnings Chart<br>
            <small>(Chart visualization would appear here in enhanced version)</small>
        </div>
    </div>

    <!-- Tax Information -->
    <div class="section">
        <div class="section-title">Tax Information</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Tax Category</th>
                    <th class="text-right">Amount (LKR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Taxable Income</td>
                    <td class="text-right currency">{{ number_format($tax_information['total_income'], 2) }}</td>
                </tr>
                <tr>
                    <td>Business Expenses</td>
                    <td class="text-right">{{ number_format($tax_information['business_expenses'], 2) }}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Net Taxable Income</strong></td>
                    <td class="text-right currency"><strong>{{ number_format($tax_information['total_income'] - $tax_information['business_expenses'], 2) }}</strong></td>
                </tr>
            </tbody>
        </table>

        @if($tax_information['quarterly_breakdown']->isNotEmpty())
        <div class="section-title">Quarterly Income Breakdown</div>
        <table class="table">
            <thead>
                <tr>
                    <th>Quarter</th>
                    <th class="text-right">Income (LKR)</th>
                </tr>
            </thead>
            <tbody>
                @foreach($tax_information['quarterly_breakdown'] as $quarter)
                <tr>
                    <td>Q{{ $quarter->quarter }} {{ $tax_information['tax_year'] }}</td>
                    <td class="text-right currency">{{ number_format($quarter->income, 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <div class="summary-box">
            <strong>Tax Compliance Note:</strong><br>
            This report provides a summary of your earnings for tax purposes. Please consult with a qualified tax professional for specific tax advice and ensure compliance with local tax regulations.
        </div>
    </div>
</body>
</html>