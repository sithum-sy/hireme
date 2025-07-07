import React from "react";
import { createRoot } from "react-dom/client";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import "./bootstrap.js"; // Bootstrap JS & Popper
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ClientDashboard from "./pages/client/Dashboard";

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Auth Routes (redirect to dashboard if already logged in) */}
                    <Route
                        path="/register"
                        element={
                            <ProtectedRoute requireAuth={false}>
                                <Register />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <ProtectedRoute requireAuth={false}>
                                <Login />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Client Routes */}
                    <Route
                        path="/client/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <ClientDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Provider Routes (placeholder) */}
                    <Route
                        path="/provider/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["service_provider"]}>
                                <div className="container py-5 text-center">
                                    <h2>Service Provider Dashboard</h2>
                                    <p>Coming soon...</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    {/* Protected Admin Routes (placeholder) */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <div className="container py-5 text-center">
                                    <h2>Admin Dashboard</h2>
                                    <p>Coming soon...</p>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    {/* 404 Route */}
                    <Route
                        path="*"
                        element={
                            <div className="container py-5 text-center">
                                <h1>404 - Page Not Found</h1>
                                <p>
                                    The page you're looking for doesn't exist.
                                </p>
                            </div>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
