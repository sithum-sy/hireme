import React from "react";

// Loading skeleton component
const StatCardSkeleton = () => (
    <div className="card border-0 shadow-sm">
        <div className="card-body">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <div className="placeholder-glow">
                        <span className="placeholder col-8 mb-2"></span>
                    </div>
                    <div className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
                <div className="ms-3">
                    <div className="placeholder-glow">
                        <span className="placeholder rounded-circle" style={{width: '50px', height: '50px'}}></span>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-users me-2"></i>
                            <span>Total Users</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {totalUsers.toLocaleString()}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                            {growthRate !== 0 && (
                                <span
                                    className={`badge ${
                                        growthRate >= 0
                                            ? "bg-success bg-opacity-10 text-success"
                                            : "bg-danger bg-opacity-10 text-danger"
                                    } d-flex align-items-center gap-1`}
                                >
                                    <i
                                        className={`fas fa-arrow-${
                                            growthRate >= 0 ? "up" : "down"
                                        } small`}
                                    ></i>
                                    <span>{Math.abs(growthRate)}%</span>
                                </span>
                            )}
                            <small className="text-muted">
                                {newToday} new today
                            </small>
                        </div>
                    </div>
                    <div className="ms-3 text-primary">
                        <i className="fas fa-users fa-2x"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-user-check me-2"></i>
                            <span>Active Users</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {activeUsers.toLocaleString()}
                        </h3>
                        <div>
                            <span className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1">
                                <i className="fas fa-percentage small"></i>
                                <span>{activePercentage}% of total</span>
                            </span>
                        </div>
                    </div>
                    <div className="ms-3 text-success">
                        <i className="fas fa-user-check fa-2x"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-user-tie me-2"></i>
                            <span>Service Providers</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {totalProviders.toLocaleString()}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1">
                                <i className="fas fa-check-circle small"></i>
                                <span>{verifiedProviders} verified</span>
                            </span>
                            {pendingProviders > 0 && (
                                <span className="badge bg-warning bg-opacity-10 text-warning d-flex align-items-center gap-1">
                                    <i className="fas fa-clock small"></i>
                                    <span>{pendingProviders} pending</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="ms-3 text-info">
                        <i className="fas fa-user-tie fa-2x"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-tags me-2"></i>
                            <span>Categories</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {totalCategories.toLocaleString()}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1">
                                <i className="fas fa-check small"></i>
                                <span>{activeCategories} active</span>
                            </span>
                            {inactiveCategories > 0 && (
                                <span className="badge bg-secondary bg-opacity-10 text-secondary d-flex align-items-center gap-1">
                                    <i className="fas fa-pause small"></i>
                                    <span>{inactiveCategories} inactive</span>
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="ms-3 text-warning">
                        <i className="fas fa-tags fa-2x"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-briefcase me-2"></i>
                            <span>Services</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {totalServices.toLocaleString()}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-success bg-opacity-10 text-success d-flex align-items-center gap-1">
                                <i className="fas fa-play small"></i>
                                <span>{activeServices} active</span>
                            </span>
                            <span className="badge bg-info bg-opacity-10 text-info d-flex align-items-center gap-1">
                                <i className="fas fa-plus small"></i>
                                <span>{newThisWeek} this week</span>
                            </span>
                        </div>
                    </div>
                    <div className="ms-3 text-primary">
                        <i className="fas fa-briefcase fa-2x"></i>
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
        <div className="card border-0 shadow-sm">
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                        <h6 className="card-title text-muted mb-2 font-medium">
                            <i className="fas fa-calendar-alt me-2"></i>
                            <span>Appointments</span>
                        </h6>
                        <h3 className="text-primary fw-bold mb-2">
                            {totalAppointments.toLocaleString()}
                        </h3>
                        <div className="d-flex flex-wrap gap-2">
                            <span className="badge bg-primary bg-opacity-10 text-primary d-flex align-items-center gap-1">
                                <i className="fas fa-calendar-day small"></i>
                                <span>{todayAppointments} today</span>
                            </span>
                            <span className="badge bg-info bg-opacity-10 text-info d-flex align-items-center gap-1">
                                <i className="fas fa-calendar-week small"></i>
                                <span>
                                    {thisWeekAppointments} this week
                                </span>
                            </span>
                        </div>
                    </div>
                    <div className="ms-3 text-danger">
                        <i className="fas fa-calendar-alt fa-2x"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};
