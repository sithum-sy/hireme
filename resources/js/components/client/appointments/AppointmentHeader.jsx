import React from "react";
import { Link } from "react-router-dom";

const AppointmentHeader = ({
    appointment,
    canBePaid,
    canBeReviewed,
    canBeCancelled,
    actionLoading,
    onPaymentClick,
    onReviewClick,
    onEditClick,
    onRescheduleClick,
    onCancelClick,
    onContactToggle,
    showContactPanel,
    onPrintClick,
}) => {
    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            confirmed: "bg-success text-white",
            in_progress: "bg-primary text-white",
            completed: "bg-info text-white",
            invoice_sent: "bg-info text-white",
            payment_pending: "bg-warning text-dark",
            paid: "bg-success text-white",
            reviewed: "bg-success text-white",
            closed: "bg-secondary text-white",
            cancelled_by_client: "bg-danger text-white",
            cancelled_by_provider: "bg-danger text-white",
            no_show: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    return (
        <div className="appointment-header-section">
            {/* Breadcrumb Navigation */}
            {/* <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link
                            to="/client/appointments"
                            className="text-primary text-decoration-none"
                        >
                            My Appointments
                        </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        Appointment #{appointment.id}
                    </li>
                </ol>
            </nav> */}

            {/* Page Header */}
            <div className="page-header d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h2 className="fw-bold mb-2">
                        {appointment.service?.title}
                    </h2>
                    <div className="d-flex align-items-center gap-3 flex-wrap">
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
                                Confirmation: {appointment.confirmation_code}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons d-flex gap-2 flex-wrap mobile-stack">
                    {/* Payment Button */}
                    {canBePaid() && (
                        <button
                            className="btn btn-success"
                            onClick={onPaymentClick}
                            disabled={actionLoading}
                        >
                            <i className="fas fa-credit-card me-2"></i>
                            Pay Invoice
                        </button>
                    )}

                    {/* Review Button */}
                    {canBeReviewed() && (
                        <button
                            className="btn btn-warning"
                            onClick={onReviewClick}
                            disabled={actionLoading}
                        >
                            <i className="fas fa-star me-2"></i>
                            Write Review
                        </button>
                    )}

                    {/* Status-based Actions */}
                    {appointment.status === "pending" && (
                        <>
                            <button
                                className="btn btn-outline-primary me-2"
                                onClick={onEditClick}
                                disabled={actionLoading}
                            >
                                <i className="fas fa-edit me-2"></i>
                                Edit Appointment
                            </button>
                            {canBeCancelled && (
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={onCancelClick}
                                    disabled={actionLoading}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel Appointment
                                </button>
                            )}
                        </>
                    )}

                    {appointment.status === "confirmed" && (
                        <>
                            <button
                                className="btn btn-outline-warning"
                                onClick={onRescheduleClick}
                            >
                                <i className="fas fa-calendar-alt me-2"></i>
                                Request Reschedule
                            </button>
                            <button
                                className="btn btn-outline-info"
                                onClick={onContactToggle}
                            >
                                <i className="fas fa-comments me-2"></i>
                                {showContactPanel
                                    ? "Hide Contact"
                                    : "Contact Provider"}
                            </button>
                            {canBeCancelled && (
                                <button
                                    className="btn btn-outline-danger"
                                    onClick={onCancelClick}
                                >
                                    <i className="fas fa-times me-2"></i>
                                    Cancel
                                </button>
                            )}
                        </>
                    )}

                    {appointment.status === "completed" &&
                        !appointment.provider_rating &&
                        !canBeReviewed() && (
                            <button
                                className="btn btn-outline-success"
                                onClick={onReviewClick}
                            >
                                <i className="fas fa-star me-2"></i>
                                Write Review
                            </button>
                        )}

                    <button
                        className="btn btn-outline-secondary"
                        onClick={onPrintClick}
                    >
                        <i className="fas fa-download me-2"></i>
                        Download PDF
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .page-header {
                        flex-direction: column;
                        gap: var(--space-4);
                        align-items: stretch !important;
                    }

                    .page-header > div:first-child {
                        text-align: center;
                    }

                    .page-header h2 {
                        font-size: var(--text-xl);
                    }

                    .action-buttons {
                        flex-direction: column;
                        width: 100%;
                        gap: var(--space-2) !important;
                    }

                    .action-buttons .btn {
                        width: 100%;
                        justify-content: center;
                    }
                }

                @media (max-width: 576px) {
                    .page-header h2 {
                        font-size: var(--text-lg);
                    }

                    .breadcrumb {
                        font-size: var(--text-xs);
                    }

                    .badge {
                        font-size: var(--text-xs);
                        padding: var(--space-1) var(--space-2);
                    }
                }
            `}</style>
        </div>
    );
};

export default AppointmentHeader;
