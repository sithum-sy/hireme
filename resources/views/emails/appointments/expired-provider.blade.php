<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Expired</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .action-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .warning-section { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 15px; margin: 20px 0; }
        .improvement-tips { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Missed Appointment Request</h1>
        </div>
        
        <div class="content">
            <p>Hi <strong>{{ $providerName }}</strong>,</p>
            
            <p>This is a notification that an appointment request has expired due to no response within the 24-hour window.</p>
            
            <div class="appointment-details">
                <h3>📋 Expired Request Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Client:</span>
                    <span class="detail-value">{{ $clientName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{ $serviceName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Requested Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentDate)->format('l, F j, Y') }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Requested Time:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentTime, 'Asia/Colombo')->format('g:i A') }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Potential Earnings:</span>
                    <span class="detail-value"><strong>Rs. {{ number_format($totalPrice) }}</strong></span>
                </div>
            </div>
            
            <div class="warning-section">
                <h4>📉 Impact on Your Profile</h4>
                <p><strong>Late responses can affect your business:</strong></p>
                <ul>
                    <li>Lower search ranking in provider listings</li>
                    <li>Reduced client trust and satisfaction ratings</li>
                    <li>Missed revenue opportunities</li>
                    <li>Potential account restrictions for repeated non-responses</li>
                </ul>
            </div>
            
            <div class="improvement-tips">
                <h4>💡 Improve Your Response Time</h4>
                <ul>
                    <li><strong>Enable notifications:</strong> Turn on email and mobile alerts</li>
                    <li><strong>Check regularly:</strong> Review your dashboard 2-3 times daily</li>
                    <li><strong>Set availability:</strong> Update your calendar to avoid conflicts</li>
                    <li><strong>Quick decisions:</strong> Accept or decline promptly - don't wait</li>
                    <li><strong>Auto-accept:</strong> Consider enabling auto-acceptance for trusted time slots</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $dashboardUrl }}" class="action-button">📊 Go to Dashboard</a>
                <a href="{{ config('app.url') }}/provider/settings/notifications" class="action-button">🔔 Update Notifications</a>
            </div>
            
            <h3>📱 Stay Connected</h3>
            <p>To avoid missing future opportunities:</p>
            <ul>
                <li>Download the HireMe mobile app for instant notifications</li>
                <li>Set up email alerts for new appointment requests</li>
                <li>Add our email address to your contacts to prevent spam filtering</li>
                <li>Consider scheduling specific times each day to check for new requests</li>
            </ul>
            
            <p><strong>Remember:</strong> Quick responses lead to more bookings and higher client satisfaction. Every missed request is a missed opportunity to grow your business.</p>
        </div>
        
        <div class="footer">
            <p>Questions? Contact provider support at <a href="mailto:providers@hireme.lk">providers@hireme.lk</a></p>
            <p>© {{ date('Y') }} HireMe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>