import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner";
import clientAppointmentService from "../../../services/clientAppointmentService";

const AppointmentSections = () => {
    const [appointmentData, setAppointmentData] = useState({
        today: [],
        upcoming: [],
        past: [],
        cancelled: [],
        stats: {},
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("today");

    useEffect(() => {
        loadAppointmentData();
    }, []);

    const loadAppointmentData = async () => {
        setLoading(true);
        try {
            // Get today's date
            const today = new Date().toISOString().split("T")[0];
            const nextWeek = new Date();
            nextWeek.setDate(new Date().getDate() + 7);
            const nextWeekStr = nextWeek.toISOString().split("T")[0];

            const lastWeek = new Date();
            lastWeek.setDate(new Date().getDate() - 7);
            const lastWeekStr = lastWeek.toISOString().split("T")[0];

            // Load today's appointments - check all statuses for today
            const todayResult = await clientAppointmentService.getAppointments({
                date_from: today,
                date_to: today,
                per_page: 10,
            });

            // Load upcoming appointments (tomorrow onwards)
            const tomorrow = new Date();
            tomorrow.setDate(new Date().getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split("T")[0];

            const upcomingResult =
                await clientAppointmentService.getAppointments({
                    status: "confirmed,pending",
                    date_from: tomorrowStr,
                    date_to: nextWeekStr,
                    per_page: 10,
                });

            // Load recent completed appointments
            const pastResult = await clientAppointmentService.getAppointments({
                status: "completed,paid,reviewed,closed",
                date_from: lastWeekStr,
                date_to: today,
                per_page: 10,
            });

            // Load cancelled appointments
            const cancelledResult =
                await clientAppointmentService.getAppointments({
                    status: "cancelled_by_client,cancelled_by_provider",
                    date_from: lastWeekStr,
                    per_page: 10,
                });

            // Get all appointments for stats
            const allResult = await clientAppointmentService.getAppointments({
                per_page: 50,
            });

            if (
                todayResult.success &&
                upcomingResult.success &&
                pastResult.success &&
                cancelledResult.success &&
                allResult.success
            ) {
                const todayAppointments = todayResult.data?.data || [];
                const upcomingAppointments = upcomingResult.data?.data || [];
                const pastAppointments = pastResult.data?.data || [];
                const cancelledAppointments = cancelledResult.data?.data || [];
                const allAppointments = allResult.data?.data || [];

                // Debug logging
                console.log("Appointment Data Loading:", {
                    today: {
                        date: today,
                        count: todayAppointments.length,
                        appointments: todayAppointments,
                    },
                    upcoming: {
                        count: upcomingAppointments.length,
                        appointments: upcomingAppointments,
                    },
                    past: { count: pastAppointments.length },
                    cancelled: { count: cancelledAppointments.length },
                    total: { count: allAppointments.length },
                });

                // Calculate stats
                const stats = {
                    today_total: todayAppointments.length,
                    upcoming_count: upcomingAppointments.length,
                    this_week_completed: pastAppointments.filter(
                        (apt) =>
                            apt.status === "completed" ||
                            apt.status === "paid" ||
                            apt.status === "reviewed" ||
                            apt.status === "closed"
                    ).length,
                    total_appointments: allAppointments.length,
                };

                setAppointmentData({
                    today: todayAppointments,
                    upcoming: upcomingAppointments,
                    past: pastAppointments,
                    cancelled: cancelledAppointments,
                    stats: stats,
                });
            }
        } catch (error) {
            console.error("Failed to load appointment data:", error);
            // Set empty data on error
            setAppointmentData({
                today: [],
                upcoming: [],
                past: [],
                cancelled: [],
                stats: {
                    today_total: 0,
                    upcoming_count: 0,
                    this_week_completed: 0,
                    total_appointments: 0,
                },
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return "Time not set";
        try {
            const timeParts = timeString.toString().split(":");
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? "PM" : "AM";
                const displayHour = hours % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            return timeString;
        } catch (error) {
            return timeString.toString();
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Date not available";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
        } catch (error) {
            return dateString;
        }
    };

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

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Pending",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            invoice_sent: "Invoice Sent",
            payment_pending: "Payment Pending",
            paid: "Paid",
            reviewed: "Reviewed",
            closed: "Closed",
            cancelled_by_client: "Cancelled",
            cancelled_by_provider: "Cancelled by Provider",
            no_show: "No Show",
        };
        return statusTexts[status] || status;
    };

    const AppointmentCard = ({ appointment, showDate = false }) => (
        <div className="appointment-item border-bottom pb-2 mb-2 last:border-0">
            <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                    <div className="fw-semibold mb-1">
                        {appointment.service?.title || "Service Title"}
                    </div>
                    <div className="text-muted small mb-1">
                        with {appointment.provider?.first_name}{" "}
                        {appointment.provider?.last_name}
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        {showDate && (
                            <span className="badge bg-light text-dark">
                                {formatDate(appointment.appointment_date)}
                            </span>
                        )}
                        <span className="text-muted small">
                            <i className="fas fa-clock me-1"></i>
                            {formatTime(appointment.appointment_time)}
                        </span>
                        <span
                            className={`badge ${getStatusBadge(
                                appointment.status
                            )}`}
                        >
                            {getStatusText(appointment.status)}
                        </span>
                    </div>
                </div>
                <div className="text-end">
                    <div className="fw-bold text-primary">
                        Rs. {appointment.total_price?.toLocaleString()}
                    </div>
                    <Link
                        to={`/client/appointments/${appointment.id}`}
                        className="btn btn-outline-primary btn-sm mt-1"
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return <LoadingSpinner message="Loading appointments..." />;
    }

    const stats = appointmentData.stats;

    const getTodaysDate = () => {
        const today = new Date();
        return today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="appointment-sections">
            {/* Today's Date Header */}
            <div className="today-date-header mb-4">
                <div className="card border-0 shadow-sm bg-primary text-white">
                    <div className="card-body text-center py-3">
                        <h4 className="mb-0">
                            <i className="fas fa-calendar-day me-2"></i>
                            {getTodaysDate()}
                        </h4>
                        <small className="opacity-75">Today's Schedule Overview</small>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="row mb-4">
                <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body py-3">
                            <div className="text-warning mb-1">
                                <i className="fas fa-calendar-day fa-lg"></i>
                            </div>
                            <h5 className="fw-bold mb-0">
                                {stats.today_total || 0}
                            </h5>
                            <small className="text-muted">Today's Total</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body py-3">
                            <div className="text-success mb-1">
                                <i className="fas fa-calendar-plus fa-lg"></i>
                            </div>
                            <h5 className="fw-bold mb-0">
                                {stats.upcoming_count || 0}
                            </h5>
                            <small className="text-muted">Upcoming</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body py-3">
                            <div className="text-info mb-1">
                                <i className="fas fa-check-double fa-lg"></i>
                            </div>
                            <h5 className="fw-bold mb-0">
                                {stats.this_week_completed || 0}
                            </h5>
                            <small className="text-muted">This Week</small>
                        </div>
                    </div>
                </div>
                <div className="col-md-3 col-6 mb-3">
                    <div className="card border-0 shadow-sm text-center">
                        <div className="card-body py-3">
                            <div className="text-primary mb-1">
                                <i className="fas fa-calendar-check fa-lg"></i>
                            </div>
                            <h6 className="fw-bold mb-0">
                                {stats.total_appointments || 0}
                            </h6>
                            <small className="text-muted">Total Booked</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Appointment Tabs */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <ul className="nav nav-tabs card-header-tabs">
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "today" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("today")}
                            >
                                Today's Schedule
                                {appointmentData.today.length > 0 && (
                                    <span className="badge bg-primary ms-2">
                                        {appointmentData.today.length}
                                    </span>
                                )}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "upcoming" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("upcoming")}
                            >
                                Upcoming
                                {appointmentData.upcoming.length > 0 && (
                                    <span className="badge bg-primary ms-2">
                                        {appointmentData.upcoming.length}
                                    </span>
                                )}
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "past" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("past")}
                            >
                                Recent Completed
                            </button>
                        </li>
                        <li className="nav-item">
                            <button
                                className={`nav-link ${
                                    activeTab === "cancelled" ? "active" : ""
                                }`}
                                onClick={() => setActiveTab("cancelled")}
                            >
                                Cancelled
                                {appointmentData.cancelled.length > 0 && (
                                    <span className="badge bg-danger ms-2">
                                        {appointmentData.cancelled.length}
                                    </span>
                                )}
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="card-body">
                    {/* Today's Appointments */}
                    {activeTab === "today" && (
                        <div className="today-appointments">
                            {appointmentData.today.length > 0 ? (
                                <>
                                    {appointmentData.today.map(
                                        (appointment) => (
                                            <AppointmentCard
                                                key={appointment.id}
                                                appointment={appointment}
                                            />
                                        )
                                    )}
                                    <div className="text-center mt-3">
                                        <Link
                                            to="/client/appointments"
                                            className="btn btn-outline-primary"
                                        >
                                            View Full Schedule
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-calendar-check fa-2x text-muted mb-2"></i>
                                    <p className="text-muted mb-0">
                                        No appointments scheduled for today
                                    </p>
                                    <Link
                                        to="/client/services"
                                        className="btn btn-primary btn-sm mt-2"
                                    >
                                        Book a Service
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upcoming Appointments */}
                    {activeTab === "upcoming" && (
                        <div className="upcoming-appointments">
                            {appointmentData.upcoming.length > 0 ? (
                                <>
                                    {appointmentData.upcoming.map(
                                        (appointment) => (
                                            <AppointmentCard
                                                key={appointment.id}
                                                appointment={appointment}
                                                showDate={true}
                                            />
                                        )
                                    )}
                                    <div className="text-center mt-3">
                                        <Link
                                            to="/client/appointments?status=confirmed"
                                            className="btn btn-outline-primary"
                                        >
                                            View All Upcoming
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-calendar-plus fa-2x text-muted mb-2"></i>
                                    <p className="text-muted mb-0">
                                        No upcoming appointments
                                    </p>
                                    <Link
                                        to="/client/services"
                                        className="btn btn-primary btn-sm mt-2"
                                    >
                                        Book a Service
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Past Appointments */}
                    {activeTab === "past" && (
                        <div className="past-appointments">
                            {appointmentData.past.length > 0 ? (
                                <>
                                    {appointmentData.past.map((appointment) => (
                                        <AppointmentCard
                                            key={appointment.id}
                                            appointment={appointment}
                                            showDate={true}
                                        />
                                    ))}
                                    <div className="text-center mt-3">
                                        <Link
                                            to="/client/appointments?status=completed"
                                            className="btn btn-outline-primary"
                                        >
                                            View All Completed
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-history fa-2x text-muted mb-2"></i>
                                    <p className="text-muted mb-0">
                                        No recent completed appointments
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cancelled Appointments */}
                    {activeTab === "cancelled" && (
                        <div className="cancelled-appointments">
                            {appointmentData.cancelled.length > 0 ? (
                                <>
                                    {appointmentData.cancelled.map(
                                        (appointment) => (
                                            <AppointmentCard
                                                key={appointment.id}
                                                appointment={appointment}
                                                showDate={true}
                                            />
                                        )
                                    )}
                                    <div className="text-center mt-3">
                                        <Link
                                            to="/client/appointments?status=cancelled_by_client"
                                            className="btn btn-outline-primary"
                                        >
                                            View All Cancelled
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-calendar-times fa-2x text-success mb-2"></i>
                                    <p className="text-muted mb-0">
                                        No recent cancellations
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentSections;
