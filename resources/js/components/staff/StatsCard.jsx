import React from "react";

// Loading skeleton component
const StatCardSkeleton = () => (
    <div className="dashboard-card stat-card">
        <div className="dashboard-card-body">
            <div className="stat-content">
                <div className="stat-text">
                    <div className="placeholder-glow">
                        <span className="placeholder stat-label-placeholder"></span>
                    </div>
                    <div className="placeholder-glow">
                        <span className="placeholder stat-value-placeholder"></span>
                    </div>
                </div>
                <div className="stat-icon-placeholder">
                    <div className="placeholder-glow">
                        <span className="placeholder icon-placeholder"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// User Statistics Card
export const UserStatsCard = ({ users = {}, loading = false }) => {
    if (loading) return <StatCardSkeleton />;

    const totalUsers = users.overview?.total || 0;
    const growthRate = users.overview?.growth_rate || 0;
    const newToday = users.overview?.new_today || 0;

    return (
        <div className="dashboard-card stat-card users-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-users"></i>
                            <span>Total Users</span>
                        </h6>
                        <h3 className="stat-value">
                            {totalUsers.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            {growthRate !== 0 && (
                                <span
                                    className={`growth-indicator ${
                                        growthRate >= 0
                                            ? "positive"
                                            : "negative"
                                    }`}
                                >
                                    <i
                                        className={`fas fa-arrow-${
                                            growthRate >= 0 ? "up" : "down"
                                        }`}
                                    ></i>
                                    <span>{Math.abs(growthRate)}%</span>
                                </span>
                            )}
                            <span className="today-count">
                                {newToday} new today
                            </span>
                        </div>
                    </div>
                    <div className="stat-icon primary">
                        <i className="fas fa-users"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Active Users Card
export const ActiveUsersCard = ({ users = {}, loading = false }) => {
    if (loading) return <StatCardSkeleton />;

    const activeUsers = users.overview?.active || 0;
    const totalUsers = users.overview?.total || 0;
    const activePercentage =
        totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

    return (
        <div className="dashboard-card stat-card active-users-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-user-check"></i>
                            <span>Active Users</span>
                        </h6>
                        <h3 className="stat-value">
                            {activeUsers.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            <span className="percentage-indicator success">
                                <i className="fas fa-percentage"></i>
                                <span>{activePercentage}% of total</span>
                            </span>
                        </div>
                    </div>
                    <div className="stat-icon success">
                        <i className="fas fa-user-check"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Service Providers Card
export const ProvidersCard = ({
    users = {},
    services = {},
    loading = false,
}) => {
    if (loading) return <StatCardSkeleton />;

    const totalProviders = users.providers?.total || 0;
    const verifiedProviders = users.providers?.verified || 0;
    const pendingProviders = users.providers?.pending || 0;

    return (
        <div className="dashboard-card stat-card providers-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-user-tie"></i>
                            <span>Service Providers</span>
                        </h6>
                        <h3 className="stat-value">
                            {totalProviders.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            <div className="stat-meta-inline">
                                <span className="status-indicator success">
                                    <i className="fas fa-check-circle"></i>
                                    <span>{verifiedProviders} verified</span>
                                </span>
                                {pendingProviders > 0 && (
                                    <span className="status-indicator warning">
                                        <i className="fas fa-clock"></i>
                                        <span>{pendingProviders} pending</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="stat-icon info">
                        <i className="fas fa-user-tie"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Service Categories Card
export const CategoriesCard = ({ categories = {}, loading = false }) => {
    if (loading) return <StatCardSkeleton />;

    const totalCategories = categories.overview?.total || 0;
    const activeCategories = categories.overview?.active || 0;
    const inactiveCategories = categories.overview?.inactive || 0;

    return (
        <div className="dashboard-card stat-card categories-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-tags"></i>
                            <span>Categories</span>
                        </h6>
                        <h3 className="stat-value">
                            {totalCategories.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            <span className="status-indicator success">
                                <i className="fas fa-check"></i>
                                <span>{activeCategories} active</span>
                            </span>
                            {inactiveCategories > 0 && (
                                <span className="status-indicator secondary">
                                    <i className="fas fa-pause"></i>
                                    <span>{inactiveCategories} inactive</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="stat-icon warning">
                        <i className="fas fa-tags"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Services Card
export const ServicesCard = ({ services = {}, loading = false }) => {
    if (loading) return <StatCardSkeleton />;

    const totalServices = services.overview?.total || 0;
    const activeServices = services.overview?.active || 0;
    const newThisWeek = services.overview?.new_this_week || 0;

    return (
        <div className="dashboard-card stat-card services-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-briefcase"></i>
                            <span>Services</span>
                        </h6>
                        <h3 className="stat-value">
                            {totalServices.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            <div className="stat-meta-inline">
                                <span className="status-indicator success">
                                    <i className="fas fa-play"></i>
                                    <span>{activeServices} active</span>
                                </span>
                                <span className="status-indicator info">
                                    <i className="fas fa-plus"></i>
                                    <span>{newThisWeek} this week</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-icon primary">
                        <i className="fas fa-briefcase"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Appointments Card
export const AppointmentsCard = ({ appointments = {}, loading = false }) => {
    if (loading) return <StatCardSkeleton />;

    const totalAppointments = appointments.overview?.total || 0;
    const todayAppointments = appointments.overview?.today || 0;
    const thisWeekAppointments = appointments.overview?.this_week || 0;

    return (
        <div className="dashboard-card stat-card appointments-card">
            <div className="dashboard-card-body">
                <div className="stat-content">
                    <div className="stat-text">
                        <h6 className="stat-label">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Appointments</span>
                        </h6>
                        <h3 className="stat-value">
                            {totalAppointments.toLocaleString()}
                        </h3>
                        <div className="stat-meta">
                            <div className="stat-meta-inline">
                                <span className="status-indicator primary">
                                    <i className="fas fa-calendar-day"></i>
                                    <span>{todayAppointments} today</span>
                                </span>
                                <span className="status-indicator info">
                                    <i className="fas fa-calendar-week"></i>
                                    <span>
                                        {thisWeekAppointments} this week
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="stat-icon danger">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
