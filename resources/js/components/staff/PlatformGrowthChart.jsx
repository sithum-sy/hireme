import React, { useState } from "react";

const PlatformGrowthChart = ({
    data = [],
    loading = false,
    period = "30",
    chartType = "line",
    onPeriodChange,
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState(period);
    const [selectedChartType, setSelectedChartType] = useState(chartType);

    const handlePeriodChange = (newPeriod) => {
        setSelectedPeriod(newPeriod);
        if (onPeriodChange) {
            onPeriodChange({ period: newPeriod, chartType: selectedChartType });
        }
    };

    const handleChartTypeChange = (newType) => {
        setSelectedChartType(newType);
        if (onPeriodChange) {
            onPeriodChange({ period: selectedPeriod, chartType: newType });
        }
    };

    // Process real data from API
    const processChartData = (rawData) => {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return [];
        }

        // Transform the API data structure to match our chart format
        // Handle various possible API response structures
        return rawData
            .map((item) => {
                // Handle different date formats
                let dateValue = item.date;
                if (!dateValue && item.created_at) {
                    dateValue = item.created_at.split("T")[0];
                }
                if (!dateValue) {
                    dateValue = new Date().toISOString().split("T")[0];
                }

                return {
                    date: dateValue,
                    users: Number(
                        item.users ||
                            item.user_count ||
                            item.total_users ||
                            item.user_registrations ||
                            0
                    ),
                    services: Number(
                        item.services ||
                            item.service_count ||
                            item.total_services ||
                            item.services_created ||
                            0
                    ),
                    appointments: Number(
                        item.appointments ||
                            item.appointment_count ||
                            item.total_appointments ||
                            item.appointments_created ||
                            0
                    ),
                };
            })
            .filter((item) => item.date && item.date !== "Invalid Date"); // Filter out items with invalid dates
    };

    const chartData = processChartData(data);

    // Calculate growth percentages
    const calculateGrowth = (data, key) => {
        if (data.length < 2) return 0;
        const current = data[data.length - 1][key] || 0;
        const previous = data[data.length - 2][key] || 0;
        if (previous === 0) return 0;
        return (((current - previous) / previous) * 100).toFixed(1);
    };

    const usersGrowth = calculateGrowth(chartData, "users");
    const servicesGrowth = calculateGrowth(chartData, "services");
    const appointmentsGrowth = calculateGrowth(chartData, "appointments");

    const ChartSkeleton = () => (
        <div className="placeholder-glow">
            <div
                className="placeholder w-100"
                style={{ height: "300px", borderRadius: "8px" }}
            ></div>
        </div>
    );

    const LineChart = ({ data }) => {
        if (!data || data.length === 0) return null;

        // Add safe number conversion
        const safeData = data.map((d) => ({
            date: d.date,
            users: Number(d.users) || 0,
            services: Number(d.services) || 0,
            appointments: Number(d.appointments) || 0,
        }));

        const maxValue =
            Math.max(
                ...safeData.map((d) =>
                    Math.max(d.users, d.services, d.appointments)
                )
            ) || 1;
        const padding = { top: 20, right: 40, bottom: 60, left: 60 };
        const chartWidth = 800 - padding.left - padding.right;
        const chartHeight = 300 - padding.top - padding.bottom;

        return (
            <div
                className="chart-container"
                style={{ height: "300px", position: "relative" }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 300"
                    style={{ overflow: "visible" }}
                >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={`grid-${i}`}
                            x1={padding.left}
                            y1={padding.top + i * (chartHeight / 4)}
                            x2={800 - padding.right}
                            y2={padding.top + i * (chartHeight / 4)}
                            stroke="#e9ecef"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Y-axis */}
                    <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={padding.left}
                        y2={300 - padding.bottom}
                        stroke="#6c757d"
                        strokeWidth="1"
                    />

                    {/* X-axis */}
                    <line
                        x1={padding.left}
                        y1={300 - padding.bottom}
                        x2={800 - padding.right}
                        y2={300 - padding.bottom}
                        stroke="#6c757d"
                        strokeWidth="1"
                    />

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <text
                            key={`y-label-${i}`}
                            x={padding.left - 10}
                            y={padding.top + i * (chartHeight / 4) + 5}
                            textAnchor="end"
                            fontSize="11"
                            fill="#6c757d"
                        >
                            {Math.round(maxValue - (i * maxValue) / 4)}
                        </text>
                    ))}

                    {/* Chart lines */}
                    {/* Users line (blue) */}
                    {data.length > 1 && (
                        <polyline
                            fill="none"
                            stroke="#0d6efd"
                            strokeWidth="3"
                            points={safeData
                                .map((d, i) => {
                                    const x =
                                        padding.left +
                                        i *
                                            (chartWidth /
                                                Math.max(
                                                    safeData.length - 1,
                                                    1
                                                ));
                                    const y =
                                        300 -
                                        padding.bottom -
                                        (d.users / maxValue) * chartHeight;
                                    return `${x},${y}`;
                                })
                                .join(" ")}
                        />
                    )}

                    {/* Services line (green) */}
                    {data.length > 1 && (
                        <polyline
                            fill="none"
                            stroke="#198754"
                            strokeWidth="3"
                            points={data
                                .map(
                                    (d, i) =>
                                        `${
                                            padding.left +
                                            i * (chartWidth / (data.length - 1))
                                        },${
                                            300 -
                                            padding.bottom -
                                            ((d.services || 0) / maxValue) *
                                                chartHeight
                                        }`
                                )
                                .join(" ")}
                        />
                    )}

                    {/* Appointments line (orange) */}
                    {data.length > 1 && (
                        <polyline
                            fill="none"
                            stroke="#fd7e14"
                            strokeWidth="3"
                            points={data
                                .map(
                                    (d, i) =>
                                        `${
                                            padding.left +
                                            i * (chartWidth / (data.length - 1))
                                        },${
                                            300 -
                                            padding.bottom -
                                            ((d.appointments || 0) / maxValue) *
                                                chartHeight
                                        }`
                                )
                                .join(" ")}
                        />
                    )}

                    {/* Data points */}
                    {data.map((d, i) => (
                        <g key={`points-${i}`}>
                            <circle
                                cx={
                                    padding.left +
                                    i *
                                        (chartWidth /
                                            Math.max(data.length - 1, 1))
                                }
                                cy={
                                    300 -
                                    padding.bottom -
                                    ((d.users || 0) / maxValue) * chartHeight
                                }
                                r="4"
                                fill="#0d6efd"
                            />
                            <circle
                                cx={
                                    padding.left +
                                    i *
                                        (chartWidth /
                                            Math.max(data.length - 1, 1))
                                }
                                cy={
                                    300 -
                                    padding.bottom -
                                    ((d.services || 0) / maxValue) * chartHeight
                                }
                                r="4"
                                fill="#198754"
                            />
                            <circle
                                cx={
                                    padding.left +
                                    i *
                                        (chartWidth /
                                            Math.max(data.length - 1, 1))
                                }
                                cy={
                                    300 -
                                    padding.bottom -
                                    ((d.appointments || 0) / maxValue) *
                                        chartHeight
                                }
                                r="4"
                                fill="#fd7e14"
                            />
                        </g>
                    ))}

                    {/* X-axis labels */}
                    {data.map((d, i) => (
                        <text
                            key={`x-label-${i}`}
                            x={
                                padding.left +
                                i * (chartWidth / Math.max(data.length - 1, 1))
                            }
                            y={300 - padding.bottom + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6c757d"
                        >
                            {new Date(d.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </text>
                    ))}
                </svg>
            </div>
        );
    };

    const BarChart = ({ data }) => {
        if (!data || data.length === 0) return null;

        // Add safe number conversion
        const safeData = data.map((d) => ({
            date: d.date,
            users: Number(d.users) || 0,
            services: Number(d.services) || 0,
            appointments: Number(d.appointments) || 0,
        }));

        const maxValue =
            Math.max(
                ...safeData.map((d) =>
                    Math.max(d.users, d.services, d.appointments)
                )
            ) || 1;
        const padding = { top: 20, right: 40, bottom: 60, left: 60 };
        const chartWidth = 800 - padding.left - padding.right;
        const chartHeight = 300 - padding.top - padding.bottom;
        const barGroupWidth = chartWidth / data.length;
        const barWidth = Math.max(barGroupWidth / 4, 8); // Minimum bar width of 8px

        return (
            <div
                className="chart-container"
                style={{ height: "300px", position: "relative" }}
            >
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 300"
                    style={{ overflow: "visible" }}
                >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={`grid-${i}`}
                            x1={padding.left}
                            y1={padding.top + i * (chartHeight / 4)}
                            x2={800 - padding.right}
                            y2={padding.top + i * (chartHeight / 4)}
                            stroke="#e9ecef"
                            strokeWidth="1"
                        />
                    ))}

                    {/* Y-axis */}
                    <line
                        x1={padding.left}
                        y1={padding.top}
                        x2={padding.left}
                        y2={300 - padding.bottom}
                        stroke="#6c757d"
                        strokeWidth="1"
                    />

                    {/* X-axis */}
                    <line
                        x1={padding.left}
                        y1={300 - padding.bottom}
                        x2={800 - padding.right}
                        y2={300 - padding.bottom}
                        stroke="#6c757d"
                        strokeWidth="1"
                    />

                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <text
                            key={`y-label-${i}`}
                            x={padding.left - 10}
                            y={padding.top + i * (chartHeight / 4) + 5}
                            textAnchor="end"
                            fontSize="11"
                            fill="#6c757d"
                        >
                            {Math.round(maxValue - (i * maxValue) / 4)}
                        </text>
                    ))}

                    {/* Bars */}
                    {data.map((d, i) => {
                        const x =
                            padding.left +
                            i * barGroupWidth +
                            (barGroupWidth - barWidth * 3) / 2;
                        const usersHeight =
                            ((d.users || 0) / maxValue) * chartHeight;
                        const servicesHeight =
                            ((d.services || 0) / maxValue) * chartHeight;
                        const appointmentsHeight =
                            ((d.appointments || 0) / maxValue) * chartHeight;

                        return (
                            <g key={`bars-${i}`}>
                                {/* Users bar */}
                                <rect
                                    x={x}
                                    y={300 - padding.bottom - usersHeight}
                                    width={barWidth}
                                    height={usersHeight}
                                    fill="#0d6efd"
                                    opacity="0.8"
                                />
                                {/* Services bar */}
                                <rect
                                    x={x + barWidth}
                                    y={300 - padding.bottom - servicesHeight}
                                    width={barWidth}
                                    height={servicesHeight}
                                    fill="#198754"
                                    opacity="0.8"
                                />
                                {/* Appointments bar */}
                                <rect
                                    x={x + barWidth * 2}
                                    y={
                                        300 -
                                        padding.bottom -
                                        appointmentsHeight
                                    }
                                    width={barWidth}
                                    height={appointmentsHeight}
                                    fill="#fd7e14"
                                    opacity="0.8"
                                />
                            </g>
                        );
                    })}

                    {/* X-axis labels */}
                    {data.map((d, i) => (
                        <text
                            key={`x-label-${i}`}
                            x={
                                padding.left +
                                i * barGroupWidth +
                                barGroupWidth / 2
                            }
                            y={300 - padding.bottom + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#6c757d"
                        >
                            {new Date(d.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                            })}
                        </text>
                    ))}
                </svg>
            </div>
        );
    };

    return (
        <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                        <h5 className="card-title mb-0">
                            <i className="fas fa-chart-line text-success me-2"></i>
                            Platform Growth
                        </h5>
                        <small className="text-muted">
                            User registrations, services, and appointments over
                            time
                        </small>
                    </div>

                    <div className="d-flex gap-2 align-items-center">
                        {/* Period Selector */}
                        <div
                            className="btn-group btn-group-sm"
                            role="group"
                            aria-label="Period selector"
                        >
                            {["7", "30", "90"].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`btn ${
                                        selectedPeriod === p
                                            ? "btn-primary"
                                            : "btn-outline-primary"
                                    }`}
                                    onClick={() => handlePeriodChange(p)}
                                >
                                    {p}d
                                </button>
                            ))}
                        </div>

                        {/* Chart Type Selector */}
                        <div
                            className="btn-group btn-group-sm"
                            role="group"
                            aria-label="Chart type selector"
                        >
                            <button
                                type="button"
                                className={`btn ${
                                    selectedChartType === "line"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => handleChartTypeChange("line")}
                                title="Line Chart"
                            >
                                <i className="fas fa-chart-line"></i>
                            </button>
                            <button
                                type="button"
                                className={`btn ${
                                    selectedChartType === "bar"
                                        ? "btn-secondary"
                                        : "btn-outline-secondary"
                                }`}
                                onClick={() => handleChartTypeChange("bar")}
                                title="Bar Chart"
                            >
                                <i className="fas fa-chart-bar"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-body">
                {loading ? (
                    <ChartSkeleton />
                ) : (
                    <>
                        {/* Chart Legend */}
                        <div className="d-flex justify-content-center mb-3">
                            <div className="d-flex gap-4">
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-2"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: "#0d6efd",
                                            borderRadius:
                                                selectedChartType === "line"
                                                    ? "50%"
                                                    : "2px",
                                        }}
                                    ></div>
                                    <small className="text-muted">Users</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-2"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: "#198754",
                                            borderRadius:
                                                selectedChartType === "line"
                                                    ? "50%"
                                                    : "2px",
                                        }}
                                    ></div>
                                    <small className="text-muted">
                                        Services
                                    </small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div
                                        className="me-2"
                                        style={{
                                            width: "12px",
                                            height: "12px",
                                            backgroundColor: "#fd7e14",
                                            borderRadius:
                                                selectedChartType === "line"
                                                    ? "50%"
                                                    : "2px",
                                        }}
                                    ></div>
                                    <small className="text-muted">
                                        Appointments
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        {selectedChartType === "line" ? (
                            <LineChart data={chartData} />
                        ) : (
                            <BarChart data={chartData} />
                        )}

                        {/* Chart Summary */}
                        <div className="row mt-4">
                            <div className="col-md-4">
                                <div className="text-center p-3 border border-success rounded">
                                    <div className="position-relative mb-1">
                                        <h6 className="text-primary mb-0 text-center">
                                            {chartData.length > 0
                                                ? (
                                                      chartData[
                                                          chartData.length - 1
                                                      ].users || 0
                                                  ).toLocaleString()
                                                : "0"}
                                        </h6>
                                        <small
                                            className={`badge position-absolute top-0 end-0 ${
                                                parseFloat(usersGrowth) >= 0
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}
                                        >
                                            {parseFloat(usersGrowth) >= 0
                                                ? "+"
                                                : ""}
                                            {usersGrowth}%
                                        </small>
                                    </div>
                                    <small className="text-muted">
                                        Total Users
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="text-center p-3 border border-success rounded">
                                    <div className="position-relative mb-1">
                                        <h6 className="text-success mb-0 text-center">
                                            {chartData.length > 0
                                                ? (
                                                      chartData[
                                                          chartData.length - 1
                                                      ].services || 0
                                                  ).toLocaleString()
                                                : "0"}
                                        </h6>
                                        <small
                                            className={`badge position-absolute top-0 end-0 ${
                                                parseFloat(servicesGrowth) >= 0
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}
                                        >
                                            {parseFloat(servicesGrowth) >= 0
                                                ? "+"
                                                : ""}
                                            {servicesGrowth}%
                                        </small>
                                    </div>
                                    <small className="text-muted">
                                        Total Services
                                    </small>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="text-center p-3 border border-warning rounded">
                                    <div className="position-relative mb-1">
                                        <h6 className="text-warning mb-0 text-center">
                                            {chartData.length > 0
                                                ? (
                                                      chartData[
                                                          chartData.length - 1
                                                      ].appointments || 0
                                                  ).toLocaleString()
                                                : "0"}
                                        </h6>
                                        <small
                                            className={`badge position-absolute top-0 end-0 ${
                                                parseFloat(
                                                    appointmentsGrowth
                                                ) >= 0
                                                    ? "bg-success"
                                                    : "bg-danger"
                                            }`}
                                        >
                                            {parseFloat(appointmentsGrowth) >= 0
                                                ? "+"
                                                : ""}
                                            {appointmentsGrowth}%
                                        </small>
                                    </div>
                                    <small className="text-muted">
                                        Total Appointments
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* No Data Message */}
                        {chartData.length === 0 && (
                            <div className="text-center py-5">
                                <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                                <h6 className="text-muted">
                                    No Growth Data Available
                                </h6>
                                <p className="text-muted small mb-0">
                                    {loading
                                        ? "Loading platform growth metrics..."
                                        : `Platform growth data for the last ${selectedPeriod} days will appear here once available.`}
                                </p>
                                {!loading && (
                                    <small className="text-muted d-block mt-2">
                                        <i className="fas fa-info-circle me-1"></i>
                                        Data updates every 15 minutes
                                    </small>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Data updated every 15 minutes
                    </small>
                </div>
            </div>
        </div>
    );
};

export default PlatformGrowthChart;
