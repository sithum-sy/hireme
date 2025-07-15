import React, { useState } from "react";
import reviewService from "../../../services/reviewService";
import clientAppointmentService from "../../../services/clientAppointmentService";

const StarRating = ({
    rating,
    setRating,
    size = "lg",
    label,
    disabled = false,
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div className="star-rating mb-3">
            {label && <label className="form-label fw-semibold">{label}</label>}
            <div className="stars d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={`fas fa-star ${
                            size === "sm"
                                ? "fa-sm"
                                : size === "lg"
                                ? "fa-lg"
                                : ""
                        } ${
                            star <= (hoverRating || rating)
                                ? "text-warning"
                                : "text-muted"
                        } ${disabled ? "" : "cursor-pointer"} me-1`}
                        onClick={() => !disabled && setRating(star)}
                        onMouseEnter={() => !disabled && setHoverRating(star)}
                        onMouseLeave={() => !disabled && setHoverRating(0)}
                        style={{ cursor: disabled ? "default" : "pointer" }}
                    ></i>
                ))}
                <span className="ms-2 text-muted small">
                    {rating > 0
                        ? `${rating} star${rating > 1 ? "s" : ""}`
                        : "No rating"}
                </span>
            </div>
        </div>
    );
};

const ReviewModal = ({ show, onHide, appointment, onReviewSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reviewData, setReviewData] = useState({
        rating: 0,
        comment: "",
        quality_rating: 0,
        punctuality_rating: 0,
        communication_rating: 0,
        value_rating: 0,
        would_recommend: true,
        review_images: [],
    });

    const handleInputChange = (field, value) => {
        setReviewData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts making changes
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (reviewData.rating === 0) {
            setError("Please provide a rating for the service");
            return;
        }

        if (reviewData.comment && reviewData.comment.length < 10) {
            setError("Review comment must be at least 10 characters");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await clientAppointmentService.submitReview(
                appointment.id,
                reviewData
            );

            if (result.success) {
                onReviewSuccess(result.data);
                handleClose();
                alert(
                    "Review submitted successfully! Thank you for your feedback."
                );
            } else {
                setError(result.message || "Failed to submit review");
            }
        } catch (error) {
            console.error("Review submission failed:", error);
            setError("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setReviewData({
                rating: 0,
                comment: "",
                quality_rating: 0,
                punctuality_rating: 0,
                communication_rating: 0,
                value_rating: 0,
                would_recommend: true,
                review_images: [],
            });
            setError("");
            onHide();
        }
    };

    const getReviewGuidelines = () => [
        "Be honest and specific about your experience",
        "Include details about service quality and professionalism",
        "Mention if the service was completed on time",
        "Be constructive - help other clients make informed decisions",
        "Avoid personal information or offensive language",
    ];

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div className="modal-backdrop fade show"></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{ zIndex: 1050 }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5 className="modal-title fw-bold text-success">
                                    <i className="fas fa-star me-2"></i>
                                    Write a Review
                                </h5>
                                <p className="text-muted mb-0 small">
                                    Share your experience with{" "}
                                    {appointment.service?.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                                disabled={loading}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Error Display */}
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Service Summary */}
                            <div className="service-summary bg-light rounded p-3 mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-1">
                                            {appointment.service?.title}
                                        </h6>
                                        <div className="text-muted small mb-1">
                                            Provider:{" "}
                                            {appointment.provider?.first_name}{" "}
                                            {appointment.provider?.last_name}
                                        </div>
                                        <div className="text-muted small">
                                            Completed on:{" "}
                                            {appointment.appointment_date} at{" "}
                                            {appointment.appointment_time}
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <div className="fw-bold text-success h5 mb-0">
                                            Rs. {appointment.total_price}
                                        </div>
                                        <span className="badge bg-success">
                                            Completed
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Left Column - Ratings */}
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">
                                            Rate Your Experience
                                        </h6>

                                        {/* Overall Rating */}
                                        <StarRating
                                            rating={reviewData.rating}
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "rating",
                                                    rating
                                                )
                                            }
                                            label="Overall Rating *"
                                        />

                                        {/* Detailed Ratings */}
                                        <h6 className="fw-bold mb-3 mt-4">
                                            Detailed Ratings
                                        </h6>

                                        <StarRating
                                            rating={reviewData.quality_rating}
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "quality_rating",
                                                    rating
                                                )
                                            }
                                            label="Work Quality"
                                            size="sm"
                                        />

                                        <StarRating
                                            rating={
                                                reviewData.punctuality_rating
                                            }
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "punctuality_rating",
                                                    rating
                                                )
                                            }
                                            label="Punctuality"
                                            size="sm"
                                        />

                                        <StarRating
                                            rating={
                                                reviewData.communication_rating
                                            }
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "communication_rating",
                                                    rating
                                                )
                                            }
                                            label="Communication"
                                            size="sm"
                                        />

                                        <StarRating
                                            rating={reviewData.value_rating}
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "value_rating",
                                                    rating
                                                )
                                            }
                                            label="Value for Money"
                                            size="sm"
                                        />

                                        {/* Recommendation */}
                                        <div className="recommendation-section mt-4">
                                            <h6 className="fw-bold mb-3">
                                                Would you recommend?
                                            </h6>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="recommendation"
                                                    id="recommend_yes"
                                                    checked={
                                                        reviewData.would_recommend ===
                                                        true
                                                    }
                                                    onChange={() =>
                                                        handleInputChange(
                                                            "would_recommend",
                                                            true
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="recommend_yes"
                                                >
                                                    <i className="fas fa-thumbs-up text-success me-1"></i>
                                                    Yes, I'd recommend
                                                </label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="recommendation"
                                                    id="recommend_no"
                                                    checked={
                                                        reviewData.would_recommend ===
                                                        false
                                                    }
                                                    onChange={() =>
                                                        handleInputChange(
                                                            "would_recommend",
                                                            false
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="recommend_no"
                                                >
                                                    <i className="fas fa-thumbs-down text-danger me-1"></i>
                                                    No, I wouldn't recommend
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Written Review */}
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-3">
                                            Write Your Review
                                        </h6>

                                        {/* Review Comment */}
                                        <div className="mb-4">
                                            <label className="form-label fw-semibold">
                                                Review Comment
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="6"
                                                placeholder="How was your experience? Share details about the service quality, professionalism, and overall satisfaction..."
                                                value={reviewData.comment}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "comment",
                                                        e.target.value
                                                    )
                                                }
                                                maxLength="1000"
                                                disabled={loading}
                                            ></textarea>
                                            <div className="d-flex justify-content-between align-items-center mt-1">
                                                <small className="text-muted">
                                                    {reviewData.comment.length <
                                                    10
                                                        ? "Minimum 10 characters recommended"
                                                        : "Great!"}
                                                </small>
                                                <small className="text-muted">
                                                    {reviewData.comment.length}
                                                    /1000
                                                </small>
                                            </div>
                                        </div>

                                        {/* Review Guidelines */}
                                        <div className="review-guidelines bg-info bg-opacity-10 rounded p-3 mb-4">
                                            <h6 className="fw-bold text-info mb-2">
                                                <i className="fas fa-info-circle me-2"></i>
                                                Review Guidelines
                                            </h6>
                                            <ul className="mb-0 small text-info">
                                                {getReviewGuidelines().map(
                                                    (guideline, index) => (
                                                        <li key={index}>
                                                            {guideline}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>

                                        {/* Photo Upload Placeholder */}
                                        <div className="photo-upload-placeholder bg-light rounded p-3 text-center">
                                            <i className="fas fa-camera fa-2x text-muted mb-2"></i>
                                            <p className="text-muted mb-0 small">
                                                Photo upload feature coming
                                                soon!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer border-top mt-4">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success"
                                        disabled={
                                            loading || reviewData.rating === 0
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Submitting Review...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-star me-2"></i>
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
                .cursor-pointer {
                    cursor: pointer;
                }
                .stars {
                    gap: 2px;
                }
                .star-rating {
                    margin-bottom: 1rem;
                }
            `}</style>
        </>
    );
};

export default ReviewModal;
