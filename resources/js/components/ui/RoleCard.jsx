import React from "react";

const RoleCard = ({
    value,
    title,
    icon,
    color = "primary",
    selected = false,
    onClick,
}) => {
    return (
        <div
            className={`role-card ${selected ? `selected ${color}` : ""}`}
            onClick={() => onClick(value)}
        >
            <div className="role-icon">
                <i className={`${icon} fa-2x`}></i>
            </div>
            <h6 className="role-title">{title}</h6>

            <style jsx>{`
                .role-card {
                    padding: 2rem 1.5rem;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: white;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .role-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
                    border-color: #d1d5db;
                }

                .role-card.selected {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(74, 144, 226, 0.2);
                }

                .role-card.selected.primary {
                    border-color: #4a90e2;
                    background: rgba(74, 144, 226, 0.05);
                }

                .role-card.selected.success {
                    border-color: #10b981;
                    background: rgba(16, 185, 129, 0.05);
                }

                .role-icon {
                    margin-bottom: 1rem;
                    color: #6b7280;
                    transition: color 0.2s ease;
                }

                .role-card.selected.primary .role-icon {
                    color: #4a90e2;
                }

                .role-card.selected.success .role-icon {
                    color: #10b981;
                }

                .role-title {
                    font-weight: 600;
                    color: #1a202c;
                    margin: 0;
                    font-size: 1rem;
                }

                @media (max-width: 576px) {
                    .role-card {
                        padding: 1.5rem 1rem;
                    }

                    .role-icon i {
                        font-size: 1.5rem !important;
                    }

                    .role-title {
                        font-size: 0.9rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default RoleCard;
