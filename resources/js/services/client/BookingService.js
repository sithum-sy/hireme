import BaseService from '../core/BaseService';

/**
 * Client Booking Service
 * Handles service booking workflow and availability checking
 */
class ClientBookingService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // Booking data should not be cached
        });
        this.baseURL = "/client";
    }

    /**
     * Create a new booking (appointment or quote request)
     */
    async createBooking(bookingData) {
        const payload = this.prepareBookingPayload(bookingData);
        return this.apiCall("POST", `${this.baseURL}/bookings`, payload);
    }

    /**
     * Get available time slots for a service
     */
    async getAvailableSlots(serviceId, date, duration = 1) {
        return this.apiCall("GET", `${this.baseURL}/services/${serviceId}/availability`, {
            date: this.formatDate(date),
            duration
        });
    }

    /**
     * Check provider availability for specific time
     */
    async checkAvailability(providerId, date, startTime, endTime) {
        return this.apiCall("POST", `${this.baseURL}/providers/${providerId}/check-availability`, {
            date: this.formatDate(date),
            start_time: this.formatTime(startTime),
            end_time: this.formatTime(endTime)
        });
    }

    /**
     * Get service details for booking
     */
    async getServiceForBooking(serviceId) {
        return this.apiCall("GET", `${this.baseURL}/services/${serviceId}/booking-details`);
    }

    /**
     * Calculate pricing for booking
     */
    async calculatePricing(serviceId, bookingDetails) {
        const payload = {
            service_id: serviceId,
            duration_hours: bookingDetails.duration_hours,
            location_type: bookingDetails.location_type,
            client_address: bookingDetails.client_address,
            appointment_date: this.formatDate(bookingDetails.appointment_date)
        };

        return this.apiCall("POST", `${this.baseURL}/bookings/calculate-price`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Validate booking data before submission
     */
    async validateBooking(bookingData) {
        const payload = this.prepareBookingPayload(bookingData);
        return this.apiCall("POST", `${this.baseURL}/bookings/validate`, payload);
    }

    /**
     * Get booking confirmation details
     */
    async getBookingConfirmation(bookingId) {
        return this.apiCall("GET", `${this.baseURL}/bookings/${bookingId}/confirmation`);
    }

    /**
     * Get provider's working hours for a specific date
     */
    async getProviderWorkingHours(providerId, date) {
        return this.apiCall("GET", `${this.baseURL}/providers/${providerId}/working-hours`, {
            date: this.formatDate(date)
        });
    }

    /**
     * Get provider's blocked times for date range
     */
    async getProviderBlockedTimes(providerId, startDate, endDate) {
        return this.apiCall("GET", `${this.baseURL}/providers/${providerId}/blocked-times`, {
            start_date: this.formatDate(startDate),
            end_date: this.formatDate(endDate)
        });
    }

    /**
     * Request a quote for custom service
     */
    async requestQuote(quoteData) {
        const payload = {
            service_id: quoteData.service_id,
            client_requirements: quoteData.requirements,
            preferred_date: this.formatDate(quoteData.preferred_date),
            preferred_time: this.formatTime(quoteData.preferred_time),
            location_type: quoteData.location_type,
            client_address: quoteData.client_address,
            client_city: quoteData.client_city,
            client_postal_code: quoteData.client_postal_code,
            contact_preference: quoteData.contact_preference,
            budget_range: quoteData.budget_range
        };

        return this.apiCall("POST", `${this.baseURL}/quotes/request`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get booking history
     */
    async getBookingHistory(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 20,
            type: 'all' // 'appointment', 'quote', 'all'
        };

        return this.apiCall("GET", `${this.baseURL}/bookings/history`, {
            ...defaultParams,
            ...this.cleanPayload(params)
        });
    }

    /**
     * Cancel a booking
     */
    async cancelBooking(bookingId, reason = null) {
        return this.apiCall("POST", `${this.baseURL}/bookings/${bookingId}/cancel`, {
            reason
        });
    }

    /**
     * Get popular time slots for a service
     */
    async getPopularTimeSlots(serviceId) {
        return this.apiCall("GET", `${this.baseURL}/services/${serviceId}/popular-times`);
    }

    /**
     * Get booking templates (saved booking preferences)
     */
    async getBookingTemplates() {
        return this.apiCall("GET", `${this.baseURL}/bookings/templates`);
    }

    /**
     * Save booking as template
     */
    async saveBookingTemplate(templateData) {
        return this.apiCall("POST", `${this.baseURL}/bookings/templates`, templateData);
    }

    // Utility methods

    /**
     * Prepare booking payload for API submission
     */
    prepareBookingPayload(bookingData) {
        const payload = {
            service_id: bookingData.service_id,
            provider_id: bookingData.provider_id,
            appointment_date: this.formatDate(bookingData.appointment_date),
            appointment_time: this.formatTime(bookingData.appointment_time),
            duration_hours: bookingData.duration_hours,
            location_type: bookingData.location_type,
            client_address: bookingData.client_address,
            client_city: bookingData.client_city,
            client_postal_code: bookingData.client_postal_code,
            location_instructions: bookingData.location_instructions,
            client_phone: bookingData.client_phone,
            client_email: bookingData.client_email,
            contact_preference: bookingData.contact_preference,
            client_notes: bookingData.client_notes,
            payment_method: bookingData.payment_method,
            request_quote: bookingData.request_quote || false,
            requirements: bookingData.requirements // For quote requests
        };

        return this.cleanPayload(payload);
    }

    /**
     * Validate required booking fields
     */
    validateBookingData(bookingData) {
        const errors = {};

        // Required fields
        if (!bookingData.service_id) errors.service_id = "Service is required";
        if (!bookingData.appointment_date) errors.appointment_date = "Date is required";
        if (!bookingData.appointment_time) errors.appointment_time = "Time is required";
        if (!bookingData.location_type) errors.location_type = "Location type is required";

        // Conditional requirements
        if (bookingData.location_type === 'client_address' && !bookingData.client_address) {
            errors.client_address = "Address is required for client location";
        }

        // Date validation
        if (bookingData.appointment_date) {
            const appointmentDate = new Date(bookingData.appointment_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (appointmentDate < today) {
                errors.appointment_date = "Date cannot be in the past";
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Generate time slots for a given date and working hours
     */
    generateTimeSlots(startTime, endTime, slotDuration = 60, serviceDuration = 60) {
        const slots = [];
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        
        let current = new Date(start);
        
        while (current <= end) {
            const slotEnd = new Date(current.getTime() + serviceDuration * 60000);
            
            if (slotEnd <= end) {
                slots.push({
                    start_time: current.toTimeString().slice(0, 5),
                    end_time: slotEnd.toTimeString().slice(0, 5),
                    formatted_time: current.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                    })
                });
            }
            
            current = new Date(current.getTime() + slotDuration * 60000);
        }
        
        return slots;
    }

    /**
     * Calculate total booking cost
     */
    calculateTotalCost(basePrice, travelFee = 0, taxes = 0, discounts = 0) {
        const subtotal = parseFloat(basePrice) + parseFloat(travelFee);
        const taxAmount = subtotal * (parseFloat(taxes) / 100);
        const discountAmount = subtotal * (parseFloat(discounts) / 100);
        
        return {
            base_price: parseFloat(basePrice),
            travel_fee: parseFloat(travelFee),
            subtotal: subtotal,
            tax_amount: taxAmount,
            discount_amount: discountAmount,
            total: subtotal + taxAmount - discountAmount
        };
    }
}

export default ClientBookingService;