import React, { createContext, useContext, useState, useEffect } from "react";

const StaffContext = createContext();

export const useStaff = () => {
    const context = useContext(StaffContext);
    if (!context) {
        throw new Error("useStaff must be used within a StaffProvider");
    }
    return context;
};

export const StaffProvider = ({ children }) => {
    // Dashboard state
    const [dashboardData, setDashboardData] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardError, setDashboardError] = useState(null);

    // Statistics state
    const [statistics, setStatistics] = useState(null);
    const [statisticsLoading, setStatisticsLoading] = useState(false);

    // Activities state
    const [activities, setActivities] = useState([]);
    const [activitiesLoading, setActivitiesLoading] = useState(false);

    // Tasks state
    const [tasks, setTasks] = useState({
        high_priority: [],
        medium_priority: [],
        low_priority: [],
    });

    // General state
    const [notifications, setNotifications] = useState([]);
    const [systemAlerts, setSystemAlerts] = useState([]);

    // Base URL for API calls
    const baseURL = "/api/staff";

    // Helper function to make API calls
    const makeAPICall = async (endpoint, options = {}) => {
        try {
            const token = localStorage.getItem("auth_token");
            const response = await fetch(`${baseURL}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "API call failed");
            }

            return data;
        } catch (error) {
            console.error("API call error:", error);
            throw error;
        }
    };

    // Dashboard API calls
    const fetchDashboard = async () => {
        try {
            setDashboardLoading(true);
            setDashboardError(null);

            const response = await makeAPICall("/dashboard");
            setDashboardData(response.data);

            // Update individual state pieces
            if (response.data.stats) setStatistics(response.data.stats);
            if (response.data.activities)
                setActivities(response.data.activities);
            if (response.data.tasks) setTasks(response.data.tasks);
            if (response.data.system_alerts)
                setSystemAlerts(response.data.system_alerts);

            return response.data;
        } catch (error) {
            setDashboardError(error.message);
            throw error;
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchStatistics = async (cacheMinutes = 5) => {
        try {
            setStatisticsLoading(true);

            const response = await makeAPICall(
                `/dashboard/stats?cache=${cacheMinutes}`
            );
            setStatistics(response.data);

            return response.data;
        } catch (error) {
            console.error("Failed to fetch statistics:", error);
            throw error;
        } finally {
            setStatisticsLoading(false);
        }
    };

    const fetchActivities = async (limit = 10, days = 30) => {
        try {
            setActivitiesLoading(true);

            const response = await makeAPICall(
                `/dashboard/activities?limit=${limit}&days=${days}`
            );
            setActivities(response.data);

            return response.data;
        } catch (error) {
            console.error("Failed to fetch activities:", error);
            throw error;
        } finally {
            setActivitiesLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await makeAPICall("/dashboard/tasks");
            setTasks(response.data);

            return response.data;
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            throw error;
        }
    };

    const fetchQuickActions = async () => {
        try {
            const response = await makeAPICall("/dashboard/quick-actions");
            return response.data;
        } catch (error) {
            console.error("Failed to fetch quick actions:", error);
            throw error;
        }
    };

    const fetchOverview = async (days = 30, includeCharts = true) => {
        try {
            const response = await makeAPICall(
                `/dashboard/overview?days=${days}&charts=${includeCharts}`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to fetch overview:", error);
            throw error;
        }
    };

    const clearCache = async () => {
        try {
            const response = await makeAPICall("/dashboard/clear-cache", {
                method: "POST",
            });

            // Refresh dashboard data after clearing cache
            await fetchDashboard();

            return response.data;
        } catch (error) {
            console.error("Failed to clear cache:", error);
            throw error;
        }
    };

    const exportData = async (format = "json", days = 30) => {
        try {
            const response = await makeAPICall(
                `/dashboard/export?format=${format}&days=${days}`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to export data:", error);
            throw error;
        }
    };

    // Service Categories API calls
    const fetchServiceCategories = async (params = {}) => {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await makeAPICall(
                `/service-categories?${queryParams}`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to fetch service categories:", error);
            throw error;
        }
    };

    const createServiceCategory = async (categoryData) => {
        try {
            const response = await makeAPICall("/service-categories", {
                method: "POST",
                body: JSON.stringify(categoryData),
            });

            // Refresh dashboard statistics
            await fetchStatistics();

            return response.data;
        } catch (error) {
            console.error("Failed to create service category:", error);
            throw error;
        }
    };

    const updateServiceCategory = async (categoryId, categoryData) => {
        try {
            const response = await makeAPICall(
                `/service-categories/${categoryId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(categoryData),
                }
            );

            // Refresh dashboard statistics
            await fetchStatistics();

            return response.data;
        } catch (error) {
            console.error("Failed to update service category:", error);
            throw error;
        }
    };

    const deleteServiceCategory = async (categoryId) => {
        try {
            const response = await makeAPICall(
                `/service-categories/${categoryId}`,
                {
                    method: "DELETE",
                }
            );

            // Refresh dashboard statistics
            await fetchStatistics();

            return response.data;
        } catch (error) {
            console.error("Failed to delete service category:", error);
            throw error;
        }
    };

    const toggleCategoryStatus = async (categoryId) => {
        try {
            const response = await makeAPICall(
                `/service-categories/${categoryId}/toggle-status`,
                {
                    method: "PATCH",
                }
            );

            // Refresh dashboard statistics
            await fetchStatistics();

            return response.data;
        } catch (error) {
            console.error("Failed to toggle category status:", error);
            throw error;
        }
    };

    // Notification management
    const addNotification = (notification) => {
        const newNotification = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };

        setNotifications((prev) => [newNotification, ...prev]);

        // Auto-remove after 5 seconds for success notifications
        if (notification.type === "success") {
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, 5000);
        }
    };

    const removeNotification = (notificationId) => {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    const clearAllNotifications = () => {
        setNotifications([]);
    };

    // Real-time updates (simulated)
    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate real-time updates
            if (dashboardData) {
                fetchActivities(5); // Fetch latest activities
            }
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [dashboardData]);

    // Initialize dashboard on mount
    useEffect(() => {
        fetchDashboard();
    }, []);

    // Helper functions
    const getUnreadNotificationsCount = () => {
        return notifications.filter((n) => !n.read).length;
    };

    const getHighPriorityTasksCount = () => {
        return tasks.high_priority.length;
    };

    const getSystemAlertsCount = () => {
        return systemAlerts.length;
    };

    const refreshDashboard = async () => {
        try {
            await fetchDashboard();
            addNotification({
                type: "success",
                title: "Dashboard Refreshed",
                message: "Dashboard data has been updated successfully",
            });
        } catch (error) {
            addNotification({
                type: "error",
                title: "Refresh Failed",
                message: "Failed to refresh dashboard data",
            });
        }
    };

    const value = {
        // Dashboard state
        dashboardData,
        dashboardLoading,
        dashboardError,

        // Statistics state
        statistics,
        statisticsLoading,

        // Activities state
        activities,
        activitiesLoading,

        // Tasks state
        tasks,

        // Notifications state
        notifications,
        systemAlerts,

        // Dashboard API methods
        fetchDashboard,
        fetchStatistics,
        fetchActivities,
        fetchTasks,
        fetchQuickActions,
        fetchOverview,
        clearCache,
        exportData,
        refreshDashboard,

        // Service Categories API methods
        fetchServiceCategories,
        createServiceCategory,
        updateServiceCategory,
        deleteServiceCategory,
        toggleCategoryStatus,

        // Notification methods
        addNotification,
        removeNotification,
        markNotificationAsRead,
        clearAllNotifications,

        // Helper methods
        getUnreadNotificationsCount,
        getHighPriorityTasksCount,
        getSystemAlertsCount,

        // Utility methods
        makeAPICall,
    };

    return (
        <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
    );
};

// Higher-order component for easy integration
export const withStaff = (Component) => {
    return function StaffEnhancedComponent(props) {
        return (
            <StaffProvider>
                <Component {...props} />
            </StaffProvider>
        );
    };
};

export default StaffContext;
