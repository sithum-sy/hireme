import React, { useState, useEffect, useCallback } from "react";
import { useStaff } from "../../../context/StaffContext";
import StaffLayout from "../../../components/layouts/StaffLayout";
import ServicesTable from "../../../components/staff/services/ServicesTable";
import { toast } from "react-toastify";

const ServicesList = () => {
    const { user } = useStaff();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });
    const [statistics, setStatistics] = useState({
        total_services: 0,
        active_services: 0,
        inactive_services: 0,
    });
    const [filters, setFilters] = useState({
        search: "",
        category: "",
        provider: "",
        status: "",
        sort_by: "created_at",
        sort_order: "desc",
        per_page: 15,
    });

    const fetchServices = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);

                const params = new URLSearchParams({
                    page: page.toString(),
                    per_page: filters.per_page.toString(),
                    ...Object.fromEntries(
                        Object.entries(filters).filter(
                            ([_, value]) => value !== ""
                        )
                    ),
                });

                const response = await fetch(`/api/staff/services?${params}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "auth_token"
                        )}`,
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch services");
                }

                const data = await response.json();

                if (data.success) {
                    setServices(data.data.data || []);
                    setPagination({
                        current_page: data.data.current_page || 1,
                        last_page: data.data.last_page || 1,
                        per_page: data.data.per_page || 15,
                        total: data.data.total || 0,
                    });

                    if (data.meta) {
                        setStatistics({
                            total_services: data.meta.total_services || 0,
                            active_services: data.meta.active_services || 0,
                            inactive_services: data.meta.inactive_services || 0,
                        });
                        setCategories(data.meta.categories || []);
                        setProviders(data.meta.providers || []);
                    }
                } else {
                    throw new Error(data.message || "Failed to fetch services");
                }
            } catch (error) {
                console.error("Error fetching services:", error);
                toast.error("Failed to fetch services");
            } finally {
                setLoading(false);
            }
        },
        [filters]
    );

    useEffect(() => {
        fetchServices(1);
    }, [fetchServices]);

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterName]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: "",
            category: "",
            provider: "",
            status: "",
            sort_by: "created_at",
            sort_order: "desc",
            per_page: 15,
        });
    };

    const handlePageChange = (page) => {
        fetchServices(page);
    };

    const handleToggleStatus = async (service) => {
        try {
            setIsProcessing(true);

            const response = await fetch(
                `/api/staff/services/${service.id}/toggle-status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "auth_token"
                        )}`,
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                await fetchServices(pagination.current_page);
            } else {
                throw new Error(
                    data.message || "Failed to update service status"
                );
            }
        } catch (error) {
            console.error("Error toggling service status:", error);
            toast.error("Failed to update service status");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteService = async (service) => {
        if (
            !window.confirm(
                `Are you sure you want to delete the service "${service.title}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            setIsProcessing(true);

            const response = await fetch(`/api/staff/services/${service.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        "auth_token"
                    )}`,
                    Accept: "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                await fetchServices(pagination.current_page);
            } else {
                throw new Error(data.message || "Failed to delete service");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <StaffLayout>
            <div className="page-header d-print-none">
                <div className="container-fluid">
                    <div className="row g-2 align-items-center">
                        <div className="col">
                            <div className="page-pretitle">
                                Staff Management
                            </div>
                            <h2 className="page-title">Services Management</h2>
                            <div className="page-subtitle">
                                Manage all provider services across the platform
                            </div>
                        </div>
                        <div className="col-auto ms-auto d-print-none">
                            <div className="btn-list">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() =>
                                        fetchServices(pagination.current_page)
                                    }
                                    disabled={loading}
                                >
                                    <i className="fas fa-sync-alt me-2"></i>
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-body">
                <div className="container-fluid">
                    {/* Statistics Cards */}
                    <div className="row mb-4">
                        <div className="col-sm-6 col-lg-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="subheader">
                                            Total Services
                                        </div>
                                        <div className="ms-auto">
                                            <i className="fas fa-concierge-bell text-primary"></i>
                                        </div>
                                    </div>
                                    <div className="h1 mb-0">
                                        {statistics.total_services}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="subheader">
                                            Active Services
                                        </div>
                                        <div className="ms-auto">
                                            <i className="fas fa-check-circle text-success"></i>
                                        </div>
                                    </div>
                                    <div className="h1 mb-0">
                                        {statistics.active_services}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="subheader">
                                            Inactive Services
                                        </div>
                                        <div className="ms-auto">
                                            <i className="fas fa-pause-circle text-warning"></i>
                                        </div>
                                    </div>
                                    <div className="h1 mb-0">
                                        {statistics.inactive_services}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-sm-6 col-lg-3">
                            <div className="card">
                                <div className="card-body">
                                    <div className="d-flex align-items-center">
                                        <div className="subheader">
                                            Categories
                                        </div>
                                        <div className="ms-auto">
                                            <i className="fas fa-tags text-info"></i>
                                        </div>
                                    </div>
                                    <div className="h1 mb-0">
                                        {categories.length}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-filter me-2"></i>
                                Filters
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-3">
                                    <label className="form-label">Search</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search services, providers..."
                                        value={filters.search}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "search",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Category
                                    </label>
                                    <select
                                        className="form-select"
                                        value={filters.category}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "category",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">
                                        Provider
                                    </label>
                                    <select
                                        className="form-select"
                                        value={filters.provider}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "provider",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">All Providers</option>
                                        {providers.map((provider) => (
                                            <option
                                                key={provider.id}
                                                value={provider.id}
                                            >
                                                {provider.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-2">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={filters.status}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label">&nbsp;</label>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={handleClearFilters}
                                            disabled={loading}
                                        >
                                            <i className="fas fa-times me-1"></i>
                                            Clear Filters
                                        </button>
                                        <button
                                            className="btn btn-outline-secondary"
                                            onClick={() =>
                                                fetchServices(
                                                    pagination.current_page
                                                )
                                            }
                                            disabled={loading}
                                        >
                                            <i className="fas fa-sync-alt me-1"></i>
                                            Refresh
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Services Table */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <i className="fas fa-concierge-bell me-2"></i>
                                Services ({pagination.total})
                            </h3>
                            <div className="card-actions">
                                <div className="d-flex align-items-center">
                                    <label className="form-label me-2 mb-0">
                                        Sort by:
                                    </label>
                                    <select
                                        className="form-select form-select-sm me-2"
                                        style={{ width: "auto" }}
                                        value={filters.sort_by}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "sort_by",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="created_at">
                                            Date Created
                                        </option>
                                        <option value="title">Title</option>
                                        <option value="price">Price</option>
                                        <option value="updated_at">
                                            Last Updated
                                        </option>
                                    </select>
                                    <select
                                        className="form-select form-select-sm"
                                        style={{ width: "auto" }}
                                        value={filters.sort_order}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "sort_order",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="desc">Descending</option>
                                        <option value="asc">Ascending</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            <ServicesTable
                                services={services}
                                onToggleStatus={handleToggleStatus}
                                onDeleteService={handleDeleteService}
                                isProcessing={isProcessing}
                                loading={loading}
                            />
                        </div>

                        {/* Pagination */}
                        {pagination.last_page > 1 && (
                            <div className="card-footer">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="text-muted">
                                        Showing{" "}
                                        {(pagination.current_page - 1) *
                                            pagination.per_page +
                                            1}{" "}
                                        to{" "}
                                        {Math.min(
                                            pagination.current_page *
                                                pagination.per_page,
                                            pagination.total
                                        )}{" "}
                                        of {pagination.total} services
                                    </div>
                                    <nav>
                                        <ul className="pagination mb-0">
                                            <li
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    1
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.current_page -
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.current_page ===
                                                            1 || loading
                                                    }
                                                >
                                                    <i className="fas fa-chevron-left"></i>
                                                </button>
                                            </li>

                                            {Array.from(
                                                {
                                                    length: Math.min(
                                                        5,
                                                        pagination.last_page
                                                    ),
                                                },
                                                (_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <li
                                                            key={page}
                                                            className={`page-item ${
                                                                pagination.current_page ===
                                                                page
                                                                    ? "active"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        page
                                                                    )
                                                                }
                                                                disabled={
                                                                    loading
                                                                }
                                                            >
                                                                {page}
                                                            </button>
                                                        </li>
                                                    );
                                                }
                                            )}

                                            <li
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    pagination.last_page
                                                        ? "disabled"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pagination.current_page +
                                                                1
                                                        )
                                                    }
                                                    disabled={
                                                        pagination.current_page ===
                                                            pagination.last_page ||
                                                        loading
                                                    }
                                                >
                                                    <i className="fas fa-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
};

export default ServicesList;
