import React from "react";
import { formatCurrency } from "../../../utils/formatters";

const InvoiceStatistics = ({ statistics }) => {
    const stats = [
        {
            title: "Total Invoices",
            value: statistics.total_invoices || 0,
            icon: "fas fa-file-invoice",
            color: "primary",
            description: "All time invoices",
            bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
        {
            title: "Total Earnings",
            value: formatCurrency(statistics.total_earnings || 0),
            icon: "fas fa-dollar-sign",
            color: "success",
            description: "Total amount earned",
            bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        },
        {
            title: "Pending Payments",
            value: formatCurrency(statistics.pending_amount || 0),
            icon: "fas fa-clock",
            color: "warning",
            description: `${statistics.pending_invoices || 0} invoices`,
            action: statistics.pending_invoices > 0 ? "View Pending" : null,
            bgGradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        },
        {
            title: "Overdue Payments",
            value: formatCurrency(statistics.overdue_amount || 0),
            icon: "fas fa-exclamation-triangle",
            color: "danger",
            description: `${statistics.overdue_invoices || 0} invoices`,
            action: statistics.overdue_invoices > 0 ? "View Overdue" : null,
            bgGradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        },
    ];

    return (
        <div className="row g-4">
            {stats.map((stat, index) => (
                <div key={index} className="col-lg-3 col-md-6">
                    <div className="card border-0 shadow-sm h-100 overflow-hidden position-relative">
                        {/* Background Gradient */}
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100 opacity-10"
                            style={{ background: stat.bgGradient }}
                        ></div>

                        <div className="card-body position-relative">
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="flex-grow-1">
                                    <p className="text-muted small mb-1 fw-medium">
                                        {stat.title}
                                    </p>
                                    <h3
                                        className={`mb-1 fw-bold text-${stat.color}`}
                                    >
                                        {stat.value}
                                    </h3>
                                    <p className="small text-muted mb-2">
                                        {stat.description}
                                    </p>
                                    {stat.action && (
                                        <button
                                            className={`btn btn-outline-${stat.color} btn-sm`}
                                        >
                                            {stat.action}
                                            <i className="fas fa-arrow-right ms-1"></i>
                                        </button>
                                    )}
                                </div>
                                <div className={`text-${stat.color} ms-3`}>
                                    <div
                                        className={`rounded-circle d-flex align-items-center justify-content-center bg-${stat.color}`}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            opacity: 0.1,
                                        }}
                                    >
                                        <i
                                            className={`${stat.icon} fa-lg`}
                                            style={{ opacity: 1 }}
                                        ></i>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trend Indicator */}
                        <div className="card-footer bg-transparent border-0 pt-0">
                            <div className="d-flex align-items-center text-muted">
                                <i className="fas fa-chart-line me-1"></i>
                                <small>Updated just now</small>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InvoiceStatistics;
