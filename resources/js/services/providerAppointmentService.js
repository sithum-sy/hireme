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

    // /**
    //  * Complete service
    //  */
    // async completeService(appointmentId, notes = "") {
    //     return this.updateAppointmentStatus(appointmentId, "completed", notes);
    // }
    /**
     * Complete service with invoice options
     */
    async completeService(appointmentId, options = {}) {
        try {
            const response = await axios.post(
                `${API_BASE}/appointments/${appointmentId}/complete`,
                {
                    notes: options.notes || "",
                    create_invoice: options.create_invoice !== false, // Default true
                    send_invoice: options.send_invoice || false, // Default false
                }
            );

            return {
                success: true,
                data: response.data.data,
                invoice: response.data.invoice, // Include invoice data if created
                message:
                    response.data.message || "Service completed successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to complete service");
        }
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

    /**
     * Complete service with invoice options
     */
    async completeService(appointmentId, options = {}) {
        try {
            const response = await axios.post(
                `${API_BASE}/appointments/${appointmentId}/complete`,
                {
                    notes: options.notes || "",
                    create_invoice: options.create_invoice !== false, // Default true
                    send_invoice: options.send_invoice || false, // Default false
                }
            );

            return {
                success: true,
                data: response.data.data,
                invoice: response.data.invoice, // Include invoice data if created
                message:
                    response.data.message || "Service completed successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to complete service");
        }
    }

    /**
     * Get dashboard appointment data
     */
    async getDashboardAppointments() {
        try {
            const [
                todayResult,
                upcomingResult,
                pastResult,
                cancelledResult,
                statsResult,
            ] = await Promise.all([
                axios.get(`${API_BASE}/appointments/dashboard/today`),
                axios.get(`${API_BASE}/appointments/dashboard/upcoming`),
                axios.get(`${API_BASE}/appointments/dashboard/past`),
                axios.get(`${API_BASE}/appointments/dashboard/cancelled`),
                axios.get(`${API_BASE}/appointments/dashboard/stats`),
            ]);

            return {
                success: true,
                data: {
                    today: todayResult.data.data || [],
                    upcoming: upcomingResult.data.data || [],
                    past: pastResult.data.data || [],
                    cancelled: cancelledResult.data.data || [],
                    stats: statsResult.data.data || {},
                },
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load dashboard appointments"
            );
        }
    }

    /**
     * Get today's appointments for dashboard
     */
    async getTodayAppointmentsForDashboard() {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/dashboard/today`
            );
            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load today's appointments"
            );
        }
    }

    /**
     * Get upcoming appointments for dashboard
     */
    async getUpcomingAppointmentsForDashboard() {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/dashboard/upcoming`
            );
            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load upcoming appointments"
            );
        }
    }

    /**
     * Get past appointments for dashboard
     */
    async getPastAppointmentsForDashboard() {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/dashboard/past`
            );
            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error) {
            return this.handleError(error, "Failed to load past appointments");
        }
    }

    /**
     * Get cancelled appointments for dashboard
     */
    async getCancelledAppointmentsForDashboard() {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/dashboard/cancelled`
            );
            return {
                success: true,
                data: response.data.data || [],
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load cancelled appointments"
            );
        }
    }

    /**
     * Get appointment stats for dashboard
     */
    async getAppointmentStats() {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/dashboard/stats`
            );
            return {
                success: true,
                data: response.data.data || {},
            };
        } catch (error) {
            return this.handleError(error, "Failed to load appointment stats");
        }
    }
}

export default new ProviderAppointmentService();
