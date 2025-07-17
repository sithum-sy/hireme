import React, { useState, useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// CRITICAL FIX: Properly configure marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const LocationPicker = ({
    position,
    setPosition,
    radius,
    onLocationSelect,
}) => {
    useMapEvents({
        click(e) {
            const newPos = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);

            // Reverse geocode to get address
            reverseGeocode(e.latlng.lat, e.latlng.lng).then((address) => {
                onLocationSelect({
                    lat: e.latlng.lat,
                    lng: e.latlng.lng,
                    address: address.display_name,
                    city:
                        address.address?.city ||
                        address.address?.town ||
                        address.address?.village ||
                        "Unknown",
                    neighborhood:
                        address.address?.suburb ||
                        address.address?.neighbourhood ||
                        "",
                    province: getProvinceFromCoordinates(
                        e.latlng.lat,
                        e.latlng.lng
                    ),
                    country: "Sri Lanka",
                    radius: radius,
                });
            });
        },
    });

    return position ? (
        <>
            <Marker position={position}>
                <Popup>
                    <div>
                        <strong>Selected Location</strong>
                        <br />
                        Lat: {position[0].toFixed(4)}
                        <br />
                        Lng: {position[1].toFixed(4)}
                        <br />
                        Radius: {radius}km
                    </div>
                </Popup>
            </Marker>
            <Circle
                center={position}
                radius={radius * 1000} // Convert km to meters
                fillColor="blue"
                fillOpacity={0.1}
                color="blue"
                weight={2}
            />
        </>
    ) : null;
};

// Helper functions
const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "HireMe-ServiceApp/1.0",
                },
            }
        );
        return await response.json();
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return {
            display_name: "Unknown location",
            address: {
                city: "Unknown",
                town: "Unknown",
                village: "Unknown",
            },
        };
    }
};

const geocodeSearch = async (query) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
            )}&countrycodes=lk&limit=5&addressdetails=1`,
            {
                headers: {
                    "User-Agent": "HireMe-ServiceApp/1.0",
                },
            }
        );
        return await response.json();
    } catch (error) {
        console.error("Geocoding failed:", error);
        return [];
    }
};

const getProvinceFromCoordinates = (latitude, longitude) => {
    // Simple province detection based on coordinate ranges
    if (
        latitude >= 6.5 &&
        latitude <= 7.5 &&
        longitude >= 79.5 &&
        longitude <= 80.5
    ) {
        return "Western Province";
    } else if (
        latitude >= 6.5 &&
        latitude <= 8.0 &&
        longitude >= 80.0 &&
        longitude <= 81.5
    ) {
        return "Central Province";
    } else if (
        latitude >= 5.5 &&
        latitude <= 6.5 &&
        longitude >= 80.0 &&
        longitude <= 82.0
    ) {
        return "Southern Province";
    } else if (
        latitude >= 8.5 &&
        latitude <= 10.0 &&
        longitude >= 79.5 &&
        longitude <= 81.0
    ) {
        return "Northern Province";
    } else if (
        latitude >= 7.0 &&
        latitude <= 9.0 &&
        longitude >= 81.0 &&
        longitude <= 82.5
    ) {
        return "Eastern Province";
    } else if (
        latitude >= 7.0 &&
        latitude <= 8.5 &&
        longitude >= 79.5 &&
        longitude <= 80.5
    ) {
        return "North Western Province";
    } else if (
        latitude >= 7.5 &&
        latitude <= 9.0 &&
        longitude >= 80.0 &&
        longitude <= 81.5
    ) {
        return "North Central Province";
    } else if (
        latitude >= 6.0 &&
        latitude <= 7.5 &&
        longitude >= 80.5 &&
        longitude <= 82.0
    ) {
        return "Uva Province";
    } else if (
        latitude >= 6.0 &&
        latitude <= 7.5 &&
        longitude >= 80.0 &&
        longitude <= 81.0
    ) {
        return "Sabaragamuwa Province";
    }
    return "Western Province"; // Default fallback
};

const EnhancedLocationSelector = ({ value, onChange, error }) => {
    const [position, setPosition] = useState(null);
    const [radius, setRadius] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [mapKey, setMapKey] = useState(0);

    // Initialize with existing value
    useEffect(() => {
        if (value && value.lat && value.lng) {
            setPosition([value.lat, value.lng]);
            setRadius(value.radius || 15);
            setMapKey((prev) => prev + 1);
        }
    }, [value]);

    const handleLocationSelect = (locationData) => {
        if (onChange) {
            onChange(locationData);
        }
    };

    const handleSearch = async (query) => {
        if (query.length < 3) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await geocodeSearch(query);
            setSearchResults(results.slice(0, 5));
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectSearchResult = (result) => {
        const newPos = [parseFloat(result.lat), parseFloat(result.lon)];
        setPosition(newPos);
        setSearchQuery(result.display_name);
        setSearchResults([]);

        handleLocationSelect({
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name,
            city:
                result.address?.city ||
                result.address?.town ||
                result.address?.village ||
                "Unknown",
            neighborhood:
                result.address?.suburb || result.address?.neighbourhood || "",
            province: getProvinceFromCoordinates(
                parseFloat(result.lat),
                parseFloat(result.lon)
            ),
            country: "Sri Lanka",
            radius: radius,
        });
    };

    return (
        <div className="enhanced-location-selector">
            {/* Search Box */}
            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Search Location
                </label>
                <div className="position-relative">
                    <input
                        type="text"
                        className="form-control"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                        }}
                        placeholder="Search for a location in Sri Lanka..."
                    />
                    {isSearching && (
                        <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                            <div className="spinner-border spinner-border-sm"></div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div
                        className="search-results mt-2 border rounded shadow-sm bg-white"
                        style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1000,
                        }}
                    >
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="search-result-item p-2 border-bottom cursor-pointer hover-bg-light"
                                onClick={() => selectSearchResult(result)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="fw-semibold text-truncate">
                                    {result.display_name}
                                </div>
                                <small className="text-muted">
                                    {result.type} •{" "}
                                    {result.address?.city ||
                                        result.address?.town ||
                                        "Unknown"}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Radius Selector */}
            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Service Radius: {radius}km
                </label>
                <div className="d-flex gap-2 flex-wrap">
                    {[5, 10, 15, 25, 50].map((r) => (
                        <button
                            key={r}
                            type="button"
                            className={`btn btn-sm ${
                                radius === r
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                            }`}
                            onClick={() => setRadius(r)}
                        >
                            {r}km
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container - FIXED */}
            <div className="map-container mb-3">
                <div
                    className="map-wrapper"
                    style={{
                        height: "400px",
                        width: "100%",
                        position: "relative",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                    }}
                >
                    <MapContainer
                        key={mapKey}
                        center={position || [6.9271, 79.8612]} // Default to Colombo
                        zoom={position ? 13 : 8}
                        style={{
                            height: "100%",
                            width: "100%",
                            zIndex: 1,
                        }}
                        scrollWheelZoom={true}
                        attributionControl={true}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            maxZoom={19}
                        />
                        <LocationPicker
                            position={position}
                            setPosition={setPosition}
                            radius={radius}
                            onLocationSelect={handleLocationSelect}
                        />
                    </MapContainer>
                </div>
            </div>

            {/* Current Location Display */}
            {position && (
                <div className="current-location p-3 bg-light rounded border">
                    <h6 className="mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        Selected Location
                    </h6>
                    <div className="small text-muted">
                        <div>
                            Coordinates: {position[0].toFixed(4)},{" "}
                            {position[1].toFixed(4)}
                        </div>
                        <div>Service Radius: {radius}km</div>
                    </div>
                </div>
            )}

            {error && <div className="text-danger mt-2 small">{error}</div>}

            {/* Custom Styles */}
            <style>{`
                .enhanced-location-selector {
                    position: relative;
                }

                .search-result-item:hover {
                    background-color: #f8f9fa;
                }

                .hover-bg-light:hover {
                    background-color: #f8f9fa !important;
                }

                .map-container .leaflet-container {
                    height: 400px !important;
                    width: 100% !important;
                }

                .search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                }

                .leaflet-popup-content-wrapper {
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                }

                .leaflet-popup-content {
                    margin: 8px 12px;
                    line-height: 1.4;
                }

                .leaflet-control-zoom {
                    border: none;
                    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
                }

                .leaflet-control-zoom a {
                    background-color: white;
                    color: #333;
                    border: none;
                    box-shadow: none;
                }

                .leaflet-control-zoom a:hover {
                    background-color: #f4f4f4;
                }
            `}</style>
        </div>
    );
};

export default EnhancedLocationSelector;
