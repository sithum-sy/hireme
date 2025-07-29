import React, { useState, useEffect } from "react";
import { useStaff } from "../../context/StaffContext";
import StaffLayout from "../../components/layouts/StaffLayout";

// Import dashboard components
import {
    UserStatsCard,
    ActiveUsersCard,
    ProvidersCard,
    CategoriesCard,
    ServicesCard,
    AppointmentsCard,
} from "../../components/staff/StatsCard";
import PlatformGrowthChart from "../../components/staff/PlatformGrowthChart";
import {
    UserActivityFeed,
    StaffActivityFeed,
} from "../../components/staff/RecentActivity";
import {
    StaffQuickActions,
    ManagementQuickActions,
} from "../../components/staff/QuickActions";

const StaffDashboard = () => {
    const {
        dashboardStats,
        dashboardLoading,
        fetchDashboardStats,
        errors,
        fetchActivities,
        activities,
        tasks,
        dashboardData,
    } = useStaff();

    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [chartPeriod, setChartPeriod] = useState("30");
    const [chartType, setChartType] = useState("line");
    const [systemActivities, setSystemActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    // Fetch dashboard data on component mount
    useEffect(() => {
        loadDashboardData();
        loadSystemActivities();
    }, []);

    const loadDashboardData = async (forceRefresh = false) => {
        try {
            setRefreshing(true);
            await fetchDashboardStats(forceRefresh);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Failed to load dashboard:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const loadSystemActivities = async () => {
        try {
            setActivitiesLoading(true);
            const activitiesData = await fetchActivities({ limit: 20 });
            setSystemActivities(activitiesData || []);
        } catch (error) {
            console.error("Failed to load activities:", error);
            setSystemActivities([]);
        } finally {
            setActivitiesLoading(false);
        }
    };

    const handleRefresh = () => {
        loadDashboardData(true);
        loadSystemActivities();
    };

    const handleChartChange = ({ period, chartType: newChartType }) => {
        if (period) setChartPeriod(period);
        if (newChartType) setChartType(newChartType);
    };

    const handleQuickAction = (actionId) => {
        console.log("Quick action triggered:", actionId);
        switch (actionId) {
            case "manage-categories":
                window.location.href = "/staff/categories";
                break;
            case "review-providers":
                window.location.href =
                    "/staff/users?role=service_provider&status=pending";
                break;
            case "view-reports":
                window.location.href = "/staff/reports";
                break;
            case "handle-disputes":
                window.location.href = "/staff/disputes";
                break;
            default:
                console.log("Unknown action:", actionId);
        }
    };

    // Loading skeleton for the entire dashboard
    const DashboardSkeleton = () => (
        <StaffLayout>
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner large"></div>
                    <p className="loading-text">Loading dashboard...</p>
                </div>
            </div>
        </StaffLayout>
    );

    if (dashboardLoading && !dashboardStats) {
        return <DashboardSkeleton />;
    }

    return (
        <StaffLayout>
            <div className="page-content">
                {/* Dashboard Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Staff Dashboard</h1>
                        <p className="page-subtitle">
                            Welcome back! Here's what's happening on the platform.
                        </p>
                    </div>
                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                        {lastUpdated && (
                            <small className="text-muted">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </small>
                        )}
                        <button
                            className="btn btn-outline-primary btn-responsive"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <i
                                className={`fas fa-sync-alt ${
                                    refreshing ? "fa-spin" : ""
                                } me-2`}
                            ></i>
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {errors.dashboard && (
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{errors.dashboard}</span>
                        <button
                            className="btn btn-sm btn-outline-danger ms-3"
                            onClick={() => loadDashboardData(true)}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Priority Tasks Alert */}
                {tasks && tasks.length > 0 && (
                    <div className="priority-tasks-alert">
                        <div className="alert alert-info">
                            <div className="alert-content">
                                <i className="fas fa-tasks"></i>
                                <div className="alert-text">
                                    <h6 className="alert-title">
                                        Today's Priority Tasks
                                    </h6>
                                    <p className="alert-description">
                                        You have{" "}
                                        {tasks.high_priority?.length || 0} high
                                        priority tasks,{" "}
                                        {tasks.medium_priority?.length || 0}{" "}
                                        medium priority tasks pending.
                                    </p>
                                </div>
                                <a
                                    href="/staff/dashboard#tasks"
                                    className="btn btn-info"
                                >
                                    View Tasks
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {dashboardStats && (
                    <>
                        {/* Main Statistics Cards */}
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md responsive-grid-lg mb-6">
                            <UserStatsCard
                                users={dashboardStats?.users || {}}
                                loading={dashboardLoading}
                            />
                            <ActiveUsersCard
                                users={dashboardStats?.users || {}}
                                loading={dashboardLoading}
                            />
                            <ProvidersCard
                                users={dashboardStats?.users || {}}
                                services={dashboardStats?.services || {}}
                                loading={dashboardLoading}
                            />
                            <CategoriesCard
                                categories={dashboardStats?.categories || {}}
                                loading={dashboardLoading}
                            />
                        </div>

                        {/* Secondary Statistics Cards */}
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md mb-6">
                            <ServicesCard
                                services={dashboardStats?.services || {}}
                                loading={dashboardLoading}
                            />
                            <AppointmentsCard
                                appointments={dashboardStats?.appointments || {}}
                                loading={dashboardLoading}
                            />

                            {/* System Health Card */}
                            <div className="dashboard-card system-health-card">
                                <div className="dashboard-card-header">
                                    <h6 className="dashboard-card-title">
                                        <i className="fas fa-heartbeat"></i>
                                        <span>System Health</span>
                                    </h6>
                                </div>
                                <div className="dashboard-card-body">
                                    <div className="health-grid">
                                        <div className={`health-item ${dashboardStats?.platform_health?.database_status === 'healthy' ? 'success' : 'danger'}`}>
                                            <i className={`fas ${dashboardStats?.platform_health?.database_status === 'healthy' ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                                            <span>Database</span>
                                        </div>
                                        <div className="health-item success">
                                            <i className="fas fa-server"></i>
                                            <span>API</span>
                                        </div>
                                        <div className="health-item warning">
                                            <span className="health-value">
                                                {dashboardStats?.platform_health?.storage?.used_percentage || '0'}%
                                            </span>
                                            <span>Storage</span>
                                        </div>
                                        <div className="health-item success">
                                            <span className="health-value">
                                                {dashboardStats?.platform_health?.system_performance?.uptime || '99.9%'}
                                            </span>
                                            <span>Uptime</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Platform Alerts Card */}
                            <div className="dashboard-card alerts-card">
                                <div className="dashboard-card-header">
                                    <h6 className="dashboard-card-title">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>Platform Alerts</span>
                                    </h6>
                                </div>
                                <div className="dashboard-card-body">
                                    <div className="alert-items">
                                        <div className="alert-item">
                                            <div className="alert-icon warning">
                                                <i className="fas fa-user-clock"></i>
                                            </div>
                                            <div className="alert-content">
                                                <h6 className="alert-value">
                                                    {dashboardStats?.users
                                                        ?.providers?.pending ||
                                                        0}
                                                </h6>
                                                <span className="alert-label">
                                                    Pending Approvals
                                                </span>
                                            </div>
                                        </div>
                                        <div className="alert-item">
                                            <div className="alert-icon info">
                                                <i className="fas fa-tags"></i>
                                            </div>
                                            <div className="alert-content">
                                                <h6 className="alert-value">
                                                    {dashboardStats?.categories
                                                        ?.overview?.inactive ||
                                                        0}
                                                </h6>
                                                <span className="alert-label">
                                                    Inactive Categories
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Platform Growth Chart */}
                        <div className="mb-6">
                            <PlatformGrowthChart
                                data={
                                    dashboardStats?.trends
                                        ?.user_registrations || []
                                }
                                loading={dashboardLoading}
                                period={chartPeriod}
                                chartType={chartType}
                                onPeriodChange={handleChartChange}
                            />
                        </div>

                        {/* Quick Actions - Full Width */}
                        <div className="mb-6">
                            <StaffQuickActions
                                onAction={handleQuickAction}
                            />
                        </div>

                        {/* Activity Section */}
                        <div className="activity-grid">
                            {/* Recent User Activity */}
                            <UserActivityFeed
                                users={
                                    dashboardStats?.users?.activity
                                        ?.top_active_users || []
                                }
                                loading={dashboardLoading}
                            />

                            {/* Staff Activities */}
                            <StaffActivityFeed
                                activities={systemActivities}
                                loading={activitiesLoading}
                            />
                        </div>

                        {/* Management Tools */}
                        <div className="management-grid">
                            {/* Management Quick Actions */}
                            <ManagementQuickActions
                                stats={{
                                    pendingProviders:
                                        dashboardStats?.users?.providers
                                            ?.pending || 0,
                                    inactiveCategories:
                                        dashboardStats?.categories?.overview
                                            ?.inactive || 0,
                                    newUsers:
                                        ((dashboardStats?.users?.clients?.new_today || 0) + 
                                         (dashboardStats?.users?.providers?.new_today || 0)),
                                }}
                                onAction={handleQuickAction}
                            />

                            {/* Today's Tasks Summary */}
                            <div className="dashboard-card tasks-card">
                                <div className="dashboard-card-header">
                                    <h6 className="dashboard-card-title">
                                        <i className="fas fa-tasks"></i>
                                        <span>Today's Tasks</span>
                                    </h6>
                                </div>
                                <div className="dashboard-card-body">
                                    {tasks &&
                                    (tasks.high_priority?.length > 0 ||
                                        tasks.medium_priority?.length > 0 ||
                                        tasks.low_priority?.length > 0) ? (
                                        <div className="tasks-grid">
                                            <div className="task-priority high">
                                                <h4 className="task-count">
                                                    {tasks.high_priority
                                                        ?.length || 0}
                                                </h4>
                                                <span className="task-label">
                                                    High Priority
                                                </span>
                                            </div>
                                            <div className="task-priority medium">
                                                <h4 className="task-count">
                                                    {tasks.medium_priority
                                                        ?.length || 0}
                                                </h4>
                                                <span className="task-label">
                                                    Medium Priority
                                                </span>
                                            </div>
                                            <div className="task-priority low">
                                                <h4 className="task-count">
                                                    {tasks.low_priority
                                                        ?.length || 0}
                                                </h4>
                                                <span className="task-label">
                                                    Low Priority
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="empty-state-small">
                                            <div className="empty-state-icon">
                                                <i className="fas fa-check-circle"></i>
                                            </div>
                                            <h6 className="empty-state-title">
                                                All caught up!
                                            </h6>
                                            <p className="empty-state-description">
                                                No pending tasks for today.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="dashboard-card-footer">
                                    <div className="card-footer-content">
                                        <small className="footer-text">
                                            Tasks updated:{" "}
                                            {new Date().toLocaleTimeString()}
                                        </small>
                                        <a
                                            href="/staff/dashboard#tasks"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="fas fa-list"></i>
                                            <span>View All Tasks</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Welcome Message for New Staff */}
                {dashboardData?.welcome_message && (
                    <div className="welcome-message-card">
                        <div className="dashboard-card welcome-card">
                            <div className="dashboard-card-body">
                                <div className="welcome-content">
                                    <div className="welcome-text">
                                        <h5 className="welcome-title">
                                            {
                                                dashboardData.welcome_message
                                                    .greeting
                                            }
                                        </h5>
                                        <p className="welcome-description">
                                            {
                                                dashboardData.welcome_message
                                                    .message
                                            }
                                        </p>
                                    </div>
                                    <div className="welcome-actions">
                                        <a
                                            href="/staff/categories"
                                            className="btn btn-light"
                                        >
                                            <i className="fas fa-tags"></i>
                                            <span>Manage Categories</span>
                                        </a>
                                        <a
                                            href="/staff/users"
                                            className="btn btn-outline-light"
                                        >
                                            <i className="fas fa-users"></i>
                                            <span>View Users</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffDashboard;
