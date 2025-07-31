import BaseService from '../core/BaseService';

/**
 * Client Dashboard Service
 * Handles client dashboard data, statistics, and recommendations
 */
class ClientDashboardService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 5 * 60 * 1000 // 5 minutes cache
        });
        this.baseURL = "/client";
    }

    /**
     * Get dashboard statistics
     */
    async getStats() {
        const cacheKey = "dashboard_stats";
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.apiCall("GET", `${this.baseURL}/dashboard/stats`);
            this.setCachedData(cacheKey, response);
            return response;
        } catch (error) {
            // Return cached data if available on rate limit
            if (error.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    /**
     * Get service recommendations
     */
    async getRecommendations(params = {}) {
        const cacheKey = `recommendations_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await this.apiCall("GET", `${this.baseURL}/dashboard/recommendations`, params);
            this.setCachedData(cacheKey, response);
            return response;
        } catch (error) {
            if (error.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    /**
     * Get recent activity
     */
    async getRecentActivity(limit = 20) {
        return this.apiCall("GET", `${this.baseURL}/dashboard/recent-activity`, { limit });
    }

    /**
     * Get upcoming appointments
     */
    async getUpcomingAppointments(limit = 5) {
        return this.apiCall("GET", `${this.baseURL}/dashboard/upcoming-appointments`, { limit });
    }

    /**
     * Get favorite services
     */
    async getFavoriteServices(limit = 10) {
        return this.apiCall("GET", `${this.baseURL}/dashboard/favorites`, { limit });
    }

    /**
     * Get spending summary
     */
    async getSpendingSummary(period = '30d') {
        return this.apiCall("GET", `${this.baseURL}/dashboard/spending`, { period });
    }

    /**
     * Get personalized offers
     */
    async getPersonalizedOffers() {
        return this.apiCall("GET", `${this.baseURL}/dashboard/offers`);
    }

    /**
     * Mark offer as viewed
     */
    async markOfferViewed(offerId) {
        return this.apiCall("POST", `${this.baseURL}/dashboard/offers/${offerId}/viewed`);
    }

    /**
     * Get booking trends
     */
    async getBookingTrends(period = '6m') {
        return this.apiCall("GET", `${this.baseURL}/dashboard/booking-trends`, { period });
    }

    /**
     * Update dashboard preferences
     */
    async updatePreferences(preferences) {
        this.clearCache(); // Clear cache as preferences affect recommendations
        return this.apiCall("POST", `${this.baseURL}/dashboard/preferences`, preferences);
    }

    /**
     * Get dashboard widgets configuration
     */
    async getWidgetsConfig() {
        return this.apiCall("GET", `${this.baseURL}/dashboard/widgets`);
    }

    /**
     * Update widgets layout
     */
    async updateWidgetsLayout(layout) {
        return this.apiCall("POST", `${this.baseURL}/dashboard/widgets/layout`, { layout });
    }
}

export default ClientDashboardService;