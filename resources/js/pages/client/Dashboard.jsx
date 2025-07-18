import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/layouts/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { useClient } from "../../context/ClientContext";
import QuickServiceSearch from "../../components/client/dashboard/QuickServiceSearch";
import ServiceRecommendations from "../../components/client/dashboard/ServiceRecommendations";
import LocationSelector from "../../components/map/LocationSelector";
import LoadingSpinner from "../../components/LoadingSpinner";
import SimpleLocationSelector from "../../components/map/SimpleLocationSelector";

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
                {/* Location Selection Bar */}
                <div className="dashboard-card location-selector-card">
                    <div className="location-selector-main">
                        <div className="location-info">
                            <i className="fas fa-map-marker-alt location-icon"></i>
                            <span className="location-label">
                                Services near:
                            </span>
                            {location ? (
                                <div className="location-display">
                                    <span className="location-text">
                                        {location.city}, {location.province}
                                    </span>
                                    <small className="location-radius">
                                        ({location.radius}km radius)
                                    </small>
                                </div>
                            ) : (
                                <span className="location-placeholder">
                                    Select your location
                                </span>
                            )}
                        </div>
                        <button
                            className="btn btn-outline-primary btn-sm location-change-btn"
                            onClick={() =>
                                setShowLocationSelector(!showLocationSelector)
                            }
                            type="button"
                        >
                            <i className="fas fa-edit"></i>
                            <span>
                                {location ? "Change Location" : "Set Location"}
                            </span>
                        </button>
                    </div>

                    {/* Location Selector Expanded */}
                    {showLocationSelector && (
                        <div className="location-selector-expanded">
                            <div className="location-selector-header">
                                <h6 className="location-selector-title">
                                    <i className="fas fa-map-marker-alt"></i>
                                    <span>Select Your Location</span>
                                </h6>
                                <button
                                    className="btn btn-sm btn-outline-secondary location-close-btn"
                                    onClick={() =>
                                        setShowLocationSelector(false)
                                    }
                                    type="button"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="location-selector-content">
                                <SimpleLocationSelector
                                    value={location}
                                    onChange={handleLocationChange}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Service Search Section */}
                <div className="search-section">
                    <div className="search-header">
                        <h1 className="search-title">
                            What service do you need?
                        </h1>
                        <p className="search-subtitle">
                            Search thousands of services from verified providers
                        </p>
                    </div>
                    <QuickServiceSearch location={location} />
                </div>

                {/* Service Categories Grid */}
                <div className="categories-section">
                    <div className="section-header">
                        <h2 className="section-title">Browse by Category</h2>
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
                        <div className="dashboard-grid dashboard-grid-6">
                            {categories.slice(0, 12).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/client/services?category_id=${category.id}`}
                                    className="category-card-link"
                                >
                                    <div className="action-card category-card">
                                        <div
                                            className={`action-icon category-icon text-${category.color}`}
                                        >
                                            <i className={category.icon}></i>
                                        </div>
                                        <h6 className="action-title category-title">
                                            {category.name}
                                        </h6>
                                        <p className="action-description category-count">
                                            {category.service_count} services
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section">
                    <h2 className="section-title">Quick Actions</h2>
                    <div className="dashboard-grid dashboard-grid-4">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="action-card-link"
                            >
                                <div className="action-card">
                                    <div
                                        className={`action-icon ${action.variant}`}
                                    >
                                        <i className={action.icon}></i>
                                    </div>
                                    <h6 className="action-title">
                                        {action.title}
                                    </h6>
                                    <p className="action-description">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Popular Services */}
                <div className="popular-services-section">
                    <div className="section-header">
                        <h2 className="section-title">Popular Services</h2>
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
                        <div className="dashboard-grid dashboard-grid-4">
                            {popularServices.slice(0, 4).map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/client/services/${service.id}`}
                                    className="service-card-link"
                                >
                                    <div className="dashboard-card service-card">
                                        <div className="service-image">
                                            {service.first_image_url ? (
                                                <img
                                                    src={
                                                        service.first_image_url
                                                    }
                                                    alt={service.title}
                                                    className="service-img"
                                                />
                                            ) : (
                                                <div className="service-img-placeholder">
                                                    <i className="fas fa-image"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="service-content">
                                            <h6 className="service-title">
                                                {service.title}
                                            </h6>
                                            <p className="service-description">
                                                {service.description}
                                            </p>
                                            <div className="service-footer">
                                                <span className="service-price">
                                                    {service.formatted_price}
                                                </span>
                                                <div className="service-rating">
                                                    <i className="fas fa-star"></i>
                                                    <span>
                                                        {service.average_rating ||
                                                            0}
                                                    </span>
                                                </div>
                                            </div>
                                            {service.distance && (
                                                <div className="service-distance">
                                                    <i className="fas fa-map-marker-alt"></i>
                                                    <span>
                                                        {service.distance}km
                                                        away
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
