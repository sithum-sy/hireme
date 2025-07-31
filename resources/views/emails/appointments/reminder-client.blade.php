<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Reminder</title>
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
        .reminder-icon {
            font-size: 48px;
            color: #007bff;
            margin-bottom: 10px;
        }
        .highlight-box {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="reminder-icon">⏰</div>
        <h1>Appointment Reminder</h1>
        <p>Your appointment is tomorrow!</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>This is a friendly reminder that you have an appointment scheduled for <strong>tomorrow</strong>.</p>
        
        <div class="highlight-box">
            <h3>📅 Tomorrow at {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</h3>
            <p>{{ $appointmentDate->format('l, F j, Y') }}</p>
        </div>
        
        <div class="appointment-details">
            <h3>📋 Appointment Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Total Cost:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            
            @if($appointment->location_type === 'client_address')
                <p><strong>Location:</strong> At your address</p>
                @if($clientAddress)
                    <p><strong>Address:</strong> {{ $clientAddress }}</p>
                @endif
            @elseif($appointment->location_type === 'provider_location')
                <p><strong>Location:</strong> At provider's location</p>
            @else
                <p><strong>Location:</strong> Custom location</p>
            @endif

            @if($appointment->client_notes)
                <p><strong>Your Notes:</strong> {{ $appointment->client_notes }}</p>
            @endif
        </div>
        
        <h3>📝 Preparation Checklist</h3>
        <ul>
            <li>✅ Confirm you'll be available at the scheduled time</li>
            <li>✅ Ensure access to the service location</li>
            <li>✅ Have any required materials or information ready</li>
            <li>✅ Keep your phone handy in case the provider needs to contact you</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn">View Full Details</a>
        </div>
        
        <div class="highlight-box">
            <p><strong>Need to reschedule or cancel?</strong><br>
            Please contact us as soon as possible. Changes made with less than 24 hours notice may be subject to fees.</p>
        </div>
        
        <p>We're looking forward to providing you with excellent service tomorrow!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated reminder from HireMe. Please do not reply to this email.</p>
        <p>If you need assistance, please contact us through your HireMe dashboard.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>