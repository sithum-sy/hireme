import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const DashboardSidebar = ({
    role = "admin",
    collapsed = false,
    className = "",
    onMenuItemClick,
}) => {
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState(new Set());
    const [activeMenuItem, setActiveMenuItem] = useState("");

    // Role-specific configurations
    const roleConfig = {
        admin: {
            primary: "#007bff",
            accent: "#0056b3",
            light: "#e3f2fd",
            sidebar: "#1a2332",
            roleTitle: "Admin Panel",
        },
        staff: {
            primary: "#28a745",
            accent: "#1e7e34",
            light: "#e8f5e8",
            sidebar: "#1e3a1e",
            roleTitle: "Staff Panel",
        },
        client: {
            primary: "#6f42c1",
            accent: "#5a2d91",
            light: "#f3e5f5",
            sidebar: "#2a1a3a",
            roleTitle: "Client Dashboard",
        },
        provider: {
            primary: "#fd7e14",
            accent: "#e55100",
            light: "#fff3e0",
            sidebar: "#3a2418",
            roleTitle: "Provider Dashboard",
        },
    };

    const config = roleConfig[role] || roleConfig.admin;

    // Role-specific menu items
    const getMenuItems = () => {
        const menuItems = {
            admin: [
                {
                    id: "dashboard",
                    icon: "fas fa-tachometer-alt",
                    label: "Dashboard",
                    path: "/admin/dashboard",
                },
                {
                    id: "users",
                    icon: "fas fa-users",
                    label: "User Management",
                    path: "/admin/users",
                    children: [
                        { label: "All Users", path: "/admin/users" },
                        { label: "Clients", path: "/admin/users/clients" },
                        { label: "Providers", path: "/admin/users/providers" },
                        {
                            label: "Pending Approvals",
                            path: "/admin/users/pending",
                            badge: "5",
                        },
                    ],
                },
                {
                    id: "staff",
                    icon: "fas fa-user-tie",
                    label: "Staff Management",
                    path: "/admin/staff",
                    children: [
                        { label: "All Staff", path: "/admin/staff" },
                        { label: "Add Staff", path: "/admin/staff/create" },
                        {
                            label: "Roles & Permissions",
                            path: "/admin/staff/roles",
                        },
                    ],
                },
                {
                    id: "categories",
                    icon: "fas fa-tags",
                    label: "Categories",
                    path: "/admin/categories",
                    badge: "12",
                },
                {
                    id: "services",
                    icon: "fas fa-concierge-bell",
                    label: "Services",
                    path: "/admin/services",
                    children: [
                        { label: "All Services", path: "/admin/services" },
                        {
                            label: "Pending Review",
                            path: "/admin/services/pending",
                            badge: "8",
                        },
                        {
                            label: "Reported Services",
                            path: "/admin/services/reported",
                        },
                    ],
                },
                {
                    id: "appointments",
                    icon: "fas fa-calendar-alt",
                    label: "Appointments",
                    path: "/admin/appointments",
                    badge: "23",
                },
                {
                    id: "payments",
                    icon: "fas fa-credit-card",
                    label: "Payments",
                    path: "/admin/payments",
                    children: [
                        {
                            label: "Transactions",
                            path: "/admin/payments/transactions",
                        },
                        { label: "Refunds", path: "/admin/payments/refunds" },
                        {
                            label: "Disputes",
                            path: "/admin/payments/disputes",
                            badge: "3",
                        },
                    ],
                },
                {
                    id: "reports",
                    icon: "fas fa-chart-bar",
                    label: "Reports & Analytics",
                    path: "/admin/reports",
                    children: [
                        {
                            label: "Platform Analytics",
                            path: "/admin/reports/analytics",
                        },
                        {
                            label: "Financial Reports",
                            path: "/admin/reports/financial",
                        },
                        { label: "User Reports", path: "/admin/reports/users" },
                    ],
                },
                {
                    id: "settings",
                    icon: "fas fa-cog",
                    label: "System Settings",
                    path: "/admin/settings",
                    children: [
                        {
                            label: "General Settings",
                            path: "/admin/settings/general",
                        },
                        {
                            label: "Email Templates",
                            path: "/admin/settings/emails",
                        },
                        {
                            label: "Platform Fees",
                            path: "/admin/settings/fees",
                        },
                        {
                            label: "Backup & Security",
                            path: "/admin/settings/security",
                        },
                    ],
                },
            ],
            staff: [
                {
                    id: "dashboard",
                    icon: "fas fa-tachometer-alt",
                    label: "Dashboard",
                    path: "/staff/dashboard",
                },
                {
                    id: "categories",
                    icon: "fas fa-tags",
                    label: "Service Categories",
                    path: "/staff/categories",
                    children: [
                        { label: "All Categories", path: "/staff/categories" },
                        {
                            label: "Add Category",
                            path: "/staff/categories/create",
                        },
                        {
                            label: "Category Analytics",
                            path: "/staff/categories/analytics",
                        },
                    ],
                },
                {
                    id: "users",
                    icon: "fas fa-users",
                    label: "Users",
                    path: "/staff/users",
                    children: [
                        { label: "View Users", path: "/staff/users" },
                        { label: "Clients", path: "/staff/users/clients" },
                        { label: "Providers", path: "/staff/users/providers" },
                        {
                            label: "Pending Approvals",
                            path: "/staff/users/pending",
                            badge: "3",
                        },
                    ],
                },
                {
                    id: "services",
                    icon: "fas fa-concierge-bell",
                    label: "Services",
                    path: "/staff/services",
                    children: [
                        { label: "All Services", path: "/staff/services" },
                        {
                            label: "Pending Review",
                            path: "/staff/services/pending",
                            badge: "5",
                        },
                    ],
                },
                {
                    id: "appointments",
                    icon: "fas fa-calendar-alt",
                    label: "Appointments",
                    path: "/staff/appointments",
                    badge: "12",
                },
                {
                    id: "reports",
                    icon: "fas fa-chart-line",
                    label: "Reports",
                    path: "/staff/reports",
                    children: [
                        {
                            label: "Weekly Reports",
                            path: "/staff/reports/weekly",
                        },
                        {
                            label: "Category Performance",
                            path: "/staff/reports/categories",
                        },
                    ],
                },
                {
                    id: "support",
                    icon: "fas fa-headset",
                    label: "Customer Support",
                    path: "/staff/support",
                    badge: "7",
                },
            ],
            client: [
                {
                    id: "dashboard",
                    icon: "fas fa-tachometer-alt",
                    label: "Dashboard",
                    path: "/client/dashboard",
                },
                {
                    id: "services",
                    icon: "fas fa-search",
                    label: "Browse Services",
                    path: "/client/services",
                    children: [
                        { label: "All Services", path: "/client/services" },
                        { label: "Categories", path: "/client/categories" },
                        { label: "Favorites", path: "/client/favorites" },
                        { label: "Recently Viewed", path: "/client/recent" },
                    ],
                },
                {
                    id: "appointments",
                    icon: "fas fa-calendar-alt",
                    label: "My Appointments",
                    path: "/client/appointments",
                    badge: "3",
                    children: [
                        {
                            label: "Upcoming",
                            path: "/client/appointments/upcoming",
                            badge: "2",
                        },
                        {
                            label: "Past Appointments",
                            path: "/client/appointments/past",
                        },
                        {
                            label: "Cancelled",
                            path: "/client/appointments/cancelled",
                        },
                    ],
                },
                {
                    id: "bookings",
                    icon: "fas fa-plus-circle",
                    label: "Book Service",
                    path: "/client/book",
                },
                {
                    id: "quotes",
                    icon: "fas fa-quote-left",
                    label: "My Quotes",
                    path: "/client/quotes",
                    // badge: "2", // You can dynamically set this based on pending quotes
                    children: [
                        {
                            label: "All Quotes",
                            path: "/client/quotes",
                        },
                        {
                            label: "Pending",
                            path: "/client/quotes?status=pending",
                            badge: "1",
                        },
                        {
                            label: "Received",
                            path: "/client/quotes?status=quoted",
                            badge: "1",
                        },
                        {
                            label: "Accepted",
                            path: "/client/quotes?status=accepted",
                        },
                        {
                            label: "Declined",
                            path: "/client/quotes?status=rejected",
                        },
                    ],
                },
                {
                    id: "messages",
                    icon: "fas fa-comments",
                    label: "Messages",
                    path: "/client/messages",
                    badge: "2",
                },
                {
                    id: "payments",
                    icon: "fas fa-credit-card",
                    label: "Payments",
                    path: "/client/payments",
                    children: [
                        {
                            label: "Payment History",
                            path: "/client/payments/history",
                        },
                        {
                            label: "Payment Methods",
                            path: "/client/payments/methods",
                        },
                        {
                            label: "Invoices",
                            path: "/client/payments/invoices",
                        },
                    ],
                },
                {
                    id: "reviews",
                    icon: "fas fa-star",
                    label: "Reviews & Ratings",
                    path: "/client/reviews",
                },
                {
                    id: "profile",
                    icon: "fas fa-user",
                    label: "My Profile",
                    path: "/client/profile",
                    children: [
                        {
                            label: "Personal Info",
                            path: "/client/profile/personal",
                        },
                        {
                            label: "Address Book",
                            path: "/client/profile/addresses",
                        },
                        {
                            label: "Preferences",
                            path: "/client/profile/preferences",
                        },
                    ],
                },
                {
                    id: "support",
                    icon: "fas fa-headset",
                    label: "Help & Support",
                    path: "/client/support",
                },
            ],
            provider: [
                {
                    id: "dashboard",
                    icon: "fas fa-tachometer-alt",
                    label: "Dashboard",
                    path: "/provider/dashboard",
                },
                {
                    id: "appointments",
                    icon: "fas fa-calendar-alt",
                    label: "Appointments",
                    path: "/provider/appointments",
                    badge: "",
                    children: [
                        {
                            label: "All Appointments",
                            path: "/provider/appointments",
                            badge: "",
                        },
                        {
                            label: "Today's Schedule",
                            path: "/provider/appointments/today",
                        },
                        {
                            label: "Upcoming",
                            path: "/provider/appointments?status=confirmed",
                            badge: "",
                        },
                        {
                            label: "Past Appointments",
                            path: "/provider/appointments?status=completed",
                        },
                        {
                            label: "Cancelled",
                            path: "/provider/appointments?status=cancelled_by_client",
                        },
                    ],
                },
                {
                    id: "services",
                    icon: "fas fa-concierge-bell",
                    label: "My Services",
                    path: "/provider/services",
                    badge: "",
                    children: [
                        { label: "All Services", path: "/provider/services" },
                        {
                            label: "Add Service",
                            path: "/provider/services/create",
                        },
                        // {
                        //     label: "Service Analytics",
                        //     path: "/provider/services/analytics",
                        // },
                    ],
                },

                {
                    id: "quotes",
                    icon: "fas fa-bell",
                    label: "Quote Requests",
                    path: "/provider/quotes",
                    badge: "",
                    // children: [
                    //     {
                    //         label: "Quotes List",
                    //         path: "/provider/quotes",
                    //         badge: "",
                    //     },
                    // ],
                },
                // {
                //     id: "requests",
                //     icon: "fas fa-bell",
                //     label: "Service Requests",
                //     path: "/provider/requests",
                //     badge: "12",
                //     children: [
                //         {
                //             label: "New Requests",
                //             path: "/provider/requests/new",
                //             badge: "7",
                //         },
                //         {
                //             label: "Quotes Sent",
                //             path: "/provider/requests/quotes",
                //         },
                //         {
                //             label: "Accepted",
                //             path: "/provider/requests/accepted",
                //         },
                //     ],
                // },
                {
                    id: "availability",
                    icon: "fas fa-calendar-alt",
                    label: "Availability",
                    path: "/provider/availability",
                    children: [
                        {
                            label: "Weekly Schedule",
                            path: "/provider/availability/schedule",
                        },
                        {
                            label: "Blocked Times",
                            path: "/provider/availability/blocked",
                        },
                        {
                            label: "Overview",
                            path: "/provider/availability",
                        },
                    ],
                },
                {
                    id: "invoices",
                    icon: "fas fa-file-invoice",
                    label: "Invoices",
                    path: "/provider/invoices",
                    // badge:
                    //     pendingInvoicesCount > 0 ? pendingInvoicesCount : null,
                },

                {
                    id: "earnings",
                    icon: "fas fa-dollar-sign",
                    label: "Earnings",
                    path: "/provider/earnings",
                    children: [
                        {
                            label: "Overview",
                            path: "/provider/earnings/overview",
                        },
                        // {
                        //     label: "Payment History",
                        //     path: "/provider/earnings/history",
                        // },
                        // {
                        //     label: "Tax Documents",
                        //     path: "/provider/earnings/tax",
                        // },
                    ],
                },
                {
                    id: "reviews",
                    icon: "fas fa-star",
                    label: "Reviews & Ratings",
                    path: "/provider/reviews",
                },
                {
                    id: "profile",
                    icon: "fas fa-user",
                    label: "My Profile",
                    path: "/provider/profile",
                    children: [
                        {
                            label: "Business Profile",
                            path: "/provider/profile/business",
                        },
                        {
                            label: "Personal Info",
                            path: "/provider/profile/personal",
                        },
                        {
                            label: "Verification",
                            path: "/provider/profile/verification",
                        },
                    ],
                },
                // {
                //     id: "messages",
                //     icon: "fas fa-comments",
                //     label: "Messages",
                //     path: "/provider/messages",
                //     badge: "4",
                // },
                {
                    id: "analytics",
                    icon: "fas fa-chart-bar",
                    label: "Analytics",
                    path: "/provider/analytics",
                    children: [
                        {
                            label: "Performance",
                            path: "/provider/analytics/performance",
                        },
                        {
                            label: "Service Insights",
                            path: "/provider/analytics/services",
                        },
                        {
                            label: "Customer Insights",
                            path: "/provider/analytics/customers",
                        },
                    ],
                },
                // {
                //     id: "settings",
                //     icon: "fas fa-cog",
                //     label: "Settings",
                //     path: "/provider/settings",
                //     children: [
                //         {
                //             label: "Business Settings",
                //             path: "/provider/settings/business",
                //         },
                //         {
                //             label: "Notification Preferences",
                //             path: "/provider/settings/notifications",
                //         },
                //         {
                //             label: "Payment Settings",
                //             path: "/provider/settings/payments",
                //         },
                //     ],
                // },
            ],
        };

        return menuItems[role] || menuItems.admin;
    };

    // Set active menu item based on current path
    useEffect(() => {
        const path = location.pathname;
        const menuItems = getMenuItems();

        // Find active menu item
        let activeItem = "";
        menuItems.forEach((item) => {
            if (path === item.path || path.startsWith(item.path + "/")) {
                activeItem = item.id;
                // Auto-expand parent menu if has children
                if (item.children && item.children.length > 0) {
                    setExpandedMenus((prev) => new Set([...prev, item.id]));
                }
            }
        });

        setActiveMenuItem(activeItem);
    }, [location.pathname, role]);

    const toggleSubmenu = (menuId) => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(menuId)) {
                newSet.delete(menuId);
            } else {
                newSet.add(menuId);
            }
            return newSet;
        });
    };

    const handleMenuItemClick = (item) => {
        if (onMenuItemClick) {
            onMenuItemClick(item);
        }

        // If item has children, toggle submenu
        if (item.children && item.children.length > 0) {
            toggleSubmenu(item.id);
        }
    };

    const isMenuItemActive = (item) => {
        const path = location.pathname;
        return path === item.path || path.startsWith(item.path + "/");
    };

    const isSubmenuItemActive = (submenuItem) => {
        return location.pathname === submenuItem.path;
    };

    const menuItems = getMenuItems();

    return (
        <div
            className={`dashboard-sidebar ${
                collapsed ? "collapsed" : ""
            } ${className}`}
            style={{
                backgroundColor: config.sidebar,
                borderRight: `3px solid ${config.accent}`,
                width: collapsed ? "70px" : "280px",
                transition: "width 0.3s ease",
            }}
        >
            {/* Sidebar Header */}
            <div
                className="sidebar-header p-3 border-bottom"
                style={{ borderColor: config.accent + "40" }}
            >
                <div className="d-flex align-items-center text-white">
                    <div className="sidebar-logo me-2">
                        <i
                            className="fas fa-handshake"
                            style={{ color: config.primary }}
                        ></i>
                    </div>
                    {!collapsed && (
                        <div>
                            <h6 className="mb-0 fw-bold">HireMe</h6>
                            <small className="opacity-75">
                                {config.roleTitle}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div
                className="sidebar-menu p-2"
                style={{ height: "calc(100vh - 120px)", overflowY: "auto" }}
            >
                {menuItems.map((item) => (
                    <div key={item.id} className="menu-item mb-1">
                        {/* Main Menu Item */}
                        <div
                            className={`menu-link d-flex align-items-center p-3 rounded text-decoration-none cursor-pointer ${
                                activeMenuItem === item.id ? "active" : ""
                            }`}
                            onClick={() => handleMenuItemClick(item)}
                            style={{
                                color:
                                    activeMenuItem === item.id
                                        ? config.primary
                                        : "#ffffff",
                                backgroundColor:
                                    activeMenuItem === item.id
                                        ? "#ffffff20"
                                        : "transparent",
                                transition: "all 0.3s ease",
                            }}
                        >
                            <Link
                                to={item.path}
                                className="d-flex align-items-center text-decoration-none w-100"
                                style={{ color: "inherit" }}
                            >
                                <div
                                    className="menu-icon me-3"
                                    style={{ minWidth: "20px" }}
                                >
                                    <i className={item.icon}></i>
                                </div>
                                {!collapsed && (
                                    <>
                                        <span className="menu-label flex-grow-1">
                                            {item.label}
                                        </span>
                                        <div className="menu-extras d-flex align-items-center">
                                            {item.badge && (
                                                <span
                                                    className="badge rounded-pill me-2"
                                                    style={{
                                                        backgroundColor:
                                                            config.primary,
                                                        color: "white",
                                                        fontSize: "0.7rem",
                                                    }}
                                                >
                                                    {item.badge}
                                                </span>
                                            )}
                                            {item.children &&
                                                item.children.length > 0 && (
                                                    <i
                                                        className={`fas fa-chevron-${
                                                            expandedMenus.has(
                                                                item.id
                                                            )
                                                                ? "down"
                                                                : "right"
                                                        } small`}
                                                        style={{
                                                            transition:
                                                                "transform 0.3s ease",
                                                        }}
                                                    ></i>
                                                )}
                                        </div>
                                    </>
                                )}
                            </Link>
                        </div>

                        {/* Submenu Items */}
                        {!collapsed &&
                            item.children &&
                            item.children.length > 0 &&
                            expandedMenus.has(item.id) && (
                                <div className="submenu ms-4 mt-1">
                                    {item.children.map((child, index) => (
                                        <Link
                                            key={index}
                                            to={child.path}
                                            className={`submenu-link d-flex align-items-center p-2 rounded text-decoration-none mb-1 ${
                                                isSubmenuItemActive(child)
                                                    ? "active"
                                                    : ""
                                            }`}
                                            style={{
                                                color: isSubmenuItemActive(
                                                    child
                                                )
                                                    ? config.primary
                                                    : "#ffffff80",
                                                backgroundColor:
                                                    isSubmenuItemActive(child)
                                                        ? "#ffffff15"
                                                        : "transparent",
                                                fontSize: "0.9rem",
                                                transition: "all 0.3s ease",
                                            }}
                                        >
                                            <div
                                                className="submenu-icon me-2"
                                                style={{ minWidth: "15px" }}
                                            >
                                                <i
                                                    className="fas fa-circle"
                                                    style={{
                                                        fontSize: "0.4rem",
                                                    }}
                                                ></i>
                                            </div>
                                            <span className="submenu-label flex-grow-1">
                                                {child.label}
                                            </span>
                                            {child.badge && (
                                                <span
                                                    className="badge rounded-pill"
                                                    style={{
                                                        backgroundColor:
                                                            config.primary,
                                                        color: "white",
                                                        fontSize: "0.6rem",
                                                    }}
                                                >
                                                    {child.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                    </div>
                ))}
            </div>

            {/* Sidebar Footer */}
            <div
                className="sidebar-footer p-3 border-top"
                style={{ borderColor: config.accent + "40" }}
            >
                {!collapsed ? (
                    <div className="d-flex align-items-center text-white small">
                        <div
                            className="status-indicator me-2 rounded-circle"
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#28a745",
                            }}
                        ></div>
                        <span className="opacity-75">System Online</span>
                    </div>
                ) : (
                    <div className="text-center">
                        <div
                            className="status-indicator rounded-circle mx-auto"
                            style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#28a745",
                            }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style>{`
                .dashboard-sidebar {
                    position: fixed;
                    top: 60px;
                    left: 0;
                    height: calc(100vh - 60px);
                    z-index: 1025;
                    box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
                }

                .sidebar-menu::-webkit-scrollbar {
                    width: 4px;
                }

                .sidebar-menu::-webkit-scrollbar-track {
                    background: transparent;
                }

                .sidebar-menu::-webkit-scrollbar-thumb {
                    background: ${config.accent}60;
                    border-radius: 2px;
                }

                .sidebar-menu::-webkit-scrollbar-thumb:hover {
                    background: ${config.accent}80;
                }

                .menu-link:hover {
                    background-color: #ffffff10 !important;
                    color: ${config.primary} !important;
                }

                .menu-link.active {
                    background-color: #ffffff20 !important;
                    color: ${config.primary} !important;
                    border-left: 3px solid ${config.primary};
                    margin-left: -8px;
                    padding-left: 19px !important;
                }

                .submenu-link:hover {
                    background-color: #ffffff10 !important;
                    color: ${config.primary} !important;
                }

                .submenu-link.active {
                    background-color: #ffffff15 !important;
                    color: ${config.primary} !important;
                }

                .cursor-pointer {
                    cursor: pointer;
                }

                .collapsed .menu-link {
                    justify-content: center;
                    padding: 12px !important;
                }

                .collapsed .submenu {
                    display: none;
                }

                @media (max-width: 768px) {
                    .dashboard-sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }

                    .dashboard-sidebar.show {
                        transform: translateX(0);
                    }
                }

                /* Tooltip for collapsed sidebar */
                .collapsed .menu-link {
                    position: relative;
                }

                .collapsed .menu-link:hover::after {
                    content: attr(data-title);
                    position: absolute;
                    left: 70px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: ${config.sidebar};
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    white-space: nowrap;
                    z-index: 1000;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
                    border: 1px solid ${config.accent}40;
                }
            `}</style>
        </div>
    );
};

export default DashboardSidebar;
