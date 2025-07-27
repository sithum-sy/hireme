import React from "react";
import { Link } from "react-router-dom";

const ServiceActions = ({ service, onToggleStatus, onDelete, loading }) => {
    const getStatusBadge = () => {
        if (!service) return null;

        return service.is_active ? (
            <span className="badge bg-success">
                <i className="fas fa-check-circle me-1"></i>
                Active
            </span>
        ) : (
            <span className="badge bg-secondary">
                <i className="fas fa-pause-circle me-1"></i>
                Inactive
            </span>
        );
    };

    return (
        <>
            {/* Header Section with Actions */}
            <div className="service-header mb-4">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                            <h4 className="fw-bold mb-0 me-3">
                                {service.title}
                            </h4>
                            {getStatusBadge()}
                            <span
                                className={`badge bg-${service.category.color} bg-opacity-10 text-${service.category.color} ms-2`}
                            >
                                <i
                                    className={`${service.category.icon} me-1`}
                                ></i>
                                {service.category.name}
                            </span>
                        </div>
                        <p className="text-muted mb-0">
                            Created{" "}
                            {new Date(service.created_at).toLocaleDateString()}{" "}
                            • Last updated{" "}
                            {new Date(service.updated_at).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="col-md-4 text-md-end">
                        <div className="btn-group me-2">
                            <Link
                                to={`/provider/services/${service.id}/edit`}
                                className="btn btn-outline-primary"
                            >
                                <i className="fas fa-edit me-2"></i>
                                Edit Service
                            </Link>
                            <button
                                className={`btn ${
                                    service.is_active
                                        ? "btn-outline-warning"
                                        : "btn-outline-success"
                                }`}
                                onClick={onToggleStatus}
                                disabled={loading}
                            >
                                <i
                                    className={`fas ${
                                        service.is_active
                                            ? "fa-pause"
                                            : "fa-play"
                                    } me-2`}
                                ></i>
                                {service.is_active ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Card */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-bottom">
                    <h6 className="mb-0 fw-bold">
                        <i className="fas fa-bolt text-primary me-2"></i>
                        Quick Actions
                    </h6>
                </div>
                <div className="card-body">
                    <div className="d-grid gap-2">
                        <Link
                            to={`/provider/services/${service.id}/edit`}
                            className="btn btn-primary"
                        >
                            <i className="fas fa-edit me-2"></i>
                            Edit Service
                        </Link>
                        <button
                            className={`btn ${
                                service.is_active
                                    ? "btn-warning"
                                    : "btn-success"
                            }`}
                            onClick={onToggleStatus}
                            disabled={loading}
                        >
                            <i
                                className={`fas ${
                                    service.is_active ? "fa-pause" : "fa-play"
                                } me-2`}
                            ></i>
                            {service.is_active
                                ? "Deactivate Service"
                                : "Activate Service"}
                        </button>
                        <hr />
                        <button
                            className="btn btn-outline-danger"
                            onClick={onDelete}
                        >
                            <i className="fas fa-trash me-2"></i>
                            Delete Service
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ServiceActions;
