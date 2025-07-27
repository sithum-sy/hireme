export const useServiceFormValidation = () => {
    const validateStep = (stepNumber, formData) => {
        const newErrors = {};

        switch (stepNumber) {
            case 1:
                if (!formData.title.trim())
                    newErrors.title = "Service title is required";
                if (formData.title.length > 255)
                    newErrors.title = "Service title cannot exceed 255 characters";

                if (!formData.description.trim())
                    newErrors.description = "Description is required";
                if (formData.description.length < 50)
                    newErrors.description = "Description must be at least 50 characters";
                if (formData.description.length > 2000)
                    newErrors.description = "Description cannot exceed 2000 characters";

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
                if (formData.requirements && formData.requirements.length > 1000) {
                    newErrors.requirements =
                        "Requirements cannot exceed 1000 characters";
                }
                break;
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    return { validateStep };
};