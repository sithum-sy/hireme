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
import { constructProfileImageUrl } from "../../../hooks/useServiceImages";

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
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    try {
                        // ✅ Use Laravel backend proxy instead of direct API call
                        const response = await fetch(
                            `/api/geocoding/reverse?lat=${latitude}&lon=${longitude}`
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const address = data.address || {};

                            const city =
                                address.city ||
                                address.town ||
                                address.village ||
                                address.municipality ||
                                address.county ||
                                "Unknown City";
                            const province =
                                address.state ||
                                address.province ||
                                address.state_district ||
                                "Sri Lanka";

                            let readableAddress = "";
                            if (address.house_number && address.road) {
                                readableAddress = `${address.house_number} ${address.road}, ${city}`;
                            } else if (address.road) {
                                readableAddress = `${address.road}, ${city}`;
                            } else {
                                readableAddress = `${city}, ${province}`;
                            }

                            const locationData = {
                                lat: latitude,
                                lng: longitude,
                                address: readableAddress,
                                neighborhood:
                                    address.suburb ||
                                    address.neighbourhood ||
                                    "",
                                city: city,
                                province: province,
                                country: "Sri Lanka",
                                radius: 15,
                                accuracy: "nominatim_geocoded",
                            };

                            setClientLocation(locationData);
                            // console.log(
                            //     "📍 Client location detected:",
                            //     locationData.address
                            // );
                        } else {
                            throw new Error("Geocoding failed");
                        }
                    } catch (error) {
                        console.error("Geocoding failed:", error);
                        // Fallback to basic location
                        setClientLocation({
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: 15,
                            address: "Your Current Location",
                            accuracy: "gps_fallback",
                        });
                    }
                },
                (error) => {
                    console.log("Geolocation error:", error);
                }
            );
        }
    }, []);

    const reverseGeocode = async (lat, lng) => {
        try {
            // Use Laravel backend proxy instead of external API
            const response = await fetch(
                `/api/geocoding/reverse?lat=${lat}&lon=${lng}`
            );

            if (response.ok) {
                const data = await response.json();
                const address = data.address || {};

                return {
                    lat,
                    lng,
                    address:
                        data.display_name ||
                        `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                    neighborhood: address.suburb || address.neighbourhood || "",
                    city:
                        address.city ||
                        address.town ||
                        address.village ||
                        "Unknown City",
                    province: address.state || address.province || "Sri Lanka",
                    country: "Sri Lanka",
                    radius: 15,
                    accuracy: "gps_geocoded",
                };
            }
        } catch (error) {
            console.warn(
                "Laravel geocoding failed, using offline fallback:",
                error
            );
        }

        // Fallback to offline geocoding with Sri Lankan cities
        return reverseGeocodeOffline(lat, lng);
    };

    const reverseGeocodeOffline = (lat, lng) => {
        const sriLankanCities = [
            {
                name: "Colombo",
                lat: 6.9271,
                lng: 79.8612,
                province: "Western Province",
            },
            {
                name: "Negombo",
                lat: 7.2083,
                lng: 79.8358,
                province: "Western Province",
            },
            {
                name: "Kandy",
                lat: 7.2906,
                lng: 80.6337,
                province: "Central Province",
            },
            {
                name: "Gampaha",
                lat: 7.0873,
                lng: 79.999,
                province: "Western Province",
            },
            {
                name: "Kalutara",
                lat: 6.5854,
                lng: 79.9607,
                province: "Western Province",
            },
            {
                name: "Galle",
                lat: 6.0535,
                lng: 80.221,
                province: "Southern Province",
            },
        ];

        let closestCity = sriLankanCities[0];
        let minDistance = calculateDistance(
            lat,
            lng,
            closestCity.lat,
            closestCity.lng
        );

        sriLankanCities.forEach((city) => {
            const distance = calculateDistance(lat, lng, city.lat, city.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
            }
        });

        return {
            lat,
            lng,
            address: `Near ${closestCity.name}, ${closestCity.province}`,
            neighborhood: `Near ${closestCity.name}`,
            city: closestCity.name,
            province: closestCity.province,
            country: "Sri Lanka",
            radius: 15,
            accuracy: "offline_fallback",
            distance_to_city: Math.round(minDistance),
        };
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth radius in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

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

    const formatDuration = (duration) => {
        if (duration == null || duration === "") return "Flexible";

        const durationNum = parseFloat(duration);

        if (isNaN(durationNum)) return "Flexible";

        // Handle minutes for durations less than 1 hour
        if (durationNum < 1) {
            const minutes = Math.round(durationNum * 60);
            return minutes === 1 ? "1 minute" : `${minutes} minutes`;
        }

        // Handle hours
        const isWholeNumber = durationNum % 1 === 0;
        const displayValue = isWholeNumber
            ? Math.floor(durationNum)
            : durationNum;

        return displayValue === 1 ? "1 hour" : `${displayValue} hours`;
    };

    // console.log("View Count:", service?.views_count);
    // console.log("Booking Count:", service?.bookings_count);

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
                                                ({service.reviews_count || 0}{" "}
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
                                service={service}
                                title={service.title || "Service Gallery"}
                                images={
                                    service.images ||
                                    service.service_images ||
                                    service.existing_images ||
                                    []
                                }
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
                                            {/* Provider Header - Fixed Layout */}
                                            <div className="provider-header d-flex align-items-start mb-4">
                                                <div className=" me-3 flex-shrink-0">
                                                    {(() => {
                                                        // Use the dedicated profile image URL constructor
                                                        const profileImageUrl =
                                                            constructProfileImageUrl(
                                                                provider.profile_image_url
                                                            );

                                                        {
                                                            /* console.log('Provider profile image debug:', {
                                                            provider_id: provider.id,
                                                            original_url: provider.profile_image_url,
                                                            constructed_url: profileImageUrl,
                                                            provider_name: provider.business_name || provider.name
                                                        }); */
                                                        }

                                                        return profileImageUrl ? (
                                                            <img
                                                                src={
                                                                    profileImageUrl
                                                                }
                                                                alt={
                                                                    provider.business_name ||
                                                                    provider.name
                                                                }
                                                                className="rounded-circle"
                                                                style={{
                                                                    width: "80px",
                                                                    height: "80px",
                                                                    objectFit:
                                                                        "cover",
                                                                }}
                                                                onError={(
                                                                    e
                                                                ) => {
                                                                    console.error(
                                                                        "Provider profile image failed to load:",
                                                                        profileImageUrl
                                                                    );
                                                                    // Hide failed image and show fallback
                                                                    e.target.style.display =
                                                                        "none";
                                                                    const fallback =
                                                                        e.target
                                                                            .nextSibling;
                                                                    if (
                                                                        fallback
                                                                    ) {
                                                                        fallback.style.display =
                                                                            "flex";
                                                                    }
                                                                }}
                                                            />
                                                        ) : null;
                                                    })()}

                                                    {/* Fallback avatar */}
                                                    {/* <div
                                                        className="bg-purple bg-opacity-10 text-purple rounded-circle d-flex align-items-center justify-content-center"
                                                        style={{
                                                            width: "80px",
                                                            height: "80px",
                                                            display: provider.profile_image_url ? "none" : "flex",
                                                        }}
                                                    >
                                                        <i className="fas fa-user fa-2x"></i>
                                                    </div> */}
                                                </div>

                                                <div className="provider-info flex-grow-1 min-width-0">
                                                    <div className="d-flex align-items-center flex-wrap mb-2">
                                                        <h5 className="fw-bold mb-0 me-2">
                                                            {provider.business_name ||
                                                                `${
                                                                    provider.first_name ||
                                                                    ""
                                                                } ${
                                                                    provider.last_name ||
                                                                    ""
                                                                }`.trim() ||
                                                                provider.name ||
                                                                "Service Provider"}
                                                        </h5>
                                                        {provider.is_verified && (
                                                            <span className="badge bg-success">
                                                                <i className="fas fa-check-circle me-1"></i>
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="provider-meta mb-3">
                                                        {/* Provider Rating */}
                                                        <div className="provider-rating mb-2">
                                                            <div className="d-flex align-items-center">
                                                                <div className="stars me-2">
                                                                    {[
                                                                        1, 2, 3,
                                                                        4, 5,
                                                                    ].map(
                                                                        (
                                                                            star
                                                                        ) => (
                                                                            <i
                                                                                key={
                                                                                    star
                                                                                }
                                                                                className={`fas fa-star ${
                                                                                    star <=
                                                                                    (provider.average_rating ||
                                                                                        0)
                                                                                        ? "text-warning"
                                                                                        : "text-muted"
                                                                                }`}
                                                                                style={{
                                                                                    fontSize:
                                                                                        "0.9rem",
                                                                                }}
                                                                            ></i>
                                                                        )
                                                                    )}
                                                                </div>
                                                                <span className="fw-semibold me-1">
                                                                    {provider.average_rating ||
                                                                        0}
                                                                </span>
                                                                <span className="text-muted">
                                                                    (
                                                                    {provider.reviews_count ||
                                                                        0}{" "}
                                                                    reviews)
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Provider Location */}
                                                        <div className="provider-location mb-2">
                                                            <div className="d-flex align-items-center text-muted">
                                                                <i className="fas fa-map-marker-alt me-2"></i>
                                                                <span>
                                                                    {provider.city &&
                                                                    provider.province
                                                                        ? `${provider.city}, ${provider.province}`
                                                                        : provider.city ||
                                                                          provider.province ||
                                                                          "Location not specified"}
                                                                </span>
                                                                {provider.service_radius && (
                                                                    <span className="ms-2">
                                                                        •{" "}
                                                                        {
                                                                            provider.service_radius
                                                                        }
                                                                        km
                                                                        service
                                                                        radius
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Provider Bio */}
                                                        {provider.bio && (
                                                            <p className="text-muted mb-0">
                                                                {provider.bio}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Provider Statistics Grid */}
                                            <div className="provider-stats">
                                                <h6 className="fw-bold mb-3">
                                                    Provider Statistics
                                                </h6>
                                                <div className="row g-3">
                                                    <div className="col-6 col-md-3">
                                                        <div className="stat-card text-center p-3 bg-light rounded">
                                                            <div className="stat-value h5 fw-bold text-primary mb-1">
                                                                {provider.total_services ||
                                                                    0}
                                                            </div>
                                                            <div className="stat-label small text-muted">
                                                                Total Services
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-md-3">
                                                        <div className="stat-card text-center p-3 bg-light rounded">
                                                            <div className="stat-value h5 fw-bold text-success mb-1">
                                                                {provider.completed_bookings ||
                                                                    0}
                                                            </div>
                                                            <div className="stat-label small text-muted">
                                                                Completed Jobs
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-md-3">
                                                        <div className="stat-card text-center p-3 bg-light rounded">
                                                            <div className="stat-value h5 fw-bold text-info mb-1">
                                                                {provider.years_experience ||
                                                                    0}
                                                            </div>
                                                            <div className="stat-label small text-muted">
                                                                Years Experience
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-6 col-md-3">
                                                        <div className="stat-card text-center p-3 bg-light rounded">
                                                            <div className="stat-value h5 fw-bold text-warning mb-1">
                                                                {provider.response_time ||
                                                                    "N/A"}
                                                            </div>
                                                            <div className="stat-label small text-muted">
                                                                Response Time
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Additional Provider Info */}
                                            <div className="provider-details mt-4">
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="detail-item mb-3">
                                                            <h6 className="fw-semibold mb-2">
                                                                <i className="fas fa-phone text-primary me-2"></i>
                                                                Contact
                                                                Preferences
                                                            </h6>
                                                            <p className="text-muted mb-0">
                                                                Typically
                                                                responds within{" "}
                                                                {provider.response_time ||
                                                                    "2 hours"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="detail-item mb-3">
                                                            <h6 className="fw-semibold mb-2">
                                                                <i className="fas fa-truck text-primary me-2"></i>
                                                                Service Area
                                                            </h6>
                                                            <p className="text-muted mb-0">
                                                                Serves within{" "}
                                                                {provider.service_radius ||
                                                                    25}
                                                                km radius
                                                                {provider.travel_fee >
                                                                    0 && (
                                                                    <span className="ms-1">
                                                                        • Rs.{" "}
                                                                        {
                                                                            provider.travel_fee
                                                                        }{" "}
                                                                        travel
                                                                        fee
                                                                    </span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Other Services */}
                                            {provider.other_services &&
                                                provider.other_services.length >
                                                    0 && (
                                                    <div className="provider-services mt-4">
                                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                                            <h6 className="fw-bold mb-0">
                                                                Other Services
                                                                by{" "}
                                                                {provider.business_name ||
                                                                    provider.name}
                                                            </h6>
                                                            {provider.total_services >
                                                                3 && (
                                                                <Link
                                                                    to={`/client/providers/${provider.id}`}
                                                                    className="btn btn-outline-purple btn-sm"
                                                                >
                                                                    View All (
                                                                    {
                                                                        provider.total_services
                                                                    }
                                                                    )
                                                                </Link>
                                                            )}
                                                        </div>

                                                        <div className="row g-3">
                                                            {provider.other_services
                                                                .slice(0, 3)
                                                                .map(
                                                                    (
                                                                        otherService
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                otherService.id
                                                                            }
                                                                            className="col-md-4"
                                                                        >
                                                                            <Link
                                                                                to={`/client/services/${otherService.id}`}
                                                                                className="text-decoration-none"
                                                                            >
                                                                                <div className="card border-0 bg-light h-100 service-card-hover">
                                                                                    <div className="card-body p-3">
                                                                                        <h6 className="card-title mb-2 text-dark">
                                                                                            {
                                                                                                otherService.title
                                                                                            }
                                                                                        </h6>
                                                                                        <div className="d-flex justify-content-between align-items-center">
                                                                                            <small className="text-muted">
                                                                                                {otherService
                                                                                                    .category
                                                                                                    ?.name ||
                                                                                                    "Service"}
                                                                                            </small>
                                                                                            <span className="fw-bold text-purple">
                                                                                                {
                                                                                                    otherService.formatted_price
                                                                                                }
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </Link>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Contact Actions */}
                                            <div className="provider-actions mt-4 pt-3 border-top">
                                                <div className="row g-2">
                                                    <div className="col-md-6">
                                                        <button
                                                            className="btn btn-outline-purple w-100"
                                                            onClick={
                                                                handleContactProvider
                                                            }
                                                        >
                                                            <i className="fas fa-comments me-2"></i>
                                                            Contact Provider
                                                        </button>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <Link
                                                            to={`/client/providers/${provider.id}`}
                                                            className="btn btn-purple w-100"
                                                        >
                                                            <i className="fas fa-user me-2"></i>
                                                            View Profile
                                                        </Link>
                                                    </div>
                                                </div>
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

                                                    {/* <button
                                                        className="btn btn-outline-purple"
                                                        onClick={
                                                            handleContactProvider
                                                        }
                                                    >
                                                        <i className="fas fa-comments me-2"></i>
                                                        Chat with Provider
                                                    </button> */}
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
                                            {formatDuration(
                                                service.duration ||
                                                    service.duration_hours
                                            )}
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

                                    {/* <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Service Location:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.service_location ||
                                                "At your location"}
                                        </span>
                                    </div> */}

                                    <div className="info-item d-flex justify-content-between mb-2">
                                        <span className="text-muted">
                                            Cancellation:
                                        </span>
                                        <span className="fw-semibold">
                                            {service.cancellation_policy ||
                                                "Free cancellation"}
                                        </span>
                                    </div>

                                    {/* Service Stats */}
                                    <hr className="my-3" />
                                    <div className="service-stats">
                                        <div className="stat-item d-flex justify-content-between mb-1">
                                            <small className="text-muted">
                                                Views:
                                            </small>
                                            <small
                                                className="fw-semibold"
                                                style={{ color: "#000" }}
                                            >
                                                {service?.views_count || 0}
                                            </small>
                                        </div>
                                        <div className="stat-item d-flex justify-content-between">
                                            <small className="text-muted">
                                                Bookings:
                                            </small>
                                            <small
                                                className="fw-semibold"
                                                style={{ color: "#000" }}
                                            >
                                                {service?.bookings_count || 0}
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
                    selectedSlot={selectedSlot}
                    clientLocation={clientLocation}
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
                .nav-pills.nav-fill {
                    gap: 0.5rem;
                }
                .nav-pills .nav-link:not(.active) {
                    border: 1px solid #dee2e6;
                }

                /* Provider Tab Specific Fixes */
                .provider-header {
                    align-items: flex-start !important;
                }

                .provider-avatar {
                    flex-shrink: 0;
                    min-width: 80px;
                }

                .provider-info {
                    min-width: 0;
                    overflow: hidden;
                }

                .provider-avatar img {
                    border: 3px solid #f8f9fa;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .stars i {
                    margin-right: 2px;
                }

                .stat-card {
                    transition: transform 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                }

                .service-card-hover {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .service-card-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
                }

                .detail-item h6 i {
                    width: 20px;
                    text-align: center;
                }

                /* Responsive behavior */
                @media (max-width: 768px) {
                    .provider-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                    }

                    .provider-avatar {
                        margin-bottom: 1rem;
                        margin-right: 0 !important;
                        align-self: center;
                    }

                    .provider-info {
                        width: 100%;
                    }
                }

                /* Ensure proper flex behavior */
                .d-flex.align-items-start {
                    align-items: flex-start !important;
                }

                .flex-shrink-0 {
                    flex-shrink: 0 !important;
                }

                .flex-grow-1 {
                    flex-grow: 1 !important;
                }

                .min-width-0 {
                    min-width: 0 !important;
                }
            `}</style>
        </ClientLayout>
    );
};

export default ServiceDetail;
