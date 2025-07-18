import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useProvider } from "../../context/ProviderContext";
import ProviderLayout from "../../components/layouts/ProviderLayout";
import availabilityService from "../../services/availabilityService";
import AppointmentSections from "../../components/provider/dashboard/AppointmentSections";

const AvailabilityWidget = () => {
    const [availabilityData, setAvailabilityData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadAvailabilityData();
    }, []);

    const loadAvailabilityData = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await availabilityService.getAvailabilitySummary();
            if (result.success) {
                setAvailabilityData(result.data);
            } else {
                setError("Failed to load availability data");
                // Set default data for display
                setAvailabilityData({
                    total_working_days: 5,
                    total_weekly_hours: 40,
                    blocked_times_count: 0,
                    next_blocked_period: null,
                });
            }
        } catch (error) {
            console.error("Error loading availability data:", error);
            setError("Unable to connect to server");
            // Set default data for display
            setAvailabilityData({
                total_working_days: 5,
                total_weekly_hours: 40,
                blocked_times_count: 0,
                next_blocked_period: null,
            });
        } finally {
            setLoading(false);
        }
    };

    const getAvailabilityStatus = () => {
        if (!availabilityData)
            return { color: "secondary", text: "Unknown", icon: "question" };

        const workingDays = availabilityData.total_working_days || 0;
        const blockedTimes = availabilityData.blocked_times_count || 0;

        if (workingDays === 0) {
            return {
                color: "danger",
                text: "No Schedule Set",
                icon: "exclamation-triangle",
            };
        } else if (workingDays < 3) {
            return { color: "warning", text: "Limited Hours", icon: "clock" };
        } else if (blockedTimes > 5) {
            return {
                color: "info",
                text: "Partially Available",
                icon: "calendar-times",
            };
        } else {
            return {
                color: "success",
                text: "Fully Available",
                icon: "calendar-check",
            };
        }
    };

    const status = getAvailabilityStatus();

    if (loading) {
        return (
            <div className="dashboard-card availability-widget">
                <div className="dashboard-card-header">
                    <h6 className="dashboard-card-title">
                        <i className="fas fa-calendar-alt"></i>
                        <span>Availability Status</span>
                    </h6>
                </div>
                <div className="dashboard-card-body">
                    <div className="widget-loading">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">Loading availability...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-card availability-widget">
            <div className="dashboard-card-header">
                <h6 className="dashboard-card-title">
                    <i className="fas fa-calendar-alt"></i>
                    <span>Availability Status</span>
                </h6>
                <Link
                    to="/provider/availability"
                    className="btn btn-outline-primary btn-sm"
                >
                    Manage
                </Link>
            </div>
            <div className="dashboard-card-body">
                {error && (
                    <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>{error}</span>
                    </div>
                )}

                <div className="availability-status">
                    <div className={`status-indicator ${status.color}`}>
                        <i className={`fas fa-${status.icon}`}></i>
                    </div>
                    <div className="status-content">
                        <div className={`status-title text-${status.color}`}>
                            {status.text}
                        </div>
                        <div className="status-subtitle">
                            Current availability status
                        </div>
                    </div>
                </div>

                <div className="availability-summary">
                    <div className="availability-stats">
                        <div className="stat-item">
                            <div className="stat-value primary">
                                {availabilityData?.total_working_days || 5}
                            </div>
                            <div className="stat-label">Working Days</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value info">
                                {availabilityData?.total_weekly_hours || 40}h
                            </div>
                            <div className="stat-label">Weekly Hours</div>
                        </div>
                    </div>

                    {availabilityData?.next_blocked_period && (
                        <div className="alert alert-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>
                                Next block:{" "}
                                {
                                    availabilityData.next_blocked_period
                                        .formatted_date_range
                                }
                            </span>
                        </div>
                    )}
                </div>

                <div className="availability-actions">
                    <Link
                        to="/provider/availability/schedule"
                        className="btn btn-outline-primary btn-sm"
                    >
                        <i className="fas fa-clock"></i>
                        <span>Update Schedule</span>
                    </Link>
                    <Link
                        to="/provider/availability/blocked"
                        className="btn btn-outline-danger btn-sm"
                    >
                        <i className="fas fa-ban"></i>
                        <span>Block Time</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ProviderDashboard = () => {
    const { user } = useAuth();
    const {
        businessStats,
        dashboardMetrics,
        providerNotifications,
        getBusinessInsights,
        getPerformanceStatus,
        loading,
    } = useProvider();

    // Quick Actions with dynamic counts from context
    const quickActions = [
        {
            icon: "fas fa-plus-circle",
            title: "Add Service",
            description: "Create new service offering",
            path: "/provider/services/create",
            variant: "primary",
            count: null,
        },
        {
            icon: "fas fa-calendar-check",
            title: "Manage Schedule",
            description: "Update availability",
            path: "/provider/availability",
            variant: "success",
            count: null,
        },
        {
            icon: "fas fa-bell",
            title: "View Requests",
            description: "Pending bookings",
            path: "/provider/quotes",
            variant: "warning",
            count: businessStats?.pendingRequests,
        },
        {
            icon: "fas fa-chart-line",
            title: "Analytics",
            description: "Performance insights",
            path: "/provider/analytics",
            variant: "info",
            count: null,
        },
    ];

    // Fixed: Get performance indicators directly from dashboardMetrics
    const getPerformanceData = () => {
        const performanceData = dashboardMetrics?.performanceIndicators || {};

        return {
            responseRate: {
                value:
                    performanceData.responseRate?.value ||
                    businessStats?.responseRate ||
                    0,
                color:
                    performanceData.responseRate?.status === "excellent"
                        ? "success"
                        : performanceData.responseRate?.status === "good"
                        ? "warning"
                        : "danger",
            },
            rating: {
                value:
                    performanceData.rating?.value ||
                    businessStats?.averageRating ||
                    0,
                color:
                    performanceData.rating?.status === "excellent"
                        ? "success"
                        : performanceData.rating?.status === "good"
                        ? "warning"
                        : "danger",
            },
        };
    };

    const performanceIndicators = getPerformanceData();

    // Show loading state
    if (loading) {
        return (
            <ProviderLayout>
                <div className="loading-container">
                    <div className="loading-content">
                        <div className="loading-spinner large"></div>
                        <p className="loading-text">
                            Loading your dashboard...
                        </p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="page-content provider-dashboard-content">
                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <i className="fas fa-bolt"></i>
                            <span>Quick Actions</span>
                        </h2>
                    </div>
                    <div className="dashboard-grid dashboard-grid-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="action-card-link"
                            >
                                <div className="action-card quick-action-card">
                                    <div
                                        className={`action-icon ${action.variant} position-relative`}
                                    >
                                        <i className={action.icon}></i>
                                        {action.count && action.count > 0 && (
                                            <span className="action-badge">
                                                {action.count > 99
                                                    ? "99+"
                                                    : action.count}
                                            </span>
                                        )}
                                    </div>
                                    <h6 className="action-title">
                                        {action.title}
                                    </h6>
                                    <p className="action-description">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                {/* Today's Schedule Section - MOVED UP */}
                <div className="todays-schedule-section">
                    <AppointmentSections />
                </div>

                {/* Sidebar Widgets in Grid Layout */}
                <div className="widgets-grid">
                    {/* Availability Widget */}
                    <div className="widget-item">
                        <AvailabilityWidget />
                    </div>

                    {/* Performance Summary */}
                    <div className="widget-item">
                        <div className="dashboard-card performance-card">
                            <div className="dashboard-card-header">
                                <h6 className="dashboard-card-title">
                                    <i className="fas fa-chart-bar"></i>
                                    <span>Performance Summary</span>
                                </h6>
                            </div>
                            <div className="dashboard-card-body">
                                <div className="performance-metrics">
                                    <div className="metric-item">
                                        <span className="metric-label">
                                            Jobs Completed:
                                        </span>
                                        <span className="metric-badge info">
                                            {businessStats?.completedJobs || 0}
                                        </span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">
                                            Response Rate:
                                        </span>
                                        <span
                                            className={`metric-badge ${performanceIndicators.responseRate.color}`}
                                        >
                                            {
                                                performanceIndicators
                                                    .responseRate.value
                                            }
                                            %
                                        </span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">
                                            Average Rating:
                                        </span>
                                        <span
                                            className={`metric-badge ${performanceIndicators.rating.color}`}
                                        >
                                            ⭐{" "}
                                            {performanceIndicators.rating.value}
                                        </span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="metric-label">
                                            Active Services:
                                        </span>
                                        <span className="metric-badge primary">
                                            {businessStats?.activeServices || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Reviews */}
                    <div className="widget-item">
                        <div className="dashboard-card reviews-card">
                            <div className="dashboard-card-header">
                                <h6 className="dashboard-card-title">
                                    <i className="fas fa-star"></i>
                                    <span>Recent Reviews</span>
                                </h6>
                                <Link
                                    to="/provider/reviews"
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    View All
                                </Link>
                            </div>
                            <div className="dashboard-card-body">
                                {dashboardMetrics?.clientReviews &&
                                dashboardMetrics.clientReviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {dashboardMetrics.clientReviews
                                            .slice(0, 2)
                                            .map((review, index) => (
                                                <div
                                                    key={review.id || index}
                                                    className="review-item"
                                                >
                                                    <div className="review-avatar">
                                                        {review.client
                                                            ?.split(" ")
                                                            .map((n) => n[0])
                                                            .join("") || "?"}
                                                    </div>
                                                    <div className="review-content">
                                                        <div className="review-header">
                                                            <strong className="review-client">
                                                                {review.client ||
                                                                    "Anonymous"}
                                                            </strong>
                                                            <div className="review-rating">
                                                                {"★".repeat(
                                                                    review.rating ||
                                                                        0
                                                                )}
                                                                {"☆".repeat(
                                                                    5 -
                                                                        (review.rating ||
                                                                            0)
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="review-comment">
                                                            "
                                                            {review.comment ||
                                                                "No comment provided"}
                                                            "
                                                        </p>
                                                        <div className="review-meta">
                                                            {review.service ||
                                                                "Unknown Service"}{" "}
                                                            •{" "}
                                                            {review.date ||
                                                                "Unknown Date"}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="empty-state-small">
                                        <div className="empty-state-icon">
                                            <i className="fas fa-star"></i>
                                        </div>
                                        <p className="empty-state-text">
                                            No reviews yet
                                        </p>
                                        <small className="empty-state-subtext">
                                            Complete jobs to receive reviews
                                            from clients
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Success Tips */}
                    <div className="widget-item">
                        <div className="dashboard-card tips-card">
                            <div className="dashboard-card-header">
                                <h6 className="dashboard-card-title">
                                    <i className="fas fa-lightbulb"></i>
                                    <span>Tips for Success</span>
                                </h6>
                            </div>
                            <div className="dashboard-card-body">
                                <div className="tips-list">
                                    <div className="tip-item">
                                        <i className="fas fa-clock tip-icon success"></i>
                                        <span className="tip-text">
                                            Respond to requests within 2 hours
                                            for better ranking
                                        </span>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-star tip-icon warning"></i>
                                        <span className="tip-text">
                                            Maintain high quality service for
                                            5-star reviews
                                        </span>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-calendar tip-icon info"></i>
                                        <span className="tip-text">
                                            Keep your availability calendar
                                            updated daily
                                        </span>
                                    </div>
                                    <div className="tip-item">
                                        <i className="fas fa-images tip-icon primary"></i>
                                        <span className="tip-text">
                                            Add photos to your services to
                                            attract more clients
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section - Remains at bottom */}
                <div className="achievements-section">
                    <div className="dashboard-card achievements-card">
                        <div className="dashboard-card-header">
                            <h6 className="dashboard-card-title">
                                <i className="fas fa-trophy"></i>
                                <span>Your Achievements</span>
                            </h6>
                        </div>
                        <div className="dashboard-card-body">
                            <div className="achievements-grid">
                                <div className="achievement-item">
                                    <div className="achievement-icon success">
                                        <i className="fas fa-eye"></i>
                                    </div>
                                    <div className="achievement-value">
                                        {businessStats?.totalViews?.toLocaleString() ||
                                            "N/A"}
                                    </div>
                                    <div className="achievement-label">
                                        Profile Views
                                    </div>
                                </div>
                                <div className="achievement-item">
                                    <div className="achievement-icon info">
                                        <i className="fas fa-percentage"></i>
                                    </div>
                                    <div className="achievement-value">
                                        {businessStats?.conversionRate?.toFixed(
                                            1
                                        ) || "N/A"}
                                        %
                                    </div>
                                    <div className="achievement-label">
                                        Conversion Rate
                                    </div>
                                </div>
                                <div className="achievement-item">
                                    <div className="achievement-icon warning">
                                        <i className="fas fa-medal"></i>
                                    </div>
                                    <div className="achievement-value">
                                        {performanceIndicators.rating.value >=
                                        4.5
                                            ? "Elite"
                                            : performanceIndicators.rating
                                                  .value >= 4.0
                                            ? "Pro"
                                            : "Rising"}
                                    </div>
                                    <div className="achievement-label">
                                        Provider Level
                                    </div>
                                </div>
                                <div className="achievement-item">
                                    <div className="achievement-icon primary">
                                        <i className="fas fa-calendar-check"></i>
                                    </div>
                                    <div className="achievement-value">
                                        {businessStats?.totalAppointments ||
                                            "N/A"}
                                    </div>
                                    <div className="achievement-label">
                                        Total Bookings
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default ProviderDashboard;
