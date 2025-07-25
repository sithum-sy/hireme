// components/client/appointments/InvoiceSection.jsx
import React from "react";

const InvoiceSection = ({ appointment, onPaymentClick, canBePaid }) => {
    const invoice = appointment.invoice;

    if (!invoice) return null;

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            processing: "bg-info text-white",
            completed: "bg-success text-white",
            failed: "bg-danger text-white",
            refunded: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="invoice-section card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">
                        <i className="fas fa-file-invoice me-2 text-info"></i>
                        Invoice Details
                    </h5>
                    <span
                        className={`badge ${getPaymentStatusBadge(
                            invoice.payment_status
                        )}`}
                    >
                        {invoice.payment_status_text || invoice.payment_status}
                    </span>
                </div>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-8">
                        {/* Invoice Number */}
                        {invoice.formatted_invoice_number && (
                            <div className="mb-3">
                                <small className="text-muted">
                                    Invoice Number:
                                </small>
                                <div className="fw-semibold">
                                    {invoice.formatted_invoice_number}
                                </div>
                            </div>
                        )}

                        {/* Invoice Items */}
                        <div className="invoice-items mb-3">
                            <small className="text-muted">Invoice Items:</small>
                            {invoice.line_items &&
                            invoice.line_items.length > 0 ? (
                                invoice.line_items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="d-flex justify-content-between py-2 border-bottom"
                                    >
                                        <div>
                                            <div className="fw-semibold">
                                                {item.description}
                                            </div>
                                            {item.quantity > 1 && (
                                                <small className="text-muted">
                                                    Qty: {item.quantity} ×{" "}
                                                    {formatCurrency(item.rate)}
                                                </small>
                                            )}
                                        </div>
                                        <div className="fw-semibold">
                                            {formatCurrency(item.amount)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="d-flex justify-content-between py-2">
                                    <span>
                                        {appointment.service?.title ||
                                            "Service"}
                                    </span>
                                    <span>
                                        {formatCurrency(
                                            appointment.total_price
                                        )}
                                    </span>
                                </div>
                            )}

                            {/* Total */}
                            <div className="d-flex justify-content-between py-2 mt-2 border-top">
                                <span className="fw-bold">Total Amount</span>
                                <span className="fw-bold text-success h5 mb-0">
                                    {formatCurrency(invoice.total_amount)}
                                </span>
                            </div>
                        </div>

                        {/* Invoice Dates */}
                        <div className="invoice-dates">
                            {invoice.issued_at && (
                                <div className="mb-1">
                                    <small className="text-muted">
                                        <i className="fas fa-calendar me-1"></i>
                                        Issued: {formatDate(invoice.issued_at)}
                                    </small>
                                </div>
                            )}
                            {invoice.due_date && (
                                <div className="mb-1">
                                    <small className="text-muted">
                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                        Due: {formatDate(invoice.due_date)}
                                        {invoice.is_overdue && (
                                            <span className="text-danger ms-1 fw-bold">
                                                ({invoice.days_overdue} days
                                                overdue)
                                            </span>
                                        )}
                                    </small>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="col-md-4">
                        {/* Payment Actions */}
                        {invoice.payment_status === "pending" && canBePaid && (
                            <div className="payment-actions">
                                <h6 className="fw-bold mb-3">
                                    Payment Options
                                </h6>
                                <button
                                    className="btn btn-success w-100 mb-2"
                                    onClick={onPaymentClick}
                                >
                                    <i className="fas fa-credit-card me-2"></i>
                                    Pay Now
                                </button>
                                <small className="text-muted">
                                    Secure payment powered by Stripe
                                </small>
                            </div>
                        )}

                        {/* Payment Completed */}
                        {invoice.payment_status === "completed" && (
                            <div className="payment-completed">
                                <div className="text-center p-3 bg-light bg-opacity-10 rounded">
                                    <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                                    <h6 className="fw-bold text-success mb-1">
                                        Payment Received
                                    </h6>
                                    <p className="text-muted small mb-2">
                                        Method: {invoice.payment_method}
                                        <br />
                                        Date: {formatDate(invoice.paid_at)}
                                    </p>
                                    {appointment.payment?.transaction_id && (
                                        <small className="text-muted">
                                            Transaction:{" "}
                                            {appointment.payment.transaction_id}
                                        </small>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Processing */}
                        {invoice.payment_status === "processing" && (
                            <div className="payment-processing">
                                <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                                    <div
                                        className="spinner-border text-info mb-2"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Processing...
                                        </span>
                                    </div>
                                    <h6 className="fw-bold text-info mb-1">
                                        Processing Payment
                                    </h6>
                                    <p className="text-muted small mb-0">
                                        Your payment is being processed. Please
                                        wait...
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Payment Failed */}
                        {invoice.payment_status === "failed" && (
                            <div className="payment-failed">
                                <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                                    <i className="fas fa-times-circle fa-2x text-danger mb-2"></i>
                                    <h6 className="fw-bold text-danger mb-1">
                                        Payment Failed
                                    </h6>
                                    <p className="text-muted small mb-2">
                                        Your payment could not be processed.
                                        Please try again.
                                    </p>
                                    <button
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={onPaymentClick}
                                    >
                                        Retry Payment
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Notes */}
                {invoice.notes && (
                    <div className="invoice-notes mt-3 pt-3 border-top">
                        <small className="text-muted">Notes:</small>
                        <p className="text-muted small mb-0">{invoice.notes}</p>
                    </div>
                )}
            </div>

            {/* Overdue Indicator */}
            {invoice.is_overdue && (
                <div className="card-footer bg-danger text-white text-center py-2">
                    <small>
                        <i className="fas fa-exclamation-circle me-1"></i>
                        Payment Overdue - {invoice.days_overdue} days past due
                    </small>
                </div>
            )}
        </div>
    );
};

export default InvoiceSection;
