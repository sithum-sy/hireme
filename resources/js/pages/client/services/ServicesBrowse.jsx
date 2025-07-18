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
        category_id: searchParams.get("category_id") || "",
        min_price: searchParams.get("min_price") || "",
        max_price: searchParams.get("max_price") || "",
        min_rating: searchParams.get("min_rating") || "",
        pricing_type: searchParams.get("pricing_type") || "",
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
        setLoading(true);

        try {
            const params = {
                ...filters,
                page,
                per_page: 12,
            };

            if (currentLocation && currentLocation.lat && currentLocation.lng) {
                params.latitude = currentLocation.lat;
                params.longitude = currentLocation.lng;
                params.radius = currentLocation.radius || 15;
            } else {
                // console.log("Loading services without location");
            }

            // Remove empty filters
            Object.keys(params).forEach((key) => {
                if (!params[key]) delete params[key];
            });

            const response = await clientService.getServices(params);

            if (response.success) {
                setServices(response.data);
                setPagination(response.data.data || response.meta);

                // Update URL with current filters
                const newSearchParams = new URLSearchParams();
                Object.keys(filters).forEach((key) => {
                    if (filters[key]) newSearchParams.set(key, filters[key]);
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
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handleLocationChange = (newLocation) => {
        setCurrentLocation(newLocation);
        setShowLocationSelector(false);
    };

    const handlePageChange = (page) => {
        loadServices(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const clearFilters = () => {
        setFilters({
            category_id: "",
            min_price: "",
            max_price: "",
            min_rating: "",
            pricing_type: "",
            sort_by: "recent",
        });
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
                    {/* Filters Sidebar */}
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
                                    {currentLocation &&
                                        `Within ${
                                            currentLocation.radius || 15
                                        }km of your location`}
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

                        {/* Services Grid */}
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
                                                        {/* Previous Page */}
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

                                                        {/* Page Numbers */}
                                                        {Array.from(
                                                            {
                                                                length: Math.min(
                                                                    5,
                                                                    pagination.last_page
                                                                ),
                                                            },
                                                            (_, i) => {
                                                                let pageNum;
                                                                if (
                                                                    pagination.last_page <=
                                                                    5
                                                                ) {
                                                                    pageNum =
                                                                        i + 1;
                                                                } else if (
                                                                    pagination.current_page <=
                                                                    3
                                                                ) {
                                                                    pageNum =
                                                                        i + 1;
                                                                } else if (
                                                                    pagination.current_page >=
                                                                    pagination.last_page -
                                                                        2
                                                                ) {
                                                                    pageNum =
                                                                        pagination.last_page -
                                                                        4 +
                                                                        i;
                                                                } else {
                                                                    pageNum =
                                                                        pagination.current_page -
                                                                        2 +
                                                                        i;
                                                                }

                                                                return (
                                                                    <li
                                                                        key={
                                                                            pageNum
                                                                        }
                                                                        className={`page-item ${
                                                                            pagination.current_page ===
                                                                            pageNum
                                                                                ? "active"
                                                                                : ""
                                                                        }`}
                                                                    >
                                                                        <button
                                                                            className="page-link"
                                                                            onClick={() =>
                                                                                handlePageChange(
                                                                                    pageNum
                                                                                )
                                                                            }
                                                                        >
                                                                            {
                                                                                pageNum
                                                                            }
                                                                        </button>
                                                                    </li>
                                                                );
                                                            }
                                                        )}

                                                        {/* Next Page */}
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
                                            Try adjusting your filters or
                                            expanding your search area
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
