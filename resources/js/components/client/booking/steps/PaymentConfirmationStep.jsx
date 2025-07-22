import React, { useState } from "react";
import clientService from "../../../../services/clientService";
import { constructProfileImageUrl } from "../../../../hooks/useServiceImages";
import AppointmentSummary from "../shared/AppointmentSummary";

const PaymentConfirmationStep = ({
    service,
    provider,
    bookingData,
    onComplete,
    onPrevious,
    selectedSlot,
}) => {
    const [paymentMethod, setPaymentMethod] = useState(
        bookingData.payment_method || "cash"
    );
    const [agreedToTerms, setAgreedToTerms] = useState(
        bookingData.agreed_to_terms || false
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [providerImageError, setProviderImageError] = useState(false);

    const handleSubmitBooking = async () => {
        // Clear previous errors
        setErrors({});

        // Validation
        if (!agreedToTerms) {
            setErrors({ terms: "Please agree to the terms and conditions" });
            return;
        }

        if (!paymentMethod) {
            setErrors({ payment: "Please select a payment method" });
            return;
        }

        setLoading(true);

        try {
            // Prepare final booking payload
            const finalBookingData = {
                ...bookingData,
                payment_method: paymentMethod,
                agreed_to_terms: agreedToTerms,
                booking_source: "web_app_multi_step",
                total_price: calculateFinalTotal(),
            };

            // console.log("Submitting multi-step booking:", finalBookingData);

            const response = await clientService.createBooking(
                finalBookingData
            );

            if (response.success) {
                // Pass the full response to the parent component
                onComplete({
                    success: true,
                    data: response.data,
                    appointment: response.appointment,
                    message:
                        response.message || "Booking created successfully!",
                    type: response.type || "appointment",
                });
            } else {
                setErrors({
                    submission:
                        response.message ||
                        "Failed to create booking. Please try again.",
                });
            }
        } catch (error) {
            console.error("Booking submission failed:", error);
            setErrors({
                submission:
                    error.response?.data?.message ||
                    "Failed to submit booking. Please check your connection and try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateFinalTotal = () => {
        const basePrice = bookingData.total_price || 0;
        const travelFee = bookingData.travel_fee || 0;
        return basePrice + travelFee;
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 0,
        })
            .format(amount)
            .replace("LKR", "Rs.");
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            const [hours, minutes] = timeString.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            return timeString;
        }
    };

    const totalAmount = calculateFinalTotal();

    return (
        <div className="payment-confirmation-step">
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Error Display */}
                        {Object.keys(errors).length > 0 && (
                            <div
                                className="alert alert-danger mb-4"
                                role="alert"
                            >
                                <i className="fas fa-exclamation-triangle me-2" />
                                <strong>
                                    Please fix the following issues:
                                </strong>
                                <ul className="mb-0 mt-2">
                                    {Object.values(errors).map(
                                        (error, index) => (
                                            <li key={index}>{error}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Appointment Summary */}
                        <div className="booking-summary-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-light">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-check-circle me-2 text-success" />
                                        Confirm Your Appointment
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {/* Service Details */}
                                    <div className="confirmation-section border-bottom pb-3 mb-3">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <h6 className="fw-bold text-purple mb-2">
                                                    Service Details
                                                </h6>
                                                <div className="service-info">
                                                    <div className="fw-semibold">
                                                        {service?.title}
                                                    </div>
                                                    <div className="text-muted">
                                                        {service?.description}
                                                    </div>
                                                    <div className="service-meta mt-2">
                                                        <span
                                                            className={`badge bg-${
                                                                service
                                                                    ?.category
                                                                    ?.color ||
                                                                "primary"
                                                            } me-2`}
                                                        >
                                                            {
                                                                service
                                                                    ?.category
                                                                    ?.name
                                                            }
                                                        </span>
                                                        <span className="text-muted">
                                                            Duration:{" "}
                                                            {bookingData.duration_hours ||
                                                                1}{" "}
                                                            hour
                                                            {(bookingData.duration_hours ||
                                                                1) > 1
                                                                ? "s"
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="confirmation-section border-bottom pb-3 mb-3">
                                        <h6 className="fw-bold text-purple mb-2">
                                            Provider
                                        </h6>
                                        <div className="provider-info d-flex align-items-center">
                                            <div className="me-3">
                                                {(() => {
                                                    const profileImageUrl =
                                                        constructProfileImageUrl(
                                                            provider?.profile_image_url
                                                        );

                                                    if (
                                                        profileImageUrl &&
                                                        !providerImageError
                                                    ) {
                                                        return (
                                                            <img
                                                                src={
                                                                    profileImageUrl
                                                                }
                                                                alt={
                                                                    provider.name
                                                                }
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                                onError={() =>
                                                                    setProviderImageError(
                                                                        true
                                                                    )
                                                                }
                                                            />
                                                        );
                                                    } else {
                                                        return (
                                                            <div
                                                                className="bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "50px",
                                                                    height: "50px",
                                                                    display:
                                                                        "flex",
                                                                }}
                                                            >
                                                                <i className="fas fa-user" />
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </div>
                                            <div>
                                                <div className="fw-semibold">
                                                    {provider?.business_name ||
                                                        provider?.name}
                                                </div>
                                                <div className="text-muted small">
                                                    <i className="fas fa-star text-warning me-1" />
                                                    {provider?.average_rating ||
                                                        0}{" "}
                                                    (
                                                    {provider?.reviews_count ||
                                                        0}{" "}
                                                    reviews)
                                                </div>
                                                {provider?.is_verified && (
                                                    <span className="badge bg-success bg-opacity-10 text-success">
                                                        <i className="fas fa-check-circle me-1" />
                                                        Verified
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date & Time */}
                                    <div className="confirmation-section border-bottom pb-3 mb-3">
                                        <h6 className="fw-bold text-purple mb-2">
                                            Date & Time
                                        </h6>
                                        <div className="datetime-info">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-calendar text-success me-2" />
                                                <span className="fw-semibold">
                                                    {bookingData.appointment_date
                                                        ? formatDate(
                                                              bookingData.appointment_date
                                                          )
                                                        : "Date not selected"}
                                                </span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-clock text-info me-2" />
                                                <span className="fw-semibold">
                                                    {bookingData.appointment_time
                                                        ? formatTime(
                                                              bookingData.appointment_time
                                                          )
                                                        : "Time not selected"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="confirmation-section border-bottom pb-3 mb-3">
                                        <h6 className="fw-bold text-purple mb-2">
                                            Service Location
                                        </h6>
                                        <div className="location-info">
                                            <div className="fw-semibold mb-1">
                                                {bookingData.location_type ===
                                                    "client_address" &&
                                                    "At your location"}
                                                {bookingData.location_type ===
                                                    "provider_location" &&
                                                    "At provider location"}
                                                {bookingData.location_type ===
                                                    "custom_location" &&
                                                    "Custom location"}
                                            </div>
                                            {bookingData.client_address && (
                                                <div className="text-muted">
                                                    <i className="fas fa-map-marker-alt me-2" />
                                                    {bookingData.client_address}
                                                    {bookingData.client_city &&
                                                        `, ${bookingData.client_city}`}
                                                    {bookingData.client_postal_code &&
                                                        ` ${bookingData.client_postal_code}`}
                                                </div>
                                            )}
                                            {bookingData.location_instructions && (
                                                <div className="text-muted small mt-1">
                                                    <i className="fas fa-info-circle me-2" />
                                                    {
                                                        bookingData.location_instructions
                                                    }
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="confirmation-section border-bottom pb-3 mb-3">
                                        <h6 className="fw-bold text-purple mb-2">
                                            Contact Information
                                        </h6>
                                        <div className="contact-info">
                                            {bookingData.client_phone && (
                                                <div className="mb-1">
                                                    <i className="fas fa-phone text-success me-2" />
                                                    {bookingData.client_phone}
                                                </div>
                                            )}
                                            {bookingData.client_email && (
                                                <div className="mb-1">
                                                    <i className="fas fa-envelope text-info me-2" />
                                                    {bookingData.client_email}
                                                </div>
                                            )}
                                            <div className="text-muted small">
                                                Preferred contact:{" "}
                                                {bookingData.contact_preference ===
                                                "phone"
                                                    ? "Phone call"
                                                    : "Text/WhatsApp"}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Requirements */}
                                    {bookingData.special_requirements && (
                                        <div className="confirmation-section">
                                            <h6 className="fw-bold text-purple mb-2">
                                                Special Requirements
                                            </h6>
                                            <div className="text-muted">
                                                {
                                                    bookingData.special_requirements
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="payment-method-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h5 className="fw-bold mb-3">
                                        <i className="fas fa-credit-card me-2 text-purple" />
                                        Payment Method
                                    </h5>

                                    <div className="payment-options">
                                        <div className="payment-option mb-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="payment_method"
                                                    id="payment_cash"
                                                    value="cash"
                                                    checked={
                                                        paymentMethod === "cash"
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentMethod(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label w-100"
                                                    htmlFor="payment_cash"
                                                >
                                                    <div className="payment-card card border">
                                                        <div className="card-body">
                                                            <div className="d-flex align-items-center">
                                                                <div className="payment-icon me-3">
                                                                    <i className="fas fa-money-bill-wave fa-lg text-success" />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">
                                                                        Cash
                                                                        Payment
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        Pay
                                                                        directly
                                                                        to the
                                                                        provider
                                                                    </div>
                                                                </div>
                                                                <div className="ms-auto"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="payment-option mb-3">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="payment_method"
                                                    id="payment_card"
                                                    value="card"
                                                    checked={
                                                        paymentMethod === "card"
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentMethod(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                <label
                                                    className="form-check-label w-100"
                                                    htmlFor="payment_card"
                                                >
                                                    <div className="payment-card card border">
                                                        <div className="card-body">
                                                            <div className="d-flex align-items-center">
                                                                <div className="payment-icon me-3">
                                                                    <i className="fas fa-credit-card fa-lg text-primary" />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">
                                                                        Credit/Debit
                                                                        Card
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        Secure
                                                                        online
                                                                        payment
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="payment-option">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="payment_method"
                                                    id="payment_bank"
                                                    value="bank_transfer"
                                                    checked={
                                                        paymentMethod ===
                                                        "bank_transfer"
                                                    }
                                                    onChange={(e) =>
                                                        setPaymentMethod(
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled
                                                />
                                                <label
                                                    className="form-check-label w-100"
                                                    htmlFor="payment_bank"
                                                >
                                                    <div className="payment-card card border">
                                                        <div className="card-body">
                                                            <div className="d-flex align-items-center">
                                                                <div className="payment-icon me-3">
                                                                    <i className="fas fa-university fa-lg text-info" />
                                                                </div>
                                                                <div>
                                                                    <div className="fw-semibold">
                                                                        Bank
                                                                        Transfer
                                                                    </div>
                                                                    <div className="text-muted small">
                                                                        Direct
                                                                        bank
                                                                        payment
                                                                    </div>
                                                                </div>
                                                                <div className="ms-auto">
                                                                    <span className="badge bg-warning bg-opacity-10 text-warning">
                                                                        Coming
                                                                        Soon
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="payment-note mt-3 p-3 bg-light rounded">
                                        <small className="text-muted">
                                            <i className="fas fa-info-circle me-2" />
                                            {paymentMethod === "cash" &&
                                                "Payment will be collected by the provider at the time of service completion."}
                                            {paymentMethod === "card" &&
                                                "Secure payment processing with encryption and fraud protection."}
                                            {paymentMethod ===
                                                "bank_transfer" &&
                                                "Bank transfer details will be provided after booking confirmation."}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="terms-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="agree_terms"
                                            checked={agreedToTerms}
                                            onChange={(e) =>
                                                setAgreedToTerms(
                                                    e.target.checked
                                                )
                                            }
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="agree_terms"
                                        >
                                            I agree to the{" "}
                                            <a
                                                href="/terms"
                                                target="_blank"
                                                className="text-purple"
                                            >
                                                Terms of Service
                                            </a>{" "}
                                            and{" "}
                                            <a
                                                href="/privacy"
                                                target="_blank"
                                                className="text-purple"
                                            >
                                                Privacy Policy
                                            </a>
                                        </label>
                                    </div>

                                    <div className="terms-summary mt-3 p-3 bg-light rounded">
                                        <small className="text-muted">
                                            <strong>Key points:</strong>
                                            <ul className="mb-0 mt-2">
                                                <li>
                                                    Free cancellation up to 24
                                                    hours before service
                                                </li>
                                                <li>
                                                    Provider will confirm
                                                    booking within 2 hours
                                                </li>
                                                <li>
                                                    Service guarantee and
                                                    customer protection included
                                                </li>
                                                <li>
                                                    Dispute resolution available
                                                    through platform
                                                </li>
                                            </ul>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Final Summary Sidebar */}
                    <div className="col-lg-4">
                        <AppointmentSummary
                            service={service}
                            provider={provider}
                            bookingData={{
                                ...bookingData,
                                payment_method: paymentMethod,
                                agreed_to_terms: agreedToTerms,
                            }}
                            selectedSlot={selectedSlot}
                            currentStep={3}
                            isSticky={true}
                            showActions={true}
                            onEdit={(section) => {
                                // Handle edit actions
                                switch (section) {
                                    case "schedule":
                                        // Go back to step 1
                                        break;
                                    case "location":
                                    case "contact":
                                        onPrevious(); // Go to step 2
                                        break;
                                    default:
                                        break;
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="step-navigation d-flex justify-content-between mt-4 pt-4 border-top">
                    <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={onPrevious}
                        disabled={loading}
                    >
                        <i className="fas fa-arrow-left me-2" />
                        Back to Location
                    </button>

                    <button
                        className="btn btn-purple btn-lg"
                        onClick={handleSubmitBooking}
                        disabled={loading || !agreedToTerms}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check-circle me-2" />
                                Confirm Booking
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
               .text-purple { color: #6f42c1 !important; }
               .bg-purple { background-color: #6f42c1 !important; }
               .btn-purple {
                   background-color: #6f42c1;
                   border-color: #6f42c1;
                   color: white;
               }
               .btn-purple:hover {
                   background-color: #5a2d91;
                   border-color: #5a2d91;
                   color: white;
               }
               .form-check-input:checked {
                   background-color: #6f42c1;
                   border-color: #6f42c1;
               }
               .payment-card {
                   transition: all 0.2s ease;
                   cursor: pointer;
               }
               .form-check-input:checked + .form-check-label .payment-card {
                   border-color: #6f42c1;
                   background-color: rgba(111, 66, 193, 0.05);
               }
               .payment-card:hover {
                   border-color: #6f42c1;
               }
               .confirmation-section:last-child {
                   border-bottom: none !important;
                   margin-bottom: 0 !important;
                   padding-bottom: 0 !important;
               }
               @media (max-width: 768px) {
                   .final-summary {
                       position: static !important;
                       margin-top: 2rem;
                   }
               }
           `}</style>
        </div>
    );
};

export default PaymentConfirmationStep;
