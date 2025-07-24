import React from "react";

const QuickFilterTabs = ({ activeFilter, onFilterChange, appointmentCounts = {} }) => {
    const filterOptions = [
        {
            key: 'today',
            label: 'Today',
            icon: 'fas fa-calendar-day',
            description: 'Today\'s appointments',
            count: appointmentCounts.today || 0
        },
        {
            key: 'upcoming',
            label: 'Upcoming',
            icon: 'fas fa-calendar-plus',
            description: 'Future appointments',
            count: appointmentCounts.upcoming || 0
        },
        {
            key: 'completed',
            label: 'Completed',
            icon: 'fas fa-check-circle',
            description: 'Finished appointments',
            count: appointmentCounts.completed || 0
        },
        {
            key: 'cancelled',
            label: 'Cancelled',
            icon: 'fas fa-times-circle',
            description: 'Cancelled appointments',
            count: appointmentCounts.cancelled || 0
        },
        {
            key: 'all',
            label: 'All',
            icon: 'fas fa-list',
            description: 'All appointments',
            count: appointmentCounts.total || 0
        }
    ];

    return (
        <div className="quick-filter-tabs">
            <div className="tabs-header">
                <h4>Filter Appointments</h4>
                <p>Quick access to different appointment views</p>
            </div>
            
            <div className="tabs-container">
                {filterOptions.map((option) => (
                    <button
                        key={option.key}
                        className={`filter-tab ${activeFilter === option.key ? 'active' : ''}`}
                        onClick={() => onFilterChange(option.key)}
                        title={option.description}
                    >
                        <div className="tab-icon">
                            <i className={option.icon}></i>
                        </div>
                        <div className="tab-content">
                            <span className="tab-label">{option.label}</span>
                            {option.count > 0 && (
                                <span className="tab-count">{option.count}</span>
                            )}
                        </div>
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
                }

                .filter-tab {
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
                }

                .filter-tab:hover {
                    border-color: var(--current-role-primary);
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }

                .filter-tab.active {
                    border-color: var(--current-role-primary);
                    background: var(--current-role-primary);
                    color: white;
                    box-shadow: var(--shadow-md);
                }

                .filter-tab.active .tab-count {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
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
                    background: var(--current-role-primary);
                    color: white;
                    border-radius: 10px;
                    font-size: var(--text-xs);
                    font-weight: var(--font-bold);
                }

                .filter-tab:hover .tab-count {
                    background: var(--current-role-secondary);
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