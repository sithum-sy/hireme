import BaseService from '../core/BaseService';

/**
 * Provider Appointment Service
 * Handles provider-specific appointment management operations
 */
class ProviderAppointmentService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            cacheTimeout: 2 * 60 * 1000, // 2 minutes cache for appointment details
            enableCache: false // Most appointment data should be fresh
        });
        this.baseURL = "/provider";
    }

    /**
     * Get all provider appointments with filtering
     */
    async getAppointments(params = {}) {
        const cleanParams = this.cleanPayload({
            status: params.status,
            date_from: this.formatDate(params.date_from),
            date_to: this.formatDate(params.date_to),
            page: params.page || 1,
            per_page: params.per_page || 15
        });

        return this.apiCall("GET", `${this.baseURL}/appointments`, cleanParams);
    }

    /**
     * Get specific appointment details
     */
    async getAppointment(appointmentId) {
        return this.apiCall("GET", `${this.baseURL}/appointments/${appointmentId}`);
    }

    /**
     * Confirm an appointment
     */
    async confirmAppointment(appointmentId, notes = null) {
        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/confirm`, {
            provider_notes: notes
        });
    }

    /**
     * Start an appointment
     */
    async startAppointment(appointmentId) {
        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/start`);
    }

    /**
     * Complete an appointment
     */
    async completeAppointment(appointmentId, completionData = {}) {
        const payload = this.cleanPayload({
            provider_notes: completionData.notes,
            actual_duration: completionData.actual_duration,
            service_summary: completionData.service_summary
        });

        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/complete`, payload);
    }

    /**
     * Cancel an appointment
     */
    async cancelAppointment(appointmentId, reason) {
        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/cancel`, {
            reason
        });
    }

    /**
     * Respond to reschedule request
     */
    async respondToReschedule(appointmentId, action, data = {}) {
        const payload = {
            action, // 'approve' or 'decline'
            reason: data.reason,
            alternative_date: this.formatDate(data.alternative_date),
            alternative_time: this.formatTime(data.alternative_time)
        };

        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/reschedule-response`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Update appointment details
     */
    async updateAppointment(appointmentId, updateData) {
        const payload = this.cleanPayload({
            provider_notes: updateData.provider_notes,
            estimated_duration: updateData.estimated_duration
        });

        return this.apiCall("PATCH", `${this.baseURL}/appointments/${appointmentId}`, payload);
    }

    /**
     * Get today's schedule
     */
    async getTodaysSchedule() {
        return this.apiCall("GET", `${this.baseURL}/appointments/today`);
    }

    /**
     * Get upcoming appointments
     */
    async getUpcomingAppointments(limit = 10) {
        return this.apiCall("GET", `${this.baseURL}/appointments/upcoming`, { limit });
    }

    /**
     * Get appointment statistics
     */
    async getAppointmentStats(period = '30d') {
        return this.apiCall("GET", `${this.baseURL}/appointments/stats`, { period });
    }

    // Utility methods with optimistic updates for better UX
    
    /**
     * Confirm appointment with optimistic update
     */
    async confirmAppointmentOptimistic(appointmentId, notes = null) {
        try {
            return await this.confirmAppointment(appointmentId, notes);
        } catch (error) {
            throw error;
        }
    }
}

export default ProviderAppointmentService;