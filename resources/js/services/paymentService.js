import axios from "axios";

class PaymentService {
    constructor() {
        // Initialize Stripe if needed
        this.stripe = null;
        this.isStripeLoaded = false;
    }

    /**
     * Initialize Stripe (call this when payment component mounts)
     */
    async initializeStripe() {
        if (this.isStripeLoaded) return this.stripe;

        try {
            // Load Stripe.js dynamically
            if (!window.Stripe) {
                const script = document.createElement("script");
                script.src = "https://js.stripe.com/v3/";
                document.head.appendChild(script);

                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
            }

            // Initialize Stripe with your publishable key
            this.stripe = window.Stripe(
                process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
            );
            this.isStripeLoaded = true;

            return this.stripe;
        } catch (error) {
            console.error("Failed to initialize Stripe:", error);
            throw new Error("Payment system initialization failed");
        }
    }

    /**
     * Create payment method with Stripe
     */
    async createPaymentMethod(cardElement, billingDetails = {}) {
        try {
            const stripe = await this.initializeStripe();

            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
                billing_details: billingDetails,
            });

            if (error) {
                return {
                    success: false,
                    message: error.message,
                    error: error,
                };
            }

            return {
                success: true,
                paymentMethod: paymentMethod,
                message: "Payment method created successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to create payment method",
                error: error,
            };
        }
    }

    /**
     * Process appointment payment
     */
    async processAppointmentPayment(appointmentId, paymentData) {
        try {
            if (paymentData.payment_method === "stripe") {
                return await this.processStripePayment(
                    appointmentId,
                    paymentData
                );
            } else if (paymentData.payment_method === "cash") {
                return await this.processCashPayment(
                    appointmentId,
                    paymentData
                );
            }

            return {
                success: false,
                message: "Invalid payment method",
            };
        } catch (error) {
            return {
                success: false,
                message: "Payment processing failed",
                error: error,
            };
        }
    }

    /**
     * Process Stripe payment
     */
    async processStripePayment(appointmentId, paymentData) {
        try {
            const response = await axios.post(
                `/api/client/appointments/${appointmentId}/pay`,
                {
                    payment_method: "stripe",
                    amount: paymentData.amount,
                    stripe_payment_method_id:
                        paymentData.stripe_payment_method_id,
                    notes: paymentData.notes,
                }
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                    payment: response.data.payment,
                    message: response.data.message,
                };
            }

            return {
                success: false,
                message: response.data.message || "Payment failed",
            };
        } catch (error) {
            if (error.response?.data?.requires_action) {
                // Handle 3D Secure authentication
                return await this.handle3DSecure(
                    error.response.data.payment_intent
                );
            }

            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Payment processing failed",
            };
        }
    }

    /**
     * Handle 3D Secure authentication
     */
    async handle3DSecure(paymentIntent) {
        try {
            const stripe = await this.initializeStripe();

            const { error } = await stripe.confirmCardPayment(
                paymentIntent.client_secret
            );

            if (error) {
                return {
                    success: false,
                    message: error.message,
                };
            }

            return {
                success: true,
                message: "Payment completed successfully",
                requires_refresh: true, // Signal to refresh appointment data
            };
        } catch (error) {
            return {
                success: false,
                message: "Authentication failed",
            };
        }
    }

    /**
     * Process cash payment
     */
    async processCashPayment(appointmentId, paymentData) {
        try {
            const response = await axios.post(
                `/api/client/appointments/${appointmentId}/pay`,
                {
                    payment_method: "cash",
                    amount: paymentData.amount,
                    notes: paymentData.notes || "Client confirmed cash payment",
                }
            );

            return {
                success: true,
                data: response.data.data,
                payment: response.data.payment,
                message: response.data.message,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Cash payment processing failed",
            };
        }
    }

    /**
     * Validate payment amount
     */
    validatePaymentAmount(amount, invoiceAmount) {
        const numAmount = parseFloat(amount);
        const numInvoiceAmount = parseFloat(invoiceAmount);

        if (isNaN(numAmount) || numAmount <= 0) {
            return {
                isValid: false,
                message: "Invalid payment amount",
            };
        }

        if (numAmount !== numInvoiceAmount) {
            return {
                isValid: false,
                message: "Payment amount must match invoice total",
            };
        }

        return {
            isValid: true,
            message: "Payment amount is valid",
        };
    }

    /**
     * Format currency for display
     */
    formatCurrency(amount, currency = "LKR") {
        const numAmount = parseFloat(amount);

        if (currency === "LKR") {
            return `Rs. ${numAmount.toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            })}`;
        }

        return `${currency} ${numAmount.toFixed(2)}`;
    }

    /**
     * Get payment method display name
     */
    getPaymentMethodDisplayName(method) {
        const methodNames = {
            stripe: "Credit/Debit Card",
            cash: "Cash Payment",
        };

        return methodNames[method] || method;
    }

    /**
     * Generate receipt data for display
     */
    generateReceiptData(payment, appointment) {
        return {
            receipt_id: `RCP-${String(payment.id).padStart(8, "0")}`,
            payment_date: new Date(payment.processed_at).toLocaleDateString(),
            payment_time: new Date(payment.processed_at).toLocaleTimeString(),
            amount: this.formatCurrency(payment.amount),
            method: this.getPaymentMethodDisplayName(payment.method),
            service: appointment.service?.title || "Service",
            provider: appointment.provider?.name || "Provider",
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            transaction_id: payment.transaction_id,
        };
    }
}

export default new PaymentService();
