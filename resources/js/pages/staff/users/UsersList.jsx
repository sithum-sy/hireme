import React, { useState, useEffect } from "react";
import StaffLayout from "../../../components/layouts/StaffLayout";
import ClientsTable from "../../../components/staff/users/ClientsTable";
import ProvidersTable from "../../../components/staff/users/ProvidersTable";
import axios from "axios";

const UsersList = () => {
    const [activeTab, setActiveTab] = useState("clients");
    const [clients, setClients] = useState([]);
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        sort_by: "created_at",
        sort_order: "desc",
        per_page: 15,
    });
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [stats, setStats] = useState({
        total_users: 0,
        total_clients: 0,
        total_providers: 0,
        active_users: 0,
        inactive_users: 0,
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadData();
        loadStatistics();
    }, [activeTab, filters]);

    const loadData = async () => {
        setLoading(true);
        setErrors((prev) => ({ ...prev, users: null }));

        try {
            const endpoint =
                activeTab === "clients"
                    ? "/api/staff/users/clients"
                    : "/api/staff/users/providers";
            const response = await axios.get(endpoint, { params: filters });

            if (response.data.success) {
                if (activeTab === "clients") {
                    setClients(response.data.data.data);
                } else {
                    setProviders(response.data.data.data);
                }

                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    from: response.data.data.from,
                    to: response.data.data.to,
                });
            }
        } catch (error) {
            console.error("Failed to load users:", error);
            setErrors((prev) => ({
                ...prev,
                users: error.response?.data?.message || "Failed to load users",
            }));
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const response = await axios.get("/api/staff/users/statistics");
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Failed to load statistics:", error);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({ ...prev, [filterType]: value }));
    };

    const handleSearch = (searchTerm) => {
        setFilters((prev) => ({ ...prev, search: searchTerm }));
    };

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        const currentUsers = activeTab === "clients" ? clients : providers;
        if (selectedUsers.length === currentUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentUsers.map((user) => user.id));
        }
    };

    const handleToggleStatus = async (user) => {
        setIsProcessing(true);
        try {
            const response = await axios.patch(
                `/api/staff/users/${user.id}/toggle-status`
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                await loadData();
                await loadStatistics();
            }
        } catch (error) {
            console.error("Failed to toggle user status:", error);
            setErrors((prev) => ({
                ...prev,
                toggle:
                    error.response?.data?.message ||
                    "Failed to toggle user status",
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    const clearMessages = () => {
        setErrors({});
        setSuccessMessage("");
    };

    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <StaffLayout>
            <div className="staff-dashboard-content">
                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">User Management</h1>
                        <p className="page-subtitle">
                            Manage clients and service providers on the platform
                        </p>
                    </div>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                        <button
                            className="btn btn-outline-primary btn-responsive"
                            onClick={() => {
                                loadData();
                                loadStatistics();
                            }}
                            disabled={loading}
                        >
                            <i
                                className={`fas fa-sync-alt ${
                                    loading ? "fa-spin" : ""
                                } me-2`}
                            ></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="row mb-4">
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-primary mb-2">
                                    <i className="fas fa-users fa-2x"></i>
                                </div>
                                <h4 className="mb-1">{stats.total_users}</h4>
                                <small className="text-muted">
                                    Total Users
                                </small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-info mb-2">
                                    <i className="fas fa-user fa-2x"></i>
                                </div>
                                <h4 className="mb-1">{stats.total_clients}</h4>
                                <small className="text-muted">Clients</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-warning mb-2">
                                    <i className="fas fa-briefcase fa-2x"></i>
                                </div>
                                <h4 className="mb-1">
                                    {stats.total_providers}
                                </h4>
                                <small className="text-muted">Providers</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-success mb-2">
                                    <i className="fas fa-check-circle fa-2x"></i>
                                </div>
                                <h4 className="mb-1">{stats.active_users}</h4>
                                <small className="text-muted">Active</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-secondary mb-2">
                                    <i className="fas fa-pause-circle fa-2x"></i>
                                </div>
                                <h4 className="mb-1">{stats.inactive_users}</h4>
                                <small className="text-muted">Inactive</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-4 col-sm-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body">
                                <div className="text-success mb-2">
                                    <i className="fas fa-certificate fa-2x"></i>
                                </div>
                                <h4 className="mb-1">
                                    {stats.verified_providers || 0}
                                </h4>
                                <small className="text-muted">Verified</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Messages */}
                {errors.users && (
                    <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                    >
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {errors.users}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={clearMessages}
                        ></button>
                    </div>
                )}

                {errors.toggle && (
                    <div
                        className="alert alert-danger alert-dismissible fade show"
                        role="alert"
                    >
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {errors.toggle}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={clearMessages}
                        ></button>
                    </div>
                )}

                {/* Success Messages */}
                {successMessage && (
                    <div
                        className="alert alert-success alert-dismissible fade show"
                        role="alert"
                    >
                        <i className="fas fa-check-circle me-2"></i>
                        {successMessage}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={clearMessages}
                        ></button>
                    </div>
                )}

                {/* Tabs Navigation */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-bottom">
                        <ul className="nav nav-tabs card-header-tabs">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${
                                        activeTab === "clients" ? "active" : ""
                                    }`}
                                    onClick={() => {
                                        setActiveTab("clients");
                                        setSelectedUsers([]);
                                    }}
                                >
                                    <i className="fas fa-user me-2"></i>
                                    Clients ({stats.total_clients})
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${
                                        activeTab === "providers"
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setActiveTab("providers");
                                        setSelectedUsers([]);
                                    }}
                                >
                                    <i className="fas fa-briefcase me-2"></i>
                                    Providers ({stats.total_providers})
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Filters */}
                    <div className="card-body border-bottom">
                        <div className="row g-3">
                            {/* Search */}
                            <div className="col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text bg-light border-end-0">
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search users..."
                                        value={filters.search}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="col-md-2">
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
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            {/* Sort Options */}
                            <div className="col-md-3">
                                <select
                                    className="form-select"
                                    value={`${filters.sort_by}_${filters.sort_order}`}
                                    onChange={(e) => {
                                        const [sortBy, sortOrder] =
                                            e.target.value.split("_");
                                        setFilters((prev) => ({
                                            ...prev,
                                            sort_by: sortBy,
                                            sort_order: sortOrder,
                                        }));
                                    }}
                                >
                                    <option value="created_at_desc">
                                        Newest First
                                    </option>
                                    <option value="created_at_asc">
                                        Oldest First
                                    </option>
                                    <option value="first_name_asc">
                                        Name (A-Z)
                                    </option>
                                    <option value="first_name_desc">
                                        Name (Z-A)
                                    </option>
                                    <option value="email_asc">
                                        Email (A-Z)
                                    </option>
                                    <option value="email_desc">
                                        Email (Z-A)
                                    </option>
                                </select>
                            </div>

                            {/* Per Page */}
                            <div className="col-md-2">
                                <select
                                    className="form-select"
                                    value={filters.per_page}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "per_page",
                                            parseInt(e.target.value)
                                        )
                                    }
                                >
                                    <option value={15}>15 per page</option>
                                    <option value={30}>30 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="col-md-1">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={() =>
                                        setFilters({
                                            search: "",
                                            status: "",
                                            sort_by: "created_at",
                                            sort_order: "desc",
                                            per_page: 15,
                                        })
                                    }
                                    title="Clear Filters"
                                >
                                    <i className="fas fa-times"></i>Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Content */}
                    <div className="card-body p-0">
                        {activeTab === "clients" ? (
                            <ClientsTable
                                clients={clients}
                                selectedUsers={selectedUsers}
                                onSelectUser={handleSelectUser}
                                onSelectAll={handleSelectAll}
                                onToggleStatus={handleToggleStatus}
                                isProcessing={isProcessing}
                                loading={loading}
                            />
                        ) : (
                            <ProvidersTable
                                providers={providers}
                                selectedUsers={selectedUsers}
                                onSelectUser={handleSelectUser}
                                onSelectAll={handleSelectAll}
                                onToggleStatus={handleToggleStatus}
                                isProcessing={isProcessing}
                                loading={loading}
                            />
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="text-muted">
                                    Showing {pagination.from} to {pagination.to}{" "}
                                    of {pagination.total} users
                                </div>
                                <nav>
                                    <ul className="pagination mb-0">
                                        <li
                                            className={`page-item ${
                                                pagination.current_page === 1
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
                                                    1
                                                }
                                            >
                                                Previous
                                            </button>
                                        </li>

                                        {[...Array(pagination.last_page)].map(
                                            (_, index) => {
                                                const page = index + 1;
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
                                                    pagination.last_page
                                                }
                                            >
                                                Next
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
};

export default UsersList;
