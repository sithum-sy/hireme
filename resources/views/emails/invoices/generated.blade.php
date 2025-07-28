<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Generated</title>
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
        .invoice-details {
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
        .btn-warning {
            background-color: #ffc107;
            color: #212529;
        }
        .btn-warning:hover {
            background-color: #e0a800;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .invoice-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .payment-box {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .invoice-number {
            background-color: #e9ecef;
            padding: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 16px;
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
    </style>
</head>
<body>
    <div class="header">
        <div class="invoice-icon">📄</div>
        <h1>Invoice Generated</h1>
        <p>Payment Required for Your Service</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>Good news! Your service with {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }} has been completed successfully.</p>
        
        <p>An invoice has been generated for your service. Please review the details below and proceed with payment.</p>
        
        <div class="invoice-details">
            <h3>📋 Service & Invoice Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Service Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Service Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            
            <div class="invoice-number">
                <strong>Invoice #{{ $invoice->invoice_number ?? $invoice->id }}</strong>
            </div>
            
            <div class="amount-highlight">
                Total Amount: Rs. {{ number_format($invoiceAmount, 2) }}
            </div>
            
            <p><strong>Due Date:</strong> {{ $dueDate->format('l, F j, Y') }}</p>
            <p><strong>Status:</strong> <span style="color: #ffc107; font-weight: bold;">Payment Pending</span></p>
        </div>

        @if($invoice->notes)
        <div class="info-box">
            <h4>📝 Invoice Notes:</h4>
            <p style="font-style: italic;">"{{ $invoice->notes }}"</p>
        </div>
        @endif
        
        <div class="payment-box">
            <h3>💳 Payment Information</h3>
            <ul>
                <li><strong>Secure Payment:</strong> Your payment is processed securely through our platform</li>
                <li><strong>Payment Methods:</strong> We accept major credit cards and digital payments</li>
                <li><strong>Immediate Processing:</strong> Your payment will be processed immediately</li>
                <li><strong>Receipt:</strong> You'll receive a payment receipt via email after successful payment</li>
            </ul>
        </div>
        
        <div class="info-box">
            <h3>⏰ Payment Timeline</h3>
            <p><strong>Due Date:</strong> {{ $dueDate->format('l, F j, Y') }}</p>
            <p>Please complete your payment by the due date to avoid any service disruptions. If you have any questions about the invoice or need assistance with payment, please don't hesitate to contact us.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $paymentUrl }}" class="btn btn-success" style="font-size: 18px; padding: 15px 30px;">💳 Pay Now</a>
            <br>
            <a href="{{ $appointmentUrl }}" class="btn">View Appointment Details</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <div class="info-box">
            <h3>❓ Need Help?</h3>
            <p>If you have any questions about this invoice or need assistance, please contact our support team. We're here to help!</p>
        </div>
        
        <p>Thank you for choosing HireMe for your service needs!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>