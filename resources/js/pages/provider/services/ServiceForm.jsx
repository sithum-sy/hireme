import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";

// Components
import ProgressIndicator from "../../../components/provider/services/ProgressIndicator";
import BasicInfoStep from "../../../components/provider/services/BasicInfoStep";
import LocationStep from "../../../components/provider/services/LocationStep";
import ServiceAreasStep from "../../../components/provider/services/ServiceAreasStep";
import DetailsStep from "../../../components/provider/services/DetailsStep";
import ServicePreview from "../../../components/provider/services/ServicePreview";
import TipsCard from "../../../components/provider/services/TipsCard";

// Hooks
import { useServiceForm } from "../../../hooks/useServiceForm";
import { useServiceAreas } from "../../../hooks/useServiceAreas";
import { useServiceFormValidation } from "../../../hooks/useServiceFormValidation";

const ServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { createService, updateService, getServiceCategories, loading } = useServices();
    const { businessStats } = useProvider();

    // Custom hooks
    const {
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
    } = useServiceForm(isEdit, id);

    const { validateStep } = useServiceFormValidation();

    const { handleShowAllAreas } = useServiceAreas({
        formData,
        currentStep,
        dynamicAreas,
        setDynamicAreas,
        showAllAreas,
        setShowAllAreas,
        sriLankanAreas,
        getNearbyServiceAreas,
        getAllServiceAreas,
    });

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

    const handleNext = (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        const validation = validateStep(currentStep, formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
            setErrors({}); // Clear any previous errors
        }
    };

    const handlePrevious = () => {
        setCurrentStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validation = validateStep(currentStep, formData);
        
        if (!validation.isValid) {
            setErrors(validation.errors);
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

        // Location fields
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
        submitData.append("location_neighborhood", formData.location_neighborhood || "");
        submitData.append("service_radius", formData.service_radius || "15");

        // Optional fields
        submitData.append("custom_pricing_description", formData.custom_pricing_description || "");
        submitData.append("includes", formData.includes || "");
        submitData.append("requirements", formData.requirements || "");

        // Service areas as JSON string
        submitData.append("service_areas", JSON.stringify(formData.service_areas || []));

        // Images
        if (formData.service_images && formData.service_images.length > 0) {
            formData.service_images.forEach((image) => {
                submitData.append(`service_images[]`, image);
            });
        }

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

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <BasicInfoStep
                        formData={formData}
                        categories={categories}
                        errors={errors}
                        onInputChange={handleInputChange}
                        getPricingPreview={getPricingPreview}
                    />
                );
            case 2:
                return (
                    <LocationStep
                        formData={formData}
                        errors={errors}
                        onLocationChange={handleLocationChange}
                    />
                );
            case 3:
                return (
                    <ServiceAreasStep
                        formData={formData}
                        errors={errors}
                        dynamicAreas={dynamicAreas}
                        showAllAreas={showAllAreas}
                        locationLoading={locationLoading}
                        onServiceAreasChange={handleServiceAreasChange}
                        onShowAllAreas={handleShowAllAreas}
                    />
                );
            case 4:
                return (
                    <DetailsStep
                        formData={formData}
                        categories={categories}
                        imagesPreviews={imagesPreviews}
                        errors={errors}
                        onInputChange={handleInputChange}
                        onImageUpload={handleImageUpload}
                        onRemoveImage={removeImage}
                        getPricingPreview={getPricingPreview}
                    />
                );
            default:
                return null;
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
                                <i className="fas fa-plus-circle text-primary me-2"></i>
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
                            className="btn btn-outline-secondary btn-responsive"
                            onClick={() => navigate("/provider/services")}
                        >
                            <i className="fas fa-times me-2"></i>
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Progress Indicator */}
                <ProgressIndicator currentStep={currentStep} steps={steps} />

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
                                            } text-primary me-2`}
                                        ></i>
                                        Step {currentStep}: {steps[currentStep - 1].title}
                                    </h6>
                                </div>
                                <div className="card-body">
                                    {renderCurrentStep()}

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
                                                    className="btn btn-outline-secondary btn-responsive"
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
                                                    className="btn btn-primary btn-responsive"
                                                    onClick={handleNext}
                                                    disabled={loading}
                                                >
                                                    Next
                                                    <i className="fas fa-arrow-right ms-2"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-responsive"
                                                    disabled={isSubmitting || loading}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                                            {isEdit ? "Updating..." : "Creating..."}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="fas fa-save me-2"></i>
                                                            {isEdit ? "Update Service" : "Create Service"}
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
                                <ServicePreview
                                    formData={formData}
                                    categories={categories}
                                    imagesPreviews={imagesPreviews}
                                    getPricingPreview={getPricingPreview}
                                />

                                {/* Tips Card */}
                                <TipsCard />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </ProviderLayout>
    );
};

export default ServiceForm;