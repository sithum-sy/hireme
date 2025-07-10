// resources/js/pages/staff/Dashboard.jsx
// Updated to match AdminDashboard pattern and structure

import React, { useState, useEffect } from "react";
import { useStaff } from "../../context/StaffContext";
import StaffLayout from "../../components/layouts/StaffLayout";

// Import dashboard components (we'll create these to match admin components)
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
        // Handle specific actions
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
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Staff Dashboard</h1>
                    <p className="text-muted mb-0">
                        Welcome back! Here's what's happening on the platform.
                    </p>
                </div>
                <button className="btn btn-outline-primary" disabled>
                    <i className="fas fa-sync-alt fa-spin me-2"></i>
                    Loading...
                </button>
            </div>

            {/* Stats Cards Row with Skeletons */}
            <div className="row mb-4">
                {[1, 2, 3, 4].map((i) => (
                    <UserStatsCard key={i} users={{}} loading={true} />
                ))}
            </div>

            {/* Charts Row with Skeletons */}
            <div className="row mb-4">
                <div className="col-lg-8 mb-4">
                    <PlatformGrowthChart loading={true} />
                </div>
                <div className="col-lg-4 mb-4">
                    <StaffQuickActions />
                </div>
            </div>
        </StaffLayout>
    );

    if (dashboardLoading && !dashboardStats) {
        return <DashboardSkeleton />;
    }

    return (
        <StaffLayout>
            {/* Dashboard Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Staff Dashboard</h1>
                    <p className="text-muted mb-0">
                        Welcome back! Here's what's happening on the platform.
                    </p>
                </div>
                <div className="d-flex gap-2">
                    {lastUpdated && (
                        <small className="text-muted align-self-center me-3">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </small>
                    )}
                    <button
                        className="btn btn-outline-primary"
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <i
                            className={`fas fa-sync-alt ${
                                refreshing ? "fa-spin" : ""
                            } me-2`}
                        ></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Error State */}
            {errors.dashboard && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.dashboard}
                    <button
                        className="btn btn-sm btn-outline-danger ms-3"
                        onClick={() => loadDashboardData(true)}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Today's Tasks Priority Section */}
            {tasks && tasks.length > 0 && (
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert alert-info border-0" role="alert">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-tasks fa-2x text-info me-3"></i>
                                <div>
                                    <h6 className="alert-heading mb-1">
                                        Today's Priority Tasks
                                    </h6>
                                    <p className="mb-0">
                                        You have{" "}
                                        {tasks.high_priority?.length || 0} high
                                        priority tasks,{" "}
                                        {tasks.medium_priority?.length || 0}{" "}
                                        medium priority tasks pending.
                                    </p>
                                </div>
                                <a
                                    href="/staff/dashboard#tasks"
                                    className="btn btn-info ms-auto"
                                >
                                    View Tasks
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {dashboardStats && (
                <>
                    {/* Main Statistics Cards Row */}
                    <div className="row mb-4">
                        <UserStatsCard
                            users={dashboardStats.users || {}}
                            loading={dashboardLoading}
                        />
                        <ActiveUsersCard
                            users={dashboardStats.users || {}}
                            loading={dashboardLoading}
                        />
                        <ProvidersCard
                            users={dashboardStats.users || {}}
                            services={dashboardStats.services || {}}
                            loading={dashboardLoading}
                        />
                        <CategoriesCard
                            categories={dashboardStats.categories || {}}
                            loading={dashboardLoading}
                        />
                    </div>
                    {/* Secondary Statistics Cards Row */}
                    <div className="row mb-4">
                        <ServicesCard
                            services={dashboardStats.services || {}}
                            loading={dashboardLoading}
                        />
                        <AppointmentsCard
                            appointments={dashboardStats.appointments || {}}
                            loading={dashboardLoading}
                        />

                        {/* System Health Card */}
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="card-title mb-0">
                                        <i className="fas fa-heartbeat text-success me-2"></i>
                                        System Health
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                                <small className="text-success d-block">
                                                    <i className="fas fa-check-circle"></i>
                                                </small>
                                                <small className="text-muted">
                                                    API
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                                <small className="text-success d-block">
                                                    <i className="fas fa-database"></i>
                                                </small>
                                                <small className="text-muted">
                                                    Database
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-warning bg-opacity-10 rounded">
                                                <small className="text-warning d-block">
                                                    85%
                                                </small>
                                                <small className="text-muted">
                                                    Storage
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                                <small className="text-success d-block">
                                                    99.9%
                                                </small>
                                                <small className="text-muted">
                                                    Uptime
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Platform Alerts Card */}
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="card-title mb-0">
                                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                        Platform Alerts
                                    </h6>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="me-3">
                                            <div
                                                className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                }}
                                            >
                                                <i className="fas fa-user-clock text-warning fa-sm"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h6 className="mb-0">
                                                {dashboardStats.users?.providers
                                                    ?.pending || 0}
                                            </h6>
                                            <small className="text-muted">
                                                Pending Approvals
                                            </small>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="me-3">
                                            <div
                                                className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                style={{
                                                    width: "32px",
                                                    height: "32px",
                                                }}
                                            >
                                                <i className="fas fa-tags text-info fa-sm"></i>
                                            </div>
                                        </div>
                                        <div>
                                            <h6 className="mb-0">
                                                {dashboardStats.categories
                                                    ?.overview?.inactive || 0}
                                            </h6>
                                            <small className="text-muted">
                                                Inactive Categories
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Charts and Actions Row */}
                    <div className="row mb-4">
                        {/* Platform Growth Chart */}
                        <div className="col-lg-8 mb-4">
                            <PlatformGrowthChart
                                data={
                                    dashboardStats.trends?.user_registrations ||
                                    []
                                }
                                loading={dashboardLoading}
                                period={chartPeriod}
                                chartType={chartType}
                                onPeriodChange={handleChartChange}
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="col-lg-4 mb-4">
                            <StaffQuickActions onAction={handleQuickAction} />
                        </div>
                    </div>
                    {/* Activity and Management Row */}
                    <div className="row mb-4">
                        {/* Recent User Activity */}
                        <div className="col-lg-6 mb-4">
                            <UserActivityFeed
                                users={
                                    dashboardStats.users?.activity
                                        ?.recent_logins || []
                                }
                                loading={dashboardLoading}
                            />
                        </div>

                        {/* Staff Activities */}
                        <div className="col-lg-6 mb-4">
                            <StaffActivityFeed
                                activities={systemActivities}
                                loading={activitiesLoading}
                            />
                        </div>
                    </div>
                    {/* Management Tools Row */}
                    <div className="row mb-4">
                        {/* Management Quick Actions */}
                        <div className="col-lg-6 mb-4">
                            <ManagementQuickActions
                                stats={{
                                    pendingProviders:
                                        dashboardStats.users?.providers
                                            ?.pending || 0,
                                    inactiveCategories:
                                        dashboardStats.categories?.overview
                                            ?.inactive || 0,
                                    newUsers:
                                        dashboardStats.users?.overview
                                            ?.new_today || 0,
                                }}
                                onAction={handleQuickAction}
                            />
                        </div>

                        {/* Today's Tasks Summary */}
                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0">
                                        <i className="fas fa-tasks text-primary me-2"></i>
                                        Today's Tasks
                                    </h5>
                                </div>
                                <div className="card-body">
                                    {tasks &&
                                    (tasks.high_priority?.length > 0 ||
                                        tasks.medium_priority?.length > 0 ||
                                        tasks.low_priority?.length > 0) ? (
                                        <div className="row g-3">
                                            {/* High Priority */}
                                            <div className="col-md-4">
                                                <div className="text-center p-3 bg-danger bg-opacity-10 rounded">
                                                    <h4 className="text-danger mb-1">
                                                        {tasks.high_priority
                                                            ?.length || 0}
                                                    </h4>
                                                    <small className="text-muted">
                                                        High Priority
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Medium Priority */}
                                            <div className="col-md-4">
                                                <div className="text-center p-3 bg-warning bg-opacity-10 rounded">
                                                    <h4 className="text-warning mb-1">
                                                        {tasks.medium_priority
                                                            ?.length || 0}
                                                    </h4>
                                                    <small className="text-muted">
                                                        Medium Priority
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Low Priority */}
                                            <div className="col-md-4">
                                                <div className="text-center p-3 bg-info bg-opacity-10 rounded">
                                                    <h4 className="text-info mb-1">
                                                        {tasks.low_priority
                                                            ?.length || 0}
                                                    </h4>
                                                    <small className="text-muted">
                                                        Low Priority
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-3">
                                            <i className="fas fa-check-circle text-success fa-3x mb-3"></i>
                                            <h6 className="text-success">
                                                All caught up!
                                            </h6>
                                            <p className="text-muted mb-0">
                                                No pending tasks for today.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Tasks Footer */}
                                <div className="card-footer bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Tasks updated:{" "}
                                            {new Date().toLocaleTimeString()}
                                        </small>
                                        <a
                                            href="/staff/dashboard#tasks"
                                            className="btn btn-sm btn-outline-primary"
                                        >
                                            <i className="fas fa-list me-1"></i>
                                            View All Tasks
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Welcome Message for New Staff */}
            {dashboardData?.welcome_message && (
                <div className="row">
                    <div className="col-12">
                        <div
                            className="card border-0 shadow-sm bg-gradient"
                            style={{
                                background:
                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            }}
                        >
                            <div className="card-body text-white">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h5 className="text-white mb-2">
                                            {
                                                dashboardData.welcome_message
                                                    .greeting
                                            }
                                        </h5>
                                        <p className="text-white-50 mb-0">
                                            {
                                                dashboardData.welcome_message
                                                    .message
                                            }
                                        </p>
                                    </div>
                                    <div className="col-md-4 text-end">
                                        <div className="d-flex justify-content-end gap-2">
                                            <a
                                                href="/staff/categories"
                                                className="btn btn-light btn-sm"
                                            >
                                                <i className="fas fa-tags me-1"></i>
                                                Manage Categories
                                            </a>
                                            <a
                                                href="/staff/users"
                                                className="btn btn-outline-light btn-sm"
                                            >
                                                <i className="fas fa-users me-1"></i>
                                                View Users
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
};

export default StaffDashboard;
