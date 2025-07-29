import React, { useState, useEffect } from 'react';
import ProviderLayout from '../../layouts/ProviderLayout';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useReportsPDF } from '../../shared/hooks/useReportsPDF';

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

const ProviderReportsPage = () => {
    const [loading, setLoading] = useState(false);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    const { generateReportsPDF, generateQuickReportsPDF, generateChartsPDF } = useReportsPDF();

    const quickFilters = [
        { label: 'Last 7 Days', days: 7 },
        { label: 'Last 30 Days', days: 30 },
        { label: 'Last 90 Days', days: 90 },
        { label: 'This Year', days: 365 }
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const setQuickFilter = (days) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        setFilters({
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
        });
    };

    const isQuickFilterActive = (days) => {
        const endDate = new Date();
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        
        return filters.start_date === startDate.toISOString().split('T')[0] &&
               filters.end_date === endDate.toISOString().split('T')[0];
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters);
            const response = await fetch(`/api/provider/reports/analytics?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch analytics data');
            }

            const data = await response.json();
            setAnalyticsData(data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            alert('Failed to fetch analytics data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const printReports = () => {
        if (!analyticsData) {
            alert('No data available to generate report. Please wait for the data to load.');
            return;
        }

        generateReportsPDF(analyticsData, filters);
    };

    const generateQuickReport = (reportType) => {
        if (!analyticsData) {
            alert('No data available to generate report. Please wait for the data to load.');
            return;
        }

        generateQuickReportsPDF(analyticsData, filters, reportType);
    };

    const printChartsOnly = () => {
        if (!analyticsData) {
            alert('No data available to generate charts. Please wait for the data to load.');
            return;
        }

        generateChartsPDF(analyticsData, filters);
    };

    useEffect(() => {
        fetchAnalytics();
    }, [filters]);

    // Chart configurations
    const incomeChartData = {
        labels: analyticsData?.income_chart?.labels || [],
        datasets: [{
            label: 'Monthly Income (LKR)',
            data: analyticsData?.income_chart?.data || [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    const successRateData = {
        labels: ['Completed', 'Cancelled', 'In Progress', 'Pending'],
        datasets: [{
            data: analyticsData?.success_rate || [0, 0, 0, 0],
            backgroundColor: [
                'rgba(40, 167, 69, 0.8)',   // Green for completed
                'rgba(220, 53, 69, 0.8)',   // Red for cancelled
                'rgba(54, 162, 235, 0.8)',  // Blue for in progress
                'rgba(255, 193, 7, 0.8)'    // Yellow for pending
            ]
        }]
    };

    const appointmentTrendData = {
        labels: analyticsData?.appointment_trend?.labels || [],
        datasets: [{
            label: 'Appointments',
            data: analyticsData?.appointment_trend?.data || [],
            fill: false,
            borderColor: 'rgba(54, 162, 235, 1)',
            tension: 0.1
        }]
    };

    const servicePerformanceData = {
        labels: analyticsData?.service_performance?.labels || [],
        datasets: [{
            label: 'Bookings',
            data: analyticsData?.service_performance?.data || [],
            backgroundColor: 'rgba(153, 102, 255, 0.6)'
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.label?.includes('Income')) {
                            return context.dataset.label + ': LKR ' + context.parsed.y.toLocaleString();
                        }
                        return context.dataset.label + ': ' + context.parsed.y;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        // Format y-axis labels for income charts
                        if (this.chart.canvas.parentNode.querySelector('.card-title')?.textContent?.includes('Income')) {
                            return 'LKR ' + value.toLocaleString();
                        }
                        return value;
                    }
                }
            }
        }
    };

    return (
        <ProviderLayout>
            <div className="page-content">
                <div className="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <div className="mb-3 mb-md-0">
                        <h1 className="page-title">Reports & Analytics</h1>
                        <p className="page-subtitle">
                            Analytics from {filters.start_date} to {filters.end_date}
                            {loading && <span className="ms-2"><i className="fas fa-spinner fa-spin"></i> Updating...</span>}
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
                            <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); printChartsOnly();}}>
                                <i className="fas fa-chart-line me-2"></i>Charts Dashboard
                            </a></li>
                            <li><hr className="dropdown-divider" /></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); generateQuickReport('summary');}}>
                                <i className="fas fa-chart-bar me-2"></i>Summary Report
                            </a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); generateQuickReport('income');}}>
                                <i className="fas fa-money-bill me-2"></i>Income Report
                            </a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); generateQuickReport('appointments');}}>
                                <i className="fas fa-calendar me-2"></i>Appointments Report
                            </a></li>
                            <li><a className="dropdown-item" href="#" onClick={(e) => {e.preventDefault(); generateQuickReport('services');}}>
                                <i className="fas fa-concierge-bell me-2"></i>Services Report
                            </a></li>
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
                                            className={`btn btn-sm ${isQuickFilterActive(filter.days) ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setQuickFilter(filter.days)}
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
                                    <h3 className="text-success">{analyticsData.summary?.total_income || 'LKR 0.00'}</h3>
                                    <p className="text-muted mb-0">Total Income</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-primary">{analyticsData.summary?.total_appointments || 0}</h3>
                                    <p className="text-muted mb-0">Total Appointments</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-warning">{analyticsData.summary?.completed_rate || 0}%</h3>
                                    <p className="text-muted mb-0">Success Rate</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card text-center">
                                <div className="card-body">
                                    <h3 className="text-info">{analyticsData.summary?.active_services || 0}</h3>
                                    <p className="text-muted mb-0">Active Services</p>
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
                                    <h5 className="card-title mb-0">Monthly Income</h5>
                                </div>
                                <div className="card-body">
                                    <Bar data={incomeChartData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Appointment Status</h5>
                                </div>
                                <div className="card-body">
                                    <Pie data={successRateData} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Appointment Trend</h5>
                                </div>
                                <div className="card-body">
                                    <Line data={appointmentTrendData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 mb-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Service Performance</h5>
                                </div>
                                <div className="card-body">
                                    <Bar data={servicePerformanceData} options={chartOptions} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProviderLayout>
    );
};

export default ProviderReportsPage;