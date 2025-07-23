import React, { useState, useEffect } from "react";
import clientAvailabilityService from "../../../../services/clientAvailabilityService";
import AppointmentSummary from "../shared/AppointmentSummary";

const DurationDetailsStep = ({
    service,
    provider,
    bookingData,
    onStepComplete,
    onPrevious,
    selectedSlot,
}) => {
    const [duration, setDuration] = useState(() => {
        const initialDuration =
            bookingData.duration_hours || service?.duration_hours || 1;
        return Math.round(Number(initialDuration)); // Ensure it's a whole number
    });
    const [maxDuration, setMaxDuration] = useState(8);
    const [specialRequirements, setSpecialRequirements] = useState(
        bookingData.special_requirements || ""
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Calculate max duration based on provider availability
    useEffect(() => {
        if (selectedSlot?.date && selectedSlot?.time) {
            calculateMaxDuration();
        }
    }, [selectedSlot, provider.id]);

    const calculateMaxDuration = async () => {
        setLoading(true);
        try {
            const response = await clientAvailabilityService.getProviderWorkingHours(
                provider.id,
                selectedSlot.date
            );

            if (response.success && response.data.is_available) {
                const maxHours = calculateHoursBetween(
                    selectedSlot.time,
                    response.data.end_time
                );
                setMaxDuration(Math.min(maxHours, 12)); // Cap at 12 hours
                console.log(
                    "Calculated max duration:",
                    Math.min(maxHours, 12)
                );
            } else {
                // Provider not available, set a default duration
                setMaxDuration(8);
            }
        } catch (error) {
            console.warn("Could not calculate max duration:", error);
            setMaxDuration(8); // Fallback to 8 hours
        } finally {
            setLoading(false);
        }
    };

    const calculateHoursBetween = (startTime, endTime) => {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        return Math.floor((end - start) / (1000 * 60 * 60));
    };

    const handleDurationChange = (newDuration) => {
        const integerDuration = Math.round(Number(newDuration));
        const validDuration = Math.max(
            1,
            Math.min(maxDuration, integerDuration)
        );

        // console.log("Duration change:", {
        //     input: newDuration,
        //     integer: integerDuration,
        //     valid: validDuration,
        // });

        setDuration(validDuration);
        setErrors((prev) => ({ ...prev, duration: null }));
    };

    const incrementDuration = () => {
        const newDuration = duration + 1;
        if (newDuration <= maxDuration) {
            handleDurationChange(newDuration);
        }
    };

    const decrementDuration = () => {
        const newDuration = duration - 1;
        if (newDuration >= 1) {
            handleDurationChange(newDuration);
        }
    };

    const validateAndContinue = () => {
        const newErrors = {};

        if (duration < 1) {
            newErrors.duration = "Duration must be at least 1 hour";
        } else if (duration > maxDuration) {
            newErrors.duration = `Duration cannot exceed ${maxDuration} hours`;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Calculate pricing
        const basePrice = service?.base_price || service?.price || 0;
        const totalPrice = Math.round(basePrice * duration);

        const stepData = {
            duration_hours: duration,
            total_price: totalPrice,
            special_requirements: specialRequirements.trim(),
            client_notes: specialRequirements.trim(),
        };

        onStepComplete(stepData);
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
            minimumFractionDigits: 0,
        })
            .format(amount)
            .replace("LKR", "Rs.");
    };

    const basePrice = service?.base_price || service?.price || 0;
    const totalPrice = Math.round(basePrice * duration);

    return (
        <div className="duration-details-step">
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-lg-8">
                        {/* Selected Service Summary */}
                        <div className="service-summary mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h5 className="fw-bold text-primary mb-2">
                                                {service?.title} by{" "}
                                                {provider?.business_name}
                                            </h5>
                                            <span
                                                className={`badge bg-${
                                                    service.category.color ||
                                                    "primary"
                                                }`}
                                            >
                                                <i
                                                    className={`${service.category.icon} me-1`}
                                                ></i>
                                                {service.category.name}
                                            </span>
                                            <p className="text-muted mb-2">
                                                {service?.description}
                                            </p>

                                            {/* Selected Time Display */}
                                            {/* <div className="selected-time-info">
                                                <div className="d-flex align-items-center mb-2">
                                                    <i className="fas fa-calendar text-success me-2" />
                                                    <span className="fw-semibold">
                                                        {selectedSlot?.formatted_date ||
                                                            bookingData.appointment_date}
                                                    </span>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-clock text-info me-2" />
                                                    <span className="fw-semibold">
                                                        {selectedSlot?.formatted_time ||
                                                            bookingData.appointment_time}
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-link text-primary"
                                                        onClick={onPrevious}
                                                    >
                                                        Change Time
                                                    </button>
                                                </div>
                                            </div> */}
                                        </div>

                                        <div className="col-md-4 text-end">
                                            {service?.first_image_url && (
                                                <img
                                                    src={
                                                        service.first_image_url
                                                    }
                                                    alt={service.title}
                                                    className="service-thumbnail rounded"
                                                    style={{
                                                        width: "100px",
                                                        height: "100px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Duration Selection */}
                        <div className="duration-selection mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">
                                        <i className="fas fa-hourglass-half text-primary me-2" />
                                        How many hours do you need?
                                    </h6>

                                    {loading && (
                                        <div className="text-center py-3">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            >
                                                <span className="visually-hidden">
                                                    Loading...
                                                </span>
                                            </div>
                                            <div className="mt-2 text-muted">
                                                Calculating available time...
                                            </div>
                                        </div>
                                    )}

                                    {!loading && (
                                        <>
                                            {/* Duration Controls */}
                                            <div className="duration-controls mb-4">
                                                <div className="row align-items-center">
                                                    <div className="col-md-6">
                                                        <div className="d-flex align-items-center justify-content-center">
                                                            <button
                                                                className="btn btn-outline-secondary duration-btn"
                                                                onClick={
                                                                    decrementDuration
                                                                }
                                                                disabled={
                                                                    duration <=
                                                                    1
                                                                }
                                                                type="button"
                                                            >
                                                                <i className="fas fa-minus" />
                                                            </button>

                                                            <div className="duration-display mx-4 text-center">
                                                                <div className="duration-number display-6 fw-bold text-primary">
                                                                    {duration}
                                                                </div>
                                                                <div className="duration-unit text-muted">
                                                                    {duration >
                                                                    1
                                                                        ? "hours"
                                                                        : "hour"}
                                                                </div>
                                                            </div>

                                                            <button
                                                                className="btn btn-outline-secondary duration-btn"
                                                                onClick={
                                                                    incrementDuration
                                                                }
                                                                disabled={
                                                                    duration >=
                                                                    maxDuration
                                                                }
                                                                type="button"
                                                            >
                                                                <i className="fas fa-plus" />
                                                            </button>
                                                        </div>

                                                        <div className="text-center mt-2">
                                                            <small className="text-muted">
                                                                Maximum
                                                                available:{" "}
                                                                {maxDuration}{" "}
                                                                {maxDuration > 1
                                                                    ? "hours"
                                                                    : "hour"}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    <div className="col-md-6">
                                                        <div className="price-calculation p-3 bg-light rounded">
                                                            <div className="price-breakdown">
                                                                <div className="d-flex justify-content-between mb-2">
                                                                    <span>
                                                                        Base
                                                                        rate per
                                                                        hour:
                                                                    </span>
                                                                    <span>
                                                                        {formatPrice(
                                                                            basePrice
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <div className="d-flex justify-content-between mb-2">
                                                                    <span>
                                                                        Duration:
                                                                    </span>
                                                                    <span>
                                                                        {
                                                                            duration
                                                                        }{" "}
                                                                        {duration >
                                                                        1
                                                                            ? "hours"
                                                                            : "hour"}
                                                                    </span>
                                                                </div>
                                                                <hr />
                                                                <div className="d-flex justify-content-between fw-bold">
                                                                    <span>
                                                                        Total:
                                                                    </span>
                                                                    <span className="text-primary h5 mb-0">
                                                                        {formatPrice(
                                                                            totalPrice
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Quick Duration Presets */}
                                            <div className="duration-presets mb-4">
                                                <div className="row g-2">
                                                    {[1, 2, 3, 4, 6, 8]
                                                        .filter(
                                                            (h) =>
                                                                h <= maxDuration
                                                        )
                                                        .map((hours) => (
                                                            <div
                                                                key={hours}
                                                                className="col-4 col-md-2"
                                                            >
                                                                <button
                                                                    className={`btn w-100 ${
                                                                        duration ===
                                                                        hours
                                                                            ? "btn-primary"
                                                                            : "btn-outline-secondary"
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleDurationChange(
                                                                            hours
                                                                        )
                                                                    }
                                                                    type="button"
                                                                >
                                                                    {hours}h
                                                                </button>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                            {/* Error Display */}
                                            {errors.duration && (
                                                <div className="alert alert-danger">
                                                    <i className="fas fa-exclamation-triangle me-2" />
                                                    {errors.duration}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Special Requirements */}
                        <div className="special-requirements mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">
                                        <i className="fas fa-clipboard-list text-primary me-2" />
                                        Special Requirements{" "}
                                        <span className="text-muted fw-normal">
                                            (Optional)
                                        </span>
                                    </h6>

                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Any specific requirements, preferences, or important details the provider should know..."
                                        value={specialRequirements}
                                        onChange={(e) =>
                                            setSpecialRequirements(
                                                e.target.value
                                            )
                                        }
                                        maxLength={1000}
                                    />

                                    <div className="d-flex justify-content-between mt-2">
                                        <small className="text-muted">
                                            Examples: Preferred cleaning
                                            products, areas needing special
                                            attention, access instructions,
                                            allergies, etc.
                                        </small>
                                        <small className="text-muted">
                                            {specialRequirements.length}/1000
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Appointment Summary Sidebar */}
                    <div className="col-lg-4">
                        <AppointmentSummary
                            service={service}
                            provider={provider}
                            bookingData={{
                                ...bookingData,
                                duration_hours: duration,
                                total_price: totalPrice,
                                special_requirements: specialRequirements,
                            }}
                            selectedSlot={selectedSlot}
                            currentStep={1}
                            isSticky={true}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <div className="step-navigation d-flex justify-content-between mt-4 pt-4 border-top">
                    <button
                        className="btn btn-outline-secondary btn-lg"
                        onClick={onPrevious}
                    >
                        <i className="fas fa-arrow-left me-2" />
                        Back to Time Selection
                    </button>

                    <button
                        className="btn btn-primary btn-lg"
                        onClick={validateAndContinue}
                        disabled={
                            loading || duration < 1 || duration > maxDuration
                        }
                    >
                        Continue to Location & Contact
                        <i className="fas fa-arrow-right ms-2" />
                    </button>
                </div>
            </div>

            <style>{`
               .duration-btn {
                   width: 50px;
                   height: 50px;
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   font-size: 1.1rem;
               }

               .duration-display {
                   min-width: 120px;
               }

               .service-thumbnail {
                   border: 2px solid #f8f9fa;
                   box-shadow: 0 2px 8px rgba(0,0,0,0.1);
               }

               .text-primary { color: var(--current-role-primary) !important; }
               .bg-purple { background-color: var(--current-role-primary) !important; }
               .btn-primary {
                   background-color: var(--current-role-primary);
                   border-color: var(--current-role-primary);
                   color: white;
               }
               .btn-primary:hover {
                   background-color: #5a2d91;
                   border-color: #5a2d91;
                   color: white;
               }

               .summary-section:last-child {
                   margin-bottom: 0 !important;
               }

               @media (max-width: 768px) {
                   .duration-display {
                       min-width: 100px;
                   }
                   .duration-btn {
                       width: 40px;
                       height: 40px;
                   }
                   .booking-summary {
                       position: static !important;
                       margin-top: 2rem;
                   }
               }
           `}</style>
        </div>
    );
};

export default DurationDetailsStep;
