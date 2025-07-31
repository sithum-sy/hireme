/**
 * BaseService - Common functionality for all services
 * Provides standardized error handling, caching, and response processing
 */
class BaseService {
    constructor(apiClient, options = {}) {
        this.apiClient = apiClient;
        this.cache = new Map();
        this.cacheTimeout = options.cacheTimeout || 5 * 60 * 1000; // 5 minutes default
        this.enableCache = options.enableCache !== false; // Default to enabled
    }

    /**
     * Cache management methods
     */
    getCachedData(key) {
        if (!this.enableCache) return null;
        
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        if (!this.enableCache) return;
        
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /**
     * Generic API call method with caching and error handling
     */
    async apiCall(method, endpoint, data = null, config = {}) {
        try {
            // Check cache for GET requests
            if (method.toLowerCase() === 'get' && this.enableCache) {
                const cacheKey = this.generateCacheKey(endpoint, data);
                const cached = this.getCachedData(cacheKey);
                if (cached) return cached;
            }

            const response = await this.apiClient.request({
                method,
                url: endpoint,
                data: method.toLowerCase() === 'get' ? undefined : data,
                params: method.toLowerCase() === 'get' ? data : undefined,
                ...config,
            });

            const result = this.handleResponse(response);

            // Cache successful GET responses
            if (method.toLowerCase() === 'get' && this.enableCache) {
                const cacheKey = this.generateCacheKey(endpoint, data);
                this.setCachedData(cacheKey, result);
            }

            return result;
        } catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Handle successful API responses
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
     * Handle API errors with standardized format
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
            errorResponse.message = error.response.data?.message || error.message;
            errorResponse.errors = error.response.data?.errors || {};
            errorResponse.status = error.response.status;
        } else if (error.request) {
            // Request made but no response
            errorResponse.message = "Network error. Please check your connection.";
        } else {
            // Something else happened
            errorResponse.message = error.message || "An unexpected error occurred";
        }

        // Log errors in development
        if (process.env.NODE_ENV === "development") {
            console.error("Service Error:", error);
        }

        throw errorResponse;
    }

    /**
     * Generate cache key from endpoint and parameters
     */
    generateCacheKey(endpoint, params) {
        const paramsStr = params ? JSON.stringify(params) : '';
        return `${endpoint}_${paramsStr}`;
    }

    /**
     * Debounce utility for search operations
     */
    debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Create debounced search function
     */
    createDebouncedSearch(searchFunction, delay = 300) {
        return this.debounce(searchFunction, delay);
    }

    /**
     * Transform data for API submission (removes empty values)
     */
    cleanPayload(data) {
        const cleaned = {};
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                cleaned[key] = value;
            }
        });

        return cleaned;
    }

    /**
     * Format date for API submission
     */
    formatDate(date) {
        if (!date) return null;
        
        if (typeof date === 'string') {
            return date;
        }
        
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        
        return null;
    }

    /**
     * Format time for API submission
     */
    formatTime(time) {
        if (!time) return null;
        
        if (typeof time === 'string') {
            return time;
        }
        
        return null;
    }

    /**
     * Retry mechanism for failed requests
     */
    async retry(fn, maxRetries = 3, delay = 1000) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // Don't retry on client errors (4xx)
                if (error.status && error.status >= 400 && error.status < 500) {
                    throw error;
                }
                
                if (i < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                }
            }
        }
        
        throw lastError;
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
}

export default BaseService;