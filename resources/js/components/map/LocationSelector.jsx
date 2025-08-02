import React, { useState, useEffect, useCallback, useRef } from "react";
import EnhancedLocationSelector from "./EnhancedLocationSelector";
import LocationSearch from "./LocationSearch";

const LocationSelector = ({ value, onChange, error, radius = 5 }) => {
    // console.log("LocationSelector props:", {
    //     radius: radius,
    //     hasValue: !!value,
    //     valueRadius: value?.radius,
    //     valueCity: value?.city || "none",
    // });
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
    const mountedRef = useRef(true);

    // Centralized reverse geocoding using Laravel backend
    const reverseGeocode = useCallback(
        async (lat, lng) => {
            // console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`);

            try {
                // Using Laravel backend proxy
                const response = await fetch(
                    `/api/geocoding/reverse?lat=${lat}&lon=${lng}`
                );

                if (response.ok) {
                    const data = await response.json();
                    // console.log("Geocoding response:", data);

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
                    const postcode = address.postcode || "";
                    const houseNumber = address.house_number || "";
                    const road = address.road || "";

                    // Create detailed readable address with accuracy levels
                    let readableAddress = "";
                    let accuracyLevel = "city";
                    let addressComponents = [];

                    // Build address from most specific to least specific
                    if (houseNumber && road) {
                        addressComponents.push(`${houseNumber} ${road}`);
                        accuracyLevel = "street_address";
                    } else if (road) {
                        addressComponents.push(road);
                        accuracyLevel = "street";
                    } else if (neighborhood) {
                        addressComponents.push(neighborhood);
                        accuracyLevel = "neighborhood";
                    }

                    // Add neighborhood if we have street but different neighborhood
                    if (
                        accuracyLevel === "street_address" ||
                        accuracyLevel === "street"
                    ) {
                        if (neighborhood && !road.includes(neighborhood)) {
                            addressComponents.push(neighborhood);
                        }
                    }

                    // Add city with postal code if available
                    if (postcode) {
                        addressComponents.push(`${city} ${postcode}`);
                    } else {
                        addressComponents.push(city);
                    }

                    // Add province if not Western Province (to reduce redundancy)
                    if (province && province !== "Western Province") {
                        addressComponents.push(province);
                    }

                    readableAddress = addressComponents.join(", ");

                    // Fallback if no good address found
                    if (!readableAddress || readableAddress === ", ") {
                        readableAddress = `${city}, ${province}`;
                        accuracyLevel = "city";
                    }

                    // Return detailed location object
                    return {
                        lat,
                        lng,
                        address: readableAddress,
                        neighborhood: neighborhood,
                        city: city,
                        province: province,
                        country: "Sri Lanka",
                        radius: radius,

                        // Detailed accuracy and address components
                        accuracy: `nominatim_${accuracyLevel}`,
                        accuracy_level: accuracyLevel,

                        // Detailed address components
                        address_components: {
                            house_number: houseNumber,
                            road: road,
                            neighborhood: neighborhood,
                            city: city,
                            postcode: postcode,
                            province: province,
                            country: "Sri Lanka",
                        },

                        // Display helpers
                        short_address:
                            houseNumber && road
                                ? `${houseNumber} ${road}`
                                : road || neighborhood || city,
                        postal_code: postcode,

                        raw_data: data, // Keep raw data for debugging
                    };
                }
            } catch (error) {
                console.warn(
                    "Backend geocoding failed, using offline fallback:",
                    error
                );
            }

            // Fallback to offline geocoding with Sri Lankan cities
            return reverseGeocodeOffline(lat, lng);
        },
        [radius]
    );

    //   ENHANCED: Offline geocoding for Sri Lankan locations
    const reverseGeocodeOffline = useCallback(
        (lat, lng) => {
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
                const distance = calculateDistance(
                    lat,
                    lng,
                    city.lat,
                    city.lng
                );
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
                radius: radius,
                accuracy: "gps_offline",
                distance_to_city: Math.round(minDistance),
            };
        },
        [radius]
    );

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

    // ENHANCED: GPS configuration options
    const gpsOptions = {
        enableHighAccuracy: true, // Use GPS for best accuracy
        timeout: 15000, // 15 second timeout
        maximumAge: 30000, // Use cached location if less than 30s old
    };

    // ENHANCED: Detailed GPS error handling
    const handleGpsError = (error) => {
        let errorMessage = "Unable to get location. ";

        switch (error.code) {
            case error.PERMISSION_DENIED:
                errorMessage += "Location access denied by user.";
                break;
            case error.POSITION_UNAVAILABLE:
                errorMessage += "Location information unavailable.";
                break;
            case error.TIMEOUT:
                errorMessage += "Location request timed out.";
                break;
            default:
                errorMessage += "Unknown location error.";
                break;
        }

        console.error("GPS Error:", errorMessage);
        // console.log(
        //     "LocationSelector: GPS failed, switching to manual selection"
        // );
        setLocationState("manual");
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
                    // console.log("  LocationSelector: Geolocation success");
                    const {
                        latitude,
                        longitude,
                        accuracy,
                        altitude,
                        altitudeAccuracy,
                        heading,
                        speed,
                    } = position.coords;

                    // ENHANCED: Log GPS accuracy information
                    // console.log("GPS Details:", {
                    //     coordinates: `${latitude}, ${longitude}`,
                    //     accuracy: `±${accuracy} meters`,
                    //     altitude: altitude ? `${altitude}m` : "unavailable",
                    //     heading: heading ? `${heading}°` : "unavailable",
                    //     speed: speed ? `${speed} m/s` : "unavailable",
                    // });

                    try {
                        // Use our unified reverse geocoding
                        const locationData = await reverseGeocode(
                            latitude,
                            longitude
                        );

                        // ENHANCED: Add GPS accuracy information to location data
                        locationData.gps_accuracy = accuracy;
                        locationData.gps_altitude = altitude;
                        locationData.gps_altitude_accuracy = altitudeAccuracy;
                        locationData.gps_heading = heading;
                        locationData.gps_speed = speed;
                        locationData.gps_timestamp = new Date().toISOString();

                        // console.log(
                        //     "LocationSelector: Reverse geocoded location:",
                        //     locationData
                        // );

                        isUserInteraction.current = true;
                        setCurrentLocation(locationData);
                        setLocationState("confirming");
                    } catch (error) {
                        console.error(
                            "LocationSelector: Reverse geocoding failed:",
                            error
                        );
                        // ENHANCED: Fallback location with GPS accuracy data
                        const fallbackLocation = {
                            lat: latitude,
                            lng: longitude,
                            city: "Current Location",
                            province: "Sri Lanka",
                            radius: radius,
                            address: "Your Current Location",
                            accuracy: "gps_fallback",

                            // ENHANCED: Include GPS accuracy in fallback
                            gps_accuracy: accuracy,
                            gps_altitude: altitude,
                            gps_altitude_accuracy: altitudeAccuracy,
                            gps_heading: heading,
                            gps_speed: speed,
                            gps_timestamp: new Date().toISOString(),
                        };

                        isUserInteraction.current = true;
                        setCurrentLocation(fallbackLocation);
                        setLocationState("confirming");
                    }
                },
                handleGpsError, // Use our enhanced error handler
                gpsOptions // Use our enhanced GPS options
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

        if (!hasInitialized && mountedRef.current) {
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

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
            hasInitialized &&
            mountedRef.current
        ) {
            const locationData = {
                lat: currentLocation.lat,
                lng: currentLocation.lng,
                address: currentLocation.address,
                neighborhood: currentLocation.neighborhood || "",
                city: currentLocation.city,
                province: currentLocation.province || "",
                country: "Sri Lanka",
                radius: currentLocation.radius || radius,
            };

            // console.log("LocationSelector sending to parent:", {
            //     radius: locationData.radius,
            //     propRadius: radius,
            //     currentLocationRadius: currentLocation.radius,
            //     finalRadius: locationData.radius,
            // });

            // console.log(
            //     "LocationSelector: Calling onChange with location data",
            //     {
            //         locationData: `${locationData.city}, ${locationData.province}`,
            //     }
            // );

            isUserInteraction.current = false;

            const timeoutId = setTimeout(() => {
                if (mountedRef.current) {
                    onChange(locationData);
                }
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
            radius: radius,
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
        //     currentLocation: currentLocation
        //         ? `${currentLocation.city}, ${currentLocation.province}`
        //         : "null",
        //     locationState,
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

    // ENHANCED: Accuracy helper functions
    const getAccuracyIcon = (level) => {
        const icons = {
            street_address: <i className="fas fa-crosshairs text-success" />,
            street: <i className="fas fa-road text-info" />,
            neighborhood: <i className="fas fa-map-marker-alt text-warning" />,
            city: <i className="fas fa-city text-secondary" />,
        };
        return (
            icons[level] || <i className="fas fa-question-circle text-muted" />
        );
    };

    const getAccuracyLabel = (level) => {
        const labels = {
            street_address: "Street Address",
            street: "Street Level",
            neighborhood: "Neighborhood",
            city: "City Level",
        };
        return labels[level] || "Standard";
    };

    const getAccuracyColor = (level) => {
        const colors = {
            street_address: "success",
            street: "info",
            neighborhood: "warning",
            city: "secondary",
        };
        return colors[level] || "secondary";
    };

    // ENHANCED: GPS accuracy helper functions
    const getAccuracyColorClass = (accuracyMeters) => {
        if (accuracyMeters <= 5) return "text-success"; // Excellent
        if (accuracyMeters <= 10) return "text-info"; // Very Good
        if (accuracyMeters <= 20) return "text-warning"; // Good
        return "text-danger"; // Poor
    };

    const getGpsAccuracyBadgeClass = (accuracyMeters) => {
        if (accuracyMeters <= 5) return "bg-success"; // Excellent
        if (accuracyMeters <= 10) return "bg-info"; // Very Good
        if (accuracyMeters <= 20) return "bg-warning"; // Good
        return "bg-danger"; // Poor
    };

    const getGpsAccuracyLabel = (accuracyMeters) => {
        if (accuracyMeters <= 5) return "Excellent";
        if (accuracyMeters <= 10) return "Very Good";
        if (accuracyMeters <= 20) return "Good";
        return "Poor";
    };

    return (
        <div className={`location-selector ${error ? "is-invalid" : ""}`}>
            {/* Mobile overlay for search results */}
            <style jsx>{`
                .location-selector {
                    position: relative;
                }

                @media (max-width: 767.98px) {
                    .location-selector {
                        overflow: visible;
                        padding: 0;
                    }

                    .city-selector .row {
                        margin: 0 -0.375rem;
                    }

                    .city-selector .col-6 {
                        padding: 0 0.375rem;
                        margin-bottom: 0.5rem;
                    }

                    .area-search {
                        position: relative;
                        z-index: 1040;
                        margin: 1rem 0;
                    }

                    .advanced-map-selector {
                        margin: 1rem 0;
                    }

                    .location-confirm,
                    .current-location-display {
                        margin: 1rem 0;
                        padding: 0.75rem;
                    }

                    .gps-accuracy-info,
                    .address-breakdown {
                        margin: 0.75rem 0;
                    }
                }

                @media (max-width: 575.98px) {
                    .city-selector .col-6 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }

                    .location-confirm,
                    .current-location-display {
                        margin: 0.75rem 0;
                    }

                    .d-flex.gap-2 {
                        flex-direction: column;
                        gap: 0.5rem !important;
                    }

                    .d-flex.gap-2 .btn {
                        width: 100%;
                    }
                }
            `}</style>
            {/* Location Detection */}
            {locationState === "detecting" && (
                <div className="text-center py-4">
                    <div className="spinner-border text-primary mb-3"></div>
                    <h6>Getting your location...</h6>
                    <p className="text-muted small">
                        Please allow location access for better service
                    </p>
                </div>
            )}

            {/* Location Confirmation -   ENHANCED: Better display */}
            {locationState === "confirming" && currentLocation && (
                <div className="location-confirm p-3 bg-light rounded mb-3">
                    <h6 className="fw-bold mb-2">Location Detected</h6>
                    {/* Better location display with accuracy indicators */}
                    <div className="detected-location-info">
                        <p className="mb-2">
                            <strong>{currentLocation.address}</strong>
                        </p>

                        {/* Show detailed address components */}
                        {currentLocation.address_components && (
                            <div className="address-details mb-2">
                                {currentLocation.address_components.road && (
                                    <p className="text-muted small mb-1">
                                        <i className="fas fa-road me-1" />
                                        Street:{" "}
                                        {
                                            currentLocation.address_components
                                                .road
                                        }
                                    </p>
                                )}
                                {currentLocation.address_components
                                    .postcode && (
                                    <p className="text-muted small mb-1">
                                        <i className="fas fa-mail-bulk me-1" />
                                        Postal Code:{" "}
                                        {
                                            currentLocation.address_components
                                                .postcode
                                        }
                                    </p>
                                )}
                                {currentLocation.neighborhood && (
                                    <p className="text-muted small mb-1">
                                        <i className="fas fa-location-arrow me-1" />
                                        Area: {currentLocation.neighborhood}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Visual accuracy indicator */}
                        {currentLocation.accuracy_level && (
                            <div className="accuracy-indicator mb-3">
                                <div className="d-flex align-items-center">
                                    <div
                                        className={`accuracy-badge ${currentLocation.accuracy_level}`}
                                    >
                                        {getAccuracyIcon(
                                            currentLocation.accuracy_level
                                        )}
                                        <span className="ms-2">
                                            {getAccuracyLabel(
                                                currentLocation.accuracy_level
                                            )}{" "}
                                            Accuracy
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* ENHANCED: GPS accuracy display */}
                        {currentLocation.gps_accuracy && (
                            <div className="gps-accuracy-info mb-3">
                                <div className="gps-details p-2 bg-info bg-opacity-10 rounded border-start border-info border-3">
                                    <h6 className="small fw-bold text-info mb-1">
                                        <i className="fas fa-satellite-dish me-1"></i>
                                        GPS Information
                                    </h6>
                                    <div className="row g-1">
                                        <div className="col-6">
                                            <small className="text-muted">
                                                Accuracy:
                                            </small>
                                            <br />
                                            <strong
                                                className={`small ${getAccuracyColorClass(
                                                    currentLocation.gps_accuracy
                                                )}`}
                                            >
                                                ±
                                                {Math.round(
                                                    currentLocation.gps_accuracy
                                                )}
                                                m
                                            </strong>
                                        </div>
                                        {currentLocation.gps_altitude && (
                                            <div className="col-6">
                                                <small className="text-muted">
                                                    Altitude:
                                                </small>
                                                <br />
                                                <strong className="small">
                                                    {Math.round(
                                                        currentLocation.gps_altitude
                                                    )}
                                                    m
                                                </strong>
                                            </div>
                                        )}
                                    </div>
                                    {currentLocation.gps_timestamp && (
                                        <div className="mt-1">
                                            <small className="text-muted">
                                                <i className="fas fa-clock me-1"></i>
                                                Captured:{" "}
                                                {new Date(
                                                    currentLocation.gps_timestamp
                                                ).toLocaleTimeString()}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            </div>
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
                        className="btn btn-info btn-lg w-100 justify-content-center "
                        onClick={handleAdvancedMapToggle}
                    >
                        <i className="fas fa-map me-2"></i>
                        {useAdvancedMap
                            ? "Select From Locations"
                            : "Select From Map"}
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

            {/* Current Location Display */}
            {currentLocation &&
                locationState === "confirmed" &&
                !useAdvancedMap && (
                    <div className="current-location-display p-3 bg-success bg-opacity-10 rounded mb-3 border-start border-success border-3">
                        <h6 className="fw-bold mb-2">
                            <i className="fas fa-check-circle me-2"></i>
                            Selected Location
                        </h6>
                        {/* Comprehensive location details */}
                        <div className="location-details">
                            <div className="mb-2">
                                <strong>{currentLocation.address}</strong>
                            </div>

                            {/* Detailed address breakdown */}
                            {currentLocation.address_components && (
                                <div className="address-breakdown mb-3">
                                    {currentLocation.address_components
                                        .house_number &&
                                        currentLocation.address_components
                                            .road && (
                                            <div className="text-muted small mb-1">
                                                <i className="fas fa-home me-1" />
                                                {
                                                    currentLocation
                                                        .address_components
                                                        .house_number
                                                }{" "}
                                                {
                                                    currentLocation
                                                        .address_components.road
                                                }
                                            </div>
                                        )}
                                    {currentLocation.address_components
                                        .neighborhood && (
                                        <div className="text-muted small mb-1">
                                            <i className="fas fa-map-marker-alt me-1" />
                                            {
                                                currentLocation
                                                    .address_components
                                                    .neighborhood
                                            }
                                        </div>
                                    )}
                                    {currentLocation.address_components
                                        .postcode && (
                                        <div className="text-muted small mb-1">
                                            <i className="fas fa-mail-bulk me-1" />
                                            Postal:{" "}
                                            {
                                                currentLocation
                                                    .address_components.postcode
                                            }
                                        </div>
                                    )}
                                    {currentLocation.distance_to_city && (
                                        <div className="text-muted small mb-1">
                                            <i className="fas fa-route me-1" />
                                            {currentLocation.distance_to_city}km
                                            from {currentLocation.city} center
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Improved badges and accuracy */}
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <span className="badge bg-primary">
                                    <i className="fas fa-circle-dot me-1"></i>
                                    Service Radius:{" "}
                                    {currentLocation.radius || radius}km
                                </span>

                                {/* Visual accuracy badge */}
                                {/* {currentLocation.accuracy_level && (
                                    <span
                                        className={`badge bg-${getAccuracyColor(
                                            currentLocation.accuracy_level
                                        )}`}
                                    >
                                        {getAccuracyIcon(
                                            currentLocation.accuracy_level
                                        )}
                                        <span className="ms-1">
                                            {getAccuracyLabel(
                                                currentLocation.accuracy_level
                                            )}
                                        </span>
                                    </span>
                                )} */}

                                {/* ENHANCED: GPS accuracy badge */}
                                {/* {currentLocation.gps_accuracy && (
                                    <span
                                        className={`badge ${getGpsAccuracyBadgeClass(
                                            currentLocation.gps_accuracy
                                        )}`}
                                    >
                                        <i className="fas fa-satellite-dish me-1"></i>
                                        GPS: ±
                                        {Math.round(
                                            currentLocation.gps_accuracy
                                        )}
                                        m
                                    </span>
                                )} */}

                                {/* Show coordinates only for low accuracy */}
                                {["gps_fallback", "city"].includes(
                                    currentLocation.accuracy_level
                                ) && (
                                    <small className="text-muted">
                                        <i className="fas fa-crosshairs me-1" />
                                        {Number(currentLocation.lat).toFixed(4)}
                                        ,{" "}
                                        {Number(currentLocation.lng).toFixed(4)}
                                    </small>
                                )}
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
                        Select From Locations
                    </button>
                </div>
            )}

            {error && <div className="invalid-feedback d-block">{error}</div>}
        </div>
    );
};

export default LocationSelector;
