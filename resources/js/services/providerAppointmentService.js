import axios from "axios";

const API_BASE = "/api/provider";

class ProviderAppointmentService {
    /**
     * Get all provider appointments with filtering
     */
    async getAppointments(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/appointments`, {
                params,
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Appointments loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load appointments");
        }
    }

    /**
     * Get today's appointments
     */
    async getTodaysAppointments() {
        try {
            const response = await axios.get(`${API_BASE}/appointments/today`);
            return {
                success: true,
                data: response.data.data || [],
                message: "Today's appointments loaded",
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load today's appointments"
            );
        }
    }

    /**
     * Get appointment details
     */
    async getAppointmentDetail(appointmentId) {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/${appointmentId}`
            );
            return {
                success: true,
                data: response.data.data,
                message: "Appointment details loaded",
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load appointment details"
            );
        }
    }

    /**
     * Update appointment status
     */
    async updateAppointmentStatus(appointmentId, status, notes = "") {
        try {
            const response = await axios.patch(
                `${API_BASE}/appointments/${appointmentId}/status`,
                {
                    status,
                    notes,
                }
            );
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Status updated successfully",
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to update appointment status"
            );
        }
    }

    /**
     * Confirm appointment
     */
    async confirmAppointment(appointmentId, notes = "") {
        return this.updateAppointmentStatus(appointmentId, "confirmed", notes);
    }

    /**
     * Start service
     */
    async startService(appointmentId, notes = "") {
        return this.updateAppointmentStatus(
            appointmentId,
            "in_progress",
            notes
        );
    }

    /**
     * Complete service
     */
    async completeService(appointmentId, notes = "") {
        return this.updateAppointmentStatus(appointmentId, "completed", notes);
    }

    /**
     * Cancel appointment
     */
    async cancelAppointment(appointmentId, reason = "") {
        return this.updateAppointmentStatus(
            appointmentId,
            "cancelled_by_provider",
            reason
        );
    }

    /**
     * Mark as no show
     */
    async markNoShow(appointmentId, notes = "") {
        return this.updateAppointmentStatus(appointmentId, "no_show", notes);
    }

    /**
     * Error handler
     */
    handleError(error, defaultMessage) {
        if (error.response) {
            return {
                success: false,
                message: error.response.data?.message || defaultMessage,
                errors: error.response.data?.errors || {},
                status: error.response.status,
            };
        }
        return {
            success: false,
            message: error.message || defaultMessage,
            errors: {},
        };
    }
}

export default new ProviderAppointmentService();
