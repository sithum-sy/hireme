import React, { useState, useEffect } from "react";
import ServiceSelection from "./ServiceSelection";
import DateTimeSelection from "./DateTimeSelection";
import BookingDetails from "./BookingDetails";
import BookingConfirmation from "./BookingConfirmation";

const BookingWizard = ({
    service,
    provider,
    onComplete,
    onFullFlow,
    currentStep = 1,
    setCurrentStep,
    initialData = {},
}) => {
    if (!service?.id) {
        console.error("BookingWizard: Service must have an ID", service);
        return (
            <div className="alert alert-danger">
                <h4>Configuration Error</h4>
                <p>
                    Service information is incomplete. Service ID is required.
                </p>
                <pre>Service data: {JSON.stringify(service, null, 2)}</pre>
            </div>
        );
    }

    if (!provider?.id) {
        console.error("BookingWizard: Provider must have an ID", provider);
        return (
            <div className="alert alert-danger">
                <h4>Configuration Error</h4>
                <p>
                    Provider information is incomplete. Provider ID is required.
                </p>
            </div>
        );
    }

    // Initialize booking data with normalized service structure
    // const [bookingData, setBookingData] = useState({
    //     service_id: service?.id || initialData.service_id,
    //     provider_id: provider?.id || initialData.provider_id,

    //     // Date and time (to be filled in step 2)
    //     date: "",
    //     time: "",
    //     appointment_date: "",
    //     appointment_time: "",

    //     // Service details with proper field mapping
    //     duration: service.duration_hours || service.default_duration || 1,
    //     duration_hours: service.duration_hours || service.default_duration || 1,

    //     // Pricing with consistent structure
    //     base_price: service.price || service.base_price || 0,
    //     total_price: service.price || service.base_price || 0,
    //     pricing_type: service.pricing_type || "fixed",

    //     // Service customization
    //     additional_services: [],
    //     requirements: "",
    //     special_instructions: "",

    //     // Location details (to be filled in step 3)
    //     location: {
    //         type: "client_address",
    //         address: "",
    //         city: "",
    //         postal_code: "",
    //         instructions: "",
    //     },
    //     client_address: "", // Laravel backend expects this field
    //     client_location: null, // For GPS coordinates
    //     client_notes: "",

    //     // Contact preferences (to be filled in step 3)
    //     contact_preference: "phone",
    //     phone: "",
    //     email: "",
    //     emergency_contact: "",

    //     // Booking type and payment
    //     request_quote: false,
    //     booking_type: "standard",
    //     payment_method: "cash",
    //     agreed_to_terms: false,

    //     // Additional fees
    //     estimated_travel_fee: 0,
    //     total_price_with_travel: service.price || service.base_price || 0,

    //     ...initialData,
    // });
    const [bookingData, setBookingData] = useState(() => {
        // Create the base state first
        const baseState = {
            // Ensure these core IDs are always set first
            service_id: service?.id || initialData.service_id,
            provider_id: provider?.id || initialData.provider_id,

            // Other default values
            appointment_date: "",
            appointment_time: "",
            duration: service?.duration_hours || 1,
            duration_hours: service?.duration_hours || 1,
            total_price: service?.price || service?.base_price || 0,
            base_price: service?.price || service?.base_price || 0,
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

            // Booking metadata
            additional_services: [],
            client_notes: "",
            special_instructions: "",
            payment_method: "",
            agreed_to_terms: false,
            booking_source: "web_app",
            booking_type: "standard",
            status: "pending_confirmation",
            timezone: "Asia/Colombo",
            user_agent: navigator.userAgent,
        };

        // Merge with initialData
        const mergedState = { ...baseState, ...initialData };

        // Ensure critical IDs are not overridden to undefined
        if (!mergedState.service_id && service?.id) {
            mergedState.service_id = service.id;
        }
        if (!mergedState.provider_id && provider?.id) {
            mergedState.provider_id = provider.id;
        }

        console.log("BookingWizard initialized with:", mergedState);
        console.log("Quote-related fields in initial state:", {
            quote_id: mergedState.quote_id,
            isFromQuote: mergedState.isFromQuote,
            booking_source: mergedState.booking_source,
        });

        return mergedState;
    });

    // Add a validation check
    useEffect(() => {
        if (!bookingData.service_id) {
            console.error("Service ID is missing! Service:", service);
            setBookingData((prev) => ({
                ...prev,
                service_id: service?.id,
            }));
        }
        if (!bookingData.provider_id) {
            console.error("Provider ID is missing! Provider:", provider);
            setBookingData((prev) => ({
                ...prev,
                provider_id: provider?.id,
            }));
        }
    }, [service, provider]);

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
    // const updateBookingData = (updates) => {
    //     // console.log("Updating booking data:", updates);

    //     setBookingData((prev) => {
    //         const newData = { ...prev, ...updates };

    //         // Auto-calculate total price when relevant fields change
    //         if (
    //             updates.duration !== undefined ||
    //             updates.base_price !== undefined ||
    //             updates.additional_services !== undefined
    //         ) {
    //             const basePrice = newData.base_price || service.price || 0;
    //             const duration = newData.duration || 1;
    //             const addOnsTotal = (newData.additional_services || []).reduce(
    //                 (sum, addon) => sum + (addon.price || 0),
    //                 0
    //             );
    //             const travelFee = newData.estimated_travel_fee || 0;

    //             newData.total_price = basePrice * duration + addOnsTotal;
    //             newData.total_price_with_travel =
    //                 newData.total_price + travelFee;
    //         }

    //         // Sync date/time fields for Laravel backend compatibility
    //         if (updates.date) {
    //             newData.appointment_date = updates.date;
    //         }
    //         if (updates.time) {
    //             newData.appointment_time = updates.time;
    //         }

    //         // Sync location fields
    //         if (updates.location?.address) {
    //             newData.client_address = updates.location.address;
    //         }

    //         // Sync notes fields
    //         if (updates.requirements) {
    //             newData.client_notes = updates.requirements;
    //         }

    //         // console.log("Updated booking data:", newData);
    //         return newData;
    //     });
    // };
    const updateBookingData = (updates) => {
        console.log("UpdateBookingData called with:", updates);
        console.log("Current initialData:", initialData);

        setBookingData((prev) => {
            console.log("Previous bookingData:", prev);

            const newData = { ...prev, ...updates };

            // Ensure service_id and provider_id are never lost
            if (!newData.service_id && service?.id) {
                newData.service_id = service.id;
            }
            if (!newData.provider_id && provider?.id) {
                newData.provider_id = provider.id;
            }

            // IMPORTANT: Preserve quote-related data
            if (initialData.quote_id && !newData.quote_id) {
                console.log("Preserving quote_id:", initialData.quote_id);
                newData.quote_id = initialData.quote_id;
            }
            if (initialData.isFromQuote && newData.isFromQuote === undefined) {
                console.log("Preserving isFromQuote:", initialData.isFromQuote);
                newData.isFromQuote = initialData.isFromQuote;
            }
            if (initialData.booking_source && !newData.booking_source) {
                console.log(
                    "Preserving booking_source:",
                    initialData.booking_source
                );
                newData.booking_source = initialData.booking_source;
            }

            // Rest of your existing logic...
            if (updates.duration !== undefined) {
                newData.duration = parseFloat(updates.duration);
                newData.duration_hours = parseFloat(updates.duration);
            }

            if (updates.total_price !== undefined) {
                newData.total_price = parseFloat(updates.total_price);
            }

            if (updates.base_price !== undefined) {
                newData.base_price = parseFloat(updates.base_price);
            }

            if (updates.travel_fee !== undefined) {
                newData.travel_fee = parseFloat(updates.travel_fee);
            }

            // Auto-calculate total price when relevant fields change
            if (
                updates.duration !== undefined ||
                updates.base_price !== undefined ||
                updates.additional_services !== undefined
            ) {
                const basePrice =
                    newData.base_price ||
                    service?.price ||
                    service?.base_price ||
                    0;
                const duration = newData.duration || 1;
                const addOnsTotal = (newData.additional_services || []).reduce(
                    (sum, addon) => sum + parseFloat(addon.price || 0),
                    0
                );
                const travelFee = parseFloat(newData.travel_fee || 0);

                newData.total_price =
                    parseFloat(basePrice) * parseFloat(duration) +
                    addOnsTotal +
                    travelFee;
            }

            console.log("Final newData:", newData);
            console.log("Quote-related fields after update:", {
                quote_id: newData.quote_id,
                isFromQuote: newData.isFromQuote,
                booking_source: newData.booking_source,
            });

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
                    bookingData.location_type === "client_address" ||
                    bookingData.location_type === "custom_location"
                ) {
                    return (
                        bookingData.client_address &&
                        (bookingData.client_phone || bookingData.client_email)
                    );
                }
                return bookingData.client_phone || bookingData.client_email;
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
