// resources/js/components/layouts/AdminLayout.jsx
// New Admin Layout using Universal Navigation Components

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdmin } from "../../context/AdminContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../navigation/shared/DashboardNavbar";
import DashboardSidebar from "../navigation/shared/DashboardSidebar";

const AdminLayout = ({ children }) => {
    const { user } = useAuth();
    const {
        successMessage,
        errors,
        clearSuccessMessage,
        clearErrors,
        dashboardStats,
        dashboardLoading,
    } = useAdmin();
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

    // Clear messages when route changes (keep your existing logic)
    useEffect(() => {
        clearSuccessMessage();
        clearErrors();
    }, [location.pathname]);

    // Sidebar toggle handler
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Search handler with admin-specific functionality
    const handleSearch = (query) => {
        if (query.trim()) {
            // Admin can search across users, staff, reports, settings
            navigate(`/admin/search?q=${encodeURIComponent(query)}`);

            // Optional: Add to recent searches or analytics
            console.log("Admin search:", query);
        }
    };

    // Menu item click handler with admin-specific tracking
    const handleMenuItemClick = (item) => {
        // console.log("Admin menu clicked:", item);

        // Add admin-specific menu click handling
        // if (item.id === "users") {
        //     // Track user management access
        //     console.log("Accessing User Management");
        // } else if (item.id === "staff") {
        //     // Track staff management access
        //     console.log("Accessing Staff Management");
        // } else if (item.id === "reports") {
        //     // Track reports access
        //     console.log("Accessing Reports");
        // }

        // Close sidebar on mobile after clicking
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Generate breadcrumbs from current path (keep your existing logic)
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        // Remove 'admin' from path segments for cleaner breadcrumbs
        const adminIndex = pathSegments.indexOf("admin");
        if (adminIndex > -1) {
            pathSegments.splice(adminIndex, 1);
        }

        // Add Home breadcrumb
        breadcrumbs.push({
            title: "Admin Dashboard",
            path: "/admin/dashboard",
            active: pathSegments.length === 0,
        });

        // Generate breadcrumbs from path
        let currentPath = "/admin";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            // Convert segment to readable title
            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            // Admin-specific title mappings
            const titleMappings = {
                dashboard: "Dashboard",
                users: "User Management",
                staff: "Staff Management",
                reports: "Reports & Analytics",
                settings: "System Settings",
                overview: "Overview",
                activities: "Activity Reports",
                create: "Create New",
                edit: "Edit",
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

    // Get system health status for admin
    const getSystemHealthStatus = () => {
        // This could come from your AdminContext or a separate health check
        return {
            status: "healthy", // 'healthy', 'warning', 'error'
            uptime: "99.9%",
            activeUsers: dashboardStats?.users?.overview?.active || 0,
            systemLoad: "Normal",
        };
    };

    const systemHealth = getSystemHealthStatus();

    // Get notification counts
    const getNotificationCounts = () => {
        const errorCount = Object.keys(errors).length;
        const warningCount = systemHealth.status === "warning" ? 1 : 0;

        return {
            total: errorCount + warningCount + (successMessage ? 1 : 0),
            errors: errorCount,
            warnings: warningCount,
            success: successMessage ? 1 : 0,
        };
    };

    const notificationCounts = getNotificationCounts();

    return (
        <div className="admin-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="admin"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="admin-navbar"
            />

            {/* Main Layout Container */}
            <div className="d-flex">
                {/* Universal Sidebar */}
                <DashboardSidebar
                    role="admin"
                    collapsed={sidebarCollapsed}
                    onMenuItemClick={handleMenuItemClick}
                    className={`admin-sidebar ${
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
                                                className="text-decoration-none text-primary"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* System Health Banner (Admin Only) */}
                        {systemHealth.status !== "healthy" && (
                            <div
                                className={`alert ${
                                    systemHealth.status === "warning"
                                        ? "alert-warning"
                                        : "alert-danger"
                                } alert-dismissible fade show mb-4`}
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i
                                        className={`fas ${
                                            systemHealth.status === "warning"
                                                ? "fa-exclamation-triangle"
                                                : "fa-exclamation-circle"
                                        } me-3 fa-lg`}
                                    ></i>
                                    <div className="flex-grow-1">
                                        <strong>System Health Alert:</strong>{" "}
                                        System requires attention.
                                        <br />
                                        <small className="text-muted">
                                            Status: {systemHealth.status} |
                                            Load: {systemHealth.systemLoad} |
                                            Active Users:{" "}
                                            {systemHealth.activeUsers}
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                ></button>
                            </div>
                        )}

                        {/* Admin Notification Summary */}
                        {notificationCounts.total > 0 &&
                            location.pathname === "/admin/dashboard" && (
                                <div
                                    className="alert alert-light border-start border-primary border-4 mb-4"
                                    role="alert"
                                >
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-tachometer-alt text-primary me-3"></i>
                                            <div>
                                                <strong>System Status:</strong>{" "}
                                                {notificationCounts.total} items
                                                need attention
                                                <br />
                                                <small className="text-muted">
                                                    {notificationCounts.errors >
                                                        0 &&
                                                        `${notificationCounts.errors} errors`}
                                                    {notificationCounts.errors >
                                                        0 &&
                                                        notificationCounts.warnings >
                                                            0 &&
                                                        ", "}
                                                    {notificationCounts.warnings >
                                                        0 &&
                                                        `${notificationCounts.warnings} warnings`}
                                                    {notificationCounts.success >
                                                        0 &&
                                                        `, ${notificationCounts.success} completed actions`}
                                                </small>
                                            </div>
                                        </div>
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-primary">
                                                {systemHealth.uptime} uptime
                                            </span>
                                            <button
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => {
                                                    clearSuccessMessage();
                                                    clearErrors();
                                                }}
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        {/* Loading Indicator */}
                        {dashboardLoading && (
                            <div
                                className="alert alert-info border-0 shadow-sm mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <div
                                        className="spinner-border spinner-border-sm text-primary me-3"
                                        role="status"
                                    >
                                        <span className="visually-hidden">
                                            Loading...
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Loading admin data...</strong>
                                        <br />
                                        <small className="text-muted">
                                            Fetching system information and
                                            analytics
                                        </small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Success Message (Keep your existing logic) */}
                        {successMessage && (
                            <div
                                className="alert alert-success alert-dismissible fade show mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-check-circle me-3"></i>
                                    <div className="flex-grow-1">
                                        {successMessage}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={clearSuccessMessage}
                                ></button>
                            </div>
                        )}

                        {/* Error Messages (Keep your existing logic) */}
                        {Object.keys(errors).length > 0 && (
                            <div
                                className="alert alert-danger alert-dismissible fade show mb-4"
                                role="alert"
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-circle me-3 fa-lg"></i>
                                    <div className="flex-grow-1">
                                        <strong>System Errors:</strong>
                                        <div className="mt-2">
                                            {Object.entries(errors).map(
                                                ([key, error]) => (
                                                    <div
                                                        key={key}
                                                        className="mb-1"
                                                    >
                                                        <span className="badge bg-white text-danger me-2">
                                                            {key}
                                                        </span>
                                                        {typeof error ===
                                                        "string"
                                                            ? error
                                                            : JSON.stringify(
                                                                  error
                                                              )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            Check system logs for detailed
                                            information or contact technical
                                            support.
                                        </small>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={clearErrors}
                                ></button>
                            </div>
                        )}

                        {/* Main Page Content */}
                        <div className="page-content">{children}</div>

                        {/* Admin Footer with System Info */}
                        <footer className="content-footer mt-5 pt-4 border-top">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-crown me-1 text-primary"></i>
                                        HireMe Admin Panel v1.0
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
                                            System Online ({systemHealth.uptime}
                                            )
                                        </span>
                                        <span className="mx-2">|</span>
                                        <span className="text-info">
                                            {systemHealth.activeUsers} active
                                            users
                                        </span>
                                    </small>
                                </div>
                            </div>

                            {/* System Stats Row */}
                            <div className="row mt-2">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            <i className="fas fa-server me-1"></i>
                                            Load: {systemHealth.systemLoad}
                                        </small>
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

            {/* Custom Styles for Admin Layout */}
            <style jsx>{`
                .admin-dashboard-layout {
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
                    color: #007bff;
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

                    .admin-sidebar.mobile-overlay {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        z-index: 1025;
                        height: calc(100vh - 60px);
                    }
                }

                /* Admin-specific styling */
                .alert-light.border-primary {
                    background-color: #e3f2fd;
                }

                .badge.bg-white.text-danger {
                    border: 1px solid #dc3545;
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

                /* Admin theme overrides */
                .text-primary {
                    color: #007bff !important;
                }

                .border-primary {
                    border-color: #007bff !important;
                }

                .bg-primary {
                    background-color: #007bff !important;
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
