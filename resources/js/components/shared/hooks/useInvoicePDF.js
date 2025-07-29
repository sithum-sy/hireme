/**
 * Invoice PDF Generation Hook
 * Handles PDF generation for all user roles with appropriate data visibility
 */

import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateFullInvoicePDF } from '../utils/invoicePdfTemplates';
import { getInvoicePDFStyles } from '../utils/invoicePdfStyles';

export const useInvoicePDF = (role, config = {}) => {
    const {
        companyName = "HireMe Services",
        companyAddress = "Colombo, Sri Lanka",
        companyPhone = "+94 11 234 5678",
        companyEmail = "info@hireme.lk",
        websiteUrl = "www.hireme.lk",
        supportEmail = "support@hireme.lk",
        primaryColor = "#0891b2",
        enableNotifications = true,
        ...otherConfig
    } = config;

    const showLoadingNotification = useCallback(() => {
        if (!enableNotifications) return null;
        
        const notification = document.createElement('div');
        notification.id = 'pdf-loading-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${primaryColor};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            ">
                <div style="
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                "></div>
                Generating Invoice PDF...
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(notification);
        return notification;
    }, [primaryColor, enableNotifications]);

    const hideLoadingNotification = useCallback(() => {
        const notification = document.getElementById('pdf-loading-notification');
        if (notification) {
            document.body.removeChild(notification);
        }
    }, []);

    const showErrorNotification = useCallback((message) => {
        if (!enableNotifications) return;
        
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: #dc3545;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
            ">
                ⚠️ ${message}
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }, [enableNotifications]);

    const generateInvoicePDFContent = useCallback((invoice, pdfConfig = {}) => {
        const mergedConfig = {
            companyName,
            companyAddress,
            companyPhone,
            companyEmail,
            websiteUrl,
            supportEmail,
            primaryColor,
            ...otherConfig,
            ...pdfConfig
        };

        const htmlContent = generateFullInvoicePDF(invoice, role, mergedConfig);
        const styles = getInvoicePDFStyles(mergedConfig);

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Invoice ${invoice.invoice_number || invoice.id}</title>
                <style>${styles}</style>
            </head>
            <body>
                ${htmlContent}
            </body>
            </html>
        `;
    }, [role, companyName, companyAddress, companyPhone, companyEmail, websiteUrl, supportEmail, primaryColor, otherConfig]);

    const downloadInvoicePDF = useCallback(async (invoice, pdfConfig = {}) => {
        try {
            if (!invoice) {
                throw new Error('Invoice data is required');
            }

            // Generate HTML content with enhanced styles for preview
            const htmlContent = generateInvoicePDFContent(invoice, pdfConfig);
            const filename = `invoice-${invoice.invoice_number || invoice.id}-${role}.pdf`;
            
            // Enhanced HTML with download functionality
            const previewHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${filename}</title>
                    <style>${getInvoicePDFStyles({...config, ...pdfConfig})}</style>
                    <style>
                        .download-controls {
                            position: fixed;
                            top: 20px;
                            right: 20px;
                            z-index: 10000;
                            display: flex;
                            gap: 10px;
                            background: rgba(255, 255, 255, 0.95);
                            padding: 15px;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                            border: 1px solid #ddd;
                        }
                        .download-btn {
                            padding: 8px 16px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: all 0.2s;
                            text-decoration: none;
                            display: inline-flex;
                            align-items: center;
                            gap: 6px;
                        }
                        .download-btn:hover {
                            transform: translateY(-1px);
                            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                        }
                        .btn-print {
                            background: #007bff;
                            color: white;
                        }
                        .btn-print:hover {
                            background: #0056b3;
                        }
                        .btn-close {
                            background: #6c757d;
                            color: white;
                        }
                        .btn-close:hover {
                            background: #545b62;
                        }
                        @media print {
                            .download-controls {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="download-controls">
                        <button class="download-btn btn-print" onclick="window.print()">
                            📄 Save as PDF / Print
                        </button>
                        <button class="download-btn btn-close" onclick="window.close()">
                            ✕ Close
                        </button>
                    </div>
                    
                    ${htmlContent.replace('<!DOCTYPE html>', '').replace(/<html>.*?<\/head>/s, '').replace('</body></html>', '')}
                    
                </body>
                </html>
            `;
            
            // Open in new tab
            const previewWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
            if (previewWindow) {
                previewWindow.document.write(previewHTML);
                previewWindow.document.close();
                previewWindow.focus();
            } else {
                throw new Error('Popup blocked. Please allow popups for this site.');
            }

        } catch (error) {
            console.error('Error opening invoice PDF preview:', error);
            showErrorNotification('Failed to open PDF preview. ' + error.message);
        }
    }, [generateInvoicePDFContent, showErrorNotification, role, config]);

    const downloadInvoicesPDF = useCallback(async (invoices, pdfConfig = {}) => {
        if (!invoices || invoices.length === 0) {
            showErrorNotification('No invoices to download');
            return;
        }

        const loadingNotification = showLoadingNotification();

        try {
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            for (let i = 0; i < invoices.length; i++) {
                const invoice = invoices[i];
                
                // Create temporary container for each invoice
                const tempContainer = document.createElement('div');
                tempContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: 0;
                    width: 210mm;
                    background: white;
                `;
                
                const htmlContent = generateInvoicePDFContent(invoice, pdfConfig);
                tempContainer.innerHTML = htmlContent;
                document.body.appendChild(tempContainer);

                // Wait for content to render
                await new Promise(resolve => setTimeout(resolve, 100));

                // Generate canvas for this invoice
                const canvas = await html2canvas(tempContainer.firstElementChild, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    width: 794,
                    height: 1123,
                    scrollX: 0,
                    scrollY: 0,
                });

                const imgWidth = 210;
                const pageHeight = 297;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Add page for this invoice (add new page except for first invoice)
                if (i > 0) {
                    pdf.addPage();
                }

                pdf.addImage(
                    canvas.toDataURL('image/png'),
                    'PNG',
                    0,
                    0,
                    imgWidth,
                    imgHeight
                );

                // Handle multi-page invoices if needed
                let heightLeft = imgHeight - pageHeight;
                let position = -pageHeight;

                while (heightLeft >= 0) {
                    pdf.addPage();
                    pdf.addImage(
                        canvas.toDataURL('image/png'),
                        'PNG',
                        0,
                        position,
                        imgWidth,
                        imgHeight
                    );
                    heightLeft -= pageHeight;
                    position -= pageHeight;
                }

                // Cleanup
                document.body.removeChild(tempContainer);
            }

            // Generate filename
            const timestamp = new Date().toISOString().split('T')[0];
            const filename = `invoices-${role}-${timestamp}.pdf`;
            
            // Download PDF
            pdf.save(filename);
            hideLoadingNotification();

        } catch (error) {
            console.error('Error generating invoices PDF:', error);
            hideLoadingNotification();
            showErrorNotification('Failed to generate PDF. Please try again.');
        }
    }, [generateInvoicePDFContent, showLoadingNotification, hideLoadingNotification, showErrorNotification, role]);

    const openInvoicePDFPreview = useCallback((invoice, pdfConfig = {}) => {
        try {
            if (!invoice) {
                throw new Error('Invoice data is required');
            }

            const htmlContent = generateInvoicePDFContent(invoice, pdfConfig);
            
            const previewWindow = window.open('', '_blank', 'width=900,height=1200,scrollbars=yes');
            previewWindow.document.write(htmlContent);
            previewWindow.document.close();
            
        } catch (error) {
            console.error('Error opening invoice PDF preview:', error);
            showErrorNotification('Failed to open PDF preview.');
        }
    }, [generateInvoicePDFContent, showErrorNotification]);

    return {
        downloadInvoicePDF,
        downloadInvoicesPDF,
        openInvoicePDFPreview,
        generateInvoicePDFContent
    };
};