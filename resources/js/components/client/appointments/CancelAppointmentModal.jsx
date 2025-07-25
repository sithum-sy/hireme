import React, { useState } from "react";
import appointmentService from "../../../services/appointmentService";

const CancelAppointmentModal = ({
    show,
    onHide,
    appointment,
    onCancellationSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [cancellationData, setCancellationData] = useState({
        reason: "",
        notes: "",
        confirmRefund: false,
    });
    const [errors, setErrors] = useState({});

    // Cancellation reason options
    const cancellationReasons = [
        { value: "schedule_conflict", label: "Schedule conflict" },
        { value: "found_alternative", label: "Found alternative service" },
        { value: "personal_reasons", label: "Personal reasons" },
        { value: "provider_issues", label: "Issues with provider" },
        { value: "price_concerns", label: "Price concerns" },
        { value: "emergency", label: "Emergency situation" },
        { value: "other", label: "Other (please specify)" },
    ];

    // Calculate hours until appointment for policy display
    const getHoursUntilAppointment = () => {
        try {
            const appointmentDateTime = new Date(
                `${appointment.appointment_date}T${appointment.appointment_time}`
            );
            const now = new Date();
            return Math.ceil((appointmentDateTime - now) / (1000 * 60 * 60));
        } catch (error) {
            return 0;
        }
    };

    const hoursUntilAppointment = getHoursUntilAppointment();
    const canCancelFree = hoursUntilAppointment > 24;

    const handleInputChange = (field, value) => {
        setCancellationData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!cancellationData.reason) {
            newErrors.reason = "Please select a cancellation reason";
        }

        if (
            cancellationData.reason === "other" &&
            !cancellationData.notes.trim()
        ) {
            newErrors.notes = 'Please provide details for "Other" reason';
        }

        if (cancellationData.notes && cancellationData.notes.length > 500) {
            newErrors.notes = "Notes cannot exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCancel = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await appointmentService.cancelAppointment(
                appointment.id,
                {
                    reason: cancellationData.reason,
                    notes: cancellationData.notes,
                    cancellation_reason: cancellationReasons.find(
                        (r) => r.value === cancellationData.reason
                    )?.label,
                    cancellation_notes: cancellationData.notes,
                }
            );

            if (result.success) {
                onCancellationSuccess(result.data);
                onHide();
                // Show success message
                alert("Appointment cancelled successfully");
            } else {
                setErrors({
                    general: result.message || "Failed to cancel appointment",
                });
            }
        } catch (error) {
            console.error("Cancellation failed:", error);
            setErrors({
                general: "Failed to cancel appointment. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setCancellationData({
                reason: "",
                notes: "",
                confirmRefund: false,
            });
            setErrors({});
            onHide();
        }
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1040 }}
            ></div>

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{ zIndex: 1050 }}
                tabIndex="-1"
            >
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5 className="modal-title fw-bold text-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Cancel Appointment
                                </h5>
                                <p className="text-muted mb-0 small">
                                    {appointment.service?.title} -{" "}
                                    {appointment.formatted_date_time}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                                disabled={loading}
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* General Error */}
                            {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )}

                            {/* Cancellation Policy Notice */}
                            <div
                                className={`alert ${
                                    canCancelFree
                                        ? "alert-info"
                                        : "alert-warning"
                                } mb-4`}
                            >
                                <div className="d-flex align-items-start">
                                    <i
                                        className={`fas ${
                                            canCancelFree
                                                ? "fa-info-circle"
                                                : "fa-exclamation-triangle"
                                        } me-2 mt-1`}
                                    ></i>
                                    <div>
                                        <strong>Cancellation Policy:</strong>
                                        <div className="mt-1">
                                            {canCancelFree ? (
                                                <>
                                                    Free cancellation available
                                                    ({hoursUntilAppointment}{" "}
                                                    hours remaining). No charges
                                                    will be applied.
                                                </>
                                            ) : (
                                                <>
                                                    Cancellation deadline has
                                                    passed (
                                                    {Math.abs(
                                                        hoursUntilAppointment
                                                    )}{" "}
                                                    hours until appointment).
                                                    Cancellation fees may apply.
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Summary */}
                            <div className="appointment-summary bg-light rounded p-3 mb-4">
                                <h6 className="fw-bold mb-2">
                                    Appointment Details
                                </h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <strong>Service:</strong>{" "}
                                            {appointment.service?.title}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Provider:</strong>{" "}
                                            {appointment.provider?.first_name}{" "}
                                            {appointment.provider?.last_name}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-2">
                                            <strong>Date:</strong>{" "}
                                            {appointment.formatted_date}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Time:</strong>{" "}
                                            {appointment.formatted_time}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Total:</strong>
                                            <span className="text-danger fw-bold ms-1">
                                                Rs. {appointment.total_price}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cancellation Reason */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Reason for Cancellation *
                                </label>
                                <select
                                    className={`form-select ${
                                        errors.reason ? "is-invalid" : ""
                                    }`}
                                    value={cancellationData.reason}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "reason",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading}
                                >
                                    <option value="">Select a reason...</option>
                                    {cancellationReasons.map((reason) => (
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
                            </div>

                            {/* Additional Notes */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Additional Notes
                                    {cancellationData.reason === "other" && (
                                        <span className="text-danger">*</span>
                                    )}
                                </label>
                                <textarea
                                    className={`form-control ${
                                        errors.notes ? "is-invalid" : ""
                                    }`}
                                    rows="3"
                                    placeholder="Please provide any additional details about your cancellation..."
                                    value={cancellationData.notes}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    maxLength="500"
                                    disabled={loading}
                                ></textarea>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                    {errors.notes ? (
                                        <div className="text-danger small">
                                            {errors.notes}
                                        </div>
                                    ) : (
                                        <small className="text-muted">
                                            {cancellationData.reason === "other"
                                                ? 'Required when "Other" is selected'
                                                : "Optional"}
                                        </small>
                                    )}
                                    <small className="text-muted">
                                        {cancellationData.notes.length}/500
                                    </small>
                                </div>
                            </div>

                            {/* Confirmation Checkbox */}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="confirmCancel"
                                    checked={cancellationData.confirmRefund}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "confirmRefund",
                                            e.target.checked
                                        )
                                    }
                                    disabled={loading}
                                />
                                <label
                                    className="form-check-label fw-semibold"
                                    htmlFor="confirmCancel"
                                >
                                    I understand the cancellation policy and
                                    confirm that I want to cancel this
                                    appointment
                                </label>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Keep Appointment
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleCancel}
                                disabled={
                                    loading ||
                                    !cancellationData.reason ||
                                    !cancellationData.confirmRefund
                                }
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-times me-2"></i>
                                        Cancel Appointment
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CancelAppointmentModal;
