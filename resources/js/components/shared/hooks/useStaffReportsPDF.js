/**
 * useStaffReportsPDF Hook
 * Provides PDF generation for staff management analytics reports
 */

import { getStaffReportsPDFStyles } from '../utils/staffReportsPdfStyles';
import {
    generateStaffReportsPDFHeader,
    generatePlatformSummarySection,
    generateUserGrowthSection,
    generateServiceAnalyticsSection,
    generateAppointmentAnalyticsSection,
    generateRevenueAnalyticsSection,
    generateStaffReportsPrintButtons,
    generateStaffChartsHeader,
    generateStaffChartsPlaceholderSection
} from '../utils/staffReportsPdfTemplates';

export const useStaffReportsPDF = (config = {}) => {
    const defaultConfig = {
        primaryColor: '#007bff',
        companyName: 'HireMe',
        pageSize: 'A4',
        margins: '0.6in',
        sections: {
            header: true,
            platform_summary: true,
            user_growth: true,
            service_analytics: true,
            appointment_analytics: true,
            revenue_analytics: true,
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
                    <title>Staff Management Analytics Report - ${dateRange.start_date} to ${dateRange.end_date}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        ${getStaffReportsPDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${sections.header ? generateStaffReportsPDFHeader(dateRange, finalConfig) : ''}
                        
                        <div class="main-content">
                            ${sections.platform_summary ? generatePlatformSummarySection(analyticsData.summary) : ''}
                            
                            ${sections.user_growth ? generateUserGrowthSection(analyticsData.user_growth) : ''}
                            
                            ${sections.service_analytics ? generateServiceAnalyticsSection(analyticsData.service_statistics) : ''}
                            
                            ${sections.appointment_analytics ? generateAppointmentAnalyticsSection(analyticsData.appointment_analytics) : ''}
                            
                            ${sections.revenue_analytics ? generateRevenueAnalyticsSection(analyticsData.revenue_analytics) : ''}
                        </div>

                        ${sections.printButtons ? generateStaffReportsPrintButtons() : ''}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Add a small delay to ensure content is loaded before offering print
            setTimeout(() => {
                printWindow.focus();
            }, 100);

            // Optional callback for tracking
            if (finalConfig.onGenerate) {
                finalConfig.onGenerate(analyticsData, dateRange);
            }

            return printWindow;

        } catch (error) {
            console.error('Error generating staff reports PDF:', error);
            alert('Error generating PDF report. Please try again.');
            
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    const generateQuickReportsPDF = (analyticsData, dateRange, reportType = 'platform_summary') => {
        const quickConfigs = {
            platform_summary: {
                sections: {
                    header: true,
                    platform_summary: true,
                    printButtons: true,
                    user_growth: false,
                    service_analytics: false,
                    appointment_analytics: false,
                    revenue_analytics: false
                }
            },
            user_growth: {
                sections: {
                    header: true,
                    platform_summary: true,
                    user_growth: true,
                    printButtons: true,
                    service_analytics: false,
                    appointment_analytics: false,
                    revenue_analytics: false
                }
            },
            service_analytics: {
                sections: {
                    header: true,
                    platform_summary: true,
                    service_analytics: true,
                    printButtons: true,
                    user_growth: false,
                    appointment_analytics: false,
                    revenue_analytics: false
                }
            },
            revenue_analytics: {
                sections: {
                    header: true,
                    platform_summary: true,
                    revenue_analytics: true,
                    printButtons: true,
                    user_growth: false,
                    service_analytics: false,
                    appointment_analytics: false
                }
            }
        };

        const config = quickConfigs[reportType] || quickConfigs.platform_summary;
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
                    <title>Staff Analytics Charts Dashboard - ${dateRange.start_date} to ${dateRange.end_date}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        ${getStaffReportsPDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${generateStaffChartsHeader(dateRange, finalConfig)}
                        
                        <div class="main-content">
                            ${generateStaffChartsPlaceholderSection(analyticsData)}
                        </div>

                        ${generateStaffReportsPrintButtons()}
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
            console.error('Error generating staff charts PDF:', error);
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