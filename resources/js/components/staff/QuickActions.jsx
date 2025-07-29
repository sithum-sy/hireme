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
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <h5 className="card-title mb-0">
                    <i className="fas fa-bolt text-primary me-2"></i>
                    <span>Quick Actions</span>
                </h5>
            </div>
            <div className="card-body">
                <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                    {quickActions.map((action) => (
                        <button
                            key={action.id}
                            className={`btn p-0 border-0 bg-transparent h-100`}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="card h-100 border border-2 border-opacity-25">
                                <div className="card-body text-center d-flex flex-column">
                                    <div
                                        className={`mb-3 rounded-circle d-inline-flex align-items-center justify-content-center bg-${action.variant} bg-opacity-10 text-${action.variant} mx-auto`}
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                        }}
                                    >
                                        <i
                                            className={`${action.icon} fa-2x`}
                                        ></i>
                                    </div>
                                    <h6 className="card-title fw-bold mb-2">
                                        {action.title}
                                    </h6>
                                    <p className="card-text text-muted small flex-grow-1">
                                        {action.description}
                                    </p>
                                    {action.count && (
                                        <div className="mt-2">
                                            <span
                                                className={`badge bg-${action.variant}`}
                                            >
                                                {action.count}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <div className="card-footer bg-light">
                <div className="text-center">
                    <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-tasks text-primary me-2"></i>
                        <span>Management Tasks</span>
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
                            className={`list-group-item list-group-item-action border-0 px-0 cursor-pointer ${
                                action.urgent
                                    ? "bg-secondary bg-opacity-10"
                                    : ""
                            }`}
                            onClick={() => handleActionClick(action)}
                        >
                            <div className="d-flex align-items-center">
                                <div className="me-3">
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center bg-${action.variant} bg-opacity-10 text-${action.variant}`}
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        <i className={action.icon}></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <h6 className="mb-1 fw-semibold">
                                            {action.title}
                                            {action.urgent && (
                                                <i className="fas fa-exclamation-triangle text-warning ms-2"></i>
                                            )}
                                        </h6>
                                        <div className="d-flex align-items-center gap-2">
                                            {action.count !== null &&
                                                action.count > 0 && (
                                                    <span
                                                        className={`badge bg-${action.variant}`}
                                                    >
                                                        {action.count}
                                                    </span>
                                                )}
                                            <i className="fas fa-chevron-right text-muted"></i>
                                        </div>
                                    </div>
                                    <p className="text-muted mb-0 small">
                                        {action.description}
                                    </p>
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
                        <span>Updated: {new Date().toLocaleTimeString()}</span>
                    </small>
                    <button className="btn btn-sm btn-outline-primary">
                        <i className="fas fa-list me-1"></i>
                        <span>View All Tasks</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
