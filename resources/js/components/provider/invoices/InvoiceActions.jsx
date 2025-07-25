import React, { useState } from "react";
import invoiceService from "../../../services/invoiceService";
import CashPaymentModal from "./CashPaymentModal";
import {
    downloadInvoicePDF,
    downloadFormattedInvoicePDF,
} from "../../../utils/pdfGenerator.js";

const InvoiceActions = ({ invoice, onUpdate, onMarkPaid }) => {
    const [loading, setLoading] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(false);

    const handleSendInvoice = async () => {
        if (
            !confirm(
                "Are you sure you want to send this invoice to the client?"
            )
        )
            return;

        setLoading(true);
        try {
            const result = await invoiceService.sendInvoice(invoice.id);
            if (result.success) {
                onUpdate();
                alert("Invoice sent successfully!");
            } else {
                alert(result.message || "Failed to send invoice");
            }
        } catch (error) {
            alert("Error sending invoice");
        }
        setLoading(false);
    };

    const handleDownloadPDF = async () => {
        if (downloadingPDF) return;

        setDownloadingPDF(true);
        try {
            // Option 1: Download as image-based PDF
            await downloadInvoicePDF(
                "invoice-content", // ID of the invoice container
                `invoice-${invoice.invoice_number}.pdf`
            );

            // Option 2: Download as formatted PDF (alternative)
            // await downloadFormattedInvoicePDF(invoice, `invoice-${invoice.invoice_number}.pdf`);
        } catch (error) {
            console.error("PDF download failed:", error);
        } finally {
            setDownloadingPDF(false);
        }
    };

    const canConfirmCash = () => {
        return (
            invoice.payment_method === "cash" &&
            invoice.payment_status === "pending" &&
            invoice.status === "sent"
        );
    };

    const handleConfirmCash = async (paymentData) => {
        setLoading(true);
        try {
            const result = await invoiceService.confirmCashReceived(
                invoice.id,
                paymentData
            );
            if (result.success) {
                onUpdate();
                alert("Cash payment confirmed successfully!");
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const canEdit = () => invoice.status === "draft";
    const canSend = () => invoice.status === "draft";
    const canMarkPaid = () =>
        invoice.status === "sent" && invoice.payment_status === "pending";

    return (
        <div className="d-flex align-items-center gap-2">
            {/* Primary Actions */}
            {canSend() && (
                <button
                    onClick={handleSendInvoice}
                    disabled={loading}
                    className="btn btn-primary"
                >
                    <i className="fas fa-paper-plane me-2"></i>
                    {loading ? "Sending..." : "Send Invoice"}
                </button>
            )}

            {canMarkPaid() && (
                <button onClick={onMarkPaid} className="btn btn-success">
                    <i className="fas fa-dollar-sign me-2"></i>
                    Mark Paid
                </button>
            )}

            {canEdit() && (
                <button
                    onClick={() =>
                        (window.location.href = `/provider/invoices/${invoice.id}/edit`)
                    }
                    className="btn btn-outline-primary"
                >
                    <i className="fas fa-edit me-2"></i>
                    Edit
                </button>
            )}

            {/* Cash Payment Confirmation */}
            {canConfirmCash() && (
                <button
                    onClick={() => setShowCashModal(true)}
                    disabled={loading}
                    className="btn btn-success"
                >
                    <i className="fas fa-money-bill me-2"></i>
                    {loading ? "Processing..." : "Confirm Cash Received"}
                </button>
            )}

            {/* More Actions Dropdown */}
            <div className="dropdown">
                <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <i className="fas fa-ellipsis-v"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                    <li>
                        <button
                            className="dropdown-item"
                            onClick={() => window.print()}
                        >
                            <i className="fas fa-download me-2"></i>
                            Download PDF
                        </button>
                        {/* <button
                            className="dropdown-item"
                            onClick={handleDownloadPDF}
                            disabled={downloadingPDF}
                        >
                            {downloadingPDF ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-download me-2"></i>
                                    Download PDF
                                </>
                            )}
                        </button> */}
                    </li>
                    <li>
                        {/* <button
                            className="dropdown-item"
                            onClick={() =>
                                navigator.clipboard.writeText(
                                    window.location.href
                                )
                            }
                        >
                            <i className="fas fa-link me-2"></i>
                            Copy Link
                        </button> */}
                    </li>
                    {/* <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <button
                            className="dropdown-item"
                            onClick={() =>
                                (window.location.href = `/provider/invoices/${invoice.id}/duplicate`)
                            }
                        >
                            <i className="fas fa-copy me-2"></i>
                            Duplicate Invoice
                        </button>
                    </li> */}
                    {invoice.status === "draft" && (
                        <>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button
                                    onClick={() =>
                                        confirm("Delete this invoice?") &&
                                        console.log("Delete")
                                    }
                                    className="dropdown-item text-danger"
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
            {/* Cash Payment Modal */}
            {showCashModal && (
                <CashPaymentModal
                    invoice={invoice}
                    isOpen={showCashModal}
                    onClose={() => setShowCashModal(false)}
                    onConfirm={handleConfirmCash}
                />
            )}
        </div>
    );
};

export default InvoiceActions;
