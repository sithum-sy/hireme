import React, { useState, useEffect } from "react";

const ProviderServices = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Mock data with location
    const mockServices = [
        {
            id: 1,
            title: "Professional House Cleaning",
            description:
                "Complete home cleaning service including kitchen, bathrooms, and living areas. Eco-friendly products used.",
            category: {
                id: 1,
                name: "Cleaning",
                icon: "fas fa-broom",
                color: "primary",
            },
            pricing_type: "hourly",
            base_price: 250,
            duration_hours: 3,
            service_areas: ["Colombo", "Mount Lavinia", "Dehiwala"],
            location: {
                lat: 6.9271,
                lng: 79.8612,
                address: "Bambalapitiya, Colombo",
                city: "Colombo",
                neighborhood: "Bambalapitiya",
                radius: 10,
            },
            service_radius: 10,
            average_rating: 4.8,
            views_count: 156,
            bookings_count: 23,
            is_active: true,
            first_image_url: null,
        },
        {
            id: 2,
            title: "Math & Physics Tutoring",
            description:
                "Expert tutoring for O/L and A/L students. Individual attention and proven results.",
            category: {
                id: 2,
                name: "Education",
                icon: "fas fa-graduation-cap",
                color: "success",
            },
            pricing_type: "fixed",
            base_price: 1500,
            duration_hours: 2,
            service_areas: ["Kandy", "Peradeniya", "Gampola"],
            location: {
                lat: 7.2906,
                lng: 80.6337,
                address: "Kandy City Center, Kandy",
                city: "Kandy",
                neighborhood: "City Center",
                radius: 15,
            },
            service_radius: 15,
            average_rating: 5.0,
            views_count: 89,
            bookings_count: 12,
            is_active: true,
            first_image_url: null,
        },
        {
            id: 3,
            title: "Plumbing Repair Services",
            description:
                "24/7 emergency plumbing services. Fix leaks, unclog drains, and install fixtures.",
            category: {
                id: 3,
                name: "Home Services",
                icon: "fas fa-wrench",
                color: "warning",
            },
            pricing_type: "custom",
            base_price: 0,
            duration_hours: 1,
            service_areas: ["Galle", "Hikkaduwa", "Unawatuna"],
            location: {
                lat: 6.0535,
                lng: 80.221,
                address: "Galle Fort, Galle",
                city: "Galle",
                neighborhood: "Fort",
                radius: 25,
            },
            service_radius: 25,
            average_rating: 4.5,
            views_count: 234,
            bookings_count: 45,
            is_active: false,
            first_image_url: null,
        },
    ];

    useEffect(() => {
        // Simulate loading services
        setTimeout(() => {
            setServices(mockServices);
            setLoading(false);
        }, 1000);
    }, []);

    const filteredServices = services.filter((service) => {
        if (filter === "all") return true;
        if (filter === "active") return service.is_active;
        if (filter === "inactive") return !service.is_active;
        return true;
    });

    const handleDelete = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (serviceToDelete) {
            // Simulate deletion
            setServices((prev) =>
                prev.filter((s) => s.id !== serviceToDelete.id)
            );
            setShowDeleteModal(false);
            setServiceToDelete(null);
        }
    };

    const handleToggleStatus = (serviceId) => {
        setServices((prev) =>
            prev.map((service) =>
                service.id === serviceId
                    ? { ...service, is_active: !service.is_active }
                    : service
            )
        );
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
        } else if (service.pricing_type === "hourly") {
            return `Rs. ${service.base_price.toLocaleString()}/hour`;
        } else {
            return "Custom Pricing";
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
                    <button className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>
                        Add New Service
                    </button>
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
                                All Services ({services.length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    filter === "active" ? "active" : ""
                                }`}
                                onClick={() => setFilter("active")}
                            >
                                Active (
                                {services.filter((s) => s.is_active).length})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    filter === "inactive" ? "active" : ""
                                }`}
                                onClick={() => setFilter("inactive")}
                            >
                                Inactive (
                                {services.filter((s) => !s.is_active).length})
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
                ) : filteredServices.length > 0 ? (
                    <div className="row">
                        {filteredServices.map((service) => (
                            <div
                                key={service.id}
                                className="col-lg-6 col-xl-4 mb-4"
                            >
                                <div className="card h-100 shadow-sm border-0 service-card">
                                    {/* Service Image */}
                                    <div className="service-image position-relative">
                                        {service.first_image_url ? (
                                            <img
                                                src={service.first_image_url}
                                                alt={service.title}
                                                className="card-img-top"
                                                style={{
                                                    height: "200px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="no-image bg-light d-flex align-items-center justify-content-center"
                                                style={{ height: "200px" }}
                                            >
                                                <i className="fas fa-image fa-3x text-muted"></i>
                                            </div>
                                        )}
                                        <div className="position-absolute top-0 end-0 m-2">
                                            {getStatusBadge(service.is_active)}
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        {/* Title and Category */}
                                        <div className="mb-2">
                                            <h5 className="card-title mb-1">
                                                {service.title}
                                            </h5>
                                            <div className="text-muted small">
                                                <i
                                                    className={`${service.category.icon} text-${service.category.color} me-1`}
                                                ></i>
                                                {service.category.name}
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="card-text text-muted small">
                                            {service.description.length > 100
                                                ? service.description.substring(
                                                      0,
                                                      100
                                                  ) + "..."
                                                : service.description}
                                        </p>

                                        {/* Location Info */}
                                        <div className="location-info bg-light rounded p-2 mb-3">
                                            <div className="d-flex align-items-center mb-1">
                                                <i className="fas fa-map-marker-alt text-danger me-2"></i>
                                                <small className="fw-semibold">
                                                    {service.location.address}
                                                </small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-circle-notch text-primary me-2"></i>
                                                <small>
                                                    Service radius:{" "}
                                                    {service.service_radius}km
                                                </small>
                                            </div>
                                        </div>

                                        {/* Service Areas */}
                                        <div className="mb-3">
                                            <small className="text-muted">
                                                Service Areas:
                                            </small>
                                            <div className="d-flex flex-wrap gap-1 mt-1">
                                                {service.service_areas
                                                    .slice(0, 3)
                                                    .map((area, index) => (
                                                        <span
                                                            key={index}
                                                            className="badge bg-light text-dark"
                                                        >
                                                            {area}
                                                        </span>
                                                    ))}
                                                {service.service_areas.length >
                                                    3 && (
                                                    <span className="badge bg-light text-dark">
                                                        +
                                                        {service.service_areas
                                                            .length - 3}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price and Stats */}
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="price fw-bold text-primary">
                                                {getPricingDisplay(service)}
                                            </div>
                                            <div className="stats d-flex gap-3 small text-muted">
                                                <span>
                                                    <i className="fas fa-star text-warning"></i>{" "}
                                                    {service.average_rating}
                                                </span>
                                                <span>
                                                    <i className="fas fa-eye"></i>{" "}
                                                    {service.views_count}
                                                </span>
                                                <span>
                                                    <i className="fas fa-calendar-check"></i>{" "}
                                                    {service.bookings_count}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-outline-primary btn-sm flex-grow-1">
                                                <i className="fas fa-edit me-1"></i>
                                                Edit
                                            </button>
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
                                                    }`}
                                                ></i>
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() =>
                                                    handleDelete(service)
                                                }
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state text-center py-5">
                        <i className="fas fa-concierge-bell fa-4x text-muted mb-3"></i>
                        <h5 className="text-muted mb-3">No services found</h5>
                        <p className="text-muted mb-4">
                            {filter === "all"
                                ? "You haven't created any services yet. Start by adding your first service!"
                                : `No ${filter} services found. Try a different filter or create a new service.`}
                        </p>
                        <button className="btn btn-primary">
                            <i className="fas fa-plus me-2"></i>
                            Create Your First Service
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-backdrop">
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

            <style jsx>{`
                .service-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .service-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                }

                .nav-pills .nav-link {
                    color: #6c757d;
                }

                .nav-pills .nav-link.active {
                    background-color: #fd7e14;
                    color: white;
                }

                .location-info {
                    border-left: 3px solid #fd7e14;
                }

                .modal-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1050;
                }

                .modal-dialog {
                    background: white;
                    border-radius: 0.5rem;
                    max-width: 500px;
                    width: 90%;
                    margin: 1.75rem auto;
                }

                .modal-content {
                    border: none;
                    border-radius: 0.5rem;
                }

                @media (max-width: 768px) {
                    .service-filters {
                        overflow-x: auto;
                    }

                    .nav-pills {
                        flex-wrap: nowrap;
                        white-space: nowrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProviderServices;
