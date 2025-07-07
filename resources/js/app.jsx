import React from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ClientDashboard from "./components/dashboard/ClientDashboard";
import "./bootstrap";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={["client"]}>
                                <ClientDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/provider/dashboard"
                        element={
                            <ProtectedRoute roles={["service_provider"]}>
                                <ServiceProviderDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/staff/dashboard"
                        element={
                            <ProtectedRoute roles={["staff"]}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

// Placeholder components for other dashboards
const ServiceProviderDashboard = () => (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
            <h1 className="h2 fw-bold text-dark mb-4">
                Service Provider Dashboard
            </h1>
            <p className="text-muted">
                Welcome to your service provider dashboard!
            </p>
        </div>
    </div>
);

const AdminDashboard = () => (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
            <h1 className="h2 fw-bold text-dark mb-4">Admin Dashboard</h1>
            <p className="text-muted">Welcome to the admin dashboard!</p>
        </div>
    </div>
);

const StaffDashboard = () => (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
            <h1 className="h2 fw-bold text-dark mb-4">Staff Dashboard</h1>
            <p className="text-muted">Welcome to the staff dashboard!</p>
        </div>
    </div>
);

const NotFound = () => (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center">
        <div className="text-center">
            <div
                className="mx-auto d-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle"
                style={{ height: "48px", width: "48px" }}
            >
                <svg
                    className="text-danger"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                </svg>
            </div>
            <h1 className="mt-2 display-4 fw-bold text-dark">404</h1>
            <p className="mt-2 fs-5 text-muted">Page not found</p>
            <div className="mt-4">
                <a href="/" className="btn btn-primary">
                    Go back home
                </a>
            </div>
        </div>
    </div>
);

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
