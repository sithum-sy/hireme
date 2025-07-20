import React, { useState, useEffect } from "react";
import ClientLayout from "../../../components/layouts/ClientLayout";
import ProfileLayout from "../../../components/profile/shared/ProfileLayout";
import ProfileTabs from "../../../components/profile/shared/ProfileTabs";
import ProfileSectionContainer from "../../../components/profile/shared/ProfileSectionContainer";
import { ProfileProvider, useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import {
    PROFILE_SECTIONS,
    getRoleConfig,
} from "../../../../config/profileConfig";

// Inner component that uses ProfileProvider
const ClientProfileContent = () => {
    const { user } = useAuth();
    const { profile, loading } = useProfile();
    const [activeTab, setActiveTab] = useState(PROFILE_SECTIONS.PERSONAL);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Get role-specific configuration
    const roleConfig = getRoleConfig(user?.role);
    const availableSections = roleConfig?.sections || [];

    // Set default tab to first available section
    useEffect(() => {
        if (
            availableSections.length > 0 &&
            !availableSections.includes(activeTab)
        ) {
            setActiveTab(availableSections[0]);
        }
    }, [availableSections, activeTab]);

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-content">
                    <div className="loading-spinner">
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>
                    </div>
                    <h4>Loading Profile...</h4>
                    <p>
                        Please wait while we fetch your profile information.
                    </p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-error">
                <div className="error-content">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
                    <h4>Profile Not Found</h4>
                    <p>
                        We couldn't load your profile information. Please
                        try refreshing the page.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        <i className="fas fa-refresh"></i>
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    const handleSuccess = (message) => {
        setSuccessMessage(message);
        setErrorMessage("");

        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccessMessage(""), 5000);

        // Scroll to top to show message
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleError = (message) => {
        setErrorMessage(message);
        setSuccessMessage("");

        // Auto-hide error message after 8 seconds
        setTimeout(() => setErrorMessage(""), 8000);

        // Scroll to top to show message
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <ProfileLayout
            title="My Profile"
            subtitle="Manage your account information and preferences"
        >
            {/* Success Message */}
            {successMessage && (
                <div className="message-banner success-banner">
                    <div className="message-content">
                        <i className="fas fa-check-circle"></i>
                        <span>{successMessage}</span>
                    </div>
                    <button
                        className="message-close"
                        onClick={() => setSuccessMessage("")}
                        aria-label="Close message"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="message-banner error-banner">
                    <div className="message-content">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{errorMessage}</span>
                    </div>
                    <button
                        className="message-close"
                        onClick={() => setErrorMessage("")}
                        aria-label="Close message"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )}

            {/* Profile Navigation */}
            <ProfileTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                availableSections={availableSections}
            />

            {/* Profile Content */}
            <ProfileSectionContainer
                section={activeTab}
                onSuccess={handleSuccess}
                onError={handleError}
            />
        </ProfileLayout>
    );
};

const ClientProfile = () => {
    return (
        <ClientLayout>
            <ProfileProvider>
                <ClientProfileContent />
            </ProfileProvider>

            <style jsx>{`
                .profile-loading,
                .profile-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 60vh;
                    padding: var(--space-8);
                }

                .loading-content,
                .error-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    max-width: 400px;
                }

                .loading-spinner {
                    margin-bottom: var(--space-4);
                }

                .loading-content h4,
                .error-content h4 {
                    margin: var(--space-3) 0 var(--space-2) 0;
                    color: var(--text-primary);
                    font-size: var(--text-xl);
                    font-weight: var(--font-semibold);
                }

                .loading-content p,
                .error-content p {
                    margin: 0 0 var(--space-4) 0;
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                    line-height: 1.5;
                }

                .message-banner {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-4);
                    border-radius: var(--border-radius-lg);
                    margin-bottom: var(--space-4);
                    animation: slideInDown 0.3s ease-out;
                }

                .success-banner {
                    background: var(--success-color);
                    color: white;
                    border: 1px solid var(--success-color);
                }

                .error-banner {
                    background: var(--danger-color);
                    color: white;
                    border: 1px solid var(--danger-color);
                }

                .message-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex: 1;
                }

                .message-content i {
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .message-content span {
                    font-size: var(--text-base);
                    font-weight: var(--font-medium);
                }

                .message-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: var(--space-2);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                    flex-shrink: 0;
                }

                .message-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .profile-loading,
                    .profile-error {
                        min-height: 50vh;
                        padding: var(--space-4);
                    }

                    .message-banner {
                        flex-direction: column;
                        gap: var(--space-2);
                        align-items: stretch;
                    }

                    .message-close {
                        align-self: flex-end;
                    }
                }
            `}</style>
        </ClientLayout>
    );
};

export default ClientProfile;
