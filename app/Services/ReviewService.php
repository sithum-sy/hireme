<?php

namespace App\Services;

use App\Models\Review;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    /**
     * Submit a review for an appointment
     */
    public function submitReview(Appointment $appointment, User $reviewer, array $reviewData)
    {
        // Determine review type and reviewee
        if ($reviewer->id === $appointment->client_id) {
            $reviewType = Review::TYPE_CLIENT_TO_PROVIDER;
            $revieweeId = $appointment->provider_id;
        } elseif ($reviewer->id === $appointment->provider_id) {
            $reviewType = Review::TYPE_PROVIDER_TO_CLIENT;
            $revieweeId = $appointment->client_id;
        } else {
            throw new \Exception('User not authorized to review this appointment');
        }

        // Check if review already exists
        $existingReview = Review::where([
            'appointment_id' => $appointment->id,
            'reviewer_id' => $reviewer->id,
            'review_type' => $reviewType
        ])->first();

        if ($existingReview) {
            throw new \Exception('Review already submitted for this appointment');
        }

        return DB::transaction(function () use ($appointment, $reviewer, $revieweeId, $reviewType, $reviewData) {
            // Create the review
            $review = Review::create([
                'appointment_id' => $appointment->id,
                'reviewer_id' => $reviewer->id,
                'reviewee_id' => $revieweeId,
                'review_type' => $reviewType,
                'rating' => $reviewData['rating'],
                'comment' => $reviewData['comment'] ?? null,
                'quality_rating' => $reviewData['quality_rating'] ?? null,
                'punctuality_rating' => $reviewData['punctuality_rating'] ?? null,
                'communication_rating' => $reviewData['communication_rating'] ?? null,
                'value_rating' => $reviewData['value_rating'] ?? null,
                'would_recommend' => $reviewData['would_recommend'] ?? null,
                'review_images' => $reviewData['review_images'] ?? null,
                'is_verified' => true // Since it's from a completed appointment
            ]);

            // Update reviewee's average rating
            $reviewee = User::find($revieweeId);
            $reviewee->updateProviderRating();

            // Check if both reviews are complete (optional)
            if ($appointment->hasClientReview() && $appointment->hasProviderReview()) {
                $appointment->markReviewsCompleted();
            }

            return $review;
        });
    }

    /**
     * Get reviews for a provider
     */
    public function getProviderReviews($providerId, $filters = [])
    {
        $query = Review::forProvider($providerId)
            ->visible()
            ->verified()
            ->with(['reviewer', 'appointment.service'])
            ->orderBy('created_at', 'desc');

        // Apply filters
        if (isset($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }

        if (isset($filters['has_comment'])) {
            $query->whereNotNull('comment');
        }

        return $query;
    }

    /**
     * Calculate review statistics for a provider
     */
    public function getProviderReviewStats($providerId)
    {
        $reviews = Review::forProvider($providerId)->visible()->verified();

        return [
            'total_reviews' => $reviews->count(),
            'average_rating' => round($reviews->avg('rating'), 1),
            'rating_breakdown' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
            'average_quality' => round($reviews->avg('quality_rating'), 1),
            'average_punctuality' => round($reviews->avg('punctuality_rating'), 1),
            'average_communication' => round($reviews->avg('communication_rating'), 1),
            'average_value' => round($reviews->avg('value_rating'), 1),
            'recommendation_rate' => $reviews->where('would_recommend', true)->count() / max($reviews->count(), 1) * 100
        ];
    }
}
