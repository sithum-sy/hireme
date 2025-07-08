import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProviderDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeMenuItem, setActiveMenuItem] = useState("dashboard");
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

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

    const sidebarItems = [
        {
            id: "dashboard",
            icon: "fas fa-tachometer-alt",
            label: "Dashboard",
            path: "/provider/dashboard",
            active: true,
        },
        {
            id: "profile",
            icon: "fas fa-user",
            label: "My Profile",
            path: "/provider/profile",
        },
        {
            id: "services",
            icon: "fas fa-concierge-bell",
            label: "My Services",
            path: "/provider/services",
            badge: "3",
        },
        {
            id: "appointments",
            icon: "fas fa-calendar-alt",
            label: "My Appointments",
            path: "/provider/appointments",
            badge: todayStats.todayAppointments.toString(),
        },
        {
            id: "quotations",
            icon: "fas fa-file-invoice-dollar",
            label: "Quotations",
            path: "/provider/quotations",
            badge: todayStats.pendingRequests.toString(),
        },
        {
            id: "schedule",
            icon: "fas fa-clock",
            label: "Schedule",
            path: "/provider/schedule",
        },
        {
            id: "payments",
            icon: "fas fa-credit-card",
            label: "Payments",
            path: "/provider/payments",
        },
        {
            id: "reviews",
            icon: "fas fa-star",
            label: "Ratings & Reviews",
            path: "/provider/reviews",
        },
        {
            id: "notifications",
            icon: "fas fa-bell",
            label: "Notifications",
            path: "/provider/notifications",
            badge: notifications.filter((n) => !n.read).length.toString(),
        },
        {
            id: "analytics",
            icon: "fas fa-chart-bar",
            label: "Analytics",
            path: "/provider/analytics",
        },
        {
            id: "settings",
            icon: "fas fa-cog",
            label: "Settings",
            path: "/provider/settings",
        },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleMenuClick = (itemId) => {
        setActiveMenuItem(itemId);

        // Navigate to the appropriate page
        switch (itemId) {
            case "services":
                navigate("/provider/services");
                break;
            case "dashboard":
                navigate("/provider/dashboard");
                break;
            // Add other cases as needed
            default:
                break;
        }
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "booking":
                return "fas fa-calendar-plus text-primary";
            case "payment":
                return "fas fa-dollar-sign text-success";
            case "review":
                return "fas fa-star text-warning";
            default:
                return "fas fa-bell text-info";
        }
    };

    return (
        <div className="provider-dashboard-layout">
            {/* Sidebar */}
            <div className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-header">
                    <div className="d-flex align-items-center">
                        <div className="sidebar-logo">
                            <i className="fas fa-handshake text-success"></i>
                        </div>
                        {!isSidebarCollapsed && (
                            <div className="ms-2">
                                <h5 className="mb-0 text-success fw-bold">
                                    HireMe
                                </h5>
                                <small className="text-muted">
                                    Provider Panel
                                </small>
                            </div>
                        )}
                    </div>
                    <button
                        className="btn btn-sm btn-outline-secondary sidebar-toggle"
                        onClick={() =>
                            setIsSidebarCollapsed(!isSidebarCollapsed)
                        }
                    >
                        <i
                            className={`fas ${
                                isSidebarCollapsed
                                    ? "fa-chevron-right"
                                    : "fa-chevron-left"
                            }`}
                        ></i>
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="sidebar-menu">
                        {sidebarItems.map((item) => (
                            <div
                                key={item.id}
                                className={`sidebar-item ${
                                    activeMenuItem === item.id ? "active" : ""
                                }`}
                                onClick={() => handleMenuClick(item.id)}
                            >
                                <div className="sidebar-link">
                                    <i className={item.icon}></i>
                                    {!isSidebarCollapsed && (
                                        <>
                                            <span className="sidebar-label">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span className="badge bg-danger rounded-pill ms-auto">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="sidebar-footer">
                        <div
                            className="sidebar-item logout-item"
                            onClick={handleLogout}
                        >
                            <div className="sidebar-link text-danger">
                                <i className="fas fa-sign-out-alt"></i>
                                {!isSidebarCollapsed && (
                                    <span className="sidebar-label">
                                        Logout
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Top Header */}
                <div className="top-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="mb-0 fw-bold">Dashboard</h4>
                            <small className="text-muted">
                                Welcome back, {user?.first_name}!
                            </small>
                        </div>

                        <div className="d-flex align-items-center gap-3">
                            {/* Notifications */}
                            <div className="position-relative">
                                <button
                                    className="btn btn-outline-secondary position-relative"
                                    onClick={toggleNotifications}
                                >
                                    <i className="fas fa-bell"></i>
                                    {notifications.filter((n) => !n.read)
                                        .length > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                            {
                                                notifications.filter(
                                                    (n) => !n.read
                                                ).length
                                            }
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        <div className="dropdown-header">
                                            <h6 className="mb-0">
                                                Notifications
                                            </h6>
                                        </div>
                                        <div className="notifications-list">
                                            {notifications.length > 0 ? (
                                                notifications.map(
                                                    (notification) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className={`notification-item ${
                                                                !notification.read
                                                                    ? "unread"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <div className="d-flex">
                                                                <div className="notification-icon">
                                                                    <i
                                                                        className={getNotificationIcon(
                                                                            notification.type
                                                                        )}
                                                                    ></i>
                                                                </div>
                                                                <div className="notification-content">
                                                                    <div className="notification-title">
                                                                        {
                                                                            notification.title
                                                                        }
                                                                    </div>
                                                                    <div className="notification-message">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </div>
                                                                    <div className="notification-time">
                                                                        {
                                                                            notification.time
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-3 text-muted">
                                                    No notifications
                                                </div>
                                            )}
                                        </div>
                                        <div className="dropdown-footer">
                                            <Link
                                                to="/provider/notifications"
                                                className="btn btn-sm btn-primary w-100"
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile */}
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
                                        {user?.first_name} {user?.last_name}
                                    </div>
                                    <small className="text-muted">
                                        Service Provider
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="dashboard-content">
                    {/* Quick Stats */}
                    <div className="row mb-4">
                        <div className="col-xl-3 col-md-6 mb-3">
                            <div className="stat-card today-appointments">
                                <div className="stat-header">
                                    <h6 className="text-primary">
                                        Today's Appointments
                                    </h6>
                                    <i className="fas fa-calendar-day"></i>
                                </div>
                                <div className="stat-number">
                                    {todayStats.todayAppointments}
                                </div>
                                <div className="stat-label">
                                    <span className="text-success">
                                        <i className="fas fa-arrow-up"></i> 2
                                        confirmed
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                            <div className="stat-card total-earnings">
                                <div className="stat-header">
                                    <h6 className="text-success">
                                        Total Earnings
                                    </h6>
                                    <i className="fas fa-rupee-sign"></i>
                                </div>
                                <div className="stat-number">
                                    Rs.{" "}
                                    {todayStats.totalEarnings.toLocaleString()}
                                </div>
                                <div className="stat-label">
                                    <span className="text-success">
                                        <i className="fas fa-arrow-up"></i> +12%
                                        this month
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                            <div className="stat-card pending-requests">
                                <div className="stat-header">
                                    <h6 className="text-warning">
                                        Pending Requests
                                    </h6>
                                    <i className="fas fa-clock"></i>
                                </div>
                                <div className="stat-number">
                                    {todayStats.pendingRequests}
                                </div>
                                <div className="stat-label">
                                    <span className="text-warning">
                                        <i className="fas fa-exclamation-circle"></i>{" "}
                                        Needs response
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="col-xl-3 col-md-6 mb-3">
                            <div className="stat-card average-rating">
                                <div className="stat-header">
                                    <h6 className="text-info">
                                        Average Rating
                                    </h6>
                                    <i className="fas fa-star"></i>
                                </div>
                                <div className="stat-number">
                                    {todayStats.averageRating}
                                </div>
                                <div className="stat-label">
                                    <span className="text-info">
                                        <i className="fas fa-trophy"></i>{" "}
                                        {todayStats.responseRate}% response rate
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="section-card">
                                <div className="section-header">
                                    <h5 className="fw-bold mb-0">
                                        Quick Actions
                                    </h5>
                                </div>
                                <div className="section-content">
                                    <div className="row">
                                        {quickActions.map((action, index) => (
                                            <div
                                                key={index}
                                                className="col-xl-3 col-md-6 mb-3"
                                            >
                                                <div
                                                    className={`quick-action-card border-${action.color}`}
                                                >
                                                    <div className="action-content">
                                                        <div
                                                            className={`action-icon bg-${action.color}`}
                                                        >
                                                            <i
                                                                className={
                                                                    action.icon
                                                                }
                                                            ></i>
                                                            {action.count && (
                                                                <span className="action-badge">
                                                                    {
                                                                        action.count
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="action-details">
                                                            <h6 className="action-title">
                                                                {action.title}
                                                            </h6>
                                                            <p className="action-description">
                                                                {
                                                                    action.description
                                                                }
                                                            </p>
                                                            <button
                                                                className={`btn btn-${action.color} btn-sm`}
                                                            >
                                                                Get Started
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
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
                            <div className="section-card">
                                <div className="section-header">
                                    <h5 className="fw-bold mb-0">
                                        Upcoming Appointments
                                    </h5>
                                    <Link
                                        to="/provider/appointments"
                                        className="btn btn-outline-primary btn-sm"
                                    >
                                        View All
                                    </Link>
                                </div>
                                <div className="section-content">
                                    {upcomingAppointments.length > 0 ? (
                                        <div className="appointments-list">
                                            {upcomingAppointments.map(
                                                (appointment) => (
                                                    <div
                                                        key={appointment.id}
                                                        className="appointment-card"
                                                    >
                                                        <div className="appointment-content">
                                                            <div className="appointment-client">
                                                                <div className="client-avatar">
                                                                    {appointment.clientImage ? (
                                                                        <img
                                                                            src={
                                                                                appointment.clientImage
                                                                            }
                                                                            alt="Client"
                                                                        />
                                                                    ) : (
                                                                        <div className="avatar-placeholder">
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
                                                                <div className="client-info">
                                                                    <h6 className="client-name">
                                                                        {
                                                                            appointment.client
                                                                        }
                                                                    </h6>
                                                                    <p className="service-type">
                                                                        {
                                                                            appointment.service
                                                                        }
                                                                    </p>
                                                                    <div className="appointment-details">
                                                                        <span className="appointment-date">
                                                                            <i className="fas fa-calendar me-1"></i>
                                                                            {
                                                                                appointment.date
                                                                            }{" "}
                                                                            at{" "}
                                                                            {
                                                                                appointment.time
                                                                            }
                                                                        </span>
                                                                        <span className="appointment-location">
                                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                                            {
                                                                                appointment.location
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="appointment-actions">
                                                                <div className="appointment-price">
                                                                    Rs.{" "}
                                                                    {
                                                                        appointment.price
                                                                    }
                                                                </div>
                                                                <div
                                                                    className={`appointment-status status-${appointment.status}`}
                                                                >
                                                                    {
                                                                        appointment.status
                                                                    }
                                                                </div>
                                                                <div className="action-buttons">
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
                                        <div className="empty-state">
                                            <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                            <h6 className="text-muted">
                                                No upcoming appointments
                                            </h6>
                                            <Link
                                                to="/provider/availability"
                                                className="btn btn-primary mt-2"
                                            >
                                                Update Your Availability
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Info Panel */}
                        <div className="col-lg-4">
                            {/* Performance Summary */}
                            <div className="section-card mb-4">
                                <div className="section-header">
                                    <h6 className="fw-bold mb-0">
                                        Performance Summary
                                    </h6>
                                </div>
                                <div className="section-content">
                                    <div className="performance-metrics">
                                        <div className="metric-item">
                                            <div className="metric-label">
                                                Jobs Completed
                                            </div>
                                            <div className="metric-value">
                                                {todayStats.completedJobs}
                                            </div>
                                        </div>
                                        <div className="metric-item">
                                            <div className="metric-label">
                                                Response Rate
                                            </div>
                                            <div className="metric-value">
                                                {todayStats.responseRate}%
                                            </div>
                                        </div>
                                        <div className="metric-item">
                                            <div className="metric-label">
                                                Client Satisfaction
                                            </div>
                                            <div className="metric-value">
                                                <span className="text-warning">
                                                    ★★★★★{" "}
                                                    {todayStats.averageRating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="section-card">
                                <div className="section-header">
                                    <h6 className="fw-bold mb-0">
                                        Tips for Success
                                    </h6>
                                </div>
                                <div className="section-content">
                                    <div className="tips-list">
                                        <div className="tip-item">
                                            <i className="fas fa-lightbulb text-warning"></i>
                                            <span>
                                                Respond to requests within 2
                                                hours for better ranking
                                            </span>
                                        </div>
                                        <div className="tip-item">
                                            <i className="fas fa-star text-warning"></i>
                                            <span>
                                                Maintain high quality service
                                                for 5-star reviews
                                            </span>
                                        </div>
                                        <div className="tip-item">
                                            <i className="fas fa-clock text-info"></i>
                                            <span>
                                                Keep your availability calendar
                                                updated
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderDashboard;
