import React, { useState, useEffect } from "react";
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

    const createPaymentIntent = async () => {
        try {
            setLoading(true);
            console.log(
                "Creating payment intent for appointment:",
                appointment.id
            );

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
            console.log("Payment intent response:", data);

            if (response.ok && data.success) {
                setClientSecret(data.client_secret);
                console.log("Client secret set successfully");
            } else {
                console.error("Payment intent creation failed:", data);
                onError(
                    data.error ||
                        "Failed to initialize card payment. Please try again."
                );
            }
        } catch (error) {
            console.error("Error creating payment intent:", error);
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
            console.log(
                "Stripe payment method selected, creating payment intent..."
            );
            createPaymentIntent();
        } else {
            // Clear client secret when switching back to cash
            setClientSecret("");
        }
    }, [paymentMethod]);

    // // Create payment intent when stripe is selected
    // useEffect(() => {
    //     if (paymentMethod === "stripe") {
    //         createPaymentIntent();
    //     }
    // }, [paymentMethod]);

    // // Load Stripe.js dynamically with proper environment variable
    // useEffect(() => {
    //     loadStripe();
    // }, []);

    // const loadStripe = async () => {
    //     try {
    //         if (window.Stripe) {
    //             setStripeLoaded(true);
    //             return;
    //         }

    //         const script = document.createElement("script");
    //         script.src = "https://js.stripe.com/v3/";
    //         script.onload = () => {
    //             // Use the correct environment variable syntax for your build tool
    //             const stripeKey =
    //                 import.meta?.env?.VITE_STRIPE_PUBLISHABLE_KEY || // Vite
    //                 window.env?.REACT_APP_STRIPE_PUBLISHABLE_KEY || // Custom window env
    //                 "pk_test_51RlDXCPis5J9zHNjb9QWMMydXKG4oJrBUZ3kQFE8eWjxyfHt0mJI0GKcx59zBTNgcYhaeqRFyZXhCxzAFbf5tLsE00A9uf01Oq"; // Fallback for development

    //             window.stripe = window.Stripe(stripeKey);
    //             setStripeLoaded(true);
    //         };
    //         script.onerror = () => {
    //             console.error("Failed to load Stripe.js");
    //             setStripeLoaded(false);
    //         };
    //         document.head.appendChild(script);
    //     } catch (error) {
    //         console.error("Error loading Stripe:", error);
    //         setStripeLoaded(false);
    //     }
    // };

    // const handleSubmit = async (event) => {
    //     event.preventDefault();
    //     setLoading(true);

    //     try {
    //         if (paymentMethod === "stripe") {
    //             await handleStripePayment();
    //         } else if (paymentMethod === "cash") {
    //             await handleCashPayment();
    //         }
    //     } catch (error) {
    //         onError(error.message || "Payment processing failed");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleStripePayment = async () => {
    //     if (!stripeLoaded || !window.stripe) {
    //         onError("Payment system not ready. Please try again.");
    //         return;
    //     }

    //     try {
    //         // Basic card validation
    //         const cardNumber = cardDetails.number.replace(/\s/g, "");
    //         if (cardNumber.length < 13 || cardNumber.length > 19) {
    //             onError("Please enter a valid card number");
    //             return;
    //         }

    //         if (!cardDetails.expiry || cardDetails.expiry.length !== 5) {
    //             onError("Please enter a valid expiry date (MM/YY)");
    //             return;
    //         }

    //         if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
    //             onError("Please enter a valid CVC");
    //             return;
    //         }

    //         // Create payment method using Stripe Elements or manual approach
    //         const paymentMethodResult = await createStripePaymentMethod();

    //         if (paymentMethodResult.error) {
    //             onError(paymentMethodResult.error.message);
    //             return;
    //         }

    //         // Process payment through backend
    //         const result = await clientAppointmentService.payInvoice(
    //             appointment.id,
    //             {
    //                 payment_method: "stripe",
    //                 amount: appointment.invoice.total_amount,
    //                 stripe_payment_method_id:
    //                     paymentMethodResult.paymentMethod.id,
    //                 notes: "Card payment via Stripe",
    //             }
    //         );

    //         if (result.success) {
    //             onSuccess(result.data);
    //         } else {
    //             onError(result.message || "Payment failed");
    //         }
    //     } catch (error) {
    //         onError("Payment processing failed: " + error.message);
    //     }
    // };

    // const createStripePaymentMethod = async () => {
    //     try {
    //         const [month, year] = cardDetails.expiry.split("/");

    //         return await window.stripe.createPaymentMethod({
    //             type: "card",
    //             card: {
    //                 number: cardDetails.number.replace(/\s/g, ""),
    //                 exp_month: parseInt(month),
    //                 exp_year: parseInt(`20${year}`),
    //                 cvc: cardDetails.cvc,
    //             },
    //             billing_details: {
    //                 name: cardDetails.name,
    //             },
    //         });
    //     } catch (error) {
    //         return {
    //             error: { message: "Invalid card details: " + error.message },
    //         };
    //     }
    // };

    // const handleCashPayment = async () => {
    //     try {
    //         const result = await clientAppointmentService.payInvoice(
    //             appointment.id,
    //             {
    //                 payment_method: "cash",
    //                 amount: appointment.invoice.total_amount,
    //                 notes: cashNotes || "Client confirmed cash payment",
    //             }
    //         );

    //         if (result.success) {
    //             onSuccess(result.data);
    //         } else {
    //             onError(result.message || "Cash payment processing failed");
    //         }
    //     } catch (error) {
    //         onError("Cash payment processing failed: " + error.message);
    //     }
    // };

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

    const handleStripePaymentSuccess = (paymentIntent) => {
        console.log("Stripe payment successful:", paymentIntent);
        onSuccess(paymentIntent);
    };

    const handleStripePaymentError = (error) => {
        console.error("Stripe payment error:", error);
        onError(error.message || "Card payment failed. Please try again.");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (paymentMethod === "cash") {
            await handleCashPayment();
        }
        // Stripe payment is handled by the CardPaymentForm component
    };

    // const handleCardInputChange = (field, value) => {
    //     let formattedValue = value;

    //     if (field === "number") {
    //         // Remove all non-digits and add spaces every 4 digits
    //         formattedValue = value
    //             .replace(/\D/g, "")
    //             .replace(/(\d{4})(?=\d)/g, "$1 ");
    //         if (formattedValue.length > 19)
    //             formattedValue = formattedValue.slice(0, 19);
    //     } else if (field === "expiry") {
    //         // Format as MM/YY
    //         formattedValue = value
    //             .replace(/\D/g, "")
    //             .replace(/(\d{2})(?=\d)/, "$1/");
    //         if (formattedValue.length > 5)
    //             formattedValue = formattedValue.slice(0, 5);
    //     } else if (field === "cvc") {
    //         // Only digits, max 4
    //         formattedValue = value.replace(/\D/g, "").slice(0, 4);
    //     }

    //     setCardDetails((prev) => ({
    //         ...prev,
    //         [field]: formattedValue,
    //     }));
    // };

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

                    {/* Cash Payment Action */}
                    {/* <div className="mt-3">
                        <button
                            type="submit"
                            className="btn btn-success w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-money-bill me-2"></i>
                                    Confirm Cash Payment
                                </>
                            )}
                        </button>
                    </div> */}
                </div>
            )}

            {/* Stripe Card Form */}
            {/* {paymentMethod === "stripe" && (
                <div className="stripe-payment-form mb-4">
                    <h6 className="fw-semibold mb-3">Card Details</h6>

                    <div className="row">
                        <div className="col-12 mb-3">
                            <label className="form-label">
                                Cardholder Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="John Doe"
                                value={cardDetails.name}
                                onChange={(e) =>
                                    handleCardInputChange(
                                        "name",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="col-12 mb-3">
                            <label className="form-label">Card Number</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.number}
                                onChange={(e) =>
                                    handleCardInputChange(
                                        "number",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="col-6 mb-3">
                            <label className="form-label">Expiry Date</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={(e) =>
                                    handleCardInputChange(
                                        "expiry",
                                        e.target.value
                                    )
                                }
                                required
                            />
                        </div>

                        <div className="col-6 mb-3">
                            <label className="form-label">CVC</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="123"
                                value={cardDetails.cvc}
                                onChange={(e) =>
                                    handleCardInputChange("cvc", e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    {!stripeLoaded && (
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Loading payment system...
                        </div>
                    )}

                    <small className="text-muted d-block">
                        <i className="fas fa-shield-alt me-1"></i>
                        Your payment information is secure and encrypted
                    </small>
                </div>
            )} */}

            {/* Stripe Card Payment Form */}
            {paymentMethod === "stripe" && (
                <div className="stripe-payment-form mb-4">
                    {clientSecret ? (
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
                    ) : (
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

            {/* Action Buttons */}
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
                    className={`btn ${
                        paymentMethod === "stripe"
                            ? "btn-primary"
                            : "btn-success"
                    } flex-fill`}
                    disabled={
                        loading || (paymentMethod === "stripe" && !stripeLoaded)
                    }
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
                            <i
                                className={`fas ${
                                    paymentMethod === "stripe"
                                        ? "fa-credit-card"
                                        : "fa-money-bill"
                                } me-2`}
                            ></i>
                            {paymentMethod === "stripe"
                                ? `Pay Rs. ${appointment.invoice.total_amount}`
                                : "Confirm Cash Payment"}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
};

const PaymentModal = ({ show, onHide, appointment, onPaymentSuccess }) => {
    const [error, setError] = useState("");

    // Debug: Log appointment data
    useEffect(() => {
        if (show && appointment) {
            console.log("Payment Modal - Appointment Data:", {
                id: appointment.id,
                status: appointment.status,
                invoice: appointment.invoice,
                hasInvoice: !!appointment.invoice,
                invoiceStatus: appointment.invoice?.payment_status,
                canBePaid: canBePaid(),
            });
        }
    }, [show, appointment]);

    // Enhanced canBePaid check with logging
    const canBePaid = () => {
        console.log("Checking if can be paid:", {
            hasInvoice: !!appointment.invoice,
            invoicePaymentStatus: appointment.invoice?.payment_status,
            appointmentStatus: appointment.status,
            result:
                appointment.invoice &&
                appointment.invoice.payment_status === "pending" &&
                ["completed", "invoice_sent", "payment_pending"].includes(
                    appointment.status
                ),
        });

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
