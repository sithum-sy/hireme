import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TodaysSchedule from "../../../components/provider/appointments/TodaysSchedule";
import QuickFilterTabs from "../../../components/provider/appointments/QuickFilterTabs";
import AppointmentsTable from "../../../components/provider/appointments/AppointmentsTable";
import AppointmentCard from "../../../components/provider/appointments/AppointmentCard";
import providerAppointmentService from "../../../services/providerAppointmentService";

const AppointmentsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State management
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState(
        searchParams.get("filter") || "today"
    );
    const [sortField, setSortField] = useState("appointment_date");
    const [sortDirection, setSortDirection] = useState("asc");
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        service_type: searchParams.get("service_type") || "",
        client_name: searchParams.get("client_name") || "",
        sort_by: searchParams.get("sort_by") || "date_asc",
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
    // console.log("Appointment total:", pagination);

    const [stats, setStats] = useState({
        today: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        reschedule_requests: 0,
        total: 0,
    });

    // Load appointments when filters change
    useEffect(() => {
        loadAppointments();
    }, [filters, pagination.current_page]);

    // Load stats separately from filtered appointments
    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        const statusFromUrl = searchParams.get("status");
        if (statusFromUrl && statusFromUrl !== filters.status) {
            setFilters((prev) => ({
                ...prev,
                status: statusFromUrl,
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        // console.log("URL search params:", searchParams.toString());
        // console.log("Current filters:", filters);
        // console.log("Status from URL:", searchParams.get("status"));
    }, [searchParams, filters]);

    // Enhanced sorting function
    const sortAppointments = (appointmentsList, sortBy = "date_asc") => {
        return [...appointmentsList].sort((a, b) => {
            switch (sortBy) {
                case "date_asc":
                    // Closest date/time first
                    const dateA = new Date(
                        `${a.appointment_date}T${a.appointment_time}`
                    );
                    const dateB = new Date(
                        `${b.appointment_date}T${b.appointment_time}`
                    );
                    return dateA - dateB;

                case "date_desc":
                    // Latest date/time first
                    const dateA2 = new Date(
                        `${a.appointment_date}T${a.appointment_time}`
                    );
                    const dateB2 = new Date(
                        `${b.appointment_date}T${b.appointment_time}`
                    );
                    return dateB2 - dateA2;

                case "status":
                    // Sort by status priority
                    const statusPriority = {
                        pending: 1,
                        confirmed: 2,
                        in_progress: 3,
                        completed: 4,
                        cancelled_by_client: 5,
                        cancelled_by_provider: 6,
                        no_show: 7,
                    };
                    const priorityDiff =
                        (statusPriority[a.status] || 8) -
                        (statusPriority[b.status] || 8);
                    if (priorityDiff === 0) {
                        // If same status, sort by date
                        const dateA3 = new Date(
                            `${a.appointment_date}T${a.appointment_time}`
                        );
                        const dateB3 = new Date(
                            `${b.appointment_date}T${b.appointment_time}`
                        );
                        return dateA3 - dateB3;
                    }
                    return priorityDiff;

                case "price_desc":
                    return (b.total_price || 0) - (a.total_price || 0);

                case "price_asc":
                    return (a.total_price || 0) - (b.total_price || 0);

                default:
                    return 0;
            }
        });
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            if (filters.status === "all") delete params.status;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;
            params.page = pagination.current_page;

            const result = await providerAppointmentService.getAppointments(
                params
            );

            if (result.success) {
                const appointmentsList = result.data.data || [];

                // Apply client-side sorting for additional control
                const sortedAppointments = sortAppointments(
                    appointmentsList,
                    filters.sort_by
                );

                setAppointments(sortedAppointments);

                if (result.data.data) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: result.data.current_page,
                        last_page: result.data.last_page,
                        total: result.data.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to load appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            // Use the dashboard stats endpoint for accurate counts
            const result =
                await providerAppointmentService.getAppointmentStats();

            if (result.success) {
                const statsData = result.data;

                // We need to calculate total pending, confirmed, completed for all time
                // Since dashboard stats only has today's counts, let's load with small pages
                const allAppointmentsResult =
                    await providerAppointmentService.getAppointments({
                        per_page: 50, // Maximum allowed
                    });

                if (allAppointmentsResult.success) {
                    const appointments = allAppointmentsResult.data.data || [];

                    setStats({
                        today: statsData.today_total || 0,
                        pending: appointments.filter(
                            (apt) => apt.status === "pending"
                        ).length,
                        confirmed: appointments.filter(
                            (apt) => apt.status === "confirmed"
                        ).length,
                        completed: appointments.filter(
                            (apt) => apt.status === "completed"
                        ).length,
                        reschedule_requests: appointments.filter(
                            (apt) => apt.has_pending_reschedule === true
                        ).length,
                        total:
                            allAppointmentsResult.data.meta?.total ||
                            appointments.length,
                    });
                } else {
                    // Fallback to dashboard stats only
                    setStats({
                        today: statsData.today_total || 0,
                        pending: statsData.today_pending || 0,
                        confirmed: statsData.today_confirmed || 0,
                        completed: statsData.today_completed || 0,
                        reschedule_requests: 0,
                        total: statsData.today_total || 0,
                    });
                }

                console.log("Loaded stats from dashboard:", statsData);
            }
        } catch (error) {
            console.error("Error loading stats:", error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);
    };

    // Add sort indicators
    const getSortIcon = (sortType) => {
        if (filters.sort_by === sortType) {
            return <i className="fas fa-sort-up text-orange ms-1"></i>;
        }
        return <i className="fas fa-sort text-muted ms-1"></i>;
    };

    const handleStatusUpdate = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        // Reload stats to reflect the status change
        loadStats();
    };

    // Handle filter changes for quick tabs
    const handleQuickFilterChange = (filterType) => {
        setActiveFilter(filterType);

        // Update URL parameters
        const newParams = new URLSearchParams(searchParams);
        newParams.set("filter", filterType);
        setSearchParams(newParams);

        // Update filters based on quick filter type
        const today = new Date().toISOString().split("T")[0];
        let newFilters = { ...filters };

        switch (filterType) {
            case "today":
                newFilters = {
                    ...filters,
                    date_from: today,
                    date_to: today,
                    status: "all",
                };
                break;
            case "pending":
                newFilters = {
                    ...filters,
                    status: "pending",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "confirmed":
                newFilters = {
                    ...filters,
                    status: "confirmed",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "completed":
                newFilters = {
                    ...filters,
                    status: "completed",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "reschedule_requests":
                newFilters = {
                    ...filters,
                    status: "reschedule_pending",
                    date_from: "",
                    date_to: "",
                };
                break;
            case "all":
            default:
                newFilters = {
                    status: "all",
                    date_from: "",
                    date_to: "",
                    service_type: "",
                    client_name: "",
                    sort_by: "date_asc",
                };
                break;
        }

        setFilters(newFilters);
        setPendingFilters(newFilters);
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Handle pending filter changes (don't apply immediately)
    const handlePendingFilterChange = (key, value) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Apply filters when Apply button is clicked
    const applyFilters = () => {
        setFilters(pendingFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(pendingFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);

        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Reset pending filters to match current filters
    const resetPendingFilters = () => {
        setPendingFilters({ ...filters });
    };

    // Handle table sorting
    const handleSort = (field) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
    };

    // Handle appointment actions from table/cards
    const handleAppointmentAction = async (action, appointment) => {
        try {
            let result;

            switch (action) {
                case "view":
                    navigate(`/provider/appointments/${appointment.id}`);
                    break;
                case "confirm":
                    result =
                        await providerAppointmentService.confirmAppointment(
                            appointment.id
                        );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                    }
                    break;
                case "start":
                    result = await providerAppointmentService.startService(
                        appointment.id
                    );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                    }
                    break;
                case "complete":
                    result = await providerAppointmentService.completeService(
                        appointment.id
                    );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                    }
                    break;
                case "cancel":
                    const reason = prompt(
                        "Please provide a reason for cancellation:"
                    );
                    if (reason) {
                        result =
                            await providerAppointmentService.cancelAppointment(
                                appointment.id,
                                reason
                            );
                        if (result.success) {
                            handleStatusUpdate(result.data);
                        }
                    }
                    break;
                case "approve_reschedule":
                    result =
                        await providerAppointmentService.acceptRescheduleRequest(
                            appointment.id
                        );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                    }
                    break;
                case "decline_reschedule":
                    const declineReason = prompt(
                        "Please provide a reason for declining the reschedule:"
                    );
                    if (declineReason) {
                        result =
                            await providerAppointmentService.declineRescheduleRequest(
                                appointment.id,
                                declineReason
                            );
                        if (result.success) {
                            handleStatusUpdate(result.data);
                        }
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Failed to handle appointment action:", error);
            // Could add a toast notification here
        }
    };

    return (
        <ProviderLayout>
            <div className="page-content">
                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">My Appointments</h1>
                        <p className="page-subtitle">
                            Manage your service appointments and client bookings
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-orange btn-responsive"
                            onClick={() =>
                                setViewMode(
                                    viewMode === "table" ? "cards" : "table"
                                )
                            }
                        >
                            <i
                                className={`fas ${
                                    viewMode === "table"
                                        ? "fa-th-large"
                                        : "fa-table"
                                } me-2`}
                            ></i>
                            {viewMode === "table" ? "Card View" : "Table View"}
                        </button>
                        <Link
                            to="/provider/services"
                            className="btn btn-orange btn-responsive"
                        >
                            <i className="fas fa-cog me-2"></i>
                            Manage Services
                        </Link>
                    </div>
                </div>

                {/* Today's Schedule Priority Section */}
                {activeFilter === "today" && (
                    <TodaysSchedule
                        onAppointmentAction={handleAppointmentAction}
                    />
                )}

                {/* Quick Filter Tabs */}
                <QuickFilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={handleQuickFilterChange}
                    appointmentCounts={stats}
                />

                {/* Advanced Filters Section - Collapsible */}
                <div className="filters-section mb-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Advanced Filters</h5>
                        <button
                            className="btn btn-outline-orange btn-sm"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#advancedFilters"
                            aria-expanded="false"
                            aria-controls="advancedFilters"
                        >
                            <i className="fas fa-filter me-2"></i>
                            More Filters
                        </button>
                    </div>

                    <div className="collapse" id="advancedFilters">
                        <div className="row g-3 align-items-end">
                            <div className="col-12">
                                {/* <div className="alert alert-info small">
                                    <i className="fas fa-info-circle me-2"></i>
                                    <strong>Multi-Filter Support:</strong> You
                                    can combine multiple filters (status, dates,
                                    client name, and service type) to narrow
                                    down your search. Make changes and click
                                    "Apply Filters" to update the results.
                                </div> */}
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Status
                                </label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.status}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="in_progress">
                                        In Progress
                                    </option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled_by_client">
                                        Cancelled by Client
                                    </option>
                                    <option value="cancelled_by_provider">
                                        Cancelled by You
                                    </option>
                                    <option value="no_show">No Show</option>
                                </select>
                            </div>

                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    From Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_from}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_from",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    To Date
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_to}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_to",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Service Type
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by service name..."
                                    value={pendingFilters.service_type}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "service_type",
                                            e.target.value
                                        )
                                    }
                                />
                            </div> */}

                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Client Name
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search by client name..."
                                    value={pendingFilters.client_name}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "client_name",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            <div className="col-12 mt-3">
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-orange btn-responsive"
                                        onClick={applyFilters}
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        Apply Filters
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-responsive"
                                        onClick={() => {
                                            const clearedFilters = {
                                                status: "all",
                                                date_from: "",
                                                date_to: "",
                                                service_type: "",
                                                client_name: "",
                                                sort_by: "date_asc",
                                            };
                                            setFilters(clearedFilters);
                                            setPendingFilters(clearedFilters);
                                            setActiveFilter("all");
                                            setSearchParams({});
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear All
                                    </button>
                                    <button
                                        className="btn btn-outline-info btn-responsive"
                                        onClick={resetPendingFilters}
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
                                    >
                                        <i className="fas fa-undo me-2"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Appointments Display */}
                {viewMode === "table" ? (
                    <AppointmentsTable
                        appointments={appointments}
                        loading={loading}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onAppointmentAction={handleAppointmentAction}
                    />
                ) : (
                    <>
                        {loading ? (
                            <LoadingSpinner message="Loading appointments..." />
                        ) : (
                            <div className="appointments-list">
                                {appointments.length > 0 ? (
                                    <>
                                        <div className="results-summary mb-3 d-flex justify-content-between align-items-center">
                                            <small className="text-muted">
                                                Showing {appointments.length} of{" "}
                                                {pagination.total} appointments
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-sort me-1"></i>
                                                Sorted by:{" "}
                                                {filters.sort_by === "date_asc"
                                                    ? "Closest First"
                                                    : filters.sort_by ===
                                                      "date_desc"
                                                    ? "Latest First"
                                                    : filters.sort_by ===
                                                      "status"
                                                    ? "Status"
                                                    : filters.sort_by ===
                                                      "price_desc"
                                                    ? "Price: High to Low"
                                                    : "Price: Low to High"}
                                            </small>
                                        </div>

                                        {appointments.map((appointment) => (
                                            <AppointmentCard
                                                key={appointment.id}
                                                appointment={appointment}
                                                onStatusUpdate={
                                                    handleStatusUpdate
                                                }
                                            />
                                        ))}
                                    </>
                                ) : (
                                    <div className="no-appointments text-center py-5">
                                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">
                                            {filters.status === "all"
                                                ? "No appointments found"
                                                : `No ${filters.status} appointments`}
                                        </h5>
                                        <p className="text-muted">
                                            {filters.status === "all"
                                                ? "When clients book your services, they'll appear here"
                                                : "No appointments match your current filters"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="pagination-wrapper d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
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
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page - 1,
                                            }))
                                        }
                                        disabled={pagination.current_page === 1}
                                    >
                                        Previous
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
                                                        setPagination(
                                                            (prev) => ({
                                                                ...prev,
                                                                current_page:
                                                                    page,
                                                            })
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
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page + 1,
                                            }))
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
                )}

                {/* Custom Styles */}
                <style>{`
                   /* Provider appointment styling */
                   .appointment-card {
                       transition: transform 0.2s ease, box-shadow 0.2s ease;
                   }
                   .appointment-card:hover {
                       transform: translateY(-2px);
                       box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                   }
                   .text-sm {
                       font-size: 0.875rem;
                   }
                   .pagination .page-link {
                       color: var(--orange);
                   }
                   .pagination .page-item.active .page-link {
                       background-color: var(--orange);
                       border-color: var(--orange);
                   }
                   .status-badges .badge {
                       font-size: 0.75rem;
                   }
               `}</style>
            </div>
        </ProviderLayout>
    );
};

export default AppointmentsList;
