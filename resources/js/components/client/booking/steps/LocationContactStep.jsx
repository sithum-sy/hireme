import React, { useState, useEffect } from "react";
import LocationSelector from "../../../map/LocationSelector";
import { useAuth } from "../../../../context/AuthContext";
import AppointmentSummary from "../shared/AppointmentSummary";

const LocationContactStep = ({
    service,
    provider,
    bookingData,
    onStepComplete,
    onPrevious,
    clientLocation,
    selectedSlot,
}) => {
    const { user, isAuthenticated } = useAuth();

    const userPhone = user?.contact_number || user?.phone || "";
    const userEmail = user?.email || "";

    const [formData, setFormData] = useState({
        location_type: bookingData.location_type || "client_address",
        client_address:
            bookingData.client_address ||
            (clientLocation ? `Near ${clientLocation.city}` : ""),
        client_city: bookingData.client_city || clientLocation?.city || "",
        client_postal_code: bookingData.client_postal_code || "",
        location_instructions: bookingData.location_instructions || "",

        client_phone: bookingData.client_phone || userPhone,
        client_email: bookingData.client_email || userEmail,
        contact_preference: bookingData.contact_preference || "phone",
        emergency_contact: bookingData.emergency_contact || "",
    });

    const [errors, setErrors] = useState({});
    const [estimatedTravelFee, setEstimatedTravelFee] = useState(
        bookingData.travel_fee || 0
    );
    const [showMapSelector, setShowMapSelector] = useState(false);

    useEffect(() => {
        if (user && isAuthenticated) {
            const userPhone = user.contact_number || user.phone || "";
            const userEmail = user.email || "";

            console.log("User data available for auto-fill:", {
                userPhone,
                userEmail,
                currentFormPhone: formData.client_phone,
                currentFormEmail: formData.client_email,
            });

            // Only auto-fill if the form fields are empty
            if (
                !formData.client_phone &&
                !formData.client_email &&
                (userPhone || userEmail)
            ) {
                console.log("Auto-filling contact info from user data");

                setFormData((prev) => ({
                    ...prev,
                    client_phone: prev.client_phone || userPhone,
                    client_email: prev.client_email || userEmail,
                    contact_preference:
                        prev.contact_preference ||
                        (userPhone ? "phone" : userEmail ? "message" : "phone"),
                }));
            }
        }
    }, [user, isAuthenticated]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    // Enhanced validation function
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

        // Enhanced contact validation
        const hasPhone = formData.client_phone && formData.client_phone.trim();
        const hasEmail = formData.client_email && formData.client_email.trim();

        if (!hasPhone && !hasEmail) {
            newErrors.contact = "Either phone number or email is required";
        }

        // Phone validation (if provided)
        if (
            hasPhone &&
            !/^[\d\s\-\+\(\)]{7,}$/.test(formData.client_phone.trim())
        ) {
            newErrors.client_phone = "Please enter a valid phone number";
        }

        // Email validation (if provided)
        if (
            hasEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email.trim())
        ) {
            newErrors.client_email = "Please enter a valid email address";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle location selection from map
    const handleLocationFromMap = (location) => {
        console.log("Location selected from map:", location);

        // Update form data with location from map
        setFormData((prev) => ({
            ...prev,
            client_address:
                location.address || `${location.city}, ${location.province}`,
            client_city: location.city || "",
            // You can also update postal code if available
            // client_postal_code: location.postal_code || "",
        }));

        // Hide map selector
        setShowMapSelector(false);

        // Clear any previous address errors
        if (errors.client_address || errors.client_city) {
            setErrors((prev) => ({
                ...prev,
                client_address: null,
                client_city: null,
            }));
        }
    };

    const handleContinue = () => {
        console.log("Validating form data:", formData);

        if (!validateForm()) {
            console.log("Validation failed:", errors);
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

        console.log("Validation passed, proceeding to next step");

        const stepData = {
            ...formData,
            travel_fee: estimatedTravelFee,
        };

        onStepComplete(stepData);
    };

    const isAutoFilled = (field) => {
        if (!user) return false;

        switch (field) {
            case "phone":
                return (
                    formData.client_phone ===
                    (user.contact_number || user.phone)
                );
            case "email":
                return formData.client_email === user.email;
            default:
                return false;
        }
    };

    // Enhanced client location display
    const renderClientLocationInfo = () => {
        if (!clientLocation) return null;

        return (
            <div className="client-search-location mb-4 p-3 bg-info bg-opacity-10 rounded border-start border-info border-3">
                <h6 className="fw-bold mb-2 text-info">
                    <i className="fas fa-search me-2" />
                    Your Search Location
                </h6>
                <div className="location-details">
                    <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-info" />
                        <span className="fw-semibold">
                            {clientLocation.address ||
                                `${clientLocation.city}, ${clientLocation.province}`}
                        </span>
                    </div>

                    {clientLocation.neighborhood && (
                        <div className="text-muted small mb-2">
                            <i className="fas fa-location-arrow me-2" />
                            {clientLocation.neighborhood}
                            {clientLocation.distance_to_city && (
                                <span>
                                    {" "}
                                    • {clientLocation.distance_to_city}km from{" "}
                                    {clientLocation.city}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="text-muted small">
                        <i className="fas fa-info-circle me-2" />
                        This is where you searched for services. You can change
                        the service location below.
                    </div>
                </div>
            </div>
        );
    };

    const locationTypes = [
        {
            value: "client_address",
            label: "At my location",
            description: "Service provider comes to you",
            icon: "fas fa-home",
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
                                <ul className="mb-0 mt-2">
                                    {Object.values(errors).map(
                                        (error, index) => (
                                            <li key={index}>{error}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}

                        {/* Client Search Location Info */}
                        {renderClientLocationInfo()}

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
                                                                            {/* {option.value ===
                                                                                "client_address" &&
                                                                                clientLocation && (
                                                                                    <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                                                        Recommended
                                                                                    </span>
                                                                                )} */}
                                                                        </div>
                                                                        <div className="text-muted small">
                                                                            {
                                                                                option.description
                                                                            }
                                                                            {option.value ===
                                                                                "client_address" &&
                                                                                clientLocation && (
                                                                                    <div className="mt-1 text-info">
                                                                                        <i className="fas fa-info-circle me-1" />
                                                                                        Near
                                                                                        your
                                                                                        search
                                                                                        location:{" "}
                                                                                        {
                                                                                            clientLocation.city
                                                                                        }
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>
                                                                    {/* {option.value ===
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
                                                                        )} */}
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
                                                <div className="d-flex justify-content-between align-items-center mb-3">
                                                    <h6 className="fw-bold mb-0">
                                                        <i className="fas fa-home me-2" />
                                                        Address Details
                                                        {formData.location_type ===
                                                            "client_address" &&
                                                            clientLocation && (
                                                                <small className="text-muted fw-normal ms-2">
                                                                    (Near your
                                                                    search area)
                                                                </small>
                                                            )}
                                                    </h6>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-info btn-sm"
                                                        onClick={() =>
                                                            setShowMapSelector(
                                                                !showMapSelector
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-map me-2" />
                                                        {showMapSelector
                                                            ? "Hide Map"
                                                            : "Use Map"}
                                                    </button>
                                                </div>

                                                {showMapSelector && (
                                                    <div className="mb-4 p-3 bg-light rounded">
                                                        <h6 className="fw-bold mb-3">
                                                            <i className="fas fa-map-marked-alt me-2" />
                                                            Select Location on
                                                            Map
                                                        </h6>
                                                        <LocationSelector
                                                            value={
                                                                clientLocation
                                                            }
                                                            onChange={
                                                                handleLocationFromMap
                                                            }
                                                            error={
                                                                errors.location_map
                                                            }
                                                        />
                                                    </div>
                                                )}

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
                                                        {formData.location_type ===
                                                            "client_address" &&
                                                            clientLocation && (
                                                                <small className="text-muted">
                                                                    Your
                                                                    specific
                                                                    address in{" "}
                                                                    {
                                                                        clientLocation.city
                                                                    }{" "}
                                                                    area
                                                                </small>
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Provider Location Info */}
                                    {/* {formData.location_type ===
                                        "provider_location" && (
                                        <div className="provider-location-info mt-4">
                                            <div className="border-top pt-4">
                                                <h6 className="fw-bold mb-3">
                                                    <i className="fas fa-building me-2" />
                                                    Provider Location
                                                </h6>
                                                <div className="provider-location-card p-3 bg-light rounded">
                                                    <div className="d-flex align-items-start">
                                                        <i className="fas fa-map-marker-alt text-success me-3 mt-1" />
                                                        <div className="flex-grow-1">
                                                            <div className="fw-semibold">
                                                                {provider?.business_name ||
                                                                    provider?.name}
                                                            </div>
                                                            <div className="text-muted">
                                                                {
                                                                    service
                                                                        ?.location
                                                                        .service_address
                                                                }{" "}
                                                                {
                                                                    service
                                                                        ?.location
                                                                        .location_city
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )} */}
                                </div>
                            </div>
                        </div>

                        {/* Contact Information Section  */}
                        <div className="contact-section mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="fw-bold mb-0">
                                            <i className="fas fa-phone me-2 text-purple" />
                                            Contact Information
                                        </h5>

                                        {/* Auto-fill indicator */}
                                        {user &&
                                            (isAutoFilled("phone") ||
                                                isAutoFilled("email")) && (
                                                <div className="auto-fill-indicator">
                                                    <small className="text-success">
                                                        <i className="fas fa-user-check me-1" />
                                                        Auto-filled from your
                                                        profile
                                                    </small>
                                                </div>
                                            )}
                                    </div>

                                    {/* contact requirement message */}
                                    <div className="alert alert-info alert-sm mb-3">
                                        <i className="fas fa-info-circle me-2" />
                                        Please provide at least one contact
                                        method (phone or email)
                                    </div>

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
                                                        {" "}
                                                        *
                                                    </span>
                                                )}
                                                {isAutoFilled("phone") && (
                                                    <small className="text-success ms-2">
                                                        <i className="fas fa-check-circle" />
                                                    </small>
                                                )}
                                            </label>
                                            <input
                                                type="tel"
                                                className={`form-control ${
                                                    errors.client_phone
                                                        ? "is-invalid"
                                                        : ""
                                                } ${
                                                    isAutoFilled("phone")
                                                        ? "border-success"
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
                                                        {" "}
                                                        *
                                                    </span>
                                                )}
                                                {isAutoFilled("email") && (
                                                    <small className="text-success ms-2">
                                                        <i className="fas fa-check-circle" />
                                                    </small>
                                                )}
                                            </label>
                                            <input
                                                type="email"
                                                className={`form-control ${
                                                    errors.client_email
                                                        ? "is-invalid"
                                                        : ""
                                                } ${
                                                    isAutoFilled("email")
                                                        ? "border-success"
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Summary Sidebar - Enhanced */}
                    <div className="col-lg-4">
                        <AppointmentSummary
                            service={service}
                            provider={provider}
                            bookingData={{
                                ...bookingData,
                                ...formData, // Include current form data
                            }}
                            selectedSlot={selectedSlot}
                            estimatedTravelFee={estimatedTravelFee}
                            currentStep={2}
                            isSticky={true}
                        />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="step-navigation mt-4 pt-4 border-top">
                    <div className="d-flex justify-content-between">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onPrevious}
                        >
                            <i className="fas fa-arrow-left me-2" />
                            Previous
                        </button>

                        <button
                            type="button"
                            className="btn btn-purple"
                            onClick={handleContinue}
                        >
                            Continue to Payment
                            <i className="fas fa-arrow-right ms-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Styles */}
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
               .option-card {
                   transition: all 0.2s ease;
                   cursor: pointer;
               }
               .form-check-input:checked + .form-check-label .option-card {
                   border-color: #6f42c1 !important;
                   background-color: rgba(111, 66, 193, 0.05);
               }
               .option-card:hover {
                   border-color: #6f42c1 !important;
                   box-shadow: 0 2px 4px rgba(111, 66, 193, 0.1);
               }
               .alert-sm {
                   padding: 0.5rem 0.75rem;
                   font-size: 0.875rem;
               }
               .border-success {
                   border-color: #198754 !important;
               }
               .auto-fill-indicator {
                   animation: fadeIn 0.3s ease-in;
               }
               @keyframes fadeIn {
                   from { opacity: 0; transform: translateY(-5px); }
                   to { opacity: 1; transform: translateY(0); }
               }
           `}</style>
        </div>
    );
};

// Helper functions for formatting
const formatDate = (dateString) => {
    if (!dateString) return "";
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

export default LocationContactStep;
