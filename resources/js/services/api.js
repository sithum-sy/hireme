import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
    baseURL: "/api",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirect to login on unauthorized
            localStorage.removeItem("auth_token");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Profile API endpoints
export const profileAPI = {
    // Get profile data
    getProfile: () => api.get("/profile"),

    // Update profile
    updateProfile: (data) => api.put("/profile", data),

    // Get profile configuration
    getConfig: () => api.get("/profile/config"),

    // Validate field
    validateField: (field, value) =>
        api.post("/profile/validate-field", { field, value }),

    // Upload profile image
    uploadImage: (file) => {
        const formData = new FormData();
        formData.append("image", file);
        return api.post("/profile/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Delete profile image
    deleteImage: () => api.delete("/profile/image"),

    // Change password
    changePassword: (data) => api.post("/profile/change-password", data),
};

// Provider profile API endpoints
export const providerProfileAPI = {
    // Get provider profile
    getProfile: () => api.get("/provider-profile"),

    // Update provider profile
    updateProfile: (data) => api.put("/provider-profile", data),

    // Toggle availability
    toggleAvailability: () => api.post("/provider-profile/toggle-availability"),

    // Get statistics
    getStatistics: () => api.get("/provider-profile/statistics"),

    // Upload documents
    uploadDocuments: (files) => {
        const formData = new FormData();

        // Add files to form data
        Object.keys(files).forEach((key) => {
            if (Array.isArray(files[key])) {
                files[key].forEach((file) => {
                    formData.append(`${key}[]`, file);
                });
            } else {
                formData.append(key, files[key]);
            }
        });

        return api.post("/provider-profile/documents", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },

    // Delete document
    deleteDocument: (type, index = null) =>
        api.delete("/provider-profile/documents", {
            data: { type, index },
        }),
};

export default api;
