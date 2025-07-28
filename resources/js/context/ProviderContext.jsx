import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import availabilityService from "../services/availabilityService";

const ProviderContext = createContext();

export const useProvider = () => {
    const context = useContext(ProviderContext);
    if (!context) {
        throw new Error("useProvider must be used within a ProviderProvider");
    }
    return context;
};

export const ProviderProvider = ({ children }) => {
    // Provider Profile State
    const [providerProfile, setProviderProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Business Statistics State
    const [businessStats, setBusinessStats] = useState({
        totalEarnings: 0,
        monthlyEarnings: 0,
        weeklyEarnings: 0,
        todaysEarnings: 0,
        totalAppointments: 0,
        todaysAppointments: 0,
        pendingRequests: 0,
        averageRating: 0,
        responseRate: 0,
        completedJobs: 0,
        activeServices: 0,
        totalViews: 0,
        conversionRate: 0,
    });

    // Dashboard Metrics State
    const [dashboardMetrics, setDashboardMetrics] = useState({
        recentAppointments: [],
        recentEarnings: [],
        performanceIndicators: {},
        monthlyTrends: [],
        topServices: [],
        clientReviews: [],
    });

    // Provider Notifications State
    const [providerNotifications, setProviderNotifications] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    // Availability State - Enhanced
    const [availability, setAvailability] = useState({
        isAvailable: true,
        weeklySchedule: {},
        blockedTimes: [],
        timeSlots: [],
        summary: null,
        lastUpdated: null,
    });

    // Loading States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Availability Management State
    const [availabilityData, setAvailabilityData] = useState(null);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [appointmentStats, setAppointmentStats] = useState({
        today: 0,
        pending: 0,
        confirmed: 0,
        thisWeek: 0,
        totalEarnings: 0,
    });

    // Initialize provider data on mount
    useEffect(() => {
        loadProviderData();
    }, []);

    // **PROVIDER PROFILE MANAGEMENT**
    const getProviderProfile = async () => {
        setProfileLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/provider/profile");

            if (response.data.success) {
                setProviderProfile(response.data.data);
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch provider profile";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setProfileLoading(false);
        }
    };

    const updateProviderProfile = async (profileData) => {
        setProfileLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                "/api/provider/profile",
                profileData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                setProviderProfile(response.data.data);
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to update provider profile";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || {},
            };
        } finally {
            setProfileLoading(false);
        }
    };

    const toggleAvailability = async () => {
        try {
            const response = await axios.post(
                "/api/provider/profile/toggle-availability"
            );

            if (response.data.success) {
                setAvailability((prev) => ({
                    ...prev,
                    isAvailable: !prev.isAvailable,
                    lastUpdated: new Date(),
                }));

                // Refresh business stats and availability data
                await Promise.all([
                    getBusinessStatistics(),
                    refreshAvailabilityData(),
                ]);

                return {
                    success: true,
                    message: response.data.message,
                    isAvailable: !availability.isAvailable,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to toggle availability";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    const getAppointmentStatistics = async () => {
        try {
            const result = await providerAppointmentService.getAppointments({});
            if (result.success) {
                const appointments = result.data.data || [];
                const today = new Date().toDateString();
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());

                const stats = {
                    today: appointments.filter(
                        (apt) =>
                            new Date(apt.appointment_date).toDateString() ===
                            today
                    ).length,
                    pending: appointments.filter(
                        (apt) => apt.status === "pending"
                    ).length,
                    confirmed: appointments.filter(
                        (apt) => apt.status === "confirmed"
                    ).length,
                    thisWeek: appointments.filter(
                        (apt) => new Date(apt.appointment_date) >= weekStart
                    ).length,
                    totalEarnings: appointments
                        .filter((apt) => apt.status === "completed")
                        .reduce((sum, apt) => sum + (apt.earnings || 0), 0),
                };

                setAppointmentStats(stats);
            }
        } catch (error) {
            console.error("Failed to load appointment stats:", error);
        }
    };

    // **BUSINESS STATISTICS MANAGEMENT**
    const getBusinessStatistics = async (period = "all") => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/provider/dashboard/business-statistics?period=${period}`
            );

            if (response.data.success) {
                setBusinessStats(response.data.data);
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch business statistics";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // **DASHBOARD METRICS MANAGEMENT**
    const getDashboardMetrics = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/provider/dashboard/metrics`
            );

            if (response.data.success) {
                setDashboardMetrics(response.data.data);
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch dashboard metrics";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // **PROVIDER NOTIFICATIONS MANAGEMENT**
    const getProviderNotifications = async (page = 1) => {
        try {
            // Mock notifications for now
            const mockNotifications = [
                {
                    id: 1,
                    type: "request",
                    title: "New Service Request",
                    message:
                        "Sarah Perera requested house cleaning service for tomorrow",
                    time: "5 minutes ago",
                    read: false,
                    priority: "high",
                    actionUrl: "/provider/requests",
                },
                {
                    id: 2,
                    type: "payment",
                    title: "Payment Received",
                    message:
                        "Rs. 150 payment received from completed cleaning job",
                    time: "1 hour ago",
                    read: false,
                    priority: "medium",
                    actionUrl: "/provider/earnings",
                },
                {
                    id: 3,
                    type: "review",
                    title: "New 5-Star Review",
                    message:
                        "Nuwan Fernando left a review: 'Excellent service!'",
                    time: "2 hours ago",
                    read: true,
                    priority: "low",
                    actionUrl: "/provider/reviews",
                },
                {
                    id: 4,
                    type: "opportunity",
                    title: "High Demand Alert",
                    message:
                        "Increased demand for cleaning services in your area",
                    time: "3 hours ago",
                    read: false,
                    priority: "medium",
                    actionUrl: "/provider/services",
                },
                {
                    id: 5,
                    type: "reminder",
                    title: "Update Availability",
                    message:
                        "Remember to update your availability for next week",
                    time: "1 day ago",
                    read: true,
                    priority: "low",
                    actionUrl: "/provider/availability",
                },
            ];

            setProviderNotifications(mockNotifications);
            setUnreadNotifications(
                mockNotifications.filter((n) => !n.read).length
            );

            return {
                success: true,
                data: mockNotifications,
                unread: mockNotifications.filter((n) => !n.read).length,
            };
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch notifications";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    const markNotificationAsRead = async (notificationId) => {
        try {
            setProviderNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === notificationId
                        ? { ...notification, read: true }
                        : notification
                )
            );

            // Update unread count
            const newUnreadCount = providerNotifications.filter(
                (n) => !n.read && n.id !== notificationId
            ).length;
            setUnreadNotifications(newUnreadCount);

            return {
                success: true,
                message: "Notification marked as read",
            };
        } catch (error) {
            const errorMessage = "Failed to mark notification as read";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    const markAllNotificationsAsRead = async () => {
        try {
            setProviderNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read: true }))
            );
            setUnreadNotifications(0);

            return {
                success: true,
                message: "All notifications marked as read",
            };
        } catch (error) {
            const errorMessage = "Failed to mark all notifications as read";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        }
    };

    // **ENHANCED AVAILABILITY MANAGEMENT**
    const getWeeklyAvailability = async () => {
        setAvailabilityLoading(true);
        try {
            const result = await availabilityService.getWeeklyAvailability();

            if (result.success) {
                setAvailability((prev) => ({
                    ...prev,
                    weeklySchedule: result.data,
                    lastUpdated: new Date(),
                }));

                return result;
            } else {
                // Fallback to mock data
                const mockAvailability = {
                    monday: { enabled: true, start: "09:00", end: "17:00" },
                    tuesday: { enabled: true, start: "09:00", end: "17:00" },
                    wednesday: { enabled: true, start: "09:00", end: "17:00" },
                    thursday: { enabled: true, start: "09:00", end: "17:00" },
                    friday: { enabled: true, start: "09:00", end: "17:00" },
                    saturday: { enabled: true, start: "10:00", end: "15:00" },
                    sunday: { enabled: false, start: "", end: "" },
                };

                setAvailability((prev) => ({
                    ...prev,
                    weeklySchedule: mockAvailability,
                    lastUpdated: new Date(),
                }));

                return {
                    success: false,
                    message: result.message,
                    mockData: mockAvailability,
                };
            }
        } catch (error) {
            const errorMessage = "Failed to fetch availability";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setAvailabilityLoading(false);
        }
    };

    const updateWeeklyAvailability = async (scheduleData) => {
        setAvailabilityLoading(true);
        setError(null);
        try {
            const result = await availabilityService.updateWeeklyAvailability(
                scheduleData
            );

            if (result.success) {
                setAvailability((prev) => ({
                    ...prev,
                    weeklySchedule: result.data,
                    lastUpdated: new Date(),
                }));

                // Refresh availability summary
                await refreshAvailabilityData();

                return result;
            } else {
                setError(result.message);
                return result;
            }
        } catch (error) {
            const errorMessage = "Failed to update availability";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setAvailabilityLoading(false);
        }
    };

    // **NEW: Enhanced Availability Functions**
    const getAvailabilitySummary = async () => {
        try {
            const result = await availabilityService.getAvailabilitySummary();

            if (result.success) {
                setAvailabilityData(result.data);
                setAvailability((prev) => ({
                    ...prev,
                    summary: result.data,
                    lastUpdated: new Date(),
                }));
            }

            return result;
        } catch (error) {
            console.error("Error getting availability summary:", error);
            return {
                success: false,
                message: "Failed to get availability summary",
            };
        }
    };

    const getBlockedTimes = async (startDate = null, endDate = null) => {
        try {
            const result = await availabilityService.getBlockedTimes(
                startDate,
                endDate
            );

            if (result.success) {
                setAvailability((prev) => ({
                    ...prev,
                    blockedTimes: result.data,
                    lastUpdated: new Date(),
                }));
            }

            return result;
        } catch (error) {
            console.error("Error getting blocked times:", error);
            return {
                success: false,
                message: "Failed to get blocked times",
            };
        }
    };

    const createBlockedTime = async (blockedTimeData) => {
        try {
            const result = await availabilityService.createBlockedTime(
                blockedTimeData
            );

            if (result.success) {
                // Refresh blocked times and summary
                await Promise.all([
                    getBlockedTimes(),
                    refreshAvailabilityData(),
                ]);
            }

            return result;
        } catch (error) {
            console.error("Error creating blocked time:", error);
            return {
                success: false,
                message: "Failed to create blocked time",
            };
        }
    };

    const deleteBlockedTime = async (blockedTimeId) => {
        try {
            const result = await availabilityService.deleteBlockedTime(
                blockedTimeId
            );

            if (result.success) {
                // Refresh blocked times and summary
                await Promise.all([
                    getBlockedTimes(),
                    refreshAvailabilityData(),
                ]);
            }

            return result;
        } catch (error) {
            console.error("Error deleting blocked time:", error);
            return {
                success: false,
                message: "Failed to delete blocked time",
            };
        }
    };

    const refreshAvailabilityData = async () => {
        try {
            const result = await getAvailabilitySummary();
            return result;
        } catch (error) {
            console.error("Error refreshing availability data:", error);
            return {
                success: false,
                message: "Failed to refresh availability data",
            };
        }
    };

    const getAvailabilityStatus = () => {
        if (!availabilityData) return "unknown";

        const workingDays = availabilityData.total_working_days || 0;
        const blockedTimes = availabilityData.blocked_times_count || 0;

        if (workingDays === 0) return "no_schedule";
        if (workingDays < 3) return "limited";
        if (blockedTimes > 5) return "partial";
        return "available";
    };

    // **EARNINGS MANAGEMENT**
    const getEarningsData = async (period = "month") => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/provider/dashboard/earnings?period=${period}`
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to fetch earnings data";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // **UTILITY FUNCTIONS**
    const loadProviderData = async () => {
        setLoading(true);
        try {
            // Load all provider data in parallel
            await Promise.all([
                getBusinessStatistics(),
                getDashboardMetrics(),
                getProviderNotifications(),
                getWeeklyAvailability(),
                getAvailabilitySummary(),
            ]);
        } catch (error) {
            console.error("Failed to load provider data:", error);
        } finally {
            setLoading(false);
        }
    };

    const refreshProviderData = async () => {
        await loadProviderData();
    };

    // Get performance status helper
    const getPerformanceStatus = (value, type) => {
        switch (type) {
            case "rating":
                return value >= 4.5
                    ? "excellent"
                    : value >= 4.0
                    ? "good"
                    : "needs_improvement";
            case "responseRate":
                return value >= 90
                    ? "excellent"
                    : value >= 75
                    ? "good"
                    : "needs_improvement";
            case "conversionRate":
                return value >= 15
                    ? "excellent"
                    : value >= 10
                    ? "good"
                    : "needs_improvement";
            default:
                return "good";
        }
    };

    // Calculate today's potential earnings
    const getTodaysPotentialEarnings = () => {
        return dashboardMetrics.recentAppointments
            .filter(
                (apt) => apt.date === new Date().toISOString().split("T")[0]
            )
            .reduce((total, apt) => total + apt.earnings, 0);
    };

    // Get business insights
    const getBusinessInsights = () => {
        const insights = [];

        if (businessStats.responseRate < 75) {
            insights.push({
                type: "warning",
                title: "Improve Response Rate",
                message: "Respond to requests faster to boost your ranking",
                action: "View Requests",
                actionUrl: "/provider/requests",
            });
        }

        if (businessStats.averageRating < 4.0) {
            insights.push({
                type: "danger",
                title: "Rating Alert",
                message: "Focus on service quality to improve ratings",
                action: "View Reviews",
                actionUrl: "/provider/reviews",
            });
        }

        if (businessStats.activeServices < 3) {
            insights.push({
                type: "info",
                title: "Expand Services",
                message: "Add more services to increase bookings",
                action: "Add Service",
                actionUrl: "/provider/services/create",
            });
        }

        // Availability-specific insights
        const availabilityStatus = getAvailabilityStatus();
        if (availabilityStatus === "no_schedule") {
            insights.push({
                type: "warning",
                title: "Set Your Schedule",
                message: "Set your working hours to start receiving bookings",
                action: "Set Schedule",
                actionUrl: "/provider/availability/schedule",
            });
        } else if (availabilityStatus === "limited") {
            insights.push({
                type: "info",
                title: "Expand Availability",
                message:
                    "More working days can increase your booking opportunities",
                action: "Update Schedule",
                actionUrl: "/provider/availability/schedule",
            });
        }

        return insights;
    };

    // Context value
    const value = {
        // Provider Profile
        providerProfile,
        profileLoading,
        getProviderProfile,
        updateProviderProfile,
        toggleAvailability,

        // Business Statistics
        businessStats,
        getBusinessStatistics,

        // Dashboard Metrics
        dashboardMetrics,
        getDashboardMetrics,

        // Notifications
        providerNotifications,
        unreadNotifications,
        getProviderNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,

        // Enhanced Availability Management
        availability,
        availabilityData,
        availabilityLoading,
        getWeeklyAvailability,
        updateWeeklyAvailability,
        getAvailabilitySummary,
        getBlockedTimes,
        createBlockedTime,
        deleteBlockedTime,
        refreshAvailabilityData,
        getAvailabilityStatus,

        // Earnings
        getEarningsData,

        // Utility Functions
        loadProviderData,
        refreshProviderData,
        getPerformanceStatus,
        getTodaysPotentialEarnings,
        getBusinessInsights,

        // States
        loading,
        error,
    };

    return (
        <ProviderContext.Provider value={value}>
            {children}
        </ProviderContext.Provider>
    );
};
