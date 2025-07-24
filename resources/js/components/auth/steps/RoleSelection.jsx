import React from "react";
import RoleCard from "../../ui/RoleCard";

const RoleSelection = ({ selectedRole, onRoleSelect, error }) => {
    const roles = [
        {
            value: "client",
            title: "I need services",
            icon: "fas fa-user",
            color: "primary",
        },
        {
            value: "service_provider",
            title: "I provide services",
            icon: "fas fa-briefcase",
            color: "success",
        },
    ];

    return (
        <div className="role-selection">
            <div className="step-header">
                <h2 className="step-title">How do you plan to use HireMe?</h2>
                <p className="step-subtitle">
                    Choose the option that best describes you
                </p>
            </div>

            <div className="roles-grid">
                {roles.map((role) => (
                    <RoleCard
                        key={role.value}
                        value={role.value}
                        title={role.title}
                        icon={role.icon}
                        color={role.color}
                        selected={selectedRole === role.value}
                        onClick={onRoleSelect}
                    />
                ))}
            </div>

            {error && (
                <div className="error-alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            )}

            <style jsx>{`
                .role-selection {
                    animation: fadeInUp 0.6s ease-out;
                }

                .step-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .step-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .step-subtitle {
                    color: var(--text-secondary);
                    font-size: 1rem;
                    margin: 0;
                }

                .roles-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .error-alert {
                    background: rgba(220, 38, 38, 0.1);
                    border: 1px solid #fecaca;
                    color: var(--danger-color);
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    font-size: 0.9rem;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 576px) {
                    .roles-grid {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .step-title {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoleSelection;
