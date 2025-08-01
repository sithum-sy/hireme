import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AppointmentHeader from "../../../components/client/appointments/AppointmentHeader";
import ServiceDetailsCard from "../../../components/client/appointments/ServiceDetailsCard";
import ProviderDetailsCard from "../../../components/client/appointments/ProviderDetailsCard";
import AppointmentSummaryCard from "../../../components/client/appointments/AppointmentSummaryCard";
import ImportantInfoCard from "../../../components/client/appointments/ImportantInfoCard";
import CancelAppointmentModal from "../../../components/client/appointments/CancelAppointmentModal";
import AppointmentUpdateModal from "../../../components/client/appointments/AppointmentUpdateModal";
import ReviewModal from "../../../components/client/appointments/ReviewModal";
import PaymentModal from "../../../components/client/appointments/PaymentModal";
import InvoiceSection from "../../../components/client/appointments/InvoiceSection";
import ContactProvider from "../../../components/client/appointments/ContactProvider";
import clientAppointmentService from "../../../services/clientAppointmentService";
import { useAppointmentPDF } from "../../../components/shared/hooks/useAppointmentPDF";

const AppointmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // PDF functionality
    const { downloadAppointmentPDF } = useAppointmentPDF("client");

    // State management
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateMode, setUpdateMode] = useState("auto");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showContactPanel, setShowContactPanel] = useState(false);

    // Load appointment details on component mount
    useEffect(() => {
        // Scroll to top when component mounts or ID changes
        window.scrollTo(0, 0);
        loadAppointmentDetail();
    }, [id]);

    const loadAppointmentDetail = async () => {
        setLoading(true);
        setError(null);

        try {
            // Try enhanced service first
            const result = await clientAppointmentService.getAppointment(id);

            if (result.success) {
                setAppointment(result.data);
            } else {
                setError(
                    result.message || "Failed to load appointment details"
                );
            }
        } catch (error) {
            console.error(
                "Enhanced service failed, falling back to original API:",
                error
            );

            // Fallback to your existing API
            try {
                const response = await fetch(`/api/client/bookings/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
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
            } catch (fallbackError) {
                console.error("Fallback API also failed:", fallbackError);
                setError("Failed to load appointment. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Check if appointment can be paid
    const canBePaid = () => {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    };

    // Check if appointment can be reviewed
    const canBeReviewed = () => {
        return appointment.status === "paid" && !appointment.client_review;
    };

    // Check if appointment can be cancelled (24 hours before appointment)
    const canBeCancelled = () => {
        if (!["pending", "confirmed"].includes(appointment.status))
            return false;
        if (!appointment.appointment_date || !appointment.appointment_time)
            return false;

        try {
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
                // Fallback: try to parse dateStr properly first
                if (dateStr.includes("-")) {
                    const [year, month, day] = dateStr.split("-");
                    const [hours, minutes] = timeStr
                        ? timeStr.split(":")
                        : [0, 0];
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
            }

            if (isNaN(dateObj.getTime())) {
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

    // Format date and time for display (your existing function)
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return {
                fullDate: "Date not available",
                time: "Time not available",
                shortDate: "N/A",
            };
        }

        try {
            let dateObj;
            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === "string" && date.includes("-")) {
                // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM:SS.sssZ" formats
                let datePart = date;
                if (date.includes("T")) {
                    datePart = date.split("T")[0]; // Extract just the date part
                }
                const [year, month, day] = datePart.split("-");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
            } else {
                // Fallback: try to parse date string properly
                if (typeof date === "string" && date.includes("-")) {
                    let datePart = date;
                    if (date.includes("T")) {
                        datePart = date.split("T")[0]; // Extract just the date part
                    }
                    const [year, month, day] = datePart.split("-");
                    dateObj = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day)
                    );
                } else {
                    dateObj = new Date(date);
                }
            }

            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date");
            }

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

            const result = {
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

            return result;
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                fullDate: date ? date.toString() : "Invalid date",
                time: time ? time.toString() : "Invalid time",
                shortDate: "Invalid",
            };
        }
    };

    // Success handlers - optimized to avoid full reload
    const handlePaymentSuccess = async (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowPaymentModal(false);
        // No need to reload - we already have the updated data
        // await loadAppointmentDetail(); - REMOVED for performance
    };

    const handleReviewSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowReviewModal(false);
    };

    const handleCancellationSuccess = (updatedAppointment) => {
        setAppointment(updatedAppointment);
        setShowCancelModal(false);
    };

    const handleUpdateSuccess = (updatedAppointment) => {
        // Force a new object reference to ensure React re-renders
        setAppointment({ ...updatedAppointment });
        setShowUpdateModal(false);
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
                    <Link to="/client/appointments" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Appointments
                    </Link>
                </div>
            </ClientLayout>
        );
    }

    const canCancel = canBeCancelled();

    return (
        <ClientLayout>
            <div className="appointment-detail-page">
                {/* Header with breadcrumb and actions */}
                <AppointmentHeader
                    appointment={appointment}
                    canBePaid={canBePaid}
                    canBeReviewed={canBeReviewed}
                    canBeCancelled={canCancel}
                    actionLoading={actionLoading}
                    onPaymentClick={() => setShowPaymentModal(true)}
                    onReviewClick={() => setShowReviewModal(true)}
                    onEditClick={() => {
                        setUpdateMode("edit");
                        setShowUpdateModal(true);
                    }}
                    onRescheduleClick={() => {
                        setUpdateMode("reschedule");
                        setShowUpdateModal(true);
                    }}
                    onCancelClick={() => setShowCancelModal(true)}
                    onContactToggle={() =>
                        setShowContactPanel(!showContactPanel)
                    }
                    showContactPanel={showContactPanel}
                    onPrintClick={() => downloadAppointmentPDF(appointment)}
                />

                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Service Details Card */}
                        <ServiceDetailsCard appointment={appointment} />

                        {/* Provider Details Card */}
                        <ProviderDetailsCard appointment={appointment} />

                        {/* Client Notes - Your existing code */}
                        {appointment.client_notes && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-sticky-note me-2 text-primary"></i>
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

                        {/* Reschedule Status Display */}
                        {(appointment.has_pending_reschedule || appointment.latest_reschedule_request) && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-calendar-alt me-2 text-warning"></i>
                                        Reschedule Request Status
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {appointment.has_pending_reschedule && (
                                        <div className="alert alert-warning d-flex align-items-center mb-3">
                                            <i className="fas fa-clock me-2"></i>
                                            <div>
                                                <strong>Reschedule Request Pending</strong>
                                                <div className="small mt-1">
                                                    Your reschedule request is waiting for provider response
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {appointment.latest_reschedule_request && (
                                        <div className="reschedule-info">
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <div className="info-group">
                                                        <label className="form-label fw-semibold text-muted small">
                                                            Original Date & Time:
                                                        </label>
                                                        <div>
                                                            {new Date(appointment.latest_reschedule_request.original_date).toLocaleDateString("en-US", {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}{" "}
                                                            at{" "}
                                                            {new Date(`1970-01-01T${appointment.latest_reschedule_request.original_time}`).toLocaleTimeString("en-US", {
                                                                hour: "numeric",
                                                                minute: "2-digit",
                                                                hour12: true,
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="info-group">
                                                        <label className="form-label fw-semibold text-muted small">
                                                            Requested Date & Time:
                                                        </label>  
                                                        <div className="text-primary fw-bold">
                                                            {new Date(appointment.latest_reschedule_request.requested_date).toLocaleDateString("en-US", {
                                                                weekday: "long", 
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            })}{" "}
                                                            at{" "}
                                                            {new Date(`1970-01-01T${appointment.latest_reschedule_request.requested_time}`).toLocaleTimeString("en-US", {
                                                                hour: "numeric",
                                                                minute: "2-digit", 
                                                                hour12: true,
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {appointment.latest_reschedule_request.reason && (
                                                <div className="info-group mb-3">
                                                    <label className="form-label fw-semibold text-muted small">
                                                        Your Reason:
                                                    </label>
                                                    <div className="bg-light rounded p-3">
                                                        {appointment.latest_reschedule_request.reason}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="info-group mb-3">
                                                        <label className="form-label fw-semibold text-muted small">
                                                            Provider Response:
                                                        </label>
                                                        <div>
                                                            {appointment.latest_reschedule_request.status === "approved" && (
                                                                <span className="badge bg-success px-3 py-2">
                                                                    <i className="fas fa-check me-1"></i>
                                                                    Approved by Provider
                                                                </span>
                                                            )}
                                                            {appointment.latest_reschedule_request.status === "declined" && (
                                                                <span className="badge bg-danger px-3 py-2">
                                                                    <i className="fas fa-times me-1"></i>
                                                                    Declined by Provider
                                                                </span>
                                                            )}
                                                            {appointment.latest_reschedule_request.status === "pending" && (
                                                                <span className="badge bg-warning text-dark px-3 py-2">
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    Awaiting Response
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {appointment.latest_reschedule_request.responded_at && (  
                                                    <div className="col-md-6">
                                                        <div className="info-group mb-3">
                                                            <label className="form-label fw-semibold text-muted small">
                                                                Response Date:
                                                            </label>
                                                            <div className="small">
                                                                {new Date(appointment.latest_reschedule_request.responded_at).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {appointment.latest_reschedule_request.response_notes && (
                                                <div className="info-group">
                                                    <label className="form-label fw-semibold text-muted small">
                                                        Provider's Message:
                                                    </label>
                                                    <div className={`rounded p-3 ${
                                                        appointment.latest_reschedule_request.status === "approved"
                                                            ? "bg-success bg-opacity-10 border border-success border-opacity-25"
                                                            : "bg-danger bg-opacity-10 border border-danger border-opacity-25"
                                                    }`}>
                                                        <div className="d-flex align-items-start">
                                                            <i className={`fas ${
                                                                appointment.latest_reschedule_request.status === "approved" 
                                                                    ? "fa-check-circle text-success" 
                                                                    : "fa-exclamation-circle text-danger"
                                                            } me-2 mt-1`}></i>
                                                            <div>{appointment.latest_reschedule_request.response_notes}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* NEW: Invoice Section */}
                        {appointment.invoice && (
                            <InvoiceSection
                                appointment={appointment}
                                onPaymentClick={() => setShowPaymentModal(true)}
                                canBePaid={canBePaid()}
                            />
                        )}

                        {/* Quote Origin - Your existing code */}
                        {appointment.quote_id && (
                            <div className="card border-0 shadow-sm mb-4 border-info">
                                <div className="card-header bg-info bg-opacity-10 border-bottom border-info">
                                    <h5 className="fw-bold mb-0 text-light">
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

                        {/* NEW: Review Section */}
                        {canBeReviewed() && (
                            <div className="review-section card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-star me-2 text-warning"></i>
                                        Rate Your Experience
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <p className="text-muted mb-3">
                                        How was your experience with this
                                        service? Your feedback helps other
                                        clients make informed decisions.
                                    </p>
                                    <button
                                        className="btn btn-warning"
                                        onClick={() => setShowReviewModal(true)}
                                        disabled={actionLoading}
                                    >
                                        <i className="fas fa-star me-2"></i>
                                        Write Review
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* NEW: Completed Review Section */}
                        {appointment.client_review && (
                            <div className="completed-review-section card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="fw-bold mb-0">
                                        <i className="fas fa-check-circle me-2 text-success"></i>
                                        Your Review
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="rating-display mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`fas fa-star me-1 ${
                                                    i <
                                                    appointment.client_review
                                                        .rating
                                                        ? "text-warning"
                                                        : "text-muted"
                                                }`}
                                            ></i>
                                        ))}
                                        <span className="ms-2 fw-semibold">
                                            {appointment.client_review.rating}{" "}
                                            stars
                                        </span>
                                    </div>
                                    {appointment.client_review.comment && (
                                        <p className="text-muted mb-2">
                                            "{appointment.client_review.comment}
                                            "
                                        </p>
                                    )}
                                    <small className="text-muted">
                                        Reviewed on{" "}
                                        {new Date(
                                            appointment.client_review.created_at
                                        ).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        )}

                        {/* Important Information - Show on larger screens (lg and up) */}
                        <div className="d-none d-lg-block">
                            <ImportantInfoCard
                                appointment={appointment}
                                canCancel={canCancel}
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Appointment Summary - Enhanced with better context */}
                        <AppointmentSummaryCard
                            key={`${appointment.id}-${
                                appointment.appointment_date
                            }-${appointment.appointment_time}-${
                                appointment.total_price
                            }-${appointment.status}-${
                                appointment.location_type
                            }-${appointment.custom_address || ""}-${
                                appointment.custom_city || ""
                            }-${appointment.location_instructions || ""}-${
                                appointment.client_phone || ""
                            }-${appointment.client_email || ""}-${
                                appointment.payment_method || ""
                            }-${
                                appointment.duration_hours || ""
                            }-${JSON.stringify(appointment.invoice || {})}`}
                            appointment={appointment}
                            formatDateTime={formatDateTime}
                        />

                        {/* Important Information - Show on smaller screens (below lg) */}
                        <div className="d-lg-none">
                            <ImportantInfoCard
                                appointment={appointment}
                                canCancel={canCancel}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Provider Panel */}
                {showContactPanel && appointment.status === "confirmed" && (
                    <div className="contact-provider-section mt-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-comments me-2 text-primary"></i>
                                    Contact Provider
                                </h6>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => setShowContactPanel(false)}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                <ContactProvider
                                    appointment={appointment}
                                    onClose={() => setShowContactPanel(false)}
                                    onMessageSent={(messageData) => {
                                        console.log(
                                            "Message sent:",
                                            messageData
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Button */}
                <div className="mt-4 text-center">
                    <Link
                        to="/client/appointments"
                        className="btn btn-outline-secondary"
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to All Appointments
                    </Link>
                </div>
            </div>

            {/* Modals */}
            <CancelAppointmentModal
                show={showCancelModal}
                onHide={() => setShowCancelModal(false)}
                appointment={appointment}
                onCancellationSuccess={handleCancellationSuccess}
            />

            <AppointmentUpdateModal
                show={showUpdateModal}
                onHide={() => setShowUpdateModal(false)}
                appointment={appointment}
                service={appointment?.service}
                provider={appointment?.provider}
                mode={updateMode}
                onUpdateSuccess={handleUpdateSuccess}
            />

            <ReviewModal
                show={showReviewModal}
                onHide={() => setShowReviewModal(false)}
                appointment={appointment}
                onReviewSuccess={handleReviewSuccess}
            />

            <PaymentModal
                show={showPaymentModal}
                onHide={() => setShowPaymentModal(false)}
                appointment={appointment}
                onPaymentSuccess={handlePaymentSuccess}
            />

            {/* Print Styles */}
            <style>{`
               @media print {
                   .action-buttons { display: none !important; }
                   .card { border: 1px solid #ddd !important; }
                   .contact-provider-section { display: none !important; }
               }
           `}</style>
        </ClientLayout>
    );
};

export default AppointmentDetail;
