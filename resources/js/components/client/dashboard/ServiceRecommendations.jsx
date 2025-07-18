import React from "react";
import { Link } from "react-router-dom";
import { useClient } from "../../../context/ClientContext";
import LoadingSpinner from "../../LoadingSpinner";

const ServiceRecommendations = () => {
    const { recommendations, loading } = useClient();

    if (loading.recommendations) {
        return (
            <div className="loading-container">
                <LoadingSpinner
                    size="small"
                    message="Loading recommendations..."
                />
            </div>
        );
    }

    if (!recommendations.length) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">
                    <i className="fas fa-lightbulb"></i>
                </div>
                <h6 className="empty-state-title">
                    No recommendations available yet
                </h6>
                <p className="empty-state-description">
                    Book a service to get personalized recommendations
                </p>
            </div>
        );
    }

    return (
        <div className="service-recommendations">
            <div className="dashboard-grid dashboard-grid-3">
                {recommendations.map((service) => (
                    <Link
                        key={service.id}
                        to={`/client/services/${service.id}`}
                        className="service-card-link"
                    >
                        <div className="dashboard-card service-recommendation-card">
                            {/* Service Image */}
                            <div className="service-image">
                                {service.first_image_url ? (
                                    <img
                                        src={service.first_image_url}
                                        alt={service.title}
                                        className="service-img"
                                    />
                                ) : (
                                    <div className="service-img-placeholder">
                                        <i className="fas fa-image"></i>
                                    </div>
                                )}
                            </div>

                            {/* Service Content */}
                            <div className="service-content">
                                <h6 className="service-title">
                                    {service.title}
                                </h6>
                                <p className="service-description">
                                    {service.description}
                                </p>

                                {/* Provider Info */}
                                <div className="service-provider">
                                    <i className="fas fa-user-circle"></i>
                                    <span>
                                        {service.business_name ||
                                            service.provider_name}
                                    </span>
                                </div>

                                {/* Price and Rating */}
                                <div className="service-footer">
                                    <span className="service-price">
                                        {service.formatted_price}
                                    </span>
                                    <div className="service-rating">
                                        <i className="fas fa-star"></i>
                                        <span>
                                            {service.average_rating || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Distance */}
                                {service.distance && (
                                    <div className="service-distance">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{service.distance}km away</span>
                                    </div>
                                )}

                                {/* Recommendation Reason */}
                                <div className="recommendation-badge">
                                    {service.recommendation_reason ===
                                        "previous_bookings" && (
                                        <span className="badge">
                                            🔄 Similar to your bookings
                                        </span>
                                    )}
                                    {service.recommendation_reason ===
                                        "search_history" && (
                                        <span className="badge">
                                            🔍 Based on your searches
                                        </span>
                                    )}
                                    {service.recommendation_reason ===
                                        "popular_in_area" && (
                                        <span className="badge">
                                            🔥 Popular in your area
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ServiceRecommendations;
