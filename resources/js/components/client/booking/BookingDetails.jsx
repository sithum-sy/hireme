// components/client/booking/BookingDetails.jsx
import React, { useState, useEffect } from "react";
import { useClient } from "../../../context/ClientContext";

const BookingDetails = ({
    service,
    provider,
    bookingData,
    updateBookingData,
    onNext,
    onPrevious,
}) => {
    const { location: userLocation } = useClient();

    // Initialize form with booking data or defaults
    const [formData, setFormData] = useState({
        location_type: bookingData.location?.type || "client_address",
        address:
            bookingData.location?.address || bookingData.client_address || "",
        city: bookingData.location?.city || userLocation?.city || "",
        postal_code: bookingData.location?.postal_code || "",
        instructions: bookingData.location?.instructions || "",
        contact_preference: bookingData.contact_preference || "phone",
        phone: bookingData.phone || "",
        email: bookingData.email || "",
        special_instructions:
            bookingData.requirements || bookingData.special_instructions || "",
        emergency_contact: bookingData.emergency_contact || "",
    });

    const [errors, setErrors] = useState({});
    const [estimatedTravelFee, setEstimatedTravelFee] = useState(
        bookingData.estimated_travel_fee || 0
    );
    const [loading, setLoading] = useState(false);

    // Calculate travel fee when location changes
    useEffect(() => {
        if (
            formData.location_type === "client_address" &&
            formData.address &&
            formData.city &&
            provider.travel_fee > 0
        ) {
            calculateTravelFee();
        } else {
            setEstimatedTravelFee(0);
            updateBookingData({ estimated_travel_fee: 0 });
        }
    }, [
        formData.address,
        formData.city,
        formData.location_type,
        provider.travel_fee,
    ]);

    const calculateTravelFee = async () => {
        setLoading(true);
        try {
            // Mock calculation - in real app, you'd use a distance API
            const estimatedDistance = Math.floor(Math.random() * 15) + 5; // 5-20km
            const travelCost = Math.min(
                estimatedDistance * (provider.travel_fee || 10),
                500
            ); // Cap at Rs. 500

            setEstimatedTravelFee(travelCost);
            updateBookingData({ estimated_travel_fee: travelCost });
        } catch (error) {
            console.error("Failed to calculate travel fee:", error);
            setEstimatedTravelFee(0);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        // Update booking data in real-time for critical fields
        if (["phone", "email", "special_instructions"].includes(field)) {
            const updates = {};
            if (field === "special_instructions") {
                updates.requirements = value;
                updates.client_notes = value;
            }
            updates[field] = value;
            updateBookingData(updates);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Location validation
        if (
            formData.location_type === "client_address" ||
            formData.location_type === "custom_location"
        ) {
            if (!formData.address.trim()) {
                newErrors.address = "Address is required";
            }
            if (!formData.city.trim()) {
                newErrors.city = "City is required";
            }
        }

        // Contact validation - at least one contact method required
        if (!formData.phone.trim() && !formData.email.trim()) {
            newErrors.contact = "Either phone number or email is required";
        }

        // Phone validation
        if (
            formData.phone &&
            !/^[\d\s\-\+\(\)]{7,}$/.test(formData.phone.trim())
        ) {
            newErrors.phone =
                "Please enter a valid phone number (at least 7 digits)";
        }

        // Email validation
        if (
            formData.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            newErrors.email = "Please enter a valid email address";
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

        // Prepare comprehensive booking data update
        const locationData = {
            type: formData.location_type,
            address: formData.address,
            city: formData.city,
            postal_code: formData.postal_code,
            instructions: formData.instructions,
        };

        const updateData = {
            // Location data
            location: locationData,
            client_address: formData.address, // Laravel backend field
            client_location: formData.address
                ? {
                      address: formData.address,
                      city: formData.city,
                      postal_code: formData.postal_code,
                  }
                : null,

            // Contact data
            contact_preference: formData.contact_preference,
            phone: formData.phone,
            email: formData.email,
            emergency_contact: formData.emergency_contact,

            // Instructions
            requirements: formData.special_instructions,
            client_notes: formData.special_instructions,
            special_instructions: formData.special_instructions,

            // Travel fee
            estimated_travel_fee: estimatedTravelFee,
        };

        // console.log("BookingDetails - updating data:", updateData);
        updateBookingData(updateData);
        onNext();
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
        <div className="booking-details">
            <div className="row">
                <div className="col-lg-8">
                    {/* Global Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="alert alert-danger mb-4">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Please correct the errors below to continue.
                        </div>
                    )}

                    {/* Service Location */}
                    <div className="location-section mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fas fa-map-marker-alt me-2 text-purple"></i>
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
                                                            ></i>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="fw-semibold">
                                                                {option.label}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {
                                                                    option.description
                                                                }
                                                            </div>
                                                        </div>
                                                        {option.value ===
                                                            "client_address" &&
                                                            provider.travel_fee >
                                                                0 && (
                                                                <div className="ms-auto">
                                                                    <small className="text-warning">
                                                                        <i className="fas fa-car me-1"></i>
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
                        {(formData.location_type === "client_address" ||
                            formData.location_type === "custom_location") && (
                            <div className="address-details mt-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">
                                            <i className="fas fa-home me-2"></i>
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
                                                        errors.address
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="Enter full address (e.g., 123 Main Street, Apartment 4B)"
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "address",
                                                            e.target.value
                                                        )
                                                    }
                                                    data-field="address"
                                                />
                                                {errors.address && (
                                                    <div className="invalid-feedback">
                                                        {errors.address}
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
                                                        errors.city
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    placeholder="City"
                                                    value={formData.city}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "city",
                                                            e.target.value
                                                        )
                                                    }
                                                    data-field="city"
                                                />
                                                {errors.city && (
                                                    <div className="invalid-feedback">
                                                        {errors.city}
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
                                                    value={formData.postal_code}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "postal_code",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="col-12">
                                                <label className="form-label">
                                                    Location Instructions
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="2"
                                                    placeholder="Apartment number, building entrance, landmarks, parking info, etc."
                                                    value={
                                                        formData.instructions
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "instructions",
                                                            e.target.value
                                                        )
                                                    }
                                                ></textarea>
                                                <small className="text-muted">
                                                    Help the provider find you
                                                    easily
                                                </small>
                                            </div>
                                        </div>

                                        {/* Travel Fee Display */}
                                        {estimatedTravelFee > 0 && (
                                            <div className="travel-fee-notice mt-3 p-3 bg-warning bg-opacity-10 border border-warning rounded">
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-car text-warning me-2"></i>
                                                    <div className="flex-grow-1">
                                                        <div className="fw-semibold">
                                                            Estimated Travel
                                                            Fee: Rs.{" "}
                                                            {estimatedTravelFee}
                                                        </div>
                                                        <small className="text-muted">
                                                            Based on distance
                                                            from provider
                                                            location
                                                            {loading && (
                                                                <span className="ms-2">
                                                                    <span
                                                                        className="spinner-border spinner-border-sm"
                                                                        role="status"
                                                                    ></span>
                                                                    Calculating...
                                                                </span>
                                                            )}
                                                        </small>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Provider Location Info */}
                        {formData.location_type === "provider_location" && (
                            <div className="provider-location-info mt-4">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <h6 className="fw-bold mb-3">
                                            <i className="fas fa-building me-2"></i>
                                            Provider Location
                                        </h6>
                                        <div className="d-flex align-items-start">
                                            <i className="fas fa-map-marker-alt text-success me-3 mt-1"></i>
                                            <div>
                                                <div className="fw-semibold">
                                                    {provider.business_name ||
                                                        provider.name}
                                                </div>
                                                <div className="text-muted">
                                                    {provider.city},{" "}
                                                    {provider.province}
                                                </div>
                                                <small className="text-muted">
                                                    Exact address will be
                                                    provided after booking
                                                    confirmation
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="contact-section mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fas fa-phone me-2 text-purple"></i>
                            Contact Information
                        </h5>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                {errors.contact && (
                                    <div className="alert alert-danger">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        {errors.contact}
                                    </div>
                                )}

                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Phone Number
                                            {!formData.email && (
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="tel"
                                            className={`form-control ${
                                                errors.phone ? "is-invalid" : ""
                                            }`}
                                            placeholder="+94 77 123 4567"
                                            value={formData.phone}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            data-field="phone"
                                        />
                                        {errors.phone && (
                                            <div className="invalid-feedback">
                                                {errors.phone}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Email Address
                                            {!formData.phone && (
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${
                                                errors.email ? "is-invalid" : ""
                                            }`}
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    "email",
                                                    e.target.value
                                                )
                                            }
                                            data-field="email"
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
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
                                                    disabled={!formData.phone}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="contact_phone"
                                                >
                                                    <i className="fas fa-phone me-2"></i>
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
                                                    disabled={!formData.phone}
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor="contact_message"
                                                >
                                                    <i className="fas fa-comment me-2"></i>
                                                    Text/WhatsApp
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        This is how the provider will contact
                                        you for confirmation
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="additional-info mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fas fa-clipboard-list me-2 text-purple"></i>
                            Additional Information
                        </h5>

                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">
                                        Special Instructions for Provider
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Any specific requirements, preferences, allergies, or important details the provider should know..."
                                        value={formData.special_instructions}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "special_instructions",
                                                e.target.value
                                            )
                                        }
                                    ></textarea>
                                    <small className="text-muted">
                                        Examples: specific cleaning products to
                                        use/avoid, pet considerations, access
                                        codes, best time to call, etc.
                                    </small>
                                </div>

                                <div className="mb-3">
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
                                        For emergency situations during service
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
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-purple text-white">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-receipt me-2"></i>
                                    Booking Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Service Details */}
                                <div className="summary-section mb-3">
                                    <h6 className="fw-semibold">Service</h6>
                                    <div className="text-muted">
                                        {service.title}
                                    </div>
                                    <div className="text-muted small">
                                        Duration: {bookingData.duration} hour
                                        {bookingData.duration > 1 ? "s" : ""}
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="summary-section mb-3">
                                    <h6 className="fw-semibold">Schedule</h6>
                                    <div className="text-success">
                                        <i className="fas fa-calendar me-2"></i>
                                        {bookingData.date
                                            ? new Date(
                                                  bookingData.date
                                              ).toLocaleDateString("en-US", {
                                                  weekday: "short",
                                                  month: "short",
                                                  day: "numeric",
                                              })
                                            : "Date not selected"}
                                    </div>
                                    <div className="text-success">
                                        <i className="fas fa-clock me-2"></i>
                                        {bookingData.time ||
                                            "Time not selected"}
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="summary-section mb-3">
                                    <h6 className="fw-semibold">Location</h6>
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
                                    {formData.address && (
                                        <div className="text-muted small">
                                            <i className="fas fa-map-marker-alt me-1"></i>
                                            {formData.address}
                                        </div>
                                    )}
                                </div>

                                {/* Contact */}
                                <div className="summary-section mb-3">
                                    <h6 className="fw-semibold">Contact</h6>
                                    {formData.phone && (
                                        <div className="text-muted small">
                                            <i className="fas fa-phone me-2"></i>
                                            {formData.phone}
                                        </div>
                                    )}
                                    {formData.email && (
                                        <div className="text-muted small">
                                            <i className="fas fa-envelope me-2"></i>
                                            {formData.email}
                                        </div>
                                    )}
                                    <div className="text-muted small">
                                        <i className="fas fa-comment-dots me-2"></i>
                                        Prefers:{" "}
                                        {formData.contact_preference === "phone"
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
                                            {bookingData.total_price ||
                                                service.price ||
                                                0}
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

                                    {estimatedTravelFee > 0 && (
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-warning">
                                                <i className="fas fa-car me-1"></i>
                                                Travel fee
                                            </span>
                                            <span className="text-warning">
                                                Rs. {estimatedTravelFee}
                                            </span>
                                        </div>
                                    )}

                                    <hr />

                                    <div className="d-flex justify-content-between">
                                        <span className="fw-bold">Total</span>
                                        <span className="fw-bold text-purple h5 mb-0">
                                            Rs.{" "}
                                            {(bookingData.total_price ||
                                                service.price ||
                                                0) + estimatedTravelFee}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-2">
                                    <i className="fas fa-info-circle text-info me-2"></i>
                                    Important Notes
                                </h6>
                                <ul className="list-unstyled small text-muted mb-0">
                                    <li className="mb-1">
                                        <i className="fas fa-check text-success me-2"></i>
                                        Provider will confirm within 2 hours
                                    </li>
                                    <li className="mb-1">
                                        <i className="fas fa-clock text-warning me-2"></i>
                                        Free cancellation up to 24 hours before
                                    </li>
                                    <li className="mb-1">
                                        <i className="fas fa-shield-alt text-primary me-2"></i>
                                        All bookings are insured
                                    </li>
                                    <li className="mb-1">
                                        <i className="fas fa-phone text-info me-2"></i>
                                        You'll receive confirmation via your
                                        preferred contact method
                                    </li>
                                </ul>
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
                    Back to Date & Time
                </button>

                <button
                    className="btn btn-purple btn-lg"
                    onClick={handleContinue}
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Processing...
                        </>
                    ) : (
                        <>
                            Continue to Confirmation
                            <i className="fas fa-arrow-right ms-2"></i>
                        </>
                    )}
                </button>
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
           `}</style>
        </div>
    );
};

export default BookingDetails;
