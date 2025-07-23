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
        <div className="card h-100 shadow border-0 transition">
            <div className="card-body d-flex flex-column p-4">
                {/* Header */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-4">
                    <div className="flex-grow-1 mb-3 mb-md-0">
                        <h5 className="card-title mb-2 font-bold text-lg">
                            {invoice.formatted_invoice_number ||
                                `INV-${invoice.id}`}
                        </h5>
                        <p className="text-secondary text-sm mb-0">
                            <i className="fas fa-user me-2"></i>
                            {invoice.client?.name || "Unknown Client"}
                        </p>
                    </div>
                    <div className="text-start text-md-end">
                        <div className="mb-2">
                            <span
                                className={`badge ${getStatusBadge(
                                    invoice.status
                                )} text-xs px-3 py-2`}
                            >
                                {invoice.status_text || invoice.status}
                            </span>
                        </div>
                        <span
                            className={`badge ${getPaymentStatusBadge(
                                invoice.payment_status
                            )} text-xs px-3 py-2`}
                        >
                            {invoice.payment_status_text ||
                                invoice.payment_status}
                        </span>
                    </div>
                </div>

                {/* Amount */}
                <div className="mb-4">
                    <div className="text-2xl mb-2 text-primary font-bold">
                        {formatCurrency(invoice.total_amount)}
                    </div>
                    <div className="text-sm text-success">
                        <i className="fas fa-coins me-2"></i>
                        Your earnings:{" "}
                        {formatCurrency(invoice.provider_earnings)}
                    </div>
                </div>

                {/* Service Info */}
                <div className="mb-4 flex-grow-1">
                    <div className="text-sm text-muted mb-2">
                        <i className="fas fa-concierge-bell me-2"></i>
                        Service: {invoice.appointment?.service?.title || "N/A"}
                    </div>
                    <div className="text-sm text-muted">
                        <i className="fas fa-calendar me-2"></i>
                        Date:{" "}
                        {formatDate(invoice.appointment?.appointment_date)}
                    </div>
                </div>

                {/* Important Dates */}
                <div className="mb-4">
                    {invoice.issued_at && (
                        <div className="text-sm text-muted mb-2">
                            <i className="fas fa-clock me-2"></i>
                            Issued: {formatDate(invoice.issued_at)}
                        </div>
                    )}
                    {invoice.due_date && (
                        <div className="text-sm text-muted">
                            <i className="fas fa-exclamation-triangle me-2"></i>
                            Due: {formatDate(invoice.due_date)}
                            {invoice.is_overdue && (
                                <span className="text-danger ms-2 font-bold">
                                    ({invoice.days_overdue} days overdue)
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-auto">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                        <button
                            className="btn btn-outline-primary btn-sm flex-fill touch-friendly"
                            onClick={handleViewInvoice}
                        >
                            <i className="fas fa-eye me-2"></i>
                            View
                        </button>

                        {invoice.status === "draft" && (
                            <button className="btn btn-primary btn-sm touch-friendly">
                                <i className="fas fa-paper-plane me-2"></i>
                                Send
                            </button>
                        )}

                        {invoice.status === "sent" &&
                            invoice.payment_status === "pending" && (
                                <button className="btn btn-success btn-sm touch-friendly">
                                    <i className="fas fa-dollar-sign me-2"></i>
                                    Mark Paid
                                </button>
                            )}
                    </div>
                </div>
            </div>

            {/* Overdue indicator */}
            {invoice.is_overdue && (
                <div className="card-footer bg-danger text-white text-center py-3">
                    <small className="text-sm">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        Overdue Payment
                    </small>
                </div>
            )}
        </div>
    );
};

export default InvoiceCard;
