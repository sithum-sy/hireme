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
        .appointment-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .btn {
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .btn:hover {
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
        .reminder-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .highlight-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        .client-info {
            background-color: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="reminder-icon">📅</div>
        <h1>Appointment Reminder</h1>
        <p>You have an appointment tomorrow!</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $providerName }},</p>
        
        <p>This is a reminder that you have an appointment scheduled for <strong>tomorrow</strong> with {{ $clientName }}.</p>
        
        <div class="highlight-box">
            <h3>⏰ Tomorrow at {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</h3>
            <p>{{ $appointmentDate->format('l, F j, Y') }}</p>
        </div>
        
        <div class="appointment-details">
            <h3>📋 Appointment Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Client:</strong> {{ $clientName }}</p>
            <p><strong>Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Duration:</strong> {{ $appointment->duration_hours }} hour{{ $appointment->duration_hours > 1 ? 's' : '' }}</p>
            <p><strong>Total Payment:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            
            @if($appointment->location_type === 'client_address')
                <p><strong>Location:</strong> At client's address</p>
                @if($clientAddress)
                    <p><strong>Address:</strong> {{ $clientAddress }}</p>
                @endif
            @elseif($appointment->location_type === 'provider_location')
                <p><strong>Location:</strong> At your location</p>
            @else
                <p><strong>Location:</strong> Custom location</p>
            @endif
        </div>

        <div class="client-info">
            <h3>👤 Client Information</h3>
            @if($appointment->client_phone)
                <p><strong>Phone:</strong> {{ $appointment->client_phone }}</p>
            @endif
            @if($appointment->client_email)
                <p><strong>Email:</strong> {{ $appointment->client_email }}</p>
            @endif
            @if($appointment->contact_preference)
                <p><strong>Preferred Contact:</strong> {{ ucfirst($appointment->contact_preference) }}</p>
            @endif
            @if($appointment->client_notes)
                <p><strong>Client Notes:</strong> {{ $appointment->client_notes }}</p>
            @endif
            @if($appointment->location_instructions)
                <p><strong>Location Instructions:</strong> {{ $appointment->location_instructions }}</p>
            @endif
        </div>
        
        <h3>📝 Pre-Service Checklist</h3>
        <ul>
            <li>✅ Review client requirements and notes</li>
            <li>✅ Prepare necessary tools and materials</li>
            <li>✅ Confirm travel route and parking if going to client</li>
            <li>✅ Contact client if you need to clarify anything</li>
            <li>✅ Ensure you have payment processing ready</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn">View Appointment Details</a>
        </div>
        
        <div class="highlight-box">
            <p><strong>Running late or need to reschedule?</strong><br>
            Please contact the client immediately and update the appointment status in your dashboard.</p>
        </div>
        
        <p>Thank you for being a valued service provider. We wish you a successful appointment!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated reminder from HireMe. Please do not reply to this email.</p>
        <p>For support, please contact us through your provider dashboard.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>