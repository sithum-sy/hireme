/**
 * Shared PDF Styles for Appointment Details
 * Provides consistent styling across all roles
 */

export const getPDFStyles = (config = {}) => {
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
            padding: ${compact ? '20px' : '30px'};
            line-height: ${compact ? '1.3' : '1.4'}; 
            color: #333;
            font-size: ${compact ? '12px' : '14px'};
            max-width: 210mm;
            border: 2px solid ${primaryColor};
            border-radius: 8px;
            box-sizing: border-box;
            width: fit-content;
            height: fit-content;
            min-height: auto;
        }
        .pdf-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            min-height: auto;
            height: auto;
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
        }
        .meta { 
            text-align: center; 
            color: #666; 
            margin-bottom: ${compact ? '12px' : '18px'}; 
            font-size: ${compact ? '10px' : '12px'};
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: ${compact ? '12px' : '15px'};
            margin-bottom: ${compact ? '8px' : '12px'};
        }
        .content-grid:last-of-type {
            margin-bottom: 0;
        }
        .full-width {
            grid-column: 1 / -1;
            margin-bottom: ${compact ? '8px' : '12px'};
        }
        .full-width:last-child {
            margin-bottom: 0;
        }
        .section { 
            margin-bottom: ${compact ? '8px' : '12px'}; 
            padding: ${compact ? '8px' : '12px'}; 
            border: 1px solid #ddd; 
            border-radius: 4px;
            background: #fafafa;
            page-break-inside: avoid;
        }
        .section:last-child {
            margin-bottom: 0;
        }
        .section h3 { 
            color: ${primaryColor}; 
            margin: 0 0 ${compact ? '6px' : '8px'} 0; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: ${compact ? '3px' : '5px'};
            font-size: ${compact ? '14px' : '16px'};
        }
        .detail-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: ${compact ? '3px' : '5px'}; 
            padding: ${compact ? '1px' : '2px'} 0;
            font-size: ${compact ? '11px' : '12px'};
        }
        .label { 
            font-weight: bold; 
            color: #555;
            flex: 0 0 45%;
        }
        .value { 
            color: #333;
            flex: 1;
            text-align: right;
        }
        .status { 
            display: inline-block; 
            padding: ${compact ? '2px 6px' : '3px 8px'}; 
            border-radius: ${compact ? '10px' : '12px'}; 
            font-size: ${compact ? '9px' : '11px'}; 
            font-weight: bold; 
            text-transform: uppercase;
        }
        .status.confirmed { background: #d4edda; color: #155724; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.completed { background: #d1ecf1; color: #0c5460; }
        .status.cancelled { background: #f8d7da; color: #721c24; }
        .status.in_progress { background: #e2e3e5; color: #383d41; }
        .status.paid { background: #d4edda; color: #155724; }
        .status.invoice_sent { background: #d1ecf1; color: #0c5460; }
        .status.payment_pending { background: #fff3cd; color: #856404; }
        .payment-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: ${compact ? '10px' : '15px'};
            margin-top: ${compact ? '6px' : '8px'};
        }
        .payment-column {
            border: 1px solid #ddd;
            border-radius: 3px;
            overflow: hidden;
            background: white;
        }
        .payment-header {
            background: #f0f0f0;
            padding: ${compact ? '5px 8px' : '8px 12px'};
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            font-size: ${compact ? '11px' : '13px'};
        }
        .payment-item {
            display: flex;
            justify-content: space-between;
            padding: ${compact ? '4px 8px' : '6px 12px'};
            border-bottom: 1px solid #eee;
            font-size: ${compact ? '10px' : '11px'};
        }
        .payment-item:last-child {
            border-bottom: none;
        }
        .payment-item.total {
            background: #e9ecef;
            font-weight: bold;
            font-size: ${compact ? '11px' : '12px'};
        }
        .provider-info, .client-info {
            display: flex;
            align-items: center;
            gap: ${compact ? '8px' : '10px'};
            margin-bottom: ${compact ? '8px' : '10px'};
        }
        .provider-avatar, .client-avatar {
            width: ${compact ? '30px' : '40px'};
            height: ${compact ? '30px' : '40px'};
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #ddd;
        }
        .provider-fallback, .client-fallback {
            width: ${compact ? '30px' : '40px'};
            height: ${compact ? '30px' : '40px'};
            border-radius: 50%;
            background: #f8f9fa;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${compact ? '12px' : '16px'};
            color: #666;
        }
        .compact-text {
            font-size: ${compact ? '10px' : '11px'};
            line-height: 1.2;
            margin-bottom: 2px;
        }
        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
        }
        .role-badge {
            display: inline-block;
            padding: 2px 6px;
            background: ${primaryColor};
            color: white;
            border-radius: 3px;
            font-size: 9px;
            text-transform: uppercase;
            margin-left: 8px;
        }
        @media print {
            body { 
                margin: 0; 
                padding: ${compact ? '15px' : '20px'};
                font-size: ${compact ? '10px' : '12px'};
                border-width: 1px;
                height: auto !important;
                min-height: auto !important;
            }
            .pdf-container {
                height: auto !important;
                min-height: auto !important;
            }
            .no-print { display: none; }
            .section { margin-bottom: ${compact ? '6px' : '10px'}; padding: ${compact ? '6px' : '10px'}; }
            .section:last-child { margin-bottom: 0; }
            .header { margin-bottom: ${compact ? '6px' : '10px'}; padding-bottom: ${compact ? '6px' : '10px'}; }
            .meta { margin-bottom: ${compact ? '6px' : '10px'}; }
            .content-grid { gap: ${compact ? '8px' : '12px'}; margin-bottom: ${compact ? '6px' : '10px'}; }
            .content-grid:last-of-type { margin-bottom: 0; }
            .payment-grid { gap: ${compact ? '6px' : '10px'}; }
            .full-width { margin-bottom: ${compact ? '6px' : '10px'}; }
            .full-width:last-child { margin-bottom: 0; }
        }
    `;
};