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
        return (Array.isArray(services) ? services : []).filter((service) => {
            // Filter by status
            if (filter === "active" && !service.is_active) return false;
            if (filter === "inactive" && service.is_active) return false;

            // Filter by category
            if (selectedCategory && service.category_id !== parseInt(selectedCategory)) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    service.title.toLowerCase().includes(query) ||
                    service.description.toLowerCase().includes(query) ||
                    service.category.name.toLowerCase().includes(query) ||
                    (service.service_areas && service.service_areas.some((area) =>
                        area.toLowerCase().includes(query)
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
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case "price":
                    aValue = a.base_price;
                    bValue = b.base_price;
                    break;
                case "rating":
                    aValue = a.average_rating || 0;
                    bValue = b.average_rating || 0;
                    break;
                case "views":
                    aValue = a.views_count || 0;
                    bValue = b.views_count || 0;
                    break;
                case "bookings":
                    aValue = a.bookings_count || 0;
                    bValue = b.bookings_count || 0;
                    break;
                case "created_at":
                default:
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
            }

            if (sortOrder === "asc") {
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