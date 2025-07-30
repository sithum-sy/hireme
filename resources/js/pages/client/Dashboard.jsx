import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/layouts/ClientLayout";
import { useAuth } from "../../context/AuthContext";
import { useClient } from "../../context/ClientContext";
import QuickServiceSearch from "../../components/client/dashboard/QuickServiceSearch";
import ServiceRecommendations from "../../components/client/dashboard/ServiceRecommendations";
import LocationSelector from "../../components/map/LocationSelector";
import LoadingSpinner from "../../components/LoadingSpinner";
import AppointmentSections from "../../components/client/dashboard/AppointmentSections";
import clientAppointmentService from "../../services/clientAppointmentService";
// import SimpleLocationSelector from "../../components/map/SimpleLocationSelector";

const ClientDashboard = () => {
    const { user } = useAuth();
    const {
        stats,
        popularServices,
        recentServices,
        categories,
        location,
        loading,
        setLocation,
    } = useClient();

    const [showLocationSelector, setShowLocationSelector] = useState(false);
    const [pendingPayments, setPendingPayments] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [actionItemsLoading, setActionItemsLoading] = useState(true);

    // Load pending action items
    useEffect(() => {
        loadActionItems();
    }, []);

    const loadActionItems = async () => {
        setActionItemsLoading(true);
        try {
            // Load appointments pending payment
            const paymentResult = await clientAppointmentService.getAppointments({
                status: "completed,invoice_sent,payment_pending",
                per_page: 10
            });

            // Load appointments pending review  
            const reviewResult = await clientAppointmentService.getAppointments({
                status: "paid",
                per_page: 10
            });

            if (paymentResult.success) {
                // Filter for appointments that actually need payment
                const needsPayment = (paymentResult.data?.data || []).filter(apt => 
                    apt.invoice && apt.invoice.payment_status === 'pending'
                );
                setPendingPayments(needsPayment);
            }

            if (reviewResult.success) {
                // Filter for appointments that don't have client reviews yet
                const needsReview = (reviewResult.data?.data || []).filter(apt => 
                    !apt.client_review
                );
                setPendingReviews(needsReview);
            }
        } catch (error) {
            console.error("Failed to load action items:", error);
        } finally {
            setActionItemsLoading(false);
        }
    };

    // Location change handler
    const handleLocationChange = useCallback((newLocation) => {
        console.log("📍 Dashboard: Location changed");
        setLocation(newLocation);

        if (newLocation) {
            setTimeout(() => setShowLocationSelector(false), 1500);
        }
    }, []);

    const quickActions = [
        {
            icon: "fas fa-search",
            title: "Browse All Services",
            description: "Explore all available services",
            path: "/client/services",
            variant: "primary",
        },
        // {
        //     icon: "fas fa-map-marker-alt",
        //     title: "Find Nearby Services",
        //     description: "Services in your area",
        //     path: "/client/services/search",
        //     variant: "info",
        // },
        {
            icon: "fas fa-calendar-alt",
            title: "My Appointments",
            description: "Manage your bookings",
            path: "/client/appointments",
            variant: "success",
        },
        {
            icon: "fas fa-users",
            title: "Find Providers",
            description: "Browse service providers",
            path: "/client/services",
            variant: "warning",
        },
    ];

    return (
        <ClientLayout>
            <div className="page-content">
                {/* Today's Schedule Section */}
                <div className="todays-schedule-section mb-6">
                    <AppointmentSections />
                </div>

                {/* Action Items - Pending Payments & Reviews */}
                <div className="action-items-section mb-6">
                    <div className="row">
                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0">
                                        <i className="fas fa-credit-card me-2 text-warning"></i>
                                        Pending Payments
                                    </h6>
                                    {pendingPayments.length > 0 && (
                                        <span className="badge bg-warning">
                                            {pendingPayments.length}
                                        </span>
                                    )}
                                </div>
                                <div className="card-body">
                                    {actionItemsLoading ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm me-2"></div>
                                            <span>Loading...</span>
                                        </div>
                                    ) : pendingPayments.length > 0 ? (
                                        <>
                                            {pendingPayments.slice(0, 3).map((appointment) => (
                                                <div key={appointment.id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2 last:border-0">
                                                    <div className="flex-grow-1">
                                                        <div className="fw-semibold small">
                                                            {appointment.service?.title}
                                                        </div>
                                                        <div className="text-muted small">
                                                            with {appointment.provider?.first_name} {appointment.provider?.last_name}
                                                        </div>
                                                        <div className="text-primary fw-bold small">
                                                            Rs. {appointment.total_price?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/client/appointments/${appointment.id}`}
                                                        className="btn btn-warning btn-sm"
                                                    >
                                                        Pay Now
                                                    </Link>
                                                </div>
                                            ))}
                                            {pendingPayments.length > 3 && (
                                                <div className="text-center mt-3">
                                                    <Link
                                                        to="/client/appointments?status=payment_pending"
                                                        className="btn btn-outline-warning btn-sm"
                                                    >
                                                        View All ({pendingPayments.length})
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="fas fa-check-circle fa-2x text-success mb-2"></i>
                                            <p className="text-muted mb-0 small">
                                                All payments up to date!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 mb-4">
                            <div className="card border-0 shadow-sm h-100">
                                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                                    <h6 className="card-title mb-0">
                                        <i className="fas fa-star me-2 text-info"></i>
                                        Pending Reviews
                                    </h6>
                                    {pendingReviews.length > 0 && (
                                        <span className="badge bg-info">
                                            {pendingReviews.length}
                                        </span>
                                    )}
                                </div>
                                <div className="card-body">
                                    {actionItemsLoading ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm me-2"></div>
                                            <span>Loading...</span>
                                        </div>
                                    ) : pendingReviews.length > 0 ? (
                                        <>
                                            {pendingReviews.slice(0, 3).map((appointment) => (
                                                <div key={appointment.id} className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2 last:border-0">
                                                    <div className="flex-grow-1">
                                                        <div className="fw-semibold small">
                                                            {appointment.service?.title}
                                                        </div>
                                                        <div className="text-muted small">
                                                            with {appointment.provider?.first_name} {appointment.provider?.last_name}
                                                        </div>
                                                        <div className="text-muted small">
                                                            {new Date(appointment.appointment_date).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <Link
                                                        to={`/client/appointments/${appointment.id}`}
                                                        className="btn btn-info btn-sm"
                                                    >
                                                        Review
                                                    </Link>
                                                </div>
                                            ))}
                                            {pendingReviews.length > 3 && (
                                                <div className="text-center mt-3">
                                                    <Link
                                                        to="/client/appointments?status=paid"
                                                        className="btn btn-outline-info btn-sm"
                                                    >
                                                        View All ({pendingReviews.length})
                                                    </Link>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <i className="fas fa-thumbs-up fa-2x text-success mb-2"></i>
                                            <p className="text-muted mb-0 small">
                                                All reviews completed!
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Categories Grid */}
                <div className="categories-section mb-6">
                    <div className="section-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        <h2 className="section-title h3 mb-3 mb-md-0 text-primary">
                            Browse by Category
                        </h2>
                        <Link
                            to="/client/services/categories"
                            className="btn btn-outline-primary btn-sm"
                        >
                            View All Categories
                        </Link>
                    </div>

                    {loading.services ? (
                        <div className="loading-container">
                            <LoadingSpinner
                                size="small"
                                message="Loading categories..."
                            />
                        </div>
                    ) : (
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md responsive-grid-lg">
                            {categories.slice(0, 12).map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/client/services?category_id=${category.id}`}
                                    className="text-decoration-none"
                                >
                                    <div className="card action-card h-100 transition">
                                        <div className="card-body text-center p-4">
                                            <div
                                                className={`action-icon mb-3 text-${
                                                    category.color || "primary"
                                                }`}
                                            >
                                                <i
                                                    className={`${category.icon} fa-2x`}
                                                ></i>
                                            </div>
                                            <h6 className="card-title mb-2">
                                                {category.name}
                                            </h6>
                                            <p className="card-text text-muted small mb-0">
                                                {category.service_count}{" "}
                                                services
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-section mb-6">
                    <h2 className="section-title h3 mb-4 text-primary">
                        Quick Actions
                    </h2>
                    <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                to={action.path}
                                className="text-decoration-none"
                            >
                                <div className="card action-card h-100 transition">
                                    <div className="card-body text-center p-4">
                                        <div
                                            className={`action-icon mb-3 text-${action.variant}`}
                                        >
                                            <i
                                                className={`${action.icon} fa-2x`}
                                            ></i>
                                        </div>
                                        <h6 className="card-title mb-2">
                                            {action.title}
                                        </h6>
                                        <p className="card-text text-muted small mb-0">
                                            {action.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Popular Services */}
                <div className="popular-services-section">
                    <div className="section-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                        <h2 className="section-title h3 mb-3 mb-md-0 text-primary">
                            Popular Services
                        </h2>
                        <Link
                            to="/client/services?sort_by=popularity"
                            className="btn btn-outline-primary btn-sm"
                        >
                            View More
                        </Link>
                    </div>

                    {loading.services ? (
                        <div className="loading-container">
                            <LoadingSpinner
                                size="small"
                                message="Loading popular services..."
                            />
                        </div>
                    ) : (
                        <div className="responsive-grid responsive-grid-sm responsive-grid-md">
                            {popularServices.slice(0, 4).map((service) => (
                                <Link
                                    key={service.id}
                                    to={`/client/services/${service.id}`}
                                    className="text-decoration-none"
                                >
                                    <div className="card service-card h-100 transition">
                                        <div className="service-image position-relative overflow-hidden">
                                            {service.first_image_url ? (
                                                <img
                                                    src={
                                                        service.first_image_url
                                                    }
                                                    alt={service.title}
                                                    className="card-img-top img-responsive"
                                                    style={{
                                                        height: "200px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    className="card-img-top d-flex align-items-center justify-content-center bg-light"
                                                    style={{ height: "200px" }}
                                                >
                                                    <i className="fas fa-image fa-3x text-muted"></i>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h6 className="card-title mb-2">
                                                {service.title}
                                            </h6>
                                            <p
                                                className="card-text text-muted small mb-3"
                                                style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {service.description}
                                            </p>
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="text-primary fw-semibold">
                                                    {service.formatted_price}
                                                </span>
                                                <div className="d-flex align-items-center text-warning">
                                                    <i className="fas fa-star me-1"></i>
                                                    <span className="small">
                                                        {service.average_rating ||
                                                            0}
                                                    </span>
                                                </div>
                                            </div>
                                            {service.distance && (
                                                <div className="d-flex align-items-center text-muted small">
                                                    <i className="fas fa-map-marker-alt me-1"></i>
                                                    <span>
                                                        {service.distance}km
                                                        away
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};

export default ClientDashboard;
