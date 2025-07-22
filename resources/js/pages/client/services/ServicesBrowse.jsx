import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import { useClient } from "../../../context/ClientContext";
import clientService from "../../../services/clientService";
import ServiceCard from "../../../components/client/services/ServiceCard";
import ServiceFilters from "../../../components/client/services/ServiceFilters";
import ServiceSort from "../../../components/client/services/ServiceSort";
import LocationSelector from "../../../components/map/LocationSelector";
import LoadingSpinner from "../../../components/LoadingSpinner";
import EnhancedSearchBar from "../../../components/client/search/EnhancedSearchBar";

const ServicesBrowse = () => {
    const { categories } = useClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const [currentLocation, setCurrentLocation] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [filters, setFilters] = useState({
        search: searchParams.get("search") || "",
        category_id: searchParams.get("category_id") || "",
        min_price: searchParams.get("min_price") || "",
        max_price: searchParams.get("max_price") || "",
        min_rating: searchParams.get("min_rating") || "",
        pricing_type: searchParams.get("pricing_type") || "",
        verified_only: searchParams.get("verified_only") === "true" || false,
        instant_booking:
            searchParams.get("instant_booking") === "true" || false,
        available_today:
            searchParams.get("available_today") === "true" || false,
        sort_by: searchParams.get("sort_by") || "recent",
        radius: parseInt(searchParams.get("radius")) || 5,
    });

    useEffect(() => {
        loadServices();
    }, [currentLocation, filters]);

    useEffect(() => {
        // Try to get user's current location on component mount
        if (!currentLocation && !showLocationSelector) {
            console.log("🌐 Attempting to get user's location on mount");
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        const currentRadius = filters.radius || 5;
                        const initialLocation = {
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: currentRadius,
                            address: `${latitude.toFixed(
                                4
                            )}, ${longitude.toFixed(4)}`,
                        };

                        console.log("✅ Initial GPS location set:", {
                            coordinates: `${latitude}, ${longitude}`,
                            radius: currentRadius,
                        });

                        setCurrentLocation(initialLocation);
                    },
                    (error) => {
                        console.warn("⚠️ Geolocation error on mount:", error);
                        // Don't set any location if GPS fails - user will need to select manually
                    }
                );
            } else {
                console.log("❌ Geolocation not supported");
            }
        }
    }, []);

    // ENHANCED: GPS location capture function
    const getCurrentLocation = () => {
        const currentRadius = filters.radius || 5;
        if (navigator.geolocation) {
            setLoading(true);

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;

                    console.log("📍 GPS location captured:", {
                        coordinates: `${latitude}, ${longitude}`,
                        accuracy: `±${accuracy} meters`,
                    });

                    try {
                        // ENHANCED: Reverse geocode to get proper address
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1&accept-language=en`
                        );

                        if (response.ok) {
                            const data = await response.json();
                            const address = data.address || {};

                            // Parse address components
                            const city =
                                address.city ||
                                address.town ||
                                address.village ||
                                "Current Location";
                            const province =
                                address.state ||
                                address.province ||
                                "Sri Lanka";
                            const neighborhood =
                                address.suburb || address.neighbourhood || "";
                            const road = address.road || "";
                            const houseNumber = address.house_number || "";
                            const postcode = address.postcode || "";

                            // Build readable address
                            let readableAddress = "";
                            if (houseNumber && road) {
                                readableAddress = `${houseNumber} ${road}, ${city}`;
                            } else if (road) {
                                readableAddress = `${road}, ${city}`;
                            } else if (neighborhood) {
                                readableAddress = `${neighborhood}, ${city}`;
                            } else {
                                readableAddress = `${city}, ${province}`;
                            }

                            if (postcode) {
                                readableAddress = readableAddress.replace(
                                    city,
                                    `${city} ${postcode}`
                                );
                            }

                            const locationData = {
                                lat: latitude,
                                lng: longitude,
                                address: readableAddress,
                                neighborhood: neighborhood,
                                city: city,
                                province: province,
                                radius: currentRadius,
                                country: "Sri Lanka",
                                gps_accuracy: accuracy,
                                accuracy_level:
                                    accuracy <= 10
                                        ? "gps_precise"
                                        : "gps_standard",
                                gps_timestamp: new Date().toISOString(),
                            };

                            setCurrentLocation(locationData);
                            setShowLocationSelector(false);

                            console.log(
                                "✅ Location updated:",
                                locationData.address
                            );
                        } else {
                            throw new Error("Geocoding failed");
                        }
                    } catch (error) {
                        console.warn(
                            "Reverse geocoding failed, using basic location:",
                            error
                        );

                        // Fallback to basic GPS location
                        const fallbackLocation = {
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: currentRadius,
                            address: `GPS: ${latitude.toFixed(
                                4
                            )}, ${longitude.toFixed(4)}`,
                            gps_accuracy: accuracy,
                            accuracy_level: "gps_fallback",
                        };

                        setCurrentLocation(fallbackLocation);
                        setShowLocationSelector(false);
                    }

                    setLoading(false);
                },
                (error) => {
                    setLoading(false);
                    let errorMessage = "Unable to get your location. ";

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage +=
                                "Please allow location access in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage +=
                                "Location services are unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage +=
                                "Location request timed out. Please try again.";
                            break;
                        default:
                            errorMessage +=
                                "Please select your location manually.";
                            break;
                    }

                    alert(errorMessage);
                    console.error("GPS Error:", error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 30000,
                }
            );
        } else {
            alert(
                "Geolocation is not supported by this browser. Please select your location manually."
            );
        }
    };

    const loadServices = async (page = 1) => {
        console.log("🔍 Loading services with:", {
            currentLocation: currentLocation
                ? `${currentLocation.lat}, ${currentLocation.lng}`
                : "null",
            filters: filters,
            radius: filters.radius,
        });

        setLoading(true);

        try {
            // Create params object, excluding false boolean values
            const params = {
                page,
                per_page: 12,
            };

            // Add filters, but only if they have meaningful values
            Object.keys(filters).forEach((key) => {
                const value = filters[key];
                if (value && value !== "" && value !== false) {
                    params[key] = value;
                }
            });

            // CRITICAL FIX: Always require location for location-based searches
            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                params.latitude = currentLocation.lat;
                params.longitude = currentLocation.lng;
                params.radius = filters.radius || 5;

                console.log("📍 API call with location:", {
                    latitude: params.latitude,
                    longitude: params.longitude,
                    radius: params.radius,
                });
            } else {
                console.log(
                    "❌ No location available - cannot search for services"
                );
                // Don't make API call without location - show no results instead
                setServices([]);
                setPagination({
                    current_page: 1,
                    last_page: 1,
                    per_page: 12,
                    total: 0,
                });
                setLoading(false);
                return;
            }

            const response = await clientService.getServices(params);
            console.log("🎯 API response full:", response);
            console.log("🎯 Services data:", response.data?.data);

            // Let's also check individual service distances
            if (response.data?.data && Array.isArray(response.data.data)) {
                response.data.data.forEach((service, index) => {
                    console.log(`Service ${index + 1} (${service.title}):`),
                        {
                            id: service.id,
                            distance: service.distance,
                            provider_location:
                                service.provider_location || "N/A",
                            service_location: service.service_location || "N/A",
                        };
                });
            }

            console.log("🎯 API response:", {
                success: response.success,
                total: response.data?.total || 0,
                services_count: response.data?.data?.length || 0,
                radius_used: params.radius,
                coordinates_used: `${params.latitude}, ${params.longitude}`,
            });

            if (response.success) {
                // Handle the new nested data structure
                const responseData = response.data;

                if (responseData.data) {
                    // New format: { data: { data: [...], total: ... } }
                    setServices(responseData.data);
                    setPagination({
                        current_page: responseData.current_page,
                        last_page: responseData.last_page,
                        per_page: responseData.per_page,
                        total: responseData.total,
                    });
                } else {
                    // Fallback to old format
                    setServices(responseData);
                    setPagination(response.meta || {});
                }

                // Update URL with current filters
                const newSearchParams = new URLSearchParams();
                Object.keys(filters).forEach((key) => {
                    const value = filters[key];
                    // Only add non-empty and non-false values to URL
                    if (value && value !== "" && value !== false) {
                        newSearchParams.set(key, value);
                    }
                });
                setSearchParams(newSearchParams, { replace: true });
            }
        } catch (error) {
            console.error("Failed to load services:", error);
            // On error, show empty results
            setServices([]);
            setPagination({
                current_page: 1,
                last_page: 1,
                per_page: 12,
                total: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters) => {
        // console.log("Filter change triggered:", newFilters);
        const updatedFilters = { ...filters, ...newFilters };
        // console.log("Updated filters:", updatedFilters);
        setFilters(updatedFilters);
    };

    const handleLocationChange = (newLocation) => {
        console.log("📍 Location changed to:", {
            lat: newLocation.lat,
            lng: newLocation.lng,
            address: newLocation.address,
            city: newLocation.city,
        });

        // Ensure the location has the current filter radius
        const locationWithRadius = {
            ...newLocation,
            radius: filters.radius || 5,
        };

        setCurrentLocation(locationWithRadius);
        setShowLocationSelector(false);

        // Force a reload of services for the new location
        console.log("🔄 Triggering service reload for new location");
    };

    const handlePageChange = (page) => {
        loadServices(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearch = (searchParams) => {
        // console.log("Search triggered:", searchParams);

        // Update filters with search parameters
        const newFilters = {
            ...filters,
            search: searchParams.search || "",
        };

        // If category is specified in search, update it
        if (searchParams.category_id) {
            newFilters.category_id = searchParams.category_id;
        }

        setFilters(newFilters);

        // If location is provided in search, update current location
        if (searchParams.latitude && searchParams.longitude) {
            setCurrentLocation({
                lat: searchParams.latitude,
                lng: searchParams.longitude,
                radius: searchParams.radius || filters.radius || 5,
                city: "Search Location",
                province: "Sri Lanka",
            });
        }
    };

    const clearFilters = () => {
        const clearedFilters = {
            search: "",
            category_id: "",
            min_price: "",
            max_price: "",
            min_rating: "",
            pricing_type: "",
            verified_only: false,
            instant_booking: false,
            available_today: false,
            sort_by: "recent",
            radius: 5,
        };
        setFilters(clearedFilters);
        setSearchParams({}, { replace: true });
    };

    return (
        <ClientLayout>
            <div className="services-browse-page">
                {/* Page Header */}
                <div className="page-header bg-white rounded-4 shadow-sm p-4 mb-4">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h2 className="fw-bold mb-2">Browse Services</h2>
                            <p className="text-muted mb-0">
                                Discover and book from thousands of services
                                {currentLocation &&
                                    ` near ${currentLocation.city}, ${currentLocation.province}`}
                            </p>
                        </div>
                        <div className="col-md-6 text-end">
                            <div className="d-flex gap-2 justify-content-end">
                                {/* ENHANCED: Select My Location Button */}
                                <button
                                    className="btn btn-success"
                                    onClick={getCurrentLocation}
                                    title="Use my current GPS location"
                                >
                                    <i className="fas fa-location-arrow me-2"></i>
                                    Select My Location
                                </button>

                                <button
                                    className="btn btn-outline-purple"
                                    onClick={() =>
                                        setShowLocationSelector(
                                            !showLocationSelector
                                        )
                                    }
                                >
                                    <i className="fas fa-map-marker-alt me-2"></i>
                                    {currentLocation
                                        ? "Change Location"
                                        : "Custom Location"}
                                </button>
                                <button
                                    className="btn btn-outline-purple d-lg-none"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <i className="fas fa-filter me-2"></i>
                                    Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="row mt-4">
                        <div className="col-12">
                            <EnhancedSearchBar
                                onSearch={handleSearch}
                                location={currentLocation}
                                placeholder="Search for services, categories, providers, or businesses..."
                                initialValue={filters.search}
                            />
                        </div>
                    </div>

                    {/* Location Selector */}
                    {showLocationSelector && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <LocationSelector
                                value={currentLocation}
                                onChange={handleLocationChange}
                                radius={filters.radius || 5}
                            />
                        </div>
                    )}
                </div>

                <div className="row">
                    {/* Filters Sidebar - KEPT! */}
                    <div
                        className={`col-lg-3 mb-4 ${
                            showFilters ? "d-block" : "d-none d-lg-block"
                        }`}
                    >
                        <div className="filters-sidebar">
                            <ServiceFilters
                                filters={filters}
                                categories={categories}
                                onChange={handleFilterChange}
                                onClear={clearFilters}
                                onClose={() => setShowFilters(false)} // Close filters sidebar
                                location={currentLocation}
                            />
                        </div>
                    </div>

                    {/* Services Content */}
                    <div className="col-lg-9">
                        {/* /* Results Header  */}
                        <div className="results-header d-flex justify-content-between align-items-center mb-4">
                            <div className="results-info">
                                <h5 className="mb-1">
                                    {pagination.total || 0}{" "}
                                    {pagination.total === 1
                                        ? "Service Found"
                                        : "Services Found"}
                                </h5>
                                <small className="text-muted">
                                    {filters.search && (
                                        <>Searching for "{filters.search}" </>
                                    )}
                                    {currentLocation &&
                                        `Within ${
                                            filters.radius || 5
                                        } km of your location`}
                                </small>
                            </div>

                            <ServiceSort
                                value={filters.sort_by}
                                onChange={(sort) =>
                                    handleFilterChange({ sort_by: sort })
                                }
                                hasLocation={!!currentLocation}
                            />
                        </div>
                        {/* Active Filters - Enhanced to show search */}
                        {(filters.search ||
                            Object.values(filters).some(Boolean)) && (
                            <div className="active-filters mb-4">
                                <div className="d-flex flex-wrap gap-2 align-items-center">
                                    <small className="text-muted me-2">
                                        Active filters:
                                    </small>

                                    {/* Search Filter Badge */}
                                    {filters.search && (
                                        <span className="badge bg-purple bg-opacity-10 text-purple">
                                            Search: "{filters.search}"
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        search: "",
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Existing filter badges remain the same */}
                                    {filters.category_id && (
                                        <span className="badge bg-purple bg-opacity-10 text-purple">
                                            {categories.find(
                                                (c) =>
                                                    c.id == filters.category_id
                                            )?.name || "Category"}
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        category_id: "",
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Price Range Badge */}
                                    {(filters.min_price ||
                                        filters.max_price) && (
                                        <span className="badge bg-purple bg-opacity-10 text-purple">
                                            Rs. {filters.min_price || 0} -{" "}
                                            {filters.max_price || "∞"}
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        min_price: "",
                                                        max_price: "",
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Rating Badge */}
                                    {filters.min_rating && (
                                        <span className="badge bg-purple bg-opacity-10 text-purple">
                                            {filters.min_rating}+ Stars
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        min_rating: "",
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Pricing Type Badge */}
                                    {filters.pricing_type && (
                                        <span className="badge bg-purple bg-opacity-10 text-purple">
                                            {filters.pricing_type
                                                .charAt(0)
                                                .toUpperCase() +
                                                filters.pricing_type.slice(1)}
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        pricing_type: "",
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Verified Only Badge */}
                                    {filters.verified_only && (
                                        <span className="badge bg-success bg-opacity-10 text-success">
                                            <i className="fas fa-check-circle me-1"></i>
                                            Verified Only
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        verified_only: false,
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Instant Booking Badge */}
                                    {filters.instant_booking && (
                                        <span className="badge bg-warning bg-opacity-10 text-warning">
                                            <i className="fas fa-bolt me-1"></i>
                                            Instant Booking
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        instant_booking: false,
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Available Today Badge */}
                                    {filters.available_today && (
                                        <span className="badge bg-info bg-opacity-10 text-info">
                                            <i className="fas fa-calendar-check me-1"></i>
                                            Available Today
                                            <button
                                                className="btn-close btn-close-sm ms-2"
                                                onClick={() =>
                                                    handleFilterChange({
                                                        available_today: false,
                                                    })
                                                }
                                            ></button>
                                        </span>
                                    )}

                                    {/* Radius Badge */}
                                    {currentLocation &&
                                        filters.radius &&
                                        filters.radius !== 5 && (
                                            <span className="badge bg-primary bg-opacity-10 text-primary">
                                                <i className="fas fa-map-marker-alt me-1"></i>
                                                Within {filters.radius} km
                                                <button
                                                    className="btn-close btn-close-sm ms-2"
                                                    onClick={() =>
                                                        handleFilterChange({
                                                            radius: 5,
                                                        })
                                                    }
                                                ></button>
                                            </span>
                                        )}

                                    <button
                                        className="btn btn-link btn-sm text-decoration-none"
                                        onClick={clearFilters}
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </div>
                        )}
                        {/* Services Grid - Rest remains the same */}
                        {!currentLocation ? (
                            <div className="no-location text-center py-5">
                                <i className="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">
                                    Location Required
                                </h5>
                                <p className="text-muted mb-3">
                                    Please select your location to see available
                                    services in your area.
                                </p>
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-success"
                                        onClick={getCurrentLocation}
                                    >
                                        <i className="fas fa-location-arrow me-2"></i>
                                        Use My Current Location
                                    </button>
                                    <button
                                        className="btn btn-outline-purple"
                                        onClick={() =>
                                            setShowLocationSelector(true)
                                        }
                                    >
                                        <i className="fas fa-map-marker-alt me-2"></i>
                                        Select Custom Location
                                    </button>
                                </div>
                            </div>
                        ) : loading ? (
                            <LoadingSpinner message="Loading services..." />
                        ) : (
                            <>
                                {services && services.length > 0 ? (
                                    <>
                                        <div className="services-grid">
                                            <div className="row g-4">
                                                {services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="col-md-6 col-xl-4"
                                                    >
                                                        <ServiceCard
                                                            service={service}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pagination */}
                                        {pagination.last_page > 1 && (
                                            <div className="d-flex justify-content-center mt-5">
                                                <nav>
                                                    <ul className="pagination">
                                                        <li
                                                            className={`page-item ${
                                                                pagination.current_page ===
                                                                1
                                                                    ? "disabled"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        pagination.current_page -
                                                                            1
                                                                    )
                                                                }
                                                                disabled={
                                                                    pagination.current_page ===
                                                                    1
                                                                }
                                                            >
                                                                Previous
                                                            </button>
                                                        </li>

                                                        {Array.from(
                                                            {
                                                                length: Math.min(
                                                                    5,
                                                                    pagination.last_page
                                                                ),
                                                            },
                                                            (_, i) => {
                                                                const page =
                                                                    i + 1;
                                                                return (
                                                                    <li
                                                                        key={
                                                                            page
                                                                        }
                                                                        className={`page-item ${
                                                                            pagination.current_page ===
                                                                            page
                                                                                ? "active"
                                                                                : ""
                                                                        }`}
                                                                    >
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() =>
                                                                                handlePageChange(
                                                                                    page
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                page
                                                                            }
                                                                        </button>
                                                                    </li>
                                                                );
                                                            }
                                                        )}

                                                        <li
                                                            className={`page-item ${
                                                                pagination.current_page ===
                                                                pagination.last_page
                                                                    ? "disabled"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <button
                                                                className="page-link"
                                                                onClick={() =>
                                                                    handlePageChange(
                                                                        pagination.current_page +
                                                                            1
                                                                    )
                                                                }
                                                                disabled={
                                                                    pagination.current_page ===
                                                                    pagination.last_page
                                                                }
                                                            >
                                                                Next
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="no-services text-center py-5">
                                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">
                                            No services found
                                        </h5>
                                        <p className="text-muted mb-3">
                                            {filters.search
                                                ? `No results found for "${filters.search}"`
                                                : "Try adjusting your filters or expanding your search area"}
                                        </p>
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                className="btn btn-outline-purple"
                                                onClick={clearFilters}
                                            >
                                                Clear Filters
                                            </button>
                                            <Link
                                                to="/client/services/search"
                                                className="btn btn-purple"
                                            >
                                                Advanced Search
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Styles remain the same */}
            <style>{`
                .text-purple { color: #6f42c1 !important; }
                .bg-purple { background-color: #6f42c1 !important; }
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
                .filters-sidebar {
                    position: sticky;
                    top: 2rem;
                }
                @media (max-width: 991px) {
                    .filters-sidebar {
                        position: static;
                    }
                }
                .badge .btn-close {
                    font-size: 0.6em;
                    opacity: 0.7;
                }
                .badge .btn-close:hover {
                    opacity: 1;
                }
            `}</style>
        </ClientLayout>
    );
};

export default ServicesBrowse;
