import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useStaff } from "../../context/StaffContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../navigation/shared/DashboardNavbar";
import DashboardSidebar from "../navigation/shared/DashboardSidebar";

const StaffLayout = ({ children }) => {
    const { user } = useAuth();
    const {
        state,
        addNotification,
        removeNotification,
        clearErrors,
        clearSuccessMessage,
    } = useStaff();
    const location = useLocation();
    const navigate = useNavigate();

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Set role-specific body class
    useEffect(() => {
        document.body.className = "dashboard-staff";
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

    // Auto-dismiss notifications after timeout
    useEffect(() => {
        const timers = [];

        state.ui.notifications.forEach((notification) => {
            if (notification.duration && notification.duration > 0) {
                const timer = setTimeout(() => {
                    removeNotification(notification.id);
                }, notification.duration);
                timers.push(timer);
            }
        });

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [state.ui.notifications, removeNotification]);

    // Handlers
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/staff/search?q=${encodeURIComponent(query)}`);
            addNotification(`Searching for: ${query}`, "info", 3000);
        }
    };

    const handleMenuItemClick = (item) => {
        if (item.id === "categories") {
            addNotification("Accessing Service Categories", "info", 2000);
        }

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

        const staffIndex = pathSegments.indexOf("staff");
        if (staffIndex > -1) {
            pathSegments.splice(staffIndex, 1);
        }

        breadcrumbs.push({
            title: "Staff Dashboard",
            path: "/staff/dashboard",
            active: pathSegments.length === 0,
        });

        let currentPath = "/staff";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            const titleMappings = {
                categories: "Service Categories",
                create: "Create New",
                edit: "Edit",
                analytics: "Analytics",
                users: "User Management",
                services: "Services",
                appointments: "Appointments",
                reports: "Reports",
                activities: "Activity Log",
                support: "Customer Support",
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

    // Get notification counts
    const getNotificationCounts = () => {
        return {
            total: state.ui.notifications.length,
            errors: state.ui.notifications.filter((n) => n.type === "error")
                .length,
            success: state.ui.notifications.filter((n) => n.type === "success")
                .length,
            info: state.ui.notifications.filter((n) => n.type === "info")
                .length,
            warning: state.ui.notifications.filter((n) => n.type === "warning")
                .length,
        };
    };

    const notificationCounts = getNotificationCounts();

    return (
        <div className="dashboard-layout staff-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="staff"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="staff-navbar"
            />

            {/* Main Layout Container */}
            <div className="dashboard-container">
                {/* Universal Sidebar */}
                <DashboardSidebar
                    role="staff"
                    collapsed={sidebarCollapsed}
                    onMenuItemClick={handleMenuItemClick}
                    className={`staff-sidebar ${
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
                        {location.pathname === "/staff/dashboard" && (
                            <div className="welcome-banner">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Welcome back, {user?.first_name}! 👨‍💼
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            You have staff-level access to
                                            manage content and support
                                            customers.
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                to="/staff/categories"
                                                className="btn btn-light btn-lg"
                                            >
                                                <i className="fas fa-th-large me-2"></i>
                                                Manage Categories
                                            </Link>
                                            <Link
                                                to="/staff/support"
                                                className="btn btn-outline-light"
                                            >
                                                <i className="fas fa-headset me-2"></i>
                                                Customer Support
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-user-tie fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System Status Banner */}
                        {(state.dashboard.error || state.categories.error) && (
                            <div className="alert alert-warning alert-dismissible fade show">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-triangle me-3 fa-lg"></i>
                                    <div className="flex-grow-1">
                                        <strong>System Notice:</strong> Some
                                        features may be temporarily unavailable.
                                        <br />
                                        <small className="text-muted">
                                            {state.dashboard.error ||
                                                state.categories.error}
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        clearErrors();
                                    }}
                                ></button>
                            </div>
                        )}

                        {/* Notification Messages */}
                        <div className="notifications-container mb-4">
                            {/* Success Messages */}
                            {state.ui.notifications
                                .filter((n) => n.type === "success")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-success alert-dismissible fade show mb-2"
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-check-circle me-3"></i>
                                            <div className="flex-grow-1">
                                                {notification.message}
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

                            {/* Error Messages */}
                            {state.ui.notifications
                                .filter((n) => n.type === "error")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-danger alert-dismissible fade show mb-2"
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-exclamation-circle me-3"></i>
                                            <div className="flex-grow-1">
                                                <strong>Error:</strong>{" "}
                                                {notification.message}
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

                            {/* Warning Messages */}
                            {state.ui.notifications
                                .filter((n) => n.type === "warning")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-warning alert-dismissible fade show mb-2"
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-exclamation-triangle me-3"></i>
                                            <div className="flex-grow-1">
                                                <strong>Warning:</strong>{" "}
                                                {notification.message}
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

                            {/* Info Messages */}
                            {state.ui.notifications
                                .filter((n) => n.type === "info")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-info alert-dismissible fade show mb-2"
                                    >
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-info-circle me-3"></i>
                                            <div className="flex-grow-1">
                                                {notification.message}
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

                        {/* Loading Indicator */}
                        {(state.dashboard.loading ||
                            state.categories.loading) && (
                            <div className="alert alert-info border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <div className="spinner-border spinner-border-sm me-3">
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Loading data...</strong>
                                        <br />
                                        <small className="text-muted">
                                            {state.dashboard.loading &&
                                                "Dashboard data"}
                                            {state.dashboard.loading &&
                                                state.categories.loading &&
                                                " and "}
                                            {state.categories.loading &&
                                                "Category data"}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Stats Bar (Dashboard only) */}
                        {location.pathname === "/staff/dashboard" &&
                            notificationCounts.total > 0 && (
                                <div className="alert alert-light border-start border-4">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-bell me-3"></i>
                                            <div>
                                                <strong>
                                                    Active Notifications:
                                                </strong>{" "}
                                                {notificationCounts.total} items
                                                need attention
                                                <br />
                                                <small className="text-muted">
                                                    {notificationCounts.errors >
                                                        0 &&
                                                        `${notificationCounts.errors} errors`}
                                                    {notificationCounts.errors >
                                                        0 &&
                                                        notificationCounts.warning >
                                                            0 &&
                                                        ", "}
                                                    {notificationCounts.warning >
                                                        0 &&
                                                        `${notificationCounts.warning} warnings`}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    state.ui.notifications.forEach(
                                                        (n) =>
                                                            removeNotification(
                                                                n.id
                                                            )
                                                    );
                                                }}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* Main Page Content */}
                        <div className="page-content">{children}</div>

                        {/* Enhanced Footer */}
                        <footer className="content-footer">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-user-tie me-1"></i>
                                        HireMe Staff Panel v1.0
                                        <span className="mx-2">|</span>
                                        {user?.full_name}
                                    </small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small className="text-muted">
                                        Last login:{" "}
                                        {user?.last_login_human || "First time"}
                                        <span className="mx-2">|</span>
                                        <span className="text-success">
                                            <i
                                                className="fas fa-circle me-1"
                                                style={{ fontSize: "0.5rem" }}
                                            ></i>
                                            Online
                                        </span>
                                    </small>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffLayout;
