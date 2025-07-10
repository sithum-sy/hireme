import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ProviderLayout from "../../components/layouts/ProviderLayout";

const ProviderDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    // Mock data - Replace with actual API calls later
    const [todayStats, setTodayStats] = useState({
        todayAppointments: 3,
        totalEarnings: 2450.0,
        pendingRequests: 5,
        averageRating: 4.8,
        completedJobs: 15,
        responseRate: 95,
    });

    const [upcomingAppointments, setUpcomingAppointments] = useState([
        {
            id: 1,
            client: "Sarah Perera",
            service: "House Cleaning",
            date: "2024-01-15",
            time: "10:00 AM",
            status: "confirmed",
            location: "Bambalapitiya, Colombo",
            price: 150,
            clientImage: null,
        },
        {
            id: 2,
            client: "Kamal Silva",
            service: "Plumbing Repair",
            date: "2024-01-16",
            time: "2:00 PM",
            status: "pending",
            location: "Mount Lavinia",
            price: 200,
            clientImage: null,
        },
    ]);

    const [quickActions] = useState([
        {
            icon: "fas fa-plus-circle",
            title: "Add Service",
            description: "Create new service offering",
            path: "/provider/services/create",
            color: "primary",
            count: null,
        },
        {
            icon: "fas fa-calendar-check",
            title: "Manage Schedule",
            description: "Update availability",
            path: "/provider/availability",
            color: "success",
            count: null,
        },
        {
            icon: "fas fa-bell",
            title: "View Requests",
            description: "Pending bookings",
            path: "/provider/requests",
            color: "warning",
            count: todayStats.pendingRequests,
        },
        {
            icon: "fas fa-chart-line",
            title: "Analytics",
            description: "Performance insights",
            path: "/provider/analytics",
            color: "info",
            count: null,
        },
    ]);

    useEffect(() => {
        // Mock notifications
        setNotifications([
            {
                id: 1,
                type: "booking",
                title: "New booking request",
                message: "Sarah Perera requested house cleaning service",
                time: "2 minutes ago",
                read: false,
            },
            {
                id: 2,
                type: "payment",
                title: "Payment received",
                message: "Rs. 150 payment for completed cleaning job",
                time: "1 hour ago",
                read: false,
            },
            {
                id: 3,
                type: "review",
                title: "New review",
                message: "Nuwan Fernando left a 5-star review",
                time: "3 hours ago",
                read: true,
            },
        ]);
    }, []);

    return (
        <ProviderLayout>
            <div className="provider-dashboard-content">
                {/* Quick Actions */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="section-card">
                            <div className="section-header">
                                <h5 className="fw-bold mb-0">Quick Actions</h5>
                            </div>
                            <div className="section-content">
                                <div className="row">
                                    {quickActions.map((action, index) => (
                                        <div
                                            key={index}
                                            className="col-xl-3 col-md-6 mb-3"
                                        >
                                            <Link
                                                to={action.path}
                                                className="text-decoration-none"
                                            >
                                                <div
                                                    className={`card border-0 shadow-sm h-100 quick-action-card`}
                                                >
                                                    <div className="card-body text-center p-4">
                                                        <div
                                                            className={`action-icon bg-${action.color} bg-opacity-10 text-${action.color} rounded-3 p-3 mb-3 d-inline-block position-relative`}
                                                        >
                                                            <i
                                                                className={`${action.icon} fa-2x`}
                                                            ></i>
                                                            {action.count && (
                                                                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                                    {
                                                                        action.count
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h6 className="fw-bold mb-2">
                                                            {action.title}
                                                        </h6>
                                                        <p className="text-muted small mb-0">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="row">
                    {/* Upcoming Appointments */}
                    <div className="col-lg-8 mb-4">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">
                                        Upcoming Appointments
                                    </h5>
                                    <Link
                                        to="/provider/appointments"
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {upcomingAppointments.length > 0 ? (
                                    <div className="appointments-list">
                                        {upcomingAppointments.map(
                                            (appointment) => (
                                                <div
                                                    key={appointment.id}
                                                    className="appointment-card border rounded-3 p-3 mb-3"
                                                >
                                                    <div className="row align-items-center">
                                                        <div className="col-md-8">
                                                            <div className="d-flex align-items-center">
                                                                <div className="me-3">
                                                                    {appointment.clientImage ? (
                                                                        <img
                                                                            src={
                                                                                appointment.clientImage
                                                                            }
                                                                            alt="Client"
                                                                            className="rounded-circle"
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                                objectFit:
                                                                                    "cover",
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div
                                                                            className="bg-orange bg-opacity-10 text-orange rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                                            style={{
                                                                                width: "50px",
                                                                                height: "50px",
                                                                            }}
                                                                        >
                                                                            {appointment.client
                                                                                .split(
                                                                                    " "
                                                                                )
                                                                                .map(
                                                                                    (
                                                                                        n
                                                                                    ) =>
                                                                                        n[0]
                                                                                )
                                                                                .join(
                                                                                    ""
                                                                                )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h6 className="fw-bold mb-1">
                                                                        {
                                                                            appointment.client
                                                                        }
                                                                    </h6>
                                                                    <p className="text-muted mb-1">
                                                                        <i className="fas fa-concierge-bell me-2"></i>
                                                                        {
                                                                            appointment.service
                                                                        }
                                                                    </p>
                                                                    <div className="d-flex gap-3 text-muted small">
                                                                        <span>
                                                                            <i className="fas fa-calendar me-1"></i>
                                                                            {
                                                                                appointment.date
                                                                            }{" "}
                                                                            at{" "}
                                                                            {
                                                                                appointment.time
                                                                            }
                                                                        </span>
                                                                        <span>
                                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                                            {
                                                                                appointment.location
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 text-end">
                                                            <div className="mb-2">
                                                                <span
                                                                    className={`badge ${
                                                                        appointment.status ===
                                                                        "confirmed"
                                                                            ? "bg-success"
                                                                            : appointment.status ===
                                                                              "pending"
                                                                            ? "bg-warning"
                                                                            : "bg-secondary"
                                                                    }`}
                                                                >
                                                                    {
                                                                        appointment.status
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="fw-bold text-orange mb-2">
                                                                Rs.{" "}
                                                                {
                                                                    appointment.price
                                                                }
                                                            </div>
                                                            <div className="d-flex gap-1 justify-content-end">
                                                                {appointment.status ===
                                                                "pending" ? (
                                                                    <>
                                                                        <button className="btn btn-success btn-sm">
                                                                            Accept
                                                                        </button>
                                                                        <button className="btn btn-outline-danger btn-sm">
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                ) : (
                                                                    <button className="btn btn-outline-orange btn-sm">
                                                                        <i className="fas fa-eye me-1"></i>
                                                                        View
                                                                        Details
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                        <h6 className="text-muted">
                                            No upcoming appointments
                                        </h6>
                                        <Link
                                            to="/provider/schedule"
                                            className="btn btn-orange mt-2"
                                        >
                                            <i className="fas fa-calendar-plus me-2"></i>
                                            Update Your Availability
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Performance & Tips Panel */}
                    <div className="col-lg-4">
                        {/* Performance Summary */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-chart-bar text-orange me-2"></i>
                                    Performance Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Jobs Completed:</span>
                                    <span className="badge bg-info">
                                        {todayStats.completedJobs}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Response Rate:</span>
                                    <span className="badge bg-success">
                                        {todayStats.responseRate}%
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Average Rating:</span>
                                    <span className="badge bg-warning text-dark">
                                        ⭐ {todayStats.averageRating}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Tips for Success
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-clock text-success me-3 mt-1"></i>
                                    <small>
                                        Respond to requests within 2 hours for
                                        better ranking
                                    </small>
                                </div>
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-star text-warning me-3 mt-1"></i>
                                    <small>
                                        Maintain high quality service for 5-star
                                        reviews
                                    </small>
                                </div>
                                <div className="tip-item d-flex align-items-start">
                                    <i className="fas fa-calendar text-info me-3 mt-1"></i>
                                    <small>
                                        Keep your availability calendar updated
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default ProviderDashboard;
