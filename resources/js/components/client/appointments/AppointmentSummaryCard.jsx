import React from "react";

const AppointmentSummaryCard = ({ appointment, formatDateTime }) => {
    const dateTime = formatDateTime(
        appointment.appointment_date,
        appointment.appointment_time
    );

    const getLocationDisplay = () => {
        const address =
            appointment.custom_address || appointment.client_address || "";
        const city = appointment.custom_city || appointment.client_city || "";
        const fullAddress = address + (city ? ", " + city : "");

        const locationTypes = {
            client_address: "At your location",
            provider_location: "At provider location",
            custom_location: "Custom location",
        };

        const locationType =
            locationTypes[appointment.location_type] ||
            "Location not specified";

        return {
            type: locationType,
            address: fullAddress,
        };
    };

    const location = getLocationDisplay();

    const getNextSteps = () => {
        const status = appointment.status;
        const steps = {
            pending: [
                "Wait for provider confirmation",
                "You'll receive notification once confirmed",
                "Check your email and messages regularly",
            ],
            confirmed: [
                "Appointment is confirmed and scheduled",
                "Provider will contact you before the appointment",
                "Be ready at the scheduled time and location",
            ],
            in_progress: [
                "Service is currently being provided",
                "Rate your experience after completion",
                "Payment will be processed after service",
            ],
            completed: [
                "Service has been completed",
                "Please rate your experience",
                "Invoice will be sent for payment",
            ],
            invoice_sent: [
                "Invoice has been sent to you",
                "Please review and make payment",
                "Payment is due within the specified timeframe",
            ],
            payment_pending: [
                "Payment is being processed",
                "You'll receive confirmation once completed",
                "Contact support if you have payment issues",
            ],
            paid: [
                "Payment has been completed",
                "Please rate your experience if you haven't",
                "Thank you for using our service",
            ],
        };

        return steps[status] || ["Contact support for assistance"];
    };

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
                <h6 className="fw-bold mb-0">
                    <i className="fas fa-calendar-check me-2"></i>
                    Appointment Summary
                </h6>
            </div>
            <div className="card-body">
                {/* Date & Time */}
                <div className="summary-item mb-3">
                    <div className="summary-label text-muted small mb-1">
                        <i className="fas fa-calendar me-1"></i>
                        Scheduled For
                    </div>
                    <div className="summary-value">
                        <div className="fw-bold text-dark">
                            {dateTime.fullDate}
                        </div>
                        <div className="text-success d-flex align-items-center">
                            <i className="fas fa-clock me-1"></i>
                            {dateTime.time}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="summary-item mb-3">
                    <div className="summary-label text-muted small mb-1">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        Service Location
                    </div>
                    <div className="summary-value">
                        <div className="fw-semibold text-dark">
                            {location.type}
                            {" - "}
                        </div>
                        {location.address && (
                            <div className="text-muted small mt-1">
                                {location.address}
                            </div>
                        )}
                        {appointment.location_instructions && (
                            <div className="text-info small mt-1">
                                <i className="fas fa-info-circle me-1"></i>
                                {appointment.location_instructions}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Information */}
                <div className="summary-item mb-3">
                    <div className="summary-label text-muted small mb-1">
                        <i className="fas fa-address-card me-1"></i>
                        Your Contact Details
                    </div>
                    <div className="summary-value">
                        {appointment.client_phone && (
                            <div className="mb-1">
                                <i className="fas fa-phone text-success me-2"></i>
                                <span>
                                    {appointment.client_phone}
                                    {" | "}
                                </span>
                            </div>
                        )}
                        {appointment.client_email && (
                            <div className="mb-1">
                                <i className="fas fa-envelope text-info me-2"></i>
                                <span>{appointment.client_email}</span>
                            </div>
                        )}
                        {/* <div className="text-muted small">
                            <i className="fas fa-bell me-1"></i>
                            Preferred contact:{" "}
                            {appointment.contact_preference === "phone"
                                ? "Phone call"
                                : "Text/WhatsApp"}
                        </div> */}
                    </div>
                </div>

                {/* Payment Information */}
                <div className="summary-item mb-3">
                    <div className="summary-label text-muted small mb-1">
                        <i className="fas fa-credit-card me-1"></i>
                        Payment Information
                    </div>
                    <div className="summary-value">
                        <div className="payment-info">
                            {/* Service Fee */}
                            <div className="d-flex justify-content-between align-items-center mb-2 small">
                                <span className="text-dark">
                                    Base Service Fee
                                </span>
                                <span className="fw-bold">
                                    Rs.{" "}
                                    {appointment.base_price ||
                                        appointment.total_price}
                                    {appointment.service?.pricing_type !==
                                        "fixed" && (
                                        <small className="text-muted d-block fw-normal">
                                            {/* Base Price (per hour) */}
                                        </small>
                                    )}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2 small">
                                <span className="text-dark">
                                    Number of Hours
                                </span>
                                <span className="fw-bold">
                                    {appointment.duration_hours}
                                </span>
                            </div>

                            {/* Additional Charges */}
                            {/* {appointment.travel_fee > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">
                                        Travel Fee
                                    </span>
                                    <span className="fw-medium">
                                        Rs. {appointment.travel_fee}
                                    </span>
                                </div>
                            )}

                            {appointment.additional_charges > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">
                                        Additional Charges
                                    </span>
                                    <span className="fw-medium">
                                        Rs. {appointment.additional_charges}
                                    </span>
                                </div>
                            )} */}

                            {/* {appointment.tax_amount > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-muted small">
                                        Tax ({appointment.tax_rate}%)
                                    </span>
                                    <span className="fw-medium">
                                        Rs. {appointment.tax_amount}
                                    </span>
                                </div>
                            )}

                            {appointment.discount_amount > 0 && (
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="text-success small">
                                        <i className="fas fa-tag me-1"></i>
                                        Discount
                                    </span>
                                    <span className="fw-medium text-success">
                                        -Rs. {appointment.discount_amount}
                                    </span>
                                </div>
                            )} */}

                            {/* Total Amount */}
                            <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                                <span className="fw-bold text-dark">
                                    Total Amount
                                </span>
                                <span className="fw-bold text-primary h6 mb-0">
                                    Rs. {appointment.total_price}
                                </span>
                            </div>

                            {/* Payment Method */}
                            <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                <span className="text-muted small">
                                    <i className="fas fa-wallet me-1"></i>
                                    Payment Method
                                </span>
                                <span className="badge bg-light text-dark ml-2">
                                    {appointment.payment_method === "cash"
                                        ? "Cash Payment"
                                        : appointment.payment_method
                                              ?.charAt(0)
                                              .toUpperCase() +
                                          appointment.payment_method?.slice(1)}
                                </span>
                            </div>

                            {/* Payment Status */}
                            {appointment.invoice && (
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="text-muted small">
                                        Payment Status
                                    </span>
                                    <span
                                        className={`badge ${
                                            appointment.invoice
                                                .payment_status === "pending"
                                                ? "bg-warning text-dark"
                                                : appointment.invoice
                                                      .payment_status ===
                                                  "completed"
                                                ? "bg-success text-white"
                                                : "bg-secondary text-white"
                                        }`}
                                    >
                                        <i
                                            className={`fas ${
                                                appointment.invoice
                                                    .payment_status ===
                                                "pending"
                                                    ? "fa-clock"
                                                    : appointment.invoice
                                                          .payment_status ===
                                                      "completed"
                                                    ? "fa-check"
                                                    : "fa-info"
                                            } me-1`}
                                        ></i>
                                        {appointment.invoice.payment_status
                                            .charAt(0)
                                            .toUpperCase() +
                                            appointment.invoice.payment_status.slice(
                                                1
                                            )}
                                    </span>
                                </div>
                            )}

                            {/* Due Date */}
                            {appointment.invoice?.due_date && (
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <span className="text-muted small">
                                        Due Date
                                    </span>
                                    <span
                                        className={`small ${
                                            appointment.invoice.is_overdue
                                                ? "text-danger fw-medium"
                                                : "text-muted"
                                        }`}
                                    >
                                        {new Date(
                                            appointment.invoice.due_date
                                        ).toLocaleDateString()}
                                        {appointment.invoice.is_overdue && (
                                            <span className="text-danger ms-1">
                                                (
                                                {
                                                    appointment.invoice
                                                        .days_overdue
                                                }{" "}
                                                days overdue)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="summary-item">
                    <div className="summary-label text-muted small mb-1">
                        <i className="fas fa-list-check me-1"></i>
                        What Happens Next
                    </div>
                    <div className="summary-value">
                        <ul className="list-unstyled mb-0">
                            {getNextSteps().map((step, index) => (
                                <li
                                    key={index}
                                    className="small text-muted mb-1"
                                >
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
                .summary-item {
                    padding: var(--space-4);
                    margin-bottom: var(--space-4);
                    background: var(--bg-light);
                    border-radius: var(--border-radius-lg);
                    border-left: 4px solid var(--current-role-primary);
                    transition: var(--transition);
                }
                .summary-item:hover {
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }
                .summary-item:last-child {
                    margin-bottom: 0;
                }
                .summary-label {
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--text-primary) !important;
                    font-size: var(--text-xs);
                }

                /* Invoice-style breakdown */
                .invoice-breakdown {
                    background: var(--bg-white);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                }

                .invoice-header {
                    background: var(--bg-light);
                    padding: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .invoice-title {
                    color: var(--text-primary);
                    font-weight: var(--font-semibold);
                    font-size: var(--text-sm);
                }

                .invoice-items {
                    padding: 0;
                }

                .invoice-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                    gap: var(--space-3);
                }

                .invoice-item:last-child {
                    border-bottom: none;
                }

                .item-details {
                    flex: 1;
                    min-width: 0;
                }

                .item-name {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    display: block;
                    margin-bottom: var(--space-1);
                }

                .item-description {
                    font-size: var(--text-xs);
                    line-height: 1.4;
                }

                .item-amount {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    flex-shrink: 0;
                }

                .quantity {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
                    min-width: 20px;
                }

                .price {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                }

                .invoice-subtotal {
                    background: var(--bg-light);
                    border-top: 2px solid var(--border-color);
                    padding: var(--space-3);
                }

                .subtotal-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-2);
                    font-size: var(--text-sm);
                }

                .subtotal-line:last-child {
                    margin-bottom: 0;
                }

                .invoice-total {
                    background: var(--current-role-light);
                    border-top: 2px solid var(--current-role-primary);
                    padding: var(--space-4);
                }

                .total-line {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .total-label {
                    font-weight: var(--font-bold);
                    color: var(--current-role-primary);
                    font-size: var(--text-base);
                }

                .total-amount {
                    font-weight: var(--font-bold);
                    color: var(--current-role-primary);
                    font-size: var(--text-xl);
                }

                .payment-method {
                    background: var(--bg-white);
                    padding: var(--space-2);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }

                .invoice-status {
                    background: var(--bg-white);
                    padding: var(--space-3);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                    box-shadow: var(--shadow-sm);
                }
                
                /* Mobile responsiveness */
                @media (max-width: 768px) {
                    .summary-item {
                        padding: var(--space-3);
                        margin-bottom: var(--space-3);
                    }

                    .invoice-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--space-1);
                    }

                    .invoice-item {
                        flex-direction: column;
                        gap: var(--space-2);
                        padding: var(--space-2);
                    }

                    .item-amount {
                        align-self: flex-end;
                        background: var(--bg-light);
                        padding: var(--space-1) var(--space-2);
                        border-radius: var(--border-radius-sm);
                    }

                    .invoice-total {
                        padding: var(--space-3);
                    }

                    .total-amount {
                        font-size: var(--text-lg);
                    }

                    .payment-method,
                    .invoice-status {
                        padding: var(--space-2);
                    }
                }

                /* Extra small screens */
                @media (max-width: 576px) {
                    .summary-item {
                        padding: var(--space-2);
                        margin-bottom: var(--space-2);
                    }

                    .invoice-header,
                    .invoice-item,
                    .invoice-subtotal,
                    .invoice-total {
                        padding: var(--space-2);
                    }

                    .invoice-title {
                        font-size: var(--text-xs);
                    }

                    .item-name {
                        font-size: var(--text-xs);
                    }

                    .total-label,
                    .total-amount {
                        font-size: var(--text-base);
                    }
                }
            `}</style>
        </div>
    );
};

export default AppointmentSummaryCard;
