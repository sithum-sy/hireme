/**
 * Reports PDF Styles
 * Provides styling for provider analytics reports optimized for A4
 */

export const getReportsPDFStyles = (config = {}) => {
    const {
        primaryColor = '#007bff',
        pageSize = 'A4',
        margins = '0.6in'
    } = config;

    return `
        @page {
            size: ${pageSize};
            margin: ${margins};
        }
        
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 15px;
            line-height: 1.4; 
            color: #333;
            font-size: 11px;
            background: #f8f9fa;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
        }
        
        .pdf-container {
            max-width: 210mm;
            width: 100%;
            margin: 0 auto;
            padding: 25px;
            border: 2px solid ${primaryColor};
            border-radius: 8px;
            box-sizing: border-box;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            position: relative;
            display: flex;
            flex-direction: column;
            min-height: auto;
        }
        
        .header { 
            text-align: center; 
            border-bottom: 3px solid ${primaryColor}; 
            padding-bottom: 12px; 
            margin-bottom: 15px;
        }
        
        .header h1 { 
            color: ${primaryColor}; 
            margin: 0;
            font-size: 22px;
            font-weight: 700;
        }
        
        .date-range {
            color: #666;
            font-size: 14px;
            margin-top: 5px;
            font-weight: 500;
        }
        
        .meta { 
            text-align: center; 
            color: #666; 
            margin-bottom: 20px; 
            font-size: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        
        .section { 
            margin-bottom: 18px; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 6px;
            background: #fafafa;
            page-break-inside: avoid;
        }
        
        .section:last-child {
            margin-bottom: 0;
        }
        
        .section h3 { 
            color: ${primaryColor}; 
            margin: 0 0 12px 0; 
            border-bottom: 2px solid #e9ecef; 
            padding-bottom: 6px;
            font-size: 16px;
            font-weight: 600;
        }
        
        .subsection {
            margin-bottom: 15px;
        }
        
        .subsection:last-child {
            margin-bottom: 0;
        }
        
        .subsection h4 {
            color: #495057;
            margin: 0 0 8px 0;
            font-size: 13px;
            font-weight: 600;
            border-bottom: 1px solid #dee2e6;
            padding-bottom: 4px;
        }
        
        .full-width {
            margin-bottom: 20px;
        }
        
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-top: 10px;
        }
        
        .summary-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .summary-label {
            font-size: 10px;
            color: #6c757d;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
        }
        
        .summary-value {
            font-size: 16px;
            font-weight: 700;
            color: #212529;
        }
        
        .summary-value.income {
            color: #28a745;
        }
        
        .summary-value.rate {
            color: #ffc107;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            background: white;
            border-radius: 4px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .data-table th {
            background: #f8f9fa;
            padding: 10px 12px;
            text-align: left;
            font-weight: 600;
            font-size: 11px;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .data-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e9ecef;
            font-size: 11px;
        }
        
        .data-table tbody tr:hover {
            background: #f8f9fa;
        }
        
        .data-table tfoot td {
            background: #e9ecef;
            font-weight: 600;
            border-top: 2px solid #dee2e6;
            border-bottom: none;
        }
        
        .amount {
            text-align: right;
            font-weight: 600;
            color: #28a745;
        }
        
        .count {
            text-align: right;
            font-weight: 600;
        }
        
        .count.success {
            color: #28a745;
        }
        
        .count.danger {
            color: #dc3545;
        }
        
        .count.info {
            color: #17a2b8;
        }
        
        .count.warning {
            color: #ffc107;
        }
        
        .no-data {
            text-align: center;
            padding: 20px;
            color: #6c757d;
            font-style: italic;
            background: white;
            border-radius: 4px;
            border: 1px dashed #dee2e6;
        }
        
        @media print {
            body { 
                margin: 0; 
                padding: 10px;
                font-size: 10px;
                background: white !important;
            }
            
            .pdf-container {
                border: none;
                box-shadow: none;
                padding: 15px;
                height: auto !important;
                min-height: auto !important;
            }
            
            .no-print { 
                display: none; 
            }
            
            .section { 
                margin-bottom: 12px; 
                padding: 12px;
                break-inside: avoid;
            }
            
            .section:last-child { 
                margin-bottom: 0; 
            }
            
            .header { 
                margin-bottom: 12px; 
                padding-bottom: 8px; 
            }
            
            .meta { 
                margin-bottom: 15px; 
            }
            
            .summary-grid { 
                gap: 8px; 
                margin-bottom: 15px; 
            }
            
            .summary-card {
                padding: 8px;
                box-shadow: none;
            }
            
            .summary-value {
                font-size: 14px;
            }
            
            .data-table {
                box-shadow: none;
            }
            
            .data-table th {
                padding: 6px 8px;
                font-size: 9px;
            }
            
            .data-table td {
                padding: 5px 8px;
                font-size: 9px;
            }
            
            .subsection {
                margin-bottom: 10px;
            }
            
            .full-width { 
                margin-bottom: 15px; 
            }
            
            .full-width:last-child { 
                margin-bottom: 0; 
            }
        }
        
        .charts-container {
            width: 100%;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .chart-section {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .chart-section h3 {
            margin: 0 0 15px 0;
            font-size: 14px;
            color: #495057;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 8px;
        }
        
        .chart-placeholder {
            height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #f1f3f4;
            border-radius: 4px;
            background: #fafafa;
        }
        
        .no-data-message {
            color: #6c757d;
            font-style: italic;
            text-align: center;
            font-size: 11px;
        }
        
        /* Bar Chart Styles */
        .bar-chart {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
        }
        
        .chart-bars {
            display: flex;
            align-items: flex-end;
            justify-content: space-around;
            height: 80%;
            padding: 10px 5px;
        }
        
        .chart-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            margin: 0 2px;
        }
        
        .bar {
            width: 100%;
            max-width: 25px;
            background: linear-gradient(to top, #007bff, #4dabf7);
            border-radius: 2px 2px 0 0;
            min-height: 5px;
        }
        
        .bar-label {
            font-size: 8px;
            margin-top: 4px;
            text-align: center;
            color: #666;
            writing-mode: vertical-rl;
            text-orientation: mixed;
        }
        
        .bar-value {
            font-size: 7px;
            margin-top: 2px;
            font-weight: 600;
            color: #007bff;
        }
        
        /* Pie Chart Styles */
        .pie-chart-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 100%;
            padding: 10px;
        }
        
        .pie-visual {
            flex: 0 0 100px;
        }
        
        .pie-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: conic-gradient(
                #28a745 0deg 120deg,
                #dc3545 120deg 180deg,
                #17a2b8 180deg 240deg,
                #ffc107 240deg 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        .pie-center {
            width: 50px;
            height: 50px;
            background: white;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 600;
            color: #495057;
        }
        
        .pie-center small {
            font-size: 8px;
            color: #6c757d;
        }
        
        .pie-legend {
            flex: 1;
            padding-left: 15px;
        }
        
        .pie-legend-item {
            display: flex;
            align-items: center;
            margin-bottom: 6px;
            font-size: 9px;
        }
        
        .legend-color {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            margin-right: 8px;
        }
        
        /* Line Chart Styles */
        .line-chart {
            width: 100%;
            height: 100%;
            padding: 15px 10px;
        }
        
        .trend-svg {
            width: 100%;
            height: 100%;
        }
        
        .chart-label {
            font-size: 8px;
            fill: #666;
        }
        
        /* Horizontal Bar Chart Styles */
        .horizontal-bar-chart {
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            height: 100%;
            padding: 10px;
        }
        
        .service-bar {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .service-label {
            flex: 0 0 60px;
            font-size: 8px;
            color: #666;
            margin-right: 8px;
            text-align: right;
        }
        
        .bar.horizontal {
            height: 12px;
            background: linear-gradient(to right, #6f42c1, #9c5afe);
            border-radius: 6px;
            min-width: 5px;
            margin-right: 5px;
        }
        
        .service-value {
            font-size: 8px;
            font-weight: 600;
            color: #6f42c1;
            min-width: 20px;
        }
        
        @media print {
            .charts-grid {
                gap: 15px;
                margin-bottom: 10px;
            }
            
            .chart-section {
                padding: 10px;
                box-shadow: none;
                break-inside: avoid;
            }
            
            .chart-section h3 {
                font-size: 12px;
                margin-bottom: 10px;
            }
            
            .chart-placeholder {
                height: 150px;
            }
            
            .bar-label {
                font-size: 7px;
            }
            
            .bar-value {
                font-size: 6px;
            }
            
            .pie-legend-item {
                font-size: 8px;
                margin-bottom: 4px;
            }
            
            .service-label {
                font-size: 7px;
            }
            
            .service-value {
                font-size: 7px;
            }
        }
        
        @media print and (max-width: 210mm) {
            .summary-grid {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
                gap: 10px;
            }
            
            .chart-placeholder {
                height: 120px;
            }
        }
    `;
};