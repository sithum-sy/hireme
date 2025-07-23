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
                    {required && <span className="required text-danger">*</span>}
                </label>
            )}

            <div className="form-input-wrapper">
                {children ? (
                    children
                ) : type === "textarea" ? (
                    <textarea
                        id={name}
                        name={name}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`form-input ${error ? "is-invalid" : ""}`}
                        rows={props.rows || 4}
                        {...props}
                    />
                ) : (
                    <input
                        id={name}
                        name={name}
                        type={type}
                        value={value || ""}
                        onChange={onChange}
                        placeholder={placeholder}
                        className={`form-input ${error ? "is-invalid" : ""} ${type === "file" ? "touch-friendly" : ""}`}
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
        </div>
    );
};

export default FormField;
