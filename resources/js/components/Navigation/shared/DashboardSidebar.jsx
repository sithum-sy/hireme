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
            roleTitle: "Admin Panel",
        },
        staff: {
            roleTitle: "Staff Panel",
        },
        client: {
            roleTitle: "Client Dashboard",
        },
        provider: {
            roleTitle: "Provider Dashboard",
        },
    };

    const config = roleConfig[role] || roleConfig.admin;

    // Role-specific menu items (keeping your existing structure)
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
                // {
                //     id: "bookings",
                //     icon: "fas fa-plus-circle",
                //     label: "Book A Service",
                //     path: "/client/book",
                // },
                {
                    id: "services",
                    icon: "fas fa-search",
                    label: "Browse Services",
                    path: "/client/services",
                    children: [
                        { label: "All Services", path: "/client/services" },
                        { label: "Categories", path: "/client/categories" },
                    ],
                },
                {
                    id: "appointments",
                    icon: "fas fa-calendar-alt",
                    label: "My Appointments",
                    path: "/client/appointments",
                    children: [
                        {
                            label: "Today's Schedule",
                            path: "/client/appointments/today",
                        },
                        {
                            label: "Upcoming",
                            path: "/client/appointments/upcoming",
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
                    id: "quotes",
                    icon: "fas fa-quote-left",
                    label: "My Quotes",
                    path: "/client/quotes",
                    children: [
                        {
                            label: "All Quotes",
                            path: "/client/quotes",
                        },
                    ],
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
                            path: "/client/profile",
                        },
                        {
                            label: "Edit Profile",
                            path: "/client/profile/edit",
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
                    children: [
                        {
                            label: "Pending Requests",
                            path: "/provider/appointments?status=pending",
                        },
                        {
                            label: "Today's Schedule",
                            path: "/provider/appointments/today",
                        },
                        {
                            label: "Upcoming",
                            path: "/provider/appointments?status=confirmed",
                        },
                        {
                            label: "Past Appointments",
                            path: "/provider/appointments?status=completed",
                        },
                        {
                            label: "Cancelled",
                            path: "/provider/appointments?status=cancelled_by_client",
                        },
                        {
                            label: "All Appointments",
                            path: "/provider/appointments",
                        },
                    ],
                },
                {
                    id: "services",
                    icon: "fas fa-concierge-bell",
                    label: "My Services",
                    path: "/provider/services",
                    children: [
                        { label: "All Services", path: "/provider/services" },
                        {
                            label: "Add Service",
                            path: "/provider/services/create",
                        },
                    ],
                },
                {
                    id: "quotes",
                    icon: "fas fa-bell",
                    label: "Quote Requests",
                    path: "/provider/quotes",
                },
                {
                    id: "availability",
                    icon: "fas fa-calendar-alt",
                    label: "Availability",
                    path: "/provider/availability",
                    children: [
                        {
                            label: "Overview",
                            path: "/provider/availability",
                        },
                        {
                            label: "Weekly Schedule",
                            path: "/provider/availability/schedule",
                        },
                        {
                            label: "Blocked Times",
                            path: "/provider/availability/blocked",
                        },
                    ],
                },
                {
                    id: "invoices",
                    icon: "fas fa-file-invoice",
                    label: "Invoices",
                    path: "/provider/invoices",
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

    const isSubmenuItemActive = (submenuItem) => {
        return location.pathname === submenuItem.path;
    };

    const menuItems = getMenuItems();

    return (
        <div
            className={`dashboard-sidebar ${
                collapsed ? "collapsed" : ""
            } ${className}`}
        >
            {/* Sidebar Header */}
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        <i className="fas fa-handshake"></i>
                    </div>
                    {!collapsed && (
                        <div className="brand-text">
                            <div className="brand-name">HireMe</div>
                            <div className="brand-subtitle">
                                {config.roleTitle}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="sidebar-menu">
                <div className="menu-list">
                    {menuItems.map((item) => (
                        <div key={item.id} className="menu-group">
                            {/* Main Menu Item */}
                            <div
                                className={`menu-item ${
                                    activeMenuItem === item.id ? "active" : ""
                                }`}
                                onClick={() => handleMenuItemClick(item)}
                                data-tooltip={collapsed ? item.label : ""}
                            >
                                <Link to={item.path} className="menu-link">
                                    <div className="menu-icon">
                                        <i className={item.icon}></i>
                                    </div>
                                    {!collapsed && (
                                        <>
                                            <span className="menu-label">
                                                {item.label}
                                            </span>
                                            <div className="menu-extras">
                                                {item.badge && (
                                                    <span className="menu-badge">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {item.children &&
                                                    item.children.length >
                                                        0 && (
                                                        <i
                                                            className={`fas fa-chevron-${
                                                                expandedMenus.has(
                                                                    item.id
                                                                )
                                                                    ? "down"
                                                                    : "right"
                                                            } menu-chevron`}
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
                                    <div className="submenu">
                                        {item.children.map((child, index) => (
                                            <Link
                                                key={index}
                                                to={child.path}
                                                className={`submenu-item ${
                                                    isSubmenuItemActive(child)
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <div className="submenu-icon">
                                                    <i className="fas fa-circle"></i>
                                                </div>
                                                <span className="submenu-label">
                                                    {child.label}
                                                </span>
                                                {child.badge && (
                                                    <span className="submenu-badge">
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
            </div>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
                {!collapsed ? (
                    <div className="status-info">
                        <div className="status-indicator"></div>
                        <span className="status-text">System Online</span>
                    </div>
                ) : (
                    <div className="status-indicator-collapsed">
                        <div className="status-indicator"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardSidebar;
