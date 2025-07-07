import React from "react";
import { useAuth } from "../../context/AuthContext";

const ClientDashboard = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        // Redirect will be handled by ProtectedRoute
    };

    return (
        <div className="min-vh-100 bg-light">
            {/* Temporary Dashboard Header */}
            <div className="bg-white shadow-sm border-bottom">
                <div className="container-fluid">
                    <div className="row align-items-center py-3">
                        <div className="col">
                            <h4 className="mb-0 text-primary">
                                <i className="fas fa-handshake me-2"></i>
                                HireMe - Client Dashboard
                            </h4>
                        </div>
                        <div className="col-auto">
                            <div className="d-flex align-items-center gap-3">
                                <span className="text-muted">
                                    Welcome, {user?.first_name}!
                                </span>
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleLogout}
                                >
                                    <i className="fas fa-sign-out-alt me-1"></i>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Temporary Dashboard Content */}
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-12">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="fas fa-user-circle fa-5x text-primary mb-4"></i>
                                <h2 className="mb-3">
                                    Welcome to your Client Dashboard!
                                </h2>
                                <p className="lead text-muted mb-4">
                                    This is a temporary dashboard. The full
                                    dashboard will be built in Step 3.
                                </p>

                                {/* User Info Card */}
                                <div className="row justify-content-center">
                                    <div className="col-md-6">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h5 className="card-title">
                                                    Your Profile
                                                </h5>
                                                <p className="mb-1">
                                                    <strong>Name:</strong>{" "}
                                                    {user?.full_name}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Email:</strong>{" "}
                                                    {user?.email}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Role:</strong>{" "}
                                                    {user?.role}
                                                </p>
                                                <p className="mb-1">
                                                    <strong>Contact:</strong>{" "}
                                                    {user?.contact_number}
                                                </p>
                                                {user?.age && (
                                                    <p className="mb-0">
                                                        <strong>Age:</strong>{" "}
                                                        {user.age}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
