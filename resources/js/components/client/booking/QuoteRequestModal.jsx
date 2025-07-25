import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import clientService from "../../../services/clientService";
import { useAuth } from "../../../context/AuthContext";

const QuoteRequestModal = ({
    show,
    onHide,
    service,
    provider,
    selectedSlot,
    clientLocation,
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const { user, isAuthenticated } = useAuth();

    const userPhone = user?.contact_number || user?.phone || "";
    const userEmail = user?.email || "";

    const [formData, setFormData] = useState({
        message: "",
        contact_preference: "",
        // phone: "",
        // email: "",
        client_phone: userPhone,
        client_email: userEmail,
        location_type: "client_address",
        client_address: clientLocation ? `Near ${clientLocation.city}` : "",
        client_city: clientLocation?.city || "",
        // city: "",
        special_requirements: "",
        urgency: "normal",
        service_id: service.id,
        provider_id: provider.id,
        preferred_date: selectedSlot?.date || "",
        preferred_time: selectedSlot?.time || "",
    });

    useEffect(() => {
        if (user && isAuthenticated) {
            const userPhone = user.contact_number || user.phone || "";
            const userEmail = user.email || "";

            // console.log("User data available for auto-fill:", {
            //     userPhone,
            //     userEmail,
            //     currentFormPhone: formData.client_phone,
            //     currentFormEmail: formData.client_email,
            // });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const quoteData = {
                service_id: service.id,
                provider_id: provider.id,
                requested_date: selectedSlot.date,
                requested_time: selectedSlot.time,
                ...formData,
                quote_type: "standard",
            };

            const response = await clientService.requestQuote(quoteData);

            if (response.success) {
                onHide();
                navigate("/client/quotes", {
                    state: {
                        message: "Quote request sent successfully!",
                        quote: response.data,
                    },
                });
            } else {
                alert(
                    "Failed to send quote request: " +
                        (response.message || "Unknown error")
                );
            }
        } catch (error) {
            console.error("Quote request failed:", error);
            alert("Failed to send quote request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // if (errors[field]) {
        //     setErrors((prev) => ({ ...prev, [field]: null }));
        // }
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

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                onClick={onHide}
                style={{ zIndex: 1040 }}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{ zIndex: 1050 }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <div className="modal-title-area">
                                <h5 className="modal-title fw-bold">
                                    Request Quote
                                </h5>
                                <p className="text-muted mb-0">
                                    Get a personalized quote for your service
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {/* {selectedSlot && (
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Quote request for:</strong>{" "}
                                    {selectedSlot.formatted_date} at{" "}
                                    {selectedSlot.formatted_time}
                                </div>
                            )} */}
                            <form onSubmit={handleSubmit}>
                                {/* Service Summary */}
                                <div className="service-summary mb-4 p-3 bg-light rounded">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h6 className="fw-bold mb-1">
                                                {service.title}
                                            </h6>
                                            <div className="text-muted small mb-2">
                                                by {provider.name}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-success me-2">
                                                    <i className="fas fa-calendar me-1"></i>
                                                    {new Date(
                                                        selectedSlot.date
                                                    ).toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                                <span className="badge bg-info">
                                                    <i className="fas fa-clock me-1"></i>
                                                    {
                                                        selectedSlot.formatted_time
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <div className="text-muted small">
                                                Starting from
                                            </div>
                                            <div className="fw-bold text-primary h5 mb-0">
                                                {service.formatted_price}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Request Form */}
                                <div className="row">
                                    {/* Left Column */}
                                    <div className="col-md-6">
                                        {/* Service Details */}
                                        <div className="form-section mb-4">
                                            <h6 className="fw-bold mb-3">
                                                Service Details
                                            </h6>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Describe your requirements
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="4"
                                                    placeholder="Please describe what you need in detail..."
                                                    value={formData.message}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "message",
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                ></textarea>
                                                <small className="text-muted">
                                                    The more details you
                                                    provide, the more accurate
                                                    your quote will be.
                                                </small>
                                            </div>

                                            {/* <div className="mb-3">
                                                <label className="form-label">
                                                    Service Location
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={
                                                        formData.location_type
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "location_type",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="client_address">
                                                        At my location
                                                    </option>
                                                    <option value="custom_location">
                                                        Custom location
                                                    </option>
                                                </select>
                                            </div> */}

                                            {formData.location_type !==
                                                "provider_location" && (
                                                <>
                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            Address
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
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
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">
                                                            City
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
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
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column */}
                                    <div className="col-md-6">
                                        {/* Contact Information */}
                                        <div className="form-section mb-4">
                                            <h6 className="fw-bold mb-3">
                                                Contact Information
                                            </h6>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    className={`form-control ${
                                                        isAutoFilled("phone")
                                                            ? "border-success"
                                                            : ""
                                                    }`}
                                                    placeholder="+94 77 123 4567"
                                                    value={
                                                        formData.client_phone
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "client_phone",
                                                            e.target.value
                                                        )
                                                    }
                                                    data-field="client_phone"
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className={`form-control ${
                                                        isAutoFilled("email")
                                                            ? "border-success"
                                                            : ""
                                                    }`}
                                                    placeholder="your@email.com"
                                                    value={
                                                        formData.client_email
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "client_email",
                                                            e.target.value
                                                        )
                                                    }
                                                    data-field="client_email"
                                                />
                                            </div>
                                        </div>

                                        {/* Special Requirements */}
                                        <div className="form-section">
                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Special Requirements
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows="3"
                                                    placeholder="Any special requirements, allergies, or preferences..."
                                                    value={
                                                        formData.special_requirements
                                                    }
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "special_requirements",
                                                            e.target.value
                                                        )
                                                    }
                                                ></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quote Information */}
                                <div className="quote-info bg-light p-3 rounded mb-4">
                                    <h6 className="fw-bold mb-2">
                                        <i className="fas fa-info-circle text-info me-2"></i>
                                        About Your Quote
                                    </h6>
                                    <ul className="list-unstyled small text-muted mb-0">
                                        <li className="mb-1">
                                            <i className="fas fa-check text-success me-2"></i>
                                            Free quote with no obligation
                                        </li>
                                        <li className="mb-1">
                                            <i className="fas fa-clock text-info me-2"></i>
                                            You'll receive a response within 24
                                            hours
                                        </li>
                                        <li className="mb-1">
                                            <i className="fas fa-shield-alt text-primary me-2"></i>
                                            All quotes are binding for 7 days
                                        </li>
                                        <li>
                                            <i className="fas fa-comments text-warning me-2"></i>
                                            You can negotiate or ask questions
                                        </li>
                                    </ul>
                                </div>

                                {/* Submit Buttons */}
                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={onHide}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            loading || !formData.message.trim()
                                        }
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-paper-plane me-2"></i>
                                                Send Quote Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default QuoteRequestModal;
