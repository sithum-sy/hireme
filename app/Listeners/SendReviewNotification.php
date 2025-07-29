<?php

namespace App\Listeners;

use App\Events\ReviewSubmitted;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendReviewNotification implements ShouldQueue
{
    use InteractsWithQueue;

    protected $notificationService;

    /**
     * Create the event listener.
     */
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Handle the event.
     */
    public function handle(ReviewSubmitted $event): void
    {
        $review = $event->review;
        $appointment = $event->appointment;

        Log::info("Processing review submitted notification", [
            'review_id' => $review->id,
            'appointment_id' => $appointment->id,
            'rating' => $review->rating,
            'review_type' => $review->review_type,
            'reviewer_id' => $review->reviewer_id,
            'reviewee_id' => $review->reviewee_id
        ]);

        // Send notification to the person being reviewed (reviewee)
        $reviewee = $review->reviewee; // This gets the person being reviewed
        $reviewer = $review->reviewer; // This gets the person who wrote the review
        
        $this->notificationService->sendAppointmentNotification(
            'review_received',
            $reviewee, // Send to the person being reviewed
            [
                'review' => $review,
                'appointment' => $appointment,
                'review_id' => $review->id,
                'appointment_id' => $appointment->id,
                'service_name' => $appointment->service->title,
                'client_name' => $appointment->client->full_name,
                'provider_name' => $appointment->provider->full_name,
                'appointment_date' => $appointment->appointment_date->format('M j, Y'),
                'appointment_time' => $appointment->appointment_time,
                'rating' => $review->rating,
                'review_text' => $review->comment,
                'rating_stars' => str_repeat('⭐', $review->rating),
                'reviewer_name' => $reviewer->full_name,
                'reviewee_name' => $reviewee->full_name,
                'review_type' => $review->review_type,
            ]
        );
    }

    public function failed(ReviewSubmitted $event, $exception)
    {
        Log::error("Review notification failed", [
            'review_id' => $event->review->id,
            'appointment_id' => $event->appointment->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}