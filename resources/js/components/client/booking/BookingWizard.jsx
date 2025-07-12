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
    const [bookingData, setBookingData] = useState({
        service_id: service.id,
        provider_id: provider.id,
        date: "",
        time: "",
        duration: service.default_duration || 1,
        location: {
            type: "client_address",
            address: "",
            city: "",
            postal_code: "",
            instructions: "",
        },
        requirements: "",
        additional_services: [],
        contact_preference: "phone",
        total_price: service.price,
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
        // Only allow navigation to previous steps or current step
        if (stepId <= currentStep) {
            setCurrentStep(stepId);
        }
    };

    const updateBookingData = (updates) => {
        setBookingData((prev) => ({ ...prev, ...updates }));
    };

    const isStepComplete = (stepId) => {
        switch (stepId) {
            case 1:
                return bookingData.service_id && bookingData.provider_id;
            case 2:
                return bookingData.date && bookingData.time;
            case 3:
                return (
                    bookingData.location.address ||
                    bookingData.location.type !== "client_address"
                );
            case 4:
                return true;
            default:
                return false;
        }
    };

    return (
        <div className="booking-wizard">
            {/* Progress Steps */}
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
                                            step.id <= currentStep
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

            {/* Step Content */}
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
