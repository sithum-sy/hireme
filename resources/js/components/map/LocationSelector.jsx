import React, { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import LocationSearch from "./LocationSearch";

const LocationSelector = ({ value, onChange, error }) => {
    const [locationState, setLocationState] = useState("detecting");
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [radius, setRadius] = useState(15);

    const sriLankanCities = [
        {
            name: "Colombo",
            lat: 6.9271,
            lng: 79.8612,
            province: "Western Province",
        },
        {
            name: "Kandy",
            lat: 7.2906,
            lng: 80.6337,
            province: "Central Province",
        },
        {
            name: "Galle",
            lat: 6.0535,
            lng: 80.221,
            province: "Southern Province",
        },
        {
            name: "Jaffna",
            lat: 9.6615,
            lng: 80.0255,
            province: "Northern Province",
        },
        {
            name: "Negombo",
            lat: 7.2083,
            lng: 79.8358,
            province: "Western Province",
        },
        {
            name: "Anuradhapura",
            lat: 8.3114,
            lng: 80.4037,
            province: "North Central Province",
        },
        {
            name: "Trincomalee",
            lat: 8.5874,
            lng: 81.2152,
            province: "Eastern Province",
        },
        {
            name: "Matara",
            lat: 5.9485,
            lng: 80.5353,
            province: "Southern Province",
        },
    ];

    const radiusOptions = [
        { value: 5, label: "5 km", desc: "Local area" },
        { value: 10, label: "10 km", desc: "Nearby areas" },
        { value: 15, label: "15 km", desc: "Extended coverage" },
        { value: 25, label: "25 km", desc: "Wide coverage" },
    ];

    useEffect(() => {
        // Initialize with existing value if provided
        if (value && value.lat && value.lng) {
            setCurrentLocation({
                lat: value.lat,
                lng: value.lng,
                address: value.address,
                neighborhood: value.neighborhood || "",
                city: value.city,
                province: value.province || "",
                accuracy: "existing",
            });
            setRadius(value.radius || 15);
            setLocationState("confirmed");
        } else {
            detectLocation();
        }
    }, []);

    useEffect(() => {
        // Initialize with existing value if provided
        if (value && value.lat && value.lng && !currentLocation) {
            setCurrentLocation({
                lat: value.lat,
                lng: value.lng,
                address: value.address,
                neighborhood: value.neighborhood || "",
                city: value.city,
                province: value.province || "",
                accuracy: "existing",
            });
            setRadius(value.radius || 15);
            setLocationState("confirmed");
        } else if (!value && !currentLocation) {
            detectLocation();
        }
    }, [value]);

    // Separate useEffect for handling onChange calls
    useEffect(() => {
        if (currentLocation && radius && onChange) {
            // Create a stable reference to prevent loops
            const locationData = {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.address,
                neighborhood: currentLocation.neighborhood || "",
                city: currentLocation.city,
                province: currentLocation.province || "",
                country: "Sri Lanka",
                radius: radius,
            };

            // Use a timeout to debounce rapid changes
            const timeoutId = setTimeout(() => {
                onChange(locationData);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [
        currentLocation?.lat,
        currentLocation?.lng,
        currentLocation?.address,
        radius,
    ]); // Specific dependencies

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationData = await reverseGeocodeOffline(
                        latitude,
                        longitude
                    );
                    setCurrentLocation(locationData);
                    setLocationState("confirming");
                },
                (error) => {
                    console.log("Geolocation failed:", error);
                    setLocationState("manual");
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            setLocationState("manual");
        }
    };

    // Offline reverse geocoding using closest city
    const reverseGeocodeOffline = async (lat, lng) => {
        // Find closest Sri Lankan city
        let closestCity = sriLankanCities[0];
        let minDistance = calculateDistance(
            lat,
            lng,
            closestCity.lat,
            closestCity.lng
        );

        sriLankanCities.forEach((city) => {
            const distance = calculateDistance(lat, lng, city.lat, city.lng);
            if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
            }
        });

        return {
            lat,
            lng,
            address: `Near ${closestCity.name}, ${closestCity.province}, Sri Lanka`,
            neighborhood: minDistance < 5 ? `${closestCity.name} Area` : "",
            city: closestCity.name,
            province: closestCity.province,
            accuracy: "gps_offline",
        };
    };

    // Calculate distance between two coordinates (Haversine formula)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLng / 2) *
                Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleLocationConfirm = (confirmed) => {
        if (confirmed) {
            setLocationState("confirmed");
        } else {
            setLocationState("manual");
        }
    };

    const handleCitySelect = (city) => {
        setSelectedCity(city);
        setCurrentLocation({
            lat: city.lat,
            lng: city.lng,
            address: `${city.name}, ${city.province}, Sri Lanka`,
            neighborhood: `${city.name} Center`,
            city: city.name,
            province: city.province,
            accuracy: "city",
        });
        setLocationState("selecting");
    };

    const handleLocationSelect = (location) => {
        setCurrentLocation(location);
        setLocationState("confirmed");
    };

    const handleRadiusChange = (newRadius) => {
        setRadius(newRadius);
    };

    // Prevent any event bubbling that might trigger form submission
    const handleContainerClick = (e) => {
        e.stopPropagation();
    };

    const handleContainerSubmit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    return (
        <div
            className={`location-selector ${error ? "is-invalid" : ""}`}
            onClick={handleContainerClick}
            onSubmit={handleContainerSubmit}
        >
            {/* Location Detection */}
            {locationState === "detecting" && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3"></div>
                    <h6>📍 Getting your location...</h6>
                    <p className="text-muted small">
                        Please allow location access for better service
                    </p>
                </div>
            )}

            {/* Location Confirmation */}
            {locationState === "confirming" && currentLocation && (
                <div className="location-confirm p-3 bg-light rounded mb-3">
                    <h6 className="fw-bold mb-2">📍 Location Detected</h6>
                    <p className="mb-3">
                        You're near{" "}
                        <strong>
                            {currentLocation.city}, {currentLocation.province}
                        </strong>
                        <br />
                        <small className="text-muted">
                            {currentLocation.address}
                        </small>
                    </p>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLocationConfirm(true);
                            }}
                        >
                            ✅ Yes, this is correct
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleLocationConfirm(false);
                            }}
                        >
                            ❌ No, let me choose
                        </button>
                    </div>
                </div>
            )}

            {/* Manual City Selection */}
            {locationState === "manual" && (
                <div className="city-selector mb-3">
                    <h6 className="fw-bold mb-3">🏙️ Select your city:</h6>
                    <div className="row g-2">
                        {sriLankanCities.map((city) => (
                            <div key={city.name} className="col-6 col-md-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-primary w-100"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleCitySelect(city);
                                    }}
                                >
                                    <div className="fw-semibold">
                                        {city.name}
                                    </div>
                                    <small className="text-muted">
                                        {city.province}
                                    </small>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Area Search */}
            {locationState === "selecting" && selectedCity && (
                <div className="area-search mb-3">
                    <h6 className="fw-bold mb-2">
                        🔍 Search your area in {selectedCity.name}:
                    </h6>
                    <LocationSearch
                        city={selectedCity.name}
                        onLocationSelect={handleLocationSelect}
                    />
                </div>
            )}

            {/* Radius Selection */}
            {(locationState === "confirmed" ||
                locationState === "selecting") && (
                <div className="radius-selector mb-3">
                    <h6 className="fw-bold mb-2">
                        📏 How far will you travel?
                    </h6>
                    <div className="d-flex gap-2 flex-wrap">
                        {radiusOptions.map((option) => (
                            <button
                                type="button"
                                key={option.value}
                                className={`btn ${
                                    radius === option.value
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleRadiusChange(option.value);
                                }}
                            >
                                {option.label}
                                <br />
                                <small>{option.desc}</small>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reset Location Button */}
            {locationState === "confirmed" && (
                <div className="mb-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLocationState("manual");
                            setCurrentLocation(null);
                        }}
                    >
                        <i className="fas fa-redo me-2"></i>
                        Change Location
                    </button>
                </div>
            )}

            {/* Current Location Display */}
            {currentLocation && locationState === "confirmed" && (
                <div className="current-location-display p-3 bg-success bg-opacity-10 rounded mb-3 border-start border-success border-3">
                    <h6 className="fw-bold text-success mb-2">
                        <i className="fas fa-check-circle me-2"></i>
                        Selected Location
                    </h6>
                    <div className="location-details">
                        <div className="mb-2">
                            <strong>
                                {currentLocation.city},{" "}
                                {currentLocation.province}
                            </strong>
                        </div>
                        <div className="text-muted small mb-2">
                            {currentLocation.address}
                        </div>
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">
                                Service Radius: {radius}km
                            </span>
                            <small className="text-muted">
                                Coordinates:{" "}
                                {Number(currentLocation.lat).toFixed(4)},{" "}
                                {Number(currentLocation.lng).toFixed(4)}
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Map Display */}
            {currentLocation && (
                <div className="map-container">
                    <MapComponent
                        center={[currentLocation.lat, currentLocation.lng]}
                        radius={radius}
                        onLocationChange={handleLocationSelect}
                    />
                </div>
            )}

            {error && <div className="invalid-feedback d-block">{error}</div>}

            {/* Custom Styles */}
            <style>{`
                .location-selector {
                    position: relative;
                }

                .location-confirm,
                .current-location-display {
                    animation: slideIn 0.3s ease-out;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .city-selector .btn {
                    transition: all 0.2s ease;
                    height: auto;
                    padding: 0.75rem 0.5rem;
                }

                .city-selector .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .radius-selector .btn {
                    min-width: 80px;
                    text-align: center;
                    transition: all 0.2s ease;
                }

                .radius-selector .btn:hover {
                    transform: translateY(-1px);
                }

                .radius-selector .btn.btn-primary {
                    background-color: #0d6efd;
                    border-color: #0d6efd;
                }

                .map-container {
                    border-radius: 0.375rem;
                    overflow: hidden;
                    border: 1px solid #dee2e6;
                }

                .location-details {
                    font-size: 0.9rem;
                }

                .badge {
                    font-size: 0.75rem;
                }

                /* Prevent any form submission events */
                .location-selector * {
                    /* Ensure no elements accidentally trigger form submission */
                }

                .location-selector button {
                    /* All buttons are explicitly type="button" */
                }

                /* Loading spinner styling */
                .spinner-border {
                    width: 2rem;
                    height: 2rem;
                }

                /* Error state styling */
                .location-selector.is-invalid {
                    border: 1px solid #dc3545;
                    border-radius: 0.375rem;
                    padding: 1rem;
                }

                .invalid-feedback {
                    display: block;
                    width: 100%;
                    margin-top: 0.25rem;
                    font-size: 0.875rem;
                    color: #dc3545;
                }

                /* Responsive adjustments */
                @media (max-width: 576px) {
                    .city-selector .col-6 {
                        margin-bottom: 0.5rem;
                    }

                    .radius-selector .btn {
                        min-width: 70px;
                        font-size: 0.8rem;
                        padding: 0.5rem 0.25rem;
                    }

                    .d-flex.gap-2 {
                        gap: 0.5rem !important;
                    }
                }

                /* Focus states for accessibility */
                .location-selector button:focus {
                    outline: none;
                    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
                }

                /* Success state styling */
                .bg-success.bg-opacity-10 {
                    background-color: rgba(25, 135, 84, 0.1) !important;
                }

                .border-success {
                    border-color: #198754 !important;
                }

                .text-success {
                    color: #198754 !important;
                }
            `}</style>
        </div>
    );
};

export default LocationSelector;
