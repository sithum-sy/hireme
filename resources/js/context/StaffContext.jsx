import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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
    const [dashboardStats, setDashboardStats] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [quickActions, setQuickActions] = useState([]);

    // Categories state
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesPagination, setCategoriesPagination] = useState({});
    const [categoriesFilters, setCategoriesFilters] = useState({
        search: "",
        status: "",
        sort_by: "sort_order",
        sort_order: "asc",
        per_page: 15,
    });
    const [currentCategory, setCurrentCategory] = useState(null);

    // General state
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // UI state
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);

    // Cache for frequently accessed data
    const [cache, setCache] = useState({
        dashboardStats: null,
        dashboardStatsExpiry: null,
    });

    // Clear messages after timeout
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Dashboard Methods
    const fetchDashboard = async (forceRefresh = false) => {
        setDashboardLoading(true);
        setErrors((prev) => ({ ...prev, dashboard: null }));

        try {
            const response = await axios.get("/api/staff/dashboard");

            if (response.data.success) {
                const data = response.data.data;
                setDashboardData(data);
                setTasks(data.tasks || []);
                setActivities(data.activities || []);
                setQuickActions(data.quick_actions || []);
                return data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch dashboard"
                );
            }
        } catch (error) {
            console.error("Dashboard error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load dashboard";
            setErrors((prev) => ({ ...prev, dashboard: errorMessage }));
            throw error;
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchDashboardStats = async (
        forceRefresh = false,
        cacheMinutes = 5
    ) => {
        // Check cache first (5 minutes expiry)
        const now = new Date().getTime();
        if (
            !forceRefresh &&
            cache?.dashboardStats &&
            cache?.dashboardStatsExpiry &&
            now < cache.dashboardStatsExpiry
        ) {
            setDashboardStats(cache.dashboardStats);
            return cache.dashboardStats;
        }

        setDashboardLoading(true);
        setErrors((prev) => ({ ...prev, dashboard: null }));

        try {
            const response = await axios.get("/api/staff/dashboard/stats", {
                params: { cache: cacheMinutes },
            });

            if (response.data.success) {
                const stats = response.data.data;
                setDashboardStats(stats);

                // Cache for 5 minutes
                setCache((prev) => ({
                    ...prev,
                    dashboardStats: stats,
                    dashboardStatsExpiry: now + 5 * 60 * 1000,
                }));

                return stats;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch dashboard stats"
                );
            }
        } catch (error) {
            console.error("Dashboard stats error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to load dashboard statistics";
            setErrors((prev) => ({ ...prev, dashboard: errorMessage }));
            throw error;
        } finally {
            setDashboardLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get("/api/staff/dashboard/tasks");

            if (response.data.success) {
                setTasks(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch tasks"
                );
            }
        } catch (error) {
            console.error("Tasks error:", error);
            throw error;
        }
    };

    const fetchActivities = async (params = {}) => {
        try {
            const defaultParams = {
                limit: 20,
                days: 30,
            };
            const response = await axios.get(
                "/api/staff/dashboard/activities",
                {
                    params: { ...defaultParams, ...params },
                }
            );

            if (response.data.success) {
                setActivities(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch activities"
                );
            }
        } catch (error) {
            console.error("Activities error:", error);
            throw error;
        }
    };

    const clearCache = async () => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, cache: null }));

        try {
            const response = await axios.post(
                "/api/staff/dashboard/clear-cache"
            );

            if (response.data.success) {
                setSuccessMessage("Cache cleared successfully");
                // Clear local cache
                setCache({
                    dashboardStats: null,
                    dashboardStatsExpiry: null,
                });
                // Refresh dashboard
                await fetchDashboard(true);
                return true;
            } else {
                throw new Error(
                    response.data.message || "Failed to clear cache"
                );
            }
        } catch (error) {
            console.error("Clear cache error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to clear cache";
            setErrors((prev) => ({ ...prev, cache: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    // Categories Methods
    const fetchCategories = async (filters = categoriesFilters, page = 1) => {
        setCategoriesLoading(true);
        setErrors((prev) => ({ ...prev, categories: null }));

        try {
            const params = { ...filters, page };
            const response = await axios.get("/api/staff/service-categories", {
                params,
            });

            if (response.data.success) {
                setCategories(response.data.data.data);
                setCategoriesPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total,
                    from: response.data.data.from,
                    to: response.data.data.to,
                });
                return response.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch categories"
                );
            }
        } catch (error) {
            console.error("Fetch categories error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load categories";
            setErrors((prev) => ({ ...prev, categories: errorMessage }));
            throw error;
        } finally {
            setCategoriesLoading(false);
        }
    };

    const createCategory = async (categoryData) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, createCategory: null }));

        try {
            const response = await axios.post(
                "/api/staff/service-categories",
                categoryData
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Add to categories list
                setCategories((prev) => [response.data.data.category, ...prev]);
                return response.data.data.category;
            } else {
                throw new Error(
                    response.data.message || "Failed to create category"
                );
            }
        } catch (error) {
            console.error("Create category error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to create category";
            const validationErrors = error.response?.data?.errors || {};
            setErrors((prev) => ({
                ...prev,
                createCategory: errorMessage,
                createCategoryValidation: validationErrors,
            }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const updateCategory = async (categoryId, categoryData) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, updateCategory: null }));

        try {
            const response = await axios.put(
                `/api/staff/service-categories/${categoryId}`,
                categoryData
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);

                // Update category in the current list
                setCategories((prevCategories) =>
                    prevCategories.map((c) =>
                        c.id === parseInt(categoryId)
                            ? { ...c, ...response.data.data.category }
                            : c
                    )
                );

                // Update current category if it's the same
                if (currentCategory?.id === parseInt(categoryId)) {
                    setCurrentCategory({
                        ...currentCategory,
                        ...response.data.data.category,
                    });
                }

                return response.data.data.category;
            } else {
                throw new Error(
                    response.data.message || "Failed to update category"
                );
            }
        } catch (error) {
            console.error("Update category error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to update category";
            const validationErrors = error.response?.data?.errors || {};

            setErrors((prev) => ({
                ...prev,
                updateCategory: errorMessage,
                updateCategoryValidation: validationErrors,
            }));

            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteCategory = async (categoryId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, deleteCategory: null }));

        try {
            const response = await axios.delete(
                `/api/staff/service-categories/${categoryId}`
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Remove category from the list
                setCategories((prev) =>
                    prev.filter((c) => c.id !== categoryId)
                );
                return true;
            } else {
                throw new Error(
                    response.data.message || "Failed to delete category"
                );
            }
        } catch (error) {
            console.error("Delete category error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to delete category";
            setErrors((prev) => ({ ...prev, deleteCategory: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleCategoryStatus = async (categoryId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, toggleCategory: null }));

        try {
            const response = await axios.patch(
                `/api/staff/service-categories/${categoryId}/toggle-status`
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Update category status in the list
                setCategories((prev) =>
                    prev.map((c) =>
                        c.id === categoryId
                            ? {
                                  ...c,
                                  is_active:
                                      response.data.data.category.is_active,
                              }
                            : c
                    )
                );
                return response.data.data.category;
            } else {
                throw new Error(
                    response.data.message || "Failed to toggle category status"
                );
            }
        } catch (error) {
            console.error("Toggle category status error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to toggle category status";
            setErrors((prev) => ({ ...prev, toggleCategory: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const getCategoryById = async (categoryId) => {
        setCategoriesLoading(true);
        setErrors((prev) => ({ ...prev, categoryDetails: null }));

        try {
            const response = await axios.get(
                `/api/staff/service-categories/${categoryId}`
            );

            if (response.data.success) {
                setCurrentCategory(response.data.data);
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch category details"
                );
            }
        } catch (error) {
            console.error("Get category details error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to load category details";
            setErrors((prev) => ({ ...prev, categoryDetails: errorMessage }));
            throw error;
        } finally {
            setCategoriesLoading(false);
        }
    };

    const getCategoryAnalytics = async (categoryId) => {
        try {
            const response = await axios.get(
                `/api/staff/service-categories/${categoryId}/analytics`
            );

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Failed to fetch category analytics"
                );
            }
        } catch (error) {
            console.error("Category analytics error:", error);
            throw error;
        }
    };

    // UI Methods
    const addNotification = (message, type = "info", duration = 5000) => {
        const id = Date.now().toString();
        const notification = { id, message, type, duration };

        setNotifications((prev) => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                setNotifications((prev) => prev.filter((n) => n.id !== id));
            }, duration);
        }
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    // Utility Methods
    const clearErrors = () => {
        setErrors({});
    };

    const clearSuccessMessage = () => {
        setSuccessMessage("");
    };

    const updateCategoriesFilters = (newFilters) => {
        setCategoriesFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const clearLocalCache = () => {
        setCache({
            dashboardStats: null,
            dashboardStatsExpiry: null,
        });
    };

    // Create state object to match the old structure
    const state = {
        dashboard: {
            data: dashboardData,
            stats: dashboardStats,
            tasks: tasks,
            activities: activities,
            quickActions: quickActions,
            loading: dashboardLoading,
            error: errors.dashboard,
            lastFetch: dashboardData ? new Date().toISOString() : null,
        },
        categories: {
            list: categories,
            currentCategory: currentCategory,
            pagination: categoriesPagination,
            filters: categoriesFilters,
            loading: categoriesLoading,
            error: errors.categories,
            meta: null,
        },
        activities: {
            list: activities,
            stats: null,
            loading: false,
            error: null,
        },
        ui: {
            sidebarOpen: sidebarOpen,
            activeTab: "dashboard",
            notifications: notifications,
            modals: {},
        },
    };

    const value = {
        // State (for backward compatibility)
        state,

        // Dashboard state
        dashboardStats,
        dashboardLoading,
        dashboardData,
        tasks,
        activities,
        quickActions,

        // Categories state
        categories,
        categoriesLoading,
        categoriesPagination,
        categoriesFilters,
        currentCategory,

        // General state
        errors,
        successMessage,
        isProcessing,

        // UI state
        sidebarOpen,
        notifications,

        // Dashboard methods
        fetchDashboard,
        fetchDashboardStats,
        fetchTasks,
        fetchActivities,
        clearCache,

        // Categories methods
        fetchCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryStatus,
        getCategoryById,
        getCategoryAnalytics,

        // UI methods
        setSidebarOpen,
        addNotification,
        removeNotification,

        // Utility methods
        clearErrors,
        clearSuccessMessage,
        updateCategoriesFilters,
        clearLocalCache,

        // Computed values
        isLoading: dashboardLoading || categoriesLoading,
        hasError: Object.keys(errors).length > 0,
    };

    return (
        <StaffContext.Provider value={value}>{children}</StaffContext.Provider>
    );
};

export default StaffContext;
