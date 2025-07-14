import React, { useState } from "react";
import invoiceService from "../../../services/invoiceService";

const MarkPaidModal = ({ invoice, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        payment_method: "",
        transaction_id: "",
        payment_date: new Date().toISOString().split("T")[0],
        notes: "",
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await invoiceService.markInvoicePaid(
                invoice.id,
                formData
            );
            if (result.success) {
                onSuccess();
                onClose();
                alert("Invoice marked as paid successfully!");
            } else {
                alert(result.message || "Failed to mark invoice as paid");
            }
        } catch (error) {
            alert("Error marking invoice as paid");
        }
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <>
            {/* Modal Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose}></div>

            {/* Modal */}
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
                        {/* Modal Header */}
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title d-flex align-items-center">
                                <i className="fas fa-dollar-sign text-success me-2"></i>
                                Mark Invoice as Paid
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>

                        {/* Modal Body */}
                        <div className="modal-body">
                            {/* Invoice Info */}
                            <div className="alert alert-info d-flex align-items-center mb-4">
                                <i className="fas fa-info-circle me-2"></i>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between">
                                        <span>Invoice:</span>
                                        <strong>
                                            {invoice.formatted_invoice_number}
                                        </strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Amount:</span>
                                        <strong className="text-primary">
                                            ${invoice.total_amount}
                                        </strong>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span>Client:</span>
                                        <strong>{invoice.client?.name}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                {/* Payment Method */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-credit-card me-1"></i>
                                        Payment Method *
                                    </label>
                                    <select
                                        className="form-select"
                                        required
                                        value={formData.payment_method}
                                        onChange={(e) =>
                                            handleChange(
                                                "payment_method",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Select payment method
                                        </option>
                                        <option value="cash">
                                            <i className="fas fa-money-bill"></i>{" "}
                                            Cash
                                        </option>
                                        <option value="card">
                                            Credit/Debit Card
                                        </option>
                                        <option value="bank_transfer">
                                            Bank Transfer
                                        </option>
                                        <option value="check">Check</option>
                                        <option value="online">
                                            Online Payment
                                        </option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                {/* Transaction ID */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-hashtag me-1"></i>
                                        Transaction ID (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter transaction ID or reference number"
                                        value={formData.transaction_id}
                                        onChange={(e) =>
                                            handleChange(
                                                "transaction_id",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <div className="form-text">
                                        Reference number from payment gateway,
                                        bank, etc.
                                    </div>
                                </div>

                                {/* Payment Date */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-calendar me-1"></i>
                                        Payment Date *
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={formData.payment_date}
                                        onChange={(e) =>
                                            handleChange(
                                                "payment_date",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Notes */}
                                <div className="mb-3">
                                    <label className="form-label">
                                        <i className="fas fa-sticky-note me-1"></i>
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Add any additional notes about the payment..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            handleChange(
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                {/* Modal Footer */}
                                <div className="d-flex gap-2 pt-3 border-top">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={onClose}
                                    >
                                        <i className="fas fa-times me-1"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="btn btn-success flex-fill"
                                    >
                                        <i className="fas fa-check me-1"></i>
                                        {loading ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-1"
                                                    role="status"
                                                ></span>
                                                Processing...
                                            </>
                                        ) : (
                                            "Mark as Paid"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MarkPaidModal;
