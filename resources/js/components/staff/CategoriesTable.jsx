import React from "react";

const CategoriesTable = ({
    categories = [],
    selectedCategories = [],
    onSelectCategory,
    onSelectAll,
    onToggleStatus,
    onDeleteCategory,
    isProcessing = false,
    loading = false,
}) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getCategoryStatusBadge = (category) => {
        return category.is_active ? (
            <span className="badge bg-success">Active</span>
        ) : (
            <span className="badge bg-secondary">Inactive</span>
        );
    };

    if (loading) {
        return (
            <div className="card border-0 shadow-sm">
                <div className="card-body">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="card border-0 shadow-sm">
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "50px" }}>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={selectedCategories.length === categories.length && categories.length > 0}
                                        onChange={onSelectAll}
                                    />
                                </div>
                            </th>
                            <th style={{ width: "60px" }}>Icon</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th style={{ width: "120px" }}>Services</th>
                            <th style={{ width: "100px" }}>Status</th>
                            <th style={{ width: "80px" }}>Order</th>
                            <th style={{ width: "120px" }}>Created</th>
                            <th style={{ width: "180px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td>
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => onSelectCategory(category.id)}
                                        />
                                    </div>
                                </td>
                                <td>
                                    <div
                                        className="d-flex align-items-center justify-content-center rounded"
                                        style={{
                                            width: "35px",
                                            height: "35px",
                                            backgroundColor: category.color || "#6c757d",
                                            color: "white",
                                        }}
                                    >
                                        <i className={category.icon || "fas fa-folder"} style={{ fontSize: "14px" }}></i>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <h6 className="mb-1">{category.name}</h6>
                                        <small className="text-muted">
                                            ID: {category.id} • Slug: {category.slug}
                                        </small>
                                    </div>
                                </td>
                                <td>
                                    <span className="text-muted small">
                                        {category.description 
                                            ? (category.description.length > 60 
                                                ? `${category.description.substring(0, 60)}...` 
                                                : category.description)
                                            : "No description provided"
                                        }
                                    </span>
                                </td>
                                <td>
                                    <div className="text-center">
                                        <span className="badge bg-primary">
                                            {category.services_count || 0}
                                        </span>
                                        <div>
                                            <small className="text-muted">services</small>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    {getCategoryStatusBadge(category)}
                                </td>
                                <td>
                                    <span className="badge bg-light text-dark">
                                        {category.sort_order || 0}
                                    </span>
                                </td>
                                <td>
                                    <small className="text-muted">
                                        {formatDate(category.created_at)}
                                    </small>
                                </td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <a
                                            href={`/staff/service-categories/${category.id}`}
                                            className="btn btn-sm btn-outline-primary"
                                            title="View Details"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </a>
                                        <a
                                            href={`/staff/service-categories/${category.id}/edit`}
                                            className="btn btn-sm btn-outline-secondary"
                                            title="Edit Category"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </a>
                                        <button
                                            className={`btn btn-sm ${
                                                category.is_active
                                                    ? "btn-outline-warning"
                                                    : "btn-outline-success"
                                            }`}
                                            onClick={() => onToggleStatus(category)}
                                            disabled={isProcessing}
                                            title={category.is_active ? "Deactivate" : "Activate"}
                                        >
                                            <i
                                                className={`fas fa-${
                                                    category.is_active ? "pause" : "play"
                                                }`}
                                            ></i>
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => onDeleteCategory(category)}
                                            disabled={isProcessing}
                                            title="Delete Category"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {categories.length === 0 && (
                <div className="card-body text-center py-5">
                    <i className="fas fa-table fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Categories Found</h5>
                    <p className="text-muted mb-0">No categories match your current filters.</p>
                </div>
            )}
        </div>
    );
};

export default CategoriesTable;