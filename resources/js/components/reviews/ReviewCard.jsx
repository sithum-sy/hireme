import React from "react";
import StarRating from "./StarRating";
import { formatDate } from "../../utils/formatters";

const ReviewCard = ({ review, showService = false, showClient = false }) => {
    const isClientReview = review.review_type === "client_to_provider";

    return (
        <div className="review-card card border-0 shadow-sm mb-3">
            <div className="card-body">
                {/* Review Header */}
                <div className="review-header d-flex justify-content-between align-items-start mb-3">
                    <div className="reviewer-info d-flex align-items-center">
                        <div className="reviewer-avatar me-3">
                            <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: "40px", height: "40px" }}
                            >
                                <i className="fas fa-user"></i>
                            </div>
                        </div>
                        <div>
                            <div className="reviewer-name fw-semibold">
                                {isClientReview
                                    ? `${review.reviewer?.first_name} ${review.reviewer?.last_name?.[0]}.`
                                    : `${
                                          review.reviewer?.business_name ||
                                          review.reviewer?.first_name
                                      }`}
                            </div>
                            <div className="review-date text-muted small">
                                {formatDate(review.created_at)}
                            </div>
                        </div>
                    </div>

                    <div className="review-rating">
                        <StarRating
                            rating={review.rating}
                            readonly={true}
                            size="sm"
                            showNumber={true}
                        />
                    </div>
                </div>

                {/* Service Info (if showing service) */}
                {showService && review.appointment?.service && (
                    <div className="service-info mb-2">
                        <small className="text-muted">
                            <i className="fas fa-briefcase me-1"></i>
                            {review.appointment.service.title}
                        </small>
                    </div>
                )}

                {/* Review Content */}
                {review.comment && (
                    <div className="review-content mb-3">
                        <p className="mb-0">{review.comment}</p>
                    </div>
                )}

                {/* Detailed Ratings (for client reviews) */}
                {isClientReview &&
                    (review.quality_rating ||
                        review.punctuality_rating ||
                        review.communication_rating ||
                        review.value_rating) && (
                        <div className="detailed-ratings mb-3">
                            <div className="row g-2 text-center">
                                {review.quality_rating && (
                                    <div className="col-3">
                                        <small className="text-muted d-block">
                                            Quality
                                        </small>
                                        <StarRating
                                            rating={review.quality_rating}
                                            readonly={true}
                                            size="sm"
                                            showNumber={false}
                                        />
                                    </div>
                                )}
                                {review.punctuality_rating && (
                                    <div className="col-3">
                                        <small className="text-muted d-block">
                                            Punctuality
                                        </small>
                                        <StarRating
                                            rating={review.punctuality_rating}
                                            readonly={true}
                                            size="sm"
                                            showNumber={false}
                                        />
                                    </div>
                                )}
                                {review.communication_rating && (
                                    <div className="col-3">
                                        <small className="text-muted d-block">
                                            Communication
                                        </small>
                                        <StarRating
                                            rating={review.communication_rating}
                                            readonly={true}
                                            size="sm"
                                            showNumber={false}
                                        />
                                    </div>
                                )}
                                {review.value_rating && (
                                    <div className="col-3">
                                        <small className="text-muted d-block">
                                            Value
                                        </small>
                                        <StarRating
                                            rating={review.value_rating}
                                            readonly={true}
                                            size="sm"
                                            showNumber={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Recommendation Badge */}
                {review.would_recommend !== null && (
                    <div className="recommendation mb-2">
                        <span
                            className={`badge ${
                                review.would_recommend
                                    ? "bg-success"
                                    : "bg-warning"
                            }`}
                        >
                            <i
                                className={`fas ${
                                    review.would_recommend
                                        ? "fa-thumbs-up"
                                        : "fa-thumbs-down"
                                } me-1`}
                            ></i>
                            {review.would_recommend
                                ? "Recommends"
                                : "Does not recommend"}
                        </span>
                    </div>
                )}

                {/* Provider Response */}
                {review.provider_response && (
                    <div className="provider-response mt-3 p-3 bg-light rounded">
                        <div className="d-flex align-items-center mb-2">
                            <div className="provider-avatar me-2">
                                <div
                                    className="rounded-circle bg-orange text-white d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        fontSize: "12px",
                                    }}
                                >
                                    <i className="fas fa-store"></i>
                                </div>
                            </div>
                            <strong className="me-2">Provider Response</strong>
                            <small className="text-muted">
                                {formatDate(review.provider_responded_at)}
                            </small>
                        </div>
                        <p className="mb-0 small">{review.provider_response}</p>
                    </div>
                )}

                {/* Review Actions */}
                <div className="review-actions d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <div className="helpful-section">
                        {review.helpful_count > 0 && (
                            <small className="text-muted">
                                <i className="fas fa-thumbs-up me-1"></i>
                                {review.helpful_count} found this helpful
                            </small>
                        )}
                    </div>

                    <div className="review-badges">
                        {review.is_verified && (
                            <span className="badge bg-success me-1">
                                <i className="fas fa-check-circle me-1"></i>
                                Verified
                            </span>
                        )}
                        {review.is_featured && (
                            <span className="badge bg-warning">
                                <i className="fas fa-star me-1"></i>
                                Featured
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
