import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import LoadingSpinner from "../../../components/LoadingSpinner";
import QuoteCard from "../../../components/provider/quotes/QuoteCard";
import providerQuoteService from "../../../services/providerQuoteService";

const QuotesList = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State management
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "all",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        quoted: 0,
        accepted: 0,
        rejected: 0,
        withdrawn: 0,
        totalValue: 0,
    });

    useEffect(() => {
        loadQuotes();
    }, [filters, pagination.current_page]);

    useEffect(() => {
        calculateStats();
    }, [quotes]);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const params = { ...filters };
            if (filters.status === "all") delete params.status;
            params.page = pagination.current_page;
            params.with = "client,service";

            const result = await providerQuoteService.getQuotes(params);

            if (result.success) {
                setQuotes(result.data.data || []);
                if (result.data.meta) {
                    setPagination((prev) => ({
                        ...prev,
                        current_page: result.data.meta.current_page,
                        last_page: result.data.meta.last_page,
                        total: result.data.meta.total,
                    }));
                }
            }
        } catch (error) {
            console.error("Failed to load quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        setStats({
            total: quotes.length,
            pending: quotes.filter((q) => q.status === "pending").length,
            quoted: quotes.filter((q) => q.status === "quoted").length,
            accepted: quotes.filter((q) => q.status === "accepted").length,
            rejected: quotes.filter((q) => q.status === "rejected").length,
            withdrawn: quotes.filter((q) => q.status === "withdrawn").length,
            totalValue: quotes
                .filter((q) => q.status === "accepted")
                .reduce((sum, q) => sum + (q.quoted_price || 0), 0),
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== "all") newParams.set(k, v);
        });
        setSearchParams(newParams);
    };

    const handleQuoteUpdate = (updatedQuote) => {
        setQuotes((prev) =>
            prev.map((quote) =>
                quote.id === updatedQuote.id ? updatedQuote : quote
            )
        );
    };

    return (
        <ProviderLayout>
            <div className="quotes-page">
                {/* Page Header */}
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Quotes</h2>
                        <p className="text-muted mb-0">
                            Manage your service quotes and proposals
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Link
                            to="/provider/requests"
                            className="btn btn-outline-orange"
                        >
                            <i className="fas fa-search me-2"></i>
                            Browse Requests
                        </Link>
                        <Link
                            to="/provider/quotes/create"
                            className="btn btn-orange"
                        >
                            <i className="fas fa-plus me-2"></i>
                            Send Quote
                        </Link>
                    </div>
                </div>

                {/* Quote Stats */}
                <div className="row mb-4">
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-primary mb-1">
                                    <i className="fas fa-quote-left fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">{stats.total}</h4>
                                <small className="text-muted">Total</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-warning mb-1">
                                    <i className="fas fa-clock fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    {stats.pending}
                                </h4>
                                <small className="text-muted">Pending</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-info mb-1">
                                    <i className="fas fa-paper-plane fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">{stats.quoted}</h4>
                                <small className="text-muted">Sent</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-2 col-6 mb-3">
                        <div className="card border-0 shadow-sm text-center">
                            <div className="card-body py-3">
                                <div className="text-success mb-1">
                                    <i className="fas fa-check fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    {stats.accepted}
                                </h4>
                                <small className="text-muted">Accepted</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card border-0 shadow-sm text-center h-100">
                            <div className="card-body py-3">
                                <div className="text-success mb-1">
                                    <i className="fas fa-dollar-sign fa-2x"></i>
                                </div>
                                <h4 className="fw-bold mb-0">
                                    Rs. {stats.totalValue.toLocaleString()}
                                </h4>
                                <small className="text-muted">
                                    Total Value Won
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section bg-white rounded-4 shadow-sm p-3 mb-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">
                                Status
                            </label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) =>
                                    handleFilterChange("status", e.target.value)
                                }
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="quoted">Sent to Client</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="withdrawn">Withdrawn</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">
                                From Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_from}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_from",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label small fw-semibold">
                                To Date
                            </label>
                            <input
                                type="date"
                                className="form-control"
                                value={filters.date_to}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "date_to",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                        <div className="col-md-3">
                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={() => {
                                    setFilters({
                                        status: "all",
                                        date_from: "",
                                        date_to: "",
                                    });
                                    setSearchParams({});
                                }}
                            >
                                <i className="fas fa-times me-2"></i>
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quotes List */}
                {loading ? (
                    <LoadingSpinner message="Loading quotes..." />
                ) : (
                    <div className="quotes-list">
                        {quotes.length > 0 ? (
                            <>
                                <div className="results-summary mb-3">
                                    <small className="text-muted">
                                        Showing {quotes.length} of{" "}
                                        {pagination.total} quotes
                                    </small>
                                </div>

                                {quotes.map((quote) => (
                                    <QuoteCard
                                        key={quote.id}
                                        quote={quote}
                                        onQuoteUpdate={handleQuoteUpdate}
                                    />
                                ))}

                                {/* Pagination */}
                                {pagination.last_page > 1 && (
                                    <div className="pagination-wrapper d-flex justify-content-center mt-4">
                                        <nav>
                                            <ul className="pagination">
                                                <li
                                                    className={`page-item ${
                                                        pagination.current_page ===
                                                        1
                                                            ? "disabled"
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
                                                                        prev.current_page -
                                                                        1,
                                                                })
                                                            )
                                                        }
                                                        disabled={
                                                            pagination.current_page ===
                                                            1
                                                        }
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
                                                                            (
                                                                                prev
                                                                            ) => ({
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
                                                            setPagination(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    current_page:
                                                                        prev.current_page +
                                                                        1,
                                                                })
                                                            )
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
                            </>
                        ) : (
                            // Empty state
                            <div className="no-quotes text-center py-5">
                                <i className="fas fa-quote-left fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">
                                    {filters.status === "all"
                                        ? "No quotes found"
                                        : `No ${filters.status} quotes`}
                                </h5>
                                <p className="text-muted">
                                    {filters.status === "all"
                                        ? "Start sending quotes to service requests to grow your business"
                                        : "No quotes match your current filters"}
                                </p>
                                {filters.status === "all" ? (
                                    <div className="d-flex gap-2 justify-content-center">
                                        <Link
                                            to="/provider/requests"
                                            className="btn btn-orange"
                                        >
                                            <i className="fas fa-search me-2"></i>
                                            Browse Requests
                                        </Link>
                                        <Link
                                            to="/provider/quotes/create"
                                            className="btn btn-outline-orange"
                                        >
                                            <i className="fas fa-plus me-2"></i>
                                            Send Quote
                                        </Link>
                                    </div>
                                ) : (
                                    <button
                                        className="btn btn-outline-orange"
                                        onClick={() => {
                                            setFilters((prev) => ({
                                                ...prev,
                                                status: "all",
                                            }));
                                            setSearchParams({});
                                        }}
                                    >
                                        <i className="fas fa-times me-2"></i>
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Tips */}
                <div className="quote-tips mt-5 p-4 bg-light rounded-4">
                    <h6 className="fw-bold mb-3">
                        <i className="fas fa-lightbulb me-2 text-warning"></i>
                        Quote Success Tips
                    </h6>
                    <div className="row">
                        <div className="col-md-3">
                            <div className="tip-item mb-2">
                                <i className="fas fa-clock text-success me-2"></i>
                                <small>
                                    Respond within 2 hours for better chances
                                </small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="tip-item mb-2">
                                <i className="fas fa-dollar-sign text-info me-2"></i>
                                <small>Price competitively but fairly</small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="tip-item mb-2">
                                <i className="fas fa-edit text-primary me-2"></i>
                                <small>
                                    Write detailed, professional descriptions
                                </small>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="tip-item mb-2">
                                <i className="fas fa-star text-warning me-2"></i>
                                <small>
                                    Highlight your experience and reviews
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default QuotesList;
