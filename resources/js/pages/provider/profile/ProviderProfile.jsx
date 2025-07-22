import React, { useState, useEffect } from "react";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
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
const ProviderProfileContent = () => {
    const { user } = useAuth();
    const { profile, loading } = useProfile();
    const [activeTab, setActiveTab] = useState(PROFILE_SECTIONS.PERSONAL);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Get provider-specific configuration
    const roleConfig = getRoleConfig("service_provider");
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
                    <h4>Loading Business Profile...</h4>
                    <p>
                        Please wait while we fetch your business
                        information.
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
                        We couldn't load your business profile information.
                        Please try refreshing the page.
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
        setTimeout(() => setSuccessMessage(""), 5000);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleError = (message) => {
        setErrorMessage(message);
        setSuccessMessage("");
        setTimeout(() => setErrorMessage(""), 8000);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <ProfileLayout
            title="Business Profile"
            subtitle="Manage your business information and professional details"
            showProfileHeader={false}
        >
            {/* Provider-specific banner */}
            <div className="provider-banner">
                <div className="banner-content">
                    <div className="banner-icon">
                        <i className="fas fa-briefcase"></i>
                    </div>
                    <div className="banner-info">
                        <h5>Service Provider</h5>
                        <p>
                            Manage your professional profile and grow your business
                        </p>
                    </div>
                    <div className="banner-stats">
                        <div className="stat-item">
                            <span className="stat-value">{profile?.provider_profile?.average_rating || 0}</span>
                            <span className="stat-label">Rating</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">{profile?.provider_profile?.total_reviews || 0}</span>
                            <span className="stat-label">Reviews</span>
                        </div>
                    </div>
                </div>
            </div>

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

const ProviderProfile = () => {
    return (
        <ProviderLayout>
            <ProfileProvider>
                <ProviderProfileContent />
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
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                    line-height: 1.5;
                }

                .provider-banner {
                    background: linear-gradient(135deg, #059669, #10b981);
                    color: white;
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                    margin-bottom: var(--space-4);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .banner-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-4);
                }

                .banner-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #34d399, #10b981);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-2xl);
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .banner-info {
                    flex: 1;
                }

                .banner-info h5 {
                    margin: 0 0 var(--space-1) 0;
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: #a7f3d0;
                }

                .banner-info p {
                    margin: 0;
                    font-size: var(--text-sm);
                    opacity: 0.9;
                }

                .banner-stats {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex-shrink: 0;
                }

                .stat-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                }

                .stat-value {
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: #a7f3d0;
                }

                .stat-label {
                    font-size: var(--text-xs);
                    opacity: 0.8;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-divider {
                    width: 1px;
                    height: 30px;
                    background: rgba(255, 255, 255, 0.3);
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
                }

                .error-banner {
                    background: var(--danger-color);
                    color: white;
                }

                .message-content {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex: 1;
                }

                .message-close {
                    background: none;
                    border: none;
                    color: inherit;
                    cursor: pointer;
                    padding: var(--space-2);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
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

                    .banner-content {
                        flex-direction: column;
                        text-align: center;
                        gap: var(--space-3);
                    }

                    .banner-stats {
                        justify-content: center;
                    }
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ProviderProfile;
