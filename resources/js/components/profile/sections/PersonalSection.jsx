import React, { useState, useCallback, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import ProfileSection from "../shared/ProfileSection";
import ProfileImageUpload from "../shared/ProfileImageUpload";
import BasicInfoForm from "../forms/BasicInfoForm";
import Button from "../../ui/Button";
import { useStableProfileImage } from "../../../hooks/useStableImageUrl";

const PersonalSection = React.memo(({ onSuccess, onError }) => {
    const { user } = useAuth();
    const { profile, config } = useProfile();
    const [editMode, setEditMode] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const userData = profile?.user;
    const canEditProfile = config?.permissions?.canEdit?.length > 0;

    // Use enhanced stable image URL with caching
    const currentProfileImage = useStableProfileImage(
        userData?.id,
        userData?.profile_picture
    );

    const handleFormSuccess = useCallback(
        (result) => {
            setEditMode(false);
            if (onSuccess) {
                onSuccess(
                    result.message ||
                        "Personal information updated successfully!"
                );
            }
        },
        [onSuccess]
    );

    const handleFormError = useCallback(
        (error) => {
            if (onError) {
                onError(
                    error.message || "Failed to update personal information"
                );
            }
        },
        [onError]
    );

    const handleImageChange = useCallback(
        (newImageUrl) => {
            if (onSuccess) {
                onSuccess("Profile picture updated successfully!");
            }
        },
        [onSuccess]
    );

    const renderViewMode = () => (
        <div className="personal-view-mode">
            <div className="profile-overview">
                <div className="profile-image-section">
                    <div className="image-container">
                        <ProfileImageUpload
                            currentImage={currentProfileImage}
                            onImageChange={handleImageChange}
                            size="large"
                            className="profile-image-upload"
                        />
                    </div>
                    <div className="image-actions">
                        {/* <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowImageUpload(!showImageUpload)}
                        >
                            <i className="fas fa-camera"></i>
                            {userData?.profile_picture
                                ? "Change Photo"
                                : "Add Photo"}
                        </Button> */}
                    </div>
                </div>

                <div className="profile-details">
                    <div className="detail-grid">
                        <div className="detail-item">
                            <label>Full Name</label>
                            <div className="detail-value">
                                {userData?.full_name || "Not provided"}
                            </div>
                        </div>

                        <div className="detail-item">
                            <label>Email Address</label>
                            <div className="detail-value">
                                {userData?.email || "Not provided"}
                                {userData?.email_verified_at && (
                                    <span className="verification-badge">
                                        <i className="fas fa-check-circle"></i>
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>

                        {config?.permissions?.canView?.includes(
                            "date_of_birth"
                        ) && (
                            <div className="detail-item">
                                <label>Date of Birth</label>
                                <div className="detail-value">
                                    {userData?.date_of_birth
                                        ? new Date(
                                              userData.date_of_birth
                                          ).toLocaleDateString()
                                        : "Not provided"}
                                    {userData?.age && (
                                        <span className="age-info">
                                            ({userData.age} years old)
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="detail-item">
                            <label>Account Type</label>
                            <div className="detail-value">
                                <span className="role-badge">
                                    <i className="fas fa-user-tag"></i>
                                    {userData?.role
                                        ?.replace("_", " ")
                                        ?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div className="detail-item">
                            <label>Member Since</label>
                            <div className="detail-value">
                                {userData?.created_at
                                    ? new Date(
                                          userData.created_at
                                      ).toLocaleDateString("en-US", {
                                          year: "numeric",
                                          month: "long",
                                          day: "numeric",
                                      })
                                    : "Unknown"}
                            </div>
                        </div>

                        {userData?.last_login_at && (
                            <div className="detail-item">
                                <label>Last Login</label>
                                <div className="detail-value">
                                    {new Date(
                                        userData.last_login_at
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Status */}
            <div className="account-status">
                <div className="status-header">
                    <h5>Account Status</h5>
                </div>
                <div className="status-items">
                    <div className="status-item">
                        <div className="status-icon active">
                            <i className="fas fa-user-check"></i>
                        </div>
                        <div className="status-content">
                            <h6>Account Active</h6>
                            <p>Your account is in good standing</p>
                        </div>
                    </div>

                    <div className="status-item">
                        <div className="status-icon active">
                            <i className="fas fa-envelope"></i>
                        </div>
                        <div className="status-content">
                            <h6>
                                Email{" "}
                                {userData?.email_verified_at
                                    ? "Verified"
                                    : "Not Verified"}
                            </h6>
                            <p>
                                {userData?.email_verified_at
                                    ? "Your email address has been verified"
                                    : "Please verify your email address"}
                            </p>
                        </div>
                    </div>

                    {userData?.role === "service_provider" &&
                        profile?.provider_profile && (
                            <div className="status-item">
                                <div
                                    className={`status-icon ${
                                        profile.provider_profile
                                            .verification_status === "verified"
                                            ? "active"
                                            : "pending"
                                    }`}
                                >
                                    <i className="fas fa-shield"></i>
                                </div>
                                <div className="status-content">
                                    <h6>
                                        Provider Status:{" "}
                                        {
                                            profile.provider_profile
                                                .verification_status
                                        }
                                    </h6>
                                    <p>
                                        {profile.provider_profile
                                            .verification_status === "verified"
                                            ? "You are a verified service provider"
                                            : "Provider verification pending"}
                                    </p>
                                </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );

    const renderEditMode = () => (
        <div className="personal-edit-mode">
            <BasicInfoForm
                onSubmit={handleFormSuccess}
                onError={handleFormError}
            />
        </div>
    );

    return (
        <ProfileSection
            title="Personal Information"
            subtitle="View and manage your basic personal details"
            icon="fas fa-user"
            actions={
                canEditProfile && (
                    <div className="section-actions">
                        {!editMode ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setEditMode(true)}
                            >
                                <i className="fas fa-edit"></i>
                                Edit Information
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
                .personal-view-mode {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .profile-overview {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: var(--space-6);
                    align-items: start;
                }

                .profile-image-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-3);
                }

                .image-container {
                    position: relative;
                }

                .image-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                .profile-details {
                    flex: 1;
                }

                .detail-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-4);
                }

                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-1);
                }

                .detail-item label {
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-base);
                    color: var(--text-primary);
                    font-weight: var(--font-medium);
                }

                .verification-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    background: var(--success-color);
                    color: white;
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--border-radius);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                }

                .age-info {
                    color: var(--text-muted);
                    font-size: var(--text-sm);
                    font-weight: var(--font-normal);
                }

                .role-badge {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    padding: var(--space-2) var(--space-3);
                    border-radius: var(--border-radius);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .account-status {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .status-header {
                    margin-bottom: var(--space-3);
                    padding-bottom: var(--space-3);
                    border-bottom: 1px solid var(--border-color);
                }

                .status-header h5 {
                    margin: 0;
                    color: var(--text-primary);
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .status-items {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-3);
                }

                .status-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                }

                .status-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .status-icon.active {
                    background: var(--success-color);
                    color: white;
                }

                .status-icon.inactive {
                    background: var(--text-muted);
                    color: white;
                }

                .status-icon.pending {
                    background: var(--warning-color);
                    color: white;
                }

                .status-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .status-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    line-height: 1.4;
                }

                .section-actions {
                    display: flex;
                    gap: var(--space-2);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .profile-overview {
                        grid-template-columns: 1fr;
                        gap: var(--space-4);
                        text-align: center;
                    }

                    .detail-grid {
                        grid-template-columns: 1fr;
                        gap: var(--space-3);
                    }

                    .detail-item {
                        text-align: left;
                    }

                    .status-item {
                        align-items: flex-start;
                    }
                }
            `}</style>
        </ProfileSection>
    );
});

PersonalSection.displayName = "PersonalSection";

export default PersonalSection;
