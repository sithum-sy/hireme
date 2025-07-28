import React from "react";

const ServiceFilters = ({
    filter,
    setFilter,
    selectedCategory,
    setSelectedCategory,
    categories,
    sortBy,
    setSortBy,
    services = [],
    selectedServices,
    onBulkDelete,
    onBulkToggleStatus
}) => {
    const handleClearFilters = () => {
        setFilter("all");
        setSelectedCategory("");
        setSortBy("created_at");
    };

    // Calculate actual filter counts from services array
    const getFilterCounts = () => {
        if (!services || services.length === 0) {
            return { all: 0, active: 0, inactive: 0 };
        }
        
        const activeCount = services.filter(service => service.is_active).length;
        const inactiveCount = services.filter(service => !service.is_active).length;
        
        return {
            all: services.length,
            active: activeCount,
            inactive: inactiveCount
        };
    };

    const filterCounts = getFilterCounts();

    return (
        <div className="service-filters mb-4">
            <div className="card border-0 shadow-sm">
                <div className="card-body p-3">
                    {/* Simplified Filter Row */}
                    <div className="row g-3 align-items-end">
                        {/* Status Filter */}
                        <div className="col-lg-4 col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-1">
                                Status
                            </label>
                            <div className="btn-group w-100" role="group">
                                <button
                                    className={`btn btn-sm ${
                                        filter === "all" 
                                            ? "btn-primary" 
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={() => setFilter("all")}
                                >
                                    All ({filterCounts.all})
                                </button>
                                <button
                                    className={`btn btn-sm ${
                                        filter === "active" 
                                            ? "btn-success" 
                                            : "btn-outline-success"
                                    }`}
                                    onClick={() => setFilter("active")}
                                >
                                    Active ({filterCounts.active})
                                </button>
                                <button
                                    className={`btn btn-sm ${
                                        filter === "inactive" 
                                            ? "btn-secondary" 
                                            : "btn-outline-secondary"
                                    }`}
                                    onClick={() => setFilter("inactive")}
                                >
                                    Inactive ({filterCounts.inactive})
                                </button>
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="col-lg-3 col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-1">
                                Category
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By Filter */}
                        <div className="col-lg-3 col-md-6">
                            <label className="form-label small fw-semibold text-muted mb-1">
                                Sort By
                            </label>
                            <select
                                className="form-select form-select-sm"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="created_at">Date Created</option>
                                <option value="title">Title</option>
                                <option value="base_price">Price</option>
                                <option value="average_rating">Rating</option>
                                <option value="views_count">Views</option>
                                <option value="bookings_count">Bookings</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="col-lg-2 col-md-6">
                            <div className="d-flex gap-2">
                                {/* Clear Filters */}
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={handleClearFilters}
                                    title="Clear Filters"
                                >
                                    <i className="fas fa-undo"></i>
                                </button>

                                {/* Bulk Actions */}
                                {selectedServices.length > 0 && (
                                    <>
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => onBulkToggleStatus(true)}
                                            title={`Activate ${selectedServices.length} service(s)`}
                                        >
                                            <i className="fas fa-play"></i>
                                        </button>
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => onBulkToggleStatus(false)}
                                            title={`Pause ${selectedServices.length} service(s)`}
                                        >
                                            <i className="fas fa-pause"></i>
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={onBulkDelete}
                                            title={`Delete ${selectedServices.length} service(s)`}
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(selectedCategory || filter !== "all") && (
                        <div className="active-filters mt-3 pt-2 border-top">
                            <small className="text-muted me-2">Active filters:</small>
                            {filter !== "all" && (
                                <span className="badge bg-primary me-2">
                                    Status: {filter}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        style={{ fontSize: "0.6rem" }}
                                        onClick={() => setFilter("all")}
                                    ></button>
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="badge bg-info me-2">
                                    Category: {categories.find(c => c.id == selectedCategory)?.name}
                                    <button
                                        className="btn-close btn-close-white ms-1"
                                        style={{ fontSize: "0.6rem" }}
                                        onClick={() => setSelectedCategory("")}
                                    ></button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceFilters;