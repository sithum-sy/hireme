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
     * Update quote with provider response
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
                message: response.data.message || "Quote sent successfully",
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
     * Get quotes awaiting provider response (pending quotes)
     */
    async getAvailableRequests(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/quotes/available`, {
                params,
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Pending quotes loaded",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load pending quotes");
        }
    }

    /**
     * Validate quote data before submission
     */
    validateQuoteData(quoteData) {
        const errors = {};

        if (
            !quoteData.quoted_price ||
            parseFloat(quoteData.quoted_price) <= 0
        ) {
            errors.quoted_price = "Valid quoted price is required";
        }

        if (parseFloat(quoteData.quoted_price) > 1000000) {
            errors.quoted_price = "Quoted price cannot exceed Rs. 1,000,000";
        }

        if (
            !quoteData.estimated_duration ||
            parseFloat(quoteData.estimated_duration) <= 0
        ) {
            errors.estimated_duration = "Estimated duration is required";
        }

        if (parseFloat(quoteData.estimated_duration) > 24) {
            errors.estimated_duration = "Duration cannot exceed 24 hours";
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
            (parseInt(quoteData.validity_days) < 1 ||
                parseInt(quoteData.validity_days) > 30)
        ) {
            errors.validity_days = "Validity must be between 1 and 30 days";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Calculate quote pricing suggestions based on client request data
     */
    calculatePricingSuggestions(quote, duration) {
        // Extract client budget from quote_request_data
        const requestData = quote.quote_request_data || {};
        const clientBudgetMin = requestData.budget_min;
        const clientBudgetMax = requestData.budget_max;

        // Calculate base rate suggestions
        const baseRate = 1500; // Rs. per hour
        const suggested = Math.round(baseRate * duration);

        let competitive = Math.round(suggested * 0.9);
        let premium = Math.round(suggested * 1.2);

        // Adjust based on client budget if available
        if (clientBudgetMin && clientBudgetMax) {
            const budgetMid = (clientBudgetMin + clientBudgetMax) / 2;
            competitive = Math.min(competitive, Math.round(budgetMid * 0.95));
            premium = Math.max(premium, Math.round(budgetMid * 1.1));
        }

        return {
            competitive: competitive,
            suggested: suggested,
            premium: premium,
        };
    }

    /**
     * Get service categories for filtering
     */
    async getServiceCategories() {
        try {
            const response = await axios.get(`${API_BASE}/quotes/service-categories`);
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Service categories loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load service categories");
        }
    }

    /**
     * Error handler
     */
    handleError(error, defaultMessage) {
        console.error("ProviderQuoteService Error:", error);

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
