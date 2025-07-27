import React from "react";

const ServicePreview = ({ 
    formData = {}, 
    categories = [], 
    imagesPreviews = [], 
    getPricingPreview = () => "Rs. 0",
    selectedAreas = []
}) => {
    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-bottom">
                <h6 className="mb-0 fw-bold">
                    <i className="fas fa-eye text-primary me-2"></i>
                    Preview
                </h6>
            </div>
            <div className="card-body">
                <div className="service-preview">
                    {/* Title and Category */}
                    <div className="mb-3">
                        <h6 className="fw-bold">
                            {formData.title || "Service Title"}
                        </h6>
                        {formData.category_id && categories.length > 0 && (
                            <span className="badge bg-primary bg-opacity-10 text-primary">
                                {
                                    categories.find(
                                        (c) => c.id == formData.category_id
                                    )?.name || "Category"
                                }
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {formData.description && (
                        <p className="text-muted small mb-3">
                            {formData.description.length > 100
                                ? formData.description.substring(0, 100) + "..."
                                : formData.description}
                        </p>
                    )}

                    {/* Pricing */}
                    <div className="pricing-preview mb-3">
                        <div className="fw-bold text-primary h6">
                            {getPricingPreview()}
                        </div>
                        {formData.duration_hours && (
                            <small className="text-muted">
                                Duration: {formData.duration_hours} hour
                                {formData.duration_hours != 1 ? "s" : ""}
                            </small>
                        )}
                    </div>

                    {/* Location */}
                    {formData.location_address && (
                        <div className="location-preview mb-3">
                            <small className="text-muted">
                                <i className="fas fa-map-marker-alt me-1"></i>
                                {formData.location_address}
                            </small>
                            <br />
                            <small className="text-muted">
                                <i className="fas fa-circle-notch me-1"></i>
                                Service radius: {formData.service_radius}km
                            </small>
                        </div>
                    )}

                    {/* Service Areas */}
                    {selectedAreas.length > 0 && (
                        <div className="areas-preview mb-3">
                            <small className="text-muted d-block mb-2">
                                Service Areas:
                            </small>
                            <div className="d-flex flex-wrap gap-1">
                                {selectedAreas
                                    .slice(0, 3)
                                    .map((area) => (
                                        <span
                                            key={area}
                                            className="badge bg-light text-dark"
                                        >
                                            {area}
                                        </span>
                                    ))}
                                {selectedAreas.length > 3 && (
                                    <span className="badge bg-light text-dark">
                                        +{selectedAreas.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Images Preview */}
                    {imagesPreviews.length > 0 && (
                        <div className="images-preview mb-3">
                            <small className="text-muted d-block mb-2">
                                Images:
                            </small>
                            <div className="row g-2">
                                {imagesPreviews.slice(0, 2).map((preview, index) => (
                                    <div key={index} className="col-6">
                                        <img
                                            src={preview}
                                            alt={`Preview ${index + 1}`}
                                            className="img-fluid rounded"
                                            style={{
                                                height: "60px",
                                                objectFit: "cover",
                                                width: "100%",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {imagesPreviews.length > 2 && (
                                <small className="text-muted">
                                    +{imagesPreviews.length - 2} more image
                                    {imagesPreviews.length - 2 > 1 ? "s" : ""}
                                </small>
                            )}
                        </div>
                    )}

                    {/* What's Included */}
                    {formData.includes && (
                        <div className="includes-preview mb-3">
                            <small className="text-muted d-block mb-2">
                                What's Included:
                            </small>
                            <div className="bg-light p-2 rounded">
                                <small>
                                    {formData.includes.length > 100
                                        ? formData.includes.substring(0, 100) + "..."
                                        : formData.includes}
                                </small>
                            </div>
                        </div>
                    )}

                    {/* Requirements */}
                    {formData.requirements && (
                        <div className="requirements-preview">
                            <small className="text-muted d-block mb-2">
                                Requirements:
                            </small>
                            <div className="bg-warning bg-opacity-10 p-2 rounded">
                                <small>
                                    {formData.requirements.length > 100
                                        ? formData.requirements.substring(0, 100) + "..."
                                        : formData.requirements}
                                </small>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicePreview;