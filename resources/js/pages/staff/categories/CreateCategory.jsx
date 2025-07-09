import React, { useState, useEffect } from "react";
import { useStaff } from "../../../context/StaffContext";
import { useNavigate } from "react-router-dom";

const CreateCategory = () => {
    const navigate = useNavigate();
    const {
        createCategory,
        isProcessing,
        errors,
        successMessage,
        clearErrors,
    } = useStaff();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        color: "#6c757d",
        icon: "fas fa-folder",
        sort_order: 0,
        is_active: true,
        meta_title: "",
        meta_description: "",
        slug: "",
    });

    // UI state
    const [validationErrors, setValidationErrors] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    // Predefined colors
    const predefinedColors = [
        "#007bff",
        "#6c757d",
        "#28a745",
        "#dc3545",
        "#ffc107",
        "#17a2b8",
        "#6f42c1",
        "#e83e8c",
        "#fd7e14",
        "#20c997",
        "#6610f2",
        "#e91e63",
        "#795548",
        "#607d8b",
        "#ff5722",
        "#9c27b0",
        "#2196f3",
        "#4caf50",
    ];

    // Predefined icons
    const predefinedIcons = [
        "fas fa-folder",
        "fas fa-home",
        "fas fa-car",
        "fas fa-heart",
        "fas fa-star",
        "fas fa-camera",
        "fas fa-music",
        "fas fa-book",
        "fas fa-laptop",
        "fas fa-mobile-alt",
        "fas fa-paint-brush",
        "fas fa-utensils",
        "fas fa-shopping-cart",
        "fas fa-graduation-cap",
        "fas fa-briefcase",
        "fas fa-plane",
        "fas fa-dumbbell",
        "fas fa-spa",
        "fas fa-tools",
        "fas fa-cut",
        "fas fa-stethoscope",
        "fas fa-baby",
        "fas fa-paw",
        "fas fa-tree",
    ];

    useEffect(() => {
        // Auto-generate slug from name
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    }, [formData.name]);

    useEffect(() => {
        // Auto-generate meta fields if empty
        if (formData.name && !formData.meta_title) {
            setFormData((prev) => ({
                ...prev,
                meta_title: formData.name,
                meta_description: formData.description,
            }));
        }
    }, [formData.name, formData.description]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        // Clear validation error for this field
        if (validationErrors[name]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleColorSelect = (color) => {
        setFormData((prev) => ({ ...prev, color }));
        setShowColorPicker(false);
    };

    const handleIconSelect = (icon) => {
        setFormData((prev) => ({ ...prev, icon }));
        setShowIconPicker(false);
    };

    const validateForm = () => {
        const errors = {};

        // Required fields
        if (!formData.name.trim()) {
            errors.name = "Category name is required";
        } else if (formData.name.length < 2) {
            errors.name = "Category name must be at least 2 characters";
        } else if (formData.name.length > 100) {
            errors.name = "Category name cannot exceed 100 characters";
        }

        if (!formData.description.trim()) {
            errors.description = "Description is required";
        } else if (formData.description.length < 10) {
            errors.description = "Description must be at least 10 characters";
        } else if (formData.description.length > 500) {
            errors.description = "Description cannot exceed 500 characters";
        }

        // Slug validation
        if (!formData.slug.trim()) {
            errors.slug = "Slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            errors.slug =
                "Slug can only contain lowercase letters, numbers, and hyphens";
        }

        // Sort order validation
        if (formData.sort_order < 0) {
            errors.sort_order = "Sort order cannot be negative";
        }

        // Meta fields validation
        if (formData.meta_title && formData.meta_title.length > 60) {
            errors.meta_title = "Meta title should not exceed 60 characters";
        }

        if (
            formData.meta_description &&
            formData.meta_description.length > 160
        ) {
            errors.meta_description =
                "Meta description should not exceed 160 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await createCategory(formData);
            // Redirect to categories list on success
            navigate("/staff/categories");
        } catch (error) {
            console.error("Failed to create category:", error);
        }
    };

    const handleCancel = () => {
        navigate("/staff/categories");
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            color: "#6c757d",
            icon: "fas fa-folder",
            sort_order: 0,
            is_active: true,
            meta_title: "",
            meta_description: "",
            slug: "",
        });
        setValidationErrors({});
        clearErrors();
    };

    return (
        <>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1">Create New Category</h1>
                    <p className="text-muted mb-0">
                        Add a new service category to organize platform services
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setPreviewMode(!previewMode)}
                    >
                        <i
                            className={`fas fa-${
                                previewMode ? "edit" : "eye"
                            } me-2`}
                        ></i>
                        {previewMode ? "Edit" : "Preview"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleCancel}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Categories
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    {/* Main Form */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="card-title mb-0">
                                <i className="fas fa-plus-circle text-primary me-2"></i>
                                Category Information
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Error Messages */}
                            {errors.createCategory && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.createCategory}
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div
                                    className="alert alert-success"
                                    role="alert"
                                >
                                    <i className="fas fa-check-circle me-2"></i>
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="row">
                                    {/* Category Name */}
                                    <div className="col-md-8 mb-3">
                                        <label
                                            htmlFor="name"
                                            className="form-label"
                                        >
                                            Category Name{" "}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                validationErrors.name
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="Enter category name"
                                            disabled={previewMode}
                                        />
                                        {validationErrors.name && (
                                            <div className="invalid-feedback">
                                                {validationErrors.name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Sort Order */}
                                    <div className="col-md-4 mb-3">
                                        <label
                                            htmlFor="sort_order"
                                            className="form-label"
                                        >
                                            Sort Order
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${
                                                validationErrors.sort_order
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="sort_order"
                                            name="sort_order"
                                            value={formData.sort_order}
                                            onChange={handleInputChange}
                                            min="0"
                                            disabled={previewMode}
                                        />
                                        {validationErrors.sort_order && (
                                            <div className="invalid-feedback">
                                                {validationErrors.sort_order}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            Lower numbers appear first
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="description"
                                        className="form-label"
                                    >
                                        Description{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <textarea
                                        className={`form-control ${
                                            validationErrors.description
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Describe what this category is for"
                                        disabled={previewMode}
                                    ></textarea>
                                    {validationErrors.description && (
                                        <div className="invalid-feedback">
                                            {validationErrors.description}
                                        </div>
                                    )}
                                    <div className="form-text">
                                        {formData.description.length}/500
                                        characters
                                    </div>
                                </div>

                                {/* Slug */}
                                <div className="mb-3">
                                    <label
                                        htmlFor="slug"
                                        className="form-label"
                                    >
                                        URL Slug{" "}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            validationErrors.slug
                                                ? "is-invalid"
                                                : ""
                                        }`}
                                        id="slug"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleInputChange}
                                        placeholder="category-url-slug"
                                        disabled={previewMode}
                                    />
                                    {validationErrors.slug && (
                                        <div className="invalid-feedback">
                                            {validationErrors.slug}
                                        </div>
                                    )}
                                    <div className="form-text">
                                        Will be: /categories/{formData.slug}
                                    </div>
                                </div>

                                {/* Visual Settings */}
                                <div className="row">
                                    {/* Color Picker */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Category Color
                                        </label>
                                        <div className="d-flex align-items-center gap-3">
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary d-flex align-items-center gap-2"
                                                onClick={() =>
                                                    setShowColorPicker(
                                                        !showColorPicker
                                                    )
                                                }
                                                disabled={previewMode}
                                            >
                                                <div
                                                    className="rounded"
                                                    style={{
                                                        width: "20px",
                                                        height: "20px",
                                                        backgroundColor:
                                                            formData.color,
                                                    }}
                                                ></div>
                                                {formData.color}
                                            </button>
                                            <input
                                                type="color"
                                                className="form-control form-control-color"
                                                value={formData.color}
                                                onChange={(e) =>
                                                    handleColorSelect(
                                                        e.target.value
                                                    )
                                                }
                                                style={{ width: "50px" }}
                                                disabled={previewMode}
                                            />
                                        </div>

                                        {showColorPicker && !previewMode && (
                                            <div className="mt-2 p-2 border rounded bg-light">
                                                <div className="row g-1">
                                                    {predefinedColors.map(
                                                        (color) => (
                                                            <div
                                                                key={color}
                                                                className="col-2"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className="btn w-100 p-2"
                                                                    style={{
                                                                        backgroundColor:
                                                                            color,
                                                                        border:
                                                                            formData.color ===
                                                                            color
                                                                                ? "2px solid #000"
                                                                                : "1px solid #ddd",
                                                                    }}
                                                                    onClick={() =>
                                                                        handleColorSelect(
                                                                            color
                                                                        )
                                                                    }
                                                                    title={
                                                                        color
                                                                    }
                                                                ></button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Icon Picker */}
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">
                                            Category Icon
                                        </label>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary d-flex align-items-center gap-2 w-100"
                                            onClick={() =>
                                                setShowIconPicker(
                                                    !showIconPicker
                                                )
                                            }
                                            disabled={previewMode}
                                        >
                                            <i className={formData.icon}></i>
                                            {formData.icon}
                                        </button>

                                        {showIconPicker && !previewMode && (
                                            <div
                                                className="mt-2 p-2 border rounded bg-light"
                                                style={{
                                                    maxHeight: "200px",
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <div className="row g-1">
                                                    {predefinedIcons.map(
                                                        (icon) => (
                                                            <div
                                                                key={icon}
                                                                className="col-3"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={`btn w-100 ${
                                                                        formData.icon ===
                                                                        icon
                                                                            ? "btn-primary"
                                                                            : "btn-outline-secondary"
                                                                    }`}
                                                                    onClick={() =>
                                                                        handleIconSelect(
                                                                            icon
                                                                        )
                                                                    }
                                                                    title={icon}
                                                                >
                                                                    <i
                                                                        className={
                                                                            icon
                                                                        }
                                                                    ></i>
                                                                </button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="mb-4">
                                    <div className="form-check form-switch">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="is_active"
                                            name="is_active"
                                            checked={formData.is_active}
                                            onChange={handleInputChange}
                                            disabled={previewMode}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="is_active"
                                        >
                                            <strong>Active Category</strong>
                                            <div className="form-text">
                                                {formData.is_active
                                                    ? "Category will be visible to service providers"
                                                    : "Category will be hidden from service providers"}
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* SEO Settings */}
                                <div className="border-top pt-4">
                                    <h6 className="mb-3">
                                        <i className="fas fa-search text-success me-2"></i>
                                        SEO Settings (Optional)
                                    </h6>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="meta_title"
                                            className="form-label"
                                        >
                                            Meta Title
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                validationErrors.meta_title
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="meta_title"
                                            name="meta_title"
                                            value={formData.meta_title}
                                            onChange={handleInputChange}
                                            placeholder="SEO title for search engines"
                                            disabled={previewMode}
                                        />
                                        {validationErrors.meta_title && (
                                            <div className="invalid-feedback">
                                                {validationErrors.meta_title}
                                            </div>
                                        )}
                                        <div className="form-text">
                                            {formData.meta_title.length}/60
                                            characters recommended
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label
                                            htmlFor="meta_description"
                                            className="form-label"
                                        >
                                            Meta Description
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                validationErrors.meta_description
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            id="meta_description"
                                            name="meta_description"
                                            value={formData.meta_description}
                                            onChange={handleInputChange}
                                            rows="2"
                                            placeholder="SEO description for search engines"
                                            disabled={previewMode}
                                        ></textarea>
                                        {validationErrors.meta_description && (
                                            <div className="invalid-feedback">
                                                {
                                                    validationErrors.meta_description
                                                }
                                            </div>
                                        )}
                                        <div className="form-text">
                                            {formData.meta_description.length}
                                            /160 characters recommended
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                {!previewMode && (
                                    <div className="d-flex gap-2 pt-3 border-top">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Create Category
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={resetForm}
                                            disabled={isProcessing}
                                        >
                                            <i className="fas fa-undo me-2"></i>
                                            Reset Form
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={handleCancel}
                                            disabled={isProcessing}
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    {/* Live Preview */}
                    <div className="card border-0 shadow-sm sticky-top">
                        <div className="card-header bg-white border-bottom">
                            <h6 className="card-title mb-0">
                                <i className="fas fa-eye text-info me-2"></i>
                                Live Preview
                            </h6>
                        </div>
                        <div className="card-body">
                            {/* Category Preview Card */}
                            <div
                                className="card border-2"
                                style={{ borderColor: formData.color }}
                            >
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        <div
                                            className="category-icon me-3 d-flex align-items-center justify-content-center rounded"
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                backgroundColor: formData.color,
                                                color: "white",
                                            }}
                                        >
                                            <i
                                                className={
                                                    formData.icon ||
                                                    "fas fa-folder"
                                                }
                                            ></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h6 className="mb-1">
                                                {formData.name ||
                                                    "Category Name"}
                                            </h6>
                                            <small className="text-muted">
                                                0 services
                                            </small>
                                        </div>
                                        <span
                                            className={`badge ${
                                                formData.is_active
                                                    ? "bg-success"
                                                    : "bg-secondary"
                                            }`}
                                        >
                                            {formData.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </span>
                                    </div>
                                    <p className="text-muted small mb-2">
                                        {formData.description ||
                                            "Category description will appear here..."}
                                    </p>
                                    <div className="d-flex justify-content-between align-items-center text-muted small">
                                        <span>
                                            Order: {formData.sort_order}
                                        </span>
                                        <span>New</span>
                                    </div>
                                </div>
                            </div>

                            {/* SEO Preview */}
                            {(formData.meta_title ||
                                formData.meta_description) && (
                                <div className="mt-3">
                                    <h6 className="text-muted mb-2">
                                        <i className="fas fa-search me-1"></i>
                                        SEO Preview
                                    </h6>
                                    <div className="p-3 bg-light rounded">
                                        <div className="text-primary fw-semibold">
                                            {formData.meta_title ||
                                                formData.name}
                                        </div>
                                        <div className="text-success small">
                                            example.com/categories/
                                            {formData.slug}
                                        </div>
                                        <div className="text-muted small mt-1">
                                            {formData.meta_description ||
                                                formData.description}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Progress */}
                            <div className="mt-3">
                                <h6 className="text-muted mb-2">
                                    Form Completion
                                </h6>
                                <div
                                    className="progress"
                                    style={{ height: "8px" }}
                                >
                                    <div
                                        className="progress-bar bg-success"
                                        style={{
                                            width: `${Math.round(
                                                (((formData.name ? 1 : 0) +
                                                    (formData.description
                                                        ? 1
                                                        : 0) +
                                                    (formData.slug ? 1 : 0)) /
                                                    3) *
                                                    100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <small className="text-muted">
                                    Required fields:{" "}
                                    {(formData.name ? 1 : 0) +
                                        (formData.description ? 1 : 0) +
                                        (formData.slug ? 1 : 0)}
                                    /3 completed
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateCategory;
