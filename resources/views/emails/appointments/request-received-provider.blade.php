<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Request</title>
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
            margin: 10px 5px;
        }
        .btn:hover {
            background-color: #218838;
        }
        .btn-secondary {
            background-color: #dc3545;
        }
        .btn-secondary:hover {
            background-color: #c82333;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            color: #6c757d;
            font-size: 14px;
        }
        .notification-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
        .urgent-box {
            background-color: #fff3cd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #ffc107;
        }
        .client-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="notification-icon">🔔</div>
        <h1>New Appointment Request!</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $providerName }},</p>
        
        <p>You have received a new appointment request from <strong>{{ $clientName }}</strong>. Please review the details below and respond within 24 hours.</p>
        
        <div class="appointment-details">
            <h3>📋 Request Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Client:</strong> {{ $appointment->client->first_name }} {{ $appointment->client->last_name }}</p>
            <p><strong>Requested Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Requested Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Duration:</strong> {{ $appointment->duration_hours }} hour(s)</p>
            <p><strong>Total Amount:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            
            @if($appointment->location_type === 'client_address')
                <p><strong>Location:</strong> At client's address</p>
                @if($appointment->client_address)
                    <p><strong>Address:</strong> {{ $appointment->client_address }}</p>
                @endif
            @elseif($appointment->location_type === 'provider_location')
                <p><strong>Location:</strong> At your location</p>
            @else
                <p><strong>Location:</strong> Custom location</p>
            @endif
        </div>

        <div class="client-info">
            <h4>👤 Client Contact Information</h4>
            @if($appointment->client_phone)
                <p><strong>Phone:</strong> {{ $appointment->client_phone }}</p>
            @endif
            @if($appointment->client_email)
                <p><strong>Email:</strong> {{ $appointment->client_email }}</p>
            @endif
            <p><strong>Preferred Contact:</strong> {{ ucfirst($appointment->contact_preference ?? 'phone') }}</p>
            
            @if($appointment->client_notes)
                <p><strong>Client Notes:</strong> {{ $appointment->client_notes }}</p>
            @endif
        </div>
        
        <div class="urgent-box">
            <h3>⏰ Action Required!</h3>
            <p><strong>Please respond within 24 hours</strong> to confirm or decline this appointment request. If you don't respond, the request will expire automatically.</p>
        </div>
        
        <h3>Next Steps:</h3>
        <ul>
            <li><strong>Review the request:</strong> Check your availability for the requested time</li>
            <li><strong>Confirm or Decline:</strong> Use the buttons below or visit your dashboard</li>
            <li><strong>Contact Client:</strong> Feel free to contact the client if you have questions</li>
            <li><strong>Service Delivery:</strong> If confirmed, prepare for the scheduled service</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $dashboardUrl }}" class="btn">View in Dashboard</a>
            <a href="{{ $appointmentUrl }}" class="btn btn-secondary">View Details</a>
        </div>
        
        <p><strong>Important:</strong> Timely responses help maintain your professional reputation and client satisfaction on our platform.</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>