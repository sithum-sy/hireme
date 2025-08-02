import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useServices } from "../../../../context/ServicesContext";
import ServiceGallery from "../../../client/services/ServiceGallery";
import ProfileImage from "../../../ui/ProfileImage";
import Avatar from "../../../ui/Avatar";

const ServiceInfo = ({ service, activeTab, setActiveTab }) => {
    const { getServiceAppointments, getServiceReviews } = useServices();
    const [appointments, setAppointments] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);

    // Fetch appointments when bookings tab is active
    useEffect(() => {
        if (
            activeTab === "bookings" &&
            service?.id &&
            appointments.length === 0
        ) {
            fetchAppointments();
        }
    }, [activeTab, service?.id]);

    // Fetch reviews when reviews tab is active
    useEffect(() => {
        if (activeTab === "reviews" && service?.id && reviews.length === 0) {
            fetchReviews();
        }
    }, [activeTab, service?.id]);

    const fetchAppointments = async () => {
        if (!service?.id) return;

        setLoadingAppointments(true);
        try {
            const result = await getServiceAppointments(service.id);
            if (result.success) {
                setAppointments(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setLoadingAppointments(false);
        }
    };

    const fetchReviews = async () => {
        if (!service?.id) return;

        setLoadingReviews(true);
        try {
            const result = await getServiceReviews(service.id);
            if (result.success) {
                setReviews(result.data || []);
                // console.log("Review - ", result.data);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const formatAppointmentDate = (dateString, timeString) => {
        const date = new Date(dateString);
        const time = timeString ? timeString.substring(0, 5) : "";
        return `${date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })} at ${time}`;
    };

    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            pending: "bg-warning",
            confirmed: "bg-success",
            in_progress: "bg-primary",
            completed: "bg-info",
            cancelled_by_client: "bg-danger",
            cancelled_by_provider: "bg-danger",
            expired: "bg-dark",
        };
        return statusClasses[status] || "bg-secondary";
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Pending",
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled_by_client: "Cancelled",
            cancelled_by_provider: "Cancelled",
            expired: "Expired",
        };
        return statusTexts[status] || status.replace("_", " ");
    };

    // Smart Avatar Component for Clients
    const ClientAvatar = ({ client, size = 40, variant = "primary" }) => {
        const [imageError, setImageError] = useState(false);

        // If we have an image and no error, show ProfileImage
        if (client?.profile_image_url && !imageError) {
            return (
                <ProfileImage
                    src={client.profile_image_url}
                    alt={`${client.first_name || "Client"} ${
                        client.last_name || ""
                    }`}
                    size={size}
                    className={`border border-${variant} border-opacity-25`}
                    onError={() => setImageError(true)}
                />
            );
        }

        // Fallback to initials avatar
        return (
            <Avatar
                firstName={client?.first_name}
                lastName={client?.last_name}
                size={size}
                variant={variant}
                showImageFirst={false}
            />
        );
    };
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
                                                    {service.pricing_type ===
                                                    "fixed"
                                                        ? "Fixed Price"
                                                        : service.pricing_type ===
                                                          "hourly"
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
                                                    {service.duration_hours}{" "}
                                                    hour
                                                    {service.duration_hours !==
                                                    1
                                                        ? "s"
                                                        : ""}
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
                                                    Radius:{" "}
                                                    {service.service_radius}km
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
                                                    {(Array.isArray(
                                                        service.service_areas
                                                    )
                                                        ? service.service_areas
                                                        : []
                                                    ).map((area, index) => (
                                                        <span
                                                            key={index}
                                                            className="badge bg-light text-dark"
                                                        >
                                                            {area}
                                                        </span>
                                                    ))}
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
                                <h6 className="fw-semibold mb-3">
                                    What's Included
                                </h6>
                                <div className="p-3 bg-success bg-opacity-10 rounded border-start border-success border-3">
                                    <p className="mb-0">{service.includes}</p>
                                </div>
                            </div>
                        )}

                        {/* Requirements */}
                        {service.requirements && (
                            <div className="requirements-info mb-4">
                                <h6 className="fw-semibold mb-3">
                                    Requirements
                                </h6>
                                <div className="p-3 bg-warning bg-opacity-10 rounded border-start border-warning border-3">
                                    <p className="mb-0">
                                        {service.requirements}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recent Bookings Tab */}
                {activeTab === "bookings" && (
                    <div className="bookings-content">
                        <h6 className="fw-semibold mb-3">Recent Bookings</h6>
                        {loadingAppointments ? (
                            <div className="text-center py-4">
                                <div
                                    className="spinner-border text-primary mb-3"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                                <p className="text-muted">
                                    Loading appointments...
                                </p>
                            </div>
                        ) : appointments && appointments.length > 0 ? (
                            <div className="bookings-list">
                                {appointments.map((appointment) => (
                                    <div
                                        key={appointment.id}
                                        className="booking-item border rounded p-3 mb-3 bg-white shadow-sm"
                                        style={{
                                            transition: "all 0.2s ease",
                                            cursor: "default",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(-2px)";
                                            e.currentTarget.style.boxShadow =
                                                "0 4px 12px rgba(0,0,0,0.1)";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform =
                                                "translateY(0)";
                                            e.currentTarget.style.boxShadow =
                                                "0 2px 4px rgba(0,0,0,0.05)";
                                        }}
                                    >
                                        <div className="row align-items-center">
                                            <div className="col-md-8">
                                                <div className="d-flex align-items-center">
                                                    <div className="me-3">
                                                        <ClientAvatar
                                                            client={
                                                                appointment.client
                                                            }
                                                            size={40}
                                                            variant="primary"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <h6 className="mb-1">
                                                                {appointment
                                                                    .client
                                                                    ?.first_name ||
                                                                    "Client"}{" "}
                                                                {appointment
                                                                    .client
                                                                    ?.last_name ||
                                                                    ""}
                                                            </h6>
                                                            <small className="text-muted">
                                                                #APT
                                                                {appointment.id}
                                                            </small>
                                                        </div>
                                                        <div className="text-muted small">
                                                            <i className="fas fa-calendar me-1"></i>
                                                            {formatAppointmentDate(
                                                                appointment.appointment_date,
                                                                appointment.appointment_time
                                                            )}
                                                        </div>
                                                        {appointment.client_address && (
                                                            <div className="text-muted small">
                                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                                {
                                                                    appointment.client_address
                                                                }
                                                            </div>
                                                        )}
                                                        {appointment.client_notes && (
                                                            <div className="text-muted small mt-1">
                                                                <i className="fas fa-comment me-1"></i>
                                                                <span
                                                                    className="text-truncate d-inline-block"
                                                                    style={{
                                                                        maxWidth:
                                                                            "250px",
                                                                    }}
                                                                >
                                                                    {
                                                                        appointment.client_notes
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4 text-end">
                                                <div className="mb-2">
                                                    <span
                                                        className={`badge ${getStatusBadgeClass(
                                                            appointment.status
                                                        )}`}
                                                    >
                                                        {getStatusText(
                                                            appointment.status
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="fw-bold text-primary mb-2">
                                                    Rs.{" "}
                                                    {(
                                                        appointment.total_price ||
                                                        0
                                                    ).toLocaleString()}
                                                </div>
                                                {appointment.client_review
                                                    ?.rating && (
                                                    <div className="small text-warning mb-2">
                                                        {"★".repeat(
                                                            appointment
                                                                .client_review
                                                                .rating
                                                        )}
                                                        {"☆".repeat(
                                                            5 -
                                                                appointment
                                                                    .client_review
                                                                    .rating
                                                        )}
                                                    </div>
                                                )}
                                                <div className="small text-muted mb-2">
                                                    {appointment.duration_hours}
                                                    h duration
                                                </div>
                                                <div className="d-flex flex-column gap-2">
                                                    <Link
                                                        to={`/provider/appointments/${appointment.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                        title="View appointment details"
                                                    >
                                                        <i className="fas fa-eye me-1"></i>
                                                        View Details
                                                    </Link>
                                                    {(appointment.status ===
                                                        "pending" ||
                                                        appointment.status ===
                                                            "confirmed") && (
                                                        <div className="small text-muted">
                                                            <i className="fas fa-clock me-1"></i>
                                                            {appointment.status ===
                                                            "pending"
                                                                ? "Awaiting confirmation"
                                                                : "Scheduled"}
                                                        </div>
                                                    )}
                                                </div>
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
                                    When clients book this service, they'll
                                    appear here.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="reviews-content">
                        <h6 className="fw-semibold mb-3">Client Reviews</h6>
                        {loadingReviews ? (
                            <div className="text-center py-4">
                                <div
                                    className="spinner-border text-primary mb-3"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                                <p className="text-muted">Loading reviews...</p>
                            </div>
                        ) : reviews && reviews.length > 0 ? (
                            <div className="reviews-list">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="review-item border rounded p-3 mb-3"
                                    >
                                        <div className="d-flex align-items-start">
                                            <div className="me-3">
                                                <ClientAvatar
                                                    client={review.reviewer}
                                                    size={40}
                                                    variant="warning"
                                                />
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1">
                                                            {review.reviewer
                                                                ?.first_name ||
                                                                "Client"}{" "}
                                                            {review.reviewer
                                                                ?.last_name ||
                                                                ""}
                                                        </h6>
                                                        <div className="text-warning mb-1">
                                                            {"★".repeat(
                                                                review.rating ||
                                                                    0
                                                            )}
                                                            {"☆".repeat(
                                                                5 -
                                                                    (review.rating ||
                                                                        0)
                                                            )}
                                                            <span className="ms-2 small text-muted">
                                                                ({review.rating}
                                                                /5)
                                                            </span>
                                                        </div>
                                                        {review.would_recommend && (
                                                            <div className="small text-success">
                                                                <i className="fas fa-thumbs-up me-1"></i>
                                                                Recommends this
                                                                service
                                                            </div>
                                                        )}
                                                    </div>
                                                    <small className="text-muted">
                                                        {new Date(
                                                            review.created_at
                                                        ).toLocaleDateString()}
                                                    </small>
                                                </div>
                                                {review.comment && (
                                                    <p className="text-muted mb-2">
                                                        "{review.comment}"
                                                    </p>
                                                )}
                                                {review.provider_response && (
                                                    <div className="provider-response mt-3 p-2 bg-light rounded">
                                                        <div className="small text-muted mb-1">
                                                            <strong>
                                                                Provider
                                                                Response:
                                                            </strong>
                                                        </div>
                                                        <p className="small text-dark mb-0">
                                                            {
                                                                review.provider_response
                                                            }
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="d-flex flex-column gap-2">
                                                    <Link
                                                        // to={`/provider/appointments/${appointment.id}`}
                                                        to={`/provider/appointments/${review.appointment.id}`}
                                                        className="btn btn-outline-primary btn-sm"
                                                        title="View appointment details"
                                                    >
                                                        <i className="fas fa-eye me-1"></i>
                                                        View Details
                                                    </Link>
                                                </div>
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
                                    Client reviews for this service will appear
                                    here.
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
