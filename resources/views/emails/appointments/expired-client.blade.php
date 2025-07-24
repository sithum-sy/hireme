<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Request Expired</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #856404; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .action-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .help-section { background-color: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .sorry-message { background-color: #fff3cd; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Appointment Request Expired</h1>
        </div>
        
        <div class="content">
            <p>Hi <strong>{{ $clientName }}</strong>,</p>
            
            <div class="sorry-message">
                <p><strong>We're sorry to inform you that your appointment request has expired.</strong></p>
                <p>The provider didn't respond within the 24-hour window, so we've automatically cancelled this request.</p>
            </div>
            
            <div class="appointment-details">
                <h3>📋 Expired Request Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{ $serviceName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Provider:</span>
                    <span class="detail-value">{{ $providerName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Requested Date:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentDate)->format('l, F j, Y') }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Requested Time:</span>
                    <span class="detail-value">{{ \Carbon\Carbon::parse($appointmentTime, 'Asia/Colombo')->format('g:i A') }}</span>
                </div>
            </div>
            
            <div class="help-section">
                <h3>🔍 Don't worry - we're here to help!</h3>
                <p>We understand this can be frustrating. Here are your options:</p>
                <ul>
                    <li><strong>Try again:</strong> Book with the same or a different provider</li>
                    <li><strong>Browse alternatives:</strong> We'll show you similar services</li>
                    <li><strong>Get assistance:</strong> Our support team can help you find the right provider</li>
                    <li><strong>Direct contact:</strong> Try calling providers directly for urgent needs</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $bookingUrl }}" class="action-button">🔄 Book This Service Again</a>
                <a href="{{ config('app.url') }}/services" class="action-button">🔍 Browse All Services</a>
            </div>
            
            <h3>💡 Tips for successful bookings:</h3>
            <ul>
                <li>Book during business hours (9 AM - 6 PM) for faster responses</li>
                <li>Choose providers with high response rates</li>
                <li>Consider booking 2-3 days in advance</li>
                <li>Add detailed requirements to help providers respond quickly</li>
                <li>Try alternative time slots if your first choice doesn't work</li>
            </ul>
            
            <p><strong>We apologize for any inconvenience caused.</strong> Our team is constantly working to improve provider response times and ensure better service for our clients.</p>
        </div>
        
        <div class="footer">
            <p>Need immediate assistance? Contact us at <a href="mailto:support@hireme.lk">support@hireme.lk</a> or call +94 11 234 5678</p>
            <p>© {{ date('Y') }} HireMe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>