import React from "react";
import { useStableImageUrl } from "../../../hooks/useStableImageUrl";

const ServicesTable = ({
    services = [],
    onToggleStatus,
    onDeleteService,
    isProcessing = false,
    loading = false,
}) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "LKR",
        }).format(price);
    };

    const getStatusBadge = (service) => {
        return service.is_active ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    const getCategoryBadge = (category) => {
        return (
            <span className="badge border border-success-subtle text-success">
                {category.icon && <i className={`${category.icon} me-1`}></i>}
                {category.name}
            </span>
        );
    };

    // Helper function to determine if a color is light
    const isLightColor = (hexColor) => {
        if (!hexColor) return false;

        // Remove # if present
        const hex = hexColor.replace("#", "");

        // Convert to RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5;
    };

    const ProviderAvatar = ({ provider }) => {
        const stableImageUrl = useStableImageUrl(
            provider.profile_picture,
            "/images/default-avatar.png"
        );

        if (!provider.profile_picture) {
            return (
                <div className="d-flex align-items-center">
                    <div
                        className="rounded-circle bg-primary d-flex align-items-center justify-content-center me-2"
                        style={{
                            width: "32px",
                            height: "32px",
                            fontSize: "12px",
                        }}
                    >
                        <i className="fas fa-user text-white"></i>
                    </div>
                    <div>
                        <div className="fw-semibold">{provider.full_name}</div>
                        <small className="text-muted">{provider.email}</small>
                    </div>
                </div>
            );
        }

        return (
            <div className="d-flex align-items-center">
                <img
                    src={stableImageUrl}
                    alt={provider.full_name}
                    className="rounded-circle me-2"
                    style={{
                        width: "32px",
                        height: "32px",
                        objectFit: "cover",
                    }}
                    onError={(e) => {
                        // Replace with fallback avatar on error
                        const fallback = document.createElement("div");
                        fallback.className =
                            "rounded-circle bg-primary d-flex align-items-center justify-content-center me-2";
                        fallback.style.width = "32px";
                        fallback.style.height = "32px";
                        fallback.style.fontSize = "12px";
                        fallback.innerHTML =
                            '<i class="fas fa-user text-white"></i>';
                        e.target.parentNode.replaceChild(fallback, e.target);
                    }}
                />
                <div>
                    <div className="fw-semibold">{provider.full_name}</div>
                    <small className="text-muted">{provider.email}</small>
                </div>
            </div>
        );
    };

    const ServiceImage = ({ service }) => {
        const hasImages = service.images && service.images.length > 0;
        const imageUrl = hasImages ? service.images[0] : null;
        const stableImageUrl = useStableImageUrl(
            imageUrl,
            "/images/service-placeholder.png"
        );

        if (!hasImages) {
            return (
                <div
                    className="rounded bg-light d-flex align-items-center justify-content-center"
                    style={{
                        width: "50px",
                        height: "50px",
                    }}
                >
                    <i className="fas fa-image text-muted"></i>
                </div>
            );
        }

        return (
            <img
                src={stableImageUrl}
                alt={service.title}
                className="rounded"
                style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                }}
                onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                }}
            />
        );
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "200px" }}
            >
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                        <th style={{ width: "60px" }}>Image</th>
                        <th>Service Details</th>
                        <th>Provider</th>
                        <th>Category</th>
                        <th style={{ width: "100px" }}>Price</th>
                        <th style={{ width: "120px" }}>Duration (hrs)</th>
                        <th style={{ width: "100px" }}>Appointments</th>
                        <th style={{ width: "100px" }}>Status</th>
                        <th style={{ width: "120px" }}>Created</th>
                        <th style={{ width: "150px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {services.map((service) => (
                        <tr key={service.id}>
                            <td>
                                <ServiceImage service={service} />
                            </td>
                            <td>
                                <div>
                                    <h6 className="mb-1">{service.title}</h6>
                                    <small className="text-muted">
                                        ID: {service.id}
                                    </small>
                                </div>
                            </td>
                            <td>
                                <ProviderAvatar provider={service.provider} />
                            </td>
                            <td>{getCategoryBadge(service.category)}</td>
                            <td>
                                <span className="fw-semibold">
                                    {formatPrice(service.price)}
                                </span>
                            </td>
                            <td>
                                <span className="text-nowrap">
                                    {service.duration
                                        ? `${service.duration} hrs`
                                        : "Not specified"}
                                </span>
                            </td>
                            <td>
                                <div className="text-center">
                                    <span className="badge bg-info">
                                        {service.statistics
                                            ?.total_appointments || 0}
                                    </span>
                                    <div>
                                        <small className="text-muted">
                                            total
                                        </small>
                                    </div>
                                </div>
                            </td>
                            <td>{getStatusBadge(service)}</td>
                            <td>
                                <small className="text-muted">
                                    {formatDate(service.created_at)}
                                </small>
                            </td>
                            <td>
                                <div className="btn-group" role="group">
                                    <a
                                        href={`/staff/services/${service.id}`}
                                        className="btn btn-sm btn-outline-primary"
                                        title="View Details"
                                    >
                                        <i className="fas fa-eye"></i>
                                    </a>
                                    <button
                                        className={`btn btn-sm ${
                                            service.is_active
                                                ? "btn-outline-warning"
                                                : "btn-outline-success"
                                        }`}
                                        onClick={() => onToggleStatus(service)}
                                        disabled={isProcessing}
                                        title={
                                            service.is_active
                                                ? "Deactivate"
                                                : "Activate"
                                        }
                                    >
                                        <i
                                            className={`fas fa-${
                                                service.is_active
                                                    ? "pause"
                                                    : "play"
                                            }`}
                                        ></i>
                                    </button>
                                    <div className="btn-group" role="group">
                                        <button
                                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                            data-bs-toggle="dropdown"
                                            aria-expanded="false"
                                        >
                                            <i className="fas fa-ellipsis-v"></i>
                                        </button>
                                        <ul className="dropdown-menu">
                                            <li>
                                                <a
                                                    className="dropdown-item"
                                                    href={`/staff/services/${service.id}`}
                                                >
                                                    <i className="fas fa-eye me-2"></i>
                                                    View Details
                                                </a>
                                            </li>
                                            <li>
                                                <a
                                                    className="dropdown-item"
                                                    href={`/staff/users/${service.provider.id}`}
                                                >
                                                    <i className="fas fa-user me-2"></i>
                                                    View Provider
                                                </a>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        // TODO: Implement view appointments functionality
                                                        console.log(
                                                            "View appointments for service:",
                                                            service.id
                                                        );
                                                    }}
                                                >
                                                    <i className="fas fa-calendar me-2"></i>
                                                    View Appointments
                                                </button>
                                            </li>
                                            <li>
                                                <hr className="dropdown-divider" />
                                            </li>
                                            <li>
                                                <button
                                                    className={`dropdown-item ${
                                                        service.is_active
                                                            ? "text-warning"
                                                            : "text-success"
                                                    }`}
                                                    onClick={() =>
                                                        onToggleStatus(service)
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <i
                                                        className={`fas fa-${
                                                            service.is_active
                                                                ? "pause"
                                                                : "play"
                                                        } me-2`}
                                                    ></i>
                                                    {service.is_active
                                                        ? "Deactivate"
                                                        : "Activate"}
                                                </button>
                                            </li>
                                            <li>
                                                <button
                                                    className="dropdown-item text-danger"
                                                    onClick={() =>
                                                        onDeleteService(service)
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <i className="fas fa-trash me-2"></i>
                                                    Delete Service
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {services.length === 0 && (
                <div className="text-center py-5">
                    <i className="fas fa-concierge-bell fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Services Found</h5>
                    <p className="text-muted mb-0">
                        No services match your current filters.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ServicesTable;
