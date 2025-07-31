import BaseService from '../core/BaseService';

/**
 * Admin Staff Management Service
 * Handles staff member CRUD operations and staff-related admin functions
 */
class AdminStaffManagementService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // Staff data should always be fresh
        });
        this.baseURL = "/admin";
    }

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

        return this.apiCall("GET", `${this.baseURL}/staff`, { 
            ...defaultParams, 
            ...params 
        });
    }

    /**
     * Get a specific staff member
     */
    async getStaffById(staffId) {
        return this.apiCall("GET", `${this.baseURL}/staff/${staffId}`);
    }

    /**
     * Create a new staff member
     */
    async createStaff(staffData) {
        const formData = this.transformStaffData(staffData);
        const config = {};

        // Handle file uploads
        if (formData instanceof FormData) {
            config.headers = {
                "Content-Type": "multipart/form-data",
            };
        }

        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/staff`, formData, config);
    }

    /**
     * Update an existing staff member
     */
    async updateStaff(staffId, staffData) {
        const formData = this.transformStaffData(staffData);
        const config = {};

        // Handle file uploads
        if (formData instanceof FormData) {
            config.headers = {
                "Content-Type": "multipart/form-data",
            };
        }

        this.clearCache();
        return this.apiCall("PUT", `${this.baseURL}/staff/${staffId}`, formData, config);
    }

    /**
     * Delete a staff member
     */
    async deleteStaff(staffId) {
        this.clearCache();
        return this.apiCall("DELETE", `${this.baseURL}/staff/${staffId}`);
    }

    /**
     * Toggle staff member status (active/inactive)
     */
    async toggleStaffStatus(staffId) {
        this.clearCache();
        return this.apiCall("PATCH", `${this.baseURL}/staff/${staffId}/toggle-status`);
    }

    /**
     * Get staff performance metrics
     */
    async getStaffPerformance(staffId, params = {}) {
        const defaultParams = {
            period: '30d'
        };

        return this.apiCall("GET", `${this.baseURL}/staff/${staffId}/performance`, {
            ...defaultParams,
            ...params
        });
    }

    /**
     * Get staff activity log
     */
    async getStaffActivity(staffId, params = {}) {
        const defaultParams = {
            page: 1,
            limit: 50
        };

        return this.apiCall("GET", `${this.baseURL}/staff/${staffId}/activity`, {
            ...defaultParams,
            ...params
        });
    }

    /**
     * Assign permissions to staff member
     */
    async updateStaffPermissions(staffId, permissions) {
        this.clearCache();
        return this.apiCall("POST", `${this.baseURL}/staff/${staffId}/permissions`, {
            permissions
        });
    }

    /**
     * Export staff data
     */
    async exportStaff(filters = {}, format = 'csv') {
        const config = {
            responseType: format === 'pdf' ? 'blob' : 'json'
        };

        return this.apiCall("GET", `${this.baseURL}/staff/export`, {
            ...filters,
            format
        }, config);
    }

    // Utility methods

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
     * Validate staff data before submission
     */
    validateStaffData(data, isUpdate = false) {
        const errors = {};

        // Required fields for new staff
        if (!isUpdate) {
            if (!data.first_name) errors.first_name = "First name is required";
            if (!data.last_name) errors.last_name = "Last name is required";
            if (!data.email) errors.email = "Email is required";
            if (!data.password) errors.password = "Password is required";
        }

        // Email format validation
        if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
            errors.email = "Invalid email format";
        }

        // Password strength validation (for new staff or password changes)
        if (data.password) {
            if (data.password.length < 8) {
                errors.password = "Password must be at least 8 characters";
            }
            if (data.password !== data.password_confirmation) {
                errors.password_confirmation = "Passwords do not match";
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Format staff data for display
     */
    formatStaffData(staff) {
        return {
            ...staff,
            display_name: staff.full_name || `${staff.first_name} ${staff.last_name}`,
            status_display: staff.is_active ? "Active" : "Inactive",
            created_display: new Date(staff.created_at).toLocaleDateString(),
            last_login_display: staff.last_login_human || "Never",
        };
    }
}

export default AdminStaffManagementService;