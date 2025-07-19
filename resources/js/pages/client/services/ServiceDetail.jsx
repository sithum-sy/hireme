import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import { useClient } from "../../../context/ClientContext";
import clientService from "../../../services/clientService";
import ServiceGallery from "../../../components/client/services/ServiceGallery";
import ServiceReviews from "../../../components/client/services/ServiceReviews";
import SimilarServices from "../../../components/client/services/SimilarServices";
import BookingModal from "../../../components/client/booking/BookingModal";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProviderAvailabilitySlots from "../../../components/client/services/ProviderAvailabilitySlots";
import QuoteRequestModal from "../../../components/client/booking/QuoteRequestModal";

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { location } = useClient();

    // Add debugging
    // console.log("ServiceDetail mounted with ID:", id);
    // console.log("Current URL:", window.location.href);

    const [service, setService] = useState(null);
    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showQuoteModal, setShowQuoteModal] = useState(false);
    const [activeBookingTab, setActiveBookingTab] = useState("availability");
    const [clientLocation, setClientLocation] = useState(null);

    useEffect(() => {
        if (navigator.geolocation && !clientLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setClientLocation({
                        lat: latitude,
                        lng: longitude,
                    });
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, []);

    // useEffect(() => {
    //     // console.log("=== DEBUG INFO ===");
    //     // console.log("Service ID:", id);
    //     // console.log("Current URL:", window.location.href);

    //     // Test the API call directly
    //     const testAPICall = async () => {
    //         try {
    //             const response = await fetch(`/api/client/services/${id}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${localStorage.getItem(
    //                         "token"
    //                     )}`,
    //                     "Content-Type": "application/json",
    //                 },
    //             });
    //             const data = await response.json();
    //             // console.log("Direct API call result:", data);
    //             // console.log("Response status:", response.status);
    //             // console.log("Response headers:", response.headers);
    //         } catch (error) {
    //             console.log("Direct API call error:", error);
    //         }
    //     };

    //     // testAPICall();

    //     if (id) {
    //         loadServiceDetail();
    //     } else {
    //         console.error("No service ID provided");
    //         navigate("/client/services", { replace: true });
    //     }
    // }, [id]);

    // const loadServiceDetail = async () => {
    //     setLoading(true);

    //     try {
    //         const response = await clientService.getServiceDetail(id);

    //         if (response.success) {
    //             setService(response.data.service);
    //             setProvider(response.data.provider);
    //             setIsFavorite(response.data.is_favorite || false);
    //         } else {
    //             navigate("/client/services", { replace: true });
    //         }
    //     } catch (error) {
    //         console.error("Failed to load service:", error);
    //         navigate("/client/services", { replace: true });
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const loadServiceDetail = async () => {
        setLoading(true);

        try {
            // ✅ Pass client location to service
            const response = await clientService.getServiceDetail(
                id,
                clientLocation
            );

            if (response.success && response.data) {
                // Handle different possible data structures
                let serviceData, providerData;

                if (response.data.service) {
                    serviceData = response.data.service;
                    providerData = response.data.provider;
                } else if (response.data.id) {
                    serviceData = response.data;
                    providerData =
                        response.data.provider || getFallbackProvider();
                } else {
                    console.error("Unexpected data structure:", response.data);
                    throw new Error("Invalid service data structure");
                }

                setService(serviceData);
                setProvider(providerData);
                setIsFavorite(response.data.is_favorite || false);
            } else {
                console.error("Failed to load service:", response.message);
                navigate("/client/services", { replace: true });
            }
        } catch (error) {
            console.error("Error loading service:", error);
            navigate("/client/services", { replace: true });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            loadServiceDetail();
        }
    }, [id, clientLocation]);

    useEffect(() => {
        if (window.location.hash === "#book") {
            setShowBookingModal(true);
        }
    }, []);

    // Add this helper function inside the component
    const getFallbackProvider = () => {
        return {
            id: 1,
            name: "Professional Service Provider",
            profile_image_url: null,
            bio: "Experienced service provider with excellent reviews.",
            is_verified: true,
            city: "Colombo",
            province: "Western Province",
            service_radius: 25,
            travel_fee: 50,
            average_rating: 4.5,
            reviews_count: 50,
            total_services: 5,
            completed_bookings: 100,
            years_experience: 3,
            response_time: "2 hours",
        };
    };

    const handleBookNow = () => {
        setShowBookingModal(true);
        window.history.pushState(null, "", `#book`);
    };

    const handleContactProvider = () => {
        // Open contact modal or navigate to messages
        console.log("Contact provider:", provider.id);
    };

    const safeParseJson = (field) => {
        if (!field) return [];

        // If it's already an array, return it
        if (Array.isArray(field)) return field;

        // If it's an object, return its values
        if (typeof field === "object") return Object.values(field);

        // If it's a string, try to parse it
        if (typeof field === "string") {
            try {
                const parsed = JSON.parse(field);
                return Array.isArray(parsed)
                    ? parsed
                    : Object.values(parsed || {});
            } catch (error) {
                // console.warn("Failed to parse JSON field:", field);
                // If parsing fails, split by common delimiters
                return field
                    .split(/[,\n;]/)
                    .map((item) => item.trim())
                    .filter((item) => item.length > 0);
            }
        }

        return [];
    };

    if (loading) {
        return (
            <ClientLayout>
                <LoadingSpinner message="Loading service details..." />
            </ClientLayout>
        );
    }

    if (!service) {
        return (
            <ClientLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Service not found</h4>
                    <p className="text-muted">
                        The service you're looking for doesn't exist.
                    </p>
                    <Link to="/client/services" className="btn btn-purple">
                        Browse Services
                    </Link>
                </div>
            </ClientLayout>
        );
    }

    return (
        <ClientLayout>
            <div className="service-detail-page">
                <div className="row">
                    {/* Main Content */}
                    <div className="col-lg-8">
                        {/* Service Header */}
                        <div className="service-header mb-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h1 className="fw-bold mb-2">
                                        {service.title}
                                    </h1>
                                    <div className="service-meta d-flex align-items-center gap-3 mb-2">
                                        <div className="category">
                                            <span
                                                className={`badge bg-${
                                                    service.category.color ||
                                                    "primary"
                                                }`}
                                            >
                                                <i
                                                    className={`${service.category.icon} me-1`}
                                                ></i>
                                                {service.category.name}
                                            </span>
                                        </div>

                                        <div className="rating">
                                            <div className="stars me-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`fas fa-star ${
                                                            star <=
                                                            (service.average_rating ||
                                                                0)
                                                                ? "text-warning"
                                                                : "text-muted"
                                                        }`}
                                                    ></i>
                                                ))}
                                            </div>
                                            <span className="fw-semibold">
                                                {service.average_rating || 0}
                                            </span>
                                            <span className="text-muted">
                                                ({service.total_reviews || 0}{" "}
                                                reviews)
                                            </span>
                                        </div>

                                        {/* Show distance only if user's location is available and service.distance is provided */}
                                        {/* {location && service.distance && (
                                            <div className="distance">
                                                <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                                <span className="text-muted">
                                                    {service.distance} km away
                                                </span>
                                            </div>
                                        )} */}

                                        {service?.distance != null && (
                                            <div className="distance">
                                                <i className="fas fa-map-marker-alt text-muted me-1"></i>
                                                <span className="text-muted">
                                                    {service.distance} km away
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="service-actions d-flex gap-2">
                                    {/* <button
                                        className={`btn ${
                                            isFavorite
                                                ? "btn-danger"
                                                : "btn-outline-danger"
                                        }`}
                                        onClick={handleToggleFavorite}
                                    >
                                        <i
                                            className={`${
                                                isFavorite ? "fas" : "far"
                                            } fa-heart`}
                                        ></i>
                                    </button> */}

                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() =>
                                            navigator.share &&
                                            navigator.share({
                                                title: service.title,
                                                url: window.location.href,
                                            })
                                        }
                                    >
                                        <i className="fas fa-share-alt"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Service Images */}
                            <ServiceGallery
                                images={service.images || []}
                                title={service.title || "Service Gallery"}
                            />
                        </div>

                        {/* Service Tabs */}
                        <div className="service-tabs mb-4">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            activeTab === "overview"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("overview")}
                                    >
                                        Overview
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            activeTab === "reviews"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("reviews")}
                                    >
                                        Reviews ({service.reviews_count || 0})
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            activeTab === "provider"
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => setActiveTab("provider")}
                                    >
                                        About Provider
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeTab === "overview" && (
                                <div className="overview-tab">
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body">
                                            <h5 className="fw-bold mb-3">
                                                Service Description
                                            </h5>
                                            <div className="service-description">
                                                {service.description
                                                    ?.split("\n")
                                                    .map((paragraph, index) => (
                                                        <p
                                                            key={index}
                                                            className="mb-3"
                                                        >
                                                            {paragraph}
                                                        </p>
                                                    ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Service Features */}
                                    {service.includes && (
                                        <div className="card border-0 shadow-sm mb-4">
                                            <div className="card-body">
                                                <h5 className="fw-bold mb-3">
                                                    What's Included
                                                </h5>
                                                <div className="row">
                                                    {safeParseJson(
                                                        service.includes
                                                    ).map((feature, index) => (
                                                        <div
                                                            key={index}
                                                            className="col-md-6 mb-2"
                                                        >
                                                            <div className="d-flex align-items-center">
                                                                <i className="fas fa-check-circle text-success me-2"></i>
                                                                <span>
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Requirements */}
                                    {service.requirements && (
                                        <div className="card border-0 shadow-sm mb-4">
                                            <div className="card-body">
                                                <h5 className="fw-bold mb-3">
                                                    Requirements
                                                </h5>
                                                <ul className="list-unstyled">
                                                    {safeParseJson(
                                                        service.requirements
                                                    ).map(
                                                        (
                                                            requirement,
                                                            index
                                                        ) => (
                                                            <li
                                                                key={index}
                                                                className="mb-2"
                                                            >
                                                                <i className="fas fa-info-circle text-info me-2"></i>
                                                                {requirement}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* Service Area */}
                                    {service.service_areas && (
                                        <div className="card border-0 shadow-sm mb-4">
                                            <div className="card-body">
                                                <h5 className="fw-bold mb-3">
                                                    Service Areas
                                                </h5>
                                                <div className="service-areas">
                                                    {safeParseJson(
                                                        service.service_areas
                                                    ).map((area, index) => (
                                                        <span
                                                            key={index}
                                                            className="badge bg-light text-dark me-2 mb-2"
                                                        >
                                                            <i className="fas fa-map-marker-alt me-1"></i>
                                                            {area}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <ServiceReviews serviceId={service.id} />
                            )}

                            {activeTab === "provider" && (
                                <div className="provider-tab">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <div className="d-flex align-items-start mb-4">
                                                <div className="provider-avatar me-3">
                                                    {provider.profile_image_url ? (
                                                        <img
                                                            src={
                                                                provider.profile_image_url
                                                            }
                                                            alt={provider.name}
                                                            className="rounded-circle"
                                                            style={{
                                                                width: "80px",
                                                                height: "80px",
                                                                objectFit:
                                                                    "cover",
                                                            }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "80px",
                                                                height: "80px",
                                                            }}
                                                        >
                                                            <i className="fas fa-user fa-2x"></i>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="provider-info flex-grow-1">
                                                    <h5 className="fw-bold mb-1">
                                                        {service.business_name ||
                                                            provider.name}
                                                        {provider.is_verified && (
                                                            <span className="badge bg-success ms-2">
                                                                <i className="fas fa-check-circle me-1"></i>
                                                                Verified
                                                            </span>
                                                        )}
                                                    </h5>
                                                    <p className="text-muted mb-2">
                                                        {provider.bio}
                                                    </p>

                                                    <div className="provider-stats row">
                                                        <div className="col-6 col-md-3 mb-2">
                                                            <div className="stat">
                                                                <div className="stat-value fw-bold">
                                                                    {provider.total_services ||
                                                                        0}
                                                                </div>
                                                                <div className="stat-label text-muted small">
                                                                    Services
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-md-3 mb-2">
                                                            <div className="stat">
                                                                <div className="stat-value fw-bold">
                                                                    {provider.completed_bookings ||
                                                                        0}
                                                                </div>
                                                                <div className="stat-label text-muted small">
                                                                    Completed
                                                                    Jobs
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-md-3 mb-2">
                                                            <div className="stat">
                                                                <div className="stat-value fw-bold">
                                                                    {provider.years_experience ||
                                                                        0}
                                                                </div>
                                                                <div className="stat-label text-muted small">
                                                                    Years
                                                                    Experience
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-6 col-md-3 mb-2">
                                                            <div className="stat">
                                                                <div className="stat-value fw-bold">
                                                                    {provider.response_time ||
                                                                        "N/A"}
                                                                </div>
                                                                <div className="stat-label text-muted small">
                                                                    Response
                                                                    Time
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Provider Services */}
                                            <div className="provider-services">
                                                <h6 className="fw-bold mb-3">
                                                    Other Services by{" "}
                                                    {provider.name}
                                                </h6>
                                                <div className="row">
                                                    {provider.other_services
                                                        ?.slice(0, 3)
                                                        .map((otherService) => (
                                                            <div
                                                                key={
                                                                    otherService.id
                                                                }
                                                                className="col-md-4 mb-3"
                                                            >
                                                                <Link
                                                                    to={`/client/services/${otherService.id}`}
                                                                    className="text-decoration-none"
                                                                >
                                                                    <div className="card border">
                                                                        <div className="card-body p-3">
                                                                            <h6 className="card-title small mb-1">
                                                                                {
                                                                                    otherService.title
                                                                                }
                                                                            </h6>
                                                                            <div className="d-flex justify-content-between">
                                                                                <small className="text-muted">
                                                                                    {
                                                                                        otherService
                                                                                            .category
                                                                                            .name
                                                                                    }
                                                                                </small>
                                                                                <small className="fw-bold text-purple">
                                                                                    {
                                                                                        otherService.formatted_price
                                                                                    }
                                                                                </small>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            </div>
                                                        ))}
                                                </div>

                                                {provider.total_services >
                                                    3 && (
                                                    <Link
                                                        to={`/client/providers/${provider.id}`}
                                                        className="btn btn-outline-purple btn-sm"
                                                    >
                                                        View All Services (
                                                        {
                                                            provider.total_services
                                                        }
                                                        )
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Sidebar */}
                    <div className="col-lg-4">
                        <div
                            className="booking-sidebar position-sticky"
                            style={{ top: "2rem" }}
                        >
                            {/* Pricing Card */}
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-body">
                                    <div className="pricing-info mb-4">
                                        <div className="price d-flex align-items-baseline mb-2">
                                            <span className="price-amount fw-bold h4 text-purple mb-0">
                                                {service.formatted_price ||
                                                    `Rs. ${service.base_price}`}
                                            </span>
                                            {/* {service.pricing_type && (
                                                <span className="price-unit text-muted ms-1">
                                                    /{service.pricing_type}
                                                </span>
                                            )} */}
                                        </div>

                                        {/* Pricing Type Info */}
                                        <div className="pricing-details mb-3">
                                            <small className="text-muted">
                                                {service.pricing_type ===
                                                    "hourly" && "Hourly rate"}
                                                {service.pricing_type ===
                                                    "fixed" &&
                                                    "Fixed price for complete service"}
                                                {service.pricing_type ===
                                                    "custom" &&
                                                    "Custom pricing based on requirements"}
                                                {!service.pricing_type &&
                                                    "Service pricing"}
                                            </small>
                                        </div>

                                        {service.original_price &&
                                            service.original_price >
                                                service.base_price && (
                                                <div className="discount-info">
                                                    <span className="original-price text-muted text-decoration-line-through me-2">
                                                        Rs.{" "}
                                                        {service.original_price}
                                                    </span>
                                                    <span className="discount badge bg-success">
                                                        {Math.round(
                                                            (1 -
                                                                service.base_price /
                                                                    service.original_price) *
                                                                100
                                                        )}
                                                        % OFF
                                                    </span>
                                                </div>
                                            )}

                                        {/* Availability Status */}
                                        <div className="availability-status mt-3">
                                            <div
                                                className={`status-indicator d-flex align-items-center ${
                                                    service.availability_status ===
                                                    "available"
                                                        ? "text-success"
                                                        : service.availability_status ===
                                                          "busy"
                                                        ? "text-warning"
                                                        : "text-danger"
                                                }`}
                                            >
                                                <div
                                                    className={`status-dot me-2 ${
                                                        service.availability_status ===
                                                        "available"
                                                            ? "bg-success"
                                                            : service.availability_status ===
                                                              "busy"
                                                            ? "bg-warning"
                                                            : "bg-danger"
                                                    }`}
                                                    style={{
                                                        width: "8px",
                                                        height: "8px",
                                                        borderRadius: "50%",
                                                    }}
                                                ></div>
                                                <span className="fw-semibold">
                                                    {service.availability_status ===
                                                        "available" &&
                                                        "Available Now"}
                                                    {service.availability_status ===
                                                        "busy" &&
                                                        "Limited Availability"}
                                                    {service.availability_status ===
                                                        "unavailable" &&
                                                        "Fully Booked"}
                                                </span>
                                            </div>
                                            {service.next_available && (
                                                <small className="text-muted">
                                                    Next available:{" "}
                                                    {service.next_available}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {/* Booking Tabs */}
                                    <div className="booking-tabs mb-3">
                                        <ul className="nav nav-pills nav-fill">
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${
                                                        activeBookingTab ===
                                                        "availability"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setActiveBookingTab(
                                                            "availability"
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-calendar me-1"></i>
                                                    Book Now
                                                </button>
                                            </li>
                                            <li className="nav-item">
                                                <button
                                                    className={`nav-link ${
                                                        activeBookingTab ===
                                                        "quote"
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        setActiveBookingTab(
                                                            "quote"
                                                        )
                                                    }
                                                >
                                                    <i className="fas fa-quote-left me-1"></i>
                                                    Get Quote
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="tab-content">
                                        {activeBookingTab ===
                                            "availability" && (
                                            <div className="availability-tab">
                                                <ProviderAvailabilitySlots
                                                    service={service}
                                                    provider={provider}
                                                    selectedDate={selectedDate}
                                                    onDateChange={
                                                        setSelectedDate
                                                    }
                                                    onSlotSelect={(slot) => {
                                                        setSelectedSlot(slot);
                                                        setShowBookingModal(
                                                            true
                                                        );
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {activeBookingTab === "quote" && (
                                            <div className="quote-tab">
                                                <div className="quote-info mb-3">
                                                    <h6 className="fw-bold mb-2">
                                                        Request Custom Quote
                                                    </h6>
                                                    <p className="text-muted small mb-3">
                                                        Get a personalized quote
                                                        based on your specific
                                                        requirements
                                                    </p>

                                                    <div className="quote-benefits">
                                                        <div className="benefit-item d-flex align-items-center mb-2">
                                                            <i className="fas fa-check-circle text-success me-2"></i>
                                                            <small>
                                                                Free
                                                                consultation
                                                            </small>
                                                        </div>
                                                        <div className="benefit-item d-flex align-items-center mb-2">
                                                            <i className="fas fa-calculator text-info me-2"></i>
                                                            <small>
                                                                Detailed pricing
                                                                breakdown
                                                            </small>
                                                        </div>
                                                        <div className="benefit-item d-flex align-items-center mb-2">
                                                            <i className="fas fa-clock text-warning me-2"></i>
                                                            <small>
                                                                Response within
                                                                24 hours
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-grid gap-2">
                                                    <button
                                                        className="btn btn-purple"
                                                        onClick={() => {
                                                            if (!selectedDate) {
                                                                // Set today as default if no date selected
                                                                const today =
                                                                    new Date();
                                                                const todayString =
                                                                    today
                                                                        .toISOString()
                                                                        .split(
                                                                            "T"
                                                                        )[0];
                                                                setSelectedDate(
                                                                    todayString
                                                                );
                                                                setSelectedSlot(
                                                                    {
                                                                        date: todayString,
                                                                        time: "09:00",
                                                                        formatted_time:
                                                                            "9:00 AM",
                                                                    }
                                                                );
                                                            } else if (
                                                                !selectedSlot
                                                            ) {
                                                                setSelectedSlot(
                                                                    {
                                                                        date: selectedDate,
                                                                        time: "09:00",
                                                                        formatted_time:
                                                                            "9:00 AM",
                                                                    }
                                                                );
                                                            }
                                                            setShowQuoteModal(
                                                                true
                                                            );
                                                        }}
                                                        disabled={
                                                            service.availability_status ===
                                                            "unavailable"
                                                        }
                                                    >
                                                        <i className="fas fa-quote-left me-2"></i>
                                                        Request Quote
                                                    </button>

                                                    <button
                                                        className="btn btn-outline-purple"
                                                        onClick={
                                                            handleContactProvider
                                                        }
                                                    >
                                                        <i className="fas fa-comments me-2"></i>
                                                        Chat with Provider
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Service Guarantees */}
                                    <div className="service-guarantees mt-4">
                                        <div className="guarantee-item d-flex align-items-center mb-2">
                                            <i className="fas fa-shield-alt text-success me-2"></i>
                                            <small className="text-muted">
                                                Satisfaction Guaranteed
                                            </small>
                                        </div>
                                        <div className="guarantee-item d-flex align-items-center mb-2">
                                            <i className="fas fa-clock text-info me-2"></i>
                                            <small className="text-muted">
                                                24/7 Customer Support
                                            </small>
                                        </div>
                                        <div className="guarantee-item d-flex align-items-center">
                                            <i className="fas fa-credit-card text-warning me-2"></i>
                                            <small className="text-muted">
                                                Secure Payment
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="fw-bold mb-3">
                                        Service Information
                                    </h6>

                                    <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Duration:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.duration ||
                                                (service.duration_hours
                                                    ? `${service.duration_hours} hours`
                                                    : "Flexible")}
                                        </span>
                                    </div>

                                    <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Pricing Type:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.pricing_type ===
                                                "hourly" && "Per Hour"}
                                            {service.pricing_type === "fixed" &&
                                                "Fixed Price"}
                                            {service.pricing_type ===
                                                "custom" && "Custom Quote"}
                                            {!service.pricing_type &&
                                                "Standard"}
                                        </span>
                                    </div>

                                    <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Service Location:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.service_location ||
                                                "At your location"}
                                        </span>
                                    </div>

                                    <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Cancellation:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.cancellation_policy ||
                                                "Free cancellation"}
                                        </span>
                                    </div>

                                    {service.languages && (
                                        <div className="info-item d-flex justify-content-between mb-2">
                                            <span className="text-muted">
                                                Languages:
                                            </span>
                                            <span className="fw-semibold">
                                                {Array.isArray(
                                                    service.languages
                                                )
                                                    ? service.languages.join(
                                                          ", "
                                                      )
                                                    : service.languages}
                                            </span>
                                        </div>
                                    )}

                                    {/* Service Stats */}
                                    <hr className="my-3" />
                                    <div className="service-stats">
                                        <div className="stat-item d-flex justify-content-between mb-1">
                                            <small className="text-muted">
                                                Views:
                                            </small>
                                            <small className="fw-semibold">
                                                {service.views_count || 0}
                                            </small>
                                        </div>
                                        <div className="stat-item d-flex justify-content-between">
                                            <small className="text-muted">
                                                Bookings:
                                            </small>
                                            <small className="fw-semibold">
                                                {service.bookings_count || 0}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Similar Services */}
                <div className="similar-services mt-5">
                    <SimilarServices
                        serviceId={service.id}
                        categoryId={service.category.id}
                        location={location}
                    />
                </div>

                {/* Booking Modal */}
                <BookingModal
                    show={showBookingModal}
                    onHide={() => {
                        setShowBookingModal(false);
                        window.history.pushState(
                            null,
                            "",
                            window.location.pathname
                        );
                    }}
                    service={service}
                    provider={provider}
                />

                {/* Quote Request Modal */}
                <QuoteRequestModal
                    show={showQuoteModal}
                    onHide={() => setShowQuoteModal(false)}
                    service={service}
                    provider={provider}
                    selectedSlot={
                        selectedSlot || {
                            date:
                                selectedDate ||
                                new Date().toISOString().split("T")[0],
                            time: "09:00",
                            formatted_time: "9:00 AM",
                        }
                    }
                />
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
                .nav-tabs .nav-link.active {
                    color: #6f42c1;
                    border-bottom-color: #6f42c1;
                }
                .nav-pills .nav-link.active {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                }
                .breadcrumb-item a {
                    color: #6f42c1;
                    text-decoration: none;
                }
                .breadcrumb-item a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </ClientLayout>
    );
};

export default ServiceDetail;
