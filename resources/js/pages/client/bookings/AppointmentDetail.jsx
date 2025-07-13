import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Load appointment details on component mount
    useEffect(() => {
        loadAppointmentDetail();
    }, [id]);

    const loadAppointmentDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            // Use your existing API endpoint
            const response = await fetch(`/api/client/bookings/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointment(data.data);
            } else if (response.status === 404) {
                setError("Appointment not found");
            } else {
                setError("Failed to load appointment details");
            }
        } catch (error) {
            console.error("Failed to load appointment:", error);
            setError("Failed to load appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle appointment cancellation
    const handleCancelAppointment = async () => {
        if (!confirm("Are you sure you want to cancel this appointment?")) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/client/bookings/${id}/cancel`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointment(data.data);
                alert("Appointment cancelled successfully");
            } else {
                const errorData = await response.json();
                alert(errorData.message || "Failed to cancel appointment");
            }
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
            alert("Failed to cancel appointment. Please try again.");
        } finally {
            setActionLoading(false);
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

    // Format date and time for display
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return {
                fullDate: "Date not available",
                time: "Time not available",
                shortDate: "N/A",
            };
        }

        try {
            // Handle different date formats from Laravel
            let dateObj;

            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === "string" && date.includes("-")) {
                const [year, month, day] = date.split("-");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
            } else {
                dateObj = new Date(date);
            }

            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date");
            }

            // Format time
            let formattedTime = "Time not available";
            if (time) {
                try {
                    const timeParts = time.toString().split(":");
                    if (timeParts.length >= 2) {
                        const hours = parseInt(timeParts[0]);
                        const minutes = timeParts[1];
                        const ampm = hours >= 12 ? "PM" : "AM";
                        const displayHour = hours % 12 || 12;
                        formattedTime = `${displayHour}:${minutes} ${ampm}`;
                    }
                } catch (timeError) {
                    formattedTime = time.toString();
                }
            }

            return {
                fullDate: dateObj.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                }),
                time: formattedTime,
                shortDate: dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }),
            };
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                fullDate: date ? date.toString() : "Invalid date",
                time: time ? time.toString() : "Invalid time",
                shortDate: "Invalid",
            };
        }
    };
    // Check if appointment can be cancelled (24 hours before appointment)
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

    // Loading state
    if (loading) {
        return (
            <ClientLayout>
                <LoadingSpinner message="Loading appointment details..." />
            </ClientLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <ClientLayout>
                <div className="error-state text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                    <h4 className="text-danger">{error}</h4>
                    <p className="text-muted">
                        Please check the appointment ID and try again.
                    </p>
                    <Link to="/client/appointments" className="btn btn-purple">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Appointments
                    </Link>
                </div>
            </ClientLayout>
        );
    }

    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );
    const canCancel = canBeCancelled(
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.status
    );

    return (
        <ClientLayout>
            <div className="appointment-detail-page">
                {/* Breadcrumb Navigation */}
                <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <Link
                                to="/client/appointments"
                                className="text-purple text-decoration-none"
                            >
                                My Appointments
                            </Link>
                        </li>
                        <li className="breadcrumb-item active">
                            Appointment #{appointment.id}
                        </li>
                    </ol>
                </nav>

                {/* Page Header */}
                <div className="page-header d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h2 className="fw-bold mb-2">
                            {appointment.service?.title}
                        </h2>
                        <div className="d-flex align-items-center gap-3">
                            <span
                                className={`badge ${getStatusBadge(
                                    appointment.status
                                )} px-3 py-2`}
                            >
                                {appointment.status_text ||
                                    appointment.status.replace("_", " ")}
                            </span>
                            <span className="text-muted">
                                Appointment #{appointment.id}
                            </span>
                            {appointment.confirmation_code && (
                                <span className="text-muted">
                                    Confirmation:{" "}
                                    {appointment.confirmation_code}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="action-buttons">
                        {appointment.status === "pending" && canCancel && (
                            <button
                                className="btn btn-outline-danger me-2"
                                onClick={handleCancelAppointment}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-times me-2"></i>
                                        Cancel Appointment
                                    </>
                                )}
                            </button>
                        )}

                        {appointment.status === "confirmed" && canCancel && (
                            <>
                                <button className="btn btn-outline-warning me-2">
                                    <i className="fas fa-edit me-2"></i>
                                    Request Reschedule
                                </button>
                                <button
                                    className="btn btn-outline-danger me-2"
                                    onClick={handleCancelAppointment}
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                            </>
                        )}

                        {appointment.status === "completed" &&
                            !appointment.provider_rating && (
                                <button className="btn btn-outline-success me-2">
                                    <i className="fas fa-star me-2"></i>
                                    Write Review
                                </button>
                            )}

                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => window.print()}
                        >
                            <i className="fas fa-print me-2"></i>
                            Print
                        </button>
                    </div>
                </div>

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Service Details Card */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-concierge-bell me-2 text-purple"></i>
                                    Service Details
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-8">
                                        <h6 className="fw-bold mb-2">
                                            {appointment.service?.title}
                                        </h6>
                                        <p className="text-muted mb-3">
                                            {appointment.service?.description ||
                                                "Service description not available"}
                                        </p>

                                        {/* Service Category */}
                                        {appointment.service?.category && (
                                            <div className="mb-3">
                                                <span
                                                    className={`badge bg-${
                                                        appointment.service
                                                            .category.color ||
                                                        "primary"
                                                    } bg-opacity-10 text-${
                                                        appointment.service
                                                            .category.color ||
                                                        "primary"
                                                    }`}
                                                >
                                                    <i
                                                        className={`${
                                                            appointment.service
                                                                .category
                                                                .icon ||
                                                            "fas fa-tag"
                                                        } me-1`}
                                                    ></i>
                                                    {
                                                        appointment.service
                                                            .category.name
                                                    }
                                                </span>
                                            </div>
                                        )}

                                        {/* Duration */}
                                        <div className="service-meta">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-clock text-muted me-2"></i>
                                                <span>
                                                    Duration:{" "}
                                                    {appointment.duration_hours}{" "}
                                                    hour
                                                    {appointment.duration_hours >
                                                    1
                                                        ? "s"
                                                        : ""}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Image */}
                                    <div className="col-md-4 text-center">
                                        {appointment.service
                                            ?.first_image_url ? (
                                            <img
                                                src={
                                                    appointment.service
                                                        .first_image_url
                                                }
                                                alt={appointment.service.title}
                                                className="img-fluid rounded"
                                                style={{
                                                    maxHeight: "120px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                                style={{ height: "120px" }}
                                            >
                                                <i className="fas fa-image fa-2x text-muted"></i>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Provider Details Card */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-user me-2 text-purple"></i>
                                    Service Provider
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <div className="d-flex align-items-center mb-3">
                                            {/* Provider Avatar */}
                                            <div className="provider-avatar me-3">
                                                {appointment.provider
                                                    ?.profile_picture ? (
                                                    <img
                                                        src={
                                                            appointment.provider
                                                                .profile_picture
                                                        }
                                                        alt={`${appointment.provider.first_name} ${appointment.provider.last_name}`}
                                                        className="rounded-circle"
                                                        style={{
                                                            width: "60px",
                                                            height: "60px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "60px",
                                                            height: "60px",
                                                        }}
                                                    >
                                                        <i className="fas fa-user fa-lg"></i>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Provider Info */}
                                            <div>
                                                <h6 className="fw-bold mb-1">
                                                    {
                                                        appointment.provider
                                                            ?.first_name
                                                    }{" "}
                                                    {
                                                        appointment.provider
                                                            ?.last_name
                                                    }
                                                </h6>
                                                {appointment.provider
                                                    ?.provider_profile
                                                    ?.business_name && (
                                                    <div className="text-muted small mb-1">
                                                        {
                                                            appointment.provider
                                                                .provider_profile
                                                                .business_name
                                                        }
                                                    </div>
                                                )}
                                                <div className="d-flex align-items-center">
                                                    <i className="fas fa-star text-warning me-1"></i>
                                                    <span className="me-2">
                                                        {appointment.provider
                                                            ?.provider_profile
                                                            ?.average_rating ||
                                                            0}
                                                    </span>
                                                    <span className="text-muted small">
                                                        (
                                                        {appointment.provider
                                                            ?.provider_profile
                                                            ?.total_reviews ||
                                                            0}{" "}
                                                        reviews)
                                                    </span>
                                                    {appointment.provider
                                                        ?.provider_profile
                                                        ?.verification_status ===
                                                        "verified" && (
                                                        <span className="badge bg-success bg-opacity-10 text-success ms-2">
                                                            <i className="fas fa-check-circle me-1"></i>
                                                            Verified
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="provider-contact">
                                            {appointment.provider
                                                ?.contact_number && (
                                                <div className="mb-2">
                                                    <i className="fas fa-phone text-muted me-2"></i>
                                                    <a
                                                        href={`tel:${appointment.provider.contact_number}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {
                                                            appointment.provider
                                                                .contact_number
                                                        }
                                                    </a>
                                                </div>
                                            )}
                                            {appointment.provider?.email && (
                                                <div className="mb-2">
                                                    <i className="fas fa-envelope text-muted me-2"></i>
                                                    <a
                                                        href={`mailto:${appointment.provider.email}`}
                                                        className="text-decoration-none"
                                                    >
                                                        {
                                                            appointment.provider
                                                                .email
                                                        }
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact Actions */}
                                    <div className="col-md-4 text-end">
                                        <div className="contact-actions">
                                            {appointment.provider
                                                ?.contact_number && (
                                                <a
                                                    href={`tel:${appointment.provider.contact_number}`}
                                                    className="btn btn-outline-success btn-sm mb-2 w-100"
                                                >
                                                    <i className="fas fa-phone me-2"></i>
                                                    Call Provider
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

                        {/* Client Notes */}
                        {appointment.client_notes && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-sticky-note me-2 text-purple"></i>
                                        Special Instructions
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-0">
                                        {appointment.client_notes}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quote Origin */}
                        {appointment.quote_id && (
                            <div className="card border-0 shadow-sm mb-4 border-info">
                                <div className="card-header bg-info bg-opacity-10 border-bottom border-info">
                                    <h5 className="fw-bold mb-0 text-info">
                                        <i className="fas fa-quote-left me-2"></i>
                                        Quote Information
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="mb-2">
                                        This appointment was created from Quote
                                        #{appointment.quote_id}
                                    </p>
                                    <Link
                                        to={`/client/quotes/${appointment.quote_id}`}
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-external-link-alt me-2"></i>
                                        View Original Quote
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Appointment Summary */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-purple text-white">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-calendar-check me-2"></i>
                                    Appointment Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                {/* Date & Time */}
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

                                {/* Location */}
                                <div className="summary-item mb-3">
                                    <div className="summary-label text-muted small">
                                        Service Location
                                    </div>
                                    <div className="summary-value">
                                        <div className="fw-semibold">
                                            {appointment.location_type ===
                                                "client_address" &&
                                                "At your location"}
                                            {appointment.location_type ===
                                                "provider_location" &&
                                                "At provider location"}
                                            {appointment.location_type ===
                                                "custom_location" &&
                                                "Custom location"}
                                        </div>
                                        {appointment.client_address && (
                                            <div className="text-muted small mt-1">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                {appointment.client_address}
                                                {appointment.client_city &&
                                                    `, ${appointment.client_city}`}
                                            </div>
                                        )}
                                        {appointment.location_instructions && (
                                            <div className="text-muted small mt-1">
                                                <i className="fas fa-info-circle me-1"></i>
                                                {
                                                    appointment.location_instructions
                                                }
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="summary-item mb-3">
                                    <div className="summary-label text-muted small">
                                        Your Contact Info
                                    </div>
                                    <div className="summary-value">
                                        {appointment.client_phone && (
                                            <div className="mb-1">
                                                <i className="fas fa-phone text-success me-2"></i>
                                                {appointment.client_phone}
                                            </div>
                                        )}
                                        {appointment.client_email && (
                                            <div className="mb-1">
                                                <i className="fas fa-envelope text-info me-2"></i>
                                                {appointment.client_email}
                                            </div>
                                        )}
                                        <div className="text-muted small">
                                            Preferred contact:{" "}
                                            {appointment.contact_preference ===
                                            "phone"
                                                ? "Phone call"
                                                : "Text/WhatsApp"}
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div className="summary-item">
                                    <div className="summary-label text-muted small">
                                        Payment
                                    </div>
                                    <div className="summary-value">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span>Service fee</span>
                                            <span>
                                                Rs.{" "}
                                                {appointment.base_price ||
                                                    appointment.total_price}
                                            </span>
                                        </div>
                                        {appointment.travel_fee > 0 && (
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="text-warning">
                                                    Travel fee
                                                </span>
                                                <span className="text-warning">
                                                    Rs. {appointment.travel_fee}
                                                </span>
                                            </div>
                                        )}
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between fw-bold">
                                            <span>Total Amount</span>
                                            <span className="text-purple h5 mb-0">
                                                Rs. {appointment.total_price}
                                            </span>
                                        </div>
                                        <div className="text-muted small mt-1">
                                            Payment method:{" "}
                                            {appointment.payment_method ===
                                            "cash"
                                                ? "Cash"
                                                : appointment.payment_method}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Information */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-info-circle text-info me-2"></i>
                                    Important Information
                                </h6>
                            </div>
                            <div className="card-body">
                                <ul className="list-unstyled small text-muted mb-0">
                                    <li className="mb-2">
                                        <i className="fas fa-clock text-warning me-2"></i>
                                        {canCancel
                                            ? "Free cancellation up to 24 hours before appointment"
                                            : "Cancellation period has passed"}
                                    </li>
                                    <li className="mb-2">
                                        <i className="fas fa-shield-alt text-success me-2"></i>
                                        This booking is covered by our service
                                        guarantee
                                    </li>
                                    <li className="mb-2">
                                        <i className="fas fa-phone text-info me-2"></i>
                                        Provider will contact you to confirm
                                        details
                                    </li>
                                    <li>
                                        <i className="fas fa-star text-warning me-2"></i>
                                        Don't forget to rate your experience
                                        after the service
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Button */}
                <div className="mt-4">
                    <Link
                        to="/client/appointments"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to All Appointments
                    </Link>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
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
                .summary-item {
                    padding-bottom: 0.75rem;
                    border-bottom: 1px solid #f1f1f1;
                }
                .summary-item:last-child {
                    border-bottom: none;
                    padding-bottom: 0;
                }
                .provider-avatar img {
                    border: 3px solid #f8f9fa;
                }
                @media print {
                    .action-buttons { display: none !important; }
                    .card { border: 1px solid #ddd !important; }
                }
            `}</style>
        </ClientLayout>
    );
};

export default AppointmentDetail;
