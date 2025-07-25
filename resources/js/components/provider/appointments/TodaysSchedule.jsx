import React, { useState, useEffect } from "react";
import providerAppointmentService from "../../../services/providerAppointmentService";

const TodaysSchedule = ({ onAppointmentAction }) => {
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTodaysAppointments();
    }, []);

    const loadTodaysAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            const result = await providerAppointmentService.getTodaysAppointments();
            if (result.success) {
                setTodaysAppointments(result.data || []);
            } else {
                setError(result.message || "Failed to load today's appointments");
            }
        } catch (err) {
            console.error("Error loading today's appointments:", err);
            setError("Failed to load today's appointments");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (dateTimeString, timeString) => {
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
            return new Date(dateTimeString).toLocaleTimeString("en-US", {
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
            cancelled_by_client: {
                class: "status-cancelled",
                text: "Cancelled",
                icon: "fa-times-circle",
            },
            cancelled_by_provider: {
                class: "status-cancelled",
                text: "Cancelled",
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

    if (loading) {
        return (
            <div className="todays-schedule">
                <div className="schedule-header">
                    <h3>
                        <i className="fas fa-calendar-day"></i>
                        Today's Schedule
                    </h3>
                    <p className="schedule-date">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="schedule-loading">
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Loading today's appointments...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="todays-schedule">
                <div className="schedule-header">
                    <h3>
                        <i className="fas fa-calendar-day"></i>
                        Today's Schedule
                    </h3>
                    <p className="schedule-date">
                        {new Date().toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
                <div className="schedule-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{error}</span>
                    <button
                        onClick={loadTodaysAppointments}
                        className="btn btn-sm btn-outline-primary"
                    >
                        <i className="fas fa-redo"></i>
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="todays-schedule">
            <div className="schedule-header">
                <h3>
                    <i className="fas fa-calendar-day"></i>
                    Today's Schedule
                </h3>
                <p className="schedule-date">
                    {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    })}
                </p>
            </div>

            {todaysAppointments.length === 0 ? (
                <div className="schedule-empty">
                    <div className="empty-icon">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <h4>No appointments today</h4>
                    <p>
                        You have a free day! Check your upcoming appointments or
                        manage your availability.
                    </p>
                </div>
            ) : (
                <div className="schedule-list">
                    {todaysAppointments.map((appointment, index) => (
                        <div key={appointment.id || index} className="schedule-item">
                            <div className="schedule-time">
                                <span className="time">
                                    {formatTime(
                                        appointment.appointment_date,
                                        appointment.appointment_time
                                    )}
                                </span>
                                <span className="duration">
                                    {appointment.duration_hours || "1"}h
                                </span>
                            </div>

                            <div className="schedule-details">
                                <h4 className="service-name">
                                    {appointment.service_title || "Service"}
                                </h4>
                                <p className="provider-name">
                                    <i className="fas fa-user"></i>
                                    {appointment.client_name || "Client"}
                                </p>
                                {appointment.client_address && (
                                    <p className="client-address">
                                        <i className="fas fa-map-marker-alt"></i>
                                        {appointment.client_address}
                                    </p>
                                )}
                                <div className="appointment-meta">
                                    {getStatusBadge(appointment.status)}
                                    <span className="price">
                                        Rs. {appointment.total_price || "0"}
                                    </span>
                                </div>
                            </div>

                            <div className="schedule-actions">
                                <button
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() =>
                                        onAppointmentAction &&
                                        onAppointmentAction("view", appointment)
                                    }
                                    title="View Details"
                                >
                                    <i className="fas fa-eye me-1"></i>
                                    View
                                </button>

                                {appointment.status === "pending" && (
                                    <>
                                        <button
                                            className="btn btn-sm btn-success"
                                            onClick={() =>
                                                onAppointmentAction &&
                                                onAppointmentAction(
                                                    "confirm",
                                                    appointment
                                                )
                                            }
                                            title="Confirm"
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
                                    <button
                                        className="btn btn-sm btn-warning"
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
                                )}

                                {appointment.status === "in_progress" && (
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() =>
                                            onAppointmentAction &&
                                            onAppointmentAction(
                                                "complete",
                                                appointment
                                            )
                                        }
                                        title="Complete"
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        Complete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                .todays-schedule {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                    margin-bottom: var(--space-6);
                    box-shadow: var(--shadow-sm);
                    border-left: 4px solid var(--current-role-primary);
                }

                .schedule-header {
                    margin-bottom: var(--space-4);
                    text-align: center;
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .schedule-header h3 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--current-role-primary);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                }

                .schedule-date {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                    font-weight: var(--font-medium);
                }

                .schedule-loading,
                .schedule-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-3);
                    padding: var(--space-6);
                    text-align: center;
                    color: var(--text-secondary);
                }

                .schedule-error {
                    flex-direction: column;
                    color: var(--danger-color);
                }

                .schedule-empty {
                    text-align: center;
                    padding: var(--space-6);
                }

                .empty-icon {
                    font-size: 3rem;
                    color: var(--current-role-light);
                    margin-bottom: var(--space-3);
                }

                .schedule-empty h4 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-primary);
                    font-weight: var(--font-semibold);
                }

                .schedule-empty p {
                    margin: 0;
                    color: var(--text-secondary);
                }

                .schedule-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .schedule-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                    padding: var(--space-4);
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                }

                .schedule-item:hover {
                    border-color: var(--current-role-primary);
                    box-shadow: var(--shadow-sm);
                }

                .schedule-time {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    min-width: 80px;
                    padding: var(--space-2);
                    background: var(--current-role-light);
                    border-radius: var(--border-radius);
                    text-align: center;
                }

                .time {
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: var(--current-role-primary);
                }

                .duration {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                    margin-top: var(--space-1);
                }

                .schedule-details {
                    flex: 1;
                }

                .service-name {
                    margin: 0 0 var(--space-1) 0;
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                }

                .provider-name,
                .client-address {
                    margin: 0 0 var(--space-2) 0;
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                }

                .appointment-meta {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
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

                .price {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    color: var(--success-color);
                }

                .schedule-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                .schedule-actions .btn {
                    padding: var(--space-2);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                }

                .schedule-actions .btn:hover {
                    transform: translateY(-1px);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .schedule-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: var(--space-3);
                    }

                    .schedule-time {
                        min-width: auto;
                        flex-direction: row;
                        justify-content: space-between;
                    }

                    .appointment-meta {
                        justify-content: space-between;
                    }

                    .schedule-actions {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
};

export default TodaysSchedule;
