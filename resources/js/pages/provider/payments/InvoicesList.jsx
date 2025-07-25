import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import InvoicesTable from "../../../components/provider/invoices/InvoicesTable";
import invoiceService from "../../../services/invoiceService";
import InvoiceCard from "../../../components/provider/invoices/InvoiceCard";

const InvoicesList = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [filters, setFilters] = useState({
        status: "",
        payment_status: "",
        search: "",
        date_from: "",
        date_to: "",
        price_min: "",
        price_max: "",
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
            price_min: "",
            price_max: "",
        });
    };

    // Handle table sorting
    const handleSort = (field) => {
        const newDirection =
            sortField === field && sortDirection === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortDirection(newDirection);
        // Apply sorting to current invoices
        const sortedInvoices = [...invoices].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            // Handle nested properties
            if (field === 'client_name') {
                aValue = a.client?.name || `${a.client?.first_name || ''} ${a.client?.last_name || ''}`.trim();
                bValue = b.client?.name || `${b.client?.first_name || ''} ${b.client?.last_name || ''}`.trim();
            }
            
            if (field === 'total_amount') {
                aValue = parseFloat(aValue || 0);
                bValue = parseFloat(bValue || 0);
            }
            
            if (newDirection === "asc") {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        setInvoices(sortedInvoices);
    };

    // Handle invoice actions
    const handleInvoiceAction = async (action, invoice) => {
        try {
            switch (action) {
                case "view":
                    navigate(`/provider/invoices/${invoice.id}`);
                    break;
                case "edit":
                    navigate(`/provider/invoices/${invoice.id}/edit`);
                    break;
                case "send":
                    // Implement send invoice logic
                    const sendResult = await invoiceService.sendInvoice(invoice.id);
                    if (sendResult.success) {
                        loadInvoices(); // Reload to get updated status
                    }
                    break;
                case "resend":
                    // Implement resend invoice logic
                    const resendResult = await invoiceService.sendInvoice(invoice.id);
                    if (resendResult.success) {
                        loadInvoices();
                    }
                    break;
                case "mark_paid":
                    // Implement mark as paid logic
                    const markPaidResult = await invoiceService.markAsPaid(invoice.id);
                    if (markPaidResult.success) {
                        loadInvoices();
                    }
                    break;
                case "download":
                    // Implement download PDF logic
                    const downloadResult = await invoiceService.downloadPDF(invoice.id);
                    if (downloadResult.success) {
                        // Handle PDF download
                        const link = document.createElement('a');
                        link.href = downloadResult.pdfUrl;
                        link.download = `invoice-${invoice.invoice_number}.pdf`;
                        link.click();
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Failed to handle invoice action:", error);
            // Could add a toast notification here
        }
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
                        <button
                            className="btn btn-outline-orange"
                            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                        >
                            <i className={`fas ${viewMode === "table" ? "fa-th-large" : "fa-table"} me-2`}></i>
                            {viewMode === "table" ? "Card View" : "Table View"}
                        </button>
                        <button className="btn btn-outline-orange">
                            <i className="fas fa-download me-2"></i>
                            Export
                        </button>
                        <button 
                            className="btn btn-orange"
                            onClick={() => navigate('/provider/invoices/create')}
                        >
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
                            <div className="col-xl-3 col-lg-4 col-md-6">
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
                            <div className="col-xl-2 col-lg-3 col-md-6">
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
                            <div className="col-xl-2 col-lg-3 col-md-6">
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
                            <div className="col-xl-1 col-lg-2 col-md-6">
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
                            <div className="col-xl-1 col-lg-2 col-md-6">
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

                            {/* Price Range */}
                            <div className="col-xl-1 col-lg-2 col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">Rs.</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Min Price"
                                        value={filters.price_min}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "price_min",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="col-xl-1 col-lg-2 col-md-6">
                                <div className="input-group">
                                    <span className="input-group-text">Rs.</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Max Price"
                                        value={filters.price_max}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "price_max",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
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

                {/* Invoices Display */}
                {viewMode === "table" ? (
                    <InvoicesTable
                        invoices={invoices}
                        loading={loading}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onInvoiceAction={handleInvoiceAction}
                    />
                ) : (
                    <>
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
                        {!loading && invoices.length > 0 && (
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
                                <button 
                                    className="btn btn-orange"
                                    onClick={() => navigate('/provider/invoices/create')}
                                >
                                    <i className="fas fa-plus me-2"></i>
                                    Create Your First Invoice
                                </button>
                            </div>
                        )}
                    </>
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
