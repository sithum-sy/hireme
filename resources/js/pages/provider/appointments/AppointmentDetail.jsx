import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CompleteServiceModal from "../../../components/provider/appointments/CompleteServiceModal";
import providerAppointmentService from "../../../services/providerAppointmentService";
import ReviewButton from "../../../components/reviews/ReviewButton";
import { useAppointmentPDF } from "../../../components/shared/hooks/useAppointmentPDF";

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // PDF functionality
    const { downloadAppointmentPDF } = useAppointmentPDF("provider");

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        loadAppointmentDetail();
    }, [id]);

    const canStartService = () => {
        if (appointment.status !== "confirmed") return false;

        try {
            const now = new Date();

            const appointmentDate = appointment.appointment_date;
            const appointmentTime = appointment.appointment_time;

            if (!appointmentDate || !appointmentTime) return false;

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

            if (isNaN(appointmentDateTime.getTime())) return false;

            // Allow starting 15 minutes before scheduled time
            // const graceMinutes = 15;
            const graceMinutes = 60 * 24;
            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            return now >= allowedStartTime;
        } catch (error) {
            console.error("Error checking appointment time:", error);
            return false;
        }
    };

    const getTimeUntilStart = () => {
        try {
            const now = new Date();
            const appointmentDate = appointment.appointment_date;
            const appointmentTime = appointment.appointment_time;

            if (!appointmentDate || !appointmentTime) return null;

            let appointmentDateTime;

            if (typeof appointmentDate === "string") {
                let datePart = appointmentDate.includes("T")
                    ? appointmentDate.split("T")[0]
                    : appointmentDate;
                let timePart =
                    typeof appointmentTime === "string" &&
                    appointmentTime.includes("T")
                        ? appointmentTime.split("T")[1].split(".")[0]
                        : appointmentTime.toString();

                appointmentDateTime = new Date(`${datePart}T${timePart}`);
            } else {
                appointmentDateTime = new Date(appointmentDate);
            }

            if (isNaN(appointmentDateTime.getTime())) return null;

            // const graceMinutes = 15;
            const graceMinutes = 60 * 24;
            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            if (now >= allowedStartTime) return null;

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
            return null;
        }
    };

    // Update your handleStatusUpdate function for "in_progress"
    const handleStatusUpdate = async (status, requiresNotes = false) => {
        // Special validation for starting service
        if (status === "in_progress" && !canStartService()) {
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

        if (requiresNotes && !notes.trim()) {
            setPendingAction(status);
            setShowNotesModal(true);
            return;
        }

        setActionLoading(true);
        try {
            const result =
                await providerAppointmentService.updateAppointmentStatus(
                    appointment.id,
                    status,
                    notes
                );

            if (result.success) {
                setAppointment(result.data);
                setNotes("");
                setShowNotesModal(false);
                setPendingAction(null);
            }
        } catch (error) {
            console.error("Status update failed:", error);
        } finally {
            setActionLoading(false);
        }
    };

    // Update the confirmed status action buttons section
    {
        appointment && appointment.status === "confirmed" && (
            <div className="d-flex gap-2">
                <div className="position-relative">
                    <button
                        className={`btn btn-primary ${
                            !canStartService() ? "position-relative" : ""
                        }`}
                        onClick={() => handleStatusUpdate("in_progress")}
                        disabled={actionLoading}
                        title={
                            !canStartService() && getTimeUntilStart()
                                ? `Available in ${getTimeUntilStart()}`
                                : ""
                        }
                    >
                        <i className="fas fa-play me-2"></i>
                        {actionLoading ? "Starting..." : "Start Service"}
                    </button>
                    {!canStartService() && getTimeUntilStart() && (
                        <div className="position-absolute top-0 start-100 translate-middle">
                            <span className="badge bg-warning text-dark">
                                <i className="fas fa-clock"></i>
                            </span>
                        </div>
                    )}
                </div>

                {/* Show time until start info */}
                {!canStartService() && getTimeUntilStart() && (
                    <div className="align-self-center">
                        <small className="text-muted">
                            Available in {getTimeUntilStart()}
                        </small>
                    </div>
                )}

                <button
                    className="btn btn-outline-danger"
                    onClick={() =>
                        handleStatusUpdate("cancelled_by_provider", true)
                    }
                    disabled={actionLoading}
                >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                </button>
            </div>
        );
    }

    const loadAppointmentDetail = async () => {
        setLoading(true);
        try {
            const result =
                await providerAppointmentService.getAppointmentDetail(id);
            if (result.success) {
                setAppointment(result.data);
            } else {
                navigate("/provider/appointments");
            }
        } catch (error) {
            console.error("Failed to load appointment:", error);
            navigate("/provider/appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteService = async (options) => {
        setActionLoading(true);
        try {
            setShowCompleteModal(false); // Close modal immediately

            const result = await providerAppointmentService.completeService(
                appointment.id,
                options
            );

            if (result.success) {
                setAppointment(result.data);

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
            setActionLoading(false);
        }
    };

    const confirmNotesAction = () => {
        if (pendingAction) {
            handleStatusUpdate(pendingAction, false);
        }
    };

    if (loading) {
        return (
            <ProviderLayout>
                <LoadingSpinner message="Loading appointment details..." />
            </ProviderLayout>
        );
    }

    if (!appointment) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <h4 className="text-danger">Appointment not found</h4>
                    <Link
                        to="/provider/appointments"
                        className="btn btn-orange"
                    >
                        Back to Appointments
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    const formatDateTime = (dateString, timeString) => {
        if (!dateString || !timeString) {
            return {
                fullDate: "Date not available",
                time: "Time not available",
                shortDate: "N/A",
            };
        }

        try {
            // Extract date from dateString (handles both YYYY-MM-DD and ISO format)
            let appointmentDate;

            if (typeof dateString === "string") {
                if (dateString.includes("T")) {
                    // Handle ISO datetime format - extract just the date part
                    const datePart = dateString.split("T")[0];
                    const dateParts = datePart.split("-");
                    if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                        const day = parseInt(dateParts[2]);
                        appointmentDate = new Date(year, month, day);
                    }
                } else {
                    // Handle simple date format (YYYY-MM-DD)
                    const dateParts = dateString.split("-");
                    if (dateParts.length === 3) {
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
                        const day = parseInt(dateParts[2]);
                        appointmentDate = new Date(year, month, day);
                    } else {
                        appointmentDate = new Date(dateString);
                    }
                }
            } else {
                appointmentDate = new Date(dateString);
            }

            // Extract time from timeString (handles both HH:MM and ISO format)
            let formattedTime = "Time not available";
            if (timeString) {
                let timeToUse;

                if (
                    typeof timeString === "string" &&
                    timeString.includes("T")
                ) {
                    // Extract time part from ISO datetime format
                    const timePart = timeString.split("T")[1];
                    timeToUse = timePart.split(".")[0]; // Remove milliseconds and Z
                } else {
                    timeToUse = timeString.toString();
                }

                const timeParts = timeToUse.split(":");
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];

                    // Fix: Correct AM/PM logic
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHour =
                        hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

                    formattedTime = `${displayHour}:${minutes} ${ampm}`;
                }
            }

            // Check if date is valid
            if (isNaN(appointmentDate.getTime())) {
                throw new Error("Invalid date");
            }

            return {
                fullDate: appointmentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                time: formattedTime,
                shortDate: appointmentDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
            };
        } catch (error) {
            console.warn("Date formatting error:", error, {
                dateString,
                timeString,
            });
            return {
                fullDate: `${dateString}`,
                time: `${timeString}`,
                shortDate: `${dateString}`,
            };
        }
    };

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

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );

    const pluralize = (count, singular, plural = singular + "s") => {
        return count === 1 ? singular : plural;
    };

    const handleReviewSubmitted = (review) => {
        // Update the appointment state to reflect review submission
        setAppointment((prev) => ({
            ...prev,
            provider_review_submitted: true,
            provider_review: review,
        }));

        // Show success message
        setTimeout(() => {
            alert(
                "Thank you for your review! Your feedback helps us maintain service quality."
            );
        }, 100);
    };

    return (
        <ProviderLayout>
            <div className="appointment-detail-page">
                {/* Header */}
                <div className="page-header d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h2 className="fw-bold mb-2">
                            {appointment.service_title}
                        </h2>
                        <div className="d-flex align-items-center gap-3">
                            <span
                                className={`badge ${getStatusBadge(
                                    appointment.status
                                )} px-3 py-2`}
                            >
                                {appointment.status_text}
                            </span>
                            <span className="text-muted">
                                Appointment #{appointment.id}
                            </span>

                            {/* Add review status indicator */}
                            {appointment.status === "paid" && (
                                <div className="review-status-indicator">
                                    {appointment.provider_review_submitted ? (
                                        <span className="badge bg-warning text-dark">
                                            <i className="fas fa-star me-1"></i>
                                            Review Submitted
                                        </span>
                                    ) : (
                                        <span className="badge bg-outline-warning">
                                            <i className="fas fa-star-half-alt me-1"></i>
                                            Review Pending
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        {appointment.status === "pending" && (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-success"
                                    onClick={() =>
                                        handleStatusUpdate("confirmed")
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-check me-2"></i>
                                    Accept Appointment
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() =>
                                        handleStatusUpdate(
                                            "cancelled_by_provider",
                                            true
                                        )
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Decline
                                </button>
                            </div>
                        )}

                        {appointment.status === "confirmed" && (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={() =>
                                        handleStatusUpdate("in_progress")
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-play me-2"></i>
                                    Start Service
                                </button>
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={() =>
                                        handleStatusUpdate(
                                            "cancelled_by_provider",
                                            true
                                        )
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                            </div>
                        )}

                        {appointment.status === "in_progress" && (
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-success"
                                    onClick={() => setShowCompleteModal(true)}
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-check-double me-2"></i>
                                    {actionLoading
                                        ? "Processing..."
                                        : "Complete Service"}
                                </button>
                                {/* <button
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        handleStatusUpdate("no_show", true)
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-user-times me-2"></i>
                                    No Show
                                </button> */}
                            </div>
                        )}

                        {/* PDF Download Button - Available for all statuses */}
                        <button
                            className="btn btn-outline-secondary ms-2"
                            onClick={() => downloadAppointmentPDF(appointment)}
                            disabled={actionLoading}
                            title="Download appointment details as PDF"
                        >
                            <i className="fas fa-download me-2"></i>
                            Download PDF
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Client Information */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-user me-2 text-orange"></i>
                                    Client Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-2">
                                            {appointment.client_name}
                                        </h6>

                                        {/* Contact Info */}
                                        <div className="contact-info mb-3">
                                            {appointment.client_phone && (
                                                <div className="mb-2">
                                                    <i className="fas fa-phone text-success me-2"></i>
                                                    <a
                                                        href={`tel:${appointment.client_phone}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {
                                                            appointment.client_phone
                                                        }
                                                    </a>
                                                </div>
                                            )}
                                            {appointment.client_email && (
                                                <div className="mb-2">
                                                    <i className="fas fa-envelope text-info me-2"></i>
                                                    <a
                                                        href={`mailto:${appointment.client_email}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {
                                                            appointment.client_email
                                                        }
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {/* Client Notes */}
                                        {appointment.client_notes && (
                                            <div className="client-notes">
                                                <h6 className="fw-semibold">
                                                    Special Instructions:
                                                </h6>
                                                <div className="bg-light rounded p-3">
                                                    <p className="mb-0">
                                                        {
                                                            appointment.client_notes
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* <div className="col-md-4 text-end">
                                        <div className="client-actions">
                                            {appointment.client_phone && (
                                                <a
                                                    href={`tel:${appointment.client_phone}`}
                                                    className="btn btn-success btn-sm mb-2 w-100"
                                                >
                                                    <i className="fas fa-phone me-2"></i>
                                                    Call Client
                                                </a>
                                            )}
                                            <button className="btn btn-outline-primary btn-sm w-100">
                                                <i className="fas fa-comments me-2"></i>
                                                Send Message
                                            </button>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Service Location */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-map-marker-alt me-2 text-orange"></i>
                                    Service Location
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="location-type mb-3">
                                    <span className="badge bg-primary bg-opacity-10 text-primary">
                                        {appointment.location_type ===
                                        "client_address"
                                            ? "At Client Location"
                                            : appointment.location_type ===
                                              "provider_location"
                                            ? "At My Location"
                                            : "Custom Location"}
                                    </span>
                                </div>

                                {appointment.client_address && (
                                    <div className="address-info">
                                        <p className="mb-2">
                                            <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                            {appointment.client_address}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Provider Notes */}
                        {appointment.provider_notes && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-sticky-note me-2 text-orange"></i>
                                        My Notes
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-0">
                                        {appointment.provider_notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Appointment Summary */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-calendar-check me-2"></i>
                                    Appointment Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="summary-item mb-3">
                                    <div className="summary-label text-muted small">
                                        Date & Time
                                    </div>
                                    <div className="summary-value">
                                        <div className="fw-bold">
                                            {dateTime.fullDate}
                                        </div>
                                        <div className="text-success">
                                            <i className="fas fa-clock me-1"></i>
                                            {dateTime.time}
                                        </div>
                                    </div>
                                </div>

                                <div className="summary-item mb-3">
                                    <div className="summary-label text-muted small">
                                        Duration
                                    </div>
                                    <div className="summary-value fw-semibold">
                                        {appointment.duration_hours}{" "}
                                        {pluralize(
                                            appointment.duration_hours,
                                            "hour"
                                        )}
                                    </div>
                                </div>

                                <div className="summary-item">
                                    <div className="summary-label text-muted small">
                                        Payment
                                    </div>
                                    <div className="summary-value">
                                        <div className="fw-bold text-orange h5 mb-0">
                                            Rs.{" "}
                                            {appointment.total_price?.toLocaleString()}
                                        </div>
                                        {appointment.earnings && (
                                            <small className="text-success">
                                                Your earnings: Rs.{" "}
                                                {appointment.earnings.toLocaleString()}
                                            </small>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Review Section (only show when paid) */}
                        {appointment.status === "paid" && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="fw-bold mb-0">
                                        <i className="fas fa-star me-2 text-warning"></i>
                                        Client Review
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {/* Service Completion Info */}
                                    <div className="completion-info mb-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <span className="badge bg-success">
                                                <i className="fas fa-check-circle me-1"></i>
                                                Service Completed
                                            </span>
                                            <small className="text-muted">
                                                Payment received
                                            </small>
                                        </div>

                                        <div className="service-summary bg-light rounded p-2 mb-2">
                                            <div className="row text-center">
                                                <div className="col-4">
                                                    <small className="text-muted d-block">
                                                        Duration
                                                    </small>
                                                    <strong>
                                                        {
                                                            appointment.duration_hours
                                                        }
                                                        h
                                                    </strong>
                                                </div>
                                                <div className="col-4">
                                                    <small className="text-muted d-block">
                                                        Earned
                                                    </small>
                                                    <strong className="text-success">
                                                        Rs.{" "}
                                                        {appointment.earnings?.toLocaleString() ||
                                                            appointment.total_price?.toLocaleString()}
                                                    </strong>
                                                </div>
                                                <div className="col-4">
                                                    <small className="text-muted d-block">
                                                        Client
                                                    </small>
                                                    <strong>
                                                        {
                                                            appointment.client_name.split(
                                                                " "
                                                            )[0]
                                                        }
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Review Call to Action */}
                                    <div className="review-cta text-center">
                                        <p className="text-muted small mb-3">
                                            <i className="fas fa-handshake me-1"></i>
                                            Help us maintain service quality by
                                            sharing your experience with this
                                            client
                                        </p>

                                        <ReviewButton
                                            appointment={appointment}
                                            userType="provider"
                                            onReviewSubmitted={
                                                handleReviewSubmitted
                                            }
                                        />

                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Your review helps other
                                                providers and improves our
                                                platform
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Quick Actions */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-bolt me-2 text-warning"></i>
                                    Quick Actions
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    {appointment.client_phone && (
                                        <a
                                            href={`tel:${appointment.client_phone}`}
                                            className="btn btn-outline-success btn-sm"
                                        >
                                            <i className="fas fa-phone me-2"></i>
                                            Call Client
                                        </a>
                                    )}

                                    {appointment.client_email && (
                                        <a
                                            href={`mailto:${appointment.client_email}`}
                                            className="btn btn-outline-info btn-sm"
                                        >
                                            <i className="fas fa-envelope text-info me-2"></i>
                                            Send Email
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Modal */}
                {showNotesModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            Add Notes
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() =>
                                                setShowNotesModal(false)
                                            }
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={notes}
                                                onChange={(e) =>
                                                    setNotes(e.target.value)
                                                }
                                                placeholder="Add any notes about this status update..."
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                setShowNotesModal(false)
                                            }
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={confirmNotesAction}
                                            disabled={actionLoading}
                                        >
                                            {actionLoading
                                                ? "Updating..."
                                                : "Confirm"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Complete Service Modal */}
                {showCompleteModal && (
                    <CompleteServiceModal
                        appointment={appointment}
                        isOpen={showCompleteModal}
                        onClose={() =>
                            !actionLoading && setShowCompleteModal(false)
                        }
                        onComplete={handleCompleteService}
                    />
                )}
            </div>

            <style>{`
                .summary-item {
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f1f1f1;
                }
                .summary-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .review-section .card {
                    border-left: 4px solid #ffc107;
                }

                .review-cta {
                    background: linear-gradient(
                        135deg,
                        #fff3cd 0%,
                        #ffeaa7 100%
                    );
                    border-radius: 0.5rem;
                    padding: 1rem;
                    margin: -0.5rem;
                    margin-top: 0.5rem;
                }

                .completion-info .service-summary {
                    border: 2px dashed #28a745;
                    background: #f8fff8 !important;
                }

                .review-status-indicator .badge {
                    font-size: 0.75rem;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                .appointment-detail-page .review-section {
                    transition: all 0.3s ease;
                }

                .appointment-detail-page .review-section:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 193, 7, 0.3);
                }
            `}</style>
        </ProviderLayout>
    );
};

export default AppointmentDetail;
