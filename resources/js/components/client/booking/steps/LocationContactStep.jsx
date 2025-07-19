import React, { useState, useEffect } from "react";

const LocationContactStep = ({
    service,
    provider,
    bookingData,
    onStepComplete,
    onPrevious,
}) => {
    const [formData, setFormData] = useState({
        location_type: bookingData.location_type || "client_address",
        client_address: bookingData.client_address || "",
        client_city: bookingData.client_city || "",
        client_postal_code: bookingData.client_postal_code || "",
        location_instructions: bookingData.location_instructions || "",

        client_phone: bookingData.client_phone || "",
        client_email: bookingData.client_email || "",
        contact_preference: bookingData.contact_preference || "phone",
        emergency_contact: bookingData.emergency_contact || "",
    });

    const [errors, setErrors] = useState({});
    const [estimatedTravelFee, setEstimatedTravelFee] = useState(
        bookingData.travel_fee || 0
    );

    // Calculate travel fee when location changes
    useEffect(() => {
        if (
            formData.location_type === "client_address" &&
            formData.client_address &&
            formData.client_city
        ) {
            calculateTravelFee();
        } else {
            setEstimatedTravelFee(0);
        }
    }, [formData.client_address, formData.client_city, formData.location_type]);

    const calculateTravelFee = async () => {
        try {
            // Mock calculation - in real app, use distance API
            const estimatedDistance = Math.floor(Math.random() * 15) + 5; // 5-20km
            const travelCost = Math.min(
                estimatedDistance * (provider?.travel_fee || 10),
                500
            );
            setEstimatedTravelFee(travelCost);
        } catch (error) {
            console.error("Failed to calculate travel fee:", error);
            setEstimatedTravelFee(0);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Location validation
        if (
            formData.location_type === "client_address" ||
            formData.location_type === "custom_location"
        ) {
            if (!formData.client_address.trim()) {
                newErrors.client_address = "Address is required";
            }
            if (!formData.client_city.trim()) {
                newErrors.client_city = "City is required";
            }
        }

        // Contact validation - at least one method required
        if (!formData.client_phone.trim() && !formData.client_email.trim()) {
            newErrors.contact = "Either phone number or email is required";
        }

        // Phone validation
        if (
            formData.client_phone &&
            !/^[\d\s\-\+\(\)]{7,}$/.test(formData.client_phone.trim())
        ) {
            newErrors.client_phone = "Please enter a valid phone number";
        }

        // Email validation
        if (
            formData.client_email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email.trim())
        ) {
            newErrors.client_email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(
                `[data-field="${firstErrorField}"]`
            );
            errorElement?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            return;
        }

        const stepData = {
            ...formData,
            travel_fee: estimatedTravelFee,
        };

        onStepComplete(stepData);
    };

    const locationTypes = [
        {
            value: "client_address",
            label: "At my location",
            description: "Service provider comes to you",
            icon: "fas fa-home",
        },
        {
            value: "provider_location",
            label: "At provider location",
            description: "You go to the service provider",
            icon: "fas fa-building",
        },
        {
            value: "custom_location",
            label: "Custom location",
            description: "Specify a different address",
            icon: "fas fa-map-marker-alt",
        },
    ];

    return (
        <div className="location-contact-step">
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Global Error Display */}
                        {Object.keys(errors).length > 0 && (
                            <div className="alert alert-danger mb-4">
                                <i className="fas fa-exclamation-triangle me-2" />
                                Please correct the errors below to continue.
                            </div>
                        )}

                        {/* Service Location Section */}
                        <div className="location-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h5 className="fw-bold mb-3">
                                        <i className="fas fa-map-marker-alt me-2 text-purple" />
                                        Service Location
                                    </h5>

                                    <div className="location-options">
                                        {locationTypes.map((option) => (
                                            <div
                                                key={option.value}
                                                className="location-option mb-3"
                                            >
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="location_type"
                                                        id={option.value}
                                                        value={option.value}
                                                        checked={
                                                            formData.location_type ===
                                                            option.value
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "location_type",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label w-100"
                                                        htmlFor={option.value}
                                                    >
                                                        <div className="option-card card border">
                                                            <div className="card-body">
                                                                <div className="d-flex align-items-center">
                                                                    <div className="option-icon me-3">
                                                                        <i
                                                                            className={`${option.icon} fa-lg text-purple`}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-grow-1">
                                                                        <div className="fw-semibold">
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </div>
                                                                        <div className="text-muted small">
                                                                            {
                                                                                option.description
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                    {option.value ===
                                                                        "client_address" &&
                                                                        provider?.travel_fee >
                                                                            0 && (
                                                                            <div className="ms-auto">
                                                                                <small className="text-warning">
                                                                                    <i className="fas fa-car me-1" />
                                                                                    Travel
                                                                                    fee
                                                                                    applies
                                                                                </small>
                                                                            </div>
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Address Details */}
                                    {(formData.location_type ===
                                        "client_address" ||
                                        formData.location_type ===
                                            "custom_location") && (
                                        <div className="address-details mt-4">
                                            <div className="border-top pt-4">
                                                <h6 className="fw-bold mb-3">
                                                    <i className="fas fa-home me-2" />
                                                    Address Details
                                                </h6>

                                                <div className="row">
                                                    <div className="col-12 mb-3">
                                                        <label className="form-label">
                                                            Street Address *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.client_address
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            placeholder="Enter full address (e.g., 123 Main Street, Apartment 4B)"
                                                            value={
                                                                formData.client_address
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "client_address",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            data-field="client_address"
                                                        />
                                                        {errors.client_address && (
                                                            <div className="invalid-feedback">
                                                                {
                                                                    errors.client_address
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-8 mb-3">
                                                        <label className="form-label">
                                                            City *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.client_city
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            placeholder="City"
                                                            value={
                                                                formData.client_city
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "client_city",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            data-field="client_city"
                                                        />
                                                        {errors.client_city && (
                                                            <div className="invalid-feedback">
                                                                {
                                                                    errors.client_city
                                                                }
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="col-md-4 mb-3">
                                                        <label className="form-label">
                                                            Postal Code
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            placeholder="Postal Code"
                                                            value={
                                                                formData.client_postal_code
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "client_postal_code",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="col-12">
                                                        <label className="form-label">
                                                            Location
                                                            Instructions
                                                        </label>
                                                        <textarea
                                                            className="form-control"
                                                            rows="2"
                                                            placeholder="Apartment number, building entrance, landmarks, parking info, etc."
                                                            value={
                                                                formData.location_instructions
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "location_instructions",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                        />
                                                        <small className="text-muted">
                                                            Help the provider
                                                            find you easily
                                                        </small>
                                                    </div>
                                                </div>

                                                {/* Travel Fee Notice */}
                                                {estimatedTravelFee > 0 && (
                                                    <div className="travel-fee-notice mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-car text-warning me-2" />
                                                            <div className="flex-grow-1">
                                                                <div className="fw-semibold">
                                                                    Estimated
                                                                    Travel Fee:
                                                                    Rs.{" "}
                                                                    {
                                                                        estimatedTravelFee
                                                                    }
                                                                </div>
                                                                <small className="text-muted">
                                                                    Based on
                                                                    distance
                                                                    from
                                                                    provider
                                                                    location
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Provider Location Info */}
                                    {formData.location_type ===
                                        "provider_location" && (
                                        <div className="provider-location-info mt-4">
                                            <div className="border-top pt-4">
                                                <h6 className="fw-bold mb-3">
                                                    <i className="fas fa-building me-2" />
                                                    Provider Location
                                                </h6>
                                                <div className="d-flex align-items-start">
                                                    <i className="fas fa-map-marker-alt text-success me-3 mt-1" />
                                                    <div>
                                                        <div className="fw-semibold">
                                                            {provider?.business_name ||
                                                                provider?.name}
                                                        </div>
                                                        <div className="text-muted">
                                                            {provider?.city},{" "}
                                                            {provider?.province}
                                                        </div>
                                                        <small className="text-muted">
                                                            Exact address will
                                                            be provided after
                                                            booking confirmation
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section */}
                        <div className="contact-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h5 className="fw-bold mb-3">
                                        <i className="fas fa-phone me-2 text-purple" />
                                        Contact Information
                                    </h5>

                                    {errors.contact && (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-triangle me-2" />
                                            {errors.contact}
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Phone Number
                                                {!formData.client_email && (
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="tel"
                                                className={`form-control ${
                                                    errors.client_phone
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                placeholder="+94 77 123 4567"
                                                value={formData.client_phone}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "client_phone",
                                                        e.target.value
                                                    )
                                                }
                                                data-field="client_phone"
                                            />
                                            {errors.client_phone && (
                                                <div className="invalid-feedback">
                                                    {errors.client_phone}
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">
                                                Email Address
                                                {!formData.client_phone && (
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                type="email"
                                                className={`form-control ${
                                                    errors.client_email
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                placeholder="your@email.com"
                                                value={formData.client_email}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        "client_email",
                                                        e.target.value
                                                    )
                                                }
                                                data-field="client_email"
                                            />
                                            {errors.client_email && (
                                                <div className="invalid-feedback">
                                                    {errors.client_email}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Preference */}
                                    <div className="contact-preference mt-3">
                                        <label className="form-label">
                                            Preferred Contact Method
                                        </label>
                                        <div className="row">
                                            <div className="col-6">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="contact_preference"
                                                        id="contact_phone"
                                                        value="phone"
                                                        checked={
                                                            formData.contact_preference ===
                                                            "phone"
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "contact_preference",
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            !formData.client_phone
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="contact_phone"
                                                    >
                                                        <i className="fas fa-phone me-2" />
                                                        Phone Call
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="contact_preference"
                                                        id="contact_message"
                                                        value="message"
                                                        checked={
                                                            formData.contact_preference ===
                                                            "message"
                                                        }
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                "contact_preference",
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            !formData.client_phone
                                                        }
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="contact_message"
                                                    >
                                                        <i className="fas fa-comment me-2" />
                                                        Text/WhatsApp
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <small className="text-muted">
                                            This is how the provider will
                                            contact you for confirmation
                                        </small>
                                    </div>

                                    {/* Emergency Contact */}
                                    <div className="emergency-contact mt-4">
                                        <label className="form-label">
                                            Emergency Contact (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Name and phone number (e.g., John Doe - +94 77 555 1234)"
                                            value={formData.emergency_contact}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "emergency_contact",
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <small className="text-muted">
                                            For emergency situations during
                                            service
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="col-lg-4">
                        <div
                            className="booking-summary position-sticky"
                            style={{ top: "2rem" }}
                        >
                            <div className="card border-0 shadow">
                                <div className="card-header bg-purple text-white">
                                    <h6 className="fw-bold mb-0">
                                        <i className="fas fa-receipt me-2" />
                                        Booking Summary
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {/* Service Details */}
                                    <div className="summary-section mb-3">
                                        <h6 className="fw-semibold">Service</h6>
                                        <div className="text-muted">
                                            {service?.title}
                                        </div>
                                        <div className="text-muted small">
                                            Duration:{" "}
                                            {bookingData.duration_hours} hour
                                            {bookingData.duration_hours > 1
                                                ? "s"
                                                : ""}
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <div className="summary-section mb-3">
                                        <h6 className="fw-semibold">
                                            Schedule
                                        </h6>
                                        <div className="text-success">
                                            <i className="fas fa-calendar me-2" />
                                            {bookingData.appointment_date
                                                ? new Date(
                                                      bookingData.appointment_date
                                                  ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                          weekday: "short",
                                                          month: "short",
                                                          day: "numeric",
                                                      }
                                                  )
                                                : "Date not selected"}
                                        </div>
                                        <div className="text-success">
                                            <i className="fas fa-clock me-2" />
                                            {bookingData.appointment_time ||
                                                "Time not selected"}
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="summary-section mb-3">
                                        <h6 className="fw-semibold">
                                            Location
                                        </h6>
                                        <div className="text-muted">
                                            {formData.location_type ===
                                                "client_address" &&
                                                "At your location"}
                                            {formData.location_type ===
                                                "provider_location" &&
                                                "At provider location"}
                                            {formData.location_type ===
                                                "custom_location" &&
                                                "Custom location"}
                                        </div>
                                        {formData.client_address && (
                                            <div className="text-muted small">
                                                <i className="fas fa-map-marker-alt me-1" />
                                                {formData.client_address}
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact */}
                                    <div className="summary-section mb-3">
                                        <h6 className="fw-semibold">Contact</h6>
                                        {formData.client_phone && (
                                            <div className="text-muted small">
                                                <i className="fas fa-phone me-2" />
                                                {formData.client_phone}
                                            </div>
                                        )}
                                        {formData.client_email && (
                                            <div className="text-muted small">
                                                <i className="fas fa-envelope me-2" />
                                                {formData.client_email}
                                            </div>
                                        )}
                                        <div className="text-muted small">
                                            <i className="fas fa-comment-dots me-2" />
                                            Prefers:{" "}
                                            {formData.contact_preference ===
                                            "phone"
                                                ? "Phone call"
                                                : "Text/WhatsApp"}
                                        </div>
                                    </div>

                                    <hr />

                                    {/* Price Breakdown */}
                                    <div className="price-breakdown">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Service fee</span>
                                            <span>
                                                Rs.{" "}
                                                {bookingData.total_price || 0}
                                            </span>
                                        </div>

                                        {estimatedTravelFee > 0 && (
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="text-warning">
                                                    <i className="fas fa-car me-1" />
                                                    Travel fee
                                                </span>
                                                <span className="text-warning">
                                                    Rs. {estimatedTravelFee}
                                                </span>
                                            </div>
                                        )}

                                        <hr />

                                        <div className="d-flex justify-content-between">
                                            <span className="fw-bold">
                                                Total
                                            </span>
                                            <span className="fw-bold text-purple h5 mb-0">
                                                Rs.{" "}
                                                {(bookingData.total_price ||
                                                    0) + estimatedTravelFee}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="step-navigation d-flex justify-content-between mt-4 pt-4 border-top">
                    <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={onPrevious}
                    >
                        <i className="fas fa-arrow-left me-2" />
                        Back to Duration
                    </button>

                    <button
                        className="btn btn-purple btn-lg"
                        onClick={handleContinue}
                    >
                        Continue to Payment
                        <i className="fas fa-arrow-right ms-2" />
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
                .option-card {
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .form-check-input:checked + .form-check-label .option-card {
                    border-color: #6f42c1;
                    background-color: rgba(111, 66, 193, 0.05);
                }
                .option-card:hover {
                    border-color: #6f42c1;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .is-invalid {
                    border-color: #dc3545;
                }
                .invalid-feedback {
                    display: block;
                }
                @media (max-width: 768px) {
                    .booking-summary {
                        position: static !important;
                        margin-top: 2rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default LocationContactStep;
