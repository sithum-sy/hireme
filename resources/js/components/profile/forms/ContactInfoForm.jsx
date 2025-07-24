import React, { useState, useEffect, useMemo } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { getSectionFields } from "../../../../config/profileConfig";
import { validateForm, hasFormErrors } from "../../../utils/validationUtils";
import { saveDraft, loadDraft, clearDraft } from "../../../utils/storageUtils";
import ProfileFormField from "../shared/ProfileFormField";
import Button from "../../ui/Button";

const ContactInfoForm = ({ onSubmit, initialData }) => {
    const { profile, config, updateProfile, saving, clearFieldError } =
        useProfile();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    const userRole = profile?.user?.role;
    const fields = getSectionFields(userRole, "contact");
    const userId = profile?.user?.id;
    
    // Memoize initial data to prevent unnecessary re-renders
    const memoizedInitialData = useMemo(() => {
        if (!profile?.user) return {};
        
        const userData = profile.user;
        return {
            contact_number: userData.contact_number || "",
            address: userData.address || "",
            ...(initialData || {}),
        };
    }, [profile?.user?.contact_number, profile?.user?.address, initialData]);

    // Initialize form data
    useEffect(() => {
        if (profile?.user && Object.keys(memoizedInitialData).length > 0) {
            // Check for saved draft
            const draft = loadDraft(userId, "contact");
            if (draft && Object.keys(draft).length > 0) {
                setFormData({ ...memoizedInitialData, ...draft });
                setIsDirty(true);
            } else {
                setFormData(memoizedInitialData);
                setIsDirty(false);
            }
        }
    }, [memoizedInitialData, userId]);

    // Auto-save draft
    useEffect(() => {
        if (isDirty && userId && Object.keys(formData).length > 0) {
            const timeoutId = setTimeout(() => {
                saveDraft(userId, "contact", formData);
            }, 2000);

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
                clearDraft(userId, "contact");

                if (onSubmit) {
                    onSubmit(result);
                }
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            setErrors({
                general:
                    "Failed to update contact information. Please try again.",
            });
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all changes?")) {
            if (profile?.user) {
                const userData = profile.user;
                const originalData = {
                    contact_number: userData.contact_number || "",
                    address: userData.address || "",
                };

                setFormData(originalData);
                setIsDirty(false);
                clearDraft(userId, "contact");
            }
        }
    };

    return (
        <div className="contact-info-form">
            {/* General Error */}
            {errors.general && (
                <div className="form-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-fields">
                    {Object.entries(fields).map(([fieldName, fieldConfig]) => (
                        <ProfileFormField
                            key={fieldName}
                            name={fieldName}
                            value={formData[fieldName]}
                            onChange={handleChange}
                            error={errors[fieldName]}
                            {...fieldConfig}
                        />
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
                .contact-info-form {
                    width: 100%;
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

                .form-fields {
                    margin-bottom: var(--space-6);
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

export default ContactInfoForm;
