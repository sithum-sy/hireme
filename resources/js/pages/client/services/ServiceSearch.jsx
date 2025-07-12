import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import { useClient } from "../../../context/ClientContext";
import searchService from "../../../services/searchService";
import ServiceCard from "../../../components/client/services/ServiceCard";
import ServiceFilters from "../../../components/client/services/ServiceFilters";
import SearchSuggestions from "../../../components/client/search/SearchSuggestions";
import LocationSelector from "../../../components/map/LocationSelector";
import LoadingSpinner from "../../../components/LoadingSpinner";

const ServiceSearch = () => {
    const { location, categories } = useClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showLocationSelector, setShowLocationSelector] = useState(false);

    const [filters, setFilters] = useState({
        category_id: searchParams.get("category_id") || "",
        min_price: searchParams.get("min_price") || "",
        max_price: searchParams.get("max_price") || "",
        min_rating: searchParams.get("min_rating") || "",
        pricing_type: searchParams.get("pricing_type") || "",
        sort_by: searchParams.get("sort_by") || "distance",
    });

    useEffect(() => {
        if (searchQuery || Object.values(filters).some(Boolean)) {
            performSearch();
        }
    }, [location, filters]);

    useEffect(() => {
        const query = searchParams.get("q");
        if (query && query !== searchQuery) {
            setSearchQuery(query);
            performSearch(query);
        }
    }, [searchParams]);

    const performSearch = async (query = searchQuery, page = 1) => {
        if (!query && !Object.values(filters).some(Boolean)) return;

        setLoading(true);

        try {
            const searchParams = {
                search: query,
                ...filters,
                page,
                per_page: 12,
            };

            // Add location if available
            if (location) {
                searchParams.latitude = location.lat;
                searchParams.longitude = location.lng;
                searchParams.radius = location.radius || 15;
            }

            // Remove empty filters
            Object.keys(searchParams).forEach((key) => {
                if (!searchParams[key]) delete searchParams[key];
            });

            const response = await searchService.searchServices(searchParams);

            if (response.success) {
                setServices(response.data.data);
                setPagination(response.data.meta || response.meta);

                // Update URL
                const newSearchParams = new URLSearchParams();
                if (query) newSearchParams.set("q", query);
                Object.keys(filters).forEach((key) => {
                    if (filters[key]) newSearchParams.set(key, filters[key]);
                });
                setSearchParams(newSearchParams, { replace: true });
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (searchQuery.trim()) {
            performSearch(searchQuery.trim());
        }
    };

    const handleSearchInputChange = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (value.length >= 2) {
            try {
                const response = await searchService.getSearchSuggestions(
                    value
                );
                if (response.success) {
                    setSuggestions(response.data);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error("Failed to load suggestions:", error);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion.text);
        setShowSuggestions(false);
        performSearch(suggestion.text);
    };

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const handlePageChange = (page) => {
        performSearch(searchQuery, page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <ClientLayout>
            <div className="service-search-page">
                {/* Search Header */}
                <div className="search-header bg-white rounded-4 shadow-sm p-4 mb-4">
                    <div className="row">
                        <div className="col-md-8">
                            <h2 className="fw-bold mb-3">Search Services</h2>

                            {/* Search Form */}
                            <form onSubmit={handleSearchSubmit}>
                                <div className="position-relative">
                                    <div className="input-group input-group-lg">
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="fas fa-search text-purple"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 shadow-none"
                                            placeholder="Search for services..."
                                            value={searchQuery}
                                            onChange={handleSearchInputChange}
                                            onFocus={() =>
                                                searchQuery.length >= 2 &&
                                                setShowSuggestions(true)
                                            }
                                            onBlur={() =>
                                                setTimeout(
                                                    () =>
                                                        setShowSuggestions(
                                                            false
                                                        ),
                                                    200
                                                )
                                            }
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-purple px-4"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                "Search"
                                            )}
                                        </button>
                                    </div>

                                    {/* Search Suggestions */}
                                    {showSuggestions &&
                                        suggestions.length > 0 && (
                                            <SearchSuggestions
                                                suggestions={suggestions}
                                                onSelect={handleSuggestionClick}
                                            />
                                        )}
                                </div>
                            </form>
                        </div>

                        <div className="col-md-4">
                            <div className="location-info">
                                <label className="form-label text-muted">
                                    Search Location:
                                </label>
                                <div className="d-flex align-items-center justify-content-between">
                                    {location ? (
                                        <div>
                                            <div className="fw-semibold">
                                                {location.city},{" "}
                                                {location.province}
                                            </div>
                                            <small className="text-muted">
                                                Within {location.radius}km
                                            </small>
                                        </div>
                                    ) : (
                                        <div className="text-muted">
                                            No location set
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-outline-purple btn-sm"
                                        onClick={() =>
                                            setShowLocationSelector(
                                                !showLocationSelector
                                            )
                                        }
                                    >
                                        <i className="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Selector */}
                    {showLocationSelector && (
                        <div className="mt-3 p-3 bg-light rounded">
                            <LocationSelector
                                value={location}
                                onChange={(newLocation) => {
                                    setShowLocationSelector(false);
                                    // Location change handled by ClientContext
                                }}
                            />
                        </div>
                    )}
                </div>

                <div className="row">
                    {/* Filters Sidebar */}
                    <div className="col-lg-3 mb-4">
                        <ServiceFilters
                            filters={filters}
                            categories={categories}
                            onChange={handleFilterChange}
                            onClear={() =>
                                setFilters({
                                    category_id: "",
                                    min_price: "",
                                    max_price: "",
                                    min_rating: "",
                                    pricing_type: "",
                                    sort_by: "distance",
                                })
                            }
                            location={location}
                        />
                    </div>

                    {/* Search Results */}
                    <div className="col-lg-9">
                        {/* Results Info */}
                        <div className="results-info mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="mb-1">
                                        {searchQuery
                                            ? `Results for "${searchQuery}"`
                                            : "Search Results"}
                                    </h5>
                                    <small className="text-muted">
                                        {pagination.total || 0} services found
                                        {location &&
                                            ` within ${location.radius}km`}
                                    </small>
                                </div>

                                <div className="sort-options">
                                    <select
                                        className="form-select form-select-sm"
                                        value={filters.sort_by}
                                        onChange={(e) =>
                                            handleFilterChange({
                                                sort_by: e.target.value,
                                            })
                                        }
                                    >
                                        {location && (
                                            <option value="distance">
                                                Sort by Distance
                                            </option>
                                        )}
                                        <option value="price">
                                            Sort by Price
                                        </option>
                                        <option value="rating">
                                            Sort by Rating
                                        </option>
                                        <option value="popularity">
                                            Sort by Popularity
                                        </option>
                                        <option value="recent">
                                            Sort by Newest
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Search Results */}
                        {loading ? (
                            <LoadingSpinner message="Searching services..." />
                        ) : (
                            <>
                                {services.length > 0 ? (
                                    <>
                                        <div className="search-results">
                                            <div className="row g-4">
                                                {services.map((service) => (
                                                    <div
                                                        key={service.id}
                                                        className="col-md-6 col-xl-4"
                                                    >
                                                        <ServiceCard
                                                            service={service}
                                                            showDistance={
                                                                !!location
                                                            }
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
                                                                const pageNum =
                                                                    i + 1;
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
                                ) : searchQuery ||
                                  Object.values(filters).some(Boolean) ? (
                                    <div className="no-results text-center py-5">
                                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">
                                            No results found
                                        </h5>
                                        <p className="text-muted mb-3">
                                            {searchQuery
                                                ? `No services found for "${searchQuery}"`
                                                : "No services match your current filters"}
                                        </p>
                                        <div className="suggestions">
                                            <p className="text-muted small mb-2">
                                                Try:
                                            </p>
                                            <ul className="list-unstyled small text-muted">
                                                <li>
                                                    • Using different keywords
                                                </li>
                                                <li>
                                                    • Expanding your search
                                                    radius
                                                </li>
                                                <li>• Removing some filters</li>
                                                <li>• Checking for typos</li>
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="search-prompt text-center py-5">
                                        <i className="fas fa-search fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">
                                            Start your search
                                        </h5>
                                        <p className="text-muted">
                                            Enter keywords to find services in
                                            your area
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
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
        </ClientLayout>
    );
};

export default ServiceSearch;
