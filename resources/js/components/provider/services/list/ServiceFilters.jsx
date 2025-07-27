import React from "react";

const ServiceFilters = ({
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
    servicesCount,
    selectedServices,
    onBulkDelete,
    onBulkToggleStatus
}) => {
    const handleClearFilters = () => {
        setFilter("all");
        setSearchQuery("");
        setSelectedCategory("");
        setSortBy("created_at");
        setSortOrder("desc");
    };

    const getFilterCounts = () => {
        // This would typically come from an API or be calculated
        return {
            all: servicesCount,
            active: Math.floor(servicesCount * 0.7),
            inactive: Math.floor(servicesCount * 0.3),
        };
    };

    const filterCounts = getFilterCounts();

    return (
        <div className="service-filters mb-4">
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    {/* Top Row - Search and Actions */}
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="search-box">
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Search services, categories, or areas..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y me-2"
                                            style={{ zIndex: 5 }}
                                            onClick={() => setSearchQuery("")}
                                        >
                                            <i className="fas fa-times text-muted"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex justify-content-end gap-2">
                                {/* Bulk Actions */}
                                {selectedServices.length > 0 && (
                                    <div className="btn-group">
                                        <button
                                            className="btn btn-outline-warning btn-sm"
                                            onClick={() => onBulkToggleStatus(false)}
                                        >
                                            <i className="fas fa-pause me-1"></i>
                                            Pause ({selectedServices.length})
                                        </button>
                                        <button
                                            className="btn btn-outline-success btn-sm"
                                            onClick={() => onBulkToggleStatus(true)}
                                        >
                                            <i className="fas fa-play me-1"></i>
                                            Activate ({selectedServices.length})
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={onBulkDelete}
                                        >
                                            <i className="fas fa-trash me-1"></i>
                                            Delete ({selectedServices.length})
                                        </button>
                                    </div>
                                )}

                                {/* View Mode Toggle */}
                                <div className="btn-group" role="group">
                                    <button
                                        className={`btn btn-sm ${
                                            viewMode === "grid" 
                                                ? "btn-primary" 
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <i className="fas fa-th-large"></i>
                                    </button>
                                    <button
                                        className={`btn btn-sm ${
                                            viewMode === "list" 
                                                ? "btn-primary" 
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setViewMode("list")}
                                    >
                                        <i className="fas fa-list"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="row mb-3">
                        <div className="col-12">
                            <div className="filter-tabs">
                                <div className="btn-group w-100 w-md-auto" role="group">
                                    <button
                                        className={`btn ${
                                            filter === "all" 
                                                ? "btn-primary" 
                                                : "btn-outline-primary"
                                        }`}
                                        onClick={() => setFilter("all")}
                                    >
                                        All Services ({filterCounts.all})
                                    </button>
                                    <button
                                        className={`btn ${
                                            filter === "active" 
                                                ? "btn-success" 
                                                : "btn-outline-success"
                                        }`}
                                        onClick={() => setFilter("active")}
                                    >
                                        Active ({filterCounts.active})
                                    </button>
                                    <button
                                        className={`btn ${
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
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="row">
                        <div className="col-md-4">
                            <div className="filter-group">
                                <label className="form-label small fw-semibold text-muted">
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
                        </div>
                        <div className="col-md-3">
                            <div className="filter-group">
                                <label className="form-label small fw-semibold text-muted">
                                    Sort By
                                </label>
                                <select
                                    className="form-select form-select-sm"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="created_at">Date Created</option>
                                    <option value="title">Title</option>
                                    <option value="price">Price</option>
                                    <option value="rating">Rating</option>
                                    <option value="views">Views</option>
                                    <option value="bookings">Bookings</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="filter-group">
                                <label className="form-label small fw-semibold text-muted">
                                    Order
                                </label>
                                <select
                                    className="form-select form-select-sm"
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                >
                                    <option value="desc">Highest to Lowest</option>
                                    <option value="asc">Lowest to Highest</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-md-2">
                            <div className="filter-group">
                                <label className="form-label small fw-semibold text-muted">
                                    &nbsp;
                                </label>
                                <button
                                    className="btn btn-outline-secondary btn-sm w-100"
                                    onClick={handleClearFilters}
                                >
                                    <i className="fas fa-undo me-1"></i>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchQuery || selectedCategory || filter !== "all") && (
                        <div className="active-filters mt-3 pt-3 border-top">
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
                            {searchQuery && (
                                <span className="badge bg-warning me-2">
                                    Search: "{searchQuery}"
                                    <button
                                        className="btn-close ms-1"
                                        style={{ fontSize: "0.6rem" }}
                                        onClick={() => setSearchQuery("")}
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