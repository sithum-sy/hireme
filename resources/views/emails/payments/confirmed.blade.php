<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Received</title>
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
        .payment-details {
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
        .money-icon {
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
        .earnings-box {
            background-color: #d1ecf1;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #17a2b8;
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
        .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .payment-table th, .payment-table td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        .payment-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="money-icon">💰</div>
        <h1>Payment Received!</h1>
        <p>Your earnings are now available</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $providerName }},</p>
        
        <div class="success-box">
            <h3>🎉 Great News!</h3>
            <p>{{ $clientName }} has successfully paid for your service. The payment has been processed and your earnings are now available!</p>
        </div>
        
        <div class="payment-details">
            <h3>💳 Payment Details</h3>
            
            <div class="transaction-id">
                <strong>Transaction ID: {{ $transactionId }}</strong>
            </div>
            
            <table class="payment-table">
                <tr>
                    <th>Service</th>
                    <td>{{ $serviceName }}</td>
                </tr>
                <tr>
                    <th>Client</th>
                    <td>{{ $clientName }}</td>
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
                Your Earnings: Rs. {{ number_format($paymentAmount, 2) }}
            </div>
            
            <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✅ Payment Received</span></p>
        </div>
        
        <div class="earnings-box">
            <h3>💼 Earnings Information</h3>
            <ul>
                <li><strong>Full Amount:</strong> You receive 100% of the service payment (Rs. {{ number_format($paymentAmount, 2) }})</li>
                <li><strong>No Platform Fees:</strong> We don't deduct any platform fees from your earnings</li>
                <li><strong>Immediate Availability:</strong> Your earnings are immediately available in your account</li>
                <li><strong>Payment Record:</strong> This transaction is recorded in your payments history</li>
            </ul>
        </div>
        
        <div class="info-box">
            <h3>⭐ Service Completed Successfully</h3>
            <p>Congratulations on completing another successful service! Your professionalism and quality work help build trust in our platform.</p>
        </div>
        
        <div class="success-box">
            <h3>📈 Keep Growing Your Business</h3>
            <p>Happy clients like {{ $clientName }} are the foundation of a successful service business. Keep up the excellent work!</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $paymentsUrl }}" class="btn btn-success">View All Payments</a>
            <a href="{{ $appointmentUrl }}" class="btn">View Appointment</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <div class="info-box">
            <h3>📊 Track Your Success</h3>
            <p>Visit your payments page to see your earnings history, track your monthly income, and download financial summaries for your records.</p>
        </div>
        
        <p>Thank you for being part of the HireMe community!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>Payment confirmation from HireMe.</p>
        <p>Transaction ID: {{ $transactionId }} | Payment Date: {{ $paymentDate->format('M j, Y g:i A') }}</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>