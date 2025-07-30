import React, { useState, useEffect } from "react";
import StaffLayout from "../../../components/layouts/StaffLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { useStaffReportsPDF } from "../../../components/shared/hooks/useStaffReportsPDF.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const StaffReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        end_date: new Date().toISOString().split("T")[0],
    });

    const { generateReportsPDF, generateQuickReportsPDF, generateChartsPDF } =
        useStaffReportsPDF();

    const quickFilters = [
        { label: "Last 7 Days", days: 7 },
        { label: "Last 30 Days", days: 30 },
        { label: "Last 90 Days", days: 90 },
        { label: "This Year", days: 365 },
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value,
        });
    };

    const setQuickFilter = (days) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        setFilters({
            start_date: startDate.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
        });
    };

    const isQuickFilterActive = (days) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        return (
            filters.start_date === startDate.toISOString().split("T")[0] &&
            filters.end_date === endDate.toISOString().split("T")[0]
        );
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(
                `/api/staff/reports/analytics?${queryParams}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                        Accept: "application/json",
                    },
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response status:', response.status);
                console.error('Response text:', errorText);
                throw new Error(`Failed to fetch analytics data: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log('Analytics data received:', data);
            setAnalyticsData(data.data);
        } catch (error) {
            console.error("Error fetching analytics:", error);
            alert(`Failed to fetch analytics data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const printReports = () => {
        if (!analyticsData) {
            alert(
                "No data available to generate report. Please wait for the data to load."
            );
            return;
        }

        generateReportsPDF(analyticsData, filters);
    };

    const generateQuickReport = (reportType) => {
        if (!analyticsData) {
            alert(
                "No data available to generate report. Please wait for the data to load."
            );
            return;
        }

        generateQuickReportsPDF(analyticsData, filters, reportType);
    };

    const printChartsOnly = () => {
        if (!analyticsData) {
            alert(
                "No data available to generate charts. Please wait for the data to load."
            );
            return;
        }

        generateChartsPDF(analyticsData, filters);
    };

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    // Chart configurations
    const userGrowthChartData = {
        labels: analyticsData?.user_growth?.labels || [],
        datasets: [
            {
                label: "New Clients",
                data: analyticsData?.user_growth?.clients || [],
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "New Providers",
                data: analyticsData?.user_growth?.providers || [],
                backgroundColor: "rgba(153, 102, 255, 0.6)",
                borderColor: "rgba(153, 102, 255, 1)",
                borderWidth: 1,
            },
        ],
    };

    const serviceStatisticsData = {
        labels: analyticsData?.service_statistics?.labels || [],
        datasets: [
            {
                data: analyticsData?.service_statistics?.data || [],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(54, 162, 235, 0.8)",
                    "rgba(255, 205, 86, 0.8)",
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(153, 102, 255, 0.8)",
                    "rgba(255, 159, 64, 0.8)",
                    "rgba(199, 199, 199, 0.8)",
                    "rgba(83, 102, 255, 0.8)",
                    "rgba(255, 99, 255, 0.8)",
                    "rgba(99, 255, 132, 0.8)",
                ],
            },
        ],
    };

    const appointmentAnalyticsData = {
        labels: analyticsData?.appointment_analytics?.labels || [],
        datasets: [
            {
                data: analyticsData?.appointment_analytics?.data || [],
                backgroundColor: [
                    "rgba(40, 167, 69, 0.8)", // Green for completed
                    "rgba(23, 162, 184, 0.8)", // Blue for confirmed
                    "rgba(255, 193, 7, 0.8)", // Yellow for pending
                    "rgba(220, 53, 69, 0.8)", // Red for cancelled
                ],
            },
        ],
    };

    const revenueAnalyticsData = {
        labels: analyticsData?.revenue_analytics?.labels || [],
        datasets: [
            {
                label: "Platform Revenue (LKR)",
                data: analyticsData?.revenue_analytics?.data || [],
                fill: false,
                borderColor: "rgba(54, 162, 235, 1)",
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                tension: 0.1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        if (context.dataset.label?.includes("Revenue")) {
                            return (
                                context.dataset.label +
                                ": LKR " +
                                context.parsed.y.toLocaleString()
                            );
                        }
                        return context.dataset.label + ": " + context.parsed.y;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        // Format y-axis labels for revenue charts
                        if (
                            this.chart.canvas.parentNode
                                .querySelector(".card-title")
                                ?.textContent?.includes("Revenue")
                        ) {
                            return "LKR " + value.toLocaleString();
                        }
                        return value;
                    },
                },
            },
        },
    };

    return (
        <StaffLayout>
            <div className="page-content">
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">
                            Management Reports & Analytics
                        </h1>
                        <p className="page-subtitle">
                            Platform analytics from {filters.start_date} to{" "}
                            {filters.end_date}
                            {loading && (
                                <span className="ms-2">
                                    <i className="fas fa-spinner fa-spin"></i>{" "}
                                    Updating...
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="btn-group">
                        <button
                            className="btn btn-primary"
                            onClick={printReports}
                            disabled={loading || !analyticsData}
                        >
                            <i className="fas fa-file-pdf me-2"></i>
                            Generate PDF Report
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary dropdown-toggle dropdown-toggle-split"
                            data-bs-toggle="dropdown"
                            disabled={loading || !analyticsData}
                        >
                            <span className="visually-hidden">
                                Toggle Dropdown
                            </span>
                        </button>
                        <ul className="dropdown-menu">
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        printChartsOnly();
                                    }}
                                >
                                    <i className="fas fa-chart-line me-2"></i>
                                    Charts Dashboard
                                </a>
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generateQuickReport("platform_summary");
                                    }}
                                >
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Platform Summary
                                </a>
                            </li>
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generateQuickReport("user_growth");
                                    }}
                                >
                                    <i className="fas fa-users me-2"></i>User
                                    Growth Report
                                </a>
                            </li>
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generateQuickReport(
                                            "revenue_analytics"
                                        );
                                    }}
                                >
                                    <i className="fas fa-money-bill me-2"></i>
                                    Revenue Report
                                </a>
                            </li>
                            <li>
                                <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        generateQuickReport(
                                            "service_analytics"
                                        );
                                    }}
                                >
                                    <i className="fas fa-concierge-bell me-2"></i>
                                    Service Analytics
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Filters */}
                <div className="card mb-4">
                    <div className="card-header">
                        <h5 className="card-title mb-0">Filter Period</h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3 mb-3">
                            <div className="col">
                                <div className="btn-group" role="group">
                                    {quickFilters.map((filter, index) => (
                                        <button
                                            key={index}
                                            className={`btn btn-sm ${
                                                isQuickFilterActive(filter.days)
                                                    ? "btn-primary"
                                                    : "btn-outline-primary"
                                            }`}
                                            onClick={() =>
                                                setQuickFilter(filter.days)
                                            }
                                        >
                                            {filter.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-4">
                                <label className="form-label">Start Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="start_date"
                                    value={filters.start_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">End Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="end_date"
                                    value={filters.end_date}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="text-center mb-4">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                {analyticsData && (
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-info">
                                        {analyticsData.summary?.total_users ||
                                            0}
                                    </h3>
                                    <p className="text-muted mb-0">
                                        Total Users
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-primary">
                                        {analyticsData.summary
                                            ?.total_services || 0}
                                    </h3>
                                    <p className="text-muted mb-0">
                                        Total Services
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-warning">
                                        {analyticsData.summary?.success_rate ||
                                            0}
                                        %
                                    </h3>
                                    <p className="text-muted mb-0">
                                        Success Rate
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-success">
                                        {analyticsData.summary?.total_revenue ||
                                            "LKR 0.00"}
                                    </h3>
                                    <p className="text-muted mb-0">
                                        Platform Revenue
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Charts */}
                {analyticsData && (
                    <div className="row">
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">
                                        User Growth Trends
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <Bar
                                        data={userGrowthChartData}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">
                                        Services by Category
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <Pie data={serviceStatisticsData} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">
                                        Appointment Status Distribution
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <Pie data={appointmentAnalyticsData} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">
                                        Platform Revenue Analytics
                                    </h5>
                                </div>
                                <div className="card-body">
                                    <Line
                                        data={revenueAnalyticsData}
                                        options={chartOptions}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffReportsPage;
