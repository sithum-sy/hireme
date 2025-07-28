import React, { useState, useEffect } from "react";
import clientAppointmentService from "../../../services/clientAppointmentService";

const TodaysSchedule = ({ onAppointmentAction, canCancelAppointment }) => {
    const [todaysAppointments, setTodaysAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadTodaysAppointments();
    }, []);

    // Add a refresh function that can be called from parent components
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'appointment_created' || e.key === 'appointment_updated') {
                console.log('🔄 TodaysSchedule - Refreshing due to appointment change');
                loadTodaysAppointments();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events
        const handleCustomRefresh = () => {
            console.log('🔄 TodaysSchedule - Manual refresh triggered');
            loadTodaysAppointments();
        };
        
        window.addEventListener('refreshTodaysSchedule', handleCustomRefresh);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('refreshTodaysSchedule', handleCustomRefresh);
        };
    }, []);

    const loadTodaysAppointments = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fix timezone issue - use local date in YYYY-MM-DD format
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayStr = `${year}-${month}-${day}`;
            const response = await clientAppointmentService.getAppointments({
                date_from: todayStr,
                date_to: todayStr,
                per_page: 10,
            });

            if (response.success) {
                setTodaysAppointments(response.data.data || []);
            } else {
                setError(
                    response.message || "Failed to load today's appointments"
                );
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
                        You have a free day! Consider booking a service or enjoy
                        your time off.
                    </p>
                </div>
            ) : (
                <div className="schedule-list">
                    {todaysAppointments.map((appointment) => (
                        <div key={appointment.id} className="schedule-item">
                            <div className="schedule-time">
                                <span className="time">
                                    {formatTime(
                                        appointment.appointment_date,
                                        appointment.appointment_time
                                    )}
                                </span>
                                <span className="duration">
                                    {appointment.duration || "60"} min
                                </span>
                            </div>

                            <div className="schedule-details">
                                <h4 className="service-name">
                                    {appointment.service?.name ||
                                        appointment.service?.title ||
                                        "Service"}
                                </h4>
                                <p className="provider-name">
                                    <i className="fas fa-user"></i>
                                    {appointment.provider?.full_name ||
                                        `${
                                            appointment.provider?.first_name ||
                                            ""
                                        } ${
                                            appointment.provider?.last_name ||
                                            ""
                                        }`.trim() ||
                                        appointment.provider?.name ||
                                        "Provider"}
                                </p>
                                <div className="appointment-meta">
                                    {getStatusBadge(appointment.status)}
                                    <span className="price">
                                        Rs.{" "}
                                        {/* <i className="fas fa-dollar-sign"></i> */}
                                        {appointment.total_price ||
                                            appointment.service?.price ||
                                            0}
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

                                {(appointment.status === "pending" ||
                                    appointment.status === "confirmed") && (
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

                .provider-name {
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
