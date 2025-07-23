import React, { useState, useEffect } from "react";
import TimeSelectionStep from "../booking/shared/TimeSelectionStep";
import DurationDetailsStep from "../booking/steps/DurationDetailsStep";
import LocationContactStep from "../booking/steps/LocationContactStep";
import AppointmentSummary from "../booking/shared/AppointmentSummary";
import appointmentService from "../../../services/appointmentService";

const AppointmentUpdateModal = ({
    show,
    onHide,
    appointment,
    onUpdateSuccess,
    mode = "auto", // 'edit', 'reschedule', 'auto'
}) => {
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    // Determine update mode based on appointment status
    const updateMode =
        mode === "auto"
            ? appointment.status === "pending"
                ? "edit"
                : "reschedule"
            : mode;

    // Initialize booking data with current appointment data
    const [bookingData, setBookingData] = useState({
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        duration_hours: appointment.duration_hours,
        total_price: appointment.total_price,
        location_type: appointment.location_type,
        client_address: appointment.client_address,
        client_city: appointment.client_city,
        client_postal_code: appointment.client_postal_code,
        location_instructions: appointment.location_instructions,
        client_phone: appointment.client_phone,
        client_email: appointment.client_email,
        contact_preference: appointment.contact_preference || "phone",
        client_notes: appointment.client_notes,
        payment_method: appointment.payment_method,
        special_requirements: appointment.client_notes || "",
        base_price: appointment.base_price || appointment.total_price,
    });

    const [originalData, setOriginalData] = useState(bookingData);
    const [hasChanges, setHasChanges] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // For reschedule reason
    const [rescheduleReason, setRescheduleReason] = useState("other");
    const [rescheduleNotes, setRescheduleNotes] = useState("");

    useEffect(() => {
        if (show) {
            setCurrentStep(1);
            setErrors({});

            const initialData = {
                appointment_date: appointment.appointment_date,
                appointment_time: appointment.appointment_time,
                duration_hours: appointment.duration_hours,
                total_price: appointment.total_price,
                location_type: appointment.location_type,
                client_address: appointment.client_address,
                client_city: appointment.client_city,
                client_postal_code: appointment.client_postal_code,
                location_instructions: appointment.location_instructions,
                client_phone: appointment.client_phone,
                client_email: appointment.client_email,
                contact_preference: appointment.contact_preference || "phone",
                client_notes: appointment.client_notes,
                payment_method: appointment.payment_method,
                special_requirements: appointment.client_notes || "",
                base_price: appointment.base_price || appointment.total_price,
            };

            setBookingData(initialData);
            setOriginalData(initialData);

            // Create selected slot from appointment data
            const slot = {
                date: appointment.appointment_date,
                time: appointment.appointment_time,
                formatted_date: formatDate(appointment.appointment_date),
                formatted_time: formatTime(appointment.appointment_time),
            };
            setSelectedSlot(slot);
        }
    }, [show, appointment]);

    // Check for changes
    useEffect(() => {
        const changes =
            JSON.stringify(bookingData) !== JSON.stringify(originalData);
        setHasChanges(changes);
    }, [bookingData, originalData]);

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

    const updateBookingData = (newData) => {
        setBookingData((prev) => ({ ...prev, ...newData }));

        // Clear related errors
        Object.keys(newData).forEach((key) => {
            if (errors[key]) {
                setErrors((prev) => ({ ...prev, [key]: null }));
            }
        });
    };

    // Step handlers
    const handleTimeStepComplete = (stepData) => {
        updateBookingData(stepData);

        // Update selected slot
        const slot = {
            date: stepData.appointment_date,
            time: stepData.appointment_time,
            formatted_date: formatDate(stepData.appointment_date),
            formatted_time: formatTime(stepData.appointment_time),
        };
        setSelectedSlot(slot);

        setCurrentStep(2);
    };

    const handleDurationStepComplete = (stepData) => {
        updateBookingData(stepData);
        setCurrentStep(3);
    };

    const handleLocationStepComplete = (stepData) => {
        updateBookingData(stepData);
        // Skip to submission since we don't need payment step for updates
        handleSubmit({ ...bookingData, ...stepData });
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleSubmit = async (finalData = bookingData) => {
        if (!hasChanges) return;

        setLoading(true);
        try {
            let result;

            if (updateMode === "edit") {
                // Direct update for pending appointments
                result = await appointmentService.updateAppointment(
                    appointment.id,
                    finalData
                );
            } else {
                // Reschedule request for confirmed appointments
                result = await appointmentService.requestReschedule(
                    appointment.id,
                    {
                        date: finalData.appointment_date,
                        time: finalData.appointment_time,
                        reason: rescheduleReason,
                        notes: rescheduleNotes || finalData.client_notes,
                        // Include updated contact and location info
                        client_phone: finalData.client_phone,
                        client_email: finalData.client_email,
                        client_address: finalData.client_address,
                        location_type: finalData.location_type,
                    }
                );
            }

            if (result.success) {
                onUpdateSuccess(result.data);
                onHide();

                const successMessage =
                    updateMode === "edit"
                        ? "Appointment updated successfully!"
                        : "Reschedule request submitted! The provider will respond within 24 hours.";

                // Show success message
                alert(successMessage);
            } else {
                setErrors({
                    general: result.message || "Failed to update appointment",
                });
            }
        } catch (error) {
            console.error("Update failed:", error);
            setErrors({
                general:
                    "Failed to update appointment. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading && hasChanges) {
            if (
                window.confirm(
                    "You have unsaved changes. Are you sure you want to close?"
                )
            ) {
                onHide();
            }
        } else {
            onHide();
        }
    };

    const getModalTitle = () => {
        if (updateMode === "edit") {
            return "Edit Appointment";
        } else {
            return "Request Reschedule";
        }
    };

    const getModalIcon = () => {
        if (updateMode === "edit") {
            return "fas fa-edit";
        } else {
            return "fas fa-calendar-alt";
        }
    };

    const handleRescheduleReasonChange = (e) => {
        setRescheduleReason(e.target.value);
    };

    const handleRescheduleNotesChange = (e) => {
        setRescheduleNotes(e.target.value);
    };

    const handleTimeSelectionContinue = () => {
        // Proceed to time selection after setting reschedule reason
        // The TimeSelectionStep will handle the next step progression
    };

    if (!show) return null;

    return (
        <>
            {/* Modal Backdrop */}
            <div
                className="modal-backdrop fade show"
                style={{ zIndex: 1040 }}
            />

            {/* Modal */}
            <div
                className="modal fade show d-block"
                style={{ zIndex: 1050 }}
                tabIndex="-1"
                role="dialog"
                aria-labelledby="appointmentUpdateModalTitle"
                aria-hidden="false"
            >
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5
                                    id="appointmentUpdateModalTitle"
                                    className="modal-title font-bold text-primary"
                                >
                                    <i className={`${getModalIcon()} me-2`} />
                                    {getModalTitle()}
                                </h5>
                                <p className="text-muted mb-0 small">
                                    {appointment.service?.title} -
                                    {updateMode === "edit"
                                        ? " Make changes to your appointment"
                                        : " Request new date/time"}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                                disabled={loading}
                                aria-label="Close modal"
                            />
                        </div>

                        {/* Body */}
                        <div className="modal-body p-0">
                            {errors.general && (
                                <div className="alert alert-danger m-3">
                                    <i className="fas fa-exclamation-triangle me-2" />
                                    {errors.general}
                                </div>
                            )}

                            {/* Update Mode Info */}
                            <div
                                className={`alert ${
                                    updateMode === "edit"
                                        ? "alert-info"
                                        : "alert-warning"
                                } m-3`}
                            >
                                <div className="d-flex align-items-center">
                                    <i
                                        className={`fas ${
                                            updateMode === "edit"
                                                ? "fa-info-circle"
                                                : "fa-clock"
                                        } me-2`}
                                    />
                                    <div>
                                        {updateMode === "edit" ? (
                                            <>
                                                <strong>Direct Edit Mode:</strong>{" "}
                                                Changes will be applied
                                                immediately since your
                                                appointment is still pending
                                                confirmation.
                                            </>
                                        ) : (
                                            <>
                                                <strong>
                                                    Reschedule Request Mode:
                                                </strong>{" "}
                                                Your appointment is confirmed, so
                                                changes require provider
                                                approval. You will receive a
                                                response within 24 hours.
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reschedule Reason for confirmed appointments */}
                            {updateMode === "reschedule" && currentStep === 1 && (
                                <div className="reschedule-reason-section mx-3 mb-3">
                                    <div className="card border-warning">
                                        <div className="card-body">
                                            <h6 className="fw-bold text-warning mb-3">
                                                <i className="fas fa-question-circle me-2" />
                                                Why do you need to reschedule?
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <label
                                                        htmlFor="rescheduleReason"
                                                        className="form-label"
                                                    >
                                                        Reason *
                                                    </label>
                                                    <select
                                                        id="rescheduleReason"
                                                        className="form-select"
                                                        value={rescheduleReason}
                                                        onChange={
                                                            handleRescheduleReasonChange
                                                        }
                                                        required
                                                    >
                                                        <option value="personal_emergency">
                                                            Personal emergency
                                                        </option>
                                                        <option value="work_conflict">
                                                            Work schedule conflict
                                                        </option>
                                                        <option value="travel_plans">
                                                            Travel plans changed
                                                        </option>
                                                        <option value="health_reasons">
                                                            Health reasons
                                                        </option>
                                                        <option value="weather_concerns">
                                                            Weather concerns
                                                        </option>
                                                        <option value="other">
                                                            Other reason
                                                        </option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6 mb-3">
                                                    <label
                                                        htmlFor="rescheduleNotes"
                                                        className="form-label"
                                                    >
                                                        Additional Notes
                                                    </label>
                                                    <textarea
                                                        id="rescheduleNotes"
                                                        className="form-control"
                                                        rows="2"
                                                        placeholder="Please explain why you need to reschedule..."
                                                        value={rescheduleNotes}
                                                        onChange={
                                                            handleRescheduleNotesChange
                                                        }
                                                        maxLength="500"
                                                    />
                                                    <small className="text-muted">
                                                        {rescheduleNotes.length}/500
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step Content */}
                            {currentStep === 1 && updateMode === "edit" && (
                                <TimeSelectionStep
                                    service={appointment.service}
                                    provider={appointment.provider}
                                    bookingData={bookingData}
                                    selectedSlot={selectedSlot}
                                    onStepComplete={handleTimeStepComplete}
                                />
                            )}

                            {currentStep === 1 && updateMode === "reschedule" && (
                                <TimeSelectionStep
                                    service={appointment.service}
                                    provider={appointment.provider}
                                    bookingData={bookingData}
                                    selectedSlot={selectedSlot}
                                    onStepComplete={handleTimeStepComplete}
                                />
                            )}

                            {currentStep === 2 && (
                                <DurationDetailsStep
                                    service={appointment.service}
                                    provider={appointment.provider}
                                    bookingData={bookingData}
                                    selectedSlot={selectedSlot}
                                    onStepComplete={handleDurationStepComplete}
                                    onPrevious={handlePrevious}
                                />
                            )}

                            {currentStep === 3 && (
                                <LocationContactStep
                                    service={appointment.service}
                                    provider={appointment.provider}
                                    bookingData={bookingData}
                                    selectedSlot={selectedSlot}
                                    onStepComplete={handleLocationStepComplete}
                                    onPrevious={handlePrevious}
                                    clientLocation={{
                                        city: bookingData.client_city,
                                        address: bookingData.client_address,
                                    }}
                                />
                            )}

                            {/* Changes Summary */}
                            {hasChanges && (
                                <div className="changes-summary mx-3 mb-3">
                                    <div className="card border-warning">
                                        <div className="card-header bg-warning bg-opacity-10 border-warning">
                                            <h6 className="fw-bold mb-0 text-warning">
                                                <i className="fas fa-exclamation-triangle me-2" />
                                                Pending Changes
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <small className="text-muted">
                                                You have unsaved changes to your
                                                appointment.
                                                {updateMode === "edit"
                                                    ? " Complete all steps to apply them."
                                                    : " Complete all steps to submit your reschedule request."}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer - Only show for reschedule reason step */}
                        {currentStep === 1 && updateMode === "reschedule" && (
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

                                    <button
                                        type="button"
                                        className="btn btn-warning"
                                        onClick={handleTimeSelectionContinue}
                                        disabled={!rescheduleReason}
                                    >
                                        Continue to Time Selection
                                        <i className="fas fa-arrow-right ms-2" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .modal-xl {
                    max-width: 1200px;
                }
                
                /* Enhanced modal scrolling */
                .modal-dialog {
                    margin: var(--space-4) auto;
                    max-height: calc(100vh - var(--space-8));
                }
                
                .modal-content {
                    max-height: calc(100vh - var(--space-8));
                    display: flex;
                    flex-direction: column;
                }
                
                .modal-body {
                    overflow-y: auto;
                    flex: 1;
                    padding: 0;
                }
                
                /* Ensure smooth scrolling */
                .modal-dialog, .modal-content, .modal-body {
                    scroll-behavior: smooth;
                }
                
                /* Focus management for accessibility */
                .modal.show .modal-dialog {
                    animation: modalFadeIn 0.3s ease-out;
                }
                
                @keyframes modalFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default AppointmentUpdateModal;
