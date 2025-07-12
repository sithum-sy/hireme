import React, { createContext, useContext, useReducer, useEffect } from "react";
import { useAuth } from "./AuthContext";
import clientService from "../services/clientService";

const ClientContext = createContext();

const initialState = {
    // Dashboard data
    stats: {
        totalAppointments: 0,
        completedAppointments: 0,
        pendingAppointments: 0,
        averageRating: 0,
        services_viewed: 0,
        searches_performed: 0,
        total_spent: 0,
    },
    recommendations: [],
    recentActivity: [],

    // Service data
    popularServices: [],
    recentServices: [],
    categories: [],

    // User preferences
    location: null,
    preferredRadius: 15,

    // Loading states
    loading: {
        dashboard: false,
        services: false,
        recommendations: false,
    },

    errors: {},
};

function clientReducer(state, action) {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                loading: { ...state.loading, [action.key]: action.value },
            };

        case "SET_STATS":
            return { ...state, stats: action.payload };

        case "SET_RECOMMENDATIONS":
            return { ...state, recommendations: action.payload };

        case "SET_RECENT_ACTIVITY":
            return { ...state, recentActivity: action.payload };

        case "SET_POPULAR_SERVICES":
            return { ...state, popularServices: action.payload };

        case "SET_RECENT_SERVICES":
            return { ...state, recentServices: action.payload };

        case "SET_CATEGORIES":
            return { ...state, categories: action.payload };

        case "SET_LOCATION":
            return {
                ...state,
                location: action.payload,
                preferredRadius:
                    action.payload?.radius || state.preferredRadius,
            };

        case "SET_ERROR":
            return {
                ...state,
                errors: { ...state.errors, [action.key]: action.error },
            };

        case "CLEAR_ERROR":
            const newErrors = { ...state.errors };
            delete newErrors[action.key];
            return { ...state, errors: newErrors };

        default:
            return state;
    }
}

export const ClientProvider = ({ children }) => {
    const [state, dispatch] = useReducer(clientReducer, initialState);
    const { user } = useAuth();

    // Load dashboard data
    const loadDashboardData = async () => {
        if (!user || user.role !== "client") return;

        dispatch({ type: "SET_LOADING", key: "dashboard", value: true });

        try {
            // Load stats
            const statsResponse = await clientService.getDashboardStats();
            if (statsResponse.success) {
                dispatch({ type: "SET_STATS", payload: statsResponse.data });
            }

            // Load recent activity
            const activityResponse = await clientService.getRecentActivity(10);
            if (activityResponse.success) {
                dispatch({
                    type: "SET_RECENT_ACTIVITY",
                    payload: activityResponse.data,
                });
            }
        } catch (error) {
            dispatch({
                type: "SET_ERROR",
                key: "dashboard",
                error: error.message,
            });
        } finally {
            dispatch({ type: "SET_LOADING", key: "dashboard", value: false });
        }
    };

    // Load service data
    const loadServiceData = async (location = null) => {
        dispatch({ type: "SET_LOADING", key: "services", value: true });

        try {
            // Load popular services
            const popularResponse = await clientService.getPopularServices(
                location,
                8
            );
            if (popularResponse.success) {
                dispatch({
                    type: "SET_POPULAR_SERVICES",
                    payload: popularResponse.data,
                });
            }

            // Load recent services
            const recentResponse = await clientService.getRecentServices(
                location,
                8
            );
            if (recentResponse.success) {
                dispatch({
                    type: "SET_RECENT_SERVICES",
                    payload: recentResponse.data,
                });
            }

            // Load categories
            const categoriesResponse = await clientService.getServiceCategories(
                location
            );
            if (categoriesResponse.success) {
                dispatch({
                    type: "SET_CATEGORIES",
                    payload: categoriesResponse.data,
                });
            }
        } catch (error) {
            dispatch({
                type: "SET_ERROR",
                key: "services",
                error: error.message,
            });
        } finally {
            dispatch({ type: "SET_LOADING", key: "services", value: false });
        }
    };

    // Load recommendations
    const loadRecommendations = async (location = null) => {
        dispatch({ type: "SET_LOADING", key: "recommendations", value: true });

        try {
            const response = await clientService.getRecommendations(
                location,
                6
            );
            if (response.success) {
                dispatch({
                    type: "SET_RECOMMENDATIONS",
                    payload: response.data.recommendations,
                });
            }
        } catch (error) {
            dispatch({
                type: "SET_ERROR",
                key: "recommendations",
                error: error.message,
            });
        } finally {
            dispatch({
                type: "SET_LOADING",
                key: "recommendations",
                value: false,
            });
        }
    };

    // Set user location
    const setLocation = (location) => {
        dispatch({ type: "SET_LOCATION", payload: location });

        // Reload location-dependent data
        loadServiceData(location);
        loadRecommendations(location);
    };

    // Initialize data on mount
    useEffect(() => {
        if (user && user.role === "client") {
            loadDashboardData();
            loadServiceData();
            loadRecommendations();
        }
    }, [user]);

    const value = {
        ...state,
        // Actions
        loadDashboardData,
        loadServiceData,
        loadRecommendations,
        setLocation,
        clearError: (key) => dispatch({ type: "CLEAR_ERROR", key }),
    };

    return (
        <ClientContext.Provider value={value}>
            {children}
        </ClientContext.Provider>
    );
};

export const useClient = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error("useClient must be used within a ClientProvider");
    }
    return context;
};
