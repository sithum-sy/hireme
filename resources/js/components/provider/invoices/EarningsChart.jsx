import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";

const EarningsChart = ({ data, period }) => {
    if (!data || !data.data) {
        return (
            <div
                className="d-flex align-items-center justify-content-center"
                style={{ height: "300px" }}
            >
                <div className="text-center">
                    <i className="fas fa-chart-line fa-3x text-muted mb-3"></i>
                    <p className="text-muted">No earnings data available</p>
                </div>
            </div>
        );
    }

    const formatData = () => {
        if (!data.data || data.data.length === 0) return [];

        return data.data.map((item) => {
            let label = "";
            switch (period) {
                case "week":
                    label = new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "short",
                    });
                    break;
                case "month":
                    label = new Date(2024, item.month - 1).toLocaleDateString(
                        "en-US",
                        { month: "short" }
                    );
                    break;
                case "quarter":
                    label = `Q${item.quarter}`;
                    break;
                case "year":
                    label = item.year.toString();
                    break;
                default:
                    label =
                        item.month || item.date || item.quarter || item.year;
            }

            return {
                name: label,
                earnings: parseFloat(item.earnings || 0),
                period: item.month || item.date || item.quarter || item.year,
            };
        });
    };

    const chartData = formatData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-2">
                        <p className="small mb-1 fw-medium">{label}</p>
                        <p className="mb-0 text-success fw-bold">
                            <i className="fas fa-dollar-sign me-1"></i>$
                            {payload[0].value.toFixed(2)}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
                {period === "week" || period === "month" ? (
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: "#6c757d" }}
                            axisLine={{ stroke: "#dee2e6" }}
                            tickLine={{ stroke: "#dee2e6" }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#6c757d" }}
                            axisLine={{ stroke: "#dee2e6" }}
                            tickLine={{ stroke: "#dee2e6" }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="earnings"
                            stroke="#198754"
                            strokeWidth={3}
                            dot={{ fill: "#198754", strokeWidth: 2, r: 5 }}
                            activeDot={{
                                r: 7,
                                stroke: "#198754",
                                strokeWidth: 2,
                                fill: "#ffffff",
                            }}
                        />
                    </LineChart>
                ) : (
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                        <XAxis
                            dataKey="name"
                            tick={{ fontSize: 12, fill: "#6c757d" }}
                            axisLine={{ stroke: "#dee2e6" }}
                            tickLine={{ stroke: "#dee2e6" }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#6c757d" }}
                            axisLine={{ stroke: "#dee2e6" }}
                            tickLine={{ stroke: "#dee2e6" }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="earnings"
                            fill="#198754"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};

export default EarningsChart;
