import React, { useState } from "react";
import ServiceSelection from "./ServiceSelection";
import DateTimeSelection from "./DateTimeSelection";
import BookingDetails from "./BookingDetails";
import BookingConfirmation from "./BookingConfirmation";

const BookingWizard = ({
    service,
    provider,
    onComplete,
    onFullFlow,
    currentStep,
    setCurrentStep,
}) => {
    // Initialize booking data with normalized service structure
    const [bookingData, setBookingData] = useState({
        service_id: service.id,
        provider_id: provider.id,

        // Date and time (to be filled in step 2)
        date: "",
        time: "",
        appointment_date: "",
        appointment_time: "",

        // Service details with proper field mapping
        duration: service.duration_hours || service.default_duration || 1,
        duration_hours: service.duration_hours || service.default_duration || 1,

        // Pricing with consistent structure
        base_price: service.price || service.base_price || 0,
        total_price: service.price || service.base_price || 0,
        pricing_type: service.pricing_type || "fixed",

        // Service customization
        additional_services: [],
        requirements: "",
        special_instructions: "",

        // Location details (to be filled in step 3)
        location: {
            type: "client_address",
            address: "",
            city: "",
            postal_code: "",
            instructions: "",
        },
        client_address: "", // Laravel backend expects this field
        client_location: null, // For GPS coordinates
        client_notes: "",

        // Contact preferences (to be filled in step 3)
        contact_preference: "phone",
        phone: "",
        email: "",
        emergency_contact: "",

        // Booking type and payment
        request_quote: false,
        booking_type: "standard",
        payment_method: "cash",
        agreed_to_terms: false,

        // Additional fees
        estimated_travel_fee: 0,
        total_price_with_travel: service.price || service.base_price || 0,
    });

    const steps = [
        { id: 1, title: "Service", icon: "fas fa-concierge-bell" },
        { id: 2, title: "Date & Time", icon: "fas fa-calendar-alt" },
        { id: 3, title: "Details", icon: "fas fa-info-circle" },
        { id: 4, title: "Confirm", icon: "fas fa-check-circle" },
    ];

    const handleNext = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleStepClick = (stepId) => {
        // Only allow navigation to completed steps or current step
        if (stepId <= currentStep || isStepComplete(stepId - 1)) {
            setCurrentStep(stepId);
        }
    };

    // Enhanced update function with data validation
    const updateBookingData = (updates) => {
        // console.log("Updating booking data:", updates);

        setBookingData((prev) => {
            const newData = { ...prev, ...updates };

            // Auto-calculate total price when relevant fields change
            if (
                updates.duration !== undefined ||
                updates.base_price !== undefined ||
                updates.additional_services !== undefined
            ) {
                const basePrice = newData.base_price || service.price || 0;
                const duration = newData.duration || 1;
                const addOnsTotal = (newData.additional_services || []).reduce(
                    (sum, addon) => sum + (addon.price || 0),
                    0
                );
                const travelFee = newData.estimated_travel_fee || 0;

                newData.total_price = basePrice * duration + addOnsTotal;
                newData.total_price_with_travel =
                    newData.total_price + travelFee;
            }

            // Sync date/time fields for Laravel backend compatibility
            if (updates.date) {
                newData.appointment_date = updates.date;
            }
            if (updates.time) {
                newData.appointment_time = updates.time;
            }

            // Sync location fields
            if (updates.location?.address) {
                newData.client_address = updates.location.address;
            }

            // Sync notes fields
            if (updates.requirements) {
                newData.client_notes = updates.requirements;
            }

            // console.log("Updated booking data:", newData);
            return newData;
        });
    };

    // Enhanced step completion validation
    const isStepComplete = (stepId) => {
        switch (stepId) {
            case 1:
                return (
                    bookingData.service_id &&
                    bookingData.provider_id &&
                    bookingData.duration
                );
            case 2:
                return bookingData.date && bookingData.time;
            case 3:
                // Check if required location and contact info is provided
                if (
                    bookingData.location.type === "client_address" ||
                    bookingData.location.type === "custom_location"
                ) {
                    return (
                        bookingData.location.address &&
                        (bookingData.phone || bookingData.email)
                    );
                }
                return bookingData.phone || bookingData.email;
            case 4:
                return bookingData.agreed_to_terms;
            default:
                return false;
        }
    };

    return (
        <div className="booking-wizard">
            {/* Progress Steps with enhanced visual feedback */}
            <div className="wizard-header bg-light border-bottom p-4">
                <div className="steps-container">
                    <div className="row justify-content-center">
                        {steps.map((step, index) => (
                            <div key={step.id} className="col-auto">
                                <div
                                    className={`step-item d-flex align-items-center ${
                                        currentStep === step.id
                                            ? "active"
                                            : currentStep > step.id
                                            ? "completed"
                                            : "pending"
                                    }`}
                                    onClick={() => handleStepClick(step.id)}
                                    style={{
                                        cursor:
                                            step.id <= currentStep ||
                                            isStepComplete(step.id - 1)
                                                ? "pointer"
                                                : "default",
                                    }}
                                >
                                    <div
                                        className={`step-circle d-flex align-items-center justify-content-center ${
                                            currentStep === step.id
                                                ? "bg-purple text-white"
                                                : currentStep > step.id
                                                ? "bg-success text-white"
                                                : "bg-light text-muted"
                                        }`}
                                    >
                                        {currentStep > step.id ? (
                                            <i className="fas fa-check"></i>
                                        ) : (
                                            <i className={step.icon}></i>
                                        )}
                                    </div>
                                    <div className="step-info ms-2 d-none d-md-block">
                                        <div className="step-title fw-semibold">
                                            {step.title}
                                        </div>
                                        {/* Show completion indicator */}
                                        {isStepComplete(step.id) &&
                                            currentStep !== step.id && (
                                                <small className="text-success">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    Complete
                                                </small>
                                            )}
                                    </div>

                                    {/* Step Connector */}
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`step-connector ${
                                                currentStep > step.id
                                                    ? "completed"
                                                    : ""
                                            }`}
                                        ></div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Step Content with error boundaries */}
            <div className="wizard-content p-4">
                {currentStep === 1 && (
                    <ServiceSelection
                        service={service}
                        provider={provider}
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={handleNext}
                    />
                )}

                {currentStep === 2 && (
                    <DateTimeSelection
                        service={service}
                        provider={provider}
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                )}

                {currentStep === 3 && (
                    <BookingDetails
                        service={service}
                        provider={provider}
                        bookingData={bookingData}
                        updateBookingData={updateBookingData}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                )}

                {currentStep === 4 && (
                    <BookingConfirmation
                        service={service}
                        provider={provider}
                        bookingData={bookingData}
                        onComplete={onComplete}
                        onPrevious={handlePrevious}
                        onFullFlow={onFullFlow}
                    />
                )}
            </div>

            {/* Debug info (remove in production) */}
            {process.env.NODE_ENV === "development" && (
                <div className="debug-info bg-light p-2 mt-3">
                    <small className="text-muted">
                        Debug: Step {currentStep}, Service ID: {service.id},
                        Total Price: Rs. {bookingData.total_price_with_travel}
                    </small>
                </div>
            )}

            <style>{`
                .step-circle {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    font-size: 14px;
                }
                .step-connector {
                    width: 60px;
                    height: 2px;
                    background: #dee2e6;
                    margin: 0 1rem;
                }
                .step-connector.completed {
                    background: #28a745;
                }
                .step-item.active .step-title {
                    color: #6f42c1;
                }
                .step-item.completed .step-title {
                    color: #28a745;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
                @media (max-width: 768px) {
                    .step-connector {
                        width: 30px;
                        margin: 0 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BookingWizard;
