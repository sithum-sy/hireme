import React, { useState } from "react";
import { formatCurrency } from "../../../utils/formatters";

const CashPaymentModal = ({ invoice, isOpen, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        amount_received: invoice?.total_amount || 0,
        received_at: new Date().toISOString().split("T")[0],
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.amount_received <= 0) {
            setError("Amount received must be greater than 0");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await onConfirm(formData);
            onClose();
        } catch (error) {
            setError(error.message || "Failed to confirm cash payment");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) setError("");
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose}></div>
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-bottom">
                            <h5 className="modal-title d-flex align-items-center">
                                <i className="fas fa-money-bill text-success me-2"></i>
                                Confirm Cash Payment
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                disabled={loading}
                            ></button>
                        </div>

                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                </div>
                            )}

                            {/* Invoice Summary */}
                            <div className="invoice-summary bg-light rounded p-3 mb-4">
                                <div className="row">
                                    <div className="col-6">
                                        <small className="text-muted">
                                            Invoice:
                                        </small>
                                        <div className="fw-bold">
                                            {invoice.invoice_number}
                                        </div>
                                    </div>
                                    <div className="col-6 text-end">
                                        <small className="text-muted">
                                            Amount Due:
                                        </small>
                                        <div className="fw-bold text-success h5 mb-0">
                                            {formatCurrency(
                                                invoice.total_amount
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-2" />
                                <div className="row">
                                    <div className="col-6">
                                        <small className="text-muted">
                                            Client:
                                        </small>
                                        <div>{invoice.client?.name}</div>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted">
                                            Service:
                                        </small>
                                        <div>
                                            {
                                                invoice.appointment?.service
                                                    ?.title
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Amount Received */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        <i className="fas fa-money-bill me-1"></i>
                                        Amount Received (Rs.) *
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount_received}
                                        onChange={(e) =>
                                            handleChange(
                                                "amount_received",
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        required
                                        disabled={loading}
                                    />
                                    {formData.amount_received !==
                                        invoice.total_amount && (
                                        <small className="text-warning">
                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                            Amount differs from invoice total
                                        </small>
                                    )}
                                </div>

                                {/* Date Received */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">
                                        <i className="fas fa-calendar me-1"></i>
                                        Date Received *
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.received_at}
                                        onChange={(e) =>
                                            handleChange(
                                                "received_at",
                                                e.target.value
                                            )
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                {/* Notes */}
                                <div className="mb-4">
                                    <label className="form-label fw-semibold">
                                        <i className="fas fa-sticky-note me-1"></i>
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Add any notes about the cash payment..."
                                        value={formData.notes}
                                        onChange={(e) =>
                                            handleChange(
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                        disabled={loading}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary flex-fill"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success flex-fill"
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
            </div>
        </>
    );
};

export default CashPaymentModal;
