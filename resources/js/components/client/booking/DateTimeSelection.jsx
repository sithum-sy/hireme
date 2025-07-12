import React, { useState, useEffect } from "react";
import clientAvailabilityService from "../../../services/clientAvailabilityService";

const DateTimeSelection = ({
    service,
    provider,
    bookingData,
    updateBookingData,
    onNext,
    onPrevious,
}) => {
    const [selectedDate, setSelectedDate] = useState(bookingData.date || "");
    const [selectedTime, setSelectedTime] = useState(bookingData.time || "");
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());

    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots(selectedDate);
        }
    }, [selectedDate, provider.id, service.id]);

    const loadAvailableSlots = async (date) => {
        setLoading(true);
        try {
            const response = await clientAvailabilityService.getAvailableSlots({
                provider_id: provider.id,
                service_id: service.id,
                date: date,
                duration: bookingData.duration || 1,
            });

            if (response.success) {
                setAvailableSlots(response.data);
            }
        } catch (error) {
            console.error("Failed to load available slots:", error);
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (startDate) => {
        const dates = [];
        const start = new Date(startDate);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday

        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date) => {
        return date.toISOString().split("T")[0];
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    };

    const handleDateSelect = (date) => {
        const dateString = formatDate(date);
        setSelectedDate(dateString);
        setSelectedTime(""); // Reset time when date changes
        updateBookingData({ date: dateString, time: "" });
    };

    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        updateBookingData({ time: time });
    };

    const handleContinue = () => {
        if (selectedDate && selectedTime) {
            updateBookingData({
                date: selectedDate,
                time: selectedTime,
            });
            onNext();
        }
    };

    const weekDates = getWeekDates(currentWeek);
    const today = new Date();

    return (
        <div className="date-time-selection">
            <div className="row">
                <div className="col-lg-8">
                    {/* Date Selection */}
                    <div className="date-selection mb-4">
                        <h5 className="fw-bold mb-3">Select Date</h5>

                        {/* Week Navigation */}
                        <div className="week-navigation d-flex justify-content-between align-items-center mb-3">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    const prevWeek = new Date(currentWeek);
                                    prevWeek.setDate(prevWeek.getDate() - 7);
                                    setCurrentWeek(prevWeek);
                                }}
                                disabled={currentWeek <= today}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <h6 className="fw-semibold mb-0">
                                {weekDates[0].toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                            </h6>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => {
                                    const nextWeek = new Date(currentWeek);
                                    nextWeek.setDate(nextWeek.getDate() + 7);
                                    setCurrentWeek(nextWeek);
                                }}
                            >
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>

                        {/* Calendar Grid */}
                        <div className="calendar-grid">
                            <div className="row g-2">
                                {weekDates.map((date, index) => {
                                    const dateString = formatDate(date);
                                    const isDisabled = isDateDisabled(date);
                                    const isSelected =
                                        selectedDate === dateString;
                                    const isToday =
                                        date.toDateString() ===
                                        today.toDateString();

                                    return (
                                        <div key={index} className="col">
                                            <button
                                                className={`date-card w-100 btn ${
                                                    isSelected
                                                        ? "btn-purple"
                                                        : isDisabled
                                                        ? "btn-light disabled"
                                                        : "btn-outline-secondary"
                                                }`}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    handleDateSelect(date)
                                                }
                                                disabled={isDisabled}
                                            >
                                                <div className="day-name">
                                                    {date.toLocaleDateString(
                                                        "en-US",
                                                        { weekday: "short" }
                                                    )}
                                                </div>
                                                <div className="day-number fw-bold">
                                                    {date.getDate()}
                                                    {isToday && (
                                                        <small className="d-block text-purple">
                                                            Today
                                                        </small>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Time Selection */}
                    {selectedDate && (
                        <div className="time-selection mb-4">
                            <h5 className="fw-bold mb-3">Select Time</h5>

                            {loading ? (
                                <div className="text-center py-4">
                                    <div
                                        className="spinner-border text-purple"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                    <div className="mt-2">
                                        Loading available times...
                                    </div>
                                </div>
                            ) : (
                                <div className="time-slots">
                                    {availableSlots.length > 0 ? (
                                        <div className="row g-2">
                                            {availableSlots.map(
                                                (slot, index) => (
                                                    <div
                                                        key={index}
                                                        className="col-6 col-md-4 col-lg-3"
                                                    >
                                                        <button
                                                            className={`time-slot w-100 btn ${
                                                                selectedTime ===
                                                                slot.time
                                                                    ? "btn-purple"
                                                                    : "btn-outline-secondary"
                                                            }`}
                                                            onClick={() =>
                                                                handleTimeSelect(
                                                                    slot.time
                                                                )
                                                            }
                                                        >
                                                            <div className="slot-time fw-semibold">
                                                                {
                                                                    slot.formatted_time
                                                                }
                                                            </div>
                                                            {slot.is_popular && (
                                                                <small className="badge bg-warning">
                                                                    Popular
                                                                </small>
                                                            )}
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <div className="no-slots text-center py-4">
                                            <i className="fas fa-calendar-times fa-2x text-muted mb-2"></i>
                                            <h6 className="text-muted">
                                                No available times
                                            </h6>
                                            <p className="text-muted small">
                                                Please select a different date
                                                or contact the provider
                                                directly.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booking Notes */}
                    <div className="booking-notes">
                        <div className="card border-0 shadow-sm bg-light">
                            <div className="card-body">
                                <h6 className="fw-bold mb-2">
                                    <i className="fas fa-info-circle text-info me-2"></i>
                                    Booking Information
                                </h6>
                                <ul className="list-unstyled mb-0">
                                    <li className="mb-1">
                                        <i className="fas fa-check text-success me-2"></i>
                                        <small>
                                            Free cancellation up to 24 hours
                                            before
                                        </small>
                                    </li>
                                    <li className="mb-1">
                                        <i className="fas fa-clock text-info me-2"></i>
                                        <small>
                                            Provider will confirm within 2 hours
                                        </small>
                                    </li>
                                    <li className="mb-1">
                                        <i className="fas fa-phone text-warning me-2"></i>
                                        <small>
                                            You'll receive a confirmation
                                            call/message
                                        </small>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Selected Details Sidebar */}
                <div className="col-lg-4">
                    <div
                        className="selected-details position-sticky"
                        style={{ top: "2rem" }}
                    >
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-purple text-white">
                                <h6 className="fw-bold mb-0">
                                    Selected Details
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Service Details */}
                                <div className="detail-section mb-3">
                                    <h6 className="fw-semibold mb-2">
                                        Service
                                    </h6>
                                    <div className="text-muted">
                                        {service.title}
                                    </div>
                                    <div className="text-muted small">
                                        Duration: {bookingData.duration || 1}{" "}
                                        hour
                                        {(bookingData.duration || 1) > 1
                                            ? "s"
                                            : ""}
                                    </div>
                                </div>

                                {/* Date Details */}
                                <div className="detail-section mb-3">
                                    <h6 className="fw-semibold mb-2">Date</h6>
                                    {selectedDate ? (
                                        <div className="text-success">
                                            <i className="fas fa-calendar-check me-2"></i>
                                            {new Date(
                                                selectedDate
                                            ).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            Please select a date
                                        </div>
                                    )}
                                </div>

                                {/* Time Details */}
                                <div className="detail-section mb-3">
                                    <h6 className="fw-semibold mb-2">Time</h6>
                                    {selectedTime ? (
                                        <div className="text-success">
                                            <i className="fas fa-clock me-2"></i>
                                            {selectedTime}
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            {selectedDate
                                                ? "Please select a time"
                                                : "Select date first"}
                                        </div>
                                    )}
                                </div>

                                {/* Provider Details */}
                                <div className="detail-section">
                                    <h6 className="fw-semibold mb-2">
                                        Provider
                                    </h6>
                                    <div className="d-flex align-items-center">
                                        <div className="provider-avatar me-2">
                                            {provider.profile_image_url ? (
                                                <img
                                                    src={
                                                        provider.profile_image_url
                                                    }
                                                    alt={provider.name}
                                                    className="rounded-circle"
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                    style={{
                                                        width: "30px",
                                                        height: "30px",
                                                    }}
                                                >
                                                    <i className="fas fa-user fa-sm"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="fw-semibold">
                                                {provider.name}
                                            </div>
                                            <div className="text-muted small">
                                                <i className="fas fa-star text-warning me-1"></i>
                                                {provider.average_rating || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Provider Response Time */}
                        <div className="card border-0 shadow-sm mt-3">
                            <div className="card-body text-center">
                                <i className="fas fa-bolt text-warning fa-2x mb-2"></i>
                                <h6 className="fw-bold">Quick Response</h6>
                                <p className="text-muted small mb-0">
                                    {provider.name} typically responds within{" "}
                                    {provider.response_time || "2 hours"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="wizard-navigation d-flex justify-content-between mt-4 pt-4 border-top">
                <button
                    className="btn btn-outline-secondary btn-lg"
                    onClick={onPrevious}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Service
                </button>

                <button
                    className="btn btn-purple btn-lg"
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedTime}
                >
                    Continue to Details
                    <i className="fas fa-arrow-right ms-2"></i>
                </button>
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
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
                .date-card {
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }
                .time-slot {
                    height: 60px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                }
                .spinner-border-purple {
                    color: #6f42c1;
                }
            `}</style>
        </div>
    );
};

export default DateTimeSelection;
