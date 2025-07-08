import React from "react";

const StatsCard = ({
    title,
    value,
    subtitle,
    icon,
    color = "primary",
    trend = null,
    loading = false,
    onClick = null,
    className = "",
}) => {
    const colorMap = {
        primary: "primary",
        success: "success",
        warning: "warning",
        info: "info",
        danger: "danger",
    };

    const trendIcon =
        trend?.type === "up"
            ? "fas fa-arrow-up"
            : trend?.type === "down"
            ? "fas fa-arrow-down"
            : trend?.type === "same"
            ? "fas fa-minus"
            : null;

    const trendColor =
        trend?.type === "up"
            ? "text-success"
            : trend?.type === "down"
            ? "text-danger"
            : "text-muted";

    const LoadingSkeleton = () => (
        <div className="d-flex align-items-center">
            <div className="flex-grow-1">
                <div className="placeholder-glow">
                    <span className="placeholder col-8 mb-2"></span>
                    <h3 className="mb-1">
                        <span className="placeholder col-6"></span>
                    </h3>
                    <small>
                        <span className="placeholder col-10"></span>
                    </small>
                </div>
            </div>
            <div className="ms-3">
                <div className="placeholder-glow">
                    <div
                        className="placeholder rounded-circle"
                        style={{ width: "48px", height: "48px" }}
                    ></div>
                </div>
            </div>
        </div>
    );

    const formatValue = (val) => {
        if (typeof val === "number") {
            if (val >= 1000000) {
                return (val / 1000000).toFixed(1) + "M";
            } else if (val >= 1000) {
                return (val / 1000).toFixed(1) + "K";
            }
            return val.toLocaleString();
        }
        return val;
    };

    return (
        <div className={`col-lg-3 col-md-6 mb-4 ${className}`}>
            <div
                className={`card border-0 shadow-sm hover-shadow ${
                    onClick ? "cursor-pointer" : ""
                }`}
                onClick={onClick}
                style={onClick ? { cursor: "pointer" } : {}}
            >
                <div className="card-body">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : (
                        <div className="d-flex align-items-center">
                            <div className="flex-grow-1">
                                <h6 className="text-muted text-uppercase mb-1 fw-semibold">
                                    {title}
                                </h6>
                                <h3 className="mb-1 fw-bold">
                                    {formatValue(value)}
                                </h3>
                                {(subtitle || trend) && (
                                    <small
                                        className={
                                            trend ? trendColor : "text-muted"
                                        }
                                    >
                                        {trend && trendIcon && (
                                            <i
                                                className={`${trendIcon} me-1`}
                                            ></i>
                                        )}
                                        {trend ? trend.text : subtitle}
                                    </small>
                                )}
                            </div>
                            <div className="ms-3">
                                <div
                                    className={`bg-${colorMap[color]} bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center`}
                                    style={{ width: "48px", height: "48px" }}
                                >
                                    <i
                                        className={`${icon} text-${colorMap[color]} fa-lg`}
                                    ></i>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional card footer for additional actions */}
                {onClick && (
                    <div className="card-footer bg-transparent border-top-0 pt-0">
                        <small className="text-muted">
                            <i className="fas fa-external-link-alt me-1"></i>
                            Click to view details
                        </small>
                    </div>
                )}
            </div>
        </div>
    );
};

// Preset configurations for common stats
export const UserStatsCard = ({ users, loading }) => (
    <StatsCard
        title="Total Users"
        value={users?.total || 0}
        subtitle={`${users?.recent_registrations || 0} this month`}
        icon="fas fa-users"
        color="primary"
        trend={{
            type: (users?.recent_registrations || 0) > 0 ? "up" : "same",
            text: `${users?.recent_registrations || 0} new this month`,
        }}
        loading={loading}
    />
);

export const ActiveUsersCard = ({ users, loading }) => {
    const activeRate =
        users?.total > 0 ? Math.round((users.active / users.total) * 100) : 0;

    return (
        <StatsCard
            title="Active Users"
            value={users?.active || 0}
            subtitle={`${activeRate}% active rate`}
            icon="fas fa-user-check"
            color="success"
            trend={{
                type:
                    activeRate >= 70
                        ? "up"
                        : activeRate >= 50
                        ? "same"
                        : "down",
                text: `${activeRate}% activity rate`,
            }}
            loading={loading}
        />
    );
};

export const ProvidersCard = ({ users, services, loading }) => (
    <StatsCard
        title="Service Providers"
        value={users?.providers || 0}
        subtitle={`${services?.total || 0} services offered`}
        icon="fas fa-user-tie"
        color="warning"
        loading={loading}
    />
);

export const StaffCard = ({ users, loading }) => (
    <StatsCard
        title="Staff Members"
        value={users?.staff || 0}
        subtitle="Administrative team"
        icon="fas fa-users-cog"
        color="info"
        loading={loading}
    />
);

// Specialized stats cards
export const AppointmentsCard = ({ appointments, loading }) => (
    <StatsCard
        title="Total Appointments"
        value={appointments?.total_appointments || 0}
        subtitle={`${appointments?.pending_appointments || 0} pending`}
        icon="fas fa-calendar-check"
        color="info"
        loading={loading}
    />
);

export const ServicesCard = ({ services, loading }) => {
    const activeRate =
        services?.total > 0
            ? Math.round((services.active / services.total) * 100)
            : 0;

    return (
        <StatsCard
            title="Active Services"
            value={services?.active || 0}
            subtitle={`${activeRate}% of ${services?.total || 0} total`}
            icon="fas fa-concierge-bell"
            color="success"
            loading={loading}
        />
    );
};

export const CategoriesCard = ({ services, loading }) => (
    <StatsCard
        title="Service Categories"
        value={services?.categories || 0}
        subtitle="Available categories"
        icon="fas fa-tags"
        color="warning"
        loading={loading}
    />
);

export const RevenueCard = ({ revenue, loading }) => (
    <StatsCard
        title="Total Revenue"
        value={revenue?.total ? `$${revenue.total.toLocaleString()}` : "$0"}
        subtitle={`${revenue?.growth || 0}% vs last month`}
        icon="fas fa-dollar-sign"
        color="success"
        trend={{
            type:
                (revenue?.growth || 0) > 0
                    ? "up"
                    : (revenue?.growth || 0) < 0
                    ? "down"
                    : "same",
            text: `${revenue?.growth > 0 ? "+" : ""}${
                revenue?.growth || 0
            }% growth`,
        }}
        loading={loading}
    />
);

export default StatsCard;
