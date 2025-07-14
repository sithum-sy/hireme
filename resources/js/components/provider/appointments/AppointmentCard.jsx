import React, { useState } from "react";
import { Link } from "react-router-dom";
import CompleteServiceModal from "./CompleteServiceModal";
import providerAppointmentService from "../../../services/providerAppointmentService";

const AppointmentCard = ({ appointment, onStatusUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    // Debug: Log the appointment object to see its structure
    // console.log("Appointment data:", appointment);

    // Helper function to safely get client name
    const getClientName = () => {
        // Try different possible property names
        return (
            appointment?.client?.name ||
            appointment?.client_name ||
            appointment?.client?.first_name +
                " " +
                appointment?.client?.last_name ||
            "Unknown Client"
        );
    };

    // Helper function to safely get service name
    const getServiceName = () => {
        return (
            appointment?.service?.title ||
            appointment?.service_title ||
            appointment?.service?.name ||
            "Unknown Service"
        );
    };

    // Helper function to safely get client initials
    const getClientInitials = () => {
        const clientName = getClientName();
        if (!clientName || clientName === "Unknown Client") return "?";

        try {
            return clientName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .substring(0, 2); // Max 2 initials
        } catch (error) {
            return "?";
        }
    };

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

    // const handleCompleteService = async (options) => {
    //     setLoading(true);
    //     try {
    //         const result = await providerAppointmentService.completeService(
    //             appointment.id,
    //             options
    //         );

    //         if (result.success) {
    //             onStatusUpdate(result.data);

    //             if (result.invoice) {
    //                 const action = options.send_invoice
    //                     ? "created and sent"
    //                     : "created";
    //                 alert(
    //                     `Service completed! Invoice #${result.invoice.invoice_number} has been ${action}.`
    //                 );
    //             } else {
    //                 alert("Service completed successfully!");
    //             }
    //         } else {
    //             alert(result.message || "Failed to complete service");
    //         }
    //     } catch (error) {
    //         alert("Error completing service");
    //         console.error("Error:", error);
    //     }
    //     setLoading(false);
    // };

    const handleCompleteService = async (options) => {
        // Prevent multiple calls
        if (loading) return;

        setLoading(true);

        try {
            // Close modal immediately to prevent flickering
            setShowCompleteModal(false);

            const result = await providerAppointmentService.completeService(
                appointment.id,
                options
            );

            if (result.success) {
                // Update appointment status
                if (onStatusUpdate) {
                    onStatusUpdate(result.data);
                }

                // Show success message
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

    // FIXED: Modal close handler
    const handleCloseModal = () => {
        if (!loading) {
            setShowCompleteModal(false);
        }
    };

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );

    const clientName = getClientName();
    const serviceName = getServiceName();
    const clientInitials = getClientInitials();

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
                                hour(s)
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
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() =>
                                        handleStatusUpdate("in_progress")
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-play me-1"></i>
                                    {actionLoading ? "Starting..." : "Start"}
                                </button>
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
