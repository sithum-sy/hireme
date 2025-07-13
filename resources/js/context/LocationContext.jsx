import React, { createContext, useContext, useState } from "react";
import axios from "axios";

const LocationContext = createContext();

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
};

export const LocationProvider = ({ children }) => {
    const [nearbyAreas, setNearbyAreas] = useState([]);
    const [allAreas, setAllAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getNearbyServiceAreas = async (latitude, longitude, radius = 50) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post("/api/location/nearby-areas", {
                latitude,
                longitude,
                radius,
            });

            if (response.data.success) {
                setNearbyAreas(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to get nearby areas";
            setError(errorMessage);
            console.error("Error getting nearby areas:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getAllServiceAreas = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get("/api/location/service-areas");

            if (response.data.success) {
                setAllAreas(response.data.data);
                return response.data.data;
            } else {
                throw new Error(response.data.message);
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.message || "Failed to get service areas";
            setError(errorMessage);
            console.error("Error getting all areas:", err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        nearbyAreas,
        allAreas,
        loading,
        error,
        getNearbyServiceAreas,
        getAllServiceAreas,
        setNearbyAreas,
        setAllAreas,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};
