import React from "react";

const LoadingSpinner = ({
    size = "large",
    message = "Loading...",
    fullScreen = false,
    color = "primary",
}) => {
    const sizeClass = size === "small" ? "spinner-border-sm" : "";
    const containerClass = fullScreen
        ? "min-vh-100 d-flex align-items-center justify-content-center"
        : "d-flex align-items-center justify-content-center p-4";

    return (
        <div className={containerClass}>
            <div className="text-center">
                <div
                    className={`spinner-border text-${color} ${sizeClass} mb-3`}
                    style={
                        size === "large"
                            ? { width: "3rem", height: "3rem" }
                            : {}
                    }
                >
                    <span className="visually-hidden">Loading...</span>
                </div>
                {message && (
                    <>
                        <h5 className="text-muted">{message}</h5>
                        <p className="text-muted small">
                            Please wait while we process your request
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoadingSpinner;
