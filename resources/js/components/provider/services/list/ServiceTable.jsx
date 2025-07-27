import React from "react";
import { Link } from "react-router-dom";

const ServiceTable = ({ 
    services, 
    onToggleStatus, 
    onDelete, 
    onSelect,
    onSelectAll,
    selectedServices,
    allSelected 
}) => {
    const formatPrice = (price, pricingType) => {
        if (pricingType === "custom") return "Custom";
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
        if (!rating || rating === 0) return <span className="text-muted">No ratings</span>;
        
        return (
            <div className="d-flex align-items-center">
                <div className="rating-stars me-2">
                    {[...Array(5)].map((_, i) => (
                        <i
                            key={i}
                            className={`fas fa-star ${
                                i < Math.floor(rating) ? "text-warning" : "text-muted"
                            }`}
                            style={{ fontSize: "0.75rem" }}
                        ></i>
                    ))}
                </div>
                <span className="small">({rating.toFixed(1)})</span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="service-table-container">
            <div className="card border-0 shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ width: "50px" }}>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(e) => onSelectAll(e.target.checked)}
                                        />
                                    </div>
                                </th>
                                <th>Service</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th>Stats</th>
                                <th>Rating</th>
                                <th>Created</th>
                                <th style={{ width: "150px" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={selectedServices.includes(service.id)}
                                                onChange={(e) => onSelect(service.id, e.target.checked)}
                                            />
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            {service.first_image_url && (
                                                <img
                                                    src={service.first_image_url}
                                                    alt={service.title}
                                                    className="rounded me-3"
                                                    style={{
                                                        width: "50px",
                                                        height: "50px",
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            )}
                                            <div>
                                                <Link
                                                    to={`/provider/services/${service.id}`}
                                                    className="fw-semibold text-decoration-none text-dark"
                                                >
                                                    {service.title}
                                                </Link>
                                                <div className="text-muted small">
                                                    {service.description.length > 60
                                                        ? `${service.description.substring(0, 60)}...`
                                                        : service.description}
                                                </div>
                                                {service.service_areas && service.service_areas.length > 0 && (
                                                    <div className="mt-1">
                                                        {service.service_areas.slice(0, 2).map((area, index) => (
                                                            <span 
                                                                key={index} 
                                                                className="badge bg-light text-dark me-1"
                                                                style={{ fontSize: "0.65rem" }}
                                                            >
                                                                {area}
                                                            </span>
                                                        ))}
                                                        {service.service_areas.length > 2 && (
                                                            <span 
                                                                className="badge bg-light text-dark"
                                                                style={{ fontSize: "0.65rem" }}
                                                            >
                                                                +{service.service_areas.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge bg-primary bg-opacity-10 text-primary">
                                            {service.category.name}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="fw-semibold text-primary">
                                            {formatPrice(service.base_price, service.pricing_type)}
                                        </div>
                                        <small className="text-muted">
                                            {service.duration_hours}h duration
                                        </small>
                                    </td>
                                    <td>{getStatusBadge(service.is_active)}</td>
                                    <td>
                                        <div className="service-stats">
                                            <div className="d-flex align-items-center mb-1">
                                                <i className="fas fa-eye text-muted me-1" style={{ fontSize: "0.75rem" }}></i>
                                                <small>{service.views_count || 0} views</small>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <i className="fas fa-calendar text-muted me-1" style={{ fontSize: "0.75rem" }}></i>
                                                <small>{service.bookings_count || 0} bookings</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{getRatingDisplay(service.average_rating)}</td>
                                    <td>
                                        <small className="text-muted">
                                            {formatDate(service.created_at)}
                                        </small>
                                    </td>
                                    <td>
                                        <div className="btn-group btn-group-sm" role="group">
                                            <Link
                                                to={`/provider/services/${service.id}`}
                                                className="btn btn-outline-primary btn-sm"
                                                title="View Details"
                                            >
                                                <i className="fas fa-eye"></i>
                                            </Link>
                                            <Link
                                                to={`/provider/services/${service.id}/edit`}
                                                className="btn btn-outline-secondary btn-sm"
                                                title="Edit Service"
                                            >
                                                <i className="fas fa-edit"></i>
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
                                                <i className={`fas fa-${service.is_active ? "pause" : "play"}`}></i>
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => onDelete(service)}
                                                title="Delete Service"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {services.length === 0 && (
                    <div className="text-center py-5">
                        <div className="mb-3">
                            <i className="fas fa-search fa-3x text-muted"></i>
                        </div>
                        <h5 className="text-muted">No services found</h5>
                        <p className="text-muted">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceTable;