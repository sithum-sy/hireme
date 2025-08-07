import axios from "axios";

const API_BASE = "/api/provider/invoices";

class InvoiceService {
    /**
     * Get provider's invoices
     */
    async getInvoices(params = {}) {
        try {
            const response = await axios.get(API_BASE, { params });
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Invoices loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load invoices");
        }
    }

    /**
     * Get invoice details
     */
    async getInvoiceDetail(invoiceId) {
        try {
            const response = await axios.get(`${API_BASE}/${invoiceId}`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Invoice details loaded",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load invoice details");
        }
    }

    /**
     * Create new invoice
     */
    async createInvoice(invoiceData) {
        try {
            // Validate required fields
            if (!invoiceData.appointment_id) {
                return {
                    success: false,
                    message: "Appointment ID is required",
                };
            }

            const response = await axios.post(API_BASE, {
                appointment_id: invoiceData.appointment_id,
                payment_method: invoiceData.payment_method || null,
                due_days: invoiceData.due_days || 7,
                notes: invoiceData.notes,
                line_items: invoiceData.line_items || [],
                additional_charges: invoiceData.additional_charges || [],
                discounts: invoiceData.discounts || [],
                send_invoice: invoiceData.send_invoice || false,
            });

            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Invoice created successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to create invoice");
        }
    }

    /**
     * Send invoice to client
     */
    async sendInvoice(invoiceId) {
        try {
            const response = await axios.patch(`${API_BASE}/${invoiceId}/send`);
            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Invoice sent successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to send invoice");
        }
    }

    /**
     * Mark invoice as paid
     */
    async markInvoicePaid(invoiceId, paymentData) {
        try {
            const response = await axios.patch(
                `${API_BASE}/${invoiceId}/mark-paid`,
                {
                    payment_method: paymentData.payment_method,
                    transaction_id: paymentData.transaction_id,
                    payment_date: paymentData.payment_date,
                    notes: paymentData.notes,
                }
            );

            return {
                success: true,
                data: response.data.data,
                message: response.data.message || "Invoice marked as paid",
            };
        } catch (error) {
            return this.handleError(error, "Failed to mark invoice as paid");
        }
    }

    /**
     * Get invoice statistics
     */
    async getInvoiceStatistics() {
        try {
            const response = await axios.get(`${API_BASE}/statistics`);
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
     * Get earnings data
     */
    async getEarningsData(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/earnings`, {
                params,
            });
            return {
                success: true,
                data: response.data.data,
                message: "Earnings data loaded successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to load earnings data");
        }
    }

    /**
     * Confirm cash payment received
     */
    async confirmCashReceived(invoiceId, paymentData) {
        try {
            const response = await axios.patch(
                `${API_BASE}/${invoiceId}/confirm-cash`,
                {
                    amount_received: paymentData.amount_received,
                    received_at: paymentData.received_at,
                    notes: paymentData.notes,
                }
            );

            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message ||
                    "Cash payment confirmed successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to confirm cash payment");
        }
    }

    /**
     * Handle API errors consistently
     */
    handleError(error, defaultMessage) {
        console.error("Invoice API Error:", error);

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;

            if (status === 422) {
                // Validation errors
                return {
                    success: false,
                    message: "Validation failed",
                    errors: data.errors || {},
                };
            } else if (status === 403) {
                return {
                    success: false,
                    message: "You don't have permission to perform this action",
                };
            } else if (status === 404) {
                return {
                    success: false,
                    message: "Invoice not found",
                };
            } else {
                return {
                    success: false,
                    message: data.message || defaultMessage,
                };
            }
        } else if (error.request) {
            // Network error
            return {
                success: false,
                message: "Network error. Please check your connection.",
            };
        } else {
            // Other error
            return {
                success: false,
                message: defaultMessage,
            };
        }
    }
}

export default new InvoiceService();
