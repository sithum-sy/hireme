import React from "react";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";

const ProfileLayout = ({
    children,
    title,
    subtitle,
    showProfileHeader = false,
}) => {
    const { profile, loading } = useProfile();
    const { user } = useAuth();

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                </div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-error">
                <div className="error-icon">
                    <i className="fas fa-exclamation-triangle fa-2x"></i>
                </div>
                <p>Failed to load profile data</p>
            </div>
        );
    }

    const userData = profile.user;
    const providerProfile = profile.provider_profile;

    return (
        <div className={`profile-container ${user?.role}-profile`}>
            {/* Profile Header - Only show if explicitly requested */}
            {showProfileHeader && (
                <div className="profile-header">
                    <div className="profile-header-content">
                        <div className="profile-avatar-section">
                            <div className="profile-avatar">
                                <img
                                    src={
                                        userData.profile_picture ||
                                        "/images/default-avatar.png"
                                    }
                                    alt="Profile"
                                    className="profile-image"
                                    onError={(e) => {
                                        e.target.src =
                                            "/images/default-avatar.png";
                                    }}
                                />
                                <div className="profile-status">
                                    {user?.role === "service_provider" &&
                                        providerProfile?.is_available && (
                                            <span className="status-badge available">
                                                <i className="fas fa-circle"></i>
                                                Available
                                            </span>
                                        )}
                                    {user?.role === "service_provider" &&
                                        !providerProfile?.is_available && (
                                            <span className="status-badge unavailable">
                                                <i className="fas fa-circle"></i>
                                                Unavailable
                                            </span>
                                        )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-info">
                            <h1 className="profile-name">
                                {userData.full_name}
                            </h1>
                            <p className="profile-role">
                                <i className="fas fa-user-tag"></i>
                                {user?.role?.replace("_", " ")?.toUpperCase()}
                            </p>

                            {user?.role === "service_provider" &&
                                providerProfile && (
                                    <div className="provider-stats">
                                        <div className="stat-item">
                                            <i className="fas fa-star"></i>
                                            <span className="rating">
                                                {providerProfile.average_rating >
                                                0
                                                    ? `${providerProfile.average_rating}/5`
                                                    : "No ratings"}
                                            </span>
                                            <span className="reviews">
                                                (
                                                {providerProfile.total_reviews ||
                                                    0}{" "}
                                                reviews)
                                            </span>
                                        </div>

                                        <div className="stat-item">
                                            <i className="fas fa-check-circle"></i>
                                            <span className="verification">
                                                {providerProfile.verification_status ===
                                                "verified"
                                                    ? "Verified"
                                                    : "Pending Verification"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                            {user?.role === "staff" && profile.staff_info && (
                                <div className="staff-info">
                                    <p className="created-by">
                                        <i className="fas fa-user-plus"></i>
                                        Created by:{" "}
                                        {profile.staff_info.created_by}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Header Actions */}
                    <div className="profile-header-actions">
                        {user?.role === "service_provider" && (
                            <button
                                className={`availability-toggle ${
                                    providerProfile?.is_available
                                        ? "available"
                                        : "unavailable"
                                }`}
                                onClick={() => {
                                    /* Will implement toggle functionality */
                                }}
                            >
                                <i
                                    className={`fas fa-circle ${
                                        providerProfile?.is_available
                                            ? "text-success"
                                            : "text-muted"
                                    }`}
                                ></i>
                                {providerProfile?.is_available
                                    ? "Available"
                                    : "Unavailable"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Page Title */}
            {(title || subtitle) && (
                <div className="profile-page-header">
                    {title && <h1 className="page-title">{title}</h1>}
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
            )}

            {/* Main Content */}
            <div className="profile-content">{children}</div>

            <style jsx>{`
                .profile-container {
                    width: 100%;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 0 !important;
                }

                .profile-loading,
                .profile-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    text-align: center;
                    color: var(--text-secondary);
                }

                .loading-spinner i,
                .error-icon i {
                    margin-bottom: var(--space-4);
                    color: var(--current-role-primary);
                }

                .profile-header {
                    background: var(--bg-white);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow-sm);
                    padding: var(--space-6);
                    margin-bottom: var(--space-6);
                    border-left: 4px solid var(--current-role-primary);
                    position: relative;
                }

                .profile-header-content {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-4);
                }

                .profile-avatar {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .profile-image {
                    border-radius: 50%;
                    object-fit: cover;
                    border: 4px solid var(--current-role-light);
                    box-shadow: var(--shadow-md);
                }

                .profile-status {
                    margin-top: var(--space-2);
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-badge.available {
                    background: var(--success-color);
                    color: white;
                }

                .status-badge.unavailable {
                    background: var(--text-muted);
                    color: white;
                }

                .profile-info {
                    flex: 1;
                    min-width: 0;
                }

                .provider-stats,
                .staff-info {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .stat-item i {
                    color: var(--current-role-primary);
                    width: 16px;
                }

                .rating {
                    color: var(--warning-color);
                    font-weight: var(--font-semibold);
                }

                .reviews {
                    color: var(--text-muted);
                }

                .verification {
                    font-weight: var(--font-medium);
                }

                .created-by {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .created-by i {
                    color: var(--current-role-primary);
                }

                .profile-header-actions {
                    position: absolute;
                    top: var(--space-4);
                    right: var(--space-4);
                }

                .availability-toggle {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-2) var(--space-3);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    background: var(--bg-white);
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .availability-toggle:hover {
                    border-color: var(--current-role-primary);
                    color: var(--current-role-primary);
                }

                .availability-toggle.available {
                    border-color: var(--success-color);
                    color: var(--success-color);
                }

                .profile-page-header {
                    margin-bottom: var(--space-6);
                }

                .page-subtitle {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                }

                .profile-content {
                    position: relative;
                    flex: 1;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .profile-header {
                        padding: var(--space-4);
                    }

                    .profile-header-content {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                        gap: var(--space-3);
                    }

                    .profile-image {
                        width: 80px;
                        height: 80px;
                    }

                    .profile-name {
                        font-size: var(--text-2xl);
                    }

                    .provider-stats {
                        align-items: center;
                    }

                    .stat-item {
                        justify-content: center;
                    }

                    .profile-header-actions {
                        position: static;
                        margin-top: var(--space-3);
                        display: flex;
                        justify-content: center;
                    }
                }

                @media (max-width: 576px) {
                    .profile-header-content {
                        gap: var(--space-2);
                    }

                    .profile-image {
                        width: 70px;
                        height: 70px;
                    }

                    .profile-name {
                        font-size: var(--text-xl);
                    }

                    .provider-stats {
                        font-size: var(--text-xs);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileLayout;
