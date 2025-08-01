import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import clientService from "../../../services/clientService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import QuoteStatusBadge from "../../../components/client/quotes/QuoteStatusBadge";
import QuotesTable from "../../../components/client/quotes/QuotesTable";
import QuotesCardView from "../../../components/client/quotes/QuotesCardView";
import QuotesPDFDownloader from "../../../components/client/quotes/QuotesPDFDownloader";
import AcceptQuoteModal from "../../../components/client/quotes/AcceptQuoteModal";
import DeclineQuoteModal from "../../../components/client/quotes/DeclineQuoteModal";
import BookingModal from "../../../components/client/booking/BookingModal";

const QuotesList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // State management
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(searchParams.get("view") || "card");
    const [activeFilter, setActiveFilter] = useState(searchParams.get("status") || "all");
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [serviceCategories, setServiceCategories] = useState([]);
    
    // Filters state
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        provider: searchParams.get("provider") || "",
        service_category: searchParams.get("service_category") || "all",
        price_min: searchParams.get("price_min") || "",
        price_max: searchParams.get("price_max") || "",
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    
    // Counts and pagination
    const [quoteCounts, setQuoteCounts] = useState({
        all: 0,
        pending: 0,
        quoted: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
    
    // Modal states
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedQuote, setSelectedQuote] = useState(null);

    // Load quotes on component mount and filter changes
    useEffect(() => {
        loadQuotes();
    }, [filters, pagination.current_page, sortField, sortDirection]);

    // Load initial data
    useEffect(() => {
        loadServiceCategories();
    }, []);

    // Show success message if navigated from quote request
    useEffect(() => {
        if (location.state?.message) {
            // Could show toast notification here
            console.log(location.state.message);
        }
    }, [location.state]);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const params = {
                status: filters.status !== "all" ? filters.status : undefined,
                date_from: filters.date_from || undefined,
                date_to: filters.date_to || undefined,
                provider: filters.provider || undefined,
                service_category: filters.service_category !== "all" ? filters.service_category : undefined,
                price_min: filters.price_min || undefined,
                price_max: filters.price_max || undefined,
                per_page: pagination.per_page,
                page: pagination.current_page,
                sort_field: sortField,
                sort_direction: sortDirection,
            };

            const response = await clientService.getQuotes(params);

            if (response.success) {
                setQuotes(response.data);
                
                // Update pagination if available
                if (response.meta) {
                    setPagination(prev => ({
                        ...prev,
                        current_page: response.meta.current_page,
                        last_page: response.meta.last_page,
                        total: response.meta.total,
                    }));
                }

                // Load counts
                await loadQuoteCounts();
            } else {
                console.error("Failed to load quotes:", response.message);
            }
        } catch (error) {
            console.error("Failed to load quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load quote counts for each status
    const loadQuoteCounts = async () => {
        try {
            const statusList = ["pending", "quoted", "accepted", "declined", "expired"];
            const countPromises = statusList.map(status =>
                clientService.getQuotes({ status, count_only: true })
            );
            const allPromise = clientService.getQuotes({ count_only: true });

            const responses = await Promise.all([allPromise, ...countPromises]);

            const newCounts = {
                all: responses[0].success ? responses[0].count || responses[0].data?.length || 0 : 0,
                pending: responses[1].success ? responses[1].count || responses[1].data?.length || 0 : 0,
                quoted: responses[2].success ? responses[2].count || responses[2].data?.length || 0 : 0,
                accepted: responses[3].success ? responses[3].count || responses[3].data?.length || 0 : 0,
                declined: responses[4].success ? responses[4].count || responses[4].data?.length || 0 : 0,
                expired: responses[5].success ? responses[5].count || responses[5].data?.length || 0 : 0,
            };

            setQuoteCounts(newCounts);
        } catch (error) {
            console.error("Failed to load quote counts:", error);
        }
    };

    // Load service categories
    const loadServiceCategories = async () => {
        try {
            const response = await clientService.getServiceCategories();
            if (response.success) {
                setServiceCategories(response.data || []);
            }
        } catch (error) {
            console.error("Failed to load service categories:", error);
        }
    };

    // Handle quick filter changes
    const handleQuickFilterChange = (filterType) => {
        setActiveFilter(filterType);
        
        // Update URL parameters
        const newParams = new URLSearchParams(searchParams);
        if (filterType === "all") {
            newParams.delete("status");
        } else {
            newParams.set("status", filterType);
        }
        setSearchParams(newParams);

        // Update filters
        const newFilters = { ...filters, status: filterType };
        setFilters(newFilters);
        setPendingFilters(newFilters);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    // Handle view mode toggle
    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        const newParams = new URLSearchParams(searchParams);
        newParams.set("view", mode);
        setSearchParams(newParams);
    };

    // Handle sorting
    const handleSort = (field) => {
        const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
    };

    // Handle filter changes
    const handlePendingFilterChange = (key, value) => {
        setPendingFilters(prev => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        setFilters(pendingFilters);
        
        // Update active filter if status changed
        setActiveFilter(pendingFilters.status);
        
        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(pendingFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        if (viewMode !== "card") newParams.set("view", viewMode);
        setSearchParams(newParams);

        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    // Reset filters
    const resetPendingFilters = () => {
        setPendingFilters({ ...filters });
    };

    // Clear all filters
    const clearAllFilters = () => {
        const clearedFilters = {
            status: "all",
            date_from: "",
            date_to: "",
            provider: "",
            service_category: "all",
            price_min: "",
            price_max: "",
        };
        setFilters(clearedFilters);
        setPendingFilters(clearedFilters);
        setActiveFilter("all");
        
        // Update URL parameters
        const newParams = new URLSearchParams();
        if (viewMode !== "card") newParams.set("view", viewMode);
        setSearchParams(newParams);
        
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    // Handle quote actions
    const handleQuoteAction = (action, quote) => {
        setSelectedQuote(quote);

        switch (action) {
            case "view":
                navigate(`/client/quotes/${quote.id}`);
                break;
            case "accept":
                setShowBookingModal(true);
                break;
            case "decline":
                setShowDeclineModal(true);
                break;
            case "download":
                // PDF download handled by QuotesPDFDownloader component
                break;
            default:
                break;
        }
    };

    // Success handlers for modals
    const handleAcceptSuccess = (updatedQuote) => {
        setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
        setShowAcceptModal(false);
        setSelectedQuote(null);
        loadQuoteCounts(); // Refresh counts
    };

    const handleDeclineSuccess = (updatedQuote) => {
        setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
        setShowDeclineModal(false);
        setSelectedQuote(null);
        loadQuoteCounts(); // Refresh counts
    };

    // Create service and provider objects for BookingModal
    const serviceForBooking = selectedQuote ? {
        id: selectedQuote.service_id,
        title: selectedQuote.service_title,
        description: selectedQuote.service_description || selectedQuote.message,
        base_price: selectedQuote.quoted_price,
        price: selectedQuote.quoted_price,
        duration_hours: selectedQuote.estimated_duration || 1,
        category: selectedQuote.service_category || {
            name: "Service",
            color: "primary",
            icon: "fas fa-cog",
        },
        first_image_url: selectedQuote.service_images,
        pricing_type: "fixed",
    } : null;

    const providerForBooking = selectedQuote ? {
        id: selectedQuote.provider_id,
        name: selectedQuote.provider_business_name || selectedQuote.provider_name,
        profile_image_url: selectedQuote.provider_image,
        average_rating: selectedQuote.provider_rating || 0,
        reviews_count: selectedQuote.provider_reviews || 0,
        is_verified: true,
        business_name: selectedQuote.provider_business_name,
    } : null;

    // Create pre-selected slot from quote data
    const selectedSlotForBooking = selectedQuote ? {
        date: selectedQuote.requested_date,
        time: selectedQuote.requested_time,
        formatted_date: selectedQuote.requested_date ? new Date(selectedQuote.requested_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }) : "",
        formatted_time: selectedQuote.requested_time ? (() => {
            const [hours, minutes] = selectedQuote.requested_time.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        })() : "",
    } : null;

    // Define tab configuration
    const tabConfig = [
        { key: "all", label: "All Quotes", count: quoteCounts.all, icon: "fas fa-list" },
        { key: "pending", label: "Pending", count: quoteCounts.pending, icon: "fas fa-clock" },
        { key: "quoted", label: "Received", count: quoteCounts.quoted, icon: "fas fa-quote-right" },
        { key: "accepted", label: "Accepted", count: quoteCounts.accepted, icon: "fas fa-check-circle" },
        { key: "declined", label: "Declined", count: quoteCounts.declined, icon: "fas fa-times-circle" },
        { key: "expired", label: "Expired", count: quoteCounts.expired, icon: "fas fa-hourglass-end" },
    ];

    return (
        <ClientLayout>
            <div className="quotes-page">
                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">My Quotes</h1>
                        <p className="page-subtitle">
                            Manage and track your service quote requests
                            {quoteCounts.all > 0 && (
                                <span className="ms-2">
                                    ({quoteCounts.all} total quote{quoteCounts.all !== 1 ? "s" : ""})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        {quotes.length > 0 && (
                            <QuotesPDFDownloader
                                quotes={quotes}
                                className="btn-responsive"
                                disabled={loading}
                            />
                        )}
                        <Link to="/client/services" className="btn btn-primary btn-responsive">
                            <i className="fas fa-plus me-2"></i>
                            Request New Quote
                        </Link>
                    </div>
                </div>

                {/* Quick Filter Tabs */}
                <div className="quotes-tabs mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="tabs-container d-flex flex-wrap">
                            {tabConfig.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`filter-tab me-2 mb-2 ${activeFilter === tab.key ? "active" : ""}`}
                                    onClick={() => handleQuickFilterChange(tab.key)}
                                >
                                    <i className={`${tab.icon} me-2`}></i>
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span className="badge bg-light text-dark ms-2">
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                        
                        {/* View Toggle */}
                        <div className="view-toggle btn-group" role="group">
                            <button
                                type="button"
                                className={`btn btn-outline-secondary ${viewMode === "card" ? "active" : ""}`}
                                onClick={() => handleViewModeChange("card")}
                                title="Card View"
                            >
                                <i className="fas fa-th-large"></i>
                            </button>
                            <button
                                type="button"
                                className={`btn btn-outline-secondary ${viewMode === "table" ? "active" : ""}`}
                                onClick={() => handleViewModeChange("table")}
                                title="Table View"
                            >
                                <i className="fas fa-table"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                <div className="filters-section mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Advanced Filters</h5>
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#advancedFilters"
                            aria-expanded="false"
                        >
                            <i className="fas fa-filter me-2"></i>
                            More Filters
                        </button>
                    </div>

                    <div className="collapse" id="advancedFilters">
                        <div className="row g-3 align-items-end">
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Status</label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.status}
                                    onChange={(e) => handlePendingFilterChange("status", e.target.value)}
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="quoted">Received</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="declined">Declined</option>
                                    <option value="expired">Expired</option>
                                </select>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Date From</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_from}
                                    onChange={(e) => handlePendingFilterChange("date_from", e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Date To</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_to}
                                    onChange={(e) => handlePendingFilterChange("date_to", e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Provider</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Provider name"
                                    value={pendingFilters.provider}
                                    onChange={(e) => handlePendingFilterChange("provider", e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Service Category</label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.service_category}
                                    onChange={(e) => handlePendingFilterChange("service_category", e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {serviceCategories.map((category) => (
                                        <option key={category.id} value={category.slug || category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Min Price (Rs.)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    min="0"
                                    value={pendingFilters.price_min}
                                    onChange={(e) => handlePendingFilterChange("price_min", e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">Max Price (Rs.)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="50000"
                                    min="0"
                                    value={pendingFilters.price_max}
                                    onChange={(e) => handlePendingFilterChange("price_max", e.target.value)}
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-primary btn-responsive"
                                        onClick={applyFilters}
                                        disabled={JSON.stringify(filters) === JSON.stringify(pendingFilters)}
                                    >
                                        <i className="fas fa-check me-2"></i>
                                        Apply Filters
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary btn-responsive"
                                        onClick={clearAllFilters}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear All
                                    </button>
                                    <button
                                        className="btn btn-outline-info btn-responsive"
                                        onClick={resetPendingFilters}
                                        disabled={JSON.stringify(filters) === JSON.stringify(pendingFilters)}
                                    >
                                        <i className="fas fa-undo me-2"></i>
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Summary */}
                {activeFilter !== "all" && quotes.length > 0 && (
                    <div className="filter-summary mb-3">
                        <small className="text-muted">
                            Showing {quotes.length} {activeFilter} quote{quotes.length !== 1 ? "s" : ""}
                            <button
                                className="btn btn-link btn-sm text-primary p-0 ms-2"
                                onClick={() => handleQuickFilterChange("all")}
                            >
                                View all quotes
                            </button>
                        </small>
                    </div>
                )}

                {/* Quotes List */}
                {viewMode === "table" ? (
                    <QuotesTable
                        quotes={quotes}
                        loading={loading}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onQuoteAction={handleQuoteAction}
                    />
                ) : (
                    <QuotesCardView
                        quotes={quotes}
                        loading={loading}
                        onQuoteAction={handleQuoteAction}
                    />
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="pagination-wrapper d-flex justify-content-center mt-4">
                        <nav>
                            <ul className="pagination">
                                <li className={`page-item ${pagination.current_page === 1 ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                        disabled={pagination.current_page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <li key={page} className={`page-item ${pagination.current_page === page ? "active" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => setPagination(prev => ({ ...prev, current_page: page }))}
                                            >
                                                {page}
                                            </button>
                                        </li>
                                    );
                                })}
                                <li className={`page-item ${pagination.current_page === pagination.last_page ? "disabled" : ""}`}>
                                    <button
                                        className="page-link"
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                        disabled={pagination.current_page === pagination.last_page}
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

                {/* Quick Actions Footer */}
                {quotes.length > 0 && (
                    <div className="quick-actions mt-5 p-4 bg-light rounded-4">
                        <div className="row text-center">
                            <div className="col-md-3">
                                <Link to="/client/services" className="text-decoration-none">
                                    <i className="fas fa-plus-circle fa-2x text-primary mb-2 d-block"></i>
                                    <span className="small fw-semibold">Request New Quote</span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link to="/client/providers" className="text-decoration-none">
                                    <i className="fas fa-users fa-2x text-info mb-2 d-block"></i>
                                    <span className="small fw-semibold">Browse Providers</span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link to="/client/appointments" className="text-decoration-none">
                                    <i className="fas fa-calendar-check fa-2x text-success mb-2 d-block"></i>
                                    <span className="small fw-semibold">My Appointments</span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link to="/client/support" className="text-decoration-none">
                                    <i className="fas fa-headset fa-2x text-warning mb-2 d-block"></i>
                                    <span className="small fw-semibold">Get Help</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedQuote && (
                <>
                    <AcceptQuoteModal
                        show={showAcceptModal}
                        onHide={() => {
                            setShowAcceptModal(false);
                            setSelectedQuote(null);
                        }}
                        quote={selectedQuote}
                        onAcceptSuccess={handleAcceptSuccess}
                    />

                    <DeclineQuoteModal
                        show={showDeclineModal}
                        onHide={() => {
                            setShowDeclineModal(false);
                            setSelectedQuote(null);
                        }}
                        quote={selectedQuote}
                        onDeclineSuccess={handleDeclineSuccess}
                    />
                </>
            )}

            {/* Booking Modal for Quote Acceptance */}
            {selectedQuote && serviceForBooking && providerForBooking && (
                <BookingModal
                    show={showBookingModal}
                    onHide={() => {
                        setShowBookingModal(false);
                        setSelectedQuote(null);
                    }}
                    service={serviceForBooking}
                    provider={providerForBooking}
                    selectedSlot={selectedSlotForBooking}
                    clientLocation={null} // Will be detected by BookingModal
                    quoteId={selectedQuote.id} // Pass quote ID for acceptance tracking
                    onQuoteAccepted={(updatedQuote) => {
                        // Update the quote in the list when it's accepted
                        setQuotes(prev => prev.map(q => q.id === updatedQuote.id ? updatedQuote : q));
                        loadQuoteCounts(); // Refresh counts
                        setShowBookingModal(false);
                        setSelectedQuote(null);
                    }}
                />
            )}

            {/* Custom Styles */}
            <style>{`
                .filter-tab {
                    display: inline-flex;
                    align-items: center;
                    padding: 8px 16px;
                    border: 2px solid #dee2e6;
                    border-radius: 20px;
                    background: white;
                    color: #6c757d;
                    text-decoration: none;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .filter-tab:hover {
                    border-color: var(--current-role-primary);
                    color: var(--current-role-primary);
                    transform: translateY(-1px);
                }
                
                .filter-tab.active {
                    border-color: var(--current-role-primary);
                    background: var(--current-role-primary);
                    color: white;
                }
                
                .filter-tab.active .badge {
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
                
                .view-toggle .btn {
                    border-color: #dee2e6;
                }
                
                .view-toggle .btn.active {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                    color: white;
                }
                
                .pagination .page-link {
                    color: var(--current-role-primary);
                }
                
                .pagination .page-item.active .page-link {
                    background-color: var(--current-role-primary);
                    border-color: var(--current-role-primary);
                }
                
                .quote-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                
                .quote-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }
                
                .text-truncate-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .cursor-pointer {
                    cursor: pointer;
                }
                
                @media (max-width: 768px) {
                    .btn-responsive {
                        font-size: 12px;
                        padding: 6px 12px;
                    }
                    
                    .filter-tab {
                        font-size: 12px;
                        padding: 6px 12px;
                    }
                }
            `}</style>
        </ClientLayout>
    );
};

export default QuotesList;