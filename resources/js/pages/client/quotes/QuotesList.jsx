import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ClientLayout from "../../../components/layouts/ClientLayout";
import clientService from "../../../services/clientService";
import LoadingSpinner from "../../../components/LoadingSpinner";

const QuotesList = () => {
    const location = useLocation();
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("pending");

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
            const response = await clientService.getQuotes({
                status: activeTab,
            });
            if (response.success) {
                setQuotes(response.data);
            }
        } catch (error) {
            console.error("Failed to load quotes:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            quoted: "bg-info text-white",
            accepted: "bg-success text-white",
            declined: "bg-danger text-white",
            expired: "bg-secondary text-white",
        };
        return badges[status] || "bg-secondary text-white";
    };

    return (
        <ClientLayout>
            <div className="quotes-page">
                <div className="page-header d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">My Quotes</h2>
                        <p className="text-muted mb-0">
                            Manage your service quote requests
                        </p>
                    </div>
                    <Link to="/client/services" className="btn btn-purple">
                        <i className="fas fa-plus me-2"></i>
                        Request New Quote
                    </Link>
                </div>

                {/* Tabs */}
                <div className="quotes-tabs mb-4">
                    <ul className="nav nav-tabs">
                        {["pending", "quoted", "accepted", "declined"].map(
                            (tab) => (
                                <li key={tab} className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            activeTab === tab ? "active" : ""
                                        }`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab.charAt(0).toUpperCase() +
                                            tab.slice(1)}
                                    </button>
                                </li>
                            )
                        )}
                    </ul>
                </div>

                {/* Quotes List */}
                {loading ? (
                    <LoadingSpinner message="Loading quotes..." />
                ) : (
                    <div className="quotes-list">
                        {quotes.length > 0 ? (
                            quotes.map((quote) => (
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
                                                            {quote.quote_number}{" "}
                                                            • by{" "}
                                                            {
                                                                quote.provider_name
                                                            }
                                                        </div>
                                                    </div>
                                                    <span
                                                        className={`badge ${getStatusBadge(
                                                            quote.status
                                                        )}`}
                                                    >
                                                        {quote.status}
                                                    </span>
                                                </div>

                                                <div className="quote-details">
                                                    <div className="row">
                                                        <div className="col-6">
                                                            <small className="text-muted">
                                                                Requested Date:
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
                                                </div>
                                            </div>

                                            <div className="col-md-4 text-end">
                                                {quote.quoted_price && (
                                                    <div className="quoted-price mb-2">
                                                        <div className="text-muted small">
                                                            Quoted Price:
                                                        </div>
                                                        <div className="fw-bold text-purple h5 mb-0">
                                                            Rs.{" "}
                                                            {quote.quoted_price}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="quote-actions">
                                                    <Link
                                                        to={`/client/quotes/${quote.id}`}
                                                        className="btn btn-outline-purple btn-sm"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-quotes text-center py-5">
                                <i className="fas fa-quote-left fa-3x text-muted mb-3"></i>
                                <h5 className="text-muted">
                                    No {activeTab} quotes
                                </h5>
                                <p className="text-muted">
                                    {activeTab === "pending"
                                        ? "You don't have any pending quote requests"
                                        : `No ${activeTab} quotes found`}
                                </p>
                                <Link
                                    to="/client/services"
                                    className="btn btn-purple"
                                >
                                    Browse Services
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .text-purple {
                    color: #6f42c1 !important;
                }
                .btn-purple {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .btn-purple:hover {
                    background-color: #5a2d91;
                    border-color: #5a2d91;
                    color: white;
                }
                .btn-outline-purple {
                    color: #6f42c1;
                    border-color: #6f42c1;
                }
                .btn-outline-purple:hover {
                    background-color: #6f42c1;
                    border-color: #6f42c1;
                    color: white;
                }
                .nav-tabs .nav-link.active {
                    color: #6f42c1;
                    border-bottom-color: #6f42c1;
                }
            `}</style>
        </ClientLayout>
    );
};

export default QuotesList;
