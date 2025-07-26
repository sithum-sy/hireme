<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Submitted</title>
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
            background-color: #007bff;
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
            border-left: 4px solid #007bff;
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
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .success-icon {
            font-size: 48px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="success-icon">📋</div>
        <h1>Appointment Request Submitted!</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>Thank you for your appointment request! We've successfully submitted your booking request to {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }}.</p>
        
        <div class="appointment-details">
            <h3>📅 Request Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Requested Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Requested Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Duration:</strong> {{ $appointment->duration_hours }} hour(s)</p>
            <p><strong>Total Cost:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            <p><strong>Status:</strong> <span style="color: #ffc107; font-weight: bold;">Pending Provider Confirmation</span></p>
        </div>
        
        <div class="info-box">
            <h3>⏰ What Happens Next?</h3>
            <ul>
                <li><strong>Provider Review:</strong> {{ $providerName }} will review your request</li>
                <li><strong>Response Time:</strong> You'll receive a response within 24 hours</li>
                <li><strong>Confirmation:</strong> The provider will either confirm or decline your request</li>
                <li><strong>Payment:</strong> Payment is processed only after service completion</li>
            </ul>
        </div>
        
        <h3>Important Information:</h3>
        <ul>
            <li>Your request will expire automatically after 24 hours if not confirmed</li>
            <li>You can view and manage this request in your dashboard</li>
            <li>You'll receive email notifications about any status updates</li>
            <li>You can cancel this request anytime before confirmation</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn">View Request Details</a>
            <a href="{{ $dashboardUrl }}" class="btn" style="background-color: #28a745;">Go to Dashboard</a>
        </div>
        
        <p>If you have any questions or need to make changes, please visit your dashboard or contact our support team.</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>