import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import invoiceService from "../../../services/invoiceService";
import InvoiceActions from "../../../components/provider/invoices/InvoiceActions";
import MarkPaidModal from "../../../components/provider/invoices/MarkPaidModal";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const InvoiceDetail = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

    useEffect(() => {
        loadInvoice();
    }, [invoiceId]);

    const loadInvoice = async () => {
        setLoading(true);
        try {
            const result = await invoiceService.getInvoiceDetail(invoiceId);
            if (result.success) {
                setInvoice(result.data);
            }
        } catch (error) {
            console.error("Error loading invoice:", error);
        }
        setLoading(false);
    };

    const handleInvoiceUpdate = () => {
        loadInvoice(); // Reload invoice data
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div className="container-fluid">
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading invoice...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    if (!invoice) {
        return (
            <ProviderLayout>
                <div className="container-fluid">
                    <div className="text-center py-5">
                        <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                        <h4 className="text-muted">Invoice not found</h4>
                        <button
                            className="btn btn-primary mt-3"
                            onClick={() => navigate("/provider/invoices")}
                        >
                            Back to Invoices
                        </button>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    const getStatusBadgeClass = (status) => {
        const classes = {
            paid: "success",
            sent: "primary",
            overdue: "danger",
            draft: "secondary",
        };
        return `badge bg-${classes[status] || "secondary"}`;
    };

    const getPaymentStatusBadgeClass = (status) => {
        const classes = {
            completed: "success",
            processing: "info",
            failed: "danger",
            pending: "warning",
        };
        return `badge bg-${classes[status] || "warning"}`;
    };

    return (
        <ProviderLayout>
            <div className="container-fluid">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col">
                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div className="d-flex align-items-center mb-3 mb-md-0">
                                <button
                                    onClick={() =>
                                        navigate("/provider/invoices")
                                    }
                                    className="btn btn-outline-secondary btn-sm me-3"
                                >
                                    <i className="fas fa-arrow-left me-1"></i>
                                    Back
                                </button>
                                <div>
                                    <h1 className="h2 mb-1 fw-bold">
                                        {invoice.formatted_invoice_number ||
                                            `Invoice #${invoice.id}`}
                                    </h1>
                                    <p className="text-muted mb-0">
                                        <i className="fas fa-calendar me-1"></i>
                                        Created {formatDate(invoice.created_at)}
                                    </p>
                                </div>
                            </div>

                            <InvoiceActions
                                invoice={invoice}
                                onUpdate={handleInvoiceUpdate}
                                onMarkPaid={() => setShowMarkPaidModal(true)}
                            />
                        </div>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="row mb-4 g-3">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">
                                    Invoice Status
                                </h6>
                                <span
                                    className={`${getStatusBadgeClass(
                                        invoice.status
                                    )} fs-6 px-3 py-2`}
                                >
                                    <i className="fas fa-file-invoice me-1"></i>
                                    {invoice.status_text || invoice.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">
                                    Payment Status
                                </h6>
                                <span
                                    className={`${getPaymentStatusBadgeClass(
                                        invoice.payment_status
                                    )} fs-6 px-3 py-2`}
                                >
                                    <i className="fas fa-credit-card me-1"></i>
                                    {invoice.payment_status_text ||
                                        invoice.payment_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">
                                    Total Amount
                                </h6>
                                <p className="h3 mb-0 text-primary fw-bold">
                                    {formatCurrency(invoice.total_amount)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invoice Details */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        {/* Invoice Header Info */}
                        <div className="row mb-5">
                            {/* From */}
                            <div className="col-md-6">
                                <h5 className="text-primary mb-3">
                                    <i className="fas fa-user-tie me-2"></i>
                                    From (Provider)
                                </h5>
                                <div className="bg-light p-3 rounded">
                                    <p className="fw-bold mb-1">
                                        {invoice.provider?.name}
                                    </p>
                                    <p className="text-muted mb-1">
                                        <i className="fas fa-envelope me-1"></i>
                                        {invoice.provider?.email}
                                    </p>
                                    {invoice.provider?.phone && (
                                        <p className="text-muted mb-0">
                                            <i className="fas fa-phone me-1"></i>
                                            {invoice.provider?.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* To */}
                            <div className="col-md-6">
                                <h5 className="text-success mb-3">
                                    <i className="fas fa-user me-2"></i>
                                    To (Client)
                                </h5>
                                <div className="bg-light p-3 rounded">
                                    <p className="fw-bold mb-1">
                                        {invoice.client?.name}
                                    </p>
                                    <p className="text-muted mb-1">
                                        <i className="fas fa-envelope me-1"></i>
                                        {invoice.client?.email}
                                    </p>
                                    {invoice.appointment?.client_phone && (
                                        <p className="text-muted mb-0">
                                            <i className="fas fa-phone me-1"></i>
                                            {invoice.appointment?.client_phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Invoice Information */}
                        <div className="row mb-5">
                            <div className="col-md-6">
                                <h5 className="text-info mb-3">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Invoice Information
                                </h5>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">
                                                Invoice Number:
                                            </td>
                                            <td className="fw-medium">
                                                {invoice.invoice_number}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Issue Date:
                                            </td>
                                            <td>
                                                {formatDate(
                                                    invoice.issued_at ||
                                                        invoice.created_at
                                                )}
                                            </td>
                                        </tr>
                                        {invoice.due_date && (
                                            <tr>
                                                <td className="text-muted">
                                                    Due Date:
                                                </td>
                                                <td
                                                    className={
                                                        invoice.is_overdue
                                                            ? "text-danger fw-bold"
                                                            : ""
                                                    }
                                                >
                                                    {formatDate(
                                                        invoice.due_date
                                                    )}
                                                    {invoice.is_overdue && (
                                                        <span className="ms-2">
                                                            <i className="fas fa-exclamation-triangle"></i>
                                                            Overdue
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                        {invoice.paid_at && (
                                            <tr>
                                                <td className="text-muted">
                                                    Paid Date:
                                                </td>
                                                <td className="text-success fw-medium">
                                                    <i className="fas fa-check-circle me-1"></i>
                                                    {formatDate(
                                                        invoice.paid_at
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="col-md-6">
                                <h5 className="text-warning mb-3">
                                    <i className="fas fa-concierge-bell me-2"></i>
                                    Service Information
                                </h5>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td className="text-muted">
                                                Service:
                                            </td>
                                            <td className="fw-medium">
                                                {
                                                    invoice.appointment?.service
                                                        ?.title
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-muted">
                                                Service Date:
                                            </td>
                                            <td>
                                                {formatDate(
                                                    invoice.appointment
                                                        ?.appointment_date
                                                )}
                                            </td>
                                        </tr>
                                        {invoice.payment_method && (
                                            <tr>
                                                <td className="text-muted">
                                                    Payment Method:
                                                </td>
                                                <td className="text-capitalize">
                                                    {invoice.payment_method}
                                                </td>
                                            </tr>
                                        )}
                                        {invoice.appointment
                                            ?.duration_hours && (
                                            <tr>
                                                <td className="text-muted">
                                                    Duration:
                                                </td>
                                                <td>
                                                    {
                                                        invoice.appointment
                                                            .duration_hours
                                                    }{" "}
                                                    hours
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-4">
                            <h5 className="text-dark mb-3">
                                <i className="fas fa-list me-2"></i>
                                Line Items
                            </h5>
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Description</th>
                                            <th
                                                className="text-center"
                                                style={{ width: "100px" }}
                                            >
                                                Quantity/Hour Count
                                            </th>
                                            <th
                                                className="text-end"
                                                style={{ width: "120px" }}
                                            >
                                                Rate
                                            </th>
                                            <th
                                                className="text-end"
                                                style={{ width: "120px" }}
                                            >
                                                Amount
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.line_items?.map(
                                            (item, index) => (
                                                <tr key={index}>
                                                    <td>{item.description}</td>
                                                    <td className="text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="text-end">
                                                        {formatCurrency(
                                                            item.rate
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-medium">
                                                        {formatCurrency(
                                                            item.amount
                                                        )}
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="row justify-content-end">
                            <div className="col-md-4">
                                <div className="card bg-light">
                                    <div className="card-body">
                                        <table className="table table-borderless mb-0">
                                            <tbody>
                                                <tr>
                                                    <td className="text-muted">
                                                        Subtotal:
                                                    </td>
                                                    <td className="text-end">
                                                        {formatCurrency(
                                                            invoice.subtotal
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* {invoice.tax_amount > 0 && (
                                                    <tr>
                                                        <td className="text-muted">
                                                            Tax:
                                                        </td>
                                                        <td className="text-end">
                                                            {formatCurrency(
                                                                invoice.tax_amount
                                                            )}
                                                        </td>
                                                    </tr>
                                                )} */}
                                                <tr className="border-top">
                                                    <td className="fw-bold">
                                                        Total:
                                                    </td>
                                                    <td className="text-end fw-bold h5 text-primary">
                                                        {formatCurrency(
                                                            invoice.total_amount
                                                        )}
                                                    </td>
                                                </tr>
                                                {/* <tr>
                                                    <td className="text-muted">
                                                        Platform Fee:
                                                    </td>
                                                    <td className="text-end text-danger">
                                                        -
                                                        {formatCurrency(
                                                            invoice.platform_fee
                                                        )}
                                                    </td>
                                                </tr> */}
                                                <tr className="border-top">
                                                    <td className="fw-bold text-success">
                                                        Your Earnings:
                                                    </td>
                                                    <td className="text-end fw-bold h5 text-success">
                                                        {formatCurrency(
                                                            invoice.total_amount
                                                        )}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="mt-4 pt-4 border-top">
                                <h5 className="text-secondary mb-3">
                                    <i className="fas fa-sticky-note me-2"></i>
                                    Notes
                                </h5>
                                <div className="bg-light p-3 rounded">
                                    <p className="mb-0">{invoice.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mark Paid Modal */}
                {showMarkPaidModal && (
                    <MarkPaidModal
                        invoice={invoice}
                        isOpen={showMarkPaidModal}
                        onClose={() => setShowMarkPaidModal(false)}
                        onSuccess={handleInvoiceUpdate}
                    />
                )}
            </div>
        </ProviderLayout>
    );
};

export default InvoiceDetail;
