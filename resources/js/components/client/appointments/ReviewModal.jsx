import React, { useState } from "react";
import appointmentService from "../../../services/appointmentService";

const ReviewModal = ({ show, onHide, appointment, onReviewSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [reviewData, setReviewData] = useState({
        provider_rating: 0,
        service_rating: 0,
        provider_review: "",
        service_review: "",
        would_recommend: true,
        review_images: [],
        quality_rating: 0,
        punctuality_rating: 0,
        communication_rating: 0,
        value_rating: 0,
    });
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState([]);

    // Star rating component
    const StarRating = ({
        rating,
        setRating,
        size = "lg",
        label,
        disabled = false,
    }) => {
        const [hoverRating, setHoverRating] = useState(0);

        return (
            <div className="star-rating">
                {label && (
                    <label className="form-label fw-semibold">{label}</label>
                )}
                <div className="stars d-flex">
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
                            } ${disabled ? "" : "cursor-pointer"}`}
                            onClick={() => !disabled && setRating(star)}
                            onMouseEnter={() =>
                                !disabled && setHoverRating(star)
                            }
                            onMouseLeave={() => !disabled && setHoverRating(0)}
                            style={{ marginRight: "4px" }}
                        ></i>
                    ))}
                    <span className="ms-2 text-muted">
                        {rating > 0
                            ? `${rating} star${rating > 1 ? "s" : ""}`
                            : "No rating"}
                    </span>
                </div>
            </div>
        );
    };

    const handleInputChange = (field, value) => {
        setReviewData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + reviewData.review_images.length > 5) {
            setErrors({ images: "Maximum 5 images allowed" });
            return;
        }

        // Validate file types and sizes
        const validFiles = [];
        const invalidFiles = [];

        files.forEach((file) => {
            if (!file.type.startsWith("image/")) {
                invalidFiles.push(file.name + " (not an image)");
            } else if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                invalidFiles.push(file.name + " (file too large)");
            } else {
                validFiles.push(file);
            }
        });

        if (invalidFiles.length > 0) {
            setErrors({ images: `Invalid files: ${invalidFiles.join(", ")}` });
            return;
        }

        // Create preview URLs
        const newPreviews = validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name,
        }));

        setImagePreview((prev) => [...prev, ...newPreviews]);
        setReviewData((prev) => ({
            ...prev,
            review_images: [...prev.review_images, ...validFiles],
        }));
        setErrors((prev) => ({ ...prev, images: null }));
    };

    const removeImage = (index) => {
        const newPreviews = imagePreview.filter((_, i) => i !== index);
        const newImages = reviewData.review_images.filter(
            (_, i) => i !== index
        );

        // Revoke URL to prevent memory leaks
        URL.revokeObjectURL(imagePreview[index].url);

        setImagePreview(newPreviews);
        setReviewData((prev) => ({ ...prev, review_images: newImages }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (reviewData.provider_rating === 0) {
            newErrors.provider_rating = "Please rate the provider";
        }

        if (reviewData.service_rating === 0) {
            newErrors.service_rating = "Please rate the service";
        }

        if (reviewData.provider_review.trim().length < 10) {
            newErrors.provider_review =
                "Please write at least 10 characters about the provider";
        }

        if (reviewData.provider_review.length > 1000) {
            newErrors.provider_review =
                "Provider review cannot exceed 1000 characters";
        }

        if (reviewData.service_review.length > 1000) {
            newErrors.service_review =
                "Service review cannot exceed 1000 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleSubmitReview = async () => {
    //     if (!validateForm()) return;

    //     setLoading(true);
    //     try {
    //         // Calculate overall rating (average of provider and service ratings)
    //         const overallRating = Math.round(
    //             (reviewData.provider_rating + reviewData.service_rating) / 2
    //         );

    //         const submitData = {
    //             ...reviewData,
    //             overall_rating: overallRating,
    //             appointment_id: appointment.id,
    //         };

    //         const result = await appointmentService.submitReview(
    //             appointment.id,
    //             submitData
    //         );

    //         if (result.success) {
    //             onReviewSuccess(result.data);
    //             onHide();
    //             alert(
    //                 "Review submitted successfully! Thank you for your feedback."
    //             );
    //         } else {
    //             setErrors({
    //                 general: result.message || "Failed to submit review",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Review submission failed:", error);
    //         setErrors({
    //             general: "Failed to submit review. Please try again.",
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleSubmitReview = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Match your appointmentService.submitReview() method signature
            const submitData = {
                rating: reviewData.provider_rating,
                comment: reviewData.provider_review,
                serviceRating: reviewData.service_rating,
                serviceComment: reviewData.service_review,
                images: reviewData.review_images,
                wouldRecommend: reviewData.would_recommend,
                // Include all the detailed ratings
                quality_rating: reviewData.quality_rating,
                punctuality_rating: reviewData.punctuality_rating,
                communication_rating: reviewData.communication_rating,
                value_rating: reviewData.value_rating,
            };

            const result = await appointmentService.submitReview(
                appointment.id,
                submitData
            );

            if (result.success) {
                onReviewSuccess(result.data);
                onHide();
                alert(
                    "Review submitted successfully! Thank you for your feedback."
                );
            } else {
                setErrors({
                    general: result.message || "Failed to submit review",
                });
            }
        } catch (error) {
            console.error("Review submission failed:", error);
            setErrors({
                general: "Failed to submit review. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            // Clean up image preview URLs
            imagePreview.forEach((preview) => URL.revokeObjectURL(preview.url));

            setReviewData({
                provider_rating: 0,
                service_rating: 0,
                provider_review: "",
                service_review: "",
                would_recommend: true,
                review_images: [],
                quality_rating: 0,
                punctuality_rating: 0,
                communication_rating: 0,
                value_rating: 0,
            });
            setImagePreview([]);
            setErrors({});
            onHide();
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1040 }}
            ></div>

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
                            {/* General Error */}
                            {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
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
                                            {appointment.formatted_date_time}
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

                            <div className="row">
                                {/* Left Column - Ratings */}
                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">
                                        Rate Your Experience
                                    </h6>

                                    {/* Overall Provider Rating */}
                                    <div className="mb-4">
                                        <StarRating
                                            rating={reviewData.provider_rating}
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "provider_rating",
                                                    rating
                                                )
                                            }
                                            label="Overall Provider Rating *"
                                        />
                                        {errors.provider_rating && (
                                            <div className="text-danger small mt-1">
                                                {errors.provider_rating}
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Quality Rating */}
                                    <div className="mb-4">
                                        <StarRating
                                            rating={reviewData.service_rating}
                                            setRating={(rating) =>
                                                handleInputChange(
                                                    "service_rating",
                                                    rating
                                                )
                                            }
                                            label="Service Quality Rating *"
                                        />
                                        {errors.service_rating && (
                                            <div className="text-danger small mt-1">
                                                {errors.service_rating}
                                            </div>
                                        )}
                                    </div>

                                    {/* Detailed Ratings */}
                                    <h6 className="fw-bold mb-3">
                                        Detailed Ratings
                                    </h6>

                                    <div className="detailed-ratings">
                                        <div className="mb-3">
                                            <StarRating
                                                rating={
                                                    reviewData.quality_rating
                                                }
                                                setRating={(rating) =>
                                                    handleInputChange(
                                                        "quality_rating",
                                                        rating
                                                    )
                                                }
                                                label="Work Quality"
                                                size="sm"
                                            />
                                        </div>

                                        <div className="mb-3">
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
                                        </div>

                                        <div className="mb-3">
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
                                        </div>

                                        <div className="mb-3">
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
                                        </div>
                                    </div>

                                    {/* Recommendation */}
                                    <div className="recommendation-section">
                                        <h6 className="fw-bold mb-3">
                                            Would you recommend?
                                        </h6>
                                        <div className="form-check form-check-inline">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="recommendation"
                                                id="recommend_yes"
                                                value={true}
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
                                                value={false}
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

                                {/* Right Column - Written Reviews */}
                                <div className="col-md-6">
                                    <h6 className="fw-bold mb-3">
                                        Write Your Review
                                    </h6>

                                    {/* Provider Review */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Provider Review *
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                errors.provider_review
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="4"
                                            placeholder="How was your experience with the provider? Were they professional, punctual, and courteous?"
                                            value={reviewData.provider_review}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "provider_review",
                                                    e.target.value
                                                )
                                            }
                                            maxLength="1000"
                                            disabled={loading}
                                        ></textarea>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            {errors.provider_review ? (
                                                <div className="text-danger small">
                                                    {errors.provider_review}
                                                </div>
                                            ) : (
                                                <small className="text-muted">
                                                    Minimum 10 characters
                                                </small>
                                            )}
                                            <small className="text-muted">
                                                {
                                                    reviewData.provider_review
                                                        .length
                                                }
                                                /1000
                                            </small>
                                        </div>
                                    </div>

                                    {/* Service Review */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Service Review
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                errors.service_review
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="4"
                                            placeholder="How was the quality of the service? Did it meet your expectations?"
                                            value={reviewData.service_review}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "service_review",
                                                    e.target.value
                                                )
                                            }
                                            maxLength="1000"
                                            disabled={loading}
                                        ></textarea>
                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                            {errors.service_review ? (
                                                <div className="text-danger small">
                                                    {errors.service_review}
                                                </div>
                                            ) : (
                                                <small className="text-muted">
                                                    Optional
                                                </small>
                                            )}
                                            <small className="text-muted">
                                                {
                                                    reviewData.service_review
                                                        .length
                                                }
                                                /1000
                                            </small>
                                        </div>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold">
                                            Add Photos (Optional)
                                        </label>
                                        <div className="photo-upload-area">
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="form-control"
                                                disabled={
                                                    loading ||
                                                    reviewData.review_images
                                                        .length >= 5
                                                }
                                            />
                                            <small className="text-muted">
                                                Upload up to 5 images (max 5MB
                                                each). Show the quality of work!
                                            </small>
                                            {errors.images && (
                                                <div className="text-danger small mt-1">
                                                    {errors.images}
                                                </div>
                                            )}
                                        </div>

                                        {/* Image Previews */}
                                        {imagePreview.length > 0 && (
                                            <div className="image-previews mt-3">
                                                <div className="row g-2">
                                                    {imagePreview.map(
                                                        (preview, index) => (
                                                            <div
                                                                key={index}
                                                                className="col-4"
                                                            >
                                                                <div className="position-relative">
                                                                    <img
                                                                        src={
                                                                            preview.url
                                                                        }
                                                                        alt={`Preview ${
                                                                            index +
                                                                            1
                                                                        }`}
                                                                        className="img-fluid rounded"
                                                                        style={{
                                                                            height: "80px",
                                                                            width: "100%",
                                                                            objectFit:
                                                                                "cover",
                                                                        }}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger position-absolute top-0 end-0"
                                                                        style={{
                                                                            transform:
                                                                                "translate(25%, -25%)",
                                                                            borderRadius:
                                                                                "50%",
                                                                            width: "25px",
                                                                            height: "25px",
                                                                            padding:
                                                                                "0",
                                                                        }}
                                                                        onClick={() =>
                                                                            removeImage(
                                                                                index
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            loading
                                                                        }
                                                                    >
                                                                        <i className="fas fa-times small"></i>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Guidelines */}
                                    <div className="review-guidelines bg-info bg-opacity-10 rounded p-3">
                                        <h6 className="fw-bold text-info mb-2">
                                            <i className="fas fa-info-circle me-2"></i>
                                            Review Guidelines
                                        </h6>
                                        <ul className="mb-0 small text-info">
                                            <li>
                                                Be honest and specific about
                                                your experience
                                            </li>
                                            <li>
                                                Include details about service
                                                quality and professionalism
                                            </li>
                                            <li>
                                                Mention if the service was
                                                completed on time
                                            </li>
                                            <li>
                                                Be constructive - help other
                                                clients make informed decisions
                                            </li>
                                            <li>
                                                Avoid personal information or
                                                offensive language
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-success"
                                onClick={handleSubmitReview}
                                disabled={
                                    loading ||
                                    reviewData.provider_rating === 0 ||
                                    reviewData.service_rating === 0
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
                .image-previews .position-relative:hover .btn {
                    opacity: 1;
                }
                .image-previews .btn {
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                }
            `}</style>
        </>
    );
};

export default ReviewModal;
