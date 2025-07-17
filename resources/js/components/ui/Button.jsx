import React from "react";

const Button = ({
    variant = "primary",
    size = "md",
    children,
    loading = false,
    disabled = false,
    className = "",
    outline = false,
    ...props
}) => {
    const getButtonClass = () => {
        let baseClass = "btn";

        if (outline) {
            baseClass += ` btn-outline-${variant}`;
        } else {
            baseClass += ` btn-${variant}`;
        }

        if (size !== "md") {
            baseClass += ` btn-${size}`;
        }

        return `${baseClass} ${className}`;
    };

    return (
        <button
            className={getButtonClass()}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                ></span>
            )}
            {children}
        </button>
    );
};

export default Button;
