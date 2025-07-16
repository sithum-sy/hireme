<?php
// app/Services/ReviewService.php - Complete version with missing methods

namespace App\Services;

use App\Models\Review;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Service;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
                'service_id' => $appointment->service_id,
                'review_type' => $reviewType,
                'rating' => $reviewData['rating'],
                'comment' => $reviewData['comment'] ?? null,
                'quality_rating' => $reviewData['quality_rating'] ?? null,
                'punctuality_rating' => $reviewData['punctuality_rating'] ?? null,
                'communication_rating' => $reviewData['communication_rating'] ?? null,
                'value_rating' => $reviewData['value_rating'] ?? null,
                'would_recommend' => $reviewData['would_recommend'] ?? null,
                'review_images' => $reviewData['review_images'] ?? null,
                'status' => 'published',
                'is_verified' => true // Since it's from a completed appointment
            ]);

            // Update ratings based on review type
            if ($reviewType === Review::TYPE_CLIENT_TO_PROVIDER) {
                $this->updateProviderRating($revieweeId);
                $this->updateServiceRating($appointment->service_id);
            } else {
                $this->updateClientRating($revieweeId);
            }

            // Check if both reviews are complete
            $this->checkAndMarkAppointmentReviewed($appointment);

            return $review;
        });
    }

    /**
     * Submit mutual review (enhanced version)
     */
    public function submitMutualReview(Appointment $appointment, User $reviewer, $revieweeId, $reviewType, array $reviewData)
    {
        // Check if appointment is paid
        if ($appointment->status !== Appointment::STATUS_PAID) {
            throw new \Exception('Reviews can only be submitted for paid appointments');
        }

        // Check if review already exists
        $existingReview = Review::where('appointment_id', $appointment->id)
            ->where('reviewer_id', $reviewer->id)
            ->where('review_type', $reviewType)
            ->first();

        if ($existingReview) {
            throw new \Exception('Review already submitted for this appointment');
        }

        return DB::transaction(function () use ($appointment, $reviewer, $revieweeId, $reviewType, $reviewData) {
            $review = Review::create([
                'appointment_id' => $appointment->id,
                'reviewer_id' => $reviewer->id,
                'reviewee_id' => $revieweeId,
                'service_id' => $appointment->service_id,
                'review_type' => $reviewType,
                'rating' => $reviewData['rating'],
                'comment' => $reviewData['comment'] ?? null,

                // Detailed ratings
                'quality_rating' => $reviewData['quality_rating'] ?? null,
                'punctuality_rating' => $reviewData['punctuality_rating'] ?? null,
                'communication_rating' => $reviewData['communication_rating'] ?? null,
                'value_rating' => $reviewData['value_rating'] ?? null,

                'would_recommend' => $reviewData['would_recommend'] ?? null,
                'status' => 'published',
                'is_verified' => true,
            ]);

            // Update ratings based on review type
            if ($reviewType === Review::TYPE_CLIENT_TO_PROVIDER) {
                $this->updateProviderRating($revieweeId);
                $this->updateServiceRating($appointment->service_id);
            } else {
                $this->updateClientRating($revieweeId);
            }

            // Check if both reviews are complete to mark appointment as fully reviewed
            $this->checkAndMarkAppointmentReviewed($appointment);

            return $review;
        });
    }

    /**
     * Update provider's average rating and detailed ratings
     */
    private function updateProviderRating($providerId)
    {
        try {
            $provider = User::find($providerId);
            if (!$provider || !$provider->providerProfile) {
                Log::warning("Provider or provider profile not found for ID: {$providerId}");
                return;
            }

            $reviews = Review::where('reviewee_id', $providerId)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                ->where('is_hidden', false) // ✅ Use your existing field
                ->where('is_verified', true); // ✅ Use your existing field

            $totalReviews = $reviews->count();

            if ($totalReviews === 0) {
                $provider->providerProfile->update([
                    'average_rating' => null,
                    'total_reviews' => 0,
                    'quality_rating' => null,
                    'punctuality_rating' => null,
                    'communication_rating' => null,
                    'value_rating' => null,
                ]);
                return;
            }

            $averageRating = $reviews->avg('rating');
            $qualityAvg = $reviews->whereNotNull('quality_rating')->avg('quality_rating');
            $punctualityAvg = $reviews->whereNotNull('punctuality_rating')->avg('punctuality_rating');
            $communicationAvg = $reviews->whereNotNull('communication_rating')->avg('communication_rating');
            $valueAvg = $reviews->whereNotNull('value_rating')->avg('value_rating');

            $provider->providerProfile->update([
                'average_rating' => round($averageRating, 2),
                'total_reviews' => $totalReviews,
                'quality_rating' => $qualityAvg ? round($qualityAvg, 2) : null,
                'punctuality_rating' => $punctualityAvg ? round($punctualityAvg, 2) : null,
                'communication_rating' => $communicationAvg ? round($communicationAvg, 2) : null,
                'value_rating' => $valueAvg ? round($valueAvg, 2) : null,
            ]);

            Log::info("Updated provider rating for provider {$providerId}");
        } catch (\Exception $e) {
            Log::error("Failed to update provider rating for ID {$providerId}: " . $e->getMessage());
        }
    }

    /**
     * Update service average rating
     */
    private function updateServiceRating($serviceId)
    {
        try {
            $service = Service::find($serviceId);
            if (!$service) {
                Log::warning("Service not found for ID: {$serviceId}");
                return;
            }

            $reviews = Review::where('service_id', $serviceId)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                // ->where('status', 'published');
                ->where('is_hidden', false);

            $totalReviews = $reviews->count();

            if ($totalReviews === 0) {
                // Reset service rating if no reviews
                $service->update([
                    'average_rating' => null,
                    'total_reviews' => 0
                ]);
                return;
            }

            $averageRating = $reviews->avg('rating');

            $service->update([
                'average_rating' => round($averageRating, 2),
                'total_reviews' => $totalReviews
            ]);

            Log::info("Updated service rating for service {$serviceId}", [
                'total_reviews' => $totalReviews,
                'average_rating' => round($averageRating, 2)
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to update service rating for ID {$serviceId}: " . $e->getMessage());
        }
    }

    /**
     * Update client rating (for provider reviews of clients)
     */
    private function updateClientRating($clientId)
    {
        try {
            $client = User::find($clientId);
            if (!$client) {
                Log::warning("Client not found for ID: {$clientId}");
                return;
            }

            $reviews = Review::where('reviewee_id', $clientId)
                ->where('review_type', Review::TYPE_PROVIDER_TO_CLIENT)
                // ->where('status', 'published');
                ->where('is_hidden', false);

            $totalReviews = $reviews->count();
            $averageRating = $totalReviews > 0 ? $reviews->avg('rating') : null;

            // Update client profile with rating
            $client->update([
                'average_rating' => $averageRating ? round($averageRating, 2) : null,
                'total_reviews' => $totalReviews
            ]);

            Log::info("Updated client rating for client {$clientId}", [
                'total_reviews' => $totalReviews,
                'average_rating' => $averageRating ? round($averageRating, 2) : null
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to update client rating for ID {$clientId}: " . $e->getMessage());
        }
    }

    /**
     * Check if both parties have reviewed and mark appointment as fully reviewed
     */
    private function checkAndMarkAppointmentReviewed(Appointment $appointment)
    {
        try {
            $clientReview = Review::where('appointment_id', $appointment->id)
                ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
                ->exists();

            $providerReview = Review::where('appointment_id', $appointment->id)
                ->where('review_type', Review::TYPE_PROVIDER_TO_CLIENT)
                ->exists();

            if ($clientReview && $providerReview) {
                $appointment->update([
                    'status' => Appointment::STATUS_REVIEWED,
                    'reviewed_at' => now()
                ]);

                Log::info("Appointment {$appointment->id} marked as fully reviewed");
            }
        } catch (\Exception $e) {
            Log::error("Failed to check appointment review status for ID {$appointment->id}: " . $e->getMessage());
        }
    }

    /**
     * Get reviews for a provider
     */
    public function getProviderReviews($providerId, $filters = [])
    {
        $query = Review::where('reviewee_id', $providerId)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            // ->where('status', 'published')
            ->where('is_hidden', false)
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
        $reviews = Review::where('reviewee_id', $providerId)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            // ->where('status', 'published');
            ->where('is_hidden', false);

        $totalReviews = $reviews->count();

        if ($totalReviews === 0) {
            return [
                'total_reviews' => 0,
                'average_rating' => 0,
                'rating_breakdown' => [
                    5 => 0,
                    4 => 0,
                    3 => 0,
                    2 => 0,
                    1 => 0
                ],
                'average_quality' => 0,
                'average_punctuality' => 0,
                'average_communication' => 0,
                'average_value' => 0,
                'recommendation_rate' => 0
            ];
        }

        return [
            'total_reviews' => $totalReviews,
            'average_rating' => round($reviews->avg('rating'), 1),
            'rating_breakdown' => [
                5 => $reviews->where('rating', 5)->count(),
                4 => $reviews->where('rating', 4)->count(),
                3 => $reviews->where('rating', 3)->count(),
                2 => $reviews->where('rating', 2)->count(),
                1 => $reviews->where('rating', 1)->count(),
            ],
            'average_quality' => round($reviews->whereNotNull('quality_rating')->avg('quality_rating'), 1),
            'average_punctuality' => round($reviews->whereNotNull('punctuality_rating')->avg('punctuality_rating'), 1),
            'average_communication' => round($reviews->whereNotNull('communication_rating')->avg('communication_rating'), 1),
            'average_value' => round($reviews->whereNotNull('value_rating')->avg('value_rating'), 1),
            'recommendation_rate' => round(($reviews->where('would_recommend', true)->count() / $totalReviews) * 100, 1)
        ];
    }

    /**
     * Get service reviews and statistics
     */
    public function getServiceReviews($serviceId, array $filters = [])
    {
        $query = Review::where('service_id', $serviceId)
            ->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)
            // ->where('status', 'published')
            ->where('is_hidden', false)
            ->with(['reviewer', 'appointment']);

        // Apply filters
        if (isset($filters['rating'])) {
            $query->where('rating', $filters['rating']);
        }

        if (isset($filters['sort_by'])) {
            switch ($filters['sort_by']) {
                case 'recent':
                    $query->orderBy('created_at', 'desc');
                    break;
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                case 'highest_rating':
                    $query->orderBy('rating', 'desc');
                    break;
                case 'lowest_rating':
                    $query->orderBy('rating', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($filters['per_page'] ?? 10);
    }
}
