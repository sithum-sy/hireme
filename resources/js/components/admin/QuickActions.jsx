import React from "react";
import { Link } from "react-router-dom";

const QuickActions = ({
    actions = [],
    title = "Quick Actions",
    columns = 2,
    className = "",
}) => {
    const defaultActions = [
        {
            title: "Create Staff",
            description: "Add new staff member",
            icon: "fas fa-user-plus",
            variant: "primary",
            link: "/admin/staff/create",
            permission: "create_staff",
        },
        {
            title: "Manage Users",
            description: "View and manage all users",
            icon: "fas fa-users",
            variant: "info",
            link: "/admin/users",
            permission: "manage_users",
        },
        {
            title: "View Reports",
            description: "Analytics and insights",
            icon: "fas fa-chart-bar",
            variant: "success",
            link: "/admin/reports",
            permission: "view_reports",
        },
        {
            title: "Settings",
            description: "System configuration",
            icon: "fas fa-cogs",
            variant: "warning",
            link: "/admin/settings",
            permission: "manage_settings",
        },
        {
            title: "Staff Overview",
            description: "Manage staff members",
            icon: "fas fa-users-cog",
            variant: "secondary",
            link: "/admin/staff",
            permission: "manage_staff",
        },
        {
            title: "Export Data",
            description: "Download system reports",
            icon: "fas fa-download",
            variant: "dark",
            action: "export",
            permission: "export_data",
        },
    ];

    const displayActions = actions.length > 0 ? actions : defaultActions;

    const ActionCard = ({ action }) => {
        const cardContent = (
            <div className="action-card">
                <div
                    className={`action-icon ${action.variant} position-relative`}
                >
                    <i className={action.icon}></i>
                    {action.badge && (
                        <span
                            className={`action-badge ${
                                action.badgeColor || "primary"
                            }`}
                        >
                            {action.badge}
                        </span>
                    )}
                    {action.loading && (
                        <div className="action-loading">
                            <div className="loading-spinner"></div>
                        </div>
                    )}
                </div>
                <h6 className="action-title">{action.title}</h6>
                <p className="action-description">{action.description}</p>
            </div>
        );

        if (action.link) {
            return (
                <Link to={action.link} className="action-card-link">
                    {cardContent}
                </Link>
            );
        } else if (action.onClick) {
            return (
                <button
                    onClick={action.onClick}
                    className="action-card-btn"
                    disabled={action.disabled || action.loading}
                >
                    {cardContent}
                </button>
            );
        } else {
            return cardContent;
        }
    };

    return (
        <div className={`dashboard-card quick-actions-widget ${className}`}>
            <div className="dashboard-card-header">
                <div className="header-content">
                    <h6 className="dashboard-card-title">
                        <i className="fas fa-bolt"></i>
                        <span>{title}</span>
                    </h6>
                    <div className="dropdown">
                        <button
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                        >
                            <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                <button className="dropdown-item">
                                    <i className="fas fa-plus"></i>
                                    <span>Add Custom Action</span>
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item">
                                    <i className="fas fa-edit"></i>
                                    <span>Customize Layout</span>
                                </button>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button className="dropdown-item">
                                    <i className="fas fa-undo"></i>
                                    <span>Reset to Default</span>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="dashboard-card-body">
                <div className={`quick-actions-grid columns-${columns}`}>
                    {displayActions.map((action, index) => (
                        <ActionCard key={action.id || index} action={action} />
                    ))}
                </div>
            </div>

            <div className="dashboard-card-footer">
                <div className="actions-summary">
                    <div className="summary-item">
                        <span className="summary-label">Total Actions</span>
                        <span className="summary-value primary">
                            {displayActions.length}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Quick Access</span>
                        <span className="summary-value success">
                            <i className="fas fa-check-circle"></i>
                            <span>Available</span>
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-label">Most Used</span>
                        <span className="summary-value info">
                            {displayActions[0]?.title || "Create Staff"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Specialized Quick Action Components
export const AdminQuickActions = ({ onAction = null }) => {
    const adminActions = [
        {
            id: "create-staff",
            title: "Create Staff",
            description: "Add new staff member to the team",
            icon: "fas fa-user-plus",
            variant: "primary",
            link: "/admin/staff/create",
        },
        {
            id: "manage-users",
            title: "Manage Users",
            description: "View and manage all platform users",
            icon: "fas fa-users",
            variant: "info",
            link: "/admin/users",
        },
        {
            id: "view-reports",
            title: "Analytics",
            description: "View reports and system insights",
            icon: "fas fa-chart-bar",
            variant: "success",
            link: "/admin/reports",
        },
        {
            id: "system-settings",
            title: "Settings",
            description: "Configure system preferences",
            icon: "fas fa-cogs",
            variant: "warning",
            link: "/admin/settings",
        },
    ];

    return (
        <QuickActions
            actions={adminActions}
            title="Administrative Actions"
            columns={2}
            className="h-100"
        />
    );
};

export const StaffQuickActions = ({ onAction = null }) => {
    const staffActions = [
        {
            id: "manage-categories",
            title: "Service Categories",
            description: "Manage service categories",
            icon: "fas fa-tags",
            variant: "primary",
            link: "/staff/categories",
        },
        {
            id: "manage-users",
            title: "User Management",
            description: "Handle user accounts and issues",
            icon: "fas fa-users",
            variant: "info",
            link: "/staff/users",
        },
        {
            id: "support-tickets",
            title: "Support Tickets",
            description: "View and respond to user issues",
            icon: "fas fa-headset",
            variant: "warning",
            link: "/staff/support",
            badge: "New",
            badgeColor: "danger",
        },
        {
            id: "reports",
            title: "Generate Reports",
            description: "Create user and activity reports",
            icon: "fas fa-file-chart",
            variant: "success",
            link: "/staff/reports",
        },
    ];

    return (
        <QuickActions
            actions={staffActions}
            title="Staff Actions"
            columns={2}
            className="h-100"
        />
    );
};

export const ManagerQuickActions = ({ stats = {}, onAction = null }) => {
    const managerActions = [
        {
            id: "export-users",
            title: "Export Users",
            description: "Download user data as CSV",
            icon: "fas fa-download",
            variant: "primary",
            onClick: () => onAction && onAction("export-users"),
        },
        {
            id: "backup-system",
            title: "System Backup",
            description: "Create system backup",
            icon: "fas fa-database",
            variant: "success",
            onClick: () => onAction && onAction("backup-system"),
        },
        {
            id: "send-notifications",
            title: "Send Notifications",
            description: "Broadcast message to users",
            icon: "fas fa-bullhorn",
            variant: "warning",
            onClick: () => onAction && onAction("send-notifications"),
        },
        {
            id: "system-health",
            title: "System Health",
            description: "Check system status",
            icon: "fas fa-heartbeat",
            variant: "danger",
            onClick: () => onAction && onAction("system-health"),
            badge: stats.issues > 0 ? stats.issues : null,
            badgeColor: "danger",
        },
    ];

    return (
        <QuickActions
            actions={managerActions}
            title="Management Tools"
            columns={2}
            className="h-100"
        />
    );
};

export default QuickActions;
