import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import invoiceService from "../../../services/invoiceService";
import providerAppointmentService from "../../../services/providerAppointmentService";
import notificationService from "../../../services/notificationService";

const CreateInvoice = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const appointmentId = searchParams.get("appointment_id");

    const [appointment, setAppointment] = useState(null);
    const [formData, setFormData] = useState({
        appointment_id: appointmentId || "",
        payment_method: "",
        due_days: 7,
        notes: "",
        line_items: [],
    });
    const [loading, setLoading] = useState(false);
    const [appointmentLoading, setAppointmentLoading] = useState(
        !!appointmentId
    );

    useEffect(() => {
        if (appointmentId) {
            loadAppointment();
        }
    }, [appointmentId]);

    const loadAppointment = async () => {
        setAppointmentLoading(true);
        try {
            const result =
                await providerAppointmentService.getAppointmentDetail(
                    appointmentId
                );
            if (result.success) {
                setAppointment(result.data);
                setFormData((prev) => ({
                    ...prev,
                    line_items: generateDefaultLineItems(result.data),
                }));
            }
        } catch (error) {
            console.error("Error loading appointment:", error);
        }
        setAppointmentLoading(false);
    };

    const generateDefaultLineItems = (appointment) => {
        const items = [];

        items.push({
            description: appointment.service?.title || "Service",
            quantity: 1,
            rate: appointment.base_price || appointment.total_price,
            amount: appointment.base_price || appointment.total_price,
        });

        if (appointment.travel_fee > 0) {
            items.push({
                description: "Travel/Transportation Fee",
                quantity: 1,
                rate: appointment.travel_fee,
                amount: appointment.travel_fee,
            });
        }

        return items;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await invoiceService.createInvoice(formData);
            if (result.success) {
                notificationService.success("Invoice created successfully!");
                navigate(`/provider/invoices/${result.data.id}`);
            } else {
                notificationService.error(result.message || "Failed to create invoice");
            }
        } catch (error) {
            notificationService.error("Error creating invoice");
        }
        setLoading(false);
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
                newItems[index].amount =
                    newItems[index].quantity * newItems[index].rate;
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
            (sum, item) => sum + (item.amount || 0),
            0
        );
    };

    if (appointmentLoading) {
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
                        <p className="mt-2 text-muted">
                            Loading appointment...
                        </p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="container-fluid">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col">
                        <div className="d-flex align-items-center">
                            <button
                                onClick={() => navigate("/provider/invoices")}
                                className="btn btn-outline-secondary btn-sm me-3"
                            >
                                <i className="fas fa-arrow-left me-1"></i>
                                Back
                            </button>
                            <div>
                                <h1 className="h2 mb-1 fw-bold">
                                    Create Invoice
                                </h1>
                                <p className="text-muted mb-0">
                                    Generate an invoice for completed services
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointment Info */}
                {appointment && (
                    <div className="alert alert-info border-0 shadow-sm mb-4">
                        <div className="d-flex align-items-center mb-2">
                            <i className="fas fa-info-circle me-2"></i>
                            <h6 className="mb-0 fw-bold">
                                Appointment Details
                            </h6>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <small className="text-muted">Client:</small>
                                <div className="fw-medium">
                                    {appointment.client?.name}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Service:</small>
                                <div className="fw-medium">
                                    {appointment.service?.title}
                                </div>
                            </div>
                            <div className="col-md-4">
                                <small className="text-muted">Date:</small>
                                <div className="fw-medium">
                                    {new Date(
                                        appointment.appointment_date
                                    ).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <h5 className="card-title mb-0">
                            <i className="fas fa-file-invoice me-2"></i>
                            Invoice Information
                        </h5>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            {/* Basic Info */}
                            <div className="row g-3 mb-4">
                                <div className="col-md-6">
                                    <label className="form-label">
                                        <i className="fas fa-credit-card me-1"></i>
                                        Payment Method
                                    </label>
                                    <select
                                        className="form-select"
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
                                        <option value="cash">Cash</option>
                                        <option value="card">
                                            Credit/Debit Card
                                        </option>
                                        <option value="bank_transfer">
                                            Bank Transfer
                                        </option>
                                        <option value="online">
                                            Online Payment
                                        </option>
                                    </select>
                                </div>

                                <div className="col-md-6">
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
                                    />
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
                                                    Quantity
                                                </th>
                                                <th
                                                    style={{ width: "15%" }}
                                                    className="text-end"
                                                >
                                                    Rate ($)
                                                </th>
                                                <th
                                                    style={{ width: "15%" }}
                                                    className="text-end"
                                                >
                                                    Amount ($)
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
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm text-end"
                                                                min="0"
                                                                step="0.01"
                                                                required
                                                                value={
                                                                    item.rate
                                                                }
                                                                onChange={(e) =>
                                                                    updateLineItem(
                                                                        index,
                                                                        "rate",
                                                                        parseFloat(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    )
                                                                }
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm text-end bg-light"
                                                                readOnly
                                                                value={item.amount.toFixed(
                                                                    2
                                                                )}
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
                                                    colspan="3"
                                                    className="text-end fw-bold"
                                                >
                                                    Subtotal:
                                                </td>
                                                <td className="text-end fw-bold bg-light">
                                                    $
                                                    {calculateSubtotal().toFixed(
                                                        2
                                                    )}
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
                                />
                            </div>

                            {/* Actions */}
                            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate("/provider/invoices")
                                    }
                                    className="btn btn-outline-secondary"
                                >
                                    <i className="fas fa-times me-1"></i>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={
                                        loading ||
                                        formData.line_items.length === 0
                                    }
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-check me-1"></i>
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            ></span>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Invoice"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default CreateInvoice;
