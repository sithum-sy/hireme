import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useServices } from "../../context/ServicesContext";

const ServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { createService, updateService, getServiceCategories, loading } =
        useServices();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category_id: "",
        pricing_type: "fixed",
        base_price: "",
        duration_hours: "",
        requirements: "",
        includes: "",
        service_areas: [],
        service_images: [],
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [imagesPreviews, setImagesPreviews] = useState([]);

    const sriLankanAreas = [
        "Colombo",
        "Kandy",
        "Galle",
        "Negombo",
        "Jaffna",
        "Anuradhapura",
        "Trincomalee",
        "Matara",
        "Kurunegala",
        "Ratnapura",
        "Batticaloa",
        "Badulla",
        "Puttalam",
        "Kalutara",
        "Vavuniya",
        "Hambantota",
    ];

    useEffect(() => {
        loadCategories();
        if (isEdit) {
            loadServiceData();
        }
    }, [isEdit, id]);

    const loadCategories = async () => {
        const result = await getServiceCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    const loadServiceData = async () => {
        // In a real app, you'd fetch the service data by ID
        // For now, we'll just show the form for editing
        console.log("Loading service data for ID:", id);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleServiceAreasChange = (area) => {
        setFormData((prev) => ({
            ...prev,
            service_areas: prev.service_areas.includes(area)
                ? prev.service_areas.filter((a) => a !== area)
                : [...prev.service_areas, area],
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.service_images.length > 5) {
            alert("You can upload maximum 5 images");
            return;
        }

        const newImages = [];
        const newPreviews = [];

        files.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) {
                // 2MB limit
                alert(`${file.name} is too large. Maximum size is 2MB.`);
                return;
            }

            newImages.push(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                if (newPreviews.length === files.length) {
                    setImagesPreviews((prev) => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setFormData((prev) => ({
            ...prev,
            service_images: [...prev.service_images, ...newImages],
        }));
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            service_images: prev.service_images.filter((_, i) => i !== index),
        }));
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim())
            newErrors.title = "Service title is required";
        if (!formData.description.trim())
            newErrors.description = "Description is required";
        if (!formData.category_id)
            newErrors.category_id = "Please select a category";
        if (!formData.base_price || formData.base_price <= 0)
            newErrors.base_price = "Please enter a valid price";
        if (!formData.duration_hours || formData.duration_hours <= 0)
            newErrors.duration_hours = "Please enter valid duration";
        if (formData.service_areas.length === 0)
            newErrors.service_areas = "Please select at least one service area";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const submitData = new FormData();

        // Add text fields
        Object.keys(formData).forEach((key) => {
            if (key === "service_areas") {
                formData[key].forEach((area, index) => {
                    submitData.append(`service_areas[${index}]`, area);
                });
            } else if (key === "service_images") {
                formData[key].forEach((image, index) => {
                    submitData.append(`service_images[${index}]`, image);
                });
            } else {
                submitData.append(key, formData[key]);
            }
        });

        const result = isEdit
            ? await updateService(id, submitData)
            : await createService(submitData);

        if (result.success) {
            navigate("/provider/services");
        } else {
            setErrors(result.errors || { general: result.message });
        }
    };

    return (
        <div className="service-form">
            <div className="form-header">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">
                            {isEdit ? "Edit Service" : "Add New Service"}
                        </h4>
                        <p className="text-muted mb-0">
                            {isEdit
                                ? "Update your service details"
                                : "Create a new service offering"}
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/provider/services")}
                    >
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Services
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-8">
                    <form onSubmit={handleSubmit}>
                        <div className="card">
                            <div className="card-body">
                                {/* Basic Information */}
                                <h5 className="card-title mb-4">
                                    Basic Information
                                </h5>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">
                                            Service Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            className={`form-control ${
                                                errors.title ? "is-invalid" : ""
                                            }`}
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Professional House Cleaning"
                                        />
                                        {errors.title && (
                                            <div className="invalid-feedback">
                                                {errors.title}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Category *
                                        </label>
                                        <select
                                            name="category_id"
                                            className={`form-select ${
                                                errors.category_id
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.category_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">
                                                Select a category
                                            </option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <div className="invalid-feedback">
                                                {errors.category_id}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Pricing Type *
                                        </label>
                                        <select
                                            name="pricing_type"
                                            className="form-select"
                                            value={formData.pricing_type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="fixed">
                                                Fixed Price
                                            </option>
                                            <option value="hourly">
                                                Hourly Rate
                                            </option>
                                        </select>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            {formData.pricing_type === "fixed"
                                                ? "Price (Rs.)"
                                                : "Hourly Rate (Rs.)"}{" "}
                                            *
                                        </label>
                                        <input
                                            type="number"
                                            name="base_price"
                                            className={`form-control ${
                                                errors.base_price
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.base_price}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.base_price && (
                                            <div className="invalid-feedback">
                                                {errors.base_price}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label">
                                            Duration (Hours) *
                                        </label>
                                        <input
                                            type="number"
                                            name="duration_hours"
                                            className={`form-control ${
                                                errors.duration_hours
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            value={formData.duration_hours}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 2"
                                            min="0.5"
                                            step="0.5"
                                        />
                                        {errors.duration_hours && (
                                            <div className="invalid-feedback">
                                                {errors.duration_hours}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            Description *
                                        </label>
                                        <textarea
                                            name="description"
                                            className={`form-control ${
                                                errors.description
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            rows="4"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            placeholder="Describe your service in detail..."
                                        />
                                        {errors.description && (
                                            <div className="invalid-feedback">
                                                {errors.description}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Service Areas */}
                                <hr className="my-4" />
                                <h5 className="card-title mb-3">
                                    Service Areas *
                                </h5>
                                <div className="service-areas-grid">
                                    {sriLankanAreas.map((area) => (
                                        <div key={area} className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`area-${area}`}
                                                checked={formData.service_areas.includes(
                                                    area
                                                )}
                                                onChange={() =>
                                                    handleServiceAreasChange(
                                                        area
                                                    )
                                                }
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`area-${area}`}
                                            >
                                                {area}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.service_areas && (
                                    <div className="text-danger small mt-2">
                                        {errors.service_areas}
                                    </div>
                                )}

                                {/* Additional Details */}
                                <hr className="my-4" />
                                <h5 className="card-title mb-3">
                                    Additional Details
                                </h5>

                                <div className="row g-3">
                                    <div className="col-12">
                                        <label className="form-label">
                                            Requirements
                                        </label>
                                        <textarea
                                            name="requirements"
                                            className="form-control"
                                            rows="3"
                                            value={formData.requirements}
                                            onChange={handleInputChange}
                                            placeholder="What do you need from the client? (e.g., access to cleaning supplies, parking space)"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label">
                                            What's Included
                                        </label>
                                        <textarea
                                            name="includes"
                                            className="form-control"
                                            rows="3"
                                            value={formData.includes}
                                            onChange={handleInputChange}
                                            placeholder="What's included in your service? (e.g., cleaning supplies, equipment, follow-up)"
                                        />
                                    </div>
                                </div>

                                {/* Service Images */}
                                <hr className="my-4" />
                                <h5 className="card-title mb-3">
                                    Service Images
                                </h5>

                                <div className="image-upload-section">
                                    <div className="upload-area">
                                        <input
                                            type="file"
                                            id="service-images"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageUpload}
                                            className="d-none"
                                        />
                                        <label
                                            htmlFor="service-images"
                                            className="upload-label"
                                        >
                                            <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                            <p className="mb-1">
                                                Click to upload images
                                            </p>
                                            <small className="text-muted">
                                                Maximum 5 images, 2MB each
                                            </small>
                                        </label>
                                    </div>

                                    {imagesPreviews.length > 0 && (
                                        <div className="images-preview mt-3">
                                            <div className="row g-2">
                                                {imagesPreviews.map(
                                                    (preview, index) => (
                                                        <div
                                                            key={index}
                                                            className="col-md-3"
                                                        >
                                                            <div className="image-preview-item">
                                                                <img
                                                                    src={
                                                                        preview
                                                                    }
                                                                    alt={`Preview ${
                                                                        index +
                                                                        1
                                                                    }`}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-danger btn-sm remove-image"
                                                                    onClick={() =>
                                                                        removeImage(
                                                                            index
                                                                        )
                                                                    }
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {errors.general && (
                                    <div className="alert alert-danger mt-3">
                                        {errors.general}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-actions mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        {isEdit ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save me-2"></i>
                                        {isEdit
                                            ? "Update Service"
                                            : "Create Service"}
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => navigate("/provider/services")}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tips Sidebar */}
                <div className="col-lg-4">
                    <div className="card">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                💡 Tips for Success
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="tips-list">
                                <div className="tip-item">
                                    <i className="fas fa-lightbulb text-warning me-2"></i>
                                    <strong>Clear Title:</strong> Use
                                    descriptive titles that clients can easily
                                    understand
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-image text-info me-2"></i>
                                    <strong>Quality Images:</strong> Upload
                                    high-quality photos of your work to attract
                                    more clients
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-dollar-sign text-success me-2"></i>
                                    <strong>Competitive Pricing:</strong>{" "}
                                    Research similar services to price
                                    competitively
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-list text-primary me-2"></i>
                                    <strong>Detailed Description:</strong>{" "}
                                    Explain what clients can expect from your
                                    service
                                </div>
                                <div className="tip-item">
                                    <i className="fas fa-map-marker-alt text-danger me-2"></i>
                                    <strong>Service Areas:</strong> Select all
                                    areas where you can provide service
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card mt-4">
                        <div className="card-header">
                            <h6 className="card-title mb-0">
                                📊 Pricing Guidelines
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="pricing-guidelines">
                                <div className="guideline-item">
                                    <strong>House Cleaning:</strong> Rs.
                                    150-300/hour
                                </div>
                                <div className="guideline-item">
                                    <strong>Tutoring:</strong> Rs. 500-1500/hour
                                </div>
                                <div className="guideline-item">
                                    <strong>Plumbing:</strong> Rs. 800-2000/hour
                                </div>
                                <div className="guideline-item">
                                    <strong>Electrical:</strong> Rs.
                                    1000-2500/hour
                                </div>
                                <div className="guideline-item">
                                    <strong>Gardening:</strong> Rs. 200-500/hour
                                </div>
                            </div>
                            <small className="text-muted">
                                * These are average market rates. Adjust based
                                on your experience and location.
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceForm;
