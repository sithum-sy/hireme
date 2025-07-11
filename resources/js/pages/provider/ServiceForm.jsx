import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useServices } from "../../context/ServicesContext";
import ProviderLayout from "../../components/layouts/ProviderLayout";
import LocationSelector from "../../components/map/LocationSelector";

const ServiceForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { createService, updateService, getServiceCategories, loading } =
        useServices();

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
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [imagesPreviews, setImagesPreviews] = useState([]);

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
    ];

    // Steps configuration
    const steps = [
        { number: 1, title: "Basic Info", icon: "fas fa-info-circle" },
        { number: 2, title: "Location", icon: "fas fa-map-marked-alt" },
        { number: 3, title: "Service Areas", icon: "fas fa-map" },
        { number: 4, title: "Details & Images", icon: "fas fa-images" },
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
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + formData.service_images.length > 5) {
            alert("You can upload maximum 5 images");
            return;
        }

        const newImages = [];
        const newPreviews = [];

        files.forEach((file) => {
            if (file.size > 2 * 1024 * 1024) {
                alert(`${file.name} is too large. Maximum size is 2MB.`);
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
    };

    const removeImage = (index) => {
        setFormData((prev) => ({
            ...prev,
            service_images: prev.service_images.filter((_, i) => i !== index),
        }));
        setImagesPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const validateStep = (stepNumber) => {
        const newErrors = {};

        switch (stepNumber) {
            case 1:
                if (!formData.title.trim())
                    newErrors.title = "Service title is required";
                if (!formData.description.trim())
                    newErrors.description = "Description is required";
                if (!formData.category_id)
                    newErrors.category_id = "Please select a category";
                if (!formData.base_price || formData.base_price <= 0)
                    newErrors.base_price = "Please enter a valid price";
                if (!formData.duration_hours || formData.duration_hours <= 0)
                    newErrors.duration_hours = "Please enter valid duration";
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
                // Optional fields, no validation required
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

        if (!validateStep(currentStep)) return;

        const submitData = new FormData();

        // Add all form fields
        Object.keys(formData).forEach((key) => {
            if (key === "service_areas") {
                formData[key].forEach((area, index) => {
                    submitData.append(`service_areas[${index}]`, area);
                });
            } else if (key === "service_images") {
                formData[key].forEach((image, index) => {
                    submitData.append(`service_images[${index}]`, image);
                });
            } else if (formData[key] !== null && formData[key] !== undefined) {
                submitData.append(key, formData[key]);
            }
        });

        const result = isEdit
            ? await updateService(id, submitData)
            : await createService(submitData);

        if (result.success) {
            navigate("/provider/services");
        } else {
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
    };

    const getStepProgress = () => (currentStep / steps.length) * 100;

    return (
        <ProviderLayout>
            <div className="service-form-container">
                {/* Rest of the component code from the artifact... */}
            </div>
        </ProviderLayout>
    );
};

export default ServiceForm;
