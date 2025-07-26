<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Confirmed</title>
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
        .success-icon {
            font-size: 48px;
            color: #28a745;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="success-icon">✓</div>
        <h1>Appointment Confirmed!</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $clientName }},</p>
        
        <p>Great news! Your appointment has been <strong>confirmed</strong> by {{ $providerName }}{{ $businessName ? ' from ' . $businessName : '' }}.</p>
        
        <div class="appointment-details">
            <h3>📅 Appointment Details</h3>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Provider:</strong> {{ $providerName }}{{ $businessName ? ' (' . $businessName . ')' : '' }}</p>
            <p><strong>Date:</strong> {{ $appointmentDate->format('l, F j, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</p>
            <p><strong>Total Cost:</strong> Rs. {{ number_format($totalPrice, 2) }}</p>
            
            @if($appointment->location_type === 'client_address')
                <p><strong>Location:</strong> At your address</p>
                @if($appointment->client_address)
                    <p><strong>Address:</strong> {{ $appointment->client_address }}</p>
                @endif
            @elseif($appointment->location_type === 'provider_location')
                <p><strong>Location:</strong> At provider's location</p>
            @else
                <p><strong>Location:</strong> Custom location (details will be shared separately)</p>
            @endif

            @if($appointment->client_notes)
                <p><strong>Your Notes:</strong> {{ $appointment->client_notes }}</p>
            @endif
        </div>
        
        <h3>What's Next?</h3>
        <ul>
            <li>The provider will contact you if needed</li>
            <li>Be ready at the scheduled time</li>
            <li>Payment will be processed after service completion</li>
            <li>You can reschedule if needed (24 hours advance notice required)</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $appointmentUrl }}" class="btn">View Appointment Details</a>
        </div>
        
        <p><strong>Need to make changes?</strong><br>
        You can reschedule or cancel this appointment by visiting your dashboard. Please provide at least 24 hours notice for any changes.</p>
        
        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message from HireMe. Please do not reply to this email.</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>