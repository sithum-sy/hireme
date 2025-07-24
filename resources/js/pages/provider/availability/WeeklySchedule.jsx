import React from "react";
import { Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import WeeklyScheduleEditor from "../../../components/provider/availability/WeeklyScheduleEditor";

const WeeklySchedule = () => {
    const handleScheduleSave = (savedData) => {
        // Could redirect or show success message
        console.log("Schedule saved:", savedData);
    };

    return (
        <ProviderLayout>
            <div className="weekly-schedule-page">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-2">
                                    <i className="fas fa-calendar-week text-orange me-3"></i>
                                    Weekly Schedule
                                </h2>
                                <p className="text-muted mb-0">
                                    Set your availability for each day of the
                                    week
                                </p>
                            </div>
                            <div>
                                <Link
                                    to="/provider/availability"
                                    className="btn btn-outline-orange"
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Back to Availability
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tips Banner */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert alert-info border-0 shadow-sm">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-info-circle fa-lg me-3"></i>
                                <div>
                                    <strong>Pro Tip:</strong> Keep your schedule
                                    consistent to help clients plan their
                                    bookings. You can always block specific
                                    dates when needed.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    <div className="col-lg-8">
                        <WeeklyScheduleEditor onSave={handleScheduleSave} />
                    </div>
                    <div className="col-lg-4">
                        {/* Schedule Tips */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Best Practices
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="schedule-tip mb-3">
                                    <div className="d-flex align-items-start">
                                        <div className="bg-success bg-opacity-10 text-success rounded-circle p-2 me-3 flex-shrink-0">
                                            <i className="fas fa-clock"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                Consistent Hours
                                            </h6>
                                            <small className="text-muted">
                                                Maintain regular working hours
                                                to build client trust and
                                                routine bookings
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="schedule-tip mb-3">
                                    <div className="d-flex align-items-start">
                                        <div className="bg-info bg-opacity-10 text-info rounded-circle p-2 me-3 flex-shrink-0">
                                            <i className="fas fa-calendar-plus"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                Buffer Time
                                            </h6>
                                            <small className="text-muted">
                                                Leave gaps between appointments
                                                for travel time and preparation
                                            </small>
                                        </div>
                                    </div>
                                </div>
                                <div className="schedule-tip">
                                    <div className="d-flex align-items-start">
                                        <div className="bg-orange bg-opacity-10 text-orange rounded-circle p-2 me-3 flex-shrink-0">
                                            <i className="fas fa-mobile-alt"></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-bold mb-1">
                                                Stay Updated
                                            </h6>
                                            <small className="text-muted">
                                                Update your schedule weekly to
                                                reflect any changes in
                                                availability
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-bolt text-orange me-2"></i>
                                    Quick Actions
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="d-grid gap-2">
                                    <Link
                                        to="/provider/availability?tab=blocked"
                                        className="btn btn-outline-danger btn-sm"
                                    >
                                        <i className="fas fa-ban me-2"></i>
                                        Block Time Period
                                    </Link>
                                    <Link
                                        to="/provider/services"
                                        className="btn btn-outline-orange btn-sm"
                                    >
                                        <i className="fas fa-plus me-2"></i>
                                        Add New Service
                                    </Link>
                                    <Link
                                        to="/provider/appointments"
                                        className="btn btn-outline-info btn-sm"
                                    >
                                        <i className="fas fa-calendar-check me-2"></i>
                                        View Appointments
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .weekly-schedule-page {
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

                .schedule-tip {
                    padding: 0.5rem 0;
                    border-radius: 0.5rem;
                    transition: all 0.2s ease;
                }

                .schedule-tip:hover {
                    background-color: var(--bg-light);
                    padding: 0.75rem;
                    margin: -0.25rem;
                }

                .text-orange {
                    color: var(--current-role-primary) !important;
                }

                .bg-orange {
                    background-color: var(--current-role-primary) !important;
                }

                .btn-outline-orange {
                    color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                }

                .btn-outline-orange:hover {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                    color: white;
                }
            `}</style>
        </ProviderLayout>
    );
};

export default WeeklySchedule;
