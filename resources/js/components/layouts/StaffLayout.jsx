import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StaffLayout = ({ children }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Navigation menu items
    const menuItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: "fas fa-tachometer-alt",
            path: "/staff/dashboard",
            active: location.pathname === "/staff/dashboard",
        },
        {
            id: "categories",
            label: "Service Categories",
            icon: "fas fa-folder-open",
            path: "/staff/service-categories",
            active: location.pathname.startsWith("/staff/service-categories"),
        },
        {
            id: "users",
            label: "User Management",
            icon: "fas fa-users",
            path: "/staff/users",
            active: location.pathname.startsWith("/staff/users"),
            badge: "5",
            badgeColor: "bg-warning",
        },
        {
            id: "appointments",
            label: "Appointments",
            icon: "fas fa-calendar-alt",
            path: "/staff/appointments",
            active: location.pathname.startsWith("/staff/appointments"),
        },
        {
            id: "disputes",
            label: "Disputes",
            icon: "fas fa-balance-scale",
            path: "/staff/disputes",
            active: location.pathname.startsWith("/staff/disputes"),
            badge: "2",
            badgeColor: "bg-danger",
        },
        {
            id: "reports",
            label: "Reports & Analytics",
            icon: "fas fa-chart-line",
            path: "/staff/reports",
            active: location.pathname.startsWith("/staff/reports"),
        },
        {
            id: "settings",
            label: "Settings",
            icon: "fas fa-cogs",
            path: "/staff/settings",
            active: location.pathname.startsWith("/staff/settings"),
        },
    ];

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div className="d-flex vh-100 bg-light">
            {/* Sidebar */}
            <div
                className={`bg-dark text-white position-fixed position-lg-static vh-100 ${
                    sidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"
                } ${mobileMenuOpen ? "mobile-menu-open" : ""}`}
                style={{
                    width: sidebarCollapsed ? "60px" : "250px",
                    transition: "width 0.3s ease",
                    zIndex: 1050,
                }}
            >
                {/* Sidebar Header */}
                <div className="p-3 border-bottom border-secondary">
                    <div className="d-flex align-items-center">
                        <div
                            className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: "32px", height: "32px" }}
                        >
                            <i
                                className="fas fa-briefcase text-white"
                                style={{ fontSize: "14px" }}
                            ></i>
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h6 className="mb-0 text-white">HireMe</h6>
                                <small className="text-muted">
                                    Staff Portal
                                </small>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-grow-1 py-3">
                    <ul className="nav nav-pills flex-column">
                        {menuItems.map((item) => (
                            <li key={item.id} className="nav-item mb-1">
                                <Link
                                    to={item.path}
                                    className={`nav-link d-flex align-items-center px-3 py-2 mx-2 rounded ${
                                        item.active
                                            ? "active bg-primary"
                                            : "text-light"
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <i
                                        className={`${item.icon} me-2`}
                                        style={{ width: "20px" }}
                                    ></i>
                                    {!sidebarCollapsed && (
                                        <>
                                            <span className="flex-grow-1">
                                                {item.label}
                                            </span>
                                            {item.badge && (
                                                <span
                                                    className={`badge ${item.badgeColor} ms-2`}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="p-3 border-top border-secondary">
                    <div className="d-flex align-items-center">
                        <div
                            className="bg-success rounded-circle d-flex align-items-center justify-content-center me-2"
                            style={{ width: "32px", height: "32px" }}
                        >
                            <i
                                className="fas fa-user text-white"
                                style={{ fontSize: "14px" }}
                            ></i>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-grow-1">
                                <div className="text-white small fw-semibold">
                                    {user?.full_name || "Staff User"}
                                </div>
                                <div
                                    className="text-muted"
                                    style={{ fontSize: "12px" }}
                                >
                                    Online
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
                    style={{ zIndex: 1040 }}
                    onClick={() => setMobileMenuOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div
                className="flex-grow-1 d-flex flex-column"
                style={{
                    marginLeft:
                        window.innerWidth >= 992
                            ? sidebarCollapsed
                                ? "60px"
                                : "250px"
                            : "0",
                    transition: "margin-left 0.3s ease",
                }}
            >
                {/* Top Header */}
                <header className="bg-white border-bottom shadow-sm py-3 px-4">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            {/* Mobile Menu Button */}
                            <button
                                className="btn btn-link text-dark d-lg-none me-3"
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
                            >
                                <i className="fas fa-bars"></i>
                            </button>

                            {/* Sidebar Toggle Button */}
                            <button
                                className="btn btn-link text-dark d-none d-lg-block me-3"
                                onClick={() =>
                                    setSidebarCollapsed(!sidebarCollapsed)
                                }
                            >
                                <i
                                    className={`fas ${
                                        sidebarCollapsed
                                            ? "fa-chevron-right"
                                            : "fa-chevron-left"
                                    }`}
                                ></i>
                            </button>

                            {/* Page Title */}
                            <div>
                                <h5 className="mb-0 text-dark">
                                    Staff Dashboard
                                </h5>
                                <small className="text-muted">
                                    Manage your platform efficiently
                                </small>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="d-flex align-items-center">
                            {/* Notifications */}
                            <div className="dropdown me-3">
                                <button
                                    className="btn btn-link text-dark position-relative"
                                    data-bs-toggle="dropdown"
                                >
                                    <i className="fas fa-bell fs-5"></i>
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                        3
                                    </span>
                                </button>
                                <ul
                                    className="dropdown-menu dropdown-menu-end shadow"
                                    style={{ width: "300px" }}
                                >
                                    <li>
                                        <h6 className="dropdown-header">
                                            Notifications
                                        </h6>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            <div className="d-flex">
                                                <i className="fas fa-user-plus text-success me-2 mt-1"></i>
                                                <div>
                                                    <div className="fw-semibold">
                                                        New user registered
                                                    </div>
                                                    <small className="text-muted">
                                                        2 minutes ago
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            <div className="d-flex">
                                                <i className="fas fa-exclamation-triangle text-warning me-2 mt-1"></i>
                                                <div>
                                                    <div className="fw-semibold">
                                                        Dispute requires
                                                        attention
                                                    </div>
                                                    <small className="text-muted">
                                                        15 minutes ago
                                                    </small>
                                                </div>
                                            </div>
                                        </a>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <a
                                            className="dropdown-item text-center"
                                            href="#"
                                        >
                                            View all notifications
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* User Profile */}
                            <div className="dropdown">
                                <button
                                    className="btn btn-link text-dark d-flex align-items-center"
                                    data-bs-toggle="dropdown"
                                >
                                    <div
                                        className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                        }}
                                    >
                                        <i
                                            className="fas fa-user text-white"
                                            style={{ fontSize: "14px" }}
                                        ></i>
                                    </div>
                                    <span className="d-none d-md-block me-1">
                                        {user?.first_name || "Staff"}
                                    </span>
                                    <i className="fas fa-chevron-down"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow">
                                    <li>
                                        <h6 className="dropdown-header">
                                            Staff Menu
                                        </h6>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            <i className="fas fa-user me-2"></i>
                                            Profile
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            <i className="fas fa-cog me-2"></i>
                                            Settings
                                        </a>
                                    </li>
                                    <li>
                                        <a className="dropdown-item" href="#">
                                            <i className="fas fa-question-circle me-2"></i>
                                            Help
                                        </a>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item"
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
                </header>

                {/* Main Content Area */}
                <main className="flex-grow-1 p-4 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default StaffLayout;
