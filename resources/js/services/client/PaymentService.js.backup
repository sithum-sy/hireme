import BaseService from '../core/BaseService';

/**
 * Client Payment Service
 * Handles payment processing and payment-related operations for clients
 */
class ClientPaymentService extends BaseService {
    constructor(apiClient) {
        super(apiClient, { 
            enableCache: false // Payment data should not be cached
        });
        this.baseURL = "/client";
    }

    /**
     * Process payment for an appointment
     */
    async processPayment(appointmentId, paymentData) {
        const payload = {
            payment_method: paymentData.payment_method,
            payment_token: paymentData.payment_token,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            save_payment_method: paymentData.save_payment_method || false,
            billing_address: paymentData.billing_address
        };

        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/payment`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get payment methods for user
     */
    async getPaymentMethods() {
        return this.apiCall("GET", `${this.baseURL}/payment-methods`);
    }

    /**
     * Add new payment method
     */
    async addPaymentMethod(paymentMethodData) {
        const payload = {
            payment_token: paymentMethodData.payment_token,
            is_default: paymentMethodData.is_default || false,
            billing_address: paymentMethodData.billing_address
        };

        return this.apiCall("POST", `${this.baseURL}/payment-methods`, payload);
    }

    /**
     * Update payment method
     */
    async updatePaymentMethod(paymentMethodId, updateData) {
        const payload = {
            is_default: updateData.is_default,
            billing_address: updateData.billing_address
        };

        return this.apiCall("PATCH", `${this.baseURL}/payment-methods/${paymentMethodId}`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Delete payment method
     */
    async deletePaymentMethod(paymentMethodId) {
        return this.apiCall("DELETE", `${this.baseURL}/payment-methods/${paymentMethodId}`);
    }

    /**
     * Set default payment method
     */
    async setDefaultPaymentMethod(paymentMethodId) {
        return this.apiCall("POST", `${this.baseURL}/payment-methods/${paymentMethodId}/set-default`);
    }

    /**
     * Get payment history
     */
    async getPaymentHistory(params = {}) {
        const defaultParams = {
            page: 1,
            per_page: 20,
            status: 'all',
            date_from: null,
            date_to: null
        };

        return this.apiCall("GET", `${this.baseURL}/payments`, {
            ...defaultParams,
            ...this.cleanPayload(params)
        });
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentId) {
        return this.apiCall("GET", `${this.baseURL}/payments/${paymentId}`);
    }

    /**
     * Request refund
     */
    async requestRefund(paymentId, refundData) {
        const payload = {
            reason: refundData.reason,
            amount: refundData.amount,
            description: refundData.description
        };

        return this.apiCall("POST", `${this.baseURL}/payments/${paymentId}/refund`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get refund status
     */
    async getRefundStatus(paymentId) {
        return this.apiCall("GET", `${this.baseURL}/payments/${paymentId}/refund-status`);
    }

    /**
     * Download payment receipt
     */
    async downloadReceipt(paymentId) {
        const config = {
            responseType: 'blob'
        };

        return this.apiCall("GET", `${this.baseURL}/payments/${paymentId}/receipt`, 
            null, config
        );
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(period = '12m') {
        return this.apiCall("GET", `${this.baseURL}/payments/stats`, { period });
    }

    /**
     * Verify payment status
     */
    async verifyPaymentStatus(paymentId) {
        return this.apiCall("GET", `${this.baseURL}/payments/${paymentId}/verify`);
    }

    /**
     * Get pending payments
     */
    async getPendingPayments() {
        return this.apiCall("GET", `${this.baseURL}/payments/pending`);
    }

    /**
     * Setup payment plan for large amounts
     */
    async setupPaymentPlan(appointmentId, planData) {
        const payload = {
            plan_type: planData.plan_type,
            installments: planData.installments,
            down_payment: planData.down_payment,
            start_date: this.formatDate(planData.start_date)
        };

        return this.apiCall("POST", `${this.baseURL}/appointments/${appointmentId}/payment-plan`, 
            this.cleanPayload(payload)
        );
    }

    /**
     * Get active payment plans
     */
    async getPaymentPlans() {
        return this.apiCall("GET", `${this.baseURL}/payment-plans`);
    }

    /**
     * Cancel payment plan
     */
    async cancelPaymentPlan(planId, reason = null) {
        return this.apiCall("POST", `${this.baseURL}/payment-plans/${planId}/cancel`, {
            reason
        });
    }

    // Utility methods

    /**
     * Format payment data for display
     */
    formatPaymentData(payment) {
        return {
            ...payment,
            display_amount: this.formatCurrency(payment.amount, payment.currency),
            display_date: new Date(payment.created_at).toLocaleDateString(),
            status_class: this.getPaymentStatusClass(payment.status),
            can_refund: this.canRequestRefund(payment),
            refund_deadline: this.calculateRefundDeadline(payment.created_at)
        };
    }

    /**
     * Get payment status CSS class
     */
    getPaymentStatusClass(status) {
        const statusClasses = {
            'pending': 'badge bg-warning',
            'processing': 'badge bg-info',
            'completed': 'badge bg-success',
            'failed': 'badge bg-danger',
            'cancelled': 'badge bg-secondary',
            'refunded': 'badge bg-dark',
            'partially_refunded': 'badge bg-warning'
        };

        return statusClasses[status] || 'badge bg-secondary';
    }

    /**
     * Check if payment can be refunded
     */
    canRequestRefund(payment) {
        if (payment.status !== 'completed') return false;
        
        const paymentDate = new Date(payment.created_at);
        const now = new Date();
        const daysDiff = (now - paymentDate) / (1000 * 60 * 60 * 24);
        
        // Allow refunds within 30 days
        return daysDiff <= 30;
    }

    /**
     * Calculate refund deadline
     */
    calculateRefundDeadline(paymentDate) {
        const date = new Date(paymentDate);
        date.setDate(date.getDate() + 30);
        return date;
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Validate payment data
     */
    validatePaymentData(paymentData) {
        const errors = {};

        if (!paymentData.payment_method) {
            errors.payment_method = "Payment method is required";
        }

        if (!paymentData.amount || paymentData.amount <= 0) {
            errors.amount = "Valid amount is required";
        }

        if (paymentData.billing_address) {
            if (!paymentData.billing_address.street) {
                errors.billing_street = "Billing street address is required";
            }
            if (!paymentData.billing_address.city) {
                errors.billing_city = "Billing city is required";
            }
            if (!paymentData.billing_address.postal_code) {
                errors.billing_postal_code = "Billing postal code is required";
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    /**
     * Calculate payment processing fee
     */
    calculateProcessingFee(amount, paymentMethod = 'card') {
        const fees = {
            'card': 0.029, // 2.9%
            'bank_transfer': 0.008, // 0.8%
            'digital_wallet': 0.025 // 2.5%
        };

        const feeRate = fees[paymentMethod] || fees.card;
        return Math.round((amount * feeRate) * 100) / 100;
    }

    /**
     * Get payment method display name
     */
    getPaymentMethodDisplayName(method) {
        const displayNames = {
            'card': 'Credit/Debit Card',
            'bank_transfer': 'Bank Transfer',
            'digital_wallet': 'Digital Wallet',
            'cash': 'Cash'
        };

        return displayNames[method] || method;
    }
}

export default ClientPaymentService;