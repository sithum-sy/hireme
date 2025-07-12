import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/layouts/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { useClient } from "../../context/ClientContext";
import QuickServiceSearch from "../../components/client/dashboard/QuickServiceSearch";
import ServiceRecommendations from "../../components/client/dashboard/ServiceRecommendations";
import LocationSelector from "../../components/map/LocationSelector";
import LoadingSpinner from "../../components/LoadingSpinner";

const ClientDashboard = () => {
    const { user } = useAuth();
    const {
        stats,
        popularServices,
        recentServices,
        categories,
        location,
        loading,
        setLocation,
    } = useClient();

    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    // Load appointment data (using existing AppointmentController)
    useEffect(() => {
        loadAppointmentData();
    }, []);

    const loadAppointmentData = async () => {
        try {
            // Use existing appointment endpoints
            const upcomingResponse = await fetch("/api/appointments/upcoming", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (upcomingResponse.ok) {
                const data = await upcomingResponse.json();
                setUpcomingAppointments(data.data || []);
            }
        } catch (error) {
            console.error("Failed to load appointment data:", error);
        }
    };

    const handleLocationChange = (newLocation) => {
        setLocation(newLocation);
        setShowLocationSelector(false);
    };

    const quickActions = [
        {
            icon: "fas fa-search",
            title: "Browse All Services",
            description: "Explore all available services",
            path: "/client/services",
            color: "purple",
        },
        {
            icon: "fas fa-map-marker-alt",
            title: "Find Nearby Services",
            description: "Services in your area",
            path: "/client/services/search",
            color: "info",
        },
        {
            icon: "fas fa-calendar-alt",
            title: "My Appointments",
            description: "Manage your bookings",
            path: "/client/appointments",
            color: "success",
        },
        {
            icon: "fas fa-users",
            title: "Find Providers",
            description: "Browse service providers",
            path: "/client/providers",
            color: "warning",
        },
    ];

    return (
        <ClientLayout>
            <div className="client-dashboard-content">
                {/* Location Bar */}
                <div className="location-bar bg-white rounded-4 shadow-sm p-3 mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-8">
                            <div className="d-flex align-items-center">
                                <i className="fas fa-map-marker-alt text-purple me-2"></i>
                                <span className="text-muted me-2">
                                    Services near:
                                </span>
                                {location ? (
                                    <span className="fw-semibold">
                                        {location.city}, {location.province}
                                        <small className="text-muted ms-2">
                                            ({location.radius}km radius)
                                        </small>
                                    </span>
                                ) : (
                                    <span className="text-muted">
                                        Select your location
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="col-md-4 text-end">
                            <button
                                className="btn btn-outline-purple btn-sm"
                                onClick={() =>
                                    setShowLocationSelector(
                                        !showLocationSelector
                                    )
                                }
                            >
                                <i className="fas fa-edit me-1"></i>
                                {location ? "Change Location" : "Set Location"}
                            </button>
                        </div>
                    </div>

                    {/* Location Selector */}
                    {showLocationSelector && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <LocationSelector
                                value={location}
                                onChange={handleLocationChange}
                            />
                        </div>
                    )}
                </div>

                {/* Quick Service Search */}
                <div className="service-search-section mb-4">
                    <div className="text-center mb-3">
                        <h4 className="fw-bold text-dark mb-2">
                            What service do you need?
                        </h4>
                        <p className="text-muted">
                            Search thousands of services from verified providers
                        </p>
                    </div>
                    <QuickServiceSearch location={location} />
                </div>

                {/* Service Categories Grid */}
                <div className="service-categories-section mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Browse by Category</h5>
                        <Link
                            to="/client/services/categories"
                            className="btn btn-outline-purple btn-sm"
                        >
                            View All Categories
                        </Link>
                    </div>

                    {loading.services ? (
                        <LoadingSpinner
                            size="small"
                            message="Loading categories..."
                        />
                    ) : (
                        <div className="row g-3">
                            {categories.slice(0, 8).map((category) => (
                                <div
                                    key={category.id}
                                    className="col-6 col-md-3 col-lg-2"
                                >
                                    <Link
                                        to={`/client/services?category_id=${category.id}`}
                                        className="text-decoration-none"
                                    >
                                        <div className="category-card text-center p-3 bg-white rounded-3 shadow-sm h-100">
                                            <div
                                                className={`category-icon text-${category.color} mb-2`}
                                            >
                                                <i
                                                    className={`${category.icon} fa-2x`}
                                                ></i>
                                            </div>
                                            <h6 className="fw-semibold mb-1 text-dark">
                                                {category.name}
                                            </h6>
                                            <small className="text-muted">
                                                {category.service_count}{" "}
                                                services
                                            </small>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section mb-5">
                    <h5 className="fw-bold mb-3">Quick Actions</h5>
                    <div className="row g-3">
                        {quickActions.map((action, index) => (
                            <div key={index} className="col-6 col-md-3">
                                <Link
                                    to={action.path}
                                    className="text-decoration-none"
                                >
                                    <div className="action-card bg-white rounded-3 shadow-sm p-3 text-center h-100">
                                        <div
                                            className={`action-icon bg-${action.color} bg-opacity-10 text-${action.color} rounded-3 p-3 mb-3 d-inline-block`}
                                        >
                                            <i
                                                className={`${action.icon} fa-2x`}
                                            ></i>
                                        </div>
                                        <h6 className="fw-bold mb-2 text-dark">
                                            {action.title}
                                        </h6>
                                        <p className="text-muted small mb-0">
                                            {action.description}
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Service Recommendations */}
                <div className="recommendations-section mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 className="fw-bold mb-1">
                                Recommended for You
                            </h5>
                            <small className="text-muted">
                                Based on your activity and preferences
                            </small>
                        </div>
                        <Link
                            to="/client/services"
                            className="btn btn-outline-purple btn-sm"
                        >
                            View All Services
                        </Link>
                    </div>
                    <ServiceRecommendations />
                </div>

                {/* Popular Services */}
                <div className="popular-services-section mb-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold mb-0">Popular Services</h5>
                        <Link
                            to="/client/services?sort_by=popularity"
                            className="btn btn-outline-purple btn-sm"
                        >
                            View More
                        </Link>
                    </div>

                    {loading.services ? (
                        <LoadingSpinner
                            size="small"
                            message="Loading popular services..."
                        />
                    ) : (
                        <div className="row g-3">
                            {popularServices.slice(0, 4).map((service) => (
                                <div
                                    key={service.id}
                                    className="col-md-6 col-lg-3"
                                >
                                    <Link
                                        to={`/client/services/${service.id}`}
                                        className="text-decoration-none"
                                    >
                                        <div className="service-card bg-white rounded-3 shadow-sm h-100">
                                            <div className="service-image">
                                                {service.first_image_url ? (
                                                    <img
                                                        src={
                                                            service.first_image_url
                                                        }
                                                        alt={service.title}
                                                        className="w-100 rounded-top"
                                                        style={{
                                                            height: "150px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="bg-light rounded-top d-flex align-items-center justify-content-center"
                                                        style={{
                                                            height: "150px",
                                                        }}
                                                    >
                                                        <i className="fas fa-image fa-2x text-muted"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card-body p-3">
                                                <h6 className="fw-bold mb-2 text-dark">
                                                    {service.title}
                                                </h6>
                                                <p className="text-muted small mb-2">
                                                    {service.description}
                                                </p>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <span className="fw-bold text-purple">
                                                        {
                                                            service.formatted_price
                                                        }
                                                    </span>
                                                    <div className="rating">
                                                        <i className="fas fa-star text-warning me-1"></i>
                                                        <small>
                                                            {service.average_rating ||
                                                                0}
                                                        </small>
                                                    </div>
                                                </div>
                                                {service.distance && (
                                                    <small className="text-muted">
                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                        {service.distance}km
                                                        away
                                                    </small>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Dashboard Grid */}
                <div className="row">
                    {/* Dashboard Stats */}
                    <div className="col-lg-8 mb-4">
                        {/* Stats Cards */}
                        <div className="row mb-4">
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="stat-card bg-white rounded-3 shadow-sm p-3 text-center">
                                    <div className="stat-icon text-purple mb-2">
                                        <i className="fas fa-calendar-check fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {stats.totalAppointments}
                                    </h4>
                                    <small className="text-muted">
                                        Total Bookings
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="stat-card bg-white rounded-3 shadow-sm p-3 text-center">
                                    <div className="stat-icon text-success mb-2">
                                        <i className="fas fa-check-circle fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {stats.completedAppointments}
                                    </h4>
                                    <small className="text-muted">
                                        Completed
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="stat-card bg-white rounded-3 shadow-sm p-3 text-center">
                                    <div className="stat-icon text-info mb-2">
                                        <i className="fas fa-search fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {stats.searches_performed}
                                    </h4>
                                    <small className="text-muted">
                                        Searches
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="stat-card bg-white rounded-3 shadow-sm p-3 text-center">
                                    <div className="stat-icon text-warning mb-2">
                                        <i className="fas fa-star fa-2x"></i>
                                    </div>
                                    <h4 className="fw-bold mb-1">
                                        {stats.averageRating || 0}
                                    </h4>
                                    <small className="text-muted">
                                        Avg Rating Given
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold mb-0">
                                        Upcoming Appointments
                                    </h5>
                                    <Link
                                        to="/client/appointments"
                                        className="btn btn-outline-purple btn-sm"
                                    >
                                        View All
                                    </Link>
                                </div>
                            </div>
                            <div className="card-body">
                                {upcomingAppointments.length > 0 ? (
                                    <div className="appointments-list">
                                        {upcomingAppointments
                                            .slice(0, 3)
                                            .map((appointment) => (
                                                <div
                                                    key={appointment.id}
                                                    className="appointment-item border rounded-3 p-3 mb-3"
                                                >
                                                    <div className="row align-items-center">
                                                        <div className="col-md-6">
                                                            <h6 className="fw-bold mb-1">
                                                                {
                                                                    appointment
                                                                        .service
                                                                        ?.title
                                                                }
                                                            </h6>
                                                            <p className="text-muted mb-1">
                                                                <i className="fas fa-user me-2"></i>
                                                                {
                                                                    appointment
                                                                        .provider
                                                                        ?.name
                                                                }
                                                            </p>
                                                            <p className="text-muted mb-0">
                                                                <i className="fas fa-calendar me-2"></i>
                                                                {
                                                                    appointment.formatted_date_time
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <span
                                                                className={`badge ${appointment.status_badge}`}
                                                            >
                                                                {
                                                                    appointment.status_text
                                                                }
                                                            </span>
                                                        </div>
                                                        <div className="col-md-3 text-end">
                                                            <div className="fw-bold text-purple">
                                                                Rs.{" "}
                                                                {
                                                                    appointment.total_price
                                                                }
                                                            </div>
                                                            <Link
                                                                to={`/client/appointments/${appointment.id}`}
                                                                className="btn btn-outline-purple btn-sm mt-1"
                                                            >
                                                                <i className="fas fa-eye me-1"></i>
                                                                View
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-5">
                                        <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                        <h6 className="text-muted">
                                            No upcoming appointments
                                        </h6>
                                        <Link
                                            to="/client/services"
                                            className="btn btn-purple mt-2"
                                        >
                                            Book Your First Service
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Recent Activity */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">
                                    Recent Activity
                                </h6>
                            </div>
                            <div className="card-body">
                                {recentActivities.length > 0 ? (
                                    <div className="activity-list">
                                        {recentActivities
                                            .slice(0, 5)
                                            .map((activity) => (
                                                <div
                                                    key={activity.id}
                                                    className="activity-item d-flex mb-3"
                                                >
                                                    <div className="activity-icon me-3">
                                                        <i
                                                            className={`fas ${
                                                                activity.type ===
                                                                "appointment_completed"
                                                                    ? "fa-check-circle text-success"
                                                                    : activity.type ===
                                                                      "search"
                                                                    ? "fa-search text-info"
                                                                    : "fa-calendar-plus text-purple"
                                                            }`}
                                                        ></i>
                                                    </div>
                                                    <div className="activity-content">
                                                        <p className="mb-1 small">
                                                            {activity.title}
                                                        </p>
                                                        <small className="text-muted">
                                                            {
                                                                activity.formatted_date
                                                            }
                                                        </small>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-muted small">
                                        No recent activity
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="fw-bold mb-0">Quick Links</h6>
                            </div>
                            <div className="card-body">
                                <div className="quick-links">
                                    <Link
                                        to="/client/profile"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-user-edit text-muted me-3"></i>
                                        <span>Edit Profile</span>
                                    </Link>
                                    <Link
                                        to="/client/payments/methods"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-credit-card text-muted me-3"></i>
                                        <span>Payment Methods</span>
                                    </Link>
                                    <Link
                                        to="/client/favorites"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded mb-2"
                                    >
                                        <i className="fas fa-heart text-muted me-3"></i>
                                        <span>Favorite Providers</span>
                                    </Link>
                                    <Link
                                        to="/client/support"
                                        className="quick-link d-flex align-items-center text-decoration-none p-2 rounded"
                                    >
                                        <i className="fas fa-question-circle text-muted me-3"></i>
                                        <span>Help & Support</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
                .btn-outline-purple {
                    color: #6f42c1;
                    border-color: #6f42c1;
                }
                .btn-outline-purple:hover {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .category-card,
                .action-card,
                .service-card,
                .stat-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .category-card:hover,
                .action-card:hover,
                .service-card:hover,
                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }
                .quick-link:hover {
                    background-color: #f8f9fa;
                }
                .appointment-item {
                    background-color: #f8f9fa;
                }
            `}</style>
        </ClientLayout>
    );
};

export default ClientDashboard;
