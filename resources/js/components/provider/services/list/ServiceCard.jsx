import React from "react";
import { Link } from "react-router-dom";

const ServiceCard = ({ 
    service, 
    onToggleStatus, 
    onDelete, 
    onSelect,
    isSelected = false 
}) => {
    const formatPrice = (price, pricingType) => {
        if (pricingType === "custom") return "Custom pricing";
        const formattedPrice = `Rs. ${parseFloat(price).toLocaleString()}`;
        return pricingType === "hourly" ? `${formattedPrice}/hr` : formattedPrice;
    };

    const getStatusBadge = (isActive) => {
        return isActive ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    const getRatingDisplay = (rating) => {
        const stars = Math.floor(rating);
        return (
            <div className="d-flex align-items-center">
                {[...Array(5)].map((_, i) => (
                    <i
                        key={i}
                        className={`fas fa-star ${
                            i < stars ? "text-warning" : "text-muted"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                    ></i>
                ))}
                <span className="ms-1 small text-muted">({rating.toFixed(1)})</span>
            </div>
        );
    };

    return (
        <div className="card service-card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
                {/* Header with checkbox and status */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelect(service.id, e.target.checked)}
                        />
                    </div>
                    {getStatusBadge(service.is_active)}
                </div>

                {/* Service Image */}
                {service.first_image_url && (
                    <div className="service-image mb-3">
                        <img
                            src={service.first_image_url}
                            alt={service.title}
                            className="img-fluid rounded"
                            style={{
                                height: "150px",
                                width: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                )}

                {/* Service Info */}
                <div className="service-info">
                    <h6 className="card-title fw-bold mb-2">
                        <Link
                            to={`/provider/services/${service.id}`}
                            className="text-decoration-none text-dark"
                        >
                            {service.title}
                        </Link>
                    </h6>

                    <p className="text-muted small mb-2">
                        {service.description.length > 100
                            ? `${service.description.substring(0, 100)}...`
                            : service.description}
                    </p>

                    <div className="mb-2">
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                            {service.category.name}
                        </span>
                    </div>

                    {/* Pricing */}
                    <div className="pricing mb-3">
                        <h6 className="text-primary mb-1">
                            {formatPrice(service.base_price, service.pricing_type)}
                        </h6>
                        <small className="text-muted">
                            Duration: {service.duration_hours} hour
                            {service.duration_hours !== 1 ? "s" : ""}
                        </small>
                    </div>

                    {/* Stats */}
                    <div className="stats-row mb-3">
                        <div className="row text-center">
                            <div className="col-4">
                                <div className="stat-item">
                                    <div className="fw-semibold text-primary">
                                        {service.views_count || 0}
                                    </div>
                                    <small className="text-muted">Views</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="stat-item">
                                    <div className="fw-semibold text-success">
                                        {service.bookings_count || 0}
                                    </div>
                                    <small className="text-muted">Bookings</small>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="stat-item">
                                    <div className="fw-semibold">
                                        {service.average_rating > 0
                                            ? service.average_rating.toFixed(1)
                                            : "N/A"}
                                    </div>
                                    <small className="text-muted">Rating</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Display */}
                    {service.average_rating > 0 && (
                        <div className="rating mb-3">
                            {getRatingDisplay(service.average_rating)}
                        </div>
                    )}

                    {/* Service Areas */}
                    {service.service_areas && service.service_areas.length > 0 && (
                        <div className="service-areas mb-3">
                            <small className="text-muted d-block mb-1">Service Areas:</small>
                            <div className="d-flex flex-wrap gap-1">
                                {service.service_areas.slice(0, 2).map((area, index) => (
                                    <span key={index} className="badge bg-light text-dark">
                                        {area}
                                    </span>
                                ))}
                                {service.service_areas.length > 2 && (
                                    <span className="badge bg-light text-dark">
                                        +{service.service_areas.length - 2} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Card Footer with Actions */}
            <div className="card-footer bg-light border-top-0 p-3">
                <div className="btn-group w-100" role="group">
                    <Link
                        to={`/provider/services/${service.id}`}
                        className="btn btn-outline-primary btn-sm"
                    >
                        <i className="fas fa-eye me-1"></i>
                        View
                    </Link>
                    <Link
                        to={`/provider/services/${service.id}/edit`}
                        className="btn btn-outline-secondary btn-sm"
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
                        onClick={() => onToggleStatus(service.id, service.is_active)}
                        title={service.is_active ? "Deactivate" : "Activate"}
                    >
                        <i className={`fas fa-${service.is_active ? "pause" : "play"} me-1`}></i>
                        {service.is_active ? "Pause" : "Activate"}
                    </button>
                    <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onDelete(service)}
                        title="Delete Service"
                    >
                        <i className="fas fa-trash me-1"></i>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;