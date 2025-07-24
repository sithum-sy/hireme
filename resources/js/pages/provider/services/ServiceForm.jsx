import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LocationSelector from "../../../components/map/LocationSelector";
import { useLocation } from "../../../context/LocationContext";
// import EnhancedLocationSelector from "../../components/map/EnhancedLocationSelector";
import { useDynamicAreas } from "../../../context/DynamicAreasContext";

const ServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { createService, updateService, getServiceCategories, loading } =
        useServices();
    const { businessStats } = useProvider();

    const {
        nearbyAreas,
        loading: locationLoading,
        getNearbyServiceAreas,
        getAllServiceAreas,
    } = useLocation();

    // const { nearbyAreas, loadAreasFromMap } = useDynamicAreas();
    // const [dynamicAreas, setDynamicAreas] = useState([]);

    const [showAllAreas, setShowAllAreas] = useState(false);
    const [dynamicAreas, setDynamicAreas] = useState([]);

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

    // Steps configuration
    const steps = [
        {
            number: 1,
            title: "Basic Info",
            icon: "fas fa-info-circle",
            description: "Service details and pricing",
        },
        {
            number: 2,
            title: "Location",
            icon: "fas fa-map-marked-alt",
            description: "Your service location",
        },
        {
            number: 3,
            title: "Service Areas",
            icon: "fas fa-map",
            description: "Where you provide service",
        },
        {
            number: 4,
            title: "Details & Images",
            icon: "fas fa-images",
            description: "Additional information",
        },
    ];

    useEffect(() => {
        loadCategories();
        if (isEdit) {
            loadServiceData();
        }
    }, [isEdit, id]);

    // Watch for location changes to update service areas
    useEffect(() => {
        if (formData.latitude && formData.longitude && currentStep === 3) {
            loadNearbyAreas();
        }
    }, [formData.latitude, formData.longitude, currentStep]);

    // Initialize dynamic areas when component mounts
    useEffect(() => {
        if (currentStep === 3 && dynamicAreas.length === 0) {
            loadInitialAreas();
        }
    }, [currentStep]);

    const loadCategories = async () => {
        const result = await getServiceCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    const loadServiceData = async () => {
        // In a real app, you'd fetch the service data by ID
        console.log("Loading service data for ID:", id);
    };

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

    // const handleLocationChange = async (location) => {
    //     setFormData((prev) => ({
    //         ...prev,
    //         latitude: location.lat,
    //         longitude: location.lng,
    //         location_address: location.address,
    //         location_city: location.city,
    //         location_neighborhood: location.neighborhood || "",
    //         service_radius: location.radius || prev.service_radius,
    //     }));

    //     // Load nearby areas when location changes
    //     if (location.lat && location.lng) {
    //         const areas = await loadAreasFromMap(
    //             location.lat,
    //             location.lng,
    //             location.radius || 30
    //         );
    //         setDynamicAreas(areas);
    //     }

    //     // Clear location errors
    //     setErrors((prev) => ({
    //         ...prev,
    //         latitude: "",
    //         longitude: "",
    //         location_address: "",
    //     }));
    // };

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

    const loadNearbyAreas = async () => {
        try {
            console.log(
                "Loading nearby areas for:",
                formData.latitude,
                formData.longitude
            );
            const areas = await getNearbyServiceAreas(
                formData.latitude,
                formData.longitude,
                formData.service_radius || 50
            );

            if (areas && areas.nearby_areas) {
                // console.log("Nearby areas loaded:", areas.nearby_areas);
                setDynamicAreas(areas.nearby_areas);
            } else {
                // Fallback to hardcoded areas if API fails
                console.log("No nearby areas found, using fallback");
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
            const allAreas = await getAllServiceAreas();
            if (allAreas) {
                setDynamicAreas(allAreas.map((area) => ({ name: area })));
            } else {
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
                if (allAreas) {
                    setDynamicAreas(allAreas.map((area) => ({ name: area })));
                } else {
                    setDynamicAreas(
                        sriLankanAreas.map((area) => ({ name: area }))
                    );
                }
            } else {
                console.log("Loading nearby areas...");
                await loadNearbyAreas();
            }
            setShowAllAreas(!showAllAreas);
        } catch (error) {
            console.error("Error toggling areas:", error);
            // Fallback to hardcoded areas
            setDynamicAreas(sriLankanAreas.map((area) => ({ name: area })));
        }
    };

    const validateStep = (stepNumber) => {
        const newErrors = {};

        switch (stepNumber) {
            case 1:
                if (!formData.title.trim())
                    newErrors.title = "Service title is required";
                if (formData.title.length > 255)
                    newErrors.title =
                        "Service title cannot exceed 255 characters";

                if (!formData.description.trim())
                    newErrors.description = "Description is required";
                if (formData.description.length < 50)
                    newErrors.description =
                        "Description must be at least 50 characters";
                if (formData.description.length > 2000)
                    newErrors.description =
                        "Description cannot exceed 2000 characters";

                if (!formData.category_id)
                    newErrors.category_id = "Please select a category";

                if (!formData.base_price || formData.base_price <= 0)
                    newErrors.base_price = "Please enter a valid price";
                if (formData.base_price > 99999.99)
                    newErrors.base_price = "Price cannot exceed Rs. 99,999.99";

                if (!formData.duration_hours || formData.duration_hours <= 0)
                    newErrors.duration_hours = "Please enter valid duration";
                if (formData.duration_hours < 0.5)
                    newErrors.duration_hours = "Minimum duration is 0.5 hours";
                if (formData.duration_hours > 24)
                    newErrors.duration_hours = "Maximum duration is 24 hours";

                if (
                    formData.pricing_type === "custom" &&
                    !formData.custom_pricing_description.trim()
                ) {
                    newErrors.custom_pricing_description =
                        "Custom pricing description is required";
                }
                break;

            case 2:
                if (!formData.latitude || !formData.longitude) {
                    newErrors.location =
                        "Please select your service location on the map";
                }
                if (!formData.location_address) {
                    newErrors.location_address =
                        "Service location address is required";
                }
                break;

            case 3:
                if (formData.service_areas.length === 0) {
                    newErrors.service_areas =
                        "Please select at least one service area";
                }
                break;

            case 4:
                if (formData.includes && formData.includes.length > 1000) {
                    newErrors.includes =
                        "Service includes cannot exceed 1000 characters";
                }
                if (
                    formData.requirements &&
                    formData.requirements.length > 1000
                ) {
                    newErrors.requirements =
                        "Requirements cannot exceed 1000 characters";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        // console.log("=== HANDLE NEXT CALLED ===");
        // console.log("Current step:", currentStep);

        if (!validateStep(currentStep)) {
            console.log("=== VALIDATION FAILED ===");
            return;
        }

        if (currentStep < steps.length) {
            // console.log("=== MOVING TO NEXT STEP ===", currentStep + 1);
            setCurrentStep(currentStep + 1);
            setErrors({}); // Clear any previous errors
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     if (!validateStep(currentStep)) {
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     const submitData = new FormData();

    //     // Add all form fields
    //     Object.keys(formData).forEach((key) => {
    //         if (key === "service_areas") {
    //             formData[key].forEach((area, index) => {
    //                 submitData.append(`service_areas[${index}]`, area);
    //             });
    //         } else if (key === "service_images") {
    //             formData[key].forEach((image, index) => {
    //                 submitData.append(`service_images[${index}]`, image);
    //             });
    //         } else if (
    //             formData[key] !== null &&
    //             formData[key] !== undefined &&
    //             formData[key] !== ""
    //         ) {
    //             submitData.append(key, formData[key]);
    //         }
    //     });

    //     try {
    //         const result = isEdit
    //             ? await updateService(id, submitData)
    //             : await createService(submitData);

    //         if (result.success) {
    //             navigate("/provider/services", {
    //                 state: {
    //                     message: isEdit
    //                         ? "Service updated successfully!"
    //                         : "Service created successfully!",
    //                     type: "success",
    //                 },
    //             });
    //         } else {
    //             setErrors(result.errors || { general: result.message });
    //             // Navigate to the step with errors
    //             if (result.errors) {
    //                 if (
    //                     result.errors.title ||
    //                     result.errors.description ||
    //                     result.errors.category_id
    //                 ) {
    //                     setCurrentStep(1);
    //                 } else if (
    //                     result.errors.latitude ||
    //                     result.errors.location_address
    //                 ) {
    //                     setCurrentStep(2);
    //                 } else if (result.errors.service_areas) {
    //                     setCurrentStep(3);
    //                 }
    //             }
    //         }
    //     } catch (error) {
    //         setErrors({
    //             general: "An unexpected error occurred. Please try again.",
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsSubmitting(true);

    //     if (!validateStep(currentStep)) {
    //         setIsSubmitting(false);
    //         return;
    //     }

    //     const submitData = new FormData();

    //     // Required fields
    //     submitData.append("title", formData.title || "");
    //     submitData.append("description", formData.description || "");
    //     submitData.append("category_id", formData.category_id || "");
    //     submitData.append("pricing_type", formData.pricing_type || "fixed");
    //     submitData.append("base_price", formData.base_price || "0");
    //     submitData.append("duration_hours", formData.duration_hours || "1");

    //     // Location fields
    //     submitData.append("latitude", formData.latitude || "");
    //     submitData.append("longitude", formData.longitude || "");
    //     submitData.append("location_address", formData.location_address || "");
    //     submitData.append("service_radius", formData.service_radius || "15");

    //     // Optional fields - always include with empty string if not set
    //     submitData.append(
    //         "custom_pricing_description",
    //         formData.custom_pricing_description || ""
    //     );
    //     submitData.append("location_city", formData.location_city || "");
    //     submitData.append(
    //         "location_neighborhood",
    //         formData.location_neighborhood || ""
    //     );
    //     submitData.append("includes", formData.includes || ""); // This was missing!
    //     submitData.append("requirements", formData.requirements || ""); // This was missing!

    //     // Service areas as JSON string
    //     submitData.append(
    //         "service_areas",
    //         JSON.stringify(formData.service_areas || [])
    //     );

    //     // Images
    //     if (formData.service_images && formData.service_images.length > 0) {
    //         formData.service_images.forEach((image, index) => {
    //             submitData.append(`service_images[]`, image);
    //         });
    //     }

    //     // Debug log
    //     // console.log("=== COMPLETE FORM DATA ===");
    //     for (let [key, value] of submitData.entries()) {
    //         // console.log(`${key}:`, value);
    //     }

    //     try {
    //         const result = await createService(submitData);
    //         if (result.success) {
    //             navigate("/provider/services", {
    //                 state: {
    //                     message: "Service created successfully!",
    //                     type: "success",
    //                 },
    //             });
    //         } else {
    //             setErrors(result.errors || { general: result.message });
    //             // Handle step navigation for errors...
    //         }
    //     } catch (error) {
    //         console.error("Form submission error:", error);
    //         setErrors({
    //             general: "An unexpected error occurred. Please try again.",
    //         });
    //     } finally {
    //         setIsSubmitting(false);
    //     }
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateStep(currentStep)) {
            setIsSubmitting(false);
            return;
        }

        const submitData = new FormData();

        // Required fields
        submitData.append("title", formData.title || "");
        submitData.append("description", formData.description || "");
        submitData.append("category_id", formData.category_id || "");
        submitData.append("pricing_type", formData.pricing_type || "fixed");
        submitData.append("base_price", formData.base_price || "0");
        submitData.append("duration_hours", formData.duration_hours || "1");

        // Location fields - ENSURE THESE ARE ALWAYS INCLUDED
        submitData.append(
            "latitude",
            formData.latitude !== null ? formData.latitude : ""
        );
        submitData.append(
            "longitude",
            formData.longitude !== null ? formData.longitude : ""
        );
        submitData.append("location_address", formData.location_address || "");
        submitData.append("location_city", formData.location_city || "");
        submitData.append(
            "location_neighborhood",
            formData.location_neighborhood || ""
        );
        submitData.append("service_radius", formData.service_radius || "15");

        // Optional fields
        submitData.append(
            "custom_pricing_description",
            formData.custom_pricing_description || ""
        );
        submitData.append("includes", formData.includes || "");
        submitData.append("requirements", formData.requirements || "");

        // Service areas as JSON string
        submitData.append(
            "service_areas",
            JSON.stringify(formData.service_areas || [])
        );

        // Images
        if (formData.service_images && formData.service_images.length > 0) {
            formData.service_images.forEach((image) => {
                submitData.append(`service_images[]`, image);
            });
        }

        // Debug log to verify location data
        console.log("=== LOCATION DATA BEING SENT ===");
        console.log("Latitude:", formData.latitude);
        console.log("Longitude:", formData.longitude);
        console.log("Address:", formData.location_address);
        console.log("City:", formData.location_city);

        try {
            const result = await createService(submitData);
            if (result.success) {
                navigate("/provider/services", {
                    state: {
                        message: "Service created successfully!",
                        type: "success",
                    },
                });
            } else {
                setErrors(result.errors || { general: result.message });
                // Handle step navigation for errors...
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setErrors({
                general: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepProgress = () => (currentStep / steps.length) * 100;

    const getPricingPreview = () => {
        if (!formData.base_price) return "Enter price above";

        switch (formData.pricing_type) {
            case "hourly":
                return `Rs. ${parseFloat(
                    formData.base_price
                ).toLocaleString()}/hour`;
            case "fixed":
                return `Rs. ${parseFloat(
                    formData.base_price
                ).toLocaleString()}`;
            case "custom":
                return formData.custom_pricing_description || "Custom pricing";
            default:
                return `Rs. ${parseFloat(
                    formData.base_price
                ).toLocaleString()}`;
        }
    };

    return (
        <ProviderLayout>
            <div className="service-form-container">
                {/* Header */}
                <div className="form-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1">
                                <i className="fas fa-plus-circle text-orange me-2"></i>
                                {isEdit ? "Edit Service" : "Add New Service"}
                            </h4>
                            <p className="text-muted mb-0">
                                {isEdit
                                    ? "Update your service details and pricing"
                                    : "Create a new service offering for your clients"}
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => navigate("/provider/services")}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <div className="progress-container mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div
                                className="progress mb-3"
                                style={{ height: "8px" }}
                            >
                                <div
                                    className="progress-bar bg-orange"
                                    style={{ width: `${getStepProgress()}%` }}
                                ></div>
                            </div>
                            <div className="row">
                                {steps.map((step) => (
                                    <div key={step.number} className="col-3">
                                        <div className="step-indicator text-center">
                                            <div
                                                className={`step-icon rounded-circle d-inline-flex align-items-center justify-content-center mb-2 ${
                                                    currentStep >= step.number
                                                        ? "bg-orange text-white"
                                                        : "bg-light text-muted"
                                                }`}
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                }}
                                            >
                                                <i className={step.icon}></i>
                                            </div>
                                            <div className="step-title small fw-semibold">
                                                {step.title}
                                            </div>
                                            <div className="step-description small text-muted">
                                                {step.description}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Main Form */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-bottom">
                                    <h6 className="mb-0 fw-bold">
                                        <i
                                            className={`${
                                                steps[currentStep - 1].icon
                                            } text-orange me-2`}
                                        ></i>
                                        Step {currentStep}:{" "}
                                        {steps[currentStep - 1].title}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {/* Step 1: Basic Information */}
                                    {currentStep === 1 && (
                                        <div className="step-content">
                                            <div className="row">
                                                <div className="col-md-8">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            Service Title{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className={`form-control ${
                                                                errors.title
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            name="title"
                                                            value={
                                                                formData.title
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            placeholder="e.g., Professional House Cleaning"
                                                            maxLength="255"
                                                        />
                                                        {errors.title && (
                                                            <div className="invalid-feedback">
                                                                {errors.title}
                                                            </div>
                                                        )}
                                                        <div className="form-text">
                                                            {
                                                                formData.title
                                                                    .length
                                                            }
                                                            /255 characters
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            Category{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className={`form-select ${
                                                                errors.category_id
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            name="category_id"
                                                            value={
                                                                formData.category_id
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        >
                                                            <option value="">
                                                                Select category
                                                            </option>
                                                            {(Array.isArray(
                                                                categories
                                                            )
                                                                ? categories
                                                                : []
                                                            ).map(
                                                                (category) => (
                                                                    <option
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={
                                                                            category.id
                                                                        }
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                        {errors.category_id && (
                                                            <div className="invalid-feedback">
                                                                {
                                                                    errors.category_id
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Service Description{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </label>
                                                <textarea
                                                    className={`form-control ${
                                                        errors.description
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    placeholder="Describe your service in detail. What do you offer? What makes it special?"
                                                    rows="4"
                                                    maxLength="2000"
                                                ></textarea>
                                                {errors.description && (
                                                    <div className="invalid-feedback">
                                                        {errors.description}
                                                    </div>
                                                )}
                                                <div className="form-text">
                                                    {
                                                        formData.description
                                                            .length
                                                    }
                                                    /2000 characters (minimum 50
                                                    required)
                                                </div>
                                            </div>

                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            Pricing Type{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            name="pricing_type"
                                                            value={
                                                                formData.pricing_type
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                        >
                                                            <option value="fixed">
                                                                Fixed Price
                                                            </option>
                                                            <option value="hourly">
                                                                Hourly Rate
                                                            </option>
                                                            <option value="custom">
                                                                Custom Pricing
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            {formData.pricing_type ===
                                                            "custom"
                                                                ? "Starting Price"
                                                                : "Price"}{" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <div className="input-group">
                                                            <span className="input-group-text">
                                                                Rs.
                                                            </span>
                                                            <input
                                                                type="number"
                                                                className={`form-control ${
                                                                    errors.base_price
                                                                        ? "is-invalid"
                                                                        : ""
                                                                }`}
                                                                name="base_price"
                                                                value={
                                                                    formData.base_price
                                                                }
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                placeholder="0.00"
                                                                min="0"
                                                                step="0.01"
                                                                disabled={
                                                                    formData.pricing_type ===
                                                                    "custom"
                                                                }
                                                            />
                                                        </div>
                                                        {errors.base_price && (
                                                            <div className="invalid-feedback">
                                                                {
                                                                    errors.base_price
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="mb-3">
                                                        <label className="form-label fw-semibold">
                                                            Duration (hours){" "}
                                                            <span className="text-danger">
                                                                *
                                                            </span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className={`form-control ${
                                                                errors.duration_hours
                                                                    ? "is-invalid"
                                                                    : ""
                                                            }`}
                                                            name="duration_hours"
                                                            value={
                                                                formData.duration_hours
                                                            }
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            placeholder="2.5"
                                                            min="0.5"
                                                            max="24"
                                                            step="0.5"
                                                        />
                                                        {errors.duration_hours && (
                                                            <div className="invalid-feedback">
                                                                {
                                                                    errors.duration_hours
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.pricing_type ===
                                                "custom" && (
                                                <div className="mb-3">
                                                    <label className="form-label fw-semibold">
                                                        Custom Pricing
                                                        Description{" "}
                                                        <span className="text-danger">
                                                            *
                                                        </span>
                                                    </label>
                                                    <textarea
                                                        className={`form-control ${
                                                            errors.custom_pricing_description
                                                                ? "is-invalid"
                                                                : ""
                                                        }`}
                                                        name="custom_pricing_description"
                                                        value={
                                                            formData.custom_pricing_description
                                                        }
                                                        onChange={
                                                            handleInputChange
                                                        }
                                                        placeholder="Explain your pricing structure (e.g., varies by project size, consultation required)"
                                                        rows="3"
                                                        maxLength="500"
                                                    ></textarea>
                                                    {errors.custom_pricing_description && (
                                                        <div className="invalid-feedback">
                                                            {
                                                                errors.custom_pricing_description
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: Service Location */}
                                    {currentStep === 2 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map-marker-alt text-orange me-2"></i>
                                                    Where do you provide this
                                                    service?
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Select your service location
                                                    and coverage radius. This
                                                    helps clients find you based
                                                    on their location.
                                                </p>
                                            </div>

                                            <LocationSelector
                                                value={{
                                                    lat: formData.latitude,
                                                    lng: formData.longitude,
                                                    address:
                                                        formData.location_address,
                                                    city: formData.location_city,
                                                    neighborhood:
                                                        formData.location_neighborhood,
                                                    radius: formData.service_radius,
                                                }}
                                                onChange={handleLocationChange}
                                                error={
                                                    errors.location ||
                                                    errors.location_address
                                                }
                                            />

                                            {(errors.location ||
                                                errors.location_address) && (
                                                <div className="alert alert-danger mt-3">
                                                    <i className="fas fa-exclamation-circle me-2"></i>
                                                    {errors.location ||
                                                        errors.location_address}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {/* {currentStep === 2 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map-marker-alt text-orange me-2"></i>
                                                    Where do you provide this
                                                    service?
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Search for your location or
                                                    click on the map to select
                                                    your service location.
                                                </p>
                                            </div>

                                            <EnhancedLocationSelector
                                                value={{
                                                    lat: formData.latitude,
                                                    lng: formData.longitude,
                                                    address:
                                                        formData.location_address,
                                                    city: formData.location_city,
                                                    neighborhood:
                                                        formData.location_neighborhood,
                                                    radius: formData.service_radius,
                                                }}
                                                onChange={handleLocationChange}
                                                error={
                                                    errors.location ||
                                                    errors.location_address
                                                }
                                            />
                                        </div>
                                    )} */}

                                    {/* Step 3: Service Areas */}
                                    {currentStep === 3 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map text-orange me-2"></i>
                                                    Select service areas
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    {formData.location_city ? (
                                                        <>
                                                            Based on your
                                                            location in{" "}
                                                            <strong>
                                                                {
                                                                    formData.location_city
                                                                }
                                                            </strong>
                                                            , here are the
                                                            recommended service
                                                            areas. You can also
                                                            view all available
                                                            areas.
                                                        </>
                                                    ) : (
                                                        <>
                                                            Select all areas
                                                            where you provide
                                                            your services. This
                                                            helps clients know
                                                            if you're available
                                                            in their location.
                                                        </>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Location-based areas header */}
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h6 className="mb-1">
                                                        {showAllAreas
                                                            ? "All Available Areas"
                                                            : formData.location_city
                                                            ? `Areas near ${formData.location_city}`
                                                            : "Available Service Areas"}
                                                    </h6>
                                                    {!showAllAreas &&
                                                        dynamicAreas.length >
                                                            0 &&
                                                        formData.location_city && (
                                                            <small className="text-muted">
                                                                Showing{" "}
                                                                {
                                                                    dynamicAreas.length
                                                                }{" "}
                                                                areas within{" "}
                                                                {formData.service_radius ||
                                                                    50}
                                                                km
                                                            </small>
                                                        )}
                                                </div>
                                                {formData.location_city && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={
                                                            handleShowAllAreas
                                                        }
                                                        disabled={
                                                            locationLoading
                                                        }
                                                    >
                                                        {locationLoading ? (
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                        ) : (
                                                            <i
                                                                className={`fas fa-${
                                                                    showAllAreas
                                                                        ? "location-arrow"
                                                                        : "list"
                                                                } me-2`}
                                                            ></i>
                                                        )}
                                                        {showAllAreas
                                                            ? "Show Nearby Areas"
                                                            : "Show All Areas"}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Service areas grid */}
                                            {locationLoading ? (
                                                <div className="text-center py-4">
                                                    <div className="spinner-border text-primary mb-3"></div>
                                                    <p className="text-muted">
                                                        Loading service areas...
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="service-areas-grid">
                                                    <div className="row">
                                                        {dynamicAreas.map(
                                                            (area, index) => (
                                                                <div
                                                                    key={`${area.name}-${index}`}
                                                                    className="col-md-4 col-6 mb-2"
                                                                >
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            id={`area-${area.name
                                                                                .replace(
                                                                                    /\s+/g,
                                                                                    "-"
                                                                                )
                                                                                .toLowerCase()}`}
                                                                            checked={formData.service_areas.includes(
                                                                                area.name
                                                                            )}
                                                                            onChange={(
                                                                                e
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handleServiceAreasChange(
                                                                                    area.name
                                                                                );
                                                                            }}
                                                                        />
                                                                        <label
                                                                            className="form-check-label d-flex justify-content-between align-items-center"
                                                                            htmlFor={`area-${area.name
                                                                                .replace(
                                                                                    /\s+/g,
                                                                                    "-"
                                                                                )
                                                                                .toLowerCase()}`}
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                        >
                                                                            <span className="flex-grow-1">
                                                                                {
                                                                                    area.name
                                                                                }
                                                                            </span>
                                                                            {area.distance && (
                                                                                <small className="text-muted ms-2 badge bg-light">
                                                                                    {
                                                                                        area.distance
                                                                                    }
                                                                                    km
                                                                                </small>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>

                                                    {dynamicAreas.length ===
                                                        0 &&
                                                        !locationLoading && (
                                                            <div className="text-center py-4">
                                                                <i className="fas fa-map-marker-alt fa-2x text-muted mb-3"></i>
                                                                <p className="text-muted">
                                                                    No service
                                                                    areas found
                                                                    for your
                                                                    location.
                                                                    <br />
                                                                    {formData.location_city && (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-link p-0 mt-2"
                                                                            onClick={
                                                                                handleShowAllAreas
                                                                            }
                                                                        >
                                                                            View
                                                                            all
                                                                            available
                                                                            areas
                                                                        </button>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                </div>
                                            )}

                                            {/* Selected areas display */}
                                            {formData.service_areas.length >
                                                0 && (
                                                <div className="selected-areas mt-4">
                                                    <h6 className="fw-semibold mb-2">
                                                        Selected Areas (
                                                        {
                                                            formData
                                                                .service_areas
                                                                .length
                                                        }
                                                        ):
                                                    </h6>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        {formData.service_areas.map(
                                                            (area) => {
                                                                const areaData =
                                                                    dynamicAreas.find(
                                                                        (a) =>
                                                                            a.name ===
                                                                            area
                                                                    );
                                                                return (
                                                                    <span
                                                                        key={
                                                                            area
                                                                        }
                                                                        className="badge bg-orange bg-opacity-10 text-orange px-3 py-2 d-flex align-items-center"
                                                                    >
                                                                        <span>
                                                                            {
                                                                                area
                                                                            }
                                                                        </span>
                                                                        {areaData?.distance && (
                                                                            <small className="ms-1 opacity-75">
                                                                                (
                                                                                {
                                                                                    areaData.distance
                                                                                }
                                                                                km)
                                                                            </small>
                                                                        )}
                                                                        <button
                                                                            type="button"
                                                                            className="btn-close btn-close-sm ms-2"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                handleServiceAreasChange(
                                                                                    area
                                                                                );
                                                                            }}
                                                                            style={{
                                                                                fontSize:
                                                                                    "0.6rem",
                                                                            }}
                                                                        ></button>
                                                                    </span>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Location hint */}
                                            {!formData.location_city && (
                                                <div className="alert alert-info mt-3">
                                                    <i className="fas fa-info-circle me-2"></i>
                                                    <strong>Tip:</strong> Select
                                                    your service location in
                                                    Step 2 to see areas near you
                                                    automatically.
                                                </div>
                                            )}

                                            {/* Error display */}
                                            {errors.service_areas && (
                                                <div className="alert alert-danger mt-3">
                                                    <i className="fas fa-exclamation-circle me-2"></i>
                                                    {errors.service_areas}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Step 4: Details & Images */}
                                    {currentStep === 4 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-images text-orange me-2"></i>
                                                    Additional Details & Images
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Add more details about your
                                                    service and upload images to
                                                    showcase your work.
                                                </p>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    What's Included in This
                                                    Service
                                                </label>
                                                <textarea
                                                    className={`form-control ${
                                                        errors.includes
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    name="includes"
                                                    value={formData.includes}
                                                    onChange={handleInputChange}
                                                    placeholder="List what's included in your service (e.g., all cleaning supplies, equipment, etc.)"
                                                    rows="3"
                                                    maxLength="1000"
                                                ></textarea>
                                                {errors.includes && (
                                                    <div className="invalid-feedback">
                                                        {errors.includes}
                                                    </div>
                                                )}
                                                <div className="form-text">
                                                    {formData.includes.length}
                                                    /1000 characters
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="form-label fw-semibold">
                                                    Requirements (Optional)
                                                </label>
                                                <textarea
                                                    className={`form-control ${
                                                        errors.requirements
                                                            ? "is-invalid"
                                                            : ""
                                                    }`}
                                                    name="requirements"
                                                    value={
                                                        formData.requirements
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="Any special requirements or conditions (e.g., access to water, power supply, etc.)"
                                                    rows="3"
                                                    maxLength="1000"
                                                ></textarea>
                                                {errors.requirements && (
                                                    <div className="invalid-feedback">
                                                        {errors.requirements}
                                                    </div>
                                                )}
                                                <div className="form-text">
                                                    {
                                                        formData.requirements
                                                            .length
                                                    }
                                                    /1000 characters
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Service Images (Optional)
                                                </label>
                                                <div className="image-upload-area">
                                                    <input
                                                        type="file"
                                                        className="d-none"
                                                        id="imageUpload"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={
                                                            handleImageUpload
                                                        }
                                                    />
                                                    <label
                                                        htmlFor="imageUpload"
                                                        className="image-upload-label border-2 border-dashed rounded p-4 text-center d-block"
                                                        style={{
                                                            cursor: "pointer",
                                                            borderColor:
                                                                "#dee2e6",
                                                        }}
                                                    >
                                                        <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                                        <div className="h6">
                                                            Click to upload
                                                            images
                                                        </div>
                                                        <small className="text-muted">
                                                            Upload up to 5
                                                            images (Max 2MB
                                                            each)
                                                            <br />
                                                            Supported formats:
                                                            JPG, PNG, GIF
                                                        </small>
                                                    </label>

                                                    {errors.service_images && (
                                                        <div className="text-danger mt-2">
                                                            <i className="fas fa-exclamation-circle me-1"></i>
                                                            {
                                                                errors.service_images
                                                            }
                                                        </div>
                                                    )}

                                                    {imagesPreviews.length >
                                                        0 && (
                                                        <div className="uploaded-images mt-3">
                                                            <h6 className="fw-semibold mb-2">
                                                                Uploaded Images
                                                                (
                                                                {
                                                                    imagesPreviews.length
                                                                }
                                                                /5):
                                                            </h6>
                                                            <div className="row">
                                                                {imagesPreviews.map(
                                                                    (
                                                                        preview,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="col-md-3 col-6 mb-3"
                                                                        >
                                                                            <div className="image-preview position-relative">
                                                                                <img
                                                                                    src={
                                                                                        preview
                                                                                    }
                                                                                    alt={`Preview ${
                                                                                        index +
                                                                                        1
                                                                                    }`}
                                                                                    className="img-fluid rounded"
                                                                                    style={{
                                                                                        height: "120px",
                                                                                        objectFit:
                                                                                            "cover",
                                                                                        width: "100%",
                                                                                    }}
                                                                                />
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                                                    onClick={() =>
                                                                                        removeImage(
                                                                                            index
                                                                                        )
                                                                                    }
                                                                                    style={{
                                                                                        fontSize:
                                                                                            "0.7rem",
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-times"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Final Review Section */}
                                            <div className="final-review mt-4 p-3 bg-light rounded">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    Review Your Service
                                                </h6>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Service Title:
                                                        </small>
                                                        <div className="fw-semibold">
                                                            {formData.title ||
                                                                "Not specified"}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Category:
                                                        </small>
                                                        <div className="fw-semibold">
                                                            {categories.find(
                                                                (c) =>
                                                                    c.id ==
                                                                    formData.category_id
                                                            )?.name ||
                                                                "Not selected"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Pricing:
                                                        </small>
                                                        <div className="fw-semibold text-orange">
                                                            {getPricingPreview()}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Service Areas:
                                                        </small>
                                                        <div className="fw-semibold">
                                                            {formData
                                                                .service_areas
                                                                .length > 0
                                                                ? `${
                                                                      formData
                                                                          .service_areas
                                                                          .length
                                                                  } area${
                                                                      formData
                                                                          .service_areas
                                                                          .length >
                                                                      1
                                                                          ? "s"
                                                                          : ""
                                                                  } selected`
                                                                : "None selected"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row mt-2">
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Location:
                                                        </small>
                                                        <div className="fw-semibold">
                                                            {formData.location_address ||
                                                                "Not set"}
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <small className="text-muted d-block mb-1">
                                                            Images:
                                                        </small>
                                                        <div className="fw-semibold">
                                                            {
                                                                imagesPreviews.length
                                                            }{" "}
                                                            image
                                                            {imagesPreviews.length !==
                                                            1
                                                                ? "s"
                                                                : ""}{" "}
                                                            uploaded
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* General Error */}
                                    {errors.general && (
                                        <div className="alert alert-danger">
                                            <i className="fas fa-exclamation-circle me-2"></i>
                                            {errors.general}
                                        </div>
                                    )}
                                </div>

                                {/* Form Navigation */}
                                <div className="card-footer bg-light border-top">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            {currentStep > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={handlePrevious}
                                                    disabled={isSubmitting}
                                                >
                                                    <i className="fas fa-arrow-left me-2"></i>
                                                    Previous
                                                </button>
                                            )}
                                        </div>
                                        <div>
                                            {currentStep < steps.length ? (
                                                <button
                                                    type="button"
                                                    className="btn btn-orange"
                                                    onClick={handleNext}
                                                    disabled={loading}
                                                >
                                                    Next
                                                    <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    className="btn btn-orange"
                                                    disabled={
                                                        isSubmitting || loading
                                                    }
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            {isEdit
                                                                ? "Updating..."
                                                                : "Creating..."}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-save me-2"></i>
                                                            {isEdit
                                                                ? "Update Service"
                                                                : "Create Service"}
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Preview */}
                        <div className="col-lg-4">
                            <div className="sticky-top" style={{ top: "80px" }}>
                                {/* Service Preview */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-eye text-orange me-2"></i>
                                            Preview
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="service-preview">
                                            {/* Title and Category */}
                                            <div className="mb-3">
                                                <h6 className="fw-bold">
                                                    {formData.title ||
                                                        "Service Title"}
                                                </h6>
                                                {formData.category_id && (
                                                    <span className="badge bg-primary bg-opacity-10 text-primary">
                                                        {
                                                            categories.find(
                                                                (c) =>
                                                                    c.id ==
                                                                    formData.category_id
                                                            )?.name
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {formData.description && (
                                                <p className="text-muted small mb-3">
                                                    {formData.description
                                                        .length > 100
                                                        ? formData.description.substring(
                                                              0,
                                                              100
                                                          ) + "..."
                                                        : formData.description}
                                                </p>
                                            )}

                                            {/* Pricing */}
                                            <div className="pricing-preview mb-3">
                                                <div className="fw-bold text-orange h6">
                                                    {getPricingPreview()}
                                                </div>
                                                {formData.duration_hours && (
                                                    <small className="text-muted">
                                                        Duration:{" "}
                                                        {
                                                            formData.duration_hours
                                                        }{" "}
                                                        hour
                                                        {formData.duration_hours !=
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </small>
                                                )}
                                            </div>

                                            {/* Location */}
                                            {formData.location_address && (
                                                <div className="location-preview mb-3">
                                                    <small className="text-muted">
                                                        <i className="fas fa-map-marker-alt me-1"></i>
                                                        {
                                                            formData.location_address
                                                        }
                                                    </small>
                                                    <br />
                                                    <small className="text-muted">
                                                        <i className="fas fa-circle-notch me-1"></i>
                                                        Service radius:{" "}
                                                        {
                                                            formData.service_radius
                                                        }
                                                        km
                                                    </small>
                                                </div>
                                            )}

                                            {/* Service Areas */}
                                            {formData.service_areas.length >
                                                0 && (
                                                <div className="areas-preview mb-3">
                                                    <small className="text-muted d-block mb-2">
                                                        Service Areas:
                                                    </small>
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {formData.service_areas
                                                            .slice(0, 3)
                                                            .map((area) => (
                                                                <span
                                                                    key={area}
                                                                    className="badge bg-light text-dark"
                                                                >
                                                                    {area}
                                                                </span>
                                                            ))}
                                                        {formData.service_areas
                                                            .length > 3 && (
                                                            <span className="badge bg-light text-dark">
                                                                +
                                                                {formData
                                                                    .service_areas
                                                                    .length -
                                                                    3}{" "}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Images Preview */}
                                            {imagesPreviews.length > 0 && (
                                                <div className="images-preview mb-3">
                                                    <small className="text-muted d-block mb-2">
                                                        Images:
                                                    </small>
                                                    <div className="row g-2">
                                                        {imagesPreviews
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    preview,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="col-6"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                preview
                                                                            }
                                                                            alt={`Preview ${
                                                                                index +
                                                                                1
                                                                            }`}
                                                                            className="img-fluid rounded"
                                                                            style={{
                                                                                height: "60px",
                                                                                objectFit:
                                                                                    "cover",
                                                                                width: "100%",
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                    </div>
                                                    {imagesPreviews.length >
                                                        2 && (
                                                        <small className="text-muted">
                                                            +
                                                            {imagesPreviews.length -
                                                                2}{" "}
                                                            more image
                                                            {imagesPreviews.length -
                                                                2 >
                                                            1
                                                                ? "s"
                                                                : ""}
                                                        </small>
                                                    )}
                                                </div>
                                            )}

                                            {/* What's Included */}
                                            {formData.includes && (
                                                <div className="includes-preview mb-3">
                                                    <small className="text-muted d-block mb-2">
                                                        What's Included:
                                                    </small>
                                                    <div className="bg-light p-2 rounded">
                                                        <small>
                                                            {formData.includes
                                                                .length > 100
                                                                ? formData.includes.substring(
                                                                      0,
                                                                      100
                                                                  ) + "..."
                                                                : formData.includes}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Requirements */}
                                            {formData.requirements && (
                                                <div className="requirements-preview">
                                                    <small className="text-muted d-block mb-2">
                                                        Requirements:
                                                    </small>
                                                    <div className="bg-warning bg-opacity-10 p-2 rounded">
                                                        <small>
                                                            {formData
                                                                .requirements
                                                                .length > 100
                                                                ? formData.requirements.substring(
                                                                      0,
                                                                      100
                                                                  ) + "..."
                                                                : formData.requirements}
                                                        </small>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Tips Card */}
                                <div className="card border-0 shadow-sm">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-lightbulb text-warning me-2"></i>
                                            Tips for Success
                                        </h6>
                                    </div>
                                    <div className="card-body">
                                        <div className="tips-list">
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                                                <small>
                                                    Use clear, descriptive
                                                    titles that include the main
                                                    service
                                                </small>
                                            </div>
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                                                <small>
                                                    Write detailed descriptions
                                                    to help clients understand
                                                    your service
                                                </small>
                                            </div>
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                                                <small>
                                                    Add high-quality images to
                                                    showcase your work
                                                </small>
                                            </div>
                                            <div className="tip-item d-flex align-items-start mb-3">
                                                <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                                                <small>
                                                    Set competitive prices based
                                                    on your market research
                                                </small>
                                            </div>
                                            <div className="tip-item d-flex align-items-start">
                                                <i className="fas fa-check-circle text-success me-2 mt-1"></i>
                                                <small>
                                                    Include multiple service
                                                    areas to reach more clients
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* Custom Styles */}
            <style>{`
                .service-form-container {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .step-indicator {
                    transition: all 0.3s ease;
                }

                .step-icon {
                    transition: all 0.3s ease;
                }

                .bg-orange {
                    background-color: #fd7e14 !important;
                }

                .text-orange {
                    color: #fd7e14 !important;
                }

                .btn-orange {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                }

                .btn-orange:hover {
                    background-color: #e55100;
                    border-color: #e55100;
                    color: white;
                }

                .btn-orange:disabled {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    opacity: 0.65;
                }

                .progress-bar.bg-orange {
                    background-color: #fd7e14 !important;
                }

                .form-control:focus,
                .form-select:focus {
                    border-color: #fd7e14;
                    box-shadow: 0 0 0 0.2rem rgba(253, 126, 20, 0.25);
                }

                .form-check-input:checked {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                }

                .form-check-input:focus {
                    border-color: #fd7e14;
                    box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
                }

                .image-upload-label:hover {
                    border-color: #fd7e14 !important;
                    background-color: #fff3e0;
                }

                .image-preview {
                    transition: transform 0.2s ease;
                }

                .image-preview:hover {
                    transform: scale(1.02);
                }

                .service-preview {
                    min-height: 200px;
                }

                .pricing-preview {
                    padding: 0.75rem;
                    background-color: #fff3e0;
                    border-radius: 0.375rem;
                    border-left: 4px solid #fd7e14;
                }

                .areas-preview .badge {
                    font-size: 0.7rem;
                }

                .tips-list .tip-item {
                    transition: all 0.2s ease;
                    padding: 0.25rem 0;
                    border-radius: 0.25rem;
                }

                .tips-list .tip-item:hover {
                    background-color: #fff3e0;
                    padding-left: 0.5rem;
                    margin-left: -0.5rem;
                }

                .service-areas-grid .form-check {
                    padding: 0.5rem;
                    border-radius: 0.375rem;
                    transition: background-color 0.2s ease;
                }

                .service-areas-grid .form-check:hover {
                    background-color: #f8f9fa;
                }

                .service-areas-grid
                    .form-check-input:checked
                    + .form-check-label {
                    color: #fd7e14;
                    font-weight: 500;
                }

                .selected-areas .badge {
                    font-size: 0.8rem;
                    padding: 0.5rem 0.75rem;
                }

                .step-content {
                    min-height: 400px;
                }

                .sticky-top {
                    z-index: 1020;
                }

                .final-review {
                    border-left: 4px solid var(--success-color);
                }

                .includes-preview .bg-light {
                    border-left: 3px solid var(--success-color);
                }

                .requirements-preview .bg-warning {
                    border-left: 3px solid var(--warning-color);
                }

                @media (max-width: 992px) {
                    .sticky-top {
                        position: relative !important;
                        top: auto !important;
                    }
                }

                @media (max-width: 768px) {
                    .service-areas-grid .col-6 {
                        padding: 0.25rem;
                    }

                    .step-indicator .step-title {
                        font-size: 0.8rem;
                    }

                    .step-indicator .step-description {
                        display: none;
                    }

                    .step-icon {
                        width: 30px !important;
                        height: 30px !important;
                        font-size: 0.8rem;
                    }
                }

                .is-invalid {
                    border-color: #dc3545;
                }

                .invalid-feedback {
                    display: block;
                }

                .was-validated .form-control:valid,
                .was-validated .form-select:valid {
                    border-color: #198754;
                }

                .was-validated .form-control:valid:focus,
                .was-validated .form-select:valid:focus {
                    border-color: #198754;
                    box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.25);
                }

                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                .card {
                    transition: box-shadow 0.15s ease-in-out;
                }

                .card:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
                }

                .btn {
                    transition: all 0.15s ease-in-out;
                }

                .btn:hover {
                    transform: translateY(-1px);
                }

                .btn:active {
                    transform: translateY(0);
                }

                .service-areas-grid .form-check {
                    padding: 0.75rem;
                    border-radius: 0.5rem;
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                }

                .service-areas-grid .form-check:hover {
                    background-color: #fff3e0;
                    border-color: #fd7e14;
                    transform: translateY(-1px);
                }

                .service-areas-grid
                    .form-check-input:checked
                    + .form-check-label {
                    color: #fd7e14;
                    font-weight: 600;
                }

                .service-areas-grid .form-check-label {
                    cursor: pointer;
                    margin-bottom: 0;
                    width: 100%;
                    line-height: 1.3;
                }

                /* Distance badges */
                .service-areas-grid .badge {
                    font-size: 0.65rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 1rem;
                    white-space: nowrap;
                }

                /* Selected areas badges */
                .selected-areas .badge {
                    font-size: 0.8rem;
                    padding: 0.6rem 0.8rem;
                    border-radius: 1.5rem;
                    border: 1px solid rgba(253, 126, 20, 0.3);
                    transition: all 0.2s ease;
                }

                .selected-areas .badge:hover {
                    background-color: rgba(253, 126, 20, 0.2) !important;
                    transform: scale(1.02);
                }

                .selected-areas .btn-close {
                    background: none;
                    opacity: 0.7;
                    transition: opacity 0.2s ease;
                }

                .selected-areas .btn-close:hover {
                    opacity: 1;
                    transform: scale(1.1);
                }

                /* Loading states */
                .spinner-border.text-primary {
                    color: #fd7e14 !important;
                }

                /* Info alert styling */
                .alert-info {
                    background-color: rgba(13, 110, 253, 0.1);
                    border-color: rgba(13, 110, 253, 0.2);
                    color: #084298;
                }

                /* Enhanced checkbox styling */
                .service-areas-grid .form-check-input {
                    width: 1.2em;
                    height: 1.2em;
                    margin-top: 0.1em;
                    border-radius: 0.25em;
                    border: 2px solid #dee2e6;
                    transition: all 0.15s ease-in-out;
                }

                .service-areas-grid .form-check-input:focus {
                    border-color: #fd7e14;
                    box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
                }

                .service-areas-grid .form-check-input:checked {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                }

                .service-areas-grid .form-check-input:checked:focus {
                    box-shadow: 0 0 0 0.25rem rgba(253, 126, 20, 0.25);
                }

                /* Button enhancements */
                .btn-outline-primary.btn-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.875rem;
                    border-radius: 0.375rem;
                    transition: all 0.15s ease;
                }

                .btn-outline-primary:hover {
                    background-color: #fd7e14;
                    border-color: #fd7e14;
                    color: white;
                    transform: translateY(-1px);
                }

                /* Empty state styling */
                .text-center.py-4 {
                    padding: 2rem 1rem !important;
                }

                .text-center.py-4 .fa-map-marker-alt {
                    opacity: 0.5;
                }

                .btn-link {
                    color: #fd7e14;
                    text-decoration: none;
                }

                .btn-link:hover {
                    color: #e55100;
                    text-decoration: underline;
                }

                /* Responsive improvements */
                @media (max-width: 768px) {
                    .service-areas-grid .form-check {
                        padding: 0.5rem;
                        margin-bottom: 0.5rem;
                    }

                    .service-areas-grid .form-check-label {
                        font-size: 0.9rem;
                    }

                    .service-areas-grid .badge {
                        font-size: 0.6rem;
                        padding: 0.2rem 0.4rem;
                    }

                    .selected-areas .badge {
                        font-size: 0.75rem;
                        padding: 0.4rem 0.6rem;
                        margin-bottom: 0.5rem;
                    }

                    .d-flex.justify-content-between {
                        flex-direction: column;
                        align-items: flex-start !important;
                        gap: 0.5rem;
                    }

                    .btn-outline-primary.btn-sm {
                        width: 100%;
                        margin-top: 0.5rem;
                    }
                }

                /* Animation for loading areas */
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .service-areas-grid .form-check {
                    animation: fadeInUp 0.3s ease forwards;
                }

                .service-areas-grid .form-check:nth-child(1) {
                    animation-delay: 0.05s;
                }
                .service-areas-grid .form-check:nth-child(2) {
                    animation-delay: 0.1s;
                }
                .service-areas-grid .form-check:nth-child(3) {
                    animation-delay: 0.15s;
                }
                .service-areas-grid .form-check:nth-child(4) {
                    animation-delay: 0.2s;
                }
                .service-areas-grid .form-check:nth-child(5) {
                    animation-delay: 0.25s;
                }
                .service-areas-grid .form-check:nth-child(6) {
                    animation-delay: 0.3s;
                }

                /* Improved spacing */
                .selected-areas {
                    background-color: #f8f9fa;
                    padding: 1rem;
                    border-radius: 0.5rem;
                    border-left: 4px solid #fd7e14;
                }

                .alert-info {
                    border-left: 4px solid #0d6efd;
                }

                .enhanced-location-selector .search-results {
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                    background: white;
                }

                .search-result-item:hover {
                    background-color: #f8f9fa;
                }

                .search-result-item:last-child {
                    border-bottom: none !important;
                }

                .nearby-place-item {
                    transition: all 0.2s ease;
                }

                .nearby-place-item:hover {
                    background-color: #e9ecef !important;
                    transform: translateY(-1px);
                }

                .leaflet-container {
                    border-radius: 0.375rem;
                }

                /* Override Leaflet popup styles */
                .leaflet-popup-content-wrapper {
                    border-radius: 0.375rem;
                }

                .leaflet-popup-tip {
                    background: white;
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ServiceForm;
