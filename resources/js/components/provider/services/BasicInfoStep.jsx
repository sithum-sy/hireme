import React from "react";

const BasicInfoStep = ({ 
    formData, 
    categories, 
    errors, 
    onInputChange,
    getPricingPreview 
}) => {
    return (
        <div className="step-content">
            <div className="row">
                <div className="col-md-8">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Service Title{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            className={`form-control ${
                                errors.title ? "is-invalid" : ""
                            }`}
                            name="title"
                            value={formData.title}
                            onChange={onInputChange}
                            placeholder="e.g., Professional House Cleaning"
                            maxLength="255"
                        />
                        {errors.title && (
                            <div className="invalid-feedback">
                                {errors.title}
                            </div>
                        )}
                        <div className="form-text">
                            {formData.title.length}/255 characters
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Category{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <select
                            className={`form-select ${
                                errors.category_id ? "is-invalid" : ""
                            }`}
                            name="category_id"
                            value={formData.category_id}
                            onChange={onInputChange}
                        >
                            <option value="">Select category</option>
                            {(Array.isArray(categories) ? categories : []).map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}
                        </select>
                        {errors.category_id && (
                            <div className="invalid-feedback">
                                {errors.category_id}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Service Description{" "}
                    <span className="text-danger">*</span>
                </label>
                <textarea
                    className={`form-control ${
                        errors.description ? "is-invalid" : ""
                    }`}
                    name="description"
                    value={formData.description}
                    onChange={onInputChange}
                    placeholder="Describe your service in detail. What do you offer? What makes it special?"
                    rows="4"
                    maxLength="2000"
                ></textarea>
                {errors.description && (
                    <div className="invalid-feedback">
                        {errors.description}
                    </div>
                )}
                <div className="form-text">
                    {formData.description.length}/2000 characters (minimum 50 required)
                </div>
            </div>

            <div className="row">
                <div className="col-md-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Pricing Type{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <select
                            className="form-select"
                            name="pricing_type"
                            value={formData.pricing_type}
                            onChange={onInputChange}
                        >
                            <option value="fixed">Fixed Price</option>
                            <option value="hourly">Hourly Rate</option>
                            <option value="custom">Custom Pricing</option>
                        </select>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            {formData.pricing_type === "custom"
                                ? "Starting Price"
                                : "Price"}{" "}
                            <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                            <span className="input-group-text">Rs.</span>
                            <input
                                type="number"
                                className={`form-control ${
                                    errors.base_price ? "is-invalid" : ""
                                }`}
                                name="base_price"
                                value={formData.base_price}
                                onChange={onInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={formData.pricing_type === "custom"}
                            />
                        </div>
                        {errors.base_price && (
                            <div className="invalid-feedback">
                                {errors.base_price}
                            </div>
                        )}
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Duration (hours){" "}
                            <span className="text-danger">*</span>
                        </label>
                        <input
                            type="number"
                            className={`form-control ${
                                errors.duration_hours ? "is-invalid" : ""
                            }`}
                            name="duration_hours"
                            value={formData.duration_hours}
                            onChange={onInputChange}
                            placeholder="2.5"
                            min="0.5"
                            max="24"
                            step="0.5"
                        />
                        {errors.duration_hours && (
                            <div className="invalid-feedback">
                                {errors.duration_hours}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {formData.pricing_type === "custom" && (
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        Custom Pricing Description{" "}
                        <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className={`form-control ${
                            errors.custom_pricing_description
                                ? "is-invalid"
                                : ""
                        }`}
                        name="custom_pricing_description"
                        value={formData.custom_pricing_description}
                        onChange={onInputChange}
                        placeholder="Explain your pricing structure (e.g., varies by project size, consultation required)"
                        rows="3"
                        maxLength="500"
                    ></textarea>
                    {errors.custom_pricing_description && (
                        <div className="invalid-feedback">
                            {errors.custom_pricing_description}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BasicInfoStep;