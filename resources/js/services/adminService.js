import axios from "axios";

/**
 * Admin API Service
 * Centralized service for all admin-related API calls
 */
class AdminService {
    constructor() {
        this.baseURL = "/api/admin";
        this.setupInterceptors();
    }

    /**
     * Setup axios interceptors for consistent error handling
     */
    setupInterceptors() {
        // Request interceptor to ensure authentication
        axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem("auth_token");
                if (token && config.url?.includes("/api/admin")) {
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
                // Handle admin-specific errors
                if (error.response?.config?.url?.includes("/api/admin")) {
                    if (error.response.status === 401) {
                        // Token expired or invalid
                        localStorage.removeItem("auth_token");
                        window.location.href = "/login";
                    } else if (error.response.status === 403) {
                        // Access denied
                        console.error(
                            "Admin access denied:",
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
            console.error("Admin API Error:", error);
        }

        throw errorResponse;
    }

    // ===========================================
    // DASHBOARD METHODS
    // ===========================================

    /**
     * Get dashboard statistics
     */
    async getDashboardStats() {
        return this.apiCall("GET", "dashboard/stats");
    }

    /**
     * Get dashboard overview
     */
    async getDashboardOverview() {
        return this.apiCall("GET", "dashboard");
    }

    // ===========================================
    // STAFF MANAGEMENT METHODS
    // ===========================================

    /**
     * Get all staff members with filtering and pagination
     */
    async getStaff(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 15,
            search: "",
            status: null,
        };

        return this.apiCall("GET", "staff", { ...defaultParams, ...params });
    }

    /**
     * Get a specific staff member
     */
    async getStaffById(staffId) {
        return this.apiCall("GET", `staff/${staffId}`);
    }

    /**
     * Create a new staff member
     */
    async createStaff(staffData) {
        const config = {};

        // Handle file uploads
        if (staffData instanceof FormData) {
            config.headers = {
                "Content-Type": "multipart/form-data",
            };
        }

        return this.apiCall("POST", "staff", staffData, config);
    }

    /**
     * Update an existing staff member
     */
    async updateStaff(staffId, staffData) {
        const config = {};

        // Handle file uploads
        if (staffData instanceof FormData) {
            config.headers = {
                "Content-Type": "multipart/form-data",
            };
        }

        return this.apiCall("PUT", `staff/${staffId}`, staffData, config);
    }

    /**
     * Delete a staff member
     */
    async deleteStaff(staffId) {
        return this.apiCall("DELETE", `staff/${staffId}`);
    }

    /**
     * Toggle staff member status (active/inactive)
     */
    async toggleStaffStatus(staffId) {
        return this.apiCall("PATCH", `staff/${staffId}/toggle-status`);
    }

    // ===========================================
    // USER MANAGEMENT METHODS
    // ===========================================

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

        return this.apiCall("GET", "users", { ...defaultParams, ...params });
    }

    /**
     * Get user statistics
     */
    async getUserStats(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", "users/stats", {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get a specific user
     */
    async getUserById(userId) {
        return this.apiCall("GET", `users/${userId}`);
    }

    /**
     * Toggle user status (active/inactive)
     */
    async toggleUserStatus(userId) {
        return this.apiCall("PATCH", `users/${userId}/toggle-status`);
    }

    /**
     * Delete a user
     */
    async deleteUser(userId) {
        return this.apiCall("DELETE", `users/${userId}`);
    }

    // ===========================================
    // REPORTS METHODS
    // ===========================================

    /**
     * Get overview report
     */
    async getOverviewReport(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", "reports/overview", {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get users report
     */
    async getUsersReport(params = {}) {
        const defaultParams = {
            days: 30,
        };

        return this.apiCall("GET", "reports/users", {
            ...defaultParams,
            ...params,
        });
    }

    /**
     * Get activities report
     */
    async getActivitiesReport(params = {}) {
        const defaultParams = {
            limit: 50,
        };

        return this.apiCall("GET", "reports/activities", {
            ...defaultParams,
            ...params,
        });
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================

    /**
     * Validate admin access (check if current user is admin)
     */
    async validateAdminAccess() {
        try {
            const response = await axios.get("/api/user");
            const user = response.data.data.user;
            return user.role === "admin";
        } catch (error) {
            return false;
        }
    }

    /**
     * Transform staff data for API submission
     */
    transformStaffData(formData) {
        const transformedData = new FormData();

        // Basic fields
        const basicFields = [
            "first_name",
            "last_name",
            "email",
            "contact_number",
            "address",
            "date_of_birth",
            "password",
            "password_confirmation",
        ];

        basicFields.forEach((field) => {
            if (
                formData[field] !== undefined &&
                formData[field] !== null &&
                formData[field] !== ""
            ) {
                transformedData.append(field, formData[field]);
            }
        });

        // Handle profile picture
        if (
            formData.profile_picture &&
            formData.profile_picture instanceof File
        ) {
            transformedData.append("profile_picture", formData.profile_picture);
        }

        return transformedData;
    }

    /**
     * Transform user filter data for API submission
     */
    transformUserFilters(filters) {
        const transformed = { ...filters };

        // Remove empty strings and null values
        Object.keys(transformed).forEach((key) => {
            if (
                transformed[key] === "" ||
                transformed[key] === null ||
                transformed[key] === undefined
            ) {
                delete transformed[key];
            }
        });

        return transformed;
    }

    /**
     * Format user data for display
     */
    formatUserData(user) {
        return {
            ...user,
            display_name:
                user.full_name || `${user.first_name} ${user.last_name}`,
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
     * Format status badge class
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
     * Generate CSV data from array of objects
     */
    generateCSV(data, filename = "export.csv") {
        if (!data || data.length === 0) {
            throw new Error("No data to export");
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(","),
            ...data.map((row) =>
                headers
                    .map((header) => {
                        const value = row[header];
                        return typeof value === "string" && value.includes(",")
                            ? `"${value}"`
                            : value;
                    })
                    .join(",")
            ),
        ].join("\n");

        // Create and trigger download
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
const adminService = new AdminService();
export default adminService;

// Export the class for testing purposes
export { AdminService };
