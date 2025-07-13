import React, { createContext, useContext, useState } from "react";

const DynamicAreasContext = createContext();

export const useDynamicAreas = () => {
    const context = useContext(DynamicAreasContext);
    if (!context) {
        throw new Error(
            "useDynamicAreas must be used within DynamicAreasProvider"
        );
    }
    return context;
};

export const DynamicAreasProvider = ({ children }) => {
    const [nearbyAreas, setNearbyAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadAreasFromMap = async (latitude, longitude, radius = 30) => {
        setLoading(true);
        setError(null);

        try {
            // This function will be called from the map component
            // when it finds nearby places
            const areas = await getNearbyPlacesFromNominatim(
                latitude,
                longitude,
                radius
            );
            setNearbyAreas(areas);
            return areas;
        } catch (err) {
            setError(err.message);
            console.error("Error loading dynamic areas:", err);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const value = {
        nearbyAreas,
        loading,
        error,
        loadAreasFromMap,
        setNearbyAreas,
    };

    return (
        <DynamicAreasContext.Provider value={value}>
            {children}
        </DynamicAreasContext.Provider>
    );
};
