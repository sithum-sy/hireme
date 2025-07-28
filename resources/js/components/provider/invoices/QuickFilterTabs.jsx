import React from "react";

const QuickFilterTabs = ({
    activeFilter,
    onFilterChange,
    invoiceCounts = {},
}) => {
    const filterOptions = [
        {
            key: "recent",
            label: "Recent",
            icon: "fas fa-clock",
            description: "Last 30 days",
            count: invoiceCounts.recent || 0,
            color: "info",
        },
        {
            key: "draft",
            label: "Draft",
            icon: "fas fa-edit",
            description: "Draft invoices",
            count: invoiceCounts.draft || 0,
            color: "secondary",
        },
        {
            key: "sent",
            label: "Sent",
            icon: "fas fa-paper-plane",
            description: "Sent to clients",
            count: invoiceCounts.sent || 0,
            color: "info",
        },
        {
            key: "paid",
            label: "Paid",
            icon: "fas fa-check-circle",
            description: "Paid invoices",
            count: invoiceCounts.paid || 0,
            color: "success",
        },
        {
            key: "overdue",
            label: "Overdue",
            icon: "fas fa-exclamation-triangle",
            description: "Overdue payments",
            count: invoiceCounts.overdue || 0,
            color: "danger",
        },
        {
            key: "all",
            label: "All",
            icon: "fas fa-list",
            description: "All invoices",
            count: invoiceCounts.total || 0,
            color: "primary",
        },
    ];

    return (
        <div className="quick-filter-tabs">
            <div className="tabs-header">
                <h4>Filter Invoices</h4>
                <p>Quick access to different invoice views</p>
            </div>

            <div className="tabs-container">
                {filterOptions.map((option) => (
                    <button
                        key={option.key}
                        className={`filter-tab ${
                            activeFilter === option.key ? "active" : ""
                        } ${option.color}`}
                        onClick={() => onFilterChange(option.key)}
                        title={option.description}
                    >
                        <div className="tab-icon">
                            <i className={option.icon}></i>
                        </div>
                        <div className="tab-content">
                            <span className="tab-label">{option.label}</span>
                            {option.count > 0 && (
                                <span className="tab-count">
                                    {option.count}
                                </span>
                            )}
                        </div>
                        {option.key === "overdue" &&
                            option.count > 0 && (
                                <div className="urgent-badge">Needs Action</div>
                            )}
                    </button>
                ))}
            </div>

            <style jsx>{`
                .quick-filter-tabs {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-5);
                    overflow: visible;
                    position: relative;
                }

                .tabs-header {
                    margin-bottom: var(--space-4);
                    text-align: center;
                }

                .tabs-header h4 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .tabs-header p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .tabs-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                    gap: var(--space-3);
                    overflow: visible;
                    position: relative;
                }

                .filter-tab {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-4);
                    background: var(--bg-light);
                    border: 2px solid var(--border-color);
                    border-radius: var(--border-radius);
                    cursor: pointer;
                    transition: var(--transition);
                    text-decoration: none;
                    color: var(--text-secondary);
                    z-index: 1;
                    overflow: visible;
                }

                .filter-tab:hover {
                    border-color: var(--orange);
                    background: var(--orange-light);
                    color: var(--orange);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                    z-index: 2;
                }

                .filter-tab.active {
                    border-color: var(--orange);
                    background: var(--orange);
                    color: white;
                    box-shadow: var(--shadow-md);
                    z-index: 3;
                }

                .filter-tab.active .tab-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .filter-tab.secondary:hover {
                    border-color: var(--secondary-color);
                    background: var(--secondary-light);
                    color: var(--secondary-color);
                }

                .filter-tab.secondary.active {
                    border-color: var(--secondary-color);
                    background: var(--secondary-color);
                    color: white;
                    z-index: 3;
                }

                .filter-tab.success:hover {
                    border-color: var(--success-color);
                    background: var(--success-light);
                    color: var(--success-color);
                    z-index: 2;
                }

                .filter-tab.success.active {
                    border-color: var(--success-color);
                    background: var(--success-color);
                    color: white;
                    z-index: 3;
                }

                .filter-tab.info:hover {
                    border-color: var(--info-color);
                    background: var(--info-light);
                    color: var(--info-color);
                    z-index: 2;
                }

                .filter-tab.info.active {
                    border-color: var(--info-color);
                    background: var(--info-color);
                    color: white;
                    z-index: 3;
                }

                .filter-tab.danger:hover {
                    border-color: var(--danger-color);
                    background: var(--danger-light);
                    color: var(--danger-color);
                    z-index: 2;
                }

                .filter-tab.danger.active {
                    border-color: var(--danger-color);
                    background: var(--danger-color);
                    color: white;
                    z-index: 3;
                }

                .filter-tab.primary:hover {
                    border-color: var(--primary-color);
                    background: var(--primary-light);
                    color: var(--primary-color);
                    z-index: 2;
                }

                .filter-tab.primary.active {
                    border-color: var(--primary-color);
                    background: var(--primary-color);
                    color: white;
                    z-index: 3;
                }

                .tab-icon {
                    font-size: var(--text-xl);
                }

                .tab-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--space-1);
                    text-align: center;
                }

                .tab-label {
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .tab-count {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 var(--space-2);
                    background: var(--orange);
                    color: white;
                    border-radius: 10px;
                    font-size: var(--text-xs);
                    font-weight: var(--font-bold);
                }

                .urgent-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--danger-color);
                    color: white;
                    font-size: var(--text-xs);
                    padding: 2px 6px;
                    border-radius: 10px;
                    font-weight: var(--font-bold);
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%,
                    100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .filter-tab:hover .tab-count {
                    background: var(--orange-dark);
                }

                .filter-tab.secondary:hover .tab-count {
                    background: var(--secondary-dark);
                }

                .filter-tab.success:hover .tab-count {
                    background: var(--success-dark);
                }

                .filter-tab.info:hover .tab-count {
                    background: var(--info-dark);
                }

                .filter-tab.danger:hover .tab-count {
                    background: var(--danger-dark);
                }

                .filter-tab.primary:hover .tab-count {
                    background: var(--primary-dark);
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .tabs-container {
                        grid-template-columns: repeat(3, 1fr);
                        gap: var(--space-2);
                    }

                    .filter-tab {
                        padding: var(--space-3);
                        gap: var(--space-1);
                    }

                    .tab-icon {
                        font-size: var(--text-lg);
                    }

                    .tab-label {
                        font-size: var(--text-xs);
                    }
                }

                @media (max-width: 576px) {
                    .tabs-container {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .tabs-header {
                        margin-bottom: var(--space-3);
                    }

                    .tabs-header h4 {
                        font-size: var(--text-base);
                    }

                    .tabs-header p {
                        font-size: var(--text-xs);
                    }
                }
            `}</style>
        </div>
    );
};

export default QuickFilterTabs;