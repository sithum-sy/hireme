import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useServicePrimaryImage } from "../../../hooks/useServiceImages";

import { useState } from "react";

const ServiceCard = ({ service, showDistance = true }) => {
    const navigate = useNavigate();
    const primaryImage = useServicePrimaryImage(service);
    const [imageError, setImageError] = useState(false);

    return (
        <div className="service-card">
            <Link
                to={`/client/services/${service.id}`}
                className="text-decoration-none"
            >
                <div className="card h-100 border-0 shadow-sm">
                    {/* Service Image */}
                    <div className="service-image position-relative">
                        {primaryImage && !imageError ? (
                            <img
                                src={primaryImage}
                                alt={service.title}
                                className="card-img-top"
                                style={{
                                    height: "200px",
                                    objectFit: "cover",
                                }}
                                onError={() => {
                                    console.error(
                                        "Image failed to load:",
                                        primaryImage
                                    );
                                    setImageError(true);
                                }}
                            />
                        ) : null}

                        {/* Fallback placeholder - only show if no primary image or image fails to load */}
                        {(imageError || !primaryImage) && (
                            <div
                                className={`image-fallback card-img-top bg-light d-flex align-items-center justify-content-center`}
                                style={{
                                    height: "200px",
                                    display: "flex",
                                }}
                            >
                                <div className="text-center text-muted">
                                    <i className="fas fa-image fa-2x mb-2"></i>
                                    <div>
                                        {primaryImage
                                            ? "Image unavailable"
                                            : "No image"}
                                    </div>
                                </div>
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
                            {(() => {
                                const description = service.description || "";
                                return description.length > 100
                                    ? description.substring(0, 100) + "..."
                                    : description;
                            })()}
                        </p>

                        {/* Provider Info */}
                        <div className="provider-info d-flex align-items-center mb-2">
                            <div className="provider-avatar me-2">
                                {(() => {
                                    // Construct proper profile image URL
                                    let profileImageUrl =
                                        service.provider?.profile_image_url;

                                    if (profileImageUrl) {
                                        // If it's a relative path, construct full URL
                                        if (
                                            !profileImageUrl.startsWith(
                                                "http"
                                            ) &&
                                            !profileImageUrl.startsWith("/")
                                        ) {
                                            profileImageUrl = `/images/profiles/${profileImageUrl}`;
                                        }
                                        // If it already starts with /images/profiles/, keep as is
                                        else if (
                                            profileImageUrl.startsWith(
                                                "images/profiles/"
                                            )
                                        ) {
                                            profileImageUrl =
                                                "/" + profileImageUrl;
                                        }
                                    }

                                    return profileImageUrl ? (
                                        <img
                                            src={profileImageUrl}
                                            alt={service.provider.name}
                                            className="rounded-circle"
                                            style={{
                                                width: "24px",
                                                height: "24px",
                                                objectFit: "cover",
                                            }}
                                            onError={(e) => {
                                                // Hide failed image and show fallback
                                                e.target.style.display = "none";
                                                const fallback =
                                                    e.target.nextSibling;
                                                if (fallback) {
                                                    fallback.style.display =
                                                        "flex";
                                                }
                                            }}
                                        />
                                    ) : null;
                                })()}

                                {/* Fallback avatar */}
                                <div
                                    className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "24px",
                                        height: "24px",
                                        display: service.provider
                                            ?.profile_image_url
                                            ? "none"
                                            : "flex",
                                    }}
                                >
                                    <i className="fas fa-user fa-xs"></i>
                                </div>
                            </div>
                            <small className="text-muted">
                                {service.business_name ||
                                    service.provider?.name ||
                                    "Unknown Provider"}
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
                                <span className="fw-bold text-primary">
                                    {service.formatted_price ||
                                        `Rs. ${
                                            service.base_price ||
                                            service.price ||
                                            0
                                        }`}
                                </span>
                            </div>

                            {showDistance && service.distance != null && (
                                <div className="distance">
                                    <small className="text-muted">
                                        <i className="fas fa-map-marker-alt me-1"></i>
                                        {service.distance} km away
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions mt-3 d-flex gap-2">
                            <button
                                className="btn btn-primary btn-sm flex-grow-1"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Navigate to service detail page with booking hash
                                    navigate(`/client/services/${service.id}#book`);
                                }}
                            >
                                <i className="fas fa-calendar-plus me-1"></i>
                                Book Now
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
                /* Using CSS variables for consistent theming */
            `}</style>
        </div>
    );
};

export default ServiceCard;
