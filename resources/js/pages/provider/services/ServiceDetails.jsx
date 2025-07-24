import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import ServiceGallery from "../../../components/client/services/ServiceGallery";

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleServiceStatus, deleteService, getService, loading } =
        useServices();
    const { businessStats } = useProvider();

    const [service, setService] = useState(null);
    const [serviceLoading, setServiceLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadServiceDetails();
    }, [id]);

    const loadServiceDetails = async () => {
        setServiceLoading(true);
        setError(null);
        try {
            // console.log("=== LOADING SERVICE DETAILS ===");
            // console.log("Service ID:", id);

            const result = await getService(id);
            // console.log("=== SERVICE DETAILS RESULT ===", result);
            if (result.success) {
                // console.log("=== SERVICE DATA ===", result.data);
                const service = result.data;

                // Transform API data to match component expectations
                const transformedService = {
                    id: service.id,
                    title: service.title,
                    description: service.description,
                    category: {
                        id: service.category?.id || service.category_id,
                        name: service.category?.name || "Unknown Category",
                        icon: service.category?.icon || "fas fa-cog",
                        color: service.category?.color || "primary",
                    },
                    pricing_type: service.pricing_type,
                    base_price: service.base_price,
                    duration_hours: service.duration_hours,
                    custom_pricing_description:
                        service.custom_pricing_description,
                    service_areas: service.service_areas || [],
                    service_radius: service.service_radius,
                    location: {
                        address: service.location_address,
                        latitude: service.latitude,
                        longitude: service.longitude,
                    },
                    includes: service.includes || "",
                    requirements: service.requirements || "",
                    is_active: service.is_active,
                    average_rating: service.average_rating || 0,
                    views_count: service.views_count || 0,
                    bookings_count: service.bookings_count || 0,
                    total_earnings: service.total_earnings || 0,
                    service_images: service.existing_images || [],
                    first_image_url: service.existing_images?.[0] || null,
                    created_at: service.created_at,
                    updated_at: service.updated_at,

                    // Mock performance data (since API might not have this yet)
                    performance: {
                        last_30_days: {
                            views: Math.floor((service.views_count || 0) * 0.3),
                            bookings: Math.floor(
                                (service.bookings_count || 0) * 0.4
                            ),
                            earnings: Math.floor(
                                (service.total_earnings || 0) * 0.3
                            ),
                            rating: service.average_rating || 0,
                        },
                        trends: {
                            views_trend: Math.floor(Math.random() * 30) - 15, // Random trend for demo
                            bookings_trend: Math.floor(Math.random() * 40) - 20,
                            rating_trend: (Math.random() - 0.5) * 0.5,
                        },
                    },

                    // Mock recent activity (since API might not have this yet)
                    recent_bookings: [], // You can populate this when you have the data
                    recent_reviews: [], // You can populate this when you have the data
                };

                setService(transformedService);
            } else {
                console.error("=== SERVICE LOAD FAILED ===", result.message);
                setError(result.message || "Failed to load service details");
            }
        } catch (err) {
            console.error("Error loading service:", err);
            setError("Failed to load service details");
        } finally {
            setServiceLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!service) return;

        const result = await toggleServiceStatus(service.id);
        if (result.success) {
            setService((prev) => ({
                ...prev,
                is_active: !prev.is_active,
            }));
        }
    };

    const handleDelete = async () => {
        if (!service) return;

        const result = await deleteService(service.id);
        if (result.success) {
            navigate("/provider/services", {
                state: {
                    message: "Service deleted successfully",
                    type: "success",
                },
            });
        }
        setShowDeleteModal(false);
    };

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

    const getPerformanceColor = (trend) => {
        if (trend > 0) return "success";
        if (trend < 0) return "danger";
        return "secondary";
    };

    const getTrendIcon = (trend) => {
        if (trend > 0) return "fas fa-arrow-up";
        if (trend < 0) return "fas fa-arrow-down";
        return "fas fa-minus";
    };

    if (serviceLoading) {
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
                        <p className="text-muted">Loading service details...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    if (error || !service) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h5 className="text-muted mb-3">Service Not Found</h5>
                    <p className="text-muted mb-4">
                        {error ||
                            "The service you're looking for doesn't exist or you don't have permission to view it."}
                    </p>
                    <Link to="/provider/services" className="btn btn-orange">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Services
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="service-details">
                {/* Header Section */}
                <div className="service-header mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <nav aria-label="breadcrumb" className="mb-3">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link
                                            to="/provider/services"
                                            className="text-orange text-decoration-none"
                                        >
                                            My Services
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active">
                                        {service.title}
                                    </li>
                                </ol>
                            </nav>
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
                                {new Date(
                                    service.created_at
                                ).toLocaleDateString()}{" "}
                                • Last updated{" "}
                                {new Date(
                                    service.updated_at
                                ).toLocaleDateString()}
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
                                    onClick={handleToggleStatus}
                                    disabled={loading}
                                >
                                    <i
                                        className={`fas ${
                                            service.is_active
                                                ? "fa-pause"
                                                : "fa-play"
                                        } me-2`}
                                    ></i>
                                    {service.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>
                            </div>
                            <div className="dropdown d-inline-block">
                                <button
                                    className="btn btn-outline-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="fas fa-ellipsis-h"></i>
                                </button>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault(); /* TODO: Implement preview */
                                            }}
                                        >
                                            <i className="fas fa-eye me-2"></i>
                                            Preview as Client
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault(); /* TODO: Implement duplicate */
                                            }}
                                        >
                                            <i className="fas fa-copy me-2"></i>
                                            Duplicate Service
                                        </a>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item text-danger"
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            <i className="fas fa-trash me-2"></i>
                                            Delete Service
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Performance Cards */}
                <div className="row mb-4">
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="text-info">
                                        <i className="fas fa-eye fa-2x"></i>
                                    </div>
                                    <span
                                        className={`badge bg-${getPerformanceColor(
                                            service.performance.trends
                                                .views_trend
                                        )}`}
                                    >
                                        <i
                                            className={getTrendIcon(
                                                service.performance.trends
                                                    .views_trend
                                            )}
                                        ></i>
                                        {Math.abs(
                                            service.performance.trends
                                                .views_trend
                                        )}
                                        %
                                    </span>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {service.views_count}
                                </h4>
                                <small className="text-muted">
                                    Total Views
                                </small>
                                <div className="small text-muted mt-1">
                                    {service.performance.last_30_days.views}{" "}
                                    this month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="text-success">
                                        <i className="fas fa-calendar-check fa-2x"></i>
                                    </div>
                                    <span
                                        className={`badge bg-${getPerformanceColor(
                                            service.performance.trends
                                                .bookings_trend
                                        )}`}
                                    >
                                        <i
                                            className={getTrendIcon(
                                                service.performance.trends
                                                    .bookings_trend
                                            )}
                                        ></i>
                                        {Math.abs(
                                            service.performance.trends
                                                .bookings_trend
                                        )}
                                        %
                                    </span>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {service.bookings_count}
                                </h4>
                                <small className="text-muted">
                                    Total Bookings
                                </small>
                                <div className="small text-muted mt-1">
                                    {service.performance.last_30_days.bookings}{" "}
                                    this month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="text-warning">
                                        <i className="fas fa-star fa-2x"></i>
                                    </div>
                                    <span
                                        className={`badge bg-${getPerformanceColor(
                                            service.performance.trends
                                                .rating_trend
                                        )}`}
                                    >
                                        <i
                                            className={getTrendIcon(
                                                service.performance.trends
                                                    .rating_trend
                                            )}
                                        ></i>
                                        {Math.abs(
                                            service.performance.trends
                                                .rating_trend
                                        ).toFixed(1)}
                                    </span>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    {service.average_rating}
                                </h4>
                                <small className="text-muted">
                                    Average Rating
                                </small>
                                <div className="small text-muted mt-1">
                                    {service.performance.last_30_days.rating}{" "}
                                    this month
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center">
                                <div className="text-orange mb-2">
                                    <i className="fas fa-dollar-sign fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-1">
                                    Rs.{" "}
                                    {service.total_earnings.toLocaleString()}
                                </h4>
                                <small className="text-muted">
                                    Total Earnings
                                </small>
                                <div className="small text-muted mt-1">
                                    Rs.{" "}
                                    {service.performance.last_30_days.earnings.toLocaleString()}{" "}
                                    this month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    {/* Left Column - Service Details */}
                    <div className="col-lg-8">
                        {/* Tabs Navigation */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <ul className="nav nav-tabs card-header-tabs">
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${
                                                activeTab === "overview"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("overview")
                                            }
                                        >
                                            <i className="fas fa-info-circle me-2"></i>
                                            Overview
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${
                                                activeTab === "bookings"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("bookings")
                                            }
                                        >
                                            <i className="fas fa-calendar me-2"></i>
                                            Recent Bookings
                                        </button>
                                    </li>
                                    <li className="nav-item">
                                        <button
                                            className={`nav-link ${
                                                activeTab === "reviews"
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("reviews")
                                            }
                                        >
                                            <i className="fas fa-star me-2"></i>
                                            Reviews
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            <div className="card-body">
                                {/* Overview Tab */}
                                {activeTab === "overview" && (
                                    <div className="overview-content">
                                        {/* Service Images */}
                                        {/* Service Images - Use ServiceGallery component */}
                                        <div className="service-images mb-4">
                                            <h6 className="fw-semibold mb-3">
                                                Service Images
                                            </h6>
                                            <ServiceGallery
                                                service={service}
                                                title={service.title}
                                                images={service.service_images || service.existing_images || service.images || []}
                                            />
                                        </div>

                                        {/* Description */}
                                        <div className="service-description mb-4">
                                            <h6 className="fw-semibold mb-3">
                                                Description
                                            </h6>
                                            <p className="text-muted">
                                                {service.description}
                                            </p>
                                        </div>

                                        {/* Pricing & Duration */}
                                        <div className="pricing-info mb-4">
                                            <h6 className="fw-semibold mb-3">
                                                Pricing & Duration
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="info-item p-3 bg-light rounded">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-dollar-sign text-success me-3"></i>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {getPricingDisplay()}
                                                                </div>
                                                                <small className="text-muted">
                                                                    {service.pricing_type ===
                                                                    "fixed"
                                                                        ? "Fixed Price"
                                                                        : service.pricing_type ===
                                                                          "hourly"
                                                                        ? "Hourly Rate"
                                                                        : "Custom Pricing"}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="info-item p-3 bg-light rounded">
                                                        <div className="d-flex align-items-center">
                                                            <i className="fas fa-clock text-info me-3"></i>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    {
                                                                        service.duration_hours
                                                                    }{" "}
                                                                    hour
                                                                    {service.duration_hours !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </div>
                                                                <small className="text-muted">
                                                                    Estimated
                                                                    Duration
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location & Service Areas */}
                                        <div className="location-info mb-4">
                                            <h6 className="fw-semibold mb-3">
                                                Location & Service Areas
                                            </h6>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="info-item p-3 bg-light rounded">
                                                        <div className="d-flex align-items-start">
                                                            <i className="fas fa-map-marker-alt text-danger me-3 mt-1"></i>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Service
                                                                    Location
                                                                </div>
                                                                <div className="text-muted">
                                                                    {
                                                                        service
                                                                            .location
                                                                            .address
                                                                    }
                                                                </div>
                                                                <small className="text-muted">
                                                                    Radius:{" "}
                                                                    {
                                                                        service.service_radius
                                                                    }
                                                                    km
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="info-item p-3 bg-light rounded">
                                                        <div className="d-flex align-items-start">
                                                            <i className="fas fa-map text-primary me-3 mt-1"></i>
                                                            <div>
                                                                <div className="fw-semibold">
                                                                    Service
                                                                    Areas
                                                                </div>
                                                                <div className="d-flex flex-wrap gap-1 mt-2">
                                                                    {service.service_areas.map(
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
                                                                                {
                                                                                    area
                                                                                }
                                                                            </span>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* What's Included */}
                                        {service.includes && (
                                            <div className="includes-info mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    What's Included
                                                </h6>
                                                <div className="p-3 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                                    <p className="mb-0">
                                                        {service.includes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Requirements */}
                                        {service.requirements && (
                                            <div className="requirements-info mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    Requirements
                                                </h6>
                                                <div className="p-3 bg-warning bg-opacity-10 rounded border-start border-warning border-3">
                                                    <p className="mb-0">
                                                        {service.requirements}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Recent Bookings Tab */}
                                {activeTab === "bookings" && (
                                    <div className="bookings-content">
                                        <h6 className="fw-semibold mb-3">
                                            Recent Bookings
                                        </h6>
                                        {service.recent_bookings &&
                                        service.recent_bookings.length > 0 ? (
                                            <div className="bookings-list">
                                                {service.recent_bookings.map(
                                                    (booking) => (
                                                        <div
                                                            key={booking.id}
                                                            className="booking-item border rounded p-3 mb-3"
                                                        >
                                                            <div className="row align-items-center">
                                                                <div className="col-md-8">
                                                                    <div className="d-flex align-items-center">
                                                                        <div
                                                                            className="client-avatar bg-orange bg-opacity-10 text-orange rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                            style={{
                                                                                width: "40px",
                                                                                height: "40px",
                                                                            }}
                                                                        >
                                                                            {booking.client
                                                                                .split(
                                                                                    " "
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        n
                                                                                    ) =>
                                                                                        n[0]
                                                                                )
                                                                                .join(
                                                                                    ""
                                                                                )}
                                                                        </div>
                                                                        <div>
                                                                            <h6 className="mb-1">
                                                                                {
                                                                                    booking.client
                                                                                }
                                                                            </h6>
                                                                            <div className="text-muted small">
                                                                                <i className="fas fa-calendar me-1"></i>
                                                                                {
                                                                                    booking.date
                                                                                }{" "}
                                                                                at{" "}
                                                                                {
                                                                                    booking.time
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-4 text-end">
                                                                    <div className="mb-2">
                                                                        <span
                                                                            className={`badge ${
                                                                                booking.status ===
                                                                                "completed"
                                                                                    ? "bg-success"
                                                                                    : "bg-warning"
                                                                            }`}
                                                                        >
                                                                            {
                                                                                booking.status
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <div className="fw-bold text-orange">
                                                                        Rs.{" "}
                                                                        {booking.earnings.toLocaleString()}
                                                                    </div>
                                                                    {booking.rating && (
                                                                        <div className="small text-warning">
                                                                            {"★".repeat(
                                                                                booking.rating
                                                                            )}
                                                                            {"☆".repeat(
                                                                                5 -
                                                                                    booking.rating
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                                <h6 className="text-muted">
                                                    No bookings yet
                                                </h6>
                                                <p className="text-muted">
                                                    When clients book this
                                                    service, they'll appear
                                                    here.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Reviews Tab */}
                                {activeTab === "reviews" && (
                                    <div className="reviews-content">
                                        <h6 className="fw-semibold mb-3">
                                            Client Reviews
                                        </h6>
                                        {service.recent_reviews &&
                                        service.recent_reviews.length > 0 ? (
                                            <div className="reviews-list">
                                                {service.recent_reviews.map(
                                                    (review) => (
                                                        <div
                                                            key={review.id}
                                                            className="review-item border rounded p-3 mb-3"
                                                        >
                                                            <div className="d-flex align-items-start">
                                                                <div
                                                                    className="client-avatar bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "40px",
                                                                    }}
                                                                >
                                                                    {review.client
                                                                        .split(
                                                                            " "
                                                                        )
                                                                        .map(
                                                                            (
                                                                                n
                                                                            ) =>
                                                                                n[0]
                                                                        )
                                                                        .join(
                                                                            ""
                                                                        )}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                                        <div>
                                                                            <h6 className="mb-1">
                                                                                {
                                                                                    review.client
                                                                                }
                                                                            </h6>
                                                                            <div className="text-warning">
                                                                                {"★".repeat(
                                                                                    review.rating
                                                                                )}
                                                                                {"☆".repeat(
                                                                                    5 -
                                                                                        review.rating
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <small className="text-muted">
                                                                            {
                                                                                review.date
                                                                            }
                                                                        </small>
                                                                    </div>
                                                                    <p className="text-muted mb-0">
                                                                        "
                                                                        {
                                                                            review.comment
                                                                        }
                                                                        "
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <i className="fas fa-star fa-3x text-muted mb-3"></i>
                                                <h6 className="text-muted">
                                                    No reviews yet
                                                </h6>
                                                <p className="text-muted">
                                                    Client reviews for this
                                                    service will appear here.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Quick Actions & Info */}
                    <div className="col-lg-4">
                        {/* Quick Actions Card */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="mb-0 fw-bold">
                                    <i className="fas fa-bolt text-orange me-2"></i>
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
                                        onClick={handleToggleStatus}
                                        disabled={loading}
                                    >
                                        <i
                                            className={`fas ${
                                                service.is_active
                                                    ? "fa-pause"
                                                    : "fa-play"
                                            } me-2`}
                                        ></i>
                                        {service.is_active
                                            ? "Deactivate Service"
                                            : "Activate Service"}
                                    </button>
                                    <button className="btn btn-outline-info">
                                        <i className="fas fa-eye me-2"></i>
                                        Preview as Client
                                    </button>
                                    <button className="btn btn-outline-secondary">
                                        <i className="fas fa-copy me-2"></i>
                                        Duplicate Service
                                    </button>
                                    <hr />
                                    <button
                                        className="btn btn-outline-danger"
                                        onClick={() => setShowDeleteModal(true)}
                                    >
                                        <i className="fas fa-trash me-2"></i>
                                        Delete Service
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Service Stats Card */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="mb-0 fw-bold">
                                    <i className="fas fa-chart-line text-orange me-2"></i>
                                    Service Statistics
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="stats-list">
                                    <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-calendar-plus text-primary me-2"></i>
                                            <span>Created</span>
                                        </div>
                                        <span className="text-muted">
                                            {new Date(
                                                service.created_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-edit text-warning me-2"></i>
                                            <span>Last Updated</span>
                                        </div>
                                        <span className="text-muted">
                                            {new Date(
                                                service.updated_at
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="stat-item d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-percentage text-info me-2"></i>
                                            <span>Conversion Rate</span>
                                        </div>
                                        <span className="fw-bold">
                                            {service.views_count > 0
                                                ? (
                                                      (service.bookings_count /
                                                          service.views_count) *
                                                      100
                                                  ).toFixed(1)
                                                : 0}
                                            %
                                        </span>
                                    </div>
                                    <div className="stat-item d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-coins text-success me-2"></i>
                                            <span>Avg. Earnings/Booking</span>
                                        </div>
                                        <span className="fw-bold text-orange">
                                            Rs.{" "}
                                            {service.bookings_count > 0
                                                ? (
                                                      service.total_earnings /
                                                      service.bookings_count
                                                  ).toLocaleString()
                                                : 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Performance Tips Card */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="mb-0 fw-bold">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Performance Tips
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="tips-list">
                                    {service.views_count < 50 && (
                                        <div className="tip-item d-flex align-items-start mb-3">
                                            <i className="fas fa-search text-info me-2 mt-1"></i>
                                            <small>
                                                Add more keywords to your
                                                description to improve
                                                visibility in search results.
                                            </small>
                                        </div>
                                    )}

                                    {service.service_images.length < 3 && (
                                        <div className="tip-item d-flex align-items-start mb-3">
                                            <i className="fas fa-camera text-primary me-2 mt-1"></i>
                                            <small>
                                                Add more high-quality images to
                                                showcase your work and attract
                                                more clients.
                                            </small>
                                        </div>
                                    )}

                                    {service.average_rating < 4.5 &&
                                        service.bookings_count > 5 && (
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-star text-warning me-2 mt-1"></i>
                                                <small>
                                                    Focus on delivering
                                                    exceptional service to
                                                    improve your rating and
                                                    attract more bookings.
                                                </small>
                                            </div>
                                        )}

                                    {service.views_count /
                                        service.bookings_count >
                                        20 &&
                                        service.views_count > 50 && (
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-dollar-sign text-success me-2 mt-1"></i>
                                                <small>
                                                    Your service gets good views
                                                    but low bookings. Consider
                                                    adjusting your pricing or
                                                    adding more details.
                                                </small>
                                            </div>
                                        )}

                                    <div className="tip-item d-flex align-items-start mb-3">
                                        <i className="fas fa-clock text-secondary me-2 mt-1"></i>
                                        <small>
                                            Respond to booking requests within 2
                                            hours to improve your response rate.
                                        </small>
                                    </div>

                                    <div className="tip-item d-flex align-items-start">
                                        <i className="fas fa-map-marker-alt text-danger me-2 mt-1"></i>
                                        <small>
                                            Expand your service areas to reach
                                            more potential clients in nearby
                                            locations.
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-backdrop">
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
                                        onClick={() =>
                                            setShowDeleteModal(false)
                                        }
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="text-center mb-3">
                                        <div className="service-preview p-3 bg-light rounded">
                                            <h6 className="fw-bold">
                                                {service.title}
                                            </h6>
                                            <p className="text-muted small mb-0">
                                                {service.category.name} •{" "}
                                                {getPricingDisplay()}
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
                                                <strong>Impact:</strong> This
                                                service has{" "}
                                                {service.bookings_count} booking
                                                {service.bookings_count !== 1
                                                    ? "s"
                                                    : ""}
                                                ,{service.views_count} view
                                                {service.views_count !== 1
                                                    ? "s"
                                                    : ""}
                                                , and total earnings of Rs.{" "}
                                                {service.total_earnings.toLocaleString()}
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
                                        onClick={handleDelete}
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
            </div>

            {/* Custom Styles */}
            <style>{`
                .service-details {
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

                .breadcrumb-item.active {
                    color: #6c757d;
                }

                .breadcrumb-item + .breadcrumb-item::before {
                    color: #fd7e14;
                }

                .card {
                    transition: all 0.3s ease;
                }

                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                }

                .nav-tabs .nav-link {
                    border: none;
                    border-bottom: 3px solid transparent;
                    color: #6c757d;
                    padding: 1rem 1.5rem;
                }

                .nav-tabs .nav-link:hover {
                    border-color: transparent;
                    background-color: #fff3e0;
                    color: #fd7e14;
                }

                .nav-tabs .nav-link.active {
                    border-color: #fd7e14;
                    background-color: transparent;
                    color: #fd7e14;
                }

                .info-item {
                    transition: all 0.2s ease;
                }

                .info-item:hover {
                    background-color: #fff3e0 !important;
                }

                .image-container {
                    overflow: hidden;
                    border-radius: 0.375rem;
                }

                .image-container img {
                    transition: transform 0.3s ease;
                }

                .image-container:hover img {
                    transform: scale(1.05);
                }

                .client-avatar {
                    font-size: 0.8rem;
                    font-weight: bold;
                }

                .stat-item {
                    padding: 0.5rem 0;
                    border-bottom: 1px solid #f8f9fa;
                }

                .stat-item:last-child {
                    border-bottom: none;
                }

                .tip-item {
                    padding: 0.5rem 0;
                    transition: all 0.2s ease;
                    border-radius: 0.25rem;
                }

                .tip-item:hover {
                    background-color: #fff3e0;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
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

                .bg-orange {
                    background-color: #fd7e14 !important;
                }

                .border-orange {
                    border-color: #fd7e14 !important;
                }

                .btn-primary {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                }

                .btn-primary:hover {
                    background-color: var(--current-role-hover);
                    border-color: var(--current-role-hover);
                }

                /* Performance indicator colors */
                .text-success {
                    color: var(--success-color) !important;
                }
                .text-warning {
                    color: var(--warning-color) !important;
                }
                .text-info {
                    color: var(--info-color) !important;
                }
                .text-danger {
                    color: var(--danger-color) !important;
                }
                .text-secondary {
                    color: var(--secondary-color) !important;
                }

                .bg-success {
                    background-color: var(--success-color) !important;
                }
                .bg-warning {
                    background-color: var(--warning-color) !important;
                }
                .bg-info {
                    background-color: var(--info-color) !important;
                }
                .bg-danger {
                    background-color: var(--danger-color) !important;
                }
                .bg-secondary {
                    background-color: #6c757d !important;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .service-header .col-md-4 {
                        text-align: left !important;
                        margin-top: 1rem;
                    }

                    .btn-group {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        margin-bottom: 1rem;
                    }

                    .nav-tabs .nav-link {
                        padding: 0.75rem 1rem;
                        font-size: 0.9rem;
                    }

                    .performance-cards .col-6 {
                        margin-bottom: 1rem;
                    }
                }

                @media (max-width: 576px) {
                    .performance-cards .card-body {
                        padding: 1rem;
                    }

                    .performance-cards h4 {
                        font-size: 1.2rem;
                    }

                    .service-images .col-6 {
                        margin-bottom: 0.5rem;
                    }
                }

                /* Loading states */
                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                /* Enhanced animations */
                .booking-item,
                .review-item {
                    transition: all 0.2s ease;
                    border: 1px solid #e9ecef !important;
                }

                .booking-item:hover,
                .review-item:hover {
                    border-color: #fd7e14 !important;
                    box-shadow: 0 2px 8px rgba(253, 126, 20, 0.1);
                }

                /* Badge styling */
                .badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }

                /* Star ratings */
                .text-warning {
                    color: #ffc107 !important;
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ServiceDetails;
