import React, { useState, useEffect } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import clientService from "../../../services/clientService";
import LoadingSpinner from "../../../components/LoadingSpinner";
import QuoteStatusBadge from "../../../components/client/quotes/QuoteStatusBadge";

const QuotesList = () => {
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(
        searchParams.get("status") || "all"
    );
    const [quoteCounts, setQuoteCounts] = useState({
        all: 0,
        pending: 0,
        quoted: 0,
        accepted: 0,
        declined: 0,
        expired: 0,
    });

    useEffect(() => {
        loadQuotes();

        // Show success message if navigated from quote request
        if (location.state?.message) {
            // You could show a toast notification here
            console.log(location.state.message);
        }
    }, [activeTab]);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            // Load quotes based on active tab
            const params = activeTab === "all" ? {} : { status: activeTab };

            // console.log("Loading quotes with params:", params);

            const response = await clientService.getQuotes(params);

            // console.log("Quotes API response:", response);
            // console.log("Response success:", response.success);
            // console.log("Response data:", response.data);
            // console.log("Response fallback:", response.fallback);

            if (response.success) {
                // console.log("Setting quotes to:", response.data);
                setQuotes(response.data);

                // Also load quote counts for badges
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

    // Load quote counts for each status to show in tab badges
    const loadQuoteCounts = async () => {
        try {
            const statusList = [
                "pending",
                "quoted",
                "accepted",
                "declined",
                "expired",
            ];
            const countPromises = statusList.map((status) =>
                clientService.getQuotes({ status, count_only: true })
            );

            // Also get total count
            const allPromise = clientService.getQuotes({ count_only: true });

            const responses = await Promise.all([allPromise, ...countPromises]);

            const newCounts = {
                all: responses[0].success
                    ? responses[0].count || responses[0].data?.length || 0
                    : 0,
                pending: responses[1].success
                    ? responses[1].count || responses[1].data?.length || 0
                    : 0,
                quoted: responses[2].success
                    ? responses[2].count || responses[2].data?.length || 0
                    : 0,
                accepted: responses[3].success
                    ? responses[3].count || responses[3].data?.length || 0
                    : 0,
                declined: responses[4].success
                    ? responses[4].count || responses[4].data?.length || 0
                    : 0,
                expired: responses[5].success
                    ? responses[5].count || responses[5].data?.length || 0
                    : 0,
            };

            setQuoteCounts(newCounts);
        } catch (error) {
            console.error("Failed to load quote counts:", error);
            // Use fallback counts from current data
            const currentCounts = {
                all: quotes.length,
                pending: quotes.filter((q) => q.status === "pending").length,
                quoted: quotes.filter((q) => q.status === "quoted").length,
                accepted: quotes.filter((q) => q.status === "accepted").length,
                declined: quotes.filter((q) => q.status === "declined").length,
                expired: quotes.filter((q) => q.status === "expired").length,
            };
            setQuoteCounts(currentCounts);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);

        // Update URL params
        if (tab === "all") {
            searchParams.delete("status");
        } else {
            searchParams.set("status", tab);
        }
        setSearchParams(searchParams);
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            quoted: "bg-info text-white",
            accepted: "bg-success text-white",
            declined: "bg-danger text-white",
            expired: "bg-secondary text-white",
            withdrawn: "bg-dark text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    // Define tab configuration with labels and counts
    const tabConfig = [
        { key: "all", label: "All Quotes", count: quoteCounts.all },
        { key: "pending", label: "Pending", count: quoteCounts.pending },
        { key: "quoted", label: "Received", count: quoteCounts.quoted },
        { key: "accepted", label: "Accepted", count: quoteCounts.accepted },
        { key: "declined", label: "Declined", count: quoteCounts.declined },
        { key: "expired", label: "Expired", count: quoteCounts.expired },
    ];

    return (
        <ClientLayout>
            <div className="quotes-page">
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Quotes</h2>
                        <p className="text-muted mb-0">
                            Manage your service quote requests
                            {quoteCounts.all > 0 && (
                                <span className="ms-2">
                                    ({quoteCounts.all} total quote
                                    {quoteCounts.all !== 1 ? "s" : ""})
                                </span>
                            )}
                        </p>
                    </div>
                    <Link to="/client/services" className="btn btn-primary">
                        <i className="fas fa-plus me-2"></i>
                        Request New Quote
                    </Link>
                </div>

                {/* Enhanced Tabs with Counts */}
                <div className="quotes-tabs mb-4">
                    <ul className="nav nav-tabs">
                        {tabConfig.map((tab) => (
                            <li key={tab.key} className="nav-item">
                                <button
                                    className={`nav-link d-flex align-items-center ${
                                        activeTab === tab.key ? "active" : ""
                                    }`}
                                    onClick={() => handleTabChange(tab.key)}
                                >
                                    <span>{tab.label}</span>
                                    {tab.count > 0 && (
                                        <span
                                            className={`badge rounded-pill ms-2 ${
                                                activeTab === tab.key
                                                    ? "bg-primary text-white"
                                                    : "bg-light text-muted"
                                            }`}
                                        >
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Filter Summary */}
                {activeTab !== "all" && quotes.length > 0 && (
                    <div className="filter-summary mb-3">
                        <small className="text-muted">
                            Showing {quotes.length} {activeTab} quote
                            {quotes.length !== 1 ? "s" : ""}
                            <button
                                className="btn btn-link btn-sm text-primary p-0 ms-2"
                                onClick={() => handleTabChange("all")}
                            >
                                View all quotes
                            </button>
                        </small>
                    </div>
                )}

                {/* Quotes List */}
                {loading ? (
                    <LoadingSpinner message="Loading quotes..." />
                ) : (
                    <div className="quotes-list">
                        {quotes.length > 0 ? (
                            <>
                                {/* Sort indicator for all quotes */}
                                {activeTab === "all" && (
                                    <div className="sort-info mb-3 d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            Sorted by most recent first
                                        </small>
                                        <div className="view-options">
                                            {/* Could add grid/list view toggle here */}
                                        </div>
                                    </div>
                                )}

                                {quotes.map((quote) => (
                                    <div
                                        key={quote.id}
                                        className="quote-card card border-0 shadow-sm mb-3"
                                    >
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div>
                                                            <h6 className="fw-bold mb-1">
                                                                {
                                                                    quote.service_title
                                                                }
                                                            </h6>
                                                            <div className="text-muted small">
                                                                Quote #
                                                                {
                                                                    quote.quote_number
                                                                }{" "}
                                                                • by{" "}
                                                                {
                                                                    quote.provider_name
                                                                }
                                                            </div>
                                                        </div>
                                                        {/* Use the new QuoteStatusBadge component */}
                                                        <QuoteStatusBadge
                                                            status={
                                                                quote.status
                                                            }
                                                        />
                                                    </div>

                                                    <div className="quote-details">
                                                        <div className="row">
                                                            <div className="col-6">
                                                                <small className="text-muted">
                                                                    Requested
                                                                    Date:
                                                                </small>
                                                                <div className="fw-semibold">
                                                                    {new Date(
                                                                        quote.requested_date
                                                                    ).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <div className="col-6">
                                                                <small className="text-muted">
                                                                    Location:
                                                                </small>
                                                                <div className="fw-semibold">
                                                                    {
                                                                        quote.location_summary
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Show creation/update date for all view */}
                                                        {activeTab ===
                                                            "all" && (
                                                            <div className="mt-2">
                                                                <small className="text-muted">
                                                                    <i className="fas fa-clock me-1"></i>
                                                                    {quote.status ===
                                                                    "pending"
                                                                        ? `Requested ${new Date(
                                                                              quote.created_at
                                                                          ).toLocaleDateString()}`
                                                                        : `Updated ${new Date(
                                                                              quote.updated_at
                                                                          ).toLocaleDateString()}`}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="col-md-4 text-end">
                                                    {quote.quoted_price && (
                                                        <div className="quoted-price mb-2">
                                                            <div className="text-muted small">
                                                                Quoted Price:
                                                            </div>
                                                            <div className="fw-bold text-primary h5 mb-0">
                                                                Rs.{" "}
                                                                {
                                                                    quote.quoted_price
                                                                }
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Show urgency for pending quotes */}
                                                    {quote.status ===
                                                        "pending" &&
                                                        quote.urgency &&
                                                        quote.urgency !==
                                                            "normal" && (
                                                            <div className="mb-2">
                                                                <span
                                                                    className={`badge ${
                                                                        quote.urgency ===
                                                                        "urgent"
                                                                            ? "bg-warning text-dark"
                                                                            : quote.urgency ===
                                                                              "emergency"
                                                                            ? "bg-danger text-white"
                                                                            : "bg-secondary"
                                                                    }`}
                                                                >
                                                                    {
                                                                        quote.urgency
                                                                    }
                                                                </span>
                                                            </div>
                                                        )}

                                                    <div className="quote-actions">
                                                        <Link
                                                            to={`/client/quotes/${quote.id}`}
                                                            className="btn btn-outline-primary btn-sm"
                                                        >
                                                            <i className="fas fa-eye me-1"></i>
                                                            View Details
                                                        </Link>

                                                        {/* Quick action for quoted status */}
                                                        {quote.status ===
                                                            "quoted" && (
                                                            <Link
                                                                to={`/client/quotes/${quote.id}#actions`}
                                                                className="btn btn-success btn-sm ms-2"
                                                            >
                                                                <i className="fas fa-check me-1"></i>
                                                                Respond
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="no-quotes text-center py-5">
                                <i className="fas fa-quote-left fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">
                                    {activeTab === "all"
                                        ? "No quotes yet"
                                        : `No ${activeTab} quotes`}
                                </h5>
                                <p className="text-muted">
                                    {activeTab === "all"
                                        ? "You haven't requested any quotes yet"
                                        : activeTab === "pending"
                                        ? "You don't have any pending quote requests"
                                        : `No ${activeTab} quotes found`}
                                </p>

                                {activeTab === "all" ||
                                activeTab === "pending" ? (
                                    <Link
                                        to="/client/services"
                                        className="btn btn-primary"
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        Browse Services & Request Quotes
                                    </Link>
                                ) : (
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => handleTabChange("all")}
                                    >
                                        <i className="fas fa-list me-2"></i>
                                        View All Quotes
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Actions Footer */}
                {quotes.length > 0 && (
                    <div className="quick-actions-footer mt-5 p-4 bg-light rounded-4">
                        <div className="row text-center">
                            <div className="col-md-4">
                                <Link
                                    to="/client/services"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-plus-circle fa-2x text-primary mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        Request New Quote
                                    </span>
                                </Link>
                            </div>
                            <div className="col-md-4">
                                <Link
                                    to="/client/providers"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-users fa-2x text-info mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        Browse Providers
                                    </span>
                                </Link>
                            </div>
                            <div className="col-md-4">
                                <Link
                                    to="/client/appointments"
                                    className="text-decoration-none"
                                >
                                    <i className="fas fa-calendar-check fa-2x text-success mb-2 d-block"></i>
                                    <span className="small fw-semibold">
                                        My Appointments
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                /* Using CSS variables for consistent theming */
                .nav-tabs .nav-link.active {
                    color: var(--current-role-primary);
                    border-bottom-color: var(--current-role-primary);
                }
                .quote-card {
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .quote-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
                }
            `}</style>
        </ClientLayout>
    );
};

export default QuotesList;
