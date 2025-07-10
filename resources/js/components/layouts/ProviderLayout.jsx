import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../navigation/shared/DashboardNavbar";
import DashboardSidebar from "../navigation/shared/DashboardSidebar";

const ProviderLayout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Check for mobile screen
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Provider-specific state
    const [notifications, setNotifications] = useState([]);
    const [todaysSchedule, setTodaysSchedule] = useState([]);
    const [businessStats, setBusinessStats] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        todaysAppointments: 0,
        pendingRequests: 0,
        averageRating: 0,
        responseRate: 0,
        completedJobs: 0,
        activeServices: 0,
    });
    const [businessAlerts, setBusinessAlerts] = useState([]);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    }, [location.pathname, isMobile]);

    // Load provider data
    useEffect(() => {
        loadProviderData();
    }, []);

    // Load provider-specific data
    const loadProviderData = useCallback(async () => {
        try {
            // Mock data - replace with actual API calls
            setBusinessStats({
                totalEarnings: 2450.0,
                monthlyEarnings: 850.0,
                todaysAppointments: 3,
                pendingRequests: 7,
                averageRating: 4.8,
                responseRate: 95,
                completedJobs: 24,
                activeServices: 8,
            });

            setTodaysSchedule([
                {
                    id: 1,
                    client: "Sarah Perera",
                    service: "House Cleaning",
                    time: "10:00 AM",
                    location: "Bambalapitiya, Colombo",
                    status: "confirmed",
                    earnings: 150,
                },
                {
                    id: 2,
                    client: "Kamal Silva",
                    service: "Plumbing Repair",
                    time: "2:00 PM",
                    location: "Mount Lavinia",
                    status: "in_progress",
                    earnings: 200,
                },
                {
                    id: 3,
                    client: "Nuwan Fernando",
                    service: "Garden Maintenance",
                    time: "4:00 PM",
                    location: "Dehiwala",
                    status: "upcoming",
                    earnings: 120,
                },
            ]);

            setNotifications([
                {
                    id: 1,
                    type: "request",
                    title: "New Service Request",
                    message: "Sarah requested house cleaning service",
                    time: "5 minutes ago",
                    read: false,
                    priority: "high",
                },
                {
                    id: 2,
                    type: "payment",
                    title: "Payment Received",
                    message: "Rs. 150 payment received from completed job",
                    time: "1 hour ago",
                    read: false,
                    priority: "medium",
                },
                {
                    id: 3,
                    type: "review",
                    title: "New 5-Star Review",
                    message: "Excellent service! - Client feedback",
                    time: "2 hours ago",
                    read: true,
                    priority: "low",
                },
            ]);

            setBusinessAlerts([
                {
                    id: 1,
                    type: "opportunity",
                    title: "Peak Hours Opportunity",
                    message: "High demand in your area between 2-4 PM today",
                    action: "Update Availability",
                    actionUrl: "/provider/schedule",
                },
                {
                    id: 2,
                    type: "verification",
                    title: "Profile Verification",
                    message:
                        "Complete your business verification for better visibility",
                    action: "Verify Now",
                    actionUrl: "/provider/profile/verification",
                },
            ]);
        } catch (error) {
            console.error("Failed to load provider data:", error);
        }
    }, []);

    // Sidebar toggle handler
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Search handler with provider-specific functionality
    const handleSearch = (query) => {
        if (query.trim()) {
            // Providers can search appointments, clients, analytics, services
            navigate(`/provider/search?q=${encodeURIComponent(query)}`);

            // Add notification for search
            addNotification(`Searching for: ${query}`, "info");
        }
    };

    // Menu item click handler with provider-specific tracking
    const handleMenuItemClick = (item) => {
        // console.log("Provider menu clicked:", item);

        // Add provider-specific menu click handling
        if (item.id === "services") {
            console.log("Managing services");
        } else if (item.id === "appointments") {
            console.log("Viewing appointments");
        } else if (item.id === "requests") {
            console.log("Checking service requests");
            // Mark request notifications as seen
            setNotifications((prev) =>
                prev.map((n) =>
                    n.type === "request" ? { ...n, read: true } : n
                )
            );
        } else if (item.id === "earnings") {
            console.log("Viewing earnings");
        }

        // Close sidebar on mobile after clicking
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Add notification helper
    const addNotification = (message, type = "info", priority = "medium") => {
        const newNotification = {
            id: Date.now(),
            type: type,
            title: type.charAt(0).toUpperCase() + type.slice(1),
            message: message,
            time: "Just now",
            read: false,
            priority: priority,
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Auto-remove after 5 seconds for low priority
        if (priority === "low") {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, 5000);
        }
    };

    // Remove notification
    const removeNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    // Dismiss business alert
    const dismissBusinessAlert = (alertId) => {
        setBusinessAlerts((prev) => prev.filter((a) => a.id !== alertId));
    };

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        // Remove 'provider' from path segments for cleaner breadcrumbs
        const providerIndex = pathSegments.indexOf("provider");
        if (providerIndex > -1) {
            pathSegments.splice(providerIndex, 1);
        }

        // Add Home breadcrumb
        breadcrumbs.push({
            title: "Provider Dashboard",
            path: "/provider/dashboard",
            active: pathSegments.length === 0,
        });

        // Generate breadcrumbs from path
        let currentPath = "/provider";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Convert segment to readable title
            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            // Provider-specific title mappings
            const titleMappings = {
                dashboard: "Dashboard",
                profile: "Business Profile",
                services: "My Services",
                appointments: "Appointments",
                requests: "Service Requests",
                schedule: "Availability",
                earnings: "Earnings & Payments",
                reviews: "Reviews & Ratings",
                messages: "Messages",
                analytics: "Business Analytics",
                settings: "Settings",
                create: "Add New",
                edit: "Edit",
                today: "Today's Schedule",
                upcoming: "Upcoming Appointments",
                past: "Past Appointments",
                new: "New Requests",
                quotes: "Quotes Sent",
                accepted: "Accepted Jobs",
                availability: "Set Availability",
                blocked: "Blocked Times",
                slots: "Time Slots",
                overview: "Overview",
                history: "Payment History",
                tax: "Tax Documents",
                performance: "Performance",
                customers: "Customer Insights",
                business: "Business Settings",
                notifications: "Notification Preferences",
                payments: "Payment Settings",
                verification: "Verification",
            };

            title = titleMappings[segment] || title;

            breadcrumbs.push({
                title: title,
                path: currentPath,
                active: isLast,
            });
        });

        return breadcrumbs;
    };

    // Get today's earnings
    const getTodaysEarnings = () => {
        return todaysSchedule
            .filter(
                (appointment) =>
                    appointment.status === "confirmed" ||
                    appointment.status === "in_progress"
            )
            .reduce((total, appointment) => total + appointment.earnings, 0);
    };

    // Get business performance indicators
    const getPerformanceIndicators = () => {
        const responseRateStatus =
            businessStats.responseRate >= 90
                ? "excellent"
                : businessStats.responseRate >= 75
                ? "good"
                : "needs_improvement";

        const ratingStatus =
            businessStats.averageRating >= 4.5
                ? "excellent"
                : businessStats.averageRating >= 4.0
                ? "good"
                : "needs_improvement";

        return {
            responseRate: {
                value: businessStats.responseRate,
                status: responseRateStatus,
                color:
                    responseRateStatus === "excellent"
                        ? "success"
                        : responseRateStatus === "good"
                        ? "warning"
                        : "danger",
            },
            rating: {
                value: businessStats.averageRating,
                status: ratingStatus,
                color:
                    ratingStatus === "excellent"
                        ? "success"
                        : ratingStatus === "good"
                        ? "warning"
                        : "danger",
            },
        };
    };

    const todaysEarnings = getTodaysEarnings();
    const unreadNotifications = notifications.filter((n) => !n.read).length;
    const highPriorityNotifications = notifications.filter(
        (n) => !n.read && n.priority === "high"
    ).length;
    const performanceIndicators = getPerformanceIndicators();

    return (
        <div className="provider-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="provider"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="provider-navbar"
            />

            {/* Main Layout Container */}
            <div className="d-flex">
                {/* Universal Sidebar */}
                <DashboardSidebar
                    role="provider"
                    collapsed={sidebarCollapsed}
                    onMenuItemClick={handleMenuItemClick}
                    className={`provider-sidebar ${
                        isMobile && !sidebarCollapsed ? "mobile-overlay" : ""
                    }`}
                />

                {/* Mobile Sidebar Backdrop */}
                {isMobile && !sidebarCollapsed && (
                    <div
                        className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-block d-lg-none"
                        style={{
                            top: "60px",
                            left: 0,
                            zIndex: 1020,
                        }}
                        onClick={handleToggleSidebar}
                    ></div>
                )}

                {/* Main Content Area */}
                <div
                    className="main-content flex-grow-1"
                    style={{
                        marginLeft: isMobile
                            ? "0"
                            : sidebarCollapsed
                            ? "70px"
                            : "280px",
                        marginTop: "60px",
                        transition: "margin-left 0.3s ease",
                        minHeight: "calc(100vh - 60px)",
                        backgroundColor: "#f8f9fa",
                    }}
                >
                    <div className="content-container p-4">
                        {/* Breadcrumb Navigation */}
                        <nav aria-label="breadcrumb" className="mb-4">
                            <ol className="breadcrumb bg-white px-3 py-2 rounded shadow-sm">
                                {generateBreadcrumbs().map((crumb, index) => (
                                    <li
                                        key={index}
                                        className={`breadcrumb-item ${
                                            crumb.active ? "active" : ""
                                        }`}
                                    >
                                        {crumb.active ? (
                                            <span className="text-muted">
                                                {crumb.title}
                                            </span>
                                        ) : (
                                            <Link
                                                to={crumb.path}
                                                className="text-decoration-none text-orange"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Business Performance Banner (Only on Dashboard) */}
                        {location.pathname === "/provider/dashboard" && (
                            <div className="business-banner bg-gradient-orange text-white rounded-4 p-4 mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Good{" "}
                                            {new Date().getHours() < 12
                                                ? "Morning"
                                                : new Date().getHours() < 17
                                                ? "Afternoon"
                                                : "Evening"}
                                            , {user?.first_name}! 💼
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            {businessStats.todaysAppointments >
                                            0
                                                ? `You have ${
                                                      businessStats.todaysAppointments
                                                  } appointment${
                                                      businessStats.todaysAppointments >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } today. Expected earnings: Rs. ${todaysEarnings.toLocaleString()}`
                                                : businessStats.pendingRequests >
                                                  0
                                                ? `You have ${
                                                      businessStats.pendingRequests
                                                  } new service request${
                                                      businessStats.pendingRequests >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } waiting for your response!`
                                                : "Ready to grow your business? Check your service requests and update your availability."}
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                to="/provider/requests"
                                                className="btn btn-light btn-lg"
                                            >
                                                <i className="fas fa-bell me-2"></i>
                                                View Requests (
                                                {businessStats.pendingRequests})
                                            </Link>
                                            <Link
                                                to="/provider/schedule"
                                                className="btn btn-outline-light"
                                            >
                                                <i className="fas fa-calendar me-2"></i>
                                                Update Schedule
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-chart-line fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Stats (Only on Dashboard) */}
                        {location.pathname === "/provider/dashboard" && (
                            <div className="row mb-4">
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-success mb-2">
                                                <i className="fas fa-dollar-sign fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                Rs.{" "}
                                                {businessStats.monthlyEarnings.toLocaleString()}
                                            </h4>
                                            <small className="text-muted">
                                                This Month's Earnings
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-orange mb-2">
                                                <i className="fas fa-calendar-day fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {
                                                    businessStats.todaysAppointments
                                                }
                                            </h4>
                                            <small className="text-muted">
                                                Today's Appointments
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-warning mb-2">
                                                <i className="fas fa-bell fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {businessStats.pendingRequests}
                                            </h4>
                                            <small className="text-muted">
                                                Pending Requests
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-info mb-2">
                                                <i className="fas fa-star fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {businessStats.averageRating}
                                            </h4>
                                            <small className="text-muted">
                                                Average Rating
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Alerts */}
                        {businessAlerts.length > 0 && (
                            <div className="business-alerts mb-4">
                                {businessAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`alert ${
                                            alert.type === "opportunity"
                                                ? "alert-success"
                                                : alert.type === "verification"
                                                ? "alert-warning"
                                                : "alert-info"
                                        } alert-dismissible fade show mb-2`}
                                        role="alert"
                                    >
                                        <div className="d-flex align-items-center justify-content-between">
                                            <div className="d-flex align-items-center">
                                                <i
                                                    className={`fas ${
                                                        alert.type ===
                                                        "opportunity"
                                                            ? "fa-chart-line"
                                                            : alert.type ===
                                                              "verification"
                                                            ? "fa-shield-alt"
                                                            : "fa-info-circle"
                                                    } me-3`}
                                                ></i>
                                                <div>
                                                    <strong>
                                                        {alert.title}:
                                                    </strong>{" "}
                                                    {alert.message}
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Link
                                                    to={alert.actionUrl}
                                                    className={`btn btn-sm ${
                                                        alert.type ===
                                                        "opportunity"
                                                            ? "btn-success"
                                                            : alert.type ===
                                                              "verification"
                                                            ? "btn-warning"
                                                            : "btn-info"
                                                    }`}
                                                >
                                                    {alert.action}
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="btn-close"
                                                    onClick={() =>
                                                        dismissBusinessAlert(
                                                            alert.id
                                                        )
                                                    }
                                                ></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* High Priority Notifications */}
                        {highPriorityNotifications > 0 && (
                            <div
                                className="alert alert-danger border-0 shadow-sm mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-exclamation-circle me-3 fa-lg"></i>
                                        <div>
                                            <strong>Urgent:</strong>{" "}
                                            {highPriorityNotifications} high
                                            priority notification
                                            {highPriorityNotifications > 1
                                                ? "s"
                                                : ""}{" "}
                                            need immediate attention!
                                            <br />
                                            <small className="text-muted">
                                                {
                                                    notifications.find(
                                                        (n) =>
                                                            !n.read &&
                                                            n.priority ===
                                                                "high"
                                                    )?.message
                                                }
                                            </small>
                                        </div>
                                    </div>
                                    <Link
                                        to="/provider/requests"
                                        className="btn btn-danger btn-sm"
                                    >
                                        Take Action
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Performance Summary */}
                        {location.pathname === "/provider/dashboard" && (
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="mb-0">
                                                <i className="fas fa-chart-bar text-orange me-2"></i>
                                                Performance Indicators
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span>Response Rate:</span>
                                                <span
                                                    className={`badge bg-${performanceIndicators.responseRate.color}`}
                                                >
                                                    {
                                                        performanceIndicators
                                                            .responseRate.value
                                                    }
                                                    %
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span>Average Rating:</span>
                                                <span
                                                    className={`badge bg-${performanceIndicators.rating.color}`}
                                                >
                                                    ⭐{" "}
                                                    {
                                                        performanceIndicators
                                                            .rating.value
                                                    }
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>Completed Jobs:</span>
                                                <span className="badge bg-info">
                                                    {
                                                        businessStats.completedJobs
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-white border-bottom">
                                            <h6 className="mb-0">
                                                <i className="fas fa-lightbulb text-warning me-2"></i>
                                                Business Tips
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <div className="tip-item mb-2">
                                                <i className="fas fa-clock text-success me-2"></i>
                                                <small>
                                                    Respond to requests within 2
                                                    hours for better ranking
                                                </small>
                                            </div>
                                            <div className="tip-item mb-2">
                                                <i className="fas fa-star text-warning me-2"></i>
                                                <small>
                                                    Maintain high service
                                                    quality for 5-star reviews
                                                </small>
                                            </div>
                                            <div className="tip-item">
                                                <i className="fas fa-calendar text-info me-2"></i>
                                                <small>
                                                    Keep your availability
                                                    calendar updated daily
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Display */}
                        {notifications.length > 0 && (
                            <div className="notifications-container mb-4">
                                {notifications
                                    .slice(0, 2)
                                    .map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`alert ${
                                                notification.type === "request"
                                                    ? "alert-primary"
                                                    : notification.type ===
                                                      "payment"
                                                    ? "alert-success"
                                                    : notification.type ===
                                                      "review"
                                                    ? "alert-warning"
                                                    : "alert-secondary"
                                            } alert-dismissible fade show mb-2`}
                                            role="alert"
                                        >
                                            <div className="d-flex align-items-center">
                                                <i
                                                    className={`fas ${
                                                        notification.type ===
                                                        "request"
                                                            ? "fa-hand-paper"
                                                            : notification.type ===
                                                              "payment"
                                                            ? "fa-dollar-sign"
                                                            : notification.type ===
                                                              "review"
                                                            ? "fa-star"
                                                            : "fa-info-circle"
                                                    } me-3`}
                                                ></i>
                                                <div className="flex-grow-1">
                                                    <strong>
                                                        {notification.title}:
                                                    </strong>{" "}
                                                    {notification.message}
                                                    <br />
                                                    <small className="text-muted">
                                                        {notification.time}
                                                    </small>
                                                </div>
                                                {notification.priority ===
                                                    "high" && (
                                                    <span className="badge bg-danger me-2">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() =>
                                                    removeNotification(
                                                        notification.id
                                                    )
                                                }
                                            ></button>
                                        </div>
                                    ))}
                            </div>
                        )}

                        {/* Main Page Content */}
                        <div className="page-content">{children}</div>

                        {/* Provider Footer */}
                        <footer className="content-footer mt-5 pt-4 border-top">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-briefcase me-1 text-orange"></i>
                                        HireMe Business Portal
                                        <span className="mx-2">|</span>
                                        {user?.full_name}
                                    </small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small className="text-muted">
                                        Business since:{" "}
                                        {user?.created_at
                                            ? new Date(
                                                  user.created_at
                                              ).getFullYear()
                                            : "N/A"}
                                        <span className="mx-2">|</span>
                                        <span className="text-orange">
                                            <i className="fas fa-award me-1"></i>
                                            {performanceIndicators.rating
                                                .status === "excellent"
                                                ? "Top Rated Provider"
                                                : performanceIndicators.rating
                                                      .status === "good"
                                                ? "Verified Provider"
                                                : "Growing Business"}
                                        </span>
                                    </small>
                                </div>
                            </div>

                            {/* Business Stats Row */}
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-4">
                                            <small className="text-muted">
                                                <i className="fas fa-dollar-sign me-1"></i>
                                                Total Earnings: Rs.{" "}
                                                {businessStats.totalEarnings.toLocaleString()}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-handshake me-1"></i>
                                                {businessStats.completedJobs}{" "}
                                                Jobs Completed
                                            </small>
                                        </div>
                                        <small className="text-muted">
                                            <i className="fas fa-clock me-1"></i>
                                            {new Date().toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>

            {/* Custom Styles for Provider Layout */}
            <style jsx>{`
                .provider-dashboard-layout {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }

                .main-content {
                    transition: margin-left 0.3s ease;
                }

                .content-container {
                    max-width: 100%;
                }

                .alert {
                    border: none;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .breadcrumb {
                    background-color: white;
                    margin-bottom: 0;
                }

                .breadcrumb-item + .breadcrumb-item::before {
                    color: #fd7e14;
                }

                .content-footer {
                    background-color: white;
                    margin: 0 -1.5rem -1.5rem -1.5rem;
                    padding: 1.5rem;
                    border-radius: 0.5rem 0.5rem 0 0;
                }

                /* Orange theme colors */
                .text-orange {
                    color: #fd7e14 !important;
                }

                .border-orange {
                    border-color: #fd7e14 !important;
                }

                .btn-outline-orange {
                    color: #fd7e14;
                    border-color: #fd7e14;
                }

                .btn-outline-orange:hover {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .bg-gradient-orange {
                    background: linear-gradient(
                        135deg,
                        #fd7e14 0%,
                        #e55100 100%
                    );
                }

                .alert-light.border-orange {
                    background-color: #fff3e0;
                }

                /* Business banner styling */
                .business-banner {
                    box-shadow: 0 4px 6px rgba(253, 126, 20, 0.1);
                }

                /* Card hover effects */
                .card:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease;
                }

                /* Performance indicators */
                .badge.bg-success {
                    background-color: #198754 !important;
                }

                .badge.bg-warning {
                    background-color: #ffc107 !important;
                    color: #000;
                }

                .badge.bg-danger {
                    background-color: #dc3545 !important;
                }

                /* Business tips styling */
                .tip-item {
                    padding: 0.25rem 0;
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

                /* Priority badges */
                .badge.bg-danger {
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0 !important;
                    }

                    .provider-sidebar.mobile-overlay {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        z-index: 1025;
                        height: calc(100vh - 60px);
                    }

                    .business-banner h3 {
                        font-size: 1.5rem;
                    }

                    .business-banner .btn {
                        margin-bottom: 0.5rem;
                    }
                }

                /* Enhanced animations */
                .alert {
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Business alerts styling */
                .business-alerts .alert {
                    border-left: 4px solid;
                }

                .business-alerts .alert-success {
                    border-left-color: #198754;
                }

                .business-alerts .alert-warning {
                    border-left-color: #ffc107;
                }

                .business-alerts .alert-info {
                    border-left-color: #0dcaf0;
                }

                /* Notification priority styling */
                .notifications-container .alert-primary {
                    background-color: #e3f2fd;
                    border-left: 4px solid #2196f3;
                }

                .notifications-container .alert-success {
                    background-color: #e8f5e9;
                    border-left: 4px solid #4caf50;
                }

                .notifications-container .alert-warning {
                    background-color: #fff8e1;
                    border-left: 4px solid #ff9800;
                }

                /* Stats cards on dashboard */
                .card-body .fa-2x {
                    font-size: 1.8rem;
                }

                /* Footer business stats */
                .content-footer .row:last-child {
                    border-top: 1px solid #dee2e6;
                    padding-top: 1rem;
                    margin-top: 1rem;
                }

                /* Performance indicator cards */
                .card-header {
                    background-color: #f8f9fa !important;
                }

                /* Responsive text sizing */
                @media (max-width: 576px) {
                    .stats-card h4 {
                        font-size: 1.2rem;
                    }

                    .content-footer .d-flex {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }

                /* Provider specific color overrides */
                .text-primary {
                    color: #fd7e14 !important;
                }

                .btn-primary {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                }

                .btn-primary:hover {
                    background-color: #e55100;
                    border-color: #e55100;
                }

                .btn-outline-primary {
                    color: #fd7e14;
                    border-color: #fd7e14;
                }

                .btn-outline-primary:hover {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                }
            `}</style>
        </div>
    );
};

export default ProviderLayout;
