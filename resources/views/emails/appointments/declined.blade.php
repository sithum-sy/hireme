<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Declined</title>
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
            background-color: #ffc107;
            color: #333;
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
            border-left: 4px solid #ffc107;
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
        .warning-icon {
            font-size: 48px;
            color: #ffc107;
            margin-bottom: 10px;
        }
        .suggestions {
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
        <div class="warning-icon">⚠️</div>
        <h1>Appointment Request Declined</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>We're sorry to inform you that your appointment request has been <strong>declined</strong> by {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }}.</p>
        
        <div class="appointment-details">
            <h3>📅 Declined Appointment</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Requested Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Requested Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
        </div>
        
        <div class="suggestions">
            <h3>💡 What You Can Do Next</h3>
            <ul>
                <li><strong>Try a different time:</strong> The provider might be available at a different time</li>
                <li><strong>Contact the provider:</strong> Ask about their availability or specific requirements</li>
                <li><strong>Find similar services:</strong> Browse other providers offering the same service</li>
                <li><strong>Request a quote:</strong> Some providers prefer to discuss custom requirements first</li>
            </ul>
        </div>
        
        <h3>Common Reasons for Decline:</h3>
        <ul>
            <li>Provider is not available at the requested time</li>
            <li>Service location is outside their coverage area</li>
            <li>Appointment doesn't meet minimum booking requirements</li>
            <li>Provider's schedule is fully booked</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $searchUrl }}" class="btn">Find Similar Services</a>
        </div>
        
        <p><strong>Don't give up!</strong><br>
        There are many other qualified service providers on our platform. You can search for similar services or contact providers directly to discuss your requirements.</p>
        
        <p>If you need assistance finding the right provider, our support team is here to help.</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>