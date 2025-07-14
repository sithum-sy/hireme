import React, { useState } from "react";
import clientService from "../../../services/clientService";

const DeclineQuoteModal = ({ show, onHide, quote, onDeclineSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [declineData, setDeclineData] = useState({
        reason: "",
        notes: "",
    });
    const [errors, setErrors] = useState({});

    // Predefined decline reasons
    const declineReasons = [
        { value: "price_too_high", label: "Price is too high" },
        { value: "found_better_option", label: "Found a better option" },
        { value: "changed_mind", label: "Changed my mind" },
        { value: "timing_issues", label: "Timing doesn't work" },
        { value: "provider_concerns", label: "Concerns about provider" },
        { value: "other", label: "Other reason" },
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeclineData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!declineData.reason) {
            newErrors.reason = "Please select a reason for declining";
        }

        if (declineData.reason === "other" && !declineData.notes.trim()) {
            newErrors.notes = "Please provide details for 'Other reason'";
        }

        return newErrors;
    };

    const handleDeclineQuote = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await clientService.declineQuote(
                quote.id,
                declineData
            );

            if (response.success) {
                onDeclineSuccess(response.data);
                onHide();

                // Show success message
                alert(
                    "Quote declined successfully. The provider has been notified."
                );
            } else {
                setErrors({ general: response.message });
            }
        } catch (error) {
            console.error("Failed to decline quote:", error);
            setErrors({
                general: "Failed to decline quote. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-times-circle me-2"></i>
                            Decline Quote
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onHide}
                            disabled={loading}
                        ></button>
                    </div>

                    <form onSubmit={handleDeclineQuote}>
                        <div className="modal-body">
                            {/* General Error */}
                            {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )}

                            {/* Quote Summary */}
                            <div className="quote-summary bg-light rounded p-3 mb-4">
                                <h6 className="fw-bold mb-2">
                                    Quote to Decline
                                </h6>
                                <div className="row">
                                    <div className="col-md-8">
                                        <div className="mb-1">
                                            <strong>Service:</strong>{" "}
                                            {quote?.service_title}
                                        </div>
                                        <div className="mb-1">
                                            <strong>Provider:</strong>{" "}
                                            {quote?.provider_name}
                                        </div>
                                        <div className="mb-1">
                                            <strong>Quoted Price:</strong> Rs.{" "}
                                            {quote?.quoted_price}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Decline Reason */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Reason for Declining{" "}
                                    <span className="text-danger">*</span>
                                </label>
                                <select
                                    name="reason"
                                    className={`form-select ${
                                        errors.reason ? "is-invalid" : ""
                                    }`}
                                    value={declineData.reason}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select a reason...</option>
                                    {declineReasons.map((reason) => (
                                        <option
                                            key={reason.value}
                                            value={reason.value}
                                        >
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.reason && (
                                    <div className="invalid-feedback">
                                        {errors.reason}
                                    </div>
                                )}
                                <div className="form-text">
                                    This helps providers improve their services
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Additional Comments{" "}
                                    {declineData.reason === "other" && (
                                        <span className="text-danger">*</span>
                                    )}
                                </label>
                                <textarea
                                    name="notes"
                                    className={`form-control ${
                                        errors.notes ? "is-invalid" : ""
                                    }`}
                                    rows="4"
                                    value={declineData.notes}
                                    onChange={handleInputChange}
                                    placeholder={
                                        declineData.reason === "other"
                                            ? "Please explain your reason..."
                                            : "Any additional feedback for the provider (optional)..."
                                    }
                                />
                                {errors.notes && (
                                    <div className="invalid-feedback">
                                        {errors.notes}
                                    </div>
                                )}
                                <div className="form-text">
                                    {declineData.reason === "other"
                                        ? "Please provide details about your reason"
                                        : "This feedback will be shared with the provider"}
                                </div>
                            </div>

                            {/* Warning Notice */}
                            <div className="alert alert-warning">
                                <h6 className="fw-bold mb-2">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Please Note
                                </h6>
                                <ul className="mb-0 small">
                                    <li>
                                        Once declined, this quote cannot be
                                        accepted again
                                    </li>
                                    <li>
                                        The provider will be notified of your
                                        decision
                                    </li>
                                    <li>
                                        You can still request a new quote for
                                        this service
                                    </li>
                                    <li>
                                        Your feedback helps providers improve
                                        their offerings
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="modal-footer">
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
                                className="btn btn-danger"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Declining...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-times me-2"></i>
                                        Decline Quote
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeclineQuoteModal;
