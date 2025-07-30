import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import StaffLayout from "../../../components/layouts/StaffLayout";
import StatsCard from "../../../components/staff/StatsCard";
import AppointmentsTable from "../../../components/staff/appointments/AppointmentsTable";

const AppointmentsList = () => {
    const { token } = useAuth();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pagination, setPagination] = useState({});
    const [statistics, setStatistics] = useState({});
    const [filters, setFilters] = useState({
        search: "",
        status: "",
        provider: "",
        client: "",
        date_from: "",
        date_to: "",
        sort_by: "created_at",
        sort_order: "desc",
        per_page: 15,
    });

    const statusOptions = [
        { value: "", label: "All Statuses" },
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "in_progress", label: "In Progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled_by_client", label: "Cancelled by Client" },
        { value: "cancelled_by_provider", label: "Cancelled by Provider" },
        { value: "no_show", label: "No Show" },
        { value: "disputed", label: "Disputed" },
    ];

    const sortOptions = [
        { value: "appointment_date", label: "Appointment Date" },
        { value: "appointment_time", label: "Appointment Time" },
        { value: "status", label: "Status" },
        { value: "total_price", label: "Total Price" },
        { value: "created_at", label: "Created Date" },
        { value: "updated_at", label: "Updated Date" },
    ];

    useEffect(() => {
        fetchAppointments();
    }, [filters]);

    const fetchAppointments = async (page = 1) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...filters,
                page: page.toString(),
            });

            const response = await fetch(
                `/api/staff/appointments?${queryParams}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch appointments");
            }

            const data = await response.json();

            if (data.success) {
                setAppointments(data.data.data || []);
                setPagination({
                    current_page: data.data.current_page,
                    last_page: data.data.last_page,
                    per_page: data.data.per_page,
                    total: data.data.total,
                });
                setStatistics(data.meta || {});
            } else {
                throw new Error(data.message || "Failed to fetch appointments");
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            toast.error("Failed to fetch appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (
        appointment,
        newStatus,
        notes = "",
        cancellationReason = ""
    ) => {
        try {
            setIsProcessing(true);

            const requestData = {
                status: newStatus,
            };

            if (notes) {
                requestData.notes = notes;
            }

            if (cancellationReason) {
                requestData.cancellation_reason = cancellationReason;
            }

            const response = await fetch(
                `/api/staff/appointments/${appointment.id}/status`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                    body: JSON.stringify(requestData),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update appointment status");
            }

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                fetchAppointments(pagination.current_page);
            } else {
                throw new Error(
                    data.message || "Failed to update appointment status"
                );
            }
        } catch (error) {
            console.error("Error updating appointment status:", error);
            toast.error("Failed to update appointment status");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeleteAppointment = async (appointment) => {
        if (
            !confirm(
                "Are you sure you want to delete this appointment? This action cannot be undone."
            )
        ) {
            return;
        }

        try {
            setIsProcessing(true);

            const response = await fetch(
                `/api/staff/appointments/${appointment.id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content"),
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete appointment");
            }

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                fetchAppointments(pagination.current_page);
            } else {
                throw new Error(data.message || "Failed to delete appointment");
            }
        } catch (error) {
            console.error("Error deleting appointment:", error);
            toast.error("Failed to delete appointment");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            search: "",
            status: "",
            provider: "",
            client: "",
            date_from: "",
            date_to: "",
            sort_by: "created_at",
            sort_order: "desc",
            per_page: 15,
        });
    };

    const handlePageChange = (page) => {
        fetchAppointments(page);
    };

    return (
        <StaffLayout>
            <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-0">Appointments Management</h1>
                    <p className="text-muted mb-0">
                        Monitor and manage all appointments in the system
                    </p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row mb-4">
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Total Appointments"
                        value={statistics.total_appointments || 0}
                        icon="fas fa-calendar-check"
                        color="primary"
                    />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Pending"
                        value={statistics.pending_appointments || 0}
                        icon="fas fa-clock"
                        color="warning"
                    />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Confirmed"
                        value={statistics.confirmed_appointments || 0}
                        icon="fas fa-check-circle"
                        color="info"
                    />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Completed"
                        value={statistics.completed_appointments || 0}
                        icon="fas fa-flag-checkered"
                        color="success"
                    />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Cancelled"
                        value={statistics.cancelled_appointments || 0}
                        icon="fas fa-times-circle"
                        color="secondary"
                    />
                </div>
                <div className="col-xl-2 col-md-4 col-sm-6 mb-3">
                    <StatsCard
                        title="Disputed"
                        value={statistics.disputed_appointments || 0}
                        icon="fas fa-exclamation-triangle"
                        color="danger"
                    />
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label">Search</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search appointments..."
                                value={filters.search}
                                onChange={(e) =>
                                    handleFilterChange("search", e.target.value)
                                }
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                            >
                                {statusOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Provider</label>
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
                                {statistics.providers?.map((provider) => (
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
                            <label className="form-label">Client</label>
                            <select
                                className="form-select"
                                value={filters.client}
                                onChange={(e) =>
                                    handleFilterChange("client", e.target.value)
                                }
                            >
                                <option value="">All Clients</option>
                                {statistics.clients?.map((client) => (
                                    <option key={client.id} value={client.id}>
                                        {client.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Date From</label>
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
                        <div className="col-md-1">
                            <label className="form-label">Date To</label>
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
                    </div>
                    <div className="row g-3 mt-2">
                        <div className="col-md-2">
                            <label className="form-label">Sort By</label>
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
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Order</label>
                            <select
                                className="form-select"
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
                        <div className="col-md-2">
                            <label className="form-label">Per Page</label>
                            <select
                                className="form-select"
                                value={filters.per_page}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "per_page",
                                        e.target.value
                                    )
                                }
                            >
                                <option value="10">10</option>
                                <option value="15">15</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleClearFilters}
                            >
                                <i className="fas fa-times me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointments Table */}
            <div className="card">
                <div className="card-body">
                    <AppointmentsTable
                        appointments={appointments}
                        onStatusUpdate={handleStatusUpdate}
                        onDeleteAppointment={handleDeleteAppointment}
                        isProcessing={isProcessing}
                        loading={loading}
                    />

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <nav className="mt-4">
                            <ul className="pagination justify-content-center">
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
                                                pagination.current_page - 1
                                            )
                                        }
                                        disabled={pagination.current_page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {[...Array(pagination.last_page)].map(
                                    (_, index) => {
                                        const page = index + 1;
                                        if (
                                            page === 1 ||
                                            page === pagination.last_page ||
                                            (page >=
                                                pagination.current_page - 2 &&
                                                page <=
                                                    pagination.current_page + 2)
                                        ) {
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
                                        return null;
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
                                                pagination.current_page + 1
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
                    )}
                </div>
            </div>
            </div>
        </StaffLayout>
    );
};

export default AppointmentsList;
