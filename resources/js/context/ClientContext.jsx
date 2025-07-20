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
    location: (() => {
        try {
            const savedLocation = localStorage.getItem("client_location");
            return savedLocation ? JSON.parse(savedLocation) : null;
        } catch (error) {
            console.warn("Failed to load saved location:", error);
            return null;
        }
    })(),
    preferredRadius: (() => {
        try {
            const savedRadius = localStorage.getItem("client_preferred_radius");
            return savedRadius ? parseInt(savedRadius, 10) : 15;
        } catch (error) {
            return 15;
        }
    })(),

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

        case "SET_PREFERRED_RADIUS":
            return {
                ...state,
                preferredRadius: action.payload,
                location: state.location
                    ? {
                          ...state.location,
                          radius: action.payload,
                      }
                    : null,
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

    // Use refs to avoid re-renders
    const lastRequestTimes = useRef({});
    const pendingRequests = useRef(new Set());
    const debounceTimers = useRef({});
    const isInitialized = useRef(false);

    // Store functions in refs to avoid dependency issues
    const loadServiceDataInternalRef = useRef();
    const loadDashboardDataRef = useRef();

    // Effect to persist location to localStorage
    useEffect(() => {
        if (state.location) {
            try {
                localStorage.setItem(
                    "client_location",
                    JSON.stringify(state.location)
                );
                console.log(
                    "🗺️ Client location saved to localStorage:",
                    state.location.city
                );
            } catch (error) {
                console.warn("Failed to save location to localStorage:", error);
            }
        } else {
            localStorage.removeItem("client_location");
        }
    }, [state.location]);

    // Effect to persist preferred radius to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(
                "client_preferred_radius",
                state.preferredRadius.toString()
            );
        } catch (error) {
            console.warn("Failed to save preferred radius:", error);
        }
    }, [state.preferredRadius]);

    // Helper function to get saved location
    const getSavedLocation = useCallback(() => {
        try {
            const savedLocation = localStorage.getItem("client_location");
            return savedLocation ? JSON.parse(savedLocation) : null;
        } catch (error) {
            console.warn("Failed to retrieve saved location:", error);
            return null;
        }
    }, []);

    // Helper function to clear saved location
    const clearSavedLocation = useCallback(() => {
        try {
            localStorage.removeItem("client_location");
            localStorage.removeItem("client_preferred_radius");
            console.log("🗺️ Saved location data cleared");
        } catch (error) {
            console.warn("Failed to clear saved location:", error);
        }
    }, []);

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

    // Create stable functions with no dependencies
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
    }, []);

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
    }, []); // No dependencies

    const loadServiceData = useCallback((location = null) => {
        const key = "serviceData";

        if (debounceTimers.current[key]) {
            clearTimeout(debounceTimers.current[key]);
        }

        debounceTimers.current[key] = setTimeout(() => {
            loadServiceDataInternalRef.current(location);
        }, 800);
    }, []); // No dependencies

    const loadRecommendations = useCallback(async (location = null) => {
        console.log("Recommendations loading disabled to reduce API calls");
        return;
    }, []);

    // Create stable setLocation function
    const setLocation = useCallback((newLocation) => {
        console.log("ClientContext: setLocation called", {
            newLocation: newLocation
                ? `${newLocation.city}, ${newLocation.province}`
                : null,
        });

        // Get current location from state at call time
        const currentLocation = state.location;

        // Enhanced comparison including city and province
        if (
            currentLocation &&
            newLocation &&
            currentLocation.lat === newLocation.lat &&
            currentLocation.lng === newLocation.lng &&
            currentLocation.city === newLocation.city &&
            currentLocation.radius === newLocation.radius
        ) {
            console.log("ClientContext: Location unchanged, skipping update");
            return;
        }

        console.log(
            "ClientContext: Location changed, updating state and localStorage"
        );

        // Validate location data before setting
        if (newLocation && (!newLocation.lat || !newLocation.lng)) {
            console.warn(
                "ClientContext: Invalid location data, missing coordinates"
            );
            return;
        }

        dispatch({ type: "SET_LOCATION", payload: newLocation });

        if (newLocation) {
            loadServiceData(newLocation);
        }
    }, []);

    // Function to set preferred radius
    const setPreferredRadius = useCallback((radius) => {
        console.log("ClientContext: setPreferredRadius called", { radius });

        if (radius < 1 || radius > 100) {
            console.warn("ClientContext: Invalid radius value", { radius });
            return;
        }

        dispatch({ type: "SET_PREFERRED_RADIUS", payload: radius });

        // If we have a current location, reload services with new radius
        const currentLocation = state.location;
        if (currentLocation) {
            const updatedLocation = { ...currentLocation, radius };
            loadServiceData(updatedLocation);
        }
    }, []); // No dependencies

    // Function to update location with new radius
    const updateLocationRadius = useCallback((radius) => {
        const currentLocation = state.location;
        if (currentLocation && radius !== currentLocation.radius) {
            const updatedLocation = { ...currentLocation, radius };
            setLocation(updatedLocation);
        }
    }, []);

    const refreshAllData = useCallback(() => {
        // Get current location from state at call time
        const currentLocation = state.location;

        // Clear throttling for refresh
        lastRequestTimes.current = {};

        // Force refresh all data
        loadDashboardDataRef.current();
        loadServiceDataInternalRef.current(currentLocation);
    }, []); // No dependencies

    // Store functions in refs
    loadServiceDataInternalRef.current = loadServiceDataInternal;
    loadDashboardDataRef.current = loadDashboardData;

    // Initialize data on mount with saved location
    useEffect(() => {
        if (user && user.role === "client" && !isInitialized.current) {
            // console.log("Initializing client data...");
            isInitialized.current = true;

            // Load dashboard data
            loadDashboardData();

            // Load service data with saved location (if any)
            const savedLocation = getSavedLocation();
            if (savedLocation) {
                // console.log(
                //     "Using saved location for initial data load:",
                //     savedLocation.city
                // );
                loadServiceData(savedLocation);
            } else {
                // console.log("No saved location, loading default service data");
                loadServiceData();
            }
        }
    }, [user, getSavedLocation, loadDashboardData, loadServiceData]); // ✅ Include stable dependencies

    // Effect to handle user logout (clear location data)
    useEffect(() => {
        if (!user) {
            console.log("User logged out, clearing location data");
            clearSavedLocation();
            dispatch({ type: "SET_LOCATION", payload: null });
        }
    }, [user, clearSavedLocation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
            debounceTimers.current = {};
            pendingRequests.current.clear();
        };
    }, []);

    // Context value with new location management functions
    const value = {
        ...state,
        // Actions
        loadDashboardData,
        loadServiceData,
        loadRecommendations,
        setLocation,
        setPreferredRadius, // ✅ ADD
        updateLocationRadius, // ✅ ADD
        clearError: (key) => dispatch({ type: "CLEAR_ERROR", key }),
        refreshAllData,

        // ✅ ADD: Location management helpers
        getSavedLocation,
        clearSavedLocation,
        hasLocation: !!state.location,
        locationSummary: state.location
            ? `${state.location.city}, ${state.location.province} (${state.location.radius}km)`
            : "No location set",

        // Helper functions
        isLoading: (key) => state.loading[key] || false,
        hasError: (key) => !!state.errors[key],
        getError: (key) => state.errors[key],

        // Location validation helper
        isValidLocation: (location) => {
            return (
                location &&
                typeof location.lat === "number" &&
                typeof location.lng === "number" &&
                location.lat >= -90 &&
                location.lat <= 90 &&
                location.lng >= -180 &&
                location.lng <= 180 &&
                location.city &&
                location.province
            );
        },
    };

    return (
        <ClientContext.Provider value={value}>
            {children}
        </ClientContext.Provider>
    );
};

const reverseGeocode = async (lat, lng) => {
    try {
        // Try using a free geocoding service first
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );

        if (response.ok) {
            const data = await response.json();
            return {
                lat,
                lng,
                address: data.locality
                    ? `${data.locality}, ${
                          data.city || data.principalSubdivision
                      }, ${data.countryName}`
                    : `${data.city || data.principalSubdivision}, ${
                          data.countryName
                      }`,
                neighborhood: data.locality || "",
                city: data.city || data.principalSubdivision || "Unknown City",
                province: data.principalSubdivision || "Sri Lanka",
                country: data.countryName || "Sri Lanka",
                radius: 15,
                accuracy: "gps_geocoded",
            };
        }
    } catch (error) {
        console.warn("Online geocoding failed, using offline fallback:", error);
    }

    // Fallback to offline geocoding with Sri Lankan cities
    return reverseGeocodeOffline(lat, lng);
};

const reverseGeocodeOffline = (lat, lng) => {
    const sriLankanCities = [
        {
            name: "Colombo",
            lat: 6.9271,
            lng: 79.8612,
            province: "Western Province",
        },
        {
            name: "Negombo",
            lat: 7.2083,
            lng: 79.8358,
            province: "Western Province",
        },
        {
            name: "Kandy",
            lat: 7.2906,
            lng: 80.6337,
            province: "Central Province",
        },
        {
            name: "Gampaha",
            lat: 7.0873,
            lng: 79.999,
            province: "Western Province",
        },
        {
            name: "Kalutara",
            lat: 6.5854,
            lng: 79.9607,
            province: "Western Province",
        },
        {
            name: "Galle",
            lat: 6.0535,
            lng: 80.221,
            province: "Southern Province",
        },
        {
            name: "Matara",
            lat: 5.9485,
            lng: 80.5353,
            province: "Southern Province",
        },
        {
            name: "Jaffna",
            lat: 9.6615,
            lng: 80.0255,
            province: "Northern Province",
        },
        {
            name: "Batticaloa",
            lat: 7.7102,
            lng: 81.6924,
            province: "Eastern Province",
        },
        {
            name: "Trincomalee",
            lat: 8.5874,
            lng: 81.2152,
            province: "Eastern Province",
        },
        {
            name: "Anuradhapura",
            lat: 8.3114,
            lng: 80.4037,
            province: "North Central Province",
        },
        {
            name: "Polonnaruwa",
            lat: 7.9403,
            lng: 81.0188,
            province: "North Central Province",
        },
        {
            name: "Kurunegala",
            lat: 7.4818,
            lng: 80.3609,
            province: "North Western Province",
        },
        {
            name: "Puttalam",
            lat: 8.0362,
            lng: 79.8283,
            province: "North Western Province",
        },
        {
            name: "Ratnapura",
            lat: 6.6828,
            lng: 80.4036,
            province: "Sabaragamuwa Province",
        },
        {
            name: "Kegalle",
            lat: 7.2513,
            lng: 80.3464,
            province: "Sabaragamuwa Province",
        },
        { name: "Badulla", lat: 6.9934, lng: 81.055, province: "Uva Province" },
        {
            name: "Monaragala",
            lat: 6.8728,
            lng: 81.351,
            province: "Uva Province",
        },
    ];

    let closestCity = sriLankanCities[0];
    let minDistance = calculateDistance(
        lat,
        lng,
        closestCity.lat,
        closestCity.lng
    );

    sriLankanCities.forEach((city) => {
        const distance = calculateDistance(lat, lng, city.lat, city.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
        }
    });

    // Determine neighborhood based on distance
    let neighborhood = "";
    let address = "";

    if (minDistance < 2) {
        neighborhood = `${closestCity.name} Center`;
        address = `${closestCity.name}, ${closestCity.province}`;
    } else if (minDistance < 10) {
        neighborhood = `Near ${closestCity.name}`;
        address = `Near ${closestCity.name}, ${closestCity.province}`;
    } else {
        neighborhood = `${closestCity.province} Area`;
        address = `${closestCity.province}, Sri Lanka`;
    }

    return {
        lat,
        lng,
        address,
        neighborhood,
        city: closestCity.name,
        province: closestCity.province,
        country: "Sri Lanka",
        radius: 15,
        accuracy: "gps_offline",
        distance_to_city: Math.round(minDistance),
    };
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in kilometers
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

export const useClient = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error("useClient must be used within a ClientProvider");
    }
    return context;
};
