import axios from "axios";
import clientAppointmentService from "./clientAppointmentService";
import paymentService from "./paymentService";
import reviewService from "./reviewService";

const API_BASE = "/api/client";

class ClientService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Cache helper
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
        });
    }

    // Dashboard APIs
    // async getDashboardStats() {
    //     const response = await axios.get(`${API_BASE}/dashboard/stats`);
    //     return response.data;
    // }
    async getDashboardStats() {
        const cacheKey = "dashboard_stats";
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(`${API_BASE}/dashboard/stats`);
            this.setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                // Return cached data if available, even if expired
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    // async getRecommendations(location = null, limit = 10) {
    //     const params = { limit };
    //     if (location) {
    //         params.latitude = location.lat;
    //         params.longitude = location.lng;
    //         params.radius = location.radius || 15;
    //     }

    //     const response = await axios.get(
    //         `${API_BASE}/dashboard/recommendations`,
    //         { params }
    //     );
    //     return response.data;
    // }
    async getRecommendations(params = {}) {
        const cacheKey = `recommendations_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(
                `${API_BASE}/dashboard/recommendations`,
                {
                    params,
                }
            );
            this.setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
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

    // async getPopularServices(location = null, limit = 8) {
    //     const params = { limit };
    //     if (location) {
    //         params.latitude = location.lat;
    //         params.longitude = location.lng;
    //         params.radius = location.radius || 20;
    //     }

    //     const response = await axios.get(`${API_BASE}/services/popular`, {
    //         params,
    //     });
    //     return response.data;
    // }
    async getPopularServices(params = {}) {
        const cacheKey = `popular_services_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(`${API_BASE}/services/popular`, {
                params,
            });
            this.setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    // async getRecentServices(location = null, limit = 8) {
    //     const params = { limit };
    //     if (location) {
    //         params.latitude = location.lat;
    //         params.longitude = location.lng;
    //         params.radius = location.radius || 15;
    //     }

    //     const response = await axios.get(`${API_BASE}/services/recent`, {
    //         params,
    //     });
    //     return response.data;
    // }
    async getRecentServices(params = {}) {
        const cacheKey = `recent_services_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(`${API_BASE}/services/recent`, {
                params,
            });
            this.setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    // async getServiceCategories(location = null) {
    //     const params = {};
    //     if (location) {
    //         params.latitude = location.lat;
    //         params.longitude = location.lng;
    //         params.radius = location.radius || 15;
    //     }

    //     const response = await axios.get(`${API_BASE}/services/categories`, {
    //         params,
    //     });
    //     return response.data;
    // }
    async getServiceCategories(params = {}) {
        const cacheKey = `service_categories_${JSON.stringify(params)}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const response = await axios.get(
                `${API_BASE}/services/categories`,
                {
                    params,
                }
            );
            this.setCachedData(cacheKey, response.data);
            return response.data;
        } catch (error) {
            if (error.response?.status === 429) {
                const cached = this.cache.get(cacheKey);
                if (cached) return cached.data;
            }
            throw error;
        }
    }

    async getServiceDetail(serviceId, locationParams = null) {
        try {
            // Build URL with location parameters if provided
            let url = `${API_BASE}/services/${serviceId}`;

            if (locationParams && locationParams.lat && locationParams.lng) {
                const params = new URLSearchParams({
                    latitude: locationParams.lat,
                    longitude: locationParams.lng,
                });
                url += `?${params.toString()}`;
            }

            const response = await axios.get(url);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: {
                        service: response.data.data,
                        provider: response.data.provider,
                        is_favorite: response.data.is_favorite || false,
                    },
                    message: response.data.message,
                };
            } else {
                throw new Error(response.data.message || "Service not found");
            }
        } catch (error) {
            console.warn("Service detail endpoint error:", error);
            console.log("Using fallback data for service ID:", serviceId);

            // Enhanced fallback to include distance calculation if location provided
            const fallbackService = this.getFallbackServiceDetail(serviceId);

            // Calculate distance for fallback if location is provided
            if (
                locationParams &&
                locationParams.lat &&
                locationParams.lng &&
                fallbackService.location
            ) {
                const distance = this.calculateDistance(
                    locationParams.lat,
                    locationParams.lng,
                    parseFloat(fallbackService.location.lat),
                    parseFloat(fallbackService.location.lng)
                );
                fallbackService.distance = distance;
                console.log("Fallback calculated distance:", distance);
            }

            return {
                success: true,
                data: {
                    service: fallbackService,
                    provider: this.getFallbackProvider(),
                    is_favorite: false,
                },
                message: "Service loaded (fallback mode)",
                fallback: true,
            };
        }
    }

    // distance calculation helper method
    calculateDistance(lat1, lon1, lat2, lon2) {
        const earthRadius = 6371; // Earth radius in kilometers

        const latDiff = (lat2 - lat1) * (Math.PI / 180);
        const lonDiff = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(lonDiff / 2) *
                Math.sin(lonDiff / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = earthRadius * c;

        return Math.round(distance * 100) / 100; // Round to 2 decimal places
    }

    async getQuoteDetail(quoteId) {
        try {
            const response = await axios.get(`${API_BASE}/quotes/${quoteId}`);

            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: this.formatQuoteData(response.data.data),
                    message:
                        response.data.message ||
                        "Quote details loaded successfully",
                };
            } else {
                throw new Error(response.data.message || "Quote not found");
            }
        } catch (error) {
            console.error("Failed to fetch quote detail:", error);

            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: "Quote not found",
                    status: 404,
                };
            }

            // Return fallback quote detail for development
            return {
                success: true,
                data: this.getFallbackQuoteDetail(quoteId),
                message: "Quote details loaded (fallback mode)",
                fallback: true,
            };
        }
    }

    formatQuoteData(quoteData) {
        return {
            id: quoteData.id,
            quote_number: quoteData.quote_number,
            status: quoteData.status,

            service_id: quoteData.service_id,
            provider_id: quoteData.provider_id,

            // Service information
            service_title: quoteData.service?.title || quoteData.service_title,
            service_description:
                quoteData.service?.description ||
                quoteData.service_description ||
                "Service description not available",
            service_image:
                quoteData.service?.first_image_url || quoteData.service_image,
            service_category: quoteData.service_category,

            provider_name: quoteData.provider?.name || quoteData.provider_name,
            provider_business_name: quoteData.provider_business_name, // Real business name
            provider_image:
                quoteData.provider?.profile_image_url ||
                quoteData.provider_image,
            provider_rating: quoteData.provider_rating || 0,
            provider_reviews: quoteData.provider_reviews || 0,
            provider_bio: quoteData.provider_bio,
            provider_verified: quoteData.provider_verified || false,

            // Request details
            message: quoteData.message,
            special_requirements: quoteData.special_requirements,
            location_summary:
                quoteData.location_summary ||
                `${quoteData.city || "Not specified"}`,
            // urgency: quoteData.urgency,
            requested_date: quoteData.requested_date,
            requested_time: quoteData.requested_time,

            // Quote response details
            quoted_price: quoteData.quoted_price,
            travel_fee: quoteData.travel_fee || 0,
            estimated_duration: quoteData.estimated_duration,
            provider_response: quoteData.provider_response,
            quote_notes: quoteData.quote_notes,
            validity_days: quoteData.validity_days,
            expires_at: quoteData.expires_at,

            // Timestamps
            created_at: quoteData.created_at,
            updated_at: quoteData.updated_at,
            quoted_at: quoteData.quoted_at,
            accepted_at: quoteData.accepted_at,
            declined_at: quoteData.declined_at,
            withdrawn_at: quoteData.withdrawn_at,
        };
    }

    getFallbackQuoteDetail(quoteId) {
        return {
            id: quoteId,
            quote_number: `Q${String(quoteId).padStart(6, "0")}`,
            status: "quoted",

            // ADD THESE MISSING FIELDS FOR FALLBACK:
            service_id: 1, // Use a default service ID for fallback
            provider_id: 1, // Use a default provider ID for fallback

            service_title: "Professional House Cleaning Service",
            service_description:
                "Complete house cleaning including all rooms, kitchen, and bathrooms",
            service_image: null,
            provider_name: "Clean Masters",
            provider_image: null,
            provider_rating: 4.8,
            provider_reviews: 45,
            message:
                "I need a thorough cleaning of my 3-bedroom house. Kitchen needs deep cleaning and bathrooms need sanitization.",
            special_requirements:
                "Please use eco-friendly products. I have a pet cat.",
            location_summary: "Colombo 07",
            urgency: "normal",
            requested_date: "2025-07-20",
            requested_time: "10:00 AM",
            quoted_price: 4500,
            travel_fee: 300,
            estimated_duration: 3,
            provider_response:
                "Thank you for your request. I can provide a comprehensive cleaning service for your 3-bedroom house using eco-friendly products that are safe for pets.",
            quote_notes:
                "I will bring all necessary equipment and eco-friendly cleaning supplies.",
            validity_days: 7,
            expires_at: "2025-07-25T23:59:59Z",
            created_at: "2025-07-12T10:00:00Z",
            updated_at: "2025-07-13T14:30:00Z",
            quoted_at: "2025-07-13T14:30:00Z",
        };
    }

    // Add method to format service data from Laravel backend
    formatServiceData(serviceData) {
        return {
            id: serviceData.id,
            title: serviceData.title,
            description: serviceData.description,
            price: serviceData.base_price,
            formatted_price:
                serviceData.formatted_price || `Rs. ${serviceData.base_price}`,
            pricing_type: serviceData.pricing_type,
            duration: serviceData.duration_hours
                ? `${serviceData.duration_hours} hours`
                : "Varies",
            service_location: "At your location", // Default, can be dynamic
            cancellation_policy: "Free cancellation up to 24 hours",
            languages: ["English", "Sinhala"], // Default, can be from provider profile

            // Category data
            category: {
                id: serviceData.category?.id,
                name: serviceData.category?.name,
                color: serviceData.category?.color || "primary",
                icon: serviceData.category?.icon || "fas fa-cog",
            },

            // Images
            images: serviceData.service_image_urls || [],
            first_image_url: serviceData.first_image_url,

            // Features and requirements from JSON fields
            features: this.parseJsonField(serviceData.includes) || [
                "Professional service",
                "Quality guaranteed",
                "Experienced provider",
            ],
            requirements: this.parseJsonField(serviceData.requirements) || [
                "Access to service area",
                "Someone present during service",
            ],

            // Ratings and availability
            average_rating: serviceData.average_rating || 0,
            reviews_count: serviceData.total_reviews || 0,
            availability_status: "available", // This should come from provider availability
            next_available: "Today",
            default_duration: serviceData.duration_hours || 1,

            // Location data
            distance: serviceData.distance, // If calculated by backend
            location: serviceData.location, // From your Service model's getLocationAttribute
        };
    }

    // Add method to format provider data from Laravel backend
    formatProviderData(providerData) {
        if (!providerData) return this.getFallbackProvider();

        return {
            id: providerData.id || providerData.user_id,
            name:
                providerData.business_name ||
                `${providerData.first_name || ""} ${
                    providerData.last_name || ""
                }`.trim() ||
                "Service Provider",
            profile_image_url: providerData.profile_image_url,
            bio:
                providerData.bio ||
                providerData.description ||
                "Professional service provider",
            is_verified: providerData.is_verified || false,

            // Location data
            city: providerData.city || "Colombo",
            province: providerData.province || "Western Province",
            service_radius: providerData.service_radius || 25,
            travel_fee: providerData.travel_fee || 0,

            // Stats
            average_rating: providerData.average_rating || 0,
            reviews_count: providerData.total_reviews || 0,
            total_services: providerData.total_services || 0,
            completed_bookings: providerData.completed_bookings || 0,
            years_experience: providerData.years_experience || 0,
            response_time: providerData.response_time || "2 hours",

            // Other services (if provided by backend)
            other_services: providerData.other_services || [],
        };
    }

    // Helper method to parse JSON fields
    parseJsonField(jsonString) {
        if (!jsonString) return null;

        try {
            if (typeof jsonString === "string") {
                return JSON.parse(jsonString);
            }
            return Array.isArray(jsonString) ? jsonString : null;
        } catch (error) {
            console.warn("Failed to parse JSON field:", jsonString);
            return null;
        }
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

    // async getServiceReviews(serviceId, params = {}) {
    //     try {
    //         const response = await axios.get(
    //             `${API_BASE}/services/${serviceId}/reviews`,
    //             { params }
    //         );

    //         return {
    //             success: true,
    //             data: response.data.data || response.data,
    //             meta: response.data.meta,
    //             message: response.data.message || "Reviews loaded successfully",
    //         };
    //     } catch (error) {
    //         console.error("Failed to load service reviews:", error);

    //         // If the endpoint fails, you can still return fallback data
    //         return {
    //             success: true,
    //             data: {
    //                 data: this.getFallbackReviews(),
    //                 meta: { current_page: 1, last_page: 1, total: 2 },
    //             },
    //             message: "Reviews loaded (fallback mode)",
    //             fallback: true,
    //         };
    //     }
    // }

    // Update your getServiceReviews method in clientService.js
    async getServiceReviews(serviceId, params = {}) {
        // console.log(" Getting service reviews for service ID:", serviceId);
        // console.log(" With params:", params);

        try {
            const url = `${API_BASE}/services/${serviceId}/reviews`;
            // console.log(" Request URL:", url);

            const response = await axios.get(url, { params });

            // console.log(" Response status:", response.status);
            // console.log(" Response data:", response.data);

            return {
                success: true,
                data: response.data.data || response.data,
                meta: response.data.meta,
                message: response.data.message || "Reviews loaded successfully",
            };
        } catch (error) {
            console.error("Service reviews error:", error);
            console.error("Error response:", error.response?.data);
            console.error("Error status:", error.response?.status);

            // Return fallback data
            return {
                success: true,
                data: {
                    data: this.getFallbackReviews(),
                    meta: { current_page: 1, last_page: 1, total: 2 },
                },
                message: "Reviews loaded (fallback mode)",
                fallback: true,
            };
        }
    }

    async getSimilarServices(params = {}) {
        try {
            // Use the existing similar services endpoint
            const response = await axios.get(
                `${API_BASE}/services/${params.exclude_service_id}/similar`,
                {
                    params: {
                        latitude: params.latitude,
                        longitude: params.longitude,
                        radius: params.radius,
                        limit: params.limit,
                    },
                }
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || "Similar services loaded",
            };
        } catch (error) {
            console.warn(
                "Similar services endpoint not available, using fallback"
            );

            return {
                success: true,
                data: this.getFallbackSimilarServices(),
                message: "Similar services loaded (fallback mode)",
                fallback: true,
            };
        }
    }

    async toggleFavorite(serviceId) {
        try {
            const response = await axios.post(
                `${API_BASE}/services/${serviceId}/favorite`
            );
            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn(
                "Toggle favorite endpoint not available, using fallback"
            );

            return {
                success: true,
                data: { is_favorite: true },
                message: "Added to favorites (fallback mode)",
                fallback: true,
            };
        }
    }

    // Enhanced booking creation with proper error handling and field mapping
    // async createBooking(bookingData) {
    //     try {
    //         // Check availability before booking if it's a direct appointment
    //         if (
    //             bookingData.appointment_date &&
    //             bookingData.appointment_time &&
    //             !bookingData.request_quote
    //         ) {
    //             console.log("Checking availability before booking...");

    //             // Use the existing provider availability endpoint instead
    //             const endTime = this.calculateEndTime(
    //                 bookingData.appointment_time,
    //                 bookingData.duration_hours || 1
    //             );

    //             const availabilityCheck = await axios.post(
    //                 "/api/appointments/check-availability",
    //                 {
    //                     provider_id: bookingData.provider_id,
    //                     appointment_date: bookingData.appointment_date,
    //                     appointment_time: bookingData.appointment_time,
    //                     duration_hours: bookingData.duration_hours || 1,
    //                 }
    //             );

    //             if (
    //                 !availabilityCheck.data.success ||
    //                 !availabilityCheck.data.data.available
    //             ) {
    //                 return {
    //                     success: false,
    //                     message:
    //                         "Selected time slot is no longer available. Please choose a different time.",
    //                     availability_info: availabilityCheck.data.data,
    //                 };
    //             }
    //         }

    //         // Proceed with booking
    //         const response = await axios.post(
    //             `${API_BASE}/appointments`,
    //             bookingData
    //         );

    //         return {
    //             success: true,
    //             data: response.data.data || response.data,
    //             message:
    //                 response.data.message || "Booking created successfully",
    //         };
    //     } catch (error) {
    //         console.error("ClientService - Create booking error:", error);
    //         return {
    //             success: false,
    //             message:
    //                 error.response?.data?.message || "Failed to create booking",
    //             errors: error.response?.data?.errors || {},
    //         };
    //     }
    // }
    // async createBooking(bookingData) {
    //     try {
    //         console.log("Creating booking with data:", bookingData);

    //         // Check if this is a quote acceptance booking
    //         if (bookingData.isFromQuote && bookingData.quote_id) {
    //             console.log("Creating appointment from quote...");

    //             // Use the quote-specific endpoint
    //             const response = await axios.post(
    //                 `${API_BASE}/quotes/${bookingData.quote_id}/create-appointment`,
    //                 bookingData
    //             );

    //             return {
    //                 success: true,
    //                 data: response.data.data || response.data,
    //                 message:
    //                     response.data.message ||
    //                     "Appointment created from quote successfully",
    //             };
    //         }

    //         // Regular booking flow - ensure service_id is present
    //         if (!bookingData.service_id) {
    //             return {
    //                 success: false,
    //                 message: "Service ID is required for booking",
    //                 errors: { service_id: ["Service ID is required"] },
    //             };
    //         }

    //         // Check availability before booking if it's a direct appointment
    //         if (
    //             bookingData.appointment_date &&
    //             bookingData.appointment_time &&
    //             !bookingData.request_quote
    //         ) {
    //             console.log("Checking availability before booking...");

    //             // Use the existing provider availability endpoint instead
    //             const endTime = this.calculateEndTime(
    //                 bookingData.appointment_time,
    //                 bookingData.duration_hours || 1
    //             );

    //             const availabilityCheck = await axios.get(
    //                 `/api/client/providers/${bookingData.provider_id}/availability/check`,
    //                 {
    //                     params: {
    //                         date: bookingData.appointment_date,
    //                         start_time: bookingData.appointment_time,
    //                         end_time: endTime,
    //                     },
    //                 }
    //             );

    //             if (
    //                 !availabilityCheck.data.success ||
    //                 !availabilityCheck.data.data.available
    //             ) {
    //                 return {
    //                     success: false,
    //                     message:
    //                         "Selected time slot is no longer available. Please choose a different time.",
    //                     availability_info: availabilityCheck.data.data,
    //                 };
    //             }
    //         }

    //         // Proceed with booking
    //         const response = await axios.post(
    //             `${API_BASE}/bookings`,
    //             bookingData
    //         );

    //         return {
    //             success: true,
    //             data: response.data.data || response.data,
    //             message:
    //                 response.data.message || "Booking created successfully",
    //         };
    //     } catch (error) {
    //         console.error("ClientService - Create booking error:", error);

    //         // Log detailed error for debugging
    //         if (error.response) {
    //             console.error("Error response:", error.response.data);
    //             console.error("Error status:", error.response.status);
    //             console.error("Request data sent:", error.config?.data);
    //         }

    //         return {
    //             success: false,
    //             message:
    //                 error.response?.data?.message || "Failed to create booking",
    //             errors: error.response?.data?.errors || {},
    //         };
    //     }
    // }

    async createBooking(bookingData) {
        try {
            // console.log("Creating booking with data:", bookingData);

            // Log specifically the quote-related fields
            // console.log("Quote-related fields:", {
            //     quote_id: bookingData.quote_id,
            //     isFromQuote: bookingData.isFromQuote,
            //     booking_source: bookingData.booking_source,
            // });

            // Check if this is a quote acceptance booking
            if (bookingData.isFromQuote && bookingData.quote_id) {
                console.log("Creating appointment from quote...");

                // Map the booking data to the format expected by the quote acceptance endpoint
                const appointmentData = {
                    appointment_date: bookingData.appointment_date,
                    appointment_time: bookingData.appointment_time,
                    duration_hours: parseFloat(bookingData.duration_hours) || 1,
                    client_phone: bookingData.client_phone || "",
                    client_email: bookingData.client_email || "",
                    client_address: bookingData.client_address || "",
                    client_city: bookingData.client_city || "",
                    client_postal_code: bookingData.client_postal_code || "",
                    location_instructions:
                        bookingData.location_instructions || "",
                    client_notes: bookingData.client_notes || "",
                    contact_preference:
                        bookingData.contact_preference || "phone",
                    emergency_contact: bookingData.emergency_contact || "",
                    payment_method: bookingData.payment_method || "cash",
                    agreed_to_terms: bookingData.agreed_to_terms || true,
                    location_type:
                        bookingData.location_type || "client_address",
                };

                // Use the quote-specific endpoint
                const response = await axios.post(
                    `/api/client/quotes/${bookingData.quote_id}/create-appointment`,
                    appointmentData
                );

                return {
                    success: true,
                    type: "quote_acceptance",
                    data: response.data.data || response.data,
                    message:
                        response.data.message ||
                        "Quote accepted and appointment created successfully",
                };
            }

            // Regular booking flow - ensure service_id is present
            if (!bookingData.service_id) {
                return {
                    success: false,
                    message: "Service ID is required for booking",
                    errors: { service_id: ["Service ID is required"] },
                };
            }

            // Check availability before booking if it's a direct appointment
            if (
                bookingData.appointment_date &&
                bookingData.appointment_time &&
                !bookingData.request_quote
            ) {
                // console.log("Checking availability before booking...");

                const endTime = this.calculateEndTime(
                    bookingData.appointment_time,
                    bookingData.duration_hours || 1
                );

                const availabilityCheck = await axios.get(
                    `/api/client/providers/${bookingData.provider_id}/availability/check`,
                    {
                        params: {
                            date: bookingData.appointment_date,
                            start_time: bookingData.appointment_time,
                            end_time: endTime,
                        },
                    }
                );

                if (
                    !availabilityCheck.data.success ||
                    !availabilityCheck.data.data.available
                ) {
                    return {
                        success: false,
                        message:
                            "Selected time slot is no longer available. Please choose a different time.",
                        availability_info: availabilityCheck.data.data,
                    };
                }
            }

            // Proceed with regular booking
            const response = await axios.post(
                `${API_BASE}/bookings`,
                bookingData
            );

            return {
                success: true,
                type: "appointment",
                data: response.data.data || response.data,
                appointment: response.data.data || response.data,
                message:
                    response.data.message || "Booking created successfully",
            };
        } catch (error) {
            console.error("ClientService - Create booking error:", error);

            // Log detailed error for debugging
            if (error.response) {
                console.error("Error response:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Request data sent:", error.config?.data);
            }

            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to create booking",
                errors: error.response?.data?.errors || {},
            };
        }
    }

    // Helper method
    calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const totalMinutes = hours * 60 + minutes + duration * 60;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;

        return `${String(endHours).padStart(2, "0")}:${String(
            endMinutes
        ).padStart(2, "0")}`;
    }

    // Enhanced quote request method
    async requestQuote(quoteData) {
        try {
            console.log("ClientService - Creating quote request:", quoteData);

            const cleanedData = {
                service_id: parseInt(quoteData.service_id),
                provider_id: parseInt(quoteData.provider_id),
                message: quoteData.message || "",
                requested_date: quoteData.requested_date,
                requested_time: quoteData.requested_time,
                location_type: quoteData.location_type || "client_address",
                address: quoteData.address || "",
                city: quoteData.city || "",
                phone: quoteData.phone || "",
                email: quoteData.email || "",
                special_requirements: quoteData.special_requirements || "",
                quote_type: quoteData.quote_type || "standard",
            };

            const response = await axios.post(
                `${API_BASE}/quotes/request`,
                cleanedData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    timeout: 30000,
                }
            );

            if (response.data && response.data.success !== false) {
                return {
                    success: true,
                    data: response.data.data || response.data,
                    message:
                        response.data.message ||
                        "Quote request sent successfully",
                };
            } else {
                throw new Error(
                    response.data.message || "Quote request failed"
                );
            }
        } catch (error) {
            console.error("ClientService - Quote request error:", error);

            if (error.response) {
                const serverError = error.response.data;
                return {
                    success: false,
                    message: serverError.message || "Server error occurred",
                    errors: serverError.errors || {},
                    status: error.response.status,
                };
            } else if (error.request) {
                return {
                    success: false,
                    message:
                        "Network error. Please check your connection and try again.",
                    errors: {},
                };
            } else {
                return {
                    success: false,
                    message: error.message || "An unexpected error occurred",
                    errors: {},
                };
            }
        }
    }

    async acceptQuote(quoteId, options = {}) {
        try {
            console.log("ClientService - Accepting quote:", quoteId, options);

            const requestData = {
                notes: options.notes || "",
                create_appointment: options.create_appointment || false,
            };

            // Add appointment details if creating appointment
            if (options.create_appointment && options.appointment_details) {
                requestData.appointment_details = {
                    // appointment_date:
                    //     options.appointment_details.appointment_date,
                    // appointment_time:
                    //     options.appointment_details.appointment_time,
                    date: options.appointment_details.date,
                    time: options.appointment_details.time,
                    duration:
                        parseFloat(options.appointment_details.duration) || 1,
                    provider_id: options.appointment_details.provider_id,
                    service_id: options.appointment_details.service_id,
                };
            }

            const response = await axios.patch(
                `${API_BASE}/quotes/${quoteId}/accept`,
                requestData
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || "Quote accepted successfully",
            };
        } catch (error) {
            console.error("ClientService - Accept quote error:", error);

            // Log detailed error for debugging
            if (error.response) {
                console.error("Error response:", error.response.data);
                console.error("Error status:", error.response.status);
            }

            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to accept quote",
                errors: error.response?.data?.errors || {},
            };
        }
    }

    async declineQuote(quoteId, options = {}) {
        try {
            const response = await axios.patch(
                `${API_BASE}/quotes/${quoteId}/decline`,
                {
                    reason: options.reason || "",
                    notes: options.notes || "",
                }
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message || "Quote declined successfully",
            };
        } catch (error) {
            console.error("ClientService - Decline quote error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message || "Failed to decline quote",
                errors: error.response?.data?.errors || {},
            };
        }
    }

    async getQuotes(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/quotes`, { params });

            // Handle count-only requests
            if (params.count_only) {
                return {
                    success: true,
                    count:
                        response.data.total || response.data.data?.length || 0,
                    data: response.data.data || [],
                    message: "Quote count loaded",
                };
            }

            return {
                success: true,
                data: response.data.data || response.data,
                message: response.data.message,
            };
        } catch (error) {
            console.warn("Quotes endpoint not available, using fallback");

            // Enhanced fallback data based on status
            const fallbackData = this.getFallbackQuotes(params.status);

            return {
                success: true,
                data: fallbackData,
                count: fallbackData.length,
                message: "Quotes loaded (fallback mode)",
                fallback: true,
            };
        }
    }

    /**
     * Get appointment with payment and review data
     */
    async getAppointmentDetails(appointmentId) {
        return await clientAppointmentService.getAppointment(appointmentId);
    }

    /**
     * Process payment for appointment
     */
    async payAppointmentInvoice(appointmentId, paymentData) {
        return await paymentService.processAppointmentPayment(
            appointmentId,
            paymentData
        );
    }

    /**
     * Submit appointment review
     */
    async submitAppointmentReview(appointmentId, reviewData) {
        return await reviewService.submitReview(appointmentId, reviewData);
    }

    /**
     * Get dashboard data with payment info
     */
    async getEnhancedDashboardStats() {
        try {
            const [statsResponse, appointmentsResponse] = await Promise.all([
                this.getDashboardStats(),
                clientAppointmentService.getAppointments({ per_page: 5 }),
            ]);

            return {
                success: true,
                data: {
                    stats: statsResponse.data,
                    recent_appointments: appointmentsResponse.data?.data || [],
                },
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to load dashboard data",
            };
        }
    }

    getFallbackQuotes(status = "pending") {
        const allQuotes = [
            {
                id: 1,
                quote_number: "Q123456",
                service_title: "Professional House Cleaning",
                provider_name: "Clean Masters",
                status: "pending",
                requested_date: "2025-07-15",
                location_summary: "Colombo 07",
                quoted_price: null,
                created_at: "2025-07-12T10:00:00Z",
            },
            {
                id: 2,
                quote_number: "Q123457",
                service_title: "Garden Maintenance",
                provider_name: "Green Thumb Services",
                status: "quoted",
                requested_date: "2025-07-18",
                location_summary: "Nugegoda",
                quoted_price: 4500,
                created_at: "2025-07-11T14:30:00Z",
            },
        ];

        return allQuotes.filter((quote) => quote.status === status);
    }

    // Fallback data methods
    getFallbackReviews() {
        return [
            {
                id: 1,
                rating: 5,
                comment: "Excellent service! Very professional and punctual.",
                client: {
                    name: "Sarah Johnson",
                    profile_image_url: null,
                },
                is_verified_purchase: true,
                created_at: "2025-07-10T08:00:00Z",
                helpful_count: 3,
                images: [],
                provider_response: null,
            },
            {
                id: 2,
                rating: 4,
                comment: "Good quality work. Would recommend to others.",
                client: {
                    name: "Mike Chen",
                    profile_image_url: null,
                },
                is_verified_purchase: true,
                created_at: "2025-07-08T14:30:00Z",
                helpful_count: 1,
                images: [],
                provider_response: {
                    message: "Thank you for your feedback!",
                    created_at: "2025-07-09T09:00:00Z",
                },
            },
        ];
    }

    getFallbackSimilarServices() {
        return [
            {
                id: 2,
                title: "Professional House Cleaning",
                description: "Deep cleaning service for your home",
                price: 2500,
                formatted_price: "Rs. 2,500",
                category: {
                    id: 1,
                    name: "Cleaning",
                    color: "success",
                    icon: "fas fa-broom",
                },
                first_image_url: null,
                average_rating: 4.8,
                reviews_count: 24,
                business_name: "Clean Pro Services",
                provider: { name: "Clean Pro Services", is_verified: true },
            },
            {
                id: 3,
                title: "Office Cleaning Service",
                description: "Commercial cleaning for offices",
                price: 3000,
                formatted_price: "Rs. 3,000",
                category: {
                    id: 1,
                    name: "Cleaning",
                    color: "success",
                    icon: "fas fa-broom",
                },
                first_image_url: null,
                average_rating: 4.6,
                reviews_count: 18,
                business_name: "Office Clean Co",
                provider: { name: "Office Clean Co", is_verified: true },
            },
        ];
    }

    getFallbackServiceDetail(serviceId) {
        return {
            id: serviceId,
            title: "Professional House Cleaning Service",
            description:
                "Complete house cleaning service including all rooms, kitchen, and bathrooms. We use eco-friendly products and professional equipment to ensure your home is spotless.",
            price: 3500,
            formatted_price: "Rs. 3,500",
            original_price: 4000,
            pricing_type: "service",
            duration: "2-3 hours",
            service_location: "At your location",
            cancellation_policy: "Free cancellation up to 24 hours",
            languages: ["English", "Sinhala"],
            category: {
                id: 1,
                name: "House Cleaning",
                color: "success",
                icon: "fas fa-broom",
            },
            images: [
                {
                    url: "/images/cleaning-1.jpg",
                    alt: "Professional cleaning service",
                },
                { url: "/images/cleaning-2.jpg", alt: "Clean house interior" },
            ],
            first_image_url: "/images/cleaning-1.jpg",
            features: [
                "All rooms cleaning",
                "Kitchen deep clean",
                "Bathroom sanitization",
                "Eco-friendly products",
                "Professional equipment",
                "Insured service",
            ],
            requirements: [
                "Access to all areas to be cleaned",
                "Parking space for service vehicle",
                "Someone present during service",
            ],
            add_ons: [
                {
                    id: 1,
                    name: "Carpet Cleaning",
                    description: "Deep carpet cleaning service",
                    price: 1500,
                },
                {
                    id: 2,
                    name: "Window Cleaning",
                    description: "Interior and exterior window cleaning",
                    price: 1000,
                },
            ],
            average_rating: 4.8,
            reviews_count: 45,
            availability_status: "available",
            next_available: "Today",
            default_duration: 1,
        };
    }

    getFallbackProvider() {
        return {
            id: 1,
            name: "Clean Masters",
            profile_image_url: null,
            bio: "Professional cleaning service with over 5 years of experience. We specialize in residential and commercial cleaning.",
            is_verified: true,
            city: "Colombo",
            province: "Western Province",
            service_radius: 25,
            travel_fee: 50,
            average_rating: 4.7,
            reviews_count: 128,
            total_services: 3,
            completed_bookings: 250,
            years_experience: 5,
            response_time: "2 hours",
            other_services: [
                {
                    id: 2,
                    title: "Office Cleaning",
                    category: { name: "Commercial Cleaning" },
                    formatted_price: "Rs. 5,000",
                },
                {
                    id: 3,
                    title: "Deep Cleaning",
                    category: { name: "Deep Cleaning" },
                    formatted_price: "Rs. 8,000",
                },
            ],
        };
    }

    // Helper method to validate booking data
    validateBookingData(bookingData) {
        const errors = {};

        // Required fields validation
        if (!bookingData.service_id) errors.service_id = "Service is required";
        if (!bookingData.provider_id)
            errors.provider_id = "Provider is required";
        if (!bookingData.appointment_date)
            errors.appointment_date = "Date is required";
        if (!bookingData.appointment_time)
            errors.appointment_time = "Time is required";

        // Contact validation
        if (!bookingData.client_phone && !bookingData.client_email) {
            errors.contact = "Either phone number or email is required";
        }

        // Location validation
        if (
            bookingData.location_type === "client_address" &&
            !bookingData.client_address
        ) {
            errors.client_address = "Address is required for home service";
        }

        // Terms validation
        if (!bookingData.agreed_to_terms) {
            errors.agreed_to_terms =
                "You must agree to the terms and conditions";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    // Dashboard APIs
    async getDashboardStats() {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/stats`);
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || "Dashboard stats loaded successfully"
                };
            } else {
                throw new Error(response.data.message || "Failed to load dashboard stats");
            }
        } catch (error) {
            console.warn("Dashboard stats endpoint error:", error);
            // Return fallback stats for development
            return {
                success: true,
                data: {
                    totalAppointments: 0,
                    completedAppointments: 0,
                    pendingAppointments: 0,
                    averageRating: 0,
                    services_viewed: 0,
                    searches_performed: 0,
                    total_spent: 0,
                },
                message: "Dashboard stats loaded (fallback mode)",
                fallback: true
            };
        }
    }

    async getRecentActivity(limit = 10) {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/recent-activity`, {
                params: { limit }
            });
            
            if (response.data && response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message || "Recent activity loaded successfully"
                };
            } else {
                throw new Error(response.data.message || "Failed to load recent activity");
            }
        } catch (error) {
            console.warn("Recent activity endpoint error:", error);
            // Return empty activity for now
            return {
                success: true,
                data: [],
                message: "Recent activity loaded (fallback mode)",
                fallback: true
            };
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Clear specific cache entry
    clearCacheEntry(key) {
        this.cache.delete(key);
    }
}

export default new ClientService();
