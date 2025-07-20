import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DurationDetailsStep from "./steps/DurationDetailsStep";
import LocationContactStep from "./steps/LocationContactStep";
import PaymentConfirmationStep from "./steps/PaymentConfirmationStep";
import TimeSelectionStep from "./shared/TimeSelectionStep";
import StepIndicator from "./shared/StepIndicator";

const BookingModal = ({ show, onHide, service, provider, selectedSlot }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [currentSelectedSlot, setCurrentSelectedSlot] =
        useState(selectedSlot);

    // Determine starting step based on whether time slot is pre-selected
    useEffect(() => {
        if (selectedSlot && selectedSlot.date && selectedSlot.time) {
            // If time is already selected, start with duration step
            setCurrentStep(1);
            setCurrentSelectedSlot(selectedSlot);
        } else {
            // If no time selected, start with time selection
            setCurrentStep(0); // Step 0 for time selection
        }
    }, [selectedSlot]);

    // Enhanced booking data state
    const [bookingData, setBookingData] = useState(() => ({
        // Service & Provider IDs
        service_id: service?.id,
        provider_id: provider?.id,

        // Time & Duration (from selected slot or empty)
        appointment_date: selectedSlot?.date || "",
        appointment_time: selectedSlot?.time || "",
        duration_hours: service?.duration_hours || 1,

        // Pricing
        base_price: service?.base_price || service?.price || 0,
        total_price:
            (service?.base_price || service?.price || 0) *
            (service?.duration_hours || 1),
        travel_fee: 0,

        // Location defaults
        location_type: "client_address",
        client_address: "",
        client_city: "",
        client_postal_code: "",
        location_instructions: "",

        // Contact defaults
        client_phone: "",
        client_email: "",
        contact_preference: "phone",
        emergency_contact: "",

        // Service details
        special_requirements: "",
        client_notes: "",

        // Booking metadata
        payment_method: "cash",
        agreed_to_terms: false,
        booking_source: "web_app_multi_step",
    }));

    const steps = [
        ...(selectedSlot
            ? []
            : [{ id: 0, title: "Select Time", icon: "fas fa-clock" }]),
        { id: 1, title: "Duration & Details", icon: "fas fa-hourglass-half" },
        { id: 2, title: "Location & Contact", icon: "fas fa-map-marker-alt" },
        { id: 3, title: "Payment & Confirm", icon: "fas fa-check-circle" },
    ];

    const updateBookingData = (updates) => {
        setBookingData((prev) => {
            const newData = { ...prev, ...updates };

            // Auto-calculate total price when relevant fields change
            if (
                updates.duration_hours !== undefined ||
                updates.base_price !== undefined
            ) {
                const basePrice =
                    newData.base_price ||
                    service?.base_price ||
                    service?.price ||
                    0;
                const duration = newData.duration_hours || 1;
                const travelFee = newData.travel_fee || 0;

                newData.total_price = basePrice * duration + travelFee;
            }

            return newData;
        });
    };

    const handleStepComplete = (stepData) => {
        updateBookingData(stepData);

        // Update selected slot if date/time is provided
        if (stepData.appointment_date || stepData.appointment_time) {
            const updatedSlot = {
                date: stepData.appointment_date || bookingData.appointment_date,
                time: stepData.appointment_time || bookingData.appointment_time,
                formatted_date: formatDate(
                    stepData.appointment_date || bookingData.appointment_date
                ),
                formatted_time: formatTime(
                    stepData.appointment_time || bookingData.appointment_time
                ),
            };
            setCurrentSelectedSlot(updatedSlot);
        }

        // Auto-advance to next step
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

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

    const handleBookingComplete = (completedBookingData) => {
        console.log("Booking completed:", completedBookingData);
        onHide();

        // Navigate based on booking result
        if (completedBookingData.success) {
            navigate("/client/appointments", {
                state: {
                    message: "Booking request sent successfully!",
                    appointment: completedBookingData.data,
                },
            });
        }
    };

    const canNavigateToStep = (stepId) => {
        // Can always go back to previous steps
        if (stepId < currentStep) return true;

        // Can go forward only if current step is valid
        switch (currentStep) {
            case 0: // Time selection
                return (
                    stepId <= 1 &&
                    bookingData.appointment_date &&
                    bookingData.appointment_time
                );
            case 1: // Duration
                return stepId <= 2 && bookingData.duration_hours >= 1;
            case 2: // Location & Contact
                return (
                    stepId <= 3 &&
                    (bookingData.client_phone || bookingData.client_email) &&
                    (bookingData.location_type !== "client_address" ||
                        bookingData.client_address)
                );
            case 3: // Final step
                return false;
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
            />

            {/* Modal */}
            <div className="modal fade show d-block" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-0">
                            <div className="modal-title-area flex-grow-1">
                                <h5 className="modal-title fw-bold mb-1">
                                    Book Service
                                </h5>
                                {/* <p className="text-muted mb-0 small">
                                    {service?.title} - {service?.category?.name}
                                </p> */}
                            </div>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                                aria-label="Close"
                            />
                        </div>

                        <div className="modal-body p-0">
                            {/* Progress Indicator */}
                            <div className="booking-progress bg-light border-bottom">
                                <div className="container-fluid py-3">
                                    <StepIndicator
                                        steps={steps}
                                        currentStep={currentStep}
                                        onStepClick={(stepId) => {
                                            if (canNavigateToStep(stepId)) {
                                                setCurrentStep(stepId);
                                            }
                                        }}
                                        canNavigateToStep={canNavigateToStep}
                                    />
                                </div>
                            </div>

                            {/* Selected Slot Banner (if applicable) */}
                            {currentSelectedSlot && currentStep > 0 && (
                                <div className="selected-slot-banner bg-light border-bottom">
                                    <div className="container-fluid py-2">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="selected-slot-info">
                                                <i className="fas fa-calendar-check text-success me-2" />
                                                <strong>Selected Time: </strong>
                                                <span className="text-purple fw-semibold">
                                                    {currentSelectedSlot.formatted_date ||
                                                        formatDate(
                                                            bookingData.appointment_date
                                                        )}{" "}
                                                    at{" "}
                                                    {currentSelectedSlot.formatted_time ||
                                                        formatTime(
                                                            bookingData.appointment_time
                                                        )}
                                                </span>
                                            </div>
                                            {/* {currentStep === 1 && (
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() =>
                                                        setCurrentStep(0)
                                                    }
                                                    title="Change selected date/time"
                                                >
                                                    <i className="fas fa-edit me-1" />
                                                    Change Time
                                                </button>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step Content */}
                            <div className="step-content">
                                {currentStep === 0 && (
                                    <TimeSelectionStep
                                        service={service}
                                        provider={provider}
                                        bookingData={bookingData}
                                        onStepComplete={handleStepComplete}
                                        selectedSlot={currentSelectedSlot}
                                    />
                                )}

                                {currentStep === 1 && (
                                    <DurationDetailsStep
                                        service={service}
                                        provider={provider}
                                        bookingData={bookingData}
                                        onStepComplete={handleStepComplete}
                                        onPrevious={() =>
                                            setCurrentStep(selectedSlot ? 1 : 0)
                                        }
                                        selectedSlot={
                                            selectedSlot || {
                                                date: bookingData.appointment_date,
                                                time: bookingData.appointment_time,
                                                formatted_date:
                                                    bookingData.appointment_date,
                                                formatted_time:
                                                    bookingData.appointment_time,
                                            }
                                        }
                                    />
                                )}

                                {currentStep === 2 && (
                                    <LocationContactStep
                                        service={service}
                                        provider={provider}
                                        bookingData={bookingData}
                                        onStepComplete={handleStepComplete}
                                        onPrevious={() => setCurrentStep(1)}
                                    />
                                )}

                                {currentStep === 3 && (
                                    <PaymentConfirmationStep
                                        service={service}
                                        provider={provider}
                                        bookingData={bookingData}
                                        onComplete={handleBookingComplete}
                                        onPrevious={() => setCurrentStep(2)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-purple { color: #6f42c1 !important; }
                .bg-purple { background-color: #6f42c1 !important; }
                .selected-slot-banner {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-left: 4px solid #6f42c1;
                }
                .booking-progress {
                    min-height: 80px;
                }
                .step-content {
                    min-height: 600px;
                }
                @media (max-width: 768px) {
                    .modal-dialog {
                        margin: 0;
                        max-width: 100%;
                        height: 100vh;
                    }
                    .modal-content {
                        height: 100vh;
                        border-radius: 0;
                    }
                }
            `}</style>
        </>
    );
};

export default BookingModal;
