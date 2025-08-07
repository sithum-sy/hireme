import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import invoiceService from "../../../services/invoiceService";
import InvoiceActions from "../../../components/provider/invoices/InvoiceActions";
import MarkPaidModal from "../../../components/provider/invoices/MarkPaidModal";
import { InvoiceDownloadButton } from "../../../components/shared/InvoicePDFDownloader";
import { formatCurrency, formatDate } from "../../../utils/formatters";

const InvoiceDetail = () => {
    const { invoiceId } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
    const [showCashConfirmModal, setShowCashConfirmModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

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

    const handleConfirmCashPayment = () => {
        setShowCashConfirmModal(true);
    };

    const handleCashConfirmation = async (confirmationData) => {
        setActionLoading(true);
        try {
            const response = await fetch(
                `/api/provider/invoices/${invoiceId}/confirm-cash`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify({
                        amount_received: invoice.total_amount,
                        notes: confirmationData.notes,
                        received_at:
                            confirmationData.received_at ||
                            new Date().toISOString(),
                    }),
                }
            );

            const result = await response.json();

            if (result.success) {
                // Reload invoice details to get updated status
                await loadInvoice();
                setShowCashConfirmModal(false);
                alert(
                    "Cash payment confirmed successfully! Both you and the client can now review each other."
                );
            } else {
                alert(result.message || "Failed to confirm cash payment");
            }
        } catch (error) {
            console.error("Failed to confirm cash payment:", error);
            alert("Failed to confirm cash payment. Please try again.");
        } finally {
            setActionLoading(false);
        }
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

    // Enhanced invoice item rendering
    const renderEnhancedInvoiceItems = (invoice) => {
        // Check if invoice uses enhanced structure - improved detection
        const isEnhanced = invoice.line_items && typeof invoice.line_items === 'object' && 
                          (invoice.line_items.line_items || invoice.line_items.additional_charges || 
                           invoice.line_items.discounts || invoice.line_items.totals);

        if (isEnhanced) {
            return renderEnhancedStructure(invoice.line_items);
        } else {
            return renderLegacyStructure(invoice);
        }
    };

    const renderEnhancedStructure = (lineItemData) => {
        const { line_items = [], additional_charges = [], discounts = [], totals = {} } = lineItemData;

        return (
            <>
                {/* Main Service Items */}
                <h5 className="text-dark mb-3">
                    <i className="fas fa-concierge-bell me-2"></i>
                    Service Items
                </h5>
                <div className="table-responsive mb-4">
                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th>Description</th>
                                <th className="text-center" style={{ width: "100px" }}>
                                    Quantity/Hours
                                </th>
                                <th className="text-end" style={{ width: "120px" }}>
                                    Rate
                                </th>
                                <th className="text-end" style={{ width: "120px" }}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {line_items.length > 0 ? line_items.map((item, index) => (
                                <tr key={`service-${index}`}>
                                    <td>
                                        <div className="fw-medium">{item.description}</div>
                                        <small className="text-muted">Service</small>
                                    </td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">{formatCurrency(item.rate)}</td>
                                    <td className="text-end fw-bold">{formatCurrency(item.amount)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-3">
                                        No service items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Additional Charges */}
                {additional_charges.length > 0 && (
                    <>
                        <h5 className="text-info mb-3">
                            <i className="fas fa-plus-circle me-2"></i>
                            Additional Charges
                        </h5>
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered">
                                <thead className="table-info">
                                    <tr>
                                        <th>Type</th>
                                        <th>Description & Reason</th>
                                        <th className="text-center" style={{ width: "100px" }}>
                                            Quantity
                                        </th>
                                        <th className="text-end" style={{ width: "120px" }}>
                                            Rate
                                        </th>
                                        <th className="text-end" style={{ width: "120px" }}>
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {additional_charges.map((charge, index) => (
                                        <tr key={`charge-${index}`}>
                                            <td>
                                                <span className="badge bg-info text-capitalize">
                                                    {charge.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-medium text-info">{charge.description}</div>
                                                {charge.reason && (
                                                    <small className="text-muted d-block mt-1">
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        {charge.reason}
                                                    </small>
                                                )}
                                                {charge.client_approved && (
                                                    <small className="text-success d-block mt-1">
                                                        <i className="fas fa-check-circle me-1"></i>
                                                        Client Approved
                                                    </small>
                                                )}
                                            </td>
                                            <td className="text-center">{charge.quantity}</td>
                                            <td className="text-end">{formatCurrency(charge.rate)}</td>
                                            <td className="text-end fw-bold text-info">
                                                +{formatCurrency(charge.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {/* Discounts */}
                {discounts.length > 0 && (
                    <>
                        <h5 className="text-success mb-3">
                            <i className="fas fa-percent me-2"></i>
                            Discounts Applied
                        </h5>
                        <div className="table-responsive mb-4">
                            <table className="table table-bordered">
                                <thead className="table-success">
                                    <tr>
                                        <th>Type</th>
                                        <th>Description & Reason</th>
                                        <th className="text-center" style={{ width: "100px" }}>
                                            Rate
                                        </th>
                                        <th className="text-end" style={{ width: "120px" }}>
                                            Discount Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount, index) => (
                                        <tr key={`discount-${index}`}>
                                            <td>
                                                <span className="badge bg-success text-capitalize">
                                                    {discount.type}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="fw-medium text-success">{discount.description}</div>
                                                {discount.reason && (
                                                    <small className="text-muted d-block mt-1">
                                                        <i className="fas fa-gift me-1"></i>
                                                        {discount.reason}
                                                    </small>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {discount.type === 'percentage' ? `${discount.rate}%` : 'Fixed'}
                                            </td>
                                            <td className="text-end fw-bold text-success">
                                                -{formatCurrency(discount.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </>
        );
    };

    const renderLegacyStructure = (invoice) => {
        // Calculate actual subtotal from line items for legacy invoices
        const calculateLegacySubtotal = () => {
            if (invoice.line_items && invoice.line_items.length > 0) {
                return invoice.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
            }
            return parseFloat(invoice.subtotal) || 0;
        };

        return (
            <>
                <h5 className="text-dark mb-3">
                    <i className="fas fa-list me-2"></i>
                    Line Items
                </h5>
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th>Description</th>
                                <th className="text-center" style={{ width: "100px" }}>
                                    Quantity/Hour Count
                                </th>
                                <th className="text-end" style={{ width: "120px" }}>
                                    Rate
                                </th>
                                <th className="text-end" style={{ width: "120px" }}>
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.line_items && invoice.line_items.length > 0 ? (
                                invoice.line_items.map((item, index) => (
                                    <tr key={item.id || `${item.description}-${item.rate}-${item.quantity}-${index}`}>
                                        <td>{item.description}</td>
                                        <td className="text-center">{parseFloat(item.quantity).toFixed(2)}</td>
                                        <td className="text-end">{formatCurrency(item.rate)}</td>
                                        <td className="text-end fw-medium">{formatCurrency(item.amount)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-4">
                                        No line items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="text-end fw-bold">Subtotal:</td>
                                <td className="text-end fw-bold">{formatCurrency(calculateLegacySubtotal())}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </>
        );
    };

    // Enhanced totals rendering
    const renderEnhancedTotals = (invoice) => {
        // Check if invoice uses enhanced structure
        const isEnhanced = invoice.line_items && typeof invoice.line_items === 'object' && 
                          (invoice.line_items.totals);

        if (isEnhanced && invoice.line_items.totals) {
            const totals = invoice.line_items.totals;
            return (
                <div className="card bg-light">
                    <div className="card-body">
                        <table className="table table-borderless mb-0">
                            <tbody>
                                <tr>
                                    <td className="text-muted">Subtotal:</td>
                                    <td className="text-end">{formatCurrency(totals.subtotal || invoice.subtotal)}</td>
                                </tr>
                                {totals.total_additional_charges > 0 && (
                                    <tr>
                                        <td className="text-info">Additional Charges:</td>
                                        <td className="text-end text-info">
                                            +{formatCurrency(totals.total_additional_charges)}
                                        </td>
                                    </tr>
                                )}
                                {totals.total_discounts > 0 && (
                                    <tr>
                                        <td className="text-success">Total Discounts:</td>
                                        <td className="text-end text-success">
                                            -{formatCurrency(totals.total_discounts)}
                                        </td>
                                    </tr>
                                )}
                                <tr className="border-top">
                                    <td className="fw-bold">Final Total:</td>
                                    <td className="text-end fw-bold h5 text-primary">
                                        {formatCurrency(totals.final_total || invoice.total_amount)}
                                    </td>
                                </tr>
                                <tr className="border-top">
                                    <td className="fw-bold text-success">Your Earnings:</td>
                                    <td className="text-end fw-bold h5 text-success">
                                        {formatCurrency(totals.final_total || invoice.total_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        } else {
            // Legacy totals display - calculate subtotal from line items
            const calculateLegacySubtotal = () => {
                if (invoice.line_items && invoice.line_items.length > 0) {
                    return invoice.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
                }
                return parseFloat(invoice.subtotal) || 0;
            };

            return (
                <div className="card bg-light">
                    <div className="card-body">
                        <table className="table table-borderless mb-0">
                            <tbody>
                                <tr>
                                    <td className="text-muted">Subtotal:</td>
                                    <td className="text-end">{formatCurrency(calculateLegacySubtotal())}</td>
                                </tr>
                                <tr className="border-top">
                                    <td className="fw-bold">Total:</td>
                                    <td className="text-end fw-bold h5 text-primary">
                                        {formatCurrency(invoice.total_amount)}
                                    </td>
                                </tr>
                                <tr className="border-top">
                                    <td className="fw-bold text-success">Your Earnings:</td>
                                    <td className="text-end fw-bold h5 text-success">
                                        {formatCurrency(invoice.total_amount)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
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

                            <div className="d-flex gap-2 align-items-center">
                                <InvoiceDownloadButton
                                    invoice={invoice}
                                    role="provider"
                                    variant="outline-success"
                                    title="Download Invoice PDF"
                                />

                                {/* Cash Payment Confirmation Button */}
                                {invoice.payment_method === "cash" &&
                                    invoice.payment_status === "processing" &&
                                    invoice.status === "paid" && (
                                        <button
                                            className="btn btn-success"
                                            onClick={handleConfirmCashPayment}
                                            disabled={actionLoading}
                                            title="Confirm cash payment received"
                                        >
                                            <i className="fas fa-money-bill me-2"></i>
                                            Confirm Cash Received
                                        </button>
                                    )}

                                <InvoiceActions
                                    invoice={invoice}
                                    onUpdate={handleInvoiceUpdate}
                                    onMarkPaid={() =>
                                        setShowMarkPaidModal(true)
                                    }
                                />
                            </div>
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
                                                Appointment ID:
                                            </td>
                                            <td className="fw-medium">
                                                #
                                                {invoice.appointment?.id ||
                                                    "N/A"}
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
                                        <tr>
                                            <td className="text-muted">
                                                Service Time:
                                            </td>
                                            <td>
                                                {invoice.appointment
                                                    ?.appointment_time
                                                    ? (() => {
                                                          const timeStr =
                                                              invoice
                                                                  .appointment
                                                                  .appointment_time;
                                                          const timeParts =
                                                              timeStr.split(
                                                                  ":"
                                                              );
                                                          if (
                                                              timeParts.length >=
                                                              2
                                                          ) {
                                                              const hours =
                                                                  parseInt(
                                                                      timeParts[0]
                                                                  );
                                                              const minutes =
                                                                  timeParts[1];
                                                              const ampm =
                                                                  hours >= 12
                                                                      ? "PM"
                                                                      : "AM";
                                                              const displayHour =
                                                                  hours === 0
                                                                      ? 12
                                                                      : hours >
                                                                        12
                                                                      ? hours -
                                                                        12
                                                                      : hours;
                                                              return `${displayHour}:${minutes} ${ampm}`;
                                                          }
                                                          return timeStr;
                                                      })()
                                                    : "N/A"}
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

                        {/* Enhanced Line Items */}
                        <div className="mb-4">
                            {renderEnhancedInvoiceItems(invoice)}
                        </div>

                        {/* Enhanced Totals */}
                        <div className="row justify-content-end">
                            <div className="col-md-4">
                                {renderEnhancedTotals(invoice)}
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

                {/* Cash Confirmation Modal */}
                {showCashConfirmModal && (
                    <CashConfirmationModal
                        invoice={invoice}
                        isOpen={showCashConfirmModal}
                        onClose={() => setShowCashConfirmModal(false)}
                        onConfirm={handleCashConfirmation}
                        loading={actionLoading}
                    />
                )}
            </div>
        </ProviderLayout>
    );
};

// Cash Confirmation Modal Component
const CashConfirmationModal = ({
    invoice,
    isOpen,
    onClose,
    onConfirm,
    loading,
}) => {
    const [notes, setNotes] = useState("");
    const [receivedAt, setReceivedAt] = useState(
        new Date().toISOString().slice(0, 16)
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            notes,
            received_at: receivedAt,
        });
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                role="dialog"
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    role="document"
                >
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title d-flex align-items-center">
                                <i className="fas fa-money-bill text-success me-2"></i>
                                Confirm Cash Payment Received
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={loading}
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="invoice-info bg-light rounded p-3 mb-4">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <small className="text-muted">
                                                Invoice:
                                            </small>
                                            <div className="fw-bold">
                                                {invoice.invoice_number}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <small className="text-muted">
                                                Amount:
                                            </small>
                                            <div className="fw-bold text-success">
                                                {formatCurrency(
                                                    invoice.total_amount
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-2">
                                            <small className="text-muted">
                                                Client:
                                            </small>
                                            <div className="fw-bold">
                                                {invoice.client?.name}
                                            </div>
                                        </div>
                                        <div className="col-md-6 mt-2">
                                            <small className="text-muted">
                                                Service:
                                            </small>
                                            <div className="fw-bold">
                                                {
                                                    invoice.appointment?.service
                                                        ?.title
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Confirm Cash Receipt:</strong> By
                                    confirming, you acknowledge that you have
                                    received the cash payment from the client.
                                    This will update the invoice and appointment
                                    status to "Paid" and allow both parties to
                                    review each other.
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-calendar me-1"></i>
                                        Date & Time Received
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={receivedAt}
                                        onChange={(e) =>
                                            setReceivedAt(e.target.value)
                                        }
                                        max={new Date()
                                            .toISOString()
                                            .slice(0, 16)}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-sticky-note me-1"></i>
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="Add any additional notes about the cash payment receipt..."
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-success"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check me-2"></i>
                                            Confirm Cash Received
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default InvoiceDetail;
