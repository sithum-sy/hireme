import React from "react";
import FormField from "../../forms/FormField";

const PersonalInfo = ({
    formData,
    onChange,
    errors,
    showPassword,
    onTogglePassword,
}) => {
    return (
        <div className="personal-info">
            <div className="step-header">
                <h2 className="step-title">Personal Information</h2>
                <p className="step-subtitle">Tell us about yourself</p>
            </div>

            <div className="form-grid">
                <div className="form-row">
                    <FormField
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={onChange}
                        error={errors.first_name}
                        placeholder="Enter your first name"
                        required
                        className="half-width"
                    />

                    <FormField
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={onChange}
                        error={errors.last_name}
                        placeholder="Enter your last name"
                        required
                        className="half-width"
                    />
                </div>

                <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={onChange}
                    error={errors.email}
                    placeholder="email@example.com"
                    required
                />

                <FormField
                    label="Date of Birth"
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={onChange}
                    error={errors.date_of_birth}
                    max={new Date().toISOString().split("T")[0]}
                    required
                />

                <div className="form-row">
                    <FormField
                        label="Password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        error={errors.password}
                        placeholder="Enter your password"
                        required
                        className="half-width"
                    >
                        <div className="password-input-group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                className={`form-input ${
                                    errors.password ? "is-invalid" : ""
                                }`}
                                value={formData.password}
                                onChange={onChange}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={onTogglePassword}
                            >
                                <i
                                    className={`fas ${
                                        showPassword ? "fa-eye-slash" : "fa-eye"
                                    }`}
                                ></i>
                            </button>
                        </div>
                    </FormField>

                    <FormField
                        label="Confirm Password"
                        name="password_confirmation"
                        type="password"
                        value={formData.password_confirmation}
                        onChange={onChange}
                        error={errors.password_confirmation}
                        placeholder="Confirm your password"
                        required
                        className="half-width"
                    />
                </div>
            </div>

            <style jsx>{`
                .personal-info {
                    animation: fadeInUp 0.6s ease-out;
                }

                .step-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .step-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #1a202c;
                    margin-bottom: 0.5rem;
                }

                .step-subtitle {
                    color: #6b7280;
                    font-size: 1rem;
                    margin: 0;
                }

                .form-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                .password-input-group {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .password-toggle {
                    position: absolute;
                    right: 0.75rem;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 0.25rem;
                    font-size: 0.875rem;
                    transition: color 0.2s ease;
                }

                .password-toggle:hover {
                    color: #6b7280;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                        gap: 0.5rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PersonalInfo;
