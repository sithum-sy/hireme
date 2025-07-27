import React from "react";

const ServiceAreasStep = ({ 
    formData, 
    errors, 
    dynamicAreas, 
    showAllAreas,
    locationLoading,
    onServiceAreasChange,
    onShowAllAreas
}) => {
    return (
        <div className="step-content">
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                    <i className="fas fa-map text-primary me-2"></i>
                    Select service areas
                </h6>
                <p className="text-muted mb-3">
                    {formData.location_city ? (
                        <>
                            Based on your location in{" "}
                            <strong>{formData.location_city}</strong>, here are the
                            recommended service areas. You can also view all available
                            areas.
                        </>
                    ) : (
                        <>
                            Select all areas where you provide your services. This
                            helps clients know if you're available in their location.
                        </>
                    )}
                </p>
            </div>

            {/* Location-based areas header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h6 className="mb-1">
                        {showAllAreas
                            ? "All Available Areas"
                            : formData.location_city
                            ? `Areas near ${formData.location_city}`
                            : "Available Service Areas"}
                    </h6>
                    {!showAllAreas &&
                        dynamicAreas.length > 0 &&
                        formData.location_city && (
                            <small className="text-muted">
                                Showing {dynamicAreas.length} areas within{" "}
                                {formData.service_radius || 50}km
                            </small>
                        )}
                </div>
                {formData.location_city && (
                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm btn-responsive"
                        onClick={onShowAllAreas}
                        disabled={locationLoading}
                    >
                        {locationLoading ? (
                            <span className="spinner-border spinner-border-sm me-2"></span>
                        ) : (
                            <i
                                className={`fas fa-${
                                    showAllAreas ? "location-arrow" : "list"
                                } me-2`}
                            ></i>
                        )}
                        {showAllAreas ? "Show Nearby Areas" : "Show All Areas"}
                    </button>
                )}
            </div>

            {/* Service areas grid */}
            {locationLoading ? (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3"></div>
                    <p className="text-muted">Loading service areas...</p>
                </div>
            ) : (
                <div className="service-areas-grid">
                    <div className="row">
                        {dynamicAreas.map((area, index) => (
                            <div
                                key={`${area.name}-${index}`}
                                className="col-md-4 col-6 mb-2"
                            >
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`area-${area.name
                                            .replace(/\s+/g, "-")
                                            .toLowerCase()}`}
                                        checked={formData.service_areas.includes(
                                            area.name
                                        )}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onServiceAreasChange(area.name);
                                        }}
                                    />
                                    <label
                                        className="form-check-label d-flex justify-content-between align-items-center"
                                        htmlFor={`area-${area.name
                                            .replace(/\s+/g, "-")
                                            .toLowerCase()}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <span className="flex-grow-1">
                                            {area.name}
                                        </span>
                                        {area.distance && (
                                            <small className="text-muted ms-2 badge bg-light">
                                                {area.distance}km
                                            </small>
                                        )}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {dynamicAreas.length === 0 && !locationLoading && (
                        <div className="text-center py-4">
                            <i className="fas fa-map-marker-alt fa-2x text-muted mb-3"></i>
                            <p className="text-muted">
                                No service areas found for your location.
                                <br />
                                {formData.location_city && (
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 mt-2"
                                        onClick={onShowAllAreas}
                                    >
                                        View all available areas
                                    </button>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Selected areas display */}
            {formData.service_areas.length > 0 && (
                <div className="selected-areas mt-4">
                    <h6 className="fw-semibold mb-2">
                        Selected Areas ({formData.service_areas.length}):
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                        {formData.service_areas.map((area) => {
                            const areaData = dynamicAreas.find((a) => a.name === area);
                            return (
                                <span
                                    key={area}
                                    className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 d-flex align-items-center"
                                >
                                    <span>{area}</span>
                                    {areaData?.distance && (
                                        <small className="ms-1 opacity-75">
                                            ({areaData.distance}km)
                                        </small>
                                    )}
                                    <button
                                        type="button"
                                        className="btn-close btn-close-sm ms-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onServiceAreasChange(area);
                                        }}
                                        style={{ fontSize: "0.6rem" }}
                                    ></button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Location hint */}
            {!formData.location_city && (
                <div className="alert alert-info mt-3">
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Tip:</strong> Select your service location in Step 2 to 
                    see areas near you automatically.
                </div>
            )}

            {/* Error display */}
            {errors.service_areas && (
                <div className="alert alert-danger mt-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.service_areas}
                </div>
            )}
        </div>
    );
};

export default ServiceAreasStep;