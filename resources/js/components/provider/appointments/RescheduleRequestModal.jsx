import React, { useState } from "react";
import providerAppointmentService from "../../../services/providerAppointmentService";

const RescheduleRequestModal = ({
    show,
    onHide,
    appointment,
    onResponseSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [showDeclineReason, setShowDeclineReason] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [errors, setErrors] = useState({});

    if (!show || !appointment?.pending_reschedule_request) return null;

    const rescheduleRequest = appointment.pending_reschedule_request;

    // Helper functions
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

    const getRescheduleReasonText = (reason) => {
        const reasons = {
            personal_emergency: "Personal emergency",
            work_conflict: "Work schedule conflict",
            travel_plans: "Travel plans changed",
            health_reasons: "Health reasons",
            weather_concerns: "Weather concerns",
            other: "Other reason",
        };
        return reasons[reason] || reason;
    };

    // Handle accept reschedule
    const handleAccept = async () => {
        if (loading) return;

        setLoading(true);
        setErrors({});

        try {
            const result =
                await providerAppointmentService.acceptRescheduleRequest(
                    appointment.id
                );

            if (result.success) {
                onResponseSuccess(result.data);
                onHide();
                alert(
                    "Reschedule request accepted! The appointment has been updated."
                );
            } else {
                setErrors({
                    general:
                        result.message || "Failed to accept reschedule request",
                });
            }
        } catch (error) {
            console.error("Accept reschedule failed:", error);
            setErrors({
                general:
                    "Failed to accept reschedule request. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Handle decline reschedule
    const handleDecline = async () => {
        if (loading) return;

        if (!showDeclineReason) {
            setShowDeclineReason(true);
            return;
        }

        if (!declineReason.trim()) {
            setErrors({
                decline_reason: "Please provide a reason for declining",
            });
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const result =
                await providerAppointmentService.declineRescheduleRequest(
                    appointment.id,
                    declineReason
                );

            if (result.success) {
                onResponseSuccess(result.data);
                onHide();
                alert(
                    "Reschedule request declined. The original appointment time remains unchanged."
                );
            } else {
                setErrors({
                    general:
                        result.message ||
                        "Failed to decline reschedule request",
                });
            }
        } catch (error) {
            console.error("Decline reschedule failed:", error);
            setErrors({
                general:
                    "Failed to decline reschedule request. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setShowDeclineReason(false);
            setDeclineReason("");
            setErrors({});
            onHide();
        }
    };

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
                                <h5 className="modal-title fw-bold text-orange">
                                    <i className="fas fa-calendar-alt me-2"></i>
                                    Reschedule Request
                                </h5>
                                <p className="text-muted mb-0 small">
                                    Client has requested to reschedule this
                                    appointment
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
                            {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )}

                            {/* Current Appointment Info */}
                            <div className="current-appointment mb-4">
                                <h6 className="fw-bold mb-3">
                                    <i className="fas fa-info-circle me-2 text-info"></i>
                                    Current Appointment
                                </h6>
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>Service:</strong>{" "}
                                                {appointment.service?.title ||
                                                    "N/A"}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>Client:</strong>{" "}
                                                {appointment.client?.name ||
                                                    appointment.client_name ||
                                                    "N/A"}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Current Date:</strong>{" "}
                                                {formatDate(
                                                    appointment.appointment_date
                                                )}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Current Time:</strong>{" "}
                                                {formatTime(
                                                    appointment.appointment_time
                                                )}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Duration:</strong>{" "}
                                                {appointment.duration_hours}{" "}
                                                hour(s)
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Price:</strong> Rs.{" "}
                                                {appointment.total_price}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reschedule Request Details */}
                            <div className="reschedule-request mb-4">
                                <h6 className="fw-bold mb-3">
                                    <i className="fas fa-calendar-check me-2 text-warning"></i>
                                    Requested Changes
                                </h6>
                                <div className="card border-warning">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <strong>New Date:</strong>{" "}
                                                {formatDate(
                                                    rescheduleRequest.requested_date
                                                )}
                                            </div>
                                            <div className="col-md-6">
                                                <strong>New Time:</strong>{" "}
                                                {formatTime(
                                                    rescheduleRequest.requested_time
                                                )}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Reason:</strong>{" "}
                                                {getRescheduleReasonText(
                                                    rescheduleRequest.reason
                                                )}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Requested:</strong>{" "}
                                                {new Date(
                                                    rescheduleRequest.created_at
                                                ).toLocaleDateString()}
                                            </div>
                                            <div className="col-md-6 mt-2">
                                                <strong>Status:</strong>{" "}
                                                <span className={`badge ${rescheduleRequest.status_badge_class || 'bg-warning text-dark'}`}>
                                                    {rescheduleRequest.status_text || rescheduleRequest.status}
                                                </span>
                                            </div>
                                        </div>

                                        {rescheduleRequest.notes && (
                                            <div className="mt-3">
                                                <strong>
                                                    Additional Notes:
                                                </strong>
                                                <p className="mt-1 mb-0 p-2 bg-white rounded border-start border-warning border-3">
                                                    {rescheduleRequest.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Decline Reason Input */}
                            {showDeclineReason && (
                                <div className="decline-reason mb-4">
                                    <h6 className="fw-bold mb-3 text-danger">
                                        <i className="fas fa-times-circle me-2"></i>
                                        Reason for Declining
                                    </h6>
                                    <div className="card border-danger">
                                        <div className="card-body">
                                            <textarea
                                                className={`form-control ${
                                                    errors.decline_reason
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                rows="3"
                                                placeholder="Please explain why you cannot accommodate this reschedule request..."
                                                value={declineReason}
                                                onChange={(e) => {
                                                    setDeclineReason(
                                                        e.target.value
                                                    );
                                                    if (errors.decline_reason) {
                                                        setErrors((prev) => ({
                                                            ...prev,
                                                            decline_reason:
                                                                null,
                                                        }));
                                                    }
                                                }}
                                                maxLength="500"
                                                disabled={loading}
                                            ></textarea>
                                            {errors.decline_reason && (
                                                <div className="invalid-feedback">
                                                    {errors.decline_reason}
                                                </div>
                                            )}
                                            <small className="text-muted d-block mt-1">
                                                {declineReason.length}/500
                                                characters
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Info */}
                            <div className="action-info">
                                <div className="alert alert-info">
                                    <h6 className="fw-bold mb-2">
                                        <i className="fas fa-lightbulb me-2"></i>
                                        What happens next?
                                    </h6>
                                    <ul className="mb-0 ps-3">
                                        <li>
                                            <strong>Accept:</strong> The
                                            appointment will be updated to the
                                            new date/time, and the client will
                                            be notified
                                        </li>
                                        <li>
                                            <strong>Decline:</strong> The
                                            original appointment remains
                                            unchanged, and the client will be
                                            notified with your reason
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top">
                            <div className="d-flex justify-content-between w-100">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>

                                <div className="d-flex gap-2">
                                    {!showDeclineReason ? (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger"
                                                onClick={handleDecline}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-times me-2"></i>
                                                Decline
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={handleAccept}
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check me-2"></i>
                                                        Accept Reschedule
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() =>
                                                    setShowDeclineReason(false)
                                                }
                                                disabled={loading}
                                            >
                                                Back
                                            </button>

                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={handleDecline}
                                                disabled={
                                                    loading ||
                                                    !declineReason.trim()
                                                }
                                            >
                                                {loading ? (
                                                    <>
                                                        <span
                                                            className="spinner-border spinner-border-sm me-2"
                                                            role="status"
                                                            aria-hidden="true"
                                                        ></span>
                                                        Declining...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-times me-2"></i>
                                                        Confirm Decline
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .text-orange { color: #fd7e14 !important; }
                .btn-orange {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }
                .btn-orange:hover {
                    background-color: #e8681c;
                    border-color: #e8681c;
                    color: white;
                }
                .border-warning {
                    border-color: #ffc107 !important;
                }
                .border-3 {
                    border-width: 3px !important;
                }
            `}</style>
        </>
    );
};

export default RescheduleRequestModal;
