import React from "react";

const QuoteStatusBadge = ({ status, size = "normal", showIcon = true }) => {
    // Define status configurations
    const statusConfig = {
        pending: {
            label: "Awaiting Response",
            className: "bg-warning text-dark",
            icon: "fas fa-clock",
            description: "Waiting for provider to respond",
        },
        quoted: {
            label: "Quote Received",
            className: "bg-info text-white",
            icon: "fas fa-file-invoice-dollar",
            description: "Provider has sent you a quote",
        },
        accepted: {
            label: "Accepted",
            className: "bg-success text-white",
            icon: "fas fa-check-circle",
            description: "You have accepted this quote",
        },
        declined: {
            label: "Declined",
            className: "bg-danger text-white",
            icon: "fas fa-times-circle",
            description: "You have declined this quote",
        },
        expired: {
            label: "Expired",
            className: "bg-secondary text-white",
            icon: "fas fa-calendar-times",
            description: "Quote has expired",
        },
        withdrawn: {
            label: "Withdrawn",
            className: "bg-dark text-white",
            icon: "fas fa-undo",
            description: "Provider has withdrawn this quote",
        },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const sizeClass =
        size === "small" ? "badge-sm" : size === "large" ? "badge-lg" : "";

    return (
        <span
            className={`badge ${config.className} ${sizeClass}`}
            title={config.description}
        >
            {showIcon && <i className={`${config.icon} me-1`}></i>}
            {config.label}
        </span>
    );
};

export default QuoteStatusBadge;
