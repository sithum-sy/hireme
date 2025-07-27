import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useServices } from "../../../context/ServicesContext";
import { useProvider } from "../../../context/ProviderContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";

// Components
import ServiceActions from "../../../components/provider/services/detail/ServiceActions";
import ServiceStats from "../../../components/provider/services/detail/ServiceStats";
import ServiceInfo from "../../../components/provider/services/detail/ServiceInfo";
import DeleteServiceModal from "../../../components/provider/services/detail/DeleteServiceModal";

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleServiceStatus, deleteService, getService, loading } = useServices();
    const { businessStats } = useProvider();

    const [service, setService] = useState(null);
    const [serviceLoading, setServiceLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        loadServiceDetails();
    }, [id]);

    const loadServiceDetails = async () => {
        setServiceLoading(true);
        setError(null);
        try {
            const result = await getService(id);
            if (result.success) {
                const service = result.data;

                // Transform API data to match component expectations
                const transformedService = {
                    id: service.id,
                    title: service.title,
                    description: service.description,
                    category: {
                        id: service.category?.id || service.category_id,
                        name: service.category?.name || "Unknown Category",
                        icon: service.category?.icon || "fas fa-cog",
                        color: service.category?.color || "primary",
                    },
                    pricing_type: service.pricing_type,
                    base_price: service.base_price,
                    duration_hours: service.duration_hours,
                    custom_pricing_description: service.custom_pricing_description,
                    service_areas: service.service_areas || [],
                    service_radius: service.service_radius,
                    location: {
                        address: service.location_address,
                        latitude: service.latitude,
                        longitude: service.longitude,
                    },
                    includes: service.includes || "",
                    requirements: service.requirements || "",
                    is_active: service.is_active,
                    average_rating: service.average_rating || 0,
                    views_count: service.views_count || 0,
                    bookings_count: service.bookings_count || 0,
                    total_earnings: service.total_earnings || 0,
                    service_images: service.existing_images || [],
                    first_image_url: service.existing_images?.[0] || null,
                    created_at: service.created_at,
                    updated_at: service.updated_at,

                    // Mock performance data (since API might not have this yet)
                    performance: {
                        last_30_days: {
                            views: Math.floor((service.views_count || 0) * 0.3),
                            bookings: Math.floor((service.bookings_count || 0) * 0.4),
                            earnings: Math.floor((service.total_earnings || 0) * 0.3),
                            rating: service.average_rating || 0,
                        },
                        trends: {
                            views_trend: Math.floor(Math.random() * 30) - 15, // Random trend for demo
                            bookings_trend: Math.floor(Math.random() * 40) - 20,
                            rating_trend: (Math.random() - 0.5) * 0.5,
                        },
                    },

                    // Mock recent activity (since API might not have this yet)
                    recent_bookings: [], // You can populate this when you have the data
                    recent_reviews: [], // You can populate this when you have the data
                };

                setService(transformedService);
            } else {
                setError(result.message || "Failed to load service details");
            }
        } catch (err) {
            console.error("Error loading service:", err);
            setError("Failed to load service details");
        } finally {
            setServiceLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!service) return;

        const result = await toggleServiceStatus(service.id);
        if (result.success) {
            setService((prev) => ({
                ...prev,
                is_active: !prev.is_active,
            }));
        }
    };

    const handleDelete = async () => {
        if (!service) return;

        const result = await deleteService(service.id);
        if (result.success) {
            navigate("/provider/services", {
                state: {
                    message: "Service deleted successfully",
                    type: "success",
                },
            });
        }
        setShowDeleteModal(false);
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleCloseModal = () => {
        setShowDeleteModal(false);
    };

    if (serviceLoading) {
        return (
            <ProviderLayout>
                <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "400px" }}
                >
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="text-muted">Loading service details...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    if (error || !service) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h5 className="text-muted mb-3">Service Not Found</h5>
                    <p className="text-muted mb-4">
                        {error ||
                            "The service you're looking for doesn't exist or you don't have permission to view it."}
                    </p>
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
            <div className="service-details">
                {/* Service Actions Header */}
                <ServiceActions
                    service={service}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDeleteClick}
                    loading={loading}
                />

                {/* Main Content */}
                <div className="row">
                    {/* Left Column - Service Details */}
                    <div className="col-lg-8">
                        <ServiceInfo
                            service={service}
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                        />
                    </div>

                    {/* Right Column - Quick Actions & Stats */}
                    <div className="col-lg-4">
                        <ServiceStats service={service} />
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                <DeleteServiceModal
                    service={service}
                    showModal={showDeleteModal}
                    onClose={handleCloseModal}
                    onConfirm={handleDelete}
                    loading={loading}
                />
            </div>
        </ProviderLayout>
    );
};

export default ServiceDetails;