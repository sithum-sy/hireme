import { useState, useEffect, useMemo } from "react";

export const useServicesList = (services, categories) => {
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [viewMode, setViewMode] = useState("grid");

    // Handle service selection
    const handleServiceSelect = (serviceId, isSelected) => {
        setSelectedServices(prev => 
            isSelected 
                ? [...prev, serviceId]
                : prev.filter(id => id !== serviceId)
        );
    };

    const handleSelectAll = (isSelected) => {
        if (isSelected) {
            setSelectedServices(filteredAndSortedServices.map(service => service.id));
        } else {
            setSelectedServices([]);
        }
    };

    const clearSelection = () => {
        setSelectedServices([]);
    };

    // Filter and search services
    const filteredServices = useMemo(() => {
        if (!Array.isArray(services)) {
            return [];
        }

        return services.filter((service) => {
            if (!service) return false;

            // Filter by status
            if (filter === "active" && !service.is_active) return false;
            if (filter === "inactive" && service.is_active) return false;

            // Filter by category
            if (selectedCategory && selectedCategory !== "") {
                const categoryId = parseInt(selectedCategory);
                
                // Try different ways the category might be stored
                let serviceCategoryId = null;
                
                if (service.category_id !== undefined) {
                    serviceCategoryId = parseInt(service.category_id);
                } else if (service.category && service.category.id !== undefined) {
                    serviceCategoryId = parseInt(service.category.id);
                } else if (service.service_category_id !== undefined) {
                    serviceCategoryId = parseInt(service.service_category_id);
                }
                
                // If we couldn't find a category ID, skip this service
                if (serviceCategoryId === null || isNaN(serviceCategoryId)) {
                    return false;
                }
                
                // Filter based on category match
                if (serviceCategoryId !== categoryId) {
                    return false;
                }
            }

            // Search filter (currently disabled in simplified filter, but keeping logic for future)
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    (service.title || "").toLowerCase().includes(query) ||
                    (service.description || "").toLowerCase().includes(query) ||
                    (service.category?.name || "").toLowerCase().includes(query) ||
                    (service.service_areas && Array.isArray(service.service_areas) && 
                     service.service_areas.some((area) =>
                        (area || "").toLowerCase().includes(query)
                    ))
                );
            }

            return true;
        });
    }, [services, filter, selectedCategory, searchQuery]);

    // Sort services
    const filteredAndSortedServices = useMemo(() => {
        return [...filteredServices].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case "title":
                    aValue = (a.title || "").toLowerCase();
                    bValue = (b.title || "").toLowerCase();
                    break;
                case "base_price":
                case "price":
                    aValue = parseFloat(a.base_price) || 0;
                    bValue = parseFloat(b.base_price) || 0;
                    break;
                case "average_rating":
                case "rating":
                    aValue = parseFloat(a.average_rating) || 0;
                    bValue = parseFloat(b.average_rating) || 0;
                    break;
                case "views_count":
                case "views":
                    aValue = parseInt(a.views_count) || 0;
                    bValue = parseInt(b.views_count) || 0;
                    break;
                case "bookings_count":
                case "bookings":
                    aValue = parseInt(a.bookings_count) || 0;
                    bValue = parseInt(b.bookings_count) || 0;
                    break;
                case "created_at":
                default:
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
                    break;
            }

            // Determine sort order based on the field type
            let defaultOrder = "desc";
            if (sortBy === "title") {
                defaultOrder = "asc"; // Alphabetical ascending
            } else if (["base_price", "price", "average_rating", "rating", "views_count", "views", "bookings_count", "bookings"].includes(sortBy)) {
                defaultOrder = "desc"; // Higher values first
            }

            const order = sortOrder || defaultOrder;

            if (order === "asc") {
                return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
            } else {
                return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
            }
        });
    }, [filteredServices, sortBy, sortOrder]);

    // Check if all filtered services are selected
    const allSelected = filteredAndSortedServices.length > 0 && 
        filteredAndSortedServices.every(service => selectedServices.includes(service.id));

    // Reset selection when filters change
    useEffect(() => {
        setSelectedServices([]);
    }, [filter, searchQuery, selectedCategory, sortBy, sortOrder]);

    return {
        // State
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        selectedServices,
        setSelectedServices,
        selectedCategory,
        setSelectedCategory,
        viewMode,
        setViewMode,
        
        // Computed
        filteredAndSortedServices,
        allSelected,
        
        // Handlers
        handleServiceSelect,
        handleSelectAll,
        clearSelection,
    };
};