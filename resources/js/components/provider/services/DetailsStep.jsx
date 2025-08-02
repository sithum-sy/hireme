import React from "react";

const DetailsStep = ({
    formData,
    categories,
    imagesPreviews,
    existingImagesPreviews,
    errors,
    onInputChange,
    onImageUpload,
    onRemoveImage,
    onRemoveExistingImage,
    getPricingPreview,
}) => {
    return (
        <div className="step-content">
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                    <i className="fas fa-images text-primary me-2"></i>
                    Additional Details & Images
                </h6>
                <p className="text-muted mb-3">
                    Add more details about your service and upload images to
                    showcase your work.
                </p>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    What's Included in This Service
                </label>
                <textarea
                    className={`form-control ${
                        errors.includes ? "is-invalid" : ""
                    }`}
                    name="includes"
                    value={formData.includes}
                    onChange={onInputChange}
                    placeholder="List what's included in your service (e.g., all cleaning supplies, equipment, etc.)"
                    rows="3"
                    maxLength="1000"
                />
                {errors.includes && (
                    <div className="invalid-feedback">{errors.includes}</div>
                )}
                <div className="form-text">
                    {formData.includes.length}/1000 characters
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label fw-semibold">
                    Requirements (Optional)
                </label>
                <textarea
                    className={`form-control ${
                        errors.requirements ? "is-invalid" : ""
                    }`}
                    name="requirements"
                    value={formData.requirements}
                    onChange={onInputChange}
                    placeholder="Any special requirements or conditions (e.g., access to water, power supply, etc.)"
                    rows="3"
                    maxLength="1000"
                />
                {errors.requirements && (
                    <div className="invalid-feedback">
                        {errors.requirements}
                    </div>
                )}
                <div className="form-text">
                    {formData.requirements.length}/1000 characters
                </div>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Service Images (Optional)
                </label>

                {/* Existing Images Section */}
                {existingImagesPreviews &&
                    existingImagesPreviews.length > 0 && (
                        <div className="existing-images mb-3">
                            <h6 className="fw-semibold mb-2 text-muted">
                                Current Images ({existingImagesPreviews.length}
                                ):
                            </h6>
                            <div className="row">
                                {existingImagesPreviews.map(
                                    (imageData, index) => {
                                        // Handle both string URLs and objects with image info
                                        const imageUrl =
                                            typeof imageData === "string"
                                                ? imageData
                                                : imageData.url ||
                                                  imageData.path ||
                                                  imageData;
                                        const fullImageUrl =
                                            imageUrl.startsWith("http")
                                                ? imageUrl
                                                : imageUrl.includes(
                                                      "/images/services/"
                                                  )
                                                ? imageUrl
                                                : `/images/services/${imageUrl}`;

                                        return (
                                            <div
                                                key={`existing-${index}`}
                                                className="col-md-3 col-6 mb-3"
                                            >
                                                <div className="image-preview position-relative">
                                                    <img
                                                        src={fullImageUrl}
                                                        alt={`Existing ${
                                                            index + 1
                                                        }`}
                                                        className="img-fluid rounded"
                                                        style={{
                                                            height: "120px",
                                                            objectFit: "cover",
                                                            width: "100%",
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                        onClick={() =>
                                                            onRemoveExistingImage(
                                                                index
                                                            )
                                                        }
                                                        style={{
                                                            fontSize: "0.7rem",
                                                        }}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                    <div className="position-absolute bottom-0 start-0 m-1">
                                                        <span className="badge bg-primary bg-opacity-75">
                                                            Current
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}

                <div className="image-upload-area">
                    <input
                        type="file"
                        className="d-none"
                        id="imageUpload"
                        multiple
                        accept="image/*"
                        onChange={onImageUpload}
                    />
                    <label
                        htmlFor="imageUpload"
                        className="image-upload-label border-2 border-dashed rounded p-4 text-center d-block"
                        style={{
                            cursor: "pointer",
                            borderColor: "#dee2e6",
                        }}
                    >
                        <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                        <div className="h6">Click to upload images</div>
                        <small className="text-muted">
                            Upload up to 5 images (Max 2MB each)
                            <br />
                            Supported formats: JPG, PNG, GIF
                        </small>
                    </label>

                    {errors.service_images && (
                        <div className="text-danger mt-2">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {errors.service_images}
                        </div>
                    )}

                    {imagesPreviews.length > 0 && (
                        <div className="uploaded-images mt-3">
                            <h6 className="fw-semibold mb-2">
                                {existingImagesPreviews &&
                                existingImagesPreviews.length > 0
                                    ? `New Images (${imagesPreviews.length}/5):`
                                    : `Uploaded Images (${imagesPreviews.length}/5):`}
                            </h6>
                            <div className="row">
                                {imagesPreviews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className="col-md-3 col-6 mb-3"
                                    >
                                        <div className="image-preview position-relative">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="img-fluid rounded"
                                                style={{
                                                    height: "120px",
                                                    objectFit: "cover",
                                                    width: "100%",
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                onClick={() =>
                                                    onRemoveImage(index)
                                                }
                                                style={{ fontSize: "0.7rem" }}
                                            >
                                                <i className="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Final Review Section */}
            <div className="final-review mt-4 p-3 bg-light rounded">
                <h6 className="fw-semibold mb-3">
                    <i className="fas fa-check-circle text-success me-2"></i>
                    Review Your Service
                </h6>
                <div className="row">
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Service Title:
                        </small>
                        <div className="fw-semibold">
                            {formData.title || "Not specified"}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Category:
                        </small>
                        <div className="fw-semibold">
                            {(Array.isArray(categories)
                                ? categories.find(
                                      (c) => c.id == formData.category_id
                                  )
                                : undefined
                            )?.name || "Not selected"}
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Pricing:
                        </small>
                        <div className="fw-semibold text-primary">
                            {getPricingPreview()}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Service Areas:
                        </small>
                        <div className="fw-semibold">
                            {formData.service_areas.length > 0
                                ? `${formData.service_areas.length} area${
                                      formData.service_areas.length > 1
                                          ? "s"
                                          : ""
                                  } selected`
                                : "None selected"}
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Location:
                        </small>
                        <div className="fw-semibold">
                            {formData.location_address || "Not set"}
                        </div>
                    </div>
                    <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                            Images:
                        </small>
                        <div className="fw-semibold">
                            {(() => {
                                const totalImages =
                                    imagesPreviews.length +
                                    (existingImagesPreviews?.length || 0);
                                const existingCount =
                                    existingImagesPreviews?.length || 0;
                                const newCount = imagesPreviews.length;

                                if (totalImages === 0) return "No images";
                                if (existingCount > 0 && newCount > 0) {
                                    return `${totalImages} total (${existingCount} current, ${newCount} new)`;
                                } else if (existingCount > 0) {
                                    return `${existingCount} current image${
                                        existingCount !== 1 ? "s" : ""
                                    }`;
                                } else {
                                    return `${newCount} new image${
                                        newCount !== 1 ? "s" : ""
                                    }`;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailsStep;
