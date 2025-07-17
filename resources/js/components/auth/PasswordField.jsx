import React, { useState } from "react";

const PasswordField = ({
    label = "Password",
    error,
    className = "",
    id,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `password-${Math.random().toString(36).substr(2, 9)}`;

    const togglePassword = () => setShowPassword(!showPassword);

    return (
        <div className="mb-3">
            {label && (
                <label htmlFor={inputId} className="form-label fw-semibold">
                    <i className="fas fa-lock me-2 text-muted"></i>
                    {label}
                </label>
            )}
            <div className="input-group">
                <input
                    id={inputId}
                    type={showPassword ? "text" : "password"}
                    className={`form-control ${
                        error ? "is-invalid" : ""
                    } ${className}`}
                    {...props}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary border-start-0"
                    onClick={togglePassword}
                    style={{ borderLeft: "none" }}
                >
                    <i
                        className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                        }`}
                    ></i>
                </button>
                {error && (
                    <div className="invalid-feedback d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordField;
