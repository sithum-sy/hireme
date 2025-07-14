import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import AppointmentCard from "../../../components/provider/appointments/AppointmentCard";
import providerAppointmentService from "../../../services/providerAppointmentService";

const TodaysSchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [todayStats, setTodayStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        totalEarnings: 0,
    });

    useEffect(() => {
        loadTodaysAppointments();
    }, []);

    useEffect(() => {
        calculateTodayStats();
    }, [appointments]);

    // Format appointment time to HH:MM AM/PM
    const formatAppointmentTime = (timeString) => {
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
            console.warn("Time formatting error:", error);
            return timeString.toString();
        }
    };

    const loadTodaysAppointments = async () => {
        setLoading(true);
        try {
            const result =
                await providerAppointmentService.getTodaysAppointments();
            if (result.success) {
                setAppointments(result.data || []);
            }
        } catch (error) {
            console.error("Failed to load today's appointments:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTodayStats = () => {
        const stats = {
            total: appointments.length,
            pending: appointments.filter((apt) => apt.status === "pending")
                .length,
            confirmed: appointments.filter((apt) => apt.status === "confirmed")
                .length,
            completed: appointments.filter((apt) => apt.status === "completed")
                .length,
            totalEarnings: appointments
                .filter((apt) => apt.status === "completed")
                .reduce((sum, apt) => sum + (apt.earnings || 0), 0),
        };
        setTodayStats(stats);
    };

    const handleStatusUpdate = (updatedAppointment) => {
        setAppointments((prev) =>
            prev.map((apt) =>
                apt.id === updatedAppointment.id ? updatedAppointment : apt
            )
        );
    };

    const getTimelineAppointments = () => {
        return appointments
            .sort((a, b) =>
                a.appointment_time.localeCompare(b.appointment_time)
            )
            .map((apt) => ({
                ...apt,
                timeSlot: apt.appointment_time
                    ? apt.appointment_time.substring(0, 5)
                    : "00:00",
                formattedTime: formatAppointmentTime(apt.appointment_time),
            }));
    };

    const getCurrentTimeSlot = () => {
        const now = new Date();
        return (
            now.getHours().toString().padStart(2, "0") +
            ":" +
            now.getMinutes().toString().padStart(2, "0")
        );
    };

    const timelineAppointments = getTimelineAppointments();
    const currentTime = getCurrentTimeSlot();

    return (
        <ProviderLayout>
            <div className="todays-schedule-page">
                {/* Page Header */}
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Today's Schedule
                            <span className="badge bg-orange ms-2">
                                {todayStats.total}
                            </span>
                        </h2>
                        <p className="text-muted mb-0">
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link
                            to="/provider/appointments"
                            className="btn btn-outline-orange"
                        >
                            <i className="fas fa-calendar me-2"></i>
                            All Appointments
                        </Link>
                        <Link
                            to="/provider/availability"
                            className="btn btn-orange"
                        >
                            <i className="fas fa-calendar-plus me-2"></i>
                            Update Availability
                        </Link>
                    </div>
                </div>

                {/* Today's Stats */}
                <div className="row mb-4">
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-primary mb-1">
                                    <i className="fas fa-calendar-check fa-lg"></i>
                                </div>
                                <h5 className="fw-bold mb-0">
                                    {todayStats.total}
                                </h5>
                                <small className="text-muted">Total</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-warning mb-1">
                                    <i className="fas fa-clock fa-lg"></i>
                                </div>
                                <h5 className="fw-bold mb-0">
                                    {todayStats.pending}
                                </h5>
                                <small className="text-muted">Pending</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-success mb-1">
                                    <i className="fas fa-check fa-lg"></i>
                                </div>
                                <h5 className="fw-bold mb-0">
                                    {todayStats.confirmed}
                                </h5>
                                <small className="text-muted">Confirmed</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-info mb-1">
                                    <i className="fas fa-check-double fa-lg"></i>
                                </div>
                                <h5 className="fw-bold mb-0">
                                    {todayStats.completed}
                                </h5>
                                <small className="text-muted">Completed</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm text-center h-100">
                            <div className="card-body py-3">
                                <div className="text-success mb-1">
                                    <i className="fas fa-dollar-sign fa-lg"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    Rs.{" "}
                                    {todayStats.totalEarnings.toLocaleString()}
                                </h4>
                                <small className="text-muted">
                                    Today's Earnings
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner message="Loading today's schedule..." />
                ) : (
                    <div className="schedule-content">
                        {timelineAppointments.length > 0 ? (
                            <div className="row">
                                {/* Timeline View */}
                                <div className="col-lg-8">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="fw-bold mb-0">
                                                <i className="fas fa-clock me-2 text-orange"></i>
                                                Schedule Timeline
                                            </h6>
                                        </div>
                                        <div className="card-body p-0">
                                            <div className="timeline-container p-3">
                                                {timelineAppointments.map(
                                                    (appointment, index) => (
                                                        <div
                                                            key={appointment.id}
                                                            className="timeline-item d-flex mb-3"
                                                        >
                                                            <div
                                                                className="timeline-time me-3 text-center"
                                                                style={{
                                                                    minWidth:
                                                                        "60px",
                                                                }}
                                                            >
                                                                <div
                                                                    className="timeline-time me-3 text-center"
                                                                    style={{
                                                                        minWidth:
                                                                            "60px",
                                                                    }}
                                                                >
                                                                    <div
                                                                        className={`fw-bold ${
                                                                            appointment.timeSlot <=
                                                                            currentTime
                                                                                ? "text-success"
                                                                                : "text-muted"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            appointment.formattedTime
                                                                        }{" "}
                                                                        {/* ✅ Shows "2:30 PM" instead of "14:30" */}
                                                                    </div>
                                                                    {appointment.timeSlot <=
                                                                        currentTime && (
                                                                        <small className="text-success">
                                                                            Past
                                                                        </small>
                                                                    )}
                                                                </div>
                                                                {appointment.timeSlot <=
                                                                    currentTime &&
                                                                    appointment.timeSlot >
                                                                        currentTime.substring(
                                                                            0,
                                                                            3
                                                                        ) +
                                                                            "00" && (
                                                                        <small className="text-success">
                                                                            Now
                                                                        </small>
                                                                    )}
                                                            </div>
                                                            <div className="timeline-content flex-grow-1">
                                                                <AppointmentCard
                                                                    appointment={
                                                                        appointment
                                                                    }
                                                                    onStatusUpdate={
                                                                        handleStatusUpdate
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions Sidebar */}
                                <div className="col-lg-4">
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="fw-bold mb-0">
                                                <i className="fas fa-bolt me-2 text-warning"></i>
                                                Quick Actions
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-grid gap-2">
                                                <button className="btn btn-outline-success btn-sm">
                                                    <i className="fas fa-check-circle me-2"></i>
                                                    Mark All Confirmed as
                                                    Complete
                                                </button>
                                                <button className="btn btn-outline-info btn-sm">
                                                    <i className="fas fa-phone me-2"></i>
                                                    Call Next Client
                                                </button>
                                                <Link
                                                    to="/provider/availability"
                                                    className="btn btn-outline-warning btn-sm"
                                                >
                                                    <i className="fas fa-calendar-times me-2"></i>
                                                    Block Tomorrow
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Today's Tips */}
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="fw-bold mb-0">
                                                <i className="fas fa-lightbulb me-2 text-warning"></i>
                                                Today's Tips
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="tip-item mb-3">
                                                <i className="fas fa-clock text-success me-2"></i>
                                                <small>
                                                    Arrive 5-10 minutes early to
                                                    each appointment
                                                </small>
                                            </div>
                                            <div className="tip-item mb-3">
                                                <i className="fas fa-phone text-info me-2"></i>
                                                <small>
                                                    Call clients 30 minutes
                                                    before arrival
                                                </small>
                                            </div>
                                            <div className="tip-item">
                                                <i className="fas fa-star text-warning me-2"></i>
                                                <small>
                                                    Ask for reviews after
                                                    completing services
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Empty state for today
                            <div className="no-appointments-today text-center py-5">
                                <i className="fas fa-calendar-check fa-4x text-muted mb-3"></i>
                                <h4 className="text-muted mb-2">
                                    No appointments scheduled for today
                                </h4>
                                <p className="text-muted mb-4">
                                    Take this time to update your availability,
                                    improve your services, or promote your
                                    business!
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <Link
                                        to="/provider/availability"
                                        className="btn btn-orange"
                                    >
                                        <i className="fas fa-calendar-plus me-2"></i>
                                        Update Availability
                                    </Link>
                                    <Link
                                        to="/provider/services"
                                        className="btn btn-outline-orange"
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Add Services
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .timeline-item {
                    position: relative;
                }
                .timeline-item:not(:last-child)::before {
                    content: '';
                    position: absolute;
                    left: 30px;
                    top: 60px;
                    bottom: -20px;
                    width: 2px;
                    background: #dee2e6;
                }
                .tip-item {
                    padding: 0.5rem 0;
                    border-left: 3px solid transparent;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
                    transition: all 0.2s ease;
                }
                .tip-item:hover {
                    border-left-color: #fd7e14;
                    background-color: #fff3e0;
                    border-radius: 0 0.25rem 0.25rem 0;
                }
            `}</style>
        </ProviderLayout>
    );
};

export default TodaysSchedule;
