import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import "leaflet/dist/leaflet.css";
import "../css/app.css";
import "../css/auth.css";

// Import Bootstrap
import "./bootstrap";

import { AuthProvider } from "./context/AuthContext";
import { AdminProvider } from "./context/AdminContext";
import { ServicesProvider } from "./context/ServicesContext";
import { StaffProvider } from "./context/StaffContext";
import { ProviderProvider } from "./context/ProviderContext";
import { ClientProvider } from "./context/ClientContext";
import { LocationProvider } from "./context/LocationContext";
import { DynamicAreasProvider } from "./context/DynamicAreasContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PlaceholderPage from "./components/Navigation/shared/PlaceholderPage";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerification from "./pages/EmailVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Client Pages
import ClientDashboard from "./pages/client/Dashboard";
import ServicesBrowse from "./pages/client/services/ServicesBrowse";
import ServiceSearch from "./pages/client/services/ServiceSearch";
import ServiceDetail from "./pages/client/services/ServiceDetail";
import QuotesList from "./pages/client/quotes/QuotesListEnhanced";
import AppointmentsList from "./pages/client/appointments/AppointmentsList";
import AppointmentDetail from "./pages/client/appointments/AppointmentDetail";
import ClientQuoteDetail from "./pages/client/quotes/QuoteDetail";
import QuoteAcceptanceBooking from "./components/client/booking/QuoteAcceptanceBooking";
import ClientProfile from "./pages/client/profile/ClientProfile";
import ClientAllNotifications from "./pages/client/notifications/AllNotifications";

// Provider Pages
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderServices from "./pages/provider/services/Services";
import ServiceForm from "./pages/provider/services/ServiceForm";
import ServiceDetails from "./pages/provider/services/ServiceDetails";
import EditService from "./pages/provider/services/EditService";
import AvailabilityDashboard from "./pages/provider/availability/AvailabilityDashboard";
import WeeklySchedule from "./pages/provider/availability/WeeklySchedule";
import BlockedTimes from "./pages/provider/availability/BlockedTimes";
import ProviderAppointmentsList from "./pages/provider/appointments/AppointmentsList";
import TodaysSchedule from "./pages/provider/appointments/TodaysSchedule";
import ProviderAppointmentDetail from "./pages/provider/appointments/AppointmentDetail";
import ProviderQuotesList from "./pages/provider/quotes/ProviderQuotesListEnhanced";
import CreateQuote from "./pages/provider/quotes/CreateQuote";
import QuoteDetail from "./pages/provider/quotes/QuoteDetail";
import EditQuote from "./pages/provider/quotes/EditQuote";
import InvoicesList from "./pages/provider/payments/InvoicesList";
// import CreateInvoice from "./pages/provider/payments/CreateInvoice";
import InvoiceDetail from "./pages/provider/payments/InvoiceDetail";
import EarningsOverview from "./pages/provider/payments/EarningsOverview";
import ProviderProfile from "./pages/provider/profile/ProviderProfile";
import ProviderAllNotifications from "./pages/provider/notifications/AllNotifications";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import StaffList from "./pages/admin/staff/StaffList";
import CreateStaff from "./pages/admin/staff/CreateStaff";
import EditStaff from "./pages/admin/staff/EditStaff";
import StaffDetails from "./pages/admin/staff/StaffDetails";
import AdminProfile from "./pages/admin/profile/AdminProfile";

// Staff Components
import StaffDashboard from "./pages/staff/Dashboard";
import StaffLayout from "./components/layouts/StaffLayout";
import CategoriesList from "./pages/staff/categories/CategoriesList";
import CreateCategory from "./pages/staff/categories/CreateCategory";
import EditCategory from "./pages/staff/categories/EditCategory";
import CategoryDetails from "./pages/staff/categories/CategoryDetails";
import UsersList from "./pages/staff/users/UsersList";
import ServicesList from "./pages/staff/services/ServicesList";
import StaffAppointmentsList from "./pages/staff/appointments/AppointmentsList";
import StaffProfile from "./pages/staff/profile/StaffProfile";

// Report Components
import AdminReportsPage from "./components/admin/reports/ReportsPage";
import ClientReportsPage from "./components/client/reports/ReportsPage";
import ProviderReportsPage from "./components/provider/reports/ReportsPage";
import StaffReportsPage from "./pages/staff/reports/StaffReportsPage";
import CustomReportsPage from "./pages/staff/reports/CustomReportsPage";

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
                        <Route
                            path="/verify-email"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <EmailVerification />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forgot-password"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <ForgotPassword />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/reset-password"
                            element={
                                <ProtectedRoute requireAuth={false}>
                                    <ResetPassword />
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
                                                path="quotes/:id"
                                                element={<ClientQuoteDetail />}
                                            />

                                            <Route
                                                path="services/categories"
                                                element={
                                                    <PlaceholderPage
                                                        title="Service Categories"
                                                        subtitle="Browse services by category"
                                                        icon="fas fa-th-large"
                                                        description="Discover services organized by categories to find exactly what you need."
                                                        variant="info"
                                                        actions={
                                                            <Link
                                                                to="/client/services"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-search"></i>
                                                                <span>
                                                                    Browse All
                                                                    Services
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="services/:id"
                                                element={<ServiceDetail />}
                                            />

                                            <Route
                                                path="booking/from-quote"
                                                element={
                                                    <QuoteAcceptanceBooking />
                                                }
                                            />

                                            {/* Provider Routes */}
                                            <Route
                                                path="providers"
                                                element={
                                                    <PlaceholderPage
                                                        title="Browse Providers"
                                                        subtitle="Find trusted service professionals"
                                                        icon="fas fa-users"
                                                        description="Find and connect with verified service providers in your area."
                                                        variant="success"
                                                        actions={
                                                            <Link
                                                                to="/client/services"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-search"></i>
                                                                <span>
                                                                    Browse
                                                                    Services
                                                                    Instead
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="providers/:id"
                                                element={
                                                    <PlaceholderPage
                                                        title="Provider Details"
                                                        subtitle="View provider profile and services"
                                                        icon="fas fa-user-circle"
                                                        description="View detailed provider profile, services, and customer reviews."
                                                        variant="info"
                                                    />
                                                }
                                            />

                                            {/* Booking Routes */}
                                            <Route
                                                path="booking/new/:serviceId"
                                                element={
                                                    <PlaceholderPage
                                                        title="Book Service"
                                                        subtitle="Complete your service booking"
                                                        icon="fas fa-calendar-plus"
                                                        description="Complete your service booking with our easy-to-use booking wizard."
                                                        variant="success"
                                                        actions={
                                                            <Link
                                                                to="/client/services"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-arrow-left"></i>
                                                                <span>
                                                                    Back to
                                                                    Services
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            {/* Legacy booking route */}
                                            <Route
                                                path="book/:category"
                                                element={
                                                    <PlaceholderPage
                                                        title="Book Service"
                                                        subtitle="Quick service booking"
                                                        icon="fas fa-calendar-plus"
                                                        description="Quick booking functionality is under development."
                                                        variant="warning"
                                                        actions={
                                                            <Link
                                                                to="/client/services"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-search"></i>
                                                                <span>
                                                                    Browse
                                                                    Services
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
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
                                                element={<AppointmentsList />}
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
                                                element={<ClientAllNotifications />}
                                            />

                                            <Route
                                                path="profile"
                                                element={<ClientProfile />}
                                            />

                                            <Route
                                                path="reports/*"
                                                element={<ClientReportsPage />}
                                            />

                                            <Route
                                                path="reviews"
                                                element={
                                                    <PlaceholderPage
                                                        title="Reviews & Ratings"
                                                        subtitle="Manage your service reviews"
                                                        icon="fas fa-star"
                                                        description="Rate and review your service providers to help other clients make informed decisions."
                                                        variant="warning"
                                                        actions={
                                                            <Link
                                                                to="/client/appointments"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-calendar-check"></i>
                                                                <span>
                                                                    View
                                                                    Completed
                                                                    Services
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="support"
                                                element={
                                                    <PlaceholderPage
                                                        title="Help & Support"
                                                        subtitle="Get assistance when you need it"
                                                        icon="fas fa-headset"
                                                        description="Get help from our support team or browse our help documentation."
                                                        variant="success"
                                                        actions={
                                                            <>
                                                                <button className="btn btn-primary">
                                                                    <i className="fas fa-comments"></i>
                                                                    <span>
                                                                        Contact
                                                                        Support
                                                                    </span>
                                                                </button>
                                                                <button className="btn btn-outline-primary">
                                                                    <i className="fas fa-book"></i>
                                                                    <span>
                                                                        Help
                                                                        Center
                                                                    </span>
                                                                </button>
                                                            </>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="favorites"
                                                element={
                                                    <PlaceholderPage
                                                        title="Favorite Providers"
                                                        subtitle="Your saved service providers"
                                                        icon="fas fa-heart"
                                                        description="Manage your favorite service providers for quick and easy booking."
                                                        variant="danger"
                                                        actions={
                                                            <Link
                                                                to="/client/services"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-search"></i>
                                                                <span>
                                                                    Find
                                                                    Providers
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            {/* Payment Routes */}
                                            <Route
                                                path="payments/history"
                                                element={
                                                    <PlaceholderPage
                                                        title="Payment History"
                                                        subtitle="View your transaction history"
                                                        icon="fas fa-history"
                                                        description="Track all your payments and transaction history."
                                                        variant="success"
                                                        actions={
                                                            <Link
                                                                to="/client/appointments"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-calendar-alt"></i>
                                                                <span>
                                                                    View
                                                                    Appointments
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="payments/methods"
                                                element={
                                                    <PlaceholderPage
                                                        title="Payment Methods"
                                                        subtitle="Manage your payment options"
                                                        icon="fas fa-credit-card"
                                                        description="Add, edit, or remove your payment methods for easy booking."
                                                        variant="info"
                                                        actions={
                                                            <>
                                                                <button className="btn btn-primary">
                                                                    <i className="fas fa-plus"></i>
                                                                    <span>
                                                                        Add
                                                                        Payment
                                                                        Method
                                                                    </span>
                                                                </button>
                                                                <button className="btn btn-outline-primary">
                                                                    <i className="fas fa-shield-alt"></i>
                                                                    <span>
                                                                        Security
                                                                        Settings
                                                                    </span>
                                                                </button>
                                                            </>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="payments/invoices"
                                                element={
                                                    <PlaceholderPage
                                                        title="Invoices"
                                                        subtitle="Download and manage your invoices"
                                                        icon="fas fa-file-invoice-dollar"
                                                        description="View, download, and manage all your service invoices."
                                                        variant="info"
                                                        actions={
                                                            <Link
                                                                to="/client/appointments"
                                                                className="btn btn-primary"
                                                            >
                                                                <i className="fas fa-calendar-check"></i>
                                                                <span>
                                                                    View
                                                                    Services
                                                                </span>
                                                            </Link>
                                                        }
                                                    />
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
                                                {/* <Route
                                                    path="invoices/create"
                                                    element={<CreateInvoice />}
                                                /> */}
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

                                                {/* Provider Profile Routes */}
                                                <Route
                                                    path="provider-profile/"
                                                    element={
                                                        <ProviderProfile />
                                                    }
                                                />

                                                {/* <Route
                                                    path="profile/personal"
                                                    element={
                                                        <PlaceholderPage
                                                            title="Personal Information"
                                                            subtitle="Manage your personal details"
                                                            icon="fas fa-user"
                                                            description="Update your personal information and contact details."
                                                            variant="info"
                                                        />
                                                    }
                                                /> */}

                                                {/* <Route
                                                    path="profile/verification"
                                                    element={
                                                        <PlaceholderPage
                                                            title="Account Verification"
                                                            subtitle="Verify your professional credentials"
                                                            icon="fas fa-shield-check"
                                                            description="Complete your profile verification to build trust with clients."
                                                            variant="success"
                                                            actions={
                                                                <button className="btn btn-primary">
                                                                    <i className="fas fa-upload"></i>
                                                                    <span>
                                                                        Upload
                                                                        Documents
                                                                    </span>
                                                                </button>
                                                            }
                                                        />
                                                    }
                                                /> */}

                                                {/* Provider Notifications */}
                                                <Route
                                                    path="notifications"
                                                    element={<ProviderAllNotifications />}
                                                />

                                                {/* Provider Reports Routes */}
                                                <Route
                                                    path="reports/*"
                                                    element={
                                                        <ProviderReportsPage />
                                                    }
                                                />

                                                {/* Provider Reviews */}
                                                {/* <Route
                                                    path="reviews"
                                                    element={
                                                        <PlaceholderPage
                                                            title="Reviews & Ratings"
                                                            subtitle="Manage customer feedback"
                                                            icon="fas fa-star"
                                                            description="View and respond to customer reviews and ratings."
                                                            variant="warning"
                                                            actions={
                                                                <Link
                                                                    to="/provider/appointments"
                                                                    className="btn btn-primary"
                                                                >
                                                                    <i className="fas fa-calendar-check"></i>
                                                                    <span>
                                                                        View
                                                                        Completed
                                                                        Jobs
                                                                    </span>
                                                                </Link>
                                                            }
                                                        />
                                                    }
                                                /> */}

                                                {/* Default provider route redirect */}
                                                <Route
                                                    path="*"
                                                    element={
                                                        <ProviderDashboard />
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

                                            {/* Admin placeholder routes */}
                                            <Route
                                                path="users"
                                                element={
                                                    <PlaceholderPage
                                                        title="User Management"
                                                        subtitle="Manage platform users"
                                                        icon="fas fa-users-cog"
                                                        description="View, edit, and manage all platform users including clients and providers."
                                                        variant="info"
                                                        actions={
                                                            <>
                                                                <button className="btn btn-primary">
                                                                    <i className="fas fa-user-plus"></i>
                                                                    <span>
                                                                        Add User
                                                                    </span>
                                                                </button>
                                                                <button className="btn btn-outline-primary">
                                                                    <i className="fas fa-download"></i>
                                                                    <span>
                                                                        Export
                                                                        Users
                                                                    </span>
                                                                </button>
                                                            </>
                                                        }
                                                    />
                                                }
                                            />

                                            <Route
                                                path="services"
                                                element={
                                                    <PlaceholderPage
                                                        title="Service Management"
                                                        subtitle="Oversee platform services"
                                                        icon="fas fa-concierge-bell"
                                                        description="Review, approve, and manage services offered on the platform."
                                                        variant="success"
                                                    />
                                                }
                                            />

                                            <Route
                                                path="reports/*"
                                                element={<AdminReportsPage />}
                                            />

                                            <Route
                                                path="profile"
                                                element={<AdminProfile />}
                                            />
                                            <Route
                                                path="settings"
                                                element={
                                                    <PlaceholderPage
                                                        title="System Settings"
                                                        subtitle="Configure platform settings"
                                                        icon="fas fa-cogs"
                                                        description="Manage platform-wide settings, configurations, and preferences."
                                                        variant="warning"
                                                    />
                                                }
                                            />

                                            {/* Default admin route redirect */}
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
                                                path="service-categories"
                                                element={<CategoriesList />}
                                            />
                                            <Route
                                                path="service-categories/create"
                                                element={<CreateCategory />}
                                            />
                                            <Route
                                                path="service-categories/:id/edit"
                                                element={<EditCategory />}
                                            />
                                            <Route
                                                path="service-categories/:id"
                                                element={<CategoryDetails />}
                                            />

                                            {/* Staff placeholder routes */}
                                            {/* User Management */}
                                            <Route
                                                path="users"
                                                element={<UsersList />}
                                            />

                                            <Route
                                                path="services"
                                                element={<ServicesList />}
                                            />

                                            <Route
                                                path="services/:id"
                                                element={
                                                    <PlaceholderPage
                                                        title="Service Details"
                                                        subtitle="View detailed service information"
                                                        icon="fas fa-concierge-bell"
                                                        description="View detailed information about a specific service."
                                                        variant="warning"
                                                    />
                                                }
                                            />

                                            {/* Appointment Management */}
                                            <Route
                                                path="appointments"
                                                element={<StaffAppointmentsList />}
                                            />

                                            <Route
                                                path="appointments/:id"
                                                element={
                                                    <PlaceholderPage
                                                        title="Appointment Details"
                                                        subtitle="View detailed appointment information"
                                                        icon="fas fa-calendar-check"
                                                        description="View detailed information about a specific appointment."
                                                        variant="info"
                                                    />
                                                }
                                            />

                                            <Route
                                                path="profile"
                                                element={<StaffProfile />}
                                            />

                                            {/* Staff Reports Routes */}
                                            <Route
                                                path="reports"
                                                element={<StaffReportsPage />}
                                            />
                                            <Route
                                                path="reports/custom"
                                                element={<CustomReportsPage />}
                                            />

                                            <Route
                                                path="support"
                                                element={
                                                    <PlaceholderPage
                                                        title="Customer Support"
                                                        subtitle="Handle customer inquiries"
                                                        icon="fas fa-headset"
                                                        description="Manage customer support tickets and inquiries."
                                                        variant="success"
                                                        actions={
                                                            <button className="btn btn-primary">
                                                                <i className="fas fa-ticket-alt"></i>
                                                                <span>
                                                                    View Tickets
                                                                </span>
                                                            </button>
                                                        }
                                                    />
                                                }
                                            />

                                            {/* Default staff route redirect */}
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
                                <div className="error-page">
                                    <div className="error-container">
                                        <div className="dashboard-card text-center">
                                            <div className="error-icon">
                                                <i className="fas fa-exclamation-triangle"></i>
                                            </div>
                                            <h1 className="error-code">404</h1>
                                            <h4 className="error-title">
                                                Page Not Found
                                            </h4>
                                            <p className="error-description">
                                                The page you're looking for
                                                doesn't exist or has been moved.
                                            </p>
                                            <div className="error-actions">
                                                <button
                                                    onClick={() =>
                                                        window.history.back()
                                                    }
                                                    className="btn btn-secondary"
                                                >
                                                    <i className="fas fa-arrow-left"></i>
                                                    <span>Go Back</span>
                                                </button>
                                                <a
                                                    href="/"
                                                    className="btn btn-primary"
                                                >
                                                    <i className="fas fa-home"></i>
                                                    <span>Go Home</span>
                                                </a>
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
