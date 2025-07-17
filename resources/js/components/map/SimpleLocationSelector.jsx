import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const SimpleLocationSelector = ({ value, onChange, error }) => {
    console.log("🗺️ SimpleLocationSelector: Rendering", {
        hasValue: !!value,
        valueCity: value?.city || "none",
    });

    const [selectedLocation, setSelectedLocation] = useState(value);
    const [useMap, setUseMap] = useState(false);
    const [mapPosition, setMapPosition] = useState([6.9271, 79.8612]); // Default to Colombo
    const [mapZoom, setMapZoom] = useState(13);
    const mapRef = useRef(null);

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

    // Sync with prop changes
    useEffect(() => {
        if (value && value.lat && value.lng) {
            setSelectedLocation(value);
            setMapPosition([value.lat, value.lng]);
        }
    }, [value]);

    // Map click handler component
    const MapClickHandler = ({ onLocationSelect }) => {
        useMapEvents({
            click: (e) => {
                const { lat, lng } = e.latlng;
                console.log("🗺️ Map clicked at:", { lat, lng });

                // Find closest city for address
                const closestCity = findClosestCity(lat, lng);

                const locationData = {
                    lat,
                    lng,
                    address: `${closestCity.name}, ${closestCity.province}, Sri Lanka`,
                    neighborhood: `Near ${closestCity.name}`,
                    city: closestCity.name,
                    province: closestCity.province,
                    radius: 15,
                    country: "Sri Lanka",
                };

                onLocationSelect(locationData);
            },
        });
        return null;
    };

    const findClosestCity = (lat, lng) => {
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

        return closestCity;
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

    const handleCitySelect = (city) => {
        console.log("🏙️ SimpleLocationSelector: City selected", city.name);

        const locationData = {
            lat: city.lat,
            lng: city.lng,
            address: `${city.name}, ${city.province}, Sri Lanka`,
            neighborhood: `${city.name} Center`,
            city: city.name,
            province: city.province,
            radius: 15,
            country: "Sri Lanka",
        };

        setSelectedLocation(locationData);
        setMapPosition([city.lat, city.lng]);
        setMapZoom(14);

        // Only call onChange
        if (onChange) {
            onChange(locationData);
        }
    };

    const handleMapLocationSelect = useCallback(
        (locationData) => {
            console.log("🗺️ Map location selected:", locationData);

            setSelectedLocation(locationData);
            setMapPosition([locationData.lat, locationData.lng]);

            if (onChange) {
                onChange(locationData);
            }
        },
        [onChange]
    );

    const handleMapToggle = () => {
        console.log("🗺️ SimpleLocationSelector: Map toggle clicked");
        setUseMap(!useMap);

        // If opening map and we have a selected location, center on it
        if (!useMap && selectedLocation) {
            setMapPosition([selectedLocation.lat, selectedLocation.lng]);
            setMapZoom(14);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 Got current location:", {
                        latitude,
                        longitude,
                    });

                    const closestCity = findClosestCity(latitude, longitude);

                    const locationData = {
                        lat: latitude,
                        lng: longitude,
                        address: `Near ${closestCity.name}, ${closestCity.province}, Sri Lanka`,
                        neighborhood: `Near ${closestCity.name}`,
                        city: closestCity.name,
                        province: closestCity.province,
                        radius: 15,
                        country: "Sri Lanka",
                    };

                    setSelectedLocation(locationData);
                    setMapPosition([latitude, longitude]);
                    setMapZoom(15);

                    if (onChange) {
                        onChange(locationData);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    alert(
                        "Unable to get your location. Please select manually."
                    );
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    return (
        <>
            <div
                className={`simple-location-selector ${
                    error ? "is-invalid" : ""
                }`}
            >
                {/* Current Location Display */}
                {selectedLocation && (
                    <div className="current-location p-3 bg-success bg-opacity-10 rounded mb-3 border-start border-success border-3">
                        <h6 className="fw-bold text-success mb-2">
                            <i className="fas fa-check-circle me-2"></i>
                            Current Location
                        </h6>
                        <div>
                            <strong>
                                {selectedLocation.city},{" "}
                                {selectedLocation.province}
                            </strong>
                            <br />
                            <small className="text-muted">
                                {selectedLocation.address}
                            </small>
                            <br />
                            <span className="badge bg-primary">
                                Service Radius: {selectedLocation.radius || 15}
                                km
                            </span>
                        </div>
                    </div>
                )}

                {/* Map Toggle and Current Location Buttons */}
                <div className="mb-3 d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-info btn-sm"
                        onClick={handleMapToggle}
                    >
                        <i className="fas fa-map me-2"></i>
                        {useMap ? "Hide Map" : "Show Map"}
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        onClick={getCurrentLocation}
                    >
                        <i className="fas fa-location-arrow me-2"></i>
                        Use Current Location
                    </button>
                </div>

                {/* Interactive Map */}
                {useMap && (
                    <div className="map-container mb-3">
                        <h6 className="fw-bold mb-2">
                            🗺️ Click on the map to select location:
                        </h6>
                        <div
                            className="map-wrapper"
                            style={{
                                height: "400px",
                                borderRadius: "8px",
                                overflow: "hidden",
                            }}
                        >
                            <MapContainer
                                center={mapPosition}
                                zoom={mapZoom}
                                style={{ height: "100%", width: "100%" }}
                                ref={mapRef}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                {selectedLocation && (
                                    <Marker
                                        position={[
                                            selectedLocation.lat,
                                            selectedLocation.lng,
                                        ]}
                                    />
                                )}

                                <MapClickHandler
                                    onLocationSelect={handleMapLocationSelect}
                                />
                            </MapContainer>
                        </div>

                        <div className="mt-2">
                            <small className="text-muted">
                                <i className="fas fa-info-circle me-1"></i>
                                Click anywhere on the map to select that
                                location
                            </small>
                        </div>
                    </div>
                )}

                {/* City Selection */}
                <div className="city-selector mb-3">
                    <h6 className="fw-bold mb-3">🏙️ Or select your city:</h6>
                    <div className="row g-2">
                        {sriLankanCities.map((city) => (
                            <div key={city.name} className="col-6 col-md-4">
                                <button
                                    type="button"
                                    className={`btn w-100 h-100 ${
                                        selectedLocation?.city === city.name
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
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

                {error && (
                    <div className="invalid-feedback d-block">{error}</div>
                )}
            </div>

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    .simple-location-selector .btn {
                        transition: all 0.2s ease;
                        min-height: 60px;
                    }

                    .simple-location-selector .btn:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }

                    .map-container {
                        border: 2px solid #dee2e6;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .map-wrapper {
                        border: 1px solid #ddd;
                    }

                    .leaflet-container {
                        border-radius: 8px;
                    }

                    .leaflet-control-attribution {
                        font-size: 10px;
                    }
                `,
                }}
            />
        </>
    );
};

export default SimpleLocationSelector;
