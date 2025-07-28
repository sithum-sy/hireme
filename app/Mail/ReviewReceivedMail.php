<?php

namespace App\Mail;

use App\Models\Review;
use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ReviewReceivedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $review;
    public $appointment;

    /**
     * Create a new message instance.
     */
    public function __construct(array $data)
    {
        $this->review = $data['review'];
        $this->appointment = $data['appointment'];
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $rating = $this->review->rating;
        $subject = $rating >= 4 ? 'Great Review Received!' : 'New Review Received';
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $baseUrl = config('app.frontend_url', config('app.url'));
        
        return new Content(
            view: 'emails.reviews.received',
            with: [
                'review' => $this->review,
                'appointment' => $this->appointment,
                'providerName' => $this->appointment->provider->first_name,
                'clientName' => $this->appointment->client->first_name . ' ' . $this->appointment->client->last_name,
                'serviceName' => $this->appointment->service->title,
                'appointmentDate' => $this->appointment->appointment_date,
                'appointmentTime' => $this->appointment->appointment_time,
                'rating' => $this->review->rating,
                'reviewText' => $this->review->comment,
                'ratingStars' => str_repeat('⭐', $this->review->rating),
                'businessName' => $this->appointment->provider->provider_profile->business_name ?? null,
                'appointmentUrl' => $baseUrl . '/provider/appointments/' . $this->appointment->id,
                'reviewsUrl' => $baseUrl . '/provider/reviews',
                'dashboardUrl' => $baseUrl . '/provider/dashboard',
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}