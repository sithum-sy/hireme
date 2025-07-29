/**
 * Professional Invoice PDF Styles
 * Clean, modern styling for university project requirements
 */

export const getInvoicePDFStyles = (config = {}) => {
    const {
        primaryColor = "#0891b2",
        secondaryColor = "#6c757d",
        successColor = "#28a745",
        dangerColor = "#dc3545",
        warningColor = "#ffc107",
    } = config;

    return `
        @page {
            size: A4;
            margin: 0.4in;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 15px;
            line-height: 1.3;
            color: #333;
            font-size: 11px;
            background: #f8f9fa;
            display: flex;
            justify-content: center;
            min-height: 100vh;
        }
        
        .invoice-pdf-container {
            max-width: 210mm;
            width: 100%;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
            margin: 0 auto;
        }
        
        /* Header Styles */
        .invoice-header {
            background: linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd);
            color: white;
            padding: 18px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .company-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .company-logo {
            width: 60px;
            height: 60px;
            border-radius: 8px;
            background: rgba(255,255,255,0.2);
            padding: 5px;
        }
        
        .company-name {
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 6px 0;
        }
        
        .company-contact {
            font-size: 10px;
            opacity: 0.9;
            line-height: 1.2;
        }
        
        .invoice-title {
            text-align: right;
        }
        
        .invoice-title h1 {
            font-size: 26px;
            margin: 0 0 6px 0;
            font-weight: 300;
            letter-spacing: 1px;
        }
        
        .invoice-number {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .invoice-status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: bold;
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
        }
        
        /* Main Content Layout */
        .invoice-main {
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 20px;
            padding: 20px;
        }
        
        .main-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .sidebar-content {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        /* Section Styles */
        .invoice-details, .service-details, .payment-info {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-left: 3px solid ${primaryColor};
        }
        
        .billing-addresses {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .address-section {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 6px;
            border-top: 2px solid ${secondaryColor};
        }
        
        .address-section h3 {
            color: ${primaryColor};
            margin: 0 0 8px 0;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .address-content .name {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
            color: #333;
        }
        
        .address-content .business {
            font-weight: 600;
            color: ${primaryColor};
            margin-bottom: 8px;
        }
        
        .address-content div {
            margin-bottom: 3px;
            color: #666;
            font-size: 11px;
        }
        
        /* Service Details */
        .service-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
        }
        
        .service-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .service-item:last-child {
            border-bottom: none;
        }
        
        /* Line Items Table */
        .line-items {
            margin: 15px 0;
        }
        
        .line-items h3 {
            color: ${primaryColor};
            margin: 0 0 10px 0;
            font-size: 14px;
            font-weight: 600;
            padding-bottom: 6px;
            border-bottom: 2px solid ${primaryColor};
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 6px;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: ${primaryColor};
            color: white;
            padding: 8px;
            font-weight: 600;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        
        .items-table td {
            padding: 8px;
            border-bottom: 1px solid #eee;
            font-size: 10px;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .center { text-align: center; }
        .right { text-align: right; }
        
        /* Totals Section */
        .totals-section {
            background: white;
            border-radius: 6px;
            padding: 15px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .totals-table {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #eee;
            font-size: 10px;
        }
        
        .total-row:last-child {
            border-bottom: none;
        }
        
        .total-row.total {
            background: ${primaryColor};
            color: white;
            margin: 8px -10px;
            padding: 12px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 13px;
        }
        
        .total-row.discount .value {
            color: ${successColor};
            font-weight: bold;
        }
        
        .total-row.balance.due {
            background: ${dangerColor};
            color: white;
            margin: 8px -10px;
            padding: 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        .total-row.balance.paid {
            background: ${successColor};
            color: white;
            margin: 8px -10px;
            padding: 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        
        /* Payment Information */
        .payment-grid {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        
        .payment-item {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        
        .payment-item:last-child {
            border-bottom: none;
        }
        
        /* Status Colors */
        .status-pending { color: ${warningColor}; font-weight: bold; }
        .status-completed { color: ${successColor}; font-weight: bold; }
        .status-failed { color: ${dangerColor}; font-weight: bold; }
        .status-draft { color: ${secondaryColor}; font-weight: bold; }
        .status-sent { color: ${primaryColor}; font-weight: bold; }
        .status-paid { color: ${successColor}; font-weight: bold; }
        .status-overdue { color: ${dangerColor}; font-weight: bold; }
        
        /* Compact Payment Info */
        .compact-payment-info {
            background: white;
            border-radius: 6px;
            padding: 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        .payment-detail {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid #eee;
            font-size: 10px;
        }
        
        .payment-detail:last-child {
            border-bottom: none;
        }
        
        /* Compact Footer */
        .compact-footer {
            background: #f8f9fa;
            padding: 12px 20px;
            border-top: 2px solid ${primaryColor};
            text-align: center;
        }
        
        .footer-info {
            font-size: 9px;
            color: #666;
            line-height: 1.4;
        }
        
        .invoice-notes {
            margin-top: 6px;
            font-size: 9px;
            color: #555;
        }
        
        /* Payment Terms */
        .payment-terms {
            background: #f8f9fa;
            padding: 25px;
            border-top: 3px solid ${secondaryColor};
        }
        
        .payment-terms h3 {
            color: ${primaryColor};
            margin: 0 0 15px 0;
            font-size: 14px;
            font-weight: 600;
        }
        
        .terms-content {
            font-size: 10px;
            line-height: 1.5;
            color: #666;
        }
        
        .term-item {
            margin-bottom: 6px;
        }
        
        /* Footer */
        .invoice-footer {
            background: ${primaryColor};
            color: white;
            padding: 20px 25px;
        }
        
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 10px;
        }
        
        .footer-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        
        /* Section Headers */
        h3 {
            color: ${primaryColor};
            margin: 0 0 12px 0;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .label {
            font-weight: 600;
            color: #555;
        }
        
        .value {
            color: #333;
            font-weight: 400;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        
        .detail-row:last-child {
            border-bottom: none;
        }
        
        /* Print Styles */
        @media print {
            @page {
                margin: 0.3in;
            }
            
            body {
                margin: 0;
                padding: 0;
                background: white;
                font-size: 10px;
            }
            
            .invoice-pdf-container {
                box-shadow: none;
                border-radius: 0;
                max-width: none;
                width: 100%;
                page-break-inside: avoid;
            }
            
            .invoice-header {
                padding: 15px;
            }
            
            .invoice-main {
                grid-template-columns: 1fr 260px;
                gap: 15px;
                padding: 15px;
            }
            
            .main-content {
                gap: 10px;
            }
            
            .sidebar-content {
                gap: 8px;
            }
            
            .billing-addresses {
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .address-section, .service-details, .compact-payment-info, .totals-section {
                padding: 8px;
            }
            
            .compact-footer {
                padding: 8px 15px;
            }
            
            .no-print {
                display: none;
            }
        }
        
        /* Responsive Design */
        @media (max-width: 768px) {
            .invoice-header {
                flex-direction: column;
                gap: 20px;
                text-align: center;
            }
            
            .invoice-main {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .billing-addresses {
                grid-template-columns: 1fr;
            }
            
            .service-grid {
                grid-template-columns: 1fr;
            }
            
            .footer-content {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }
        }
    `;
};
