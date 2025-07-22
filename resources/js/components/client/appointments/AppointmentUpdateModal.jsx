import React, { useState, useEffect } from "react";
import DateTimeSelection from "../booking/DateTimeSelection";
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
    });

    const [originalData, setOriginalData] = useState(bookingData);
    const [hasChanges, setHasChanges] = useState(false);

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
            };

            setBookingData(initialData);
            setOriginalData(initialData);
        }
    }, [show, appointment]);

    // Check for changes
    useEffect(() => {
        const changes =
            JSON.stringify(bookingData) !== JSON.stringify(originalData);
        setHasChanges(changes);
    }, [bookingData, originalData]);

    const updateBookingData = (newData) => {
        setBookingData((prev) => ({ ...prev, ...newData }));

        // Clear related errors
        Object.keys(newData).forEach((key) => {
            if (errors[key]) {
                setErrors((prev) => ({ ...prev, [key]: null }));
            }
        });
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!bookingData.appointment_date) {
                newErrors.appointment_date = "Please select a date";
            }
            if (!bookingData.appointment_time) {
                newErrors.appointment_time = "Please select a time";
            }
        }

        if (step === 2) {
            if (
                bookingData.location_type === "client_address" ||
                bookingData.location_type === "custom_location"
            ) {
                if (!bookingData.client_address?.trim()) {
                    newErrors.client_address = "Address is required";
                }
                if (!bookingData.client_city?.trim()) {
                    newErrors.client_city = "City is required";
                }
            }

            const hasPhone = bookingData.client_phone?.trim();
            const hasEmail = bookingData.client_email?.trim();

            if (!hasPhone && !hasEmail) {
                newErrors.contact = "Either phone number or email is required";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        setCurrentStep((prev) => prev + 1);
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1));
    };

    const handleSubmit = async () => {
        if (!validateStep(2) || !hasChanges) return;

        setLoading(true);
        try {
            let result;

            if (updateMode === "edit") {
                // Direct update for pending appointments
                result = await appointmentService.updateAppointment(
                    appointment.id,
                    bookingData
                );
            } else {
                // Reschedule request for confirmed appointments
                result = await appointmentService.requestReschedule(
                    appointment.id,
                    {
                        date: bookingData.appointment_date,
                        time: bookingData.appointment_time,
                        reason:
                            bookingData.reschedule_reason || "client_request",
                        notes: bookingData.client_notes,
                        // Include updated contact and location info
                        location_type: bookingData.location_type,
                        client_address: bookingData.client_address,
                        client_city: bookingData.client_city,
                        client_phone: bookingData.client_phone,
                        client_email: bookingData.client_email,
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
                general: "Failed to update appointment. Please try again.",
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

    const getActionButtonText = () => {
        if (loading) return "Saving...";
        if (updateMode === "edit") {
            return hasChanges ? "Save Changes" : "No Changes";
        } else {
            return hasChanges ? "Submit Reschedule Request" : "No Changes";
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
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header border-bottom">
                            <div>
                                <h5 className="modal-title fw-bold text-purple">
                                    <i className={`${getModalIcon()} me-2`}></i>
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
                            ></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body p-0">
                            {errors.general && (
                                <div className="alert alert-danger m-3">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
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
                                    ></i>
                                    <div>
                                        {updateMode === "edit" ? (
                                            <>
                                                <strong>
                                                    Direct Edit Mode:
                                                </strong>{" "}
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
                                                Your appointment is confirmed,
                                                so changes require provider
                                                approval. You'll receive a
                                                response within 24 hours.
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="container-fluid">
                                <div className="row">
                                    <div className="col-lg-8">
                                        {/* Step 1: Date & Time Selection */}
                                        {currentStep === 1 && (
                                            <div className="step-content">
                                                <DateTimeSelection
                                                    service={
                                                        appointment.service
                                                    }
                                                    provider={
                                                        appointment.provider
                                                    }
                                                    bookingData={bookingData}
                                                    updateBookingData={
                                                        updateBookingData
                                                    }
                                                    onNext={handleNext}
                                                    onPrevious={handleClose}
                                                />
                                            </div>
                                        )}

                                        {/* Step 2: Location & Contact */}
                                        {currentStep === 2 && (
                                            <div className="step-content">
                                                <LocationContactStep
                                                    service={
                                                        appointment.service
                                                    }
                                                    provider={
                                                        appointment.provider
                                                    }
                                                    bookingData={bookingData}
                                                    onStepComplete={() => {}} // We handle submit differently
                                                    onPrevious={handlePrevious}
                                                    clientLocation={{
                                                        city: bookingData.client_city,
                                                        address:
                                                            bookingData.client_address,
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Sidebar with Summary */}
                                    <div className="col-lg-4">
                                        <div
                                            className="position-sticky"
                                            style={{ top: "2rem" }}
                                        >
                                            <AppointmentSummary
                                                service={appointment.service}
                                                provider={appointment.provider}
                                                bookingData={bookingData}
                                                currentStep={currentStep}
                                                isSticky={false}
                                            />

                                            {/* Changes Summary */}
                                            {hasChanges && (
                                                <div className="card border-warning mt-3">
                                                    <div className="card-header bg-warning bg-opacity-10 border-warning">
                                                        <h6 className="fw-bold mb-0 text-warning">
                                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                                            Pending Changes
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <small className="text-muted">
                                                            You have unsaved
                                                            changes to your
                                                            appointment.
                                                            {updateMode ===
                                                            "edit"
                                                                ? " Click 'Save Changes' to apply them."
                                                                : " Click 'Submit Request' to send to provider."}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer border-top">
                            <div className="d-flex justify-content-between w-100">
                                <div>
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handlePrevious}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-arrow-left me-2"></i>
                                            Previous
                                        </button>
                                    )}
                                </div>

                                <div>
                                    {currentStep === 1 ? (
                                        <button
                                            type="button"
                                            className="btn btn-purple"
                                            onClick={handleNext}
                                            disabled={
                                                !bookingData.appointment_date ||
                                                !bookingData.appointment_time
                                            }
                                        >
                                            Continue to Details
                                            <i className="fas fa-arrow-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary me-2"
                                                onClick={handleClose}
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn btn-${
                                                    updateMode === "edit"
                                                        ? "success"
                                                        : "warning"
                                                }`}
                                                onClick={handleSubmit}
                                                disabled={
                                                    loading || !hasChanges
                                                }
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i
                                                            className={`fas ${
                                                                updateMode ===
                                                                "edit"
                                                                    ? "fa-save"
                                                                    : "fa-paper-plane"
                                                            } me-2`}
                                                        ></i>
                                                        {getActionButtonText()}
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
                .text-purple { color: #6f42c1 !important; }
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
                .step-content {
                    padding: 2rem 0;
                }
                .modal-xl {
                    max-width: 1200px;
                }
            `}</style>
        </>
    );
};

export default AppointmentUpdateModal;
