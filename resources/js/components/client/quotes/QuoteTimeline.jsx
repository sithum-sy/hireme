// components/client/quotes/QuoteTimeline.jsx
import React from "react";

const QuoteTimeline = ({ quote }) => {
    // Generate timeline events based on quote status and data
    const generateTimelineEvents = () => {
        const events = [];

        // Quote requested event
        events.push({
            id: 1,
            status: "requested",
            title: "Quote Requested",
            description: "You submitted a quote request for this service",
            timestamp: quote.created_at,
            icon: "fas fa-paper-plane",
            color: "primary",
            completed: true,
        });

        // Quote sent event (if provider has responded)
        if (
            quote.status === "quoted" ||
            quote.status === "accepted" ||
            quote.status === "declined"
        ) {
            events.push({
                id: 2,
                status: "quoted",
                title: "Quote Received",
                description: `Provider sent you a quote of Rs. ${quote.quoted_price}`,
                timestamp: quote.quoted_at || quote.updated_at,
                icon: "fas fa-file-invoice-dollar",
                color: "info",
                completed: true,
            });
        }

        // Acceptance/Decline events
        if (quote.status === "accepted") {
            events.push({
                id: 3,
                status: "accepted",
                title: "Quote Accepted",
                description:
                    "You accepted this quote and an appointment was created",
                timestamp: quote.accepted_at || quote.updated_at,
                icon: "fas fa-check-circle",
                color: "success",
                completed: true,
            });
        } else if (quote.status === "declined") {
            events.push({
                id: 3,
                status: "declined",
                title: "Quote Declined",
                description: "You declined this quote",
                timestamp: quote.declined_at || quote.updated_at,
                icon: "fas fa-times-circle",
                color: "danger",
                completed: true,
            });
        } else if (quote.status === "expired") {
            events.push({
                id: 3,
                status: "expired",
                title: "Quote Expired",
                description: "Quote validity period has ended",
                timestamp: quote.expires_at,
                icon: "fas fa-calendar-times",
                color: "secondary",
                completed: true,
            });
        } else if (quote.status === "withdrawn") {
            events.push({
                id: 3,
                status: "withdrawn",
                title: "Quote Withdrawn",
                description: "Provider has withdrawn this quote",
                timestamp: quote.withdrawn_at || quote.updated_at,
                icon: "fas fa-undo",
                color: "dark",
                completed: true,
            });
        }

        return events;
    };

    const timelineEvents = generateTimelineEvents();

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
        <div className="quote-timeline">
            <div className="timeline-container">
                {timelineEvents.map((event, index) => {
                    const eventTime = formatEventTime(event.timestamp);
                    const isLast = index === timelineEvents.length - 1;

                    return (
                        <div key={event.id} className="timeline-event">
                            <div className="timeline-marker-container">
                                {/* Timeline Line */}
                                {!isLast && (
                                    <div className="timeline-line completed"></div>
                                )}

                                {/* Event Marker */}
                                <div
                                    className={`timeline-marker bg-${event.color} completed`}
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
                .quote-timeline {
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

                .timeline-line {
                    width: 2px;
                    background-color: #28a745;
                    position: absolute;
                    top: 40px;
                    bottom: -24px;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1;
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

export default QuoteTimeline;
