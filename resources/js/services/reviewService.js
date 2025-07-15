import axios from "axios";

class ReviewService {
    /**
     * Submit review for appointment
     */
    async submitReview(appointmentId, reviewData) {
        try {
            const validation = this.validateReviewData(reviewData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: "Review validation failed",
                    errors: validation.errors,
                };
            }

            const response = await axios.post(
                `/api/client/appointments/${appointmentId}/review`,
                {
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    quality_rating: reviewData.quality_rating,
                    punctuality_rating: reviewData.punctuality_rating,
                    communication_rating: reviewData.communication_rating,
                    value_rating: reviewData.value_rating,
                    would_recommend: reviewData.would_recommend,
                    review_images: reviewData.review_images,
                }
            );

            return {
                success: true,
                data: response.data.data,
                review: response.data.review,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error, "Failed to submit review");
        }
    }

    /**
     * Get reviews for a service/provider
     */
    async getServiceReviews(serviceId, params = {}) {
        try {
            const response = await axios.get(
                `/api/client/services/${serviceId}/reviews`,
                {
                    params: {
                        page: params.page || 1,
                        per_page: params.per_page || 10,
                        rating: params.rating,
                        sort_by: params.sort_by || "recent",
                    },
                }
            );

            return {
                success: true,
                data: response.data.data,
                meta: response.data.meta,
                message: "Reviews loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load reviews");
        }
    }

    /**
     * Validate review data
     */
    validateReviewData(data) {
        const errors = {};

        // Required rating
        if (!data.rating || data.rating < 1 || data.rating > 5) {
            errors.rating = "Please provide a rating between 1 and 5 stars";
        }

        // Comment validation
        if (data.comment) {
            if (data.comment.length < 10) {
                errors.comment =
                    "Review comment must be at least 10 characters";
            }
            if (data.comment.length > 1000) {
                errors.comment = "Review comment cannot exceed 1000 characters";
            }
        }

        // Detailed ratings validation
        const detailedRatings = [
            "quality_rating",
            "punctuality_rating",
            "communication_rating",
            "value_rating",
        ];

        detailedRatings.forEach((rating) => {
            if (data[rating] && (data[rating] < 1 || data[rating] > 5)) {
                errors[rating] = "Rating must be between 1 and 5 stars";
            }
        });

        // Images validation
        if (data.review_images && data.review_images.length > 5) {
            errors.review_images = "Maximum 5 images allowed";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Calculate overall rating from detailed ratings
     */
    calculateOverallRating(ratings) {
        const validRatings = [
            ratings.quality_rating,
            ratings.punctuality_rating,
            ratings.communication_rating,
            ratings.value_rating,
        ].filter((rating) => rating && rating > 0);

        if (validRatings.length === 0) {
            return ratings.rating || 0;
        }

        const sum = validRatings.reduce((total, rating) => total + rating, 0);
        return Math.round((sum / validRatings.length) * 10) / 10; // Round to 1 decimal
    }

    /**
     * Format review data for display
     */
    formatReviewForDisplay(review) {
        return {
            ...review,
            formatted_date: this.formatDate(review.created_at),
            overall_rating: this.calculateOverallRating(review),
            star_display: this.generateStarDisplay(review.rating),
            detailed_ratings: {
                quality: this.generateStarDisplay(review.quality_rating),
                punctuality: this.generateStarDisplay(
                    review.punctuality_rating
                ),
                communication: this.generateStarDisplay(
                    review.communication_rating
                ),
                value: this.generateStarDisplay(review.value_rating),
            },
        };
    }

    /**
     * Generate star display array for UI
     */
    generateStarDisplay(rating) {
        const stars = [];
        const numRating = parseInt(rating) || 0;

        for (let i = 1; i <= 5; i++) {
            stars.push({
                filled: i <= numRating,
                index: i,
            });
        }

        return stars;
    }

    /**
     * Format date for review display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    /**
     * Get review guidelines text
     */
    getReviewGuidelines() {
        return [
            "Be honest and specific about your experience",
            "Include details about service quality and professionalism",
            "Mention if the service was completed on time",
            "Be constructive - help other clients make informed decisions",
            "Avoid personal information or offensive language",
        ];
    }

    /**
     * Error handler
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || defaultMessage,
                errors: error.response.data?.errors || {},
                status: error.response.status,
            };
        }

        return {
            success: false,
            message: error.message || defaultMessage,
            errors: {},
        };
    }
}

export default new ReviewService();
