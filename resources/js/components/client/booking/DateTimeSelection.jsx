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
    // Initialize with booking data or defaults
    const [selectedDate, setSelectedDate] = useState(
        bookingData.date || bookingData.appointment_date || ""
    );
    const [selectedTime, setSelectedTime] = useState(
        bookingData.time || bookingData.appointment_time || ""
    );
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [error, setError] = useState("");

    useEffect(() => {
        if (selectedDate) {
            loadAvailableSlots(selectedDate);
        }
    }, [selectedDate, provider.id, service.id, bookingData.duration]);

    const loadAvailableSlots = async (date) => {
        // console.log("🔍 Frontend: Loading slots for date:", date);
        // console.log("🔍 Frontend: Date object:", new Date(date));
        // console.log("🔍 Frontend: Day of week:", new Date(date).getDay());
        // console.log(
        //     "🔍 Frontend: Day name:",
        //     new Date(date).toLocaleDateString("en-US", { weekday: "long" })
        // );

        setLoading(true);
        setError("");

        try {
            const response = await clientAvailabilityService.getAvailableSlots({
                provider_id: provider.id,
                service_id: service.id,
                date: date,
                duration:
                    bookingData.duration || bookingData.duration_hours || 1,
            });

            // console.log("🔍 Frontend: API response:", response);

            if (response.success) {
                // console.log("🔍 Frontend: Available slots:", response.data);
                setAvailableSlots(
                    response.data.available_slots || response.data || []
                );

                // Clear selected time if it's no longer available
                if (selectedTime && response.data.available_slots) {
                    const isTimeStillAvailable =
                        response.data.available_slots.some(
                            (slot) => slot.time === selectedTime
                        );
                    if (!isTimeStillAvailable) {
                        setSelectedTime("");
                        updateBookingData({ time: "", appointment_time: "" });
                    }
                }
            } else {
                setError(response.message || "Failed to load available times");
                setAvailableSlots([]);
            }
        } catch (error) {
            console.error("🔍 Frontend: API error:", error);
            console.error("Failed to load available slots:", error);
            setError("Unable to load available times. Please try again.");
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const getWeekDates = (startDate) => {
        const dates = [];
        const start = new Date(startDate);

        // Fix timezone issues by setting to noon
        start.setHours(12, 0, 0, 0);

        // Go to the start of the week (Sunday)
        start.setDate(start.getDate() - start.getDay());

        // console.log("🔍 Frontend: Generating week starting from:", start);

        for (let i = 0; i < 7; i++) {
            // Create new date for each day, avoiding timezone issues
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            date.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

            // console.log(
            //     `Day ${i}: ${
            //         date.toISOString().split("T")[0]
            //     } (${date.toLocaleDateString("en-US", { weekday: "long" })})`
            // );

            dates.push(date);
        }
        return dates;
    };

    const formatDate = (date) => {
        // Create a new date and set to noon to avoid timezone issues
        const localDate = new Date(date);
        localDate.setHours(12, 0, 0, 0);

        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, "0");
        const day = String(localDate.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const isDateDisabled = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Disable past dates
        if (date < today) return true;

        // Disable dates too far in future (e.g., 3 months)
        const maxDate = new Date(today);
        maxDate.setMonth(maxDate.getMonth() + 3);
        if (date > maxDate) return true;

        return false;
    };

    const handleDateSelect = (date) => {
        // Ensure we're working with a proper date object
        const selectedDate = new Date(date);
        selectedDate.setHours(12, 0, 0, 0); // Set to noon

        const dateString = formatDate(selectedDate);

        // console.log("🔍 Frontend: User clicked on date:", selectedDate);
        // console.log("🔍 Frontend: Formatted date string:", dateString);
        // console.log("🔍 Frontend: Day of week:", selectedDate.getDay());
        // console.log(
        //     "🔍 Frontend: Day name:",
        //     selectedDate.toLocaleDateString("en-US", { weekday: "long" })
        // );

        setSelectedDate(dateString);
        setSelectedTime(""); // Reset time when date changes

        // Update booking data immediately
        updateBookingData({
            date: dateString,
            appointment_date: dateString,
            time: "",
            appointment_time: "",
        });
    };
    const handleTimeSelect = (timeSlot) => {
        const timeString = timeSlot.time || timeSlot.start_time;
        setSelectedTime(timeString);

        // Update booking data with both time formats
        updateBookingData({
            time: timeString,
            appointment_time: timeString,
            selected_slot: timeSlot,
        });
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) {
            setError("Please select both date and time before continuing.");
            return;
        }

        // Final validation and data update
        updateBookingData({
            date: selectedDate,
            appointment_date: selectedDate,
            time: selectedTime,
            appointment_time: selectedTime,
        });

        onNext();
    };

    const navigateWeek = (direction) => {
        const newWeek = new Date(currentWeek);
        newWeek.setDate(newWeek.getDate() + direction * 7);

        // Don't allow navigation to past weeks
        const today = new Date();
        if (direction < 0 && newWeek < today) {
            return;
        }

        setCurrentWeek(newWeek);
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
            return timeString; // Return original if parsing fails
        }
    };

    const weekDates = getWeekDates(currentWeek);
    const today = new Date();

    return (
        <div className="date-time-selection">
            <div className="row">
                <div className="col-lg-8">
                    {/* Error Display */}
                    {error && (
                        <div className="alert alert-warning mb-4" role="alert">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            {error}
                        </div>
                    )}

                    {/* Date Selection */}
                    <div className="date-selection mb-4">
                        <h5 className="fw-bold mb-3">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            Select Date
                        </h5>

                        {/* Week Navigation */}
                        <div className="week-navigation d-flex justify-content-between align-items-center mb-3">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigateWeek(-1)}
                                disabled={currentWeek <= today}
                            >
                                <i className="fas fa-chevron-left"></i>
                            </button>

                            <h6 className="fw-semibold mb-0">
                                {weekDates[0].toLocaleDateString("en-US", {
                                    month: "long",
                                    year: "numeric",
                                })}
                                {weekDates[0].getMonth() !==
                                    weekDates[6].getMonth() &&
                                    ` - ${weekDates[6].toLocaleDateString(
                                        "en-US",
                                        { month: "short" }
                                    )}`}
                            </h6>

                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => navigateWeek(1)}
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

                                    // Add this logging
                                    {
                                        /* console.log(
                                        `🔍 Frontend: Rendering calendar day ${index}:`,
                                        {
                                            date: dateString,
                                            dayName: date.toLocaleDateString(
                                                "en-US",
                                                { weekday: "long" }
                                            ),
                                            isSelected,
                                            selectedDate,
                                            hasSlots: availableSlots.length > 0,
                                        }
                                    ); */
                                    }

                                    return (
                                        <div key={index} className="col">
                                            <button
                                                className={`date-card w-100 btn ${
                                                    isSelected
                                                        ? "btn-primary"
                                                        : isDisabled
                                                        ? "btn-light disabled"
                                                        : "btn-outline-secondary"
                                                }`}
                                                onClick={() =>
                                                    !isDisabled &&
                                                    handleDateSelect(date)
                                                }
                                                disabled={isDisabled}
                                                title={
                                                    isDisabled
                                                        ? "Date unavailable"
                                                        : `Select ${date.toLocaleDateString()}`
                                                }
                                            >
                                                <div className="day-name small">
                                                    {date.toLocaleDateString(
                                                        "en-US",
                                                        {
                                                            weekday: "short",
                                                        }
                                                    )}
                                                </div>
                                                <div className="day-number fw-bold">
                                                    {date.getDate()}
                                                </div>
                                                {isToday && (
                                                    <small className="d-block text-info">
                                                        Today
                                                    </small>
                                                )}
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
                            <h5 className="fw-bold mb-3">
                                <i className="fas fa-clock me-2 text-primary"></i>
                                Select Time
                            </h5>

                            {loading ? (
                                <div className="text-center py-4">
                                    <div
                                        className="spinner-border text-primary"
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
                                        <>
                                            <div className="mb-3">
                                                <small className="text-muted">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Service duration:{" "}
                                                    {bookingData.duration || 1}{" "}
                                                    hour(s)
                                                </small>
                                            </div>

                                            <div className="row g-2">
                                                {availableSlots.map(
                                                    (slot, index) => {
                                                        const timeString =
                                                            slot.time ||
                                                            slot.start_time;
                                                        const isSelected =
                                                            selectedTime ===
                                                            timeString;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="col-6 col-md-4 col-lg-3"
                                                            >
                                                                <button
                                                                    className={`time-slot w-100 btn ${
                                                                        isSelected
                                                                            ? "btn-primary"
                                                                            : "btn-outline-secondary"
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleTimeSelect(
                                                                            slot
                                                                        )
                                                                    }
                                                                    title={`Book at ${
                                                                        slot.formatted_time ||
                                                                        formatTime(
                                                                            timeString
                                                                        )
                                                                    }`}
                                                                >
                                                                    <div className="slot-time fw-semibold">
                                                                        {slot.formatted_time ||
                                                                            formatTime(
                                                                                timeString
                                                                            )}
                                                                    </div>
                                                                    {slot.is_popular && (
                                                                        <small className="badge bg-warning mt-1">
                                                                            Popular
                                                                        </small>
                                                                    )}
                                                                    {slot.end_time && (
                                                                        <small className="text-muted d-block">
                                                                            to{" "}
                                                                            {formatTime(
                                                                                slot.end_time
                                                                            )}
                                                                        </small>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </>
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
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() =>
                                                    window.open(
                                                        `tel:${provider.contact_number}`,
                                                        "_self"
                                                    )
                                                }
                                            >
                                                <i className="fas fa-phone me-2"></i>
                                                Contact Provider
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Booking Info */}
                    <div className="booking-info">
                        <div className="card border-0 shadow-sm bg-light">
                            <div className="card-body">
                                <h6 className="fw-bold mb-2">
                                    <i className="fas fa-info-circle text-info me-2"></i>
                                    Booking Information
                                </h6>
                                <div className="row">
                                    <div className="col-md-6">
                                        <ul className="list-unstyled mb-0">
                                            <li className="mb-1">
                                                <i className="fas fa-check text-success me-2"></i>
                                                <small>
                                                    Free cancellation up to 24
                                                    hours
                                                </small>
                                            </li>
                                            <li className="mb-1">
                                                <i className="fas fa-clock text-info me-2"></i>
                                                <small>
                                                    Provider confirmation within
                                                    2 hours
                                                </small>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <ul className="list-unstyled mb-0">
                                            <li className="mb-1">
                                                <i className="fas fa-phone text-warning me-2"></i>
                                                <small>
                                                    SMS/call confirmation
                                                </small>
                                            </li>
                                            <li className="mb-1">
                                                <i className="fas fa-shield-alt text-success me-2"></i>
                                                <small>
                                                    Service guarantee included
                                                </small>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
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
                            <div className="card-header bg-primary text-white">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-calendar-check me-2"></i>
                                    Booking Details
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
                                        hour(s)
                                    </div>
                                    <div className="text-success small">
                                        <i className="fas fa-tag me-1"></i>
                                        Rs.{" "}
                                        {bookingData.total_price ||
                                            service.price ||
                                            0}
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
                                            <i className="fas fa-calendar me-2"></i>
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
                                            {availableSlots.find(
                                                (slot) =>
                                                    (slot.time ||
                                                        slot.start_time) ===
                                                    selectedTime
                                            )?.formatted_time || selectedTime}
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            <i className="fas fa-clock me-2"></i>
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
                                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
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
                                            <div className="fw-semibold small">
                                                {provider.name}
                                            </div>
                                            <div className="text-muted small">
                                                <i className="fas fa-star text-warning me-1"></i>
                                                {provider.average_rating || 0}
                                                {provider.is_verified && (
                                                    <i
                                                        className="fas fa-check-circle text-success ms-1"
                                                        title="Verified"
                                                    ></i>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Response Info */}
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
                    className="btn btn-primary btn-lg"
                    onClick={handleContinue}
                    disabled={!selectedDate || !selectedTime || loading}
                >
                    {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading...
                        </>
                    ) : (
                        <>
                            Continue to Details
                            <i className="fas fa-arrow-right ms-2"></i>
                        </>
                    )}
                </button>
            </div>

            <style>{`
                .text-primary { color: var(--current-role-primary) !important; }
                .bg-primary { background-color: var(--current-role-primary) !important; }
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
                .date-card {
                    height: 80px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .date-card:hover:not(.disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                .time-slot {
                    height: 70px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }
                .time-slot:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                .spinner-border-purple {
                    color: var(--current-role-primary);
                }
            `}</style>
        </div>
    );
};

export default DateTimeSelection;
