import React, { forwardRef } from "react";

const Input = forwardRef(
    ({ label, error, icon, className = "", id, ...props }, ref) => {
        const inputId =
            id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="mb-3">
                {label && (
                    <label htmlFor={inputId} className="form-label fw-semibold">
                        {icon && <i className={`${icon} me-2 text-muted`}></i>}
                        {label}
                    </label>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={`form-control ${
                        error ? "is-invalid" : ""
                    } ${className}`}
                    {...props}
                />
                {error && (
                    <div className="invalid-feedback d-flex align-items-center">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {error}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
a;
export default Input;
