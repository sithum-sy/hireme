import React, { useState } from "react";
import invoiceService from "../../../services/invoiceService";
import CashPaymentModal from "./CashPaymentModal";
import notificationService from "../../../services/notificationService";
import {
    InvoiceDownloadButton,
    InvoicePreviewButton,
} from "../../shared/InvoicePDFDownloader";

const InvoiceActions = ({ invoice, onUpdate, onMarkPaid }) => {
    const [loading, setLoading] = useState(false);
    const [showCashModal, setShowCashModal] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSendInvoice = async () => {
        setLoading(true);
        try {
            const result = await invoiceService.sendInvoice(invoice.id);
            if (result.success) {
                onUpdate();
                notificationService.success("Invoice sent successfully!");
            } else {
                notificationService.error(
                    result.message || "Failed to send invoice"
                );
            }
        } catch (error) {
            notificationService.error("Error sending invoice");
        }
        setLoading(false);
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
                notificationService.success(
                    "Cash payment confirmed successfully!"
                );
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
