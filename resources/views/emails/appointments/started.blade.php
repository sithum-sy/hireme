<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Service Started</title>
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
        .started-icon {
            font-size: 48px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .status-box {
            background-color: #d1ecf1;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #17a2b8;
        }
        .progress-indicator {
            background-color: #e9ecef;
            height: 8px;
            border-radius: 4px;
            margin: 15px 0;
            overflow: hidden;
        }
        .progress-bar {
            background-color: #007bff;
            height: 100%;
            width: 50%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="started-icon">🚀</div>
        <h1>Your Service Has Started!</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>Great news! {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }} has started your service appointment.</p>
        
        <div class="status-box">
            <h3>📍 Service Status</h3>
            <p><strong>Status:</strong> <span style="color: #007bff; font-weight: bold;">In Progress</span></p>
            <div class="progress-indicator">
                <div class="progress-bar"></div>
            </div>
            <p><small>Your service is currently being performed</small></p>
        </div>
        
        <div class="appointment-details">
            <h3>📋 Service Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Amount:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            <p><strong>Current Status:</strong> <span style="color: #007bff; font-weight: bold;">Service In Progress</span></p>
        </div>

        @if($appointment->provider_notes)
        <div class="status-box">
            <h4>💬 Provider's Message:</h4>
            <p style="font-style: italic;">"{{ $appointment->provider_notes }}"</p>
        </div>
        @endif
        
        <div class="status-box">
            <h3>ℹ️ What's Happening Now</h3>
            <ul>
                <li><strong>Service in Progress:</strong> Your provider is currently working on your service</li>
                <li><strong>Communication:</strong> The provider may contact you if needed during the service</li>
                <li><strong>Completion:</strong> You'll be notified when the service is completed</li>
                <li><strong>Payment:</strong> Payment will be requested after successful completion</li>
            </ul>
        </div>
        
        <div class="status-box">
            <h3>📱 Stay Connected</h3>
            <p>If you need to contact your service provider during the appointment, you can reach them through your appointment details page.</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn btn-success">View Appointment Details</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <p>We hope you have a great experience with your service!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>