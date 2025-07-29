<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Appointment;
use App\Services\ReviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    protected $reviewService;

    public function __construct(ReviewService $reviewService)
    {
        $this->reviewService = $reviewService;
    }

    /**
     * Submit review for appointment (both client and provider can use this)
     */
    public function submitReview(Request $request, Appointment $appointment)
    {
        \Log::info('Review submission attempt', [
            'appointment_id' => $appointment->id,
            'user_id' => Auth::id(),
            'request_data' => $request->all(),
            'appointment_status' => $appointment->status,
            'appointment_client_id' => $appointment->client_id,
            'appointment_provider_id' => $appointment->provider_id
        ]);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'quality_rating' => 'nullable|integer|min:1|max:5',
            'punctuality_rating' => 'nullable|integer|min:1|max:5',
            'communication_rating' => 'nullable|integer|min:1|max:5',
            'value_rating' => 'nullable|integer|min:1|max:5',
            'would_recommend' => 'nullable|boolean'
        ]);

        $user = Auth::user();

        // Determine review type and validate permissions
        if ($appointment->client_id === $user->id) {
            $reviewType = Review::TYPE_CLIENT_TO_PROVIDER;
            $revieweeId = $appointment->provider_id;
        } elseif ($appointment->provider_id === $user->id) {
            $reviewType = Review::TYPE_PROVIDER_TO_CLIENT;
            $revieweeId = $appointment->client_id;
        } else {
            return response()->json([
                'success' => false,
                'message' => 'You are not authorized to review this appointment'
            ], 403);
        }

        // Check if appointment can be reviewed
        $canReview = $this->canReviewAppointment($appointment, $user->id, $reviewType);
        \Log::info('Review permission check', [
            'can_review' => $canReview,
            'review_type' => $reviewType,
            'appointment_id' => $appointment->id,
            'user_id' => $user->id
        ]);
        
        if (!$canReview) {
            return response()->json([
                'success' => false,
                'message' => 'This appointment cannot be reviewed at this time'
            ], 400);
        }

        try {
            $reviewData = [
                'rating' => $request->rating,
                'comment' => $request->comment,
                'quality_rating' => $request->quality_rating,
                'punctuality_rating' => $request->punctuality_rating,
                'communication_rating' => $request->communication_rating,
                'value_rating' => $request->value_rating,
                'would_recommend' => $request->would_recommend
            ];

            $review = $this->reviewService->submitMutualReview(
                $appointment,
                $user,
                $revieweeId,
                $reviewType,
                $reviewData
            );

            return response()->json([
                'success' => true,
                'data' => $review,
                'message' => 'Review submitted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get reviews for appointment
     */
    public function getAppointmentReviews(Appointment $appointment)
    {
        $user = Auth::user();

        if ($appointment->client_id !== $user->id && $appointment->provider_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $reviews = Review::where('appointment_id', $appointment->id)
            ->with(['reviewer', 'reviewee'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'client_review' => $reviews->where('review_type', Review::TYPE_CLIENT_TO_PROVIDER)->first(),
                'provider_review' => $reviews->where('review_type', Review::TYPE_PROVIDER_TO_CLIENT)->first(),
                'can_review_as_client' => $this->canReviewAppointment($appointment, $user->id, Review::TYPE_CLIENT_TO_PROVIDER),
                'can_review_as_provider' => $this->canReviewAppointment($appointment, $user->id, Review::TYPE_PROVIDER_TO_CLIENT)
            ]
        ]);
    }

    /**
     * Check if user can review appointment
     */
    private function canReviewAppointment(Appointment $appointment, $userId, $reviewType)
    {
        // Appointment must be paid
        if ($appointment->status !== Appointment::STATUS_PAID) {
            \Log::info('Review blocked: appointment not paid', [
                'appointment_id' => $appointment->id,
                'status' => $appointment->status,
                'required_status' => Appointment::STATUS_PAID
            ]);
            return false;
        }

        // Check if user is authorized for this review type
        if ($reviewType === Review::TYPE_CLIENT_TO_PROVIDER && $appointment->client_id !== $userId) {
            \Log::info('Review blocked: not client', [
                'appointment_id' => $appointment->id,
                'user_id' => $userId,
                'client_id' => $appointment->client_id,
                'review_type' => $reviewType
            ]);
            return false;
        }

        if ($reviewType === Review::TYPE_PROVIDER_TO_CLIENT && $appointment->provider_id !== $userId) {
            \Log::info('Review blocked: not provider', [
                'appointment_id' => $appointment->id,
                'user_id' => $userId,
                'provider_id' => $appointment->provider_id,
                'review_type' => $reviewType
            ]);
            return false;
        }

        // Check if review already exists
        $existingReview = Review::where('appointment_id', $appointment->id)
            ->where('reviewer_id', $userId)
            ->where('review_type', $reviewType)
            ->exists();

        if ($existingReview) {
            \Log::info('Review blocked: already exists', [
                'appointment_id' => $appointment->id,
                'user_id' => $userId,
                'review_type' => $reviewType
            ]);
            return false;
        }

        \Log::info('Review allowed', [
            'appointment_id' => $appointment->id,
            'user_id' => $userId,
            'review_type' => $reviewType
        ]);

        return true;
    }
}
