import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AppointmentCard from "../../../components/provider/appointments/AppointmentCard";
import providerAppointmentService from "../../../services/providerAppointmentService";

const AppointmentsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State management
    const [appointments, setAppointments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        sort_by: searchParams.get("sort_by") || "date_asc",
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
    console.log("Appointment total:", pagination);

    const [stats, setStats] = useState({
        today: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
    });

    // Load appointments when filters change
    useEffect(() => {
        loadAppointments();
    }, [filters, pagination.current_page]);

    // Calculate stats when appointments change
    useEffect(() => {
        calculateStats();
    }, [appointments]);

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

    const calculateStats = () => {
        const today = new Date().toDateString();
        setStats({
            today: appointments.filter(
                (apt) => new Date(apt.appointment_date).toDateString() === today
            ).length,
            pending: appointments.filter((apt) => apt.status === "pending")
                .length,
            confirmed: appointments.filter((apt) => apt.status === "confirmed")
                .length,
            completed: appointments.filter((apt) => apt.status === "completed")
                .length,
        });
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
    };

    return (
        <ProviderLayout>
            <div className="appointments-page">
                {/* Page Header */}
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Appointments</h2>
                        <p className="text-muted mb-0">
                            Manage your service appointments and schedule
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link
                            to="/provider/appointments/today"
                            className="btn btn-orange"
                        >
                            <i className="fas fa-calendar-day me-2"></i>
                            Today's Schedule
                        </Link>
                        {/* <Link
                            to="/provider/availability"
                            className="btn btn-outline-orange"
                        >
                            <i className="fas fa-calendar-plus me-2"></i>
                            Manage Availability
                        </Link> */}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="row mb-4">
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-warning mb-1">
                                    <i className="fas fa-calendar-day fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">{stats.today}</h4>
                                <small className="text-muted">Today</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-warning mb-1">
                                    <i className="fas fa-clock fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    {stats.pending}
                                </h4>
                                <small className="text-muted">Pending</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-success mb-1">
                                    <i className="fas fa-check fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    {stats.confirmed}
                                </h4>
                                <small className="text-muted">Confirmed</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-info mb-1">
                                    <i className="fas fa-check-double fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    {stats.completed}
                                </h4>
                                <small className="text-muted">Completed</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section bg-white rounded-4 shadow-sm p-3 mb-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                Status
                            </label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled_by_client">
                                    Cancelled by Client
                                </option>
                                <option value="cancelled_by_provider">
                                    Cancelled by Me
                                </option>
                            </select>
                        </div>

                        {/* Add Sort By dropdown */}
                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                Sort By
                            </label>
                            <i className="fas fa-calendar-plus me-2"></i>

                            <select
                                className="form-select"
                                value={filters.sort_by}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "sort_by",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="date_asc">Closest First</option>
                                <option value="date_desc">Latest First</option>
                                <option value="status">By Status</option>
                                <option value="price_desc">
                                    Price: High to Low
                                </option>
                                <option value="price_asc">
                                    Price: Low to High
                                </option>
                            </select>
                        </div>

                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                From Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_from}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_from",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label small fw-semibold">
                                To Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_to}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_to",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className="col-md-2">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setFilters({
                                        status: "all",
                                        date_from: "",
                                        date_to: "",
                                        sort_by: "date_asc",
                                    });
                                    setSearchParams({});
                                }}
                            >
                                <i className="fas fa-times me-2"></i>
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                <div className="quick-sort-buttons mb-3 d-flex gap-2 flex-wrap">
                    <button
                        className={`btn btn-sm ${
                            filters.sort_by === "date_asc"
                                ? "btn-orange"
                                : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                            handleFilterChange("sort_by", "date_asc")
                        }
                    >
                        <i className="fas fa-clock me-1"></i>
                        Upcoming First
                    </button>
                    <button
                        className={`btn btn-sm ${
                            filters.sort_by === "status"
                                ? "btn-orange"
                                : "btn-outline-secondary"
                        }`}
                        onClick={() => handleFilterChange("sort_by", "status")}
                    >
                        <i className="fas fa-tasks me-1"></i>
                        By Status
                    </button>
                    <button
                        className={`btn btn-sm ${
                            filters.sort_by === "price_desc"
                                ? "btn-orange"
                                : "btn-outline-secondary"
                        }`}
                        onClick={() =>
                            handleFilterChange("sort_by", "price_desc")
                        }
                    >
                        <i className="fas fa-dollar-sign me-1"></i>
                        Highest Value
                    </button>
                </div>

                {/* Appointments List */}
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
                                            : filters.sort_by === "date_desc"
                                            ? "Latest First"
                                            : filters.sort_by === "status"
                                            ? "Status"
                                            : filters.sort_by === "price_desc"
                                            ? "Price: High to Low"
                                            : "Price: Low to High"}
                                    </small>
                                </div>

                                {appointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                ))}

                                {/* Your existing pagination remains the same */}
                            </>
                        ) : (
                            // Your existing empty state remains the same
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
            </div>
        </ProviderLayout>
    );
};

export default AppointmentsList;
