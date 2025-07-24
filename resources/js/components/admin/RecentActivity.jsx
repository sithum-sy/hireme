import React, { useState } from "react";
import { Link } from "react-router-dom";

const RecentActivity = ({
    activities = [],
    loading = false,
    title = "Recent Activity",
    maxItems = 5,
    showViewAll = true,
    viewAllLink = "/admin/reports/activities",
    className = "",
}) => {
    const [filter, setFilter] = useState("all");

    const ActivitySkeleton = () => (
        <div className="list-group-item border-0 px-0 py-3">
            <div className="d-flex align-items-center">
                <div className="me-3">
                    <div className="placeholder-glow">
                        <div
                            className="placeholder rounded-circle"
                            style={{ width: "40px", height: "40px" }}
                        ></div>
                    </div>
                </div>
                <div className="flex-grow-1">
                    <div className="placeholder-glow">
                        <h6 className="mb-1">
                            <span className="placeholder col-8"></span>
                        </h6>
                        <small>
                            <span className="placeholder col-10"></span>
                        </small>
                    </div>
                </div>
                <div className="placeholder-glow">
                    <small>
                        <span className="placeholder col-4"></span>
                    </small>
                </div>
            </div>
        </div>
    );

    const formatActivityTime = (timestamp) => {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInSeconds = Math.floor((now - activityTime) / 1000);

        if (diffInSeconds < 60) {
            return "Just now";
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}m ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}h ago`;
        } else if (diffInSeconds < 604800) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}d ago`;
        } else {
            return activityTime.toLocaleDateString();
        }
    };

    const getActivityIcon = (activity) => {
        const typeIcons = {
            user_registration: "fas fa-user-plus",
            service_creation: "fas fa-concierge-bell",
            staff_creation: "fas fa-user-tie",
            appointment_booking: "fas fa-calendar-plus",
            appointment_completion: "fas fa-calendar-check",
            user_activation: "fas fa-user-check",
            user_deactivation: "fas fa-user-times",
            service_activation: "fas fa-toggle-on",
            service_deactivation: "fas fa-toggle-off",
            profile_update: "fas fa-edit",
            password_change: "fas fa-key",
            login: "fas fa-sign-in-alt",
            logout: "fas fa-sign-out-alt",
        };

        return typeIcons[activity.type] || "fas fa-info-circle";
    };

    const getActivityColor = (activity) => {
        const typeColors = {
            user_registration: "success",
            service_creation: "primary",
            staff_creation: "info",
            appointment_booking: "warning",
            appointment_completion: "success",
            user_activation: "success",
            user_deactivation: "danger",
            service_activation: "success",
            service_deactivation: "warning",
            profile_update: "info",
            password_change: "warning",
            login: "success",
            logout: "secondary",
        };

        return typeColors[activity.type] || "secondary";
    };

    const formatUserRole = (role) => {
        const roleMap = {
            client: "Client",
            service_provider: "Service Provider",
            admin: "Administrator",
            staff: "Staff Member",
        };
        return roleMap[role] || role;
    };

    // Filter activities based on selected filter
    const filteredActivities = activities.filter((activity) => {
        if (filter === "all") return true;
        if (filter === "users") return activity.type?.includes("user");
        if (filter === "services") return activity.type?.includes("service");
        if (filter === "appointments")
            return activity.type?.includes("appointment");
        return true;
    });

    const displayActivities = filteredActivities.slice(0, maxItems);

    const filterOptions = [
        { value: "all", label: "All Activities", icon: "fas fa-list" },
        { value: "users", label: "User Activities", icon: "fas fa-users" },
        {
            value: "services",
            label: "Service Activities",
            icon: "fas fa-concierge-bell",
        },
        {
            value: "appointments",
            label: "Appointments",
            icon: "fas fa-calendar",
        },
    ];

    return (
        <div className={`card border-0 shadow-sm ${className}`}>
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-clock text-success me-2"></i>
                        {title}
                    </h5>

                    <div className="d-flex gap-2 align-items-center">
                        {/* Activity Filter */}
                        <div className="dropdown">
                            <button
                                className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                            >
                                <i
                                    className={
                                        filterOptions.find(
                                            (opt) => opt.value === filter
                                        )?.icon || "fas fa-filter"
                                    }
                                ></i>
                                <span className="d-none d-md-inline ms-1">
                                    {filterOptions.find(
                                        (opt) => opt.value === filter
                                    )?.label || "Filter"}
                                </span>
                            </button>
                            <ul className="dropdown-menu">
                                {filterOptions.map((option) => (
                                    <li key={option.value}>
                                        <button
                                            className={`dropdown-item ${
                                                filter === option.value
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setFilter(option.value)
                                            }
                                        >
                                            <i
                                                className={`${option.icon} me-2`}
                                            ></i>
                                            {option.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* View All Link */}
                        {showViewAll && (
                            <Link
                                to={viewAllLink}
                                className="btn btn-sm btn-outline-primary"
                            >
                                <i className="fas fa-external-link-alt me-1"></i>
                                View All
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="card-body">
                {loading ? (
                    <div className="list-group list-group-flush">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <ActivitySkeleton key={i} />
                        ))}
                    </div>
                ) : displayActivities.length > 0 ? (
                    <div className="list-group list-group-flush">
                        {displayActivities.map((activity, index) => (
                            <div
                                key={activity.id || index}
                                className="list-group-item border-0 px-0 py-3 transition"
                            >
                                <div className="d-flex align-items-start">
                                    {/* Activity Icon */}
                                    <div className="me-3">
                                        <div
                                            className={`bg-${getActivityColor(
                                                activity
                                            )} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                minWidth: "40px",
                                            }}
                                        >
                                            <i
                                                className={`${getActivityIcon(
                                                    activity
                                                )} text-${getActivityColor(
                                                    activity
                                                )}`}
                                            ></i>
                                        </div>
                                    </div>

                                    {/* Activity Content */}
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <h6 className="mb-1 fw-semibold">
                                                {activity.description ||
                                                    activity.title ||
                                                    "Activity"}
                                            </h6>
                                            <small className="text-muted ms-2">
                                                {formatActivityTime(
                                                    activity.timestamp ||
                                                        activity.created_at
                                                )}
                                            </small>
                                        </div>

                                        {/* Activity Details */}
                                        {activity.user && (
                                            <small className="text-muted d-block mb-1">
                                                <i className="fas fa-user me-1"></i>
                                                {activity.user}{" "}
                                                {activity.details?.role &&
                                                    `(${formatUserRole(
                                                        activity.details.role
                                                    )})`}
                                            </small>
                                        )}

                                        {/* Additional Details */}
                                        {activity.details && (
                                            <div className="mt-2">
                                                {activity.details.email && (
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-envelope me-1"></i>
                                                        {activity.details.email}
                                                    </small>
                                                )}

                                                {activity.details
                                                    .service_title && (
                                                    <small className="text-muted d-block">
                                                        <i className="fas fa-concierge-bell me-1"></i>
                                                        {
                                                            activity.details
                                                                .service_title
                                                        }
                                                    </small>
                                                )}

                                                {activity.details.amount && (
                                                    <small className="text-success d-block">
                                                        <i className="fas fa-dollar-sign me-1"></i>
                                                        $
                                                        {
                                                            activity.details
                                                                .amount
                                                        }
                                                    </small>
                                                )}
                                            </div>
                                        )}

                                        {/* Action Tags */}
                                        {activity.type && (
                                            <div className="mt-2">
                                                <span
                                                    className={`badge bg-${getActivityColor(
                                                        activity
                                                    )} bg-opacity-10 text-${getActivityColor(
                                                        activity
                                                    )} rounded-pill`}
                                                >
                                                    {activity.type
                                                        .replace(/_/g, " ")
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Actions */}
                                    {activity.actionable && (
                                        <div className="ms-2">
                                            <div className="dropdown">
                                                <button
                                                    className="btn btn-sm btn-outline-secondary"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                >
                                                    <i className="fas fa-ellipsis-v"></i>
                                                </button>
                                                <ul className="dropdown-menu dropdown-menu-end">
                                                    <li>
                                                        <Link
                                                            to={`/admin/users/${activity.details?.user_id}`}
                                                            className="dropdown-item"
                                                        >
                                                            <i className="fas fa-eye me-2"></i>
                                                            View Details
                                                        </Link>
                                                    </li>
                                                    {activity.details
                                                        ?.user_id && (
                                                        <li>
                                                            <Link
                                                                to={`/admin/users/${activity.details.user_id}`}
                                                                className="dropdown-item"
                                                            >
                                                                <i className="fas fa-user me-2"></i>
                                                                View User
                                                            </Link>
                                                        </li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                        <h5 className="text-muted">No Recent Activity</h5>
                        <p className="text-muted mb-0">
                            {filter === "all"
                                ? "No activities have been recorded yet"
                                : `No ${filter} activities found`}
                        </p>
                        {filter !== "all" && (
                            <button
                                className="btn btn-sm btn-outline-primary mt-2"
                                onClick={() => setFilter("all")}
                            >
                                Show All Activities
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Activity Summary Footer */}
            {displayActivities.length > 0 && !loading && (
                <div className="card-footer bg-light">
                    <div className="row text-center">
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Total Activities
                            </small>
                            <strong className="text-primary">
                                {activities.length}
                            </strong>
                        </div>
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Showing
                            </small>
                            <strong className="text-info">
                                {Math.min(maxItems, filteredActivities.length)}
                            </strong>
                        </div>
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Last Updated
                            </small>
                            <strong className="text-success">
                                {activities.length > 0
                                    ? formatActivityTime(
                                          activities[0].timestamp ||
                                              activities[0].created_at
                                      )
                                    : "N/A"}
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Specialized Recent Activity Components
export const UserActivityFeed = ({ users = [], loading = false }) => {
    const userActivities = users.map((user) => ({
        id: user.id,
        type: "user_registration",
        description: `New ${
            user.role === "service_provider" ? "service provider" : "client"
        } registered`,
        user: user.name || user.full_name,
        timestamp: user.created_at,
        details: {
            user_id: user.id,
            email: user.email,
            role: user.role,
        },
        actionable: true,
    }));

    return (
        <RecentActivity
            activities={userActivities}
            loading={loading}
            title="Recent User Registrations"
            maxItems={5}
            className="h-100"
        />
    );
};

export const ServiceActivityFeed = ({ services = [], loading = false }) => {
    const serviceActivities = services.map((service) => ({
        id: service.id,
        type: "service_creation",
        description: "New service created",
        user: service.provider?.name,
        timestamp: service.created_at,
        details: {
            service_id: service.id,
            service_title: service.title,
            provider_id: service.provider_id,
        },
        actionable: true,
    }));

    return (
        <RecentActivity
            activities={serviceActivities}
            loading={loading}
            title="Recent Service Activities"
            maxItems={5}
            className="h-100"
        />
    );
};

export const SystemActivityFeed = ({ activities = [], loading = false }) => {
    return (
        <RecentActivity
            activities={activities}
            loading={loading}
            title="System Activities"
            maxItems={8}
            showViewAll={true}
            viewAllLink="/admin/reports/activities"
            className="h-100"
        />
    );
};

export default RecentActivity;
