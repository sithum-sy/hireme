import React from "react";

const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    error,
    placeholder,
    required = false,
    className = "",
    children,
    ...props
}) => {
    return (
        <div className="form-group">
            {label && (
                <label className="form-label">
                    {label} {required && <span className="text-danger">*</span>}
                </label>
            )}

            {children ? (
                children
            ) : (
                <input
                    type={type}
                    name={name}
                    className={`form-input ${
                        error ? "is-invalid" : ""
                    } ${className}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    {...props}
                />
            )}

            {error && (
                <div className="error-message">
                    <i className="fas fa-exclamation-triangle me-1"></i>
                    {error}
                </div>
            )}

            <style jsx>{`
                .form-group {
                    margin-bottom: 1.25rem;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    background: #fafafa;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #4a90e2;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
                }

                .form-input.is-invalid {
                    border-color: #ef4444;
                    background: #fef2f2;
                }

                .error-message {
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.375rem;
                    display: flex;
                    align-items: center;
                }
            `}</style>
        </div>
    );
};

export default FormField;
