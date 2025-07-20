import React, { useState } from "react";
import { useProfile } from "../../../context/ProfileContext";
import { useAuth } from "../../../context/AuthContext";
import ProfileSection from "../shared/ProfileSection";

const StaffPermissionsSection = ({ onSuccess, onError }) => {
    const { user } = useAuth();
    const { profile } = useProfile();

    // Mock staff permissions - replace with actual data
    const staffPermissions = {
        categories: {
            create: true,
            read: true,
            update: true,
            delete: false,
        },
        users: {
            create: false,
            read: true,
            update: true,
            delete: false,
        },
        services: {
            create: false,
            read: true,
            update: true,
            delete: false,
        },
        support: {
            create: true,
            read: true,
            update: true,
            delete: false,
        },
    };

    const renderPermissionsGrid = () => (
        <div className="permissions-grid">
            {Object.entries(staffPermissions).map(([module, permissions]) => (
                <div key={module} className="permission-module">
                    <div className="module-header">
                        <h6>
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                        </h6>
                    </div>
                    <div className="permission-items">
                        {Object.entries(permissions).map(
                            ([action, allowed]) => (
                                <div key={action} className="permission-item">
                                    <span className="permission-action">
                                        {action.toUpperCase()}
                                    </span>
                                    <span
                                        className={`permission-status ${
                                            allowed ? "allowed" : "denied"
                                        }`}
                                    >
                                        <i
                                            className={`fas fa-${
                                                allowed ? "check" : "times"
                                            }`}
                                        ></i>
                                        {allowed ? "Allowed" : "Denied"}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <ProfileSection
            title="Staff Permissions"
            subtitle="View your current system permissions and access levels"
            icon="fas fa-user-shield"
        >
            <div className="staff-permissions-view">
                <div className="permissions-overview">
                    <div className="overview-header">
                        <h5>Access Summary</h5>
                        <p>
                            Your current permission level allows you to manage
                            content and support customers
                        </p>
                    </div>

                    <div className="access-stats">
                        <div className="stat-card">
                            <div className="stat-number">12</div>
                            <div className="stat-label">Total Permissions</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">8</div>
                            <div className="stat-label">Granted</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">4</div>
                            <div className="stat-label">Restricted</div>
                        </div>
                    </div>
                </div>

                {renderPermissionsGrid()}

                <div className="permissions-note">
                    <div className="note-icon">
                        <i className="fas fa-info-circle"></i>
                    </div>
                    <div className="note-content">
                        <h6>Need Additional Permissions?</h6>
                        <p>
                            If you need access to additional features, please
                            contact your system administrator.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .staff-permissions-view {
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-6);
                }

                .permissions-overview {
                    background: var(--bg-light);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    padding: var(--space-4);
                }

                .overview-header {
                    margin-bottom: var(--space-4);
                }

                .overview-header h5 {
                    margin: 0 0 var(--space-1) 0;
                    color: var(--text-primary);
                    font-size: var(--text-lg);
                    font-weight: var(--font-semibold);
                }

                .overview-header p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: var(--text-sm);
                }

                .access-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: var(--space-3);
                }

                .stat-card {
                    background: var(--bg-white);
                    padding: var(--space-3);
                    border-radius: var(--border-radius);
                    text-align: center;
                    border: 1px solid var(--border-color);
                }

                .stat-number {
                    font-size: var(--text-2xl);
                    font-weight: var(--font-bold);
                    color: var(--current-role-primary);
                    margin-bottom: var(--space-1);
                }

                .stat-label {
                    font-size: var(--text-xs);
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .permissions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: var(--space-4);
                }

                .permission-module {
                    background: var(--bg-white);
                    border: 1px solid var(--border-color);
                    border-radius: var(--border-radius-lg);
                    overflow: hidden;
                }

                .module-header {
                    background: var(--current-role-light);
                    color: var(--current-role-primary);
                    padding: var(--space-3) var(--space-4);
                    border-bottom: 1px solid var(--border-color);
                }

                .module-header h6 {
                    margin: 0;
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .permission-items {
                    padding: var(--space-3);
                    display: flex;
                    flex-direction: column;
                    gap: var(--space-2);
                }

                .permission-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: var(--space-2);
                    background: var(--bg-light);
                    border-radius: var(--border-radius);
                }

                .permission-action {
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    color: var(--text-primary);
                }

                .permission-status {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                    font-size: var(--text-xs);
                    font-weight: var(--font-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .permission-status.allowed {
                    color: var(--success-color);
                }

                .permission-status.denied {
                    color: var(--danger-color);
                }

                .permissions-note {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-3);
                    background: var(--info-color);
                    color: white;
                    padding: var(--space-4);
                    border-radius: var(--border-radius-lg);
                }

                .note-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: var(--text-lg);
                    flex-shrink: 0;
                }

                .note-content h6 {
                    margin: 0 0 var(--space-1) 0;
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                }

                .note-content p {
                    margin: 0;
                    font-size: var(--text-sm);
                    opacity: 0.9;
                }

                /* Mobile responsive */
                @media (max-width: 768px) {
                    .permissions-grid {
                        grid-template-columns: 1fr;
                    }

                    .access-stats {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .permissions-note {
                        flex-direction: column;
                        text-align: center;
                    }
                }
            `}</style>
        </ProfileSection>
    );
};

export default StaffPermissionsSection;
