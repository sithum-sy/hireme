import axios from "axios";

/**
 * Staff API Service
 * Centralized service for all staff-related API calls
 * Following the same pattern as AdminService
 */
class StaffService {
    constructor() {
        this.baseURL = "/api/staff";
        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for consistent error handling
     * Same pattern as AdminService
     */
    setupInterceptors() {
        // Request interceptor to ensure authentication
        axios.interceptors.request.use(
            (config) => {
                // Use 'token' instead of 'auth_token' to match your login component
                const token = localStorage.getItem("token");
                if (token && config.url?.includes("/api/staff")) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for consistent error handling
        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle staff-specific errors
                if (error.response?.config?.url?.includes("/api/staff")) {
                    if (error.response.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "/login";
                    } else if (error.response.status === 403) {
                        // Access denied
                        console.error(
                            "Staff access denied:",
                            error.response.data.message
                        );
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Generic API call method with error handling
     * Same pattern as AdminService
     */
    async apiCall(method, endpoint, data = null, config = {}) {
        try {
            const url = endpoint.startsWith("/")
                ? endpoint
                : `${this.baseURL}/${endpoint}`;

            const requestConfig = {
                method,
                url,
                ...config,
            };

            if (data) {
                if (method.toLowerCase() === "get") {
                    requestConfig.params = data;
                } else {
                    requestConfig.data = data;
                }
            }

            const response = await axios(requestConfig);
            return this.handleResponse(response);
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle successful responses
     * Same pattern as AdminService
     */
    handleResponse(response) {
        return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message || "Operation successful",
            meta: response.data.meta || null,
            status: response.status,
        };
    }

    /**
     * Handle API errors
     * Same pattern as AdminService
     */
    handleError(error) {
        const errorResponse = {
            success: false,
            data: null,
            message: "An unexpected error occurred",
            errors: {},
            status: error.response?.status || 500,
        };

        if (error.response) {
            // Server responded with error status
            errorResponse.message =
                error.response.data?.message || error.message;
            errorResponse.errors = error.response.data?.errors || {};
            errorResponse.status = error.response.status;
        } else if (error.request) {
            // Request made but no response
            errorResponse.message =
                "Network error. Please check your connection.";
        } else {
            // Something else happened
            errorResponse.message =
                error.message || "An unexpected error occurred";
        }

        // Log errors in development
        if (process.env.NODE_ENV === "development") {
            console.error("Staff API Error:", error);
        }

        throw errorResponse;
    }

    // ===========================================
    // DASHBOARD METHODS
    // ===========================================

    /**
     * Get complete dashboard data
     */
    async getDashboard() {
        return this.apiCall("GET", "dashboard");
    }

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(cache = 5) {
        return this.apiCall("GET", "dashboard/stats", { cache });
    }

    /**
     * Get today's tasks
     */
    async getTasks() {
        return this.apiCall("GET", "dashboard/tasks");
    }

    /**
     * Get recent activities
     */
    async getActivities(params = {}) {
        const defaultParams = {
            limit: 20,
            days: 30,
        };
        return this.apiCall("GET", "dashboard/activities", {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get activity statistics
     */
    async getActivityStats(days = 30) {
        return this.apiCall("GET", "dashboard/activity-stats", { days });
    }

    /**
     * Get staff activity summary
     */
    async getStaffActivitySummary(staffId = null, days = 30) {
        const params = { days };
        if (staffId) params.staff_id = staffId;
        return this.apiCall("GET", "dashboard/staff-activity", params);
    }

    /**
     * Get quick actions
     */
    async getQuickActions() {
        return this.apiCall("GET", "dashboard/quick-actions");
    }

    /**
     * Get platform overview with trends
     */
    async getOverview(days = 30, charts = true) {
        return this.apiCall("GET", "dashboard/overview", { days, charts });
    }

    /**
     * Clear dashboard cache
     */
    async clearCache() {
        return this.apiCall("POST", "dashboard/clear-cache");
    }

    /**
     * Export dashboard data
     */
    async exportData(format = "json", days = 30) {
        return this.apiCall("GET", "dashboard/export", { format, days });
    }

    // ===========================================
    // SERVICE CATEGORY METHODS
    // ===========================================

    /**
     * Get all service categories with filtering and pagination
     */
    async getCategories(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 15,
            search: "",
            status: null,
            sort_by: "sort_order",
            sort_order: "asc",
        };
        return this.apiCall("GET", "service-categories", {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get a specific service category
     */
    async getCategory(id) {
        return this.apiCall("GET", `service-categories/${id}`);
    }

    /**
     * Create a new service category
     */
    async createCategory(data) {
        return this.apiCall("POST", "service-categories", data);
    }

    /**
     * Update an existing service category
     */
    async updateCategory(id, data) {
        return this.apiCall("PUT", `service-categories/${id}`, data);
    }

    /**
     * Delete a service category
     */
    async deleteCategory(id) {
        return this.apiCall("DELETE", `service-categories/${id}`);
    }

    /**
     * Toggle category status (active/inactive)
     */
    async toggleCategoryStatus(id) {
        return this.apiCall("PATCH", `service-categories/${id}/toggle-status`);
    }

    /**
     * Update sort order of categories
     */
    async updateSortOrder(categories) {
        return this.apiCall("PATCH", "service-categories/sort-order", {
            categories,
        });
    }

    /**
     * Get category analytics
     */
    async getCategoryAnalytics(id) {
        return this.apiCall("GET", `service-categories/${id}/analytics`);
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Validate staff access (check if current user is staff)
     */
    async validateStaffAccess() {
        try {
            const response = await axios.get("/api/user");
            const user = response.data.data.user;
            return user.role === "staff";
        } catch (error) {
            return false;
        }
    }

    /**
     * Format error messages for display
     */
    formatApiError(error) {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            return Object.values(errors).flat().join(", ");
        }
        return error.message || "An unexpected error occurred";
    }

    /**
     * Check if user has staff role
     */
    hasStaffRole() {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.role === "staff";
    }

    /**
     * Get current staff user
     */
    getCurrentStaff() {
        return JSON.parse(localStorage.getItem("user") || "{}");
    }

    /**
     * Transform category data for API submission
     */
    transformCategoryData(formData) {
        // Remove empty values
        const transformedData = { ...formData };
        Object.keys(transformedData).forEach((key) => {
            if (
                transformedData[key] === "" ||
                transformedData[key] === null ||
                transformedData[key] === undefined
            ) {
                delete transformedData[key];
            }
        });
        return transformedData;
    }

    /**
     * Format category status for display
     */
    formatCategoryStatus(isActive) {
        return isActive ? "Active" : "Inactive";
    }

    /**
     * Get status badge class
     */
    getStatusBadgeClass(isActive) {
        return isActive ? "badge bg-success" : "badge bg-secondary";
    }

    /**
     * Format numbers for display
     */
    formatNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + "M";
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + "K";
        }
        return number.toString();
    }

    /**
     * Debounce function for search inputs
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    /**
     * Create debounced search function
     */
    createDebouncedSearch(searchFunction, delay = 300) {
        return this.debounce(searchFunction, delay);
    }
}

// Create and export a singleton instance
const staffService = new StaffService();
export default staffService;

// Export the class for testing purposes
export { StaffService };
