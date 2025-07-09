import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useStaff } from "../../context/StaffContext";
import { Link, useLocation, useNavigate } from "react-router-dom";

const StaffLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { state, addNotification, removeNotification } = useStaff();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Clear notifications when route changes (optional)
    useEffect(() => {
        // You can clear notifications on route change if needed
        // state.ui.notifications.forEach(notification => {
        //     removeNotification(notification.id);
        // });
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // Navigation items
    const navigationItems = [
        {
            title: "Dashboard",
            icon: "fas fa-tachometer-alt",
            path: "/staff/dashboard",
            exact: true,
        },
        {
            title: "Service Categories",
            icon: "fas fa-tags",
            path: "/staff/categories",
            children: [
                { title: "All Categories", path: "/staff/categories" },
                { title: "Create Category", path: "/staff/categories/create" },
                { title: "Analytics", path: "/staff/categories/analytics" },
            ],
        },
        {
            title: "User Management",
            icon: "fas fa-users",
            path: "/staff/users",
            children: [
                { title: "All Users", path: "/staff/users" },
                { title: "Clients", path: "/staff/users?role=client" },
                {
                    title: "Providers",
                    path: "/staff/users?role=service_provider",
                },
                {
                    title: "Pending Approvals",
                    path: "/staff/users?status=pending",
                },
            ],
        },
        {
            title: "Services",
            icon: "fas fa-briefcase",
            path: "/staff/services",
            children: [
                { title: "All Services", path: "/staff/services" },
                {
                    title: "Active Services",
                    path: "/staff/services?status=active",
                },
                {
                    title: "Pending Review",
                    path: "/staff/services?status=pending",
                },
            ],
        },
        {
            title: "Appointments",
            icon: "fas fa-calendar-alt",
            path: "/staff/appointments",
            children: [
                { title: "All Appointments", path: "/staff/appointments" },
                {
                    title: "Today's Appointments",
                    path: "/staff/appointments/today",
                },
                {
                    title: "Upcoming",
                    path: "/staff/appointments?status=upcoming",
                },
            ],
        },
        {
            title: "Disputes",
            icon: "fas fa-balance-scale",
            path: "/staff/disputes",
            children: [
                { title: "Open Disputes", path: "/staff/disputes?status=open" },
                { title: "In Review", path: "/staff/disputes?status=review" },
                { title: "Resolved", path: "/staff/disputes?status=resolved" },
            ],
        },
        {
            title: "Reports",
            icon: "fas fa-chart-bar",
            path: "/staff/reports",
            children: [
                { title: "Platform Overview", path: "/staff/reports/overview" },
                { title: "User Analytics", path: "/staff/reports/users" },
                {
                    title: "Activity Reports",
                    path: "/staff/reports/activities",
                },
            ],
        },
        {
            title: "Activity Log",
            icon: "fas fa-history",
            path: "/staff/activities",
        },
    ];

    const isActiveRoute = (path, exact = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

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
            title: "Staff",
            path: "/staff/dashboard",
            active: pathSegments.length === 0,
        });

        // Generate breadcrumbs from path
        let currentPath = "/staff";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            breadcrumbs.push({
                title:
                    segment.charAt(0).toUpperCase() +
                    segment.slice(1).replace(/-/g, " "),
                path: currentPath,
                active: isLast,
            });
        });

        return breadcrumbs;
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Top Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container-fluid">
                    {/* Sidebar Toggle */}
                    <button
                        className="btn btn-primary d-lg-none me-3"
                        type="button"
                        onClick={toggleSidebar}
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    {/* Brand */}
                    <Link
                        className="navbar-brand fw-bold"
                        to="/staff/dashboard"
                    >
                        <i className="fas fa-user-tie me-2"></i>
                        HireMe Staff
                    </Link>

                    {/* Top Nav Items */}
                    <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
                        {/* Current Time */}
                        <div className="text-white-50 me-4 d-none d-md-block">
                            <i className="fas fa-clock me-1"></i>
                            {currentTime.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>

                        {/* Notifications */}
                        <div className="dropdown me-3">
                            <button
                                className="btn btn-outline-light btn-sm position-relative"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-bell"></i>
                                {state.ui.notifications.length > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: "0.6rem" }}
                                    >
                                        {state.ui.notifications.length}
                                    </span>
                                )}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <h6 className="dropdown-header">
                                        Notifications
                                    </h6>
                                </li>
                                {state.ui.notifications.length === 0 ? (
                                    <li>
                                        <span className="dropdown-item-text text-muted">
                                            No new notifications
                                        </span>
                                    </li>
                                ) : (
                                    state.ui.notifications.map(
                                        (notification) => (
                                            <li key={notification.id}>
                                                <div className="dropdown-item">
                                                    <small className="text-muted">
                                                        Just now
                                                    </small>
                                                    <br />
                                                    {notification.message}
                                                    <button
                                                        className="btn btn-sm btn-link p-0 ms-2"
                                                        onClick={() =>
                                                            removeNotification(
                                                                notification.id
                                                            )
                                                        }
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </div>
                                            </li>
                                        )
                                    )
                                )}
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item text-center"
                                        to="/staff/activities"
                                    >
                                        View all activities
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* User Dropdown */}
                        <div className="dropdown">
                            <button
                                className="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <div className="me-2">
                                    {user?.profile_picture ? (
                                        <img
                                            src={user.profile_picture}
                                            alt="Profile"
                                            className="rounded-circle"
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                objectFit: "cover",
                                            }}
                                        />
                                    ) : (
                                        <i className="fas fa-user-circle"></i>
                                    )}
                                </div>
                                <span className="d-none d-md-inline">
                                    {user?.full_name}
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <h6 className="dropdown-header">
                                        {user?.full_name}
                                        <br />
                                        <small className="text-muted">
                                            {user?.email}
                                        </small>
                                    </h6>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/staff/profile"
                                    >
                                        <i className="fas fa-user me-2"></i>
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/staff/settings"
                                    >
                                        <i className="fas fa-cog me-2"></i>
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item text-danger"
                                        onClick={handleLogout}
                                    >
                                        <i className="fas fa-sign-out-alt me-2"></i>
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container-fluid">
                <div className="row">
                    {/* Sidebar */}
                    <div
                        className={`col-lg-3 col-xl-2 p-0 ${
                            sidebarCollapsed ? "d-none" : ""
                        } d-lg-block`}
                    >
                        <div
                            className="bg-white shadow-sm"
                            style={{ minHeight: "calc(100vh - 56px)" }}
                        >
                            <div className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="mb-0 text-muted">
                                        NAVIGATION
                                    </h6>
                                    <button
                                        className="btn btn-sm btn-outline-secondary d-lg-none"
                                        onClick={toggleSidebar}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>

                                <nav className="nav flex-column">
                                    {navigationItems.map((item, index) => (
                                        <div key={index} className="mb-1">
                                            {item.children ? (
                                                // Dropdown navigation item
                                                <div className="dropdown">
                                                    <Link
                                                        to={item.path}
                                                        className={`nav-link d-flex align-items-center justify-content-between text-decoration-none ${
                                                            isActiveRoute(
                                                                item.path
                                                            )
                                                                ? "active bg-primary text-white"
                                                                : "text-dark"
                                                        }`}
                                                        data-bs-toggle="dropdown"
                                                    >
                                                        <div>
                                                            <i
                                                                className={`${item.icon} me-2`}
                                                            ></i>
                                                            {item.title}
                                                        </div>
                                                        <i className="fas fa-chevron-down"></i>
                                                    </Link>
                                                    <ul className="dropdown-menu w-100 border-0 shadow-sm">
                                                        {item.children.map(
                                                            (
                                                                child,
                                                                childIndex
                                                            ) => (
                                                                <li
                                                                    key={
                                                                        childIndex
                                                                    }
                                                                >
                                                                    <Link
                                                                        to={
                                                                            child.path
                                                                        }
                                                                        className={`dropdown-item ${
                                                                            isActiveRoute(
                                                                                child.path,
                                                                                true
                                                                            )
                                                                                ? "active"
                                                                                : ""
                                                                        }`}
                                                                    >
                                                                        {
                                                                            child.title
                                                                        }
                                                                    </Link>
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            ) : (
                                                // Simple navigation item
                                                <Link
                                                    to={item.path}
                                                    className={`nav-link d-flex align-items-center text-decoration-none ${
                                                        isActiveRoute(
                                                            item.path,
                                                            item.exact
                                                        )
                                                            ? "active bg-primary text-white rounded"
                                                            : "text-dark"
                                                    }`}
                                                >
                                                    <i
                                                        className={`${item.icon} me-2`}
                                                    ></i>
                                                    {item.title}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </nav>
                            </div>

                            {/* Sidebar Footer */}
                            <div className="mt-auto p-3 border-top bg-light">
                                <div className="text-center">
                                    <small className="text-muted">
                                        HireMe Staff v1.0
                                        <br />
                                        Last login:{" "}
                                        {user?.last_login_human || "N/A"}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-lg-9 col-xl-10">
                        <div className="p-4">
                            {/* Breadcrumbs */}
                            <nav aria-label="breadcrumb" className="mb-4">
                                <ol className="breadcrumb">
                                    {generateBreadcrumbs().map(
                                        (crumb, index) => (
                                            <li
                                                key={index}
                                                className={`breadcrumb-item ${
                                                    crumb.active ? "active" : ""
                                                }`}
                                            >
                                                {crumb.active ? (
                                                    crumb.title
                                                ) : (
                                                    <Link
                                                        to={crumb.path}
                                                        className="text-decoration-none"
                                                    >
                                                        {crumb.title}
                                                    </Link>
                                                )}
                                            </li>
                                        )
                                    )}
                                </ol>
                            </nav>

                            {/* Success/Error Messages from Staff Context */}
                            {state.ui.notifications
                                .filter((n) => n.type === "success")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-success alert-dismissible fade show"
                                        role="alert"
                                    >
                                        <i className="fas fa-check-circle me-2"></i>
                                        {notification.message}
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

                            {state.ui.notifications
                                .filter((n) => n.type === "error")
                                .map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="alert alert-danger alert-dismissible fade show"
                                        role="alert"
                                    >
                                        <i className="fas fa-exclamation-circle me-2"></i>
                                        {notification.message}
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

                            {/* Dashboard/Category Errors */}
                            {state.dashboard.error && (
                                <div
                                    className="alert alert-danger alert-dismissible fade show"
                                    role="alert"
                                >
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    <strong>Dashboard Error:</strong>{" "}
                                    {state.dashboard.error}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            // You'd need to add a clearDashboardError action
                                        }}
                                    ></button>
                                </div>
                            )}

                            {state.categories.error && (
                                <div
                                    className="alert alert-danger alert-dismissible fade show"
                                    role="alert"
                                >
                                    <i className="fas fa-exclamation-circle me-2"></i>
                                    <strong>Categories Error:</strong>{" "}
                                    {state.categories.error}
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            // You'd need to add a clearCategoriesError action
                                        }}
                                    ></button>
                                </div>
                            )}

                            {/* Page Content */}
                            <div className="content-wrapper">{children}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={toggleSidebar}
                ></div>
            )}
        </div>
    );
};

export default StaffLayout;
