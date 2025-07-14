import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ServicesProvider } from "./context/ServicesContext";
import { StaffProvider } from "./context/StaffContext";
import { ProviderProvider } from "./context/ProviderContext";
import { ClientProvider } from "./context/ClientContext";
import { LocationProvider } from "./context/LocationContext";
import { DynamicAreasProvider } from "./context/DynamicAreasContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";
import "react-toastify/dist/ReactToastify.css";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ServicesBrowse from "./pages/client/services/ServicesBrowse";
import ServiceSearch from "./pages/client/services/ServiceSearch";
import ServiceDetail from "./pages/client/services/ServiceDetail";
import QuotesList from "./pages/client/quotes/QuotesList";
import AppointmentsList from "./pages/client/bookings/AppointmentsList";
import AppointmentDetail from "./pages/client/bookings/AppointmentDetail";

// Provider Pages
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderServices from "./pages/provider/Services";
import ServiceForm from "./pages/provider/ServiceForm";
import ServiceDetails from "./pages/provider/ServiceDetails";
import EditService from "./pages/provider/EditService";
import AvailabilityDashboard from "./pages/provider/availability/AvailabilityDashboard";
import WeeklySchedule from "./pages/provider/availability/WeeklySchedule";
import BlockedTimes from "./pages/provider/availability/BlockedTimes";
import ProviderAppointmentsList from "./pages/provider/appointments/AppointmentsList";
import TodaysSchedule from "./pages/provider/appointments/TodaysSchedule";
import ProviderAppointmentDetail from "./pages/provider/appointments/AppointmentDetail";
import ProviderQuotesList from "./pages/provider/quotes/QuotesList";
import CreateQuote from "./pages/provider/quotes/CreateQuote";
import QuoteDetail from "./pages/provider/quotes/QuoteDetail";
import EditQuote from "./pages/provider/quotes/EditQuote";
import InvoicesList from "./pages/provider/payments/InvoicesList";
import CreateInvoice from "./pages/provider/payments/CreateInvoice";
import InvoiceDetail from "./pages/provider/payments/InvoiceDetail";
import EarningsOverview from "./pages/provider/payments/EarningsOverview";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffList from "./pages/admin/staff/StaffList";
import CreateStaff from "./pages/admin/staff/CreateStaff";
import EditStaff from "./pages/admin/staff/EditStaff";
import StaffDetails from "./pages/admin/staff/StaffDetails";

// Staff Components
import StaffDashboard from "./pages/staff/Dashboard";
import StaffLayout from "./components/layouts/StaffLayout";
import CategoriesList from "./pages/staff/categories/CategoriesList";
import CreateCategory from "./pages/staff/categories/CreateCategory";
import EditCategory from "./pages/staff/categories/EditCategory";
import CategoryDetails from "./pages/staff/categories/CategoryDetails";

// Import Bootstrap
import "./bootstrap";

function App() {
    return (
        <AuthProvider>
            <LocationProvider>
                <Router>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />

                        {/* Auth Routes */}
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
                        <Route
                            path="/client/*"
                            element={
                                <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientProvider>
                                        <Routes>
                                            {/* Client Dashboard */}
                                            <Route
                                                path="dashboard"
                                                element={<ClientDashboard />}
                                            />

                                            {/* Service Browsing Routes */}
                                            <Route
                                                path="services"
                                                element={<ServicesBrowse />}
                                            />

                                            <Route
                                                path="services/search"
                                                element={<ServiceSearch />}
                                            />

                                            <Route
                                                path="quotes"
                                                element={<QuotesList />}
                                            />

                                            <Route
                                                path="services/categories"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Service
                                                                Categories
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-th-large fa-4x text-muted mb-3"></i>
                                                                    <h4>
                                                                        Categories
                                                                        page
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Browse
                                                                        services
                                                                        by
                                                                        category.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="services/:id"
                                                element={<ServiceDetail />}
                                            />

                                            {/* Provider Routes */}
                                            <Route
                                                path="providers"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Browse Providers
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-users fa-4x text-muted mb-3"></i>
                                                                    <h4>
                                                                        Provider
                                                                        browsing
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Find and
                                                                        connect
                                                                        with
                                                                        service
                                                                        providers.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="providers/:id"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Provider Details
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-user-circle fa-4x text-muted mb-3"></i>
                                                                    <h4>
                                                                        Provider
                                                                        details
                                                                        page
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        View
                                                                        provider
                                                                        profile
                                                                        and
                                                                        services.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            {/* Booking Routes */}
                                            <Route
                                                path="booking/new/:serviceId"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Book Service
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-calendar-plus fa-4x text-primary mb-3"></i>
                                                                    <h4>
                                                                        Booking
                                                                        wizard
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Complete
                                                                        your
                                                                        service
                                                                        booking.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            {/* Legacy booking route */}
                                            <Route
                                                path="book/:category"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Book Service
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-calendar-plus fa-4x text-primary mb-3"></i>
                                                                    <h4>
                                                                        Service
                                                                        booking
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Quick
                                                                        booking
                                                                        functionality
                                                                        is under
                                                                        development.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            {/* Appointment Management */}
                                            <Route
                                                path="appointments"
                                                element={<AppointmentsList />}
                                            />

                                            <Route
                                                path="appointments/:id"
                                                element={<AppointmentDetail />}
                                            />

                                            <Route
                                                path="appointments/upcoming"
                                                element={<AppointmentsList />} // Will use URL params to filter
                                            />

                                            <Route
                                                path="appointments/past"
                                                element={<AppointmentsList />}
                                            />

                                            <Route
                                                path="appointments/cancelled"
                                                element={<AppointmentsList />}
                                            />

                                            {/* Other client routes */}
                                            <Route
                                                path="notifications"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Notifications
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-bell fa-4x text-muted mb-3"></i>
                                                                    <h4>
                                                                        Notifications
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Stay
                                                                        updated
                                                                        with
                                                                        booking
                                                                        alerts
                                                                        and
                                                                        updates.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="profile"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                My Profile
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-user-edit fa-4x text-muted mb-3"></i>
                                                                    <h4>
                                                                        Profile
                                                                        management
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Edit
                                                                        your
                                                                        profile
                                                                        information
                                                                        and
                                                                        preferences.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="reviews"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Reviews &
                                                                Ratings
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-star fa-4x text-warning mb-3"></i>
                                                                    <h4>
                                                                        Review
                                                                        system
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Rate and
                                                                        review
                                                                        your
                                                                        service
                                                                        providers.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="support"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Help & Support
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-headset fa-4x text-info mb-3"></i>
                                                                    <h4>
                                                                        Support
                                                                        system
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Get help
                                                                        and
                                                                        contact
                                                                        our
                                                                        support
                                                                        team.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            <Route
                                                path="favorites"
                                                element={
                                                    <DashboardLayout>
                                                        <div className="container-fluid">
                                                            <h2 className="fw-bold mb-4">
                                                                Favorite
                                                                Providers
                                                            </h2>
                                                            <div className="card border-0 shadow-sm">
                                                                <div className="card-body text-center py-5">
                                                                    <i className="fas fa-heart fa-4x text-danger mb-3"></i>
                                                                    <h4>
                                                                        Favorites
                                                                        page
                                                                        coming
                                                                        soon
                                                                    </h4>
                                                                    <p className="text-muted">
                                                                        Manage
                                                                        your
                                                                        favorite
                                                                        service
                                                                        providers.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DashboardLayout>
                                                }
                                            />

                                            {/* Default client route redirect */}
                                            <Route
                                                path="*"
                                                element={<ClientDashboard />}
                                            />
                                        </Routes>
                                    </ClientProvider>
                                </ProtectedRoute>
                            }
                        />

                        {/* ===== SERVICE PROVIDER ROUTES ===== */}
                        <Route
                            path="/provider/*"
                            element={
                                <ProtectedRoute
                                    allowedRoles={["service_provider"]}
                                >
                                    <ProviderProvider>
                                        <ServicesProvider>
                                            <Routes>
                                                {/* Provider Dashboard */}
                                                <Route
                                                    path="dashboard"
                                                    element={
                                                        <ProviderDashboard />
                                                    }
                                                />
                                                {/* Provider Services Management */}
                                                <Route
                                                    path="services"
                                                    element={
                                                        <ProviderServices />
                                                    }
                                                />
                                                <Route
                                                    path="services/create"
                                                    element={<ServiceForm />}
                                                />
                                                <Route
                                                    path="services/:id"
                                                    element={<ServiceDetails />}
                                                />
                                                <Route
                                                    path="services/:id/edit"
                                                    element={<EditService />}
                                                />
                                                {/* Provider Availability Management */}
                                                <Route
                                                    path="availability"
                                                    element={
                                                        <AvailabilityDashboard />
                                                    }
                                                />
                                                <Route
                                                    path="availability/schedule"
                                                    element={<WeeklySchedule />}
                                                />
                                                <Route
                                                    path="availability/blocked"
                                                    element={<BlockedTimes />}
                                                />
                                                {/* Provider Appointment Management */}
                                                <Route
                                                    path="appointments"
                                                    element={
                                                        <ProviderAppointmentsList />
                                                    }
                                                />
                                                <Route
                                                    path="appointments/today"
                                                    element={<TodaysSchedule />}
                                                />
                                                <Route
                                                    path="appointments/:id"
                                                    element={
                                                        <ProviderAppointmentDetail />
                                                    }
                                                />
                                                {/* Provider quote routes */}
                                                <Route
                                                    path="quotes"
                                                    element={
                                                        <ProviderQuotesList />
                                                    }
                                                />
                                                <Route
                                                    path="quotes/create"
                                                    element={<CreateQuote />}
                                                />
                                                <Route
                                                    path="quotes/:id"
                                                    element={<QuoteDetail />}
                                                />
                                                <Route
                                                    path="quotes/:id/edit"
                                                    element={<EditQuote />}
                                                />

                                                {/* Provider Invoice Management */}
                                                <Route
                                                    path="invoices"
                                                    element={<InvoicesList />}
                                                />
                                                <Route
                                                    path="invoices/create"
                                                    element={<CreateInvoice />}
                                                />
                                                <Route
                                                    path="invoices/:invoiceId"
                                                    element={<InvoiceDetail />}
                                                />
                                                <Route
                                                    path="earnings"
                                                    element={
                                                        <EarningsOverview />
                                                    }
                                                />
                                            </Routes>
                                        </ServicesProvider>
                                    </ProviderProvider>
                                </ProtectedRoute>
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
                                            <Route
                                                path="staff/:id"
                                                element={<StaffDetails />}
                                            />
                                            <Route
                                                path="staff/:id/edit"
                                                element={<EditStaff />}
                                            />

                                            {/* Other admin routes... */}
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
                            path="/staff/*"
                            element={
                                <ProtectedRoute allowedRoles={["staff"]}>
                                    <StaffProvider>
                                        <Routes>
                                            {/* Staff Dashboard */}
                                            <Route
                                                path="dashboard"
                                                element={<StaffDashboard />}
                                            />
                                            {/* Service Categories Management */}
                                            <Route
                                                path="categories"
                                                element={<CategoriesList />}
                                            />
                                            <Route
                                                path="categories/create"
                                                element={<CreateCategory />}
                                            />
                                            <Route
                                                path="categories/:id/edit"
                                                element={<EditCategory />}
                                            />
                                            <Route
                                                path="categories/:id"
                                                element={<CategoryDetails />}
                                            />

                                            {/* Other staff routes... */}
                                            <Route
                                                path="*"
                                                element={<StaffDashboard />}
                                            />
                                        </Routes>
                                    </StaffProvider>
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
                                                    doesn't exist or has been
                                                    moved.
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
            </LocationProvider>
        </AuthProvider>
    );
}

const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App />);
