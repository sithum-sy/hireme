// components/payments/CardPaymentForm.jsx
import React, { useState } from "react";
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
                color: "#424770",
                "::placeholder": {
                    color: "#aab7c4",
                },
                padding: "10px 12px",
            },
            invalid: {
                color: "#9e2146",
            },
        },
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setCardError("");

        const cardElement = elements.getElement(CardNumberElement);

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

    // const handlePayment = async () => {
    //     if (!stripe || !elements) {
    //         onPaymentError({ message: "Stripe not loaded" });
    //         return;
    //     }

    //     setLoading(true);
    //     setCardError("");

    //     const cardElement = elements.getElement(CardNumberElement);

    //     try {
    //         const { error: confirmError, paymentIntent } =
    //             await stripe.confirmCardPayment(clientSecret, {
    //                 payment_method: {
    //                     card: cardElement,
    //                     billing_details: {
    //                         name: "Customer Name",
    //                     },
    //                 },
    //             });

    //         if (confirmError) {
    //             setCardError(confirmError.message);
    //             onPaymentError(confirmError);
    //         } else if (paymentIntent.status === "succeeded") {
    //             onPaymentSuccess(paymentIntent);
    //         }
    //     } catch (error) {
    //         setCardError(error.message);
    //         onPaymentError(error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // // Expose the handlePayment function to parent component
    // React.useImperativeHandle(
    //     React.forwardRef(() => null),
    //     () => ({
    //         handlePayment,
    //     })
    // );

    return (
        <form onSubmit={handleSubmit}>
            <div className="card-input-group">
                <div className="form-group mb-3">
                    <label className="form-label">Card Number</label>
                    <div className="stripe-element">
                        <CardNumberElement options={elementOptions} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Expiry Date</label>
                            <div className="stripe-element">
                                <CardExpiryElement options={elementOptions} />
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">CVC</label>
                            <div className="stripe-element">
                                <CardCvcElement options={elementOptions} />
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

            <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!stripe || loading}
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
                    padding: 10px 12px;
                    border: 1px solid #ced4da;
                    border-radius: 0.375rem;
                    background-color: #fff;
                }

                .stripe-element:focus-within {
                    border-color: #6f42c1;
                    box-shadow: 0 0 0 0.2rem rgba(111, 66, 193, 0.25);
                }
            `}</style>
        </form>
    );
};

export default CardPaymentForm;
