import axios from "axios";

/**
 * Centralized API Client
 * Handles authentication, request/response interceptors, and error handling
 */
class ApiClient {
    constructor(baseURL = "/api") {
        this.client = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
            timeout: 30000, // 30 seconds timeout
        });

        this.setupInterceptors();
    }

    /**
     * Setup request and response interceptors
     */
    setupInterceptors() {
        // Request interceptor - Add auth token
        this.client.interceptors.request.use(
            (config) => {
                const token = this.getAuthToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - Handle common responses
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                // Handle authentication errors
                if (error.response?.status === 401) {
                    this.handleUnauthorized();
                }

                // Handle rate limiting with retry suggestions
                if (error.response?.status === 429) {
                    const retryAfter = error.response.headers['retry-after'];
                    if (retryAfter) {
                        error.retryAfter = parseInt(retryAfter);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Get authentication token from storage
     */
    getAuthToken() {
        return localStorage.getItem("auth_token");
    }

    /**
     * Handle unauthorized responses
     */
    handleUnauthorized() {
        localStorage.removeItem("auth_token");
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
            window.location.href = "/login";
        }
    }

    /**
     * Main request method
     */
    async request(config) {
        return this.client.request(config);
    }

    /**
     * GET request
     */
    async get(url, params = null, config = {}) {
        return this.client.get(url, { 
            params, 
            ...config 
        });
    }

    /**
     * POST request
     */
    async post(url, data = null, config = {}) {
        return this.client.post(url, data, config);
    }

    /**
     * PUT request
     */
    async put(url, data = null, config = {}) {
        return this.client.put(url, data, config);
    }

    /**
     * PATCH request
     */
    async patch(url, data = null, config = {}) {
        return this.client.patch(url, data, config);
    }

    /**
     * DELETE request
     */
    async delete(url, config = {}) {
        return this.client.delete(url, config);
    }

    /**
     * Upload file with progress tracking
     */
    async upload(url, formData, onProgress = null) {
        const config = {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        };

        if (onProgress) {
            config.onUploadProgress = (progressEvent) => {
                const progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                );
                onProgress(progress);
            };
        }

        return this.client.post(url, formData, config);
    }

    /**
     * Set custom header for all requests
     */
    setHeader(key, value) {
        this.client.defaults.headers.common[key] = value;
    }

    /**
     * Remove custom header
     */
    removeHeader(key) {
        delete this.client.defaults.headers.common[key];
    }

    /**
     * Update base URL
     */
    setBaseURL(baseURL) {
        this.client.defaults.baseURL = baseURL;
    }

    /**
     * Create a new client instance with different base URL
     */
    createInstance(baseURL, config = {}) {
        return new ApiClient(baseURL, config);
    }
}

// Create and export default instance
const apiClient = new ApiClient();

export default apiClient;
export { ApiClient };