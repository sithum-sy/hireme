import React, { useState, useEffect } from "react";
import { useAdmin } from "../../context/AdminContext";
import AdminLayout from "../../components/layouts/AdminLayout";

// Import the dashboard components
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

    // Loading skeleton
    const DashboardSkeleton = () => (
        <AdminLayout>
            <div className="loading-container">
                <div className="loading-content">
                    <div className="loading-spinner large"></div>
                    <p className="loading-text">Loading dashboard...</p>
                </div>
            </div>
        </AdminLayout>
    );

    if (dashboardLoading && !dashboardStats) {
        return <DashboardSkeleton />;
    }

    return (
        <AdminLayout>
            <div className="page-content">
                {/* Dashboard Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">
                            Admin Dashboard
                        </h1>
                        <p className="page-subtitle">
                            Welcome back! Here's what's happening with your
                            platform.
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

                {dashboardStats && (
                    <>
                        {/* Main Statistics Cards */}
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md responsive-grid-lg mb-6">
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

                        {/* Secondary Statistics Cards */}
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md responsive-grid-lg mb-6">
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

                            {/* Platform Health Card */}
                            <div className="dashboard-card platform-health-card">
                                <div className="dashboard-card-header">
                                    <h6 className="dashboard-card-title">
                                        <i className="fas fa-tachometer-alt"></i>
                                        <span>Platform Health</span>
                                    </h6>
                                </div>
                                <div className="dashboard-card-body">
                                    <div className="health-grid">
                                        <div className="health-item success">
                                            <i className="fas fa-check-circle"></i>
                                            <span>API</span>
                                        </div>
                                        <div className="health-item success">
                                            <i className="fas fa-database"></i>
                                            <span>Database</span>
                                        </div>
                                        <div className="health-item warning">
                                            <span className="health-value">
                                                75%
                                            </span>
                                            <span>Storage</span>
                                        </div>
                                        <div className="health-item success">
                                            <i className="fas fa-shield-alt"></i>
                                            <span>Security</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Charts and Actions Section */}
                        <div className="row mb-6">
                            {/* User Growth Chart */}
                            <div className="col-lg-8 mb-4 mb-lg-0">
                                <UserGrowthChart
                                    data={
                                        dashboardStats.charts?.user_growth || []
                                    }
                                    loading={dashboardLoading}
                                    period={chartPeriod}
                                    chartType={chartType}
                                    onPeriodChange={handleChartChange}
                                />
                            </div>

                            {/* Quick Actions Sidebar */}
                            <div className="col-lg-4">
                                <AdminQuickActions />
                            </div>
                        </div>

                        {/* Activity Section */}
                        <div className="row mb-6">
                            {/* Recent User Activity */}
                            <div className="col-lg-6 mb-4 mb-lg-0">
                                <UserActivityFeed
                                    users={dashboardStats.recent_users || []}
                                    loading={dashboardLoading}
                                />
                            </div>

                            {/* System Activities */}
                            <div className="col-lg-6">
                                <SystemActivityFeed
                                    activities={systemActivities}
                                    loading={activitiesLoading}
                                />
                            </div>
                        </div>

                        {/* Management Tools */}
                        <div className="row">
                            {/* Manager Quick Actions */}
                            <div className="col-lg-6 mb-4 mb-lg-0">
                                <ManagerQuickActions
                                    stats={{ issues: 0 }}
                                    onAction={handleQuickAction}
                                />
                            </div>

                            {/* System Overview */}
                            <div className="col-lg-6">
                                <div className="card h-100">
                                    <div className="card-header">
                                        <h6 className="card-title mb-0">
                                            <i className="fas fa-server me-2"></i>
                                            System Overview
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="system-metrics">
                                            {/* Server Status */}
                                            <div className="metric-item">
                                                <div className="metric-icon success">
                                                    <i className="fas fa-server"></i>
                                                </div>
                                                <div className="metric-content">
                                                    <h6 className="metric-title">
                                                        Server Status
                                                    </h6>
                                                    <div className="metric-value success">
                                                        <i className="fas fa-check-circle"></i>
                                                        <span>
                                                            Online - 99.9%
                                                            uptime
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Active Sessions */}
                                            <div className="metric-item">
                                                <div className="metric-icon info">
                                                    <i className="fas fa-users"></i>
                                                </div>
                                                <div className="metric-content">
                                                    <h6 className="metric-title">
                                                        Active Sessions
                                                    </h6>
                                                    <div className="metric-value info">
                                                        <i className="fas fa-circle"></i>
                                                        <span>
                                                            {dashboardStats
                                                                .users
                                                                ?.active ||
                                                                0}{" "}
                                                            users online
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* API Requests */}
                                            <div className="metric-item">
                                                <div className="metric-icon warning">
                                                    <i className="fas fa-exchange-alt"></i>
                                                </div>
                                                <div className="metric-content">
                                                    <h6 className="metric-title">
                                                        API Requests
                                                    </h6>
                                                    <div className="metric-value warning">
                                                        <i className="fas fa-chart-line"></i>
                                                        <span>
                                                            1.2K requests/hour
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Response Time */}
                                            <div className="metric-item">
                                                <div className="metric-icon success">
                                                    <i className="fas fa-tachometer-alt"></i>
                                                </div>
                                                <div className="metric-content">
                                                    <h6 className="metric-title">
                                                        Response Time
                                                    </h6>
                                                    <div className="metric-value success">
                                                        <i className="fas fa-bolt"></i>
                                                        <span>
                                                            &lt;125ms average
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Footer */}
                                <div className="card-footer d-flex justify-content-between align-items-center">
                                    <small className="text-muted">
                                        Last checked:{" "}
                                        {new Date().toLocaleTimeString()}
                                    </small>
                                    <button className="btn btn-sm btn-outline-primary">
                                        <i className="fas fa-chart-bar me-2"></i>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
