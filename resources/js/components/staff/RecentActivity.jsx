import React from "react";

// User Activity Feed Component
export const UserActivityFeed = ({ users = [], loading = false }) => {
    const ActivitySkeleton = () => (
        <div className="d-flex align-items-center mb-3">
            <div className="placeholder-glow me-3">
                <span
                    className="placeholder rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                ></span>
            </div>
            <div className="flex-grow-1 placeholder-glow">
                <span className="placeholder col-8"></span>
                <br />
                <span className="placeholder col-6"></span>
            </div>
        </div>
    );

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-users text-primary me-2"></i>
                        Recent User Activity
                    </h5>
                    <span className="badge bg-primary">{users.length}</span>
                </div>
            </div>
            <div className="card-body">
                {loading ? (
                    <>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ActivitySkeleton key={i} />
                        ))}
                    </>
                ) : users && users.length > 0 ? (
                    <div className="activity-feed">
                        {users.slice(0, 8).map((user, index) => (
                            <div
                                key={user.id || index}
                                className="d-flex align-items-center mb-3"
                            >
                                <div className="me-3">
                                    <div
                                        className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    >
                                        {user.profile_picture ? (
                                            <img
                                                src={user.profile_picture}
                                                alt={
                                                    user.name || user.full_name
                                                }
                                                className="rounded-circle"
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <i className="fas fa-user text-primary"></i>
                                        )}
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="mb-1">
                                                {user.name || user.full_name}
                                                <span
                                                    className={`badge bg-${getRoleBadgeColor(
                                                        user.role
                                                    )} ms-2`}
                                                >
                                                    {formatRole(user.role)}
                                                </span>
                                            </h6>
                                            <p className="text-muted mb-0 small">
                                                {user.activity ||
                                                    `Joined ${formatDate(
                                                        user.created_at ||
                                                            user.last_login
                                                    )}`}
                                            </p>
                                        </div>
                                        <small className="text-muted">
                                            {user.last_login ||
                                                formatTimeAgo(user.created_at)}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <i className="fas fa-users fa-3x text-muted mb-3"></i>
                        <h6 className="text-muted">No recent user activity</h6>
                        <p className="text-muted small mb-0">
                            User activity will appear here as users join and
                            interact with the platform.
                        </p>
                    </div>
                )}
            </div>
            <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Last updated: {new Date().toLocaleTimeString()}
                    </small>
                    <a
                        href="/staff/users"
                        className="btn btn-sm btn-outline-primary"
                    >
                        <i className="fas fa-users me-1"></i>
                        View All Users
                    </a>
                </div>
            </div>
        </div>
    );
};

// Staff Activity Feed Component
export const StaffActivityFeed = ({ activities = [], loading = false }) => {
    const ActivitySkeleton = () => (
        <div className="d-flex align-items-start mb-3">
            <div className="placeholder-glow me-3">
                <span
                    className="placeholder rounded-circle"
                    style={{ width: "32px", height: "32px" }}
                ></span>
            </div>
            <div className="flex-grow-1 placeholder-glow">
                <span className="placeholder col-10"></span>
                <br />
                <span className="placeholder col-6"></span>
            </div>
        </div>
    );

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-history text-success me-2"></i>
                        Staff Activities
                    </h5>
                    <span className="badge bg-success">
                        {activities.length}
                    </span>
                </div>
            </div>
            <div className="card-body">
                {loading ? (
                    <>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ActivitySkeleton key={i} />
                        ))}
                    </>
                ) : activities && activities.length > 0 ? (
                    <div className="activity-timeline">
                        {activities.slice(0, 8).map((activity, index) => (
                            <div
                                key={activity.id || index}
                                className="d-flex align-items-start mb-3"
                            >
                                <div className="me-3">
                                    <div
                                        className={`bg-${
                                            activity.color ||
                                            getActivityColor(
                                                activity.action_type
                                            )
                                        } bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                        style={{
                                            width: "32px",
                                            height: "32px",
                                        }}
                                    >
                                        <i
                                            className={`${
                                                activity.icon ||
                                                getActivityIcon(
                                                    activity.action_type
                                                )
                                            } text-${
                                                activity.color ||
                                                getActivityColor(
                                                    activity.action_type
                                                )
                                            } fa-sm`}
                                        ></i>
                                    </div>
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <p className="mb-1">
                                                <strong>
                                                    {activity.staff_name ||
                                                        "Staff Member"}
                                                </strong>{" "}
                                                {activity.description ||
                                                    activity.action}
                                            </p>
                                            <div className="d-flex align-items-center">
                                                <small className="text-muted me-2">
                                                    <i className="fas fa-clock me-1"></i>
                                                    {activity.formatted_time ||
                                                        formatTimeAgo(
                                                            activity.created_at
                                                        )}
                                                </small>
                                                {activity.target_type && (
                                                    <span className="badge bg-light text-dark">
                                                        {formatTargetType(
                                                            activity.target_type
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <i className="fas fa-history fa-3x text-muted mb-3"></i>
                        <h6 className="text-muted">No recent activities</h6>
                        <p className="text-muted small mb-0">
                            Staff activities will appear here as actions are
                            performed.
                        </p>
                    </div>
                )}
            </div>
            <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <i className="fas fa-sync-alt me-1"></i>
                        Auto-refreshes every 30 seconds
                    </small>
                    <a
                        href="/staff/activities"
                        className="btn btn-sm btn-outline-success"
                    >
                        <i className="fas fa-list me-1"></i>
                        View Full Log
                    </a>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getRoleBadgeColor = (role) => {
    const colors = {
        client: "primary",
        service_provider: "success",
        staff: "warning",
        admin: "danger",
    };
    return colors[role] || "secondary";
};

const formatRole = (role) => {
    const roles = {
        client: "Client",
        service_provider: "Provider",
        staff: "Staff",
        admin: "Admin",
    };
    return roles[role] || role;
};

const getActivityColor = (actionType) => {
    const colors = {
        create: "success",
        update: "warning",
        delete: "danger",
        view: "info",
        activate: "success",
        deactivate: "secondary",
        approve: "success",
        reject: "danger",
        login: "primary",
        logout: "secondary",
    };
    return colors[actionType] || "primary";
};

const getActivityIcon = (actionType) => {
    const icons = {
        create: "fas fa-plus",
        update: "fas fa-edit",
        delete: "fas fa-trash",
        view: "fas fa-eye",
        activate: "fas fa-check",
        deactivate: "fas fa-pause",
        approve: "fas fa-check-circle",
        reject: "fas fa-times-circle",
        login: "fas fa-sign-in-alt",
        logout: "fas fa-sign-out-alt",
    };
    return icons[actionType] || "fas fa-cog";
};

const formatTargetType = (targetType) => {
    return targetType.replace("App\\Models\\", "").replace("_", " ");
};

const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};
