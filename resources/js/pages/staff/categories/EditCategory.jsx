// resources/js/pages/staff/categories/EditCategory.jsx
// Complete category editing form with validation and change tracking

import React, { useState, useEffect } from "react";
import { useStaff } from "../../../context/StaffContext";
import { useNavigate, useParams } from "react-router-dom";
import StaffLayout from "../../../components/layouts/StaffLayout";

const EditCategory = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const {
        updateCategory,
        getCategoryById,
        isProcessing,
        errors,
        successMessage,
        clearErrors,
        currentCategory,
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

    // Original data for change tracking
    const [originalData, setOriginalData] = useState({});
    const [hasChanges, setHasChanges] = useState(false);

    // UI state
    const [validationErrors, setValidationErrors] = useState({});
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] =
        useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Predefined colors
    const predefinedColors = [
        "#007bff",
        "#6c757d",
        "#28a745",
        "#dc3545",
        "#ffc107",
        "#17a2b8",
        "#8b5cf6",
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

    // Load category data on mount
    useEffect(() => {
        loadCategory();
    }, [id]);

    // Track changes
    useEffect(() => {
        if (Object.keys(originalData).length > 0) {
            const changed = Object.keys(formData).some(
                (key) => formData[key] !== originalData[key]
            );
            setHasChanges(changed);
        }
    }, [formData, originalData]);

    // Auto-generate slug from name (only if slug wasn't manually changed)
    useEffect(() => {
        if (
            formData.name &&
            originalData.name &&
            formData.name !== originalData.name
        ) {
            // Only auto-update slug if it matches the original pattern
            const originalSlug = originalData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");

            if (
                formData.slug === originalSlug ||
                formData.slug === originalData.slug
            ) {
                const newSlug = formData.name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                setFormData((prev) => ({ ...prev, slug: newSlug }));
            }
        }
    }, [formData.name]);

    const loadCategory = async () => {
        try {
            setLoading(true);
            const category = await getCategoryById(id);

            // Add this debug line:
            console.log("Loaded category data:", category);

            const categoryData = {
                name: category.name || "",
                description: category.description || "",
                color: category.color || "#6c757d",
                icon: category.icon || "fas fa-folder",
                sort_order: category.sort_order || 0,
                is_active: category.is_active ?? true,
                meta_title: category.meta_title || "",
                meta_description: category.meta_description || "",
                slug: category.slug || "",
            };

            setFormData(categoryData);
            setOriginalData(categoryData);
        } catch (error) {
            console.error("Failed to load category:", error);
        } finally {
            setLoading(false);
        }
    };

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
            await updateCategory(id, formData);
            // Update original data to reflect saved state
            setOriginalData(formData);
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to update category:", error);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            setPendingNavigation("/staff/categories");
            setShowUnsavedChangesModal(true);
        } else {
            navigate("/staff/categories");
        }
    };

    const handleDiscardChanges = () => {
        setFormData(originalData);
        setHasChanges(false);
        setValidationErrors({});
        clearErrors();
    };

    const confirmNavigation = () => {
        setShowUnsavedChangesModal(false);
        if (pendingNavigation) {
            navigate(pendingNavigation);
        }
    };

    const getChangedFields = () => {
        const changes = [];
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== originalData[key]) {
                changes.push({
                    field: key,
                    from: originalData[key],
                    to: formData[key],
                });
            }
        });
        return changes;
    };

    if (loading) {
        return (
            <StaffLayout>
                <div className="staff-dashboard-content">
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ minHeight: "400px" }}
                    >
                        <div className="text-center">
                            <div
                                className="spinner-border text-primary mb-3"
                                role="status"
                            >
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted">Loading category...</p>
                        </div>
                    </div>
                </div>
            </StaffLayout>
        );
    }

    return (
        <StaffLayout>
            <div className="staff-dashboard-content">
                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-6">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">
                            Edit Category: {originalData.name}
                            {hasChanges && (
                                <span className="badge bg-warning ms-2">
                                    Unsaved Changes
                                </span>
                            )}
                        </h1>
                        <p className="page-subtitle">
                            Modify category details and settings
                        </p>
                    </div>

                    <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-responsive"
                            onClick={() => setPreviewMode(!previewMode)}
                        >
                            <i
                                className={`fas fa-${
                                    previewMode ? "edit" : "eye"
                                } me-2`}
                            ></i>
                            <span>{previewMode ? "Edit" : "Preview"}</span>
                        </button>
                        <a
                            href={`/staff/service-categories/${id}`}
                            className="btn btn-outline-info btn-responsive"
                        >
                            <i className="fas fa-eye me-2"></i>
                            <span>View Details</span>
                        </a>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-responsive"
                            onClick={handleCancel}
                        >
                            <i className="fas fa-arrow-left me-2"></i>
                            <span>Back to Categories</span>
                        </button>
                    </div>
                </div>

            {/* Change Indicator */}
            {hasChanges && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        You have unsaved changes. Don't forget to save your
                        modifications.
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => setPreviewMode(true)}
                        >
                            Preview Changes
                        </button>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleDiscardChanges}
                        >
                            Discard Changes
                        </button>
                    </div>
                </div>
            )}

            <div className="row">
                <div className="col-lg-8">
                    {/* Main Form */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom">
                            <h5 className="card-title mb-0">
                                <i className="fas fa-edit text-primary me-2"></i>
                                Category Information
                            </h5>
                        </div>
                        <div className="card-body">
                            {/* Error Messages */}
                            {errors.updateCategory && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {errors.updateCategory}
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
                                            {formData.name !==
                                                originalData.name && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                validationErrors.name
                                                    ? "is-invalid"
                                                    : ""
                                            } ${
                                                formData.name !==
                                                originalData.name
                                                    ? "border-info"
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
                                        {formData.name !==
                                            originalData.name && (
                                            <div className="form-text text-info">
                                                Changed from: "
                                                {originalData.name}"
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
                                            {formData.sort_order !==
                                                originalData.sort_order && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            className={`form-control ${
                                                validationErrors.sort_order
                                                    ? "is-invalid"
                                                    : ""
                                            } ${
                                                formData.sort_order !==
                                                originalData.sort_order
                                                    ? "border-info"
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
                                        {formData.description !==
                                            originalData.description && (
                                            <span className="badge bg-info ms-2">
                                                Modified
                                            </span>
                                        )}
                                    </label>
                                    <textarea
                                        className={`form-control ${
                                            validationErrors.description
                                                ? "is-invalid"
                                                : ""
                                        } ${
                                            formData.description !==
                                            originalData.description
                                                ? "border-info"
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
                                        {formData.slug !==
                                            originalData.slug && (
                                            <span className="badge bg-info ms-2">
                                                Modified
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${
                                            validationErrors.slug
                                                ? "is-invalid"
                                                : ""
                                        } ${
                                            formData.slug !== originalData.slug
                                                ? "border-info"
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
                                            {formData.color !==
                                                originalData.color && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
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
                                            {formData.icon !==
                                                originalData.icon && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
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
                                            <strong>
                                                Active Category
                                                {formData.is_active !==
                                                    originalData.is_active && (
                                                    <span className="badge bg-info ms-2">
                                                        Modified
                                                    </span>
                                                )}
                                            </strong>
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
                                            {formData.meta_title !==
                                                originalData.meta_title && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${
                                                validationErrors.meta_title
                                                    ? "is-invalid"
                                                    : ""
                                            } ${
                                                formData.meta_title !==
                                                originalData.meta_title
                                                    ? "border-info"
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
                                            {formData.meta_description !==
                                                originalData.meta_description && (
                                                <span className="badge bg-info ms-2">
                                                    Modified
                                                </span>
                                            )}
                                        </label>
                                        <textarea
                                            className={`form-control ${
                                                validationErrors.meta_description
                                                    ? "is-invalid"
                                                    : ""
                                            } ${
                                                formData.meta_description !==
                                                originalData.meta_description
                                                    ? "border-info"
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
                                            disabled={
                                                isProcessing || !hasChanges
                                            }
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Updating...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Update Category
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-warning"
                                            onClick={handleDiscardChanges}
                                            disabled={
                                                isProcessing || !hasChanges
                                            }
                                        >
                                            <i className="fas fa-undo me-2"></i>
                                            Discard Changes
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
                    <div className="card border-0 shadow-sm sticky-top mb-4">
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
                                                {currentCategory?.services_count
                                                    ?.total || 0}{" "}
                                                services
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
                                        <span>
                                            Updated:{" "}
                                            {new Date().toLocaleDateString()}
                                        </span>
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
                        </div>
                    </div>

                    {/* Changes Summary */}
                    {hasChanges && (
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <h6 className="card-title mb-0">
                                    <i className="fas fa-list-alt text-warning me-2"></i>
                                    Pending Changes
                                </h6>
                            </div>
                            <div className="card-body">
                                {getChangedFields().map((change, index) => (
                                    <div
                                        key={index}
                                        className="mb-3 p-2 bg-light rounded"
                                    >
                                        <div className="fw-semibold text-capitalize mb-1">
                                            {change.field.replace("_", " ")}
                                        </div>
                                        <div className="small">
                                            <div className="text-muted">
                                                <span className="fw-semibold">
                                                    From:
                                                </span>{" "}
                                                {change.field === "is_active"
                                                    ? change.from
                                                        ? "Active"
                                                        : "Inactive"
                                                    : change.from || "(empty)"}
                                            </div>
                                            <div className="text-info">
                                                <span className="fw-semibold">
                                                    To:
                                                </span>{" "}
                                                {change.field === "is_active"
                                                    ? change.to
                                                        ? "Active"
                                                        : "Inactive"
                                                    : change.to || "(empty)"}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="d-flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-success flex-grow-1"
                                        onClick={handleSubmit}
                                        disabled={isProcessing}
                                    >
                                        <i className="fas fa-save me-1"></i>
                                        Save All
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={handleDiscardChanges}
                                        disabled={isProcessing}
                                    >
                                        <i className="fas fa-undo me-1"></i>
                                        Discard
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            {showUnsavedChangesModal && (
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
                                    Unsaved Changes
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() =>
                                        setShowUnsavedChangesModal(false)
                                    }
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    You have unsaved changes to this category.
                                    What would you like to do?
                                </p>

                                {/* List of changes */}
                                <div className="border rounded p-3 bg-light mb-3">
                                    <h6 className="mb-2">Pending Changes:</h6>
                                    {getChangedFields().map((change, index) => (
                                        <div key={index} className="small mb-1">
                                            <span className="fw-semibold text-capitalize">
                                                {change.field.replace("_", " ")}
                                                :
                                            </span>
                                            <span className="text-muted ms-1">
                                                "{change.from || "(empty)"}" → "
                                                {change.to || "(empty)"}"
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="alert alert-warning">
                                    <i className="fas fa-info-circle me-2"></i>
                                    If you leave without saving, all changes
                                    will be lost.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={async () => {
                                        await handleSubmit();
                                        if (pendingNavigation) {
                                            navigate(pendingNavigation);
                                        }
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                            ></span>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            Save & Continue
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-warning"
                                    onClick={() =>
                                        setShowUnsavedChangesModal(false)
                                    }
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Keep Editing
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={confirmNavigation}
                                    disabled={isProcessing}
                                >
                                    <i className="fas fa-trash me-2"></i>
                                    Discard & Leave
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default EditCategory;
