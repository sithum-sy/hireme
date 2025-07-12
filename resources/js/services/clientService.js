import axios from "axios";

const API_BASE = "/api/client";

class ClientService {
    // Dashboard APIs
    async getDashboardStats() {
        const response = await axios.get(`${API_BASE}/dashboard/stats`);
        return response.data;
    }

    async getRecommendations(location = null, limit = 10) {
        const params = { limit };
        if (location) {
            params.latitude = location.lat;
            params.longitude = location.lng;
            params.radius = location.radius || 15;
        }

        const response = await axios.get(
            `${API_BASE}/dashboard/recommendations`,
            { params }
        );
        return response.data;
    }

    async getRecentActivity(limit = 20) {
        const response = await axios.get(
            `${API_BASE}/dashboard/recent-activity`,
            {
                params: { limit },
            }
        );
        return response.data;
    }

    // Service Discovery APIs
    async getServices(params = {}) {
        const response = await axios.get(`${API_BASE}/services`, { params });
        return response.data;
    }

    async getPopularServices(location = null, limit = 8) {
        const params = { limit };
        if (location) {
            params.latitude = location.lat;
            params.longitude = location.lng;
            params.radius = location.radius || 20;
        }

        const response = await axios.get(`${API_BASE}/services/popular`, {
            params,
        });
        return response.data;
    }

    async getRecentServices(location = null, limit = 8) {
        const params = { limit };
        if (location) {
            params.latitude = location.lat;
            params.longitude = location.lng;
            params.radius = location.radius || 15;
        }

        const response = await axios.get(`${API_BASE}/services/recent`, {
            params,
        });
        return response.data;
    }

    async getServiceCategories(location = null) {
        const params = {};
        if (location) {
            params.latitude = location.lat;
            params.longitude = location.lng;
            params.radius = location.radius || 15;
        }

        const response = await axios.get(`${API_BASE}/services/categories`, {
            params,
        });
        return response.data;
    }

    async getServiceDetail(serviceId) {
        const response = await axios.get(`${API_BASE}/services/${serviceId}`);
        return response.data;
    }

    // Provider APIs
    async getProviders(params = {}) {
        const response = await axios.get(`${API_BASE}/providers`, { params });
        return response.data;
    }

    async getProviderDetail(providerId) {
        const response = await axios.get(`${API_BASE}/providers/${providerId}`);
        return response.data;
    }
}

export default new ClientService();
