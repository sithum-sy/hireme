import axios from "axios";

const API_BASE = "/api/provider";

class ProviderQuoteService {
    /**
     * Get all provider quotes with filtering
     */
    async getQuotes(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/quotes`, { params });
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Quotes loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load quotes");
        }
    }

    /**
     * Get quote details
     */
    async getQuoteDetail(quoteId) {
        try {
            const response = await axios.get(`${API_BASE}/quotes/${quoteId}`);
            return {
                success: true,
                data: response.data.data,
                message: "Quote details loaded",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load quote details");
        }
    }

    /**
     * Create new quote
     */
    async createQuote(quoteData) {
        try {
            const response = await axios.post(`${API_BASE}/quotes`, quoteData);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Quote sent successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to create quote");
        }
    }

    /**
     * Update existing quote
     */
    async updateQuote(quoteId, quoteData) {
        try {
            const response = await axios.patch(
                `${API_BASE}/quotes/${quoteId}`,
                quoteData
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Quote updated successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to update quote");
        }
    }

    /**
     * Withdraw quote
     */
    async withdrawQuote(quoteId, reason = "") {
        try {
            const response = await axios.delete(
                `${API_BASE}/quotes/${quoteId}`,
                {
                    data: { reason },
                }
            );
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Quote withdrawn successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to withdraw quote");
        }
    }

    /**
     * Get quote statistics
     */
    async getQuoteStats() {
        try {
            const response = await axios.get(`${API_BASE}/quotes/statistics`);
            return {
                success: true,
                data: response.data.data,
                message: "Quote statistics loaded",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load quote statistics");
        }
    }

    /**
     * Search available service requests to quote on
     */
    async getAvailableRequests(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/requests/available`, {
                params,
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Available requests loaded",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load available requests");
        }
    }

    /**
     * Send a quote (change status from pending to quoted)
     */
    async sendQuote(quoteId) {
        try {
            const response = await axios.patch(
                `${API_BASE}/quotes/${quoteId}/send`
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Quote sent successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to send quote");
        }
    }

    /**
     * Validate quote data before submission
     */
    validateQuoteData(quoteData) {
        const errors = {};

        if (!quoteData.quote_request_id) {
            errors.quote_request_id = "Quote request is required";
        }

        if (!quoteData.quoted_price || quoteData.quoted_price <= 0) {
            errors.quoted_price = "Valid quoted price is required";
        }

        if (quoteData.quoted_price > 100000) {
            errors.quoted_price = "Quoted price cannot exceed Rs. 100,000";
        }

        if (
            !quoteData.estimated_duration ||
            quoteData.estimated_duration <= 0
        ) {
            errors.estimated_duration = "Estimated duration is required";
        }

        if (
            !quoteData.quote_description ||
            quoteData.quote_description.trim().length < 20
        ) {
            errors.quote_description =
                "Quote description must be at least 20 characters";
        }

        if (
            quoteData.quote_description &&
            quoteData.quote_description.length > 1000
        ) {
            errors.quote_description =
                "Quote description cannot exceed 1000 characters";
        }

        if (
            quoteData.validity_days &&
            (quoteData.validity_days < 1 || quoteData.validity_days > 30)
        ) {
            errors.validity_days = "Validity must be between 1 and 30 days";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Calculate quote pricing suggestions
     */
    calculatePricingSuggestions(serviceData, duration) {
        // Mock pricing calculation - replace with actual business logic
        const baseRate = 1500; // Rs. per hour
        const suggested = Math.round(baseRate * duration);

        return {
            suggested: suggested,
            minimum: Math.round(suggested * 0.8),
            competitive: Math.round(suggested * 0.9),
            premium: Math.round(suggested * 1.2),
        };
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

export default new ProviderQuoteService();
