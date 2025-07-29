/**
 * useReportsPDF Hook
 * Provides PDF generation for provider analytics reports
 */

import { getReportsPDFStyles } from '../utils/reportsPdfStyles';
import {
    generateReportsPDFHeader,
    generateSummarySection,
    generateIncomeAnalysisSection,
    generateAppointmentAnalysisSection,
    generateServicePerformanceSection,
    generateReportsPrintButtons,
    generateChartsHeader,
    generateChartsPlaceholderSection
} from '../utils/reportsPdfTemplates';

export const useReportsPDF = (config = {}) => {
    const defaultConfig = {
        primaryColor: '#007bff',
        companyName: 'HireMe',
        pageSize: 'A4',
        margins: '0.6in',
        sections: {
            header: true,
            summary: true,
            incomeAnalysis: true,
            appointmentAnalysis: true,
            servicePerformance: true,
            printButtons: true
        },
        ...config
    };

    const generateReportsPDF = (analyticsData, dateRange, customConfig = {}) => {
        if (!analyticsData) {
            console.error('Analytics data is required for PDF generation');
            return;
        }

        const finalConfig = { ...defaultConfig, ...customConfig };
        const { sections } = finalConfig;

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                alert('Unable to open PDF viewer. Please check if popups are blocked and try again.');
                return;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Provider Analytics Report - ${dateRange.start_date} to ${dateRange.end_date}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        ${getReportsPDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${sections.header ? generateReportsPDFHeader(dateRange, finalConfig) : ''}
                        
                        <div class="main-content">
                            ${sections.summary ? generateSummarySection(analyticsData.summary) : ''}
                            
                            ${sections.incomeAnalysis ? generateIncomeAnalysisSection(analyticsData.income_chart) : ''}
                            
                            ${sections.appointmentAnalysis ? generateAppointmentAnalysisSection(analyticsData.appointment_trend, analyticsData.success_rate) : ''}
                            
                            ${sections.servicePerformance ? generateServicePerformanceSection(analyticsData.service_performance) : ''}
                        </div>

                        ${sections.printButtons ? generateReportsPrintButtons() : ''}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Add a small delay to ensure content is loaded before offering print
            setTimeout(() => {
                // Focus on the print window to make sure it's active
                printWindow.focus();
            }, 100);

            // Optional callback for tracking
            if (finalConfig.onGenerate) {
                finalConfig.onGenerate(analyticsData, dateRange);
            }

            return printWindow;

        } catch (error) {
            console.error('Error generating reports PDF:', error);
            alert('Error generating PDF report. Please try again.');
            
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    const generateQuickReportsPDF = (analyticsData, dateRange, reportType = 'summary') => {
        const quickConfigs = {
            summary: {
                sections: {
                    header: true,
                    summary: true,
                    printButtons: true,
                    incomeAnalysis: false,
                    appointmentAnalysis: false,
                    servicePerformance: false
                }
            },
            income: {
                sections: {
                    header: true,
                    summary: true,
                    incomeAnalysis: true,
                    printButtons: true,
                    appointmentAnalysis: false,
                    servicePerformance: false
                }
            },
            appointments: {
                sections: {
                    header: true,
                    summary: true,
                    appointmentAnalysis: true,
                    printButtons: true,
                    incomeAnalysis: false,
                    servicePerformance: false
                }
            },
            services: {
                sections: {
                    header: true,
                    summary: true,
                    servicePerformance: true,
                    printButtons: true,
                    incomeAnalysis: false,
                    appointmentAnalysis: false
                }
            }
        };

        const config = quickConfigs[reportType] || quickConfigs.summary;
        return generateReportsPDF(analyticsData, dateRange, config);
    };

    const generateChartsPDF = (analyticsData, dateRange, customConfig = {}) => {
        if (!analyticsData) {
            console.error('Analytics data is required for charts PDF generation');
            return;
        }

        const finalConfig = { 
            ...defaultConfig, 
            ...customConfig,
            sections: {
                header: true,
                charts: true,
                printButtons: true
            }
        };

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                alert('Unable to open PDF viewer. Please check if popups are blocked and try again.');
                return;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Analytics Charts Dashboard - ${dateRange.start_date} to ${dateRange.end_date}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        ${getReportsPDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${generateChartsHeader(dateRange, finalConfig)}
                        
                        <div class="main-content">
                            ${generateChartsPlaceholderSection(analyticsData)}
                        </div>

                        ${generateReportsPrintButtons()}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Add a small delay to ensure content is loaded
            setTimeout(() => {
                printWindow.focus();
            }, 100);

            // Optional callback for tracking
            if (finalConfig.onGenerate) {
                finalConfig.onGenerate(analyticsData, dateRange, 'charts');
            }

            return printWindow;

        } catch (error) {
            console.error('Error generating charts PDF:', error);
            alert('Error generating charts PDF. Please try again.');
            
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    return {
        generateReportsPDF,
        generateQuickReportsPDF,
        generateChartsPDF,
        config: defaultConfig
    };
};