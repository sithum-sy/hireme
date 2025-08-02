import React, { useState, useCallback } from "react";
import { useProfile } from "../../../context/ProfileContext";
import ProfileSection from "../shared/ProfileSection";
import BusinessInfoForm from "../forms/BusinessInfoForm";
import Button from "../../ui/Button";

const BusinessSection = ({ onSuccess, onError }) => {
    const { profile, config, toggleAvailability } = useProfile();
    const [editMode, setEditMode] = useState(false);
    const [toggling, setToggling] = useState(false);

    const providerProfile = profile?.provider_profile;
    const canEditBusiness = config?.permissions?.canEdit?.some((field) =>
        [
            "business_name",
            "bio",
            "years_of_experience",
            "service_area_radius",
        ].includes(field)
    );

    const handleFormSuccess = useCallback(
        (result) => {
            setEditMode(false);
            if (onSuccess) {
                onSuccess(
                    result.message ||
                        "Business information updated successfully!"
                );
            }
        },
        [onSuccess]
    );

    const handleFormError = useCallback(
        (error) => {
            if (onError) {
                onError(
                    error.message || "Failed to update business information"
                );
            }
        },
        [onError]
    );

    const handleToggleAvailability = useCallback(async () => {
        setToggling(true);
        try {
            const result = await toggleAvailability();
            if (result.success && onSuccess) {
                onSuccess(result.message || "Availability status updated!");
            }
        } catch (error) {
            if (onError) {
                onError("Failed to update availability status");
            }
        } finally {
            setToggling(false);
        }
    }, [toggleAvailability, onSuccess, onError]);

    const renderViewMode = () => (
        <div className="business-view-mode">
            {/* Business Overview */}
            <div className="business-overview">
                <div className="overview-header">
                    <div className="business-info">
                        <h4>
                            {providerProfile?.business_name ||
                                "Business Name Not Set"}
                        </h4>
                        <div className="business-meta">
                            <span className="experience-badge">
                                <i className="fas fa-clock"></i>
                                {providerProfile?.years_of_experience || 0}{" "}
                                years experience
                            </span>
                            <span className="area-badge">
                                <i className="fas fa-map-marker-alt"></i>
                                {providerProfile?.service_area_radius || 0}km
                                service area
                            </span>
                        </div>
                    </div>

                    <div className="availability-toggle">
                        <button
                            className={`toggle-btn ${
                                providerProfile?.is_available
                                    ? "available"
                                    : "unavailable"
                            }`}
                            onClick={handleToggleAvailability}
                            disabled={toggling}
                        >
                            <div className="toggle-slider">
                                <div className="toggle-knob"></div>
                            </div>
                            <span className="toggle-label">
                                {toggling
                                    ? "Updating..."
                                    : providerProfile?.is_available
                                    ? "Available"
                                    : "Unavailable"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Business Description */}
                {providerProfile?.bio && (
                    <div className="business-description">
                        <h6>About My Business</h6>
                        <p>{providerProfile.bio}</p>
                    </div>
                )}
            </div>

            {/* Business Stats */}
            <div className="business-stats">
                <div className="stats-header">
                    <h5>Business Performance</h5>
                </div>

                <div className="stats-grid">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {providerProfile?.average_rating || "0.0"}
                            </div>
                            <div className="stat-label">Average Rating</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-thumbs-up"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {providerProfile?.total_reviews || 0}
                            </div>
                            <div className="stat-label">Total Reviews</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-dollar-sign"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                Rs.{" "}
                                {(
                                    providerProfile?.total_earnings || 0
                                ).toLocaleString()}
                            </div>
                            <div className="stat-label">Total Earnings</div>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">
                                {profile?.provider_statistics
                                    ?.completed_appointments || 0}
                            </div>
                            <div className="stat-label">Completed Jobs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Verification Status */}
            <div className="verification-status">
                <div className="verification-header">
                    <h5>Verification Status</h5>
                </div>

                <div className="verification-items">
                    <div className="verification-item">
                        <div
                            className={`verification-icon ${
                                providerProfile?.verification_status ===
                                "verified"
                                    ? "verified"
                                    : providerProfile?.verification_status ===
                                      "pending"
                                    ? "pending"
                                    : "unverified"
                            }`}
                        >
                            <i
                                className={`fas fa-${
                                    providerProfile?.verification_status ===
                                    "verified"
                                        ? "check-circle"
                                        : providerProfile?.verification_status ===
                                          "pending"
                                        ? "clock"
                                        : "times-circle"
                                }`}
                            ></i>
                        </div>
                        <div className="verification-content">
                            <h6>Provider Verification</h6>
                            <p>
                                Status:{" "}
                                <span className="status-text">
                                    {providerProfile?.verification_status ||
                                        "Not Started"}
                                </span>
                            </p>
                            {providerProfile?.verification_notes && (
                                <small className="verification-notes">
                                    {providerProfile.verification_notes}
                                </small>
                            )}
                        </div>
                    </div>

                    <div className="verification-item">
                        <div
                            className={`verification-icon ${
                                providerProfile?.business_license
                                    ? "verified"
                                    : "unverified"
                            }`}
                        >
                            <i className="fas fa-file"></i>
                        </div>
                        <div className="verification-content">
                            <h6>Business License</h6>
                            <p>
                                {providerProfile?.business_license
                                    ? "Uploaded"
                                    : "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="verification-item">
                        <div
                            className={`verification-icon ${
                                providerProfile?.certifications?.length > 0
                                    ? "verified"
                                    : "unverified"
                            }`}
                        >
                            <i
                                className={`fas fa-${
                                    providerProfile?.certifications?.length > 0
                                        ? "certificate"
                                        : "times-circle"
                                }`}
                            ></i>
                        </div>
                        <div className="verification-content">
                            <h6>Certifications</h6>
                            <p>
                                {providerProfile?.certifications?.length > 0
                                    ? `${
                                          providerProfile.certifications.length
                                      } certification${
                                          providerProfile.certifications
                                              .length > 1
                                              ? "s"
                                              : ""
                                      } uploaded`
                                    : "No certifications provided"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Areas */}
            {providerProfile?.service_area_radius && (
                <div className="service-areas">
                    <div className="areas-header">
                        <h5>Service Coverage</h5>
                    </div>
                    <div className="coverage-info">
                        <div className="coverage-item">
                            <div className="coverage-icon">
                                <i className="fas fa-map-marked-alt"></i>
                            </div>
                            <div className="coverage-content">
                                <h6>Service Radius</h6>
                                <p>
                                    I provide services within{" "}
                                    <strong>
                                        {providerProfile.service_area_radius}km
                                    </strong>{" "}
                                    of my location
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderEditMode = () => (
        <div className="business-edit-mode">
            <BusinessInfoForm
                onSubmit={handleFormSuccess}
                onError={handleFormError}
            />
        </div>
    );

    return (
        <ProfileSection
            title="Business Information"
            subtitle="Manage your business details and service offerings"
            icon="fas fa-building"
            actions={
                canEditBusiness && (
                    <div className="section-actions">
                        {!editMode ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Business Info
                            </Button>
                        ) : (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setEditMode(false)}
                            >
                                <i className="fas fa-times"></i>
                                Cancel
                            </Button>
                        )}
                    </div>
                )
            }
        >
            {editMode ? renderEditMode() : renderViewMode()}

            <style jsx>{`
                .business-view-mode {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .business-overview {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                }

                .overview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: var(--space-4);
                }

                .business-info h4 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-primary);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                }

                .business-meta {
                    display: flex;
                    gap: var(--space-3);
                    flex-wrap: wrap;
                }

                .experience-badge,
                .area-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    padding: var(--space-2) var(--space-3);
                    border-radius: var(--border-radius);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                }

                .availability-toggle {
                    display: flex;
                    align-items: center;
                }

                .toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: none;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-3) var(--space-4);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .toggle-btn:hover {
                    border-color: var(--current-role-primary);
                    box-shadow: var(--shadow-sm);
                }

                .toggle-btn:disabled {
                    cursor: not-allowed;
                    opacity: 0.6;
                }

                .toggle-slider {
                    position: relative;
                    width: 50px;
                    height: 26px;
                    background: var(--text-muted);
                    border-radius: 13px;
                    transition: var(--transition);
                }

                .toggle-btn.available .toggle-slider {
                    background: var(--success-color);
                }

                .toggle-knob {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 22px;
                    height: 22px;
                    background: white;
                    border-radius: 50%;
                    transition: var(--transition);
                    box-shadow: var(--shadow-sm);
                }

                .toggle-btn.available .toggle-knob {
                    transform: translateX(24px);
                }

                .toggle-label {
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                }

                .business-description {
                    margin-top: var(--space-4);
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--border-color);
                }

                .business-description h6 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .business-description p {
                    margin: 0;
                    color: var(--text-secondary);
                    line-height: 1.6;
                    font-size: var(--text-base);
                }

                .business-stats {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .stats-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .stats-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-4);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: var(--bg-white);
                    padding: var(--space-4);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }

                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .stat-value {
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                    color: var(--text-primary);
                    line-height: 1;
                }

                .stat-label {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    margin-top: var(--space-1);
                }

                .verification-status {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .verification-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .verification-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .verification-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .verification-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                }

                .verification-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .verification-icon.verified {
                    background: var(--success-color);
                    color: white;
                }

                .verification-icon.pending {
                    background: var(--warning-color);
                    color: white;
                }

                .verification-icon.unverified {
                    background: var(--text-muted);
                    color: white;
                }

                .verification-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .verification-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .status-text {
                    font-weight: var(--font-semibold);
                    text-transform: capitalize;
                }

                .verification-notes {
                    display: block;
                    margin-top: var(--space-1);
                    color: var(--text-muted);
                    font-style: italic;
                }

                .service-areas {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .areas-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .areas-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .coverage-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: var(--bg-white);
                    padding: var(--space-4);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }

                .coverage-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .coverage-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .coverage-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .overview-header {
                        flex-direction: column;
                        gap: var(--space-3);
                        align-items: stretch;
                    }

                    .business-meta {
                        justify-content: center;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .verification-item,
                    .coverage-item {
                        flex-direction: column;
                        text-align: center;
                        gap: var(--space-2);
                    }
                }
            `}</style>
        </ProfileSection>
    );
};

export default BusinessSection;
