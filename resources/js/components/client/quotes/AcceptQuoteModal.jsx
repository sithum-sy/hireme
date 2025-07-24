// components/client/quotes/AcceptQuoteModal.jsx - Enhanced version
import React, { useState, useEffect } from "react";
import clientService from "../../../services/clientService";
import clientAvailabilityService from "../../../services/clientAvailabilityService";

const AcceptQuoteModal = ({ show, onHide, quote, onAcceptSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [acceptData, setAcceptData] = useState({
        notes: "",
        create_appointment: true,
        appointment_date: quote?.requested_date || "",
        appointment_time: quote?.requested_time || "",
    });
    const [errors, setErrors] = useState({});

    // Load available slots when modal opens or date changes
    useEffect(() => {
        if (
            show &&
            acceptData.create_appointment &&
            acceptData.appointment_date
        ) {
            loadAvailableSlots(acceptData.appointment_date);
        }
    }, [show, acceptData.appointment_date, acceptData.create_appointment]);

    const loadAvailableSlots = async (date) => {
        setAvailabilityLoading(true);
        try {
            const response = await clientAvailabilityService.getAvailableSlots({
                provider_id: quote.provider_id,
                service_id: quote.service_id || quote.id,
                date: date,
                duration: quote.estimated_duration || 1,
            });

            if (response.success) {
                setAvailableSlots(
                    response.data.available_slots || response.data || []
                );

                // Check if originally requested time is still available
                if (quote.requested_time && response.data.available_slots) {
                    const originalTimeAvailable =
                        response.data.available_slots.find(
                            (slot) => slot.time === quote.requested_time
                        );

                    if (originalTimeAvailable) {
                        setSelectedSlot(originalTimeAvailable);
                        setAcceptData((prev) => ({
                            ...prev,
                            appointment_time: quote.requested_time,
                        }));
                    }
                }
            } else {
                setErrors({
                    availability:
                        response.message || "Failed to load available times",
                });
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error("Failed to load availability:", error);
            setErrors({
                availability: "Unable to check provider availability",
            });
            setAvailableSlots([]);
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAcceptData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Reset time selection when date changes
        if (name === "appointment_date") {
            setSelectedSlot(null);
            setAcceptData((prev) => ({
                ...prev,
                appointment_time: "",
            }));
        }
    };

    const handleTimeSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setAcceptData((prev) => ({
            ...prev,
            appointment_time: slot.time || slot.start_time,
        }));

        if (errors.appointment_time) {
            setErrors((prev) => ({ ...prev, appointment_time: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (acceptData.create_appointment) {
            if (!acceptData.appointment_date) {
                newErrors.appointment_date = "Appointment date is required";
            } else {
                // Check if date is in the future
                const selectedDate = new Date(acceptData.appointment_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (selectedDate < today) {
                    newErrors.appointment_date =
                        "Appointment date must be in the future";
                }
            }

            if (!acceptData.appointment_time || !selectedSlot) {
                newErrors.appointment_time =
                    "Please select an available time slot";
            }

            // Check if selected time is still available
            if (selectedSlot && availableSlots.length > 0) {
                const isTimeStillAvailable = availableSlots.some(
                    (slot) =>
                        (slot.time || slot.start_time) ===
                        acceptData.appointment_time
                );

                if (!isTimeStillAvailable) {
                    newErrors.appointment_time =
                        "Selected time is no longer available";
                }
            }
        }

        return newErrors;
    };

    const handleAcceptQuote = async (e) => {
        e.preventDefault();

        const formErrors = validateForm();
        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        setLoading(true);
        try {
            // Prepare acceptance data with appointment details
            const acceptanceData = {
                notes: acceptData.notes,
                create_appointment: acceptData.create_appointment,
            };

            // Add appointment details if creating appointment
            if (acceptData.create_appointment) {
                acceptanceData.appointment_details = {
                    date: acceptData.appointment_date,
                    time: acceptData.appointment_time,
                    duration: quote.estimated_duration || 1,
                    provider_id: quote.provider_id,
                    service_id: quote.service_id || quote.id,
                    selected_slot: selectedSlot,
                };
            }

            const response = await clientService.acceptQuote(
                quote.id,
                acceptanceData
            );

            if (response.success) {
                onAcceptSuccess(response.data);
                onHide();

                // Show appropriate success message
                const message = acceptData.create_appointment
                    ? "Quote accepted and appointment created successfully!"
                    : "Quote accepted successfully!";

                alert(message);
            } else {
                setErrors({ general: response.message });
            }
        } catch (error) {
            console.error("Failed to accept quote:", error);
            setErrors({ general: "Failed to accept quote. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const formatTimeForDisplay = (time) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header bg-success text-white">
                        <h5 className="modal-title">
                            <i className="fas fa-check-circle me-2"></i>
                            Accept Quote
                        </h5>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            onClick={onHide}
                            disabled={loading}
                        ></button>
                    </div>

                    <form onSubmit={handleAcceptQuote}>
                        <div className="modal-body">
                            {/* General Error */}
                            {errors.general && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.general}
                                </div>
                            )}

                            <div className="row">
                                <div className="col-lg-8">
                                    {/* Quote Summary */}
                                    <div className="quote-summary bg-light rounded p-3 mb-4">
                                        <h6 className="fw-bold mb-2">
                                            Quote Summary
                                        </h6>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-2">
                                                    <strong>Service:</strong>{" "}
                                                    {quote?.service_title}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>Provider:</strong>{" "}
                                                    {quote?.provider_name}
                                                </div>
                                                <div className="mb-2">
                                                    <strong>
                                                        Originally Requested:
                                                    </strong>{" "}
                                                    {quote?.requested_date} at{" "}
                                                    {quote?.requested_time}
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="mb-2">
                                                    <strong>
                                                        Quoted Price:
                                                    </strong>
                                                    <span className="text-success fw-bold ms-2">
                                                        Rs.{" "}
                                                        {quote?.quoted_price}
                                                    </span>
                                                </div>
                                                {quote?.estimated_duration && (
                                                    <div className="mb-2">
                                                        <strong>
                                                            Duration:
                                                        </strong>{" "}
                                                        {
                                                            quote.estimated_duration
                                                        }{" "}
                                                        hours
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Create Appointment Option */}
                                    <div className="appointment-creation mb-4">
                                        <div className="form-check mb-3">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                name="create_appointment"
                                                id="create_appointment"
                                                checked={
                                                    acceptData.create_appointment
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <label
                                                className="form-check-label fw-semibold"
                                                htmlFor="create_appointment"
                                            >
                                                Create appointment immediately
                                            </label>
                                            <div className="form-text">
                                                Schedule the service when
                                                accepting the quote
                                            </div>
                                        </div>

                                        {/* Appointment Details */}
                                        {acceptData.create_appointment && (
                                            <div className="appointment-details bg-light rounded p-3">
                                                <h6 className="fw-bold mb-3">
                                                    Schedule Appointment
                                                </h6>

                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                Appointment Date{" "}
                                                                <span className="text-danger">
                                                                    *
                                                                </span>
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name="appointment_date"
                                                                className={`form-control ${
                                                                    errors.appointment_date
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                value={
                                                                    acceptData.appointment_date
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                min={
                                                                    new Date()
                                                                        .toISOString()
                                                                        .split(
                                                                            "T"
                                                                        )[0]
                                                                }
                                                            />
                                                            {errors.appointment_date && (
                                                                <div className="invalid-feedback">
                                                                    {
                                                                        errors.appointment_date
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="mb-3">
                                                            <label className="form-label fw-semibold">
                                                                Available Times{" "}
                                                                <span className="text-danger">
                                                                    *
                                                                </span>
                                                            </label>

                                                            {availabilityLoading ? (
                                                                <div className="text-center py-3">
                                                                    <div className="spinner-border spinner-border-sm me-2"></div>
                                                                    Loading
                                                                    available
                                                                    times...
                                                                </div>
                                                            ) : errors.availability ? (
                                                                <div className="text-danger small">
                                                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                                                    {
                                                                        errors.availability
                                                                    }
                                                                </div>
                                                            ) : availableSlots.length >
                                                              0 ? (
                                                                <div className="time-slots">
                                                                    <div className="row g-2">
                                                                        {availableSlots.map(
                                                                            (
                                                                                slot,
                                                                                index
                                                                            ) => {
                                                                                const timeString =
                                                                                    slot.time ||
                                                                                    slot.start_time;
                                                                                const isSelected =
                                                                                    selectedSlot &&
                                                                                    (selectedSlot.time ||
                                                                                        selectedSlot.start_time) ===
                                                                                        timeString;

                                                                                return (
                                                                                    <div
                                                                                        key={
                                                                                            index
                                                                                        }
                                                                                        className="col-6"
                                                                                    >
                                                                                        <button
                                                                                            type="button"
                                                                                            className={`btn btn-sm w-100 ${
                                                                                                isSelected
                                                                                                    ? "btn-success"
                                                                                                    : "btn-outline-secondary"
                                                                                            }`}
                                                                                            onClick={() =>
                                                                                                handleTimeSlotSelect(
                                                                                                    slot
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            {slot.formatted_time ||
                                                                                                formatTimeForDisplay(
                                                                                                    timeString
                                                                                                )}
                                                                                            {slot.is_popular && (
                                                                                                <small className="d-block text-warning">
                                                                                                    Popular
                                                                                                </small>
                                                                                            )}
                                                                                        </button>
                                                                                    </div>
                                                                                );
                                                                            }
                                                                        )}
                                                                    </div>

                                                                    {errors.appointment_time && (
                                                                        <div className="text-danger small mt-2">
                                                                            {
                                                                                errors.appointment_time
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ) : acceptData.appointment_date ? (
                                                                <div className="text-muted small">
                                                                    <i className="fas fa-info-circle me-1"></i>
                                                                    No available
                                                                    times for
                                                                    this date.
                                                                    Try a
                                                                    different
                                                                    date.
                                                                </div>
                                                            ) : (
                                                                <div className="text-muted small">
                                                                    <i className="fas fa-calendar me-1"></i>
                                                                    Select a
                                                                    date to see
                                                                    available
                                                                    times
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Originally Requested Time Notice */}
                                                {quote?.requested_time &&
                                                    acceptData.appointment_date ===
                                                        quote.requested_date && (
                                                        <div className="original-time-notice p-2 bg-info bg-opacity-10 border border-info rounded">
                                                            <small className="text-info">
                                                                <i className="fas fa-info-circle me-1"></i>
                                                                <strong>
                                                                    Note:
                                                                </strong>{" "}
                                                                You originally
                                                                requested{" "}
                                                                {formatTimeForDisplay(
                                                                    quote.requested_time
                                                                )}{" "}
                                                                on{" "}
                                                                {
                                                                    quote.requested_date
                                                                }
                                                                {availableSlots.some(
                                                                    (slot) =>
                                                                        (slot.time ||
                                                                            slot.start_time) ===
                                                                        quote.requested_time
                                                                )
                                                                    ? ". This time is still available!"
                                                                    : ". This time is no longer available, please select a different time."}
                                                            </small>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Additional Notes */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold">
                                            Additional Notes (Optional)
                                        </label>
                                        <textarea
                                            name="notes"
                                            className="form-control"
                                            rows="3"
                                            value={acceptData.notes}
                                            onChange={handleInputChange}
                                            placeholder="Any additional comments or instructions..."
                                        />
                                        <div className="form-text">
                                            This message will be sent to the
                                            provider
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Summary */}
                                <div className="col-lg-4">
                                    <div className="summary-sidebar">
                                        {/* Provider Info */}
                                        <div className="card border-0 shadow-sm mb-3">
                                            <div className="card-header bg-primary text-white">
                                                <h6 className="fw-bold mb-0">
                                                    <i className="fas fa-user me-2"></i>
                                                    Provider
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="d-flex align-items-center">
                                                    <div className="provider-avatar me-3">
                                                        {quote?.provider_image ? (
                                                            <img
                                                                src={
                                                                    quote.provider_image
                                                                }
                                                                alt={
                                                                    quote.provider_name
                                                                }
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                }}
                                                            >
                                                                <i className="fas fa-user"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">
                                                            {
                                                                quote?.provider_name
                                                            }
                                                        </div>
                                                        <div className="text-muted small">
                                                            <i className="fas fa-star text-warning me-1"></i>
                                                            {quote?.provider_rating ||
                                                                0}{" "}
                                                            (
                                                            {quote?.provider_reviews ||
                                                                0}{" "}
                                                            reviews)
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointment Summary */}
                                        {acceptData.create_appointment && (
                                            <div className="card border-0 shadow-sm mb-3">
                                                <div className="card-header bg-success text-white">
                                                    <h6 className="fw-bold mb-0">
                                                        <i className="fas fa-calendar-check me-2"></i>
                                                        Appointment
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="appointment-summary">
                                                        {acceptData.appointment_date ? (
                                                            <div className="mb-2">
                                                                <i className="fas fa-calendar text-success me-2"></i>
                                                                {new Date(
                                                                    acceptData.appointment_date
                                                                ).toLocaleDateString(
                                                                    "en-US",
                                                                    {
                                                                        weekday:
                                                                            "long",
                                                                        month: "long",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted small mb-2">
                                                                <i className="fas fa-calendar me-2"></i>
                                                                Select
                                                                appointment date
                                                            </div>
                                                        )}

                                                        {selectedSlot ? (
                                                            <div className="mb-2">
                                                                <i className="fas fa-clock text-info me-2"></i>
                                                                {selectedSlot.formatted_time ||
                                                                    formatTimeForDisplay(
                                                                        selectedSlot.time ||
                                                                            selectedSlot.start_time
                                                                    )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-muted small mb-2">
                                                                <i className="fas fa-clock me-2"></i>
                                                                Select
                                                                appointment time
                                                            </div>
                                                        )}

                                                        <div className="text-muted small">
                                                            <i className="fas fa-hourglass-half me-2"></i>
                                                            Duration:{" "}
                                                            {quote?.estimated_duration ||
                                                                1}{" "}
                                                            hour(s)
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Important Notice */}
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-2">
                                                    <i className="fas fa-info-circle text-info me-2"></i>
                                                    Important
                                                </h6>
                                                <ul className="list-unstyled small text-muted mb-0">
                                                    <li className="mb-1">
                                                        <i className="fas fa-check text-success me-2"></i>
                                                        Accepting this quote is
                                                        binding
                                                    </li>
                                                    <li className="mb-1">
                                                        <i className="fas fa-clock text-warning me-2"></i>
                                                        Provider will be
                                                        notified immediately
                                                    </li>
                                                    {acceptData.create_appointment && (
                                                        <li className="mb-1">
                                                            <i className="fas fa-calendar-check text-info me-2"></i>
                                                            Appointment will be
                                                            confirmed by
                                                            provider
                                                        </li>
                                                    )}
                                                    <li>
                                                        <i className="fas fa-phone text-primary me-2"></i>
                                                        Contact support for any
                                                        issues
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                className="btn btn-success"
                                disabled={loading || availabilityLoading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Accepting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check me-2"></i>
                                        Accept Quote
                                        {acceptData.create_appointment &&
                                            " & Create Appointment"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                /* Using CSS variables for consistent theming */
                .modal-xl {
                    max-width: 1200px;
                }
            `}</style>
        </div>
    );
};

export default AcceptQuoteModal;
