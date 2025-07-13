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

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
                        address.address?.village,
                    neighborhood:
                        address.address?.suburb ||
                        address.address?.neighbourhood,
                });
            });
        },
    });

    return position ? (
        <>
            <Marker position={position}>
                <Popup>Selected Location</Popup>
            </Marker>
            <Circle
                center={position}
                radius={radius * 1000}
                fillColor="blue"
                fillOpacity={0.1}
                color="blue"
                weight={2}
            />
        </>
    ) : null;
};

// Reverse geocoding function using Nominatim
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
        return { display_name: "Unknown location", address: {} };
    }
};

// Geocoding function to search for places
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

const EnhancedLocationSelector = ({ value, onChange, error }) => {
    const [position, setPosition] = useState(null);
    const [radius, setRadius] = useState(15);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    // Initialize with existing value
    useEffect(() => {
        if (value && value.lat && value.lng) {
            setPosition([value.lat, value.lng]);
            setRadius(value.radius || 15);
        }
    }, [value]);

    // Load nearby places when position changes
    useEffect(() => {
        if (position) {
            loadNearbyPlaces(position[0], position[1], radius);
        }
    }, [position, radius]);

    const loadNearbyPlaces = async (lat, lng, radiusKm) => {
        setLoadingPlaces(true);
        try {
            const places = await getNearbyPlacesFromNominatim(
                lat,
                lng,
                radiusKm
            );
            setNearbyPlaces(places);
        } catch (error) {
            console.error("Error loading nearby places:", error);
        } finally {
            setLoadingPlaces(false);
        }
    };

    const handleLocationSelect = (locationData) => {
        onChange({
            ...locationData,
            radius: radius,
        });
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
                result.address?.village,
            neighborhood:
                result.address?.suburb || result.address?.neighbourhood,
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
                        placeholder="Search for a location..."
                    />
                    {isSearching && (
                        <div className="position-absolute end-0 top-50 translate-middle-y me-3">
                            <div className="spinner-border spinner-border-sm"></div>
                        </div>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="search-results mt-2 border rounded shadow-sm">
                        {searchResults.map((result, index) => (
                            <div
                                key={index}
                                className="search-result-item p-2 border-bottom cursor-pointer"
                                onClick={() => selectSearchResult(result)}
                                style={{ cursor: "pointer" }}
                            >
                                <div className="fw-semibold">
                                    {result.display_name}
                                </div>
                                <small className="text-muted">
                                    {result.type}
                                </small>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Radius Selector */}
            <div className="mb-3">
                <label className="form-label fw-semibold">Service Radius</label>
                <div className="d-flex gap-2">
                    {[10, 15, 25, 50].map((r) => (
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

            {/* Map */}
            <div style={{ height: "400px", marginBottom: "1rem" }}>
                <MapContainer
                    center={position || [7.2906, 80.6337]} // Default to Kandy
                    zoom={position ? 12 : 8}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <LocationPicker
                        position={position}
                        setPosition={setPosition}
                        radius={radius}
                        onLocationSelect={handleLocationSelect}
                    />
                </MapContainer>
            </div>

            {/* Nearby Places */}
            {position && (
                <div className="nearby-places">
                    <h6 className="fw-semibold mb-2">
                        Nearby Areas
                        {loadingPlaces && (
                            <span className="spinner-border spinner-border-sm ms-2"></span>
                        )}
                    </h6>

                    {nearbyPlaces.length > 0 ? (
                        <div className="row">
                            {nearbyPlaces.slice(0, 12).map((place, index) => (
                                <div
                                    key={index}
                                    className="col-md-6 col-lg-4 mb-2"
                                >
                                    <div className="nearby-place-item p-2 border rounded bg-light">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small fw-medium">
                                                {place.name}
                                            </span>
                                            <small className="text-muted">
                                                {place.distance}km
                                            </small>
                                        </div>
                                        <small className="text-muted">
                                            {place.type}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !loadingPlaces && (
                            <p className="text-muted small">
                                No nearby places found
                            </p>
                        )
                    )}
                </div>
            )}

            {error && <div className="text-danger mt-2">{error}</div>}
        </div>
    );
};

// Function to get nearby places from Nominatim
const getNearbyPlacesFromNominatim = async (lat, lng, radius) => {
    const places = [];
    const placeTypes = [
        "city",
        "town",
        "village",
        "suburb",
        "neighbourhood",
        "locality",
    ];

    for (const type of placeTypes) {
        try {
            // Add delay to respect rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=10&countrycodes=lk&class=place&type=${type}&lat=${lat}&lon=${lng}&bounded=1&viewbox=${getBoundingBox(
                    lat,
                    lng,
                    radius
                )}`,
                {
                    headers: {
                        "User-Agent": "HireMe-ServiceApp/1.0",
                    },
                }
            );

            const data = await response.json();

            data.forEach((place) => {
                const distance = calculateDistance(
                    lat,
                    lng,
                    parseFloat(place.lat),
                    parseFloat(place.lon)
                );

                if (distance <= radius) {
                    places.push({
                        name: extractPlaceName(place),
                        distance: Math.round(distance * 10) / 10,
                        type: place.type,
                        coordinates: {
                            lat: parseFloat(place.lat),
                            lng: parseFloat(place.lon),
                        },
                    });
                }
            });
        } catch (error) {
            console.error(`Error fetching ${type} places:`, error);
        }
    }

    // Remove duplicates and sort by distance
    const uniquePlaces = places.filter(
        (place, index, self) =>
            index === self.findIndex((p) => p.name === place.name)
    );

    return uniquePlaces.sort((a, b) => a.distance - b.distance).slice(0, 20);
};

// Helper functions
const extractPlaceName = (place) => {
    return place.display_name.split(",")[0].trim();
};

const getBoundingBox = (lat, lng, radiusKm) => {
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    return `${lng - lngDelta},${lat - latDelta},${lng + lngDelta},${
        lat + latDelta
    }`;
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

export default EnhancedLocationSelector;
