import React from "react";
import { Link } from "react-router-dom";

const InvoicesTable = ({
    invoices = [],
    loading = false,
    onSort,
    sortField,
    sortDirection,
    onInvoiceAction,
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount || 0).toFixed(2)}`;
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            draft: { class: "status-draft", text: "Draft", icon: "fa-edit" },
            sent: {
                class: "status-sent",
                text: "Sent",
                icon: "fa-paper-plane",
            },
            paid: {
                class: "status-paid",
                text: "Paid",
                icon: "fa-check-circle",
            },
            overdue: {
                class: "status-overdue",
                text: "Overdue",
                icon: "fa-exclamation-triangle",
            },
            cancelled: {
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

    const getPaymentStatusBadge = (paymentStatus) => {
        const statusMap = {
            pending: {
                class: "payment-pending",
                text: "Pending",
                icon: "fa-clock",
            },
            processing: {
                class: "payment-processing",
                text: "Processing",
                icon: "fa-spinner",
            },
            completed: {
                class: "payment-completed",
                text: "Completed",
                icon: "fa-check",
            },
            failed: {
                class: "payment-failed",
                text: "Failed",
                icon: "fa-times",
            },
            refunded: {
                class: "payment-refunded",
                text: "Refunded",
                icon: "fa-undo",
            },
        };

        const statusInfo = statusMap[paymentStatus] || {
            class: "payment-unknown",
            text: paymentStatus,
            icon: "fa-question",
        };

        return (
            <span className={`payment-badge ${statusInfo.class}`}>
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

    const getDaysOverdue = (dueDate, status) => {
        if (status !== "overdue" || !dueDate) return null;
        const due = new Date(dueDate);
        const today = new Date();
        const diffTime = today - due;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (loading) {
        return (
            <div className="invoices-table-container">
                <div className="table-loading">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p>Loading invoices...</p>
                </div>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="invoices-table-container">
                <div className="table-empty">
                    <div className="empty-icon">
                        <i className="fas fa-file-invoice"></i>
                    </div>
                    <h3>No invoices found</h3>
                    <p>
                        You don't have any invoices matching the current filter.
                    </p>
                    <Link
                        to="/provider/invoices/create"
                        className="btn btn-orange"
                    >
                        <i className="fas fa-plus"></i>
                        Create Invoice
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="invoices-table-container">
            <div className="table-responsive">
                <table className="invoices-table">
                    <thead>
                        <tr>
                            <th className="sortable-header">Invoice #</th>
                            <th className="sortable-header">Client</th>
                            <th className="sortable-header">Date Created</th>
                            <th className="sortable-header">Due Date</th>
                            <th className="sortable-header">Amount</th>
                            <th className="sortable-header">Status</th>
                            <th>Payment</th>
                            <th className="actions-column">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="invoice-row">
                                <td className="invoice-number-cell">
                                    <div className="invoice-number">
                                        <span className="number">
                                            #{invoice.invoice_number}
                                        </span>
                                        {invoice.appointment && (
                                            <div className="appointment-ref">
                                                <i className="fas fa-calendar-check me-1 text-primary"></i>
                                                <strong>
                                                    Appointment #
                                                    {invoice.appointment.id}
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="client-cell">
                                    <div className="client-info">
                                        <span className="client-name">
                                            {invoice.client?.name ||
                                                `${
                                                    invoice.client
                                                        ?.first_name || ""
                                                } ${
                                                    invoice.client?.last_name ||
                                                    ""
                                                }`.trim() ||
                                                "N/A"}
                                        </span>
                                        {invoice.client?.email && (
                                            <small className="client-email">
                                                {invoice.client.email}
                                            </small>
                                        )}
                                    </div>
                                </td>
                                <td className="date-cell">
                                    <span className="created-date">
                                        {formatDate(invoice.created_at)}
                                    </span>
                                </td>
                                <td className="due-date-cell">
                                    <div className="due-info">
                                        <span className="due-date">
                                            {formatDate(invoice.due_date)}
                                        </span>
                                        {getDaysOverdue(
                                            invoice.due_date,
                                            invoice.status
                                        ) && (
                                            <small className="overdue-days">
                                                {getDaysOverdue(
                                                    invoice.due_date,
                                                    invoice.status
                                                )}{" "}
                                                days overdue
                                            </small>
                                        )}
                                    </div>
                                </td>
                                <td className="amount-cell">
                                    <div className="amount-info">
                                        <span className="total-amount">
                                            {formatCurrency(
                                                invoice.total_amount
                                            )}
                                        </span>
                                        {invoice.paid_amount > 0 && (
                                            <small className="paid-amount">
                                                Paid:{" "}
                                                {formatCurrency(
                                                    invoice.paid_amount
                                                )}
                                            </small>
                                        )}
                                    </div>
                                </td>
                                <td className="status-cell">
                                    {getStatusBadge(invoice.status)}
                                </td>
                                <td className="payment-cell">
                                    {invoice.payment_status ? (
                                        getPaymentStatusBadge(
                                            invoice.payment_status
                                        )
                                    ) : (
                                        <span className="text-muted">N/A</span>
                                    )}
                                </td>
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() =>
                                                onInvoiceAction &&
                                                onInvoiceAction("view", invoice)
                                            }
                                            title="View Invoice"
                                        >
                                            <i className="fas fa-eye me-1"></i>
                                            View
                                        </button>

                                        {invoice.status === "draft" && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() =>
                                                        onInvoiceAction &&
                                                        onInvoiceAction(
                                                            "edit",
                                                            invoice
                                                        )
                                                    }
                                                    title="Edit Invoice"
                                                >
                                                    <i className="fas fa-edit me-1"></i>
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() =>
                                                        onInvoiceAction &&
                                                        onInvoiceAction(
                                                            "send",
                                                            invoice
                                                        )
                                                    }
                                                    title="Send Invoice"
                                                >
                                                    <i className="fas fa-paper-plane me-1"></i>
                                                    Send
                                                </button>
                                            </>
                                        )}

                                        {(invoice.status === "sent" ||
                                            invoice.status === "overdue") && (
                                            <>
                                                {/* <button
                                                    className="btn btn-sm btn-outline-info"
                                                    onClick={() =>
                                                        onInvoiceAction &&
                                                        onInvoiceAction(
                                                            "resend",
                                                            invoice
                                                        )
                                                    }
                                                    title="Resend Invoice"
                                                >
                                                    <i className="fas fa-paper-plane me-1"></i>
                                                    Resend
                                                </button> */}
                                                <button
                                                    className="btn btn-sm btn-outline-success"
                                                    onClick={() =>
                                                        onInvoiceAction &&
                                                        onInvoiceAction(
                                                            "mark_paid",
                                                            invoice
                                                        )
                                                    }
                                                    title="Mark as Paid"
                                                >
                                                    <i className="fas fa-check me-1"></i>
                                                    Mark Paid
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
                .invoices-table-container {
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

                .invoices-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: var(--text-sm);
                }

                .invoices-table th {
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

                .invoices-table td {
                    padding: var(--space-3) var(--space-4);
                    border-bottom: 1px solid var(--border-color);
                    vertical-align: middle;
                }

                .invoice-row {
                    transition: var(--transition);
                }

                .invoice-row:hover {
                    background: var(--bg-light);
                }

                .invoice-number {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .number {
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                }

                .appointment-ref {
                    font-size: var(--text-sm);
                    color: var(--text-primary);
                    margin-top: var(--space-1);
                    display: flex;
                    align-items: center;
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

                .client-email {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .created-date,
                .due-date {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                }

                .due-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .overdue-days {
                    font-size: var(--text-xs);
                    color: var(--danger-color);
                    font-weight: var(--font-semibold);
                }

                .amount-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .total-amount {
                    font-weight: var(--font-semibold);
                    color: var(--success-color);
                    white-space: nowrap;
                }

                .paid-amount {
                    font-size: var(--text-xs);
                    color: var(--info-color);
                }

                .status-badge,
                .payment-badge {
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

                .status-draft {
                    background: var(--secondary-color);
                    color: white;
                }

                .status-sent {
                    background: var(--info-color);
                    color: white;
                }

                .status-paid {
                    background: var(--success-color);
                    color: white;
                }

                .status-overdue {
                    background: var(--danger-color);
                    color: white;
                }

                .status-cancelled {
                    background: var(--muted-color);
                    color: white;
                }

                .payment-pending {
                    background: var(--warning-color);
                    color: white;
                }

                .payment-processing {
                    background: var(--primary-color);
                    color: white;
                }

                .payment-completed {
                    background: var(--success-color);
                    color: white;
                }

                .payment-failed {
                    background: var(--danger-color);
                    color: white;
                }

                .payment-refunded {
                    background: var(--info-color);
                    color: white;
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
                    .invoices-table {
                        font-size: var(--text-xs);
                    }

                    .invoices-table th,
                    .invoices-table td {
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

export default InvoicesTable;
