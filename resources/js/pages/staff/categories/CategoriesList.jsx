import React, { useState, useEffect } from "react";
import { useStaff } from "../../../context/StaffContext";

const CategoriesList = () => {
    const {
        categories,
        categoriesLoading,
        categoriesPagination,
        categoriesFilters,
        fetchCategories,
        deleteCategory,
        toggleCategoryStatus,
        updateCategoriesFilters,
        errors,
        successMessage,
        isProcessing,
    } = useStaff();

    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [localFilters, setLocalFilters] = useState(categoriesFilters);

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Load categories when filters change
    useEffect(() => {
        if (
            JSON.stringify(localFilters) !== JSON.stringify(categoriesFilters)
        ) {
            updateCategoriesFilters(localFilters);
            loadCategories();
        }
    }, [localFilters]);

    const loadCategories = async (page = 1) => {
        try {
            await fetchCategories(categoriesFilters, page);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const handleSearch = (searchTerm) => {
        setLocalFilters((prev) => ({ ...prev, search: searchTerm }));
    };

    const handleFilterChange = (filterType, value) => {
        setLocalFilters((prev) => ({ ...prev, [filterType]: value }));
    };

    const handleSort = (sortBy) => {
        const newSortOrder =
            localFilters.sort_by === sortBy && localFilters.sort_order === "asc"
                ? "desc"
                : "asc";

        setLocalFilters((prev) => ({
            ...prev,
            sort_by: sortBy,
            sort_order: newSortOrder,
        }));
    };

    const handleSelectCategory = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSelectAll = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map((cat) => cat.id));
        }
    };

    const handleDeleteCategory = async (category) => {
        setCategoryToDelete(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (categoryToDelete) {
            try {
                await deleteCategory(categoryToDelete.id);
                setShowDeleteModal(false);
                setCategoryToDelete(null);
                await loadCategories();
            } catch (error) {
                console.error("Failed to delete category:", error);
            }
        }
    };

    const handleToggleStatus = async (category) => {
        try {
            await toggleCategoryStatus(category.id);
            await loadCategories();
        } catch (error) {
            console.error("Failed to toggle category status:", error);
        }
    };

    const handlePageChange = (page) => {
        loadCategories(page);
    };

    const handleBulkAction = async (action) => {
        // TODO: Implement bulk actions
        console.log(
            "Bulk action:",
            action,
            "for categories:",
            selectedCategories
        );
    };

    const getCategoryStatusBadge = (category) => {
        return category.is_active ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Loading skeleton
    const CategoriesSkeleton = () => (
        <div className="row">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="col-lg-4 col-md-6 mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="placeholder-glow">
                                <div className="d-flex align-items-center mb-3">
                                    <span
                                        className="placeholder rounded-circle me-3"
                                        style={{
                                            width: "40px",
                                            height: "40px",
                                        }}
                                    ></span>
                                    <div className="flex-grow-1">
                                        <span className="placeholder col-8"></span>
                                        <br />
                                        <span className="placeholder col-6"></span>
                                    </div>
                                </div>
                                <span className="placeholder col-10"></span>
                                <br />
                                <span className="placeholder col-8"></span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Service Categories</h1>
                    <p className="text-muted mb-0">
                        Manage and organize service categories for the platform
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => loadCategories()}
                        disabled={categoriesLoading}
                    >
                        <i
                            className={`fas fa-sync-alt ${
                                categoriesLoading ? "fa-spin" : ""
                            } me-2`}
                        ></i>
                        Refresh
                    </button>
                    <a
                        href="/staff/categories/create"
                        className="btn btn-primary"
                    >
                        <i className="fas fa-plus me-2"></i>
                        Add Category
                    </a>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row g-3">
                        {/* Search */}
                        <div className="col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <i className="fas fa-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search categories..."
                                    value={localFilters.search}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={localFilters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                            >
                                <option value="">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div className="col-md-3">
                            <select
                                className="form-select"
                                value={`${localFilters.sort_by}_${localFilters.sort_order}`}
                                onChange={(e) => {
                                    const [sortBy, sortOrder] =
                                        e.target.value.split("_");
                                    setLocalFilters((prev) => ({
                                        ...prev,
                                        sort_by: sortBy,
                                        sort_order: sortOrder,
                                    }));
                                }}
                            >
                                <option value="sort_order_asc">
                                    Sort Order (A-Z)
                                </option>
                                <option value="sort_order_desc">
                                    Sort Order (Z-A)
                                </option>
                                <option value="name_asc">Name (A-Z)</option>
                                <option value="name_desc">Name (Z-A)</option>
                                <option value="created_at_desc">
                                    Newest First
                                </option>
                                <option value="created_at_asc">
                                    Oldest First
                                </option>
                            </select>
                        </div>

                        {/* Per Page */}
                        <div className="col-md-2">
                            <select
                                className="form-select"
                                value={localFilters.per_page}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "per_page",
                                        parseInt(e.target.value)
                                    )
                                }
                            >
                                <option value={15}>15 per page</option>
                                <option value={30}>30 per page</option>
                                <option value={50}>50 per page</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="col-md-1">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() =>
                                    setLocalFilters({
                                        search: "",
                                        status: "",
                                        sort_by: "sort_order",
                                        sort_order: "asc",
                                        per_page: 15,
                                    })
                                }
                                title="Clear Filters"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                    <span>
                        <i className="fas fa-check-circle me-2"></i>
                        {selectedCategories.length} categories selected
                    </span>
                    <div className="btn-group">
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleBulkAction("activate")}
                        >
                            <i className="fas fa-check me-1"></i>
                            Activate
                        </button>
                        <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleBulkAction("deactivate")}
                        >
                            <i className="fas fa-pause me-1"></i>
                            Deactivate
                        </button>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleBulkAction("delete")}
                        >
                            <i className="fas fa-trash me-1"></i>
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errors.categories && (
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {errors.categories}
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {successMessage}
                </div>
            )}

            {/* Categories Content */}
            {categoriesLoading ? (
                <CategoriesSkeleton />
            ) : categories.length > 0 ? (
                <>
                    {/* Categories Grid */}
                    <div className="row">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="col-lg-4 col-md-6 mb-4"
                            >
                                <div className="card border-0 shadow-sm h-100">
                                    <div className="card-body">
                                        {/* Category Header */}
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="form-check me-3">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(
                                                        category.id
                                                    )}
                                                    onChange={() =>
                                                        handleSelectCategory(
                                                            category.id
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div
                                                className="category-icon me-3 d-flex align-items-center justify-content-center rounded"
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    backgroundColor:
                                                        category.color ||
                                                        "#6c757d",
                                                    color: "white",
                                                }}
                                            >
                                                <i
                                                    className={
                                                        category.icon ||
                                                        "fas fa-folder"
                                                    }
                                                ></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">
                                                    {category.name}
                                                </h6>
                                                <small className="text-muted">
                                                    {category.services_count ||
                                                        0}{" "}
                                                    services
                                                </small>
                                            </div>
                                            {getCategoryStatusBadge(category)}
                                        </div>

                                        {/* Category Description */}
                                        <p className="text-muted small mb-3">
                                            {category.description ||
                                                "No description provided"}
                                        </p>

                                        {/* Category Meta */}
                                        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                                            <span>
                                                Order:{" "}
                                                {category.sort_order || 0}
                                            </span>
                                            <span>
                                                Created:{" "}
                                                {formatDate(
                                                    category.created_at
                                                )}
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="d-flex gap-2">
                                            <a
                                                href={`/staff/categories/${category.id}`}
                                                className="btn btn-sm btn-outline-primary flex-grow-1"
                                            >
                                                <i className="fas fa-eye me-1"></i>
                                                View
                                            </a>
                                            <a
                                                href={`/staff/categories/${category.id}/edit`}
                                                className="btn btn-sm btn-outline-secondary"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </a>
                                            <button
                                                className={`btn btn-sm ${
                                                    category.is_active
                                                        ? "btn-outline-warning"
                                                        : "btn-outline-success"
                                                }`}
                                                onClick={() =>
                                                    handleToggleStatus(category)
                                                }
                                                disabled={isProcessing}
                                                title={
                                                    category.is_active
                                                        ? "Deactivate"
                                                        : "Activate"
                                                }
                                            >
                                                <i
                                                    className={`fas fa-${
                                                        category.is_active
                                                            ? "pause"
                                                            : "play"
                                                    }`}
                                                ></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() =>
                                                    handleDeleteCategory(
                                                        category
                                                    )
                                                }
                                                disabled={isProcessing}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {categoriesPagination.last_page > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <div className="text-muted">
                                Showing {categoriesPagination.from} to{" "}
                                {categoriesPagination.to} of{" "}
                                {categoriesPagination.total} categories
                            </div>
                            <nav>
                                <ul className="pagination mb-0">
                                    <li
                                        className={`page-item ${
                                            categoriesPagination.current_page ===
                                            1
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                handlePageChange(
                                                    categoriesPagination.current_page -
                                                        1
                                                )
                                            }
                                            disabled={
                                                categoriesPagination.current_page ===
                                                1
                                            }
                                        >
                                            Previous
                                        </button>
                                    </li>

                                    {[
                                        ...Array(
                                            categoriesPagination.last_page
                                        ),
                                    ].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${
                                                    categoriesPagination.current_page ===
                                                    page
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        handlePageChange(page)
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    })}

                                    <li
                                        className={`page-item ${
                                            categoriesPagination.current_page ===
                                            categoriesPagination.last_page
                                                ? "disabled"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() =>
                                                handlePageChange(
                                                    categoriesPagination.current_page +
                                                        1
                                                )
                                            }
                                            disabled={
                                                categoriesPagination.current_page ===
                                                categoriesPagination.last_page
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
                /* Empty State */
                <div className="text-center py-5">
                    <div className="mb-4">
                        <i className="fas fa-folder-open fa-4x text-muted mb-3"></i>
                        <h4 className="text-muted">No Categories Found</h4>
                        <p className="text-muted">
                            {localFilters.search || localFilters.status
                                ? "No categories match your current filters."
                                : "Start by creating your first service category."}
                        </p>
                    </div>
                    <div className="d-flex gap-2 justify-content-center">
                        {(localFilters.search || localFilters.status) && (
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() =>
                                    setLocalFilters({
                                        search: "",
                                        status: "",
                                        sort_by: "sort_order",
                                        sort_order: "asc",
                                        per_page: 15,
                                    })
                                }
                            >
                                Clear Filters
                            </button>
                        )}
                        <a
                            href="/staff/categories/create"
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus me-2"></i>
                            Create First Category
                        </a>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                    Confirm Deletion
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    Are you sure you want to delete the category{" "}
                                    <strong>"{categoryToDelete?.name}"</strong>?
                                </p>
                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    This action cannot be undone. All services
                                    in this category will need to be reassigned.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmDelete}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-trash me-2"></i>
                                            Delete Category
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoriesList;
