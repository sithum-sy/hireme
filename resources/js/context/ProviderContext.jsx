import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

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

    // Availability State
    const [availability, setAvailability] = useState({
        isAvailable: true,
        weeklySchedule: {},
        blockedTimes: [],
        timeSlots: [],
    });

    // Loading States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize provider data on mount
    useEffect(() => {
        loadProviderData();
    }, []);

    // **PROVIDER PROFILE MANAGEMENT**
    const getProviderProfile = async () => {
        setProfileLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/profile/provider");

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
                "/api/profile/provider",
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
                "/api/profile/toggle-availability"
            );

            if (response.data.success) {
                setAvailability((prev) => ({
                    ...prev,
                    isAvailable: !prev.isAvailable,
                }));

                // Refresh business stats
                await getBusinessStatistics();

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

    // **BUSINESS STATISTICS MANAGEMENT**
    const getBusinessStatistics = async (period = "all") => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/profile/provider/statistics?period=${period}`
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

            // Use mock data if API fails (for development)
            const mockStats = {
                totalEarnings: 25450.0,
                monthlyEarnings: 8750.0,
                weeklyEarnings: 2150.0,
                todaysEarnings: 450.0,
                totalAppointments: 156,
                todaysAppointments: 3,
                pendingRequests: 7,
                averageRating: 4.8,
                responseRate: 95,
                completedJobs: 142,
                activeServices: 8,
                totalViews: 1247,
                conversionRate: 12.5,
            };

            setBusinessStats(mockStats);

            return {
                success: false,
                message: errorMessage,
                mockData: mockStats,
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
            // For now, use mock data since the endpoint might not exist yet
            const mockMetrics = {
                recentAppointments: [
                    {
                        id: 1,
                        client: "Sarah Perera",
                        service: "House Cleaning",
                        date: "2024-01-15",
                        time: "10:00 AM",
                        status: "confirmed",
                        location: "Bambalapitiya, Colombo",
                        earnings: 150,
                    },
                    {
                        id: 2,
                        client: "Kamal Silva",
                        service: "Plumbing Repair",
                        date: "2024-01-16",
                        time: "2:00 PM",
                        status: "pending",
                        location: "Mount Lavinia",
                        earnings: 200,
                    },
                ],
                recentEarnings: [
                    { date: "Mon", amount: 250 },
                    { date: "Tue", amount: 180 },
                    { date: "Wed", amount: 320 },
                    { date: "Thu", amount: 150 },
                    { date: "Fri", amount: 280 },
                    { date: "Sat", amount: 450 },
                    { date: "Sun", amount: 200 },
                ],
                performanceIndicators: {
                    responseRate: {
                        value: 95,
                        status: "excellent",
                        trend: "up",
                    },
                    rating: {
                        value: 4.8,
                        status: "excellent",
                        trend: "stable",
                    },
                    bookingRate: {
                        value: 12.5,
                        status: "good",
                        trend: "up",
                    },
                },
                monthlyTrends: [
                    { month: "Jan", bookings: 45, earnings: 6750 },
                    { month: "Feb", bookings: 52, earnings: 7800 },
                    { month: "Mar", bookings: 48, earnings: 7200 },
                    { month: "Apr", bookings: 61, earnings: 9150 },
                    { month: "May", bookings: 55, earnings: 8250 },
                    { month: "Jun", bookings: 58, earnings: 8700 },
                ],
                topServices: [
                    {
                        id: 1,
                        title: "House Cleaning",
                        bookings: 23,
                        earnings: 3450,
                        rating: 4.9,
                    },
                    {
                        id: 2,
                        title: "Math Tutoring",
                        bookings: 18,
                        earnings: 2700,
                        rating: 5.0,
                    },
                    {
                        id: 3,
                        title: "Plumbing Repair",
                        bookings: 15,
                        earnings: 3000,
                        rating: 4.6,
                    },
                ],
                clientReviews: [
                    {
                        id: 1,
                        client: "Sarah Perera",
                        rating: 5,
                        comment:
                            "Excellent cleaning service! Very professional.",
                        service: "House Cleaning",
                        date: "2024-01-10",
                    },
                    {
                        id: 2,
                        client: "Nuwan Fernando",
                        rating: 5,
                        comment: "Great tutoring session. Highly recommended!",
                        service: "Math Tutoring",
                        date: "2024-01-08",
                    },
                ],
            };

            setDashboardMetrics(mockMetrics);

            return {
                success: true,
                data: mockMetrics,
            };
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
                    actionUrl: "/provider/schedule",
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

    // **AVAILABILITY MANAGEMENT**
    const getWeeklyAvailability = async () => {
        try {
            // const response = await axios.get("/api/availability/weekly");

            if (response.data.success) {
                setAvailability((prev) => ({
                    ...prev,
                    weeklySchedule: response.data.data,
                }));

                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch availability";
            setError(errorMessage);

            // Mock availability data
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
            }));

            return {
                success: false,
                message: errorMessage,
                mockData: mockAvailability,
            };
        }
    };

    const updateWeeklyAvailability = async (scheduleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(
                "/api/availability/weekly",
                scheduleData
            );

            if (response.data.success) {
                setAvailability((prev) => ({
                    ...prev,
                    weeklySchedule: response.data.data,
                }));

                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to update availability";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || {},
            };
        } finally {
            setLoading(false);
        }
    };

    // **EARNINGS MANAGEMENT**
    const getEarningsData = async (period = "month") => {
        setLoading(true);
        setError(null);
        try {
            // Mock earnings data
            const mockEarnings = {
                current: {
                    total: businessStats.monthlyEarnings,
                    thisMonth: businessStats.monthlyEarnings,
                    thisWeek: businessStats.weeklyEarnings,
                    today: businessStats.todaysEarnings,
                },
                history: [
                    {
                        date: "2024-01-01",
                        amount: 150,
                        service: "House Cleaning",
                    },
                    {
                        date: "2024-01-03",
                        amount: 200,
                        service: "Plumbing Repair",
                    },
                    {
                        date: "2024-01-05",
                        amount: 300,
                        service: "Math Tutoring",
                    },
                    {
                        date: "2024-01-08",
                        amount: 150,
                        service: "House Cleaning",
                    },
                    {
                        date: "2024-01-10",
                        amount: 250,
                        service: "Garden Maintenance",
                    },
                ],
                breakdown: {
                    "House Cleaning": 2100,
                    "Math Tutoring": 1800,
                    "Plumbing Repair": 1600,
                    "Garden Maintenance": 1250,
                },
            };

            return {
                success: true,
                data: mockEarnings,
            };
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

        // Availability
        availability,
        getWeeklyAvailability,
        updateWeeklyAvailability,

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
