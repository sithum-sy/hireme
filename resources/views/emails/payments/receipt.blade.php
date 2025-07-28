<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #28a745;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .receipt-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .btn-success {
            background-color: #28a745;
        }
        .btn-success:hover {
            background-color: #218838;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .receipt-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .success-box {
            background-color: #d4edda;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .transaction-id {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
            text-align: center;
            margin: 10px 0;
        }
        .amount-highlight {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            text-align: center;
            background-color: #d4edda;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .receipt-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .receipt-table th, .receipt-table td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        .receipt-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="receipt-icon">🧾</div>
        <h1>Payment Receipt</h1>
        <p>Thank you for your payment!</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <div class="success-box">
            <h3>✅ Payment Successful!</h3>
            <p>Your payment has been processed successfully. Thank you for using HireMe!</p>
        </div>
        
        <div class="receipt-details">
            <h3>🧾 Payment Receipt</h3>
            
            <div class="transaction-id">
                <strong>Transaction ID: {{ $transactionId }}</strong>
            </div>
            
            <table class="receipt-table">
                <tr>
                    <th>Service</th>
                    <td>{{ $serviceName }}</td>
                </tr>
                <tr>
                    <th>Provider</th>
                    <td>{{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</td>
                </tr>
                <tr>
                    <th>Service Date</th>
                    <td>{{ $appointmentDate->format('l, F j, Y') }}</td>
                </tr>
                <tr>
                    <th>Service Time</th>
                    <td>{{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</td>
                </tr>
                <tr>
                    <th>Payment Date</th>
                    <td>{{ $paymentDate->format('l, F j, Y g:i A') }}</td>
                </tr>
                <tr>
                    <th>Payment Method</th>
                    <td>{{ $payment->payment_method ?? 'Credit/Debit Card' }}</td>
                </tr>
            </table>
            
            <div class="amount-highlight">
                Amount Paid: Rs. {{ number_format($paymentAmount, 2) }}
            </div>
            
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✅ Paid</span></p>
        </div>

        @if($invoice && $invoice->notes)
        <div class="info-box">
            <h4>📝 Invoice Notes:</h4>
            <p style="font-style: italic;">"{{ $invoice->notes }}"</p>
        </div>
        @endif
        
        <div class="info-box">
            <h3>📄 Receipt Information</h3>
            <ul>
                <li><strong>Digital Receipt:</strong> This email serves as your official payment receipt</li>
                <li><strong>Transaction Record:</strong> Keep this receipt for your records</li>
                <li><strong>Support:</strong> Reference the transaction ID for any payment inquiries</li>
                <li><strong>Service Complete:</strong> Your service has been successfully completed and paid</li>
            </ul>
        </div>
        
        <div class="success-box">
            <h3>⭐ Leave a Review</h3>
            <p>We hope you had a great experience! Please consider leaving a review for {{ $providerName }} to help other clients and support our service provider community.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn btn-success">View Appointment Details</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <div class="info-box">
            <h3>💰 Payment Security</h3>
            <p>Your payment was processed securely through our encrypted payment system. We never store your full payment information, ensuring your financial data remains safe.</p>
        </div>
        
        <p>Thank you for choosing HireMe for your service needs!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is your official payment receipt from HireMe.</p>
        <p>Transaction ID: {{ $transactionId }} | Payment Date: {{ $paymentDate->format('M j, Y g:i A') }}</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>