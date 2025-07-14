import React, { useState, useEffect } from "react";
import ProviderLayout from "../../../components/layouts/ProviderLayout"; // Add this import
import invoiceService from "../../../services/invoiceService";
import EarningsChart from "../../../components/provider/payments/EarningsChart";
import InvoiceStatistics from "../../../components/provider/payments/InvoiceStatistics";

const EarningsOverview = () => {
    const [statistics, setStatistics] = useState({});
    const [earningsData, setEarningsData] = useState({});
    const [period, setPeriod] = useState("month");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [period]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsResult, earningsResult] = await Promise.all([
                invoiceService.getInvoiceStatistics(),
                invoiceService.getEarningsData({ period }),
            ]);

            if (statsResult.success) {
                setStatistics(statsResult.data);
            }

            if (earningsResult.success) {
                setEarningsData(earningsResult.data);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <ProviderLayout>
                <div className="text-center py-5">
                    <div className="spinner-border text-orange" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading earnings data...</p>
                </div>
            </ProviderLayout>
        );
    }

    return (
        <ProviderLayout>
            {" "}
            {/* Wrap in ProviderLayout */}
            <div className="earnings-page">
                {/* Header */}
                <div className="page-header d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-4">
                    <div className="mb-3 mb-sm-0">
                        <h2 className="fw-bold mb-1">Earnings Overview</h2>
                        <p className="text-muted mb-0">
                            Track your income and payment statistics
                        </p>
                    </div>

                    <div className="d-flex align-items-center">
                        <label className="me-2 small text-muted">Period:</label>
                        <select
                            className="form-select form-select-sm"
                            style={{ width: "auto" }}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        >
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                </div>

                {/* Statistics Cards */}
                <InvoiceStatistics statistics={statistics} />

                {/* Earnings Chart */}
                <div className="row mt-4">
                    <div className="col-12">
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-white border-bottom">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-chart-line text-orange me-2"></i>
                                    <h5 className="card-title mb-0">
                                        Earnings Trend
                                    </h5>
                                </div>
                            </div>
                            <div className="card-body">
                                <EarningsChart
                                    data={earningsData}
                                    period={period}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="row mt-4 g-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="card bg-orange text-white border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="small mb-1 opacity-75">
                                            This Month
                                        </p>
                                        <p className="h4 mb-0 fw-bold">
                                            $
                                            {statistics.this_month_earnings?.toFixed(
                                                2
                                            ) || "0.00"}
                                        </p>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-dollar-sign fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card bg-success text-white border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="small mb-1 opacity-75">
                                            Last Month
                                        </p>
                                        <p className="h4 mb-0 fw-bold">
                                            $
                                            {statistics.last_month_earnings?.toFixed(
                                                2
                                            ) || "0.00"}
                                        </p>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-chart-line fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card bg-warning text-dark border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="small mb-1 opacity-75">
                                            Pending
                                        </p>
                                        <p className="h4 mb-0 fw-bold">
                                            $
                                            {statistics.pending_amount?.toFixed(
                                                2
                                            ) || "0.00"}
                                        </p>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-clock fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6">
                        <div className="card bg-info text-white border-0 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="small mb-1 opacity-75">
                                            Total Invoices
                                        </p>
                                        <p className="h4 mb-0 fw-bold">
                                            {statistics.total_invoices || 0}
                                        </p>
                                    </div>
                                    <div className="ms-3">
                                        <i className="fas fa-file-invoice fa-2x opacity-75"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProviderLayout>
    );
};

export default EarningsOverview;
