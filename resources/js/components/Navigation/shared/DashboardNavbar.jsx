import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const DashboardNavbar = ({
    role = "admin",
    sidebarCollapsed = false,
    onToggleSidebar,
    onSearch,
    className = "",
}) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // State management
    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Refs for click outside handling
    const notificationRef = useRef(null);
    const profileRef = useRef(null);
    const searchRef = useRef(null);

    // Role-specific configurations
    const roleConfig = {
        admin: {
            primary: "#007bff",
            accent: "#0056b3",
            light: "#e3f2fd",
            roleTitle: "Admin Panel",
            searchPlaceholder: "Search users, services, reports...",
            dashboardPath: "/admin/dashboard",
        },
        staff: {
            primary: "#28a745",
            accent: "#1e7e34",
            light: "#e8f5e8",
            roleTitle: "Staff Panel",
            searchPlaceholder: "Search categories, users...",
            dashboardPath: "/staff/dashboard",
        },
        client: {
            primary: "#6f42c1",
            accent: "#5a2d91",
            light: "#f3e5f5",
            roleTitle: "Client Dashboard",
            searchPlaceholder: "Search services, providers...",
            dashboardPath: "/client/dashboard",
        },
        provider: {
            primary: "#fd7e14",
            accent: "#e55100",
            light: "#fff3e0",
            roleTitle: "Provider Dashboard",
            searchPlaceholder: "Search appointments, analytics...",
            dashboardPath: "/provider/dashboard",
        },
    };

    const config = roleConfig[role] || roleConfig.admin;

    // Profile menu items based on role
    const getProfileMenuItems = () => {
        const commonItems = [
            {
                label: "Settings",
                path: `/${role}/settings`,
                icon: "fas fa-cog",
            },
            {
                label: "Help & Support",
                path: `/${role}/help`,
                icon: "fas fa-question-circle",
            },
        ];

        const roleSpecificItems = {
            admin: [
                {
                    label: "Admin Profile",
                    path: "/admin/profile",
                    icon: "fas fa-user",
                },
                {
                    label: "System Settings",
                    path: "/admin/settings",
                    icon: "fas fa-cog",
                },
                {
                    label: "Activity Log",
                    path: "/admin/activity",
                    icon: "fas fa-history",
                },
                {
                    label: "Security",
                    path: "/admin/security",
                    icon: "fas fa-shield-alt",
                },
            ],
            staff: [
                {
                    label: "My Profile",
                    path: "/staff/profile",
                    icon: "fas fa-user",
                },
                {
                    label: "Staff Settings",
                    path: "/staff/settings",
                    icon: "fas fa-cog",
                },
                {
                    label: "Help Center",
                    path: "/staff/help",
                    icon: "fas fa-question-circle",
                },
            ],
            client: [
                {
                    label: "My Profile",
                    path: "/client/profile",
                    icon: "fas fa-user",
                },
                {
                    label: "Account Settings",
                    path: "/client/settings",
                    icon: "fas fa-cog",
                },
                {
                    label: "Payment Methods",
                    path: "/client/payments/methods",
                    icon: "fas fa-credit-card",
                },
                {
                    label: "Favorites",
                    path: "/client/favorites",
                    icon: "fas fa-heart",
                },
            ],
            provider: [
                {
                    label: "Business Profile",
                    path: "/provider/profile",
                    icon: "fas fa-user",
                },
                {
                    label: "Business Settings",
                    path: "/provider/settings",
                    icon: "fas fa-cog",
                },
                {
                    label: "Earnings",
                    path: "/provider/earnings",
                    icon: "fas fa-dollar-sign",
                },
                {
                    label: "Analytics",
                    path: "/provider/analytics",
                    icon: "fas fa-chart-bar",
                },
            ],
        };

        return roleSpecificItems[role] || commonItems;
    };

    // Load notifications based on role
    useEffect(() => {
        loadNotifications();
    }, [role]);

    // Click outside handlers
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }
            if (
                profileRef.current &&
                !profileRef.current.contains(event.target)
            ) {
                setShowProfileMenu(false);
            }
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = () => {
        // Mock notifications - replace with actual API call
        const mockNotifications = {
            admin: [
                {
                    id: 1,
                    type: "alert",
                    title: "System Alert",
                    message: "Server maintenance scheduled",
                    time: "5 min ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "user",
                    title: "New User Report",
                    message: "3 new user registrations",
                    time: "1 hour ago",
                    read: false,
                },
                {
                    id: 3,
                    type: "payment",
                    title: "Payment Issue",
                    message: "Payment gateway timeout",
                    time: "2 hours ago",
                    read: true,
                },
            ],
            staff: [
                {
                    id: 1,
                    type: "approval",
                    title: "Pending Approval",
                    message: "2 categories need review",
                    time: "10 min ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "inquiry",
                    title: "User Inquiry",
                    message: "Support ticket #1234",
                    time: "30 min ago",
                    read: false,
                },
                {
                    id: 3,
                    type: "update",
                    title: "Category Updated",
                    message: "PC Repair category modified",
                    time: "1 hour ago",
                    read: true,
                },
            ],
            client: [
                {
                    id: 1,
                    type: "booking",
                    title: "Booking Confirmed",
                    message: "House cleaning scheduled",
                    time: "15 min ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "message",
                    title: "New Message",
                    message: "Provider sent a message",
                    time: "1 hour ago",
                    read: false,
                },
                {
                    id: 3,
                    type: "reminder",
                    title: "Service Reminder",
                    message: "Appointment tomorrow at 10 AM",
                    time: "2 hours ago",
                    read: true,
                },
            ],
            provider: [
                {
                    id: 1,
                    type: "request",
                    title: "New Service Request",
                    message: "Client requested plumbing service",
                    time: "5 min ago",
                    read: false,
                },
                {
                    id: 2,
                    type: "payment",
                    title: "Payment Received",
                    message: "Rs. 150 payment received",
                    time: "1 hour ago",
                    read: false,
                },
                {
                    id: 3,
                    type: "review",
                    title: "New Review",
                    message: "5-star review from Sarah P.",
                    time: "3 hours ago",
                    read: true,
                },
            ],
        };

        const roleNotifications = mockNotifications[role] || [];
        setNotifications(roleNotifications);
        setUnreadCount(roleNotifications.filter((n) => !n.read).length);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setShowSearchResults(true);
            if (onSearch) {
                onSearch(searchQuery);
            }
            // Navigate to search results page
            navigate(`/${role}/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            alert: "fas fa-exclamation-triangle text-warning",
            user: "fas fa-user-plus text-primary",
            payment: "fas fa-dollar-sign text-success",
            approval: "fas fa-check-circle text-info",
            inquiry: "fas fa-question-circle text-info",
            update: "fas fa-edit text-secondary",
            booking: "fas fa-calendar-check text-success",
            message: "fas fa-envelope text-primary",
            reminder: "fas fa-bell text-warning",
            request: "fas fa-hand-paper text-primary",
            review: "fas fa-star text-warning",
        };
        return icons[type] || "fas fa-bell text-info";
    };

    const getRoleSpecificQuickActions = () => {
        const quickActions = {
            admin: [
                {
                    label: "Add User",
                    path: "/admin/users/create",
                    icon: "fas fa-user-plus",
                },
                {
                    label: "System Backup",
                    path: "/admin/backup",
                    icon: "fas fa-download",
                },
                {
                    label: "View Reports",
                    path: "/admin/reports",
                    icon: "fas fa-chart-bar",
                },
            ],
            staff: [
                {
                    label: "Add Category",
                    path: "/staff/categories/create",
                    icon: "fas fa-plus",
                },
                {
                    label: "User Management",
                    path: "/staff/users",
                    icon: "fas fa-users",
                },
                {
                    label: "Generate Report",
                    path: "/staff/reports",
                    icon: "fas fa-file-alt",
                },
            ],
            client: [
                {
                    label: "Book Service",
                    path: "/client/book",
                    icon: "fas fa-plus-circle",
                },
                {
                    label: "My Appointments",
                    path: "/client/appointments",
                    icon: "fas fa-calendar-alt",
                },
                {
                    label: "Browse Services",
                    path: "/client/services",
                    icon: "fas fa-search",
                },
            ],
            provider: [
                {
                    label: "Add Service",
                    path: "/provider/services/create",
                    icon: "fas fa-plus",
                },
                {
                    label: "View Requests",
                    path: "/provider/requests",
                    icon: "fas fa-bell",
                },
                {
                    label: "Update Schedule",
                    path: "/provider/schedule",
                    icon: "fas fa-calendar-alt",
                },
            ],
        };
        return quickActions[role] || [];
    };

    return (
        <nav
            className={`dashboard-navbar fixed-top ${className}`}
            style={{
                backgroundColor: config.primary,
                borderBottom: `3px solid ${config.accent}`,
                zIndex: 1030,
            }}
        >
            <div className="container-fluid px-3">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Left Section - Brand & Sidebar Toggle */}
                    <div className="d-flex align-items-center">
                        {/* Sidebar Toggle */}
                        <button
                            className="btn btn-link text-white p-2 me-3"
                            onClick={onToggleSidebar}
                            title={
                                sidebarCollapsed
                                    ? "Expand Sidebar"
                                    : "Collapse Sidebar"
                            }
                        >
                            <i
                                className={`fas fa-${
                                    sidebarCollapsed ? "bars" : "times"
                                } fa-lg`}
                            ></i>
                        </button>

                        {/* Brand */}
                        <Link
                            to={config.dashboardPath}
                            className="navbar-brand text-white text-decoration-none d-flex align-items-center"
                        >
                            <div className="brand-icon me-2">
                                <i className="fas fa-handshake fa-2x"></i>
                            </div>
                            <div className="d-none d-md-block">
                                <div className="fw-bold h5 mb-0">HireMe</div>
                                <small className="opacity-75">
                                    {config.roleTitle}
                                </small>
                            </div>
                        </Link>
                    </div>

                    {/* Center Section - Search */}
                    <div
                        className="flex-grow-1 mx-4 d-none d-lg-block"
                        style={{ maxWidth: "500px" }}
                    >
                        <div className="position-relative" ref={searchRef}>
                            <form onSubmit={handleSearch}>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-0">
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-0 shadow-none"
                                        placeholder={config.searchPlaceholder}
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        onFocus={() =>
                                            setShowSearchResults(true)
                                        }
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            className="btn btn-link text-muted p-2"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setShowSearchResults(false);
                                            }}
                                        >
                                            <i className="fas fa-times"></i>
                                        </button>
                                    )}
                                </div>
                            </form>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchQuery && (
                                <div
                                    className="position-absolute w-100 bg-white border rounded shadow-lg mt-1"
                                    style={{ zIndex: 1050 }}
                                >
                                    <div className="p-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">
                                                Search Results
                                            </small>
                                            <small className="text-muted">
                                                Press Enter to search
                                            </small>
                                        </div>
                                        <div className="list-group list-group-flush">
                                            {getRoleSpecificQuickActions().map(
                                                (action, index) => (
                                                    <Link
                                                        key={index}
                                                        to={action.path}
                                                        className="list-group-item list-group-item-action border-0 py-2"
                                                        onClick={() =>
                                                            setShowSearchResults(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={`${action.icon} me-2 text-muted`}
                                                        ></i>
                                                        {action.label}
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Section - Notifications & Profile */}
                    <div className="d-flex align-items-center gap-3">
                        {/* Mobile Search Toggle */}
                        <button className="btn btn-link text-white p-2 d-lg-none">
                            <i className="fas fa-search fa-lg"></i>
                        </button>

                        {/* Quick Actions Dropdown */}
                        <div className="dropdown d-none d-md-block">
                            <button
                                className="btn btn-link text-white p-2"
                                data-bs-toggle="dropdown"
                                title="Quick Actions"
                            >
                                <i className="fas fa-plus fa-lg"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <h6 className="dropdown-header">
                                        Quick Actions
                                    </h6>
                                </li>
                                {getRoleSpecificQuickActions().map(
                                    (action, index) => (
                                        <li key={index}>
                                            <Link
                                                to={action.path}
                                                className="dropdown-item"
                                            >
                                                <i
                                                    className={`${action.icon} me-2`}
                                                ></i>
                                                {action.label}
                                            </Link>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        {/* Notifications */}
                        <div
                            className="position-relative"
                            ref={notificationRef}
                        >
                            <button
                                className="btn btn-link text-white p-2 position-relative"
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                title="Notifications"
                            >
                                <i className="fas fa-bell fa-lg"></i>
                                {unreadCount > 0 && (
                                    <span
                                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        {unreadCount > 9 ? "9+" : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div
                                    className="position-absolute end-0 bg-white border rounded shadow-lg mt-2"
                                    style={{ width: "350px", zIndex: 1050 }}
                                >
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0">
                                                Notifications
                                            </h6>
                                            {unreadCount > 0 && (
                                                <span className="badge bg-primary">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div
                                        className="notifications-list"
                                        style={{
                                            maxHeight: "400px",
                                            overflowY: "auto",
                                        }}
                                    >
                                        {notifications.length > 0 ? (
                                            notifications.map(
                                                (notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`p-3 border-bottom notification-item ${
                                                            !notification.read
                                                                ? "bg-light"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="d-flex">
                                                            <div className="me-3">
                                                                <i
                                                                    className={getNotificationIcon(
                                                                        notification.type
                                                                    )}
                                                                ></i>
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="fw-semibold mb-1">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </div>
                                                                <div className="text-muted small mb-1">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </div>
                                                                <div className="text-muted small">
                                                                    {
                                                                        notification.time
                                                                    }
                                                                </div>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="ms-2">
                                                                    <span
                                                                        className="badge bg-primary rounded-pill"
                                                                        style={{
                                                                            width: "8px",
                                                                            height: "8px",
                                                                        }}
                                                                    ></span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <div className="text-center py-4 text-muted">
                                                <i className="fas fa-bell-slash fa-2x mb-2"></i>
                                                <div>No notifications</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-top">
                                        <Link
                                            to={`/${role}/notifications`}
                                            className="btn btn-outline-primary btn-sm w-100"
                                            onClick={() =>
                                                setShowNotifications(false)
                                            }
                                        >
                                            View All Notifications
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Dropdown */}
                        <div className="position-relative" ref={profileRef}>
                            <button
                                className="btn btn-link text-white p-0 d-flex align-items-center"
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                            >
                                <div className="d-flex align-items-center">
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
                                            className="rounded-circle me-2 d-flex align-items-center justify-content-center text-white fw-bold"
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                backgroundColor: config.accent,
                                            }}
                                        >
                                            {user?.first_name?.charAt(0)}
                                            {user?.last_name?.charAt(0)}
                                        </div>
                                    )}
                                    <div className="d-none d-md-block text-start">
                                        <div className="fw-semibold small">
                                            {user?.first_name} {user?.last_name}
                                        </div>
                                        <div className="small opacity-75 text-capitalize">
                                            {role}
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-down ms-2 small"></i>
                                </div>
                            </button>

                            {/* Profile Menu Dropdown */}
                            {showProfileMenu && (
                                <div
                                    className="position-absolute end-0 bg-white border rounded shadow-lg mt-2"
                                    style={{ width: "250px", zIndex: 1050 }}
                                >
                                    <div className="p-3 border-bottom">
                                        <div className="d-flex align-items-center">
                                            {user?.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt="Profile"
                                                    className="rounded-circle me-3"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="rounded-circle me-3 d-flex align-items-center justify-content-center text-white fw-bold"
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        backgroundColor:
                                                            config.primary,
                                                    }}
                                                >
                                                    {user?.first_name?.charAt(
                                                        0
                                                    )}
                                                    {user?.last_name?.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <div className="fw-semibold">
                                                    {user?.first_name}{" "}
                                                    {user?.last_name}
                                                </div>
                                                <div className="small text-muted">
                                                    {user?.email}
                                                </div>
                                                <div
                                                    className="small text-capitalize"
                                                    style={{
                                                        color: config.primary,
                                                    }}
                                                >
                                                    {role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        role.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2">
                                        {getProfileMenuItems().map(
                                            (item, index) => (
                                                <Link
                                                    key={index}
                                                    to={item.path}
                                                    className="dropdown-item d-flex align-items-center py-2"
                                                    onClick={() =>
                                                        setShowProfileMenu(
                                                            false
                                                        )
                                                    }
                                                >
                                                    <i
                                                        className={`${item.icon} me-3 text-muted`}
                                                    ></i>
                                                    {item.label}
                                                </Link>
                                            )
                                        )}
                                        <hr className="my-2" />
                                        <button
                                            className="dropdown-item d-flex align-items-center py-2 text-danger"
                                            onClick={handleLogout}
                                        >
                                            <i className="fas fa-sign-out-alt me-3"></i>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .dashboard-navbar {
                    height: 60px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .notification-item:hover {
                    background-color: #f8f9fa !important;
                }

                .dropdown-item:hover {
                    background-color: ${config.light};
                    color: ${config.primary};
                }

                .brand-icon {
                    transition: transform 0.3s ease;
                }

                .brand-icon:hover {
                    transform: scale(1.1);
                }

                .input-group-text {
                    border-top-left-radius: 20px;
                    border-bottom-left-radius: 20px;
                }

                .form-control {
                    border-top-right-radius: 20px;
                    border-bottom-right-radius: 20px;
                }

                @media (max-width: 768px) {
                    .dashboard-navbar .container-fluid {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                }
            `}</style>
        </nav>
    );
};

export default DashboardNavbar;
