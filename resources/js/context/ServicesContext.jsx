import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import notificationService from "../services/notificationService";

const ServicesContext = createContext();

export const useServices = () => {
    const context = useContext(ServicesContext);
    if (!context) {
        throw new Error("useServices must be used within a ServicesProvider");
    }
    return context;
};

export const ServicesProvider = ({ children }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get provider's services
    const getMyServices = async (status = null, page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (status) params.append("status", status);
            params.append("page", page);

            const response = await axios.get(
                `/api/provider/services/my-services?${params}`
            );

            if (response.data.success) {
                setServices(response.data.data);
                return {
                    success: true,
                    data: response.data.data,
                    meta: response.data.meta,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to fetch services";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || {},
            };
        } finally {
            setLoading(false);
        }
    };

    // Create new service
    const createService = async (serviceData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                "/api/provider/services",
                serviceData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.data.success) {
                // Refresh services list
                await getMyServices();
                
                // Show success notification with service name
                const serviceName = response.data.data.title || 'Service';
                notificationService.success(`${serviceName} created successfully! Check your notifications for details.`);
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
        } catch (error) {
            console.error("=== API ERROR RESPONSE ===", error.response?.data);

            const errorMessage =
                error.response?.data?.message || "Failed to create service";
            setError(errorMessage);

            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || {},
                validationErrors: error.response?.data?.errors || {},
            };
        } finally {
            setLoading(false);
        }
    };

    // Get single service
    const getService = async (serviceId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `/api/provider/services/${serviceId}/edit`
            );

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || "Failed to fetch service",
                };
            }
        } catch (error) {
            console.error("Error fetching service:", error);
            const errorMessage =
                error.response?.data?.message || "Failed to fetch service";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // Update service
    const updateService = async (serviceId, serviceData) => {
        setLoading(true);
        setError(null);
        try {
            // console.log("=== UPDATING SERVICE ===", serviceId);

            // Add method spoofing for Laravel
            serviceData.append("_method", "PUT");

            // Use POST instead of PUT for multipart/form-data
            const response = await axios.post(
                `/api/provider/services/${serviceId}`,
                serviceData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            // console.log("=== UPDATE API RESPONSE ===", response.data);

            if (response.data.success) {
                // Refresh services list
                await getMyServices();
                
                // Show success notification with service name  
                const serviceName = response.data.data.title || 'Service';
                notificationService.success(`${serviceName} updated successfully! Changes saved.`);
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
        } catch (error) {
            console.error("=== UPDATE API ERROR ===", error.response?.data);

            const errorMessage =
                error.response?.data?.message || "Failed to update service";
            setError(errorMessage);

            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors || {},
            };
        } finally {
            setLoading(false);
        }
    };

    // Delete service
    const deleteService = async (serviceId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.delete(
                `/api/provider/services/${serviceId}`
            );

            if (response.data.success) {
                // Refresh services list
                await getMyServices();
                
                // Show success notification
                notificationService.success("Service deleted successfully!");
                
                return {
                    success: true,
                    message: response.data.message,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Failed to delete service";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // Toggle service status
    const toggleServiceStatus = async (serviceId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.patch(
                `/api/provider/services/${serviceId}/toggle-status`
            );

            if (response.data.success) {
                // Refresh services list
                await getMyServices();
                
                // Show success notification based on service status
                const status = response.data.data.status;
                const message = status === 'Active' ? 'Service activated successfully!' : 'Service deactivated successfully!';
                notificationService.success(message);
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message,
                };
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                "Failed to update service status";
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
            };
        } finally {
            setLoading(false);
        }
    };

    // Get service categories
    const getServiceCategories = async () => {
        try {
            const response = await axios.get(
                "/api/provider/service-categories"
            );
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch categories",
            };
        }
    };

    // Get service appointments
    const getServiceAppointments = async (serviceId) => {
        try {
            const response = await axios.get(
                `/api/provider/services/${serviceId}/appointments`
            );
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch service appointments",
            };
        }
    };

    // Get service reviews
    const getServiceReviews = async (serviceId) => {
        try {
            const response = await axios.get(
                `/api/provider/services/${serviceId}/reviews`
            );
            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data,
                };
            }
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to fetch service reviews",
            };
        }
    };

    const value = {
        services,
        loading,
        error,
        getMyServices,
        getService,
        createService,
        updateService,
        deleteService,
        toggleServiceStatus,
        getServiceCategories,
        getServiceAppointments,
        getServiceReviews,
    };

    return (
        <ServicesContext.Provider value={value}>
            {children}
        </ServicesContext.Provider>
    );
};
