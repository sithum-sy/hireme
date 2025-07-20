import React, { useState } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { validatePasswordStrength } from "../../../utils/validationUtils";
import ProfileFormField from "../shared/ProfileFormField";
import Button from "../../ui/Button";

const SecurityForm = ({ onSubmit }) => {
    const { changePassword, saving } = useProfile();
    const [formData, setFormData] = useState({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });
    const [errors, setErrors] = useState({});
    const [passwordStrength, setPasswordStrength] = useState({
        score: { value: 0, label: "Very Weak" },
        errors: [],
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Check password strength for new password
        if (name === "new_password") {
            const strength = validatePasswordStrength(value);
            setPasswordStrength(strength);
        }

        // Check password confirmation
        if (
            name === "new_password_confirmation" ||
            (name === "new_password" && formData.new_password_confirmation)
        ) {
            const newPassword =
                name === "new_password" ? value : formData.new_password;
            const confirmPassword =
                name === "new_password_confirmation"
                    ? value
                    : formData.new_password_confirmation;

            if (confirmPassword && newPassword !== confirmPassword) {
                setErrors((prev) => ({
                    ...prev,
                    new_password_confirmation: ["Passwords do not match"],
                }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.new_password_confirmation;
                    return newErrors;
                });
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        const newErrors = {};

        if (!formData.current_password) {
            newErrors.current_password = ["Current password is required"];
        }

        if (!formData.new_password) {
            newErrors.new_password = ["New password is required"];
        } else if (passwordStrength.errors.length > 0) {
            newErrors.new_password = passwordStrength.errors;
        }

        if (!formData.new_password_confirmation) {
            newErrors.new_password_confirmation = [
                "Password confirmation is required",
            ];
        } else if (
            formData.new_password !== formData.new_password_confirmation
        ) {
            newErrors.new_password_confirmation = ["Passwords do not match"];
        }

        if (formData.current_password === formData.new_password) {
            newErrors.new_password = [
                "New password must be different from current password",
            ];
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const result = await changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password,
                new_password_confirmation: formData.new_password_confirmation,
            });

            if (result.success) {
                setFormData({
                    current_password: "",
                    new_password: "",
                    new_password_confirmation: "",
                });
                setErrors({});
                setPasswordStrength({
                    score: { value: 0, label: "Very Weak" },
                    errors: [],
                });

                if (onSubmit) {
                    onSubmit(result);
                }
            } else {
                setErrors(result.errors || { general: result.message });
            }
        } catch (error) {
            setErrors({
                general: "Failed to change password. Please try again.",
            });
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const getPasswordStrengthColor = () => {
        const score = passwordStrength.score.value;
        if (score >= 5) return "var(--success-color)";
        if (score >= 4) return "var(--info-color)";
        if (score >= 3) return "var(--warning-color)";
        if (score >= 2) return "var(--danger-color)";
        return "#dc2626";
    };

    const getPasswordStrengthWidth = () => {
        return `${(passwordStrength.score.value / 5) * 100}%`;
    };

    return (
        <div className="security-form">
            {/* Security Notice */}
            <div className="security-notice">
                <div className="notice-content">
                    <i className="fas fa-shield-alt"></i>
                    <div>
                        <h5>Password Security</h5>
                        <p>
                            Changing your password will log you out of all
                            devices. You'll need to log in again with your new
                            password.
                        </p>
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

            <form onSubmit={handleSubmit} className="password-form">
                {/* Current Password */}
                <div className="password-field">
                    <label className="field-label">
                        Current Password
                        <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.current_password ? "is-invalid" : ""
                            }`}
                            placeholder="Enter your current password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("current")}
                        >
                            <i
                                className={`fas fa-${
                                    showPasswords.current ? "eye-slash" : "eye"
                                }`}
                            ></i>
                        </button>
                    </div>
                    {errors.current_password && (
                        <div className="field-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{errors.current_password[0]}</span>
                        </div>
                    )}
                </div>

                {/* New Password */}
                <div className="password-field">
                    <label className="field-label">
                        New Password
                        <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.new_password ? "is-invalid" : ""
                            }`}
                            placeholder="Enter your new password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("new")}
                        >
                            <i
                                className={`fas fa-${
                                    showPasswords.new ? "eye-slash" : "eye"
                                }`}
                            ></i>
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.new_password && (
                        <div className="password-strength">
                            <div className="strength-bar">
                                <div
                                    className="strength-fill"
                                    style={{
                                        width: getPasswordStrengthWidth(),
                                        backgroundColor:
                                            getPasswordStrengthColor(),
                                    }}
                                ></div>
                            </div>
                            <div className="strength-info">
                                <span
                                    className="strength-label"
                                    style={{
                                        color: getPasswordStrengthColor(),
                                    }}
                                >
                                    {passwordStrength.score.label}
                                </span>
                                <span className="strength-score">
                                    {passwordStrength.score.value}/5
                                </span>
                            </div>
                        </div>
                    )}

                    {errors.new_password && (
                        <div className="field-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <div>
                                {errors.new_password.map((error, index) => (
                                    <div key={index}>{error}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="password-field">
                    <label className="field-label">
                        Confirm New Password
                        <span className="required">*</span>
                    </label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="new_password_confirmation"
                            value={formData.new_password_confirmation}
                            onChange={handleChange}
                            className={`form-input ${
                                errors.new_password_confirmation
                                    ? "is-invalid"
                                    : ""
                            }`}
                            placeholder="Confirm your new password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility("confirm")}
                        >
                            <i
                                className={`fas fa-${
                                    showPasswords.confirm ? "eye-slash" : "eye"
                                }`}
                            ></i>
                        </button>
                    </div>
                    {errors.new_password_confirmation && (
                        <div className="field-error">
                            <i className="fas fa-exclamation-triangle"></i>
                            <span>{errors.new_password_confirmation[0]}</span>
                        </div>
                    )}
                </div>

                {/* Password Requirements */}
                <div className="password-requirements">
                    <h6>Password Requirements:</h6>
                    <ul>
                        <li
                            className={
                                formData.new_password &&
                                formData.new_password.length >= 8
                                    ? "valid"
                                    : ""
                            }
                        >
                            <i
                                className={`fas fa-${
                                    formData.new_password &&
                                    formData.new_password.length >= 8
                                        ? "check"
                                        : "times"
                                }`}
                            ></i>
                            At least 8 characters long
                        </li>
                        <li
                            className={
                                formData.new_password &&
                                /[a-z]/.test(formData.new_password)
                                    ? "valid"
                                    : ""
                            }
                        >
                            <i
                                className={`fas fa-${
                                    formData.new_password &&
                                    /[a-z]/.test(formData.new_password)
                                        ? "check"
                                        : "times"
                                }`}
                            ></i>
                            One lowercase letter
                        </li>
                        <li
                            className={
                                formData.new_password &&
                                /[A-Z]/.test(formData.new_password)
                                    ? "valid"
                                    : ""
                            }
                        >
                            <i
                                className={`fas fa-${
                                    formData.new_password &&
                                    /[A-Z]/.test(formData.new_password)
                                        ? "check"
                                        : "times"
                                }`}
                            ></i>
                            One uppercase letter
                        </li>
                        <li
                            className={
                                formData.new_password &&
                                /\d/.test(formData.new_password)
                                    ? "valid"
                                    : ""
                            }
                        >
                            <i
                                className={`fas fa-${
                                    formData.new_password &&
                                    /\d/.test(formData.new_password)
                                        ? "check"
                                        : "times"
                                }`}
                            ></i>
                            One number
                        </li>
                        <li
                            className={
                                formData.new_password &&
                                /[@$!%*?&]/.test(formData.new_password)
                                    ? "valid"
                                    : ""
                            }
                        >
                            <i
                                className={`fas fa-${
                                    formData.new_password &&
                                    /[@$!%*?&]/.test(formData.new_password)
                                        ? "check"
                                        : "times"
                                }`}
                            ></i>
                            One special character (@$!%*?&)
                        </li>
                    </ul>
                </div>

                {/* Form Actions */}
                <div className="form-actions">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            setFormData({
                                current_password: "",
                                new_password: "",
                                new_password_confirmation: "",
                            });
                            setErrors({});
                            setPasswordStrength({
                                score: { value: 0, label: "Very Weak" },
                                errors: [],
                            });
                        }}
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={saving}
                        disabled={saving || passwordStrength.score.value < 3}
                    >
                        Change Password
                    </Button>
                </div>
            </form>

            <style jsx>{`
                .security-form {
                    width: 100%;
                    max-width: 600px;
                }

                .security-notice {
                    background: var(--info-color);
                    color: white;
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-6);
                }

                .notice-content {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-3);
                }

                .notice-content i {
                    font-size: var(--text-xl);
                    margin-top: var(--space-1);
                }

                .notice-content h5 {
                    margin: 0 0 var(--space-1) 0;
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .notice-content p {
                    margin: 0;
                    font-size: var(--text-sm);
                    opacity: 0.9;
                    line-height: 1.4;
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

                .password-form {
                    width: 100%;
                }

                .password-field {
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

                .password-input-wrapper {
                    position: relative;
                }

                .form-input {
                    width: 100%;
                    padding: var(--space-3);
                    padding-right: var(--space-10);
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

                .form-input.is-invalid {
                    border-color: var(--danger-color);
                    background: rgba(239, 68, 68, 0.05);
                }

                .password-toggle {
                    position: absolute;
                    right: var(--space-3);
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    padding: var(--space-1);
                    border-radius: var(--border-radius-sm);
                    transition: var(--transition);
                }

                .password-toggle:hover {
                    color: var(--current-role-primary);
                    background: var(--current-role-light);
                }

                .password-strength {
                    margin-top: var(--space-2);
                }

                .strength-bar {
                    width: 100%;
                    height: 4px;
                    background: var(--border-color);
                    border-radius: 2px;
                    overflow: hidden;
                    margin-bottom: var(--space-2);
                }

                .strength-fill {
                    height: 100%;
                    transition: var(--transition);
                    border-radius: 2px;
                }

                .strength-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .strength-label {
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .strength-score {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
                }

                .field-error {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-2);
                    color: var(--danger-color);
                    font-size: var(--text-sm);
                    margin-top: var(--space-2);
                    line-height: 1.4;
                }

                .field-error i {
                    font-size: var(--text-xs);
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .password-requirements {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    padding: var(--space-4);
                    margin: var(--space-4) 0 var(--space-6) 0;
                }

                .password-requirements h6 {
                    margin: 0 0 var(--space-3) 0;
                    color: var(--text-primary);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                }

                .password-requirements ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .password-requirements li {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-1) 0;
                    color: var(--text-muted);
                    font-size: var(--text-sm);
                    transition: var(--transition);
                }

                .password-requirements li.valid {
                    color: var(--success-color);
                }

                .password-requirements li i {
                    width: 14px;
                    font-size: var(--text-xs);
                }

                .form-actions {
                    display: flex;
                    gap: var(--space-3);
                    justify-content: flex-end;
                    padding-top: var(--space-4);
                    border-top: 1px solid var(--border-color);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .form-actions {
                        flex-direction: column;
                    }

                    .form-actions :global(.btn) {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default SecurityForm;
