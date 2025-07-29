import React, { useState, useEffect } from "react";
import ReviewModal from "./ReviewModal";
import reviewService from "../../services/reviewService";

const ReviewButton = ({ appointment, userType = "client", onReviewSubmitted }) => {
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
        setShowReviewModal(false); // Close modal first
        // Use parent callback if provided, otherwise reload page
        if (onReviewSubmitted) {
            onReviewSubmitted(review);
        } else {
            window.location.reload();
        }
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

    // Handle body scroll when modal is open
    useEffect(() => {
        if (showReviewModal) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('modal-open');
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
            document.body.classList.remove('modal-open');
        };
    }, [showReviewModal]);

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
                className={`btn ${userType === 'provider' ? 'btn-warning' : 'btn-outline-warning'} ${userType === 'provider' ? '' : 'btn-sm'}`}
                onClick={() => setShowReviewModal(true)}
                disabled={loading}
            >
                <i className="fas fa-star me-2"></i>
                {loading ? "Loading..." : "Write Review"}
            </button>

            <ReviewModal
                appointment={appointment}
                isOpen={showReviewModal}
                onClose={() => {
                    setShowReviewModal(false);
                }}
                onReviewSubmitted={handleReviewSubmitted}
                reviewType={reviewType}
            />
        </>
    );
};

export default ReviewButton;
