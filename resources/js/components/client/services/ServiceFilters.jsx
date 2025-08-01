import React, { useState } from "react";

const ServiceFilters = ({
    filters,
    categories,
    onChange,
    onClear,
    onClose, // New prop for closing modal/sidebar
    location,
}) => {
    const [priceRange, setPriceRange] = useState({
        min: filters.min_price || "",
        max: filters.max_price || "",
    });

    const handlePriceChange = (field, value) => {
        const newRange = { ...priceRange, [field]: value };
        setPriceRange(newRange);
        onChange({
            min_price: newRange.min,
            max_price: newRange.max,
        });
    };

    const handleFilterChange = (field, value) => {
        onChange({ [field]: value });
    };

    const hasActiveFilters = Object.values(filters).some(
        (value) => value !== ""
    );

    return (
        <div className="service-filters">
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                    <div className="d-flex justify-content-between align-items-center">
                        <h6 className="fw-bold mb-0">Filters</h6>
                        <div className="d-flex align-items-center gap-2">
                            {hasActiveFilters && (
                                <button
                                    className="btn btn-link btn-sm text-decoration-none p-0"
                                    onClick={() => {
                                        onClear();
                                        if (onClose) onClose(); // Close modal after clearing
                                    }}
                                >
                                    Clear All
                                </button>
                            )}
                            {onClose && (
                                <button
                                    className="btn btn-outline-secondary btn-sm d-lg-none"
                                    onClick={onClose}
                                    title="Close filters"
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card-body p-3">
                    {/* Category Filter */}
                    <div className="filter-group mb-4">
                        <label className="form-label fw-semibold mb-2">
                            Category
                        </label>
                        <select
                            className="form-select form-select-sm"
                            value={filters.category_id}
                            onChange={(e) =>
                                handleFilterChange(
                                    "category_id",
                                    e.target.value
                                )
                            }
                        >
                            <option value="">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name} (
                                    {category.service_count || 0})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range Filter */}
                    <div className="filter-group mb-4">
                        <label className="form-label fw-semibold mb-2">
                            Price Range (Rs.)
                        </label>
                        <div className="row g-2">
                            <div className="col-6">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Min"
                                    value={priceRange.min}
                                    onChange={(e) =>
                                        handlePriceChange("min", e.target.value)
                                    }
                                />
                            </div>
                            <div className="col-6">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Max"
                                    value={priceRange.max}
                                    onChange={(e) =>
                                        handlePriceChange("max", e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Quick Price Ranges */}
                        <div className="quick-prices mt-2">
                            <div className="d-flex flex-wrap gap-1">
                                {[
                                    {
                                        label: "Under Rs. 1,000",
                                        min: "",
                                        max: "1000",
                                    },
                                    {
                                        label: "Rs. 1,000-5,000",
                                        min: "1000",
                                        max: "5000",
                                    },
                                    {
                                        label: "Rs. 5,000-10,000",
                                        min: "5000",
                                        max: "10000",
                                    },
                                    {
                                        label: "Above Rs. 10,000",
                                        min: "10000",
                                        max: "",
                                    },
                                ].map((range, index) => (
                                    <button
                                        key={index}
                                        className={`btn btn-outline-secondary btn-xs ${
                                            priceRange.min === range.min &&
                                            priceRange.max === range.max
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setPriceRange({
                                                min: range.min,
                                                max: range.max,
                                            });
                                            onChange({
                                                min_price: range.min,
                                                max_price: range.max,
                                            });
                                        }}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="filter-group mb-4">
                        <label className="form-label fw-semibold mb-2">
                            Minimum Rating
                        </label>
                        <div className="rating-options">
                            {[4, 3, 2, 1].map((rating) => (
                                <div key={rating} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="rating"
                                        id={`rating-${rating}`}
                                        value={rating}
                                        checked={filters.min_rating == rating}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "min_rating",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <label
                                        className="form-check-label"
                                        htmlFor={`rating-${rating}`}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="stars me-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <i
                                                        key={star}
                                                        className={`fas fa-star ${
                                                            star <= rating
                                                                ? "text-warning"
                                                                : "text-muted"
                                                        }`}
                                                        style={{
                                                            fontSize: "0.8rem",
                                                        }}
                                                    ></i>
                                                ))}
                                            </div>
                                            <span className="small">
                                                {rating}+ Stars
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            ))}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="rating"
                                    id="rating-all"
                                    value=""
                                    checked={!filters.min_rating}
                                    onChange={(e) =>
                                        handleFilterChange("min_rating", "")
                                    }
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="rating-all"
                                >
                                    <span className="small">All Ratings</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Type Filter */}
                    <div className="filter-group mb-4">
                        <label className="form-label fw-semibold mb-2">
                            Pricing Type
                        </label>
                        <select
                            className="form-select form-select-sm"
                            value={filters.pricing_type}
                            onChange={(e) =>
                                handleFilterChange(
                                    "pricing_type",
                                    e.target.value
                                )
                            }
                        >
                            <option value="">All Types</option>
                            <option value="hourly">Hourly</option>
                            <option value="fixed">Fixed</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>

                    {/* Location Radius Filter */}
                    {location && location.lat && location.lng && (
                        <div className="filter-group mb-4">
                            <label className="form-label fw-semibold mb-2">
                                Search Radius
                            </label>
                            <div className="radius-selector">
                                <input
                                    type="range"
                                    className="form-range"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={filters.radius || location.radius || 5}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "radius",
                                            parseInt(e.target.value)
                                        )
                                    }
                                    id="radius-range"
                                />
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <small className="text-muted">1 km</small>
                                    <div className="radius-display text-center">
                                        <span className="badge bg-primary">
                                            <i className="fas fa-map-marker-alt me-1"></i>
                                            {filters.radius || location.radius || 5} km
                                        </span>
                                    </div>
                                    <small className="text-muted">50 km</small>
                                </div>
                                <div className="text-center mt-2">
                                    <small className="text-muted">
                                        Services within {filters.radius || location.radius || 5} km from your location
                                    </small>
                                </div>
                                {/* Quick Radius Options */}
                                <div className="quick-radius mt-2">
                                    <div className="d-flex flex-wrap gap-1 justify-content-center">
                                        {[2, 5, 10, 20].map((radius) => (
                                            <button
                                                key={radius}
                                                className={`btn btn-outline-primary btn-xs ${
                                                    (filters.radius || location.radius || 5) === radius
                                                        ? "active"
                                                        : ""
                                                }`}
                                                onClick={() => {
                                                    handleFilterChange(
                                                        "radius",
                                                        radius
                                                    );
                                                }}
                                            >
                                                {radius} km
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Service Features */}
                    <div className="filter-group mb-4">
                        <label className="form-label fw-semibold mb-2">
                            Service Features
                        </label>
                        <div className="feature-checkboxes">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="verified-only"
                                    checked={filters.verified_only || false}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "verified_only",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="verified-only"
                                >
                                    <i className="fas fa-check-circle text-success me-1"></i>
                                    Verified Providers Only
                                </label>
                            </div>

                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="available-today"
                                    checked={filters.available_today || false}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "available_today",
                                            e.target.checked
                                        )
                                    }
                                />
                                <label
                                    className="form-check-label"
                                    htmlFor="available-today"
                                >
                                    <i className="fas fa-calendar-check text-info me-1"></i>
                                    Available Today
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Apply Button */}
                    <div className="d-grid mt-4">
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                                // Filters are applied in real-time, this could trigger a search
                                console.log("Apply filters:", filters);
                                if (onClose) onClose(); // Close modal after applying
                            }}
                        >
                            <i className="fas fa-search me-2"></i>
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .btn-xs {
                    padding: 0.25rem 0.5rem;
                    font-size: 0.75rem;
                    line-height: 1.2;
                    border-radius: 0.25rem;
                }
                .form-check-input:checked {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                }
                .form-range::-webkit-slider-thumb {
                    background: var(--current-role-primary);
                }
                .form-range::-moz-range-thumb {
                    background: var(--current-role-primary);
                }
            `}</style>
        </div>
    );
};

export default ServiceFilters;
