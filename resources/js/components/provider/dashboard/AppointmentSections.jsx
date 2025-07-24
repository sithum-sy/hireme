import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../LoadingSpinner";
import providerAppointmentService from "../../../services/providerAppointmentService";

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
            const result =
                await providerAppointmentService.getDashboardAppointments();
            if (result.success) {
                setAppointmentData(result.data);
            }
        } catch (error) {
            console.error("Failed to load appointment data:", error);
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
            cancelled_by_provider: "bg-danger text-white",
            cancelled_by_client: "bg-danger text-white",
            no_show: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    const AppointmentCard = ({ appointment, showDate = false }) => (
        <div className="appointment-item border-bottom pb-2 mb-2 last:border-0">
            <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                    <div className="fw-semibold mb-1">
                        {appointment.client_name}
                    </div>
                    <div className="text-muted small mb-1">
                        {appointment.service_title}
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
                            {appointment.status_text}
                        </span>
                    </div>
                </div>
                <div className="text-end">
                    <div className="fw-bold text-primary">
                        Rs. {appointment.total_price?.toLocaleString()}
                    </div>
                    <Link
                        to={`/provider/appointments/${appointment.id}`}
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

    return (
        <div className="appointment-sections">
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
                            <div className="text-success mb-1">
                                <i className="fas fa-dollar-sign fa-lg"></i>
                            </div>
                            <h6 className="fw-bold mb-0">
                                Rs.{" "}
                                {(
                                    stats.this_month_earnings || 0
                                ).toLocaleString()}
                            </h6>
                            <small className="text-muted">This Month</small>
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
                                            to="/provider/appointments/today"
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
                                            to="/provider/appointments?status=confirmed"
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
                                            to="/provider/appointments?status=completed"
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
                                            to="/provider/appointments?status=cancelled_by_client"
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
                                        No recent cancellations - great job!
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
