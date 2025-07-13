import React, { useState } from "react";

const AppointmentFilters = ({
    filters,
    onFilterChange,
    onClearFilters,
    appointmentCounts = {},
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Status options with counts
    const statusOptions = [
        {
            value: "all",
            label: "All Statuses",
            count: appointmentCounts.total || 0,
        },
        {
            value: "pending",
            label: "Pending",
            count: appointmentCounts.pending || 0,
        },
        {
            value: "confirmed",
            label: "Confirmed",
            count: appointmentCounts.confirmed || 0,
        },
        {
            value: "in_progress",
            label: "In Progress",
            count: appointmentCounts.in_progress || 0,
        },
        {
            value: "completed",
            label: "Completed",
            count: appointmentCounts.completed || 0,
        },
        {
            value: "cancelled_by_client",
            label: "Cancelled",
            count: appointmentCounts.cancelled || 0,
        },
    ];

    // Quick date filter options
    const quickDateFilters = [
        {
            label: "Today",
            value: "today",
            getDateRange: () => {
                const today = new Date().toISOString().split("T")[0];
                return { date_from: today, date_to: today };
            },
        },
        {
            label: "This Week",
            value: "this_week",
            getDateRange: () => {
                const today = new Date();
                const startOfWeek = new Date(
                    today.setDate(today.getDate() - today.getDay())
                );
                const endOfWeek = new Date(
                    today.setDate(today.getDate() - today.getDay() + 6)
                );
                return {
                    date_from: startOfWeek.toISOString().split("T")[0],
                    date_to: endOfWeek.toISOString().split("T")[0],
                };
            },
        },
        {
            label: "This Month",
            value: "this_month",
            getDateRange: () => {
                const today = new Date();
                const startOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );
                const endOfMonth = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0
                );
                return {
                    date_from: startOfMonth.toISOString().split("T")[0],
                    date_to: endOfMonth.toISOString().split("T")[0],
                };
            },
        },
        {
            label: "Last 30 Days",
            value: "last_30_days",
            getDateRange: () => {
                const today = new Date();
                const thirtyDaysAgo = new Date(
                    today.getTime() - 30 * 24 * 60 * 60 * 1000
                );
                return {
                    date_from: thirtyDaysAgo.toISOString().split("T")[0],
                    date_to: new Date().toISOString().split("T")[0],
                };
            },
        },
    ];

    const handleQuickDateFilter = (quickFilter) => {
        const dateRange = quickFilter.getDateRange();
        onFilterChange("date_from", dateRange.date_from);
        onFilterChange("date_to", dateRange.date_to);
    };

    const hasActiveFilters = () => {
        return (
            filters.status !== "all" ||
            filters.date_from ||
            filters.date_to ||
            filters.service_type ||
            filters.search
        );
    };

    return (
        <div className="appointment-filters bg-white rounded-4 shadow-sm">
            {/* Filter Header */}
            <div className="filter-header p-3 border-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <h6 className="fw-bold mb-0">
                        <i className="fas fa-filter me-2 text-purple"></i>
                        Filter Appointments
                    </h6>
                    {hasActiveFilters() && (
                        <span className="badge bg-purple bg-opacity-10 text-purple ms-2">
                            {
                                Object.values(filters).filter(
                                    (v) => v && v !== "all"
                                ).length
                            }{" "}
                            active
                        </span>
                    )}
                </div>

                <div className="filter-actions">
                    <button
                        className="btn btn-sm btn-outline-secondary me-2 d-md-none"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <i
                            className={`fas fa-chevron-${
                                isExpanded ? "up" : "down"
                            }`}
                        ></i>
                    </button>

                    {hasActiveFilters() && (
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={onClearFilters}
                        >
                            <i className="fas fa-times me-1"></i>
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Content */}
            <div
                className={`filter-content ${
                    isExpanded ? "d-block" : "d-none d-md-block"
                }`}
            >
                <div className="p-3">
                    {/* Quick Status Filters */}
                    <div className="status-filters mb-4">
                        <label className="form-label small fw-semibold">
                            Status
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                            {statusOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className={`btn btn-sm ${
                                        filters.status === option.value
                                            ? "btn-purple"
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() =>
                                        onFilterChange("status", option.value)
                                    }
                                >
                                    {option.label}
                                    {option.count > 0 && (
                                        <span className="badge bg-white text-dark ms-1">
                                            {option.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="row g-3">
                        {/* Search Filter */}
                        <div className="col-md-4">
                            <label className="form-label small fw-semibold">
                                Search
                            </label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="fas fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Service or provider name..."
                                    value={filters.search || ""}
                                    onChange={(e) =>
                                        onFilterChange("search", e.target.value)
                                    }
                                />
                                {filters.search && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            onFilterChange("search", "")
                                        }
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Quick Date Filters */}
                        <div className="col-md-4">
                            <label className="form-label small fw-semibold">
                                Quick Date Filter
                            </label>
                            <select
                                className="form-select"
                                onChange={(e) => {
                                    if (e.target.value) {
                                        const quickFilter =
                                            quickDateFilters.find(
                                                (f) =>
                                                    f.value === e.target.value
                                            );
                                        if (quickFilter)
                                            handleQuickDateFilter(quickFilter);
                                    }
                                }}
                                value=""
                            >
                                <option value="">Select date range...</option>
                                {quickDateFilters.map((filter) => (
                                    <option
                                        key={filter.value}
                                        value={filter.value}
                                    >
                                        {filter.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Service Type Filter */}
                        <div className="col-md-4">
                            <label className="form-label small fw-semibold">
                                Service Type
                            </label>
                            <select
                                className="form-select"
                                value={filters.service_type || ""}
                                onChange={(e) =>
                                    onFilterChange(
                                        "service_type",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">All Services</option>
                                <option value="cleaning">Cleaning</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="repair">Repair</option>
                                <option value="beauty">
                                    Beauty & Wellness
                                </option>
                                <option value="tutoring">Tutoring</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Custom Date Range */}
                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">
                                From Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_from || ""}
                                onChange={(e) =>
                                    onFilterChange("date_from", e.target.value)
                                }
                                max={filters.date_to || undefined}
                            />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label small fw-semibold">
                                To Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_to || ""}
                                onChange={(e) =>
                                    onFilterChange("date_to", e.target.value)
                                }
                                min={filters.date_from || undefined}
                            />
                        </div>
                    </div>

                    {/* Active Filters Summary */}
                    {hasActiveFilters() && (
                        <div className="active-filters mt-3 pt-3 border-top">
                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                <span className="small text-muted fw-semibold">
                                    Active filters:
                                </span>

                                {filters.status !== "all" && (
                                    <span className="badge bg-purple bg-opacity-10 text-purple">
                                        Status:{" "}
                                        {
                                            statusOptions.find(
                                                (s) =>
                                                    s.value === filters.status
                                            )?.label
                                        }
                                        <button
                                            className="btn-close btn-close-sm ms-1"
                                            onClick={() =>
                                                onFilterChange("status", "all")
                                            }
                                        ></button>
                                    </span>
                                )}

                                {filters.search && (
                                    <span className="badge bg-info bg-opacity-10 text-info">
                                        Search: "{filters.search}"
                                        <button
                                            className="btn-close btn-close-sm ms-1"
                                            onClick={() =>
                                                onFilterChange("search", "")
                                            }
                                        ></button>
                                    </span>
                                )}

                                {(filters.date_from || filters.date_to) && (
                                    <span className="badge bg-success bg-opacity-10 text-success">
                                        Date: {filters.date_from || "Any"} to{" "}
                                        {filters.date_to || "Any"}
                                        <button
                                            className="btn-close btn-close-sm ms-1"
                                            onClick={() => {
                                                onFilterChange("date_from", "");
                                                onFilterChange("date_to", "");
                                            }}
                                        ></button>
                                    </span>
                                )}

                                {filters.service_type && (
                                    <span className="badge bg-warning bg-opacity-10 text-warning">
                                        Service: {filters.service_type}
                                        <button
                                            className="btn-close btn-close-sm ms-1"
                                            onClick={() =>
                                                onFilterChange(
                                                    "service_type",
                                                    ""
                                                )
                                            }
                                        ></button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .text-purple { color: #6f42c1 !important; }
                .bg-purple { background-color: #6f42c1 !important; }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
                .btn-close-sm {
                    font-size: 0.7rem;
                    padding: 0.1rem 0.2rem;
                }
            `}</style>
        </div>
    );
};

export default AppointmentFilters;
