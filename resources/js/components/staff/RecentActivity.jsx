import React from "react";
import { constructProfileImageUrl } from "../../hooks/useServiceImages";

// User Activity Feed Component
export const UserActivityFeed = ({ users = [], loading = false }) => {
    const ActivitySkeleton = () => (
        <div className="activity-item skeleton">
            <div className="activity-avatar">
                <div className="placeholder-glow">
                    <span className="placeholder avatar-placeholder"></span>
                </div>
            </div>
            <div className="activity-content">
                <div className="placeholder-glow">
                    <span className="placeholder content-placeholder-title"></span>
                    <span className="placeholder content-placeholder-subtitle"></span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-users text-primary me-2"></i>
                        <span>Recent User Activity</span>
                    </h5>
                    <span className="badge bg-primary">{users.length}</span>
                </div>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="activity-list">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ActivitySkeleton key={i} />
                        ))}
                    </div>
                ) : users && users.length > 0 ? (
                    <div className="activity-list">
                        {users.slice(0, 8).map((user, index) => (
                            <div
                                key={user.id || index}
                                className="activity-item"
                            >
                                <div className="activity-avatar">
                                    {(() => {
                                        const profileImageUrl = constructProfileImageUrl(user.profile_picture);
                                        return profileImageUrl ? (
                                            <img
                                                src={profileImageUrl}
                                                alt={user.name || user.full_name}
                                                className="avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                    const fallback = e.target.nextSibling;
                                                    if (fallback) {
                                                        fallback.style.display = "flex";
                                                    }
                                                }}
                                            />
                                        ) : null;
                                    })()}
                                    {/* Fallback avatar */}
                                    <div
                                        className="avatar-placeholder primary"
                                        style={{
                                            display: user.profile_picture ? "none" : "flex",
                                        }}
                                    >
                                        <span className="placeholder-initial">
                                            {(user.name || user.full_name || "U")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                    {user.profile_picture && (
                                        <div className="avatar-placeholder primary">
                                            <i className="fas fa-user"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <h6 className="activity-user-name">
                                            {user.name || user.full_name}
                                            <span
                                                className={`role-badge ${getRoleBadgeVariant(
                                                    user.role
                                                )}`}
                                            >
                                                {formatRole(user.role)}
                                            </span>
                                        </h6>
                                        <small className="activity-time">
                                            {user.last_login ||
                                                formatTimeAgo(user.created_at)}
                                        </small>
                                    </div>
                                    <p className="activity-description">
                                        {user.activity ||
                                            `Joined ${formatDate(
                                                user.created_at ||
                                                    user.last_login
                                            )}`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-small">
                        <div className="empty-state-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <h6 className="empty-state-title">
                            No recent user activity
                        </h6>
                        <p className="empty-state-description">
                            User activity will appear here as users join and
                            interact with the platform.
                        </p>
                    </div>
                )}
            </div>
            <div className="dashboard-card-footer">
                <div className="card-footer-content">
                    <small className="footer-text">
                        <i className="fas fa-clock"></i>
                        <span>
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </small>
                    <a
                        href="/staff/users"
                        className="btn btn-sm btn-outline-primary"
                    >
                        <i className="fas fa-users"></i>
                        <span>View All Users</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Staff Activity Feed Component
export const StaffActivityFeed = ({ activities = [], loading = false }) => {
    const ActivitySkeleton = () => (
        <div className="activity-item skeleton">
            <div className="activity-timeline-icon">
                <div className="placeholder-glow">
                    <span className="placeholder timeline-icon-placeholder"></span>
                </div>
            </div>
            <div className="activity-content">
                <div className="placeholder-glow">
                    <span className="placeholder content-placeholder-title"></span>
                    <span className="placeholder content-placeholder-subtitle"></span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-card staff-activity-card">
            <div className="dashboard-card-header">
                <div className="header-content">
                    <h6 className="dashboard-card-title">
                        <i className="fas fa-history"></i>
                        <span>Staff Activities</span>
                    </h6>
                    <span className="badge success">{activities.length}</span>
                </div>
            </div>
            <div className="dashboard-card-body">
                {loading ? (
                    <div className="activity-timeline">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ActivitySkeleton key={i} />
                        ))}
                    </div>
                ) : activities && activities.length > 0 ? (
                    <div className="activity-timeline">
                        {activities.slice(0, 8).map((activity, index) => (
                            <div
                                key={activity.id || index}
                                className="activity-item timeline-item"
                            >
                                <div className="activity-timeline-icon">
                                    <div
                                        className={`timeline-icon ${
                                            activity.color ||
                                            getActivityVariant(
                                                activity.action_type
                                            )
                                        }`}
                                    >
                                        <i
                                            className={
                                                activity.icon ||
                                                getActivityIcon(
                                                    activity.action_type
                                                )
                                            }
                                        ></i>
                                    </div>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <p className="activity-description">
                                            <strong>
                                                {activity.staff_name ||
                                                    "Staff Member"}
                                            </strong>{" "}
                                            {activity.description ||
                                                activity.action}
                                        </p>
                                    </div>
                                    <div className="activity-meta">
                                        <small className="activity-time">
                                            <i className="fas fa-clock"></i>
                                            <span>
                                                {activity.formatted_time ||
                                                    formatTimeAgo(
                                                        activity.created_at
                                                    )}
                                            </span>
                                        </small>
                                        {activity.target_type && (
                                            <span className="activity-target">
                                                {formatTargetType(
                                                    activity.target_type
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state-small">
                        <div className="empty-state-icon">
                            <i className="fas fa-history"></i>
                        </div>
                        <h6 className="empty-state-title">
                            No recent activities
                        </h6>
                        <p className="empty-state-description">
                            Staff activities will appear here as actions are
                            performed.
                        </p>
                    </div>
                )}
            </div>
            <div className="dashboard-card-footer">
                <div className="card-footer-content">
                    <small className="footer-text">
                        <i className="fas fa-sync-alt"></i>
                        <span>Auto-refreshes every 30 seconds</span>
                    </small>
                    <a
                        href="/staff/activities"
                        className="btn btn-sm btn-outline-success"
                    >
                        <i className="fas fa-list"></i>
                        <span>View Full Log</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getRoleBadgeVariant = (role) => {
    const variants = {
        client: "primary",
        service_provider: "success",
        staff: "warning",
        admin: "danger",
    };
    return variants[role] || "secondary";
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

const getActivityVariant = (actionType) => {
    const variants = {
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
    return variants[actionType] || "primary";
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
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Recently";
        }
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (error) {
        console.warn("Invalid date format:", dateString);
        return "Recently";
    }
};

const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    try {
        const date = new Date(dateString);
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Recently";
        }
        
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 30) return `${days}d ago`;
        
        // For older dates, show formatted date
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        });
    } catch (error) {
        console.warn("Invalid date format:", dateString);
        return "Recently";
    }
};
