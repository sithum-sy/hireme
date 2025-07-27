import React from "react";
import LocationSelector from "../../map/LocationSelector";

const LocationStep = ({ formData, errors, onLocationChange }) => {
    return (
        <div className="step-content">
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">
                    <i className="fas fa-map-marker-alt text-primary me-2"></i>
                    Where do you provide this service?
                </h6>
                <p className="text-muted mb-3">
                    Select your service location and coverage radius. This helps 
                    clients find you based on their location.
                </p>
            </div>

            <LocationSelector
                value={{
                    lat: formData.latitude,
                    lng: formData.longitude,
                    address: formData.location_address,
                    city: formData.location_city,
                    neighborhood: formData.location_neighborhood,
                    radius: formData.service_radius,
                }}
                onChange={onLocationChange}
                error={errors.location || errors.location_address}
            />

            {(errors.location || errors.location_address) && (
                <div className="alert alert-danger mt-3">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {errors.location || errors.location_address}
                </div>
            )}
        </div>
    );
};

export default LocationStep;