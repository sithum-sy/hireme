import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProvider } from "../../context/ProviderContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardNavbar from "../navigation/shared/DashboardNavbar";
import DashboardSidebar from "../navigation/shared/DashboardSidebar";

const ProviderLayout = ({ children }) => {
    const { user } = useAuth();
    const {
        businessStats,
        dashboardMetrics,
        getPerformanceStatus,
        loading: providerLoading,
    } = useProvider();

    const location = useLocation();
    const navigate = useNavigate();

    // Sidebar state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Set role-specific body class
    useEffect(() => {
        document.body.className = "dashboard-provider";
        return () => {
            document.body.className = "";
        };
    }, []);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Auto-close sidebar on mobile when route changes
    useEffect(() => {
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    }, [location.pathname, isMobile]);

    // Handlers
    const handleToggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleSearch = (query) => {
        if (query.trim()) {
            navigate(`/provider/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleMenuItemClick = (item) => {
        if (isMobile) {
            setSidebarCollapsed(true);
        }
    };

    // Generate breadcrumbs
    const generateBreadcrumbs = () => {
        const pathSegments = location.pathname
            .split("/")
            .filter((segment) => segment);
        const breadcrumbs = [];

        const providerIndex = pathSegments.indexOf("provider");
        if (providerIndex > -1) {
            pathSegments.splice(providerIndex, 1);
        }

        breadcrumbs.push({
            title: "Provider Dashboard",
            path: "/provider/dashboard",
            active: pathSegments.length === 0,
        });

        let currentPath = "/provider";
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            const isLast = index === pathSegments.length - 1;

            let title = segment.charAt(0).toUpperCase() + segment.slice(1);
            title = title.replace(/-/g, " ");

            const titleMappings = {
                dashboard: "Dashboard",
                profile: "Business Profile",
                services: "My Services",
                appointments: "Appointments",
                requests: "Service Requests",
                schedule: "Availability",
                earnings: "Earnings & Payments",
                reviews: "Reviews & Ratings",
                messages: "Messages",
                analytics: "Business Analytics",
                settings: "Settings",
                create: "Add New",
                edit: "Edit",
                availability: "Set Availability",
                blocked: "Blocked Times",
                overview: "Overview",
                history: "Payment History",
                verification: "Verification",
            };

            title = titleMappings[segment] || title;

            breadcrumbs.push({
                title: title,
                path: currentPath,
                active: isLast,
            });
        });

        return breadcrumbs;
    };

    // Get performance indicators
    const getPerformanceIndicators = () => {
        return {
            responseRate: {
                value: businessStats.responseRate,
                status: getPerformanceStatus(
                    businessStats.responseRate,
                    "responseRate"
                ),
                color:
                    getPerformanceStatus(
                        businessStats.responseRate,
                        "responseRate"
                    ) === "excellent"
                        ? "success"
                        : getPerformanceStatus(
                              businessStats.responseRate,
                              "responseRate"
                          ) === "good"
                        ? "warning"
                        : "danger",
            },
            rating: {
                value: businessStats.averageRating,
                status: getPerformanceStatus(
                    businessStats.averageRating,
                    "rating"
                ),
                color:
                    getPerformanceStatus(
                        businessStats.averageRating,
                        "rating"
                    ) === "excellent"
                        ? "success"
                        : getPerformanceStatus(
                              businessStats.averageRating,
                              "rating"
                          ) === "good"
                        ? "warning"
                        : "danger",
            },
        };
    };

    const performanceIndicators = getPerformanceIndicators();

    return (
        <div className="dashboard-layout provider-dashboard-layout">
            {/* Universal Navigation Bar */}
            <DashboardNavbar
                role="provider"
                sidebarCollapsed={sidebarCollapsed}
                onToggleSidebar={handleToggleSidebar}
                onSearch={handleSearch}
                className="provider-navbar"
            />

            {/* Main Layout Container */}
            <div className="dashboard-container">
                {/* Universal Sidebar */}
                <DashboardSidebar
                    role="provider"
                    collapsed={sidebarCollapsed}
                    onMenuItemClick={handleMenuItemClick}
                    className={`provider-sidebar ${
                        isMobile && !sidebarCollapsed ? "mobile-overlay" : ""
                    }`}
                />

                {/* Mobile Sidebar Backdrop */}
                {isMobile && !sidebarCollapsed && (
                    <div
                        className="position-fixed w-100 h-100 bg-dark bg-opacity-50 d-block d-lg-none"
                        style={{
                            top: "60px",
                            left: 0,
                            zIndex: 1020,
                        }}
                        onClick={handleToggleSidebar}
                    ></div>
                )}

                {/* Main Content Area */}
                <div
                    className="main-content"
                    style={{
                        marginLeft: isMobile
                            ? "0"
                            : sidebarCollapsed
                            ? "70px"
                            : "280px",
                        marginTop: "60px",
                    }}
                >
                    <div className="content-container">
                        {/* Enhanced Breadcrumb Navigation */}
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                {generateBreadcrumbs().map((crumb, index) => (
                                    <li
                                        key={index}
                                        className={`breadcrumb-item ${
                                            crumb.active ? "active" : ""
                                        }`}
                                    >
                                        {crumb.active ? (
                                            <span className="text-muted">
                                                {crumb.title}
                                            </span>
                                        ) : (
                                            <Link
                                                to={crumb.path}
                                                className="text-decoration-none"
                                            >
                                                {crumb.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>

                        {/* Business Performance Banner (Dashboard only) */}
                        {location.pathname === "/provider/dashboard" && (
                            <div className="business-banner">
                                <div className="row align-items-center">
                                    <div className="col-md-8">
                                        <h3 className="fw-bold mb-2">
                                            Good{" "}
                                            {new Date().getHours() < 12
                                                ? "Morning"
                                                : new Date().getHours() < 17
                                                ? "Afternoon"
                                                : "Evening"}
                                            , {user?.first_name}! 💼
                                        </h3>
                                        <p className="mb-3 opacity-90">
                                            {businessStats.todaysAppointments >
                                            0
                                                ? `You have ${
                                                      businessStats.todaysAppointments
                                                  } appointment${
                                                      businessStats.todaysAppointments >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } today.`
                                                : businessStats.pendingRequests >
                                                  0
                                                ? `You have ${
                                                      businessStats.pendingRequests
                                                  } new service request${
                                                      businessStats.pendingRequests >
                                                      1
                                                          ? "s"
                                                          : ""
                                                  } waiting for your response!`
                                                : "Ready to grow your business? Check your service requests and update your availability."}
                                        </p>
                                        <div className="d-flex gap-2">
                                            <Link
                                                to="/provider/requests"
                                                className="btn btn-light btn-lg"
                                            >
                                                <i className="fas fa-bell me-2"></i>
                                                View Requests (
                                                {businessStats.pendingRequests})
                                            </Link>
                                            <Link
                                                to="/provider/availability/schedule"
                                                className="btn btn-outline-light"
                                            >
                                                <i className="fas fa-calendar me-2"></i>
                                                Update Schedule
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-md-4 text-center d-none d-md-block">
                                        <i className="fas fa-chart-line fa-4x opacity-50"></i>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Business Stats (Dashboard only) */}
                        {/* {location.pathname === "/provider/dashboard" && (
                            <div className="dashboard-grid dashboard-grid-4 mb-4">
                                <div className="stats-card">
                                    <div className="stats-value">
                                        Rs.{" "}
                                        {(
                                            businessStats.monthlyEarnings ?? 0
                                        ).toLocaleString()}
                                    </div>
                                    <div className="stats-label">
                                        This Month's Earnings
                                    </div>
                                    <div className="stats-change positive">
                                        <i className="fas fa-arrow-up"></i>
                                        +15% from last month
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {businessStats.todaysAppointments}
                                    </div>
                                    <div className="stats-label">
                                        Today's Appointments
                                    </div>
                                    <div className="stats-change neutral">
                                        <i className="fas fa-calendar-day"></i>
                                        Scheduled for today
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {businessStats.pendingRequests}
                                    </div>
                                    <div className="stats-label">
                                        Pending Requests
                                    </div>
                                    <div className="stats-change negative">
                                        <i className="fas fa-clock"></i>
                                        Awaiting response
                                    </div>
                                </div>
                                <div className="stats-card">
                                    <div className="stats-value">
                                        {businessStats.averageRating}
                                    </div>
                                    <div className="stats-label">
                                        Average Rating
                                    </div>
                                    <div className="stats-change positive">
                                        <i className="fas fa-star"></i>
                                        Excellent service
                                    </div>
                                </div>
                            </div>
                        )} */}

                        {/* Loading Indicator */}
                        {providerLoading && (
                            <div className="loading-overlay">
                                <div className="spinner-border">
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Main Page Content */}
                        <div className="page-content">{children}</div>

                        {/* Enhanced Footer */}
                        <footer className="content-footer">
                            <div className="row align-items-center">
                                <div className="col-md-6">
                                    <small className="text-muted">
                                        <i className="fas fa-briefcase me-1"></i>
                                        HireMe Business Portal
                                        <span className="mx-2">|</span>
                                        {user?.full_name}
                                    </small>
                                </div>
                                <div className="col-md-6 text-md-end">
                                    <small className="text-muted">
                                        Business since:{" "}
                                        {user?.created_at
                                            ? new Date(
                                                  user.created_at
                                              ).getFullYear()
                                            : "N/A"}
                                        <span className="mx-2">|</span>
                                        <span className="text-primary">
                                            <i className="fas fa-award me-1"></i>
                                            {performanceIndicators.rating
                                                .status === "excellent"
                                                ? "Top Rated Provider"
                                                : performanceIndicators.rating
                                                      .status === "good"
                                                ? "Verified Provider"
                                                : "Growing Business"}
                                        </span>
                                    </small>
                                </div>
                            </div>

                            {/* Business Stats Row */}
                            <div className="row mt-3">
                                <div className="col-12">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex gap-4">
                                            <small className="text-muted">
                                                <i className="fas fa-dollar-sign me-1"></i>
                                                Total Earnings: Rs.{" "}
                                                {(
                                                    businessStats.totalEarnings ??
                                                    0
                                                ).toLocaleString()}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-handshake me-1"></i>
                                                {businessStats.completedJobs}{" "}
                                                Jobs Completed
                                            </small>
                                        </div>
                                        <small className="text-muted">
                                            <i className="fas fa-clock me-1"></i>
                                            {new Date().toLocaleString()}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProviderLayout;
