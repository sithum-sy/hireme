// resources/js/pages/provider/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProviderDashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        totalEarnings: 0,
        totalAppointments: 0,
        pendingRequests: 0,
        completedJobs: 0,
        averageRating: 0,
    });

    const [recentActivities, setRecentActivities] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);

    // Mock data - Replace with actual API calls later
    useEffect(() => {
        setStats({
            totalEarnings: 2450.0,
            totalAppointments: 18,
            pendingRequests: 3,
            completedJobs: 15,
            averageRating: 4.8,
        });

        setUpcomingAppointments([
            {
                id: 1,
                client: "Sarah Perera",
                service: "House Cleaning",
                date: "2024-01-15",
                time: "10:00 AM",
                status: "confirmed",
                location: "Bambalapitiya, Colombo",
                price: 150,
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
            },
        ]);

        setRecentActivities([
            {
                id: 1,
                type: "new_booking",
                message: "New booking request from Sarah Perera",
                time: "2 hours ago",
            },
            {
                id: 2,
                type: "payment_received",
                message: "Payment received - Rs. 150 for house cleaning",
                time: "1 day ago",
            },
            {
                id: 3,
                type: "review_received",
                message: "New 5-star review from Nuwan Fernando",
                time: "2 days ago",
            },
        ]);
    }, []);

    const handleLogout = async () => {
        await logout();
    };

    const quickActions = [
        {
            icon: "fas fa-plus-circle",
            title: "Add Service",
            description: "Create new service offering",
            path: "/provider/services/create",
            color: "primary",
        },
        {
            icon: "fas fa-calendar-check",
            title: "Manage Schedule",
            description: "Update availability",
            path: "/provider/availability",
            color: "success",
        },
        {
            icon: "fas fa-chart-line",
            title: "View Analytics",
            description: "Performance insights",
            path: "/provider/analytics",
            color: "info",
        },
        {
            icon: "fas fa-user-cog",
            title: "Profile Settings",
            description: "Update your profile",
            path: "/provider/settings",
            color: "warning",
        },
    ];

    return (
        <div className="provider-dashboard min-vh-100 bg-light">
            {/* Header */}
            <div className="dashboard-header bg-white shadow-sm border-bottom">
                <div className="container-fluid">
                    <div className="row align-items-center py-3">
                        <div className="col">
                            <h4 className="mb-0 text-success">
                                <i className="fas fa-briefcase me-2"></i>
                                HireMe - Provider Dashboard
                            </h4>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center">
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt="Profile"
                                            className="rounded-circle me-2"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-success rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                            }}
                                        >
                                            {user?.first_name?.charAt(0)}
                                            {user?.last_name?.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="fw-semibold">
                                            {user?.full_name}
                                        </div>
                                        <small className="text-muted">
                                            Service Provider
                                        </small>
                                    </div>
                                </div>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleLogout}
                                >
                                    <i className="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-fluid py-4">
                {/* Welcome Section */}
                <div className="welcome-section bg-gradient-success text-white rounded-4 p-4 mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <h2 className="fw-bold mb-2">
                                Welcome back, {user?.first_name}! 👋
                            </h2>
                            <p className="mb-3 opacity-90">
                                You have {stats.pendingRequests} new booking
                                requests waiting for your response.
                            </p>
                            <div className="d-flex gap-2">
                                <button className="btn btn-light">
                                    <i className="fas fa-bell me-2"></i>
                                    View Requests
                                </button>
                                <button className="btn btn-outline-light">
                                    <i className="fas fa-plus me-2"></i>
                                    Add Service
                                </button>
                            </div>
                        </div>
                        <div className="col-md-4 text-center">
                            <div className="welcome-illustration">
                                <i className="fas fa-chart-line fa-5x opacity-50"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-xl-3 col-md-6 mb-3">
                        <div className="card stats-card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="stats-icon bg-success bg-opacity-10 text-success rounded-3 p-3 me-3">
                                        <i className="fas fa-dollar-sign fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            Rs.{" "}
                                            {stats.totalEarnings.toLocaleString()}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Total Earnings
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
                                    <div className="stats-icon bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3">
                                        <i className="fas fa-calendar-check fa-lg"></i>
                                    </div>
                                    <div>
                                        <div className="stats-number h4 fw-bold mb-0">
                                            {stats.totalAppointments}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Total Jobs
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
                                            {stats.pendingRequests}
                                        </div>
                                        <div className="stats-label text-muted small">
                                            Pending Requests
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
                                            <p className="text-muted small mb-3">
                                                {action.description}
                                            </p>
                                            <button
                                                className={`btn btn-${action.color} btn-sm`}
                                            >
                                                Get Started
                                            </button>
                                        </div>
                                    </div>
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
                                    <button className="btn btn-outline-primary btn-sm">
                                        View All
                                    </button>
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
                                                                    appointment.client
                                                                }
                                                            </p>
                                                            <p className="text-muted mb-1">
                                                                <i className="fas fa-calendar me-2"></i>
                                                                {
                                                                    appointment.date
                                                                }{" "}
                                                                at{" "}
                                                                {
                                                                    appointment.time
                                                                }
                                                            </p>
                                                            <p className="text-muted mb-0">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                {
                                                                    appointment.location
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
                                                            <div className="fw-bold text-success">
                                                                Rs.{" "}
                                                                {
                                                                    appointment.price
                                                                }
                                                            </div>
                                                            <div className="btn-group-vertical btn-group-sm mt-1">
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
                                                                    <button className="btn btn-outline-primary btn-sm">
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
                                        <button className="btn btn-primary mt-2">
                                            Update Your Availability
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity & Profile Status */}
                    <div className="col-lg-4">
                        {/* Profile Status */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">Profile Status</h6>
                            </div>
                            <div className="card-body">
                                <div className="profile-progress">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small">
                                            Profile Completion
                                        </span>
                                        <span className="small fw-bold">
                                            85%
                                        </span>
                                    </div>
                                    <div
                                        className="progress mb-3"
                                        style={{ height: "6px" }}
                                    >
                                        <div
                                            className="progress-bar bg-success"
                                            style={{ width: "85%" }}
                                        ></div>
                                    </div>

                                    <div className="profile-checklist">
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            <span className="small">
                                                Profile Information
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            <span className="small">
                                                Service Location
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-times-circle text-danger me-2"></i>
                                            <span className="small">
                                                Business Documents
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-check-circle text-success me-2"></i>
                                            <span className="small">
                                                Bank Details
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card border-0 shadow-sm">
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
                                                            "new_booking"
                                                                ? "fa-bell text-primary"
                                                                : activity.type ===
                                                                  "payment_received"
                                                                ? "fa-dollar-sign text-success"
                                                                : "fa-star text-warning"
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
