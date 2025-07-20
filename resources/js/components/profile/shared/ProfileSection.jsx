import React, { useState } from "react";

const ProfileSection = ({
    title,
    subtitle,
    icon,
    children,
    collapsible = false,
    defaultCollapsed = false,
    actions,
    loading = false,
    error,
    className = "",
}) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    const toggleCollapse = () => {
        if (collapsible) {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <div
            className={`profile-section ${className} ${
                isCollapsed ? "collapsed" : ""
            }`}
        >
            {/* Section Header */}
            <div
                className={`section-header ${collapsible ? "clickable" : ""}`}
                onClick={toggleCollapse}
            >
                <div className="section-title-group">
                    {icon && (
                        <div className="section-icon">
                            <i className={icon}></i>
                        </div>
                    )}
                    <div className="section-text">
                        <h3 className="section-title">{title}</h3>
                        {subtitle && (
                            <p className="section-subtitle">{subtitle}</p>
                        )}
                    </div>
                </div>

                <div className="section-actions">
                    {actions && <div className="custom-actions">{actions}</div>}

                    {collapsible && (
                        <button
                            type="button"
                            className="collapse-button"
                            aria-label={
                                isCollapsed
                                    ? "Expand section"
                                    : "Collapse section"
                            }
                        >
                            <i
                                className={`fas fa-chevron-${
                                    isCollapsed ? "down" : "up"
                                }`}
                            ></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Section Content */}
            <div
                className={`section-content ${
                    isCollapsed ? "hidden" : "visible"
                }`}
            >
                {loading ? (
                    <div className="section-loading">
                        <div className="loading-spinner">
                            <i className="fas fa-spinner fa-spin"></i>
                        </div>
                        <span>Loading...</span>
                    </div>
                ) : error ? (
                    <div className="section-error">
                        <div className="error-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <span>{error}</span>
                    </div>
                ) : (
                    <div className="section-body">{children}</div>
                )}
            </div>

            <style jsx>{`
                .profile-section {
                    background: var(--bg-white);
                    border-radius: var(--border-radius-lg);
                    box-shadow: var(--shadow-sm);
                    margin-bottom: var(--space-4);
                    overflow: hidden;
                    transition: var(--transition);
                    border: 1px solid var(--border-color);
                }

                .profile-section:hover {
                    box-shadow: var(--shadow-md);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--space-4) var(--space-5);
                    border-bottom: 1px solid var(--border-color);
                    background: var(--bg-light);
                    transition: var(--transition);
                }

                .section-header.clickable {
                    cursor: pointer;
                }

                .section-header.clickable:hover {
                    background: var(--current-role-light);
                }

                .section-title-group {
                    display: flex;
                    align-items: center;
                    gap: var(--space-3);
                    flex: 1;
                    min-width: 0;
                }

                .section-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: var(--border-radius);
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .section-text {
                    flex: 1;
                    min-width: 0;
                }

                .section-title {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                    line-height: 1.3;
                }

                .section-subtitle {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                    line-height: 1.4;
                }

                .section-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    flex-shrink: 0;
                }

                .custom-actions {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                }

                .collapse-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius);
                    background: var(--bg-white);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: var(--transition);
                }

                .collapse-button:hover {
                    border-color: var(--current-role-primary);
                    color: var(--current-role-primary);
                    background: var(--current-role-light);
                }

                .section-content {
                    transition: all 0.3s ease;
                    overflow: hidden;
                }

                .section-content.visible {
                    max-height: none;
                    opacity: 1;
                }

                .section-content.hidden {
                    max-height: 0;
                    opacity: 0;
                }

                .profile-section.collapsed .section-header {
                    border-bottom: none;
                }

                .section-body {
                    padding: var(--space-5);
                }

                .section-loading,
                .section-error {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-2);
                    padding: var(--space-8);
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .section-error {
                    color: var(--danger-color);
                }

                .loading-spinner i {
                    color: var(--current-role-primary);
                }

                .error-icon i {
                    color: var(--danger-color);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .section-header {
                        padding: var(--space-3) var(--space-4);
                    }

                    .section-body {
                        padding: var(--space-4);
                    }

                    .section-title-group {
                        gap: var(--space-2);
                    }

                    .section-icon {
                        width: 36px;
                        height: 36px;
                        font-size: var(--text-base);
                    }

                    .section-title {
                        font-size: var(--text-base);
                    }

                    .section-subtitle {
                        font-size: var(--text-xs);
                    }
                }

                @media (max-width: 576px) {
                    .section-header {
                        padding: var(--space-3);
                    }

                    .section-body {
                        padding: var(--space-3);
                    }

                    .section-title-group {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: var(--space-2);
                    }

                    .section-icon {
                        align-self: center;
                    }

                    .section-text {
                        text-align: center;
                    }
                }

                /* Focus states for accessibility */
                .collapse-button:focus {
                    outline: 2px solid var(--current-role-primary);
                    outline-offset: 2px;
                }

                .collapse-button:focus:not(:focus-visible) {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default ProfileSection;
