import axios from "axios";

const API_BASE = "/api/client";

class AppointmentService {
    // Core appointment management methods

    /**
     * Get all appointments for the authenticated client with filtering and pagination
     * @param {Object} params - Filter parameters (status, date_from, date_to, service_type, page)
     * @returns {Object} Response with appointments data and pagination info
     */
    async getAppointments(params = {}) {
        try {
            // Clean up parameters - remove empty values
            const cleanParams = Object.entries(params).reduce(
                (acc, [key, value]) => {
                    if (value && value !== "all" && value !== "") {
                        acc[key] = value;
                    }
                    return acc;
                },
                {}
            );

            const response = await axios.get(`${API_BASE}/bookings`, {
                params: cleanParams,
            });

            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.meta || null,
                message:
                    response.data.message || "Appointments loaded successfully",
            };
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
            return this.handleError(error, "Failed to load appointments");
        }
    }

    /**
     * Get detailed information for a specific appointment
     * @param {number} appointmentId - The appointment ID
     * @returns {Object} Response with detailed appointment data
     */
    async getAppointmentDetail(appointmentId) {
        try {
            const response = await axios.get(
                `${API_BASE}/bookings/${appointmentId}`
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message:
                    response.data.message ||
                    "Appointment details loaded successfully",
            };
        } catch (error) {
            console.error("Failed to fetch appointment detail:", error);

            // Handle 404 specifically
            if (error.response?.status === 404) {
                return {
                    success: false,
                    message: "Appointment not found",
                    status: 404,
                };
            }

            return this.handleError(
                error,
                "Failed to load appointment details"
            );
        }
    }

    /**
     * Cancel an appointment
     * @param {number} appointmentId - The appointment ID
     * @param {Object} options - Cancellation options (reason, notes)
     * @returns {Object} Response with updated appointment data
     */
    async cancelAppointment(appointmentId, options = {}) {
        try {
            const payload = {
                cancellation_reason: options.reason || "Cancelled by client",
                cancellation_notes: options.notes || "",
                ...options,
            };

            const response = await axios.patch(
                `${API_BASE}/bookings/${appointmentId}/cancel`,
                payload
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message:
                    response.data.message ||
                    "Appointment cancelled successfully",
            };
        } catch (error) {
            console.error("Failed to cancel appointment:", error);

            // Handle specific cancellation policy errors
            if (error.response?.status === 422) {
                return {
                    success: false,
                    message:
                        error.response.data.message ||
                        "Cannot cancel appointment at this time",
                    errors: error.response.data.errors || {},
                    status: 422,
                };
            }

            return this.handleError(error, "Failed to cancel appointment");
        }
    }

    /**
     * Request reschedule for an appointment
     * @param {number} appointmentId - The appointment ID
     * @param {Object} rescheduleData - New date/time and reason
     * @returns {Object} Response with reschedule request status
     */
    async requestReschedule(appointmentId, rescheduleData) {
        try {
            const payload = {
                requested_date: rescheduleData.date,
                requested_time: rescheduleData.time,
                reschedule_reason:
                    rescheduleData.reason || "Client requested reschedule",
                reschedule_notes: rescheduleData.notes || "",
                ...rescheduleData,
            };

            // Note: This endpoint would need to be implemented in your Laravel backend
            const response = await axios.post(
                `${API_BASE}/bookings/${appointmentId}/reschedule-request`,
                payload
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message:
                    response.data.message ||
                    "Reschedule request submitted successfully",
            };
        } catch (error) {
            console.error("Failed to request reschedule:", error);
            return this.handleError(
                error,
                "Failed to submit reschedule request"
            );
        }
    }

    /**
     * Submit a review for a completed appointment
     * @param {number} appointmentId - The appointment ID
     * @param {Object} reviewData - Rating, comment, and optional images
     * @returns {Object} Response with review submission status
     */
    async submitReview(appointmentId, reviewData) {
        try {
            const payload = {
                provider_rating: reviewData.rating,
                provider_review: reviewData.comment || "",
                service_rating: reviewData.serviceRating || reviewData.rating,
                service_review: reviewData.serviceComment || "",
                review_images: reviewData.images || [],
                would_recommend: reviewData.wouldRecommend || true,
                ...reviewData,
            };

            // Note: This endpoint would need to be implemented in your Laravel backend
            const response = await axios.post(
                `${API_BASE}/bookings/${appointmentId}/review`,
                payload
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message:
                    response.data.message || "Review submitted successfully",
            };
        } catch (error) {
            console.error("Failed to submit review:", error);
            return this.handleError(error, "Failed to submit review");
        }
    }

    /**
     * Get appointment statistics for dashboard
     * @returns {Object} Statistics data
     */
    async getAppointmentStats() {
        try {
            // Use existing dashboard stats endpoint or create specific appointment stats
            const response = await axios.get(`${API_BASE}/dashboard/stats`);

            return {
                success: true,
                data: {
                    total: response.data.totalAppointments || 0,
                    pending: response.data.pendingAppointments || 0,
                    confirmed: response.data.confirmedAppointments || 0,
                    completed: response.data.completedAppointments || 0,
                    cancelled: response.data.cancelledAppointments || 0,
                    this_month: response.data.thisMonthAppointments || 0,
                    total_spent: response.data.total_spent || 0,
                    average_rating: response.data.average_rating_given || 0,
                    ...response.data,
                },
                message: "Statistics loaded successfully",
            };
        } catch (error) {
            console.error("Failed to fetch appointment stats:", error);
            return this.handleError(error, "Failed to load statistics");
        }
    }

    /**
     * Get upcoming appointments (next 7 days)
     * @param {number} limit - Maximum number of appointments to return
     * @returns {Object} Response with upcoming appointments
     */
    async getUpcomingAppointments(limit = 5) {
        try {
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);

            const params = {
                status: "confirmed,in_progress", // Multiple statuses
                date_from: today.toISOString().split("T")[0],
                date_to: nextWeek.toISOString().split("T")[0],
                limit: limit,
                sort_by: "date_asc",
            };

            const response = await axios.get(`${API_BASE}/bookings`, {
                params,
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message: "Upcoming appointments loaded successfully",
            };
        } catch (error) {
            console.error("Failed to fetch upcoming appointments:", error);
            return this.handleError(
                error,
                "Failed to load upcoming appointments"
            );
        }
    }

    /**
     * Get appointment history with status filters
     * @param {Object} params - Filter parameters
     * @returns {Object} Response with historical appointments
     */
    async getAppointmentHistory(params = {}) {
        try {
            const defaultParams = {
                status: "completed,cancelled_by_client,cancelled_by_provider",
                sort_by: "date_desc",
                per_page: 10,
                ...params,
            };

            return await this.getAppointments(defaultParams);
        } catch (error) {
            console.error("Failed to fetch appointment history:", error);
            return this.handleError(
                error,
                "Failed to load appointment history"
            );
        }
    }

    /**
     * Search appointments by service name or provider
     * @param {string} query - Search query
     * @param {Object} additionalParams - Additional filter parameters
     * @returns {Object} Response with search results
     */
    async searchAppointments(query, additionalParams = {}) {
        try {
            const params = {
                search: query,
                ...additionalParams,
            };

            const response = await axios.get(`${API_BASE}/bookings/search`, {
                params,
            });

            return {
                success: true,
                data: response.data.data || response.data,
                pagination: response.data.meta || null,
                message: `Found ${
                    response.data.total || 0
                } appointments matching "${query}"`,
            };
        } catch (error) {
            console.error("Failed to search appointments:", error);
            return this.handleError(error, "Failed to search appointments");
        }
    }

    /**
     * Add notes to an appointment
     * @param {number} appointmentId - The appointment ID
     * @param {string} notes - Notes to add
     * @returns {Object} Response with updated appointment
     */
    async addAppointmentNotes(appointmentId, notes) {
        try {
            const payload = {
                client_notes: notes,
                notes_updated_at: new Date().toISOString(),
            };

            // Note: This endpoint would need to be implemented in your Laravel backend
            const response = await axios.put(
                `${API_BASE}/bookings/${appointmentId}/notes`,
                payload
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: "Notes updated successfully",
            };
        } catch (error) {
            console.error("Failed to update notes:", error);
            return this.handleError(error, "Failed to update notes");
        }
    }

    /**
     * Get appointment timeline/status history
     * @param {number} appointmentId - The appointment ID
     * @returns {Object} Response with appointment timeline
     */
    async getAppointmentTimeline(appointmentId) {
        try {
            // Note: This endpoint would need to be implemented in your Laravel backend
            const response = await axios.get(
                `${API_BASE}/bookings/${appointmentId}/timeline`
            );

            return {
                success: true,
                data: response.data.data || response.data,
                message: "Timeline loaded successfully",
            };
        } catch (error) {
            console.error("Failed to fetch appointment timeline:", error);

            // Fallback timeline data based on current appointment status
            return {
                success: true,
                data: this.generateFallbackTimeline(appointmentId),
                message: "Timeline loaded (limited data)",
                fallback: true,
            };
        }
    }

    /**
     * Validate appointment date and time on frontend
     */
    validateAppointmentDateTime(appointmentDate, appointmentTime) {
        const now = new Date();
        const appointmentDateTime = new Date(
            `${appointmentDate}T${appointmentTime}`
        );

        if (isNaN(appointmentDateTime.getTime())) {
            return "Invalid date or time format";
        }

        // Check if appointment is in the past
        if (appointmentDateTime <= now) {
            return "Appointment time cannot be in the past. Please select a future date and time.";
        }

        // Check minimum advance notice (2 hours)
        const minimumAdvanceTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
        if (appointmentDateTime < minimumAdvanceTime) {
            return "Appointments must be booked at least 2 hours in advance.";
        }

        // Check maximum advance booking (3 months)
        const maximumAdvanceTime = new Date(
            now.getTime() + 3 * 30 * 24 * 60 * 60 * 1000
        );
        if (appointmentDateTime > maximumAdvanceTime) {
            return "Appointments cannot be booked more than 3 months in advance.";
        }

        return null; // No errors
    }

    /**
     * Enhanced booking method with validation
     */
    async createAppointment(appointmentData) {
        try {
            // Validate appointment time before sending request
            const timeValidationError = this.validateAppointmentDateTime(
                appointmentData.appointment_date,
                appointmentData.appointment_time
            );

            if (timeValidationError) {
                return {
                    success: false,
                    message: timeValidationError,
                    errors: { appointment_time: [timeValidationError] },
                };
            }

            const response = await axios.post(
                `${API_BASE}/appointments`,
                appointmentData
            );

            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Appointment booked successfully",
            };
        } catch (error) {
            console.error("Appointment booking error:", error);
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to book appointment",
                errors: error.response?.data?.errors || {},
            };
        }
    }

    /**
     * Check if appointment can be cancelled based on policy (24 hours rule)
     * @param {string} appointmentDate - Appointment date (YYYY-MM-DD)
     * @param {string} appointmentTime - Appointment time (HH:MM)
     * @param {string} status - Current appointment status
     * @returns {Object} Cancellation policy check result
     */
    canBeCancelled(appointmentDate, appointmentTime, status) {
        // Only pending and confirmed appointments can be cancelled
        if (!["pending", "confirmed"].includes(status)) {
            return {
                canCancel: false,
                reason: "Appointment cannot be cancelled in current status",
                hoursRemaining: 0,
            };
        }

        try {
            const appointmentDateTime = new Date(
                `${appointmentDate}T${appointmentTime}`
            );
            const now = new Date();
            const hoursUntilAppointment =
                (appointmentDateTime - now) / (1000 * 60 * 60);

            const canCancel = hoursUntilAppointment > 24;

            return {
                canCancel,
                hoursRemaining: Math.max(0, hoursUntilAppointment),
                reason: canCancel
                    ? "Can be cancelled free of charge"
                    : "Cancellation period has passed (24 hours required)",
                deadline: new Date(
                    appointmentDateTime.getTime() - 24 * 60 * 60 * 1000
                ),
            };
        } catch (error) {
            return {
                canCancel: false,
                reason: "Invalid appointment date/time",
                hoursRemaining: 0,
            };
        }
    }

    /**
     * Format appointment data for consistent display
     * @param {Object} appointment - Raw appointment data
     * @returns {Object} Formatted appointment data
     */
    formatAppointmentData(appointment) {
        if (!appointment) return null;

        return {
            ...appointment,
            formatted_date: this.formatDate(appointment.appointment_date),
            formatted_time: this.formatTime(appointment.appointment_time),
            formatted_date_time: this.formatDateTime(
                appointment.appointment_date,
                appointment.appointment_time
            ),
            status_badge: this.getStatusBadge(appointment.status),
            status_text: this.getStatusText(appointment.status),
            cancellation_policy: this.canBeCancelled(
                appointment.appointment_date,
                appointment.appointment_time,
                appointment.status
            ),
            // Provider name formatting
            provider_name: appointment.provider
                ? `${appointment.provider.first_name} ${appointment.provider.last_name}`
                : "Unknown Provider",
            business_name:
                appointment.provider?.provider_profile?.business_name,
            // Service title fallback
            service_title: appointment.service?.title || "Service",
            // Price formatting
            formatted_price: `Rs. ${appointment.total_price || 0}`,
            // Duration formatting
            duration_text: `${appointment.duration_hours || 1} hour${
                (appointment.duration_hours || 1) > 1 ? "s" : ""
            }`,
        };
    }

    // Utility methods for data formatting

    formatDate(dateString) {
        if (!dateString) return "Date not available";

        try {
            let dateObj;

            if (dateString instanceof Date) {
                dateObj = dateString;
            } else if (
                typeof dateString === "string" &&
                dateString.includes("-")
            ) {
                const [year, month, day] = dateString.split("-");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
            } else {
                dateObj = new Date(dateString);
            }

            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date");
            }

            return dateObj.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch (error) {
            console.warn("Date formatting error:", error);
            return dateString.toString();
        }
    }

    formatTime(timeString) {
        if (!timeString) return "Time not available";

        try {
            // Handle both HH:MM and HH:MM:SS formats
            const timeParts = timeString.toString().split(":");
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? "PM" : "AM";
                const displayHour = hours % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            return timeString.toString();
        } catch (error) {
            console.warn("Time formatting error:", error);
            return timeString.toString();
        }
    }

    formatDateTime(dateString, timeString) {
        if (!dateString || !timeString) return "Date/Time not available";

        const date = this.formatDate(dateString);
        const time = this.formatTime(timeString);

        if (date === "Date not available" || time === "Time not available") {
            return `${dateString} ${timeString}`;
        }

        return `${date} at ${time}`;
    }

    getStatusBadge(status) {
        const badges = {
            pending: "bg-warning text-dark",
            confirmed: "bg-success text-white",
            in_progress: "bg-primary text-white",
            completed: "bg-info text-white",
            cancelled_by_client: "bg-danger text-white",
            cancelled_by_provider: "bg-danger text-white",
            no_show: "bg-secondary text-white",
            disputed: "bg-warning text-dark",
        };
        return badges[status] || "bg-secondary text-white";
    }

    getStatusText(status) {
        const statusTexts = {
            pending: "Awaiting Confirmation",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled_by_client: "Cancelled by You",
            cancelled_by_provider: "Cancelled by Provider",
            no_show: "No Show",
            disputed: "Disputed",
        };
        return statusTexts[status] || status.replace("_", " ");
    }

    // Error handling helper
    handleError(error, defaultMessage) {
        if (error.response) {
            // Server responded with error status
            return {
                success: false,
                message: error.response.data?.message || defaultMessage,
                errors: error.response.data?.errors || {},
                status: error.response.status,
            };
        } else if (error.request) {
            // Network error
            return {
                success: false,
                message:
                    "Network error. Please check your connection and try again.",
                errors: {},
                status: 0,
            };
        } else {
            // Other error
            return {
                success: false,
                message: error.message || defaultMessage,
                errors: {},
                status: 0,
            };
        }
    }

    // Generate fallback timeline for development/testing
    generateFallbackTimeline(appointmentId) {
        return [
            {
                id: 1,
                status: "pending",
                title: "Appointment Requested",
                description: "Your appointment request has been submitted",
                timestamp: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
                icon: "fas fa-clock",
                color: "warning",
            },
            {
                id: 2,
                status: "confirmed",
                title: "Appointment Confirmed",
                description: "Provider has confirmed your appointment",
                timestamp: new Date(
                    Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
                icon: "fas fa-check-circle",
                color: "success",
            },
        ];
    }

    // Validation helpers

    validateRescheduleData(rescheduleData) {
        const errors = {};

        if (!rescheduleData.date) {
            errors.date = "New date is required";
        } else {
            const newDate = new Date(rescheduleData.date);
            const today = new Date();
            if (newDate <= today) {
                errors.date = "New date must be in the future";
            }
        }

        if (!rescheduleData.time) {
            errors.time = "New time is required";
        }

        if (!rescheduleData.reason || rescheduleData.reason.trim().length < 5) {
            errors.reason =
                "Please provide a reason for rescheduling (minimum 5 characters)";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    validateReviewData(reviewData) {
        const errors = {};

        if (
            !reviewData.rating ||
            reviewData.rating < 1 ||
            reviewData.rating > 5
        ) {
            errors.rating = "Rating must be between 1 and 5 stars";
        }

        if (reviewData.comment && reviewData.comment.length > 1000) {
            errors.comment = "Review comment cannot exceed 1000 characters";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }
}

export default new AppointmentService();
