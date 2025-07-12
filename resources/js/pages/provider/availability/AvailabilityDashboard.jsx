import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import WeeklyScheduleEditor from "../../../components/provider/availability/WeeklyScheduleEditor";
import BlockedTimesList from "../../../components/provider/availability/BlockedTimesList";
import QuickAvailabilityActions from "../../../components/provider/availability/QuickAvailabilityActions";
import availabilityService from "../../../services/availabilityService";
import AvailabilityCalendar from "../../../components/provider/availability/AvailabilityCalendar";
import { toast } from "react-toastify";

const AvailabilityDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [availabilitySummary, setAvailabilitySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetchAvailabilitySummary();
    }, [refreshKey]);

    const fetchAvailabilitySummary = async () => {
        try {
            const result = await availabilityService.getAvailabilitySummary();
            if (result.success) {
                setAvailabilitySummary(result.data);
            }
        } catch (error) {
            console.error("Error fetching availability summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDataUpdate = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const getNextBlockedPeriod = () => {
        if (!availabilitySummary?.next_blocked_period) return null;
        return availabilitySummary.next_blocked_period;
    };

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
                        <p className="text-muted">
                            Loading availability dashboard...
                        </p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="availability-dashboard">
                {/* Header Section */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm bg-gradient-orange text-white">
                            <div className="card-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            <i className="fas fa-calendar-alt me-3"></i>
                                            Availability Management
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            Manage your working hours and block
                                            unavailable times to optimize your
                                            schedule
                                        </p>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <button
                                                className={`btn ${
                                                    activeTab === "overview"
                                                        ? "btn-light"
                                                        : "btn-outline-light"
                                                } btn-sm`}
                                                onClick={() =>
                                                    setActiveTab("overview")
                                                }
                                            >
                                                <i className="fas fa-chart-bar me-2"></i>
                                                Overview
                                            </button>
                                            <button
                                                className={`btn ${
                                                    activeTab === "schedule"
                                                        ? "btn-light"
                                                        : "btn-outline-light"
                                                } btn-sm`}
                                                onClick={() =>
                                                    setActiveTab("schedule")
                                                }
                                            >
                                                <i className="fas fa-clock me-2"></i>
                                                Weekly Schedule
                                            </button>
                                            <button
                                                className={`btn ${
                                                    activeTab === "blocked"
                                                        ? "btn-light"
                                                        : "btn-outline-light"
                                                } btn-sm`}
                                                onClick={() =>
                                                    setActiveTab("blocked")
                                                }
                                            >
                                                <i className="fas fa-ban me-2"></i>
                                                Blocked Times
                                            </button>
                                            <button
                                                className={`btn ${
                                                    activeTab === "calendar"
                                                        ? "btn-light"
                                                        : "btn-outline-light"
                                                } btn-sm`}
                                                onClick={() =>
                                                    setActiveTab("calendar")
                                                }
                                            >
                                                <i className="fas fa-calendar me-2"></i>
                                                Calendar View
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-calendar-check fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Summary Stats */}
                {availabilitySummary && (
                    <div className="row mb-4">
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center">
                                    <div className="text-success mb-2">
                                        <i className="fas fa-calendar-day fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1 text-orange">
                                        {availabilitySummary.total_working_days}
                                    </h4>
                                    <small className="text-muted">
                                        Working Days/Week
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center">
                                    <div className="text-info mb-2">
                                        <i className="fas fa-clock fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1 text-orange">
                                        {availabilitySummary.total_weekly_hours}
                                        h
                                    </h4>
                                    <small className="text-muted">
                                        Total Hours/Week
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center">
                                    <div className="text-warning mb-2">
                                        <i className="fas fa-chart-line fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1 text-orange">
                                        {
                                            availabilitySummary.average_daily_hours
                                        }
                                        h
                                    </h4>
                                    <small className="text-muted">
                                        Average/Day
                                    </small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3 col-sm-6 mb-3">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-body text-center">
                                    <div className="text-danger mb-2">
                                        <i className="fas fa-ban fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1 text-orange">
                                        {
                                            availabilitySummary.blocked_times_count
                                        }
                                    </h4>
                                    <small className="text-muted">
                                        Blocked Periods
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Alert for Next Blocked Period */}
                {getNextBlockedPeriod() && (
                    <div
                        className="alert alert-warning border-0 shadow-sm mb-4"
                        role="alert"
                    >
                        <div className="d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-3 fa-lg"></i>
                            <div className="flex-grow-1">
                                <strong>Upcoming Block:</strong> You have a
                                blocked period on{" "}
                                <strong>
                                    {
                                        getNextBlockedPeriod()
                                            .formatted_date_range
                                    }
                                </strong>
                                {getNextBlockedPeriod().reason && (
                                    <span>
                                        {" "}
                                        - {getNextBlockedPeriod().reason}
                                    </span>
                                )}
                            </div>
                            <button
                                className="btn btn-warning btn-sm"
                                onClick={() => setActiveTab("blocked")}
                            >
                                <i className="fas fa-eye me-1"></i>
                                View Details
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="row">
                    <div className="col-lg-9">
                        {/* Tab Content */}
                        {activeTab === "overview" && (
                            <div className="row">
                                <div className="col-md-6 mb-4">
                                    <WeeklyScheduleEditor
                                        onSave={handleDataUpdate}
                                        className="mb-4"
                                    />
                                </div>
                                <div className="col-md-6 mb-4">
                                    <BlockedTimesList
                                        onUpdate={handleDataUpdate}
                                        className="mb-4"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "schedule" && (
                            <WeeklyScheduleEditor
                                onSave={handleDataUpdate}
                                className="mb-4"
                            />
                        )}

                        {activeTab === "blocked" && (
                            <BlockedTimesList
                                onUpdate={handleDataUpdate}
                                className="mb-4"
                            />
                        )}

                        {activeTab === "calendar" && (
                            <AvailabilityCalendar className="mb-4" />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-3">
                        {/* Quick Actions */}
                        <QuickAvailabilityActions
                            onUpdate={handleDataUpdate}
                            className="mb-4"
                        />

                        {/* Tips Card */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Availability Tips
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="tip-item mb-3">
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                    <small>
                                        Keep your schedule updated daily for
                                        better bookings
                                    </small>
                                </div>
                                <div className="tip-item mb-3">
                                    <i className="fas fa-clock text-info me-2"></i>
                                    <small>
                                        Block personal time in advance to avoid
                                        conflicts
                                    </small>
                                </div>
                                <div className="tip-item mb-3">
                                    <i className="fas fa-calendar-plus text-orange me-2"></i>
                                    <small>
                                        Consistent schedule helps clients plan
                                        ahead
                                    </small>
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-star text-warning me-2"></i>
                                    <small>
                                        Available providers get more bookings
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-link text-orange me-2"></i>
                                    Quick Links
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <Link
                                        to="/provider/services"
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        <i className="fas fa-concierge-bell me-2"></i>
                                        Manage Services
                                    </Link>
                                    <Link
                                        to="/provider/appointments"
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        <i className="fas fa-calendar-check me-2"></i>
                                        View Appointments
                                    </Link>
                                    <Link
                                        to="/provider/profile"
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        <i className="fas fa-user-edit me-2"></i>
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .availability-dashboard {
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

                .tip-item {
                    padding: 0.25rem 0;
                    border-left: 3px solid transparent;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
                    transition: all 0.2s ease;
                }

                .tip-item:hover {
                    border-left-color: #fd7e14;
                    background-color: #fff3e0;
                    border-radius: 0 0.25rem 0.25rem 0;
                }

                .bg-gradient-orange {
                    background: linear-gradient(
                        135deg,
                        #fd7e14 0%,
                        #e55100 100%
                    );
                }

                .text-orange {
                    color: #fd7e14 !important;
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

                @media (max-width: 768px) {
                    .col-lg-3 {
                        margin-top: 1rem;
                    }
                }
            `}</style>
        </ProviderLayout>
    );
};

export default AvailabilityDashboard;
