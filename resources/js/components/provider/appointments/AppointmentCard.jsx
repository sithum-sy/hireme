import React, { useState } from "react";
import { Link } from "react-router-dom";
import providerAppointmentService from "../../../services/providerAppointmentService";

const AppointmentCard = ({ appointment, onStatusUpdate, loading = false }) => {
    const [actionLoading, setActionLoading] = useState(false);

    // Format date and time
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return {
                date: "Date not available",
                time: "Time not available",
                isToday: false,
            };
        }

        try {
            // Handle Laravel date format (YYYY-MM-DD)
            let appointmentDate;

            if (typeof date === "string") {
                // Split the date string and create date in local timezone
                const dateParts = date.split("-");
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                    const day = parseInt(dateParts[2]);
                    appointmentDate = new Date(year, month, day);
                } else {
                    appointmentDate = new Date(date);
                }
            } else {
                appointmentDate = new Date(date);
            }

            // Handle time format (HH:MM or HH:MM:SS)
            let formattedTime = "Time not available";
            if (time) {
                const timeParts = time.toString().split(":");
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHour = hours % 12 || 12;
                    formattedTime = `${displayHour}:${minutes} ${ampm}`;
                }
            }

            // Check if date is valid
            if (isNaN(appointmentDate.getTime())) {
                throw new Error("Invalid date");
            }

            const today = new Date();
            const isToday =
                appointmentDate.toDateString() === today.toDateString();

            return {
                date: appointmentDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year:
                        appointmentDate.getFullYear() !== today.getFullYear()
                            ? "numeric"
                            : undefined,
                }),
                time: formattedTime,
                isToday: isToday,
            };
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                date: `${date}`,
                time: `${time}`,
                isToday: false,
            };
        }
    };

    // Handle status updates
    const handleStatusUpdate = async (status, notes = "") => {
        setActionLoading(true);
        try {
            const result =
                await providerAppointmentService.updateAppointmentStatus(
                    appointment.id,
                    status,
                    notes
                );

            if (result.success && onStatusUpdate) {
                onStatusUpdate(result.data);
            }
        } catch (error) {
            console.error("Status update failed:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );

    return (
        <div className="card border-0 shadow-sm mb-3">
            <div className="card-body">
                <div className="row align-items-center">
                    {/* Client & Service Info */}
                    <div className="col-md-6">
                        <div className="d-flex align-items-center mb-2">
                            <div className="client-avatar me-3">
                                <div
                                    className="bg-orange bg-opacity-10 text-orange rounded-circle d-flex align-items-center justify-content-center"
                                    style={{ width: "50px", height: "50px" }}
                                >
                                    {appointment.client_name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </div>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1">
                                    {appointment.client_name}
                                </h6>
                                <p className="text-muted mb-0">
                                    {appointment.service_title}
                                </p>
                            </div>
                        </div>

                        <div className="appointment-details small text-muted">
                            <div className="mb-1">
                                <i className="fas fa-calendar me-2"></i>
                                {dateTime.date} at {dateTime.time}
                                {dateTime.isToday && (
                                    <span className="badge bg-warning ms-2">
                                        Today
                                    </span>
                                )}
                            </div>
                            <div className="mb-1">
                                <i className="fas fa-clock me-2"></i>
                                Duration: {appointment.duration_hours} hour(s)
                            </div>
                            <div>
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {appointment.location_type === "client_address"
                                    ? "Client location"
                                    : "Provider location"}
                            </div>
                        </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="col-md-6 text-end">
                        <div className="mb-2">
                            <span
                                className={`badge ${getStatusBadge(
                                    appointment.status
                                )} px-3 py-2`}
                            >
                                {appointment.status_text}
                            </span>
                        </div>

                        <div className="fw-bold text-orange mb-3">
                            Rs. {appointment.total_price?.toLocaleString()}
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-2 justify-content-end">
                            <Link
                                to={`/provider/appointments/${appointment.id}`}
                                className="btn btn-outline-orange btn-sm"
                            >
                                <i className="fas fa-eye me-1"></i>
                                View
                            </Link>

                            {appointment.status === "pending" && (
                                <>
                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() =>
                                            handleStatusUpdate("confirmed")
                                        }
                                        disabled={actionLoading}
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() =>
                                            handleStatusUpdate(
                                                "cancelled_by_provider",
                                                "Provider cancelled"
                                            )
                                        }
                                        disabled={actionLoading}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Decline
                                    </button>
                                </>
                            )}

                            {appointment.status === "confirmed" && (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        handleStatusUpdate("in_progress")
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-play me-1"></i>
                                    Start
                                </button>
                            )}

                            {appointment.status === "in_progress" && (
                                <button
                                    className="btn btn-info btn-sm"
                                    onClick={() =>
                                        handleStatusUpdate("completed")
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-check-double me-1"></i>
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper function for status badge colors
const getStatusBadge = (status) => {
    const badges = {
        pending: "bg-warning text-dark",
        confirmed: "bg-success text-white",
        in_progress: "bg-primary text-white",
        completed: "bg-info text-white",
        cancelled_by_provider: "bg-danger text-white",
        cancelled_by_client: "bg-danger text-white",
        no_show: "bg-secondary text-white",
    };
    return badges[status] || "bg-secondary text-white";
};

export default AppointmentCard;
