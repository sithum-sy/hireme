import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import clientService from "../../../services/clientService";
import DurationDetailsStep from "./steps/DurationDetailsStep";
import LocationContactStep from "./steps/LocationContactStep";
import PaymentConfirmationStep from "./steps/PaymentConfirmationStep";
import TimeSelectionStep from "./shared/TimeSelectionStep";
import StepIndicator from "./shared/StepIndicator";

const BookingModal = ({
    show,
    onHide,
    service,
    provider,
    selectedSlot,
    clientLocation,
    quoteId = null, // Optional quote ID for quote acceptance bookings
    onQuoteAccepted = null, // Callback when quote is accepted
}) => {
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
        client_location: clientLocation,
        client_address: "",
        client_city: clientLocation?.city || "",
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
        booking_source: quoteId ? "quote_acceptance" : "web_app_multi_step",
        quote_id: quoteId, // Include quote ID if this is a quote acceptance
    }));

    const steps = [
        ...(selectedSlot
            ? []
            : [{ id: 0, title: "Select Time", icon: "fas fa-clock" }]),
        { id: 1, title: "Duration & Details", icon: "fas fa-hourglass-half" },
        { id: 2, title: "Location & Contact", icon: "fas fa-map-marker-alt" },
        { id: 3, title: "Payment & Confirm", icon: "fas fa-check-circle" },
    ];

    const updateBookingData = (newData) => {
        // console.log("BookingModal: Updating booking data with:", newData);
        setBookingData((prev) => {
            const updated = { ...prev, ...newData };
            // console.log("BookingModal: Updated booking data:", updated);
            return updated;
        });
    };

    // Scroll to top of modal when step changes
    const scrollModalToTop = () => {
        // Use a small delay to ensure DOM is updated
        setTimeout(() => {
            try {
                // Try multiple selectors to ensure we catch the modal
                const selectors = [
                    ".modal-body",
                    ".modal-dialog",
                    ".modal-content",
                    ".step-content",
                    ".modal.show",
                ];

                let scrollPerformed = false;

                selectors.forEach((selector) => {
                    const element = document.querySelector(selector);
                    if (element && element.scrollTo) {
                        element.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                        scrollPerformed = true;
                    }
                });

                // Also scroll the main window to ensure modal header is visible
                const modalDialog = document.querySelector(".modal-dialog");
                if (modalDialog && modalDialog.scrollIntoView) {
                    modalDialog.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                }

                // Fallback for older browsers or when smooth scrolling fails
                if (!scrollPerformed) {
                    const modalBody = document.querySelector(".modal-body");
                    if (modalBody) {
                        modalBody.scrollTop = 0;
                    }
                    window.scrollTo(0, 0);
                }

                // Debug logging (remove in production)
            } catch (error) {
                // Fallback scrolling if anything fails
                console.warn("Smooth scrolling failed, using fallback:", error);
                try {
                    const modalBody = document.querySelector(".modal-body");
                    if (modalBody) {
                        modalBody.scrollTop = 0;
                    }
                    window.scrollTo(0, 0);
                } catch (fallbackError) {
                    console.error(
                        "All scrolling methods failed:",
                        fallbackError
                    );
                }
            }
        }, 100);
    };

    useEffect(() => {
        scrollModalToTop();
    }, [currentStep]);

    // Scroll to top when modal first opens
    useEffect(() => {
        if (show) {
            scrollModalToTop();
        }
    }, [show]);

    const handleStepComplete = (stepData) => {
        // console.log("BookingModal: Step completed with data:", stepData);

        // Validate step data before updating
        if (!stepData) {
            console.error("BookingModal: No step data provided");
            return;
        }

        // Update booking data
        updateBookingData(stepData);

        // Preserve slot data when updating
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
            // console.log("BookingModal: Updated selected slot:", updatedSlot);
        }

        // Proper step advancement with validation
        if (currentStep === 2) {
            // Validate location and contact data before proceeding to payment
            const hasValidLocation =
                stepData.location_type === "provider_location" ||
                (stepData.client_address && stepData.client_city);
            const hasValidContact =
                (stepData.client_phone && stepData.client_phone.trim()) ||
                (stepData.client_email && stepData.client_email.trim());

            if (!hasValidLocation) {
                console.error("BookingModal: Invalid location data");
                return;
            }

            if (!hasValidContact) {
                console.error("BookingModal: Invalid contact data");
                return;
            }

            // console.log(
            //     "Step 2 validation passed, advancing to step 3"
            // );
        }

        // Auto-advance to next step
        const nextStep = Math.min(currentStep + 1, 3);
        setCurrentStep(nextStep);

        // Scroll to top will be handled by useEffect when currentStep changes

        // console.log(
        //     "BookingModal: Advancing from step",
        //     currentStep,
        //     "to step",
        //     nextStep
        // );
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

    const handleBookingComplete = async (result) => {
        try {
            // Check if booking was successful
            if (result && result.success) {
                // console.log("BookingModal: Booking completed successfully");

                // If this was a quote acceptance, try to update the quote status
                if (quoteId && onQuoteAccepted) {
                    try {
                        // console.log("Attempting to accept quote:", quoteId);
                        const quoteUpdateResult =
                            await clientService.acceptQuote(quoteId, {
                                appointment_id:
                                    result.data?.id || result.appointment?.id,
                                notes: "Quote accepted through booking process",
                            });

                        if (quoteUpdateResult.success) {
                            // console.log("Quote status updated successfully");
                            onQuoteAccepted(quoteUpdateResult.data);
                        } else {
                            // console.log("Quote update message:", quoteUpdateResult.message);
                            // If quote cannot be accepted (likely already accepted), that's OK
                            // The appointment was still created successfully
                            if (
                                quoteUpdateResult.message &&
                                quoteUpdateResult.message.includes(
                                    "cannot be accepted"
                                )
                            ) {
                                // console.log("Quote was likely already accepted during appointment creation - this is normal");
                            }
                        }
                    } catch (quoteError) {
                        // console.log("Quote update error (non-critical):", quoteError);
                        // Don't throw this error as the appointment was still created successfully
                    }
                }

                // Close the modal
                onHide();

                // Show toast notification
                const message = quoteId
                    ? "Quote accepted and appointment created successfully!"
                    : result.message ||
                      "Booking request submitted successfully!";

                toast.success(message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Navigate to appointments page with success message
                navigate("/client/appointments", {
                    state: {
                        message: message,
                        type: "success",
                        appointment: result.data || result.appointment,
                        fromBooking: true,
                        quoteAccepted: !!quoteId,
                    },
                });
            } else {
                // Handle booking failure
                console.error("BookingModal: Booking failed:", result);
                onHide();
            }
        } catch (error) {
            console.error("BookingModal: Booking completion failed:", error);
            onHide();
        }
    };

    useEffect(() => {
        if (selectedSlot && selectedSlot.date && selectedSlot.time) {
            // console.log(
            //     "BookingModal: Updating booking data with selected slot:",
            //     selectedSlot
            // );

            setCurrentSelectedSlot(selectedSlot);
            updateBookingData({
                appointment_date: selectedSlot.date,
                appointment_time: selectedSlot.time,
            });

            // Start with duration step since time is already selected
            setCurrentStep(1);
        } else {
            // Start with time selection if no slot is pre-selected
            setCurrentStep(0);
        }
    }, [selectedSlot]);

    // Helper function to check if step is valid
    const isStepValid = (stepNumber) => {
        switch (stepNumber) {
            case 1:
                return (
                    bookingData.appointment_date && bookingData.appointment_time
                );
            case 2:
                const hasLocation =
                    bookingData.location_type === "provider_location" ||
                    (bookingData.client_address && bookingData.client_city);
                const hasContact =
                    (bookingData.client_phone &&
                        bookingData.client_phone.trim()) ||
                    (bookingData.client_email &&
                        bookingData.client_email.trim());
                return hasLocation && hasContact;
            case 3:
                return bookingData.agreed_to_terms;
            default:
                return false;
        }
    };

    if (!show) return null;

    // const canNavigateToStep = (stepId) => {
    //     // Can always go back to previous steps
    //     if (stepId < currentStep) return true;

    //     // Can go forward only if current step is valid
    //     switch (currentStep) {
    //         case 0: // Time selection
    //             return (
    //                 stepId <= 1 &&
    //                 bookingData.appointment_date &&
    //                 bookingData.appointment_time
    //             );
    //         case 1: // Duration
    //             return stepId <= 2 && bookingData.duration_hours >= 1;
    //         case 2: // Location & Contact
    //             return (
    //                 stepId <= 3 &&
    //                 (bookingData.client_phone || bookingData.client_email) &&
    //                 (bookingData.location_type !== "client_address" ||
    //                     bookingData.client_address)
    //             );
    //         case 3: // Final step
    //             return false;
    //         default:
    //             return false;
    //     }
    // };

    if (!show) return null;

    return (
        <div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    {/* Modal Header */}
                    <div className="modal-header border-bottom-0">
                        <div className="modal-title-area flex-grow-1">
                            <h5 className="modal-title fw-bold mb-1">
                                Book Service
                            </h5>
                            <div className="step-indicator">
                                <span className="text-muted small">
                                    Step {currentStep} of 3
                                </span>
                                <div
                                    className="progress mt-1"
                                    style={{ height: "3px" }}
                                >
                                    <div
                                        className="progress-bar bg-primary"
                                        style={{
                                            width: `${
                                                (currentStep / 3) * 100
                                            }%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onHide}
                        />
                    </div>

                    <div className="modal-body p-0">
                        {/* Selected Slot Banner */}
                        {currentSelectedSlot && currentStep > 0 && (
                            <div className="selected-slot-banner bg-light border-bottom">
                                <div className="container-fluid py-2">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="selected-slot-info">
                                            <i className="fas fa-calendar-check text-success me-2" />
                                            <strong>Selected Time: </strong>
                                            <span className="text-primary fw-semibold">
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
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step Content */}
                        <div className="step-content">
                            {currentStep === 1 && (
                                <DurationDetailsStep
                                    service={service}
                                    provider={provider}
                                    bookingData={bookingData}
                                    onStepComplete={handleStepComplete}
                                    onPrevious={() => {
                                        setCurrentStep(onHide);
                                    }}
                                    selectedSlot={currentSelectedSlot}
                                    clientLocation={clientLocation}
                                />
                            )}

                            {currentStep === 2 && (
                                <LocationContactStep
                                    service={service}
                                    provider={provider}
                                    bookingData={bookingData}
                                    onStepComplete={handleStepComplete}
                                    onPrevious={() => {
                                        setCurrentStep(1);
                                        // Scroll will be handled by useEffect
                                    }}
                                    clientLocation={clientLocation}
                                    selectedSlot={currentSelectedSlot}
                                />
                            )}

                            {currentStep === 3 && (
                                <PaymentConfirmationStep
                                    service={service}
                                    provider={provider}
                                    bookingData={bookingData}
                                    onComplete={handleBookingComplete}
                                    onPrevious={() => {
                                        setCurrentStep(2);
                                        // Scroll will be handled by useEffect
                                    }}
                                    clientLocation={clientLocation}
                                    selectedSlot={currentSelectedSlot}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .bg-primary { background-color: var(--current-role-primary) !important; }
                .text-primary { color: var(--current-role-primary) !important; }
                .progress-bar.bg-primary { background-color: var(--current-role-primary) !important; }
                
                /* Enhanced modal scrolling */
                .modal-dialog {
                    margin: 1rem auto;
                    max-height: calc(100vh - 2rem);
                }
                
                .modal-content {
                    max-height: calc(100vh - 2rem);
                    display: flex;
                    flex-direction: column;
                }
                
                .modal-body {
                    overflow-y: auto;
                    flex: 1;
                    padding: 0;
                }
                
                .step-content {
                    min-height: 400px;
                }
                
                /* Ensure smooth scrolling on all elements */
                .modal-dialog, .modal-content, .modal-body, .step-content {
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
        </div>
    );
};

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

export default BookingModal;
