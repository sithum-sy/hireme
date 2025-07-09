import React from "react";

// Staff Quick Actions Component
export const StaffQuickActions = ({ onAction }) => {
    const quickActions = [
        {
            id: "manage-categories",
            title: "Manage Categories",
            description: "Create and manage service categories",
            icon: "fas fa-tags",
            color: "primary",
            count: null,
        },
        {
            id: "review-providers",
            title: "Review Providers",
            description: "Approve pending service providers",
            icon: "fas fa-user-check",
            color: "warning",
            count: null,
        },
        {
            id: "view-reports",
            title: "View Reports",
            description: "Access platform analytics and reports",
            icon: "fas fa-chart-bar",
            color: "success",
            count: null,
        },
        {
            id: "handle-disputes",
            title: "Handle Disputes",
            description: "Resolve user disputes and issues",
            icon: "fas fa-balance-scale",
            color: "danger",
            count: null,
        },
    ];

    const handleActionClick = (action) => {
        if (onAction) {
            onAction(action.id);
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">
                    <i className="fas fa-bolt text-warning me-2"></i>
                    Quick Actions
                </h5>
            </div>
            <div className="card-body">
                <div className="d-grid gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className={`btn btn-outline-${action.color} text-start`}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <i className={`${action.icon} fa-lg`}></i>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="fw-semibold">
                                        {action.title}
                                    </div>
                                    <small className="text-muted">
                                        {action.description}
                                    </small>
                                </div>
                                {action.count && (
                                    <div className="ms-2">
                                        <span
                                            className={`badge bg-${action.color}`}
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
            <div className="card-footer bg-light">
                <div className="text-center">
                    <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Click any action to get started
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
            color: stats.pendingProviders > 0 ? "warning" : "success",
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
            color: stats.inactiveCategories > 0 ? "info" : "success",
            urgent: false,
            count: stats.inactiveCategories || 0,
        },
        {
            id: "welcome-users",
            title: "Welcome New Users",
            description: `${stats.newUsers || 0} new users joined today`,
            icon: "fas fa-user-plus",
            color: stats.newUsers > 0 ? "primary" : "secondary",
            urgent: false,
            count: stats.newUsers || 0,
        },
        {
            id: "system-health",
            title: "System Health Check",
            description: "Monitor platform performance",
            icon: "fas fa-heartbeat",
            color: "success",
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
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-tasks text-primary me-2"></i>
                        Management Tasks
                    </h5>
                    <span className="badge bg-primary">
                        {managementActions.filter((a) => a.count > 0).length}{" "}
                        active
                    </span>
                </div>
            </div>
            <div className="card-body">
                <div className="list-group list-group-flush">
                    {managementActions.map((action) => (
                        <div
                            key={action.id}
                            className={`list-group-item list-group-item-action border-0 ${
                                action.urgent ? "bg-warning bg-opacity-10" : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <div
                                        className={`bg-${action.color} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i
                                            className={`${action.icon} text-${action.color}`}
                                        ></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="mb-1">
                                                {action.title}
                                                {action.urgent && (
                                                    <i className="fas fa-exclamation-triangle text-warning ms-2"></i>
                                                )}
                                            </h6>
                                            <p className="text-muted mb-0 small">
                                                {action.description}
                                            </p>
                                        </div>
                                        <div className="text-end">
                                            {action.count !== null &&
                                                action.count > 0 && (
                                                    <span
                                                        className={`badge bg-${action.color} mb-1`}
                                                    >
                                                        {action.count}
                                                    </span>
                                                )}
                                            <div>
                                                <i className="fas fa-chevron-right text-muted"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Updated: {new Date().toLocaleTimeString()}
                    </small>
                    <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-list me-1"></i>
                        View All Tasks
                    </button>
                </div>
            </div>
        </div>
    );
};
