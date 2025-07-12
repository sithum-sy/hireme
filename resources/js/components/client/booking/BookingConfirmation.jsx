import React, { useState } from "react";
import clientService from "../../../services/clientService";

const BookingConfirmation = ({
    service,
    provider,
    bookingData,
    onComplete,
    onPrevious,
    onFullFlow,
}) => {
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("cash");

    const handleSubmitBooking = async () => {
        if (!agreedToTerms) {
            alert("Please agree to the terms and conditions");
            return;
        }

        setLoading(true);

        try {
            const bookingPayload = {
                ...bookingData,
                payment_method: paymentMethod,
                agreed_to_terms: agreedToTerms,
                booking_type: "standard",
            };

            const response = await clientService.createBooking(bookingPayload);

            if (response.success) {
                onComplete(response.data);
            } else {
                alert(
                    "Failed to create booking: " +
                        (response.message || "Unknown error")
                );
            }
        } catch (error) {
            console.error("Booking submission failed:", error);
            alert("Failed to submit booking. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const totalAmount =
        (bookingData.total_price || service.price) +
        (bookingData.estimated_travel_fee || 0);

    return (
        <div className="booking-confirmation">
            <div className="row">
                <div className="col-lg-8">
                    {/* Booking Summary */}
                    <div className="booking-summary-section mb-4">
                        <h5 className="fw-bold mb-3">Confirm Your Booking</h5>

                        <div className="card border-0 shadow-sm">
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
                                                    {service.title}
                                                </div>
                                                <div className="text-muted">
                                                    {service.description}
                                                </div>
                                                <div className="service-meta mt-2">
                                                    <span
                                                        className={`badge bg-${
                                                            service.category
                                                                .color ||
                                                            "primary"
                                                        } me-2`}
                                                    >
                                                        {service.category.name}
                                                    </span>
                                                    <span className="text-muted">
                                                        Duration:{" "}
                                                        {bookingData.duration}{" "}
                                                        hour
                                                        {bookingData.duration >
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            {service.first_image_url && (
                                                <img
                                                    src={
                                                        service.first_image_url
                                                    }
                                                    alt={service.title}
                                                    className="rounded"
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Details */}
                                <div className="confirmation-section border-bottom pb-3 mb-3">
                                    <h6 className="fw-bold text-purple mb-2">
                                        Provider
                                    </h6>
                                    <div className="provider-info d-flex align-items-center">
                                        <div className="provider-avatar me-3">
                                            {provider.profile_image_url ? (
                                                <img
                                                    src={
                                                        provider.profile_image_url
                                                    }
                                                    alt={provider.name}
                                                    className="rounded-circle"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                    }}
                                                >
                                                    <i className="fas fa-user"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-semibold">
                                                {provider.name}
                                            </div>
                                            <div className="text-muted small">
                                                <i className="fas fa-star text-warning me-1"></i>
                                                {provider.average_rating || 0} (
                                                {provider.reviews_count || 0}{" "}
                                                reviews)
                                            </div>
                                            {provider.is_verified && (
                                                <span className="badge bg-success bg-opacity-10 text-success">
                                                    <i className="fas fa-check-circle me-1"></i>
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
                                            <i className="fas fa-calendar text-success me-2"></i>
                                            <span className="fw-semibold">
                                                {formatDate(bookingData.date)}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-clock text-info me-2"></i>
                                            <span className="fw-semibold">
                                                {bookingData.time}
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
                                            {bookingData.location?.type ===
                                                "client_address" &&
                                                "At your location"}
                                            {bookingData.location?.type ===
                                                "provider_location" &&
                                                "At provider location"}
                                            {bookingData.location?.type ===
                                                "custom_location" &&
                                                "Custom location"}
                                        </div>
                                        {bookingData.location?.address && (
                                            <div className="text-muted">
                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                {bookingData.location.address},{" "}
                                                {bookingData.location.city}
                                                {bookingData.location
                                                    .postal_code &&
                                                    ` ${bookingData.location.postal_code}`}
                                            </div>
                                        )}
                                        {bookingData.location?.instructions && (
                                            <div className="text-muted small mt-1">
                                                <i className="fas fa-info-circle me-2"></i>
                                                {
                                                    bookingData.location
                                                        .instructions
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
                                        {bookingData.phone && (
                                            <div className="mb-1">
                                                <i className="fas fa-phone text-success me-2"></i>
                                                {bookingData.phone}
                                            </div>
                                        )}
                                        {bookingData.email && (
                                            <div className="mb-1">
                                                <i className="fas fa-envelope text-info me-2"></i>
                                                {bookingData.email}
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

                                {/* Special Instructions */}
                                {bookingData.requirements && (
                                    <div className="confirmation-section">
                                        <h6 className="fw-bold text-purple mb-2">
                                            Special Instructions
                                        </h6>
                                        <div className="text-muted">
                                            {bookingData.requirements}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="payment-method-section mb-4">
                        <h5 className="fw-bold mb-3">Payment Method</h5>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
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
                                                                <i className="fas fa-money-bill-wave fa-lg text-success"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Cash Payment
                                                                </div>
                                                                <div className="text-muted small">
                                                                    Pay directly
                                                                    to the
                                                                    provider
                                                                </div>
                                                            </div>
                                                            <div className="ms-auto">
                                                                <span className="badge bg-success bg-opacity-10 text-success">
                                                                    Most Popular
                                                                </span>
                                                            </div>
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
                                                                <i className="fas fa-credit-card fa-lg text-primary"></i>
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
                                                            <div className="ms-auto">
                                                                <span className="badge bg-warning bg-opacity-10 text-warning">
                                                                    Coming Soon
                                                                </span>
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
                                            />
                                            <label
                                                className="form-check-label w-100"
                                                htmlFor="payment_bank"
                                            >
                                                <div className="payment-card card border">
                                                    <div className="card-body">
                                                        <div className="d-flex align-items-center">
                                                            <div className="payment-icon me-3">
                                                                <i className="fas fa-university fa-lg text-info"></i>
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Bank
                                                                    Transfer
                                                                </div>
                                                                <div className="text-muted small">
                                                                    Direct bank
                                                                    payment
                                                                </div>
                                                            </div>
                                                            <div className="ms-auto">
                                                                <span className="badge bg-warning bg-opacity-10 text-warning">
                                                                    Coming Soon
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
                                        <i className="fas fa-info-circle me-2"></i>
                                        {paymentMethod === "cash" &&
                                            "Payment will be collected by the provider at the time of service completion."}
                                        {paymentMethod === "card" &&
                                            "Secure payment processing with encryption and fraud protection."}
                                        {paymentMethod === "bank_transfer" &&
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
                                            setAgreedToTerms(e.target.checked)
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
                                                Free cancellation up to 24 hours
                                                before service
                                            </li>
                                            <li>
                                                Provider will confirm booking
                                                within 2 hours
                                            </li>
                                            <li>
                                                Service guarantee and customer
                                                protection included
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
                    <div
                        className="final-summary position-sticky"
                        style={{ top: "2rem" }}
                    >
                        <div className="card border-0 shadow-lg">
                            <div className="card-header bg-purple text-white">
                                <h6 className="fw-bold mb-0">Final Summary</h6>
                            </div>
                            <div className="card-body">
                                {/* Quick Details */}
                                <div className="quick-details mb-4">
                                    <div className="detail-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Service:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.title}
                                        </span>
                                    </div>
                                    <div className="detail-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Provider:
                                        </span>
                                        <span className="fw-semibold">
                                            {provider.name}
                                        </span>
                                    </div>
                                    <div className="detail-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Date:
                                        </span>
                                        <span className="fw-semibold">
                                            {new Date(
                                                bookingData.date
                                            ).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="detail-item d-flex justify-content-between">
                                        <span className="text-muted">
                                            Time:
                                        </span>
                                        <span className="fw-semibold">
                                            {bookingData.time}
                                        </span>
                                    </div>
                                </div>

                                <hr />

                                {/* Price Breakdown */}
                                <div className="price-breakdown mb-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>
                                            Service ({bookingData.duration}h)
                                        </span>
                                        <span>
                                            Rs.{" "}
                                            {service.price *
                                                (bookingData.duration || 1)}
                                        </span>
                                    </div>

                                    {bookingData.additional_services?.map(
                                        (addon) => (
                                            <div
                                                key={addon.id}
                                                className="d-flex justify-content-between mb-2"
                                            >
                                                <span className="text-muted small">
                                                    + {addon.name}
                                                </span>
                                                <span className="text-muted small">
                                                    Rs. {addon.price}
                                                </span>
                                            </div>
                                        )
                                    )}

                                    {bookingData.estimated_travel_fee > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-warning">
                                                Travel fee
                                            </span>
                                            <span className="text-warning">
                                                Rs.{" "}
                                                {
                                                    bookingData.estimated_travel_fee
                                                }
                                            </span>
                                        </div>
                                    )}

                                    <hr />

                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold h6">
                                            Total Amount
                                        </span>
                                        <span className="fw-bold text-purple h4 mb-0">
                                            Rs. {totalAmount}
                                        </span>
                                    </div>
                                </div>

                                {/* Book Button */}
                                <div className="d-grid">
                                    <button
                                        className="btn btn-purple btn-lg"
                                        onClick={handleSubmitBooking}
                                        disabled={loading || !agreedToTerms}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check-circle me-2"></i>
                                                Confirm Booking
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="text-center mt-3">
                                    <small className="text-muted">
                                        You'll receive confirmation within 2
                                        hours
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Alternative Action */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body text-center">
                                <h6 className="fw-bold mb-2">
                                    Need more customization?
                                </h6>
                                <p className="text-muted small mb-3">
                                    Use our detailed booking flow for more
                                    options
                                </p>
                                <button
                                    className="btn btn-outline-purple btn-sm"
                                    onClick={onFullFlow}
                                >
                                    Use Advanced Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="wizard-navigation d-flex justify-content-between mt-4 pt-4 border-top">
                <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={onPrevious}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Details
                </button>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-purple btn-lg"
                        onClick={onFullFlow}
                    >
                        <i className="fas fa-cog me-2"></i>
                        Advanced Options
                    </button>

                    <button
                        className="btn btn-purple btn-lg"
                        onClick={handleSubmitBooking}
                        disabled={loading || !agreedToTerms}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Processing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check-circle me-2"></i>
                                Confirm Booking
                            </>
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
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
                .btn-outline-purple {
                    color: #6f42c1;
                    border-color: #6f42c1;
                }
                .btn-outline-purple:hover {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
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
            `}</style>
        </div>
    );
};

export default BookingConfirmation;
