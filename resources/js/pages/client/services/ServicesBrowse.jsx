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
    });

    useEffect(() => {
        loadServices();
    }, [currentLocation, filters]);

    useEffect(() => {
        // Try to get user's current location on component mount
        if (!currentLocation && !showLocationSelector) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setCurrentLocation({
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: 15,
                            address: `${latitude.toFixed(
                                4
                            )}, ${longitude.toFixed(4)}`,
                        });
                    },
                    (error) => {
                        console.log("Geolocation error:", error);
                    }
                );
            }
        }
    }, []);

    const loadServices = async (page = 1) => {
        // console.log("Loading services with filters:", filters);
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

            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                params.latitude = currentLocation.lat;
                params.longitude = currentLocation.lng;
                params.radius = currentLocation.radius || 15;
            } else {
                // console.log("Loading services without location");
            }

            // console.log("API request params:", params);

            const response = await clientService.getServices(params);
            // console.log("API response:", response);

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
        setCurrentLocation(newLocation);
        setShowLocationSelector(false);
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
                radius: searchParams.radius || 15,
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
                                        : "Set Location"}
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
                                location={currentLocation}
                            />
                        </div>
                    </div>

                    {/* Services Content */}
                    <div className="col-lg-9">
                        {/* Results Header */}
                        <div className="results-header d-flex justify-content-between align-items-center mb-4">
                            <div className="results-info">
                                <h5 className="mb-1">
                                    {pagination.total || 0} Services Found
                                </h5>
                                <small className="text-muted">
                                    {filters.search && (
                                        <>Searching for "{filters.search}" </>
                                    )}
                                    {currentLocation &&
                                        `Within ${
                                            currentLocation.radius || 15
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
                        {loading ? (
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
