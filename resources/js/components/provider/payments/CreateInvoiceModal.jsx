import React, { useState, useEffect } from "react";
import invoiceService from "../../../services/invoiceService";

const CreateInvoiceModal = ({ appointment, isOpen, onClose, onComplete }) => {
    const [formData, setFormData] = useState({
        appointment_id: "",
        due_days: 7,
        notes: "",
        line_items: [],
        send_invoice: false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && appointment) {
            setFormData({
                appointment_id: appointment.id,
                due_days: 7,
                notes: "",
                line_items: generateDefaultLineItems(appointment),
                send_invoice: false,
            });
            setLoading(false);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen, appointment]);

    const generateDefaultLineItems = (appointment) => {
        const items = [];
        const totalPrice = parseFloat(appointment.total_price) || 0;

        items.push({
            description: appointment.service_title || "Service",
            quantity: 1,
            rate: totalPrice,
            amount: totalPrice,
        });

        return items;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            // Let the parent handle the completion and invoice creation
            await onComplete(formData);
        } catch (error) {
            console.error("Error in completion flow:", error);
            alert("Error completing service and creating invoice");
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const addLineItem = () => {
        setFormData((prev) => ({
            ...prev,
            line_items: [
                ...prev.line_items,
                {
                    description: "",
                    quantity: 1,
                    rate: 0,
                    amount: 0,
                },
            ],
        }));
    };

    const updateLineItem = (index, field, value) => {
        setFormData((prev) => {
            const newItems = [...prev.line_items];
            newItems[index] = { ...newItems[index], [field]: value };

            if (field === "quantity" || field === "rate") {
                const quantity = parseFloat(newItems[index].quantity) || 0;
                const rate = parseFloat(newItems[index].rate) || 0;
                newItems[index].amount = quantity * rate;
            }

            return { ...prev, line_items: newItems };
        });
    };

    const removeLineItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            line_items: prev.line_items.filter((_, i) => i !== index),
        }));
    };

    const calculateSubtotal = () => {
        return formData.line_items.reduce(
            (sum, item) => sum + (parseFloat(item.amount) || 0),
            0
        );
    };

    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!loading) {
            onClose();
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose(e);
        }
    };

    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay modal-responsive"
            onClick={handleBackdropClick}
        >
            <div
                className="modal-content bg-white rounded-lg shadow-xl mx-3 mx-md-0"
                onClick={handleModalContentClick}
                style={{ maxWidth: "800px", width: "100%" }}
            >
                <div className="modal-header border-bottom p-4">
                    <h5 className="modal-title mb-0 font-semibold text-lg">
                        <i className="fas fa-file-invoice me-2"></i>
                        Create Invoice
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        &times;
                    </button>
                </div>

                {/* Appointment Info */}
                {appointment && (
                    <div className="alert alert-info border-0 shadow-sm m-4 mb-0">
                        <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-info-circle me-2"></i>
                            <h6 className="mb-0 fw-bold">
                                Appointment Details
                            </h6>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <small className="text-muted">Client:</small>
                                <div className="fw-medium">
                                    {appointment.client_name}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Service:</small>
                                <div className="fw-medium">
                                    {appointment.service_title}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Date:</small>
                                <div className="fw-medium">
                                    {new Date(
                                        appointment.appointment_date
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <small className="text-muted">Time:</small>
                                <div className="fw-medium">
                                    {appointment.appointment_time || "Not set"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div
                        className="modal-body p-4"
                        style={{ maxHeight: "60vh", overflowY: "auto" }}
                    >
                        {/* Basic Info */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-4">
                                <label className="form-label">
                                    <i className="fas fa-calendar me-1"></i>
                                    Due in (days)
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    min="0"
                                    max="30"
                                    value={formData.due_days}
                                    onChange={(e) =>
                                        handleChange(
                                            "due_days",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    disabled={loading}
                                />
                            </div>
                            <div className="col-md-8">
                                <div className="form-check mt-4">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="sendInvoice"
                                        checked={formData.send_invoice}
                                        onChange={(e) =>
                                            handleChange("send_invoice", e.target.checked)
                                        }
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="sendInvoice">
                                        <i className="fas fa-paper-plane me-1"></i>
                                        Send invoice to client immediately
                                        <small className="d-block text-muted">
                                            If unchecked, invoice will be saved as draft for review
                                        </small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    <i className="fas fa-list me-2"></i>
                                    Line Items
                                </h5>
                                <button
                                    type="button"
                                    onClick={addLineItem}
                                    className="btn btn-outline-primary btn-sm"
                                    disabled={loading}
                                >
                                    <i className="fas fa-plus me-1"></i>
                                    Add Item
                                </button>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th style={{ width: "40%" }}>
                                                Description
                                            </th>
                                            <th
                                                style={{ width: "15%" }}
                                                className="text-center"
                                            >
                                                No. of Hours
                                            </th>
                                            <th
                                                style={{ width: "15%" }}
                                                className="text-end"
                                            >
                                                Rate (Rs.)
                                            </th>
                                            <th
                                                style={{ width: "15%" }}
                                                className="text-end"
                                            >
                                                Amount (Rs.)
                                            </th>
                                            <th
                                                style={{ width: "15%" }}
                                                className="text-center"
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.line_items.map(
                                            (item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            required
                                                            value={
                                                                item.description
                                                            }
                                                            onChange={(e) =>
                                                                updateLineItem(
                                                                    index,
                                                                    "description",
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            placeholder="Item description"
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm text-center"
                                                            min="1"
                                                            step="0.1"
                                                            required
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(e) =>
                                                                updateLineItem(
                                                                    index,
                                                                    "quantity",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm text-end"
                                                            min="0"
                                                            step="0.01"
                                                            required
                                                            value={item.rate}
                                                            onChange={(e) =>
                                                                updateLineItem(
                                                                    index,
                                                                    "rate",
                                                                    parseFloat(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                            disabled={loading}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm text-end bg-light"
                                                            readOnly
                                                            value={(
                                                                parseFloat(
                                                                    item.amount
                                                                ) || 0
                                                            ).toFixed(2)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeLineItem(
                                                                    index
                                                                )
                                                            }
                                                            className="btn btn-outline-danger btn-sm"
                                                            title="Remove item"
                                                            disabled={loading}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td
                                                colSpan="3"
                                                className="text-end fw-bold"
                                            >
                                                Subtotal:
                                            </td>
                                            <td className="text-end fw-bold bg-light">
                                                Rs.{" "}
                                                {calculateSubtotal().toFixed(2)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className="form-label">
                                <i className="fas fa-sticky-note me-1"></i>
                                Notes (Optional)
                            </label>
                            <textarea
                                className="form-control"
                                rows="4"
                                value={formData.notes}
                                onChange={(e) =>
                                    handleChange("notes", e.target.value)
                                }
                                placeholder="Add any additional notes or terms..."
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-footer border-top p-3">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                loading || formData.line_items.length === 0
                            }
                            className="btn btn-primary"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check me-1"></i>
                                    {formData.send_invoice 
                                        ? "Complete Service & Send Invoice" 
                                        : "Complete Service & Create Invoice"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }

                .modal-content {
                    max-height: 90vh;
                    overflow: hidden;
                }

                .btn-close {
                    background: none;
                    border: none;
                    font-size: 1.5rem;
                    line-height: 1;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .btn-close:hover {
                    color: #333;
                    background: #f8f9fa;
                }

                .btn-close:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 768px) {
                    .modal-overlay {
                        padding: 0.5rem;
                    }

                    .modal-content {
                        max-height: 95vh;
                    }

                    .table-responsive {
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default CreateInvoiceModal;
