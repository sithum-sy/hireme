import React from "react";
import { Link } from "react-router-dom";
import { useClient } from "../../../context/ClientContext";
import LoadingSpinner from "../../LoadingSpinner";

const ServiceRecommendations = () => {
    const { recommendations, loading } = useClient();

    if (loading.recommendations) {
        return (
            <LoadingSpinner size="small" message="Loading recommendations..." />
        );
    }

    if (!recommendations.length) {
        return (
            <div className="text-center py-4">
                <i className="fas fa-lightbulb fa-2x text-muted mb-2"></i>
                <p className="text-muted">No recommendations available yet</p>
                <small className="text-muted">
                    Book a service to get personalized recommendations
                </small>
            </div>
        );
    }

    return (
        <div className="service-recommendations">
            <div className="row g-3">
                {recommendations.map((service, index) => (
                    <div key={service.id} className="col-md-6 col-lg-4">
                        <Link
                            to={`/client/services/${service.id}`}
                            className="text-decoration-none"
                        >
                            <div className="card service-card h-100 border-0 shadow-sm">
                                <div className="card-body p-3">
                                    {/* Service Image */}
                                    <div className="service-image mb-3">
                                        {service.first_image_url ? (
                                            <img
                                                src={service.first_image_url}
                                                alt={service.title}
                                                className="w-100 rounded"
                                                style={{
                                                    height: "120px",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="bg-light rounded d-flex align-items-center justify-content-center"
                                                style={{ height: "120px" }}
                                            >
                                                <i className="fas fa-image fa-2x text-muted"></i>
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Info */}
                                    <div className="service-info">
                                        <h6 className="fw-bold mb-2 text-dark">
                                            {service.title}
                                        </h6>
                                        <p className="text-muted small mb-2">
                                            {service.description}
                                        </p>

                                        {/* Provider Info */}
                                        <div className="provider-info d-flex align-items-center mb-2">
                                            <i className="fas fa-user-circle text-muted me-2"></i>
                                            <small className="text-muted">
                                                {service.business_name ||
                                                    service.provider_name}
                                            </small>
                                        </div>

                                        {/* Price and Rating */}
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="price">
                                                <span className="fw-bold text-purple">
                                                    {service.formatted_price}
                                                </span>
                                            </div>
                                            <div className="rating">
                                                <i className="fas fa-star text-warning me-1"></i>
                                                <small>
                                                    {service.average_rating ||
                                                        0}
                                                </small>
                                            </div>
                                        </div>

                                        {/* Distance if available */}
                                        {service.distance && (
                                            <div className="distance mt-2">
                                                <small className="text-muted">
                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                    {service.distance}km away
                                                </small>
                                            </div>
                                        )}

                                        {/* Recommendation Reason */}
                                        <div className="recommendation-reason mt-2">
                                            <span className="badge bg-purple bg-opacity-10 text-purple">
                                                {service.recommendation_reason ===
                                                    "previous_bookings" &&
                                                    "🔄 Similar to your bookings"}
                                                {service.recommendation_reason ===
                                                    "search_history" &&
                                                    "🔍 Based on your searches"}
                                                {service.recommendation_reason ===
                                                    "popular_in_area" &&
                                                    "🔥 Popular in your area"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            <style>{`
                .service-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .service-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }
                .text-purple {
                    color: #6f42c1 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
            `}</style>
        </div>
    );
};

export default ServiceRecommendations;
