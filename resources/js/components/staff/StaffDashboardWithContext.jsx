import React, { useState, useEffect } from "react";
import StaffLayout from "../layouts/StaffLayout";
import { useStaff } from "../../context/StaffContext";

const StaffDashboard = () => {
    const {
        dashboardData,
        dashboardLoading,
        dashboardError,
        statistics,
        activities,
        tasks,
        notifications,
        systemAlerts,
        refreshDashboard,
        exportData,
        clearCache,
        addNotification,
        getHighPriorityTasksCount,
    } = useStaff();

    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refreshDashboard();
        } catch (error) {
            console.error("Refresh failed:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const data = await exportData("json", 30);

            // Create download link
            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `staff-dashboard-${
                new Date().toISOString().split("T")[0]
            }.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            addNotification({
                type: "success",
                title: "Export Successful",
                message: "Dashboard data has been exported successfully",
            });
        } catch (error) {
            addNotification({
                type: "error",
                title: "Export Failed",
                message: "Failed to export dashboard data",
            });
        } finally {
            setExporting(false);
        }
    };

    const handleClearCache = async () => {
        try {
            await clearCache();
            addNotification({
                type: "success",
                title: "Cache Cleared",
                message: "Dashboard cache has been cleared and data refreshed",
            });
        } catch (error) {
            addNotification({
                type: "error",
                title: "Cache Clear Failed",
                message: "Failed to clear dashboard cache",
            });
        }
    };

    if (dashboardLoading) {
        return (
            <StaffLayout>
                <DashboardSkeleton />
            </StaffLayout>
        );
    }

    if (dashboardError) {
        return (
            <StaffLayout>
                <DashboardError
                    error={dashboardError}
                    onRetry={handleRefresh}
                />
            </StaffLayout>
        );
    }

    return (
        <StaffLayout>
            <div className="container-fluid">
                {/* System Alerts */}
                {systemAlerts.length > 0 && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <SystemAlerts alerts={systemAlerts} />
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h1 className="h3 mb-1">
                                    {dashboardData?.welcome_message?.greeting ||
                                        "Welcome to Staff Dashboard"}
                                </h1>
                                <p className="text-muted mb-0">
                                    {dashboardData?.welcome_message?.message ||
                                        "Manage your platform efficiently"}
                                </p>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={handleClearCache}
                                    title="Clear Cache"
                                >
                                    <i className="fas fa-trash-alt me-2"></i>
                                    Clear Cache
                                </button>
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
                                    {refreshing ? "Refreshing..." : "Refresh"}
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleExport}
                                    disabled={exporting}
                                >
                                    <i
                                        className={`fas fa-download ${
                                            exporting ? "fa-spin" : ""
                                        } me-2`}
                                    ></i>
                                    {exporting ? "Exporting..." : "Export Data"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                {statistics && (
                    <div className="row mb-4">
                        <div className="col-md-3 mb-3">
                            <StatsCard
                                title="Total Users"
                                value={statistics.users.overview.total}
                                change={`+${statistics.users.overview.new_today} today`}
                                icon="fas fa-users"
                                color="primary"
                                trend="up"
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <StatsCard
                                title="Active Services"
                                value={statistics.services.overview.active}
                                change={`${statistics.services.overview.total} total`}
                                icon="fas fa-cog"
                                color="success"
                                trend="stable"
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <StatsCard
                                title="Categories"
                                value={statistics.categories.overview.active}
                                change={`${statistics.categories.overview.total} total`}
                                icon="fas fa-folder-open"
                                color="warning"
                                trend="stable"
                            />
                        </div>
                        <div className="col-md-3 mb-3">
                            <StatsCard
                                title="Today's Appointments"
                                value={statistics.appointments.overview.today}
                                change={`${statistics.appointments.overview.total} total`}
                                icon="fas fa-calendar-alt"
                                color="info"
                                trend="up"
                            />
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};
export default StaffDashboard;
