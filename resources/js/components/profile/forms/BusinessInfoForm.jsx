import React, { useState, useEffect } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { getSectionFields } from "../../../../config/profileConfig";
import { validateForm, hasFormErrors } from "../../../utils/validationUtils";
import { saveDraft, loadDraft, clearDraft } from "../../../utils/storageUtils";
import ProfileFormField from "../shared/ProfileFormField";
import Button from "../../ui/Button";

const BusinessInfoForm = ({ onSubmit, initialData = {} }) => {
    const {
        profile,
        config,
        updateProviderProfile,
        saving,
        clearFieldError,
        toggleAvailability,
    } = useProfile();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const [toggling, setToggling] = useState(false);

    const userRole = profile?.user?.role;
    const fields = getSectionFields(userRole, "business");
    const userId = profile?.user?.id;
    const providerProfile = profile?.provider_profile;

    // Initialize form data
    useEffect(() => {
        if (providerProfile) {
            const initialFormData = {
                business_name: providerProfile.business_name || "",
                bio: providerProfile.bio || "",
                years_of_experience: providerProfile.years_of_experience || 0,
                service_area_radius: providerProfile.service_area_radius || 10,
                is_available: providerProfile.is_available || false,
                ...initialData,
            };

            // Check for saved draft
            const draft = loadDraft(userId, "business");
            if (draft && Object.keys(draft).length > 0) {
                setFormData({ ...initialFormData, ...draft });
                setIsDirty(true);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [providerProfile, initialData, userId]);

    // Auto-save draft
    useEffect(() => {
        if (isDirty && userId) {
            const timeoutId = setTimeout(() => {
                saveDraft(userId, "business", formData);
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

    const handleToggleAvailability = async () => {
        setToggling(true);
        try {
            const result = await toggleAvailability();
            if (result.success) {
                setFormData((prev) => ({
                    ...prev,
                    is_available: !prev.is_available,
                }));
            }
        } catch (error) {
            console.error("Failed to toggle availability:", error);
        } finally {
            setToggling(false);
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
            const result = await updateProviderProfile(formData);

            if (result.success) {
                setIsDirty(false);
                setErrors({});
                clearDraft(userId, "business");

                if (onSubmit) {
                    onSubmit(result);
                }
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            setErrors({
                general:
                    "Failed to update business information. Please try again.",
            });
        }
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all changes?")) {
            if (providerProfile) {
                const originalData = {
                    business_name: providerProfile.business_name || "",
                    bio: providerProfile.bio || "",
                    years_of_experience:
                        providerProfile.years_of_experience || 0,
                    service_area_radius:
                        providerProfile.service_area_radius || 10,
                    is_available: providerProfile.is_available || false,
                };

                setFormData(originalData);
                setIsDirty(false);
                clearDraft(userId, "business");
            }
        }
    };

    return (
        <div className="business-info-form">
            {/* Availability Toggle */}
            <div className="availability-section">
                <div className="availability-content">
                    <div className="availability-info">
                        <h4>Service Availability</h4>
                        <p>Control whether you're accepting new bookings</p>
                    </div>
                    <div className="availability-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${
                                formData.is_available ? "active" : ""
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
                                    : formData.is_available
                                    ? "Available"
                                    : "Unavailable"}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* General Error */}
            {errors.general && (
                <div className="form-error-banner">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                    {Object.entries(fields)
                        .filter(([name]) => name !== "is_available")
                        .map(([fieldName, fieldConfig]) => (
                            <div
                                key={fieldName}
                                className={
                                    fieldConfig.fullWidth
                                        ? "grid-full-width"
                                        : ""
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
                .business-info-form {
                    width: 100%;
                }

                .availability-section {
                    background: var(--current-role-light);
                    border: 1px solid var(--current-role-primary);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-6);
                }

                .availability-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-4);
                }

                .availability-info h4 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--current-role-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .availability-info p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .toggle-btn {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: var(--space-2);
                    border-radius: var(--border-radius);
                    transition: var(--transition);
                }

                .toggle-btn:hover {
                    background: rgba(255, 255, 255, 0.5);
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

                .toggle-btn.active .toggle-slider {
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

                .toggle-btn.active .toggle-knob {
                    transform: translateX(24px);
                }

                .toggle-label {
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
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
                    .availability-content {
                        flex-direction: column;
                        align-items: stretch;
                        text-align: center;
                    }

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

export default BusinessInfoForm;
