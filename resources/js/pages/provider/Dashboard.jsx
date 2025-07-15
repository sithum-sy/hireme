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

    useEffect(() => {
        loadAvailabilityData();
    }, []);

    const loadAvailabilityData = async () => {
        try {
            const result = await availabilityService.getAvailabilitySummary();
            if (result.success) {
                setAvailabilityData(result.data);
            }
        } catch (error) {
            console.error("Error loading availability data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body text-center p-4">
                    <div
                        className="spinner-border spinner-border-sm text-orange mb-2"
                        role="status"
                    ></div>
                    <p className="text-muted small mb-0">
                        Loading availability...
                    </p>
                </div>
            </div>
        );
    }

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

    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">
                        <i className="fas fa-calendar-alt text-orange me-2"></i>
                        Availability Status
                    </h6>
                    <Link
                        to="/provider/availability"
                        className="btn btn-link btn-sm text-orange p-0"
                    >
                        Manage
                    </Link>
                </div>
            </div>
            <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                    <div
                        className={`bg-${status.color} bg-opacity-10 text-${status.color} rounded-circle d-flex align-items-center justify-content-center me-3`}
                        style={{ width: "40px", height: "40px" }}
                    >
                        <i className={`fas fa-${status.icon}`}></i>
                    </div>
                    <div>
                        <div className={`fw-bold text-${status.color}`}>
                            {status.text}
                        </div>
                        <small className="text-muted">
                            Current availability status
                        </small>
                    </div>
                </div>

                {availabilityData && (
                    <div className="availability-summary">
                        <div className="row text-center">
                            <div className="col-6">
                                <div className="fw-bold text-orange">
                                    {availabilityData.total_working_days}
                                </div>
                                <small className="text-muted">
                                    Working Days
                                </small>
                            </div>
                            <div className="col-6">
                                <div className="fw-bold text-info">
                                    {availabilityData.total_weekly_hours}h
                                </div>
                                <small className="text-muted">
                                    Weekly Hours
                                </small>
                            </div>
                        </div>

                        {availabilityData.next_blocked_period && (
                            <div className="alert alert-warning mt-3 py-2 mb-0">
                                <small>
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    Next block:{" "}
                                    {
                                        availabilityData.next_blocked_period
                                            .formatted_date_range
                                    }
                                </small>
                            </div>
                        )}
                    </div>
                )}

                <div className="d-grid gap-2 mt-3">
                    <Link
                        to="/provider/availability/schedule"
                        className="btn btn-outline-orange btn-sm"
                    >
                        <i className="fas fa-clock me-2"></i>
                        Update Schedule
                    </Link>
                    <Link
                        to="/provider/availability/blocked"
                        className="btn btn-outline-danger btn-sm"
                    >
                        <i className="fas fa-ban me-2"></i>
                        Block Time
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

    // Quick Actions with dynamic counts from context - Updated schedule path
    const quickActions = [
        {
            icon: "fas fa-plus-circle",
            title: "Add Service",
            description: "Create new service offering",
            path: "/provider/services/create",
            color: "primary",
            count: null,
        },
        {
            icon: "fas fa-calendar-check",
            title: "Manage Schedule",
            description: "Update availability",
            path: "/provider/availability", // Updated path
            color: "success",
            count: null,
        },
        {
            icon: "fas fa-bell",
            title: "View Requests",
            description: "Pending bookings",
            path: "/provider/requests",
            color: "warning",
            count: businessStats.pendingRequests,
        },
        {
            icon: "fas fa-chart-line",
            title: "Analytics",
            description: "Performance insights",
            path: "/provider/analytics",
            color: "info",
            count: null,
        },
    ];

    // Get performance indicators with proper colors
    const getPerformanceIndicators = () => {
        const responseRateStatus = getPerformanceStatus(
            businessStats.responseRate,
            "responseRate"
        );
        const ratingStatus = getPerformanceStatus(
            businessStats.averageRating,
            "rating"
        );

        return {
            responseRate: {
                value: businessStats.responseRate,
                status: responseRateStatus,
                color:
                    responseRateStatus === "excellent"
                        ? "success"
                        : responseRateStatus === "good"
                        ? "warning"
                        : "danger",
            },
            rating: {
                value: businessStats.averageRating,
                status: ratingStatus,
                color:
                    ratingStatus === "excellent"
                        ? "success"
                        : ratingStatus === "good"
                        ? "warning"
                        : "danger",
            },
        };
    };

    const performanceIndicators = getPerformanceIndicators();

    // Show loading state
    if (loading) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "400px" }}
                >
                    <div className="text-center">
                        <div
                            className="spinner-border text-orange mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading your dashboard...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="provider-dashboard-content">
                {/* Quick Actions */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="section-card">
                            <div className="section-header mb-3">
                                <h5 className="fw-bold mb-0">
                                    <i className="fas fa-bolt text-orange me-2"></i>
                                    Quick Actions
                                </h5>
                                {/* <p className="text-muted small mb-0">
                                    Get things done faster
                                </p> */}
                            </div>
                            <div className="section-content">
                                <div className="row">
                                    {quickActions.map((action, index) => (
                                        <div
                                            key={index}
                                            className="col-xl-3 col-md-6 mb-3"
                                        >
                                            <Link
                                                to={action.path}
                                                className="text-decoration-none"
                                            >
                                                <div className="card border-0 shadow-sm h-100 quick-action-card">
                                                    <div className="card-body text-center p-4">
                                                        <div
                                                            className={`action-icon bg-${action.color} bg-opacity-10 text-${action.color} rounded-3 p-3 mb-3 d-inline-block position-relative`}
                                                        >
                                                            <i
                                                                className={`${action.icon} fa-2x`}
                                                            ></i>
                                                            {action.count &&
                                                                action.count >
                                                                    0 && (
                                                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                                                        {action.count >
                                                                        99
                                                                            ? "99+"
                                                                            : action.count}
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <h6 className="fw-bold mb-2">
                                                            {action.title}
                                                        </h6>
                                                        <p className="text-muted small mb-0">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="row">
                    {/* Upcoming Appointments */}
                    <div className="col-lg-8 mb-4">
                        <AppointmentSections />
                    </div>

                    {/* Right Sidebar */}
                    <div className="col-lg-4">
                        {/* NEW: Availability Widget */}
                        <AvailabilityWidget />

                        {/* Performance Summary */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-chart-bar text-orange me-2"></i>
                                    Performance Summary
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Jobs Completed:</span>
                                    <span className="badge bg-info">
                                        {businessStats.completedJobs}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Response Rate:</span>
                                    <span
                                        className={`badge bg-${performanceIndicators.responseRate.color}`}
                                    >
                                        {
                                            performanceIndicators.responseRate
                                                .value
                                        }
                                        %
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span>Average Rating:</span>
                                    <span
                                        className={`badge bg-${performanceIndicators.rating.color}`}
                                    >
                                        ⭐ {performanceIndicators.rating.value}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>Active Services:</span>
                                    <span className="badge bg-primary">
                                        {businessStats.activeServices}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews */}
                        {dashboardMetrics.clientReviews &&
                            dashboardMetrics.clientReviews.length > 0 && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="fw-bold mb-0">
                                                <i className="fas fa-star text-warning me-2"></i>
                                                Recent Reviews
                                            </h6>
                                            <Link
                                                to="/provider/reviews"
                                                className="btn btn-link btn-sm text-orange p-0"
                                            >
                                                View All
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        {dashboardMetrics.clientReviews
                                            .slice(0, 2)
                                            .map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="review-item mb-3 pb-3 border-bottom"
                                                >
                                                    <div className="d-flex align-items-start">
                                                        <div className="me-2">
                                                            <div
                                                                className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center fw-bold"
                                                                style={{
                                                                    width: "35px",
                                                                    height: "35px",
                                                                    fontSize:
                                                                        "0.8rem",
                                                                }}
                                                            >
                                                                {review.client
                                                                    .split(" ")
                                                                    .map(
                                                                        (n) =>
                                                                            n[0]
                                                                    )
                                                                    .join("")}
                                                            </div>
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <div className="d-flex align-items-center mb-1">
                                                                <strong className="me-2">
                                                                    {
                                                                        review.client
                                                                    }
                                                                </strong>
                                                                <div className="text-warning">
                                                                    {"★".repeat(
                                                                        review.rating
                                                                    )}
                                                                    {"☆".repeat(
                                                                        5 -
                                                                            review.rating
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="small text-muted mb-1">
                                                                "
                                                                {review.comment}
                                                                "
                                                            </p>
                                                            <small className="text-muted">
                                                                {review.service}{" "}
                                                                • {review.date}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                        {/* Quick Tips */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Tips for Success
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-clock text-success me-3 mt-1"></i>
                                    <small>
                                        Respond to requests within 2 hours for
                                        better ranking
                                    </small>
                                </div>
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-star text-warning me-3 mt-1"></i>
                                    <small>
                                        Maintain high quality service for 5-star
                                        reviews
                                    </small>
                                </div>
                                <div className="tip-item d-flex align-items-start mb-3">
                                    <i className="fas fa-calendar text-info me-3 mt-1"></i>
                                    <small>
                                        Keep your availability calendar updated
                                        daily
                                    </small>
                                </div>
                                <div className="tip-item d-flex align-items-start">
                                    <i className="fas fa-images text-primary me-3 mt-1"></i>
                                    <small>
                                        Add photos to your services to attract
                                        more clients
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Statistics Row */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-trophy text-warning me-2"></i>
                                    Your Achievements
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="row text-center">
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="achievement-item">
                                            <div className="achievement-icon text-success mb-2">
                                                <i className="fas fa-eye fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {businessStats.totalViews?.toLocaleString() ||
                                                    "N/A"}
                                            </h4>
                                            <small className="text-muted">
                                                Profile Views
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="achievement-item">
                                            <div className="achievement-icon text-info mb-2">
                                                <i className="fas fa-percentage fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {businessStats.conversionRate?.toFixed(
                                                    1
                                                ) || "N/A"}
                                                %
                                            </h4>
                                            <small className="text-muted">
                                                Conversion Rate
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="achievement-item">
                                            <div className="achievement-icon text-warning mb-2">
                                                <i className="fas fa-medal fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {performanceIndicators.rating
                                                    .status === "excellent"
                                                    ? "Elite"
                                                    : performanceIndicators
                                                          .rating.status ===
                                                      "good"
                                                    ? "Pro"
                                                    : "Rising"}
                                            </h4>
                                            <small className="text-muted">
                                                Provider Level
                                            </small>
                                        </div>
                                    </div>
                                    <div className="col-md-3 col-6 mb-3">
                                        <div className="achievement-item">
                                            <div className="achievement-icon text-orange mb-2">
                                                <i className="fas fa-calendar-check fa-2x"></i>
                                            </div>
                                            <h4 className="fw-bold mb-1">
                                                {businessStats.totalAppointments ||
                                                    "N/A"}
                                            </h4>
                                            <small className="text-muted">
                                                Total Bookings
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .provider-dashboard-content {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .quick-action-card {
                    transition: all 0.3s ease;
                    border: 1px solid transparent !important;
                }

                .quick-action-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1) !important;
                    border-color: #fd7e14 !important;
                }

                .appointment-card {
                    transition: all 0.2s ease;
                    border: 1px solid #e9ecef !important;
                }

                .appointment-card:hover {
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    border-color: #fd7e14 !important;
                }

                .section-card {
                    background: white;
                    border-radius: 0.5rem;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    margin-bottom: 1rem;
                }

                .achievement-item {
                    padding: 1rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s ease;
                }

                .achievement-item:hover {
                    background-color: #f8f9fa;
                    transform: translateY(-2px);
                }

                .review-item:last-child {
                    border-bottom: none !important;
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }

                .tip-item {
                    padding: 0.5rem 0;
                    border-radius: 0.25rem;
                    transition: all 0.2s ease;
                }

                .tip-item:hover {
                    background-color: #fff3e0;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
                }

                .text-orange {
                    color: #fd7e14 !important;
                }

                .btn-orange {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .btn-orange:hover {
                    background-color: #e55100;
                    border-color: #e55100;
                    color: white;
                }

                .btn-outline-orange {
                    color: #fd7e14;
                    border-color: #fd7e14;
                }

                .btn-outline-orange:hover {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .bg-orange {
                    background-color: #fd7e14 !important;
                }

                @media (max-width: 768px) {
                    .section-card {
                        padding: 1rem;
                    }

                    .quick-action-card .card-body {
                        padding: 1.5rem !important;
                    }
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ProviderDashboard;
