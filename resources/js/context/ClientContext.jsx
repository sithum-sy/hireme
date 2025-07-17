import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
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

    // ✅ FIXED: Use refs to avoid re-renders
    const lastRequestTimes = useRef({});
    const pendingRequests = useRef(new Set());
    const debounceTimers = useRef({});
    const isInitialized = useRef(false);

    // ✅ FIXED: Store functions in refs to avoid dependency issues
    const loadServiceDataInternalRef = useRef();
    const loadDashboardDataRef = useRef();

    const shouldThrottleRequest = (key, minInterval = 3000) => {
        const lastTime = lastRequestTimes.current[key];
        const now = Date.now();

        if (key.includes("services") || key.includes("categories")) {
            minInterval = 2000;
        }

        if (lastTime && now - lastTime < minInterval) {
            console.log(
                `Request ${key} throttled, last request was ${
                    now - lastTime
                }ms ago`
            );
            return true;
        }

        lastRequestTimes.current[key] = now;
        return false;
    };

    const handleApiCall = async (apiCall, errorKey, retryCount = 2) => {
        if (pendingRequests.current.has(errorKey)) {
            console.log(`Request ${errorKey} already pending, skipping`);
            return null;
        }

        pendingRequests.current.add(errorKey);

        try {
            for (let attempt = 1; attempt <= retryCount; attempt++) {
                try {
                    const result = await apiCall();
                    dispatch({ type: "CLEAR_ERROR", key: errorKey });
                    return result;
                } catch (error) {
                    console.error(
                        `API call ${errorKey} failed (attempt ${attempt}):`,
                        error
                    );

                    if (error.response?.status === 429) {
                        if (attempt < retryCount) {
                            const waitTime = Math.min(1000 * attempt, 3000);
                            console.log(
                                `Rate limited, waiting ${waitTime}ms before retry...`
                            );
                            await new Promise((resolve) =>
                                setTimeout(resolve, waitTime)
                            );
                            continue;
                        }
                    }

                    if (attempt === retryCount) {
                        const errorMessage =
                            error.response?.status === 429
                                ? "Loading data, please wait..."
                                : error.message;

                        dispatch({
                            type: "SET_ERROR",
                            key: errorKey,
                            error: errorMessage,
                        });

                        if (error.response?.status === 429) {
                            console.warn(`Rate limited for ${errorKey}`);
                            return null;
                        }
                        throw error;
                    }
                }
            }
        } finally {
            pendingRequests.current.delete(errorKey);
        }
    };

    // ✅ FIXED: Create stable functions with no dependencies
    const loadDashboardData = useCallback(async () => {
        if (!user || user.role !== "client") return;

        if (shouldThrottleRequest("dashboard", 10000)) {
            return;
        }

        dispatch({ type: "SET_LOADING", key: "dashboard", value: true });

        try {
            const statsResponse = await handleApiCall(
                () => clientService.getDashboardStats(),
                "dashboard"
            );

            if (statsResponse?.success) {
                dispatch({ type: "SET_STATS", payload: statsResponse.data });
            }

            const activityResponse = await handleApiCall(
                () => clientService.getRecentActivity(10),
                "dashboard_activity"
            );

            if (activityResponse?.success) {
                dispatch({
                    type: "SET_RECENT_ACTIVITY",
                    payload: activityResponse.data,
                });
            }
        } catch (error) {
            console.error("Dashboard data loading failed:", error);
        } finally {
            dispatch({ type: "SET_LOADING", key: "dashboard", value: false });
        }
    }, []); // ✅ No dependencies

    const loadServiceDataInternal = useCallback(async (location = null) => {
        const requestKey = location
            ? `services_${location.lat}_${location.lng}`
            : "services_no_location";

        if (shouldThrottleRequest(requestKey, 2000)) {
            return;
        }

        dispatch({ type: "SET_LOADING", key: "services", value: true });

        try {
            const locationParams = location
                ? {
                      latitude: location.lat,
                      longitude: location.lng,
                      radius: location.radius || 15,
                  }
                : {};

            const promises = [
                handleApiCall(
                    () =>
                        clientService.getPopularServices({
                            ...locationParams,
                            limit: 8,
                        }),
                    "popular_services"
                ),
                handleApiCall(
                    () =>
                        clientService.getRecentServices({
                            ...locationParams,
                            limit: 8,
                        }),
                    "recent_services"
                ),
                handleApiCall(
                    () => clientService.getServiceCategories(locationParams),
                    "categories"
                ),
            ];

            const results = await Promise.allSettled(promises);

            if (
                results[0].status === "fulfilled" &&
                results[0].value?.success
            ) {
                dispatch({
                    type: "SET_POPULAR_SERVICES",
                    payload: results[0].value.data,
                });
            }

            if (
                results[1].status === "fulfilled" &&
                results[1].value?.success
            ) {
                dispatch({
                    type: "SET_RECENT_SERVICES",
                    payload: results[1].value.data,
                });
            }

            if (
                results[2].status === "fulfilled" &&
                results[2].value?.success
            ) {
                dispatch({
                    type: "SET_CATEGORIES",
                    payload: results[2].value.data,
                });
            }
        } catch (error) {
            console.error("Service data loading failed:", error);
        } finally {
            dispatch({ type: "SET_LOADING", key: "services", value: false });
        }
    }, []); // ✅ No dependencies

    const loadServiceData = useCallback((location = null) => {
        const key = "serviceData";

        if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
        }

        debounceTimers.current[key] = setTimeout(() => {
            loadServiceDataInternalRef.current(location);
        }, 800);
    }, []); // ✅ No dependencies

    const loadRecommendations = useCallback(async (location = null) => {
        console.log("Recommendations loading disabled to reduce API calls");
        return;
    }, []);

    // ✅ FIXED: Create stable setLocation function
    const setLocation = useCallback((newLocation) => {
        console.log("🎯 ClientContext: setLocation called");

        // Get current location from state at call time
        const currentLocation = state.location;

        if (
            currentLocation &&
            newLocation &&
            currentLocation.lat === newLocation.lat &&
            currentLocation.lng === newLocation.lng
        ) {
            console.log(
                "⚠️ ClientContext: Location unchanged, skipping update"
            );
            return;
        }

        console.log("✅ ClientContext: Location changed, updating state");
        dispatch({ type: "SET_LOCATION", payload: newLocation });

        if (newLocation) {
            loadServiceData(newLocation);
        }
    }, []); // ✅ No dependencies - access state inside function

    const refreshAllData = useCallback(() => {
        // Get current location from state at call time
        const currentLocation = state.location;

        // Clear throttling for refresh
        lastRequestTimes.current = {};

        // Force refresh all data
        loadDashboardDataRef.current();
        loadServiceDataInternalRef.current(currentLocation);
    }, []); // ✅ No dependencies

    // ✅ Store functions in refs
    loadServiceDataInternalRef.current = loadServiceDataInternal;
    loadDashboardDataRef.current = loadDashboardData;

    // ✅ Initialize data on mount (only once)
    useEffect(() => {
        if (user && user.role === "client" && !isInitialized.current) {
            // console.log("Initializing client data...");
            isInitialized.current = true;

            loadDashboardData();
            loadServiceData();
        }
    }, [user]); // ✅ Only depend on user

    // ✅ Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
            debounceTimers.current = {};
            pendingRequests.current.clear();
        };
    }, []);

    const value = {
        ...state,
        // Actions
        loadDashboardData,
        loadServiceData,
        loadRecommendations,
        setLocation,
        clearError: (key) => dispatch({ type: "CLEAR_ERROR", key }),
        refreshAllData,

        // Helper functions
        isLoading: (key) => state.loading[key] || false,
        hasError: (key) => !!state.errors[key],
        getError: (key) => state.errors[key],
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
