import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../navigation/shared/DashboardNavbar";
import DashboardSidebar from "../navigation/shared/DashboardSidebar";

const ClientLayout = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Check for mobile screen
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Client-specific state
    const [notifications, setNotifications] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [favoriteProviders, setFavoriteProviders] = useState([]);
    const [clientStats, setClientStats] = useState({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        favoriteProviders: 0,
        unreadMessages: 0,
    });

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

    // Load client data
    useEffect(() => {
        loadClientData();
    }, []);

    // Load client-specific data
    const loadClientData = useCallback(async () => {
        try {
            // Mock data - replace with actual API calls
            setClientStats({
                totalAppointments: 12,
                upcomingAppointments: 3,
                completedAppointments: 8,
                favoriteProviders: 5,
                unreadMessages: 2,
            });

            setUpcomingAppointments([
                {
                    id: 1,
                    service: "House Cleaning",
                    provider: "Maria Rodriguez",
                    date: "2025-07-15",
                    time: "10:00 AM",
                    status: "confirmed",
                },
                {
                    id: 2,
                    service: "Plumbing Repair",
                    provider: "John Smith",
                    date: "2025-07-16",
                    time: "2:00 PM",
                    status: "pending",
                },
            ]);

            setNotifications([
                {
                    id: 1,
                    type: "booking",
                    title: "Booking Confirmed",
                    message: "Your house cleaning appointment is confirmed",
                    time: "10 minutes ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "message",
                    title: "New Message",
                    message: "Your service provider sent you a message",
                    time: "1 hour ago",
                    read: false,
                },
            ]);
        } catch (error) {
            console.error("Failed to load client data:", error);
        }
    }, []);

    // Sidebar toggle handler
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Search handler with client-specific functionality
    const handleSearch = (query) => {
        if (query.trim()) {
            // Clients can search for services, providers, categories
            navigate(`/client/search?q=${encodeURIComponent(query)}`);

            // Add notification for search
            addNotification(`Searching for: ${query}`, "info");
        }
    };

    // Menu item click handler with client-specific tracking
    const handleMenuItemClick = (item) => {
        console.log("Client menu clicked:", item);

        // Add client-specific menu click handling
        if (item.id === "services") {
            console.log("Browsing services");
        } else if (item.id === "appointments") {
            console.log("Viewing appointments");
        } else if (item.id === "bookings") {
            console.log("New booking started");
            addNotification("Ready to book a service!", "info");
        }

        // Close sidebar on mobile after clicking
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Add notification helper
    const addNotification = (message, type = "info") => {
        const newNotification = {
            id: Date.now(),
            type: type,
            title: type.charAt(0).toUpperCase() + type.slice(1),
            message: message,
            time: "Just now",
            read: false,
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 5000);
    };

    // Remove notification
    const removeNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        // Remove 'client' from path segments for cleaner breadcrumbs
        const clientIndex = pathSegments.indexOf("client");
        if (clientIndex > -1) {
            pathSegments.splice(clientIndex, 1);
        }

        // Add Home breadcrumb
        breadcrumbs.push({
            title: "My Dashboard",
            path: "/client/dashboard",
            active: pathSegments.length === 0,
        });

        // Generate breadcrumbs from path
        let currentPath = "/client";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Convert segment to readable title
            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            // Client-specific title mappings
            const titleMappings = {
                dashboard: "Dashboard",
                services: "Browse Services",
                appointments: "My Appointments",
                bookings: "Book Service",
                book: "Book Service",
                messages: "Messages",
                payments: "Payments & Billing",
                reviews: "Reviews & Ratings",
                profile: "My Profile",
                favorites: "Favorite Providers",
                history: "Payment History",
                methods: "Payment Methods",
                invoices: "Invoices",
                support: "Help & Support",
                categories: "Service Categories",
                upcoming: "Upcoming Appointments",
                past: "Past Appointments",
                cancelled: "Cancelled Appointments",
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

    // Get upcoming appointment summary
    const getUpcomingAppointmentSummary = () => {
        const today = new Date();
        const todayAppointments = upcomingAppointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            return aptDate.toDateString() === today.toDateString();
        });

        const thisWeekAppointments = upcomingAppointments.filter((apt) => {
            const aptDate = new Date(apt.date);
            const weekFromNow = new Date();
            weekFromNow.setDate(today.getDate() + 7);
            return aptDate >= today && aptDate <= weekFromNow;
        });

        return {
            today: todayAppointments.length,
            thisWeek: thisWeekAppointments.length,
            total: upcomingAppointments.length,
        };
    };

    const appointmentSummary = getUpcomingAppointmentSummary();
    const unreadNotifications = notifications.filter((n) => !n.read).length;

    return (
        <div className="client-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="client"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="client-navbar"
            />

            {/* Main Layout Container */}
            <div className="d-flex">
                {/* Universal Sidebar */}
                <DashboardSidebar
                    role="client"
                    collapsed={sidebarCollapsed}
                    onMenuItemClick={handleMenuItemClick}
                    className={`client-sidebar ${
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
                                                className="text-decoration-none text-purple"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Welcome Banner (Only on Dashboard) */}
                        {location.pathname === "/client/dashboard" && (
                            <div className="welcome-banner bg-gradient-purple text-white rounded-4 p-4 mb-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Welcome back, {user?.first_name}! 👋
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            {appointmentSummary.today > 0
                                                ? `You have ${
                                                      appointmentSummary.today
                                                  } appointment${
                                                      appointmentSummary.today >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } today.`
                                                : appointmentSummary.thisWeek >
                                                  0
                                                ? `You have ${
                                                      appointmentSummary.thisWeek
                                                  } appointment${
                                                      appointmentSummary.thisWeek >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } this week.`
                                                : "Ready to book your next service?"}
                                        </p>
                                        <Link
                                            to="/client/services"
                                            className="btn btn-light btn-lg"
                                        >
                                            <i className="fas fa-search me-2"></i>
                                            Browse Services
                                        </Link>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-calendar-check fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats (Only on Dashboard) */}
                        {location.pathname === "/client/dashboard" && (
                            <div className="row mb-4">
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-purple mb-2">
                                                <i className="fas fa-calendar-alt fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {
                                                    clientStats.upcomingAppointments
                                                }
                                            </h4>
                                            <small className="text-muted">
                                                Upcoming Appointments
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-success mb-2">
                                                <i className="fas fa-check-circle fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {
                                                    clientStats.completedAppointments
                                                }
                                            </h4>
                                            <small className="text-muted">
                                                Completed Services
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-danger mb-2">
                                                <i className="fas fa-heart fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {clientStats.favoriteProviders}
                                            </h4>
                                            <small className="text-muted">
                                                Favorite Providers
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-sm-6 mb-3">
                                    <div className="card border-0 shadow-sm h-100">
                                        <div className="card-body text-center">
                                            <div className="text-info mb-2">
                                                <i className="fas fa-envelope fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {clientStats.unreadMessages}
                                            </h4>
                                            <small className="text-muted">
                                                Unread Messages
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notification Summary */}
                        {unreadNotifications > 0 && (
                            <div
                                className="alert alert-light border-start border-purple border-4 mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-bell text-purple me-3"></i>
                                        <div>
                                            <strong>
                                                You have {unreadNotifications}{" "}
                                                new notification
                                                {unreadNotifications > 1
                                                    ? "s"
                                                    : ""}
                                                !
                                            </strong>
                                            <br />
                                            <small className="text-muted">
                                                {notifications.find(
                                                    (n) => !n.read
                                                )?.message ||
                                                    "Check your notifications for updates"}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <Link
                                            to="/client/messages"
                                            className="btn btn-outline-purple btn-sm"
                                        >
                                            View All
                                        </Link>
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => {
                                                setNotifications((prev) =>
                                                    prev.map((n) => ({
                                                        ...n,
                                                        read: true,
                                                    }))
                                                );
                                            }}
                                        >
                                            Mark All Read
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upcoming Appointments Alert */}
                        {appointmentSummary.today > 0 && (
                            <div
                                className="alert alert-warning border-0 shadow-sm mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-calendar-day me-3 fa-lg"></i>
                                    <div className="flex-grow-1">
                                        <strong>Today's Appointments:</strong>{" "}
                                        You have {appointmentSummary.today}{" "}
                                        appointment
                                        {appointmentSummary.today > 1
                                            ? "s"
                                            : ""}{" "}
                                        scheduled for today.
                                        <br />
                                        <small className="text-muted">
                                            Make sure you're prepared and
                                            available at the scheduled times.
                                        </small>
                                    </div>
                                    <Link
                                        to="/client/appointments/upcoming"
                                        className="btn btn-warning btn-sm"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Notifications Display */}
                        {notifications.length > 0 && (
                            <div className="notifications-container mb-4">
                                {notifications
                                    .slice(0, 3)
                                    .map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`alert ${
                                                notification.type === "booking"
                                                    ? "alert-success"
                                                    : notification.type ===
                                                      "message"
                                                    ? "alert-info"
                                                    : notification.type ===
                                                      "warning"
                                                    ? "alert-warning"
                                                    : "alert-secondary"
                                            } alert-dismissible fade show mb-2`}
                                            role="alert"
                                        >
                                            <div className="d-flex align-items-center">
                                                <i
                                                    className={`fas ${
                                                        notification.type ===
                                                        "booking"
                                                            ? "fa-calendar-check"
                                                            : notification.type ===
                                                              "message"
                                                            ? "fa-envelope"
                                                            : notification.type ===
                                                              "warning"
                                                            ? "fa-exclamation-triangle"
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

                        {/* Client Footer */}
                        <footer className="content-footer mt-5 pt-4 border-top">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-user-circle me-1 text-purple"></i>
                                        HireMe Client Portal
                                        <span className="mx-2">|</span>
                                        {user?.full_name}
                                    </small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small className="text-muted">
                                        Member since:{" "}
                                        {user?.created_at
                                            ? new Date(
                                                  user.created_at
                                              ).getFullYear()
                                            : "N/A"}
                                        <span className="mx-2">|</span>
                                        <span className="text-purple">
                                            <i className="fas fa-star me-1"></i>
                                            Valued Customer
                                        </span>
                                    </small>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="d-flex justify-content-center gap-4">
                                        <Link
                                            to="/client/support"
                                            className="text-muted text-decoration-none small"
                                        >
                                            <i className="fas fa-question-circle me-1"></i>
                                            Help Center
                                        </Link>
                                        <Link
                                            to="/client/payments/methods"
                                            className="text-muted text-decoration-none small"
                                        >
                                            <i className="fas fa-credit-card me-1"></i>
                                            Payment Methods
                                        </Link>
                                        <Link
                                            to="/client/profile"
                                            className="text-muted text-decoration-none small"
                                        >
                                            <i className="fas fa-user-cog me-1"></i>
                                            Account Settings
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>

            {/* Custom Styles for Client Layout */}
            <style jsx>{`
                .client-dashboard-layout {
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
                    color: #6f42c1;
                }

                .content-footer {
                    background-color: white;
                    margin: 0 -1.5rem -1.5rem -1.5rem;
                    padding: 1.5rem;
                    border-radius: 0.5rem 0.5rem 0 0;
                }

                /* Purple theme colors */
                .text-purple {
                    color: #6f42c1 !important;
                }

                .border-purple {
                    border-color: #6f42c1 !important;
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

                .bg-gradient-purple {
                    background: linear-gradient(
                        135deg,
                        #6f42c1 0%,
                        #5a2d91 100%
                    );
                }

                .alert-light.border-purple {
                    background-color: #f3e5f5;
                }

                /* Card hover effects */
                .card:hover {
                    transform: translateY(-2px);
                    transition: transform 0.2s ease;
                }

                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0 !important;
                    }

                    .client-sidebar.mobile-overlay {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        z-index: 1025;
                        height: calc(100vh - 60px);
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

                /* Welcome banner styling */
                .welcome-banner {
                    box-shadow: 0 4px 6px rgba(111, 66, 193, 0.1);
                }

                .notifications-container {
                    position: relative;
                    z-index: 1010;
                }
            `}</style>
        </div>
    );
};

export default ClientLayout;
