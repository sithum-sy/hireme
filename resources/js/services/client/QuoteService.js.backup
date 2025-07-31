import BaseService from '../core/BaseService';

/**
 * Client Quote Service
 * Handles quote requests and quote management for clients
 */
class ClientQuoteService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // Quote data should be fresh
        });
        this.baseURL = "/client";
    }

    /**
     * Get all quotes for the client
     */
    async getQuotes(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 15,
            status: 'all',
            sort_by: 'created_at',
            sort_order: 'desc'
        };

        return this.apiCall("GET", `${this.baseURL}/quotes`, {
            ...defaultParams,
            ...this.cleanPayload(params)
        });
    }

    /**
     * Get specific quote details
     */
    async getQuote(quoteId) {
        return this.apiCall("GET", `${this.baseURL}/quotes/${quoteId}`);
    }

    /**
     * Accept a quote and convert to appointment
     */
    async acceptQuote(quoteId, acceptanceData) {
        const payload = {
            appointment_date: this.formatDate(acceptanceData.appointment_date),
            appointment_time: this.formatTime(acceptanceData.appointment_time),
            client_address: acceptanceData.client_address,
            client_city: acceptanceData.client_city,
            client_postal_code: acceptanceData.client_postal_code,
            location_instructions: acceptanceData.location_instructions,
            client_phone: acceptanceData.client_phone,
            client_email: acceptanceData.client_email,
            contact_preference: acceptanceData.contact_preference,
            notes: acceptanceData.notes
        };

        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/accept`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Decline a quote
     */
    async declineQuote(quoteId, reason = null) {
        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/decline`, {
            reason
        });
    }

    /**
     * Request quote modification
     */
    async requestModification(quoteId, modificationData) {
        const payload = {
            requested_changes: modificationData.requested_changes,
            budget_constraint: modificationData.budget_constraint,
            timeline_preference: modificationData.timeline_preference,
            additional_requirements: modificationData.additional_requirements
        };

        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/modify`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get quote conversation/messages
     */
    async getQuoteMessages(quoteId) {
        return this.apiCall("GET", `${this.baseURL}/quotes/${quoteId}/messages`);
    }

    /**
     * Send message about quote
     */
    async sendQuoteMessage(quoteId, message) {
        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/messages`, {
            message
        });
    }

    /**
     * Get pending quotes awaiting response
     */
    async getPendingQuotes() {
        return this.apiCall("GET", `${this.baseURL}/quotes/pending`);
    }

    /**
     * Get expired quotes
     */
    async getExpiredQuotes(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 10
        };

        return this.apiCall("GET", `${this.baseURL}/quotes/expired`, {
            ...defaultParams,
            ...params
        });
    }

    /**
     * Renew an expired quote
     */
    async renewQuote(quoteId) {
        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/renew`);
    }

    /**
     * Get quote statistics
     */
    async getQuoteStats(period = '30d') {
        return this.apiCall("GET", `${this.baseURL}/quotes/stats`, { period });
    }

    /**
     * Compare multiple quotes
     */
    async compareQuotes(quoteIds) {
        return this.apiCall("POST", `${this.baseURL}/quotes/compare`, {
            quote_ids: quoteIds
        });
    }

    /**
     * Save quote as favorite
     */
    async addToFavorites(quoteId) {
        return this.apiCall("POST", `${this.baseURL}/quotes/${quoteId}/favorite`);
    }

    /**
     * Remove quote from favorites
     */
    async removeFromFavorites(quoteId) {
        return this.apiCall("DELETE", `${this.baseURL}/quotes/${quoteId}/favorite`);
    }

    /**
     * Get favorite quotes
     */
    async getFavoriteQuotes() {
        return this.apiCall("GET", `${this.baseURL}/quotes/favorites`);
    }

    /**
     * Download quote as PDF
     */
    async downloadQuote(quoteId) {
        const config = {
            responseType: 'blob'
        };

        return this.apiCall("GET", `${this.baseURL}/quotes/${quoteId}/download`, 
            null, config
        );
    }

    // Utility methods

    /**
     * Format quote data for display
     */
    formatQuoteData(quote) {
        return {
            ...quote,
            display_price: this.formatCurrency(quote.quoted_price),
            display_date: new Date(quote.created_at).toLocaleDateString(),
            status_class: this.getQuoteStatusClass(quote.status),
            expires_in: this.calculateExpirationTime(quote.valid_until),
            can_accept: this.canAcceptQuote(quote),
            can_decline: this.canDeclineQuote(quote),
            can_modify: this.canModifyQuote(quote)
        };
    }

    /**
     * Get quote status CSS class
     */
    getQuoteStatusClass(status) {
        const statusClasses = {
            'pending': 'badge bg-warning',
            'accepted': 'badge bg-success',
            'declined': 'badge bg-danger',
            'expired': 'badge bg-secondary',
            'modified': 'badge bg-info',
            'cancelled': 'badge bg-dark'
        };

        return statusClasses[status] || 'badge bg-secondary';
    }

    /**
     * Calculate time until quote expires
     */
    calculateExpirationTime(validUntil) {
        if (!validUntil) return null;

        const now = new Date();
        const expiry = new Date(validUntil);
        const diffTime = expiry - now;

        if (diffTime <= 0) return 'Expired';

        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} left`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} left`;
        } else {
            return 'Expires soon';
        }
    }

    /**
     * Check if quote can be accepted
     */
    canAcceptQuote(quote) {
        return quote.status === 'pending' && 
               new Date(quote.valid_until) > new Date();
    }

    /**
     * Check if quote can be declined
     */
    canDeclineQuote(quote) {
        return quote.status === 'pending';
    }

    /**
     * Check if quote can be modified
     */
    canModifyQuote(quote) {
        return quote.status === 'pending' && 
               new Date(quote.valid_until) > new Date();
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Calculate quote savings compared to regular price
     */
    calculateSavings(quotePrice, regularPrice) {
        if (!regularPrice || regularPrice <= quotePrice) {
            return null;
        }

        const savings = regularPrice - quotePrice;
        const percentage = ((savings / regularPrice) * 100).toFixed(1);

        return {
            amount: savings,
            percentage: percentage,
            formatted_amount: this.formatCurrency(savings),
            formatted_percentage: `${percentage}%`
        };
    }
}

export default ClientQuoteService;