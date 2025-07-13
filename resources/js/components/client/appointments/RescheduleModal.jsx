import React, { useState, useEffect } from "react";
import appointmentService from "../../../services/appointmentService";
import clientAvailabilityService from "../../../services/clientAvailabilityService";

const RescheduleModal = ({
    show,
    onHide,
    appointment,
    onRescheduleSuccess,
}) => {
    const [loading, setLoading] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [rescheduleData, setRescheduleData] = useState({
        date: "",
        time: "",
        reason: "",
        notes: "",
    });
    const [availableSlots, setAvailableSlots] = useState([]);
    const [errors, setErrors] = useState({});

    // Reschedule reason options
    const rescheduleReasons = [
        { value: "personal_emergency", label: "Personal emergency" },
        { value: "work_conflict", label: "Work schedule conflict" },
        { value: "travel_plans", label: "Travel plans changed" },
        { value: "health_reasons", label: "Health reasons" },
        { value: "weather_concerns", label: "Weather concerns" },
        { value: "provider_request", label: "Provider requested change" },
        { value: "other", label: "Other (please specify)" },
    ];

    // Load available slots when date changes
    useEffect(() => {
        if (
            rescheduleData.date &&
            appointment.provider_id &&
            appointment.service_id
        ) {
            loadAvailableSlots();
        }
    }, [rescheduleData.date]);

    const loadAvailableSlots = async () => {
        setAvailabilityLoading(true);
        try {
            const result = await clientAvailabilityService.getAvailableSlots({
                provider_id: appointment.provider_id,
                service_id: appointment.service_id,
                date: rescheduleData.date,
                duration: appointment.duration_hours || 1,
            });

            if (result.success) {
                setAvailableSlots(result.data);
            } else {
                setAvailableSlots([]);
                setErrors({ date: "No available slots for this date" });
            }
        } catch (error) {
            console.error("Failed to load available slots:", error);
            setAvailableSlots([]);
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setRescheduleData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }

        // Clear time when date changes
        if (field === "date") {
            setRescheduleData((prev) => ({ ...prev, time: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!rescheduleData.date) {
            newErrors.date = "Please select a new date";
        } else {
            const selectedDate = new Date(rescheduleData.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate <= today) {
                newErrors.date = "Please select a future date";
            }
        }

        if (!rescheduleData.time) {
            newErrors.time = "Please select a time slot";
        }

        if (!rescheduleData.reason) {
            newErrors.reason = "Please select a reason for rescheduling";
        }

        if (rescheduleData.reason === "other" && !rescheduleData.notes.trim()) {
            newErrors.notes = 'Please provide details for "Other" reason';
        }

        if (rescheduleData.notes && rescheduleData.notes.length > 500) {
            newErrors.notes = "Notes cannot exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleReschedule = async () => {
    //     if (!validateForm()) return;

    //     setLoading(true);
    //     try {
    //         const result = await appointmentService.requestReschedule(
    //             appointment.id,
    //             {
    //                 date: rescheduleData.date,
    //                 time: rescheduleData.time,
    //                 reason: rescheduleData.reason,
    //                 notes: rescheduleData.notes,
    //                 reschedule_reason: rescheduleReasons.find(
    //                     (r) => r.value === rescheduleData.reason
    //                 )?.label,
    //             }
    //         );

    //         if (result.success) {
    //             onRescheduleSuccess(result.data);
    //             onHide();
    //             alert(
    //                 "Reschedule request submitted successfully. The provider will confirm the new time."
    //             );
    //         } else {
    //             setErrors({
    //                 general:
    //                     result.message || "Failed to submit reschedule request",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Reschedule request failed:", error);
    //         setErrors({
    //             general:
    //                 "Failed to submit reschedule request. Please try again.",
    //         });
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const handleReschedule = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            // Match your appointmentService.requestReschedule() method signature
            const result = await appointmentService.requestReschedule(
                appointment.id,
                {
                    date: rescheduleData.date,
                    time: rescheduleData.time,
                    reason: rescheduleData.reason,
                    notes: rescheduleData.notes,
                }
            );

            if (result.success) {
                onRescheduleSuccess(result.data);
                onHide();
                alert(
                    "Reschedule request submitted successfully. The provider will confirm the new time."
                );
            } else {
                setErrors({
                    general:
                        result.message || "Failed to submit reschedule request",
                });
            }
        } catch (error) {
            console.error("Reschedule request failed:", error);
            setErrors({
                general:
                    "Failed to submit reschedule request. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setRescheduleData({ date: "", time: "", reason: "", notes: "" });
            setAvailableSlots([]);
            setErrors({});
            onHide();
        }
    };

    // Get minimum date (tomorrow)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    };

    // Get maximum date (3 months from now)
    const getMaxDate = () => {
        const maxDate = new Date();
        maxDate.setMonth(maxDate.getMonth() + 3);
        return maxDate.toISOString().split("T")[0];
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
                <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5 className="modal-title fw-bold text-warning">
                                    <i className="fas fa-edit me-2"></i>
                                    Reschedule Appointment
                                </h5>
                                <p className="text-muted mb-0 small">
                                    {appointment.service?.title} - Currently
                                    scheduled for{" "}
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

                            {/* Current Appointment Info */}
                            <div className="current-appointment bg-light rounded p-3 mb-4">
                                <h6 className="fw-bold mb-2">
                                    Current Appointment
                                </h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="mb-1">
                                            <strong>Date:</strong>{" "}
                                            {appointment.formatted_date}
                                        </div>
                                        <div className="mb-1">
                                            <strong>Time:</strong>{" "}
                                            {appointment.formatted_time}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-1">
                                            <strong>Provider:</strong>{" "}
                                            {appointment.provider?.first_name}{" "}
                                            {appointment.provider?.last_name}
                                        </div>
                                        <div className="mb-1">
                                            <strong>Duration:</strong>{" "}
                                            {appointment.duration_hours} hour(s)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reschedule Reason */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Reason for Rescheduling *
                                </label>
                                <select
                                    className={`form-select ${
                                        errors.reason ? "is-invalid" : ""
                                    }`}
                                    value={rescheduleData.reason}
                                    onChange={(e) =>
                                        handleInputChange(
                                            "reason",
                                            e.target.value
                                        )
                                    }
                                    disabled={loading}
                                >
                                    <option value="">Select a reason...</option>
                                    {rescheduleReasons.map((reason) => (
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

                            {/* New Date Selection */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        New Date *
                                    </label>
                                    <input
                                        type="date"
                                        className={`form-control ${
                                            errors.date ? "is-invalid" : ""
                                        }`}
                                        value={rescheduleData.date}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "date",
                                                e.target.value
                                            )
                                        }
                                        min={getMinDate()}
                                        max={getMaxDate()}
                                        disabled={loading}
                                    />
                                    {errors.date && (
                                        <div className="invalid-feedback">
                                            {errors.date}
                                        </div>
                                    )}
                                </div>

                                {/* New Time Selection */}
                                <div className="col-md-6 mb-3">
                                    <label className="form-label fw-semibold">
                                        New Time *
                                    </label>
                                    <select
                                        className={`form-select ${
                                            errors.time ? "is-invalid" : ""
                                        }`}
                                        value={rescheduleData.time}
                                        onChange={(e) =>
                                            handleInputChange(
                                                "time",
                                                e.target.value
                                            )
                                        }
                                        disabled={
                                            loading ||
                                            !rescheduleData.date ||
                                            availabilityLoading
                                        }
                                    >
                                        <option value="">
                                            {!rescheduleData.date
                                                ? "Select date first..."
                                                : availabilityLoading
                                                ? "Loading available times..."
                                                : "Select a time..."}
                                        </option>
                                        {availableSlots.map((slot, index) => (
                                            <option
                                                key={index}
                                                value={slot.time}
                                            >
                                                {slot.formatted_time}
                                                {slot.is_popular &&
                                                    " (Popular)"}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.time && (
                                        <div className="invalid-feedback">
                                            {errors.time}
                                        </div>
                                    )}
                                    {rescheduleData.date &&
                                        !availabilityLoading &&
                                        availableSlots.length === 0 && (
                                            <small className="text-danger">
                                                No available slots for this date
                                            </small>
                                        )}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div className="mb-3">
                                <label className="form-label fw-semibold">
                                    Additional Notes
                                    {rescheduleData.reason === "other" && (
                                        <span className="text-danger"> *</span>
                                    )}
                                </label>
                                <textarea
                                    className={`form-control ${
                                        errors.notes ? "is-invalid" : ""
                                    }`}
                                    rows="3"
                                    placeholder="Please provide any additional details about your reschedule request..."
                                    value={rescheduleData.notes}
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
                                            {rescheduleData.reason === "other"
                                                ? 'Required when "Other" is selected'
                                                : "Optional"}
                                        </small>
                                    )}
                                    <small className="text-muted">
                                        {rescheduleData.notes.length}/500
                                    </small>
                                </div>
                            </div>

                            {/* Reschedule Policy */}
                            <div className="alert alert-info">
                                <h6 className="fw-bold mb-2">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Reschedule Policy
                                </h6>
                                <ul className="mb-0 small">
                                    <li>
                                        Reschedule requests must be approved by
                                        the provider
                                    </li>
                                    <li>
                                        You will receive confirmation within 24
                                        hours
                                    </li>
                                    <li>
                                        If the new time is not available,
                                        alternative slots will be suggested
                                    </li>
                                    <li>
                                        No additional charges apply for
                                        rescheduling
                                    </li>
                                </ul>
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
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-warning"
                                onClick={handleReschedule}
                                disabled={
                                    loading ||
                                    !rescheduleData.date ||
                                    !rescheduleData.time ||
                                    !rescheduleData.reason
                                }
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-edit me-2"></i>
                                        Submit Reschedule Request
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

export default RescheduleModal;
