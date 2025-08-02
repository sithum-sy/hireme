import React, { useState, useEffect, useRef } from "react";
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

    return position && Array.isArray(position) && position.length >= 2 ? (
        <>
            <Marker position={position}>
                <Popup>
                    <div>
                        <strong>Selected Location</strong>
                        <br />
                        Lat:{" "}
                        {typeof position[0] === "number"
                            ? position[0].toFixed(4)
                            : "N/A"}
                        <br />
                        Lng:{" "}
                        {typeof position[1] === "number"
                            ? position[1].toFixed(4)
                            : "N/A"}
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
        // Use Laravel backend proxy instead of direct API call
        const response = await fetch(
            `/api/geocoding/reverse?lat=${lat}&lon=${lng}`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        // Use Laravel backend proxy instead of direct API call
        const response = await fetch(
            `/api/geocoding/search?q=${encodeURIComponent(
                query
            )}&countrycodes=lk&limit=5`,
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
    const [mapLoading, setMapLoading] = useState(true);
    const [containerVisible, setContainerVisible] = useState(false);
    const mapContainerRef = useRef(null);

    // console.log("EnhancedLocationSelector render:", {
    //     hasValue: !!value,
    //     valueDetails: value ? `${value.city}, ${value.province}` : 'null',
    //     position: position ? `[${position[0]}, ${position[1]}]` : 'null',
    //     mapKey,
    //     mapLoading,
    //     containerVisible
    // });

    // Initialize with existing value
    useEffect(() => {
        // console.log("EnhancedLocationSelector useEffect[value]:", {
        //     value: value ? `${value.city} (${value.lat}, ${value.lng})` : 'null',
        //     hasValidCoords: value && value.lat && value.lng,
        //     position: position ? `[${position[0]}, ${position[1]}]` : 'null'
        // });

        if (value && value.lat && value.lng) {
            // Ensure lat and lng are valid numbers
            const lat = parseFloat(value.lat);
            const lng = parseFloat(value.lng);

            // console.log("EnhancedLocationSelector coordinates:", { lat, lng, isValidLat: !isNaN(lat), isValidLng: !isNaN(lng) });

            if (!isNaN(lat) && !isNaN(lng)) {
                // console.log("EnhancedLocationSelector setting position:", [lat, lng]);
                setPosition([lat, lng]);
                setRadius(value.radius || 15);
                setMapKey((prev) => prev + 1);
                setMapLoading(true); // Reset loading when coordinates change
            }
        } else if (!value) {
            // If no value is provided, reset to default state
            // console.log("EnhancedLocationSelector: No value provided, resetting to default");
            setPosition(null);
            setMapKey((prev) => prev + 1);
            setMapLoading(true);
        }
    }, [value]);

    // Force map invalidate size when component becomes visible
    useEffect(() => {
        // Check if we're in a modal context
        const isInModal = document.querySelector(".modal.show") !== null;
        const delay = isInModal ? 500 : 200; // Longer delay for modal context

        // console.log("EnhancedLocationSelector: Setting up resize timer", { isInModal, delay });

        const timer = setTimeout(() => {
            // Find any Leaflet map instance and force it to resize
            const leafletContainers =
                document.querySelectorAll(".leaflet-container");
            // console.log("EnhancedLocationSelector: Found", leafletContainers.length, "leaflet containers");

            leafletContainers.forEach((container, index) => {
                if (container._leaflet_map) {
                    // console.log(`EnhancedLocationSelector: Invalidating map size for container ${index}`);
                    container._leaflet_map.invalidateSize();

                    // Additional force refresh for modal context
                    if (isInModal) {
                        setTimeout(() => {
                            container._leaflet_map.invalidateSize();
                            // console.log(`EnhancedLocationSelector: Second invalidation for modal context ${index}`);
                        }, 200);
                    }
                }
            });
        }, delay);

        return () => clearTimeout(timer);
    }, []); // Run once on mount

    // Also invalidate size when mapKey changes
    useEffect(() => {
        if (mapKey > 0) {
            const timer = setTimeout(() => {
                const leafletContainers =
                    document.querySelectorAll(".leaflet-container");
                leafletContainers.forEach((container) => {
                    if (container._leaflet_map) {
                        // console.log("EnhancedLocationSelector: Invalidating map size after key change");
                        container._leaflet_map.invalidateSize();
                    }
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [mapKey]);

    // Watch for modal transitions and resize map accordingly
    useEffect(() => {
        const handleModalShown = () => {
            // console.log("EnhancedLocationSelector: Modal shown event detected");
            setTimeout(() => {
                const leafletContainers =
                    document.querySelectorAll(".leaflet-container");
                leafletContainers.forEach((container) => {
                    if (container._leaflet_map) {
                        // console.log("EnhancedLocationSelector: Invalidating on modal shown");
                        container._leaflet_map.invalidateSize();
                    }
                });
            }, 300);
        };

        // Listen for Bootstrap modal events
        document.addEventListener("shown.bs.modal", handleModalShown);

        return () => {
            document.removeEventListener("shown.bs.modal", handleModalShown);
        };
    }, []);

    // Use intersection observer to detect when map container is visible
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // console.log(
                    //     "EnhancedLocationSelector: Intersection observer",
                    //     {
                    //         isIntersecting: entry.isIntersecting,
                    //         intersectionRatio: entry.intersectionRatio,
                    //     }
                    // );

                    if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                        setContainerVisible(true);

                        // Force map resize when container becomes visible
                        setTimeout(() => {
                            const leafletContainers =
                                document.querySelectorAll(".leaflet-container");
                            leafletContainers.forEach((container) => {
                                if (container._leaflet_map) {
                                    // console.log(
                                    //     "EnhancedLocationSelector: Invalidating on intersection"
                                    // );
                                    container._leaflet_map.invalidateSize();
                                }
                            });
                        }, 100);
                    } else if (!entry.isIntersecting) {
                        setContainerVisible(false);
                    }
                });
            },
            {
                threshold: [0, 0.1, 0.5, 1],
                rootMargin: "50px",
            }
        );

        observer.observe(mapContainerRef.current);

        return () => {
            if (mapContainerRef.current) {
                observer.unobserve(mapContainerRef.current);
            }
        };
    }, []);

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
            // Handle both array response and error object response
            if (Array.isArray(results)) {
                setSearchResults(results.slice(0, 5));
            } else if (results.error) {
                console.warn("Geocoding API error:", results.error);
                setSearchResults([]);
                // You could add a toast notification here
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
            // You could add a toast notification here
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
                <div className="search-container position-relative">
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

                    {/* Search Results - Fixed positioning */}
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="search-result-item"
                                    onClick={() => selectSearchResult(result)}
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
            <div className="map-container mb-3" ref={mapContainerRef}>
                <div
                    className="map-wrapper"
                    style={{
                        height: "400px",
                        width: "100%",
                        position: "relative",
                        border: "2px solid #007bff",
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: "#f8f9fa",
                    }}
                >
                    {mapLoading && (
                        <div className="position-absolute top-50 start-50 translate-middle">
                            <div
                                className="spinner-border text-primary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading map...
                                </span>
                            </div>
                        </div>
                    )}
                    {containerVisible !== false && (
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
                            whenReady={() => {
                                // console.log(
                                //     "EnhancedLocationSelector: Map is ready"
                                // );
                                setMapLoading(false);
                            }}
                            whenCreated={(mapInstance) => {
                                // console.log(
                                //     "EnhancedLocationSelector: Map created",
                                //     mapInstance
                                // );
                                // console.log(
                                //     "Map container size:",
                                //     mapInstance
                                //         .getContainer()
                                //         .getBoundingClientRect()
                                // );
                                // console.log("Map size:", mapInstance.getSize());

                                // Force map to invalidate size after creation
                                setTimeout(() => {
                                    mapInstance.invalidateSize();
                                    // console.log(
                                    //     "Map size after invalidate:",
                                    //     mapInstance.getSize()
                                    // );
                                }, 100);
                            }}
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
                    )}
                </div>
            </div>

            {/* Current Location Display */}
            {position && Array.isArray(position) && position.length >= 2 && (
                <div className="current-location p-3 bg-light rounded border">
                    <h6 className="mb-2">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        Selected Location
                    </h6>
                    <div className="small text-muted">
                        <div>
                            Coordinates:{" "}
                            {typeof position[0] === "number"
                                ? position[0].toFixed(4)
                                : "N/A"}
                            ,{" "}
                            {typeof position[1] === "number"
                                ? position[1].toFixed(4)
                                : "N/A"}
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

                .search-container {
                    position: relative;
                    width: 100%;
                }

                .search-results {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    z-index: 1050;
                    background: white;
                    border: 1px solid #dee2e6;
                    border-radius: 0.375rem;
                    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
                    max-height: 300px;
                    overflow-y: auto;
                    margin-top: 2px;
                }

                .search-result-item {
                    padding: 0.75rem;
                    border-bottom: 1px solid var(--bg-light);
                    cursor: pointer;
                    transition: background-color 0.15s ease-in-out;
                }

                .search-result-item:hover {
                    background-color: var(--bg-light);
                }

                .search-result-item:last-child {
                    border-bottom: none;
                }

                .map-container .leaflet-container {
                    height: 400px !important;
                    width: 100% !important;
                    z-index: 1 !important;
                }
                
                /* Ensure map renders properly in modal context */
                .modal .enhanced-location-selector .leaflet-container {
                    height: 400px !important;
                    width: 100% !important;
                    position: relative !important;
                    z-index: 1 !important;
                }
                
                .modal .map-wrapper .leaflet-container {
                    height: 100% !important;
                    width: 100% !important;
                    border-radius: 6px;
                }
                
                /* Force proper rendering in bootstrap modal */
                .modal-body .leaflet-container {
                    height: 400px !important;
                    max-width: 100% !important;
                }
                
                /* Additional modal-specific fixes */
                .modal .enhanced-location-selector .map-container {
                    position: relative !important;
                    overflow: visible !important;
                }
                
                .modal .enhanced-location-selector .map-wrapper {
                    position: relative !important;
                    overflow: hidden !important;
                    display: block !important;
                }
                
                /* Ensure tiles load properly in modal */
                .modal .leaflet-tile-container {
                    transform: none !important;
                }
                
                /* Fix potential z-index issues */
                .modal .leaflet-map-pane {
                    z-index: auto !important;
                }
                
                .modal .leaflet-tile-pane {
                    z-index: auto !important;
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
                    color: var(--text-primary);
                    border: none;
                    box-shadow: none;
                }

                .leaflet-control-zoom a:hover {
                    background-color: var(--bg-light);
                }

                /* Mobile Responsiveness */
                @media (max-width: 767.98px) {
                    .search-container {
                        position: relative;
                        width: 100%;
                    }
                    
                    .search-results {
                        position: absolute;
                        top: 100%;
                        left: -0.75rem;
                        right: -0.75rem;
                        z-index: 1055;
                        background: white;
                        border: 1px solid #dee2e6;
                        border-radius: 0.5rem;
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                        max-height: 50vh;
                        overflow-y: auto;
                        margin-top: 0.25rem;
                    }

                    .search-result-item {
                        padding: 1rem 0.75rem;
                        border-bottom: 1px solid var(--bg-light);
                        cursor: pointer;
                        transition: background-color 0.15s ease-in-out;
                        font-size: 0.95rem;
                        line-height: 1.4;
                    }
                    
                    .search-result-item .fw-semibold {
                        font-size: 0.9rem;
                        margin-bottom: 0.25rem;
                    }
                    
                    .search-result-item small {
                        font-size: 0.8rem;
                        line-height: 1.3;
                    }

                    .enhanced-location-selector {
                        overflow: visible;
                        padding: 0 0.75rem;
                    }

                    .map-container {
                        margin-bottom: 1rem;
                    }

                    .map-wrapper {
                        height: 300px !important;
                    }
                }

                @media (max-width: 575.98px) {
                    .search-container {
                        margin: 0 -0.5rem;
                        width: calc(100% + 1rem);
                    }
                    
                    .search-results {
                        left: 0;
                        right: 0;
                        max-height: 40vh;
                        border-radius: 0.375rem;
                        margin-top: 0.5rem;
                    }

                    .search-result-item {
                        padding: 0.875rem 0.75rem;
                        font-size: 0.9rem;
                    }
                    
                    .search-result-item .fw-semibold {
                        font-size: 0.85rem;
                    }
                    
                    .search-result-item small {
                        font-size: 0.75rem;
                    }
                    
                    .enhanced-location-selector {
                        padding: 0 0.5rem;
                    }

                    .map-wrapper {
                        height: 250px !important;
                    }
                    
                    .form-control {
                        font-size: 1rem; /* Prevent zoom on iOS */
                    }
                }
            `}</style>
        </div>
    );
};

export default EnhancedLocationSelector;
