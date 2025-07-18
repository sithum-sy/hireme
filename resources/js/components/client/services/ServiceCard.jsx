import React from "react";
import { Link } from "react-router-dom";

const ServiceCard = ({ service, showDistance = true }) => {
    console.log("Service image debug:", {
        service_id: service.id,
        first_image_url: service.first_image_url,
        service_images: service.service_images,
        service_title: service.title,
    });

    const handleImageError = (e) => {
        console.error("Image failed to load:", {
            src: e.target.src,
            service_id: service.id,
            error: e,
            naturalWidth: e.target.naturalWidth,
            naturalHeight: e.target.naturalHeight,
        });
    };

    const handleImageLoad = (e) => {
        console.log("Image loaded successfully:", {
            src: e.target.src,
            service_id: service.id,
            naturalWidth: e.target.naturalWidth,
            naturalHeight: e.target.naturalHeight,
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;

        // If it's already a full URL, return as is
        if (imagePath.startsWith("http")) {
            return imagePath;
        }

        // If it's a relative path, prepend your app URL
        if (imagePath.startsWith("/")) {
            return `${window.location.origin}${imagePath}`;
        }

        // If it's a storage path, prepend storage URL
        if (imagePath.startsWith("storage/")) {
            return `${window.location.origin}/${imagePath}`;
        }

        return imagePath;
    };

    return (
        <div className="service-card">
            <Link
                to={`/client/services/${service.id}`}
                className="text-decoration-none"
            >
                <div className="card h-100 border-0 shadow-sm">
                    {/* Service Image */}
                    <div className="service-image position-relative">
                        {/* Get image URL from multiple possible fields */}
                        {service.first_image_url ? (
                            <img
                                src={service.first_image_url}
                                alt={service.title}
                                className="card-img-top"
                                style={{ height: "200px", objectFit: "cover" }}
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                        ) : (
                            <div
                                className="card-img-top bg-light d-flex align-items-center justify-content-center"
                                style={{ height: "200px" }}
                            >
                                <i className="fas fa-image fa-3x text-muted"></i>
                            </div>
                        )}

                        {/* Category Badge */}
                        <div className="position-absolute top-0 start-0 m-2">
                            <span
                                className={`badge bg-${
                                    service.category.color || "primary"
                                }`}
                            >
                                <i
                                    className={`${service.category.icon} me-1`}
                                ></i>
                                {service.category.name}
                            </span>
                        </div>
                        {/* Verified Badge */}
                        {service.provider?.is_verified && (
                            <div className="position-absolute top-0 end-0 m-2">
                                <span className="badge bg-success">
                                    <i className="fas fa-check-circle me-1"></i>
                                    Verified
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="card-body p-3">
                        {/* Service Title */}
                        <h6 className="card-title fw-bold mb-2 text-dark">
                            {service.title}
                        </h6>

                        {/* Service Description */}
                        <p className="card-text text-muted small mb-3">
                            {service.description?.length > 100
                                ? service.description.substring(0, 100) + "..."
                                : service.description}
                        </p>

                        {/* Provider Info */}
                        <div className="provider-info d-flex align-items-center mb-2">
                            <div className="provider-avatar me-2">
                                {service.provider?.profile_image_url ? (
                                    <img
                                        src={service.provider.profile_image_url}
                                        alt={service.provider.name}
                                        className="rounded-circle"
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <div
                                        className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                        style={{
                                            width: "24px",
                                            height: "24px",
                                        }}
                                    >
                                        <i className="fas fa-user fa-xs"></i>
                                    </div>
                                )}
                            </div>
                            <small className="text-muted">
                                {service.business_name ||
                                    service.provider?.name}
                            </small>
                        </div>

                        {/* Rating and Reviews */}
                        <div className="rating-info d-flex align-items-center mb-2">
                            <div className="stars me-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                        key={star}
                                        className={`fas fa-star ${
                                            star <=
                                            (service.average_rating || 0)
                                                ? "text-warning"
                                                : "text-muted"
                                        }`}
                                        style={{ fontSize: "0.8rem" }}
                                    ></i>
                                ))}
                            </div>
                            <small className="text-muted">
                                {service.average_rating || 0} (
                                {service.reviews_count || 0} reviews)
                            </small>
                        </div>

                        {/* Price and Distance */}
                        <div className="service-meta d-flex justify-content-between align-items-center">
                            <div className="price">
                                <span className="fw-bold text-purple">
                                    {service.formatted_price ||
                                        `Rs. ${
                                            service.base_price || service.price
                                        }`}
                                </span>
                                {/* {service.pricing_type && (
                                    <small className="text-muted">
                                        /{service.pricing_type}
                                    </small>
                                )} */}
                            </div>

                            {showDistance && service.distance && (
                                <div className="distance">
                                    <small className="text-muted">
                                        <i className="fas fa-map-marker-alt me-1"></i>
                                        {service.distance}km
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions mt-3 d-flex gap-2">
                            {/* <button
                                className="btn btn-purple btn-sm flex-grow-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Handle quick book - could open modal or navigate
                                    window.location.href = `/client/services/${service.id}#book`;
                                }}
                            > */}
                            <button
                                className="btn btn-purple btn-sm flex-grow-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // Prevent event bubbling
                                    // Navigate to service detail page
                                    window.location.href = `/client/services/${service.id}`;
                                }}
                            >
                                <i className="fas fa-calendar-plus me-1"></i>
                                Book Now
                            </button>

                            <button
                                className="btn btn-outline-purple btn-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Handle add to favorites
                                    console.log(
                                        "Add to favorites:",
                                        service.id
                                    );
                                }}
                            >
                                <i className="far fa-heart"></i>
                            </button>
                        </div>
                    </div>

                    {/* Availability Status */}
                    {service.availability_status && (
                        <div className="card-footer bg-transparent border-top-0 p-2">
                            <div className="availability-status text-center">
                                <small
                                    className={`badge ${
                                        service.availability_status ===
                                        "available"
                                            ? "bg-success bg-opacity-10 text-success"
                                            : service.availability_status ===
                                              "busy"
                                            ? "bg-warning bg-opacity-10 text-warning"
                                            : "bg-danger bg-opacity-10 text-danger"
                                    }`}
                                >
                                    {service.availability_status ===
                                        "available" && "Available Today"}
                                    {service.availability_status === "busy" &&
                                        "Limited Availability"}
                                    {service.availability_status ===
                                        "unavailable" && "Fully Booked"}
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            </Link>

            <style>{`
                .service-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .service-card:hover {
                    transform: translateY(-2px);
                }
                .service-card:hover .card {
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15) !important;
                }
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
            `}</style>
        </div>
    );
};

export default ServiceCard;
