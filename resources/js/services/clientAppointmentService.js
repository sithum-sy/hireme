import axios from "axios";

const API_BASE = "/api/client";

class ClientAppointmentService {
    /**
     * Get all appointments with enhanced filtering
     */
    async getAppointments(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/appointments`, {
                params: {
                    status: params.status,
                    date_from: params.date_from,
                    date_to: params.date_to,
                    per_page: params.per_page || 15,
                },
            });

            return {
                success: true,
                data: response.data.data || response.data,
                message:
                    response.data.message || "Appointments loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load appointments");
        }
    }

    /**
     * Get specific appointment with all details
     */
    async getAppointment(appointmentId) {
        try {
            const response = await axios.get(
                `${API_BASE}/appointments/${appointmentId}`
            );

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Appointment details loaded",
            };
        } catch (error) {
            return this.handleError(
                error,
                "Failed to load appointment details"
            );
        }
    }

    /**
     * Create new appointment (existing booking functionality)
     */
    async createAppointment(appointmentData) {
        try {
            // Validate required fields
            const validation = this.validateAppointmentData(appointmentData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: "Validation failed",
                    errors: validation.errors,
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
                    response.data.message || "Appointment created successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to create appointment");
        }
    }

    /**
     * Cancel appointment
     */
    async cancelAppointment(appointmentId, reason = null) {
        try {
            const response = await axios.patch(
                `${API_BASE}/appointments/${appointmentId}/cancel`,
                {
                    cancellation_reason: reason,
                }
            );

            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Appointment cancelled successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to cancel appointment");
        }
    }

    /**
     * Process payment for appointment invoice
     */
    async payInvoice(appointmentId, paymentData) {
        try {
            // Validate payment data
            const validation = this.validatePaymentData(paymentData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: "Payment validation failed",
                    errors: validation.errors,
                };
            }

            const response = await axios.post(
                `${API_BASE}/appointments/${appointmentId}/pay`,
                {
                    payment_method: paymentData.payment_method,
                    amount: paymentData.amount,
                    stripe_payment_method_id:
                        paymentData.stripe_payment_method_id,
                    notes: paymentData.notes,
                }
            );

            return {
                success: true,
                data: response.data.data,
                payment: response.data.payment,
                message:
                    response.data.message || "Payment processed successfully",
            };
        } catch (error) {
            return this.handleError(error, "Payment processing failed");
        }
    }

    /**
     * Submit review for appointment
     */
    async submitReview(appointmentId, reviewData) {
        try {
            // Validate review data
            const validation = this.validateReviewData(reviewData);
            if (!validation.isValid) {
                return {
                    success: false,
                    message: "Review validation failed",
                    errors: validation.errors,
                };
            }

            const response = await axios.post(
                `${API_BASE}/appointments/${appointmentId}/review`,
                {
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    quality_rating: reviewData.quality_rating,
                    punctuality_rating: reviewData.punctuality_rating,
                    communication_rating: reviewData.communication_rating,
                    value_rating: reviewData.value_rating,
                    would_recommend: reviewData.would_recommend,
                    review_images: reviewData.review_images,
                }
            );

            return {
                success: true,
                data: response.data.data,
                review: response.data.review,
                message:
                    response.data.message || "Review submitted successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to submit review");
        }
    }

    /**
     * Get appointment statistics for dashboard
     */
    async getAppointmentStats() {
        try {
            const response = await axios.get(`${API_BASE}/dashboard/stats`);

            return {
                success: true,
                data: response.data.data,
                message: "Statistics loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load statistics");
        }
    }

    /**
     * Validate appointment data
     */
    validateAppointmentData(data) {
        const errors = {};

        // Required fields
        if (!data.service_id) errors.service_id = "Service is required";
        if (!data.provider_id) errors.provider_id = "Provider is required";
        if (!data.appointment_date)
            errors.appointment_date = "Date is required";
        if (!data.appointment_time)
            errors.appointment_time = "Time is required";
        if (!data.total_price || data.total_price <= 0)
            errors.total_price = "Valid price is required";

        // Contact validation
        if (!data.client_phone && !data.client_email) {
            errors.contact = "Either phone number or email is required";
        }

        // Location validation
        if (data.location_type === "client_address" && !data.client_address) {
            errors.client_address = "Address is required for home service";
        }

        // Terms validation
        if (!data.agreed_to_terms) {
            errors.agreed_to_terms = "You must agree to terms and conditions";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate payment data
     */
    validatePaymentData(data) {
        const errors = {};

        if (!data.payment_method) {
            errors.payment_method = "Payment method is required";
        }

        if (!data.amount || data.amount <= 0) {
            errors.amount = "Valid payment amount is required";
        }

        if (
            data.payment_method === "stripe" &&
            !data.stripe_payment_method_id
        ) {
            errors.stripe_payment_method_id =
                "Payment method details required for card payments";
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Validate review data
     */
    validateReviewData(data) {
        const errors = {};

        if (!data.rating || data.rating < 1 || data.rating > 5) {
            errors.rating = "Rating must be between 1 and 5 stars";
        }

        if (data.comment && data.comment.length < 10) {
            errors.comment = "Review comment must be at least 10 characters";
        }

        if (data.comment && data.comment.length > 1000) {
            errors.comment = "Review comment cannot exceed 1000 characters";
        }

        // Validate detailed ratings if provided
        const detailedRatings = [
            "quality_rating",
            "punctuality_rating",
            "communication_rating",
            "value_rating",
        ];
        detailedRatings.forEach((rating) => {
            if (data[rating] && (data[rating] < 1 || data[rating] > 5)) {
                errors[rating] = "Rating must be between 1 and 5 stars";
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors,
        };
    }

    /**
     * Error handler - consistent with existing pattern
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
     * Helper method to format appointment data for display
     */
    formatAppointmentForDisplay(appointment) {
        return {
            ...appointment,
            formatted_date: this.formatDate(appointment.appointment_date),
            formatted_time: this.formatTime(appointment.appointment_time),
            formatted_price: `Rs. ${appointment.total_price}`,
            status_text:
                appointment.status_text ||
                this.getStatusText(appointment.status),
            can_be_cancelled: this.canBeCancelled(appointment),
            can_be_paid: this.canBePaid(appointment),
            can_be_reviewed: this.canBeReviewed(appointment),
        };
    }

    /**
     * Helper methods for status checks
     */
    canBeCancelled(appointment) {
        if (!["pending", "confirmed"].includes(appointment.status))
            return false;

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.appointment_time}`
        );
        const hoursUntilAppointment =
            (appointmentDateTime - new Date()) / (1000 * 60 * 60);

        return hoursUntilAppointment > 24;
    }

    canBePaid(appointment) {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    }

    canBeReviewed(appointment) {
        return appointment.status === "paid" && !appointment.client_review;
    }

    /**
     * Helper methods for formatting
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    formatTime(timeString) {
        const [hours, minutes] = timeString.split(":");
        const time = new Date();
        time.setHours(parseInt(hours), parseInt(minutes));

        return time.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }

    getStatusText(status) {
        const statusMap = {
            pending: "Pending Confirmation",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            invoice_sent: "Invoice Sent",
            payment_pending: "Payment Pending",
            paid: "Paid",
            reviewed: "Reviewed",
            closed: "Closed",
            cancelled_by_client: "Cancelled",
            cancelled_by_provider: "Cancelled by Provider",
        };

        return statusMap[status] || status.replace("_", " ");
    }
}

export default new ClientAppointmentService();
