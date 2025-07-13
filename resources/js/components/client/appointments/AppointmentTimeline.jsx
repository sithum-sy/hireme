import React from "react";

const AppointmentTimeline = ({ appointment, timeline = null }) => {
    // Generate timeline based on appointment status if no timeline provided
    const generateTimeline = () => {
        const events = [];
        const createdAt = new Date(appointment.created_at);

        // Appointment Created
        events.push({
            id: 1,
            status: "created",
            title: "Appointment Requested",
            description: appointment.quote_id
                ? `Created from Quote #${appointment.quote_id}`
                : "Direct booking request submitted",
            timestamp: appointment.created_at,
            icon: "fas fa-plus-circle",
            color: "primary",
            completed: true,
        });

        // Status-based events
        if (
            ["confirmed", "in_progress", "completed"].includes(
                appointment.status
            )
        ) {
            events.push({
                id: 2,
                status: "confirmed",
                title: "Appointment Confirmed",
                description: "Provider confirmed your appointment",
                timestamp:
                    appointment.confirmed_at ||
                    new Date(
                        createdAt.getTime() + 2 * 60 * 60 * 1000
                    ).toISOString(),
                icon: "fas fa-check-circle",
                color: "success",
                completed: true,
            });
        }

        if (["in_progress", "completed"].includes(appointment.status)) {
            events.push({
                id: 3,
                status: "started",
                title: "Service Started",
                description: "Provider started the service",
                timestamp:
                    appointment.started_at ||
                    new Date(
                        `${appointment.appointment_date}T${appointment.appointment_time}`
                    ).toISOString(),
                icon: "fas fa-play-circle",
                color: "primary",
                completed: true,
            });
        }

        if (appointment.status === "completed") {
            events.push({
                id: 4,
                status: "completed",
                title: "Service Completed",
                description: "Service has been successfully completed",
                timestamp: appointment.completed_at || new Date().toISOString(),
                icon: "fas fa-check-double",
                color: "info",
                completed: true,
            });

            if (appointment.provider_rating) {
                events.push({
                    id: 5,
                    status: "reviewed",
                    title: "Review Submitted",
                    description: `You rated this service ${appointment.provider_rating} stars`,
                    timestamp:
                        appointment.reviewed_at || new Date().toISOString(),
                    icon: "fas fa-star",
                    color: "warning",
                    completed: true,
                });
            }
        }

        // Cancelled events
        if (appointment.status.startsWith("cancelled")) {
            events.push({
                id: 2,
                status: "cancelled",
                title:
                    appointment.status === "cancelled_by_client"
                        ? "Cancelled by You"
                        : "Cancelled by Provider",
                description:
                    appointment.cancellation_reason ||
                    "Appointment was cancelled",
                timestamp: appointment.cancelled_at || new Date().toISOString(),
                icon: "fas fa-times-circle",
                color: "danger",
                completed: true,
            });
        }

        return events;
    };

    const timelineEvents = timeline || generateTimeline();

    const formatEventTime = (timestamp) => {
        const date = new Date(timestamp);
        return {
            date: date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            }),
        };
    };

    return (
        <div className="appointment-timeline">
            <div className="timeline-container">
                {timelineEvents.map((event, index) => {
                    const eventTime = formatEventTime(event.timestamp);
                    const isLast = index === timelineEvents.length - 1;

                    return (
                        <div key={event.id} className="timeline-event">
                            <div className="timeline-marker-container">
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div
                                        className={`timeline-line ${
                                            event.completed
                                                ? "completed"
                                                : "pending"
                                        }`}
                                    ></div>
                                )}

                                {/* Event Marker */}
                                <div
                                    className={`timeline-marker bg-${
                                        event.color
                                    } ${
                                        event.completed
                                            ? "completed"
                                            : "pending"
                                    }`}
                                >
                                    <i
                                        className={`${event.icon} text-white`}
                                    ></i>
                                </div>
                            </div>

                            {/* Event Content */}
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <h6 className="fw-bold mb-1">
                                        {event.title}
                                    </h6>
                                    <div className="timeline-time text-muted small">
                                        {eventTime.date} at {eventTime.time}
                                    </div>
                                </div>
                                <p className="timeline-description text-muted mb-0">
                                    {event.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .appointment-timeline {
                    position: relative;
                }

                .timeline-event {
                    display: flex;
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .timeline-event:last-child {
                    margin-bottom: 0;
                }

                .timeline-marker-container {
                    position: relative;
                    margin-right: 1rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .timeline-marker {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    position: relative;
                    z-index: 2;
                }

                .timeline-marker.pending {
                    opacity: 0.5;
                    border: 2px solid #dee2e6;
                }

                .timeline-line {
                    width: 2px;
                    background-color: #dee2e6;
                    position: absolute;
                    top: 40px;
                    bottom: -24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1;
                }

                .timeline-line.completed {
                    background-color: #28a745;
                }

                .timeline-content {
                    flex: 1;
                    padding-top: 0.25rem;
                }

                .timeline-header {
                    margin-bottom: 0.5rem;
                }

                .timeline-description {
                    font-size: 0.875rem;
                    line-height: 1.4;
                }

                @media (max-width: 576px) {
                    .timeline-marker {
                        width: 32px;
                        height: 32px;
                    }
                    
                    .timeline-marker i {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default AppointmentTimeline;
