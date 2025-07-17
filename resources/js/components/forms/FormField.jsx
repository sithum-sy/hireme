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
    helpText,
    ...props
}) => {
    return (
        <div className={`form-field ${className} ${error ? "has-error" : ""}`}>
            {label && (
                <label htmlFor={name} className="form-label">
                    {label}
                    {required && <span className="required">*</span>}
                </label>
            )}

            <div className="form-input-wrapper">
                {children ? (
                    children
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`form-input ${error ? "is-invalid" : ""}`}
                        {...props}
                    />
                )}
            </div>

            {error && (
                <div className="form-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                </div>
            )}

            {helpText && !error && (
                <div className="form-help-text">{helpText}</div>
            )}

            <style jsx>{`
                .form-field {
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 1.5rem;
                }

                .form-label {
                    display: block;
                    font-weight: 600;
                    color: #374151;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                }

                .required {
                    color: #ef4444;
                    margin-left: 0.25rem;
                }

                .form-input-wrapper {
                    position: relative;
                    margin-bottom: 0.5rem;
                }

                .form-input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s ease;
                    background: #fafafa;
                    font-family: inherit;
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

                .form-input.is-invalid:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .form-error {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: #ef4444;
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                    line-height: 1.4;
                }

                .form-error i {
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }

                .form-help-text {
                    color: #6b7280;
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                    line-height: 1.4;
                }

                /* Textarea specific styles */
                .form-input[type="textarea"],
                .form-input:is(textarea) {
                    resize: vertical;
                    min-height: 80px;
                    padding: 0.75rem;
                }

                /* Select specific styles */
                .form-input:is(select) {
                    cursor: pointer;
                    padding-right: 2rem;
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
                    background-position: right 0.5rem center;
                    background-repeat: no-repeat;
                    background-size: 1.5em 1.5em;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                }

                /* Half width for grid layouts */
                .form-field.half-width {
                    margin-bottom: 1.5rem;
                }

                @media (max-width: 768px) {
                    .form-field {
                        margin-bottom: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default FormField;
