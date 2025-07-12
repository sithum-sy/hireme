import React from "react";

const TimeSlotInput = ({
    day,
    dayData,
    onChange,
    errors = {},
    disabled = false,
}) => {
    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const handleAvailabilityToggle = () => {
        const newData = {
            ...dayData,
            is_available: !dayData.is_available,
            start_time: !dayData.is_available ? "09:00" : null,
            end_time: !dayData.is_available ? "17:00" : null,
        };
        onChange(day, newData);
    };

    const handleTimeChange = (field, value) => {
        onChange(day, {
            ...dayData,
            [field]: value,
        });
    };

    const getFieldError = (field) => {
        return errors[`availability.${day}.${field}`] || errors[field];
    };

    return (
        <div className="time-slot-input-card">
            <div className="card border-0 shadow-sm mb-3">
                <div className="card-body p-3">
                    <div className="row align-items-center">
                        {/* Day Name */}
                        <div className="col-md-2 col-sm-3">
                            <div className="d-flex align-items-center">
                                <div className="form-check form-switch me-3">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`available-${day}`}
                                        checked={dayData.is_available || false}
                                        onChange={handleAvailabilityToggle}
                                        disabled={disabled}
                                    />
                                </div>
                                <label
                                    htmlFor={`available-${day}`}
                                    className={`fw-bold mb-0 ${
                                        dayData.is_available
                                            ? "text-dark"
                                            : "text-muted"
                                    }`}
                                >
                                    {dayNames[day]}
                                </label>
                            </div>
                        </div>

                        {/* Time Inputs */}
                        <div className="col-md-8 col-sm-7">
                            {dayData.is_available ? (
                                <div className="row g-2">
                                    <div className="col-5">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light">
                                                <i className="fas fa-clock text-muted"></i>
                                            </span>
                                            <input
                                                type="time"
                                                className={`form-control ${
                                                    getFieldError("start_time")
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={dayData.start_time || ""}
                                                onChange={(e) =>
                                                    handleTimeChange(
                                                        "start_time",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={disabled}
                                                placeholder="Start time"
                                            />
                                        </div>
                                        {getFieldError("start_time") && (
                                            <div className="invalid-feedback d-block">
                                                <small>
                                                    {getFieldError(
                                                        "start_time"
                                                    )}
                                                </small>
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-2 text-center">
                                        <span className="text-muted small">
                                            to
                                        </span>
                                    </div>

                                    <div className="col-5">
                                        <div className="input-group input-group-sm">
                                            <span className="input-group-text bg-light">
                                                <i className="fas fa-clock text-muted"></i>
                                            </span>
                                            <input
                                                type="time"
                                                className={`form-control ${
                                                    getFieldError("end_time")
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={dayData.end_time || ""}
                                                onChange={(e) =>
                                                    handleTimeChange(
                                                        "end_time",
                                                        e.target.value
                                                    )
                                                }
                                                disabled={disabled}
                                                placeholder="End time"
                                            />
                                        </div>
                                        {getFieldError("end_time") && (
                                            <div className="invalid-feedback d-block">
                                                <small>
                                                    {getFieldError("end_time")}
                                                </small>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-muted small">
                                    <i className="fas fa-times-circle me-2"></i>
                                    Not available
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="col-md-2 col-sm-2 text-end">
                            <span
                                className={`badge ${
                                    dayData.is_available
                                        ? "bg-success"
                                        : "bg-secondary"
                                }`}
                            >
                                {dayData.is_available ? "Open" : "Closed"}
                            </span>
                        </div>
                    </div>

                    {/* Time Range Display */}
                    {dayData.is_available &&
                        dayData.start_time &&
                        dayData.end_time && (
                            <div className="row mt-2">
                                <div className="col-12">
                                    <small className="text-muted">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Working hours:{" "}
                                        {formatTimeDisplay(dayData.start_time)}{" "}
                                        - {formatTimeDisplay(dayData.end_time)}
                                        {calculateWorkingHours(
                                            dayData.start_time,
                                            dayData.end_time
                                        ) && (
                                            <span className="ms-2">
                                                (
                                                {calculateWorkingHours(
                                                    dayData.start_time,
                                                    dayData.end_time
                                                )}{" "}
                                                hours)
                                            </span>
                                        )}
                                    </small>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

// Helper functions
const formatTimeDisplay = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
};

const calculateWorkingHours = (startTime, endTime) => {
    if (!startTime || !endTime) return null;

    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);

    if (end <= start) return null;

    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours.toFixed(1);
};

export default TimeSlotInput;
