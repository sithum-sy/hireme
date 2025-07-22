import React, { useState } from "react";
import { Link } from "react-router-dom";
import CompleteServiceModal from "./CompleteServiceModal";
import RescheduleRequestModal from "./RescheduleRequestModal";
import providerAppointmentService from "../../../services/providerAppointmentService";
import ReviewButton from "../../reviews/ReviewButton";

const AppointmentCard = ({ appointment, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);

    // Check if appointment has pending reschedule request
    const hasPendingReschedule = () => {
        return appointment.reschedule_request && 
               appointment.reschedule_request.status === 'pending';
    // Check if appointment time has arrived
    const canStartService = () => {

    // Helper functions for formatting
    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            return new Date(dateString).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return dateString;
        }
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
            return timeString;
        }
    };
        if (appointment.status !== "confirmed") return false;

        try {
            const now = new Date();

            // Parse appointment date and time
            const appointmentDate = appointment.appointment_date;
            const appointmentTime = appointment.appointment_time;

            if (!appointmentDate || !appointmentTime) return false;

            // Create appointment datetime
            let appointmentDateTime;

            if (typeof appointmentDate === "string") {
                let datePart;
                if (appointmentDate.includes("T")) {
                    datePart = appointmentDate.split("T")[0];
                } else {
                    datePart = appointmentDate;
                }

                let timePart;
                if (
                    typeof appointmentTime === "string" &&
                    appointmentTime.includes("T")
                ) {
                    timePart = appointmentTime.split("T")[1].split(".")[0];
                } else {
                    timePart = appointmentTime.toString();
                }

                // Combine date and time
                appointmentDateTime = new Date(`${datePart}T${timePart}`);
            } else {
                appointmentDateTime = new Date(appointmentDate);
            }

            if (isNaN(appointmentDateTime.getTime())) {
                console.warn("Invalid appointment datetime");
                return false;
            }

            // Allow starting 15 minutes before scheduled time (grace period)
            const graceMinutes = 15;
            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            return now >= allowedStartTime;
        } catch (error) {
            console.error("Error checking appointment time:", error);
            return false;
        }
    };

    // Get time until appointment can start
    const getTimeUntilStart = () => {
        try {
            const now = new Date();
            const appointmentDate = appointment.appointment_date;
            const appointmentTime = appointment.appointment_time;

            if (!appointmentDate || !appointmentTime) return null;

            let appointmentDateTime;

            if (typeof appointmentDate === "string") {
                let datePart;
                if (appointmentDate.includes("T")) {
                    datePart = appointmentDate.split("T")[0];
                } else {
                    datePart = appointmentDate;
                }

                let timePart;
                if (
                    typeof appointmentTime === "string" &&
                    appointmentTime.includes("T")
                ) {
                    timePart = appointmentTime.split("T")[1].split(".")[0];
                } else {
                    timePart = appointmentTime.toString();
                }

                appointmentDateTime = new Date(`${datePart}T${timePart}`);
            } else {
                appointmentDateTime = new Date(appointmentDate);
            }

            if (isNaN(appointmentDateTime.getTime())) return null;

            const graceMinutes = 15;
            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            if (now >= allowedStartTime) return null; // Can start now

            const timeDiff = allowedStartTime - now;
            const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesUntil = Math.floor(
                (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );

            if (hoursUntil > 0) {
                return `${hoursUntil}h ${minutesUntil}m`;
            } else {
                return `${minutesUntil}m`;
            }
        } catch (error) {
            console.error("Error calculating time until start:", error);
            return null;
        }
    };

    // Your existing helper functions remain the same...
    const getClientName = () => {
        return (
            appointment?.client?.name ||
            appointment?.client_name ||
            appointment?.client?.first_name +
                " " +
                appointment?.client?.last_name ||
            "Unknown Client"
        );
    };

    const getServiceName = () => {
        return (
            appointment?.service?.title ||
            appointment?.service_title ||
            appointment?.service?.name ||
            "Unknown Service"
        );
    };

    const getClientInitials = () => {
        const clientName = getClientName();
        if (!clientName || clientName === "Unknown Client") return "?";

        try {
            return clientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2);
        } catch (error) {
            return "?";
        }
    };

    // Your existing formatDateTime function remains the same...
    const formatDateTime = (dateString, timeString) => {
        // ... your existing code
        if (!dateString || !timeString) {
            return {
                date: "Date not available",
                time: "Time not available",
                isToday: false,
            };
        }

        try {
            let appointmentDate;
            if (typeof dateString === "string") {
                if (dateString.includes("T")) {
                    const datePart = dateString.split("T")[0];
                    const dateParts = datePart.split("-");
                    if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1;
                        const day = parseInt(dateParts[2]);
                        appointmentDate = new Date(year, month, day);
                    }
                } else {
                    const dateParts = dateString.split("-");
                    if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1;
                        const day = parseInt(dateParts[2]);
                        appointmentDate = new Date(year, month, day);
                    }
                }
            } else {
                appointmentDate = new Date(dateString);
            }

            let formattedTime = "Time not available";
            if (timeString) {
                let timeToUse;

                if (
                    typeof timeString === "string" &&
                    timeString.includes("T")
                ) {
                    const timePart = timeString.split("T")[1];
                    timeToUse = timePart.split(".")[0];
                } else {
                    timeToUse = timeString.toString();
                }

                const timeParts = timeToUse.split(":");
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHour =
                        hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                    formattedTime = `${displayHour}:${minutes} ${ampm}`;
                }
            }

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
            console.warn("Date formatting error:", error, {
                dateString,
                timeString,
            });
            return {
                date: `${dateString}`,
                time: `${timeString}`,
                isToday: false,
            };
        }
    };

    // Your existing event handlers remain the same...
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

    const handleCompleteService = async (options) => {
        if (loading) return;

        setLoading(true);

        try {
            setShowCompleteModal(false);

            const result = await providerAppointmentService.completeService(
                appointment.id,
                options
            );

            if (result.success) {
                if (onStatusUpdate) {
                    onStatusUpdate(result.data);
                }

                if (result.invoice) {
                    const action = options.send_invoice
                        ? "created and sent"
                        : "created";
                    setTimeout(() => {
                        alert(
                            `Service completed! Invoice #${result.invoice.invoice_number} has been ${action}.`
                        );
                    }, 100);
                } else {
                    setTimeout(() => {
                        alert("Service completed successfully!");
                    }, 100);
                }
            } else {
                alert(result.message || "Failed to complete service");
            }
        } catch (error) {
            console.error("Error completing service:", error);
            alert("Error completing service");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        if (!loading) {
            setShowCompleteModal(false);
        }
    };

    // Enhanced start service handler
    const handleStartService = () => {
        if (!canStartService()) {
            const timeUntil = getTimeUntilStart();
            if (timeUntil) {
                alert(
                    `You can start this service in ${timeUntil} (15 minutes before scheduled time).`
                );
            } else {
                alert(
                    "This service cannot be started yet. Please wait until the scheduled time."
                );
            }
            return;
        }

        handleStatusUpdate("in_progress");
    };

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );
    const pluralize = (count, singular, plural = singular + "s") => {
        return count === 1 ? singular : plural;
    };

    const clientName = getClientName();
    const serviceName = getServiceName();
    const clientInitials = getClientInitials();
    const canStart = canStartService();
    const timeUntilStart = getTimeUntilStart();

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
                                    {clientInitials}
                                </div>
                            </div>
                            <div>
                                <h6 className="fw-bold mb-1">{clientName}</h6>
                                <p className="text-muted mb-0">{serviceName}</p>
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
                                Duration: {appointment.duration_hours ||
                                    "N/A"}{" "}
                                {pluralize(appointment.duration_hours, "hour")}
                            </div>
                            <div>
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {appointment.location_type === "client_address"
                                    ? "Client location"
                                    : appointment.location_type ===
                                      "provider_location"
                                    ? "Provider location"
                                    : "Location TBD"}
                            </div>

                            {/* Time until start warning */}
                            {appointment.status === "confirmed" &&
                                !canStart &&
                                timeUntilStart && (
                                    <div className="mt-2">
                                        <span className="badge bg-info">
                                            <i className="fas fa-clock me-1"></i>
                                            Can start in {timeUntilStart}
                                        </span>
                                    </div>
                                )}

                            {/* Reschedule Request Alert */}
                            {hasPendingReschedule() && (
                                <div className="mt-2">
                                    <div className="alert alert-warning py-2 mb-0 d-flex align-items-center justify-content-between">
                                        <div>
                                            <i className="fas fa-calendar-alt me-2"></i>
                                            <strong>Reschedule Request Pending</strong>
                                            <br />
                                            <small>
                                                New: {formatDate(appointment.reschedule_request.requested_date)} at {formatTime(appointment.reschedule_request.requested_time)}
                                            </small>
                                        </div>
                                        <button
                                            className="btn btn-warning btn-sm ms-2"
                                            onClick={() => setShowRescheduleModal(true)}
                                            disabled={actionLoading}
                                        >
                                            <i className="fas fa-eye me-1"></i>
                                            Review
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                {appointment.status_text ||
                                    appointment.status ||
                                    "Unknown"}
                            </span>
                        </div>

                        <div className="fw-bold text-orange mb-3">
                            Rs.{" "}
                            {appointment.total_price?.toLocaleString() || "0"}
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
                                        {actionLoading
                                            ? "Loading..."
                                            : "Accept"}
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
                                <div className="position-relative">
                                    <button
                                        className={`btn btn-primary btn-sm ${
                                            !canStart ? "position-relative" : ""
                                        }`}
                                        onClick={handleStartService}
                                        disabled={actionLoading}
                                        title={
                                            !canStart && timeUntilStart
                                                ? `Available in ${timeUntilStart}`
                                                : ""
                                        }
                                    >
                                        <i className="fas fa-play me-1"></i>
                                        {actionLoading
                                            ? "Starting..."
                                            : "Start"}
                                    </button>
                                    {!canStart && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                                            <i className="fas fa-clock"></i>
                                        </span>
                                    )}
                                </div>
                            )}

                            {appointment.status === "in_progress" && (
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => setShowCompleteModal(true)}
                                    disabled={loading}
                                >
                                    <i className="fas fa-check me-1"></i>
                                    {loading
                                        ? "Processing..."
                                        : "Complete Service"}
                                </button>
                            )}

                            {appointment.status === "paid" && (
                                <div className="review-section mt-2 pt-2 border-top">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            <i className="fas fa-star me-1"></i>
                                            Service completed - Please review
                                            your client
                                        </small>
                                        <ReviewButton
                                            appointment={appointment}
                                            userType="provider" // ✅ Provider reviews client
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showCompleteModal && (
                <CompleteServiceModal
                    appointment={appointment}
                    isOpen={showCompleteModal}
                    onClose={handleCloseModal}
                    onComplete={handleCompleteService}
                />
            )}

            {showRescheduleModal && (
                <RescheduleRequestModal
                    show={showRescheduleModal}
                    onHide={() => setShowRescheduleModal(false)}
                    appointment={appointment}
                    onResponseSuccess={onStatusUpdate}
                />
            )}
        </div>
    );
};

// Helper function for status badge colors (remains the same)
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
