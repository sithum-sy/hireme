import React from "react";
import { Link } from "react-router-dom";

const QuickActions = ({
    actions = [],
    title = "Quick Actions",
    columns = 2,
    className = "",
}) => {
    // Default admin actions if none provided
    const defaultActions = [
        {
            title: "Create Staff",
            description: "Add new staff member",
            icon: "fas fa-user-plus",
            color: "primary",
            link: "/admin/staff/create",
            permission: "create_staff",
        },
        {
            title: "Manage Users",
            description: "View and manage all users",
            icon: "fas fa-users",
            color: "info",
            link: "/admin/users",
            permission: "manage_users",
        },
        {
            title: "View Reports",
            description: "Analytics and insights",
            icon: "fas fa-chart-bar",
            color: "success",
            link: "/admin/reports",
            permission: "view_reports",
        },
        {
            title: "Settings",
            description: "System configuration",
            icon: "fas fa-cogs",
            color: "warning",
            link: "/admin/settings",
            permission: "manage_settings",
        },
        {
            title: "Staff Overview",
            description: "Manage staff members",
            icon: "fas fa-users-cog",
            color: "secondary",
            link: "/admin/staff",
            permission: "manage_staff",
        },
        {
            title: "Export Data",
            description: "Download system reports",
            icon: "fas fa-download",
            color: "dark",
            action: "export",
            permission: "export_data",
        },
    ];

    const displayActions = actions.length > 0 ? actions : defaultActions;

    const getColumnClass = () => {
        switch (columns) {
            case 1:
                return "col-12";
            case 2:
                return "col-md-6";
            case 3:
                return "col-lg-4 col-md-6";
            case 4:
                return "col-xl-3 col-lg-4 col-md-6";
            default:
                return "col-md-6";
        }
    };

    const ActionCard = ({ action }) => {
        const cardContent = (
            <div
                className={`btn btn-outline-${action.color} w-100 h-100 d-flex flex-column align-items-center justify-content-center py-4 text-decoration-none position-relative overflow-hidden`}
            >
                {/* Background Pattern */}
                <div className="position-absolute top-0 end-0 opacity-10">
                    <i
                        className={`${action.icon} fa-3x`}
                        style={{ transform: "rotate(15deg)" }}
                    ></i>
                </div>

                {/* Main Icon */}
                <div
                    className={`bg-${action.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center mb-3`}
                    style={{ width: "60px", height: "60px" }}
                >
                    <i
                        className={`${action.icon} fa-2x text-${action.color}`}
                    ></i>
                </div>

                {/* Action Text */}
                <h6 className="mb-1 fw-bold">{action.title}</h6>
                <small className="text-muted text-center px-2">
                    {action.description}
                </small>

                {/* Badge for special actions */}
                {action.badge && (
                    <span
                        className={`badge bg-${
                            action.badgeColor || "primary"
                        } position-absolute top-0 start-0 m-2`}
                    >
                        {action.badge}
                    </span>
                )}

                {/* Loading indicator for actions */}
                {action.loading && (
                    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
                        <div
                            className="spinner-border spinner-border-sm text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
            </div>
        );

        if (action.link) {
            return (
                <Link to={action.link} className="text-decoration-none">
                    {cardContent}
                </Link>
            );
        } else if (action.onClick) {
            return (
                <button
                    onClick={action.onClick}
                    className="border-0 p-0 bg-transparent w-100"
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
        <div className={`card border-0 shadow-sm ${className}`}>
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-bolt text-warning me-2"></i>
                        {title}
                    </h5>

                    {/* Optional toolbar */}
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
                                    <i className="fas fa-plus me-2"></i>
                                    Add Custom Action
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item">
                                    <i className="fas fa-edit me-2"></i>
                                    Customize Layout
                                </button>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button className="dropdown-item">
                                    <i className="fas fa-undo me-2"></i>
                                    Reset to Default
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div className="row g-3">
                    {displayActions.map((action, index) => (
                        <div
                            key={action.id || index}
                            className={getColumnClass()}
                        >
                            <ActionCard action={action} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Optional Footer with Action Summary */}
            <div className="card-footer bg-light">
                <div className="row text-center">
                    <div className="col-4">
                        <small className="text-muted d-block">
                            Total Actions
                        </small>
                        <strong className="text-primary">
                            {displayActions.length}
                        </strong>
                    </div>
                    <div className="col-4">
                        <small className="text-muted d-block">
                            Quick Access
                        </small>
                        <strong className="text-success">
                            <i className="fas fa-check-circle me-1"></i>
                            Available
                        </strong>
                    </div>
                    <div className="col-4">
                        <small className="text-muted d-block">Most Used</small>
                        <strong className="text-info">
                            {displayActions[0]?.title || "Create Staff"}
                        </strong>
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
            color: "primary",
            link: "/admin/staff/create",
        },
        {
            id: "manage-users",
            title: "Manage Users",
            description: "View and manage all platform users",
            icon: "fas fa-users",
            color: "info",
            link: "/admin/users",
        },
        {
            id: "view-reports",
            title: "Analytics",
            description: "View reports and system insights",
            icon: "fas fa-chart-bar",
            color: "success",
            link: "/admin/reports",
        },
        {
            id: "system-settings",
            title: "Settings",
            description: "Configure system preferences",
            icon: "fas fa-cogs",
            color: "warning",
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
            color: "primary",
            link: "/staff/categories",
        },
        {
            id: "manage-users",
            title: "User Management",
            description: "Handle user accounts and issues",
            icon: "fas fa-users",
            color: "info",
            link: "/staff/users",
        },
        {
            id: "support-tickets",
            title: "Support Tickets",
            description: "View and respond to user issues",
            icon: "fas fa-headset",
            color: "warning",
            link: "/staff/support",
            badge: "New",
            badgeColor: "danger",
        },
        {
            id: "reports",
            title: "Generate Reports",
            description: "Create user and activity reports",
            icon: "fas fa-file-chart",
            color: "success",
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
            color: "primary",
            onClick: () => onAction && onAction("export-users"),
        },
        {
            id: "backup-system",
            title: "System Backup",
            description: "Create system backup",
            icon: "fas fa-database",
            color: "success",
            onClick: () => onAction && onAction("backup-system"),
        },
        {
            id: "send-notifications",
            title: "Send Notifications",
            description: "Broadcast message to users",
            icon: "fas fa-bullhorn",
            color: "warning",
            onClick: () => onAction && onAction("send-notifications"),
        },
        {
            id: "system-health",
            title: "System Health",
            description: "Check system status",
            icon: "fas fa-heartbeat",
            color: "danger",
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

// Emergency Actions Component
export const EmergencyActions = ({ onAction = null }) => {
    const emergencyActions = [
        {
            id: "maintenance-mode",
            title: "Maintenance Mode",
            description: "Enable maintenance mode",
            icon: "fas fa-wrench",
            color: "warning",
            onClick: () => onAction && onAction("maintenance-mode"),
        },
        {
            id: "emergency-shutdown",
            title: "Emergency Stop",
            description: "Emergency system shutdown",
            icon: "fas fa-power-off",
            color: "danger",
            onClick: () => onAction && onAction("emergency-shutdown"),
        },
    ];

    return (
        <QuickActions
            actions={emergencyActions}
            title="Emergency Actions"
            columns={2}
            className="border-danger"
        />
    );
};

export default QuickActions;
