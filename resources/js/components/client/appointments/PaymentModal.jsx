import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CardPaymentForm from "../../payments/CardPaymentForm";
import clientAppointmentService from "../../../services/clientAppointmentService";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ appointment, onSuccess, onCancel, onError }) => {
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [cashNotes, setCashNotes] = useState("");
    const [clientSecret, setClientSecret] = useState("");
    const [stripeLoaded, setStripeLoaded] = useState(true); // Stripe Elements handles loading, default to true

    const createPaymentIntent = async () => {
        try {
            setLoading(true);

            // Get CSRF token from meta tag or cookie
            const csrfToken =
                document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute("content") || getCookie("XSRF-TOKEN");

            const response = await fetch("/api/create-payment-intent", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    Accept: "application/json",
                    "X-CSRF-TOKEN": csrfToken,
                    "X-Requested-With": "XMLHttpRequest", // Important for Laravel
                },
                credentials: "include", // Include cookies for CSRF
                body: JSON.stringify({
                    amount: Math.round(appointment.invoice.total_amount * 100),
                    appointment_id: appointment.id,
                    currency: "lkr",
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setClientSecret(data.client_secret);
            } else {
                onError(
                    data.error ||
                        "Failed to initialize card payment. Please try again."
                );
            }
        } catch (error) {
            onError("Failed to initialize card payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get cookie value
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
        return null;
    };

    // Create payment intent when stripe is selected
    useEffect(() => {
        if (paymentMethod === "stripe") {
            createPaymentIntent();
        } else {
            // Clear client secret when switching back to cash
            setClientSecret("");
        }
    }, [paymentMethod]);

    // Handle cash payment directly
    const handleCashPayment = async () => {
        setLoading(true);
        try {
            const result = await clientAppointmentService.payInvoice(
                appointment.id,
                {
                    payment_method: "cash",
                    amount: appointment.invoice.total_amount,
                    notes: cashNotes || "Client confirmed cash payment",
                }
            );

            if (result.success) {
                onSuccess(result.data);
            } else {
                onError(result.message || "Cash payment processing failed");
            }
        } catch (error) {
            onError("Cash payment processing failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStripePaymentSuccess = async (paymentIntent) => {
        try {
            // Call backend API to process the successful Stripe payment
            const result = await clientAppointmentService.payInvoice(
                appointment.id,
                {
                    payment_method: "stripe",
                    amount: appointment.invoice.total_amount,
                    stripe_payment_method_id: paymentIntent.payment_method,
                    notes: `Card payment processed successfully. Payment Intent: ${paymentIntent.id}`,
                    stripe_payment_intent_id: paymentIntent.id
                }
            );

            if (result.success) {
                onSuccess(result.data); // Pass the updated appointment data
            } else {
                onError(result.message || "Payment succeeded but failed to update appointment status");
            }
        } catch (error) {
            onError("Payment succeeded but failed to update appointment status: " + error.message);
        }
    };

    const handleStripePaymentError = (error) => {
        onError(error.message || "Card payment failed. Please try again.");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (paymentMethod === "cash") {
            await handleCashPayment();
        }
        // Stripe payment is handled by the CardPaymentForm component
    };

    // Debug: Log payment method and client secret
    return (
        <form onSubmit={handleSubmit}>
            {/* Payment Method Selection */}
            <div className="payment-method-selection mb-4">
                <h6 className="fw-bold mb-3">Select Payment Method</h6>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="cash"
                        value="cash"
                        checked={paymentMethod === "cash"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="cash">
                        <i className="fas fa-money-bill text-success me-2"></i>
                        Cash Payment
                        <small className="d-block text-muted">
                            Pay in cash to the provider
                        </small>
                    </label>
                </div>

                <div className="form-check mb-3">
                    <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="stripe"
                        value="stripe"
                        checked={paymentMethod === "stripe"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="stripe">
                        <i className="fas fa-credit-card text-primary me-2"></i>
                        Credit/Debit Card
                        <small className="d-block text-muted">
                            Secure payment with Stripe
                        </small>
                    </label>
                </div>
            </div>

            {/* Cash Payment Notes */}
            {paymentMethod === "cash" && (
                <div className="cash-payment-form mb-4">
                    <label className="form-label fw-semibold">
                        Payment Notes (Optional)
                    </label>
                    <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Add any notes about the cash payment..."
                        value={cashNotes}
                        onChange={(e) => setCashNotes(e.target.value)}
                    />
                    <small className="text-muted mt-2 d-block">
                        <i className="fas fa-info-circle me-1"></i>
                        The provider will be notified about your cash payment
                        confirmation
                    </small>
                </div>
            )}

            {/* Stripe Card Payment Form */}
            {paymentMethod === "stripe" && (
                <div className="stripe-payment-form mb-4">
                    {clientSecret ? (
                        <>
                            <Elements stripe={stripePromise}>
                                <CardPaymentForm
                                    amount={appointment.invoice.total_amount}
                                    clientSecret={clientSecret}
                                    onPaymentSuccess={handleStripePaymentSuccess}
                                    onPaymentError={handleStripePaymentError}
                                    loading={loading}
                                    setLoading={setLoading}
                                />
                            </Elements>
                        </>
                    ) : (
                        <>
                            <div className="text-center py-4">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                                <div className="mt-2">
                                    Initializing card payment...
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Payment Summary */}
            <div className="payment-summary bg-light rounded p-3 mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-semibold">Total Amount:</span>
                    <span className="h5 mb-0 text-success fw-bold">
                        Rs. {appointment.invoice.total_amount}
                    </span>
                </div>
                <small className="text-muted">
                    Service: {appointment.service?.title}
                </small>
            </div>

            {/* Action Buttons - Only show for cash payment */}
            {paymentMethod === "cash" && (
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success flex-fill"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                ></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-money-bill me-2"></i>
                                Confirm Cash Payment
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Cancel button for Stripe payment */}
            {paymentMethod === "stripe" && (
                <div className="d-flex justify-content-start">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </form>
    );
};

const PaymentModal = ({ show, onHide, appointment, onPaymentSuccess }) => {
    const [error, setError] = useState("");


    const canBePaid = () => {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    };

    const handleSuccess = (updatedAppointment) => {
        setError("");
        onPaymentSuccess(updatedAppointment);
        onHide();
    };

    const handleError = (errorMessage) => {
        setError(errorMessage);
    };

    const handleCancel = () => {
        setError("");
        onHide();
    };

    if (!show) return null;

    return (
        <>
            <div
                className="modal-backdrop fade show"
                onClick={handleCancel}
            ></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
            >
                <div
                    className="modal-dialog modal-lg modal-dialog-centered"
                    role="document"
                >
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title d-flex align-items-center">
                                <i className="fas fa-credit-card text-primary me-2"></i>
                                Payment for {appointment.service?.title}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleCancel}
                                aria-label="Close"
                            ></button>
                        </div>

                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger d-flex align-items-center mb-4">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <div>{error}</div>
                                </div>
                            )}

                            <div className="appointment-info bg-light rounded p-3 mb-4">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                Service:
                                            </small>
                                            <div className="fw-semibold">
                                                {appointment.service?.title}
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                Provider:
                                            </small>
                                            <div className="fw-semibold">
                                                {
                                                    appointment.provider
                                                        ?.first_name
                                                }{" "}
                                                {
                                                    appointment.provider
                                                        ?.last_name
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                Date:
                                            </small>
                                            <div className="fw-semibold">
                                                {appointment.appointment_date
                                                    ? appointment.appointment_date.slice(
                                                          0,
                                                          10
                                                      )
                                                    : ""}
                                            </div>
                                        </div>
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                Time:
                                            </small>
                                            <div className="fw-semibold">
                                                {appointment.appointment_time}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <PaymentForm
                                appointment={appointment}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                                onError={handleError}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentModal;
