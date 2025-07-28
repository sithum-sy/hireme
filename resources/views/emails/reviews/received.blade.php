<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Review Received</title>
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
            background-color: {{ $rating >= 4 ? '#28a745' : '#ffc107' }};
            color: {{ $rating >= 4 ? 'white' : '#212529' }};
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
        }
        .review-details {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid {{ $rating >= 4 ? '#28a745' : '#ffc107' }};
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
        .review-icon {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .rating-display {
            font-size: 32px;
            text-align: center;
            margin: 15px 0;
        }
        .review-text {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #007bff;
            font-style: italic;
            font-size: 16px;
            line-height: 1.6;
        }
        .info-box {
            background-color: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #007bff;
        }
        .success-box {
            background-color: #d4edda;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #28a745;
        }
        .client-info {
            background-color: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .service-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .service-table th, .service-table td {
            border: 1px solid #dee2e6;
            padding: 12px;
            text-align: left;
        }
        .service-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="review-icon">
            @if($rating >= 5)
                🌟
            @elseif($rating >= 4)
                ⭐
            @elseif($rating >= 3)
                📝
            @else
                💭
            @endif
        </div>
        <h1>
            @if($rating >= 4)
                Excellent Review Received!
            @else
                New Review Received
            @endif
        </h1>
        <p>{{ $clientName }} has left you a review</p>
    </div>
    
    <div class="content">
        <p>Hi {{ $providerName }},</p>
        
        @if($rating >= 4)
        <div class="success-box">
            <h3>🎉 Congratulations!</h3>
            <p>You received a {{ $rating >= 5 ? 'perfect 5-star' : 'great ' . $rating . '-star' }} review! Your excellent service is being recognized by your clients.</p>
        </div>
        @else
        <div class="info-box">
            <h3>📝 Review Received</h3>
            <p>{{ $clientName }} has left you a {{ $rating }}-star review. Every review helps you grow and improve your services.</p>
        </div>
        @endif
        
        <div class="review-details">
            <h3>⭐ Review Details</h3>
            
            <table class="service-table">
                <tr>
                    <th>Service</th>
                    <td>{{ $serviceName }}</td>
                </tr>
                <tr>
                    <th>Client</th>
                    <td>{{ $clientName }}</td>
                </tr>
                <tr>
                    <th>Service Date</th>
                    <td>{{ $appointmentDate->format('l, F j, Y') }}</td>
                </tr>
                <tr>
                    <th>Service Time</th>
                    <td>{{ \Carbon\Carbon::parse($appointmentTime)->format('g:i A') }}</td>
                </tr>
            </table>
            
            <div class="rating-display">
                <strong>Rating: {{ $ratingStars }} ({{ $rating }}/5)</strong>
            </div>
            
            @if($reviewText)
            <div class="review-text">
                <h4>💬 Client's Feedback:</h4>
                <p>"{{ $reviewText }}"</p>
                <small style="color: #6c757d;">- {{ $clientName }}</small>
            </div>
            @endif
        </div>
        
        @if($rating >= 4)
        <div class="success-box">
            <h3>🚀 Keep Up the Great Work!</h3>
            <ul>
                <li><strong>Positive Impact:</strong> Great reviews like this help attract more clients</li>
                <li><strong>Trust Building:</strong> High ratings build trust in our platform</li>
                <li><strong>Business Growth:</strong> Satisfied clients often become repeat customers</li>
                <li><strong>Referrals:</strong> Happy clients recommend your services to others</li>
            </ul>
        </div>
        @else
        <div class="info-box">
            <h3>📈 Growing Your Business</h3>
            <ul>
                <li><strong>Valuable Feedback:</strong> All reviews provide insights for improvement</li>
                <li><strong>Client Communication:</strong> Consider reaching out if there are specific concerns</li>
                <li><strong>Continuous Improvement:</strong> Use feedback to enhance your service quality</li>
                <li><strong>Professional Growth:</strong> Every review is a learning opportunity</li>
            </ul>
        </div>
        @endif
        
        <div class="client-info">
            <h4>👤 About This Client</h4>
            <p><strong>Name:</strong> {{ $clientName }}</p>
            <p><strong>Service:</strong> {{ $serviceName }}</p>
            <p><strong>Date:</strong> {{ $appointmentDate->format('F j, Y') }}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $reviewsUrl }}" class="btn btn-success">View All Reviews</a>
            <a href="{{ $appointmentUrl }}" class="btn">View Appointment</a>
            <a href="{{ $dashboardUrl }}" class="btn">Go to Dashboard</a>
        </div>
        
        <div class="info-box">
            <h3>💡 Pro Tips</h3>
            <ul>
                <li><strong>Respond to Reviews:</strong> Thank clients for their feedback when appropriate</li>
                <li><strong>Share Success:</strong> Positive reviews can be highlighted in your profile</li>
                <li><strong>Learn & Improve:</strong> Use all feedback to continuously enhance your services</li>
                <li><strong>Stay Professional:</strong> Maintain high service standards for future bookings</li>
            </ul>
        </div>
        
        <p>Thank you for providing excellent service through HireMe!</p>
        
        <p>Best regards,<br>
        The HireMe Team</p>
    </div>
    
    <div class="footer">
        <p>Review notification from HireMe.</p>
        <p>Rating: {{ $rating }}/5 ⭐ | Service: {{ $serviceName }}</p>
        <p>&copy; {{ date('Y') }} HireMe. All rights reserved.</p>
    </div>
</body>
</html>