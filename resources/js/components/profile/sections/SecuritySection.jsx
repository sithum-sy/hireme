import React, { useState, useCallback, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import ProfileSection from "../shared/ProfileSection";
import SecurityForm from "../forms/SecurityForm";
import Button from "../../ui/Button";

const SecuritySection = ({ onSuccess, onError }) => {
    const { user } = useAuth();
    const { profile, config } = useProfile();
    const [changePasswordMode, setChangePasswordMode] = useState(false);

    const userData = profile?.user;

    const handleFormSuccess = useCallback((result) => {
        setChangePasswordMode(false);
        if (onSuccess) {
            onSuccess(
                result.message || "Security settings updated successfully!"
            );
        }
    }, [onSuccess]);

    const handleFormError = useCallback((error) => {
        if (onError) {
            onError(error.message || "Failed to update security settings");
        }
    }, [onError]);

    const getSecurityScore = () => {
        let score = 0;
        let maxScore = 5;

        // Email verification
        if (userData?.email_verified_at) score += 1;

        // Profile completeness
        if (userData?.first_name && userData?.last_name) score += 1;

        // Recent login activity
        if (userData?.last_login_at) score += 1;

        // Account age (more than 30 days)
        if (userData?.created_at) {
            const accountAge =
                Date.now() - new Date(userData.created_at).getTime();
            if (accountAge > 30 * 24 * 60 * 60 * 1000) score += 1;
        }

        // Role-specific security
        if (
            userData?.role === "service_provider" &&
            profile?.provider_profile?.verification_status === "verified"
        ) {
            score += 1;
        } else if (["admin", "staff"].includes(userData?.role)) {
            score += 1; // Admin/staff accounts are inherently more secure
        } else {
            score += 1; // Give clients the benefit of the doubt
        }

        const percentage = Math.round((score / maxScore) * 100);

        return {
            score,
            maxScore,
            percentage,
            level:
                percentage >= 80 ? "High" : percentage >= 60 ? "Medium" : "Low",
        };
    };

    const securityScore = useMemo(() => getSecurityScore(), [userData?.email_verified_at, userData?.first_name, userData?.last_name, userData?.last_login_at, userData?.created_at, userData?.role, profile?.provider_profile?.verification_status]);

    const renderViewMode = () => (
        <div className="security-view-mode">
            {/* Security Overview */}
            <div className="security-overview">
                <div className="overview-header">
                    <div className="security-info">
                        <h4>Account Security</h4>
                        <p>
                            Keep your account safe with strong security
                            practices
                        </p>
                    </div>
                    <div className="security-score">
                        <div
                            className={`score-circle ${securityScore.level.toLowerCase()}`}
                        >
                            <div className="score-text">
                                <span className="percentage">
                                    {securityScore.percentage}%
                                </span>
                                <span className="label">
                                    {securityScore.level}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="security-progress">
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${securityScore.level.toLowerCase()}`}
                            style={{ width: `${securityScore.percentage}%` }}
                        ></div>
                    </div>
                    <span className="progress-text">
                        Security Score: {securityScore.score} of{" "}
                        {securityScore.maxScore}
                    </span>
                </div>
            </div>

            {/* Security Settings */}
            <div className="security-settings">
                <div className="settings-header">
                    <h5>Security Settings</h5>
                </div>

                <div className="settings-grid">
                    {/* Password */}
                    <div className="setting-item">
                        <div className="setting-header">
                            <div className="setting-icon">
                                <i className="fas fa-key"></i>
                            </div>
                            <div className="setting-info">
                                <h6>Password</h6>
                                <p>Strong password protects your account</p>
                            </div>
                        </div>
                        <div className="setting-actions">
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => setChangePasswordMode(true)}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>

                    {/* Email Verification */}
                    <div className="setting-item">
                        <div className="setting-header">
                            <div className="setting-icon">
                                <i className="fas fa-envelope-check"></i>
                            </div>
                            <div className="setting-info">
                                <h6>Email Verification</h6>
                                <p>
                                    {userData?.email_verified_at
                                        ? "Your email is verified"
                                        : "Verify your email address"}
                                </p>
                            </div>
                        </div>
                        <div className="setting-status">
                            {userData?.email_verified_at ? (
                                <span className="status-badge verified">
                                    <i className="fas fa-check"></i>
                                    Verified
                                </span>
                            ) : (
                                <span className="status-badge unverified">
                                    <i className="fas fa-exclamation-triangle"></i>
                                    Unverified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="setting-item">
                        <div className="setting-header">
                            <div className="setting-icon">
                                <i className="fas fa-mobile-alt"></i>
                            </div>
                            <div className="setting-info">
                                <h6>Two-Factor Authentication</h6>
                                <p>Add an extra layer of security</p>
                            </div>
                        </div>
                        <div className="setting-actions">
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled
                            >
                                Coming Soon
                            </Button>
                        </div>
                    </div>

                    {/* Login Notifications */}
                    <div className="setting-item">
                        <div className="setting-header">
                            <div className="setting-icon">
                                <i className="fas fa-bell"></i>
                            </div>
                            <div className="setting-info">
                                <h6>Login Notifications</h6>
                                <p>Get notified of new login attempts</p>
                            </div>
                        </div>
                        <div className="setting-toggle">
                            <label className="toggle-switch">
                                <input type="checkbox" defaultChecked />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Activity */}
            <div className="account-activity">
                <div className="activity-header">
                    <h5>Recent Account Activity</h5>
                </div>

                <div className="activity-list">
                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-sign-in-alt text-success"></i>
                        </div>
                        <div className="activity-content">
                            <h6>Last Login</h6>
                            <p>
                                {userData?.last_login_at
                                    ? new Date(
                                          userData.last_login_at
                                      ).toLocaleString()
                                    : "No recent login"}
                            </p>
                        </div>
                    </div>

                    <div className="activity-item">
                        <div className="activity-icon">
                            <i className="fas fa-user-plus text-info"></i>
                        </div>
                        <div className="activity-content">
                            <h6>Account Created</h6>
                            <p>
                                {userData?.created_at
                                    ? new Date(
                                          userData.created_at
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "Unknown"}
                            </p>
                        </div>
                    </div>

                    {userData?.role === "service_provider" &&
                        profile?.provider_profile?.verified_at && (
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <i className="fas fa-shield-check text-warning"></i>
                                </div>
                                <div className="activity-content">
                                    <h6>Provider Verification</h6>
                                    <p>
                                        Verified on{" "}
                                        {new Date(
                                            profile.provider_profile.verified_at
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>

            {/* Account Deletion */}
            {config?.permissions?.canDelete && (
                <div className="danger-zone">
                    <div className="danger-header">
                        <h5>Danger Zone</h5>
                        <p>
                            Irreversible actions that will affect your account
                        </p>
                    </div>

                    <div className="danger-actions">
                        <div className="danger-item">
                            <div className="danger-info">
                                <h6>Delete Account</h6>
                                <p>
                                    Permanently delete your account and all
                                    associated data
                                </p>
                            </div>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            "Are you sure you want to delete your account? This action cannot be undone."
                                        )
                                    ) {
                                        // Handle account deletion
                                        alert(
                                            "Account deletion feature coming soon"
                                        );
                                    }
                                }}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderPasswordChangeMode = () => (
        <div className="security-edit-mode">
            <SecurityForm
                onSubmit={handleFormSuccess}
                onError={handleFormError}
            />
        </div>
    );

    return (
        <ProfileSection
            title="Security & Privacy"
            subtitle="Manage your account security and privacy settings"
            icon="fas fa-shield-alt"
            actions={
                changePasswordMode && (
                    <div className="section-actions">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setChangePasswordMode(false)}
                        >
                            <i className="fas fa-times"></i>
                            Cancel
                        </Button>
                    </div>
                )
            }
        >
            {changePasswordMode ? renderPasswordChangeMode() : renderViewMode()}

            <style jsx>{`
                .security-view-mode {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .security-overview {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-5);
                }

                .overview-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-4);
                }

                .security-info h4 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                }

                .security-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .security-score {
                    display: flex;
                    align-items: center;
                }

                .score-circle {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .score-circle.high {
                    background: conic-gradient(
                        var(--success-color) 80%,
                        var(--border-color) 80%
                    );
                }

                .score-circle.medium {
                    background: conic-gradient(
                        var(--warning-color) 60%,
                        var(--border-color) 60%
                    );
                }

                .score-circle.low {
                    background: conic-gradient(
                        var(--danger-color) 40%,
                        var(--border-color) 40%
                    );
                }

                .score-circle::before {
                    content: "";
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: var(--bg-white);
                }

                .score-text {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 1;
                }

                .percentage {
                    font-size: var(--text-lg);
                    font-weight: var(--font-bold);
                    color: var(--text-primary);
                }

                .label {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                }

                .security-progress {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: var(--transition);
                }

                .progress-fill.high {
                    background: var(--success-color);
                }

                .progress-fill.medium {
                    background: var(--warning-color);
                }

                .progress-fill.low {
                    background: var(--danger-color);
                }

                .progress-text {
                    font-size: var(--text-sm);
                    color: var(--text-secondary);
                    text-align: center;
                }

                .security-settings {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .settings-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .settings-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .settings-grid {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .setting-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-3);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                }

                .setting-header {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex: 1;
                }

                .setting-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .setting-info h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .setting-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-xs);
                }

                .setting-actions,
                .setting-status,
                .setting-toggle {
                    flex-shrink: 0;
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-badge.verified {
                    background: var(--success-color);
                    color: white;
                }

                .status-badge.unverified {
                    background: var(--warning-color);
                    color: white;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 26px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--text-muted);
                    transition: var(--transition);
                    border-radius: 13px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: var(--transition);
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: var(--success-color);
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }

                .account-activity {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .activity-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .activity-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .activity-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    padding: var(--space-3);
                    background: var(--bg-light);
                    border-radius: var(--border-radius);
                }

                .activity-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-white);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .activity-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .activity-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .danger-zone {
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid var(--danger-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .danger-header {
                    margin-bottom: var(--space-4);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid rgba(239, 68, 68, 0.2);
                }

                .danger-header h5 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--danger-color);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .danger-header p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .danger-actions {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .danger-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-3);
                    background: var(--bg-white);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: var(--border-radius);
                }

                .danger-info h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .danger-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-xs);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .overview-header {
                        flex-direction: column;
                        gap: var(--space-3);
                        text-align: center;
                    }

                    .setting-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: var(--space-3);
                    }

                    .setting-header {
                        justify-content: center;
                    }

                    .danger-item {
                        flex-direction: column;
                        align-items: stretch;
                        gap: var(--space-3);
                        text-align: center;
                    }
                }
            `}</style>
        </ProfileSection>
    );
};

export default SecuritySection;
