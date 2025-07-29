import axios from "axios";

const API_BASE = "/api";

class ReviewService {
    /**
     * Submit a review for an appointment
     */
    async submitReview(appointmentId, reviewData) {
        try {
            const response = await axios.post(
                `${API_BASE}/appointments/${appointmentId}/review`,
                {
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    quality_rating: reviewData.quality_rating || null,
                    punctuality_rating: reviewData.punctuality_rating || null,
                    communication_rating: reviewData.communication_rating || null,
                    value_rating: reviewData.value_rating || null,
                    would_recommend: reviewData.would_recommend !== undefined ? reviewData.would_recommend : null,
                }
            );

            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Review submitted successfully",
            };
        } catch (error) {
            console.error("Review submission error:", error);
            console.error("Error response:", error.response?.data);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to submit review",
                errors: error.response?.data?.errors || {},
                debug: error.response?.data || {}
            };
        }
    }

    /**
     * Get reviews for an appointment
     */
    async getAppointmentReviews(appointmentId) {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/${appointmentId}/reviews`
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            console.error("Get reviews error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to get reviews",
            };
        }
    }

    /**
     * Get provider reviews
     */
    async getProviderReviews(providerId, filters = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "") {
                    params.append(key, value);
                }
            });

            const response = await axios.get(
                `${API_BASE}/providers/${providerId}/reviews?${params}`
            );

            return {
                success: true,
                data: response.data.data,
                pagination: response.data.pagination,
            };
        } catch (error) {
            console.error("Get provider reviews error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to get provider reviews",
            };
        }
    }
}

export default new ReviewService();
