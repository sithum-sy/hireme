import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notificationCount] = useState(3); // Mock notification count

    const sidebarItems = [
        {
            icon: "fas fa-tachometer-alt",
            label: "Dashboard",
            path: "/client/dashboard",
            active: location.pathname === "/client/dashboard",
        },
        {
            icon: "fas fa-search",
            label: "Browse Services",
            path: "/client/services",
            active: location.pathname.startsWith("/client/services"),
        },
        {
            icon: "fas fa-calendar-alt",
            label: "My Appointments",
            path: "/client/appointments",
            active: location.pathname.startsWith("/client/appointments"),
        },
        {
            icon: "fas fa-bell",
            label: "Notifications",
            path: "/client/notifications",
            active: location.pathname === "/client/notifications",
            badge: notificationCount,
        },
        {
            icon: "fas fa-user-cog",
            label: "Account Settings",
            path: "/client/settings",
            active: location.pathname === "/client/settings",
        },
    ];

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="dashboard-wrapper">
            {/* Top Navigation */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top">
                <div className="container-fluid">
                    <button
                        className="btn btn-link text-white me-3 d-lg-none"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className="fas fa-bars"></i>
                    </button>

                    <Link
                        className="navbar-brand fw-bold"
                        to="/client/dashboard"
                    >
                        <i className="fas fa-handshake me-2"></i>
                        HireMe
                    </Link>

                    <div className="navbar-nav ms-auto d-flex flex-row align-items-center">
                        {/* Quick Actions */}
                        <div className="nav-item dropdown me-3">
                            <button
                                className="btn btn-outline-light btn-sm dropdown-toggle"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-plus me-1"></i>
                                Quick Book
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/book/cleaning"
                                    >
                                        <i className="fas fa-broom me-2"></i>
                                        Cleaning Service
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/book/plumbing"
                                    >
                                        <i className="fas fa-tools me-2"></i>
                                        Plumbing
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/book/tutoring"
                                    >
                                        <i className="fas fa-graduation-cap me-2"></i>
                                        Tutoring
                                    </Link>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/services"
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Browse All Services
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Notifications */}
                        <div className="nav-item dropdown me-3">
                            <button
                                className="btn btn-outline-light btn-sm position-relative"
                                data-bs-toggle="dropdown"
                            >
                                <i className="fas fa-bell"></i>
                                {notificationCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        {notificationCount}
                                    </span>
                                )}
                            </button>
                            <ul
                                className="dropdown-menu dropdown-menu-end"
                                style={{ width: "300px" }}
                            >
                                <li>
                                    <h6 className="dropdown-header">
                                        Recent Notifications
                                    </h6>
                                </li>
                                <li>
                                    <div className="dropdown-item">
                                        <div className="d-flex">
                                            <div className="flex-shrink-0">
                                                <i className="fas fa-check-circle text-success"></i>
                                            </div>
                                            <div className="flex-grow-1 ms-2">
                                                <div className="small fw-semibold">
                                                    Appointment Confirmed
                                                </div>
                                                <div className="small text-muted">
                                                    Your cleaning service is
                                                    confirmed for tomorrow
                                                </div>
                                                <div className="small text-muted">
                                                    2 hours ago
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item text-center"
                                        to="/client/notifications"
                                    >
                                        View All Notifications
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* User Profile */}
                        <div className="nav-item dropdown">
                            <button
                                className="btn btn-link text-white dropdown-toggle d-flex align-items-center"
                                data-bs-toggle="dropdown"
                            >
                                {user?.profile_picture ? (
                                    <img
                                        src={user.profile_picture}
                                        alt="Profile"
                                        className="rounded-circle me-2"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-light rounded-circle me-2 d-flex align-items-center justify-content-center text-primary fw-bold"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                            fontSize: "14px",
                                        }}
                                    >
                                        {user?.first_name?.charAt(0)}
                                        {user?.last_name?.charAt(0)}
                                    </div>
                                )}
                                <span className="d-none d-md-inline">
                                    {user?.first_name}
                                </span>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <div className="dropdown-header">
                                        <div className="fw-semibold">
                                            {user?.full_name}
                                        </div>
                                        <div className="small text-muted">
                                            {user?.email}
                                        </div>
                                    </div>
                                </li>
                                <li>
                                    <hr className="dropdown-divider" />
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/profile"
                                    >
                                        <i className="fas fa-user me-2"></i>My
                                        Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        className="dropdown-item"
                                        to="/client/settings"
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

            {/* Sidebar */}
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <div className="sidebar-content">
                    <div className="sidebar-header p-3 d-none d-lg-block">
                        <h6 className="text-muted mb-0">Client Portal</h6>
                    </div>

                    <nav className="sidebar-nav">
                        {sidebarItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                className={`sidebar-link ${
                                    item.active ? "active" : ""
                                }`}
                            >
                                <i className={item.icon}></i>
                                <span className="sidebar-text">
                                    {item.label}
                                </span>
                                {item.badge && (
                                    <span className="badge bg-danger ms-auto">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="sidebar-footer p-3 mt-auto">
                        <button
                            className="btn btn-outline-danger btn-sm w-100"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt me-2"></i>
                            <span className="sidebar-text">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="main-content">{children}</main>

            {/* Mobile Sidebar Overlay */}
            {!sidebarCollapsed && (
                <div
                    className="sidebar-overlay d-lg-none"
                    onClick={() => setSidebarCollapsed(true)}
                ></div>
            )}
        </div>
    );
};

export default DashboardLayout;
