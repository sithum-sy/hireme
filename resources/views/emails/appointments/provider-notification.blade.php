<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Appointment Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .price { font-size: 1.2em; font-weight: bold; color: #28a745; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .accept-btn { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .decline-btn { display: inline-block; background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .view-btn { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .urgent-notice { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .expires-warning { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 New Appointment Request</h1>
        </div>
        
        <div class="content">
            <p>Hi <strong>{{ $providerName }}</strong>,</p>
            
            <p>You have received a new appointment request! Please review the details below and respond within 24 hours.</p>
            
            <div class="appointment-details">
                <h3>📋 Appointment Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Client:</span>
                    <span class="detail-value">{{ $clientName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{ $serviceName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentDate)->format('l, F j, Y') }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentTime, 'Asia/Colombo')->format('g:i A') }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Payment:</span>
                    <span class="detail-value price">Rs. {{ number_format($totalPrice) }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Location:</span>
                    <span class="detail-value">{{ $location }}</span>
                </div>
                
                @if($clientPhone)
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{ $clientPhone }}</span>
                </div>
                @endif
                
                @if($clientEmail)
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ $clientEmail }}</span>
                </div>
                @endif
                
                <div class="detail-row">
                    <span class="detail-label">Confirmation Code:</span>
                    <span class="detail-value"><strong>{{ $confirmationCode }}</strong></span>
                </div>
            </div>
            
            <div class="expires-warning">
                <strong>⏰ Action Required:</strong> This request expires at {{ \Carbon\Carbon::parse($expiresAt)->format('M j, Y g:i A') }}. Please respond promptly to maintain good client relations.
            </div>
            
            <div class="action-buttons">
                <a href="{{ $acceptUrl }}" class="accept-btn">✅ Accept Appointment</a>
                <a href="{{ $declineUrl }}" class="decline-btn">❌ Decline Request</a>
                <a href="{{ $appointmentUrl }}" class="view-btn">👁️ View Details</a>
            </div>
            
            <div class="urgent-notice">
                <h4>📱 Quick Response Tips:</h4>
                <ul>
                    <li>Faster responses lead to higher client satisfaction ratings</li>
                    <li>Confirmed appointments show higher in search results</li>
                    <li>Late responses may result in automatic cancellation</li>
                    <li>You can also respond directly from your provider dashboard</li>
                </ul>
            </div>
            
            <p><strong>Need to reschedule?</strong> Contact the client directly or suggest alternative times through the appointment details page.</p>
        </div>
        
        <div class="footer">
            <p>Manage all your appointments at <a href="{{ $dashboardUrl }}">Provider Dashboard</a></p>
            <p>© {{ date('Y') }} HireMe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>