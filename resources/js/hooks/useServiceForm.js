import { useState, useEffect } from "react";
import { useLocation } from "../context/LocationContext";

export const useServiceForm = (isEdit = false, serviceId = null) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // Step 1: Basic Information
        title: "",
        description: "",
        category_id: "",
        pricing_type: "fixed",
        base_price: "",
        duration_hours: "",

        // Step 2: Service Location
        latitude: null,
        longitude: null,
        location_address: "",
        location_city: "",
        location_neighborhood: "",
        service_radius: 10,

        // Step 3: Service Areas
        service_areas: [],

        // Step 4: Additional Details
        requirements: "",
        includes: "",
        service_images: [],
        custom_pricing_description: "",
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [imagesPreviews, setImagesPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAllAreas, setShowAllAreas] = useState(false);
    const [dynamicAreas, setDynamicAreas] = useState([]);

    const {
        nearbyAreas,
        loading: locationLoading,
        getNearbyServiceAreas,
        getAllServiceAreas,
    } = useLocation();

    // Sri Lankan areas fallback
    const sriLankanAreas = [
        "Colombo", "Kandy", "Galle", "Negombo", "Jaffna", "Anuradhapura",
        "Trincomalee", "Matara", "Kurunegala", "Ratnapura", "Batticaloa",
        "Badulla", "Puttalam", "Kalutara", "Vavuniya", "Hambantota",
        "Chilaw", "Panadura", "Avissawella", "Embilipitiya", "Monaragala",
        "Polonnaruwa", "Ampara", "Kegalle", "Nuwara Eliya", "Bandarawela",
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleLocationChange = (location) => {
        setFormData((prev) => ({
            ...prev,
            latitude: location.lat,
            longitude: location.lng,
            location_address: location.address,
            location_city: location.city,
            location_neighborhood: location.neighborhood || "",
            service_radius: location.radius || prev.service_radius,
        }));

        // Clear location errors
        setErrors((prev) => ({
            ...prev,
            latitude: "",
            longitude: "",
            location_address: "",
        }));
    };

    const handleServiceAreasChange = (area) => {
        setFormData((prev) => ({
            ...prev,
            service_areas: prev.service_areas.includes(area)
                ? prev.service_areas.filter((a) => a !== area)
                : [...prev.service_areas, area],
        }));

        // Clear service areas error
        if (errors.service_areas) {
            setErrors((prev) => ({ ...prev, service_areas: "" }));
        }
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.service_images.length > 5) {
            setErrors((prev) => ({
                ...prev,
                service_images: "You can upload maximum 5 images",
            }));
            return;
        }

        const newImages = [];
        const newPreviews = [];

        files.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    service_images: `${file.name} is too large. Maximum size is 2MB.`,
                }));
                return;
            }

            newImages.push(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                if (newPreviews.length === files.length) {
                    setImagesPreviews((prev) => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setFormData((prev) => ({
            ...prev,
            service_images: [...prev.service_images, ...newImages],
        }));

        // Clear image errors
        if (errors.service_images) {
            setErrors((prev) => ({ ...prev, service_images: "" }));
        }
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            service_images: prev.service_images.filter((_, i) => i !== index),
        }));
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const getPricingPreview = () => {
        if (!formData.base_price) return "Enter price above";

        switch (formData.pricing_type) {
            case "hourly":
                return `Rs. ${parseFloat(formData.base_price).toLocaleString()}/hour`;
            case "fixed":
                return `Rs. ${parseFloat(formData.base_price).toLocaleString()}`;
            case "custom":
                return formData.custom_pricing_description || "Custom pricing";
            default:
                return `Rs. ${parseFloat(formData.base_price).toLocaleString()}`;
        }
    };

    return {
        // State
        currentStep,
        setCurrentStep,
        formData,
        setFormData,
        categories,
        setCategories,
        errors,
        setErrors,
        imagesPreviews,
        setImagesPreviews,
        isSubmitting,
        setIsSubmitting,
        showAllAreas,
        setShowAllAreas,
        dynamicAreas,
        setDynamicAreas,
        locationLoading,
        sriLankanAreas,

        // Handlers
        handleInputChange,
        handleLocationChange,
        handleServiceAreasChange,
        handleImageUpload,
        removeImage,
        getPricingPreview,

        // Location services
        getNearbyServiceAreas,
        getAllServiceAreas,
    };
};