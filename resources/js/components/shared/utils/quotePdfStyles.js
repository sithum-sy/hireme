/**
 * Quote PDF Styles
 * Provides consistent styling for quote PDFs
 */

export const getQuotePDFStyles = (config = {}) => {
    const {
        primaryColor = '#007bff',
        compact = true,
        pageSize = 'A4',
        margins = '0.5in'
    } = config;

    return `
        @page {
            size: ${pageSize};
            margin: ${margins};
        }
        body { 
            font-family: Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            line-height: ${compact ? '1.3' : '1.4'}; 
            color: #333;
            font-size: ${compact ? '12px' : '14px'};
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }
        .pdf-container {
            max-width: 210mm;
            width: 100%;
            margin: 0 auto;
            padding: ${compact ? '20px' : '30px'};
            border: 2px solid ${primaryColor};
            border-radius: 8px;
            box-sizing: border-box;
            background: white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            position: relative;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid ${primaryColor}; 
            padding-bottom: ${compact ? '8px' : '12px'}; 
            margin-bottom: ${compact ? '12px' : '18px'};
        }
        .header h1 { 
            color: ${primaryColor}; 
            margin: 0;
            font-size: ${compact ? '20px' : '24px'};
            font-weight: bold;
        }
        .header .subtitle {
            color: #666;
            font-size: ${compact ? '12px' : '14px'};
            margin-top: 4px;
        }
        .meta {
            text-align: center;
            color: #666;
            font-size: ${compact ? '10px' : '12px'};
            margin-bottom: ${compact ? '12px' : '18px'};
        }
        .main-content {
            flex: 1;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: ${compact ? '12px' : '18px'};
            margin-bottom: ${compact ? '16px' : '24px'};
        }
        .section {
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
            page-break-inside: avoid;
        }
        .section-header {
            background: ${primaryColor};
            color: white;
            padding: ${compact ? '6px 12px' : '8px 16px'};
            font-weight: bold;
            font-size: ${compact ? '13px' : '15px'};
        }
        .section-body {
            padding: ${compact ? '12px' : '16px'};
            background: white;
        }
        .info-row {
            display: flex;
            margin-bottom: ${compact ? '6px' : '8px'};
            align-items: flex-start;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            font-weight: bold;
            min-width: ${compact ? '80px' : '100px'};
            color: #555;
            margin-right: ${compact ? '8px' : '12px'};
        }
        .info-value {
            flex: 1;
            color: #333;
        }
        .badge {
            display: inline-block;
            padding: ${compact ? '2px 6px' : '3px 8px'};
            border-radius: 4px;
            font-size: ${compact ? '10px' : '11px'};
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-pending { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .badge-quoted { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .badge-accepted { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .badge-rejected { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .badge-expired { background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; }
        .badge-withdrawn { background: #e2e3e5; color: #383d41; border: 1px solid #d6d8db; }
        .price-large {
            font-size: ${compact ? '16px' : '20px'};
            font-weight: bold;
            color: ${primaryColor};
        }
        .price-summary {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            padding: ${compact ? '12px' : '16px'};
            margin-top: ${compact ? '12px' : '16px'};
        }
        .price-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: ${compact ? '4px' : '6px'};
        }
        .price-row.total {
            border-top: 1px solid #dee2e6;
            padding-top: ${compact ? '6px' : '8px'};
            margin-top: ${compact ? '6px' : '8px'};
            font-weight: bold;
            font-size: ${compact ? '14px' : '16px'};
        }
        .timeline {
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: ${compact ? '12px' : '16px'};
            margin-bottom: ${compact ? '12px' : '16px'};
        }
        .timeline-header {
            font-weight: bold;
            color: ${primaryColor};
            margin-bottom: ${compact ? '8px' : '12px'};
            font-size: ${compact ? '14px' : '16px'};
        }
        .timeline-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: ${compact ? '8px' : '12px'};
            padding-left: ${compact ? '16px' : '20px'};
            position: relative;
        }
        .timeline-item:before {
            content: '';
            position: absolute;
            left: 6px;
            top: 6px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${primaryColor};
        }
        .timeline-item:not(:last-child):after {
            content: '';
            position: absolute;
            left: 9px;
            top: 16px;
            bottom: -12px;
            width: 2px;
            background: #ddd;
        }
        .timeline-content {
            flex: 1;
        }
        .timeline-title {
            font-weight: bold;
            margin-bottom: 2px;
        }
        .timeline-date {
            color: #666;
            font-size: ${compact ? '10px' : '11px'};
        }
        .quote-details {
            background: #f8f9fa;
            border-left: 4px solid ${primaryColor};
            padding: ${compact ? '8px 12px' : '12px 16px'};
            margin: ${compact ? '8px 0' : '12px 0'};
            border-radius: 0 4px 4px 0;
        }
        .print-buttons {
            text-align: center;
            margin-top: ${compact ? '16px' : '24px'};
            padding-top: ${compact ? '12px' : '16px'};
            border-top: 1px solid #ddd;
        }
        .print-button {
            background: ${primaryColor};
            color: white;
            border: none;
            padding: ${compact ? '6px 12px' : '8px 16px'};
            border-radius: 4px;
            margin: 0 ${compact ? '4px' : '6px'};
            cursor: pointer;
            font-size: ${compact ? '11px' : '12px'};
        }
        .print-button:hover {
            opacity: 0.9;
        }
        .no-print {
            display: none;
        }
        @media print {
            .print-buttons {
                display: none;
            }
            .no-print {
                display: none !important;
            }
            body {
                border: none;
            }
        }
        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: ${compact ? '12px' : '16px'};
        }
        @media (max-width: 600px) {
            .two-column {
                grid-template-columns: 1fr;
            }
        }
    `;
};