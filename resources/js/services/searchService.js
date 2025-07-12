import axios from "axios";

const API_BASE = "/api/client";

class SearchService {
    // Search APIs
    async searchServices(searchParams) {
        const response = await axios.get(`${API_BASE}/services/search`, {
            params: searchParams,
        });
        return response.data;
    }

    async getSearchSuggestions(query) {
        const response = await axios.get(`${API_BASE}/search/suggestions`, {
            params: { q: query },
        });
        return response.data;
    }

    async getPopularSearches() {
        const response = await axios.get(`${API_BASE}/search/popular`);
        return response.data;
    }

    async trackSearch(searchData) {
        const response = await axios.post(
            `${API_BASE}/search/track`,
            searchData
        );
        return response.data;
    }

    // Provider search
    async searchProviders(searchParams) {
        const response = await axios.get(`${API_BASE}/providers/search`, {
            params: searchParams,
        });
        return response.data;
    }
}

export default new SearchService();
