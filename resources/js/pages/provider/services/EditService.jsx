import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LocationSelector from "../../../components/map/LocationSelector";
import { useLocation } from "../../../context/LocationContext";

const EditService = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateService, getService, getServiceCategories, loading } =
        useServices();
    const { businessStats } = useProvider();

    const [currentStep, setCurrentStep] = useState(1);
    const [serviceLoading, setServiceLoading] = useState(true);
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
        existing_images: [], // For tracking existing images
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [imagesPreviews, setImagesPreviews] = useState([]);
    const [existingImagesPreviews, setExistingImagesPreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalService, setOriginalService] = useState(null);

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

    const {
        nearbyAreas,
        loading: locationLoading,
        getNearbyServiceAreas,
        getAllServiceAreas,
    } = useLocation();

    const [showAllAreas, setShowAllAreas] = useState(false);
    const [dynamicAreas, setDynamicAreas] = useState([]);

    useEffect(() => {
        loadCategories();
        loadServiceData();
    }, [id]);

    // Watch for location changes to update service areas
    useEffect(() => {
        if (formData.latitude && formData.longitude && currentStep === 3) {
            loadNearbyAreas();
        }
    }, [formData.latitude, formData.longitude, currentStep]);

    // Initialize dynamic areas when stepping into step 3
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
        setServiceLoading(true);
        try {
            const result = await getService(id);

            if (result.success) {
                const service = result.data;
                setOriginalService(service);

                // Populate form data
                setFormData({
                    title: service.title,
                    description: service.description,
                    category_id: service.category_id.toString(),
                    pricing_type: service.pricing_type,
                    base_price: service.base_price.toString(),
                    duration_hours: service.duration_hours.toString(),
                    latitude: service.latitude,
                    longitude: service.longitude,
                    location_address: service.location_address,
                    location_city: service.location_city,
                    location_neighborhood: service.location_neighborhood,
                    service_radius: service.service_radius,
                    service_areas: service.service_areas,
                    requirements: service.requirements || "",
                    includes: service.includes || "",
                    service_images: [],
                    custom_pricing_description:
                        service.custom_pricing_description || "",
                    existing_images: service.existing_images,
                });

                // Set existing images previews
                setExistingImagesPreviews(
                    service.existing_images.map((img) => ({
                        url: img,
                        isExisting: true,
                    }))
                );
            } else {
                setErrors({
                    general: result.message || "Failed to load service data",
                });
            }
        } catch (error) {
            console.error("Error loading service:", error);
            setErrors({ general: "Failed to load service data" });
        } finally {
            setServiceLoading(false);
        }
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
        const totalImages =
            formData.service_images.length + existingImagesPreviews.length;

        if (files.length + totalImages > 5) {
            setErrors((prev) => ({
                ...prev,
                service_images: "You can upload maximum 5 images total",
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
                newPreviews.push({
                    url: e.target.result,
                    isExisting: false,
                });
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

    const removeNewImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            service_images: prev.service_images.filter((_, i) => i !== index),
        }));
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setExistingImagesPreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            existing_images: prev.existing_images.filter((_, i) => i !== index),
        }));
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

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => prev + 1);
            window.scrollTo(0, 0);
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!validateStep(currentStep)) {
            setIsSubmitting(false);
            return;
        }

        const submitData = new FormData();

        // Add all form fields
        Object.keys(formData).forEach((key) => {
            if (key === "service_areas") {
                // Send as JSON string for easier backend processing
                submitData.append(
                    "service_areas",
                    JSON.stringify(formData[key])
                );
            } else if (key === "service_images") {
                formData[key].forEach((image, index) => {
                    submitData.append(`service_images[]`, image); // Use array notation
                });
            } else if (key === "existing_images") {
                // Send existing images that should be kept
                const keptImages = existingImagesPreviews.map((img) => img.url);
                submitData.append(
                    "existing_images",
                    JSON.stringify(keptImages)
                );
            } else if (
                formData[key] !== null &&
                formData[key] !== undefined &&
                formData[key] !== ""
            ) {
                submitData.append(key, formData[key]);
            }
        });

        // DEBUG: Log the FormData
        // console.log("=== UPDATE FORM DATA BEING SENT ===");
        for (let [key, value] of submitData.entries()) {
            // console.log(`${key}:`, value);
        }
        // console.log("=== END UPDATE FORM DATA ===");

        try {
            const result = await updateService(id, submitData);
            // console.log("=== UPDATE RESPONSE ===", result);

            if (result.success) {
                navigate("/provider/services", {
                    state: {
                        message: "Service updated successfully!",
                        type: "success",
                    },
                });
            } else {
                // console.log("=== UPDATE VALIDATION ERRORS ===", result.errors);
                setErrors(result.errors || { general: result.message });
                // Navigate to the step with errors
                if (result.errors) {
                    if (
                        result.errors.title ||
                        result.errors.description ||
                        result.errors.category_id
                    ) {
                        setCurrentStep(1);
                    } else if (
                        result.errors.latitude ||
                        result.errors.location_address
                    ) {
                        setCurrentStep(2);
                    } else if (result.errors.service_areas) {
                        setCurrentStep(3);
                    }
                }
            }
        } catch (error) {
            // console.error("=== UPDATE SUBMISSION ERROR ===", error);
            setErrors({
                general: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                console.log("Nearby areas loaded:", areas.nearby_areas);
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
            try {
                const allAreas = await getAllServiceAreas();
                if (allAreas) {
                    setDynamicAreas(allAreas.map((area) => ({ name: area })));
                } else {
                    // Final fallback to hardcoded areas
                    setDynamicAreas(
                        sriLankanAreas.map((area) => ({ name: area }))
                    );
                }
            } catch (error) {
                console.error("Error loading all areas:", error);
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

    const hasChanges = () => {
        if (!originalService) return false;

        return (
            formData.title !== originalService.title ||
            formData.description !== originalService.description ||
            formData.category_id !== originalService.category_id.toString() ||
            formData.pricing_type !== originalService.pricing_type ||
            formData.base_price !== originalService.base_price.toString() ||
            formData.duration_hours !==
                originalService.duration_hours.toString() ||
            formData.latitude !== originalService.latitude ||
            formData.longitude !== originalService.longitude ||
            formData.location_address !== originalService.location_address ||
            formData.service_radius !== originalService.service_radius ||
            JSON.stringify(formData.service_areas) !==
                JSON.stringify(originalService.service_areas) ||
            formData.includes !== originalService.includes ||
            formData.requirements !== originalService.requirements ||
            formData.service_images.length > 0 ||
            existingImagesPreviews.length !==
                originalService.existing_images.length
        );
    };

    if (serviceLoading) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "400px" }}
                >
                    <div className="text-center">
                        <div
                            className="spinner-border text-orange mb-3"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading service data...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="edit-service-container">
                {/* Header */}
                <div className="form-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <nav aria-label="breadcrumb" className="mb-2">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item">
                                        <Link
                                            to="/provider/services"
                                            className="text-orange text-decoration-none"
                                        >
                                            My Services
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link
                                            to={`/provider/services/${id}`}
                                            className="text-orange text-decoration-none"
                                        >
                                            {formData.title || "Service"}
                                        </Link>
                                    </li>
                                    <li className="breadcrumb-item active">
                                        Edit
                                    </li>
                                </ol>
                            </nav>
                            <h4 className="fw-bold mb-1">
                                <i className="fas fa-edit text-orange me-2"></i>
                                Edit Service
                            </h4>
                            <p className="text-muted mb-0">
                                Update your service details and pricing
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <Link
                                to={`/provider/services/${id}`}
                                className="btn btn-outline-secondary"
                            >
                                <i className="fas fa-times me-2"></i>
                                Cancel
                            </Link>
                            {hasChanges() && (
                                <span className="badge bg-warning">
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    Unsaved Changes
                                </span>
                            )}
                        </div>
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
                {/* Form Content with Defensive Safety Measures */}
                <form
                    onSubmit={(e) => {
                        // console.log("=== FORM SUBMIT TRIGGERED ===");
                        // console.log("Submit event target:", e.target);
                        // console.log("Current step:", currentStep);
                        // console.log("Is submitting:", isSubmitting);

                        // Only allow submission on the final step
                        if (currentStep !== 4) {
                            // console.log("=== PREVENTING EARLY SUBMISSION ===");
                            e.preventDefault();
                            e.stopPropagation();
                            return false;
                        }

                        handleSubmit(e);
                    }}
                    noValidate
                >
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
                                                            {categories.map(
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

                                    {/* Step 2: Service Location - DEFENSIVE WRAPPER */}
                                    {currentStep === 2 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map-marker-alt text-orange me-2"></i>
                                                    Update your service location
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Modify your service location
                                                    and coverage radius. This
                                                    helps clients find you based
                                                    on their location.
                                                </p>
                                            </div>

                                            {/* DEFENSIVE WRAPPER FOR LOCATION SELECTOR */}
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    return false;
                                                }}
                                                onKeyDown={(e) => {
                                                    // Prevent Enter key from submitting form
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                    }
                                                }}
                                            >
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
                                                    onChange={
                                                        handleLocationChange
                                                    }
                                                    error={
                                                        errors.location ||
                                                        errors.location_address
                                                    }
                                                />
                                            </div>

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

                                    {/* Step 3: Service Areas */}
                                    {/* {currentStep === 3 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map text-orange me-2"></i>
                                                    Update service areas
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Select all areas where you
                                                    provide your services. This
                                                    helps clients know if you're
                                                    available in their location.
                                                </p>
                                            </div>

                                            <div className="service-areas-grid">
                                                <div className="row">
                                                    {sriLankanAreas.map(
                                                        (area) => (
                                                            <div
                                                                key={area}
                                                                className="col-md-4 col-6 mb-2"
                                                            >
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id={`area-${area}`}
                                                                        checked={formData.service_areas.includes(
                                                                            area
                                                                        )}
                                                                        onChange={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            handleServiceAreasChange(
                                                                                area
                                                                            );
                                                                        }}
                                                                    />
                                                                    <label
                                                                        className="form-check-label"
                                                                        htmlFor={`area-${area}`}
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                        }}
                                                                    >
                                                                        {area}
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {errors.service_areas && (
                                                <div className="alert alert-danger mt-3">
                                                    <i className="fas fa-exclamation-circle me-2"></i>
                                                    {errors.service_areas}
                                                </div>
                                            )}

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
                                                            (area) => (
                                                                <span
                                                                    key={area}
                                                                    className="badge bg-orange bg-opacity-10 text-orange px-3 py-2"
                                                                >
                                                                    {area}
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
                                                                    ></button>
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )} */}
                                    {currentStep === 3 && (
                                        <div className="step-content">
                                            <div className="mb-4">
                                                <h6 className="fw-semibold mb-3">
                                                    <i className="fas fa-map text-orange me-2"></i>
                                                    Update service areas
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
                                                        {(dynamicAreas.length >
                                                        0
                                                            ? dynamicAreas
                                                            : sriLankanAreas.map(
                                                                  (area) => ({
                                                                      name: area,
                                                                  })
                                                              )
                                                        ).map((area, index) => (
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
                                                        ))}
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
                                                    <strong>Tip:</strong> Your
                                                    service location determines
                                                    nearby areas automatically.
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
                                                    Update Additional Details &
                                                    Images
                                                </h6>
                                                <p className="text-muted mb-3">
                                                    Modify service details and
                                                    manage your service images.
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

                                            {/* Existing Images */}
                                            {existingImagesPreviews.length >
                                                0 && (
                                                <div className="existing-images mb-4">
                                                    <h6 className="fw-semibold mb-3">
                                                        Current Service Images
                                                    </h6>
                                                    <div className="row">
                                                        {existingImagesPreviews.map(
                                                            (image, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="col-md-3 col-6 mb-3"
                                                                >
                                                                    <div className="image-preview position-relative">
                                                                        <img
                                                                            src={
                                                                                image.url
                                                                            }
                                                                            alt={`Current ${
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
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.target.src =
                                                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d'%3EImage%3C/text%3E%3C/svg%3E";
                                                                            }}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-danger btn-sm position-absolute top-0 end-0 m-1"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();
                                                                                e.stopPropagation();
                                                                                removeExistingImage(
                                                                                    index
                                                                                );
                                                                            }}
                                                                            style={{
                                                                                fontSize:
                                                                                    "0.7rem",
                                                                            }}
                                                                        >
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                        <div className="position-absolute bottom-0 start-0 m-1">
                                                                            <span className="badge bg-success">
                                                                                <i className="fas fa-check me-1"></i>
                                                                                Current
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* New Image Upload */}
                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">
                                                    Add New Images (Optional)
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                    >
                                                        <i className="fas fa-cloud-upload-alt fa-2x text-muted mb-2"></i>
                                                        <div className="h6">
                                                            Click to upload new
                                                            images
                                                        </div>
                                                        <small className="text-muted">
                                                            Upload up to{" "}
                                                            {5 -
                                                                existingImagesPreviews.length}{" "}
                                                            more images (Max 2MB
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
                                                        <div className="new-images mt-3">
                                                            <h6 className="fw-semibold mb-2">
                                                                New Images to
                                                                Upload (
                                                                {
                                                                    imagesPreviews.length
                                                                }
                                                                ):
                                                            </h6>
                                                            <div className="row">
                                                                {imagesPreviews.map(
                                                                    (
                                                                        image,
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
                                                                                        image.url
                                                                                    }
                                                                                    alt={`New ${
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
                                                                                    onClick={(
                                                                                        e
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        e.stopPropagation();
                                                                                        removeNewImage(
                                                                                            index
                                                                                        );
                                                                                    }}
                                                                                    style={{
                                                                                        fontSize:
                                                                                            "0.7rem",
                                                                                    }}
                                                                                >
                                                                                    <i className="fas fa-times"></i>
                                                                                </button>
                                                                                <div className="position-absolute bottom-0 start-0 m-1">
                                                                                    <span className="badge bg-info">
                                                                                        <i className="fas fa-plus me-1"></i>
                                                                                        New
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-3">
                                                    <small className="text-muted">
                                                        <i className="fas fa-info-circle me-1"></i>
                                                        Total images:{" "}
                                                        {existingImagesPreviews.length +
                                                            imagesPreviews.length}
                                                        /5
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Changes Summary */}
                                            {hasChanges() && (
                                                <div className="changes-summary mt-4 p-3 bg-warning bg-opacity-10 rounded border-start border-warning border-3">
                                                    <h6 className="fw-semibold mb-3">
                                                        <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                                                        Changes Summary
                                                    </h6>
                                                    <div className="changes-list small">
                                                        {formData.title !==
                                                            originalService?.title && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-edit text-info me-2"></i>
                                                                Service title
                                                                updated
                                                            </div>
                                                        )}
                                                        {formData.description !==
                                                            originalService?.description && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-edit text-info me-2"></i>
                                                                Description
                                                                updated
                                                            </div>
                                                        )}
                                                        {formData.base_price !==
                                                            originalService?.base_price.toString() && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-dollar-sign text-success me-2"></i>
                                                                Pricing updated
                                                            </div>
                                                        )}
                                                        {JSON.stringify(
                                                            formData.service_areas
                                                        ) !==
                                                            JSON.stringify(
                                                                originalService?.service_areas
                                                            ) && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-map text-primary me-2"></i>
                                                                Service areas
                                                                updated
                                                            </div>
                                                        )}
                                                        {formData.service_images
                                                            .length > 0 && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-images text-warning me-2"></i>
                                                                {
                                                                    formData
                                                                        .service_images
                                                                        .length
                                                                }{" "}
                                                                new image
                                                                {formData
                                                                    .service_images
                                                                    .length > 1
                                                                    ? "s"
                                                                    : ""}{" "}
                                                                to upload
                                                            </div>
                                                        )}
                                                        {existingImagesPreviews.length !==
                                                            originalService
                                                                ?.existing_images
                                                                .length && (
                                                            <div className="change-item mb-1">
                                                                <i className="fas fa-trash text-danger me-2"></i>
                                                                {originalService
                                                                    ?.existing_images
                                                                    .length -
                                                                    existingImagesPreviews.length}{" "}
                                                                image
                                                                {originalService
                                                                    ?.existing_images
                                                                    .length -
                                                                    existingImagesPreviews.length >
                                                                1
                                                                    ? "s"
                                                                    : ""}{" "}
                                                                to remove
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handlePrevious();
                                                    }}
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
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleNext();
                                                    }}
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
                                                        isSubmitting ||
                                                        loading ||
                                                        !hasChanges()
                                                    }
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-save me-2"></i>
                                                            Update Service
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
                                {/* Updated Service Preview */}
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-header bg-white border-bottom">
                                        <h6 className="mb-0 fw-bold">
                                            <i className="fas fa-eye text-orange me-2"></i>
                                            Updated Preview
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
                                            {(existingImagesPreviews.length >
                                                0 ||
                                                imagesPreviews.length > 0) && (
                                                <div className="images-preview mb-3">
                                                    <small className="text-muted d-block mb-2">
                                                        Images:
                                                    </small>
                                                    <div className="row g-2">
                                                        {existingImagesPreviews
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    image,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={`existing-${index}`}
                                                                        className="col-6"
                                                                    >
                                                                        <img
                                                                            src={
                                                                                image.url
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
                                                                            onError={(
                                                                                e
                                                                            ) => {
                                                                                e.target.src =
                                                                                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f8f9fa'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%236c757d'%3EImg%3C/text%3E%3C/svg%3E";
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )
                                                            )}
                                                        {existingImagesPreviews.length <
                                                            2 &&
                                                            imagesPreviews
                                                                .slice(
                                                                    0,
                                                                    2 -
                                                                        existingImagesPreviews.length
                                                                )
                                                                .map(
                                                                    (
                                                                        image,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={`new-${index}`}
                                                                            className="col-6"
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    image.url
                                                                                }
                                                                                alt={`New Preview ${
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
                                                    <small className="text-muted">
                                                        Total:{" "}
                                                        {existingImagesPreviews.length +
                                                            imagesPreviews.length}{" "}
                                                        image
                                                        {existingImagesPreviews.length +
                                                            imagesPreviews.length !==
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </small>
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

                                {/* Change Indicator */}
                                {hasChanges() && (
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-warning bg-opacity-10 border-bottom border-warning">
                                            <h6 className="mb-0 fw-bold text-warning">
                                                <i className="fas fa-exclamation-triangle me-2"></i>
                                                Unsaved Changes
                                            </h6>
                                        </div>
                                        <div className="card-body">
                                            <p className="small text-muted mb-3">
                                                You have unsaved changes. Make
                                                sure to save your updates before
                                                leaving this page.
                                            </p>
                                            <div className="d-grid gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-warning btn-sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setCurrentStep(4);
                                                    }}
                                                >
                                                    <i className="fas fa-save me-2"></i>
                                                    Go to Save
                                                </button>
                                                <Link
                                                    to={`/provider/services/${id}`}
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={(e) => {
                                                        if (
                                                            hasChanges() &&
                                                            !window.confirm(
                                                                "You have unsaved changes. Are you sure you want to leave?"
                                                            )
                                                        ) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <i className="fas fa-times me-2"></i>
                                                    Discard Changes
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Global Form Event Protection */}
                    <div style={{ display: "none" }}>
                        {/* Hidden elements to catch any accidental submissions */}
                        <input
                            type="submit"
                            style={{ display: "none" }}
                            disabled
                        />
                    </div>
                </form>

                {/* Additional Safety Styles */}
                <style>{`
                    /* Prevent any button without explicit type from submitting */
                    form button:not([type]) {
                        type: button !important;
                    }

                    /* Ensure all interactive elements stop propagation */
                    .location-selector * {
                        pointer-events: auto;
                    }

                    .location-selector button {
                        type: button !important;
                    }

                    /* Additional safety for form elements */
                    .form-check-input,
                    .form-check-label,
                    .btn-close,
                    .image-upload-label {
                        pointer-events: auto;
                    }

                    /* Prevent Enter key submission in non-submit contexts */
                    .step-content input:not([type="submit"]),
                    .step-content textarea,
                    .step-content select {
                        /* Allow normal behavior but ensure no accidental submission */
                    }

                    /* Visual feedback for defensive elements */
                    .location-selector {
                        border: 1px solid transparent;
                        border-radius: 0.375rem;
                        transition: border-color 0.2s ease;
                    }

                    .location-selector:hover {
                        border-color: rgba(253, 126, 20, 0.3);
                    }

                    /* Ensure all buttons have proper styling */
                    button[type="button"] {
                        cursor: pointer;
                    }

                    /* Safety indicator for debugging */
                    .step-content[data-step="2"] {
                        position: relative;
                    }

                    .step-content[data-step="2"]::before {
                        content: "";
                        position: absolute;
                        top: -2px;
                        left: -2px;
                        right: -2px;
                        bottom: -2px;
                        border: 2px solid transparent;
                        border-radius: 0.5rem;
                        pointer-events: none;
                        transition: border-color 0.2s ease;
                    }

                    /* Form validation enhancements */
                    .is-invalid {
                        border-color: #dc3545 !important;
                    }

                    .invalid-feedback {
                        display: block !important;
                    }

                    /* Button state management */
                    .btn:disabled {
                        opacity: 0.65;
                        pointer-events: none;
                    }

                    /* Ensure proper focus management */
                    .btn:focus,
                    .form-control:focus,
                    .form-select:focus {
                        outline: none;
                        box-shadow: 0 0 0 0.2rem rgba(253, 126, 20, 0.25);
                    }

                    /* Orange theme consistency */
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

                    /* Pricing preview styling */
                    .pricing-preview {
                        padding: 0.75rem;
                        background-color: #fff3e0;
                        border-radius: 0.375rem;
                        border-left: 4px solid #fd7e14;
                    }

                    /* Badge styling */
                    .badge {
                        font-size: 0.75rem;
                        padding: 0.35em 0.65em;
                    }

                    /* Loading spinner */
                    .spinner-border-sm {
                        width: 1rem;
                        height: 1rem;
                    }

                    /* Card hover effects */
                    .card {
                        transition: box-shadow 0.15s ease-in-out;
                    }

                    .card:hover {
                        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
                    }

                    /* Responsive adjustments */
                    @media (max-width: 992px) {
                        .sticky-top {
                            position: relative !important;
                            top: auto !important;
                        }
                    }

                    @media (max-width: 768px) {
                        .btn {
                            padding: 0.5rem 1rem;
                            font-size: 0.9rem;
                        }

                        .card-body {
                            padding: 1rem;
                        }
                    }
                `}</style>
            </div>

            {/* Custom Styles */}
            <style>{`
                .edit-service-container {
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

                .breadcrumb-item.active {
                    color: #6c757d;
                }

                .breadcrumb-item + .breadcrumb-item::before {
                    color: #fd7e14;
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

                .changes-summary {
                    border-left: 4px solid #ffc107;
                }

                .change-item {
                    padding: 0.25rem 0;
                }

                .includes-preview .bg-light {
                    border-left: 3px solid #198754;
                }

                .requirements-preview .bg-warning {
                    border-left: 3px solid #ffc107;
                }

                .existing-images .image-preview {
                    border: 2px solid #198754;
                }

                .new-images .image-preview {
                    border: 2px solid #0dcaf0;
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

                    .form-header .d-flex {
                        flex-direction: column;
                        gap: 1rem;
                    }

                    .form-header .col-md-4 {
                        text-align: left !important;
                    }
                }

                /* Enhanced form validation styles */
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

                /* Loading states */
                .spinner-border-sm {
                    width: 1rem;
                    height: 1rem;
                }

                /* Card enhancements */
                .card {
                    transition: box-shadow 0.15s ease-in-out;
                }

                .card:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
                }

                /* Button enhancements */
                .btn {
                    transition: all 0.15s ease-in-out;
                }

                .btn:hover {
                    transform: translateY(-1px);
                }

                .btn:active {
                    transform: translateY(0);
                }

                /* Badge styling */
                .badge {
                    font-size: 0.75rem;
                    padding: 0.35em 0.65em;
                }

                /* Alert styling */
                .alert {
                    border: none;
                    border-left: 4px solid;
                }

                .alert-danger {
                    border-left-color: #dc3545;
                    background-color: rgba(220, 53, 69, 0.1);
                }

                .alert-warning {
                    border-left-color: #ffc107;
                    background-color: rgba(255, 193, 7, 0.1);
                }

                .alert-info {
                    border-left-color: #0dcaf0;
                    background-color: rgba(13, 202, 240, 0.1);
                }

                /* Image container styling */
                .image-preview .badge {
                    font-size: 0.6rem;
                    padding: 0.25em 0.5em;
                }

                /* Changes indicator */
                .changes-summary .change-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }

                .changes-summary .change-item:last-child {
                    margin-bottom: 0;
                }

                /* Unsaved changes warning */
                .card-header.bg-warning {
                    background-color: rgba(255, 193, 7, 0.1) !important;
                }

                /* Form text styling */
                .form-text {
                    font-size: 0.8rem;
                    color: #6c757d;
                }

                /* Responsive image grid */
                @media (max-width: 576px) {
                    .existing-images .col-6,
                    .new-images .col-6 {
                        margin-bottom: 0.5rem;
                    }

                    .image-preview img {
                        height: 80px !important;
                    }

                    .service-preview img {
                        height: 40px !important;
                    }
                }

                /* Enhanced hover effects */
                .form-check:hover {
                    background-color: rgba(253, 126, 20, 0.05);
                    border-radius: 0.25rem;
                }

                .selected-areas .badge:hover {
                    background-color: rgba(253, 126, 20, 0.2) !important;
                    cursor: pointer;
                }

                /* Improved spacing */
                .mb-3:last-child {
                    margin-bottom: 0 !important;
                }

                /* Better visual hierarchy */
                .card-header h6 {
                    margin-bottom: 0;
                    font-weight: 600;
                }

                .fw-semibold {
                    font-weight: 600;
                }

                /* Enhanced breadcrumb */
                .breadcrumb {
                    background-color: transparent;
                    padding: 0;
                    margin-bottom: 0.5rem;
                }

                .breadcrumb-item a {
                    text-decoration: none;
                }

                .breadcrumb-item a:hover {
                    text-decoration: underline;
                }

                /* Progress bar enhancements */
                .progress {
                    background-color: #f8f9fa;
                    border-radius: 1rem;
                }

                .progress-bar {
                    border-radius: 1rem;
                    transition: width 0.6s ease;
                }

                /* Step navigation enhancements */
                .card-footer {
                    background-color: #f8f9fa !important;
                }

                .card-footer .btn {
                    min-width: 120px;
                }

                /* Image upload area enhancements */
                .image-upload-area {
                    position: relative;
                }

                .image-upload-label {
                    transition: all 0.3s ease;
                }

                .image-upload-label:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                /* Service preview enhancements */
                .service-preview .pricing-preview {
                    transition: all 0.2s ease;
                }

                .service-preview .pricing-preview:hover {
                    background-color: rgba(253, 126, 20, 0.15);
                }

                /* Better visual feedback for interactions */
                .btn:focus {
                    box-shadow: 0 0 0 0.2rem rgba(253, 126, 20, 0.25);
                }

                .form-control:focus,
                .form-select:focus {
                    box-shadow: 0 0 0 0.2rem rgba(253, 126, 20, 0.25);
                }

                /* Smooth transitions for all interactive elements */
                * {
                    transition: border-color 0.15s ease-in-out,
                        box-shadow 0.15s ease-in-out;
                }

                /* Final responsive touch-ups */
                @media (max-width: 480px) {
                    .step-content {
                        min-height: 300px;
                    }

                    .btn {
                        padding: 0.5rem 1rem;
                        font-size: 0.9rem;
                    }

                    .card-body {
                        padding: 1rem;
                    }

                    .badge {
                        font-size: 0.7rem;
                        padding: 0.25em 0.5em;
                    }
                }
            `}</style>
        </ProviderLayout>
    );
};

export default EditService;
