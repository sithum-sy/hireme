import React from "react";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const InvoiceCard = ({ invoice, onUpdate }) => {
    const getStatusBadge = (status) => {
        const badges = {
            draft: "bg-secondary",
            sent: "bg-primary",
            paid: "bg-success",
            overdue: "bg-danger",
            cancelled: "bg-secondary",
        };
        return badges[status] || "bg-secondary";
    };

    const getPaymentStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning",
            processing: "bg-info",
            completed: "bg-success",
            failed: "bg-danger",
            refunded: "bg-secondary",
        };
        return badges[status] || "bg-warning";
    };

    const handleViewInvoice = () => {
        window.location.href = `/provider/invoices/${invoice.id}`;
    };

    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body d-flex flex-column">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <h5 className="card-title mb-1 fw-bold">
                            {invoice.formatted_invoice_number ||
                                `INV-${invoice.id}`}
                        </h5>
                        <p className="text-muted small mb-0">
                            <i className="fas fa-user me-1"></i>
                            {invoice.client?.name || "Unknown Client"}
                        </p>
                    </div>
                    <div className="text-end">
                        <div className="mb-1">
                            <span
                                className={`badge ${getStatusBadge(
                                    invoice.status
                                )} small`}
                            >
                                {invoice.status_text || invoice.status}
                            </span>
                        </div>
                        <span
                            className={`badge ${getPaymentStatusBadge(
                                invoice.payment_status
                            )} small`}
                        >
                            {invoice.payment_status_text ||
                                invoice.payment_status}
                        </span>
                    </div>
                </div>

                {/* Amount */}
                <div className="mb-3">
                    <div className="h4 mb-1 text-primary fw-bold">
                        {formatCurrency(invoice.total_amount)}
                    </div>
                    <div className="small text-success">
                        <i className="fas fa-coins me-1"></i>
                        Your earnings:{" "}
                        {formatCurrency(invoice.provider_earnings)}
                    </div>
                </div>

                {/* Service Info */}
                <div className="mb-3 flex-grow-1">
                    <div className="small text-muted mb-1">
                        <i className="fas fa-concierge-bell me-1"></i>
                        Service: {invoice.appointment?.service?.title || "N/A"}
                    </div>
                    <div className="small text-muted">
                        <i className="fas fa-calendar me-1"></i>
                        Date:{" "}
                        {formatDate(invoice.appointment?.appointment_date)}
                    </div>
                </div>

                {/* Important Dates */}
                <div className="mb-3">
                    {invoice.issued_at && (
                        <div className="small text-muted mb-1">
                            <i className="fas fa-clock me-1"></i>
                            Issued: {formatDate(invoice.issued_at)}
                        </div>
                    )}
                    {invoice.due_date && (
                        <div className="small text-muted">
                            <i className="fas fa-exclamation-triangle me-1"></i>
                            Due: {formatDate(invoice.due_date)}
                            {invoice.is_overdue && (
                                <span className="text-danger ms-1 fw-bold">
                                    ({invoice.days_overdue} days overdue)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-auto">
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-primary btn-sm flex-fill"
                            onClick={handleViewInvoice}
                        >
                            <i className="fas fa-eye me-1"></i>
                            View
                        </button>

                        {invoice.status === "draft" && (
                            <button className="btn btn-primary btn-sm">
                                <i className="fas fa-paper-plane me-1"></i>
                                Send
                            </button>
                        )}

                        {invoice.status === "sent" &&
                            invoice.payment_status === "pending" && (
                                <button className="btn btn-success btn-sm">
                                    <i className="fas fa-dollar-sign me-1"></i>
                                    Mark Paid
                                </button>
                            )}
                    </div>
                </div>
            </div>

            {/* Overdue indicator */}
            {invoice.is_overdue && (
                <div className="card-footer bg-danger text-white text-center py-2">
                    <small>
                        <i className="fas fa-exclamation-circle me-1"></i>
                        Overdue Payment
                    </small>
                </div>
            )}
        </div>
    );
};

export default InvoiceCard;
