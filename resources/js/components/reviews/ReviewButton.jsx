import React, { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import reviewService from "../../services/reviewService";

const ReviewButton = ({ appointment, userType = "client" }) => {
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(false);

    const canReview = appointment.status === "paid" && !hasUserReviewed();
    const reviewType =
        userType === "client" ? "client_to_provider" : "provider_to_client";

    function hasUserReviewed() {
        // This would be populated from the appointment data
        if (userType === "client") {
            return appointment.client_review_submitted || false;
        } else {
            return appointment.provider_review_submitted || false;
        }
    }

    const handleReviewSubmitted = (review) => {
        setReviewData(review);
        // Optionally refresh appointment data
        window.location.reload(); // Simple refresh, or use proper state management
    };

    const loadReviews = async () => {
        setLoading(true);
        try {
            const result = await reviewService.getAppointmentReviews(
                appointment.id
            );
            if (result.success) {
                setReviewData(result.data);
            }
        } catch (error) {
            console.error("Failed to load reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (appointment.status === "paid") {
            loadReviews();
        }
    }, [appointment.id, appointment.status]);

    if (appointment.status !== "paid") {
        return null;
    }

    if (hasUserReviewed()) {
        return (
            <span className="badge bg-success">
                <i className="fas fa-star me-1"></i>
                Review Submitted
            </span>
        );
    }

    return (
        <>
            <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => setShowReviewModal(true)}
                disabled={loading}
            >
                <i className="fas fa-star me-1"></i>
                {loading ? "Loading..." : "Write Review"}
            </button>

            {showReviewModal && (
                <ReviewModal
                    appointment={appointment}
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onReviewSubmitted={handleReviewSubmitted}
                    reviewType={reviewType}
                />
            )}
        </>
    );
};

export default ReviewButton;
