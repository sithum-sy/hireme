<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Request Received</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .price { font-size: 1.2em; font-weight: bold; color: #28a745; }
        .confirmation-code { background-color: #e3f2fd; padding: 15px; border-radius: 6px; text-align: center; margin: 20px 0; }
        .action-button { display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 0.9em; }
        .status-badge { background-color: #ffc107; color: #856404; padding: 4px 12px; border-radius: 4px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Booking Request Received!</h1>
        </div>
        
        <div class="content">
            <p>Hi <strong>{{ $clientName }}</strong>,</p>
            
            <p>Great news! We've received your appointment request and it's been sent to your chosen service provider. Here are the details:</p>
            
            <div class="appointment-details">
                <h3>📋 Appointment Details</h3>
                
                <div class="detail-row">
                    <span class="detail-label">Service:</span>
                    <span class="detail-value">{{ $serviceName }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Provider:</span>
                    <span class="detail-value">{{ $providerName }}{{ $businessName ? ' - ' . $businessName : '' }}</span>
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
                    <span class="detail-label">Total Amount:</span>
                    <span class="detail-value price">Rs. {{ number_format($totalPrice) }}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value"><span class="status-badge">Pending Confirmation</span></span>
                </div>
            </div>
            
            <div class="confirmation-code">
                <strong>Confirmation Code: {{ $confirmationCode }}</strong><br>
                <small>Keep this code for your records</small>
            </div>
            
            <h3>⏰ What happens next?</h3>
            <ul>
                <li><strong>Provider Response:</strong> Your chosen provider will review and respond to your request within 24 hours</li>
                <li><strong>Confirmation:</strong> You'll receive an email notification once your appointment is confirmed</li>
                <li><strong>Payment:</strong> Payment will be collected after service completion</li>
                <li><strong>Support:</strong> Contact us anytime if you need assistance</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{ $appointmentUrl }}" class="action-button">View Appointment Details</a>
            </div>
            
            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⚠️ Important:</strong> If you don't hear back from the provider within 24 hours, we'll automatically cancel this request and help you find alternative providers.
            </div>
        </div>
        
        <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@hireme.lk">support@hireme.lk</a></p>
            <p>© {{ date('Y') }} HireMe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>