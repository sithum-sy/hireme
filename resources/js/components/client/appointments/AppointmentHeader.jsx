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
            pending: {
                class: "bg-warning text-dark",
                text: "Pending",
                icon: "fa-clock",
            },
            confirmed: {
                class: "bg-success text-white",
                text: "Confirmed",
                icon: "fa-check-circle",
            },
            in_progress: {
                class: "bg-primary text-white",
                text: "In Progress",
                icon: "fa-play-circle",
            },
            completed: {
                class: "bg-info text-white",
                text: "Completed",
                icon: "fa-check-double",
            },
            invoice_sent: {
                class: "bg-info text-white",
                text: "Invoice Received",
                icon: "fa-file-invoice",
            },
            payment_pending: {
                class: "bg-warning text-dark",
                text: "Payment Pending",
                icon: "fa-clock",
            },
            paid: {
                class: "bg-success text-white",
                text: "Paid",
                icon: "fa-check",
            },
            reviewed: {
                class: "bg-success text-white",
                text: "Reviewed",
                icon: "fa-star",
            },
            closed: {
                class: "bg-secondary text-white",
                text: "Closed",
                icon: "fa-lock",
            },
            cancelled_by_client: {
                class: "bg-danger text-white",
                text: "Cancelled by You",
                icon: "fa-user-times",
            },
            cancelled_by_provider: {
                class: "bg-danger text-white",
                text: "Cancelled by Provider",
                icon: "fa-user-times",
            },
            no_show: {
                class: "bg-secondary text-white",
                text: "No Show",
                icon: "fa-exclamation-triangle",
            },
        };
        return badges[status] || {
            class: "bg-secondary text-white",
            text: status?.replace("_", " ") || "Unknown",
            icon: "fa-question-circle",
        };
    };

    return (
        <div className="appointment-header-section">
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
                            ).class} px-3 py-2`}
                        >
                            <i className={`fas ${getStatusBadge(appointment.status).icon} me-2`}></i>
                            {appointment.status_text || getStatusBadge(appointment.status).text}
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
