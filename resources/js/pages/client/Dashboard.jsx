import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/layouts/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { useClient } from "../../context/ClientContext";
import QuickServiceSearch from "../../components/client/dashboard/QuickServiceSearch";
import ServiceRecommendations from "../../components/client/dashboard/ServiceRecommendations";
import LocationSelector from "../../components/map/LocationSelector";
import LoadingSpinner from "../../components/LoadingSpinner";
// import SimpleLocationSelector from "../../components/map/SimpleLocationSelector";

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

    // Load appointment data
    useEffect(() => {
        loadAppointmentData();
    }, []);

    const loadAppointmentData = async () => {
        try {
            // Use the existing appointments endpoint with filters for upcoming
            const today = new Date().toISOString().split("T")[0];
            const nextWeek = new Date();
            nextWeek.setDate(new Date().getDate() + 7);
            const nextWeekStr = nextWeek.toISOString().split("T")[0];

            const upcomingResponse = await fetch(
                `/api/client/appointments?status=confirmed,pending&date_from=${today}&date_to=${nextWeekStr}&per_page=5`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (upcomingResponse.ok) {
                const data = await upcomingResponse.json();
                setUpcomingAppointments(data.data?.data || data.data || []);
            }
        } catch (error) {
            console.error("Failed to load appointment data:", error);
        }
    };

    // Location change handler
    const handleLocationChange = useCallback((newLocation) => {
        console.log("📍 Dashboard: Location changed");
        setLocation(newLocation);

        if (newLocation) {
            setTimeout(() => setShowLocationSelector(false), 1500);
        }
    }, []);

    const quickActions = [
        {
            icon: "fas fa-search",
            title: "Browse All Services",
            description: "Explore all available services",
            path: "/client/services",
            variant: "primary",
        },
        {
            icon: "fas fa-map-marker-alt",
            title: "Find Nearby Services",
            description: "Services in your area",
            path: "/client/services/search",
            variant: "info",
        },
        {
            icon: "fas fa-calendar-alt",
            title: "My Appointments",
            description: "Manage your bookings",
            path: "/client/appointments",
            variant: "success",
        },
        {
            icon: "fas fa-users",
            title: "Find Providers",
            description: "Browse service providers",
            path: "/client/services",
            variant: "warning",
        },
    ];

    return (
        <ClientLayout>
            <div className="page-content">
                {/* Service Categories Grid */}
                <div className="categories-section mb-6">
                    <div className="section-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        <h2 className="section-title h3 mb-3 mb-md-0 text-primary">Browse by Category</h2>
                        <Link
                            to="/client/services/categories"
                            className="btn btn-outline-primary btn-sm"
                        >
                            View All Categories
                        </Link>
                    </div>

                    {loading.services ? (
                        <div className="loading-container">
                            <LoadingSpinner
                                size="small"
                                message="Loading categories..."
                            />
                        </div>
                    ) : (
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md responsive-grid-lg">
                            {categories.slice(0, 12).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/client/services?category_id=${category.id}`}
                                    className="text-decoration-none"
                                >
                                    <div className="card action-card h-100 transition">
                                        <div className="card-body text-center p-4">
                                            <div
                                                className={`action-icon mb-3 text-${category.color || 'primary'}`}
                                            >
                                                <i className={`${category.icon} fa-2x`}></i>
                                            </div>
                                            <h6 className="card-title mb-2">
                                                {category.name}
                                            </h6>
                                            <p className="card-text text-muted small mb-0">
                                                {category.service_count} services
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section mb-6">
                    <h2 className="section-title h3 mb-4 text-primary">Quick Actions</h2>
                    <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="text-decoration-none"
                            >
                                <div className="card action-card h-100 transition">
                                    <div className="card-body text-center p-4">
                                        <div
                                            className={`action-icon mb-3 text-${action.variant}`}
                                        >
                                            <i className={`${action.icon} fa-2x`}></i>
                                        </div>
                                        <h6 className="card-title mb-2">
                                            {action.title}
                                        </h6>
                                        <p className="card-text text-muted small mb-0">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Popular Services */}
                <div className="popular-services-section">
                    <div className="section-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        <h2 className="section-title h3 mb-3 mb-md-0 text-primary">Popular Services</h2>
                        <Link
                            to="/client/services?sort_by=popularity"
                            className="btn btn-outline-primary btn-sm"
                        >
                            View More
                        </Link>
                    </div>

                    {loading.services ? (
                        <div className="loading-container">
                            <LoadingSpinner
                                size="small"
                                message="Loading popular services..."
                            />
                        </div>
                    ) : (
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                            {popularServices.slice(0, 4).map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/client/services/${service.id}`}
                                    className="text-decoration-none"
                                >
                                    <div className="card service-card h-100 transition">
                                        <div className="service-image position-relative overflow-hidden">
                                            {service.first_image_url ? (
                                                <img
                                                    src={service.first_image_url}
                                                    alt={service.title}
                                                    className="card-img-top img-responsive"
                                                    style={{ height: '200px', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
                                                    <i className="fas fa-image fa-3x text-muted"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title mb-2">
                                                {service.title}
                                            </h6>
                                            <p className="card-text text-muted small mb-3" style={{ 
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden'
                                            }}>
                                                {service.description}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-primary fw-semibold">
                                                    {service.formatted_price}
                                                </span>
                                                <div className="d-flex align-items-center text-warning">
                                                    <i className="fas fa-star me-1"></i>
                                                    <span className="small">
                                                        {service.average_rating || 0}
                                                    </span>
                                                </div>
                                            </div>
                                            {service.distance && (
                                                <div className="d-flex align-items-center text-muted small">
                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                    <span>
                                                        {service.distance}km away
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};

export default ClientDashboard;
