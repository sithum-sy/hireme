import React, { useState, useEffect } from "react";
import {
    Link,
    useLocation,
    useSearchParams,
    useNavigate,
} from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import providerQuoteService from "../../../services/providerQuoteService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import ProviderQuotesTable from "../../../components/provider/quotes/ProviderQuotesTable";
import ProviderQuotesCardView from "../../../components/provider/quotes/ProviderQuotesCardView";
import ProviderQuotesPDFDownloader from "../../../components/provider/quotes/ProviderQuotesPDFDownloader";

const ProviderQuotesListEnhanced = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State management
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState(
        searchParams.get("view") || "card"
    );
    const [activeFilter, setActiveFilter] = useState(
        searchParams.get("status") || "all"
    );
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");

    // Filters state
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        client: searchParams.get("client") || "",
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
        rejected: 0,
        withdrawn: 0,
        expired: 0,
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });

    // Business stats
    const [businessStats, setBusinessStats] = useState({
        totalRevenue: 0,
        potentialRevenue: 0,
        avgQuoteValue: 0,
        acceptanceRate: 0,
    });

    // Service categories
    const [serviceCategories, setServiceCategories] = useState([]);

    // Load quotes on component mount and filter changes
    useEffect(() => {
        loadQuotes();
    }, [filters, pagination.current_page, sortField, sortDirection]);

    // Load service categories on component mount
    useEffect(() => {
        loadServiceCategories();
    }, []);

    // Show success message if navigated from quote response
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
                client: filters.client || undefined,
                service_category:
                    filters.service_category !== "all"
                        ? filters.service_category
                        : undefined,
                price_min: filters.price_min || undefined,
                price_max: filters.price_max || undefined,
                per_page: pagination.per_page,
                page: pagination.current_page,
                sort_field: sortField,
                sort_direction: sortDirection,
                with: "client,service",
            };

            const response = await providerQuoteService.getQuotes(params);

            if (response.success) {
                setQuotes(response.data.data || []);

                // Update pagination if available
                if (response.data.meta) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: response.data.meta.current_page,
                        last_page: response.data.meta.last_page,
                        total: response.data.meta.total,
                    }));
                }

                // Load counts and stats
                await loadQuoteCounts();
                await calculateBusinessStats(response.data.data || []);
            } else {
                console.error("Failed to load quotes:", response.message);
            }
        } catch (error) {
            console.error("Failed to load quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load quote counts for each status with rate limiting protection
    const loadQuoteCounts = async () => {
        try {
            // Use pagination-based approach to get all quotes while respecting backend limits
            const response = await providerQuoteService.getQuotes({
                per_page: 50, // Use max allowed per_page
                page: 1,
            });

            if (response.success && response.data) {
                const quotes = response.data.data || [];
                const meta = response.data.meta;

                // If we have pagination info and there are more pages, fetch additional data
                let allQuotes = [...quotes];
                if (meta && meta.last_page > 1) {
                    // Fetch remaining pages with a small delay to avoid rate limiting
                    for (
                        let page = 2;
                        page <= Math.min(meta.last_page, 10);
                        page++
                    ) {
                        try {
                            await new Promise((resolve) =>
                                setTimeout(resolve, 100)
                            ); // 100ms delay
                            const pageResponse =
                                await providerQuoteService.getQuotes({
                                    per_page: 50,
                                    page,
                                });
                            if (
                                pageResponse.success &&
                                pageResponse.data?.data
                            ) {
                                allQuotes = [
                                    ...allQuotes,
                                    ...pageResponse.data.data,
                                ];
                            }
                        } catch (pageError) {
                            console.warn(
                                `Failed to load page ${page}:`,
                                pageError
                            );
                            break; // Stop fetching if any page fails
                        }
                    }
                }

                const newCounts = {
                    all: allQuotes.length,
                    pending: allQuotes.filter((q) => q.status === "pending")
                        .length,
                    quoted: allQuotes.filter((q) => q.status === "quoted")
                        .length,
                    accepted: allQuotes.filter((q) => q.status === "accepted")
                        .length,
                    rejected: allQuotes.filter((q) => q.status === "rejected")
                        .length,
                    withdrawn: allQuotes.filter((q) => q.status === "withdrawn")
                        .length,
                    expired: allQuotes.filter((q) => q.status === "expired")
                        .length,
                };

                setQuoteCounts(newCounts);
            } else {
                // Fallback: set counts to 0
                setQuoteCounts({
                    all: 0,
                    pending: 0,
                    quoted: 0,
                    accepted: 0,
                    rejected: 0,
                    withdrawn: 0,
                    expired: 0,
                });
            }
        } catch (error) {
            console.error("Failed to load quote counts:", error);
            // Set counts to 0 on error to prevent UI issues
            setQuoteCounts({
                all: 0,
                pending: 0,
                quoted: 0,
                accepted: 0,
                rejected: 0,
                withdrawn: 0,
                expired: 0,
            });
        }
    };

    // Load service categories
    const loadServiceCategories = async () => {
        try {
            const response = await providerQuoteService.getServiceCategories();
            if (response.success) {
                setServiceCategories(response.data || []);
            }
        } catch (error) {
            console.error("Failed to load service categories:", error);
        }
    };

    // Calculate business statistics
    const calculateBusinessStats = async (quotesData = quotes) => {
        if (!quotesData.length) return;

        const acceptedQuotes = quotesData.filter(
            (q) => q.status === "accepted"
        );
        const quotedQuotes = quotesData.filter((q) =>
            ["quoted", "accepted"].includes(q.status)
        );

        const totalRevenue = acceptedQuotes.reduce(
            (sum, q) =>
                sum +
                (parseFloat(q.quoted_price) || 0) +
                (parseFloat(q.travel_fee) || 0),
            0
        );

        const potentialRevenue = quotedQuotes.reduce(
            (sum, q) =>
                sum +
                (parseFloat(q.quoted_price) || 0) +
                (parseFloat(q.travel_fee) || 0),
            0
        );

        const avgQuoteValue =
            quotedQuotes.length > 0
                ? potentialRevenue / quotedQuotes.length
                : 0;

        const acceptanceRate =
            quotedQuotes.length > 0
                ? (acceptedQuotes.length / quotedQuotes.length) * 100
                : 0;

        setBusinessStats({
            totalRevenue,
            potentialRevenue,
            avgQuoteValue,
            acceptanceRate,
        });
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
        setPagination((prev) => ({ ...prev, current_page: 1 }));
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
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
    };

    // Handle filter changes
    const handlePendingFilterChange = (key, value) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Apply filters
    const applyFilters = () => {
        setFilters(pendingFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(pendingFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        if (viewMode !== "card") newParams.set("view", viewMode);
        setSearchParams(newParams);

        setPagination((prev) => ({ ...prev, current_page: 1 }));
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
            client: "",
            service_category: "all",
            price_min: "",
            price_max: "",
        };
        setFilters(clearedFilters);
        setPendingFilters(clearedFilters);
        setActiveFilter("all");
        setSearchParams({ view: viewMode });
    };

    // Handle quote actions
    const handleQuoteAction = (action, quote) => {
        switch (action) {
            case "view":
                navigate(`/provider/quotes/${quote.id}`);
                break;
            case "respond":
                navigate(`/provider/quotes/create?quote_id=${quote.id}`);
                break;
            case "edit":
                navigate(`/provider/quotes/${quote.id}/edit`);
                break;
            case "withdraw":
                // Handle withdrawal
                handleWithdrawQuote(quote);
                break;
            case "download":
                // PDF download handled by ProviderQuotesPDFDownloader component
                break;
            default:
                break;
        }
    };

    // Handle quote withdrawal
    const handleWithdrawQuote = async (quote) => {
        if (
            confirm(
                `Are you sure you want to withdraw quote ${
                    quote.quote_number ||
                    `Q${String(quote.id).padStart(6, "0")}`
                }?`
            )
        ) {
            try {
                const response = await providerQuoteService.withdrawQuote(
                    quote.id
                );
                if (response.success) {
                    setQuotes((prev) =>
                        prev.map((q) =>
                            q.id === quote.id
                                ? { ...q, status: "withdrawn" }
                                : q
                        )
                    );
                    loadQuoteCounts(); // Refresh counts
                }
            } catch (error) {
                console.error("Failed to withdraw quote:", error);
            }
        }
    };

    // Define tab configuration
    const tabConfig = [
        {
            key: "all",
            label: "All Quotes",
            count: quoteCounts.all,
            icon: "fas fa-list",
        },
        {
            key: "pending",
            label: "Pending",
            count: quoteCounts.pending,
            icon: "fas fa-clock",
        },
        {
            key: "quoted",
            label: "Sent",
            count: quoteCounts.quoted,
            icon: "fas fa-paper-plane",
        },
        {
            key: "accepted",
            label: "Accepted",
            count: quoteCounts.accepted,
            icon: "fas fa-check-circle",
        },
        {
            key: "rejected",
            label: "Declined",
            count: quoteCounts.rejected,
            icon: "fas fa-times-circle",
        },
        {
            key: "withdrawn",
            label: "Withdrawn",
            count: quoteCounts.withdrawn,
            icon: "fas fa-undo",
        },
        {
            key: "expired",
            label: "Expired",
            count: quoteCounts.expired,
            icon: "fas fa-hourglass-end",
        },
    ];

    return (
        <ProviderLayout>
            <div className="quotes-page">
                {/* Page Header */}
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">My Quote Requests</h1>
                        <p className="page-subtitle">
                            Manage and respond to service quote requests
                            {quoteCounts.all > 0 && (
                                <span className="ms-2">
                                    ({quoteCounts.all} total quote
                                    {quoteCounts.all !== 1 ? "s" : ""})
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        {quotes.length > 0 && (
                            <ProviderQuotesPDFDownloader
                                quotes={quotes}
                                className="btn-responsive"
                                disabled={loading}
                            />
                        )}
                        <Link
                            to="/provider/services"
                            className="btn btn-success btn-responsive"
                        >
                            <i className="fas fa-cog me-2"></i>
                            Manage Services
                        </Link>
                    </div>
                </div>

                {/* Business Stats */}
                {businessStats.totalRevenue > 0 && (
                    <div className="business-stats mb-4">
                        <div className="row">
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-success text-white">
                                    <div className="card-body text-center">
                                        <h4 className="fw-bold">
                                            Rs.{" "}
                                            {businessStats.totalRevenue.toLocaleString()}
                                        </h4>
                                        <small>Total Revenue Won</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-info text-white">
                                    <div className="card-body text-center">
                                        <h4 className="fw-bold">
                                            Rs.{" "}
                                            {businessStats.potentialRevenue.toLocaleString()}
                                        </h4>
                                        <small>Potential Revenue</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-warning text-white">
                                    <div className="card-body text-center">
                                        <h4 className="fw-bold">
                                            Rs.{" "}
                                            {Math.round(
                                                businessStats.avgQuoteValue
                                            ).toLocaleString()}
                                        </h4>
                                        <small>Avg Quote Value</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-3 col-sm-6 mb-3">
                                <div className="card bg-primary text-white">
                                    <div className="card-body text-center">
                                        <h4 className="fw-bold">
                                            {Math.round(
                                                businessStats.acceptanceRate
                                            )}
                                            %
                                        </h4>
                                        <small>Acceptance Rate</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Filter Tabs */}
                <div className="quotes-tabs mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="tabs-container d-flex flex-wrap">
                            {tabConfig.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`filter-tab me-2 mb-2 ${
                                        activeFilter === tab.key ? "active" : ""
                                    }`}
                                    onClick={() =>
                                        handleQuickFilterChange(tab.key)
                                    }
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
                                className={`btn btn-outline-secondary ${
                                    viewMode === "card" ? "active" : ""
                                }`}
                                onClick={() => handleViewModeChange("card")}
                                title="Card View"
                            >
                                <i className="fas fa-th-large"></i>
                            </button>
                            <button
                                type="button"
                                className={`btn btn-outline-secondary ${
                                    viewMode === "table" ? "active" : ""
                                }`}
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
                                <label className="form-label font-medium">
                                    Date From
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_from}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_from",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Date To
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={pendingFilters.date_to}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "date_to",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Client
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Client name"
                                    value={pendingFilters.client}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "client",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Service Category
                                </label>
                                <select
                                    className="form-select"
                                    value={pendingFilters.service_category}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "service_category",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="all">All Categories</option>
                                    {serviceCategories.map((category) => (
                                        <option key={category.id} value={category.slug}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Min Quote (Rs.)
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="0"
                                    min="0"
                                    value={pendingFilters.price_min}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "price_min",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <label className="form-label font-medium">
                                    Max Quote (Rs.)
                                </label>
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="50000"
                                    min="0"
                                    value={pendingFilters.price_max}
                                    onChange={(e) =>
                                        handlePendingFilterChange(
                                            "price_max",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="col-12 mt-3">
                                <div className="d-flex gap-2 justify-content-center">
                                    <button
                                        className="btn btn-success btn-responsive"
                                        onClick={applyFilters}
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
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
                                        disabled={
                                            JSON.stringify(filters) ===
                                            JSON.stringify(pendingFilters)
                                        }
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
                            Showing {quotes.length} {activeFilter} quote
                            {quotes.length !== 1 ? "s" : ""}
                            <button
                                className="btn btn-link btn-sm text-success p-0 ms-2"
                                onClick={() => handleQuickFilterChange("all")}
                            >
                                View all quotes
                            </button>
                        </small>
                    </div>
                )}

                {/* Quotes List */}
                {viewMode === "table" ? (
                    <ProviderQuotesTable
                        quotes={quotes}
                        loading={loading}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onQuoteAction={handleQuoteAction}
                    />
                ) : (
                    <ProviderQuotesCardView
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
                                <li
                                    className={`page-item ${
                                        pagination.current_page === 1
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page - 1,
                                            }))
                                        }
                                        disabled={pagination.current_page === 1}
                                    >
                                        Previous
                                    </button>
                                </li>
                                {Array.from(
                                    {
                                        length: Math.min(
                                            5,
                                            pagination.last_page
                                        ),
                                    },
                                    (_, i) => {
                                        const page = i + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${
                                                    pagination.current_page ===
                                                    page
                                                        ? "active"
                                                        : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() =>
                                                        setPagination(
                                                            (prev) => ({
                                                                ...prev,
                                                                current_page:
                                                                    page,
                                                            })
                                                        )
                                                    }
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    }
                                )}
                                <li
                                    className={`page-item ${
                                        pagination.current_page ===
                                        pagination.last_page
                                            ? "disabled"
                                            : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() =>
                                            setPagination((prev) => ({
                                                ...prev,
                                                current_page:
                                                    prev.current_page + 1,
                                            }))
                                        }
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
                                        }
                                    >
                                        Next
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}

                {/* Business Tips */}
                {quotes.length > 0 && (
                    <div className="business-tips mt-5 p-4 bg-light rounded-4">
                        <div className="row text-center">
                            <div className="col-md-3">
                                <Link
                                    to="/provider/services"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-cog fa-2x text-success mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        Manage Services
                                    </span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    to="/provider/requests"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-search fa-2x text-info mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        Browse Requests
                                    </span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    to="/provider/appointments"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-calendar-check fa-2x text-warning mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        My Appointments
                                    </span>
                                </Link>
                            </div>
                            <div className="col-md-3">
                                <Link
                                    to="/provider/profile"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-user-cog fa-2x text-primary mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        Update Profile
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles using app.css design system */}
            <style>{`
                .filter-tab {
                    display: inline-flex;
                    align-items: center;
                    padding: var(--space-2) var(--space-4);
                    border: 2px solid var(--border-color);
                    border-radius: var(--border-radius-xl);
                    background: var(--bg-white);
                    color: var(--text-secondary);
                    text-decoration: none;
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    transition: var(--transition);
                    cursor: pointer;
                }
                
                .filter-tab:hover {
                    border-color: var(--success-color);
                    color: var(--success-color);
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-sm);
                }
                
                .filter-tab.active {
                    border-color: var(--success-color);
                    background: var(--success-color);
                    color: white;
                    box-shadow: var(--shadow-md);
                }
                
                .filter-tab.active .badge {
                    background-color: rgba(255, 255, 255, 0.2) !important;
                    color: white !important;
                }
                
                .view-toggle .btn {
                    border-color: var(--border-color);
                    transition: var(--transition);
                }
                
                .view-toggle .btn.active {
                    background-color: var(--success-color);
                    border-color: var(--success-color);
                    color: white;
                }
                
                .pagination .page-link {
                    color: var(--success-color);
                    transition: var(--transition-fast);
                }
                
                .pagination .page-item.active .page-link {
                    background-color: var(--success-color);
                    border-color: var(--success-color);
                }
                
                .quote-card {
                    border-radius: var(--border-radius-lg);
                    transition: var(--transition);
                    border: 1px solid var(--border-color);
                }
                
                .quote-card:hover {
                    transform: translateY(-4px);
                    box-shadow: var(--shadow-lg);
                    border-color: var(--success-color);
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

                .page-header {
                    margin-bottom: var(--space-6);
                }

                .page-title {
                    color: var(--text-primary);
                    font-weight: var(--font-bold);
                    margin-bottom: var(--space-2);
                }

                .page-subtitle {
                    color: var(--text-secondary);
                    font-size: var(--text-base);
                }

                .business-stats .card {
                    border-radius: var(--border-radius-lg);
                    border: none;
                    box-shadow: var(--shadow-sm);
                    transition: var(--transition);
                }

                .business-stats .card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                @media (max-width: 768px) {
                    .btn-responsive {
                        font-size: var(--text-xs);
                        padding: var(--space-2) var(--space-3);
                    }
                    
                    .filter-tab {
                        font-size: var(--text-xs);
                        padding: var(--space-2) var(--space-3);
                    }
                }
            `}</style>
        </ProviderLayout>
    );
};

export default ProviderQuotesListEnhanced;
