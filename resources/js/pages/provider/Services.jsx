import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProvider } from "../../context/ProviderContext";
import { useServices } from "../../context/ServicesContext";
import ProviderLayout from "../../components/layouts/ProviderLayout";

const ProviderServices = () => {
    const navigate = useNavigate();
    const { businessStats } = useProvider();
    const {
        services,
        loading,
        error,
        getMyServices,
        deleteService,
        toggleServiceStatus,
        getServiceCategories,
    } = useServices();

    // Local state
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedServices, setSelectedServices] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [viewMode, setViewMode] = useState("grid"); // grid or list

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([getMyServices(), loadCategories()]);
    };

    const loadCategories = async () => {
        const result = await getServiceCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    // Filter and search services
    const filteredServices = (Array.isArray(services) ? services : []).filter(
        (service) => {
            // Filter by status
            if (filter === "active" && !service.is_active) return false;
            if (filter === "inactive" && service.is_active) return false;

            // Filter by category
            if (
                selectedCategory &&
                service.category_id !== parseInt(selectedCategory)
            )
                return false;

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    service.title.toLowerCase().includes(query) ||
                    service.description.toLowerCase().includes(query) ||
                    service.category.name.toLowerCase().includes(query) ||
                    service.service_areas.some((area) =>
                        area.toLowerCase().includes(query)
                    )
                );
            }

            return true;
        }
    );

    // Sort services
    const sortedServices = [...filteredServices].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case "title":
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case "price":
                aValue = a.base_price;
                bValue = b.base_price;
                break;
            case "rating":
                aValue = a.average_rating || 0;
                bValue = b.average_rating || 0;
                break;
            case "views":
                aValue = a.views_count || 0;
                bValue = b.views_count || 0;
                break;
            case "bookings":
                aValue = a.bookings_count || 0;
                bValue = b.bookings_count || 0;
                break;
            default: // created_at
                aValue = new Date(a.created_at);
                bValue = new Date(b.created_at);
        }

        if (sortOrder === "asc") {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Service counts for filter tabs
    const serviceCounts = {
        all: Array.isArray(services) ? services.length : 0,
        active: Array.isArray(services)
            ? services.filter((s) => s.is_active).length
            : 0,
        inactive: Array.isArray(services)
            ? services.filter((s) => !s.is_active).length
            : 0,
    };

    // Handle service actions
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
            }
        }
    };

    const handleToggleStatus = async (serviceId) => {
        await toggleServiceStatus(serviceId);
    };

    const handleBulkAction = async (action) => {
        // Implement bulk actions
        console.log(`Bulk ${action} for services:`, selectedServices);
    };

    // Get status badge
    const getStatusBadge = (isActive) => {
        return isActive ? (
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

    // Get pricing display
    const getPricingDisplay = (service) => {
        if (service.pricing_type === "fixed") {
            return `Rs. ${service.base_price.toLocaleString()}`;
        } else if (service.pricing_type === "hourly") {
            return `Rs. ${service.base_price.toLocaleString()}/hour`;
        } else {
            return "Custom Pricing";
        }
    };

    // Get performance indicator color
    const getPerformanceColor = (rating) => {
        if (rating >= 4.5) return "success";
        if (rating >= 4.0) return "warning";
        if (rating >= 3.0) return "info";
        return "secondary";
    };

    // Service analytics
    const getServiceAnalytics = () => {
        const safeServices = Array.isArray(services) ? services : [];
        const totalViews = safeServices.reduce(
            (sum, service) => sum + (service.views_count || 0),
            0
        );
        const totalBookings = safeServices.reduce(
            (sum, service) => sum + (service.bookings_count || 0),
            0
        );
        const avgRating =
            safeServices.length > 0
                ? safeServices.reduce(
                      (sum, service) => sum + (service.average_rating || 0),
                      0
                  ) / safeServices.length
                : 0;

        return { totalViews, totalBookings, avgRating };
    };

    const analytics = getServiceAnalytics();

    if (loading && services.length === 0) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "400px" }}
                >
                    <div className="text-center">
                        <div
                            className="spinner-border text-orange mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading your services...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="provider-services">
                {/* Header Section */}
                <div className="services-header mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h4 className="fw-bold mb-1">
                                <i className="fas fa-concierge-bell text-orange me-2"></i>
                                My Services
                            </h4>
                            <p className="text-muted mb-0">
                                Manage your service offerings and track
                                performance
                            </p>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <Link
                                to="/provider/services/create"
                                className="btn btn-orange"
                            >
                                <i className="fas fa-plus me-2"></i>
                                Add New Service
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Analytics Cards */}
                <div className="row mb-4">
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-primary mb-2">
                                    <i className="fas fa-concierge-bell fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {businessStats.activeServices}
                                </h4>
                                <small className="text-muted">
                                    Active Services
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-info mb-2">
                                    <i className="fas fa-eye fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {analytics.totalViews.toLocaleString()}
                                </h4>
                                <small className="text-muted">
                                    Total Views
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-success mb-2">
                                    <i className="fas fa-calendar-check fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {analytics.totalBookings}
                                </h4>
                                <small className="text-muted">
                                    Total Bookings
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-warning mb-2">
                                    <i className="fas fa-star fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {analytics.avgRating.toFixed(1)}
                                </h4>
                                <small className="text-muted">
                                    Average Rating
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Controls */}
                <div className="controls-section mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="row align-items-center">
                                {/* Filter Tabs */}
                                <div className="col-md-4">
                                    <ul className="nav nav-pills">
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    filter === "all"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() => setFilter("all")}
                                            >
                                                All ({serviceCounts.all})
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    filter === "active"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setFilter("active")
                                                }
                                            >
                                                Active ({serviceCounts.active})
                                            </button>
                                        </li>
                                        <li className="nav-item">
                                            <button
                                                className={`nav-link ${
                                                    filter === "inactive"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setFilter("inactive")
                                                }
                                            >
                                                Inactive (
                                                {serviceCounts.inactive})
                                            </button>
                                        </li>
                                    </ul>
                                </div>

                                {/* Search and Category Filter */}
                                <div className="col-md-5">
                                    <div className="row g-2">
                                        <div className="col-7">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <i className="fas fa-search"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Search services..."
                                                    value={searchQuery}
                                                    onChange={(e) =>
                                                        setSearchQuery(
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="col-5">
                                            <select
                                                className="form-select"
                                                value={selectedCategory}
                                                onChange={(e) =>
                                                    setSelectedCategory(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    All Categories
                                                </option>
                                                {Array.isArray(categories) &&
                                                    categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {category.name}
                                                            </option>
                                                        )
                                                    )}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Sort and View Controls */}
                                <div className="col-md-3 text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ width: "auto" }}
                                            value={`${sortBy}-${sortOrder}`}
                                            onChange={(e) => {
                                                const [field, order] =
                                                    e.target.value.split("-");
                                                setSortBy(field);
                                                setSortOrder(order);
                                            }}
                                        >
                                            <option value="created_at-desc">
                                                Newest First
                                            </option>
                                            <option value="created_at-asc">
                                                Oldest First
                                            </option>
                                            <option value="title-asc">
                                                Name A-Z
                                            </option>
                                            <option value="title-desc">
                                                Name Z-A
                                            </option>
                                            <option value="price-desc">
                                                Price High-Low
                                            </option>
                                            <option value="price-asc">
                                                Price Low-High
                                            </option>
                                            <option value="rating-desc">
                                                Highest Rated
                                            </option>
                                            <option value="views-desc">
                                                Most Viewed
                                            </option>
                                            <option value="bookings-desc">
                                                Most Booked
                                            </option>
                                        </select>

                                        <div className="btn-group" role="group">
                                            <button
                                                className={`btn btn-outline-secondary ${
                                                    viewMode === "grid"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setViewMode("grid")
                                                }
                                            >
                                                <i className="fas fa-th"></i>
                                            </button>
                                            <button
                                                className={`btn btn-outline-secondary ${
                                                    viewMode === "list"
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setViewMode("list")
                                                }
                                            >
                                                <i className="fas fa-list"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedServices.length > 0 && (
                    <div className="bulk-actions-bar mb-3">
                        <div className="alert alert-info d-flex justify-content-between align-items-center">
                            <span>
                                <i className="fas fa-check-square me-2"></i>
                                {selectedServices.length} service
                                {selectedServices.length > 1 ? "s" : ""}{" "}
                                selected
                            </span>
                            <div className="btn-group">
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={() => handleBulkAction("activate")}
                                >
                                    <i className="fas fa-play me-1"></i>
                                    Activate
                                </button>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() =>
                                        handleBulkAction("deactivate")
                                    }
                                >
                                    <i className="fas fa-pause me-1"></i>
                                    Deactivate
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleBulkAction("delete")}
                                >
                                    <i className="fas fa-trash me-1"></i>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Display */}
                <div className="services-content">
                    {sortedServices.length > 0 ? (
                        <div className={viewMode === "grid" ? "row" : ""}>
                            {sortedServices.map((service) => (
                                <div
                                    key={service.id}
                                    className={
                                        viewMode === "grid"
                                            ? "col-lg-6 col-xl-4 mb-4"
                                            : "mb-3"
                                    }
                                >
                                    {viewMode === "grid" ? (
                                        // Grid View
                                        <div className="card h-100 shadow-sm border-0 service-card">
                                            <div className="service-image position-relative">
                                                {service.first_image_url ? (
                                                    <img
                                                        src={
                                                            service.first_image_url
                                                        }
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
                                                        style={{
                                                            height: "200px",
                                                        }}
                                                    >
                                                        <i className="fas fa-image fa-3x text-muted"></i>
                                                    </div>
                                                )}
                                                <div className="position-absolute top-0 end-0 m-2">
                                                    {getStatusBadge(
                                                        service.is_active
                                                    )}
                                                </div>
                                                <div className="position-absolute top-0 start-0 m-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={selectedServices.includes(
                                                            service.id
                                                        )}
                                                        onChange={(e) => {
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                setSelectedServices(
                                                                    [
                                                                        ...selectedServices,
                                                                        service.id,
                                                                    ]
                                                                );
                                                            } else {
                                                                setSelectedServices(
                                                                    selectedServices.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            service.id
                                                                    )
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="card-body">
                                                {/* Category and Title */}
                                                <div className="mb-2">
                                                    <span
                                                        className={`badge bg-${
                                                            service.category
                                                                .color ||
                                                            "primary"
                                                        } bg-opacity-10 text-${
                                                            service.category
                                                                .color ||
                                                            "primary"
                                                        } mb-2`}
                                                    >
                                                        <i
                                                            className={`${service.category.icon} me-1`}
                                                        ></i>
                                                        {service.category.name}
                                                    </span>
                                                    <h5 className="card-title mb-1">
                                                        {service.title}
                                                    </h5>
                                                </div>

                                                {/* Description */}
                                                <p className="card-text text-muted small">
                                                    {service.description
                                                        .length > 100
                                                        ? service.description.substring(
                                                              0,
                                                              100
                                                          ) + "..."
                                                        : service.description}
                                                </p>

                                                {/* Location Info */}
                                                {service.location && (
                                                    <div className="location-info bg-light rounded p-2 mb-3">
                                                        <div className="d-flex align-items-center mb-1">
                                                            <i className="fas fa-map-marker-alt text-danger me-2"></i>
                                                            <small className="fw-semibold">
                                                                {
                                                                    service
                                                                        .location
                                                                        .address
                                                                }
                                                            </small>
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-circle-notch text-primary me-2"></i>
                                                            <small>
                                                                Service radius:{" "}
                                                                {
                                                                    service.service_radius
                                                                }
                                                                km
                                                            </small>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Service Areas */}
                                                <div className="mb-3">
                                                    <small className="text-muted">
                                                        Service Areas:
                                                    </small>
                                                    <div className="d-flex flex-wrap gap-1 mt-1">
                                                        {service.service_areas
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    area,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="badge bg-light text-dark"
                                                                    >
                                                                        {area}
                                                                    </span>
                                                                )
                                                            )}
                                                        {service.service_areas
                                                            .length > 3 && (
                                                            <span className="badge bg-light text-dark">
                                                                +
                                                                {service
                                                                    .service_areas
                                                                    .length -
                                                                    3}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Stats Row */}
                                                <div className="stats-row d-flex justify-content-between align-items-center mb-3">
                                                    <div className="price fw-bold text-orange">
                                                        {getPricingDisplay(
                                                            service
                                                        )}
                                                    </div>
                                                    <div className="stats d-flex gap-3 small text-muted">
                                                        <span title="Rating">
                                                            <i
                                                                className={`fas fa-star text-${getPerformanceColor(
                                                                    service.average_rating
                                                                )}`}
                                                            ></i>{" "}
                                                            {service.average_rating ||
                                                                "N/A"}
                                                        </span>
                                                        <span title="Views">
                                                            <i className="fas fa-eye"></i>{" "}
                                                            {service.views_count ||
                                                                0}
                                                        </span>
                                                        <span title="Bookings">
                                                            <i className="fas fa-calendar-check"></i>{" "}
                                                            {service.bookings_count ||
                                                                0}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer with Actions */}
                                            <div className="card-footer bg-white border-top">
                                                <div className="d-flex gap-2">
                                                    <Link
                                                        to={`/provider/services/${service.id}/edit`}
                                                        className="btn btn-outline-primary btn-sm flex-grow-1"
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
                                                        title={
                                                            service.is_active
                                                                ? "Deactivate"
                                                                : "Activate"
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
                                                    <Link
                                                        to={`/provider/services/${service.id}`} // Add this link
                                                        className="btn btn-outline-info btn-sm"
                                                        title="View Details"
                                                    >
                                                        <i className="fas fa-eye"></i>
                                                    </Link>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                service
                                                            )
                                                        }
                                                        title="Delete"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        // List View
                                        <div className="card border-0 shadow-sm service-list-item">
                                            <div className="card-body">
                                                <div className="row align-items-center">
                                                    <div className="col-md-8">
                                                        <div className="d-flex align-items-start">
                                                            <div className="me-3">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={selectedServices.includes(
                                                                        service.id
                                                                    )}
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        if (
                                                                            e
                                                                                .target
                                                                                .checked
                                                                        ) {
                                                                            setSelectedServices(
                                                                                [
                                                                                    ...selectedServices,
                                                                                    service.id,
                                                                                ]
                                                                            );
                                                                        } else {
                                                                            setSelectedServices(
                                                                                selectedServices.filter(
                                                                                    (
                                                                                        id
                                                                                    ) =>
                                                                                        id !==
                                                                                        service.id
                                                                                )
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="service-image me-3">
                                                                {service.first_image_url ? (
                                                                    <img
                                                                        src={
                                                                            service.first_image_url
                                                                        }
                                                                        alt={
                                                                            service.title
                                                                        }
                                                                        className="rounded"
                                                                        style={{
                                                                            width: "60px",
                                                                            height: "60px",
                                                                            objectFit:
                                                                                "cover",
                                                                        }}
                                                                    />
                                                                ) : (
                                                                    <div
                                                                        className="bg-light rounded d-flex align-items-center justify-content-center"
                                                                        style={{
                                                                            width: "60px",
                                                                            height: "60px",
                                                                        }}
                                                                    >
                                                                        <i className="fas fa-image text-muted"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex align-items-center mb-1">
                                                                    <h6 className="mb-0 me-2">
                                                                        {
                                                                            service.title
                                                                        }
                                                                    </h6>
                                                                    {getStatusBadge(
                                                                        service.is_active
                                                                    )}
                                                                    <span
                                                                        className={`badge bg-${
                                                                            service
                                                                                .category
                                                                                .color ||
                                                                            "primary"
                                                                        } bg-opacity-10 text-${
                                                                            service
                                                                                .category
                                                                                .color ||
                                                                            "primary"
                                                                        } ms-2`}
                                                                    >
                                                                        <i
                                                                            className={`${service.category.icon} me-1`}
                                                                        ></i>
                                                                        {
                                                                            service
                                                                                .category
                                                                                .name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="text-muted small mb-2">
                                                                    {service
                                                                        .description
                                                                        .length >
                                                                    150
                                                                        ? service.description.substring(
                                                                              0,
                                                                              150
                                                                          ) +
                                                                          "..."
                                                                        : service.description}
                                                                </p>
                                                                <div className="d-flex gap-3 small text-muted">
                                                                    <span>
                                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                                        {service.service_areas
                                                                            .slice(
                                                                                0,
                                                                                2
                                                                            )
                                                                            .join(
                                                                                ", "
                                                                            )}
                                                                        {service
                                                                            .service_areas
                                                                            .length >
                                                                            2 &&
                                                                            ` +${
                                                                                service
                                                                                    .service_areas
                                                                                    .length -
                                                                                2
                                                                            } more`}
                                                                    </span>
                                                                    <span>
                                                                        <i className="fas fa-eye me-1"></i>
                                                                        {service.views_count ||
                                                                            0}{" "}
                                                                        views
                                                                    </span>
                                                                    <span>
                                                                        <i className="fas fa-calendar-check me-1"></i>
                                                                        {service.bookings_count ||
                                                                            0}{" "}
                                                                        bookings
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4 text-end">
                                                        <div className="mb-2">
                                                            <div className="fw-bold text-orange mb-1">
                                                                {getPricingDisplay(
                                                                    service
                                                                )}
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-end">
                                                                <span
                                                                    className={`badge bg-${getPerformanceColor(
                                                                        service.average_rating
                                                                    )}`}
                                                                >
                                                                    ⭐{" "}
                                                                    {service.average_rating ||
                                                                        "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-1 justify-content-end">
                                                            <Link
                                                                to={`/provider/services/${service.id}/edit`}
                                                                className="btn btn-outline-primary btn-sm"
                                                            >
                                                                <i className="fas fa-edit"></i>
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
                                                                    }`}
                                                                ></i>
                                                            </button>
                                                            <Link
                                                                to={`/provider/services/${service.id}`}
                                                                className="btn btn-outline-info btn-sm"
                                                            >
                                                                <i className="fas fa-eye"></i>
                                                            </Link>
                                                            <button
                                                                className="btn btn-outline-danger btn-sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        service
                                                                    )
                                                                }
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Empty State
                        <div className="empty-state text-center py-5">
                            <div className="empty-icon mb-4">
                                <i className="fas fa-concierge-bell fa-4x text-muted"></i>
                            </div>
                            <h5 className="text-muted mb-3">
                                {searchQuery || selectedCategory
                                    ? "No services match your filters"
                                    : filter === "all"
                                    ? "No services found"
                                    : `No ${filter} services found`}
                            </h5>
                            <p className="text-muted mb-4">
                                {searchQuery || selectedCategory
                                    ? "Try adjusting your search or filter criteria"
                                    : filter === "all"
                                    ? "Get started by creating your first service offering"
                                    : `You don't have any ${filter} services yet`}
                            </p>
                            <div className="d-flex gap-2 justify-content-center">
                                {searchQuery || selectedCategory ? (
                                    <>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setSelectedCategory("");
                                                setFilter("all");
                                            }}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Clear Filters
                                        </button>
                                        <Link
                                            to="/provider/services/create"
                                            className="btn btn-orange"
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Add New Service
                                        </Link>
                                    </>
                                ) : (
                                    <Link
                                        to="/provider/services/create"
                                        className="btn btn-orange"
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Create Your First Service
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && serviceToDelete && (
                    <div className="modal-backdrop">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                        Confirm Delete
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-3">
                                        <div className="service-preview p-3 bg-light rounded">
                                            <h6 className="fw-bold">
                                                {serviceToDelete.title}
                                            </h6>
                                            <p className="text-muted small mb-0">
                                                {serviceToDelete.category.name}{" "}
                                                •{" "}
                                                {getPricingDisplay(
                                                    serviceToDelete
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-center">
                                        Are you sure you want to delete this
                                        service? This action cannot be undone.
                                    </p>
                                    <div className="alert alert-warning">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-info-circle me-2"></i>
                                            <small>
                                                <strong>Note:</strong> This
                                                service has{" "}
                                                {serviceToDelete.bookings_count ||
                                                    0}{" "}
                                                booking
                                                {(serviceToDelete.bookings_count ||
                                                    0) !== 1
                                                    ? "s"
                                                    : ""}
                                                and{" "}
                                                {serviceToDelete.views_count ||
                                                    0}{" "}
                                                view
                                                {(serviceToDelete.views_count ||
                                                    0) !== 1
                                                    ? "s"
                                                    : ""}
                                                .
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={confirmDelete}
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
                )}

                {/* Error Alert */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError(null)}
                        ></button>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style>{`
                .provider-services {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .service-card,
                .service-list-item {
                    transition: all 0.3s ease;
                    border: 1px solid transparent !important;
                }

                .service-card:hover,
                .service-list-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                    border-color: #fd7e14 !important;
                }

                .nav-pills .nav-link {
                    color: #6c757d;
                    border-radius: 20px;
                    padding: 0.5rem 1rem;
                    margin-right: 0.5rem;
                }

                .nav-pills .nav-link.active {
                    background-color: #fd7e14;
                    color: white;
                }

                .nav-pills .nav-link:hover:not(.active) {
                    background-color: #fff3e0;
                    color: #fd7e14;
                }

                .location-info {
                    border-left: 3px solid #fd7e14;
                }

                .service-image img {
                    transition: transform 0.3s ease;
                }

                .service-card:hover .service-image img {
                    transform: scale(1.05);
                }

                .stats-row .stats span {
                    transition: color 0.2s ease;
                }

                .stats-row .stats span:hover {
                    color: #fd7e14 !important;
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
                    animation: fadeIn 0.2s ease-in;
                }

                .modal-dialog {
                    background: white;
                    border-radius: 0.5rem;
                    max-width: 500px;
                    width: 90%;
                    margin: 1.75rem auto;
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .modal-content {
                    border: none;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .bulk-actions-bar {
                    position: sticky;
                    top: 80px;
                    z-index: 100;
                }

                .controls-section .card {
                    border: 1px solid #e9ecef;
                }

                .empty-state {
                    padding: 3rem 1rem;
                }

                .empty-icon {
                    opacity: 0.5;
                }

                .service-preview {
                    border: 1px solid #dee2e6;
                }

                .text-orange {
                    color: #fd7e14 !important;
                }

                .btn-orange {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .btn-orange:hover {
                    background-color: #e55100;
                    border-color: #e55100;
                    color: white;
                }

                .btn-outline-orange {
                    color: #fd7e14;
                    border-color: #fd7e14;
                }

                .btn-outline-orange:hover {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .bg-orange {
                    background-color: #fd7e14 !important;
                }

                .border-orange {
                    border-color: #fd7e14 !important;
                }

                /* Performance indicator colors */
                .text-success {
                    color: #198754 !important;
                }
                .text-warning {
                    color: #ffc107 !important;
                }
                .text-info {
                    color: #0dcaf0 !important;
                }
                .text-secondary {
                    color: #6c757d !important;
                }

                .bg-success {
                    background-color: #198754 !important;
                }
                .bg-warning {
                    background-color: #ffc107 !important;
                }
                .bg-info {
                    background-color: #0dcaf0 !important;
                }
                .bg-secondary {
                    background-color: #6c757d !important;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .controls-section .row {
                        flex-direction: column;
                    }

                    .controls-section .col-md-4,
                    .controls-section .col-md-5,
                    .controls-section .col-md-3 {
                        margin-bottom: 1rem;
                    }

                    .service-card .card-body {
                        padding: 1rem;
                    }

                    .service-list-item .row {
                        flex-direction: column;
                    }

                    .service-list-item .col-md-4 {
                        text-align: left !important;
                        margin-top: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .analytics .col-6 {
                        margin-bottom: 1rem;
                    }

                    .analytics .card-body {
                        padding: 1rem;
                    }

                    .analytics h4 {
                        font-size: 1.2rem;
                    }
                }

                /* Enhanced card animations */
                .card {
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .card:hover {
                    transform: translateY(-4px);
                }

                /* Button group styling */
                .btn-group .btn {
                    transition: all 0.2s ease;
                }

                .btn-group .btn.active {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                /* Badge styling */
                .badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }

                /* Form control enhancements */
                .form-control:focus,
                .form-select:focus {
                    border-color: #fd7e14;
                    box-shadow: 0 0 0 0.2rem rgba(253, 126, 20, 0.25);
                }

                /* Loading states */
                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                /* Status indicators */
                .service-card .position-absolute {
                    z-index: 10;
                }

                /* Checkbox styling */
                .form-check-input:checked {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                }

                .form-check-input:focus {
                    border-color: #fd7e14;
                    box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ProviderServices;
