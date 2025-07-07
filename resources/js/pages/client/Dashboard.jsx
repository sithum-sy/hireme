import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const ClientDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        averageRating: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    // Mock data - Replace with actual API calls
    useEffect(() => {
        // Simulate API calls
        setStats({
            totalAppointments: 12,
            completedAppointments: 8,
            pendingAppointments: 4,
            averageRating: 4.6,
        });

        setUpcomingAppointments([
            {
                id: 1,
                service: "House Cleaning",
                provider: "Maria Rodriguez",
                date: "2024-01-15",
                time: "10:00 AM",
                status: "confirmed",
                price: 120,
            },
            {
                id: 2,
                service: "Plumbing Repair",
                provider: "John Smith",
                date: "2024-01-16",
                time: "2:00 PM",
                status: "pending",
                price: 200,
            },
        ]);

        setRecentActivities([
            {
                id: 1,
                type: "appointment_completed",
                message: "Tutoring session with Sarah Johnson completed",
                time: "2 hours ago",
            },
            {
                id: 2,
                type: "appointment_booked",
                message: "New cleaning service booked for Jan 15",
                time: "1 day ago",
            },
        ]);
    }, []);

    const quickActions = [
        {
            icon: "fas fa-plus-circle",
            title: "Book New Service",
            description: "Find and book a service provider",
            path: "/client/services",
            color: "primary",
        },
        {
            icon: "fas fa-calendar-alt",
            title: "View Appointments",
            description: "Manage your appointments",
            path: "/client/appointments",
            color: "success",
        },
        {
            icon: "fas fa-star",
            title: "Leave Review",
            description: "Rate your recent services",
            path: "/client/reviews",
            color: "warning",
        },
        {
            icon: "fas fa-headset",
            title: "Get Support",
            description: "Contact customer support",
            path: "/client/support",
            color: "info",
        },
    ];

    return (
        <DashboardLayout>
            <div className="dashboard-content">
                {/* Welcome Section */}
                <div className="welcome-section bg-gradient-primary text-white rounded-4 p-4 mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="fw-bold mb-2">
                                Welcome back, {user?.first_name}!
                            </h2>
                            <p className="mb-3 opacity-90">
                                Ready to book your next service? We have{" "}
                                {stats.pendingAppointments} upcoming
                                appointments waiting for you.
                            </p>
                            <Link
                                to="/client/services"
                                className="btn btn-light btn-lg"
                            >
                                <i className="fas fa-search me-2"></i>
                                Browse Services
                            </Link>
                        </div>
                        <div className="col-md-4 text-center">
                            <div className="welcome-illustration">
                                <i className="fas fa-handshake fa-5x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card stats-card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="stats-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3">
                                        <i className="fas fa-calendar-check fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            {stats.totalAppointments}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Total Appointments
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card stats-card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="stats-icon bg-success bg-opacity-10 text-success rounded-3 p-3 me-3">
                                        <i className="fas fa-check-circle fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            {stats.completedAppointments}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Completed
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card stats-card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="stats-icon bg-warning bg-opacity-10 text-warning rounded-3 p-3 me-3">
                                        <i className="fas fa-clock fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            {stats.pendingAppointments}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Pending
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card stats-card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="stats-icon bg-info bg-opacity-10 text-info rounded-3 p-3 me-3">
                                        <i className="fas fa-star fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            {stats.averageRating}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Average Rating
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="row mb-4">
                    <div className="col-12">
                        <h5 className="fw-bold mb-3">Quick Actions</h5>
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
                                        <div className="card action-card h-100 border-0 shadow-sm">
                                            <div className="card-body text-center p-4">
                                                <div
                                                    className={`action-icon bg-${action.color} bg-opacity-10 text-${action.color} rounded-3 p-3 mb-3 d-inline-block`}
                                                >
                                                    <i
                                                        className={`${action.icon} fa-2x`}
                                                    ></i>
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
                                        to="/client/appointments"
                                        className="btn btn-outline-primary btn-sm"
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
                                                    className="appointment-item border rounded-3 p-3 mb-3"
                                                >
                                                    <div className="row align-items-center">
                                                        <div className="col-md-6">
                                                            <h6 className="fw-bold mb-1">
                                                                {
                                                                    appointment.service
                                                                }
                                                            </h6>
                                                            <p className="text-muted mb-1">
                                                                <i className="fas fa-user me-2"></i>
                                                                {
                                                                    appointment.provider
                                                                }
                                                            </p>
                                                            <p className="text-muted mb-0">
                                                                <i className="fas fa-calendar me-2"></i>
                                                                {
                                                                    appointment.date
                                                                }{" "}
                                                                at{" "}
                                                                {
                                                                    appointment.time
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <span
                                                                className={`badge bg-${
                                                                    appointment.status ===
                                                                    "confirmed"
                                                                        ? "success"
                                                                        : "warning"
                                                                } bg-opacity-10 text-${
                                                                    appointment.status ===
                                                                    "confirmed"
                                                                        ? "success"
                                                                        : "warning"
                                                                }`}
                                                            >
                                                                {
                                                                    appointment.status
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="col-md-3 text-end">
                                                            <div className="fw-bold text-primary">
                                                                $
                                                                {
                                                                    appointment.price
                                                                }
                                                            </div>
                                                            <button className="btn btn-outline-primary btn-sm mt-1">
                                                                <i className="fas fa-eye me-1"></i>
                                                                View
                                                            </button>
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
                                            to="/client/services"
                                            className="btn btn-primary mt-2"
                                        >
                                            Book Your First Service
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity & Quick Links */}
                    <div className="col-lg-4">
                        {/* Recent Activity */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    Recent Activity
                                </h6>
                            </div>
                            <div className="card-body">
                                {recentActivities.length > 0 ? (
                                    <div className="activity-list">
                                        {recentActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="activity-item d-flex mb-3"
                                            >
                                                <div className="activity-icon me-3">
                                                    <i
                                                        className={`fas ${
                                                            activity.type ===
                                                            "appointment_completed"
                                                                ? "fa-check-circle text-success"
                                                                : "fa-calendar-plus text-primary"
                                                        }`}
                                                    ></i>
                                                </div>
                                                <div className="activity-content">
                                                    <p className="mb-1 small">
                                                        {activity.message}
                                                    </p>
                                                    <small className="text-muted">
                                                        {activity.time}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted small">
                                        No recent activity
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">Quick Links</h6>
                            </div>
                            <div className="card-body">
                                <div className="quick-links">
                                    <Link
                                        to="/client/profile"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-user-edit text-muted me-3"></i>
                                        <span>Edit Profile</span>
                                    </Link>
                                    <Link
                                        to="/client/payment-methods"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-credit-card text-muted me-3"></i>
                                        <span>Payment Methods</span>
                                    </Link>
                                    <Link
                                        to="/client/favorites"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-heart text-muted me-3"></i>
                                        <span>Favorite Providers</span>
                                    </Link>
                                    <Link
                                        to="/client/help"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded"
                                    >
                                        <i className="fas fa-question-circle text-muted me-3"></i>
                                        <span>Help & Support</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ClientDashboard;
