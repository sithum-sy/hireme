import React, { useState } from "react";

const MapComponent = ({ center, radius, onLocationChange }) => {
    const [selectedPoint, setSelectedPoint] = useState(center);

    const handleMapClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Convert click position to approximate coordinates
        const offsetLat = (y - rect.height / 2) * 0.002;
        const offsetLng = (x - rect.width / 2) * 0.002;

        const newLat = center[0] + offsetLat;
        const newLng = center[1] + offsetLng;

        setSelectedPoint([newLat, newLng]);

        const locationData = {
            lat: newLat,
            lng: newLng,
            address: `${newLat.toFixed(4)}, ${newLng.toFixed(4)}, Sri Lanka`,
            neighborhood: "",
            city: "Selected Location",
            province: "",
            accuracy: "manual",
        };

        onLocationChange(locationData);
    };

    // Calculate visual radius (max 120px for good UX)
    const visualRadius = Math.min(radius * 6, 120);

    return (
        <div className="map-component-wrapper">
            <div
                className="interactive-map"
                onClick={handleMapClick}
                style={{
                    height: "300px",
                    width: "100%",
                    borderRadius: "0.5rem",
                    background:
                        "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                    border: "2px solid #4caf50",
                    position: "relative",
                    cursor: "crosshair",
                    overflow: "hidden",
                }}
            >
                {/* Grid Background */}
                <div
                    className="map-grid"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `
                            linear-gradient(rgba(76, 175, 80, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(76, 175, 80, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Center Marker */}
                <div
                    className="center-marker"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 3,
                    }}
                >
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            backgroundColor: "#4caf50",
                            borderRadius: "50%",
                            border: "3px solid white",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                        }}
                    />
                </div>

                {/* Service Radius Circle */}
                <div
                    className="service-radius"
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: `${visualRadius * 2}px`,
                        height: `${visualRadius * 2}px`,
                        transform: "translate(-50%, -50%)",
                        border: "2px solid #4caf50",
                        borderRadius: "50%",
                        backgroundColor: "rgba(76, 175, 80, 0.1)",
                        zIndex: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "bold",
                            color: "#4caf50",
                        }}
                    >
                        {radius}km
                    </span>
                </div>

                {/* Location Info */}
                <div
                    className="location-info"
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        right: "10px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "13px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        zIndex: 4,
                    }}
                >
                    <div className="fw-bold text-success">
                        📍 Service Area Preview
                    </div>
                    <div className="text-muted small">
                        Coordinates: {selectedPoint[0].toFixed(4)},{" "}
                        {selectedPoint[1].toFixed(4)}
                    </div>
                </div>

                {/* Click Instructions */}
                <div
                    className="click-instructions"
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "10px",
                        right: "10px",
                        backgroundColor: "rgba(76, 175, 80, 0.9)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        textAlign: "center",
                        zIndex: 4,
                    }}
                >
                    <i className="fas fa-hand-pointer me-1"></i>
                    Click anywhere to adjust your service location
                </div>

                {/* Compass */}
                <div
                    className="compass"
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        width: "40px",
                        height: "40px",
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        zIndex: 4,
                    }}
                >
                    🧭
                </div>
            </div>

            {/* Map Legend */}
            <div className="map-legend mt-2 p-2 bg-light rounded">
                <div className="row text-center">
                    <div className="col-4">
                        <div className="d-flex align-items-center justify-content-center">
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    backgroundColor: "#4caf50",
                                    borderRadius: "50%",
                                    marginRight: "6px",
                                }}
                            ></div>
                            <small>Your Location</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <div className="d-flex align-items-center justify-content-center">
                            <div
                                style={{
                                    width: "12px",
                                    height: "12px",
                                    border: "2px solid #4caf50",
                                    borderRadius: "50%",
                                    marginRight: "6px",
                                }}
                            ></div>
                            <small>Service Area</small>
                        </div>
                    </div>
                    <div className="col-4">
                        <small className="text-success fw-bold">
                            {radius}km Radius
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapComponent;
