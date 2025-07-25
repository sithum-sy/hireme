import React from "react";
import { constructProfileImageUrl } from "../../../../hooks/useServiceImages";

const AppointmentSummary = ({
    service,
    provider,
    bookingData,
    selectedSlot,
    estimatedTravelFee = 0,
    currentStep = 1,
    showActions = false,
    onEdit = null,
    isSticky = true,
}) => {
    // Helper functions
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
        if (!dateString) return "Date not selected";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch (error) {
            return dateString;
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "Time not selected";
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

    const calculateTotal = () => {
        const basePrice = bookingData.total_price || 0;
        const travelFee = estimatedTravelFee || bookingData.travel_fee || 0;
        return basePrice + travelFee;
    };

    const getLocationText = () => {
        switch (bookingData.location_type) {
            case "client_address":
                return "At your location";
            case "provider_location":
                return "At provider location";
            case "custom_location":
                return "Custom location";
            default:
                return "Location not set";
        }
    };

    // const getContactPreferenceText = () => {
    //     switch (bookingData.contact_preference) {
    //         case "phone":
    //             return "Phone call";
    //         case "message":
    //             return "Text/WhatsApp";
    //         case "email":
    //             return "Email";
    //         default:
    //             return "Not specified";
    //     }
    // };

    // Determine what sections to show based on current step
    const showSchedule =
        currentStep >= 1 && (selectedSlot || bookingData.appointment_date);
    const showLocation = currentStep >= 2 && bookingData.location_type;
    const showContact =
        currentStep >= 2 &&
        (bookingData.client_phone || bookingData.client_email);
    const showSpecialRequirements =
        currentStep >= 2 && bookingData.special_requirements;

    return (
        <div
            className={`appointment-summary ${
                isSticky ? "position-sticky" : ""
            }`}
            style={isSticky ? { top: "2rem" } : {}}
        >
            <div className="card border-0 shadow">
                <div className="card-header bg-primary text-white">
                    <h6 className="fw-bold mb-0">
                        <i className="fas fa-receipt me-2" />
                        Appointment Summary
                    </h6>
                </div>
                <div className="card-body">
                    {/* Service Details - Always shown */}
                    <div className="summary-section mb-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-semibold text-primary mb-0">
                                Service
                            </h6>
                        </div>
                        <div className="text-muted small mb-1">
                            {service?.title}
                        </div>
                        {service?.category && (
                            <span
                                className={`badge bg-${
                                    service.category.color || "primary"
                                } badge-sm`}
                            >
                                {service.category.icon && (
                                    <i
                                        className={`${service.category.icon} me-1`}
                                    />
                                )}
                                {service.category.name}
                            </span>
                        )}
                    </div>

                    {/* Provider Details - Always shown */}
                    <div className="summary-section mb-3">
                        <h6 className="fw-semibold text-primary">Provider</h6>
                        <div className="d-flex align-items-center">
                            <div className="me-2">
                                {(() => {
                                    const profileImageUrl =
                                        constructProfileImageUrl(
                                            provider?.profile_image_url
                                        );
                                    const [imgError, setImgError] =
                                        React.useState(false);

                                    if (profileImageUrl && !imgError) {
                                        return (
                                            <img
                                                src={profileImageUrl}
                                                alt={
                                                    provider.business_name ||
                                                    provider.name
                                                }
                                                className="rounded-circle"
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    objectFit: "cover",
                                                }}
                                                onError={() =>
                                                    setImgError(true)
                                                }
                                            />
                                        );
                                    } else {
                                        return (
                                            <div
                                                className="bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "30px",
                                                    height: "30px",
                                                    fontSize: "12px",
                                                }}
                                            >
                                                <i className="fas fa-user" />
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                            <div>
                                <div className="text-muted small fw-semibold">
                                    {provider?.business_name || provider?.name}
                                </div>
                                {provider?.is_verified && (
                                    <div className="text-success small">
                                        <i className="fas fa-check-circle me-1" />
                                        Verified
                                    </div>
                                )}
                                {provider?.average_rating && (
                                    <div className="text-muted small">
                                        <i className="fas fa-star text-warning me-1" />
                                        {provider.average_rating} (
                                        {provider.reviews_count || 0})
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    {showSchedule && (
                        <div className="summary-section mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="fw-semibold text-primary mb-0">
                                    Schedule
                                </h6>
                            </div>
                            <div className="schedule-info">
                                <div className="text-success small">
                                    <i className="fas fa-calendar me-1" />
                                    {selectedSlot?.formatted_date ||
                                        formatDate(
                                            bookingData.appointment_date
                                        )}
                                </div>
                                <div className="text-success small">
                                    <i className="fas fa-clock me-1" />
                                    {selectedSlot?.formatted_time ||
                                        formatTime(
                                            bookingData.appointment_time
                                        )}
                                </div>
                                {bookingData.duration_hours && (
                                    <div className="text-muted small">
                                        <i className="fas fa-hourglass-half me-1" />
                                        Duration: {bookingData.duration_hours}{" "}
                                        hour
                                        {bookingData.duration_hours > 1
                                            ? "s"
                                            : ""}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Location Section */}
                    {showLocation && (
                        <div className="summary-section mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="fw-semibold text-primary mb-0">
                                    Location
                                </h6>
                            </div>
                            <div className="location-info">
                                <div className="text-muted small mb-1">
                                    {getLocationText()}
                                </div>
                                {bookingData.client_address && (
                                    <div className="text-muted small">
                                        <i className="fas fa-map-marker-alt me-1" />
                                        {bookingData.client_address}
                                        {bookingData.client_city &&
                                            `, ${bookingData.client_city}`}
                                    </div>
                                )}
                                {bookingData.location_instructions && (
                                    <div className="text-muted small mt-1">
                                        <i className="fas fa-info-circle me-1" />
                                        {bookingData.location_instructions}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {showContact && (
                        <div className="summary-section mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="fw-semibold text-primary mb-0">
                                    Contact
                                </h6>
                            </div>
                            <div className="contact-info">
                                {bookingData.client_phone && (
                                    <div className="text-muted small">
                                        <i className="fas fa-phone me-1" />
                                        {bookingData.client_phone}
                                    </div>
                                )}
                                {bookingData.client_email && (
                                    <div className="text-muted small">
                                        <i className="fas fa-envelope me-1" />
                                        {bookingData.client_email}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Special Requirements Section */}
                    {showSpecialRequirements && (
                        <div className="summary-section mb-3">
                            <h6 className="fw-semibold text-primary">
                                Special Requirements
                            </h6>
                            <div className="text-muted small">
                                {bookingData.special_requirements}
                            </div>
                        </div>
                    )}

                    <hr />

                    {/* Price Breakdown */}
                    <div className="price-breakdown">
                        <div className="d-flex justify-content-between mb-2">
                            <span className="small">
                                Service
                                {bookingData.duration_hours
                                    ? ` (${bookingData.duration_hours}h)`
                                    : ""}
                            </span>
                            <span className="small">
                                {formatPrice(
                                    Number.isFinite(
                                        Number(bookingData.total_price)
                                    )
                                        ? Number(bookingData.total_price)
                                        : 0
                                )}
                            </span>
                        </div>

                        <hr className="my-2" />

                        <div className="d-flex justify-content-between">
                            <span className="fw-bold">Total</span>
                            <span className="fw-bold text-primary h5 mb-0">
                                {formatPrice(calculateTotal())}
                            </span>
                        </div>
                    </div>

                    {/* Payment Method (Step 3 only) */}
                    {currentStep >= 3 && bookingData.payment_method && (
                        <div className="mt-3 pt-3 border-top">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="small text-muted">
                                    Payment method:
                                </span>
                                <span className="small fw-semibold">
                                    {bookingData.payment_method === "cash" && (
                                        <>
                                            <i className="fas fa-money-bill-wave text-success me-1" />
                                            Cash
                                        </>
                                    )}
                                    {bookingData.payment_method === "card" && (
                                        <>
                                            <i className="fas fa-credit-card text-primary me-1" />
                                            Card
                                        </>
                                    )}
                                    {bookingData.payment_method ===
                                        "bank_transfer" && (
                                        <>
                                            <i className="fas fa-university text-info me-1" />
                                            Bank Transfer
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Important Notes Card - Step dependent */}
            <div className="card border-0 shadow-sm mt-3">
                <div className="card-body">
                    <h6 className="fw-bold mb-2">
                        <i className="fas fa-info-circle text-info me-2" />
                        {currentStep === 1 && "Service Details"}
                        {currentStep === 2 && "Important Notes"}
                        {currentStep === 3 && "Booking Protection"}
                    </h6>
                    <ul className="list-unstyled small text-muted mb-0">
                        {currentStep === 1 && (
                            <>
                                <li className="mb-1">
                                    <i className="fas fa-check text-success me-2" />
                                    Choose your preferred duration
                                </li>
                                <li className="mb-1">
                                    <i className="fas fa-edit text-warning me-2" />
                                    Add special requirements if needed
                                </li>
                            </>
                        )}
                        {currentStep === 2 && (
                            <>
                                <li className="mb-1">
                                    <i className="fas fa-map-marker-alt text-success me-2" />
                                    Set your service location
                                </li>
                                <li className="mb-1">
                                    <i className="fas fa-phone text-info me-2" />
                                    Provide contact information
                                </li>
                            </>
                        )}
                        {currentStep === 3 && (
                            <>
                                <li className="mb-1">
                                    <i className="fas fa-shield-alt text-success me-2" />
                                    Secure booking guarantee
                                </li>
                                <li className="mb-1">
                                    <i className="fas fa-headset text-primary me-2" />
                                    24/7 customer support
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .text-primary { color: var(--current-role-primary) !important; }
                .bg-primary { background-color: var(--current-role-primary) !important; }
                .summary-section:last-child {
                    margin-bottom: 0 !important;
                }
                .badge-sm {
                    font-size: 0.7rem;
                    padding: 0.25em 0.5em;
                }
                @media (max-width: 991px) {
                    .appointment-summary.position-sticky {
                        position: static !important;
                        margin-top: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AppointmentSummary;
