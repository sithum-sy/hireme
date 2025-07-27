import React from "react";
import ServiceGallery from "../../../client/services/ServiceGallery";

const ServiceInfo = ({ service, activeTab, setActiveTab }) => {
    const getPricingDisplay = () => {
        if (!service) return "";

        switch (service.pricing_type) {
            case "hourly":
                return `Rs. ${service.base_price.toLocaleString()}/hour`;
            case "fixed":
                return `Rs. ${service.base_price.toLocaleString()}`;
            case "custom":
                return service.custom_pricing_description || "Custom Pricing";
            default:
                return `Rs. ${service.base_price.toLocaleString()}`;
        }
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <ul className="nav nav-tabs card-header-tabs">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${
                                activeTab === "overview" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("overview")}
                        >
                            <i className="fas fa-info-circle me-2"></i>
                            Overview
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${
                                activeTab === "bookings" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("bookings")}
                        >
                            <i className="fas fa-calendar me-2"></i>
                            Recent Bookings
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${
                                activeTab === "reviews" ? "active" : ""
                            }`}
                            onClick={() => setActiveTab("reviews")}
                        >
                            <i className="fas fa-star me-2"></i>
                            Reviews
                        </button>
                    </li>
                </ul>
            </div>

            <div className="card-body">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="overview-content">
                        {/* Service Images */}
                        <div className="service-images mb-4">
                            <h6 className="fw-semibold mb-3">Service Images</h6>
                            <ServiceGallery
                                service={service}
                                title={service.title}
                                images={
                                    service.service_images ||
                                    service.existing_images ||
                                    service.images ||
                                    []
                                }
                            />
                        </div>

                        {/* Description */}
                        <div className="service-description mb-4">
                            <h6 className="fw-semibold mb-3">Description</h6>
                            <p className="text-muted">{service.description}</p>
                        </div>

                        {/* Pricing & Duration */}
                        <div className="pricing-info mb-4">
                            <h6 className="fw-semibold mb-3">
                                Pricing & Duration
                            </h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="info-item p-3 bg-light rounded">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-dollar-sign text-success me-3"></i>
                                            <div>
                                                <div className="fw-semibold">
                                                    {getPricingDisplay()}
                                                </div>
                                                <small className="text-muted">
                                                    {service.pricing_type === "fixed"
                                                        ? "Fixed Price"
                                                        : service.pricing_type === "hourly"
                                                        ? "Hourly Rate"
                                                        : "Custom Pricing"}
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="info-item p-3 bg-light rounded">
                                        <div className="d-flex align-items-center">
                                            <i className="fas fa-clock text-info me-3"></i>
                                            <div>
                                                <div className="fw-semibold">
                                                    {service.duration_hours} hour
                                                    {service.duration_hours !== 1 ? "s" : ""}
                                                </div>
                                                <small className="text-muted">
                                                    Estimated Duration
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location & Service Areas */}
                        <div className="location-info mb-4">
                            <h6 className="fw-semibold mb-3">
                                Location & Service Areas
                            </h6>
                            <div className="row">
                                <div className="col-md-6">
                                    <div className="info-item p-3 bg-light rounded">
                                        <div className="d-flex align-items-start">
                                            <i className="fas fa-map-marker-alt text-danger me-3 mt-1"></i>
                                            <div>
                                                <div className="fw-semibold">
                                                    Service Location
                                                </div>
                                                <div className="text-muted">
                                                    {service.location.address}
                                                </div>
                                                <small className="text-muted">
                                                    Radius: {service.service_radius}km
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="info-item p-3 bg-light rounded">
                                        <div className="d-flex align-items-start">
                                            <i className="fas fa-map text-primary me-3 mt-1"></i>
                                            <div>
                                                <div className="fw-semibold">
                                                    Service Areas
                                                </div>
                                                <div className="d-flex flex-wrap gap-1 mt-2">
                                                    {service.service_areas.map(
                                                        (area, index) => (
                                                            <span
                                                                key={index}
                                                                className="badge bg-light text-dark"
                                                            >
                                                                {area}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        {service.includes && (
                            <div className="includes-info mb-4">
                                <h6 className="fw-semibold mb-3">What's Included</h6>
                                <div className="p-3 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                    <p className="mb-0">{service.includes}</p>
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        {service.requirements && (
                            <div className="requirements-info mb-4">
                                <h6 className="fw-semibold mb-3">Requirements</h6>
                                <div className="p-3 bg-warning bg-opacity-10 rounded border-start border-warning border-3">
                                    <p className="mb-0">{service.requirements}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="bookings-content">
                        <h6 className="fw-semibold mb-3">Recent Bookings</h6>
                        {service.recent_bookings && service.recent_bookings.length > 0 ? (
                            <div className="bookings-list">
                                {service.recent_bookings.map((booking) => (
                                    <div
                                        key={booking.id}
                                        className="booking-item border rounded p-3 mb-3"
                                    >
                                        <div className="row align-items-center">
                                            <div className="col-md-8">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="client-avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-3"
                                                        style={{
                                                            width: "40px",
                                                            height: "40px",
                                                        }}
                                                    >
                                                        {booking.client
                                                            .split(" ")
                                                            .map((n) => n[0])
                                                            .join("")}
                                                    </div>
                                                    <div>
                                                        <h6 className="mb-1">
                                                            {booking.client}
                                                        </h6>
                                                        <div className="text-muted small">
                                                            <i className="fas fa-calendar me-1"></i>
                                                            {booking.date} at {booking.time}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 text-end">
                                                <div className="mb-2">
                                                    <span
                                                        className={`badge ${
                                                            booking.status === "completed"
                                                                ? "bg-success"
                                                                : "bg-warning"
                                                        }`}
                                                    >
                                                        {booking.status}
                                                    </span>
                                                </div>
                                                <div className="fw-bold text-primary">
                                                    Rs. {booking.earnings.toLocaleString()}
                                                </div>
                                                {booking.rating && (
                                                    <div className="small text-warning">
                                                        {"★".repeat(booking.rating)}
                                                        {"☆".repeat(5 - booking.rating)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                <h6 className="text-muted">No bookings yet</h6>
                                <p className="text-muted">
                                    When clients book this service, they'll appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="reviews-content">
                        <h6 className="fw-semibold mb-3">Client Reviews</h6>
                        {service.recent_reviews && service.recent_reviews.length > 0 ? (
                            <div className="reviews-list">
                                {service.recent_reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="review-item border rounded p-3 mb-3"
                                    >
                                        <div className="d-flex align-items-start">
                                            <div
                                                className="client-avatar bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                {review.client
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">{review.client}</h6>
                                                        <div className="text-warning">
                                                            {"★".repeat(review.rating)}
                                                            {"☆".repeat(5 - review.rating)}
                                                        </div>
                                                    </div>
                                                    <small className="text-muted">
                                                        {review.date}
                                                    </small>
                                                </div>
                                                <p className="text-muted mb-0">
                                                    "{review.comment}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <i className="fas fa-star fa-3x text-muted mb-3"></i>
                                <h6 className="text-muted">No reviews yet</h6>
                                <p className="text-muted">
                                    Client reviews for this service will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceInfo;