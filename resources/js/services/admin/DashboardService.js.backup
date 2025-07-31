import BaseService from '../core/BaseService';

/**
 * Admin Dashboard Service
 * Handles admin dashboard statistics and overview data
 */
class AdminDashboardService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 2 * 60 * 1000 // 2 minutes cache for dashboard stats
        });
        this.baseURL = "/admin";
    }

    /**
     * Get dashboard statistics
     */
    async getStats() {
        return this.apiCall("GET", `${this.baseURL}/dashboard/stats`);
    }

    /**
     * Get dashboard overview with all sections
     */
    async getOverview() {
        return this.apiCall("GET", `${this.baseURL}/dashboard`);
    }

    /**
     * Get platform growth metrics
     */
    async getGrowthMetrics(params = {}) {
        const defaultParams = {
            period: '30d', // 30 days default
            metric: 'users'
        };

        return this.apiCall("GET", `${this.baseURL}/dashboard/growth`, {
            ...defaultParams,
            ...params
        });
    }

    /**
     * Get system health status
     */
    async getSystemHealth() {
        return this.apiCall("GET", `${this.baseURL}/dashboard/health`);
    }

    /**
     * Export dashboard data
     */
    async exportData(format = 'csv', params = {}) {
        const config = {
            responseType: format === 'pdf' ? 'blob' : 'json'
        };

        return this.apiCall("GET", `${this.baseURL}/dashboard/export`, {
            format,
            ...params
        }, config);
    }
}

export default AdminDashboardService;