import React from "react";

const PlaceholderPage = ({
    title,
    subtitle,
    icon = "fas fa-cog",
    description = "This feature is coming soon.",
    actions = null,
    variant = "default",
}) => {
    const getIconColor = () => {
        switch (variant) {
            case "info":
                return "text-info";
            case "warning":
                return "text-warning";
            case "success":
                return "text-success";
            case "danger":
                return "text-danger";
            default:
                return "text-muted";
        }
    };

    return (
        <div className="page-content">
            {(title || subtitle) && (
                <div className="page-header">
                    {title && <h1 className="page-title">{title}</h1>}
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
            )}

            <div className="dashboard-card text-center">
                <div className={`action-icon ${getIconColor()}`}>
                    <i className={icon}></i>
                </div>
                <h4 className="action-title">Coming Soon</h4>
                <p className="action-description">{description}</p>

                {actions && <div className="action-buttons">{actions}</div>}
            </div>
        </div>
    );
};

export default PlaceholderPage;
