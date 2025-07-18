import React from "react";

// Staff Quick Actions Component
export const StaffQuickActions = ({ onAction }) => {
    const quickActions = [
        {
            id: "manage-categories",
            title: "Manage Categories",
            description: "Create and manage service categories",
            icon: "fas fa-tags",
            variant: "primary",
            count: null,
        },
        {
            id: "review-providers",
            title: "Review Providers",
            description: "Approve pending service providers",
            icon: "fas fa-user-check",
            variant: "warning",
            count: null,
        },
        {
            id: "view-reports",
            title: "View Reports",
            description: "Access platform analytics and reports",
            icon: "fas fa-chart-bar",
            variant: "success",
            count: null,
        },
        {
            id: "handle-disputes",
            title: "Handle Disputes",
            description: "Resolve user disputes and issues",
            icon: "fas fa-balance-scale",
            variant: "danger",
            count: null,
        },
    ];

    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action.id);
        }
    };

    return (
        <div className="dashboard-card quick-actions-card">
            <div className="dashboard-card-header">
                <h6 className="dashboard-card-title">
                    <i className="fas fa-bolt"></i>
                    <span>Quick Actions</span>
                </h6>
            </div>
            <div className="dashboard-card-body">
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className={`action-btn ${action.variant}`}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="action-btn-content">
                                <div className="action-btn-icon">
                                    <i className={action.icon}></i>
                                </div>
                                <div className="action-btn-text">
                                    <div className="action-btn-title">
                                        {action.title}
                                    </div>
                                    <div className="action-btn-description">
                                        {action.description}
                                    </div>
                                </div>
                                {action.count && (
                                    <div className="action-btn-badge">
                                        <span
                                            className={`badge ${action.variant}`}
                                        >
                                            {action.count}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="dashboard-card-footer">
                <div className="card-footer-content">
                    <small className="footer-text">
                        <i className="fas fa-info-circle"></i>
                        <span>Click any action to get started</span>
                    </small>
                </div>
            </div>
        </div>
    );
};

// Management Quick Actions Component
export const ManagementQuickActions = ({ stats = {}, onAction }) => {
    const managementActions = [
        {
            id: "approve-providers",
            title: "Approve Providers",
            description: `${
                stats.pendingProviders || 0
            } providers awaiting approval`,
            icon: "fas fa-user-check",
            variant: stats.pendingProviders > 0 ? "warning" : "success",
            urgent: stats.pendingProviders > 5,
            count: stats.pendingProviders || 0,
        },
        {
            id: "activate-categories",
            title: "Review Categories",
            description: `${
                stats.inactiveCategories || 0
            } categories are inactive`,
            icon: "fas fa-tags",
            variant: stats.inactiveCategories > 0 ? "info" : "success",
            urgent: false,
            count: stats.inactiveCategories || 0,
        },
        {
            id: "welcome-users",
            title: "Welcome New Users",
            description: `${stats.newUsers || 0} new users joined today`,
            icon: "fas fa-user-plus",
            variant: stats.newUsers > 0 ? "primary" : "secondary",
            urgent: false,
            count: stats.newUsers || 0,
        },
        {
            id: "system-health",
            title: "System Health Check",
            description: "Monitor platform performance",
            icon: "fas fa-heartbeat",
            variant: "success",
            urgent: false,
            count: null,
        },
    ];

    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action.id);
        }
    };

    return (
        <div className="dashboard-card management-actions-card">
            <div className="dashboard-card-header">
                <div className="header-content">
                    <h6 className="dashboard-card-title">
                        <i className="fas fa-tasks"></i>
                        <span>Management Tasks</span>
                    </h6>
                    <span className="badge primary">
                        {managementActions.filter((a) => a.count > 0).length}{" "}
                        active
                    </span>
                </div>
            </div>
            <div className="dashboard-card-body">
                <div className="management-actions-list">
                    {managementActions.map((action) => (
                        <div
                            key={action.id}
                            className={`management-action-item ${
                                action.urgent ? "urgent" : ""
                            }`}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="action-item-icon">
                                <div
                                    className={`icon-container ${action.variant}`}
                                >
                                    <i className={action.icon}></i>
                                </div>
                            </div>
                            <div className="action-item-content">
                                <div className="action-item-header">
                                    <h6 className="action-item-title">
                                        {action.title}
                                        {action.urgent && (
                                            <i className="fas fa-exclamation-triangle urgent-indicator"></i>
                                        )}
                                    </h6>
                                    <div className="action-item-meta">
                                        {action.count !== null &&
                                            action.count > 0 && (
                                                <span
                                                    className={`badge ${action.variant}`}
                                                >
                                                    {action.count}
                                                </span>
                                            )}
                                        <i className="fas fa-chevron-right action-arrow"></i>
                                    </div>
                                </div>
                                <p className="action-item-description">
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="dashboard-card-footer">
                <div className="card-footer-content">
                    <small className="footer-text">
                        <i className="fas fa-clock"></i>
                        <span>Updated: {new Date().toLocaleTimeString()}</span>
                    </small>
                    <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-list"></i>
                        <span>View All Tasks</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
