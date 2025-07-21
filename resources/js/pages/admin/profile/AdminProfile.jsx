import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/layouts/AdminLayout";
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
const AdminProfileContent = () => {
    const { user } = useAuth();
    const { profile, loading } = useProfile();
    const [activeTab, setActiveTab] = useState(PROFILE_SECTIONS.PERSONAL);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // Get admin-specific configuration
    const roleConfig = getRoleConfig("admin");
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
                    <h4>Loading Admin Profile...</h4>
                    <p>
                        Please wait while we fetch your administrator
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
                        We couldn't load your admin profile information.
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
            title="Administrator Profile"
            subtitle="Manage your administrator account and system permissions"
        >
            {/* Admin-specific banner */}
            <div className="admin-banner">
                <div className="banner-content">
                    <div className="banner-icon">
                        <i className="fas fa-crown"></i>
                    </div>
                    <div className="banner-info">
                        <h5>System Administrator</h5>
                        <p>
                            You have full administrative access to the
                            HireMe platform
                        </p>
                    </div>
                    <div className="banner-stats">
                        <div className="stat-item">
                            <span className="stat-value">99.9%</span>
                            <span className="stat-label">Uptime</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-value">24/7</span>
                            <span className="stat-label">Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status */}
            <div className="system-status">
                <div className="status-header">
                    <h5>System Status</h5>
                    <span className="status-indicator online">
                        <i className="fas fa-circle"></i>
                        All Systems Operational
                    </span>
                </div>
                <div className="status-grid">
                    <div className="status-item">
                        <div className="status-icon">
                            <i className="fas fa-server text-success"></i>
                        </div>
                        <div className="status-content">
                            <h6>Database</h6>
                            <p>Healthy</p>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon">
                            <i className="fas fa-cloud text-success"></i>
                        </div>
                        <div className="status-content">
                            <h6>Cloud Services</h6>
                            <p>Operational</p>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon">
                            <i className="fas fa-shield-alt text-success"></i>
                        </div>
                        <div className="status-content">
                            <h6>Security</h6>
                            <p>Protected</p>
                        </div>
                    </div>
                    <div className="status-item">
                        <div className="status-icon">
                            <i className="fas fa-chart-line text-success"></i>
                        </div>
                        <div className="status-content">
                            <h6>Performance</h6>
                            <p>Optimal</p>
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

const AdminProfile = () => {
    return (
        <AdminLayout>
            <ProfileProvider>
                <AdminProfileContent />
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

                .admin-banner {
                    background: linear-gradient(135deg, #1f2937, #374151);
                    background-image: radial-gradient(
                            circle at 25% 25%,
                            rgba(255, 215, 0, 0.1) 0%,
                            transparent 50%
                        ),
                        radial-gradient(
                            circle at 75% 75%,
                            rgba(255, 215, 0, 0.05) 0%,
                            transparent 50%
                        );
                    color: white;
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                    margin-bottom: var(--space-4);
                    border: 1px solid rgba(255, 215, 0, 0.2);
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
                    background: linear-gradient(135deg, #fbbf24, #f59e0b);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-2xl);
                    flex-shrink: 0;
                    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
                }

                .banner-info {
                    flex: 1;
                }

                .banner-info h5 {
                    margin: 0 0 var(--space-1) 0;
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: #fbbf24;
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
                    color: #fbbf24;
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

                .system-status {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-4);
                }

                .status-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .status-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .status-indicator {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                }

                .status-indicator.online {
                    color: var(--success-color);
                }

                .status-indicator i {
                    font-size: 0.5rem;
                    animation: pulse 2s infinite;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: var(--space-3);
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3);
                    background: var(--bg-light);
                    border-radius: var(--border-radius);
                    border: 1px solid var(--border-color);
                }

                .status-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .status-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .status-content p {
                    margin: 0;
                    color: var(--success-color);
                    font-size: var(--text-xs);
                    font-weight: var(--font-medium);
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

                @keyframes pulse {
                    0%,
                    100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
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

                    .status-header {
                        flex-direction: column;
                        gap: var(--space-2);
                        align-items: stretch;
                        text-align: center;
                    }

                    .status-grid {
                        grid-template-columns: 1fr;
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
        </AdminLayout>
    );
};

export default AdminProfile;
