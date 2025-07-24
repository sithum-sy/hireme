import React, { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { getSectionFields } from "../../../../config/profileConfig";
import { validateForm, hasFormErrors } from "../../../utils/validationUtils";
import { saveDraft, loadDraft, clearDraft } from "../../../utils/storageUtils";
import ProfileFormField from "../shared/ProfileFormField";
import Button from "../../ui/Button";

const BasicInfoForm = ({ onSubmit, initialData }) => {
    const { profile, config, updateProfile, saving, clearFieldError } =
        useProfile();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [showDraftNotice, setShowDraftNotice] = useState(false);

    const userRole = profile?.user?.role;
    const fields = getSectionFields(userRole, "personal");
    const userId = profile?.user?.id;

    // Memoize initial data to prevent unnecessary re-renders
    const memoizedInitialData = useMemo(() => {
        if (!profile?.user) return {};
        
        const userData = profile.user;
        return {
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            date_of_birth: userData.date_of_birth || "",
            ...(initialData || {}),
        };
    }, [profile?.user?.first_name, profile?.user?.last_name, profile?.user?.email, profile?.user?.date_of_birth, initialData]);

    // Initialize form data
    useEffect(() => {
        if (profile?.user) {
            const initialFormData = memoizedInitialData;

            // Check for saved draft
            const draft = loadDraft(userId, "personal");
            if (draft && Object.keys(draft).length > 0) {
                setFormData({ ...initialFormData, ...draft });
                setShowDraftNotice(true);
                setIsDirty(true);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [profile?.user?.id, userId, memoizedInitialData]);

    // Auto-save draft
    useEffect(() => {
        if (isDirty && userId) {
            const timeoutId = setTimeout(() => {
                saveDraft(userId, "personal", formData);
            }, 2000); // Save after 2 seconds of inactivity

            return () => clearTimeout(timeoutId);
        }
    }, [formData, isDirty, userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        setIsDirty(true);

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
            clearFieldError(name);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const validationErrors = validateForm(formData, { fields });

        if (hasFormErrors(validationErrors)) {
            setErrors(validationErrors);
            return;
        }

        try {
            const result = await updateProfile(formData);

            if (result.success) {
                setIsDirty(false);
                setErrors({});
                clearDraft(userId, "personal");
                setShowDraftNotice(false);

                if (onSubmit) {
                    onSubmit(result);
                }
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            setErrors({
                general: "Failed to update profile. Please try again.",
            });
        }
    };

    const handleDiscardDraft = () => {
        if (profile?.user) {
            setFormData(memoizedInitialData);
            setIsDirty(false);
            setShowDraftNotice(false);
            clearDraft(userId, "personal");
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all changes?")) {
            handleDiscardDraft();
        }
    };

    return (
        <div className="basic-info-form">
            {/* Draft Notice */}
            {showDraftNotice && (
                <div className="draft-notice">
                    <div className="draft-content">
                        <div className="draft-info">
                            <i className="fas fa-save"></i>
                            <span>
                                You have unsaved changes from a previous
                                session.
                            </span>
                        </div>
                        <div className="draft-actions">
                            <button
                                type="button"
                                className="btn-link"
                                onClick={handleDiscardDraft}
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* General Error */}
            {errors.general && (
                <div className="form-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                    {Object.entries(fields).map(([fieldName, fieldConfig]) => (
                        <div
                            key={fieldName}
                            className={
                                fieldConfig.fullWidth ? "grid-full-width" : ""
                            }
                        >
                            <ProfileFormField
                                name={fieldName}
                                value={formData[fieldName]}
                                onChange={handleChange}
                                error={errors[fieldName]}
                                {...fieldConfig}
                            />
                        </div>
                    ))}
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <div className="actions-left">
                        {isDirty && (
                            <span className="unsaved-notice">
                                <i className="fas fa-circle"></i>
                                Unsaved changes
                            </span>
                        )}
                    </div>

                    <div className="actions-right">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleReset}
                            disabled={!isDirty || saving}
                        >
                            Reset
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={saving}
                            disabled={!isDirty || saving}
                        >
                            Save Changes
                        </Button>
                    </div>
                </div>
            </form>

            <style jsx>{`
                .basic-info-form {
                    width: 100%;
                }

                .draft-notice {
                    background: var(--info-color);
                    color: white;
                    padding: var(--space-3) var(--space-4);
                    border-radius: var(--border-radius);
                    margin-bottom: var(--space-4);
                }

                .draft-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .draft-info {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-sm);
                }

                .draft-actions .btn-link {
                    background: none;
                    border: none;
                    color: white;
                    text-decoration: underline;
                    cursor: pointer;
                    font-size: var(--text-sm);
                }

                .form-error-banner {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid var(--danger-color);
                    border-radius: var(--border-radius);
                    padding: var(--space-3) var(--space-4);
                    margin-bottom: var(--space-4);
                    color: var(--danger-color);
                }

                .profile-form {
                    width: 100%;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--space-4);
                    margin-bottom: var(--space-6);
                }

                .form-grid :global(.grid-full-width) {
                    grid-column: 1 / -1;
                }

                .form-actions {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--border-color);
                }

                .actions-left {
                    flex: 1;
                }

                .actions-right {
                    display: flex;
                    gap: var(--space-3);
                }

                .unsaved-notice {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--warning-color);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                }

                .unsaved-notice i {
                    font-size: 0.5rem;
                    animation: pulse 2s infinite;
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
                    .form-grid {
                        grid-template-columns: 1fr;
                        gap: var(--space-3);
                    }

                    .form-actions {
                        flex-direction: column;
                        gap: var(--space-3);
                        align-items: stretch;
                    }

                    .actions-right {
                        order: -1;
                    }

                    .actions-right :global(.btn) {
                        flex: 1;
                    }
                }
            `}</style>
        </div>
    );
};

export default BasicInfoForm;
