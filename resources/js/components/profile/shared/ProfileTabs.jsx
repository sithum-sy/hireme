import React from "react";
import { sectionConfig } from "../../../../config/profileConfig.js";

const ProfileTabs = ({
    activeTab,
    onTabChange,
    availableSections,
    className = "",
}) => {
    if (!availableSections || availableSections.length === 0) {
        return null;
    }

    return (
        <div className={`profile-tabs ${className}`}>
            <div className="tabs-container">
                {availableSections.map((section) => {
                    const config = sectionConfig[section];
                    if (!config) return null;

                    return (
                        <button
                            key={section}
                            className={`tab-button ${
                                activeTab === section ? "active" : ""
                            }`}
                            onClick={() => onTabChange(section)}
                            type="button"
                        >
                            <i className={config.icon}></i>
                            <span className="tab-label">{config.label}</span>
                            <span className="tab-description">
                                {config.description}
                            </span>
                        </button>
                    );
                })}
            </div>

            <style jsx>{`
                .profile-tabs {
                    margin-bottom: var(--space-6);
                }

                .tabs-container {
                    display: flex;
                    gap: var(--space-2);
                    border-bottom: 2px solid var(--border-color);
                    overflow-x: auto;
                    padding-bottom: var(--space-1);
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }

                .tabs-container::-webkit-scrollbar {
                    display: none;
                }

                .tab-button {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    background: transparent;
                    color: var(--text-secondary);
                    font-weight: var(--font-medium);
                    border-radius: var(--border-radius) var(--border-radius) 0 0;
                    transition: var(--transition);
                    cursor: pointer;
                    white-space: nowrap;
                    min-width: 120px;
                    position: relative;
                    text-align: center;
                }

                .tab-button:hover {
                    color: var(--current-role-primary);
                    background: var(--current-role-light);
                    transform: translateY(-2px);
                }

                .tab-button.active {
                    color: var(--current-role-primary);
                    background: var(--current-role-light);
                    border-bottom: 2px solid var(--current-role-primary);
                    margin-bottom: -2px;
                }

                .tab-button.active::before {
                    content: "";
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--current-role-primary);
                    border-radius: 1px;
                }

                .tab-button i {
                    font-size: var(--text-lg);
                    margin-bottom: var(--space-1);
                    transition: var(--transition);
                }

                .tab-button:hover i,
                .tab-button.active i {
                    transform: scale(1.1);
                }

                .tab-label {
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    margin-bottom: var(--space-1);
                }

                .tab-description {
                    font-size: var(--text-xs);
                    color: var(--text-muted);
                    line-height: 1.3;
                    display: none;
                }

                /* Show descriptions on larger screens */
                @media (min-width: 1024px) {
                    .tab-description {
                        display: block;
                        white-space: normal;
                        overflow-wrap: break-word;
                        word-break: break-word;
                        max-width: 100%;
                        text-align: center;
                        /* Force two lines if overflow */
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }

                    .tab-button {
                        min-width: 140px;
                        padding: var(--space-4);
                    }
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .tabs-container {
                        gap: var(--space-1);
                    }

                    .tab-button {
                        min-width: 80px;
                        padding: var(--space-2) var(--space-3);
                    }

                    .tab-label {
                        display: none;
                    }

                    .tab-button i {
                        font-size: var(--text-xl);
                        margin-bottom: 0;
                    }

                    /* Show tooltip on mobile */
                    .tab-button {
                        position: relative;
                    }

                    .tab-button:hover::after {
                        content: attr(title);
                        position: absolute;
                        bottom: -2rem;
                        left: 50%;
                        transform: translateX(-50%);
                        background: var(--text-primary);
                        color: white;
                        padding: var(--space-1) var(--space-2);
                        border-radius: var(--border-radius);
                        font-size: var(--text-xs);
                        white-space: nowrap;
                        z-index: 1000;
                    }
                }

                @media (max-width: 576px) {
                    .tab-button {
                        min-width: 60px;
                        padding: var(--space-2);
                    }
                }

                /* Loading state */
                .tab-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .tab-button:disabled:hover {
                    transform: none;
                    background: transparent;
                    color: var(--text-secondary);
                }

                /* Focus states for accessibility */
                .tab-button:focus {
                    outline: 2px solid var(--current-role-primary);
                    outline-offset: 2px;
                }

                .tab-button:focus:not(:focus-visible) {
                    outline: none;
                }
            `}</style>
        </div>
    );
};

export default ProfileTabs;
