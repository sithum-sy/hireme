import React from "react";
import { Link } from "react-router-dom";

const AppointmentCard = ({
    appointment,
    onCancel,
    onReschedule,
    onReview,
    onContact,
    loading = false,
}) => {
    // Format date and time for display
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return {
                date: "Date not set",
                time: "Time not set",
            };
        }

        try {
            // Handle different date formats from Laravel
            let dateObj;

            // If date is already a Date object
            if (date instanceof Date) {
                dateObj = date;
            }
            // If date is in YYYY-MM-DD format
            else if (typeof date === "string" && date.includes("-")) {
                // Create date in local timezone to avoid timezone issues
                const [year, month, day] = date.split("-");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
            }
            // Try parsing as-is
            else {
                dateObj = new Date(date);
            }

            // Validate the date
            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date");
            }

            // Format time - handle both HH:MM and HH:MM:SS formats
            let formattedTime = "Time not set";
            if (time) {
                try {
                    // Remove seconds if present (HH:MM:SS -> HH:MM)
                    const timeParts = time.toString().split(":");
                    if (timeParts.length >= 2) {
                        const hours = parseInt(timeParts[0]);
                        const minutes = timeParts[1];
                        const ampm = hours >= 12 ? "PM" : "AM";
                        const displayHour = hours % 12 || 12;
                        formattedTime = `${displayHour}:${minutes} ${ampm}`;
                    }
                } catch (timeError) {
                    console.warn("Time parsing error:", timeError);
                    formattedTime = time.toString(); // Fallback to original time
                }
            }

            return {
                date: dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
                time: formattedTime,
            };
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                date: date ? date.toString() : "Invalid date",
                time: time ? time.toString() : "Invalid time",
            };
        }
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            confirmed: "bg-success text-white",
            in_progress: "bg-primary text-white",
            completed: "bg-info text-white",
            cancelled_by_client: "bg-danger text-white",
            cancelled_by_provider: "bg-danger text-white",
            no_show: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    // Check if appointment can be cancelled (24 hours rule)
    const canBeCancelled = () => {
        if (!["pending", "confirmed"].includes(appointment.status))
            return false;
        if (!appointment.appointment_date || !appointment.appointment_time)
            return false;

        try {
            // Create proper date object
            let dateObj;
            const dateStr = appointment.appointment_date;
            const timeStr = appointment.appointment_time;

            if (dateStr.includes("-")) {
                const [year, month, day] = dateStr.split("-");
                const [hours, minutes] = timeStr.split(":");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes)
                );
            } else {
                dateObj = new Date(`${dateStr}T${timeStr}`);
            }

            if (isNaN(dateObj.getTime())) {
                console.warn(
                    "Invalid appointment date/time for cancellation check"
                );
                return false;
            }

            const now = new Date();
            const hoursUntilAppointment = (dateObj - now) / (1000 * 60 * 60);

            return hoursUntilAppointment > 24;
        } catch (error) {
            console.warn("Error checking cancellation policy:", error);
            return false;
        }
    };

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );
    const canCancel = canBeCancelled();

    return (
        <div
            className={`appointment-card card border-0 shadow-sm mb-3 ${
                loading ? "opacity-50" : ""
            }`}
        >
            <div className="card-body">
                <div className="row align-items-center">
                    {/* Service & Provider Info */}
                    <div className="col-md-6">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="appointment-info">
                                <h6 className="fw-bold mb-1">
                                    {appointment.service?.title || "Service"}
                                </h6>
                                <div className="text-muted small mb-1">
                                    <i className="fas fa-user me-1"></i>
                                    {appointment.provider?.first_name}{" "}
                                    {appointment.provider?.last_name}
                                    {appointment.provider?.provider_profile
                                        ?.business_name && (
                                        <span className="ms-1">
                                            (
                                            {
                                                appointment.provider
                                                    .provider_profile
                                                    .business_name
                                            }
                                            )
                                        </span>
                                    )}
                                    {appointment.provider?.provider_profile
                                        ?.verification_status ===
                                        "verified" && (
                                        <i
                                            className="fas fa-check-circle text-success ms-1"
                                            title="Verified Provider"
                                        ></i>
                                    )}
                                </div>

                                {/* Service Category */}
                                {appointment.service?.category && (
                                    <div className="mb-2">
                                        <span
                                            className={`badge bg-${
                                                appointment.service.category
                                                    .color || "primary"
                                            } bg-opacity-10 text-${
                                                appointment.service.category
                                                    .color || "primary"
                                            }`}
                                        >
                                            <i
                                                className={`${
                                                    appointment.service.category
                                                        .icon || "fas fa-tag"
                                                } me-1`}
                                            ></i>
                                            {appointment.service.category.name}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Status Badge */}
                            <span
                                className={`badge ${getStatusBadge(
                                    appointment.status
                                )} px-2 py-1`}
                            >
                                {appointment.status_text ||
                                    appointment.status.replace("_", " ")}
                            </span>
                        </div>

                        {/* Date, Time, Location */}
                        <div className="appointment-details">
                            <div className="row text-sm mb-2">
                                <div className="col-6">
                                    <i className="fas fa-calendar text-muted me-2"></i>
                                    <span>{dateTime.date}</span>
                                </div>
                                <div className="col-6">
                                    <i className="fas fa-clock text-muted me-2"></i>
                                    <span>{dateTime.time}</span>
                                </div>
                            </div>
                            <div className="location-info">
                                <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                <span className="text-muted small">
                                    {appointment.location_type ===
                                        "client_address" && "At your location"}
                                    {appointment.location_type ===
                                        "provider_location" &&
                                        "At provider location"}
                                    {appointment.location_type ===
                                        "custom_location" && "Custom location"}
                                </span>
                                {appointment.client_address && (
                                    <div className="text-muted small ms-4">
                                        {appointment.client_address}
                                        {appointment.client_city &&
                                            `, ${appointment.client_city}`}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="col-md-6 text-end">
                        <div className="appointment-price mb-3">
                            <div className="fw-bold text-purple h5 mb-0">
                                Rs. {appointment.total_price}
                            </div>
                            <div className="price-details small text-muted">
                                {appointment.duration_hours && (
                                    <div>
                                        {appointment.duration_hours} hour
                                        {appointment.duration_hours > 1
                                            ? "s"
                                            : ""}
                                    </div>
                                )}
                                {appointment.travel_fee > 0 && (
                                    <div className="text-warning">
                                        +Rs. {appointment.travel_fee} travel fee
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="appointment-actions">
                            <div className="d-flex flex-wrap gap-1 justify-content-end">
                                {/* View Details - Always Available */}
                                <Link
                                    to={`/client/appointments/${appointment.id}`}
                                    className="btn btn-outline-purple btn-sm"
                                >
                                    <i className="fas fa-eye me-1"></i>
                                    <span className="d-none d-md-inline">
                                        Details
                                    </span>
                                </Link>

                                {/* Status-specific Action Buttons */}
                                {appointment.status === "pending" && (
                                    <>
                                        {onContact && (
                                            <button
                                                className="btn btn-outline-info btn-sm"
                                                onClick={() =>
                                                    onContact(appointment)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-phone me-1"></i>
                                                <span className="d-none d-lg-inline">
                                                    Contact
                                                </span>
                                            </button>
                                        )}
                                        {canCancel && onCancel && (
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    onCancel(appointment)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-times me-1"></i>
                                                <span className="d-none d-md-inline">
                                                    Cancel
                                                </span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {appointment.status === "confirmed" && (
                                    <>
                                        {onReschedule && (
                                            <button
                                                className="btn btn-outline-warning btn-sm"
                                                onClick={() =>
                                                    onReschedule(appointment)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-edit me-1"></i>
                                                <span className="d-none d-lg-inline">
                                                    Reschedule
                                                </span>
                                            </button>
                                        )}
                                        {onContact && (
                                            <button
                                                className="btn btn-outline-info btn-sm"
                                                onClick={() =>
                                                    onContact(appointment)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-phone me-1"></i>
                                                <span className="d-none d-lg-inline">
                                                    Contact
                                                </span>
                                            </button>
                                        )}
                                        {canCancel && onCancel && (
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    onCancel(appointment)
                                                }
                                                disabled={loading}
                                            >
                                                <i className="fas fa-times me-1"></i>
                                                <span className="d-none d-md-inline">
                                                    Cancel
                                                </span>
                                            </button>
                                        )}
                                    </>
                                )}

                                {appointment.status === "completed" &&
                                    !appointment.provider_rating &&
                                    onReview && (
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() =>
                                                onReview(appointment)
                                            }
                                            disabled={loading}
                                        >
                                            <i className="fas fa-star me-1"></i>
                                            <span className="d-none d-md-inline">
                                                Review
                                            </span>
                                        </button>
                                    )}

                                {appointment.status === "completed" &&
                                    appointment.provider_rating && (
                                        <div className="rating-display small">
                                            <span className="text-muted">
                                                Your rating:
                                            </span>
                                            <div className="stars text-warning">
                                                {[...Array(5)].map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`fas fa-star ${
                                                            i <
                                                            appointment.provider_rating
                                                                ? "text-warning"
                                                                : "text-muted"
                                                        }`}
                                                    ></i>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Origin Badge */}
                {appointment.quote_id && (
                    <div className="quote-origin mt-2 pt-2 border-top">
                        <Link
                            to={`/client/quotes/${appointment.quote_id}`}
                            className="text-decoration-none"
                        >
                            <small className="text-info">
                                <i className="fas fa-quote-left me-1"></i>
                                Created from Quote #{appointment.quote_id}
                                <i className="fas fa-external-link-alt ms-1 small"></i>
                            </small>
                        </Link>
                    </div>
                )}

                {/* Cancellation Policy Warning */}
                {["pending", "confirmed"].includes(appointment.status) &&
                    !canCancel && (
                        <div className="cancellation-warning mt-2 pt-2 border-top">
                            <small className="text-danger">
                                <i className="fas fa-exclamation-triangle me-1"></i>
                                Cancellation period has passed (24 hours
                                required)
                            </small>
                        </div>
                    )}

                {/* Loading Overlay */}
                {loading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                        <div
                            className="spinner-border text-purple"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AppointmentCard;
