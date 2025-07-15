// resources/js/components/layouts/StaffLayout.jsx
// New Staff Layout using Universal Navigation Components

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

    // Check for mobile screen
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    // Sidebar toggle handler
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Search handler
    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/staff/search?q=${encodeURIComponent(query)}`);
            addNotification(`Searching for: ${query}`, "info", 3000);
        }
    };

    // Menu item click handler
    const handleMenuItemClick = (item) => {
        console.log("Staff menu clicked:", item);

        // Add any staff-specific menu click handling here
        if (item.id === "categories") {
            // Example: Track category section access
            addNotification("Accessing Service Categories", "info", 2000);
        }

        // Close sidebar on mobile after clicking
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Generate breadcrumbs from current path
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        // Remove 'staff' from path segments for cleaner breadcrumbs
        const staffIndex = pathSegments.indexOf("staff");
        if (staffIndex > -1) {
            pathSegments.splice(staffIndex, 1);
        }

        // Add Home breadcrumb
        breadcrumbs.push({
            title: "Staff Dashboard",
            path: "/staff/dashboard",
            active: pathSegments.length === 0,
        });

        // Generate breadcrumbs from path
        let currentPath = "/staff";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Convert segment to readable title
            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            // Special cases for better readability
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

    // Get notification count for different types
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
        <div className="staff-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="staff"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="staff-navbar"
            />

            {/* Main Layout Container */}
            <div className="d-flex">
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
                                                className="text-decoration-none text-success"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* System Status Banner */}
                        {(state.dashboard.error || state.categories.error) && (
                            <div
                                className="alert alert-warning alert-dismissible fade show mb-4"
                                role="alert"
                            >
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
                                        role="alert"
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
                                        role="alert"
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
                                        role="alert"
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
                                        role="alert"
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

                        {/* Dashboard Specific Errors */}
                        {state.dashboard.error && (
                            <div
                                className="alert alert-danger alert-dismissible fade show mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-circle me-3 fa-lg"></i>
                                    <div className="flex-grow-1">
                                        <strong>Dashboard Error:</strong>{" "}
                                        {state.dashboard.error}
                                        <br />
                                        <small className="text-muted">
                                            Try refreshing the page or contact
                                            support if the issue persists.
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => clearErrors()}
                                ></button>
                            </div>
                        )}

                        {/* Categories Specific Errors */}
                        {state.categories.error && (
                            <div
                                className="alert alert-danger alert-dismissible fade show mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-circle me-3 fa-lg"></i>
                                    <div className="flex-grow-1">
                                        <strong>Categories Error:</strong>{" "}
                                        {state.categories.error}
                                        <br />
                                        <small className="text-muted">
                                            Unable to load category data. Please
                                            try again.
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => clearErrors()}
                                ></button>
                            </div>
                        )}

                        {/* Loading Indicator */}
                        {(state.dashboard.loading ||
                            state.categories.loading) && (
                            <div
                                className="alert alert-info border-0 shadow-sm mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <div
                                        className="spinner-border spinner-border-sm text-success me-3"
                                        role="status"
                                    >
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

                        {/* Quick Stats Bar (Optional - only on dashboard) */}
                        {location.pathname === "/staff/dashboard" &&
                            notificationCounts.total > 0 && (
                                <div
                                    className="alert alert-light border-start border-success border-4 mb-4"
                                    role="alert"
                                >
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-bell text-success me-3"></i>
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
                                                className="btn btn-outline-success btn-sm"
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

                        {/* Footer Information */}
                        <footer className="content-footer mt-5 pt-4 border-top">
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

            {/* Custom Styles for Staff Layout */}
            <style jsx>{`
                .staff-dashboard-layout {
                    min-height: 100vh;
                    background-color: #f8f9fa;
                }

                .main-content {
                    transition: margin-left 0.3s ease;
                }

                .content-container {
                    max-width: 100%;
                }

                .notifications-container {
                    position: relative;
                    z-index: 1010;
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
                    color: #28a745;
                }

                .content-footer {
                    background-color: white;
                    margin: 0 -1.5rem -1.5rem -1.5rem;
                    padding: 1.5rem;
                    border-radius: 0.5rem 0.5rem 0 0;
                }

                @media (max-width: 768px) {
                    .main-content {
                        margin-left: 0 !important;
                    }

                    .staff-sidebar.mobile-overlay {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        z-index: 1025;
                        height: calc(100vh - 60px);
                    }
                }

                /* Smooth animations */
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

                /* Loading state improvements */
                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                /* Custom notification styling */
                .alert-dismissible .btn-close {
                    padding: 0.75rem 1rem;
                }
            `}</style>
        </div>
    );
};

export default StaffLayout;
