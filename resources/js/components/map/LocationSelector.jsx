import React, { useState, useEffect } from "react";
import MapComponent from "./MapComponent";
import LocationSearch from "./LocationSearch";

const LocationSelector = ({ value, onChange, error }) => {
    const [locationState, setLocationState] = useState("detecting"); // detecting, confirmed, selecting, manual
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [radius, setRadius] = useState(15);

    const sriLankanCities = [
        { name: "Colombo", lat: 6.9271, lng: 79.8612 },
        { name: "Kandy", lat: 7.2906, lng: 80.6337 },
        { name: "Galle", lat: 6.0535, lng: 80.221 },
        { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
        { name: "Negombo", lat: 7.2083, lng: 79.8358 },
        { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
        { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
        { name: "Matara", lat: 5.9485, lng: 80.5353 },
    ];

    const radiusOptions = [
        { value: 5, label: "5 km", desc: "Local area" },
        { value: 10, label: "10 km", desc: "Nearby areas" },
        { value: 15, label: "15 km", desc: "Extended coverage" },
        { value: 25, label: "25 km", desc: "Wide coverage" },
    ];

    useEffect(() => {
        detectLocation();
    }, []);

    useEffect(() => {
        if (currentLocation && radius) {
            onChange({
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.address,
                neighborhood: currentLocation.neighborhood,
                city: currentLocation.city,
                province: currentLocation.province,
                country: "Sri Lanka",
                radius: radius,
            });
        }
    }, [currentLocation, radius]);

    const detectLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationData = await reverseGeocode(
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

    const reverseGeocode = async (lat, lng) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=lk`
            );
            const data = await response.json();

            return {
                lat,
                lng,
                address: data.display_name,
                neighborhood:
                    data.address?.suburb || data.address?.neighbourhood || "",
                city:
                    data.address?.city ||
                    data.address?.town ||
                    data.address?.village ||
                    "",
                province: data.address?.state || "",
                accuracy: "gps",
            };
        } catch (error) {
            console.error("Reverse geocoding failed:", error);
            return {
                lat,
                lng,
                address: `${lat}, ${lng}`,
                accuracy: "coordinates",
            };
        }
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
            address: `${city.name}, Sri Lanka`,
            neighborhood: "",
            city: city.name,
            province: "",
            accuracy: "city",
        });
        setLocationState("selecting");
    };

    const handleLocationSelect = (location) => {
        setCurrentLocation(location);
        setLocationState("confirmed");
    };

    return (
        <div className={`location-selector ${error ? "is-invalid" : ""}`}>
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
                        You're in{" "}
                        <strong>
                            {currentLocation.neighborhood}{" "}
                            {currentLocation.city}
                        </strong>
                        <br />
                        <small className="text-muted">
                            {currentLocation.address}
                        </small>
                    </p>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleLocationConfirm(true)}
                        >
                            ✅ Yes, this is correct
                        </button>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleLocationConfirm(false)}
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
                                    className="btn btn-outline-primary w-100"
                                    onClick={() => handleCitySelect(city)}
                                >
                                    {city.name}
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
                                key={option.value}
                                className={`btn ${
                                    radius === option.value
                                        ? "btn-primary"
                                        : "btn-outline-primary"
                                }`}
                                onClick={() => setRadius(option.value)}
                            >
                                {option.label}
                                <br />
                                <small>{option.desc}</small>
                            </button>
                        ))}
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
        </div>
    );
};

export default LocationSelector;
