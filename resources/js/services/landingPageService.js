import api from "./api";

export const landingPageService = {
    // Fetch service categories for the services section
    async getServiceCategories() {
        try {
            const response = await api.get("/service-categories");
            return response.data;
        } catch (error) {
            console.error("Error fetching service categories:", error);
            return [];
        }
    },

    // Fetch services for counting and stats
    async getServices(params = {}) {
        try {
            const response = await api.get("/services", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching services:", error);
            return { data: [], meta: {} };
        }
    },

    // Fetch basic platform statistics (this will return mock data until we create the endpoint)
    async getPlatformStats() {
        try {
            // For now, we'll fetch services and categories to get some real counts
            const [services, categories] = await Promise.all([
                this.getServices({ per_page: 1 }), // Just get meta data
                this.getServiceCategories(),
            ]);

            // Calculate basic stats from available data
            const stats = {
                totalServices: services.meta?.total || 0,
                totalCategories: categories.length || 0,
                totalProviders: services.meta?.total_providers || 100, // Mock for now
                totalClients: 500, // Mock for now
                averageRating: 4.9, // Mock for now
                completedAppointments: 1500, // Mock for now
            };

            return stats;
        } catch (error) {
            console.error("Error fetching platform stats:", error);
            // Return mock data as fallback
            return {
                totalServices: 150,
                totalCategories: 12,
                totalProviders: 100,
                totalClients: 500,
                averageRating: 4.9,
                completedAppointments: 1500,
            };
        }
    },

    // Fetch reviews/testimonials (mock data for now)
    async getTestimonials() {
        // This would eventually fetch from a real reviews API
        // For now, return the existing mock data
        return [
            {
                id: 1,
                name: "Priya Wickramasinghe",
                role: "Client",
                location: "Colombo",
                service: "Electrical Work",
                rating: 5,
                comment:
                    "Found an excellent electrician through HireMe within 15 minutes! The location-based search made it so easy to find someone nearby. Professional service and fair pricing.",
                avatar: "PW",
                verified: true,
                serviceProvider: "Kamal Fernando",
            },
            {
                id: 2,
                name: "Chaminda Perera",
                role: "Service Provider",  
                location: "Galle",
                service: "Tutoring",
                rating: 5,
                comment:
                    "As a math tutor, HireMe has completely transformed my business. I get consistent bookings, and the payment system is secure and transparent. Highly recommend for fellow educators!",
                avatar: "CP",
                verified: true,
                clientsServed: "50+",
            },
            {
                id: 3,
                name: "Sanduni Silva",
                role: "Client",
                location: "Kandy", 
                service: "Home Cleaning",
                rating: 5,
                comment:
                    "The cleaning service I found through HireMe was exceptional. The provider was verified, professional, and punctual. The app made booking and payment seamless.",
                avatar: "SS",
                verified: true,
                serviceProvider: "Clean Pro Services",
            },
        ];
    },
};

export default landingPageService;