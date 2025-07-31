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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Client-specific state
    const [clientStats, setClientStats] = useState({
        totalAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
        favoriteProviders: 0,
        unreadMessages: 0,
    });

    // Set role-specific body class
    useEffect(() => {
        document.body.className = "dashboard-client";
        return () => {
            document.body.className = "";
        };
    }, []);

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

    const loadClientData = useCallback(async () => {
        try {
            setClientStats({
                totalAppointments: 12,
                upcomingAppointments: 3,
                completedAppointments: 8,
                favoriteProviders: 5,
                unreadMessages: 2,
            });
        } catch (error) {
            console.error("Failed to load client data:", error);
        }
    }, []);

    // Handlers
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/client/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleMenuItemClick = (item) => {
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Generate breadcrumbs
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        const clientIndex = pathSegments.indexOf("client");
        if (clientIndex > -1) {
            pathSegments.splice(clientIndex, 1);
        }

        breadcrumbs.push({
            title: "My Dashboard",
            path: "/client/dashboard",
            active: pathSegments.length === 0,
        });

        let currentPath = "/client";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

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

    return (
        <div className="dashboard-layout client-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="client"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="client-navbar"
            />

            {/* Main Layout Container */}
            <div className="dashboard-container">
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
                    className="main-content"
                    style={{
                        marginLeft: isMobile
                            ? "0"
                            : sidebarCollapsed
                            ? "70px"
                            : "280px",
                        marginTop: "60px",
                    }}
                >
                    <div className="content-container">
                        {/* Enhanced Breadcrumb Navigation */}
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
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
                                                className="text-decoration-none"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Welcome Banner (Dashboard only) */}
                        {location.pathname === "/client/dashboard" && (
                            <div className="welcome-banner">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Welcome back, {user?.first_name}! 👋
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            {clientStats.upcomingAppointments >
                                            0
                                                ? `You have ${
                                                      clientStats.upcomingAppointments
                                                  } upcoming appointment${
                                                      clientStats.upcomingAppointments >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  }.`
                                                : "Ready to book your next service?"}
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                to="/client/services"
                                                className="btn btn-light btn-lg"
                                            >
                                                <i className="fas fa-search me-2"></i>
                                                Browse Services
                                            </Link>
                                            <Link
                                                to="/client/appointments"
                                                className="btn btn-outline-light"
                                            >
                                                <i className="fas fa-calendar me-2"></i>
                                                My Appointments
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-calendar-check fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats (Dashboard only) */}
                        {/* {location.pathname === "/client/dashboard" && (
                            <div className="dashboard-grid dashboard-grid-4 mb-4">
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {clientStats.upcomingAppointments}
                                    </div>
                                    <div className="stats-label">
                                        Upcoming Appointments
                                    </div>
                                    <div className="stats-change positive">
                                        <i className="fas fa-arrow-up"></i>
                                        12% from last month
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {clientStats.completedAppointments}
                                    </div>
                                    <div className="stats-label">
                                        Completed Services
                                    </div>
                                    <div className="stats-change positive">
                                        <i className="fas fa-check"></i>
                                        All time
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {clientStats.favoriteProviders}
                                    </div>
                                    <div className="stats-label">
                                        Favorite Providers
                                    </div>
                                    <div className="stats-change neutral">
                                        <i className="fas fa-heart"></i>
                                        Saved for quick booking
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {clientStats.unreadMessages}
                                    </div>
                                    <div className="stats-label">
                                        Unread Messages
                                    </div>
                                    <div className="stats-change neutral">
                                        <i className="fas fa-envelope"></i>
                                        Check your inbox
                                    </div>
                                </div>
                            </div>
                        )} */}

                        {/* Main Page Content */}
                        <div className="page-content">{children}</div>

                        {/* Enhanced Footer */}
                        <footer className="content-footer">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-user-circle me-1"></i>
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
                                        <span className="text-primary">
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
        </div>
    );
};

export default ClientLayout;
