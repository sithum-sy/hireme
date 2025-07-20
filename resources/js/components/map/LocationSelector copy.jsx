import React, { useState, useEffect, useCallback, useRef } from "react";
import EnhancedLocationSelector from "./EnhancedLocationSelector";
import LocationSearch from "./LocationSearch";

const LocationSelector = ({ value, onChange, error }) => {
    console.log("🗺️ LocationSelector: Component rendering", {
        hasValue: !!value,
        valueCity: value?.city || "none",
        hasOnChange: !!onChange,
        hasError: !!error,
        timestamp: new Date().toISOString(),
    });

    const [locationState, setLocationState] = useState("detecting");
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [useAdvancedMap, setUseAdvancedMap] = useState(false);

    // ✅ FIXED: Use useState instead of useRef for hasInitialized
    const [hasInitialized, setHasInitialized] = useState(false);
    const isUserInteraction = useRef(false);

    console.log("🎯 LocationSelector: Current state", {
        locationState,
        hasCurrentLocation: !!currentLocation,
        currentLocationCity: currentLocation?.city || "none",
        selectedCityName: selectedCity?.name || "none",
        useAdvancedMap,
        hasInitialized,
        timestamp: new Date().toISOString(),
    });

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

    // ✅ FIXED: Initialize only once using useState
    useEffect(() => {
        console.log("📍 LocationSelector: useEffect[init] - Initializing", {
            hasValue: !!value,
            valueDetails: value ? `${value.city}, ${value.province}` : "null",
            hasInitialized,
            timestamp: new Date().toISOString(),
        });

        if (!hasInitialized) {
            console.log("🔧 LocationSelector: First time initialization");
            setHasInitialized(true);

            if (value && value.lat && value.lng) {
                console.log(
                    "✅ LocationSelector: Setting current location from value (no onChange)"
                );
                setCurrentLocation(value);
                setLocationState("confirmed");
            } else {
                console.log(
                    "⚡ LocationSelector: No value provided, starting detection"
                );
                detectLocation();
            }
        } else {
            console.log("⏭️ LocationSelector: Already initialized, skipping");
        }
    }, [hasInitialized]); // ✅ Depend on hasInitialized instead of empty array

    // ✅ FIXED: Handle value changes from parent (but don't trigger onChange)
    useEffect(() => {
        console.log(
            "🔄 LocationSelector: useEffect[value] - Value changed from parent",
            {
                hasValue: !!value,
                valueDetails: value
                    ? `${value.city}, ${value.province}`
                    : "null",
                hasInitialized,
                isUserInteraction: isUserInteraction.current,
            }
        );

        // Only update from parent if not from user interaction and component is initialized
        if (
            hasInitialized &&
            !isUserInteraction.current &&
            value &&
            value.lat &&
            value.lng
        ) {
            console.log("🔄 LocationSelector: Updating from parent value");
            setCurrentLocation(value);
            setLocationState("confirmed");
        }
    }, [value, hasInitialized]);

    // ✅ FIXED: Only call onChange for user interactions
    useEffect(() => {
        console.log(
            "🔄 LocationSelector: useEffect[currentLocation] - Location changed",
            {
                hasCurrentLocation: !!currentLocation,
                currentLocationCity: currentLocation?.city || "none",
                isUserInteraction: isUserInteraction.current,
                hasOnChange: !!onChange,
                hasInitialized,
            }
        );

        // Only call onChange if this is from a user interaction AND component has initialized
        if (
            currentLocation &&
            onChange &&
            isUserInteraction.current &&
            hasInitialized
        ) {
            const locationData = {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.address,
                neighborhood: currentLocation.neighborhood || "",
                city: currentLocation.city,
                province: currentLocation.province || "",
                country: "Sri Lanka",
                radius: currentLocation.radius || 15,
            };

            console.log(
                "📤 LocationSelector: Calling onChange with location data (USER INTERACTION)",
                {
                    locationData: `${locationData.city}, ${locationData.province}`,
                }
            );

            // Reset the flag
            isUserInteraction.current = false;

            const timeoutId = setTimeout(() => {
                onChange(locationData);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [currentLocation, onChange, hasInitialized]);

    const detectLocation = () => {
        console.log("🔍 LocationSelector: Starting location detection");
        setLocationState("detecting");

        if ("geolocation" in navigator) {
            console.log(
                "📱 LocationSelector: Geolocation available, requesting position"
            );
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log("✅ LocationSelector: Geolocation success");
                    const { latitude, longitude } = position.coords;
                    const locationData = await reverseGeocodeOffline(
                        latitude,
                        longitude
                    );

                    console.log(
                        "📍 LocationSelector: Setting detected location"
                    );
                    isUserInteraction.current = true;
                    setCurrentLocation(locationData);
                    setLocationState("confirming");
                },
                (error) => {
                    console.log(
                        "❌ LocationSelector: Geolocation failed:",
                        error
                    );
                    setLocationState("manual");
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            console.log("❌ LocationSelector: Geolocation not available");
            setLocationState("manual");
        }
    };

    const reverseGeocodeOffline = async (lat, lng) => {
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
            radius: 15,
            accuracy: "gps_offline",
        };
    };

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
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
        console.log("🎯 LocationSelector: Location confirm called", {
            confirmed,
        });
        isUserInteraction.current = true;
        if (confirmed) {
            setLocationState("confirmed");
        } else {
            setLocationState("manual");
        }
    };

    const handleCitySelect = (city) => {
        console.log("🏙️ LocationSelector: City selected", {
            cityName: city.name,
        });
        isUserInteraction.current = true;
        setSelectedCity(city);
        setCurrentLocation({
            lat: city.lat,
            lng: city.lng,
            address: `${city.name}, ${city.province}, Sri Lanka`,
            neighborhood: `${city.name} Center`,
            city: city.name,
            province: city.province,
            radius: 15,
            accuracy: "city",
        });
        setLocationState("selecting");
    };

    const handleLocationSelect = (location) => {
        console.log("📍 LocationSelector: Location selected from map/search");
        isUserInteraction.current = true;
        setCurrentLocation(location);
        setLocationState("confirmed");
    };

    const handleAdvancedMapToggle = () => {
        console.log("🗺️ LocationSelector: Advanced map toggle", {
            currentState: useAdvancedMap,
            newState: !useAdvancedMap,
        });
        setUseAdvancedMap(!useAdvancedMap);
    };

    const handleResetLocation = () => {
        console.log("🔄 LocationSelector: Reset button clicked");
        setLocationState("manual");
        setCurrentLocation(null);
        setUseAdvancedMap(false);
        isUserInteraction.current = false;
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
                            onClick={() => handleLocationConfirm(true)}
                        >
                            ✅ Yes, this is correct
                        </button>
                        <button
                            type="button"
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
                                    type="button"
                                    className="btn btn-outline-primary w-100 h-100"
                                    onClick={() => handleCitySelect(city)}
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

            {/* Advanced Map Option */}
            {(locationState === "confirmed" ||
                locationState === "selecting") && (
                <div className="mb-3">
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        onClick={handleAdvancedMapToggle}
                    >
                        <i className="fas fa-map me-2"></i>
                        {useAdvancedMap
                            ? "Use Simple Location"
                            : "Use Advanced Map"}
                    </button>
                </div>
            )}

            {/* Advanced Map Selector */}
            {useAdvancedMap && (
                <div className="advanced-map-selector mb-3">
                    <h6 className="fw-bold mb-2">🗺️ Select location on map:</h6>
                    <EnhancedLocationSelector
                        value={currentLocation}
                        onChange={handleLocationSelect}
                        error={error}
                    />
                </div>
            )}

            {/* Current Location Display */}
            {currentLocation &&
                locationState === "confirmed" &&
                !useAdvancedMap && (
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
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <span className="badge bg-primary">
                                    Service Radius:{" "}
                                    {currentLocation.radius || 15}km
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

            {/* Reset Location Button */}
            {locationState === "confirmed" && (
                <div className="mb-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleResetLocation}
                    >
                        <i className="fas fa-redo me-2"></i>
                        Change Location
                    </button>
                </div>
            )}

            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default LocationSelector;
