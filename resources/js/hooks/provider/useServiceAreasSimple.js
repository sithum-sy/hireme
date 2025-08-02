import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "../../context/LocationContext";

export const useServiceAreasSimple = (latitude, longitude, initialAreas = []) => {
    const [nearbyAreas, setNearbyAreas] = useState([]);
    const [showAllAreas, setShowAllAreas] = useState(false);
    const [selectedAreas, setSelectedAreas] = useState(initialAreas);
    const [isLoading, setIsLoading] = useState(false);
    const lastRequestRef = useRef(null);
    const debounceTimeoutRef = useRef(null);
    const { getNearbyServiceAreas, getAllServiceAreas } = useLocation();

    const sriLankanAreas = [
        "Colombo",
        "Kandy",
        "Galle",
        "Negombo",
        "Jaffna",
        "Anuradhapura",
        "Trincomalee",
        "Matara",
        "Kurunegala",
        "Ratnapura",
        "Batticaloa",
        "Badulla",
        "Puttalam",
        "Kalutara",
        "Vavuniya",
        "Hambantota",
        "Chilaw",
        "Panadura",
        "Avissawella",
        "Embilipitiya",
        "Monaragala",
        "Polonnaruwa",
        "Ampara",
        "Kegalle",
        "Nuwara Eliya",
        "Bandarawela",
    ];

    const loadNearbyAreas = useCallback(async () => {
        if (!latitude || !longitude) {
            // If no location, show all areas
            setNearbyAreas(sriLankanAreas.map(area => ({ name: area })));
            return;
        }

        // Prevent duplicate requests for the same coordinates
        const requestKey = `${latitude},${longitude}`;
        if (lastRequestRef.current === requestKey || isLoading) {
            return;
        }

        setIsLoading(true);
        lastRequestRef.current = requestKey;

        try {
            const result = await getNearbyServiceAreas(latitude, longitude, 50);

            if (
                result &&
                result.nearby_areas &&
                result.nearby_areas.length > 0
            ) {
                setNearbyAreas(result.nearby_areas);
            } else if (
                result &&
                result.all_province_areas &&
                result.all_province_areas.length > 0
            ) {
                setNearbyAreas(result.all_province_areas);
            } else {
                // Fallback to hardcoded areas
                setNearbyAreas(sriLankanAreas.map(area => ({ name: area })));
            }
        } catch (error) {
            console.error("Error loading nearby areas:", error);
            // Fallback to hardcoded areas on error
            setNearbyAreas(sriLankanAreas.map(area => ({ name: area })));
        } finally {
            setIsLoading(false);
        }
    }, [latitude, longitude, getNearbyServiceAreas, isLoading]);

    const handleAreaSelection = (area, isSelected) => {
        setSelectedAreas((prev) => {
            const prevArr = Array.isArray(prev) ? prev : [];
            return isSelected
                ? [...prevArr, area]
                : prevArr.filter((a) => a !== area);
        });
    };

    const toggleShowAllAreas = async () => {
        try {
            if (!showAllAreas) {
                // Show all areas
                const allAreas = await getAllServiceAreas();
                if (allAreas && allAreas.length > 0) {
                    setNearbyAreas(allAreas);
                } else {
                    setNearbyAreas(sriLankanAreas.map(area => ({ name: area })));
                }
            } else {
                // Show nearby areas
                await loadNearbyAreas();
            }
            setShowAllAreas(!showAllAreas);
        } catch (error) {
            console.error("Error toggling areas:", error);
            setNearbyAreas(sriLankanAreas.map(area => ({ name: area })));
        }
    };

    // Update selectedAreas when initialAreas changes
    useEffect(() => {
        if (initialAreas && Array.isArray(initialAreas) && initialAreas.length > 0) {
            setSelectedAreas(initialAreas);
        }
    }, [initialAreas]);

    // Initial load of areas
    useEffect(() => {
        if (nearbyAreas.length === 0) {
            loadNearbyAreas();
        }
    }, [loadNearbyAreas]);

    // Debounced effect to load nearby areas when coordinates change
    useEffect(() => {
        // Clear any existing timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        // Only proceed if we have coordinates
        if (latitude && longitude) {
            // Set a debounced timeout to load areas
            debounceTimeoutRef.current = setTimeout(() => {
                loadNearbyAreas();
            }, 300); // 300ms debounce
        }

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, [latitude, longitude, loadNearbyAreas]);

    return {
        nearbyAreas,
        showAllAreas,
        setShowAllAreas,
        loadNearbyAreas,
        selectedAreas,
        setSelectedAreas,
        handleAreaSelection,
        toggleShowAllAreas,
        isLoading,
    };
};
