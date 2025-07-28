import React, { useState } from "react";
import { Link } from "react-router-dom";

const AppointmentsTable = ({
    appointments = [],
    loading = false,
    onSort,
    sortField,
    sortDirection,
    onAppointmentAction,
    canCancelAppointment,
}) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatTime = (dateString, timeString) => {
        // If we have a separate time string, use it
        if (timeString) {
            try {
                const timeParts = timeString.toString().split(":");
                if (timeParts.length >= 2) {
                    const hours = parseInt(timeParts[0]);
                    const minutes = timeParts[1];
                    const ampm = hours >= 12 ? "PM" : "AM";
                    const displayHour = hours % 12 || 12;
                    return `${displayHour}:${minutes} ${ampm}`;
                }
            } catch (error) {
                console.warn("Error formatting time:", error);
                return timeString.toString();
            }
        }

        // Fallback to extracting time from date string
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        } catch (error) {
            return "Time not set";
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            pending: {
                class: "status-pending",
                text: "Pending",
                icon: "fa-clock",
            },
            confirmed: {
                class: "status-confirmed",
                text: "Confirmed",
                icon: "fa-check-circle",
            },
            in_progress: {
                class: "status-progress",
                text: "In Progress",
                icon: "fa-spinner",
            },
            completed: {
                class: "status-completed",
                text: "Completed",
                icon: "fa-check",
            },
            invoice_sent: {
                class: "status-invoice-sent",
                text: "Invoice Received",
                icon: "fa-file-invoice",
            },
            payment_pending: {
                class: "status-payment-pending",
                text: "Payment Pending",
                icon: "fa-credit-card",
            },
            paid: {
                class: "status-paid",
                text: "Paid",
                icon: "fa-money-check-alt",
            },
            reviewed: {
                class: "status-reviewed",
                text: "Reviewed",
                icon: "fa-star",
            },
            closed: {
                class: "status-closed",
                text: "Closed",
                icon: "fa-check-double",
            },
            cancelled_by_client: {
                class: "status-cancelled",
                text: "Cancelled by You",
                icon: "fa-times-circle",
            },
            cancelled_by_provider: {
                class: "status-cancelled",
                text: "Cancelled by Provider",
                icon: "fa-times-circle",
            },
            no_show: {
                class: "status-cancelled",
                text: "No Show",
                icon: "fa-user-times",
            },
            disputed: {
                class: "status-disputed",
                text: "Disputed",
                icon: "fa-exclamation-triangle",
            },
            expired: {
                class: "status-expired",
                text: "Expired",
                icon: "fa-hourglass-end",
            },
        };

        const statusInfo = statusMap[status] || {
            class: "status-unknown",
            text: status,
            icon: "fa-question",
        };

        return (
            <span className={`status-badge ${statusInfo.class}`}>
                <i className={`fas ${statusInfo.icon}`}></i>
                {statusInfo.text}
            </span>
        );
    };

    const handleSort = (field) => {
        if (onSort) {
            onSort(field);
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return "fas fa-sort";
        return sortDirection === "asc" ? "fas fa-sort-up" : "fas fa-sort-down";
    };

    if (loading) {
        return (
            <div className="appointments-table-container">
                <div className="table-loading">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p>Loading appointments...</p>
                </div>
            </div>
        );
    }

    if (appointments.length === 0) {
        return (
            <div className="appointments-table-container">
                <div className="table-empty">
                    <div className="empty-icon">
                        <i className="fas fa-calendar-times"></i>
                    </div>
                    <h3>No appointments found</h3>
                    <p>
                        You don't have any appointments matching the current
                        filter.
                    </p>
                    <Link to="/client/services" className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                        Book New Service
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="appointments-table-container">
            <div className="table-responsive">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th className="sortable-header">Date & Time</th>
                            <th className="sortable-header">Service</th>
                            <th className="sortable-header">Provider</th>
                            <th className="sortable-header">Status</th>
                            <th className="sortable-header">Price</th>
                            <th className="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr
                                key={appointment.id}
                                className="appointment-row"
                            >
                                <td className="date-cell">
                                    <div className="date-info">
                                        <span className="date">
                                            {formatDate(
                                                appointment.appointment_date
                                            )}
                                        </span>
                                        <span className="time">
                                            {formatTime(
                                                appointment.appointment_date,
                                                appointment.appointment_time
                                            )}
                                        </span>
                                    </div>
                                </td>
                                <td className="service-cell">
                                    <div className="service-info">
                                        <span className="service-name">
                                            {appointment.service?.name ||
                                                appointment.service?.title ||
                                                "Service"}
                                        </span>
                                        <span className="service-category">
                                            {appointment.service?.category
                                                ?.name ||
                                                appointment.service?.category}
                                        </span>
                                    </div>
                                </td>
                                <td className="provider-cell">
                                    <div className="provider-info">
                                        <span className="provider-name">
                                            {appointment.provider?.full_name ||
                                                `${
                                                    appointment.provider
                                                        ?.first_name || ""
                                                } ${
                                                    appointment.provider
                                                        ?.last_name || ""
                                                }`.trim() ||
                                                appointment.provider?.name ||
                                                "Provider"}
                                        </span>
                                        {(() => {
                                            const rating =
                                                appointment.provider
                                                    ?.provider_profile
                                                    ?.average_rating ||
                                                appointment.provider
                                                    ?.average_rating ||
                                                appointment.provider?.rating;

                                            if (!rating) return null;

                                            const numericRating =
                                                parseFloat(rating);
                                            if (isNaN(numericRating))
                                                return null;

                                            return (
                                                <span className="provider-rating">
                                                    <i className="fas fa-star"></i>
                                                    {numericRating.toFixed(1)}
                                                    {appointment.provider
                                                        ?.provider_profile
                                                        ?.total_reviews && (
                                                        <span className="review-count">
                                                            {" "}
                                                            (
                                                            {
                                                                appointment
                                                                    .provider
                                                                    .provider_profile
                                                                    .total_reviews
                                                            }
                                                            )
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </td>
                                <td className="status-cell">
                                    {getStatusBadge(appointment.status)}
                                </td>
                                <td className="price-cell">
                                    <div className="price-info">
                                        <span className="price">
                                            Rs.{" "}
                                            {appointment.total_price ||
                                                appointment.service?.price ||
                                                0}
                                        </span>
                                        {appointment.booking_source ===
                                            "quote_acceptance" ||
                                        appointment.quote_id ? (
                                            <small className="d-block text-muted">
                                                <i className="fas fa-quote-left text-success me-1"></i>
                                                Quote Price
                                            </small>
                                        ) : (
                                            appointment.duration_hours && (
                                                <small className="d-block text-muted">
                                                    {appointment.duration_hours}{" "}
                                                    {appointment.duration_hours >
                                                    1
                                                        ? "hrs"
                                                        : "hr"}{" "}
                                                    × Rs.{" "}
                                                    {Math.round(
                                                        (appointment.total_price ||
                                                            0) /
                                                            (appointment.duration_hours ||
                                                                1)
                                                    )}
                                                </small>
                                            )
                                        )}
                                    </div>
                                </td>
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() =>
                                                onAppointmentAction &&
                                                onAppointmentAction(
                                                    "view",
                                                    appointment
                                                )
                                            }
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye me-1"></i>
                                            View
                                        </button>

                                        {(appointment.status === "pending" ||
                                            appointment.status ===
                                                "confirmed") && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "reschedule",
                                                            appointment
                                                        )
                                                    }
                                                    title="Reschedule"
                                                >
                                                    <i className="fas fa-calendar-alt me-1"></i>
                                                    Reschedule
                                                </button>
                                                {canCancelAppointment &&
                                                    canCancelAppointment(
                                                        appointment.appointment_date,
                                                        appointment.appointment_time,
                                                        appointment.status
                                                    ) && (
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() =>
                                                                onAppointmentAction &&
                                                                onAppointmentAction(
                                                                    "cancel",
                                                                    appointment
                                                                )
                                                            }
                                                            title="Cancel"
                                                        >
                                                            <i className="fas fa-times me-1"></i>
                                                            Cancel
                                                        </button>
                                                    )}
                                            </>
                                        )}

                                        {appointment.status === "completed" &&
                                            !appointment.review && (
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "review",
                                                            appointment
                                                        )
                                                    }
                                                    title="Leave Review"
                                                >
                                                    <i className="fas fa-star me-1"></i>
                                                    Review
                                                </button>
                                            )}

                                        {appointment.payment_status ===
                                            "pending" && (
                                            <button
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() =>
                                                    onAppointmentAction &&
                                                    onAppointmentAction(
                                                        "pay",
                                                        appointment
                                                    )
                                                }
                                                title="Make Payment"
                                            >
                                                <i className="fas fa-credit-card me-1"></i>
                                                Pay Now
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .appointments-table-container {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                }

                .table-loading,
                .table-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-8);
                    text-align: center;
                    color: var(--text-secondary);
                }

                .table-loading i {
                    color: var(--current-role-primary);
                    margin-bottom: var(--space-3);
                }

                .empty-icon {
                    font-size: 4rem;
                    color: var(--text-muted);
                    margin-bottom: var(--space-4);
                }

                .table-empty h3 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-primary);
                }

                .table-empty p {
                    margin: 0 0 var(--space-4) 0;
                    color: var(--text-secondary);
                }

                .table-responsive {
                    overflow-x: auto;
                }

                .appointments-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: var(--text-sm);
                }

                .appointments-table th {
                    background: var(--bg-light);
                    padding: var(--space-3) var(--space-4);
                    text-align: left;
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                    border-bottom: 2px solid var(--border-color);
                    white-space: nowrap;
                }

                .sortable-header {
                    cursor: pointer;
                    user-select: none;
                    transition: var(--transition);
                    position: relative;
                }

                .sortable-header:hover {
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                }

                .sortable-header i {
                    margin-left: var(--space-2);
                    opacity: 0.5;
                }

                .actions-column {
                    width: 1%;
                    text-align: center;
                }

                .appointments-table td {
                    padding: var(--space-3) var(--space-4);
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }

                .appointment-row {
                    transition: var(--transition);
                }

                .appointment-row:hover {
                    background: var(--bg-light);
                }

                .actions-cell {
                    text-align: center;
                }

                .date-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .date {
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                }

                .time {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .service-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .service-name {
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                }

                .service-category {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .provider-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .provider-name {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                }

                .provider-rating {
                    font-size: var(--text-xs);
                    color: var(--warning-color);
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                }

                .provider-rating .review-count {
                    color: var(--text-muted);
                    font-size: var(--text-xs);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    white-space: nowrap;
                }

                .status-pending {
                    background: var(--warning-color);
                    color: white;
                }

                .status-confirmed {
                    background: var(--info-color);
                    color: white;
                }

                .status-progress {
                    background: var(--current-role-primary);
                    color: white;
                }

                .status-completed {
                    background: var(--success-color);
                    color: white;
                }

                .status-cancelled {
                    background: var(--danger-color);
                    color: white;
                }

                .status-invoice-sent {
                    background: #17a2b8;
                    color: white;
                }

                .status-payment-pending {
                    background: #fd7e14;
                    color: white;
                }

                .status-paid {
                    background: #28a745;
                    color: white;
                }

                .status-reviewed {
                    background: #6f42c1;
                    color: white;
                }

                .status-closed {
                    background: #6c757d;
                    color: white;
                }

                .status-disputed {
                    background: #dc3545;
                    color: white;
                }

                .status-expired {
                    background: #495057;
                    color: white;
                }

                .price {
                    font-weight: var(--font-semibold);
                    color: var(--success-color);
                    white-space: nowrap;
                }

                .action-buttons {
                    display: flex;
                    gap: var(--space-1);
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .action-buttons .btn {
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                    font-size: var(--text-xs);
                    white-space: nowrap;
                }

                .action-buttons .btn:hover {
                    transform: translateY(-1px);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .appointments-table {
                        font-size: var(--text-xs);
                    }

                    .appointments-table th,
                    .appointments-table td {
                        padding: var(--space-2);
                    }

                    .action-buttons {
                        flex-direction: column;
                        gap: var(--space-1);
                        align-items: stretch;
                    }

                    .action-buttons .btn {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default AppointmentsTable;
