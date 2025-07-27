import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";

// Reuse components from ServiceForm
import ProgressIndicator from "../../../components/provider/services/ProgressIndicator";
import BasicInfoStep from "../../../components/provider/services/BasicInfoStep";
import LocationStep from "../../../components/provider/services/LocationStep";
import ServiceAreasStep from "../../../components/provider/services/ServiceAreasStep";
import DetailsStep from "../../../components/provider/services/DetailsStep";
import ServicePreview from "../../../components/provider/services/ServicePreview";
import TipsCard from "../../../components/provider/services/TipsCard";

// Reuse hooks from ServiceForm
import { useServiceForm } from "../../../hooks/useServiceForm";
import { useServiceAreasSimple } from "../../../hooks/provider/useServiceAreasSimple";
import { useServiceFormValidation } from "../../../hooks/useServiceFormValidation";

const EditService = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { updateService, getService, getServiceCategories, loading } =
        useServices();
    const { businessStats } = useProvider();

    const [serviceLoading, setServiceLoading] = useState(true);
    const [error, setError] = useState(null);
    const [originalService, setOriginalService] = useState(null);

    // Use the same custom hooks as ServiceForm but in edit mode
    const {
        formData,
        setFormData,
        currentStep,
        setCurrentStep,
        imagesPreviews,
        setImagesPreviews,
        handleInputChange,
        handleImageUpload,
        removeImage,
        isSubmitting,
        setIsSubmitting,
        showAllAreas,
        setShowAllAreas,
        dynamicAreas,
        setDynamicAreas,
        getPricingPreview,
        getNearbyServiceAreas,
        getAllServiceAreas,
    } = useServiceForm(true, id); // true = isEdit mode, id = serviceId

    const {
        nearbyAreas,
        selectedAreas,
        setSelectedAreas,
        handleAreaSelection,
        loadNearbyAreas,
        isLoading: areasLoading,
    } = useServiceAreasSimple(formData?.latitude, formData?.longitude);

    const { validateStep } = useServiceFormValidation();

    const [categories, setCategories] = useState([]);
    const [existingImagesPreviews, setExistingImagesPreviews] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

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
            title: "Details",
            icon: "fas fa-list-ul",
            description: "Additional information",
        },
    ];

    // Load service data and categories on mount
    useEffect(() => {
        Promise.all([loadServiceData(), loadCategories()]);
    }, [id]);

    // Note: loadNearbyAreas is now handled automatically by useServiceAreasSimple hook with debouncing

    const loadCategories = async () => {
        const result = await getServiceCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    const loadServiceData = async () => {
        setServiceLoading(true);
        setError(null);
        try {
            const result = await getService(id);
            if (result.success) {
                const service = result.data;
                setOriginalService(service);

                // Transform the service data to match our form structure
                const transformedData = {
                    title: service.title || "",
                    description: service.description || "",
                    category_id: service.category_id || "",
                    pricing_type: service.pricing_type || "fixed",
                    base_price: service.base_price || "",
                    duration_hours: service.duration_hours || "",
                    latitude: service.latitude || null,
                    longitude: service.longitude || null,
                    location_address: service.location_address || "",
                    location_city: service.location_city || "",
                    location_neighborhood: service.location_neighborhood || "",
                    service_radius: service.service_radius || 10,
                    service_areas: service.service_areas || [],
                    requirements: service.requirements || "",
                    includes: service.includes || "",
                    custom_pricing_description:
                        service.custom_pricing_description || "",
                    existing_images: service.existing_images || [],
                    service_images: [], // New images to upload
                };

                setFormData(transformedData);
                setSelectedAreas(service.service_areas || []);

                // Set existing images previews
                if (
                    service.existing_images &&
                    service.existing_images.length > 0
                ) {
                    setExistingImagesPreviews(service.existing_images);
                }
            } else {
                setError(result.message || "Failed to load service");
            }
        } catch (err) {
            console.error("Error loading service:", err);
            setError("Failed to load service");
        } finally {
            setServiceLoading(false);
        }
    };

    const handleLocationSelect = (locationData) => {
        setFormData((prev) => ({
            ...prev,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            location_address: locationData.address,
            location_city: locationData.city || "",
            location_neighborhood: locationData.neighborhood || "",
        }));
    };

    const removeExistingImage = (index) => {
        setExistingImagesPreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            existing_images: prev.existing_images.filter((_, i) => i !== index),
        }));
    };

    const validateForm = (formData, selectedAreas) => {
        let allErrors = {};

        // Validate all steps
        for (let step = 1; step <= 4; step++) {
            const stepValidation = validateStep(step, formData);
            if (!stepValidation.isValid) {
                allErrors = { ...allErrors, ...stepValidation.errors };
            }
        }

        // Validate service areas
        if (!selectedAreas || selectedAreas.length === 0) {
            allErrors.service_areas = "Please select at least one service area";
        }

        setValidationErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    };

    const handleStepValidation = (stepNumber) => {
        const stepValidation = validateStep(stepNumber, formData);
        if (!stepValidation.isValid) {
            setValidationErrors(stepValidation.errors);
            return false;
        }

        // Additional validation for step 3 (service areas)
        if (
            stepNumber === 3 &&
            (!selectedAreas || selectedAreas.length === 0)
        ) {
            setValidationErrors({
                service_areas: "Please select at least one service area",
            });
            return false;
        }

        setValidationErrors({});
        return true;
    };

    const handleNext = () => {
        if (handleStepValidation(currentStep)) {
            if (currentStep < steps.length) {
                setCurrentStep(currentStep + 1);
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm(formData, selectedAreas)) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare form data for submission
            const submitData = new FormData();

            // Basic information
            submitData.append("title", formData.title);
            submitData.append("description", formData.description);
            submitData.append("category_id", formData.category_id);
            submitData.append("pricing_type", formData.pricing_type);
            submitData.append("base_price", formData.base_price);
            submitData.append("duration_hours", formData.duration_hours);

            // Location data
            submitData.append("latitude", formData.latitude);
            submitData.append("longitude", formData.longitude);
            submitData.append("location_address", formData.location_address);
            submitData.append("location_city", formData.location_city);
            submitData.append(
                "location_neighborhood",
                formData.location_neighborhood
            );
            submitData.append("service_radius", formData.service_radius);

            // Service areas
            selectedAreas.forEach((area, index) => {
                submitData.append(`service_areas[${index}]`, area);
            });

            // Additional details
            submitData.append("requirements", formData.requirements);
            submitData.append("includes", formData.includes);
            submitData.append(
                "custom_pricing_description",
                formData.custom_pricing_description
            );

            // Images
            formData.service_images.forEach((image, index) => {
                submitData.append(`service_images[${index}]`, image);
            });

            // Existing images to keep
            formData.existing_images.forEach((imageUrl, index) => {
                submitData.append(`existing_images[${index}]`, imageUrl);
            });

            const result = await updateService(id, submitData);

            if (result.success) {
                navigate(`/provider/services/${id}`, {
                    state: {
                        message: "Service updated successfully!",
                        type: "success",
                    },
                });
            }
        } catch (error) {
            console.error("Error updating service:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (serviceLoading) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "50vh" }}
                >
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3"></div>
                        <p className="text-muted">Loading service...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h5 className="text-muted mb-3">Error Loading Service</h5>
                    <p className="text-muted mb-4">{error}</p>
                    <Link to="/provider/services" className="btn btn-primary">
                        <i className="fas fa-arrow-left me-2"></i>
                        Back to Services
                    </Link>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="edit-service-page">
                {/* Header */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1 text-primary">
                                <i className="fas fa-edit me-2"></i>
                                Edit Service
                            </h4>
                            <p className="text-muted mb-0">
                                Update your service information and settings
                            </p>
                        </div>
                        <Link
                            to={`/provider/services/${id}`}
                            className="btn btn-outline-secondary"
                        >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </Link>
                    </div>
                </div>

                <div className="row">
                    {/* Form Column */}
                    <div className="col-lg-8">
                        {/* Progress Indicator */}
                        <ProgressIndicator
                            steps={steps}
                            currentStep={currentStep}
                        />

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    {/* Step 1: Basic Information */}
                                    {currentStep === 1 && (
                                        <BasicInfoStep
                                            formData={formData}
                                            categories={categories}
                                            errors={validationErrors}
                                            onInputChange={handleInputChange}
                                            getPricingPreview={
                                                getPricingPreview
                                            }
                                        />
                                    )}

                                    {/* Step 2: Location */}
                                    {currentStep === 2 && (
                                        <LocationStep
                                            formData={formData}
                                            errors={validationErrors}
                                            onLocationSelect={
                                                handleLocationSelect
                                            }
                                            onInputChange={handleInputChange}
                                        />
                                    )}

                                    {/* Step 3: Service Areas */}
                                    {currentStep === 3 && (
                                        <ServiceAreasStep
                                            nearbyAreas={nearbyAreas}
                                            showAllAreas={showAllAreas}
                                            setShowAllAreas={setShowAllAreas}
                                            selectedAreas={selectedAreas}
                                            onAreaSelection={
                                                handleAreaSelection
                                            }
                                            errors={validationErrors}
                                            locationSet={
                                                !!(
                                                    formData.latitude &&
                                                    formData.longitude
                                                )
                                            }
                                        />
                                    )}

                                    {/* Step 4: Details */}
                                    {currentStep === 4 && (
                                        <DetailsStep
                                            formData={formData}
                                            errors={validationErrors}
                                            onInputChange={handleInputChange}
                                            onImageUpload={handleImageUpload}
                                            onRemoveImage={removeImage}
                                            onRemoveExistingImage={
                                                removeExistingImage
                                            }
                                            imagesPreviews={imagesPreviews}
                                            existingImagesPreviews={
                                                existingImagesPreviews
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Navigation Buttons */}
                            <div className="d-flex justify-content-between mt-4">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                >
                                    <i className="fas fa-arrow-left me-2"></i>
                                    Previous
                                </button>

                                <div className="d-flex gap-2">
                                    {currentStep < steps.length ? (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleNext}
                                        >
                                            Next
                                            <i className="fas fa-arrow-right ms-2"></i>
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={isSubmitting || loading}
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
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="col-lg-4">
                        {/* Service Preview */}
                        <ServicePreview
                            formData={formData}
                            categories={categories}
                            imagesPreviews={imagesPreviews}
                            getPricingPreview={getPricingPreview}
                            selectedAreas={selectedAreas}
                        />

                        {/* Tips */}
                        <TipsCard currentStep={currentStep} />
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default EditService;
