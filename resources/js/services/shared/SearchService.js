import BaseService from '../core/BaseService';

/**
 * Shared Search Service
 * Handles search functionality across the application
 */
class SearchService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 10 * 60 * 1000, // 10 minutes cache for search results
            enableCache: true
        });
        this.baseURL = "";
    }

    /**
     * Search services
     */
    async searchServices(query, filters = {}) {
        const params = {
            q: query,
            category_id: filters.category_id,
            location: filters.location,
            radius: filters.radius || 15,
            min_price: filters.min_price,
            max_price: filters.max_price,
            rating: filters.min_rating,
            availability: filters.availability,
            sort_by: filters.sort_by || 'relevance',
            page: filters.page || 1,
            per_page: filters.per_page || 12
        };

        return this.apiCall("GET", "/search/services", this.cleanPayload(params));
    }

    /**
     * Search providers
     */
    async searchProviders(query, filters = {}) {
        const params = {
            q: query,
            location: filters.location,
            radius: filters.radius || 15,
            specialization: filters.specialization,
            rating: filters.min_rating,
            verified: filters.verified_only,
            sort_by: filters.sort_by || 'rating',
            page: filters.page || 1,
            per_page: filters.per_page || 12
        };

        return this.apiCall("GET", "/search/providers", this.cleanPayload(params));
    }

    /**
     * Get search suggestions
     */
    async getSuggestions(query, type = 'services') {
        if (!query || query.length < 2) return { data: [] };

        return this.apiCall("GET", "/search/suggestions", {
            q: query,
            type
        });
    }

    /**
     * Get popular searches
     */
    async getPopularSearches(type = 'services', limit = 10) {
        return this.apiCall("GET", "/search/popular", {
            type,
            limit
        });
    }

    /**
     * Get recent searches for user
     */
    async getRecentSearches(limit = 10) {
        return this.apiCall("GET", "/search/recent", { limit });
    }

    /**
     * Save search query
     */
    async saveSearch(query, filters = {}) {
        return this.apiCall("POST", "/search/save", {
            query,
            filters
        });
    }

    /**
     * Delete recent search
     */
    async deleteRecentSearch(searchId) {
        return this.apiCall("DELETE", `/search/recent/${searchId}`);
    }

    /**
     * Clear all recent searches
     */
    async clearRecentSearches() {
        return this.apiCall("DELETE", "/search/recent");
    }

    /**
     * Get search filters/facets
     */
    async getSearchFilters(query = '', type = 'services') {
        return this.apiCall("GET", "/search/filters", {
            q: query,
            type
        });
    }

    /**
     * Advanced search with multiple criteria
     */
    async advancedSearch(searchCriteria) {
        const payload = {
            query: searchCriteria.query,
            type: searchCriteria.type || 'services',
            filters: searchCriteria.filters || {},
            location: searchCriteria.location,
            radius: searchCriteria.radius,
            sort_by: searchCriteria.sort_by || 'relevance',
            page: searchCriteria.page || 1,
            per_page: searchCriteria.per_page || 12
        };

        return this.apiCall("POST", "/search/advanced", this.cleanPayload(payload));
    }

    // Utility methods

    /**
     * Create debounced search function
     */
    createDebouncedSearch(callback, delay = 300) {
        return this.debounce(callback, delay);
    }

    /**
     * Build search URL for sharing
     */
    buildSearchUrl(query, filters = {}) {
        const params = new URLSearchParams();
        
        if (query) params.append('q', query);
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, value);
            }
        });

        return `/search?${params.toString()}`;
    }

    /**
     * Parse search URL parameters
     */
    parseSearchUrl(urlString) {
        const url = new URL(urlString, window.location.origin);
        const params = new URLSearchParams(url.search);
        
        const searchData = {
            query: params.get('q') || '',
            filters: {}
        };

        // Extract known filter parameters
        const knownFilters = [
            'category_id', 'location', 'radius', 'min_price', 'max_price',
            'min_rating', 'availability', 'sort_by', 'verified_only'
        ];

        knownFilters.forEach(filter => {
            const value = params.get(filter);
            if (value) {
                searchData.filters[filter] = value;
            }
        });

        return searchData;
    }

    /**
     * Format search results for display
     */
    formatSearchResults(results, type = 'services') {
        if (!results || !results.data) return results;

        const formatted = results.data.map(item => {
            if (type === 'services') {
                return this.formatServiceResult(item);
            } else if (type === 'providers') {
                return this.formatProviderResult(item);
            }
            return item;
        });

        return {
            ...results,
            data: formatted
        };
    }

    /**
     * Format service search result
     */
    formatServiceResult(service) {
        return {
            ...service,
            display_price: this.formatCurrency(service.base_price),
            rating_display: this.formatRating(service.average_rating),
            distance_display: this.formatDistance(service.distance)
        };
    }

    /**
     * Format provider search result
     */
    formatProviderResult(provider) {
        return {
            ...provider,
            rating_display: this.formatRating(provider.average_rating),
            distance_display: this.formatDistance(provider.distance),
            services_count: provider.services_count || 0
        };
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = 'USD') {
        if (!amount) return 'Contact for price';
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Format rating for display
     */
    formatRating(rating) {
        if (!rating) return 'No rating';
        
        const rounded = Math.round(rating * 10) / 10;
        return `${rounded}/5`;
    }

    /**
     * Format distance for display
     */
    formatDistance(distance) {
        if (!distance) return '';
        
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m away`;
        } else {
            return `${Math.round(distance * 10) / 10}km away`;
        }
    }

    /**
     * Validate search query
     */
    validateSearchQuery(query) {
        if (!query || typeof query !== 'string') {
            return { isValid: false, error: 'Search query is required' };
        }

        if (query.length < 2) {
            return { isValid: false, error: 'Search query must be at least 2 characters' };
        }

        if (query.length > 100) {
            return { isValid: false, error: 'Search query is too long' };
        }

        return { isValid: true };
    }
}

export default SearchService;