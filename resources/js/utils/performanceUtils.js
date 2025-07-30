/**
 * Performance optimization utilities
 */

/**
 * Simple debounce function to prevent rapid API calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Request deduplication - prevents duplicate API calls
 */
class RequestDeduplicator {
    constructor() {
        this.pendingRequests = new Map();
    }

    async dedupe(key, requestFn) {
        if (this.pendingRequests.has(key)) {
            return this.pendingRequests.get(key);
        }

        const promise = requestFn().finally(() => {
            this.pendingRequests.delete(key);
        });

        this.pendingRequests.set(key, promise);
        return promise;
    }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Simple retry mechanism for failed requests
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Number of retry attempts
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise} - Promise that resolves with the result
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
    try {
        return await fn();
    } catch (error) {
        if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            return retry(fn, retries - 1, delay);
        }
        throw error;
    }
};

/**
 * Optimistic update helper
 * @param {Function} optimisticFn - Function to apply optimistic update
 * @param {Function} apiCall - API call function
 * @param {Function} revertFn - Function to revert optimistic update on failure
 * @returns {Promise} - Promise that resolves with the result
 */
export const optimisticUpdate = async (optimisticFn, apiCall, revertFn) => {
    // Apply optimistic update immediately
    optimisticFn();
    
    try {
        const result = await apiCall();
        return result;
    } catch (error) {
        // Revert optimistic update on failure
        revertFn();
        throw error;
    }
};