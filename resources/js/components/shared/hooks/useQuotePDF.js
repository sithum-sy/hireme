/**
 * useQuotePDF Hook
 * Provides programmatic access to quote PDF generation for providers
 */

import { getQuotePDFStyles } from '../utils/quotePdfStyles';
import {
    generateQuotePDFHeader,
    generateQuoteInfoSection,
    generateServiceDetailsSection,
    generateClientDetailsSection,
    generateQuoteResponseSection,
    generateQuoteTimelineSection,
    generateQuoteSummarySection,
    generatePrintButtons
} from '../utils/quotePdfTemplates';

export const useQuotePDF = (role = 'provider', config = {}) => {
    const defaultConfig = {
        primaryColor: '#007bff',
        companyName: 'HireMe',
        compact: true,
        pageSize: 'A4',
        margins: '0.5in',
        sections: {
            header: true,
            quoteInfo: true,
            serviceDetails: true,
            clientDetails: true,
            quoteResponse: true,
            timeline: true,
            summary: true,
            printButtons: true
        },
        ...config
    };

    const downloadQuotePDF = (quote, customConfig = {}) => {
        if (!quote) {
            console.error('Quote data is required for PDF generation');
            return;
        }

        const finalConfig = { ...defaultConfig, ...customConfig };
        const { sections } = finalConfig;

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                return;
            }

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Quote Details - ${quote.quote_number || quote.id}</title>
                    <style>
                        ${getQuotePDFStyles(finalConfig)}
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        ${sections.header ? generateQuotePDFHeader(quote, role, finalConfig) : ''}
                        
                        <div class="main-content">
                            <div class="content-grid">
                                ${sections.quoteInfo ? generateQuoteInfoSection(quote, role) : ''}
                                ${sections.serviceDetails ? generateServiceDetailsSection(quote) : ''}
                                ${sections.clientDetails ? generateClientDetailsSection(quote, role) : ''}
                                ${sections.quoteResponse ? generateQuoteResponseSection(quote, role) : ''}
                            </div>

                            ${sections.timeline ? generateQuoteTimelineSection(quote, role) : ''}
                            ${sections.summary ? generateQuoteSummarySection(quote, role) : ''}
                        </div>

                        ${sections.printButtons ? generatePrintButtons() : ''}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            // Optional callback for tracking
            if (finalConfig.onDownload) {
                finalConfig.onDownload(quote, role);
            }

        } catch (error) {
            console.error('Error generating quote PDF:', error);
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    const downloadQuotesPDF = (quotes, customConfig = {}) => {
        if (!quotes || quotes.length === 0) {
            console.error('Quotes data is required for PDF generation');
            return;
        }

        const finalConfig = { ...defaultConfig, ...customConfig };

        try {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
                console.error('Unable to open print window. Please check popup blocker settings.');
                return;
            }

            const quoteSections = quotes.map(quote => `
                <div style="page-break-after: always;">
                    ${generateQuotePDFHeader(quote, role, finalConfig)}
                    <div class="main-content">
                        <div class="content-grid">
                            ${generateQuoteInfoSection(quote, role)}
                            ${generateServiceDetailsSection(quote)}
                            ${generateClientDetailsSection(quote, role)}
                            ${generateQuoteResponseSection(quote, role)}
                        </div>
                        ${generateQuoteTimelineSection(quote, role)}
                        ${generateQuoteSummarySection(quote, role)}
                    </div>
                </div>
            `).join('');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Quotes List - ${quotes.length} Items</title>
                    <style>
                        ${getQuotePDFStyles(finalConfig)}
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
                    <div class="pdf-container">
                        <div class="header">
                            <h1>Quotes List</h1>
                            <div>${quotes.length} Quote${quotes.length > 1 ? 's' : ''} | ${role.charAt(0).toUpperCase() + role.slice(1)} View</div>
                        </div>
                        
                        <div class="meta">
                            Generated on: ${new Date().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long", 
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })} | ${finalConfig.companyName}
                        </div>

                        ${quoteSections}

                        ${generatePrintButtons()}
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            if (finalConfig.onDownload) {
                finalConfig.onDownload(quotes, role);
            }

        } catch (error) {
            console.error('Error generating quotes PDF:', error);
            if (finalConfig.onError) {
                finalConfig.onError(error);
            }
        }
    };

    return {
        downloadQuotePDF,
        downloadQuotesPDF,
        role,
        config: defaultConfig
    };
};