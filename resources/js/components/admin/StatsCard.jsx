import React from "react";

const StatsCard = ({
    title,
    value,
    subtitle,
    icon,
    variant = "primary",
    trend = null,
    loading = false,
    onClick = null,
    className = "",
}) => {
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
            ? "success"
            : trend?.type === "down"
            ? "danger"
            : "muted";

    const LoadingSkeleton = () => (
        <div className="stats-card-content">
            <div className="stats-info">
                <div className="loading-skeleton">
                    <div className="skeleton-line title"></div>
                    <div className="skeleton-line value"></div>
                    <div className="skeleton-line subtitle"></div>
                </div>
            </div>
            <div className="stats-icon loading">
                <div className="loading-spinner"></div>
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
        <div
            className={`card h-100 transition ${
                onClick ? "cursor-pointer" : ""
            } ${className}`}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            <div className="card-body d-flex align-items-center">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        <div className="flex-grow-1">
                            <h6 className="card-title text-muted mb-2 font-medium">{title}</h6>
                            <div className="h3 mb-1 text-primary fw-bold">
                                {formatValue(value)}
                            </div>
                            {(subtitle || trend) && (
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                                    {trend && trendIcon && (
                                        <span
                                            className={`badge bg-${trendColor} bg-opacity-10 text-${trendColor} d-flex align-items-center gap-1`}
                                        >
                                            <i
                                                className={`${trendIcon} small`}
                                            ></i>
                                            <span className="small">
                                                {trend.text}
                                            </span>
                                        </span>
                                    )}
                                    {!trend && subtitle && (
                                        <small className="text-muted">
                                            {subtitle}
                                        </small>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={`ms-3 text-${variant}`}>
                            <i className={`${icon} fa-2x`}></i>
                        </div>
                    </>
                )}
            </div>

            {onClick && (
                <div className="card-footer bg-light text-center">
                    <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                        <i className="fas fa-external-link-alt"></i>
                        Click to view details
                    </small>
                </div>
            )}
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
        variant="primary"
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
            variant="success"
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
        variant="warning"
        loading={loading}
    />
);

export const StaffCard = ({ users, loading }) => (
    <StatsCard
        title="Staff Members"
        value={users?.staff || 0}
        subtitle="Administrative team"
        icon="fas fa-users-cog"
        variant="info"
        loading={loading}
    />
);

export const AppointmentsCard = ({ appointments, loading }) => (
    <StatsCard
        title="Total Appointments"
        value={appointments?.total_appointments || 0}
        subtitle={`${appointments?.pending_appointments || 0} pending`}
        icon="fas fa-calendar-check"
        variant="info"
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
            variant="success"
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
        variant="warning"
        loading={loading}
    />
);

export const RevenueCard = ({ revenue, loading }) => (
    <StatsCard
        title="Total Revenue"
        value={revenue?.total ? `$${revenue.total.toLocaleString()}` : "$0"}
        subtitle={`${revenue?.growth || 0}% vs last month`}
        icon="fas fa-dollar-sign"
        variant="success"
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
