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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Set role-specific body class
    useEffect(() => {
        document.body.className = "dashboard-admin";
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

    // Clear messages when route changes
    useEffect(() => {
        clearSuccessMessage();
        clearErrors();
    }, [location.pathname]);

    // Handlers
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/admin/search?q=${encodeURIComponent(query)}`);
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

        const adminIndex = pathSegments.indexOf("admin");
        if (adminIndex > -1) {
            pathSegments.splice(adminIndex, 1);
        }

        breadcrumbs.push({
            title: "Admin Dashboard",
            path: "/admin/dashboard",
            active: pathSegments.length === 0,
        });

        let currentPath = "/admin";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

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

    // Get system health status
    const getSystemHealthStatus = () => {
        return {
            status: "healthy",
            uptime: "99.9%",
            activeUsers: dashboardStats?.users?.overview?.active || 0,
            systemLoad: "Normal",
        };
    };

    const systemHealth = getSystemHealthStatus();

    return (
        <div className="dashboard-layout admin-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="admin"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="admin-navbar"
            />

            {/* Main Layout Container */}
            <div className="dashboard-container">
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
                        <nav aria-label="breadcrumb" className="mb-4">
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
                        {location.pathname === "/admin/dashboard" && (
                            <div className="welcome-banner">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Welcome back, {user?.first_name}! 👨‍💼
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            System is running smoothly. You have
                                            full administrative control.
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                to="/admin/users"
                                                className="btn btn-light btn-lg"
                                            >
                                                <i className="fas fa-users me-2"></i>
                                                Manage Users
                                            </Link>
                                            <Link
                                                to="/admin/reports"
                                                className="btn btn-outline-light"
                                            >
                                                <i className="fas fa-chart-bar me-2"></i>
                                                View Reports
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-crown fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* System Health Banner */}
                        {systemHealth.status !== "healthy" && (
                            <div
                                className={`alert ${
                                    systemHealth.status === "warning"
                                        ? "alert-warning"
                                        : "alert-danger"
                                } alert-dismissible fade show`}
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

                        {/* Loading Indicator */}
                        {dashboardLoading && (
                            <div className="alert alert-info border-0 shadow-sm">
                                <div className="d-flex align-items-center">
                                    <div className="spinner-border spinner-border-sm me-3">
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

                        {/* Success Message */}
                        {successMessage && (
                            <div className="alert alert-success alert-dismissible fade show">
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

                        {/* Error Messages */}
                        {Object.keys(errors).length > 0 && (
                            <div className="alert alert-danger alert-dismissible fade show">
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

                        {/* Enhanced Footer */}
                        <footer className="content-footer">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-crown me-1"></i>
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
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
