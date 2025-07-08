import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "/images/marker-icon-2x.png",
    iconUrl: "/images/marker-icon.png",
    shadowUrl: "/images/marker-shadow.png",
});

const MapComponent = ({ center, radius, onLocationChange }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);

    useEffect(() => {
        if (!mapInstanceRef.current && mapRef.current) {
            // Initialize map
            mapInstanceRef.current = L.map(mapRef.current, {
                center: center,
                zoom: 12,
                minZoom: 8,
                maxZoom: 18,
            });

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
            }).addTo(mapInstanceRef.current);

            // Add click handler
            mapInstanceRef.current.on("click", handleMapClick);
        }

        // Update marker and circle
        updateMapElements();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [center, radius]);

    const handleMapClick = async (e) => {
        const { lat, lng } = e.latlng;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&countrycodes=lk`
            );
            const data = await response.json();

            const locationData = {
                lat,
                lng,
                address: data.display_name,
                neighborhood:
                    data.address?.suburb || data.address?.neighbourhood || "",
                city: data.address?.city || data.address?.town || "",
                province: data.address?.state || "",
                accuracy: "manual",
            };

            onLocationChange(locationData);
        } catch (error) {
            console.error("Geocoding failed:", error);
        }
    };

    const updateMapElements = () => {
        if (!mapInstanceRef.current) return;

        // Remove existing marker and circle
        if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
        }
        if (circleRef.current) {
            mapInstanceRef.current.removeLayer(circleRef.current);
        }

        // Add new marker
        markerRef.current = L.marker(center).addTo(mapInstanceRef.current);

        // Add radius circle
        circleRef.current = L.circle(center, {
            radius: radius * 1000, // Convert km to meters
            fillColor: "#007bff",
            fillOpacity: 0.2,
            color: "#007bff",
            weight: 2,
        }).addTo(mapInstanceRef.current);

        // Fit map to circle bounds
        mapInstanceRef.current.fitBounds(circleRef.current.getBounds(), {
            padding: [20, 20],
        });
    };

    return (
        <div
            ref={mapRef}
            className="map-component"
            style={{ height: "300px", width: "100%", borderRadius: "0.375rem" }}
        />
    );
};

export default MapComponent;
