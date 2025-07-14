import axios from "axios";

const API_BASE = "/api/provider";

class InvoiceService {
    /**
     * Get all invoices with filtering
     */
    async getInvoices(params = {}) {
        try {
            const response = await axios.get(`${API_BASE}/invoices`, {
                params,
            });
            return {
                success: true,
                data: response.data.data || response.data,
                message: "Invoices loaded successfully",
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
            const response = await axios.get(
                `${API_BASE}/invoices/${invoiceId}`
            );
            return {
                success: true,
                data: response.data.data,
                message: "Invoice details loaded",
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
            const response = await axios.post(
                `${API_BASE}/invoices`,
                invoiceData
            );
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
     * Update invoice
     */
    async updateInvoice(invoiceId, invoiceData) {
        try {
            const response = await axios.patch(
                `${API_BASE}/invoices/${invoiceId}`,
                invoiceData
            );
            return {
                success: true,
                data: response.data.data,
                message:
                    response.data.message || "Invoice updated successfully",
            };
        } catch (error) {
            return this.handleError(error, "Failed to update invoice");
        }
    }

    /**
     * Send invoice to client
     */
    async sendInvoice(invoiceId) {
        try {
            const response = await axios.patch(
                `${API_BASE}/invoices/${invoiceId}/send`
            );
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
                `${API_BASE}/invoices/${invoiceId}/mark-paid`,
                paymentData
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
            const response = await axios.get(`${API_BASE}/invoices/statistics`);
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
            const response = await axios.get(`${API_BASE}/invoices/earnings`, {
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
     * Error handler - consistent with your existing pattern
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

export default new InvoiceService();
