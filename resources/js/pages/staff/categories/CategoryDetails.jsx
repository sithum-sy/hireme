// resources/js/pages/staff/categories/CategoryDetails.jsx
// Complete category details page with analytics and management

import React, { useState, useEffect } from "react";
import { useStaff } from "../../../context/StaffContext";
import { useNavigate, useParams } from "react-router-dom";

const CategoryDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const {
        getCategoryById,
        getCategoryAnalytics,
        toggleCategoryStatus,
        deleteCategory,
        isProcessing,
        errors,
        successMessage,
        currentCategory,
    } = useStaff();

    // State
    const [category, setCategory] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadCategoryData();
    }, [id]);

    const loadCategoryData = async () => {
        try {
            setLoading(true);
            const categoryData = await getCategoryById(id);
            setCategory(categoryData);

            // Load analytics in background
            loadAnalytics();
        } catch (error) {
            console.error("Failed to load category:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            setAnalyticsLoading(true);
            const analyticsData = await getCategoryAnalytics(id);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Failed to load analytics:", error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            await toggleCategoryStatus(id);
            await loadCategoryData(); // Refresh data
        } catch (error) {
            console.error("Failed to toggle status:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCategory(id);
            navigate("/staff/categories");
        } catch (error) {
            console.error("Failed to delete category:", error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "400px" }}
            >
                <div className="text-center">
                    <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted">Loading category details...</p>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h4 className="text-muted">Category Not Found</h4>
                <p className="text-muted">
                    The requested category could not be found.
                </p>
                <button
                    className="btn btn-primary"
                    onClick={() => navigate("/staff/categories")}
                >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back to Categories
                </button>
            </div>
        );
    }

    return (
        <>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center">
                    <div
                        className="category-icon me-3 d-flex align-items-center justify-content-center rounded"
                        style={{
                            width: "60px",
                            height: "60px",
                            backgroundColor: category.color || "#6c757d",
                            color: "white",
                        }}
                    >
                        <i
                            className={`${
                                category.icon || "fas fa-folder"
                            } fa-2x`}
                        ></i>
                    </div>
                    <div>
                        <h1 className="h3 mb-1">
                            {category.name}
                            <span
                                className={`badge ms-3 ${
                                    category.is_active
                                        ? "bg-success"
                                        : "bg-secondary"
                                }`}
                            >
                                {category.is_active ? "Active" : "Inactive"}
                            </span>
                        </h1>
                        <p className="text-muted mb-0">
                            {category.description}
                        </p>
                        <small className="text-muted">
                            Created {formatDate(category.created_at)} • Last
                            updated {formatDate(category.updated_at)}
                        </small>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => loadCategoryData()}
                        disabled={loading}
                    >
                        <i
                            className={`fas fa-sync-alt ${
                                loading ? "fa-spin" : ""
                            } me-2`}
                        ></i>
                        Refresh
                    </button>
                    <a
                        href={`/staff/categories/${id}/edit`}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-edit me-2"></i>
                        Edit Category
                    </a>
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <button
                                    className="dropdown-item"
                                    onClick={handleToggleStatus}
                                    disabled={isProcessing}
                                >
                                    <i
                                        className={`fas fa-${
                                            category.is_active
                                                ? "pause"
                                                : "play"
                                        } me-2`}
                                    ></i>
                                    {category.is_active
                                        ? "Deactivate"
                                        : "Activate"}
                                </button>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button
                                    className="dropdown-item text-danger"
                                    onClick={() => setShowDeleteModal(true)}
                                    disabled={isProcessing}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Delete Category
                                </button>
                            </li>
                        </ul>
                    </div>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/staff/categories")}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Categories
                    </button>
                </div>
            </div>

            {/* Messages */}
            {errors.categoryDetails && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.categoryDetails}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {successMessage}
                </div>
            )}

            {/* Quick Stats Row */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-primary mb-2">
                                <i className="fas fa-briefcase fa-2x"></i>
                            </div>
                            <h4 className="mb-1">
                                {category.services_count?.total || 0}
                            </h4>
                            <small className="text-muted">Total Services</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-success mb-2">
                                <i className="fas fa-check-circle fa-2x"></i>
                            </div>
                            <h4 className="mb-1">
                                {category.services_count?.active || 0}
                            </h4>
                            <small className="text-muted">
                                Active Services
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-info mb-2">
                                <i className="fas fa-users fa-2x"></i>
                            </div>
                            <h4 className="mb-1">
                                {category.top_providers?.length || 0}
                            </h4>
                            <small className="text-muted">
                                Service Providers
                            </small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body">
                            <div className="text-warning mb-2">
                                <i className="fas fa-sort-numeric-up fa-2x"></i>
                            </div>
                            <h4 className="mb-1">{category.sort_order || 0}</h4>
                            <small className="text-muted">Sort Order</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom-0">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "overview" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <i className="fas fa-info-circle me-2"></i>
                                Overview
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "services" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("services")}
                            >
                                <i className="fas fa-briefcase me-2"></i>
                                Services ({category.services_count?.total || 0})
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "providers" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("providers")}
                            >
                                <i className="fas fa-users me-2"></i>
                                Providers
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "analytics" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("analytics")}
                            >
                                <i className="fas fa-chart-bar me-2"></i>
                                Analytics
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "seo" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("seo")}
                            >
                                <i className="fas fa-search me-2"></i>
                                SEO & Meta
                            </button>
                        </li>
                    </ul>
                </div>

                <div className="card-body">
                    {/* Overview Tab */}
                    {activeTab === "overview" && (
                        <div className="row">
                            <div className="col-md-8">
                                <h5 className="mb-3">Category Information</h5>
                                <table className="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td
                                                className="fw-semibold text-muted"
                                                style={{ width: "150px" }}
                                            >
                                                Name:
                                            </td>
                                            <td>{category.name}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                Description:
                                            </td>
                                            <td>
                                                {category.description ||
                                                    "No description provided"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                URL Slug:
                                            </td>
                                            <td>
                                                <code>
                                                    /categories/{category.slug}
                                                </code>
                                                <a
                                                    href={`/categories/${category.slug}`}
                                                    className="btn btn-sm btn-outline-primary ms-2"
                                                    target="_blank"
                                                >
                                                    <i className="fas fa-external-link-alt me-1"></i>
                                                    View Public
                                                </a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                Sort Order:
                                            </td>
                                            <td>{category.sort_order}</td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                Status:
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge ${
                                                        category.is_active
                                                            ? "bg-success"
                                                            : "bg-secondary"
                                                    }`}
                                                >
                                                    {category.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                Created:
                                            </td>
                                            <td>
                                                {formatDate(
                                                    category.created_at
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="fw-semibold text-muted">
                                                Last Updated:
                                            </td>
                                            <td>
                                                {formatDate(
                                                    category.updated_at
                                                )}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="col-md-4">
                                <h5 className="mb-3">Visual Settings</h5>
                                <div className="card bg-light">
                                    <div className="card-body text-center">
                                        <div
                                            className="category-icon mx-auto mb-3 d-flex align-items-center justify-content-center rounded"
                                            style={{
                                                width: "80px",
                                                height: "80px",
                                                backgroundColor:
                                                    category.color || "#6c757d",
                                                color: "white",
                                            }}
                                        >
                                            <i
                                                className={`${
                                                    category.icon ||
                                                    "fas fa-folder"
                                                } fa-2x`}
                                            ></i>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Icon:</strong>{" "}
                                            <code>{category.icon}</code>
                                        </div>
                                        <div>
                                            <strong>Color:</strong>
                                            <span
                                                className="badge ms-2"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                    color: "white",
                                                }}
                                            >
                                                {category.color}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Services Tab */}
                    {activeTab === "services" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    Services in this Category
                                </h5>
                                <div className="d-flex gap-2">
                                    <span className="badge bg-primary">
                                        {category.services_count?.total || 0}{" "}
                                        Total
                                    </span>
                                    <span className="badge bg-success">
                                        {category.services_count?.active || 0}{" "}
                                        Active
                                    </span>
                                    <span className="badge bg-secondary">
                                        {category.services_count?.inactive || 0}{" "}
                                        Inactive
                                    </span>
                                </div>
                            </div>

                            {category.recent_services &&
                            category.recent_services.length > 0 ? (
                                <div className="row">
                                    {category.recent_services.map((service) => (
                                        <div
                                            key={service.id}
                                            className="col-md-6 col-lg-4 mb-3"
                                        >
                                            <div className="card border">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <h6 className="card-title mb-0">
                                                            {service.title}
                                                        </h6>
                                                        <span
                                                            className={`badge ${
                                                                service.is_active
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {service.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                    </div>
                                                    <p className="card-text small text-muted">
                                                        {service.description?.substring(
                                                            0,
                                                            100
                                                        )}
                                                        ...
                                                    </p>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <small className="text-muted">
                                                            By{" "}
                                                            {
                                                                service.provider
                                                                    ?.name
                                                            }
                                                        </small>
                                                        <a
                                                            href={`/staff/services/${service.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">
                                        No Services Yet
                                    </h6>
                                    <p className="text-muted">
                                        No services have been created in this
                                        category.
                                    </p>
                                </div>
                            )}

                            {category.services_count?.total > 5 && (
                                <div className="text-center mt-3">
                                    <a
                                        href={`/staff/services?category=${category.id}`}
                                        className="btn btn-outline-primary"
                                    >
                                        <i className="fas fa-list me-2"></i>
                                        View All Services
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Providers Tab */}
                    {activeTab === "providers" && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Top Service Providers</h5>
                                <span className="badge bg-info">
                                    {category.top_providers?.length || 0}{" "}
                                    Providers
                                </span>
                            </div>

                            {category.top_providers &&
                            category.top_providers.length > 0 ? (
                                <div className="row">
                                    {category.top_providers.map((provider) => (
                                        <div
                                            key={provider.id}
                                            className="col-md-6 col-lg-4 mb-3"
                                        >
                                            <div className="card border">
                                                <div className="card-body">
                                                    <div className="d-flex align-items-center mb-2">
                                                        <div className="me-3">
                                                            {provider.profile_picture ? (
                                                                <img
                                                                    src={
                                                                        provider.profile_picture
                                                                    }
                                                                    alt={
                                                                        provider.name
                                                                    }
                                                                    className="rounded-circle"
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "40px",
                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div
                                                                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center"
                                                                    style={{
                                                                        width: "40px",
                                                                        height: "40px",
                                                                    }}
                                                                >
                                                                    <i className="fas fa-user text-white"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h6 className="mb-0">
                                                                {provider.name}
                                                            </h6>
                                                            <small className="text-muted">
                                                                {
                                                                    provider.services_count
                                                                }{" "}
                                                                services
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span
                                                            className={`badge ${
                                                                provider.is_active
                                                                    ? "bg-success"
                                                                    : "bg-secondary"
                                                            }`}
                                                        >
                                                            {provider.is_active
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </span>
                                                        <a
                                                            href={`/staff/users/${provider.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            View Profile
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-users fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">
                                        No Providers Yet
                                    </h6>
                                    <p className="text-muted">
                                        No service providers have created
                                        services in this category.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === "analytics" && (
                        <div>
                            <h5 className="mb-3">Category Analytics</h5>
                            {analyticsLoading ? (
                                <div className="text-center py-4">
                                    <div
                                        className="spinner-border text-primary mb-3"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Loading analytics...
                                        </span>
                                    </div>
                                    <p className="text-muted">
                                        Loading analytics data...
                                    </p>
                                </div>
                            ) : analytics ? (
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="card border">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    Performance Metrics
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            Total Views:
                                                        </span>
                                                        <strong>
                                                            {analytics.total_views ||
                                                                0}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>This Month:</span>
                                                        <strong>
                                                            {analytics.monthly_views ||
                                                                0}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            Growth Rate:
                                                        </span>
                                                        <strong
                                                            className={
                                                                analytics.growth_rate >=
                                                                0
                                                                    ? "text-success"
                                                                    : "text-danger"
                                                            }
                                                        >
                                                            {analytics.growth_rate >=
                                                            0
                                                                ? "+"
                                                                : ""}
                                                            {
                                                                analytics.growth_rate
                                                            }
                                                            %
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="card border">
                                            <div className="card-header">
                                                <h6 className="mb-0">
                                                    Usage Statistics
                                                </h6>
                                            </div>
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            Average Services per
                                                            Provider:
                                                        </span>
                                                        <strong>
                                                            {analytics.avg_services_per_provider ||
                                                                0}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            Most Popular
                                                            Service:
                                                        </span>
                                                        <strong>
                                                            {analytics.most_popular_service ||
                                                                "N/A"}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            Category Rank:
                                                        </span>
                                                        <strong>
                                                            #
                                                            {analytics.category_rank ||
                                                                "N/A"}
                                                        </strong>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                                    <h6 className="text-muted">
                                        No Analytics Data
                                    </h6>
                                    <p className="text-muted">
                                        Analytics data is not available for this
                                        category yet.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === "seo" && (
                        <div>
                            <h5 className="mb-3">SEO & Meta Information</h5>
                            <div className="row">
                                <div className="col-md-8">
                                    <table className="table table-borderless">
                                        <tbody>
                                            <tr>
                                                <td
                                                    className="fw-semibold text-muted"
                                                    style={{ width: "150px" }}
                                                >
                                                    Meta Title:
                                                </td>
                                                <td>
                                                    {category.meta_title || (
                                                        <em className="text-muted">
                                                            Not set
                                                        </em>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold text-muted">
                                                    Meta Description:
                                                </td>
                                                <td>
                                                    {category.meta_description || (
                                                        <em className="text-muted">
                                                            Not set
                                                        </em>
                                                    )}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold text-muted">
                                                    URL Slug:
                                                </td>
                                                <td>
                                                    <code>{category.slug}</code>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="fw-semibold text-muted">
                                                    Public URL:
                                                </td>
                                                <td>
                                                    <a
                                                        href={`/categories/${category.slug}`}
                                                        target="_blank"
                                                    >
                                                        /categories/
                                                        {category.slug}
                                                        <i className="fas fa-external-link-alt ms-1"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-4">
                                    <h6 className="mb-3">
                                        Search Engine Preview
                                    </h6>
                                    <div className="border rounded p-3 bg-light">
                                        <div className="text-primary fw-semibold">
                                            {category.meta_title ||
                                                category.name}
                                        </div>
                                        <div className="text-success small">
                                            example.com/categories/
                                            {category.slug}
                                        </div>
                                        <div className="text-muted small mt-1">
                                            {category.meta_description ||
                                                category.description}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                                    Delete Category
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete the category{" "}
                                    <strong>"{category.name}"</strong>?
                                </p>

                                {category.services_count?.total > 0 && (
                                    <div className="alert alert-warning">
                                        <i className="fas fa-exclamation-triangle me-2"></i>
                                        <strong>Warning:</strong> This category
                                        has {category.services_count.total}{" "}
                                        services. All services will need to be
                                        reassigned to other categories.
                                    </div>
                                )}

                                <div className="alert alert-danger">
                                    <i className="fas fa-info-circle me-2"></i>
                                    This action cannot be undone.
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
                                    onClick={handleDelete}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash me-2"></i>
                                            Delete Category
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoryDetails;