import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useServices } from "../../context/ServicesContext";

const ProviderServices = () => {
    const {
        services,
        loading,
        error,
        getMyServices,
        deleteService,
        toggleServiceStatus,
    } = useServices();
    const [filter, setFilter] = useState("all"); // 'all', 'active', 'inactive'
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    useEffect(() => {
        loadServices();
    }, [filter]);

    const loadServices = async () => {
        const status = filter === "all" ? null : filter;
        await getMyServices(status);
    };

    const handleDelete = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (serviceToDelete) {
            const result = await deleteService(serviceToDelete.id);
            if (result.success) {
                setShowDeleteModal(false);
                setServiceToDelete(null);
                // Show success message
                alert("Service deleted successfully!");
            } else {
                alert("Failed to delete service: " + result.message);
            }
        }
    };

    const handleToggleStatus = async (serviceId) => {
        const result = await toggleServiceStatus(serviceId);
        if (result.success) {
            // Show success message
            alert("Service status updated successfully!");
        } else {
            alert("Failed to update service status: " + result.message);
        }
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    const getPricingDisplay = (service) => {
        if (service.pricing_type === "fixed") {
            return `Rs. ${service.base_price.toLocaleString()}`;
        } else {
            return `Rs. ${service.base_price.toLocaleString()}/hour`;
        }
    };

    return (
        <div className="provider-services">
            {/* Header */}
            <div className="services-header">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">My Services</h4>
                        <p className="text-muted mb-0">
                            Manage your service offerings
                        </p>
                    </div>
                    <Link
                        to="/provider/services/create"
                        className="btn btn-primary"
                    >
                        <i className="fas fa-plus me-2"></i>
                        Add New Service
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="service-filters mb-4">
                    <ul className="nav nav-pills">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    filter === "all" ? "active" : ""
                                }`}
                                onClick={() => setFilter("all")}
                            >
                                All Services
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    filter === "active" ? "active" : ""
                                }`}
                                onClick={() => setFilter("active")}
                            >
                                Active
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    filter === "inactive" ? "active" : ""
                                }`}
                                onClick={() => setFilter("inactive")}
                            >
                                Inactive
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Services List */}
            <div className="services-content">
                {loading ? (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        ></div>
                        <p className="mt-2">Loading services...</p>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                ) : services.data && services.data.length > 0 ? (
                    <div className="row">
                        {services.data.map((service) => (
                            <div
                                key={service.id}
                                className="col-lg-6 col-xl-4 mb-4"
                            >
                                <div className="service-card">
                                    <div className="service-image">
                                        {service.first_image_url ? (
                                            <img
                                                src={service.first_image_url}
                                                alt={service.title}
                                                className="img-fluid"
                                            />
                                        ) : (
                                            <div className="no-image">
                                                <i className="fas fa-image fa-3x text-muted"></i>
                                            </div>
                                        )}
                                        <div className="service-status">
                                            {getStatusBadge(service.is_active)}
                                        </div>
                                    </div>

                                    <div className="service-content">
                                        <div className="service-header">
                                            <h5 className="service-title">
                                                {service.title}
                                            </h5>
                                            <div className="service-category">
                                                <i
                                                    className={`fas ${
                                                        service.category.icon ||
                                                        "fa-tag"
                                                    } me-1`}
                                                ></i>
                                                {service.category.name}
                                            </div>
                                        </div>

                                        <p className="service-description">
                                            {service.description}
                                        </p>

                                        <div className="service-meta">
                                            <div className="service-price">
                                                <i className="fas fa-rupee-sign me-1"></i>
                                                {getPricingDisplay(service)}
                                            </div>
                                            <div className="service-stats">
                                                <span className="stat-item">
                                                    <i className="fas fa-star text-warning me-1"></i>
                                                    {service.average_rating ||
                                                        "N/A"}
                                                </span>
                                                <span className="stat-item">
                                                    <i className="fas fa-eye text-info me-1"></i>
                                                    {service.views_count}
                                                </span>
                                                <span className="stat-item">
                                                    <i className="fas fa-calendar-check text-success me-1"></i>
                                                    {service.bookings_count}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="service-actions">
                                            <Link
                                                to={`/provider/services/${service.id}/edit`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                <i className="fas fa-edit me-1"></i>
                                                Edit
                                            </Link>
                                            <button
                                                className={`btn btn-sm ${
                                                    service.is_active
                                                        ? "btn-outline-warning"
                                                        : "btn-outline-success"
                                                }`}
                                                onClick={() =>
                                                    handleToggleStatus(
                                                        service.id
                                                    )
                                                }
                                            >
                                                <i
                                                    className={`fas ${
                                                        service.is_active
                                                            ? "fa-pause"
                                                            : "fa-play"
                                                    } me-1`}
                                                ></i>
                                                {service.is_active
                                                    ? "Deactivate"
                                                    : "Activate"}
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(service)
                                                }
                                            >
                                                <i className="fas fa-trash me-1"></i>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="text-center py-5">
                            <i className="fas fa-concierge-bell fa-4x text-muted mb-3"></i>
                            <h5 className="text-muted mb-3">
                                No services found
                            </h5>
                            <p className="text-muted mb-4">
                                {filter === "all"
                                    ? "You haven't created any services yet. Start by adding your first service!"
                                    : `No ${filter} services found. Try a different filter or create a new service.`}
                            </p>
                            <Link
                                to="/provider/services/create"
                                className="btn btn-primary"
                            >
                                <i className="fas fa-plus me-2"></i>
                                Create Your First Service
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show"
                    style={{
                        display: "block",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete "
                                    {serviceToDelete?.title}"?
                                </p>
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    This action cannot be undone. The service
                                    will be permanently removed.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProviderServices;
