// components/payments/CardPaymentForm.jsx
import React, { useState, useEffect } from "react";
import {
    useStripe,
    useElements,
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
} from "@stripe/react-stripe-js";

const CardPaymentForm = ({
    amount,
    onPaymentSuccess,
    onPaymentError,
    loading,
    setLoading,
    clientSecret,
}) => {
    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = useState("");


    const elementOptions = {
        style: {
            base: {
                fontSize: "16px",
                color: "#212529",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSmoothing: "antialiased",
                lineHeight: "24px",
                "::placeholder": {
                    color: "#6c757d",
                },
            },
            invalid: {
                color: "#dc3545",
                iconColor: "#dc3545",
            },
            complete: {
                color: "#198754",
            },
        },
        hidePostalCode: true,
    };

    const handleElementReady = (element) => {
        // Element ready
    };

    const handleElementChange = (event) => {
        if (event.error) {
            // For development - show helpful message for invalid cards
            if (event.error.code === 'invalid_number') {
                setCardError("Please use a test card number: 4242 4242 4242 4242 (Visa) or 5555 5555 5555 4444 (Mastercard)");
            } else {
                setCardError(event.error.message);
            }
        } else {
            setCardError("");
        }
    };

    const handleElementFocus = (event) => {
        // Element focused
    };

    const handleElementBlur = (event) => {
        // Element blurred
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe) {
            onPaymentError({ message: "Stripe not loaded" });
            return;
        }

        if (!elements) {
            onPaymentError({ message: "Stripe Elements not loaded" });
            return;
        }

        if (!clientSecret) {
            onPaymentError({ message: "Payment not initialized" });
            return;
        }

        setLoading(true);
        setCardError("");

        const cardElement = elements.getElement(CardNumberElement);
        
        if (!cardElement) {
            setLoading(false);
            onPaymentError({ message: "Card input not found" });
            return;
        }

        try {
            const { error: confirmError, paymentIntent } =
                await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: "Customer Name",
                        },
                    },
                });

            if (confirmError) {
                setCardError(confirmError.message);
                onPaymentError(confirmError);
            } else if (paymentIntent.status === "succeeded") {
                onPaymentSuccess(paymentIntent);
            }
        } catch (error) {
            setCardError(error.message);
            onPaymentError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-payment-form">
            <div className="card-input-group">
                <div className="form-group mb-3">
                    <label className="form-label">Card Number</label>
                    <div className="stripe-element" id="card-number-element">
                        <CardNumberElement 
                            options={elementOptions}
                            onReady={handleElementReady}
                            onChange={handleElementChange}
                            onFocus={handleElementFocus}
                            onBlur={handleElementBlur}
                        />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12 col-sm-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Expiry Date</label>
                            <div className="stripe-element" id="card-expiry-element">
                                <CardExpiryElement 
                                    options={elementOptions}
                                    onReady={handleElementReady}
                                    onChange={handleElementChange}
                                    onFocus={handleElementFocus}
                                    onBlur={handleElementBlur}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6">
                        <div className="form-group mb-3">
                            <label className="form-label">CVC</label>
                            <div className="stripe-element" id="card-cvc-element">
                                <CardCvcElement 
                                    options={elementOptions}
                                    onReady={handleElementReady}
                                    onChange={handleElementChange}
                                    onFocus={handleElementFocus}
                                    onBlur={handleElementBlur}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {cardError && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {cardError}
                </div>
            )}

            {/* Test Card Information for Development */}
            <div className="alert alert-info mt-3">
                <h6 className="mb-2">
                    <i className="fas fa-info-circle me-2"></i>
                    Test Card Numbers (Development Mode)
                </h6>
                <div className="row">
                    <div className="col-md-6">
                        <strong>Visa:</strong> 4242 4242 4242 4242<br/>
                        <strong>Visa (Debit):</strong> 4000 0566 5566 5556<br/>
                        <strong>Mastercard:</strong> 5555 5555 5555 4444
                    </div>
                    <div className="col-md-6">
                        <strong>Any future expiry date</strong><br/>
                        <strong>Any 3-digit CVC</strong><br/>
                        <strong>Any billing details</strong>
                    </div>
                </div>
            </div>

            <button
                type="button"
                className="btn btn-primary w-100"
                disabled={!stripe || loading}
                onClick={handleSubmit}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Processing...
                    </>
                ) : (
                    <>
                        <i className="fas fa-credit-card me-2"></i>
                        Pay Rs. {amount}
                    </>
                )}
            </button>

            <style>{`
                .stripe-element {
                    border: 1px solid #ced4da;
                    border-radius: 0.375rem;
                    background-color: #fff;
                    height: 44px;
                    padding: 0;
                    position: relative;
                    display: flex;
                    align-items: center;
                    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                    width: 100%;
                    box-sizing: border-box;
                }

                .stripe-element .StripeElement {
                    width: 100% !important;
                    height: 100% !important;
                    padding: 12px 16px !important;
                    box-sizing: border-box !important;
                }

                .stripe-element .StripeElement iframe {
                    height: 20px !important;
                    min-height: 20px !important;
                    width: 100% !important;
                }

                .stripe-element:hover {
                    border-color: #86b7fe;
                }

                .stripe-element:focus-within {
                    border-color: #0d6efd;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                    outline: 0;
                }

                .stripe-element.StripeElement--invalid {
                    border-color: #dc3545;
                }

                .stripe-element.StripeElement--invalid:focus-within {
                    border-color: #dc3545;
                    box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
                }

                .stripe-element.StripeElement--complete {
                    border-color: #198754;
                }

                .card-payment-form {
                    max-width: 100%;
                    width: 100%;
                }

                .card-input-group {
                    width: 100%;
                }

                .card-input-group .form-label {
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                    color: #212529;
                }

                /* Ensure proper sizing for each field at all screen sizes */
                #card-number-element,
                #card-expiry-element,
                #card-cvc-element {
                    height: 44px !important;
                    width: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                    box-sizing: border-box !important;
                }

                /* Responsive fixes for different screen sizes */
                @media (min-width: 576px) {
                    .stripe-element {
                        min-width: 0;
                        flex: 1;
                    }
                }

                @media (min-width: 768px) {
                    .stripe-element {
                        min-width: 150px;
                    }
                    
                    #card-expiry-element,
                    #card-cvc-element {
                        min-width: 120px;
                    }
                }

                /* Force proper width inheritance from Bootstrap grid */
                .row > .col-12,
                .row > .col-sm-6 {
                    position: relative;
                    width: 100%;
                    min-height: 1px;
                }

                @media (min-width: 576px) {
                    .row > .col-sm-6 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }
                }
            `}</style>
        </div>
    );
};

export default CardPaymentForm;
