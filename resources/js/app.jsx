import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ServicesProvider } from "./context/ServicesContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";

// Provider Pages
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderServices from "./pages/provider/Services";
import ServiceForm from "./pages/provider/ServiceForm";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffList from "./pages/admin/staff/StaffList";
import CreateStaff from "./pages/admin/staff/CreateStaff";

// Import Bootstrap
import "./bootstrap";

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

                    {/* ===== CLIENT ROUTES ===== */}
                    {/* Main Dashboard */}
                    <Route
                        path="/client/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <ClientDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Browse Services */}
                    <Route
                        path="/client/services"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h2 className="fw-bold">
                                                        Browse Services
                                                    </h2>
                                                    <button className="btn btn-primary">
                                                        <i className="fas fa-filter me-2"></i>
                                                        Filter
                                                    </button>
                                                </div>
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body text-center py-5">
                                                        <i className="fas fa-search fa-4x text-muted mb-3"></i>
                                                        <h4>
                                                            Service browsing
                                                            functionality coming
                                                            soon
                                                        </h4>
                                                        <p className="text-muted">
                                                            We're working on
                                                            building an amazing
                                                            service discovery
                                                            experience for you.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Service Booking by Category */}
                    <Route
                        path="/client/book/:category"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <h2 className="fw-bold mb-4">
                                            Book Service
                                        </h2>
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body text-center py-5">
                                                <i className="fas fa-calendar-plus fa-4x text-primary mb-3"></i>
                                                <h4>
                                                    Service booking coming soon
                                                </h4>
                                                <p className="text-muted">
                                                    Quick booking functionality
                                                    is under development.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* My Appointments */}
                    <Route
                        path="/client/appointments"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h2 className="fw-bold">
                                                My Appointments
                                            </h2>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-outline-secondary">
                                                    <i className="fas fa-calendar me-2"></i>
                                                    Calendar View
                                                </button>
                                                <button className="btn btn-primary">
                                                    <i className="fas fa-plus me-2"></i>
                                                    Book New
                                                </button>
                                            </div>
                                        </div>

                                        {/* Appointment Tabs */}
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-header bg-white">
                                                <ul className="nav nav-tabs card-header-tabs">
                                                    <li className="nav-item">
                                                        <button className="nav-link active">
                                                            Upcoming
                                                        </button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button className="nav-link">
                                                            Completed
                                                        </button>
                                                    </li>
                                                    <li className="nav-item">
                                                        <button className="nav-link">
                                                            Cancelled
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="card-body text-center py-5">
                                                <i className="fas fa-calendar-check fa-4x text-muted mb-3"></i>
                                                <h4>
                                                    Appointment management
                                                    coming soon
                                                </h4>
                                                <p className="text-muted">
                                                    Full appointment tracking
                                                    and management features are
                                                    being developed.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Notifications */}
                    <Route
                        path="/client/notifications"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h2 className="fw-bold">
                                                Notifications
                                            </h2>
                                            <button className="btn btn-outline-secondary">
                                                <i className="fas fa-check-double me-2"></i>
                                                Mark All Read
                                            </button>
                                        </div>

                                        <div className="row">
                                            <div className="col-lg-8">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body">
                                                        {/* Sample Notifications */}
                                                        <div className="notification-item border-bottom py-3">
                                                            <div className="d-flex">
                                                                <div className="notification-icon me-3">
                                                                    <i className="fas fa-check-circle text-success fa-lg"></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="fw-semibold mb-1">
                                                                        Appointment
                                                                        Confirmed
                                                                    </h6>
                                                                    <p className="text-muted mb-1">
                                                                        Your
                                                                        cleaning
                                                                        service
                                                                        appointment
                                                                        has been
                                                                        confirmed
                                                                        for
                                                                        tomorrow
                                                                        at 10:00
                                                                        AM.
                                                                    </p>
                                                                    <small className="text-muted">
                                                                        2 hours
                                                                        ago
                                                                    </small>
                                                                </div>
                                                                <div className="notification-actions">
                                                                    <button className="btn btn-sm btn-outline-primary">
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="notification-item border-bottom py-3">
                                                            <div className="d-flex">
                                                                <div className="notification-icon me-3">
                                                                    <i className="fas fa-star text-warning fa-lg"></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <h6 className="fw-semibold mb-1">
                                                                        Please
                                                                        Rate
                                                                        Your
                                                                        Service
                                                                    </h6>
                                                                    <p className="text-muted mb-1">
                                                                        How was
                                                                        your
                                                                        recent
                                                                        tutoring
                                                                        session
                                                                        with
                                                                        Sarah
                                                                        Johnson?
                                                                    </p>
                                                                    <small className="text-muted">
                                                                        1 day
                                                                        ago
                                                                    </small>
                                                                </div>
                                                                <div className="notification-actions">
                                                                    <button className="btn btn-sm btn-outline-warning">
                                                                        Rate Now
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-center py-4">
                                                            <p className="text-muted">
                                                                More
                                                                notification
                                                                features coming
                                                                soon!
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-4">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-header bg-white">
                                                        <h6 className="fw-bold mb-0">
                                                            Notification
                                                            Settings
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="form-check mb-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="emailNotif"
                                                                defaultChecked
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor="emailNotif"
                                                            >
                                                                Email
                                                                notifications
                                                            </label>
                                                        </div>
                                                        <div className="form-check mb-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="smsNotif"
                                                                defaultChecked
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor="smsNotif"
                                                            >
                                                                SMS
                                                                notifications
                                                            </label>
                                                        </div>
                                                        <div className="form-check mb-3">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id="pushNotif"
                                                                defaultChecked
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor="pushNotif"
                                                            >
                                                                Push
                                                                notifications
                                                            </label>
                                                        </div>
                                                        <button className="btn btn-primary btn-sm w-100">
                                                            Save Preferences
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Account Settings */}
                    <Route
                        path="/client/settings"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <h2 className="fw-bold mb-4">
                                            Account Settings
                                        </h2>

                                        <div className="row">
                                            <div className="col-lg-3">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body">
                                                        <div className="list-group list-group-flush">
                                                            <button className="list-group-item list-group-item-action active">
                                                                <i className="fas fa-user me-2"></i>
                                                                Profile
                                                            </button>
                                                            <button className="list-group-item list-group-item-action">
                                                                <i className="fas fa-lock me-2"></i>
                                                                Security
                                                            </button>
                                                            <button className="list-group-item list-group-item-action">
                                                                <i className="fas fa-bell me-2"></i>
                                                                Notifications
                                                            </button>
                                                            <button className="list-group-item list-group-item-action">
                                                                <i className="fas fa-credit-card me-2"></i>
                                                                Payment
                                                            </button>
                                                            <button className="list-group-item list-group-item-action">
                                                                <i className="fas fa-shield-alt me-2"></i>
                                                                Privacy
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-lg-9">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body text-center py-5">
                                                        <i className="fas fa-cog fa-4x text-muted mb-3"></i>
                                                        <h4>
                                                            Settings panel
                                                            coming soon
                                                        </h4>
                                                        <p className="text-muted">
                                                            Comprehensive
                                                            account management
                                                            features are being
                                                            developed.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Additional Client Routes */}
                    <Route
                        path="/client/profile"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <h2 className="fw-bold mb-4">
                                            My Profile
                                        </h2>
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body text-center py-5">
                                                <i className="fas fa-user-edit fa-4x text-muted mb-3"></i>
                                                <h4>
                                                    Profile management coming
                                                    soon
                                                </h4>
                                                <p className="text-muted">
                                                    Edit your profile
                                                    information and preferences.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/client/reviews"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <h2 className="fw-bold mb-4">
                                            Reviews & Ratings
                                        </h2>
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body text-center py-5">
                                                <i className="fas fa-star fa-4x text-warning mb-3"></i>
                                                <h4>
                                                    Review system coming soon
                                                </h4>
                                                <p className="text-muted">
                                                    Rate and review your service
                                                    providers.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/client/support"
                        element={
                            <ProtectedRoute allowedRoles={["client"]}>
                                <DashboardLayout>
                                    <div className="container-fluid">
                                        <h2 className="fw-bold mb-4">
                                            Help & Support
                                        </h2>
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body text-center py-5">
                                                        <i className="fas fa-headset fa-4x text-info mb-3"></i>
                                                        <h4>
                                                            Support system
                                                            coming soon
                                                        </h4>
                                                        <p className="text-muted">
                                                            Get help and contact
                                                            our support team.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-header bg-white">
                                                        <h6 className="fw-bold mb-0">
                                                            Quick Help
                                                        </h6>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="d-grid gap-2">
                                                            <button className="btn btn-outline-primary">
                                                                FAQ
                                                            </button>
                                                            <button className="btn btn-outline-primary">
                                                                Live Chat
                                                            </button>
                                                            <button className="btn btn-outline-primary">
                                                                Contact Us
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DashboardLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== SERVICE PROVIDER ROUTES ===== */}
                    <Route
                        path="/provider/dashboard"
                        element={
                            <ServicesProvider>
                                <ProtectedRoute
                                    allowedRoles={["service_provider"]}
                                >
                                    <ProviderDashboard />
                                </ProtectedRoute>
                            </ServicesProvider>
                        }
                    />

                    <Route
                        path="/provider/services"
                        element={
                            <ServicesProvider>
                                <ProtectedRoute
                                    allowedRoles={["service_provider"]}
                                >
                                    <ProviderServices />
                                </ProtectedRoute>
                            </ServicesProvider>
                        }
                    />

                    <Route
                        path="/provider/services/create"
                        element={
                            <ServicesProvider>
                                <ProtectedRoute
                                    allowedRoles={["service_provider"]}
                                >
                                    <ServiceForm />
                                </ProtectedRoute>
                            </ServicesProvider>
                        }
                    />

                    <Route
                        path="/provider/services/:id/edit"
                        element={
                            <ServicesProvider>
                                <ProtectedRoute
                                    allowedRoles={["service_provider"]}
                                >
                                    <ServiceForm />
                                </ProtectedRoute>
                            </ServicesProvider>
                        }
                    />

                    {/* ===== ADMIN ROUTES ===== */}
                    <Route
                        path="/admin/*"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminProvider>
                                    <Routes>
                                        {/* Admin Dashboard */}
                                        <Route
                                            path="dashboard"
                                            element={<AdminDashboard />}
                                        />

                                        {/* Staff Management Routes */}
                                        <Route
                                            path="staff"
                                            element={<StaffList />}
                                        />

                                        <Route
                                            path="staff/create"
                                            element={<CreateStaff />}
                                        />

                                        {/* User Management Routes */}
                                        <Route
                                            path="users"
                                            element={
                                                <div className="container py-5 text-center">
                                                    <h2>User Management</h2>
                                                    <p className="lead">
                                                        Coming in Phase 4...
                                                    </p>
                                                    <div className="card mt-4">
                                                        <div className="card-body">
                                                            <i className="fas fa-users fa-4x text-info mb-3"></i>
                                                            <h4>
                                                                User Management
                                                                Interface
                                                            </h4>
                                                            <p className="text-muted">
                                                                Manage clients
                                                                and service
                                                                providers.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />

                                        {/* Reports Routes */}
                                        <Route
                                            path="reports/*"
                                            element={
                                                <div className="container py-5 text-center">
                                                    <h2>Reports & Analytics</h2>
                                                    <p className="lead">
                                                        Coming in Phase 5...
                                                    </p>
                                                    <div className="card mt-4">
                                                        <div className="card-body">
                                                            <i className="fas fa-chart-bar fa-4x text-success mb-3"></i>
                                                            <h4>
                                                                Reporting
                                                                Dashboard
                                                            </h4>
                                                            <p className="text-muted">
                                                                Comprehensive
                                                                analytics and
                                                                reports.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />

                                        {/* Settings Routes */}
                                        <Route
                                            path="settings"
                                            element={
                                                <div className="container py-5 text-center">
                                                    <h2>System Settings</h2>
                                                    <p className="lead">
                                                        Coming soon...
                                                    </p>
                                                    <div className="card mt-4">
                                                        <div className="card-body">
                                                            <i className="fas fa-cogs fa-4x text-warning mb-3"></i>
                                                            <h4>
                                                                System
                                                                Configuration
                                                            </h4>
                                                            <p className="text-muted">
                                                                Configure system
                                                                settings and
                                                                preferences.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />

                                        {/* Default Admin Route - Redirect to Dashboard */}
                                        <Route
                                            path="*"
                                            element={<AdminDashboard />}
                                        />
                                    </Routes>
                                </AdminProvider>
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== STAFF ROUTES ===== */}
                    <Route
                        path="/staff/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={["staff"]}>
                                <div className="container py-5 text-center">
                                    <h2>Staff Dashboard</h2>
                                    <p className="lead">Coming soon...</p>
                                    <div className="card mt-4">
                                        <div className="card-body">
                                            <i className="fas fa-users fa-4x text-info mb-3"></i>
                                            <h4>
                                                Staff Portal Under Development
                                            </h4>
                                            <p className="text-muted">
                                                Support tools and customer
                                                management.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== ERROR ROUTES ===== */}
                    {/* 404 Route */}
                    <Route
                        path="*"
                        element={
                            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                                <div className="text-center">
                                    <div
                                        className="card shadow-lg border-0"
                                        style={{ maxWidth: "500px" }}
                                    >
                                        <div className="card-body py-5">
                                            <i className="fas fa-exclamation-triangle fa-4x text-warning mb-4"></i>
                                            <h1 className="display-4 fw-bold text-dark">
                                                404
                                            </h1>
                                            <h4 className="mb-3">
                                                Page Not Found
                                            </h4>
                                            <p className="text-muted mb-4">
                                                The page you're looking for
                                                doesn't exist or has been moved.
                                            </p>
                                            <div className="d-flex gap-2 justify-content-center">
                                                <button
                                                    onClick={() =>
                                                        window.history.back()
                                                    }
                                                    className="btn btn-outline-secondary"
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Go Back
                                                </button>
                                                <a
                                                    href="/"
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-home me-2"></i>
                                                    Go Home
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
