import React from "react";

const StatusBadge = ({
    status,
    size = "normal",
    showIcon = true,
    showText = true,
    customText = null,
}) => {
    // Status configuration
    const statusConfig = {
        pending: {
            className: "bg-warning text-dark",
            icon: "fas fa-clock",
            text: "Awaiting Confirmation",
            description: "Provider will confirm within 2 hours",
        },
        confirmed: {
            className: "bg-success text-white",
            icon: "fas fa-check-circle",
            text: "Confirmed",
            description: "Appointment confirmed by provider",
        },
        in_progress: {
            className: "bg-primary text-white",
            icon: "fas fa-play-circle",
            text: "In Progress",
            description: "Service is currently being performed",
        },
        completed: {
            className: "bg-info text-white",
            icon: "fas fa-check-double",
            text: "Completed",
            description: "Service has been completed",
        },
        cancelled_by_client: {
            className: "bg-danger text-white",
            icon: "fas fa-times-circle",
            text: "Cancelled by You",
            description: "You cancelled this appointment",
        },
        cancelled_by_provider: {
            className: "bg-danger text-white",
            icon: "fas fa-ban",
            text: "Cancelled by Provider",
            description: "Provider cancelled this appointment",
        },
        no_show: {
            className: "bg-secondary text-white",
            icon: "fas fa-user-times",
            text: "No Show",
            description: "Client did not show up for appointment",
        },
        disputed: {
            className: "bg-warning text-dark",
            icon: "fas fa-exclamation-triangle",
            text: "Disputed",
            description: "There is a dispute regarding this appointment",
        },
    };

    // Size configuration
    const sizeConfig = {
        small: {
            badgeClass: "badge",
            iconClass: "small",
            textClass: "small",
        },
        normal: {
            badgeClass: "badge px-2 py-1",
            iconClass: "",
            textClass: "",
        },
        large: {
            badgeClass: "badge px-3 py-2",
            iconClass: "me-2",
            textClass: "fw-semibold",
        },
    };

    const config = statusConfig[status] || statusConfig["pending"];
    const sizing = sizeConfig[size] || sizeConfig["normal"];

    return (
        <span
            className={`${sizing.badgeClass} ${config.className} ${sizing.textClass}`}
            title={config.description}
        >
            {showIcon && (
                <i
                    className={`${config.icon} ${sizing.iconClass} ${
                        showText ? "me-1" : ""
                    }`}
                ></i>
            )}
            {showText && (customText || config.text)}
        </span>
    );
};

export default StatusBadge;
