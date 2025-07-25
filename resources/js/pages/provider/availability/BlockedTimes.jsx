import React from "react";
import { Link } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import BlockedTimesList from "../../../components/provider/availability/BlockedTimesList";
import QuickAvailabilityActions from "../../../components/provider/availability/QuickAvailabilityActions";

const BlockedTimes = () => {
    const handleUpdate = () => {
        // Handle any updates needed
        console.log("Blocked times updated");
    };

    return (
        <ProviderLayout>
            <div className="blocked-times-page">
                {/* Page Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2 className="fw-bold mb-2">
                                    <i className="fas fa-ban text-danger me-3"></i>
                                    Blocked Times
                                </h2>
                                <p className="text-muted mb-0">
                                    Manage periods when you're not available for
                                    bookings
                                </p>
                            </div>
                            <div>
                                <Link
                                    to="/provider/availability"
                                    className="btn btn-outline-primary"
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Back to Availability
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="alert alert-warning border-0 shadow-sm">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-exclamation-triangle fa-lg me-3"></i>
                                <div>
                                    <strong>Remember:</strong> Blocking time
                                    prevents new bookings during those periods.
                                    Existing appointments are not affected.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="row">
                    <div className="col-lg-8">
                        <BlockedTimesList onUpdate={handleUpdate} />
                    </div>
                    <div className="col-lg-4">
                        {/* Quick Actions */}
                        <QuickAvailabilityActions
                            onUpdate={handleUpdate}
                            className="mb-4"
                        />

                        {/* Common Blocking Reasons */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-list text-primary me-2"></i>
                                    Common Reasons
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="reason-item mb-2">
                                    <i className="fas fa-user-md text-info me-2"></i>
                                    <small>Personal appointment</small>
                                </div>
                                <div className="reason-item mb-2">
                                    <i className="fas fa-plane text-success me-2"></i>
                                    <small>Vacation / Holiday</small>
                                </div>
                                <div className="reason-item mb-2">
                                    <i className="fas fa-tools text-warning me-2"></i>
                                    <small>Equipment maintenance</small>
                                </div>
                                <div className="reason-item mb-2">
                                    <i className="fas fa-graduation-cap text-primary me-2"></i>
                                    <small>Training / Workshop</small>
                                </div>
                                <div className="reason-item mb-2">
                                    <i className="fas fa-home text-secondary me-2"></i>
                                    <small>Family emergency</small>
                                </div>
                                <div className="reason-item">
                                    <i className="fas fa-heart text-danger me-2"></i>
                                    <small>Health break</small>
                                </div>
                            </div>
                        </div>

                        {/* Blocking Tips */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    Blocking Tips
                                </h6>
                            </div>
                            <div className="card-body">
                                <div className="tip-item mb-3">
                                    <i className="fas fa-calendar-plus text-success me-2"></i>
                                    <small>
                                        Block time as early as possible to avoid
                                        conflicts
                                    </small>
                                </div>
                                <div className="tip-item mb-3">
                                    <i className="fas fa-comment text-info me-2"></i>
                                    <small>
                                        Add reasons to help you remember why
                                        time was blocked
                                    </small>
                                </div>
                                <div className="tip-item mb-3">
                                    <i className="fas fa-clock text-primary me-2"></i>
                                    <small>
                                        Use specific times for partial day
                                        blocks
                                    </small>
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-trash text-danger me-2"></i>
                                    <small>
                                        Remove old blocks to keep your list
                                        clean
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .blocked-times-page {
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

                .reason-item,
                .tip-item {
                    padding: 0.25rem 0;
                    border-left: 3px solid transparent;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
                    transition: all 0.2s ease;
                    border-radius: 0.25rem;
                }

                .reason-item:hover,
                .tip-item:hover {
                    border-left-color: var(--current-role-primary);
                    background-color: var(--current-role-light);
                    border-radius: 0 0.25rem 0.25rem 0;
                }

                /* Using design system classes instead of custom orange styles */
            `}</style>
        </ProviderLayout>
    );
};

export default BlockedTimes;
