import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import providerAppointmentService from "../../../services/providerAppointmentService";

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [notes, setNotes] = useState("");
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);

    useEffect(() => {
        loadAppointmentDetail();
    }, [id]);

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

    const handleStatusUpdate = async (status, requiresNotes = false) => {
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

    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return {
                fullDate: "Date not available",
                time: "Time not available",
                shortDate: "N/A",
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
            console.warn("Date formatting error:", error, { date, time });
            return {
                fullDate: `${date}`,
                time: `${time}`,
                shortDate: `${date}`,
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

    return (
        <ProviderLayout>
            <div className="appointment-detail-page">
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link
                                to="/provider/appointments"
                                className="text-orange text-decoration-none"
                            >
                                My Appointments
                            </Link>
                        </li>
                        <li className="breadcrumb-item active">
                            Appointment #{appointment.id}
                        </li>
                    </ol>
                </nav>

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
                                    className="btn btn-info"
                                    onClick={() =>
                                        handleStatusUpdate("completed", true)
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-check-double me-2"></i>
                                    Mark Complete
                                </button>
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        handleStatusUpdate("no_show", true)
                                    }
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-user-times me-2"></i>
                                    No Show
                                </button>
                            </div>
                        )}
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

                                    <div className="col-md-4 text-end">
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
                                    </div>
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
                                        <div className="d-flex gap-2">
                                            <a
                                                href={`https://maps.google.com/?q=${encodeURIComponent(
                                                    appointment.client_address
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                <i className="fas fa-external-link-alt me-2"></i>
                                                Open in Maps
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                                    appointment.client_address
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline-success btn-sm"
                                            >
                                                <i className="fas fa-route me-2"></i>
                                                Get Directions
                                            </a>
                                        </div>
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
                            <div className="card-header bg-orange text-white">
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
                                        {appointment.duration_hours} hour(s)
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

                                    <button className="btn btn-outline-info btn-sm">
                                        <i className="fas fa-comments me-2"></i>
                                        Send Message
                                    </button>

                                    {appointment.client_address && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                                                appointment.client_address
                                            )}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="btn btn-outline-primary btn-sm"
                                        >
                                            <i className="fas fa-route me-2"></i>
                                            Get Directions
                                        </a>
                                    )}

                                    <button
                                        className="btn btn-outline-secondary btn-sm"
                                        onClick={() => window.print()}
                                    >
                                        <i className="fas fa-print me-2"></i>
                                        Print Details
                                    </button>
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
       `}</style>
        </ProviderLayout>
    );
};

export default AppointmentDetail;
