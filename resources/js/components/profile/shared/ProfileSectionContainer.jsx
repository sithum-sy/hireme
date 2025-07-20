import React, { useState } from "react";
import { PROFILE_SECTIONS } from "../../../../config/profileConfig";
import { useProfile } from "../../../context/ProfileContext";
import PersonalSection from "../sections/PersonalSection";
import ContactSection from "../sections/ContactSection";
import BusinessSection from "../sections/BusinessSection";
import DocumentsSection from "../sections/DocumentsSection";
import SecuritySection from "../sections/SecuritySection";
import StaffPermissionsSection from "../sections/StaffPermissionsSection";

const ProfileSectionContainer = ({ section, onSuccess, onError }) => {
    const { profile } = useProfile();

    const handleSuccess = (message) => {
        if (onSuccess) {
            onSuccess(message);
        }
    };

    const handleError = (message) => {
        if (onError) {
            onError(message);
        }
    };

    const renderSection = () => {
        switch (section) {
            case PROFILE_SECTIONS.PERSONAL:
                return (
                    <PersonalSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.CONTACT:
                return (
                    <ContactSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.BUSINESS:
                // Only show for service providers
                if (profile?.user?.role !== "service_provider") {
                    return (
                        <div className="section-not-available">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                Business information is only available for
                                service providers.
                            </p>
                        </div>
                    );
                }
                return (
                    <BusinessSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.DOCUMENTS:
                // Only show for service providers
                if (profile?.user?.role !== "service_provider") {
                    return (
                        <div className="section-not-available">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                Document management is only available for
                                service providers.
                            </p>
                        </div>
                    );
                }
                return (
                    <DocumentsSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.PERMISSIONS:
                // Only show for staff and admin
                if (!["staff", "admin"].includes(profile?.user?.role)) {
                    return (
                        <div className="section-not-available">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                Permissions management is only available for
                                staff and administrators.
                            </p>
                        </div>
                    );
                }
                return (
                    <StaffPermissionsSection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.SECURITY:
                return (
                    <SecuritySection
                        onSuccess={handleSuccess}
                        onError={handleError}
                    />
                );

            case PROFILE_SECTIONS.PREFERENCES:
                return (
                    <div className="section-coming-soon">
                        <i className="fas fa-cog fa-3x"></i>
                        <h4>Preferences</h4>
                        <p>
                            Customize your account preferences and notification
                            settings.
                        </p>
                        <small>Coming in a future update</small>
                    </div>
                );

            case PROFILE_SECTIONS.NOTIFICATIONS:
                return (
                    <div className="section-coming-soon">
                        <i className="fas fa-bell fa-3x"></i>
                        <h4>Notification Settings</h4>
                        <p>Manage how and when you receive notifications.</p>
                        <small>Coming in a future update</small>
                    </div>
                );

            case PROFILE_SECTIONS.SYSTEM:
                // Only show for admin
                if (profile?.user?.role !== "admin") {
                    return (
                        <div className="section-not-available">
                            <i className="fas fa-info-circle"></i>
                            <p>
                                System settings are only available for
                                administrators.
                            </p>
                        </div>
                    );
                }
                return (
                    <div className="section-coming-soon">
                        <i className="fas fa-server fa-3x"></i>
                        <h4>System Settings</h4>
                        <p>
                            Manage platform-wide system configuration and
                            settings.
                        </p>
                        <small>Coming in a future update</small>
                    </div>
                );

            default:
                return (
                    <div className="section-not-found">
                        <i className="fas fa-exclamation-triangle fa-3x"></i>
                        <h4>Section Not Found</h4>
                        <p>The requested profile section could not be found.</p>
                    </div>
                );
        }
    };

    return (
        <div className="profile-section-container">
            {renderSection()}

            <style jsx>{`
                .profile-section-container {
                    width: 100%;
                }

                .section-not-available,
                .section-coming-soon,
                .section-not-found {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--space-8);
                    text-align: center;
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                }

                .section-not-available i,
                .section-not-found i {
                    color: var(--warning-color);
                    margin-bottom: var(--space-3);
                }

                .section-coming-soon i {
                    color: var(--info-color);
                    margin-bottom: var(--space-3);
                }

                .section-not-available h4,
                .section-coming-soon h4,
                .section-not-found h4 {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .section-not-available p,
                .section-coming-soon p,
                .section-not-found p {
                    margin: 0 0 var(--space-2) 0;
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                }

                .section-coming-soon small {
                    color: var(--text-muted);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default ProfileSectionContainer;
