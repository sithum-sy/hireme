import { useEffect } from "react";

export const useServiceAreas = ({
    formData,
    currentStep,
    dynamicAreas,
    setDynamicAreas,
    showAllAreas,
    setShowAllAreas,
    sriLankanAreas,
    getNearbyServiceAreas,
    getAllServiceAreas,
}) => {
    const loadNearbyAreas = async () => {
        try {
            console.log(
                "Loading nearby areas for:",
                formData.latitude,
                formData.longitude
            );
            const result = await getNearbyServiceAreas(
                formData.latitude,
                formData.longitude,
                formData.service_radius || 50
            );

            if (result && result.nearby_areas && result.nearby_areas.length > 0) {
                console.log("Nearby areas loaded:", result.nearby_areas);
                setDynamicAreas(result.nearby_areas);
            } else if (result && result.all_province_areas && result.all_province_areas.length > 0) {
                // Use province areas if no nearby areas found
                console.log("Using province areas:", result.all_province_areas);
                setDynamicAreas(result.all_province_areas.map((area) => ({ name: area })));
            } else {
                // Fallback to hardcoded areas if API fails
                console.log("No areas found from API, using fallback");
                setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
            }
        } catch (error) {
            console.error("Error loading nearby areas:", error);
            // Fallback to hardcoded areas if API fails
            setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
        }
    };

    const loadInitialAreas = async () => {
        if (formData.latitude && formData.longitude) {
            await loadNearbyAreas();
        } else {
            // Load all areas if no location is set
            try {
                const allAreas = await getAllServiceAreas();
                if (allAreas && allAreas.length > 0) {
                    setDynamicAreas(allAreas.map((area) => ({ name: area })));
                } else {
                    // Final fallback to hardcoded areas
                    setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
                }
            } catch (error) {
                console.error("Error loading all areas:", error);
                // Final fallback to hardcoded areas
                setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
            }
        }
    };

    const handleShowAllAreas = async () => {
        try {
            if (!showAllAreas) {
                console.log("Loading all service areas...");
                const allAreas = await getAllServiceAreas();
                if (allAreas && allAreas.length > 0) {
                    setDynamicAreas(allAreas.map((area) => ({ name: area })));
                } else {
                    setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
                }
            } else {
                console.log("Loading nearby areas...");
                if (formData.latitude && formData.longitude) {
                    await loadNearbyAreas();
                } else {
                    // If no location is set, show all areas again
                    const allAreas = await getAllServiceAreas();
                    if (allAreas && allAreas.length > 0) {
                        setDynamicAreas(allAreas.map((area) => ({ name: area })));
                    }
                }
            }
            setShowAllAreas(!showAllAreas);
        } catch (error) {
            console.error("Error toggling areas:", error);
            // Fallback to hardcoded areas
            setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
        }
    };

    // Watch for location changes to update service areas
    useEffect(() => {
        if (formData.latitude && formData.longitude && currentStep === 3) {
            console.log("Location changed, reloading nearby areas");
            loadNearbyAreas();
        }
    }, [formData.latitude, formData.longitude, currentStep]);

    // Initialize dynamic areas when component mounts or when reaching step 3
    useEffect(() => {
        if (currentStep === 3 && dynamicAreas.length === 0) {
            console.log("Initializing areas for step 3");
            loadInitialAreas();
        }
    }, [currentStep]);

    return {
        loadNearbyAreas,
        loadInitialAreas,
        handleShowAllAreas,
    };
};