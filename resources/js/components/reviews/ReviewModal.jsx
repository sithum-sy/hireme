import React, { useState } from "react";
import StarRating from "./StarRating";
import reviewService from "../../services/reviewService";

const ReviewModal = ({
    appointment,
    isOpen,
    onClose,
    onReviewSubmitted,
    reviewType = "client_to_provider", // or 'provider_to_client'
}) => {
    const [formData, setFormData] = useState({
        rating: 0,
        comment: "",
        quality_rating: 0,
        punctuality_rating: 0,
        communication_rating: 0,
        value_rating: 0,
        would_recommend: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isClientReview = reviewType === "client_to_provider";

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.rating === 0) {
            setError("Please provide an overall rating");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await reviewService.submitReview(
                appointment.id,
                formData
            );

            if (result.success) {
                onReviewSubmitted(result.data);
                onClose();
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (field, rating) => {
        setFormData((prev) => ({ ...prev, [field]: rating }));
        if (error) setError("");
    };

    if (!isOpen) return null;

    const reviewTarget = isClientReview ? "provider" : "client";
    const targetName = isClientReview
        ? `${appointment.provider?.first_name} ${appointment.provider?.last_name}`
        : `${appointment.client?.first_name} ${appointment.client?.last_name}`;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title d-flex align-items-center">
                                <i className="fas fa-star text-warning me-2"></i>
                                Rate & Review{" "}
                                {isClientReview ? "Service" : "Client"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={loading}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Appointment Summary */}
                            <div className="appointment-summary bg-light rounded p-3 mb-4">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-1">
                                            {appointment.service?.title}
                                        </h6>
                                        <div className="text-muted small">
                                            <i className="fas fa-calendar me-1"></i>
                                            {new Date(
                                                appointment.appointment_date
                                            ).toLocaleDateString()}
                                            <i className="fas fa-clock ms-2 me-1"></i>
                                            {appointment.appointment_time}
                                        </div>
                                        <div className="text-muted small mt-1">
                                            <i className="fas fa-user me-1"></i>
                                            {reviewType === "client_to_provider"
                                                ? "Provider"
                                                : "Client"}
                                            : {targetName}
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <div className="fw-bold text-success h5 mb-0">
                                            Rs.{" "}
                                            {appointment.total_price?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Overall Rating */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        Overall Rating *
                                    </label>
                                    <div className="d-flex align-items-center gap-3">
                                        <StarRating
                                            rating={formData.rating}
                                            onRatingChange={(rating) =>
                                                handleRatingChange(
                                                    "rating",
                                                    rating
                                                )
                                            }
                                            size="lg"
                                            showNumber={false}
                                        />
                                        <span className="text-muted">
                                            {formData.rating === 0
                                                ? "Select rating"
                                                : formData.rating === 1
                                                ? "Poor"
                                                : formData.rating === 2
                                                ? "Fair"
                                                : formData.rating === 3
                                                ? "Good"
                                                : formData.rating === 4
                                                ? "Very Good"
                                                : "Excellent"}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Ratings (for client reviews) */}
                                {isClientReview && (
                                    <div className="detailed-ratings mb-4">
                                        <h6 className="fw-semibold mb-3">
                                            Detailed Ratings
                                        </h6>
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label small">
                                                    Service Quality
                                                </label>
                                                <StarRating
                                                    rating={
                                                        formData.quality_rating
                                                    }
                                                    onRatingChange={(rating) =>
                                                        handleRatingChange(
                                                            "quality_rating",
                                                            rating
                                                        )
                                                    }
                                                    size="sm"
                                                    showNumber={false}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">
                                                    Punctuality
                                                </label>
                                                <StarRating
                                                    rating={
                                                        formData.punctuality_rating
                                                    }
                                                    onRatingChange={(rating) =>
                                                        handleRatingChange(
                                                            "punctuality_rating",
                                                            rating
                                                        )
                                                    }
                                                    size="sm"
                                                    showNumber={false}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">
                                                    Communication
                                                </label>
                                                <StarRating
                                                    rating={
                                                        formData.communication_rating
                                                    }
                                                    onRatingChange={(rating) =>
                                                        handleRatingChange(
                                                            "communication_rating",
                                                            rating
                                                        )
                                                    }
                                                    size="sm"
                                                    showNumber={false}
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label small">
                                                    Value for Money
                                                </label>
                                                <StarRating
                                                    rating={
                                                        formData.value_rating
                                                    }
                                                    onRatingChange={(rating) =>
                                                        handleRatingChange(
                                                            "value_rating",
                                                            rating
                                                        )
                                                    }
                                                    size="sm"
                                                    showNumber={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Written Review */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <i className="fas fa-comment me-1"></i>
                                        Written Review
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder={
                                            isClientReview
                                                ? "Share your experience with this service provider..."
                                                : "Share your experience working with this client..."
                                        }
                                        value={formData.comment}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                comment: e.target.value,
                                            }))
                                        }
                                        disabled={loading}
                                        maxLength="1000"
                                    />
                                    <small className="text-muted">
                                        {formData.comment.length}/1000
                                        characters
                                    </small>
                                </div>

                                {/* Recommendation (for client reviews) */}
                                {isClientReview && (
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Would you recommend this{" "}
                                            {reviewTarget}?
                                        </label>
                                        <div className="d-flex gap-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="would_recommend"
                                                    id="recommend_yes"
                                                    checked={
                                                        formData.would_recommend ===
                                                        true
                                                    }
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            would_recommend: true,
                                                        }))
                                                    }
                                                    disabled={loading}
                                                />
                                                <label
                                                    className="form-check-label text-success"
                                                    htmlFor="recommend_yes"
                                                >
                                                    <i className="fas fa-thumbs-up me-1"></i>
                                                    Yes, I recommend
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="would_recommend"
                                                    id="recommend_no"
                                                    checked={
                                                        formData.would_recommend ===
                                                        false
                                                    }
                                                    onChange={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            would_recommend: false,
                                                        }))
                                                    }
                                                    disabled={loading}
                                                />
                                                <label
                                                    className="form-check-label text-danger"
                                                    htmlFor="recommend_no"
                                                >
                                                    <i className="fas fa-thumbs-down me-1"></i>
                                                    No, I don't recommend
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary flex-fill"
                                        disabled={
                                            loading || formData.rating === 0
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .star-interactive:hover {
                    transform: scale(1.1);
                }
                .detailed-ratings .star-rating {
                    justify-content: flex-start;
                }
            `}</style>
        </>
    );
};

export default ReviewModal;
