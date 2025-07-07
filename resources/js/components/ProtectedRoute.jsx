import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
    children,
    allowedRoles = [],
    requireAuth = true,
}) => {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div
                        className="spinner-border text-primary mb-3"
                        style={{ width: "3rem", height: "3rem" }}
                    >
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <h5 className="text-muted">Loading...</h5>
                    <p className="text-muted small">
                        Please wait while we verify your credentials
                    </p>
                </div>
            </div>
        );
    }

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
            // Redirect to appropriate dashboard based on user's actual role
            const redirectPath = getUserDashboardPath(user.role);
            return <Navigate to={redirectPath} replace />;
        }
    }

    // If user is authenticated but trying to access auth pages (login/register), redirect to dashboard
    if (
        isAuthenticated &&
        (location.pathname === "/login" || location.pathname === "/register")
    ) {
        const redirectPath = getUserDashboardPath(user.role);
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

// Helper function to get dashboard path based on user role
const getUserDashboardPath = (role) => {
    switch (role) {
        case "client":
            return "/client/dashboard";
        case "service_provider":
            return "/provider/dashboard";
        case "admin":
            return "/admin/dashboard";
        case "staff":
            return "/staff/dashboard";
        default:
            return "/";
    }
};

export default ProtectedRoute;
