import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import ProfileImage from "../../ui/ProfileImage";
import api, { notificationAPI } from "../../../services/api";

const DashboardNavbar = memo(
    ({
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
                roleTitle: "Admin Panel",
                searchPlaceholder: "Search users, services, reports...",
                dashboardPath: "/admin/dashboard",
            },
            staff: {
                roleTitle: "Staff Panel",
                searchPlaceholder: "Search categories, users...",
                dashboardPath: "/staff/dashboard",
            },
            client: {
                roleTitle: "Client Dashboard",
                searchPlaceholder: "Search services, providers...",
                dashboardPath: "/client/dashboard",
            },
            provider: {
                roleTitle: "Provider Dashboard",
                searchPlaceholder: "Search appointments, analytics...",
                dashboardPath: "/provider/dashboard",
            },
        };

        const config = roleConfig[role] || roleConfig.admin;

        // Profile menu items based on role
        const getProfileMenuItems = () => {
            const roleSpecificItems = {
                admin: [
                    {
                        label: "Admin Profile",
                        path: "/admin/profile",
                        icon: "fas fa-user",
                    },
                    {
                        label: "Personal Information",
                        path: "/admin/profile/personal",
                        icon: "fas fa-id-card",
                    },
                    {
                        label: "Security Settings",
                        path: "/admin/profile/security",
                        icon: "fas fa-shield-alt",
                    },
                    {
                        label: "System Settings",
                        path: "/admin/settings",
                        icon: "fas fa-cog",
                    },
                ],
                staff: [
                    {
                        label: "My Profile",
                        path: "/staff/profile",
                        icon: "fas fa-user",
                    },
                    {
                        label: "Personal Information",
                        path: "/staff/profile/personal",
                        icon: "fas fa-id-card",
                    },
                    {
                        label: "Security Settings",
                        path: "/staff/profile/security",
                        icon: "fas fa-shield-alt",
                    },
                    {
                        label: "Staff Settings",
                        path: "/staff/settings",
                        icon: "fas fa-cog",
                    },
                ],
                client: [
                    {
                        label: "My Profile",
                        path: "/client/profile",
                        icon: "fas fa-user",
                    },
                    {
                        label: "Personal Information",
                        path: "/client/profile/personal",
                        icon: "fas fa-id-card",
                    },
                    {
                        label: "Security Settings",
                        path: "/client/profile/security",
                        icon: "fas fa-shield-alt",
                    },
                    {
                        label: "Account Settings",
                        path: "/client/settings",
                        icon: "fas fa-cog",
                    },
                ],
                provider: [
                    {
                        label: "Business Profile",
                        path: "/provider/profile",
                        icon: "fas fa-user",
                    },
                    {
                        label: "Personal Information",
                        path: "/provider/profile/personal",
                        icon: "fas fa-id-card",
                    },
                    {
                        label: "Business Information",
                        path: "/provider/profile/business",
                        icon: "fas fa-building",
                    },
                    {
                        label: "Documents",
                        path: "/provider/profile/documents",
                        icon: "fas fa-file-alt",
                    },
                    {
                        label: "Security Settings",
                        path: "/provider/profile/security",
                        icon: "fas fa-shield-alt",
                    },
                ],
            };

            const commonItems = [
                {
                    label: "Help & Support",
                    path: `/${role}/help`,
                    icon: "fas fa-question-circle",
                },
            ];

            return [...(roleSpecificItems[role] || []), ...commonItems];
        };

        // Load notifications based on role
        useEffect(() => {
            loadNotifications();
            // Set up polling for real-time updates every 30 seconds
            const interval = setInterval(loadNotifications, 30000);
            return () => clearInterval(interval);
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

        const loadNotifications = async () => {
            try {
                // Fetch recent notifications from API
                const [notificationsResponse, unreadCountResponse] = await Promise.all([
                    notificationAPI.getRecent(),
                    notificationAPI.getUnreadCount()
                ]);

                if (notificationsResponse.data.success) {
                    const apiNotifications = notificationsResponse.data.data;
                    
                    // Transform API notifications to match UI format
                    const transformedNotifications = apiNotifications.map(notification => ({
                        id: notification.id,
                        type: notification.category,
                        title: notification.title,
                        message: notification.message,
                        time: formatTimeAgo(notification.created_at),
                        read: notification.is_read,
                        actionUrl: notification.action_url
                    }));

                    setNotifications(transformedNotifications);
                }

                if (unreadCountResponse.data.success) {
                    setUnreadCount(unreadCountResponse.data.data.count);
                }
            } catch (error) {
                console.error('Failed to load notifications:', error);
                // Fallback to showing empty state
                setNotifications([]);
                setUnreadCount(0);
            }
        };

        // Helper function to format time ago
        const formatTimeAgo = (dateString) => {
            const now = new Date();
            const date = new Date(dateString);
            const diffInSeconds = Math.floor((now - date) / 1000);

            if (diffInSeconds < 60) {
                return 'Just now';
            }
            
            const diffInMinutes = Math.floor(diffInSeconds / 60);
            if (diffInMinutes < 60) {
                return `${diffInMinutes} min ago`;
            }
            
            const diffInHours = Math.floor(diffInMinutes / 60);
            if (diffInHours < 24) {
                return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
            }
            
            const diffInDays = Math.floor(diffInHours / 24);
            if (diffInDays < 7) {
                return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
            }
            
            return date.toLocaleDateString();
        };

        const handleSearch = useCallback(
            (e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                    setShowSearchResults(true);
                    if (onSearch) {
                        onSearch(searchQuery);
                    }
                    navigate(
                        `/${role}/search?q=${encodeURIComponent(searchQuery)}`
                    );
                }
            },
            [searchQuery, onSearch, role, navigate]
        );

        const handleLogout = useCallback(async () => {
            try {
                await logout();
                navigate("/login");
            } catch (error) {
                console.error("Logout failed:", error);
            }
        }, [logout, navigate]);

        const getNotificationIcon = (type) => {
            const icons = {
                alert: "fas fa-exclamation-triangle text-warning",
                user: "fas fa-user-plus text-primary",
                payment: "fas fa-dollar-sign text-success",
                approval: "fas fa-check-circle text-info",
                inquiry: "fas fa-question-circle text-info",
                update: "fas fa-edit text-secondary",
                booking: "fas fa-calendar-check text-success",
                appointment: "fas fa-calendar-check text-success",
                message: "fas fa-envelope text-primary",
                reminder: "fas fa-bell text-warning",
                request: "fas fa-hand-paper text-primary",
                review: "fas fa-star text-warning",
            };
            return icons[type] || "fas fa-bell text-info";
        };

        const handleNotificationClick = async (notification) => {
            try {
                // Mark notification as read if it's unread
                if (!notification.read) {
                    await notificationAPI.markAsRead(notification.id);
                    
                    // Update local state
                    setNotifications(prev => 
                        prev.map(n => 
                            n.id === notification.id 
                                ? { ...n, read: true }
                                : n
                        )
                    );
                    setUnreadCount(prev => Math.max(0, prev - 1));
                }

                // Navigate to action URL if available
                if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                }

                // Close notifications dropdown
                setShowNotifications(false);
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
                // Still navigate even if marking as read fails
                if (notification.actionUrl) {
                    navigate(notification.actionUrl);
                }
                setShowNotifications(false);
            }
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
            <nav className={`dashboard-navbar ${className}`}>
                <div className="navbar-container">
                    <div className="navbar-content">
                        {/* Left Section - Brand & Sidebar Toggle */}
                        <div className="navbar-left">
                            {/* Sidebar Toggle */}
                            <button
                                className="sidebar-toggle-btn"
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
                                    }`}
                                ></i>
                            </button>

                            {/* Brand */}
                            <Link to="/" className="navbar-brand">
                                <div className="brand-logo">
                                    <img
                                        src="/images/hireme-logo.png"
                                        alt="HireMe"
                                        className="logo-img"
                                        onError={(e) => {
                                            e.target.style.display = "none";
                                            e.target.nextSibling.style.display =
                                                "flex";
                                        }}
                                    />
                                    <div
                                        className="logo-fallback"
                                        style={{ display: "none" }}
                                    >
                                        <div className="brand-icon">
                                            <i className="fas fa-handshake"></i>
                                        </div>
                                    </div>
                                </div>
                                <div className="brand-text d-none d-md-block">
                                    <div className="brand-name">HireMe</div>
                                </div>
                            </Link>
                        </div>

                        {/* Center Section - Search */}
                        <div
                            className="navbar-search d-none d-lg-block"
                            ref={searchRef}
                        >
                            {/* <form onSubmit={handleSearch} className="search-form">
                            <div className="search-input-group">
                                <div className="search-icon">
                                    <i className="fas fa-search"></i>
                                </div>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder={config.searchPlaceholder}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onFocus={() => setShowSearchResults(true)}
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="search-clear"
                                        onClick={() => {
                                            setSearchQuery("");
                                            setShowSearchResults(false);
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                        </form> */}

                            {/* Search Results Dropdown */}
                            {/* {showSearchResults && searchQuery && (
                            <div className="search-results">
                                <div className="search-results-header">
                                    <span>Search Results</span>
                                    <small>Press Enter to search</small>
                                </div>
                                <div className="search-results-list">
                                    {getRoleSpecificQuickActions().map(
                                        (action, index) => (
                                            <Link
                                                key={index}
                                                to={action.path}
                                                className="search-result-item"
                                                onClick={() =>
                                                    setShowSearchResults(false)
                                                }
                                            >
                                                <i className={action.icon}></i>
                                                <span>{action.label}</span>
                                            </Link>
                                        )
                                    )}
                                </div>
                            </div>
                        )} */}
                        </div>

                        {/* Right Section - Actions & Profile */}
                        <div className="navbar-right">
                            {/* Mobile Search Toggle */}
                            {/* <button className="navbar-action-btn d-lg-none">
                                <i className="fas fa-search"></i>
                            </button> */}

                            {/* Quick Actions Dropdown */}
                            <div className="navbar-dropdown d-none d-md-block">
                                <button
                                    className="navbar-action-btn"
                                    data-bs-toggle="dropdown"
                                    title="Quick Actions"
                                >
                                    <i className="fas fa-plus"></i>
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
                                                        className={action.icon}
                                                    ></i>
                                                    <span>{action.label}</span>
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>

                            {/* Notifications */}
                            <div
                                className="navbar-dropdown"
                                ref={notificationRef}
                            >
                                <button
                                    className="navbar-action-btn notification-btn"
                                    onClick={() =>
                                        setShowNotifications(!showNotifications)
                                    }
                                    title="Notifications"
                                >
                                    <i className="fas fa-bell"></i>
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">
                                            {unreadCount > 9
                                                ? "9+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notifications Dropdown */}
                                {showNotifications && (
                                    <div className="notifications-dropdown">
                                        <div className="notifications-header">
                                            <h6>Notifications</h6>
                                            {unreadCount > 0 && (
                                                <span className="notifications-count">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </div>
                                        <div className="notifications-list">
                                            {notifications.length > 0 ? (
                                                notifications.map(
                                                    (notification) => (
                                                        <div
                                                            key={
                                                                notification.id
                                                            }
                                                            className={`notification-item ${
                                                                !notification.read
                                                                    ? "unread"
                                                                    : ""
                                                            } ${
                                                                notification.actionUrl
                                                                    ? "clickable"
                                                                    : ""
                                                            }`}
                                                            onClick={() => handleNotificationClick(notification)}
                                                            style={{ cursor: notification.actionUrl ? 'pointer' : 'default' }}
                                                        >
                                                            <div className="notification-icon">
                                                                <i
                                                                    className={getNotificationIcon(
                                                                        notification.type
                                                                    )}
                                                                ></i>
                                                            </div>
                                                            <div className="notification-content">
                                                                <div className="notification-title">
                                                                    {
                                                                        notification.title
                                                                    }
                                                                </div>
                                                                <div className="notification-message">
                                                                    {
                                                                        notification.message
                                                                    }
                                                                </div>
                                                                <div className="notification-time">
                                                                    {
                                                                        notification.time
                                                                    }
                                                                </div>
                                                            </div>
                                                            {!notification.read && (
                                                                <div className="notification-unread-indicator"></div>
                                                            )}
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="notifications-empty">
                                                    <i className="fas fa-bell-slash"></i>
                                                    <span>
                                                        No notifications
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="notifications-footer">
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
                            <div className="navbar-dropdown" ref={profileRef}>
                                <button
                                    className="profile-btn"
                                    onClick={() =>
                                        setShowProfileMenu(!showProfileMenu)
                                    }
                                >
                                    <div className="profile-avatar">
                                        {user?.profile_picture ? (
                                            <ProfileImage
                                                src={user.profile_picture}
                                                alt="Profile"
                                                size={32}
                                                className="avatar-img"
                                            />
                                        ) : (
                                            <div className="avatar-placeholder">
                                                {user?.first_name?.charAt(0)}
                                                {user?.last_name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="profile-info d-none d-md-block">
                                        <div className="profile-name">
                                            {user?.first_name} {user?.last_name}
                                        </div>
                                        <div className="profile-role text-capitalize">
                                            {role}
                                        </div>
                                    </div>
                                    <i className="fas fa-chevron-down profile-chevron"></i>
                                </button>

                                {/* Profile Menu Dropdown */}
                                {showProfileMenu && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <div className="profile-dropdown-avatar">
                                                {user?.profile_picture ? (
                                                    <ProfileImage
                                                        src={
                                                            user.profile_picture
                                                        }
                                                        alt="Profile"
                                                        size={32}
                                                        className="avatar-img"
                                                    />
                                                ) : (
                                                    <div className="avatar-placeholder">
                                                        {user?.first_name?.charAt(
                                                            0
                                                        )}
                                                        {user?.last_name?.charAt(
                                                            0
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="profile-dropdown-info">
                                                <div className="profile-dropdown-name">
                                                    {user?.first_name}{" "}
                                                    {user?.last_name}
                                                </div>
                                                <div className="profile-dropdown-email">
                                                    {user?.email}
                                                </div>
                                                <div className="profile-dropdown-role text-capitalize">
                                                    {role
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        role.slice(1)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="profile-dropdown-menu">
                                            {getProfileMenuItems().map(
                                                (item, index) => (
                                                    <Link
                                                        key={index}
                                                        to={item.path}
                                                        className="profile-dropdown-item"
                                                        onClick={() =>
                                                            setShowProfileMenu(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        <i
                                                            className={
                                                                item.icon
                                                            }
                                                        ></i>
                                                        <span>
                                                            {item.label}
                                                        </span>
                                                    </Link>
                                                )
                                            )}
                                            <hr className="dropdown-divider" />
                                            <button
                                                className="profile-dropdown-item logout-btn"
                                                onClick={handleLogout}
                                            >
                                                <i className="fas fa-sign-out-alt"></i>
                                                <span>Sign Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        );
    }
);

DashboardNavbar.displayName = "DashboardNavbar";

export default DashboardNavbar;
