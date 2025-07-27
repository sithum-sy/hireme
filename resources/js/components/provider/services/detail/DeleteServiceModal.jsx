import React from "react";

const DeleteServiceModal = ({ service, showModal, onClose, onConfirm, loading }) => {
    const getPricingDisplay = () => {
        if (!service) return "";

        switch (service.pricing_type) {
            case "hourly":
                return `Rs. ${service.base_price.toLocaleString()}/hour`;
            case "fixed":
                return `Rs. ${service.base_price.toLocaleString()}`;
            case "custom":
                return service.custom_pricing_description || "Custom Pricing";
            default:
                return `Rs. ${service.base_price.toLocaleString()}`;
        }
    };

    if (!showModal || !service) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                            Delete Service
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                        ></button>
                    </div>
                    <div className="modal-body">
                        <div className="text-center mb-3">
                            <div className="service-preview p-3 bg-light rounded">
                                <h6 className="fw-bold">{service.title}</h6>
                                <p className="text-muted small mb-0">
                                    {service.category.name} • {getPricingDisplay()}
                                </p>
                            </div>
                        </div>
                        <p className="text-center">
                            Are you sure you want to delete this service? This action cannot be
                            undone.
                        </p>
                        <div className="alert alert-warning">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-info-circle me-2"></i>
                                <small>
                                    <strong>Impact:</strong> This service has{" "}
                                    {service.bookings_count} booking
                                    {service.bookings_count !== 1 ? "s" : ""}, {service.views_count}{" "}
                                    view{service.views_count !== 1 ? "s" : ""}, and total earnings
                                    of Rs. {service.total_earnings.toLocaleString()}.
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-trash me-2"></i>
                                    Delete Service
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteServiceModal;