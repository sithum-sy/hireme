import React, { useState, useEffect, useCallback, useRef } from "react";
import EnhancedLocationSelector from "./EnhancedLocationSelector";
import LocationSearch from "./LocationSearch";

const LocationSelector = ({ value, onChange, error }) => {
    // console.log("LocationSelector: Component rendering", {
    //     hasValue: !!value,
    //     valueCity: value?.city || "none",
    //     hasOnChange: !!onChange,
    //     hasError: !!error,
    //     timestamp: new Date().toISOString(),
    // });

    const [locationState, setLocationState] = useState("detecting");
    const [currentLocation, setCurrentLocation] = useState(null);
    const [selectedCity, setSelectedCity] = useState(null);
    const [useAdvancedMap, setUseAdvancedMap] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const isUserInteraction = useRef(false);

    // Centralized reverse geocoding using Nominatim (same as Leaflet)
    const reverseGeocode = useCallback(async (lat, lng) => {
        // console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`);

        try {
            // Using Nominatim (OpenStreetMap) - same service that Leaflet uses
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1&accept-language=en`
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Nominatim response:", data);

                const address = data.address || {};
                const displayName = data.display_name || "";

                // Parse address components for Sri Lankan addresses
                const city =
                    address.city ||
                    address.town ||
                    address.village ||
                    address.municipality ||
                    address.county ||
                    "Unknown City";
                const province =
                    address.state ||
                    address.province ||
                    address.state_district ||
                    "Sri Lanka";
                const neighborhood =
                    address.suburb ||
                    address.neighbourhood ||
                    address.hamlet ||
                    address.residential ||
                    "";

                // Create a readable address
                let readableAddress = "";
                if (address.house_number && address.road) {
                    readableAddress = `${address.house_number} ${address.road}, ${city}`;
                } else if (address.road) {
                    readableAddress = `${address.road}, ${city}`;
                } else if (neighborhood) {
                    readableAddress = `${neighborhood}, ${city}`;
                } else {
                    readableAddress = `${city}, ${province}`;
                }

                return {
                    lat,
                    lng,
                    address: readableAddress,
                    neighborhood: neighborhood,
                    city: city,
                    province: province,
                    country: "Sri Lanka",
                    radius: 15,
                    accuracy: "nominatim_geocoded",
                    raw_data: data, // Keep raw data for debugging
                };
            }
        } catch (error) {
            console.warn(
                "Nominatim geocoding failed, using offline fallback:",
                error
            );
        }

        // Fallback to offline geocoding with Sri Lankan cities
        return reverseGeocodeOffline(lat, lng);
    }, []);

    //   ENHANCED: Offline geocoding for Sri Lankan locations
    const reverseGeocodeOffline = useCallback((lat, lng) => {
        // console.log(`Using offline geocoding for: ${lat}, ${lng}`);

        const sriLankanCities = [
            {
                name: "Colombo",
                lat: 6.9271,
                lng: 79.8612,
                province: "Western Province",
            },
            {
                name: "Negombo",
                lat: 7.2083,
                lng: 79.8358,
                province: "Western Province",
            },
            {
                name: "Kandy",
                lat: 7.2906,
                lng: 80.6337,
                province: "Central Province",
            },
            {
                name: "Gampaha",
                lat: 7.0873,
                lng: 79.999,
                province: "Western Province",
            },
            {
                name: "Kalutara",
                lat: 6.5854,
                lng: 79.9607,
                province: "Western Province",
            },
            {
                name: "Galle",
                lat: 6.0535,
                lng: 80.221,
                province: "Southern Province",
            },
            {
                name: "Matara",
                lat: 5.9485,
                lng: 80.5353,
                province: "Southern Province",
            },
            {
                name: "Jaffna",
                lat: 9.6615,
                lng: 80.0255,
                province: "Northern Province",
            },
            {
                name: "Batticaloa",
                lat: 7.7102,
                lng: 81.6924,
                province: "Eastern Province",
            },
            {
                name: "Trincomalee",
                lat: 8.5874,
                lng: 81.2152,
                province: "Eastern Province",
            },
            {
                name: "Anuradhapura",
                lat: 8.3114,
                lng: 80.4037,
                province: "North Central Province",
            },
            {
                name: "Polonnaruwa",
                lat: 7.9403,
                lng: 81.0188,
                province: "North Central Province",
            },
            {
                name: "Kurunegala",
                lat: 7.4818,
                lng: 80.3609,
                province: "North Western Province",
            },
            {
                name: "Puttalam",
                lat: 8.0362,
                lng: 79.8283,
                province: "North Western Province",
            },
            {
                name: "Ratnapura",
                lat: 6.6828,
                lng: 80.4036,
                province: "Sabaragamuwa Province",
            },
            {
                name: "Kegalle",
                lat: 7.2513,
                lng: 80.3464,
                province: "Sabaragamuwa Province",
            },
            {
                name: "Badulla",
                lat: 6.9934,
                lng: 81.055,
                province: "Uva Province",
            },
            {
                name: "Monaragala",
                lat: 6.8728,
                lng: 81.351,
                province: "Uva Province",
            },
        ];

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

        // Determine neighborhood based on distance
        let neighborhood = "";
        let address = "";

        if (minDistance < 2) {
            neighborhood = `${closestCity.name} Center`;
            address = `${closestCity.name}, ${closestCity.province}`;
        } else if (minDistance < 10) {
            neighborhood = `Near ${closestCity.name}`;
            address = `Near ${closestCity.name}, ${closestCity.province}`;
        } else {
            neighborhood = `${closestCity.province} Area`;
            address = `${closestCity.province}, Sri Lanka`;
        }

        return {
            lat,
            lng,
            address,
            neighborhood,
            city: closestCity.name,
            province: closestCity.province,
            country: "Sri Lanka",
            radius: 15,
            accuracy: "gps_offline",
            distance_to_city: Math.round(minDistance),
        };
    }, []);

    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth radius in kilometers
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

    //   ENHANCED: Location detection with reverse geocoding
    const detectLocation = useCallback(async () => {
        // console.log("LocationSelector: Starting location detection");
        setLocationState("detecting");

        if ("geolocation" in navigator) {
            // console.log(
            //     "LocationSelector: Geolocation available, requesting position"
            // );

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    console.log("  LocationSelector: Geolocation success");
                    const { latitude, longitude } = position.coords;

                    try {
                        // Use our unified reverse geocoding
                        const locationData = await reverseGeocode(
                            latitude,
                            longitude
                        );
                        console.log(
                            "LocationSelector: Reverse geocoded location:",
                            locationData
                        );

                        isUserInteraction.current = true;
                        setCurrentLocation(locationData);
                        setLocationState("confirming");
                    } catch (error) {
                        console.error(
                            "LocationSelector: Reverse geocoding failed:",
                            error
                        );
                        // Fallback to basic location
                        const fallbackLocation = {
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: 15,
                            address: "Your Current Location",
                            accuracy: "gps_fallback",
                        };

                        isUserInteraction.current = true;
                        setCurrentLocation(fallbackLocation);
                        setLocationState("confirming");
                    }
                },
                (error) => {
                    // console.log("LocationSelector: Geolocation failed:", error);
                    setLocationState("manual");
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } else {
            // console.log("LocationSelector: Geolocation not available");
            setLocationState("manual");
        }
    }, [reverseGeocode]);

    // Initialize component
    useEffect(() => {
        // console.log("LocationSelector: useEffect[init] - Initializing", {
        //     hasValue: !!value,
        //     valueDetails: value ? `${value.city}, ${value.province}` : "null",
        //     hasInitialized,
        //     timestamp: new Date().toISOString(),
        // });

        if (!hasInitialized) {
            // console.log("LocationSelector: First time initialization");
            setHasInitialized(true);

            if (value && value.lat && value.lng) {
                // console.log(
                //     "  LocationSelector: Setting current location from value"
                // );
                setCurrentLocation(value);
                setLocationState("confirmed");
            } else {
                // console.log(
                //     "LocationSelector: No value provided, starting detection"
                // );
                detectLocation();
            }
        }
    }, [hasInitialized, value, detectLocation]);

    // Handle value changes from parent
    useEffect(() => {
        if (
            hasInitialized &&
            !isUserInteraction.current &&
            value &&
            value.lat &&
            value.lng
        ) {
            // console.log("LocationSelector: Updating from parent value");
            setCurrentLocation(value);
            setLocationState("confirmed");
        }
    }, [value, hasInitialized]);

    // Call onChange for user interactions
    useEffect(() => {
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

            // console.log(
            //     "LocationSelector: Calling onChange with location data",
            //     {
            //         locationData: `${locationData.city}, ${locationData.province}`,
            //     }
            // );

            isUserInteraction.current = false;

            const timeoutId = setTimeout(() => {
                onChange(locationData);
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [currentLocation, onChange, hasInitialized]);

    const handleLocationConfirm = (confirmed) => {
        // console.log("LocationSelector: Location confirm called", {
        //     confirmed,
        // });
        isUserInteraction.current = true;
        if (confirmed) {
            setLocationState("confirmed");
        } else {
            setLocationState("manual");
        }
    };

    const handleCitySelect = (city) => {
        // console.log("LocationSelector: City selected", {
        //     cityName: city.name,
        // });
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

    //   ENHANCED: Handle location selection with reverse geocoding
    const handleLocationSelect = async (location) => {
        // console.log(
        //     "LocationSelector: Location selected from map/search",
        //     location
        // );
        isUserInteraction.current = true;

        // If location doesn't have proper address, reverse geocode it
        if (
            location.lat &&
            location.lng &&
            (!location.address || location.address.includes("coordinates"))
        ) {
            try {
                const geocodedLocation = await reverseGeocode(
                    location.lat,
                    location.lng
                );
                // console.log(
                //     "LocationSelector: Enhanced location with geocoding:",
                //     geocodedLocation
                // );
                setCurrentLocation(geocodedLocation);
            } catch (error) {
                console.warn(
                    "LocationSelector: Geocoding failed, using original location"
                );
                setCurrentLocation(location);
            }
        } else {
            setCurrentLocation(location);
        }

        setLocationState("confirmed");
    };

    const handleAdvancedMapToggle = () => {
        // console.log("LocationSelector: Advanced map toggle", {
        //     currentState: useAdvancedMap,
        //     newState: !useAdvancedMap,
        // });
        setUseAdvancedMap(!useAdvancedMap);
    };

    const handleResetLocation = () => {
        // console.log("LocationSelector: Reset button clicked");
        setLocationState("manual");
        setCurrentLocation(null);
        setUseAdvancedMap(false);
        isUserInteraction.current = false;
    };

    const sriLankanCities = [
        {
            name: "Colombo",
            lat: 6.9271,
            lng: 79.8612,
            province: "Western Province",
        },
        {
            name: "Negombo",
            lat: 7.2083,
            lng: 79.8358,
            province: "Western Province",
        },
        {
            name: "Kandy",
            lat: 7.2906,
            lng: 80.6337,
            province: "Central Province",
        },
        {
            name: "Gampaha",
            lat: 7.0873,
            lng: 79.999,
            province: "Western Province",
        },
        {
            name: "Kalutara",
            lat: 6.5854,
            lng: 79.9607,
            province: "Western Province",
        },
        {
            name: "Galle",
            lat: 6.0535,
            lng: 80.221,
            province: "Southern Province",
        },
        {
            name: "Matara",
            lat: 5.9485,
            lng: 80.5353,
            province: "Southern Province",
        },
        {
            name: "Jaffna",
            lat: 9.6615,
            lng: 80.0255,
            province: "Northern Province",
        },
    ];

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

            {/* Location Confirmation -   ENHANCED: Better display */}
            {locationState === "confirming" && currentLocation && (
                <div className="location-confirm p-3 bg-light rounded mb-3">
                    <h6 className="fw-bold mb-2">Location Detected</h6>
                    <div className="detected-location-info">
                        <p className="mb-2">
                            <strong>{currentLocation.address}</strong>
                        </p>
                        {currentLocation.neighborhood && (
                            <p className="text-muted small mb-2">
                                <i className="fas fa-location-arrow me-1" />
                                {currentLocation.neighborhood}
                            </p>
                        )}
                        {currentLocation.accuracy && (
                            <p className="text-muted small mb-3">
                                <i className="fas fa-crosshairs me-1" />
                                Accuracy:{" "}
                                {currentLocation.accuracy.replace("_", " ")}
                            </p>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-success btn-sm"
                            onClick={() => handleLocationConfirm(true)}
                        >
                            Yes, this is correct
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => handleLocationConfirm(false)}
                        >
                            No, let me choose
                        </button>
                    </div>
                </div>
            )}

            {/* Manual City Selection */}
            {locationState === "manual" && (
                <div className="city-selector mb-3">
                    <h6 className="fw-bold mb-3">Select your city:</h6>
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
                        Search your area in {selectedCity.name}:
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
                    <h6 className="fw-bold mb-2">Select location on map:</h6>
                    <EnhancedLocationSelector
                        value={currentLocation}
                        onChange={handleLocationSelect}
                        error={error}
                    />
                </div>
            )}

            {/* Current Location Display -   ENHANCED: Better formatting */}
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
                                <strong>{currentLocation.address}</strong>
                            </div>
                            {currentLocation.neighborhood && (
                                <div className="text-muted small mb-2">
                                    <i className="fas fa-location-arrow me-1" />
                                    {currentLocation.neighborhood}
                                    {currentLocation.distance_to_city && (
                                        <span>
                                            {" "}
                                            • {currentLocation.distance_to_city}
                                            km from {currentLocation.city}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <span className="badge bg-primary">
                                    Service Radius:{" "}
                                    {currentLocation.radius || 15}km
                                </span>
                                <small className="text-muted">
                                    Accuracy:{" "}
                                    {currentLocation.accuracy?.replace(
                                        "_",
                                        " "
                                    ) || "Standard"}
                                </small>
                            </div>
                            {/*   ADD: Only show coordinates if no proper address */}
                            {currentLocation.accuracy === "gps_fallback" && (
                                <div className="text-muted small mt-2">
                                    <i className="fas fa-crosshairs me-1" />
                                    Coordinates:{" "}
                                    {Number(currentLocation.lat).toFixed(
                                        4
                                    )}, {Number(currentLocation.lng).toFixed(4)}
                                </div>
                            )}
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
