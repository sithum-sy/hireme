import axios from "axios";

class ProfileService {
    constructor() {
        this.baseURL = "/api/profile";
    }

    /**
     * Get user profile with permissions
     */
    async getProfile() {
        try {
            const response = await axios.get(this.baseURL);
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update basic profile information
     */
    async updateProfile(data) {
        try {
            const response = await axios.put(this.baseURL, data);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Upload profile image
     */
    async uploadProfileImage(file) {
        try {
            const formData = new FormData();
            formData.append("profile_picture", file);

            const response = await axios.post(
                `${this.baseURL}/image`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete profile image
     */
    async deleteProfileImage() {
        try {
            const response = await axios.delete(`${this.baseURL}/image`);
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Validate individual field
     */
    async validateField(fieldName, fieldValue) {
        try {
            const response = await axios.post(
                `${this.baseURL}/validate-field`,
                {
                    field_name: fieldName,
                    field_value: fieldValue,
                }
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Change password
     */
    async changePassword(passwordData) {
        try {
            const response = await axios.put(
                `${this.baseURL}/password`,
                passwordData
            );
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Update provider profile
     */
    async updateProviderProfile(data) {
        try {
            const formData = new FormData();

            // Handle basic fields
            Object.keys(data).forEach((key) => {
                if (key === "business_license" && data[key] instanceof File) {
                    formData.append("business_license", data[key]);
                } else if (
                    key === "certifications" &&
                    Array.isArray(data[key])
                ) {
                    data[key].forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append(`certifications[${index}]`, file);
                        }
                    });
                } else if (
                    key === "portfolio_images" &&
                    Array.isArray(data[key])
                ) {
                    data[key].forEach((file, index) => {
                        if (file instanceof File) {
                            formData.append(`portfolio_images[${index}]`, file);
                        }
                    });
                } else if (data[key] !== null && data[key] !== undefined) {
                    formData.append(key, data[key]);
                }
            });

            const response = await axios.post(
                `${this.baseURL}/provider`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Toggle provider availability
     */
    async toggleAvailability() {
        try {
            const response = await axios.post(
                `${this.baseURL}/provider/toggle-availability`
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Get provider statistics
     */
    async getProviderStatistics() {
        try {
            const response = await axios.get(
                `${this.baseURL}/provider/statistics`
            );
            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Delete provider document
     */
    async deleteProviderDocument(documentType, index = null) {
        try {
            const params = { document_type: documentType };
            if (index !== null) params.index = index;

            const response = await axios.delete(
                `${this.baseURL}/provider/document`,
                { params }
            );
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Reorder portfolio images
     */
    async reorderPortfolioImages(imageOrder) {
        try {
            const response = await axios.post(
                `${this.baseURL}/provider/reorder-portfolio`,
                {
                    image_order: imageOrder,
                }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Deactivate account
     */
    async deactivateAccount(reason = null) {
        try {
            const response = await axios.post(`${this.baseURL}/deactivate`, {
                reason,
            });
            return {
                success: true,
                message: response.data.message,
            };
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle API errors consistently
     */
    handleError(error) {
        console.error("ProfileService Error:", error);

        if (error.response) {
            const { status, data } = error.response;

            return {
                success: false,
                message: data.message || "An error occurred",
                errors: data.errors || {},
                status: status,
            };
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Please check your connection.",
                errors: {},
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred",
                errors: {},
            };
        }
    }
}

export default new ProfileService();
