import React, { useState, useEffect } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { validateField } from "../../../utils/validationUtils";
import { getFieldConfig } from "../../../../config/profileConfig";

const ProfileFormField = ({
    name,
    value,
    onChange,
    onBlur,
    error,
    disabled = false,
    className = "",
    realTimeValidation = true,
    ...props
}) => {
    const {
        config,
        validateField: validateFieldAsync,
        canEdit,
        isReadOnly,
    } = useProfile();
    const [localError, setLocalError] = useState("");
    const [validating, setValidating] = useState(false);
    const [touched, setTouched] = useState(false);

    const fieldConfig = getFieldConfig(config?.user?.role, name);

    if (!fieldConfig) {
        return null; // Field not configured for this role
    }

    const isFieldDisabled = disabled || !canEdit(name) || isReadOnly(name);
    const showError = error || localError;

    // Real-time validation
    useEffect(() => {
        if (realTimeValidation && touched && value !== undefined) {
            const errors = validateField(value, fieldConfig);
            setLocalError(errors.length > 0 ? errors[0] : "");
        }
    }, [value, fieldConfig, realTimeValidation, touched]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setTouched(true);

        if (onChange) {
            onChange(e);
        }
    };

    const handleBlur = async (e) => {
        setTouched(true);

        // Server-side validation for important fields
        if (realTimeValidation && !isFieldDisabled && fieldConfig.required) {
            setValidating(true);
            try {
                const result = await validateFieldAsync(name, e.target.value);
                if (!result.success) {
                    setLocalError(result.message || "Validation failed");
                } else {
                    setLocalError("");
                }
            } catch (err) {
                console.warn("Field validation failed:", err);
            } finally {
                setValidating(false);
            }
        }

        if (onBlur) {
            onBlur(e);
        }
    };

    const renderInput = () => {
        // Filter out non-DOM props that shouldn't be passed to input elements
        const {
            maxDate,
            rows,
            options,
            step,
            checkboxLabel,
            helpText,
            fullWidth,
            required,
            label,
            validation,
            section,
            readOnly,
            placeholder: configPlaceholder,
            ...domProps
        } = props;

        const inputProps = {
            id: name,
            name,
            value: value || "",
            onChange: handleChange,
            onBlur: handleBlur,
            disabled: isFieldDisabled,
            className: `form-input ${showError ? "is-invalid" : ""} ${
                validating ? "validating" : ""
            }`,
            placeholder:
                fieldConfig.placeholder ||
                `Enter ${fieldConfig.label.toLowerCase()}`,
            ...domProps, // Only pass through DOM-compatible props
        };

        switch (fieldConfig.type) {
            case "textarea":
                return (
                    <textarea {...inputProps} rows={fieldConfig.rows || 3} />
                );

            case "select":
                return (
                    <select {...inputProps}>
                        <option value="">Select {fieldConfig.label}</option>
                        {fieldConfig.options?.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case "number":
                return (
                    <input
                        {...inputProps}
                        type="number"
                        min={fieldConfig.validation?.min}
                        max={fieldConfig.validation?.max}
                        step={fieldConfig.step || 1}
                    />
                );

            case "date":
                // Format date for HTML date input (yyyy-MM-dd)
                let dateValue = '';
                if (value) {
                    try {
                        // Handle different date formats
                        if (value.includes('T')) {
                            // ISO format
                            dateValue = value.split('T')[0];
                        } else if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            // Already in yyyy-MM-dd format
                            dateValue = value;
                        } else {
                            // Try to parse and format
                            dateValue = new Date(value).toISOString().split('T')[0];
                        }
                    } catch (error) {
                        console.warn('Date parsing error:', error);
                        dateValue = '';
                    }
                }
                
                return (
                    <input
                        {...inputProps}
                        type="date"
                        value={dateValue}
                        max={
                            fieldConfig.maxDate ||
                            new Date().toISOString().split("T")[0]
                        }
                        onChange={(e) => {
                            // Convert back to ISO format for consistency
                            const event = {
                                target: {
                                    name,
                                    value: e.target.value ? new Date(e.target.value + 'T00:00:00.000Z').toISOString() : '',
                                },
                            };
                            handleChange(event);
                        }}
                    />
                );

            case "email":
                return <input {...inputProps} type="email" />;

            case "tel":
                return <input {...inputProps} type="tel" />;

            case "boolean":
                return (
                    <div className="checkbox-wrapper">
                        <input
                            {...inputProps}
                            type="checkbox"
                            checked={value || false}
                            onChange={(e) => {
                                const event = {
                                    target: {
                                        name,
                                        value: e.target.checked,
                                    },
                                };
                                handleChange(event);
                            }}
                            className="form-checkbox"
                        />
                        <label htmlFor={name} className="checkbox-label">
                            {fieldConfig.checkboxLabel || fieldConfig.label}
                        </label>
                    </div>
                );

            default:
                return (
                    <input {...inputProps} type={fieldConfig.type || "text"} />
                );
        }
    };

    return (
        <div
            className={`profile-form-field ${className} ${
                showError ? "has-error" : ""
            }`}
        >
            {fieldConfig.type !== "boolean" && (
                <label htmlFor={name} className="field-label">
                    {fieldConfig.label}
                    {fieldConfig.required && (
                        <span className="required">*</span>
                    )}
                    {validating && (
                        <span className="validation-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                        </span>
                    )}
                </label>
            )}

            <div className="field-input-wrapper">
                {renderInput()}

                {isFieldDisabled && fieldConfig.helpText && (
                    <div className="field-help disabled-help">
                        <i className="fas fa-info-circle"></i>
                        {fieldConfig.helpText}
                    </div>
                )}
            </div>

            {showError && (
                <div className="field-error">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>{showError}</span>
                </div>
            )}

            {!showError && fieldConfig.helpText && !isFieldDisabled && (
                <div className="field-help">{fieldConfig.helpText}</div>
            )}

            <style jsx>{`
                .profile-form-field {
                    margin-bottom: var(--space-4);
                }

                .field-label {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-weight: var(--font-semibold);
                    color: var(--text-primary);
                    margin-bottom: var(--space-2);
                    font-size: var(--text-sm);
                }

                .required {
                    color: var(--danger-color);
                }

                .validation-spinner {
                    color: var(--current-role-primary);
                    font-size: var(--text-xs);
                }

                .field-input-wrapper {
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: var(--space-3);
                    border: 2px solid var(--border-color);
                    border-radius: var(--border-radius);
                    font-size: var(--text-base);
                    transition: var(--transition);
                    background: var(--bg-white);
                    font-family: inherit;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--current-role-primary);
                    box-shadow: 0 0 0 3px var(--current-role-light);
                }

                .form-input:disabled {
                    background: var(--bg-light);
                    color: var(--text-muted);
                    cursor: not-allowed;
                }

                .form-input.is-invalid {
                    border-color: var(--danger-color);
                    background: rgba(239, 68, 68, 0.05);
                }

                .form-input.validating {
                    border-color: var(--current-role-primary);
                }

                .form-input.is-invalid:focus {
                    border-color: var(--danger-color);
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .checkbox-wrapper {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .form-checkbox {
                    width: 18px;
                    height: 18px;
                    accent-color: var(--current-role-primary);
                }

                .checkbox-label {
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                    cursor: pointer;
                    margin: 0;
                }

                .field-error {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--danger-color);
                    font-size: var(--text-sm);
                    margin-top: var(--space-2);
                    line-height: 1.4;
                }

                .field-error i {
                    font-size: var(--text-xs);
                    flex-shrink: 0;
                }

                .field-help {
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    margin-top: var(--space-2);
                    line-height: 1.4;
                }

                .field-help.disabled-help {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    color: var(--text-muted);
                    font-style: italic;
                }

                .field-help.disabled-help i {
                    color: var(--info-color);
                }

                /* Textarea specific styles */
                textarea.form-input {
                    resize: vertical;
                    min-height: 80px;
                }

                /* Select specific styles */
                select.form-input {
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right var(--space-3) center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    padding-right: var(--space-8);
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .form-input {
                        padding: var(--space-2) var(--space-3);
                        font-size: var(--text-sm);
                    }
                }
            `}</style>
        </div>
    );
};

export default ProfileFormField;
