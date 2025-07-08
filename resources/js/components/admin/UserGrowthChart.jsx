import React, { useEffect, useRef, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const UserGrowthChart = ({
    data = [],
    loading = false,
    period = "30",
    chartType = "line",
    onPeriodChange = null,
    className = "",
}) => {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        if (!data || data.length === 0) {
            setChartData(null);
            return;
        }

        // Process data for chart
        const labels = data.map((item) => {
            const date = new Date(item.month || item.date);
            return period === "7"
                ? date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                  })
                : date.toLocaleDateString([], {
                      month: "short",
                      year: "numeric",
                  });
        });

        const userData = data.map((item) => item.users || 0);
        const clientData = data.map((item) => item.clients || 0);
        const providerData = data.map((item) => item.providers || 0);

        const datasets = [
            {
                label: "Total Users",
                data: userData,
                borderColor: "rgba(13, 110, 253, 1)",
                backgroundColor:
                    chartType === "line"
                        ? "rgba(13, 110, 253, 0.1)"
                        : "rgba(13, 110, 253, 0.8)",
                borderWidth: 2,
                fill: chartType === "line",
                tension: 0.4,
                pointBackgroundColor: "rgba(13, 110, 253, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ];

        // Add client and provider data if available
        if (clientData.some((val) => val > 0)) {
            datasets.push({
                label: "Clients",
                data: clientData,
                borderColor: "rgba(25, 135, 84, 1)",
                backgroundColor:
                    chartType === "line"
                        ? "rgba(25, 135, 84, 0.1)"
                        : "rgba(25, 135, 84, 0.8)",
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: "rgba(25, 135, 84, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
            });
        }

        if (providerData.some((val) => val > 0)) {
            datasets.push({
                label: "Service Providers",
                data: providerData,
                borderColor: "rgba(255, 193, 7, 1)",
                backgroundColor:
                    chartType === "line"
                        ? "rgba(255, 193, 7, 0.1)"
                        : "rgba(255, 193, 7, 0.8)",
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointBackgroundColor: "rgba(255, 193, 7, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
            });
        }

        setChartData({
            labels,
            datasets,
        });

        // Chart options
        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                        },
                    },
                },
                tooltip: {
                    mode: "index",
                    intersect: false,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleColor: "#fff",
                    bodyColor: "#fff",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        title: function (context) {
                            return `Period: ${context[0].label}`;
                        },
                        label: function (context) {
                            return `${context.dataset.label}: ${context.parsed.y} users`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: "Time Period",
                        font: {
                            size: 12,
                            weight: "bold",
                        },
                    },
                    grid: {
                        display: false,
                    },
                    ticks: {
                        maxTicksLimit: 8,
                    },
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: "Number of Users",
                        font: {
                            size: 12,
                            weight: "bold",
                        },
                    },
                    beginAtZero: true,
                    grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                    },
                    ticks: {
                        callback: function (value) {
                            if (value >= 1000) {
                                return value / 1000 + "K";
                            }
                            return value;
                        },
                    },
                },
            },
            interaction: {
                mode: "nearest",
                axis: "x",
                intersect: false,
            },
            elements: {
                point: {
                    hoverRadius: 8,
                },
            },
        });
    }, [data, period, chartType]);

    const ChartSkeleton = () => (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "300px" }}
        >
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="text-muted">Loading chart data...</h6>
            </div>
        </div>
    );

    const EmptyState = () => (
        <div
            className="d-flex align-items-center justify-content-center"
            style={{ height: "300px" }}
        >
            <div className="text-center">
                <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">No Data Available</h5>
                <p className="text-muted mb-0">
                    Chart will appear when data is available
                </p>
            </div>
        </div>
    );

    const periodOptions = [
        { value: "7", label: "7D", text: "Last 7 Days" },
        { value: "30", label: "30D", text: "Last 30 Days" },
        { value: "90", label: "90D", text: "Last 90 Days" },
        { value: "365", label: "1Y", text: "Last Year" },
    ];

    const chartTypeOptions = [
        { value: "line", icon: "fas fa-chart-line", label: "Line Chart" },
        { value: "bar", icon: "fas fa-chart-bar", label: "Bar Chart" },
    ];

    return (
        <div className={`card border-0 shadow-sm ${className}`}>
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <h5 className="card-title mb-0">
                        <i className="fas fa-chart-line text-primary me-2"></i>
                        User Growth Trend
                    </h5>

                    <div className="d-flex gap-2 flex-wrap">
                        {/* Chart Type Toggle */}
                        <div className="btn-group btn-group-sm" role="group">
                            {chartTypeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`btn ${
                                        chartType === option.value
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={() =>
                                        onPeriodChange &&
                                        onPeriodChange({
                                            chartType: option.value,
                                        })
                                    }
                                    title={option.label}
                                >
                                    <i className={option.icon}></i>
                                </button>
                            ))}
                        </div>

                        {/* Period Selector */}
                        <div className="btn-group btn-group-sm" role="group">
                            {periodOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`btn ${
                                        period === option.value
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={() =>
                                        onPeriodChange &&
                                        onPeriodChange({ period: option.value })
                                    }
                                    title={option.text}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body">
                <div style={{ height: "300px", position: "relative" }}>
                    {loading ? (
                        <ChartSkeleton />
                    ) : !chartData ? (
                        <EmptyState />
                    ) : (
                        <>
                            {chartType === "line" ? (
                                <Line
                                    ref={chartRef}
                                    data={chartData}
                                    options={chartOptions}
                                />
                            ) : (
                                <Bar
                                    ref={chartRef}
                                    data={chartData}
                                    options={chartOptions}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chart Footer with Summary */}
            {chartData && !loading && (
                <div className="card-footer bg-light">
                    <div className="row text-center">
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Total Growth
                            </small>
                            <strong className="text-success">
                                +
                                {chartData.datasets[0].data.reduce(
                                    (a, b) => a + b,
                                    0
                                )}
                            </strong>
                        </div>
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Peak Day
                            </small>
                            <strong className="text-primary">
                                {Math.max(...chartData.datasets[0].data)}
                            </strong>
                        </div>
                        <div className="col-4">
                            <small className="text-muted d-block">
                                Average
                            </small>
                            <strong className="text-info">
                                {Math.round(
                                    chartData.datasets[0].data.reduce(
                                        (a, b) => a + b,
                                        0
                                    ) / chartData.datasets[0].data.length
                                )}
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserGrowthChart;
