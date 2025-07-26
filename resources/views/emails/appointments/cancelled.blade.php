<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Cancelled</title>
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
            background-color: #dc3545;
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
        .appointment-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc3545;
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
        .btn-primary {
            background-color: #28a745;
        }
        .btn-primary:hover {
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
        .cancel-icon {
            font-size: 48px;
            color: #dc3545;
            margin-bottom: 10px;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .refund-info {
            background-color: #d1ecf1;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #17a2b8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="cancel-icon">❌</div>
        <h1>Appointment Cancelled</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>We're sorry to inform you that your appointment has been <strong>cancelled</strong> by {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }}.</p>
        
        <div class="appointment-details">
            <h3>📅 Cancelled Appointment Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Scheduled Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Scheduled Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Amount:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Cancelled by Provider</span></p>
        </div>

        @if($appointment->provider_notes)
        <div class="info-box">
            <h4>Provider's Message:</h4>
            <p style="font-style: italic;">"{{ $appointment->provider_notes }}"</p>
        </div>
        @endif
        
        <div class="refund-info">
            <h3>💰 Refund Information</h3>
            <p><strong>Good news!</strong> Since no payment was processed yet (payment occurs after service completion), there are no charges to refund. You haven't been charged anything for this cancelled appointment.</p>
        </div>
        
        <div class="info-box">
            <h3>🔍 What You Can Do Next</h3>
            <ul>
                <li><strong>Find Similar Services:</strong> Browse other providers offering the same service</li>
                <li><strong>Contact the Provider:</strong> If you'd like to reschedule for a different time</li>
                <li><strong>Try Different Times:</strong> The provider might be available at different times</li>
                <li><strong>Explore Alternatives:</strong> Check out similar services from other providers</li>
            </ul>
        </div>
        
        <h3>Common Reasons for Cancellation:</h3>
        <ul>
            <li>Unexpected scheduling conflicts</li>
            <li>Emergency situations</li>
            <li>Service requirements couldn't be met</li>
            <li>Provider became unavailable</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $searchUrl }}" class="btn btn-primary">Find Similar Services</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <p><strong>We apologize for any inconvenience caused.</strong><br>
        Our platform has many other qualified service providers who would be happy to help you. Don't let this discourage you from finding the service you need!</p>
        
        <p>If you need assistance finding a replacement provider or have any questions, our support team is here to help.</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>