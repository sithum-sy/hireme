import React from "react";

const DemoButtons = ({ onDemoLogin }) => {
    const demoAccounts = [
        {
            type: "client",
            email: "client@hireme.com",
            password: "password123",
            label: "Demo Client",
            description: "Browse and book services",
            icon: "fas fa-user",
            color: "primary",
        },
        {
            type: "provider",
            email: "provider@hireme.com",
            password: "password123",
            label: "Demo Provider",
            description: "Manage services and quotes",
            icon: "fas fa-briefcase",
            color: "success",
        },
    ];

    return (
        <div className="mt-4">
            <div className="card border-0 bg-light">
                <div className="card-body p-4">
                    <h6 className="card-title text-center text-muted mb-3 fw-semibold">
                        <i className="fas fa-play-circle me-2"></i>
                        Try Demo Accounts
                    </h6>
                    <div className="row g-3">
                        {demoAccounts.map((account) => (
                            <div key={account.type} className="col-12 col-sm-6">
                                <button
                                    type="button"
                                    onClick={() =>
                                        onDemoLogin(
                                            account.email,
                                            account.password
                                        )
                                    }
                                    className="btn btn-white border w-100 text-start p-3 demo-btn"
                                    style={{ transition: "all 0.2s ease" }}
                                >
                                    <div className="d-flex align-items-center">
                                        <div
                                            className={`rounded-circle d-flex align-items-center justify-content-center me-3 text-${account.color}`}
                                            style={{
                                                width: "40px",
                                                height: "40px",
                                                backgroundColor: `var(--bs-${account.color}-subtle)`,
                                            }}
                                        >
                                            <i className={account.icon}></i>
                                        </div>
                                        <div>
                                            <div className="fw-semibold text-dark">
                                                {account.label}
                                            </div>
                                            <small className="text-muted">
                                                {account.description}
                                            </small>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoButtons;
