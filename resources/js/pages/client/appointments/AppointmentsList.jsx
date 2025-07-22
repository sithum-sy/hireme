import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import CancelAppointmentModal from "../../../components/client/appointments/CancelAppointmentModal";
// import RescheduleModal from "../../../components/client/appointments/RescheduleModal";
import ReviewModal from "../../../components/client/appointments/ReviewModal";
import PaymentModal from "../../../components/client/appointments/PaymentModal";
import clientAppointmentService from "../../../services/clientAppointmentService";

const AppointmentsList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // State management
    const [appointments, setAppointments] = useState([]);
    // console.log("Appointment total:", appointments.total);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        service_type: searchParams.get("service_type") || "",
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    // const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    // Load appointments on component mount and filter changes
    useEffect(() => {
        loadAppointments();
    }, [filters, pagination.current_page]);

    // Show success message if navigated from booking completion
    const [successMessage, setSuccessMessage] = useState(null);

    useEffect(() => {
        if (location.state?.message && location.state?.fromBooking) {
            setSuccessMessage({
                message: location.state.message,
                type: location.state.type || "success",
                appointment: location.state.appointment,
            });

            // Clear the success message after 10 seconds
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [location.state]);

    const loadAppointments = async () => {
        setLoading(true);
        try {
            // Use enhanced appointment service with payment data
            const params = {
                status: filters.status !== "all" ? filters.status : undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                service_type: filters.service_type || undefined,
                per_page: pagination.per_page,
                page: pagination.current_page,
            };

            const result = await clientAppointmentService.getAppointments(
                params
            );

            if (result.success) {
                const responseData = result.data;
                setAppointments(responseData.data || responseData);

                // Update pagination info
                if (responseData.data) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: responseData.current_page,
                        last_page: responseData.last_page,
                        total: responseData.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to load appointments:", error);
            // Fallback to your existing API if new service fails
            await loadAppointmentsFallback();
        } finally {
            setLoading(false);
        }
    };

    // Fallback to your existing API method
    const loadAppointmentsFallback = async () => {
        try {
            // Build query parameters
            const params = new URLSearchParams();
            if (filters.status !== "all")
                params.append("status", filters.status);
            if (filters.date_from)
                params.append("date_from", filters.date_from);
            if (filters.date_to) params.append("date_to", filters.date_to);
            if (filters.service_type)
                params.append("service_type", filters.service_type);
            params.append("page", pagination.current_page);

            const response = await fetch(`/api/client/bookings?${params}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAppointments(data.data?.data || data.data || []);

                if (data.data?.meta) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: data.data.meta.current_page,
                        last_page: data.data.meta.last_page,
                        total: data.data.meta.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Fallback API also failed:", error);
        }
    };

    // Handle filter changes and update URL
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);

        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Check if appointment can be cancelled (24 hour policy)
    const canCancelAppointment = (appointmentDate, appointmentTime, status) => {
        if (!["pending", "confirmed"].includes(status)) return false;
        if (!appointmentDate || !appointmentTime) return false;

        try {
            let dateObj;
            if (appointmentDate.includes("-")) {
                const [year, month, day] = appointmentDate.split("-");
                const [hours, minutes] = appointmentTime.split(":");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day),
                    parseInt(hours),
                    parseInt(minutes)
                );
            } else {
                dateObj = new Date(`${appointmentDate}T${appointmentTime}`);
            }

            if (isNaN(dateObj.getTime())) {
                return false;
            }

            const now = new Date();
            const hoursUntilAppointment = (dateObj - now) / (1000 * 60 * 60);
            return hoursUntilAppointment > 24;
        } catch (error) {
            console.warn("Error checking cancellation policy:", error);
            return false;
        }
    };

    // Check if appointment can be paid
    const canBePaid = (appointment) => {
        return (
            appointment.invoice &&
            appointment.invoice.payment_status === "pending" &&
            ["completed", "invoice_sent", "payment_pending"].includes(
                appointment.status
            )
        );
    };

    // Check if appointment can be reviewed
    const canBeReviewed = (appointment) => {
        return appointment.status === "paid" && !appointment.client_review;
    };

    // Get status badge styling - Enhanced with payment statuses
    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            confirmed: "bg-success text-white",
            in_progress: "bg-primary text-white",
            completed: "bg-info text-white",
            invoice_sent: "bg-info text-white",
            payment_pending: "bg-warning text-dark",
            paid: "bg-success text-white",
            reviewed: "bg-success text-white",
            closed: "bg-secondary text-white",
            cancelled_by_client: "bg-danger text-white",
            cancelled_by_provider: "bg-danger text-white",
            no_show: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    // Get status text for display - Enhanced with payment statuses
    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Awaiting Confirmation",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            invoice_sent: "Invoice Sent",
            payment_pending: "Payment Pending",
            paid: "Paid",
            reviewed: "Reviewed",
            closed: "Closed",
            cancelled_by_client: "Cancelled by You",
            cancelled_by_provider: "Cancelled by Provider",
            no_show: "No Show",
        };
        return statusTexts[status] || status.replace("_", " ");
    };

    // Format appointment date/time (your existing function)
    const formatDateTime = (date, time) => {
        if (!date || !time) {
            return { date: "Date not set", time: "Time not set" };
        }

        try {
            let dateObj;
            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === "string" && date.includes("-")) {
                const [year, month, day] = date.split("-");
                dateObj = new Date(
                    parseInt(year),
                    parseInt(month) - 1,
                    parseInt(day)
                );
            } else {
                dateObj = new Date(date);
            }

            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date");
            }

            let formattedTime = "Time not set";
            if (time) {
                try {
                    const timeParts = time.toString().split(":");
                    if (timeParts.length >= 2) {
                        const hours = parseInt(timeParts[0]);
                        const minutes = timeParts[1];
                        const ampm = hours >= 12 ? "PM" : "AM";
                        const displayHour = hours % 12 || 12;
                        formattedTime = `${displayHour}:${minutes} ${ampm}`;
                    }
                } catch (timeError) {
                    formattedTime = time.toString();
                }
            }

            return {
                date: dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                }),
                time: formattedTime,
            };
        } catch (error) {
            console.warn("Date formatting error:", error, { date, time });
            return {
                date: date ? date.toString() : "Invalid date",
                time: time ? time.toString() : "Invalid time",
            };
        }
    };

    // Modal handlers
    const handleCancelClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowCancelModal(true);
    };

    // const handleRescheduleClick = (appointment) => {
    //     setSelectedAppointment(appointment);
    //     setShowRescheduleModal(true);
    // };

    const handleReviewClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowReviewModal(true);
    };

    const handlePaymentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setShowPaymentModal(true);
    };

    // Success handlers
    const handleCancellationSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowCancelModal(false);
        setSelectedAppointment(null);
    };

    // const handleRescheduleSuccess = (updatedAppointment) => {
    //     setAppointments((prev) =>
    //         prev.map((apt) =>
    //             apt.id === updatedAppointment.id ? updatedAppointment : apt
    //         )
    //     );
    //     setShowRescheduleModal(false);
    //     setSelectedAppointment(null);
    // };

    const handleReviewSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowReviewModal(false);
        setSelectedAppointment(null);
    };

    const handlePaymentSuccess = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
        setShowPaymentModal(false);
        setSelectedAppointment(null);
    };

    return (
        <ClientLayout>
            <div className="appointments-page">
                {/* Success Message Banner */}
                {successMessage && (
                    <div
                        className="alert alert-success alert-dismissible fade show mb-4"
                        role="alert"
                    >
                        <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle fa-lg me-3 text-success"></i>
                            <div className="flex-grow-1">
                                <h6 className="alert-heading mb-1 fw-bold">
                                    Booking Successful!
                                </h6>
                                <p className="mb-0">{successMessage.message}</p>
                                {successMessage.appointment && (
                                    <small className="text-muted">
                                        Booking ID: #
                                        {successMessage.appointment.id} |
                                        {/* Confirmation Code: {successMessage.appointment.confirmation_code} */}
                                    </small>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSuccessMessage(null)}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                {/* Page Header */}
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Appointments</h2>
                        <p className="text-muted mb-0">
                            Manage and track your service appointments
                        </p>
                    </div>
                    <Link to="/client/services" className="btn btn-purple">
                        <i className="fas fa-plus me-2"></i>
                        Book New Service
                    </Link>
                </div>

                {/* Filters Section - Enhanced with payment statuses */}
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
                                <option value="invoice_sent">
                                    Invoice Sent
                                </option>
                                <option value="payment_pending">
                                    Payment Pending
                                </option>
                                <option value="paid">Paid</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="cancelled_by_client">
                                    Cancelled
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
                                        service_type: "",
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

                                {/* Enhanced Appointment Cards */}
                                {appointments.map((appointment) => {
                                    const dateTime = formatDateTime(
                                        appointment.appointment_date,
                                        appointment.appointment_time
                                    );
                                    const canCancel = canCancelAppointment(
                                        appointment.appointment_date,
                                        appointment.appointment_time,
                                        appointment.status
                                    );

                                    return (
                                        <div
                                            key={appointment.id}
                                            className="appointment-card card border-0 shadow-sm mb-3"
                                        >
                                            <div className="card-body">
                                                <div className="row align-items-center">
                                                    {/* Service & Provider Info */}
                                                    <div className="col-md-6">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <h6 className="fw-bold mb-1">
                                                                    {appointment
                                                                        .service
                                                                        ?.title ||
                                                                        "Service"}
                                                                </h6>
                                                                <div className="text-muted small">
                                                                    <i className="fas fa-user me-1"></i>
                                                                    {
                                                                        appointment
                                                                            .provider
                                                                            ?.first_name
                                                                    }{" "}
                                                                    {
                                                                        appointment
                                                                            .provider
                                                                            ?.last_name
                                                                    }
                                                                    {appointment
                                                                        .provider
                                                                        ?.provider_profile
                                                                        ?.business_name && (
                                                                        <span className="ms-1">
                                                                            (
                                                                            {
                                                                                appointment
                                                                                    .provider
                                                                                    .provider_profile
                                                                                    .business_name
                                                                            }
                                                                            )
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Enhanced Status Badges */}
                                                            <div className="status-badges text-end">
                                                                <span
                                                                    className={`badge ${getStatusBadge(
                                                                        appointment.status
                                                                    )} px-2 py-1 mb-1 d-block`}
                                                                >
                                                                    {getStatusText(
                                                                        appointment.status
                                                                    )}
                                                                </span>

                                                                {/* Payment Status Badge */}
                                                                {appointment.invoice && (
                                                                    <span
                                                                        className={`badge ${
                                                                            appointment
                                                                                .invoice
                                                                                .payment_status ===
                                                                            "pending"
                                                                                ? "bg-warning text-dark"
                                                                                : appointment
                                                                                      .invoice
                                                                                      .payment_status ===
                                                                                  "completed"
                                                                                ? "bg-success text-white"
                                                                                : "bg-secondary text-white"
                                                                        } px-2 py-1 d-block small`}
                                                                    >
                                                                        <i className="fas fa-credit-card me-1"></i>
                                                                        {
                                                                            appointment
                                                                                .invoice
                                                                                .payment_status
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Date, Time, Location */}
                                                        <div className="appointment-details">
                                                            <div className="row text-sm">
                                                                <div className="col-6">
                                                                    <i className="fas fa-calendar text-muted me-2"></i>
                                                                    <span>
                                                                        {
                                                                            dateTime.date
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="col-6">
                                                                    <i className="fas fa-clock text-muted me-2"></i>
                                                                    <span>
                                                                        {
                                                                            dateTime.time
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-1">
                                                                <i className="fas fa-map-marker-alt text-muted me-2"></i>
                                                                <span className="text-muted small">
                                                                    {appointment.location_type ===
                                                                        "client_address" &&
                                                                        "At your location"}
                                                                    {appointment.location_type ===
                                                                        "provider_location" &&
                                                                        "At provider location"}
                                                                    {appointment.location_type ===
                                                                        "custom_location" &&
                                                                        "Custom location"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Price & Actions */}
                                                    <div className="col-md-6 text-end">
                                                        <div className="appointment-price mb-2">
                                                            <div className="fw-bold text-purple h5 mb-0">
                                                                Rs.{" "}
                                                                {
                                                                    appointment.total_price
                                                                }
                                                            </div>
                                                            {appointment.duration_hours && (
                                                                <small className="text-muted">
                                                                    {
                                                                        appointment.duration_hours
                                                                    }{" "}
                                                                    hour
                                                                    {appointment.duration_hours >
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </small>
                                                            )}

                                                            {/* Payment Info */}
                                                            {appointment.invoice && (
                                                                <div className="payment-info mt-1">
                                                                    <small className="text-muted d-block">
                                                                        Invoice:
                                                                        Rs.{" "}
                                                                        {
                                                                            appointment
                                                                                .invoice
                                                                                .total_amount
                                                                        }
                                                                    </small>
                                                                    {appointment
                                                                        .invoice
                                                                        .is_overdue && (
                                                                        <small className="text-danger">
                                                                            <i className="fas fa-exclamation-triangle me-1"></i>
                                                                            {
                                                                                appointment
                                                                                    .invoice
                                                                                    .days_overdue
                                                                            }{" "}
                                                                            days
                                                                            overdue
                                                                        </small>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Action Buttons - Enhanced */}
                                                        <div className="appointment-actions">
                                                            <Link
                                                                to={`/client/appointments/${appointment.id}`}
                                                                className="btn btn-outline-purple btn-sm me-2"
                                                            >
                                                                <i className="fas fa-eye me-1"></i>
                                                                View Details
                                                            </Link>

                                                            {/* Payment Button */}
                                                            {canBePaid(
                                                                appointment
                                                            ) && (
                                                                <button
                                                                    className="btn btn-success btn-sm me-2"
                                                                    onClick={() =>
                                                                        handlePaymentClick(
                                                                            appointment
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                >
                                                                    <i className="fas fa-credit-card me-1"></i>
                                                                    Pay Now
                                                                </button>
                                                            )}

                                                            {/* Review Button */}
                                                            {canBeReviewed(
                                                                appointment
                                                            ) && (
                                                                <button
                                                                    className="btn btn-warning btn-sm me-2"
                                                                    onClick={() =>
                                                                        handleReviewClick(
                                                                            appointment
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        actionLoading
                                                                    }
                                                                >
                                                                    <i className="fas fa-star me-1"></i>
                                                                    Review
                                                                </button>
                                                            )}

                                                            {/* Existing Status-specific Actions */}
                                                            {appointment.status ===
                                                                "pending" &&
                                                                canCancel && (
                                                                    <button
                                                                        className="btn btn-outline-danger btn-sm"
                                                                        onClick={() =>
                                                                            handleCancelClick(
                                                                                appointment
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="fas fa-times me-1"></i>
                                                                        Cancel
                                                                    </button>
                                                                )}

                                                            {appointment.status ===
                                                                "confirmed" && (
                                                                <>
                                                                    {/* <button
                                                                        className="btn btn-outline-warning btn-sm me-2"
                                                                        onClick={() =>
                                                                            handleRescheduleClick(
                                                                                appointment,
                                                                                "reschedule"
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="fas fa-calendar-alt me-1"></i>
                                                                        Reschedule
                                                                    </button> */}
                                                                    {canCancel && (
                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() =>
                                                                                handleCancelClick(
                                                                                    appointment
                                                                                )
                                                                            }
                                                                        >
                                                                            <i className="fas fa-times me-1"></i>
                                                                            Cancel
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}

                                                            {appointment.status ===
                                                                "completed" &&
                                                                !appointment.provider_rating &&
                                                                !canBeReviewed(
                                                                    appointment
                                                                ) && (
                                                                    <button
                                                                        className="btn btn-outline-success btn-sm"
                                                                        onClick={() =>
                                                                            handleReviewClick(
                                                                                appointment
                                                                            )
                                                                        }
                                                                    >
                                                                        <i className="fas fa-star me-1"></i>
                                                                        Review
                                                                    </button>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Quote Origin */}
                                                {appointment.quote_id && (
                                                    <div className="mt-2 pt-2 border-top">
                                                        <small className="text-info">
                                                            <i className="fas fa-quote-left me-1"></i>
                                                            Created from Quote #
                                                            {
                                                                appointment.quote_id
                                                            }
                                                        </small>
                                                    </div>
                                                )}

                                                {/* Payment Warning */}
                                                {appointment.invoice
                                                    ?.is_overdue && (
                                                    <div className="payment-warning mt-2 pt-2 border-top bg-danger bg-opacity-10 rounded p-2">
                                                        <small className="text-danger fw-semibold">
                                                            <i className="fas fa-exclamation-circle me-1"></i>
                                                            Payment overdue by{" "}
                                                            {
                                                                appointment
                                                                    .invoice
                                                                    .days_overdue
                                                            }{" "}
                                                            days
                                                        </small>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Pagination - Your existing pagination code */}
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
                                        ? "You haven't booked any services yet"
                                        : `No appointments match your current filters`}
                                </p>
                                {filters.status === "all" ? (
                                    <Link
                                        to="/client/services"
                                        className="btn btn-purple"
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Browse Services
                                    </Link>
                                ) : (
                                    <button
                                        className="btn btn-outline-purple"
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

                {/* Quick Actions Footer - Your existing code */}
                <div className="quick-actions mt-5 p-4 bg-light rounded-4">
                    <div className="row text-center">
                        <div className="col-md-3">
                            <Link
                                to="/client/services"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-plus-circle fa-2x text-purple mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Book New Service
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/quotes"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-quote-left fa-2x text-info mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Request Quote
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/providers"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-users fa-2x text-success mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Find Providers
                                </span>
                            </Link>
                        </div>
                        <div className="col-md-3">
                            <Link
                                to="/client/support"
                                className="text-decoration-none"
                            >
                                <i className="fas fa-headset fa-2x text-warning mb-2 d-block"></i>
                                <span className="small fw-semibold">
                                    Get Help
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Modals */}
            {selectedAppointment && (
                <>
                    <CancelAppointmentModal
                        show={showCancelModal}
                        onHide={() => {
                            setShowCancelModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onCancellationSuccess={handleCancellationSuccess}
                    />

                    <AppointmentUpdateModal
                        show={showUpdateModal}
                        onHide={() => {
                            setShowUpdateModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        mode={updateMode}
                        onUpdateSuccess={handleUpdateSuccess}
                    />

                    <ReviewModal
                        show={showReviewModal}
                        onHide={() => {
                            setShowReviewModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onReviewSuccess={handleReviewSuccess}
                    />

                    <PaymentModal
                        show={showPaymentModal}
                        onHide={() => {
                            setShowPaymentModal(false);
                            setSelectedAppointment(null);
                        }}
                        appointment={selectedAppointment}
                        onPaymentSuccess={handlePaymentSuccess}
                    />
                </>
            )}

            {/* Custom Styles */}
            <style>{`
               .text-purple { color: #6f42c1 !important; }
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
               .btn-outline-purple {
                   color: #6f42c1;
                   border-color: #6f42c1;
               }
               .btn-outline-purple:hover {
                   background-color: #6f42c1;
                   border-color: #6f42c1;
                   color: white;
               }
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
                   color: #6f42c1;
               }
               .pagination .page-item.active .page-link {
                   background-color: #6f42c1;
                   border-color: #6f42c1;
               }
               .status-badges .badge {
                   font-size: 0.75rem;
               }
           `}</style>
        </ClientLayout>
    );
};

export default AppointmentsList;
