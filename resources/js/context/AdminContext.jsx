import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AdminContext = createContext();

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error("useAdmin must be used within an AdminProvider");
    }
    return context;
};

export const AdminProvider = ({ children }) => {
    // Dashboard state
    const [dashboardStats, setDashboardStats] = useState(null);
    const [dashboardLoading, setDashboardLoading] = useState(false);

    // Staff management state
    const [staff, setStaff] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffPagination, setStaffPagination] = useState({});
    const [staffFilters, setStaffFilters] = useState({
        search: "",
        status: null,
        per_page: 15,
    });

    // User management state
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersPagination, setUsersPagination] = useState({});
    const [usersFilters, setUsersFilters] = useState({
        search: "",
        role: null,
        status: null,
        sort_by: "created_at",
        sort_order: "desc",
        per_page: 15,
    });

    // General state
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

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
    const fetchDashboardStats = async (forceRefresh = false) => {
        // Check cache first (5 minutes expiry)
        const now = new Date().getTime();
        if (
            !forceRefresh &&
            cache.dashboardStats &&
            cache.dashboardStatsExpiry &&
            now < cache.dashboardStatsExpiry
        ) {
            setDashboardStats(cache.dashboardStats);
            return cache.dashboardStats;
        }

        setDashboardLoading(true);
        setErrors((prev) => ({ ...prev, dashboard: null }));

        try {
            const response = await axios.get("/api/admin/dashboard/stats");

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

    const fetchDashboardOverview = async () => {
        setDashboardLoading(true);
        setErrors((prev) => ({ ...prev, dashboard: null }));

        try {
            const response = await axios.get("/api/admin/dashboard");

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message ||
                        "Failed to fetch dashboard overview"
                );
            }
        } catch (error) {
            console.error("Dashboard overview error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to load dashboard overview";
            setErrors((prev) => ({ ...prev, dashboard: errorMessage }));
            throw error;
        } finally {
            setDashboardLoading(false);
        }
    };

    // Staff Management Methods
    const fetchStaff = async (filters = staffFilters, page = 1) => {
        setStaffLoading(true);
        setErrors((prev) => ({ ...prev, staff: null }));

        try {
            const params = { ...filters, page };
            const response = await axios.get("/api/admin/staff", { params });

            if (response.data.success) {
                setStaff(response.data.data.data);
                setStaffPagination({
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
                    response.data.message || "Failed to fetch staff"
                );
            }
        } catch (error) {
            console.error("Fetch staff error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load staff members";
            setErrors((prev) => ({ ...prev, staff: errorMessage }));
            throw error;
        } finally {
            setStaffLoading(false);
        }
    };

    const createStaff = async (staffData) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, createStaff: null }));

        try {
            const response = await axios.post("/api/admin/staff", staffData, {
                headers: {
                    "Content-Type":
                        staffData instanceof FormData
                            ? "multipart/form-data"
                            : "application/json",
                },
            });

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Refresh staff list
                await fetchStaff();
                return response.data.data.staff;
            } else {
                throw new Error(
                    response.data.message || "Failed to create staff member"
                );
            }
        } catch (error) {
            console.error("Create staff error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to create staff member";
            const validationErrors = error.response?.data?.errors || {};
            setErrors((prev) => ({
                ...prev,
                createStaff: errorMessage,
                createStaffValidation: validationErrors,
            }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const updateStaff = async (staffId, staffData) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, updateStaff: null }));

        try {
            let response;

            if (staffData instanceof FormData) {
                // For FormData, use POST with _method override
                staffData.append("_method", "PUT");

                response = await axios.post(
                    `/api/admin/staff/${staffId}`,
                    staffData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
            } else {
                // For regular JSON data, use PUT
                response = await axios.put(
                    `/api/admin/staff/${staffId}`,
                    staffData,
                    {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    }
                );
            }

            if (response.data.success) {
                setSuccessMessage(response.data.message);

                // Update staff in the current list if it exists
                setStaff((prevStaff) =>
                    prevStaff.map((s) =>
                        s.id === parseInt(staffId)
                            ? { ...s, ...response.data.data.staff }
                            : s
                    )
                );

                return response.data.data.staff;
            } else {
                throw new Error(
                    response.data.message || "Failed to update staff member"
                );
            }
        } catch (error) {
            console.error("Update staff error:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update staff member";
            const validationErrors = error.response?.data?.errors || {};

            setErrors((prev) => ({
                ...prev,
                updateStaff: errorMessage,
                updateStaffValidation: validationErrors,
            }));

            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteStaff = async (staffId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, deleteStaff: null }));

        try {
            const response = await axios.delete(`/api/admin/staff/${staffId}`);

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Remove staff from the list
                setStaff((prev) => prev.filter((s) => s.id !== staffId));
                return true;
            } else {
                throw new Error(
                    response.data.message || "Failed to delete staff member"
                );
            }
        } catch (error) {
            console.error("Delete staff error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to delete staff member";
            setErrors((prev) => ({ ...prev, deleteStaff: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleStaffStatus = async (staffId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, toggleStaff: null }));

        try {
            const response = await axios.patch(
                `/api/admin/staff/${staffId}/toggle-status`
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Update staff status in the list
                setStaff((prev) =>
                    prev.map((s) =>
                        s.id === staffId
                            ? {
                                  ...s,
                                  is_active: response.data.data.staff.is_active,
                              }
                            : s
                    )
                );
                return response.data.data.staff;
            } else {
                throw new Error(
                    response.data.message || "Failed to toggle staff status"
                );
            }
        } catch (error) {
            console.error("Toggle staff status error:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Failed to toggle staff status";
            setErrors((prev) => ({ ...prev, toggleStaff: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const getStaffById = async (staffId) => {
        setStaffLoading(true);
        setErrors((prev) => ({ ...prev, staffDetails: null }));

        try {
            const response = await axios.get(`/api/admin/staff/${staffId}`);

            if (response.data.success) {
                return response.data.data.staff;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch staff details"
                );
            }
        } catch (error) {
            console.error("Get staff details error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load staff details";
            setErrors((prev) => ({ ...prev, staffDetails: errorMessage }));
            throw error;
        } finally {
            setStaffLoading(false);
        }
    };

    // User Management Methods
    const fetchUsers = async (filters = usersFilters, page = 1) => {
        setUsersLoading(true);
        setErrors((prev) => ({ ...prev, users: null }));

        try {
            const params = { ...filters, page };
            const response = await axios.get("/api/admin/users", { params });

            if (response.data.success) {
                setUsers(response.data.data.data);
                setUsersPagination({
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
                    response.data.message || "Failed to fetch users"
                );
            }
        } catch (error) {
            console.error("Fetch users error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load users";
            setErrors((prev) => ({ ...prev, users: errorMessage }));
            throw error;
        } finally {
            setUsersLoading(false);
        }
    };

    const getUserById = async (userId) => {
        setUsersLoading(true);
        setErrors((prev) => ({ ...prev, userDetails: null }));

        try {
            const response = await axios.get(`/api/admin/users/${userId}`);

            if (response.data.success) {
                return response.data.data.user;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch user details"
                );
            }
        } catch (error) {
            console.error("Get user details error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to load user details";
            setErrors((prev) => ({ ...prev, userDetails: errorMessage }));
            throw error;
        } finally {
            setUsersLoading(false);
        }
    };

    const toggleUserStatus = async (userId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, toggleUser: null }));

        try {
            const response = await axios.patch(
                `/api/admin/users/${userId}/toggle-status`
            );

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Update user status in the list
                setUsers((prev) =>
                    prev.map((u) =>
                        u.id === userId
                            ? {
                                  ...u,
                                  is_active: response.data.data.user.is_active,
                              }
                            : u
                    )
                );
                return response.data.data.user;
            } else {
                throw new Error(
                    response.data.message || "Failed to toggle user status"
                );
            }
        } catch (error) {
            console.error("Toggle user status error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to toggle user status";
            setErrors((prev) => ({ ...prev, toggleUser: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    const deleteUser = async (userId) => {
        setIsProcessing(true);
        setErrors((prev) => ({ ...prev, deleteUser: null }));

        try {
            const response = await axios.delete(`/api/admin/users/${userId}`);

            if (response.data.success) {
                setSuccessMessage(response.data.message);
                // Remove user from the list
                setUsers((prev) => prev.filter((u) => u.id !== userId));
                return true;
            } else {
                throw new Error(
                    response.data.message || "Failed to delete user"
                );
            }
        } catch (error) {
            console.error("Delete user error:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to delete user";
            setErrors((prev) => ({ ...prev, deleteUser: errorMessage }));
            throw error;
        } finally {
            setIsProcessing(false);
        }
    };

    // Utility Methods
    const clearErrors = () => {
        setErrors({});
    };

    const clearSuccessMessage = () => {
        setSuccessMessage("");
    };

    const updateStaffFilters = (newFilters) => {
        setStaffFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const updateUsersFilters = (newFilters) => {
        setUsersFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const clearCache = () => {
        setCache({
            dashboardStats: null,
            dashboardStatsExpiry: null,
        });
    };

    // Reports Methods
    const getOverviewReport = async (days = 30) => {
        try {
            const response = await axios.get("/api/admin/reports/overview", {
                params: { days },
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch overview report"
                );
            }
        } catch (error) {
            console.error("Overview report error:", error);
            throw error;
        }
    };

    const getUsersReport = async (days = 30) => {
        try {
            const response = await axios.get("/api/admin/reports/users", {
                params: { days },
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch users report"
                );
            }
        } catch (error) {
            console.error("Users report error:", error);
            throw error;
        }
    };

    const getActivitiesReport = async (limit = 50) => {
        try {
            const response = await axios.get("/api/admin/reports/activities", {
                params: { limit },
            });

            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(
                    response.data.message || "Failed to fetch activities report"
                );
            }
        } catch (error) {
            console.error("Activities report error:", error);
            throw error;
        }
    };

    const value = {
        // Dashboard state
        dashboardStats,
        dashboardLoading,

        // Staff state
        staff,
        staffLoading,
        staffPagination,
        staffFilters,

        // Users state
        users,
        usersLoading,
        usersPagination,
        usersFilters,

        // General state
        errors,
        successMessage,
        isProcessing,

        // Dashboard methods
        fetchDashboardStats,
        fetchDashboardOverview,

        // Staff methods
        fetchStaff,
        createStaff,
        updateStaff,
        deleteStaff,
        toggleStaffStatus,
        getStaffById,

        // User methods
        fetchUsers,
        getUserById,
        toggleUserStatus,
        deleteUser,

        // Reports methods
        getOverviewReport,
        getUsersReport,
        getActivitiesReport,

        // Utility methods
        clearErrors,
        clearSuccessMessage,
        updateStaffFilters,
        updateUsersFilters,
        clearCache,
    };

    return (
        <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    );
};
