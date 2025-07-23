import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import clientService from "../../../services/clientService";

const QuoteRequestModal = ({
    show,
    onHide,
    service,
    provider,
    selectedSlot,
}) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        message: "",
        contact_preference: "phone",
        phone: "",
        email: "",
        location_type: "client_address",
        address: "",
        city: "",
        special_requirements: "",
        urgency: "normal",
        service_id: service.id,
        provider_id: provider.id,
        preferred_date: selectedSlot?.date || "",
        preferred_time: selectedSlot?.time || "",
    });

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
                            {selectedSlot && (
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Quote request for:</strong>{" "}
                                    {selectedSlot.formatted_date} at{" "}
                                    {selectedSlot.formatted_time}
                                </div>
                            )}
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

                                            <div className="mb-3">
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
                                                    <option value="provider_location">
                                                        At provider location
                                                    </option>
                                                    <option value="custom_location">
                                                        Custom location
                                                    </option>
                                                </select>
                                            </div>

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
                                                            placeholder="Enter service address"
                                                            value={
                                                                formData.address
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "address",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            required
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
                                                                formData.city
                                                            }
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    "city",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Urgency
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.urgency}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "urgency",
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="normal">
                                                        Normal (within a week)
                                                    </option>
                                                    <option value="urgent">
                                                        Urgent (within 2-3 days)
                                                    </option>
                                                    <option value="emergency">
                                                        Emergency (ASAP)
                                                    </option>
                                                </select>
                                            </div>
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
                                                    className="form-control"
                                                    placeholder="+94 77 123 4567"
                                                    value={formData.phone}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "phone",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    placeholder="your@email.com"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    Preferred Contact Method
                                                </label>
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
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="contact_phone"
                                                    >
                                                        Phone Call
                                                    </label>
                                                </div>
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
                                                    />
                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="contact_message"
                                                    >
                                                        Text/WhatsApp
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Special Requirements */}
                                        <div className="form-section">
                                            <h6 className="fw-bold mb-3">
                                                Additional Information
                                            </h6>

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

            <style>{`
                .text-primary {
                    color: var(--current-role-primary) !important;
                }
                .btn-primary {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                    color: white;
                }
                .btn-primary:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
                .form-check-input:checked {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                }
            `}</style>
        </>
    );
};

export default QuoteRequestModal;
