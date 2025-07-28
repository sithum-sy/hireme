import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProviderLayout from "../../../components/layouts/ProviderLayout";
import InvoicesTable from "../../../components/provider/invoices/InvoicesTable";
import InvoiceCard from "../../../components/provider/invoices/InvoiceCard";
import QuickFilterTabs from "../../../components/provider/invoices/QuickFilterTabs";
import invoiceService from "../../../services/invoiceService";
import notificationService from "../../../services/notificationService";

const InvoicesList = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'cards'
    const [sortField, setSortField] = useState("created_at");
    const [sortDirection, setSortDirection] = useState("desc");
    const [activeFilter, setActiveFilter] = useState(
        searchParams.get("filter") || "recent"
    );
    const [filters, setFilters] = useState({
        status: searchParams.get("status") || "",
        payment_status: searchParams.get("payment_status") || "",
        search: searchParams.get("search") || "",
        date_from: searchParams.get("date_from") || "",
        date_to: searchParams.get("date_to") || "",
        price_min: searchParams.get("price_min") || "",
        price_max: searchParams.get("price_max") || "",
    });
    const [pendingFilters, setPendingFilters] = useState({ ...filters });
    const [pagination, setPagination] = useState({});
    const [stats, setStats] = useState({
        recent: 0,
        draft: 0,
        sent: 0,
        paid: 0,
        overdue: 0,
        total: 0,
    });

    useEffect(() => {
        loadInvoices();
    }, [filters]);

    // Load stats separately from filtered invoices
    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        const statusFromUrl = searchParams.get("status");
        if (statusFromUrl && statusFromUrl !== filters.status) {
            setFilters((prev) => ({
                ...prev,
                status: statusFromUrl,
            }));
        }
    }, [searchParams]);

    const loadInvoices = async (page = 1) => {
        setLoading(true);
        try {
            const params = { ...filters };
            if (filters.status === "" || filters.status === "all")
                delete params.status;
            if (
                filters.payment_status === "" ||
                filters.payment_status === "all"
            )
                delete params.payment_status;
            params.page = page;
            params.per_page = 12;

            const result = await invoiceService.getInvoices(params);

            if (result.success) {
                setInvoices(result.data.data || result.data);
                setPagination(result.data.meta || {});
            }
        } catch (error) {
            console.error("Error loading invoices:", error);
        }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            // Load invoices to calculate stats - handle pagination if needed
            let allInvoices = [];
            let currentPage = 1;
            let hasMorePages = true;

            // Load all pages of invoices to get accurate counts
            while (hasMorePages && currentPage <= 5) {
                // Limit to 5 pages max for performance
                const result = await invoiceService.getInvoices({
                    per_page: 50, // Backend max limit is 50
                    page: currentPage,
                });

                if (result.success) {
                    const pageInvoices = result.data.data || [];
                    allInvoices = [...allInvoices, ...pageInvoices];

                    // Check if there are more pages
                    const meta = result.data.meta || result.data;
                    hasMorePages = currentPage < (meta.last_page || 1);
                    currentPage++;
                } else {
                    hasMorePages = false;
                }
            }

            // Calculate stats from all loaded invoices
            const today = new Date();
            const thirtyDaysAgo = new Date(
                today.getTime() - 30 * 24 * 60 * 60 * 1000
            );

            setStats({
                recent: allInvoices.filter(
                    (inv) => new Date(inv.created_at) >= thirtyDaysAgo
                ).length,
                draft: allInvoices.filter((inv) => inv.status === "draft")
                    .length,
                sent: allInvoices.filter((inv) => inv.status === "sent").length,
                paid: allInvoices.filter((inv) => inv.status === "paid").length,
                overdue: allInvoices.filter((inv) => inv.status === "overdue")
                    .length,
                total: allInvoices.length,
            });
        } catch (error) {
            console.error("Error loading invoice stats:", error);
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== "all" && v !== "") newParams.set(k, v);
        });
        setSearchParams(newParams);
    };

    // Handle quick filter changes
    const handleQuickFilterChange = (filterType) => {
        setActiveFilter(filterType);

        // Update URL parameters
        const newParams = new URLSearchParams(searchParams);
        newParams.set("filter", filterType);
        setSearchParams(newParams);

        // Update filters based on quick filter type
        let newFilters = { ...filters };
        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        switch (filterType) {
            case "recent":
                newFilters = {
                    status: "",
                    payment_status: "",
                    search: "",
                    date_from: thirtyDaysAgo,
                    date_to: today,
                    price_min: "",
                    price_max: "",
                };
                break;
            case "draft":
                newFilters = {
                    status: "draft",
                    payment_status: "",
                    search: "",
                    date_from: "",
                    date_to: "",
                    price_min: "",
                    price_max: "",
                };
                break;
            case "sent":
                newFilters = {
                    status: "sent",
                    payment_status: "",
                    search: "",
                    date_from: "",
                    date_to: "",
                    price_min: "",
                    price_max: "",
                };
                break;
            case "paid":
                newFilters = {
                    status: "paid",
                    payment_status: "",
                    search: "",
                    date_from: "",
                    date_to: "",
                    price_min: "",
                    price_max: "",
                };
                break;
            case "overdue":
                newFilters = {
                    status: "overdue",
                    payment_status: "",
                    search: "",
                    date_from: "",
                    date_to: "",
                    price_min: "",
                    price_max: "",
                };
                break;
            case "all":
            default:
                newFilters = {
                    status: "",
                    payment_status: "",
                    search: "",
                    date_from: "",
                    date_to: "",
                    price_min: "",
                    price_max: "",
                };
                break;
        }

        setFilters(newFilters);
        setPendingFilters(newFilters);
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Handle pending filter changes (don't apply immediately)
    const handlePendingFilterChange = (key, value) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    };

    // Apply filters when Apply button is clicked
    const applyFilters = () => {
        setFilters(pendingFilters);

        // Update URL parameters
        const newParams = new URLSearchParams();
        Object.entries(pendingFilters).forEach(([k, v]) => {
            if (v && v !== "all" && v !== "") newParams.set(k, v);
        });
        setSearchParams(newParams);

        // Reset to first page when filters change
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    // Reset pending filters to match current filters
    const resetPendingFilters = () => {
        setPendingFilters({ ...filters });
    };

    const resetFilters = () => {
        const clearedFilters = {
            status: "",
            payment_status: "",
            search: "",
            date_from: "",
            date_to: "",
            price_min: "",
            price_max: "",
        };
        setFilters(clearedFilters);
        setPendingFilters(clearedFilters);
        setActiveFilter("all");
        setSearchParams({});
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
            if (field === "client_name") {
                aValue =
                    a.client?.name ||
                    `${a.client?.first_name || ""} ${
                        a.client?.last_name || ""
                    }`.trim();
                bValue =
                    b.client?.name ||
                    `${b.client?.first_name || ""} ${
                        b.client?.last_name || ""
                    }`.trim();
            }

            if (field === "total_amount") {
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
                    const sendResult = await invoiceService.sendInvoice(
                        invoice.id
                    );
                    if (sendResult.success) {
                        notificationService.success(
                            "Invoice sent successfully!"
                        );
                        loadInvoices(); // Reload to get updated status
                    } else {
                        notificationService.error(
                            sendResult.message || "Failed to send invoice"
                        );
                    }
                    break;
                // case "resend":
                //     // Implement resend invoice logic
                //     const resendResult = await invoiceService.sendInvoice(
                //         invoice.id
                //     );
                //     if (resendResult.success) {
                //         notificationService.success(
                //             "Invoice resent successfully!"
                //         );
                //         loadInvoices();
                //     } else {
                //         notificationService.error(
                //             resendResult.message || "Failed to resend invoice"
                //         );
                //     }
                //     break;
                case "mark_paid":
                    // Implement mark as paid logic
                    const markPaidResult = await invoiceService.markAsPaid(
                        invoice.id
                    );
                    if (markPaidResult.success) {
                        notificationService.success(
                            "Invoice marked as paid successfully!"
                        );
                        loadInvoices();
                    } else {
                        notificationService.error(
                            markPaidResult.message ||
                                "Failed to mark invoice as paid"
                        );
                    }
                    break;
                // case "download":
                //     // Implement download PDF logic
                //     const downloadResult = await invoiceService.downloadPDF(invoice.id);
                //     if (downloadResult.success) {
                //         // Handle PDF download
                //         const link = document.createElement('a');
                //         link.href = downloadResult.pdfUrl;
                //         link.download = `invoice-${invoice.invoice_number}.pdf`;
                //         link.click();
                //     }
                //     break;
                default:
                    break;
            }
        } catch (error) {
            console.error("Failed to handle invoice action:", error);
            notificationService.error(
                "Failed to perform action. Please try again."
            );
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
                            onClick={() =>
                                setViewMode(
                                    viewMode === "table" ? "cards" : "table"
                                )
                            }
                        >
                            <i
                                className={`fas ${
                                    viewMode === "table"
                                        ? "fa-th-large"
                                        : "fa-table"
                                } me-2`}
                            ></i>
                            {viewMode === "table" ? "Card View" : "Table View"}
                        </button>
                        <button
                            className="btn btn-orange"
                            onClick={() =>
                                navigate("/provider/invoices/create")
                            }
                        >
                            <i className="fas fa-plus me-2"></i>
                            Create Invoice
                        </button>
                    </div>
                </div>

                {/* Quick Filter Tabs */}
                <QuickFilterTabs
                    activeFilter={activeFilter}
                    onFilterChange={handleQuickFilterChange}
                    invoiceCounts={stats}
                />

                {/* Advanced Filters Section - Collapsible */}
                <div className="filters-section mb-6">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Advanced Filters</h5>
                        <button
                            className="btn btn-outline-orange btn-sm"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#advancedFilters"
                            aria-expanded="false"
                            aria-controls="advancedFilters"
                        >
                            <i className="fas fa-filter me-2"></i>
                            More Filters
                        </button>
                    </div>

                    <div className="collapse" id="advancedFilters">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body">
                                <div className="row g-3 align-items-end">
                                    {/* Search */}
                                    <div className="col-md-3 col-sm-6">
                                        <label className="form-label font-medium">
                                            Search
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-search text-muted"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search invoices..."
                                                value={pendingFilters.search}
                                                onChange={(e) =>
                                                    handlePendingFilterChange(
                                                        "search",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="col-md-3 col-sm-6">
                                        <label className="form-label font-medium">
                                            Status
                                        </label>
                                        <select
                                            className="form-select"
                                            value={pendingFilters.status}
                                            onChange={(e) =>
                                                handlePendingFilterChange(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All Statuses
                                            </option>
                                            <option value="draft">Draft</option>
                                            <option value="sent">Sent</option>
                                            <option value="paid">Paid</option>
                                            <option value="overdue">
                                                Overdue
                                            </option>
                                            <option value="cancelled">
                                                Cancelled
                                            </option>
                                        </select>
                                    </div>

                                    {/* Payment Status Filter */}
                                    <div className="col-md-3 col-sm-6">
                                        <label className="form-label font-medium">
                                            Payment Status
                                        </label>
                                        <select
                                            className="form-select"
                                            value={
                                                pendingFilters.payment_status
                                            }
                                            onChange={(e) =>
                                                handlePendingFilterChange(
                                                    "payment_status",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Payment Status
                                            </option>
                                            <option value="pending">
                                                Pending
                                            </option>
                                            <option value="processing">
                                                Processing
                                            </option>
                                            <option value="completed">
                                                Completed
                                            </option>
                                            <option value="failed">
                                                Failed
                                            </option>
                                            <option value="refunded">
                                                Refunded
                                            </option>
                                        </select>
                                    </div>

                                    {/* Client Name */}
                                    <div className="col-md-3 col-sm-6">
                                        <label className="form-label font-medium">
                                            Date Range
                                        </label>
                                        <div className="d-flex gap-2">
                                            <input
                                                type="date"
                                                className="form-control"
                                                placeholder="From Date"
                                                value={pendingFilters.date_from}
                                                onChange={(e) =>
                                                    handlePendingFilterChange(
                                                        "date_from",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <input
                                                type="date"
                                                className="form-control"
                                                placeholder="To Date"
                                                value={pendingFilters.date_to}
                                                onChange={(e) =>
                                                    handlePendingFilterChange(
                                                        "date_to",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Price Range */}
                                    <div className="col-md-6 col-sm-12">
                                        <label className="form-label font-medium">
                                            Price Range
                                        </label>
                                        <div className="d-flex gap-2">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    Rs.
                                                </span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Min Price"
                                                    value={
                                                        pendingFilters.price_min
                                                    }
                                                    onChange={(e) =>
                                                        handlePendingFilterChange(
                                                            "price_min",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    Rs.
                                                </span>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="Max Price"
                                                    value={
                                                        pendingFilters.price_max
                                                    }
                                                    onChange={(e) =>
                                                        handlePendingFilterChange(
                                                            "price_max",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-12 mt-3">
                                        <div className="d-flex gap-2 justify-content-center">
                                            <button
                                                className="btn btn-orange btn-responsive"
                                                onClick={applyFilters}
                                                disabled={
                                                    JSON.stringify(filters) ===
                                                    JSON.stringify(
                                                        pendingFilters
                                                    )
                                                }
                                            >
                                                <i className="fas fa-check me-2"></i>
                                                Apply Filters
                                            </button>
                                            <button
                                                className="btn btn-outline-secondary btn-responsive"
                                                onClick={resetFilters}
                                            >
                                                <i className="fas fa-times me-2"></i>
                                                Clear All
                                            </button>
                                            <button
                                                className="btn btn-outline-info btn-responsive"
                                                onClick={resetPendingFilters}
                                                disabled={
                                                    JSON.stringify(filters) ===
                                                    JSON.stringify(
                                                        pendingFilters
                                                    )
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
                                    <span className="visually-hidden">
                                        Loading...
                                    </span>
                                </div>
                                <p className="mt-2 text-muted">
                                    Loading invoices...
                                </p>
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
                                <h4 className="text-muted mb-3">
                                    No invoices found
                                </h4>
                                <p className="text-muted mb-4">
                                    Start creating invoices from your completed
                                    appointments
                                </p>
                                <button
                                    className="btn btn-orange"
                                    onClick={() =>
                                        navigate("/provider/invoices/create")
                                    }
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
