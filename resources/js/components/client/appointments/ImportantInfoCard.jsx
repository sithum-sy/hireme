import React from "react";

const ImportantInfoCard = ({ appointment, canCancel }) => {
    const getStatusSpecificInfo = () => {
        const status = appointment.status;
        const statusInfo = {
            pending: [
                {
                    icon: "fas fa-hourglass-half text-warning",
                    text: "Awaiting provider confirmation - you'll be notified within 24 hours",
                },
                {
                    icon: "fas fa-edit text-info",
                    text: "You can still modify or cancel this appointment",
                },
            ],
            confirmed: [
                {
                    icon: "fas fa-check-circle text-success",
                    text: "Your appointment is confirmed and the provider has been notified",
                },
                {
                    icon: "fas fa-phone text-info",
                    text: "Provider will contact you 30 minutes before the scheduled time",
                },
            ],
            in_progress: [
                {
                    icon: "fas fa-play-circle text-primary",
                    text: "Service is currently being provided",
                },
                {
                    icon: "fas fa-clock text-warning",
                    text: "Please be available for the duration of the service",
                },
            ],
            completed: [
                {
                    icon: "fas fa-check-circle text-success",
                    text: "Service has been completed successfully",
                },
                {
                    icon: "fas fa-star text-warning",
                    text: "Please rate your experience to help other clients",
                },
            ],
            invoice_sent: [
                {
                    icon: "fas fa-file-invoice text-info",
                    text: "Invoice has been received - please review and make payment",
                },
                {
                    icon: "fas fa-calendar-alt text-warning",
                    text: "Payment is due within the specified timeframe",
                },
            ],
            payment_pending: [
                {
                    icon: "fas fa-credit-card text-warning",
                    text: "Payment is being processed - this may take a few minutes",
                },
                {
                    icon: "fas fa-check-circle text-success",
                    text: "You'll receive confirmation once payment is completed",
                },
            ],
            paid: [
                {
                    icon: "fas fa-check-circle text-success",
                    text: "Payment has been completed successfully",
                },
                {
                    icon: "fas fa-heart text-danger",
                    text: "Thank you for using our service!",
                },
            ],
        };

        return statusInfo[status] || [];
    };

    const statusSpecificInfo = getStatusSpecificInfo();

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h6 className="fw-bold mb-0">
                    <i className="fas fa-info-circle text-info me-2"></i>
                    Important Information
                </h6>
            </div>
            <div className="card-body">
                {/* Status-specific information */}
                {statusSpecificInfo.length > 0 && (
                    <div className="status-specific-info mb-4">
                        <h6 className="small fw-bold text-muted mb-2 text-uppercase">
                            Current Status:{" "}
                            {appointment.status_text ||
                                appointment.status.replace("_", " ")}
                        </h6>
                        <ul className="list-unstyled mb-0">
                            {statusSpecificInfo.map((info, index) => (
                                <li key={index} className="mb-2">
                                    <i className={`${info.icon} me-2`}></i>
                                    <span className="small">{info.text}</span>
                                </li>
                            ))}
                        </ul>
                        <hr className="my-3" />
                    </div>
                )}

                {/* General information */}
                <ul className="list-unstyled small text-muted mb-0">
                    <li className="mb-2">
                        <i className="fas fa-clock text-warning me-2"></i>
                        {canCancel
                            ? "Free cancellation up to 24 hours before appointment"
                            : "Cancellation period has passed (24-hour policy)"}
                    </li>
                    <li className="mb-2">
                        <i className="fas fa-shield-alt text-success me-2"></i>
                        This booking is covered by our service guarantee
                    </li>
                    <li className="mb-2">
                        <i className="fas fa-headset text-info me-2"></i>
                        24/7 customer support available for any assistance
                    </li>
                    <li className="mb-2">
                        <i className="fas fa-star text-warning me-2"></i>
                        Rating and feedback helps us maintain service quality
                    </li>
                    {appointment.invoice && (
                        <li className="mb-2">
                            <i className="fas fa-credit-card text-primary me-2"></i>
                            {appointment.invoice.payment_status === "pending"
                                ? "Secure payment processing available online"
                                : "Payment has been securely processed"}
                        </li>
                    )}
                    <li className="mb-2">
                        <i className="fas fa-mobile-alt text-secondary me-2"></i>
                        Keep your phone handy for provider communication
                    </li>
                    <li>
                        <i className="fas fa-print text-secondary me-2"></i>
                        You can print this page for your records
                    </li>
                </ul>

                {/* Emergency contact */}
                <div className="emergency-contact mt-4 p-3 bg-light rounded">
                    <h6 className="small fw-bold text-muted mb-2">
                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                        Need Help?
                    </h6>
                    <div className="small">
                        <div className="mb-1">
                            <i className="fas fa-phone text-success me-2"></i>
                            Emergency Support: <strong>+94 11 123 4567</strong>
                        </div>
                        <div className="mb-1">
                            <i className="fas fa-envelope text-info me-2"></i>
                            Email: <strong>support@hireme.com</strong>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .status-specific-info {
                        margin-bottom: var(--space-3) !important;
                    }

                    .emergency-contact {
                        text-align: center;
                    }

                    .emergency-contact .small div {
                        margin-bottom: var(--space-1);
                    }
                }

                @media (max-width: 576px) {
                    .card-body {
                        padding: var(--space-3);
                    }

                    .emergency-contact {
                        padding: var(--space-2);
                    }

                    .emergency-contact .small {
                        font-size: var(--text-xs);
                    }
                }
            `}</style>
        </div>
    );
};

export default ImportantInfoCard;
