import React, { useState, useEffect } from "react";
import clientService from "../../../services/clientService";
import LoadingSpinner from "../../LoadingSpinner";
import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

const ServiceReviews = ({ serviceId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [sortBy, setSortBy] = useState("recent");
    const [filterRating, setFilterRating] = useState("");

    useEffect(() => {
        loadReviews();
    }, [serviceId, sortBy, filterRating]);

    const loadReviews = async (page = 1) => {
        setLoading(true);

        try {
            const params = {
                page,
                sort_by: sortBy,
                per_page: 10,
            };

            // Add rating filter if selected
            if (filterRating) {
                params.rating = filterRating;
            }

            const response = await clientService.getServiceReviews(
                serviceId,
                params
            );

            if (response.success) {
                // Handle both direct data and nested data structure
                const reviewsData = response.data.data || response.data;
                const reviewsMeta = response.data.meta || response.meta;

                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
                setPagination(reviewsMeta || {});
            }
        } catch (error) {
            console.error("Failed to load reviews:", error);
            // Set empty reviews on error
            setReviews([]);
            setPagination({});
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <i
                key={i}
                className={`fas fa-star ${
                    i < rating ? "text-warning" : "text-muted"
                }`}
            ></i>
        ));
    };

    if (loading) {
        return <LoadingSpinner size="small" message="Loading reviews..." />;
    }

    return (
        <div className="service-reviews">
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    {/* Reviews Header */}
                    <div className="reviews-header d-flex justify-content-between align-items-center mb-4">
                        <h5 className="fw-bold mb-0">Customer Reviews</h5>

                        <div className="review-filters d-flex gap-3">
                            {/* Sort By */}
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="recent">Most Recent</option>
                                <option value="rating_high">
                                    Highest Rated
                                </option>
                                <option value="rating_low">Lowest Rated</option>
                                <option value="helpful">Most Helpful</option>
                            </select>

                            {/* Filter by Rating */}
                            <select
                                className="form-select form-select-sm"
                                value={filterRating}
                                onChange={(e) =>
                                    setFilterRating(e.target.value)
                                }
                            >
                                <option value="">All Ratings</option>
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                    </div>

                    {/* Reviews List */}
                    {reviews.length > 0 ? (
                        <>
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="review-item border-bottom pb-4 mb-4"
                                    >
                                        <div className="review-header d-flex justify-content-between align-items-start mb-3">
                                            <div className="reviewer-info d-flex align-items-center">
                                                <div className="reviewer-avatar me-3">
                                                    {(() => {
                                                        // Use the dedicated profile image URL constructor
                                                        const profileImageUrl = constructProfileImageUrl(
                                                            review.client.profile_image_url
                                                        );

                                                        return profileImageUrl ? (
                                                            <img
                                                                src={profileImageUrl}
                                                                alt={review.client.name}
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    objectFit: "cover",
                                                                }}
                                                                onError={(e) => {
                                                                    // Hide failed image and show fallback
                                                                    e.target.style.display = "none";
                                                                    const fallback = e.target.nextSibling;
                                                                    if (fallback) {
                                                                        fallback.style.display = "flex";
                                                                    }
                                                                }}
                                                            />
                                                        ) : null;
                                                    })()}

                                                    {/* Fallback avatar */}
                                                    {!constructProfileImageUrl(review.client.profile_image_url) && (
                                                        <div
                                                            className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "40px",
                                                                height: "40px",
                                                            }}
                                                        >
                                                            <i className="fas fa-user"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="reviewer-name fw-semibold">
                                                        {review.client.name}
                                                        {review.is_verified_purchase && (
                                                            <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                                <i className="fas fa-check-circle me-1"></i>
                                                                Verified
                                                                Purchase
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="review-date text-muted small">
                                                        {formatDate(
                                                            review.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="review-rating">
                                                <div className="stars">
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="review-content">
                                            <p className="review-text mb-3">
                                                {review.comment}
                                            </p>

                                            {/* Review Images */}
                                            {review.images &&
                                                review.images.length > 0 && (
                                                    <div className="review-images mb-3">
                                                        <div className="row g-2">
                                                            {review.images.map(
                                                                (
                                                                    image,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="col-auto"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                image.url
                                                                            }
                                                                            alt={`Review image ${
                                                                                index +
                                                                                1
                                                                            }`}
                                                                            className="rounded"
                                                                            style={{
                                                                                width: "80px",
                                                                                height: "80px",
                                                                                objectFit:
                                                                                    "cover",
                                                                                cursor: "pointer",
                                                                            }}
                                                                            onClick={() => {
                                                                                // Open image in modal
                                                                                console.log(
                                                                                    "Open image:",
                                                                                    image.url
                                                                                );
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Provider Response */}
                                            {review.provider_response && (
                                                <div className="provider-response bg-light rounded p-3 mt-3">
                                                    <div className="response-header d-flex align-items-center mb-2">
                                                        <i className="fas fa-reply text-primary me-2"></i>
                                                        <span className="fw-semibold">
                                                            Response from
                                                            Provider
                                                        </span>
                                                        <span className="text-muted ms-auto small">
                                                            {formatDate(
                                                                review
                                                                    .provider_response
                                                                    .created_at
                                                            )}
                                                        </span>
                                                    </div>
                                                    <p className="response-text mb-0">
                                                        {
                                                            review
                                                                .provider_response
                                                                .message
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Review Actions */}
                                        <div className="review-actions d-flex gap-3 mt-3">
                                            <button
                                                className="btn btn-link btn-sm p-0 text-muted"
                                                onClick={() => {
                                                    // Handle helpful vote
                                                    console.log(
                                                        "Mark helpful:",
                                                        review.id
                                                    );
                                                }}
                                            >
                                                <i className="far fa-thumbs-up me-1"></i>
                                                Helpful (
                                                {review.helpful_count || 0})
                                            </button>

                                            <button
                                                className="btn btn-link btn-sm p-0 text-muted"
                                                onClick={() => {
                                                    // Handle report
                                                    console.log(
                                                        "Report review:",
                                                        review.id
                                                    );
                                                }}
                                            >
                                                <i className="far fa-flag me-1"></i>
                                                Report
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pagination.last_page > 1 && (
                                <div className="d-flex justify-content-center mt-4">
                                    <nav>
                                        <ul className="pagination pagination-sm">
                                            <li
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    1
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        loadReviews(
                                                            pagination.current_page -
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.current_page ===
                                                        1
                                                    }
                                                >
                                                    Previous
                                                </button>
                                            </li>

                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        pagination.last_page
                                                    ),
                                                },
                                                (_, i) => {
                                                    const pageNum = i + 1;
                                                    return (
                                                        <li
                                                            key={pageNum}
                                                            className={`page-item ${
                                                                pagination.current_page ===
                                                                pageNum
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    loadReviews(
                                                                        pageNum
                                                                    )
                                                                }
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        </li>
                                                    );
                                                }
                                            )}

                                            <li
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    pagination.last_page
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        loadReviews(
                                                            pagination.current_page +
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.current_page ===
                                                        pagination.last_page
                                                    }
                                                >
                                                    Next
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-reviews text-center py-5">
                            <i className="fas fa-comment-slash fa-3x text-muted mb-3"></i>
                            <h6 className="text-muted">No reviews yet</h6>
                            <p className="text-muted">
                                Be the first to review this service!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Using CSS variables for consistent theming */
                .review-item:last-child {
                    border-bottom: none !important;
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
            `}</style>
        </div>
    );
};

export default ServiceReviews;
