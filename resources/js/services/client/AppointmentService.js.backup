import BaseService from '../core/BaseService';

/**
 * Client Appointment Service
 * Handles client-specific appointment management operations
 */
class ClientAppointmentService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // Appointment data should be fresh
        });
        this.baseURL = "/client";
    }

    /**
     * Get all appointments with enhanced filtering
     */
    async getAppointments(params = {}) {
        const cleanParams = this.cleanPayload({
            status: params.status,
            date_from: this.formatDate(params.date_from),
            date_to: this.formatDate(params.date_to),
            per_page: params.per_page || 15,
            page: params.page || 1,
            sort_by: params.sort_by || 'appointment_date',
            sort_order: params.sort_order || 'desc'
        });

        return this.apiCall("GET", `${this.baseURL}/appointments`, cleanParams);
    }

    /**
     * Get specific appointment with all details
     */
    async getAppointment(appointmentId) {
        return this.apiCall("GET", `${this.baseURL}/appointments/${appointmentId}`);
    }

    /**
     * Cancel an appointment
     */
    async cancelAppointment(appointmentId, reason = null) {
        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/cancel`, {
            reason
        });
    }

    /**
     * Request appointment reschedule
     */
    async requestReschedule(appointmentId, rescheduleData) {
        const payload = {
            requested_date: this.formatDate(rescheduleData.requested_date),
            requested_time: this.formatTime(rescheduleData.requested_time),
            reason: rescheduleData.reason,
            client_phone: rescheduleData.client_phone,
            client_email: rescheduleData.client_email,
            client_address: rescheduleData.client_address,
            location_type: rescheduleData.location_type
        };

        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/reschedule`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Update appointment details
     */
    async updateAppointment(appointmentId, updateData) {
        const payload = this.cleanPayload({
            client_phone: updateData.client_phone,
            client_email: updateData.client_email,
            client_address: updateData.client_address,
            location_instructions: updateData.location_instructions,
            client_notes: updateData.client_notes,
            contact_preference: updateData.contact_preference
        });

        return this.apiCall("PATCH", `${this.baseURL}/appointments/${appointmentId}`, payload);
    }

    /**
     * Process payment for appointment
     */
    async processPayment(appointmentId, paymentData) {
        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/payment`, 
            paymentData
        );
    }

    /**
     * Get appointment payment status
     */
    async getPaymentStatus(appointmentId) {
        return this.apiCall("GET", `${this.baseURL}/appointments/${appointmentId}/payment-status`);
    }

    /**
     * Download appointment invoice
     */
    async downloadInvoice(appointmentId) {
        const config = {
            responseType: 'blob'
        };

        return this.apiCall("GET", `${this.baseURL}/appointments/${appointmentId}/invoice`, 
            null, config
        );
    }

    /**
     * Get appointment history
     */
    async getAppointmentHistory(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 20,
            date_from: null,
            date_to: null
        };

        return this.apiCall("GET", `${this.baseURL}/appointments/history`, {
            ...defaultParams,
            ...this.cleanPayload(params)
        });
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

    /**
     * Check for appointment conflicts
     */
    async checkConflicts(appointmentDate, appointmentTime, duration) {
        return this.apiCall("POST", `${this.baseURL}/appointments/check-conflicts`, {
            appointment_date: this.formatDate(appointmentDate),
            appointment_time: this.formatTime(appointmentTime),
            duration_hours: duration
        });
    }

    /**
     * Get appointment notifications settings
     */
    async getNotificationSettings() {
        return this.apiCall("GET", `${this.baseURL}/appointments/notification-settings`);
    }

    /**
     * Update appointment notifications settings
     */
    async updateNotificationSettings(settings) {
        return this.apiCall("POST", `${this.baseURL}/appointments/notification-settings`, 
            settings
        );
    }

    // Utility methods

    /**
     * Format appointment data for display
     */
    formatAppointmentData(appointment) {
        return {
            ...appointment,
            display_date: new Date(appointment.appointment_date).toLocaleDateString(),
            display_time: this.formatDisplayTime(appointment.appointment_time),
            status_class: this.getStatusClass(appointment.status),
            can_cancel: this.canCancelAppointment(appointment),
            can_reschedule: this.canRescheduleAppointment(appointment),
            can_pay: this.canPayAppointment(appointment)
        };
    }

    /**
     * Format time for display
     */
    formatDisplayTime(time) {
        if (!time) return '';
        
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        
        return date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    }

    /**
     * Get status CSS class
     */
    getStatusClass(status) {
        const statusClasses = {
            'pending': 'badge bg-warning',
            'confirmed': 'badge bg-success',
            'in_progress': 'badge bg-primary',
            'completed': 'badge bg-info',
            'paid': 'badge bg-success',
            'cancelled_by_client': 'badge bg-danger',
            'cancelled_by_provider': 'badge bg-danger',
            'no_show': 'badge bg-dark'
        };

        return statusClasses[status] || 'badge bg-secondary';
    }

    /**
     * Check if appointment can be cancelled
     */
    canCancelAppointment(appointment) {
        const cancellableStatuses = ['pending', 'confirmed'];
        const appointmentDate = new Date(appointment.appointment_date);
        const now = new Date();
        
        // Must be at least 24 hours before appointment
        const hoursDiff = (appointmentDate - now) / (1000 * 60 * 60);
        
        return cancellableStatuses.includes(appointment.status) && hoursDiff >= 24;
    }

    /**
     * Check if appointment can be rescheduled
     */
    canRescheduleAppointment(appointment) {
        const reschedulableStatuses = ['pending', 'confirmed'];
        return reschedulableStatuses.includes(appointment.status) && 
               !appointment.pending_reschedule_request;
    }

    /**
     * Check if appointment can be paid
     */
    canPayAppointment(appointment) {
        const payableStatuses = ['completed', 'invoice_sent', 'payment_pending'];
        return payableStatuses.includes(appointment.status) && 
               appointment.invoice && 
               !appointment.payment_received_at;
    }
}

export default ClientAppointmentService;