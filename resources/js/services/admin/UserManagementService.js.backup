import BaseService from '../core/BaseService';

/**
 * Admin User Management Service
 * Handles user CRUD operations and user-related admin functions
 */
class AdminUserManagementService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // User data should always be fresh
        });
        this.baseURL = "/admin";
    }

    /**
     * Get all users with filtering and pagination
     */
    async getUsers(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 15,
            search: "",
            role: null,
            status: null,
            sort_by: "created_at",
            sort_order: "desc",
        };

        const cleanParams = this.transformUserFilters({
            ...defaultParams,
            ...params
        });

        return this.apiCall("GET", `${this.baseURL}/users`, cleanParams);
    }

    /**
     * Get user statistics
     */
    async getUserStats(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", `${this.baseURL}/users/stats`, {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get a specific user
     */
    async getUserById(userId) {
        return this.apiCall("GET", `${this.baseURL}/users/${userId}`);
    }

    /**
     * Toggle user status (active/inactive)
     */
    async toggleUserStatus(userId) {
        // Clear any cached user data
        this.clearCache();
        return this.apiCall("PATCH", `${this.baseURL}/users/${userId}/toggle-status`);
    }

    /**
     * Delete a user
     */
    async deleteUser(userId) {
        // Clear any cached user data
        this.clearCache();
        return this.apiCall("DELETE", `${this.baseURL}/users/${userId}`);
    }

    /**
     * Bulk update users
     */
    async bulkUpdateUsers(userIds, action, data = {}) {
        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/users/bulk-update`, {
            users: userIds,
            action,
            ...data
        });
    }

    /**
     * Export users data
     */
    async exportUsers(filters = {}, format = 'csv') {
        const config = {
            responseType: format === 'pdf' ? 'blob' : 'json'
        };

        return this.apiCall("GET", `${this.baseURL}/users/export`, {
            ...filters,
            format
        }, config);
    }

    /**
     * Search users with advanced filters
     */
    async searchUsers(query, filters = {}) {
        const searchParams = {
            q: query,
            ...filters
        };

        return this.apiCall("GET", `${this.baseURL}/users/search`, searchParams);
    }

    /**
     * Get user activity log
     */
    async getUserActivity(userId, params = {}) {
        const defaultParams = {
            page: 1,
            limit: 50
        };

        return this.apiCall("GET", `${this.baseURL}/users/${userId}/activity`, {
            ...defaultParams,
            ...params
        });
    }

    // Utility methods

    /**
     * Transform user filter data for API submission
     */
    transformUserFilters(filters) {
        return this.cleanPayload(filters);
    }

    /**
     * Format user data for display
     */
    formatUserData(user) {
        return {
            ...user,
            display_name: user.full_name || `${user.first_name} ${user.last_name}`,
            role_display: this.formatRole(user.role),
            status_display: user.is_active ? "Active" : "Inactive",
            last_login_display: user.last_login_human || "Never",
            created_display: new Date(user.created_at).toLocaleDateString(),
        };
    }

    /**
     * Format role for display
     */
    formatRole(role) {
        const roleMap = {
            client: "Client",
            service_provider: "Service Provider",
            admin: "Administrator",
            staff: "Staff Member",
        };

        return roleMap[role] || role;
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(isActive) {
        return isActive ? "badge bg-success" : "badge bg-secondary";
    }

    /**
     * Create debounced user search
     */
    createDebouncedUserSearch(callback, delay = 300) {
        return this.createDebouncedSearch(callback, delay);
    }
}

export default AdminUserManagementService;