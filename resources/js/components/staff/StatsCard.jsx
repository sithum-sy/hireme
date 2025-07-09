import React from "react";

// Loading skeleton component
const StatCardSkeleton = () => (
    <div className="col-lg-3 col-md-6 mb-4">
        <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                        <div className="placeholder-glow">
                            <span className="placeholder col-8"></span>
                        </div>
                        <div className="placeholder-glow mt-2">
                            <span
                                className="placeholder col-4"
                                style={{ height: "2rem" }}
                            ></span>
                        </div>
                    </div>
                    <div className="placeholder-glow">
                        <span
                            className="placeholder col-12"
                            style={{
                                width: "3rem",
                                height: "3rem",
                                borderRadius: "50%",
                            }}
                        ></span>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-users me-2"></i>
                                Total Users
                            </h6>
                            <h3 className="mb-1">
                                {totalUsers.toLocaleString()}
                            </h3>
                            <div className="d-flex align-items-center">
                                {growthRate !== 0 && (
                                    <small
                                        className={`me-2 ${
                                            growthRate >= 0
                                                ? "text-success"
                                                : "text-danger"
                                        }`}
                                    >
                                        <i
                                            className={`fas fa-arrow-${
                                                growthRate >= 0 ? "up" : "down"
                                            } me-1`}
                                        ></i>
                                        {Math.abs(growthRate)}%
                                    </small>
                                )}
                                <small className="text-muted">
                                    {newToday} new today
                                </small>
                            </div>
                        </div>
                        <div className="text-primary">
                            <i className="fas fa-users fa-2x"></i>
                        </div>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-user-check me-2"></i>
                                Active Users
                            </h6>
                            <h3 className="mb-1">
                                {activeUsers.toLocaleString()}
                            </h3>
                            <small className="text-success">
                                <i className="fas fa-percentage me-1"></i>
                                {activePercentage}% of total
                            </small>
                        </div>
                        <div className="text-success">
                            <i className="fas fa-user-check fa-2x"></i>
                        </div>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-user-tie me-2"></i>
                                Service Providers
                            </h6>
                            <h3 className="mb-1">
                                {totalProviders.toLocaleString()}
                            </h3>
                            <div className="small">
                                <span className="text-success me-2">
                                    <i className="fas fa-check-circle me-1"></i>
                                    {verifiedProviders} verified
                                </span>
                                {pendingProviders > 0 && (
                                    <span className="text-warning">
                                        <i className="fas fa-clock me-1"></i>
                                        {pendingProviders} pending
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-info">
                            <i className="fas fa-user-tie fa-2x"></i>
                        </div>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-tags me-2"></i>
                                Categories
                            </h6>
                            <h3 className="mb-1">
                                {totalCategories.toLocaleString()}
                            </h3>
                            <div className="small">
                                <span className="text-success me-2">
                                    <i className="fas fa-check me-1"></i>
                                    {activeCategories} active
                                </span>
                                {inactiveCategories > 0 && (
                                    <span className="text-secondary">
                                        <i className="fas fa-pause me-1"></i>
                                        {inactiveCategories} inactive
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-warning">
                            <i className="fas fa-tags fa-2x"></i>
                        </div>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-briefcase me-2"></i>
                                Services
                            </h6>
                            <h3 className="mb-1">
                                {totalServices.toLocaleString()}
                            </h3>
                            <div className="small">
                                <span className="text-success me-2">
                                    <i className="fas fa-play me-1"></i>
                                    {activeServices} active
                                </span>
                                <span className="text-info">
                                    <i className="fas fa-plus me-1"></i>
                                    {newThisWeek} this week
                                </span>
                            </div>
                        </div>
                        <div className="text-purple">
                            <i
                                className="fas fa-briefcase fa-2x"
                                style={{ color: "#6f42c1" }}
                            ></i>
                        </div>
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
        <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 className="card-title text-muted mb-2">
                                <i className="fas fa-calendar-alt me-2"></i>
                                Appointments
                            </h6>
                            <h3 className="mb-1">
                                {totalAppointments.toLocaleString()}
                            </h3>
                            <div className="small">
                                <span className="text-primary me-2">
                                    <i className="fas fa-calendar-day me-1"></i>
                                    {todayAppointments} today
                                </span>
                                <span className="text-info">
                                    <i className="fas fa-calendar-week me-1"></i>
                                    {thisWeekAppointments} this week
                                </span>
                            </div>
                        </div>
                        <div className="text-danger">
                            <i className="fas fa-calendar-alt fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
