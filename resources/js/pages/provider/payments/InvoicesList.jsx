import React, { useState, useEffect } from "react";
import ProviderLayout from "../../../components/layouts/ProviderLayout"; // Add this import
import invoiceService from "../../../services/invoiceService";
import InvoiceCard from "../../../components/provider/invoices/InvoiceCard";

const InvoicesList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "",
        payment_status: "",
        search: "",
        date_from: "",
        date_to: "",
    });
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        loadInvoices();
    }, [filters]);

    const loadInvoices = async (page = 1) => {
        setLoading(true);
        try {
            const result = await invoiceService.getInvoices({
                ...filters,
                page,
                per_page: 12,
            });

            if (result.success) {
                setInvoices(result.data.data || result.data);
                setPagination(result.data.meta || {});
            }
        } catch (error) {
            console.error("Error loading invoices:", error);
        }
        setLoading(false);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters({
            status: "",
            payment_status: "",
            search: "",
            date_from: "",
            date_to: "",
        });
    };

    return (
        <ProviderLayout>
            {" "}
            {/* Wrap in ProviderLayout */}
            <div className="invoices-page">
                {/* Header */}
                <div className="page-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                    <div className="mb-3 mb-sm-0">
                        <h2 className="fw-bold mb-1">Invoices</h2>
                        <p className="text-muted mb-0">
                            Manage your invoices and payments
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-orange">
                            <i className="fas fa-download me-2"></i>
                            Export
                        </button>
                        <button className="btn btn-orange">
                            <i className="fas fa-plus me-2"></i>
                            Create Invoice
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <div className="row g-3">
                            {/* Search */}
                            <div className="col-lg-3 col-md-4">
                                <div className="input-group">
                                    <span className="input-group-text">
                                        <i className="fas fa-search text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search invoices..."
                                        value={filters.search}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "search",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="col-lg-2 col-md-4">
                                <select
                                    className="form-select"
                                    value={filters.status}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "status",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {/* Payment Status Filter */}
                            <div className="col-lg-2 col-md-4">
                                <select
                                    className="form-select"
                                    value={filters.payment_status}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "payment_status",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">Payment Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">
                                        Processing
                                    </option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>

                            {/* Date From */}
                            <div className="col-lg-2 col-md-6">
                                <input
                                    type="date"
                                    className="form-control"
                                    placeholder="From Date"
                                    value={filters.date_from}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "date_from",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* Date To */}
                            <div className="col-lg-2 col-md-6">
                                <input
                                    type="date"
                                    className="form-control"
                                    placeholder="To Date"
                                    value={filters.date_to}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "date_to",
                                            e.target.value
                                        )
                                    }
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="col-lg-1 col-md-12 d-flex align-items-end">
                                <button
                                    onClick={resetFilters}
                                    className="btn btn-outline-secondary w-100"
                                    title="Reset Filters"
                                >
                                    <i className="fas fa-undo"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-5">
                        <div
                            className="spinner-border text-orange"
                            role="status"
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading invoices...</p>
                    </div>
                )}

                {/* Invoices Grid */}
                {!loading && (
                    <div className="row g-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="col-xl-4 col-lg-6 col-md-6"
                            >
                                <InvoiceCard
                                    invoice={invoice}
                                    onUpdate={loadInvoices}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && invoices.length === 0 && (
                    <div className="text-center py-5">
                        <div className="mb-4">
                            <i className="fas fa-file-invoice fa-3x text-muted"></i>
                        </div>
                        <h4 className="text-muted mb-3">No invoices found</h4>
                        <p className="text-muted mb-4">
                            Start creating invoices from your completed
                            appointments
                        </p>
                        <button className="btn btn-orange">
                            <i className="fas fa-plus me-2"></i>
                            Create Your First Invoice
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="d-flex justify-content-center mt-5">
                        <nav aria-label="Invoice pagination">
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
                                            loadInvoices(
                                                pagination.current_page - 1
                                            )
                                        }
                                        disabled={pagination.current_page === 1}
                                    >
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                </li>

                                {Array.from(
                                    { length: pagination.last_page },
                                    (_, i) => i + 1
                                ).map((page) => (
                                    <li
                                        key={page}
                                        className={`page-item ${
                                            page === pagination.current_page
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => loadInvoices(page)}
                                        >
                                            {page}
                                        </button>
                                    </li>
                                ))}

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
                                            loadInvoices(
                                                pagination.current_page + 1
                                            )
                                        }
                                        disabled={
                                            pagination.current_page ===
                                            pagination.last_page
                                        }
                                    >
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
};

export default InvoicesList;
