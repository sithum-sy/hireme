import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import TodaysSchedule from "../../../components/provider/appointments/TodaysSchedule";
import QuickFilterTabs from "../../../components/provider/appointments/QuickFilterTabs";
import AppointmentsTable from "../../../components/provider/appointments/AppointmentsTable";
import AppointmentCard from "../../../components/provider/appointments/AppointmentCard";
import CreateInvoiceModal from "../../../components/provider/payments/CreateInvoiceModal";
import providerAppointmentService from "../../../services/providerAppointmentService";
import invoiceService from "../../../services/invoiceService";

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

    // Helper function for safe date parsing (avoid timezone issues)
    const createSafeDate = (dateString, timeString = null) => {
        try {
            if (!dateString) return new Date();

            if (typeof dateString === "string" && dateString.includes("-")) {
                // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:MM:SS.sssZ" formats
                let datePart = dateString;
                if (dateString.includes("T")) {
                    datePart = dateString.split("T")[0]; // Extract just the date part
                }
                const [year, month, day] = datePart.split("-");
                let date;

                if (timeString) {
                    const [hours, minutes] = timeString.split(":");
                    date = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                        parseInt(hours),
                        parseInt(minutes)
                    );
                } else {
                    date = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day)
                    );
                }

                return date;
            } else {
                // Fallback for non-standard formats
                const date = new Date(dateString);
                console.log(
                    "🔧 PROVIDER createSafeDate - FALLBACK OUTPUT:",
                    date
                );
                return date;
            }
        } catch (error) {
            console.error("🔧 PROVIDER createSafeDate - ERROR:", error);
            return new Date();
        }
    };

    // Check if service can be started based on grace period
    const canStartService = (appointment) => {
        if (appointment.status !== "confirmed") return false;

        // If grace period is 0, no time restriction
        if (graceMinutes === 0) return true;

        try {
            const now = new Date();
            const appointmentDateTime = createSafeDate(appointment.appointment_date, appointment.appointment_time);

            if (!appointmentDateTime || isNaN(appointmentDateTime.getTime())) return false;

            // Allow starting with configurable grace period
            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            return now >= allowedStartTime;
        } catch (error) {
            console.error("Error checking appointment start time:", error);
            return false;
        }
    };

    // Get time until appointment can start
    const getTimeUntilStart = (appointment) => {
        // If grace period is 0, no waiting time
        if (graceMinutes === 0) return null;

        try {
            const now = new Date();
            const appointmentDateTime = createSafeDate(appointment.appointment_date, appointment.appointment_time);

            if (!appointmentDateTime || isNaN(appointmentDateTime.getTime())) return null;

            const allowedStartTime = new Date(
                appointmentDateTime.getTime() - graceMinutes * 60 * 1000
            );

            if (now >= allowedStartTime) return null; // Can start now

            const timeDiff = allowedStartTime - now;
            const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutesUntil = Math.floor(
                (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
            );

            if (hoursUntil > 0) {
                return `${hoursUntil}h ${minutesUntil}m`;
            } else {
                return `${minutesUntil}m`;
            }
        } catch (error) {
            console.error("Error calculating time until start:", error);
            return null;
        }
    };

    // Cancellation modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [appointmentToCancel, setAppointmentToCancel] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    // Reschedule decline modal state
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [appointmentToDecline, setAppointmentToDecline] = useState(null);
    const [declineLoading, setDeclineLoading] = useState(false);

    // Create invoice modal state
    const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
    const [appointmentToComplete, setAppointmentToComplete] = useState(null);

    // Refresh trigger for TodaysSchedule component
    const [todaysScheduleRefresh, setTodaysScheduleRefresh] = useState(0);
    const [graceMinutes, setGraceMinutes] = useState(15); // Default fallback
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
        loadAppointmentConfig();
    }, []);

    const loadAppointmentConfig = async () => {
        try {
            const result = await providerAppointmentService.getAppointmentConfig();
            if (result.success) {
                setGraceMinutes(result.data.grace_minutes);
            }
        } catch (error) {
            console.error('Failed to load appointment config:', error);
            // Keep default fallback value
        }
    };

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
                    // Smart sorting: future dates ascending (closest first), past dates descending (recent first)
                    const dateA = createSafeDate(a.appointment_date, a.appointment_time);
                    const dateB = createSafeDate(b.appointment_date, b.appointment_time);
                    const now = new Date();
                    
                    const aIsFuture = dateA >= now;
                    const bIsFuture = dateB >= now;
                    
                    // Future appointments come first
                    if (aIsFuture && !bIsFuture) return -1;
                    if (!aIsFuture && bIsFuture) return 1;
                    
                    // Both future or both past - sort by date
                    return dateA - dateB;

                case "date_desc":
                    // Latest date/time first
                    const dateA2 = createSafeDate(
                        a.appointment_date,
                        a.appointment_time
                    );
                    const dateB2 = createSafeDate(
                        b.appointment_date,
                        b.appointment_time
                    );
                    return dateB2 - dateA2;

                case "status":
                    // Sort by status priority with date consideration
                    const nowStatus = new Date();
                    const dateA3 = createSafeDate(a.appointment_date, a.appointment_time);
                    const dateB3 = createSafeDate(b.appointment_date, b.appointment_time);
                    
                    const aIsFutureStatus = dateA3 >= nowStatus;
                    const bIsFutureStatus = dateB3 >= nowStatus;
                    
                    const statusPriority = {
                        // Future active appointments (highest priority)
                        pending: aIsFutureStatus ? 1 : 7,
                        confirmed: aIsFutureStatus ? 2 : 8,
                        in_progress: aIsFutureStatus ? 3 : 9,
                        // Completed appointments
                        completed: aIsFutureStatus ? 4 : 5,
                        // Cancelled appointments (lowest priority)
                        cancelled_by_client: aIsFutureStatus ? 10 : 11,
                        cancelled_by_provider: aIsFutureStatus ? 10 : 11,
                        no_show: aIsFutureStatus ? 12 : 13,
                    };
                    
                    const aPriority = statusPriority[a.status] || 14;
                    const bPriority = statusPriority[b.status] || 14;
                    const priorityDiff = aPriority - bPriority;
                    
                    if (priorityDiff === 0) {
                        // If same priority, sort by date (closest first)
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
                let appointmentsList = result.data.data || [];

                // Apply client-side filtering for completed+closed appointments
                if (filters.status === "completed,closed") {
                    appointmentsList = appointmentsList.filter((apt) =>
                        ["completed", "closed"].includes(apt.status)
                    );
                }

                // Use backend sorting (already correctly sorted by closest date first)
                // Only apply client-side sorting if a specific sort is requested
                let finalAppointments = appointmentsList;
                if (filters.sort_by && filters.sort_by !== "date_asc") {
                    finalAppointments = sortAppointments(appointmentsList, filters.sort_by);
                }

                setAppointments(finalAppointments);

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
                        completed: appointments.filter((apt) =>
                            ["completed", "closed"].includes(apt.status)
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

                // console.log("Loaded stats from dashboard:", statsData);
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

        // Trigger refresh of TodaysSchedule if the updated appointment is for today
        const appointmentDate = createSafeDate(
            updatedAppointment.appointment_date
        );
        const today = new Date();
        if (appointmentDate.toDateString() === today.toDateString()) {
            setTodaysScheduleRefresh((prev) => prev + 1);
        }
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
                    status: "completed,closed",
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

    // Handle cancellation confirmation
    const handleCancelConfirm = async () => {
        if (!appointmentToCancel || !cancelReason.trim()) return;

        setCancelLoading(true);
        try {
            const result = await providerAppointmentService.cancelAppointment(
                appointmentToCancel.id,
                cancelReason
            );

            if (result.success) {
                handleStatusUpdate(result.data);
                setShowCancelModal(false);
                setCancelReason("");
                setAppointmentToCancel(null);
                // Trigger additional refresh for today's schedule
                setTodaysScheduleRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Failed to cancel appointment:", error);
        } finally {
            setCancelLoading(false);
        }
    };

    // Handle cancellation modal close
    const handleCancelModalClose = () => {
        if (!cancelLoading) {
            setShowCancelModal(false);
            setCancelReason("");
            setAppointmentToCancel(null);
        }
    };

    // Handle reschedule decline confirmation
    const handleDeclineConfirm = async () => {
        if (!appointmentToDecline || !declineReason.trim()) return;

        setDeclineLoading(true);
        try {
            const result =
                await providerAppointmentService.declineRescheduleRequest(
                    appointmentToDecline.id,
                    declineReason
                );

            if (result.success) {
                handleStatusUpdate(result.data);
                setShowDeclineModal(false);
                setDeclineReason("");
                setAppointmentToDecline(null);
                // Trigger additional refresh for today's schedule
                setTodaysScheduleRefresh((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Failed to decline reschedule:", error);
        } finally {
            setDeclineLoading(false);
        }
    };

    // Handle decline modal close
    const handleDeclineModalClose = () => {
        if (!declineLoading) {
            setShowDeclineModal(false);
            setDeclineReason("");
            setAppointmentToDecline(null);
        }
    };

    // Handle complete service with invoice creation
    const handleCompleteWithInvoice = async (formData) => {
        try {
            // First complete the service
            const result = await providerAppointmentService.completeService(
                appointmentToComplete.id,
                {
                    notes: formData.notes,
                    create_invoice: false, // Don't auto-create since we're creating manually
                }
            );

            if (result.success) {
                handleStatusUpdate(result.data);
                setTodaysScheduleRefresh((prev) => prev + 1);

                // Now create the invoice using the completed appointment
                const invoiceResult = await invoiceService.createInvoice({
                    ...formData,
                    appointment_id: appointmentToComplete.id,
                });

                setShowCreateInvoiceModal(false);
                setAppointmentToComplete(null);

                if (invoiceResult.success) {
                    setTimeout(() => {
                        alert(
                            `Service completed! Invoice #${invoiceResult.data.invoice_number} has been created.`
                        );
                        navigate(`/provider/invoices/${invoiceResult.data.id}`);
                    }, 100);
                } else {
                    setTimeout(() => {
                        alert(
                            "Service completed but failed to create invoice: " +
                                (invoiceResult.message || "Unknown error")
                        );
                    }, 100);
                }
            }
        } catch (error) {
            console.error("Failed to complete service:", error);
            throw error; // Re-throw to let modal handle the error state
        }
    };

    // Handle invoice modal close
    const handleCreateInvoiceModalClose = () => {
        setShowCreateInvoiceModal(false);
        setAppointmentToComplete(null);
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
                        setTodaysScheduleRefresh((prev) => prev + 1);
                    }
                    break;
                case "start":
                    // Check if service can be started based on grace period
                    if (!canStartService(appointment)) {
                        const timeUntil = getTimeUntilStart(appointment);
                        if (timeUntil) {
                            const graceText = graceMinutes > 0 ? ` (${graceMinutes} minutes before scheduled time)` : '';
                            alert(`You can start this service in ${timeUntil}${graceText}.`);
                        } else {
                            alert('This service cannot be started yet. Please wait until the scheduled time.');
                        }
                        return;
                    }
                    
                    result = await providerAppointmentService.startService(
                        appointment.id
                    );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                        setTodaysScheduleRefresh((prev) => prev + 1);
                    }
                    break;
                case "complete":
                    setAppointmentToComplete(appointment);
                    setShowCreateInvoiceModal(true);
                    break;
                case "cancel":
                    setAppointmentToCancel(appointment);
                    setShowCancelModal(true);
                    break;
                case "approve_reschedule":
                    result =
                        await providerAppointmentService.acceptRescheduleRequest(
                            appointment.id
                        );
                    if (result.success) {
                        handleStatusUpdate(result.data);
                        setTodaysScheduleRefresh((prev) => prev + 1);
                    }
                    break;
                case "decline_reschedule":
                    setAppointmentToDecline(appointment);
                    setShowDeclineModal(true);
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
                        refreshTrigger={todaysScheduleRefresh}
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
                                    <option value="invoice_sent">
                                        Invoice Sent
                                    </option>
                                    <option value="payment_pending">
                                        Payment Pending
                                    </option>
                                    <option value="paid">Paid</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="closed">Closed</option>
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

                {/* Cancellation Modal */}
                {showCancelModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                            Cancel Appointment
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={handleCancelModalClose}
                                            disabled={cancelLoading}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {appointmentToCancel && (
                                            <div className="appointment-info mb-3 p-3 bg-light rounded">
                                                <h6 className="mb-2">
                                                    <i className="fas fa-info-circle text-info me-2"></i>
                                                    Appointment Details
                                                </h6>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">
                                                            Client:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToCancel.client_name
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">
                                                            Service:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToCancel.service_title
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mt-2">
                                                        <small className="text-muted">
                                                            Date:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {createSafeDate(
                                                                appointmentToCancel.appointment_date
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mt-2">
                                                        <small className="text-muted">
                                                            Time:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToCancel.appointment_time
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="alert alert-warning">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            <strong>Warning:</strong> This
                                            action cannot be undone. The client
                                            will be notified of the
                                            cancellation.
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                <strong>
                                                    Reason for Cancellation *
                                                </strong>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={cancelReason}
                                                onChange={(e) =>
                                                    setCancelReason(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Please provide a clear reason for the cancellation. This will be shared with the client."
                                                disabled={cancelLoading}
                                            ></textarea>
                                            <div className="form-text">
                                                A cancellation reason is
                                                required to help the client
                                                understand why their appointment
                                                was cancelled.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleCancelModalClose}
                                            disabled={cancelLoading}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Keep Appointment
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={handleCancelConfirm}
                                            disabled={
                                                cancelLoading ||
                                                !cancelReason.trim()
                                            }
                                        >
                                            {cancelLoading ? (
                                                <>
                                                    <div
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    >
                                                        <span className="visually-hidden">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                    Cancelling...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-ban me-2"></i>
                                                    Cancel Appointment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Reschedule Decline Modal */}
                {showDeclineModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show d-block" tabIndex="-1">
                            <div className="modal-dialog modal-dialog-centered">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            <i className="fas fa-calendar-times text-warning me-2"></i>
                                            Decline Reschedule Request
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={handleDeclineModalClose}
                                            disabled={declineLoading}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        {appointmentToDecline && (
                                            <div className="appointment-info mb-3 p-3 bg-light rounded">
                                                <h6 className="mb-2">
                                                    <i className="fas fa-info-circle text-info me-2"></i>
                                                    Reschedule Request Details
                                                </h6>
                                                <div className="row">
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">
                                                            Client:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToDecline.client_name
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6">
                                                        <small className="text-muted">
                                                            Service:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToDecline.service_title
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mt-2">
                                                        <small className="text-muted">
                                                            Current Date:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {createSafeDate(
                                                                appointmentToDecline.appointment_date
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 mt-2">
                                                        <small className="text-muted">
                                                            Current Time:
                                                        </small>
                                                        <div className="fw-bold">
                                                            {
                                                                appointmentToDecline.appointment_time
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="alert alert-info">
                                            <i className="fas fa-info-circle me-2"></i>
                                            <strong>Note:</strong> The client
                                            will be notified that their
                                            reschedule request has been declined
                                            and the original appointment time
                                            will remain.
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">
                                                <strong>
                                                    Reason for Declining *
                                                </strong>
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={declineReason}
                                                onChange={(e) =>
                                                    setDeclineReason(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Please explain why you cannot accommodate the reschedule request. This will help the client understand your decision."
                                                disabled={declineLoading}
                                            ></textarea>
                                            <div className="form-text">
                                                A clear reason helps maintain
                                                good client relationships and
                                                professionalism.
                                            </div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleDeclineModalClose}
                                            disabled={declineLoading}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={handleDeclineConfirm}
                                            disabled={
                                                declineLoading ||
                                                !declineReason.trim()
                                            }
                                        >
                                            {declineLoading ? (
                                                <>
                                                    <div
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    >
                                                        <span className="visually-hidden">
                                                            Loading...
                                                        </span>
                                                    </div>
                                                    Declining...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-calendar-times me-2"></i>
                                                    Decline Reschedule
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Create Invoice Modal */}
                <CreateInvoiceModal
                    appointment={appointmentToComplete}
                    isOpen={showCreateInvoiceModal}
                    onClose={handleCreateInvoiceModalClose}
                    onComplete={handleCompleteWithInvoice}
                />

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
