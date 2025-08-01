import React, { useState, useEffect } from "react";

const CompleteServiceModal = ({ appointment, isOpen, onClose, onComplete }) => {
    const [formData, setFormData] = useState({
        notes: "",
        create_invoice: true,
        send_invoice: false,
        send_notification: true,
    });
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                notes: "",
                create_invoice: true,
                send_invoice: false,
                send_notification: true,
            });
            setLoading(false);

            // ✅ FIX: Prevent body scrolling when modal is open
            document.body.style.overflow = "hidden";
        } else {
            // ✅ FIX: Restore body scrolling when modal is closed
            document.body.style.overflow = "unset";
        }

        // ✅ FIX: Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);

        try {
            await onComplete(formData);
            // onClose();
        } catch (error) {
            console.error("Error completing service:", error);
            setLoading(false);
        }
    };

    const handleClose = (e) => {
        // ✅ FIX: Prevent event bubbling that causes flickering
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!loading) {
            onClose();
        }
    };

    // ✅ FIX: Handle backdrop clicks properly
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose(e);
        }
    };

    // ✅ FIX: Prevent modal content clicks from closing modal
    const handleModalContentClick = (e) => {
        e.stopPropagation();
    };

    // Helper function to safely get client name
    const getClientName = () => {
        return (
            appointment?.client?.name ||
            appointment?.client_name ||
            (appointment?.client?.first_name && appointment?.client?.last_name
                ? `${appointment.client.first_name} ${appointment.client.last_name}`
                : null) ||
            "Unknown Client"
        );
    };

    // return (
    //     <>
    //         <div className="modal-backdrop fade show" onClick={onClose}></div>
    //         <div className="modal fade show d-block" tabIndex="-1">
    //             <div className="modal-dialog modal-dialog-centered">
    //                 <div className="modal-content">
    //                     <div className="modal-header">
    //                         <h5 className="modal-title">
    //                             <i className="fas fa-check-circle text-success me-2"></i>
    //                             Complete Service
    //                         </h5>
    //                         <button
    //                             type="button"
    //                             className="btn-close"
    //                             onClick={onClose}
    //                         ></button>
    //                     </div>

    //                     <form onSubmit={handleSubmit}>
    //                         <div className="modal-body">
    //                             <div className="alert alert-info">
    //                                 <i className="fas fa-info-circle me-2"></i>
    //                                 Completing this service will automatically
    //                                 create an invoice for the client.
    //                             </div>

    //                             {/* Service Notes */}
    //                             <div className="mb-3">
    //                                 <label className="form-label">
    //                                     Completion Notes (Optional)
    //                                 </label>
    //                                 <textarea
    //                                     className="form-control"
    //                                     rows="3"
    //                                     value={formData.notes}
    //                                     onChange={(e) =>
    //                                         setFormData((prev) => ({
    //                                             ...prev,
    //                                             notes: e.target.value,
    //                                         }))
    //                                     }
    //                                     placeholder="Add any notes about the completed service..."
    //                                 />
    //                             </div>

    //                             {/* Invoice Options */}
    //                             <div className="mb-3">
    //                                 <h6>Invoice Options</h6>

    //                                 <div className="form-check">
    //                                     <input
    //                                         className="form-check-input"
    //                                         type="checkbox"
    //                                         checked={formData.create_invoice}
    //                                         onChange={(e) =>
    //                                             setFormData((prev) => ({
    //                                                 ...prev,
    //                                                 create_invoice:
    //                                                     e.target.checked,
    //                                             }))
    //                                         }
    //                                     />
    //                                     <label className="form-check-label">
    //                                         Create invoice automatically
    //                                     </label>
    //                                 </div>

    //                                 {formData.create_invoice && (
    //                                     <div className="form-check mt-2">
    //                                         <input
    //                                             className="form-check-input"
    //                                             type="checkbox"
    //                                             checked={formData.send_invoice}
    //                                             onChange={(e) =>
    //                                                 setFormData((prev) => ({
    //                                                     ...prev,
    //                                                     send_invoice:
    //                                                         e.target.checked,
    //                                                 }))
    //                                             }
    //                                         />
    //                                         <label className="form-check-label">
    //                                             Send invoice to client
    //                                             immediately
    //                                             <small className="d-block text-muted">
    //                                                 If unchecked, invoice will
    //                                                 be saved as draft for review
    //                                             </small>
    //                                         </label>
    //                                     </div>
    //                                 )}
    //                             </div>

    //                             {/* Client Info */}
    //                             <div className="bg-light p-3 rounded">
    //                                 <h6>Invoice Details</h6>
    //                                 <div className="row">
    //                                     <div className="col-6">
    //                                         <small className="text-muted">
    //                                             Client:
    //                                         </small>
    //                                         <div>{appointment.client_name}</div>
    //                                     </div>
    //                                     <div className="col-6">
    //                                         <small className="text-muted">
    //                                             Amount:
    //                                         </small>
    //                                         <div className="fw-bold">
    //                                             Rs. {appointment.total_price}
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>
    //                         </div>

    //                         <div className="modal-footer">
    //                             <button
    //                                 type="button"
    //                                 className="btn btn-secondary"
    //                                 onClick={onClose}
    //                             >
    //                                 Cancel
    //                             </button>
    //                             <button
    //                                 type="submit"
    //                                 className="btn btn-success"
    //                                 disabled={loading}
    //                             >
    //                                 {loading ? (
    //                                     <>
    //                                         <span className="spinner-border spinner-border-sm me-2"></span>
    //                                         Completing...
    //                                     </>
    //                                 ) : (
    //                                     <>
    //                                         <i className="fas fa-check me-2"></i>
    //                                         Complete Service
    //                                     </>
    //                                 )}
    //                             </button>
    //                         </div>
    //                     </form>
    //                 </div>
    //             </div>
    //         </div>
    //     </>
    // );

    return (
        <div
            className="modal-overlay modal-responsive"
            onClick={handleBackdropClick}
        >
            <div
                className="modal-content bg-white rounded-lg shadow-xl mx-3 mx-md-0"
                onClick={handleModalContentClick}
                style={{ maxWidth: "500px", width: "100%" }}
            >
                <div className="modal-header border-bottom p-4">
                    <h5 className="modal-title mb-0 font-semibold text-lg">
                        <i className="fas fa-check-circle text-success me-2"></i>
                        Complete Service
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

                <form onSubmit={handleSubmit}>
                    <div
                        className="modal-body p-3"
                        style={{ maxHeight: "60vh", overflowY: "auto" }}
                    >
                        <div className="alert alert-info mb-4">
                            <i className="fas fa-info-circle me-2"></i>
                            Completing this service will automatically create an
                            invoice for the client.
                        </div>

                        {/* Service Notes */}
                        <div className="mb-3">
                            <label className="form-label">
                                Completion Notes (Optional)
                            </label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        notes: e.target.value,
                                    }))
                                }
                                placeholder="Add any notes about the completed service..."
                                disabled={loading}
                            />
                        </div>

                        {/* Invoice Options */}
                        <div className="mb-3">
                            <h6>Invoice Options</h6>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    checked={formData.create_invoice}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            create_invoice: e.target.checked,
                                        }))
                                    }
                                    disabled={loading}
                                />
                                <label className="form-check-label">
                                    Create invoice automatically
                                </label>
                            </div>

                            {formData.create_invoice && (
                                <div className="form-check mt-2">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={formData.send_invoice}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                send_invoice: e.target.checked,
                                            }))
                                        }
                                        disabled={loading}
                                    />
                                    <label className="form-check-label">
                                        Send invoice to client immediately
                                        <small className="d-block text-muted">
                                            If unchecked, invoice will be saved
                                            as draft for review
                                        </small>
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Client Info */}
                        <div className="bg-light p-3 rounded">
                            <h6>Invoice Details</h6>
                            <div className="row">
                                <div className="col-6">
                                    <small className="text-muted">
                                        Client:
                                    </small>
                                    <div>{getClientName()}</div>
                                </div>
                                <div className="col-6">
                                    <small className="text-muted">
                                        Amount:
                                    </small>
                                    <div className="fw-bold">
                                        Rs. {appointment.total_price}
                                    </div>
                                </div>
                            </div>
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
                            className="btn btn-success"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Completing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-check me-2"></i>
                                    Complete Service
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

        </div>
    );
};

export default CompleteServiceModal;
