import React, { useState } from "react";
import { Link } from "react-router-dom";

const AppointmentsTable = ({
    appointments = [],
    loading = false,
    onSort,
    sortField,
    sortDirection,
    onAppointmentAction,
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
                text: "Invoice Sent",
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
                text: "Cancelled by Client",
                icon: "fa-times-circle",
            },
            cancelled_by_provider: {
                class: "status-cancelled",
                text: "Cancelled by You",
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
            cancelled_by_staff: {
                class: "status-cancelled",
                text: "Cancelled by Staff",
                icon: "fa-times-circle",
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
                    <p>No appointments match the current filter criteria.</p>
                    <Link to="/provider/services" className="btn btn-orange">
                        <i className="fas fa-plus"></i>
                        Manage Your Services
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
                            <th className="sortable-header">Client</th>
                            <th className="sortable-header">Status</th>
                            <th className="sortable-header">Price</th>
                            <th>Location</th>
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
                                            {appointment.service_title ||
                                                "Service"}
                                        </span>
                                        <span className="service-duration">
                                            {appointment.duration_hours
                                                ? `${appointment.duration_hours}h`
                                                : ""}
                                        </span>
                                    </div>
                                </td>
                                <td className="client-cell">
                                    <div className="client-info">
                                        <span className="client-name">
                                            {appointment.client_name ||
                                                "Client"}
                                        </span>
                                        <span className="client-contact">
                                            {appointment.client_phone ||
                                                appointment.client_email}
                                        </span>
                                    </div>
                                </td>
                                <td className="status-cell">
                                    {getStatusBadge(appointment.status)}
                                    {appointment.has_pending_reschedule && (
                                        <div className="reschedule-indicator">
                                            <i className="fas fa-calendar-alt text-warning"></i>
                                            <small>Reschedule Pending</small>
                                        </div>
                                    )}
                                </td>
                                <td className="price-cell">
                                    <div className="price-info">
                                        <span className="price">
                                            Rs.{" "}
                                            {appointment.total_price?.toLocaleString(
                                                "en-US",
                                                {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }
                                            ) || 0}
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
                                <td className="location-cell">
                                    <div className="location-info">
                                        <span className="location-type">
                                            {appointment.location_type ===
                                            "client_address"
                                                ? "Client Location"
                                                : appointment.location_type ===
                                                  "provider_location"
                                                ? "Your Location"
                                                : appointment.location_type ===
                                                  "custom_location"
                                                ? "Custom Location"
                                                : "Location TBD"}
                                        </span>
                                        {appointment.client_address && (
                                            <small className="location-address">
                                                {appointment.client_address
                                                    .length > 30
                                                    ? `${appointment.client_address.substring(
                                                          0,
                                                          30
                                                      )}...`
                                                    : appointment.client_address}
                                            </small>
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

                                        {appointment.status === "pending" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "confirm",
                                                            appointment
                                                        )
                                                    }
                                                    title="Confirm Appointment"
                                                >
                                                    <i className="fas fa-check me-1"></i>
                                                    Confirm
                                                </button>
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
                                            </>
                                        )}

                                        {appointment.status === "confirmed" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "start",
                                                            appointment
                                                        )
                                                    }
                                                    title="Start Service"
                                                >
                                                    <i className="fas fa-play me-1"></i>
                                                    Start
                                                </button>
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
                                            </>
                                        )}

                                        {appointment.status ===
                                            "in_progress" && (
                                            <button
                                                className="btn btn-sm btn-outline-success"
                                                onClick={() =>
                                                    onAppointmentAction &&
                                                    onAppointmentAction(
                                                        "complete",
                                                        appointment
                                                    )
                                                }
                                                title="Complete Service"
                                            >
                                                <i className="fas fa-check me-1"></i>
                                                Complete
                                            </button>
                                        )}

                                        {appointment.has_pending_reschedule && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "approve_reschedule",
                                                            appointment
                                                        )
                                                    }
                                                    title="Approve Reschedule"
                                                >
                                                    <i className="fas fa-check me-1"></i>
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() =>
                                                        onAppointmentAction &&
                                                        onAppointmentAction(
                                                            "decline_reschedule",
                                                            appointment
                                                        )
                                                    }
                                                    title="Decline Reschedule"
                                                >
                                                    <i className="fas fa-times me-1"></i>
                                                    Decline
                                                </button>
                                            </>
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
                    color: var(--orange);
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
                    background: var(--orange-light);
                    color: var(--orange);
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

                .service-duration {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .client-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .client-name {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                }

                .client-contact {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .location-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .location-type {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                    font-size: var(--text-xs);
                }

                .location-address {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
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
                    background: #0d6efd;
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

                .reschedule-indicator {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    margin-top: var(--space-1);
                    font-size: var(--text-xs);
                    color: var(--warning-color);
                }

                .price {
                    font-weight: var(--font-semibold);
                    color: var(--success-color);
                    white-space: nowrap;
                }

                .actions-cell {
                    text-align: center;
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
