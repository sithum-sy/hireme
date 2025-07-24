import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import clientService from "../../../services/clientService";
import ServiceCard from "./ServiceCard";
import LoadingSpinner from "../../LoadingSpinner";

const SimilarServices = ({ serviceId, categoryId, location }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadSimilarServices();
    }, [serviceId, categoryId, location]);

    const loadSimilarServices = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                category_id: categoryId,
                exclude_service_id: serviceId,
                limit: 8,
            };

            // Add location if available
            if (location) {
                params.latitude = location.lat;
                params.longitude = location.lng;
                params.radius = location.radius || 25;
            }

            const response = await clientService.getSimilarServices(params);

            if (response.success) {
                // Filter out the current service if it's in the results
                const servicesArray = Array.isArray(response.data)
                    ? response.data
                    : [];
                const filteredServices = servicesArray.filter(
                    (service) => service.id != serviceId
                );
                setServices(filteredServices);
            } else {
                setError("Failed to load similar services");
            }
        } catch (error) {
            console.error("Failed to load similar services:", error);
            setError(error.message);
            // Don't show fallback data, just show empty state
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    // Don't render anything if there are no services and no loading
    if (!loading && services.length === 0 && !error) {
        return null;
    }

    // Don't render if there's an error (fail silently)
    if (error) {
        console.warn("SimilarServices error:", error);
        return null;
    }

    if (loading) {
        return (
            <div className="similar-services">
                <LoadingSpinner
                    size="small"
                    message="Loading similar services..."
                />
            </div>
        );
    }

    if (!services.length) {
        return null;
    }

    return (
        <div className="similar-services">
            <div className="section-header d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Similar Services</h4>
                <Link
                    to={`/client/services?category_id=${categoryId}`}
                    className="btn btn-outline-primary btn-sm"
                >
                    View All in Category
                </Link>
            </div>

            <div className="row g-4">
                {services.slice(0, 4).map((service) => (
                    <div key={service.id} className="col-md-6 col-xl-3">
                        <ServiceCard
                            service={service}
                            showDistance={!!location}
                        />
                    </div>
                ))}
            </div>

            <style>{`
                /* Using CSS variables for consistent theming */
            `}</style>
        </div>
    );
};

export default SimilarServices;
