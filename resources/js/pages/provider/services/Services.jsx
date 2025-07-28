import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProvider } from "../../../context/ProviderContext";
import { useServices } from "../../../context/ServicesContext";
import ProviderLayout from "../../../components/layouts/ProviderLayout";

// Components
import ServiceFilters from "../../../components/provider/services/list/ServiceFilters";
import ServiceCard from "../../../components/provider/services/list/ServiceCard";
import ServiceTable from "../../../components/provider/services/list/ServiceTable";

// Hooks
import { useServicesList } from "../../../hooks/provider/useServicesList";

const ProviderServices = () => {
    const navigate = useNavigate();
    const { businessStats } = useProvider();
    const {
        services,
        loading,
        error,
        getMyServices,
        deleteService,
        toggleServiceStatus,
        getServiceCategories,
    } = useServices();

    const [categories, setCategories] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const [bulkDeleteServices, setBulkDeleteServices] = useState([]);

    // Custom hook for list management
    const {
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        selectedServices,
        selectedCategory,
        setSelectedCategory,
        viewMode,
        setViewMode,
        filteredAndSortedServices,
        allSelected,
        handleServiceSelect,
        handleSelectAll,
        clearSelection,
    } = useServicesList(services, categories);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        await Promise.all([getMyServices(), loadCategories()]);
    };

    const loadCategories = async () => {
        const result = await getServiceCategories();
        if (result.success) {
            setCategories(result.data);
        }
    };

    const handleToggleStatus = async (serviceId, currentStatus) => {
        try {
            const result = await toggleServiceStatus(serviceId);
            if (result.success) {
                // Refresh services after status change
                await getMyServices();
            }
        } catch (error) {
            console.error("Error toggling service status:", error);
        }
    };

    const handleDeleteService = (service) => {
        setServiceToDelete(service);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (serviceToDelete) {
            try {
                const result = await deleteService(serviceToDelete.id);
                if (result.success) {
                    await getMyServices();
                    setShowDeleteModal(false);
                    setServiceToDelete(null);
                }
            } catch (error) {
                console.error("Error deleting service:", error);
            }
        }
    };

    const handleBulkDelete = () => {
        setBulkDeleteServices(selectedServices);
        setShowDeleteModal(true);
    };

    const confirmBulkDelete = async () => {
        try {
            const deletePromises = bulkDeleteServices.map(serviceId => 
                deleteService(serviceId)
            );
            await Promise.all(deletePromises);
            await getMyServices();
            setBulkDeleteServices([]);
            setShowDeleteModal(false);
            clearSelection();
        } catch (error) {
            console.error("Error bulk deleting services:", error);
        }
    };

    const handleBulkToggleStatus = async (newStatus) => {
        try {
            const togglePromises = selectedServices.map(serviceId => 
                toggleServiceStatus(serviceId)
            );
            await Promise.all(togglePromises);
            await getMyServices();
            clearSelection();
        } catch (error) {
            console.error("Error bulk toggling status:", error);
        }
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary mb-3"></div>
                        <p className="text-muted">Loading your services...</p>
                    </div>
                </div>
            </ProviderLayout>
        );
    }

    if (error) {
        return (
            <ProviderLayout>
                <div className="alert alert-danger">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            <div className="services-page">
                {/* Page Header */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="fw-bold mb-1 text-primary">
                                <i className="fas fa-cogs me-2"></i>
                                My Services
                            </h4>
                            <p className="text-muted mb-0">
                                Manage and track your service offerings
                            </p>
                        </div>
                        <Link
                            to="/provider/services/create"
                            className="btn btn-primary"
                        >
                            <i className="fas fa-plus me-2"></i>
                            Add New Service
                        </Link>
                    </div>
                </div>

                {/* Quick Stats - Calculate from actual services */}
                {services && services.length >= 0 && (
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center">
                                    <div className="h3 text-primary mb-1">
                                        {services.length}
                                    </div>
                                    <small className="text-muted">Total Services</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center">
                                    <div className="h3 text-success mb-1">
                                        {services.filter(service => service.is_active).length}
                                    </div>
                                    <small className="text-muted">Active Services</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center">
                                    <div className="h3 text-warning mb-1">
                                        {services.reduce((total, service) => total + (service.views_count || 0), 0)}
                                    </div>
                                    <small className="text-muted">Total Views</small>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center">
                                    <div className="h3 text-info mb-1">
                                        {services.reduce((total, service) => total + (service.bookings_count || 0), 0)}
                                    </div>
                                    <small className="text-muted">Total Bookings</small>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <ServiceFilters
                    filter={filter}
                    setFilter={setFilter}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    categories={categories}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    services={services}
                    selectedServices={selectedServices}
                    onBulkDelete={handleBulkDelete}
                    onBulkToggleStatus={handleBulkToggleStatus}
                />

                {/* Services Grid */}
                <div className="services-grid">
                    {filteredAndSortedServices.length > 0 ? (
                        <div className="row">
                            {filteredAndSortedServices.map((service) => (
                                <div key={service.id} className="col-lg-4 col-md-6 mb-4">
                                    <ServiceCard
                                        service={service}
                                        onToggleStatus={handleToggleStatus}
                                        onDelete={handleDeleteService}
                                        onSelect={handleServiceSelect}
                                        isSelected={selectedServices.includes(service.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="mb-4">
                                <i className="fas fa-search fa-4x text-muted"></i>
                            </div>
                            <h5 className="text-muted">No services found</h5>
                            <p className="text-muted mb-4">
                                {selectedCategory || filter !== "all"
                                    ? "Try adjusting your filters."
                                    : "You haven't created any services yet."}
                            </p>
                            {(!selectedCategory && filter === "all") && (
                                <Link
                                    to="/provider/services/create"
                                    className="btn btn-primary"
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Create Your First Service
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {bulkDeleteServices.length > 0 
                                        ? "Delete Selected Services" 
                                        : "Delete Service"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setServiceToDelete(null);
                                        setBulkDeleteServices([]);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {bulkDeleteServices.length > 0 ? (
                                    <p>
                                        Are you sure you want to delete {bulkDeleteServices.length} selected service(s)? 
                                        This action cannot be undone.
                                    </p>
                                ) : (
                                    <p>
                                        Are you sure you want to delete "{serviceToDelete?.title}"? 
                                        This action cannot be undone.
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setServiceToDelete(null);
                                        setBulkDeleteServices([]);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={bulkDeleteServices.length > 0 ? confirmBulkDelete : confirmDelete}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ProviderLayout>
    );
};

export default ProviderServices;