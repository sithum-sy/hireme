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
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
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
                setAppointments(result.data.data || []);
                if (result.data.meta) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: result.data.meta.current_page,
                        last_page: result.data.meta.last_page,
                        total: result.data.meta.total,
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
                            className="btn btn-outline-orange"
                        >
                            <i className="fas fa-calendar-day me-2"></i>
                            Today's Schedule
                        </Link>
                        <Link
                            to="/provider/availability"
                            className="btn btn-orange"
                        >
                            <i className="fas fa-calendar-plus me-2"></i>
                            Manage Availability
                        </Link>
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
                        <div className="col-md-3">
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
                        <div className="col-md-3">
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
                        <div className="col-md-3">
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
                        <div className="col-md-3">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setFilters({
                                        status: "all",
                                        date_from: "",
                                        date_to: "",
                                    });
                                    setSearchParams({});
                                }}
                            >
                                <i className="fas fa-times me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Appointments List */}
                {loading ? (
                    <LoadingSpinner message="Loading appointments..." />
                ) : (
                    <div className="appointments-list">
                        {appointments.length > 0 ? (
                            <>
                                <div className="results-summary mb-3">
                                    <small className="text-muted">
                                        Showing {appointments.length} of{" "}
                                        {pagination.total} appointments
                                    </small>
                                </div>

                                {appointments.map((appointment) => (
                                    <AppointmentCard
                                        key={appointment.id}
                                        appointment={appointment}
                                        onStatusUpdate={handleStatusUpdate}
                                    />
                                ))}

                                {/* Pagination */}
                                {pagination.last_page > 1 && (
                                    <div className="pagination-wrapper d-flex justify-content-center mt-4">
                                        <nav>
                                            <ul className="pagination">
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
                                                            setPagination(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    current_page:
                                                                        prev.current_page -
                                                                        1,
                                                                })
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
                                                                            (
                                                                                prev
                                                                            ) => ({
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
                                                            setPagination(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    current_page:
                                                                        prev.current_page +
                                                                        1,
                                                                })
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
                                )}
                            </>
                        ) : (
                            // Empty state
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
                                {filters.status === "all" ? (
                                    <Link
                                        to="/provider/services"
                                        className="btn btn-orange"
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Add More Services
                                    </Link>
                                ) : (
                                    <button
                                        className="btn btn-outline-orange"
                                        onClick={() => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                status: "all",
                                            }));
                                            setSearchParams({});
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
};

export default AppointmentsList;
