// resources/js/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import AdminLayout from "../../components/layouts/AdminLayout";

// Import the new dashboard components
import {
    UserStatsCard,
    ActiveUsersCard,
    ProvidersCard,
    StaffCard,
    ServicesCard,
    CategoriesCard,
    AppointmentsCard,
} from "../../components/admin/StatsCard";
import UserGrowthChart from "../../components/admin/UserGrowthChart";
import {
    UserActivityFeed,
    SystemActivityFeed,
} from "../../components/admin/RecentActivity";
import {
    AdminQuickActions,
    ManagerQuickActions,
} from "../../components/admin/QuickActions";

const AdminDashboard = () => {
    const {
        dashboardStats,
        dashboardLoading,
        fetchDashboardStats,
        errors,
        getActivitiesReport,
    } = useAdmin();

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
            const activities = await getActivitiesReport(20);
            setSystemActivities(activities.activities || []);
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
        // Handle specific actions like export, backup, etc.
        switch (actionId) {
            case "export-users":
                // Trigger user export
                break;
            case "backup-system":
                // Trigger system backup
                break;
            case "send-notifications":
                // Open notification modal
                break;
            case "system-health":
                // Show system health modal
                break;
            default:
                console.log("Unknown action:", actionId);
        }
    };

    // Loading skeleton for the entire dashboard
    const DashboardSkeleton = () => (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Dashboard</h1>
                    <p className="text-muted mb-0">
                        Welcome back! Here's what's happening with your
                        platform.
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
                    <UserGrowthChart loading={true} />
                </div>
                <div className="col-lg-4 mb-4">
                    <AdminQuickActions />
                </div>
            </div>
        </AdminLayout>
    );

    if (dashboardLoading && !dashboardStats) {
        return <DashboardSkeleton />;
    }

    return (
        <AdminLayout>
            {/* Dashboard Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Dashboard</h1>
                    <p className="text-muted mb-0">
                        Welcome back! Here's what's happening with your
                        platform.
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

            {dashboardStats && (
                <>
                    {/* Main Statistics Cards Row */}
                    <div className="row mb-4">
                        <UserStatsCard
                            users={dashboardStats.users}
                            loading={dashboardLoading}
                        />
                        <ActiveUsersCard
                            users={dashboardStats.users}
                            loading={dashboardLoading}
                        />
                        <ProvidersCard
                            users={dashboardStats.users}
                            services={dashboardStats.services}
                            loading={dashboardLoading}
                        />
                        <StaffCard
                            users={dashboardStats.users}
                            loading={dashboardLoading}
                        />
                    </div>

                    {/* Secondary Statistics Cards Row */}
                    <div className="row mb-4">
                        <ServicesCard
                            services={dashboardStats.services}
                            loading={dashboardLoading}
                        />
                        <CategoriesCard
                            services={dashboardStats.services}
                            loading={dashboardLoading}
                        />
                        <AppointmentsCard
                            appointments={dashboardStats.appointments}
                            loading={dashboardLoading}
                        />
                        {/* Quick Stats Card */}
                        <div className="col-lg-3 col-md-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="card-title mb-0">
                                        <i className="fas fa-tachometer-alt text-info me-2"></i>
                                        Platform Health
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
                                                    75%
                                                </small>
                                                <small className="text-muted">
                                                    Storage
                                                </small>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                                <small className="text-success d-block">
                                                    <i className="fas fa-shield-alt"></i>
                                                </small>
                                                <small className="text-muted">
                                                    Security
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts and Actions Row */}
                    <div className="row mb-4">
                        {/* User Growth Chart */}
                        <div className="col-lg-8 mb-4">
                            <UserGrowthChart
                                data={dashboardStats.charts?.user_growth || []}
                                loading={dashboardLoading}
                                period={chartPeriod}
                                chartType={chartType}
                                onPeriodChange={handleChartChange}
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="col-lg-4 mb-4">
                            <AdminQuickActions />
                        </div>
                    </div>

                    {/* Activity and Management Row */}
                    <div className="row mb-4">
                        {/* Recent User Activity */}
                        <div className="col-lg-6 mb-4">
                            <UserActivityFeed
                                users={dashboardStats.recent_users || []}
                                loading={dashboardLoading}
                            />
                        </div>

                        {/* System Activities */}
                        <div className="col-lg-6 mb-4">
                            <SystemActivityFeed
                                activities={systemActivities}
                                loading={activitiesLoading}
                            />
                        </div>
                    </div>

                    {/* Management Tools Row */}
                    <div className="row mb-4">
                        {/* Manager Quick Actions */}
                        <div className="col-lg-6 mb-4">
                            <ManagerQuickActions
                                stats={{ issues: 0 }}
                                onAction={handleQuickAction}
                            />
                        </div>

                        {/* System Overview */}
                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h5 className="card-title mb-0">
                                        <i className="fas fa-server text-primary me-2"></i>
                                        System Overview
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {/* Server Status */}
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div
                                                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    >
                                                        <i className="fas fa-server text-success"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">
                                                        Server Status
                                                    </h6>
                                                    <small className="text-success">
                                                        <i className="fas fa-check-circle me-1"></i>
                                                        Online - 99.9% uptime
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Sessions */}
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div
                                                        className="bg-info bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    >
                                                        <i className="fas fa-users text-info"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">
                                                        Active Sessions
                                                    </h6>
                                                    <small className="text-info">
                                                        <i className="fas fa-circle me-1"></i>
                                                        {dashboardStats.users
                                                            ?.active || 0}{" "}
                                                        users online
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* API Requests */}
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div
                                                        className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    >
                                                        <i className="fas fa-exchange-alt text-warning"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">
                                                        API Requests
                                                    </h6>
                                                    <small className="text-warning">
                                                        <i className="fas fa-chart-line me-1"></i>
                                                        1.2K requests/hour
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Response Time */}
                                        <div className="col-md-6">
                                            <div className="d-flex align-items-center">
                                                <div className="me-3">
                                                    <div
                                                        className="bg-success bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    >
                                                        <i className="fas fa-tachometer-alt text-success"></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h6 className="mb-1">
                                                        Response Time
                                                    </h6>
                                                    <small className="text-success">
                                                        <i className="fas fa-bolt me-1"></i>
                                                        &gt;125ms average
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Footer */}
                                <div className="card-footer bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Last checked:{" "}
                                            {new Date().toLocaleTimeString()}
                                        </small>
                                        <button className="btn btn-sm btn-outline-primary">
                                            <i className="fas fa-chart-bar me-1"></i>
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
