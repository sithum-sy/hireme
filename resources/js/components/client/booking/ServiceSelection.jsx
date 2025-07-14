import React, { useState } from "react";

const ServiceSelection = ({
    service,
    provider,
    bookingData,
    updateBookingData,
    onNext,
}) => {
    // Initialize with current booking data
    const [selectedAddOns, setSelectedAddOns] = useState(
        bookingData.additional_services || []
    );
    const [duration, setDuration] = useState(
        parseFloat(bookingData.duration) ||
            parseFloat(service.duration_hours) ||
            1
    );

    const handleAddOnToggle = (addOn) => {
        const isSelected = selectedAddOns.find((item) => item.id === addOn.id);
        let newAddOns;

        if (isSelected) {
            newAddOns = selectedAddOns.filter((item) => item.id !== addOn.id);
        } else {
            newAddOns = [...selectedAddOns, addOn];
        }

        setSelectedAddOns(newAddOns);
        updateBookingData({ additional_services: newAddOns });
    };

    const handleDurationChange = (newDuration) => {
        // Ensure we're working with a number, not a string
        const numericDuration = parseFloat(newDuration);
        setDuration(numericDuration);
        updateBookingData({
            duration: numericDuration,
            duration_hours: numericDuration,
        });
    };

    const handleContinue = () => {
        // Ensure all data is updated before proceeding
        updateBookingData({
            duration: duration,
            duration_hours: duration,
            additional_services: selectedAddOns,
        });
        onNext();
    };

    // Use consistent price field
    const servicePrice = service.price || service.base_price || 0;

    return (
        <div className="service-selection">
            <div className="row">
                <div className="col-lg-8">
                    {/* Selected Service Display */}
                    <div className="selected-service mb-4">
                        <h5 className="fw-bold mb-3">Selected Service</h5>
                        <div className="card border-2 border-purple">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-3">
                                        {service.first_image_url ? (
                                            <img
                                                src={service.first_image_url}
                                                alt={service.title}
                                                className="w-100 rounded"
                                                style={{
                                                    height: "80px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                                style={{ height: "80px" }}
                                            >
                                                <i className="fas fa-image fa-2x text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="fw-bold mb-1">
                                            {service.title}
                                        </h6>
                                        <p className="text-muted small mb-2">
                                            {service.description}
                                        </p>
                                        <div className="service-meta">
                                            <span
                                                className={`badge bg-${
                                                    service.category.color ||
                                                    "primary"
                                                } me-2`}
                                            >
                                                {service.category.name}
                                            </span>
                                            <span className="text-muted">
                                                by {provider.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="col-md-3 text-end">
                                        <div className="price">
                                            <div className="base-price fw-bold text-purple">
                                                Rs. {servicePrice}
                                            </div>
                                            <small className="text-muted">
                                                {service.pricing_type ===
                                                "hourly"
                                                    ? "per hour"
                                                    : service.pricing_type ===
                                                      "fixed"
                                                    ? "fixed price"
                                                    : "per service"}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Duration Selection - only show for hourly services */}
                    {service.pricing_type === "hourly" && (
                        <div className="duration-selection mb-4">
                            <h5 className="fw-bold mb-3">Duration</h5>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                How many hours do you need?
                                            </label>
                                            <div className="duration-controls d-flex align-items-center">
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        const newDuration =
                                                            Math.max(
                                                                1,
                                                                duration - 1
                                                            );
                                                        handleDurationChange(
                                                            newDuration
                                                        );
                                                    }}
                                                    disabled={duration <= 1}
                                                >
                                                    <i className="fas fa-minus"></i>
                                                </button>
                                                <span className="mx-3 fw-bold">
                                                    {duration} hour
                                                    {duration !== 1 ? "s" : ""}
                                                </span>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        const newDuration =
                                                            duration + 1;
                                                        handleDurationChange(
                                                            newDuration
                                                        );
                                                    }}
                                                >
                                                    <i className="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <div className="duration-price">
                                                <div className="fw-bold text-purple">
                                                    Rs.{" "}
                                                    {servicePrice * duration}
                                                </div>
                                                <small className="text-muted">
                                                    Rs. {servicePrice} ×{" "}
                                                    {duration} hour
                                                    {duration !== 1 ? "s" : ""}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add-on Services */}
                    {service.add_ons && service.add_ons.length > 0 && (
                        <div className="add-on-services mb-4">
                            <h5 className="fw-bold mb-3">
                                Additional Services
                            </h5>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    {service.add_ons.map((addOn) => (
                                        <div
                                            key={addOn.id}
                                            className="add-on-item border-bottom pb-3 mb-3"
                                        >
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    id={`addon-${addOn.id}`}
                                                    checked={selectedAddOns.some(
                                                        (item) =>
                                                            item.id === addOn.id
                                                    )}
                                                    onChange={() =>
                                                        handleAddOnToggle(addOn)
                                                    }
                                                />
                                                <label
                                                    className="form-check-label w-100"
                                                    htmlFor={`addon-${addOn.id}`}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <div className="fw-semibold">
                                                                {addOn.name}
                                                            </div>
                                                            <div className="text-muted small">
                                                                {
                                                                    addOn.description
                                                                }
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <div className="fw-bold text-purple">
                                                                +Rs.{" "}
                                                                {addOn.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service Notes */}
                    <div className="service-notes mb-4">
                        <h5 className="fw-bold mb-3">Special Requirements</h5>
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Any special requirements or notes for the provider..."
                                    value={bookingData.requirements || ""}
                                    onChange={(e) =>
                                        updateBookingData({
                                            requirements: e.target.value,
                                            special_instructions:
                                                e.target.value,
                                        })
                                    }
                                ></textarea>
                                <small className="text-muted">
                                    This helps the provider better understand
                                    your needs
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price Summary Sidebar */}
                <div className="col-lg-4">
                    <div
                        className="price-summary position-sticky"
                        style={{ top: "2rem" }}
                    >
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-purple text-white">
                                <h6 className="fw-bold mb-0">
                                    Booking Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Base Service */}
                                <div className="summary-item d-flex justify-content-between mb-2">
                                    <span>{service.title}</span>
                                    <span className="fw-semibold">
                                        Rs. {servicePrice}
                                        {service.pricing_type === "hourly" &&
                                            duration > 1 &&
                                            ` × ${duration}`}
                                    </span>
                                </div>

                                {/* Duration Multiplier for hourly services */}
                                {service.pricing_type === "hourly" &&
                                    duration > 1 && (
                                        <div className="summary-item d-flex justify-content-between mb-2">
                                            <span className="text-muted small">
                                                Subtotal ({duration} hours)
                                            </span>
                                            <span className="fw-semibold">
                                                Rs. {servicePrice * duration}
                                            </span>
                                        </div>
                                    )}

                                {/* Add-ons */}
                                {selectedAddOns.map((addOn) => (
                                    <div
                                        key={addOn.id}
                                        className="summary-item d-flex justify-content-between mb-2"
                                    >
                                        <span className="text-muted small">
                                            + {addOn.name}
                                        </span>
                                        <span className="fw-semibold">
                                            Rs. {addOn.price}
                                        </span>
                                    </div>
                                ))}

                                <hr />

                                {/* Total */}
                                <div className="summary-total d-flex justify-content-between">
                                    <span className="fw-bold">Total</span>
                                    <span className="fw-bold text-purple h5 mb-0">
                                        Rs.{" "}
                                        {(() => {
                                            const baseTotal =
                                                service.pricing_type ===
                                                "hourly"
                                                    ? servicePrice * duration
                                                    : servicePrice;
                                            const addOnsTotal =
                                                selectedAddOns.reduce(
                                                    (sum, addOn) =>
                                                        sum +
                                                        parseInt(
                                                            addOn.price || 0
                                                        ),
                                                    0
                                                );
                                            return baseTotal + addOnsTotal;
                                        })()}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Final price may vary based on location
                                        and specific requirements
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Provider Info Card */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body">
                                <h6 className="fw-bold mb-3">Your Provider</h6>
                                <div className="provider-info d-flex align-items-center">
                                    <div className="provider-avatar me-3">
                                        {provider.profile_image_url ? (
                                            <img
                                                src={provider.profile_image_url}
                                                alt={provider.name}
                                                className="rounded-circle"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "50px",
                                                    height: "50px",
                                                }}
                                            >
                                                <i className="fas fa-user"></i>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="fw-semibold">
                                            {provider.name}
                                        </div>
                                        <div className="text-muted small">
                                            <i className="fas fa-star text-warning me-1"></i>
                                            {provider.average_rating || 0} (
                                            {provider.reviews_count || 0}{" "}
                                            reviews)
                                        </div>
                                        {provider.is_verified && (
                                            <span className="badge bg-success bg-opacity-10 text-success">
                                                <i className="fas fa-check-circle me-1"></i>
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="wizard-navigation d-flex justify-content-end mt-4 pt-4 border-top">
                <button
                    className="btn btn-purple btn-lg"
                    onClick={handleContinue}
                >
                    Continue to Date & Time
                    <i className="fas fa-arrow-right ms-2"></i>
                </button>
            </div>

            <style>{`
                .border-purple { border-color: #6f42c1 !important; }
                .text-purple { color: #6f42c1 !important; }
                .bg-purple { background-color: #6f42c1 !important; }
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
                .add-on-item:last-child {
                    border-bottom: none !important;
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
                .form-check-input:checked {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                }
                .duration-controls .btn {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
};

export default ServiceSelection;
