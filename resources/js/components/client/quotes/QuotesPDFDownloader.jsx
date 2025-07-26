import React from "react";

const QuotesPDFDownloader = ({
    quote = null,
    quotes = null,
    role = "client",
    onDownload = null,
    onError = null,
    disabled = false,
    buttonText = null,
    className = "",
    variant = "button",
}) => {
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "";
        try {
            const timeParts = timeString.toString().split(":");
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? "PM" : "AM";
                const displayHour = hours % 12 || 12;
                return `${displayHour}:${minutes} ${ampm}`;
            }
        } catch (error) {
            console.warn("Error formatting time:", error);
        }
        return timeString.toString();
    };

    const formatPrice = (price) => {
        if (!price) return "Pending";
        return `Rs. ${parseInt(price).toLocaleString()}`;
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: "Pending Response",
            quoted: "Quote Provided",
            accepted: "Accepted",
            declined: "Declined",
            expired: "Expired",
            cancelled: "Cancelled",
        };
        return statusTexts[status] || status.replace("_", " ").toUpperCase();
    };

    const downloadSingleQuotePDF = (quote) => {
        try {
            const printWindow = window.open("", "_blank");
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Quote ${
                        quote.quote_number ||
                        `Q${String(quote.id).padStart(6, "0")}`
                    }</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #333;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 3px solid #007bff; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px;
                        }
                        .header h1 { 
                            color: #007bff; 
                            margin: 0;
                            font-size: 28px;
                        }
                        .header p { 
                            color: #666; 
                            margin: 5px 0 0 0;
                        }
                        .section { 
                            margin-bottom: 25px; 
                            padding: 15px;
                            border-left: 4px solid #007bff;
                            background-color: #f8f9fa;
                        }
                        .section h3 { 
                            margin-top: 0; 
                            color: #007bff;
                            font-size: 18px;
                        }
                        .info-grid { 
                            display: grid; 
                            grid-template-columns: 1fr 1fr; 
                            gap: 20px; 
                            margin: 15px 0;
                        }
                        .info-item { 
                            margin-bottom: 10px; 
                        }
                        .info-label { 
                            font-weight: bold; 
                            color: #555;
                            display: block;
                            margin-bottom: 2px;
                        }
                        .info-value { 
                            color: #333;
                        }
                        .status { 
                            display: inline-block;
                            padding: 4px 12px; 
                            border-radius: 20px; 
                            font-size: 12px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .status.pending { background-color: #fff3cd; color: #856404; }
                        .status.quoted { background-color: #d4edda; color: #155724; }
                        .status.accepted { background-color: #d1ecf1; color: #0c5460; }
                        .status.declined { background-color: #f8d7da; color: #721c24; }
                        .status.expired { background-color: #e2e3e5; color: #383d41; }
                        .price-highlight {
                            font-size: 24px;
                            font-weight: bold;
                            color: #28a745;
                            text-align: center;
                            padding: 15px;
                            background-color: #f8f9fa;
                            border: 2px solid #28a745;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .message-box {
                            background-color: #f8f9fa;
                            border: 1px solid #dee2e6;
                            border-radius: 8px;
                            padding: 15px;
                            margin: 15px 0;
                        }
                        .footer {
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #dee2e6;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Service Quote</h1>
                        <p>Quote Number: ${
                            quote.quote_number ||
                            `Q${String(quote.id).padStart(6, "0")}`
                        }</p>
                        <p>Generated on: ${new Date().toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}</p>
                    </div>

                    <div class="section">
                        <h3>Quote Details</h3>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Status:</span>
                                <span class="status ${
                                    quote.status
                                }">${getStatusText(quote.status)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Created:</span>
                                <span class="info-value">${formatDate(
                                    quote.created_at
                                )}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Requested Date:</span>
                                <span class="info-value">${formatDate(
                                    quote.requested_date
                                )} ${formatTime(quote.requested_time)}</span>
                            </div>
                            ${
                                quote.expires_at
                                    ? `
                            <div class="info-item">
                                <span class="info-label">Expires:</span>
                                <span class="info-value">${formatDate(
                                    quote.expires_at
                                )}</span>
                            </div>
                            `
                                    : ""
                            }
                        </div>
                    </div>

                    <div class="section">
                        <h3>Service Information</h3>
                        <div class="info-item">
                            <span class="info-label">Service:</span>
                            <span class="info-value">${
                                quote.service_title || "Service"
                            }</span>
                        </div>
                        ${
                            quote.service_category
                                ? `
                        <div class="info-item">
                            <span class="info-label">Category:</span>
                            <span class="info-value">${quote.service_category}</span>
                        </div>
                        `
                                : ""
                        }
                    </div>

                    <div class="section">
                        <h3>Provider Information</h3>
                        <div class="info-item">
                            <span class="info-label">Provider:</span>
                            <span class="info-value">
                                ${
                                    quote.provider?.name ||
                                    quote.provider?.first_name +
                                        " " +
                                        (quote.provider?.last_name || "") ||
                                    "Provider"
                                } 
                                ${
                                    quote.provider_verified ||
                                    quote.provider?.verified
                                        ? "✓ Verified"
                                        : ""
                                }
                            </span>
                        </div>
                        ${
                            quote.provider_profile?.business_name ||
                            quote.provider?.provider_profile?.business_name
                                ? `
                        <div class="info-item">
                            <span class="info-label">Business:</span>
                            <span class="info-value">${
                                quote.provider_profile?.business_name ||
                                quote.provider?.provider_profile?.business_name
                            }</span>
                        </div>
                        `
                                : ""
                        }
                    </div>

                    ${
                        quote.quoted_price
                            ? `
                    <div class="price-highlight">
                        Quote Price: ${formatPrice(quote.quoted_price)}
                        ${
                            quote.travel_fee && quote.travel_fee > 0
                                ? `<br><small style="font-size: 14px; color: #666;">+ Rs. ${quote.travel_fee} travel fee</small>`
                                : ""
                        }
                    </div>
                    `
                            : ""
                    }

                    ${
                        quote.message
                            ? `
                    <div class="section">
                        <h3>Request Details</h3>
                        <div class="message-box">
                            ${quote.message}
                        </div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        quote.provider_response
                            ? `
                    <div class="section">
                        <h3>Provider Response</h3>
                        <div class="message-box">
                            ${quote.provider_response}
                        </div>
                        ${
                            quote.estimated_duration
                                ? `
                        <div class="info-item">
                            <span class="info-label">Estimated Duration:</span>
                            <span class="info-value">${quote.estimated_duration} hours</span>
                        </div>
                        `
                                : ""
                        }
                    </div>
                    `
                            : ""
                    }

                    ${
                        quote.special_requirements
                            ? `
                    <div class="section">
                        <h3>Special Requirements</h3>
                        <div class="message-box">
                            ${quote.special_requirements}
                        </div>
                    </div>
                    `
                            : ""
                    }

                    ${
                        quote.location_summary
                            ? `
                    <div class="section">
                        <h3>Service Location</h3>
                        <div class="info-item">
                            <span class="info-label">Location:</span>
                            <span class="info-value">${quote.location_summary}</span>
                        </div>
                    </div>
                    `
                            : ""
                    }

                    <div class="footer">
                        <p>This quote was generated automatically by the HireMe platform.</p>
                        <p>For questions or concerns, please contact the provider directly through the platform.</p>
                    </div>

                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()" 
                                style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px; font-size: 14px;">
                            Print PDF
                        </button>
                        <button onclick="window.close()" 
                                style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                            Close
                        </button>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            if (onDownload) {
                onDownload(quote);
            }
        } catch (error) {
            console.error("Error generating quote PDF:", error);
            if (onError) {
                onError(error);
            }
        }
    };

    const downloadQuotesListPDF = (quotes) => {
        try {
            const printWindow = window.open("", "_blank");
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>My Quotes List</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.4;
                        }
                        .header { 
                            text-align: center; 
                            border-bottom: 2px solid #007bff; 
                            padding-bottom: 20px; 
                            margin-bottom: 30px;
                        }
                        .header h1 { 
                            color: #007bff; 
                            margin: 0;
                        }
                        .summary {
                            text-align: center; 
                            color: #666; 
                            margin-bottom: 30px;
                            background-color: #f8f9fa;
                            padding: 15px;
                            border-radius: 8px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin-top: 20px; 
                        }
                        th, td { 
                            border: 1px solid #ddd; 
                            padding: 10px; 
                            text-align: left; 
                            font-size: 12px;
                        }
                        th { 
                            background-color: #007bff; 
                            color: white;
                            font-weight: bold; 
                        }
                        .status { 
                            padding: 2px 8px; 
                            border-radius: 12px; 
                            font-size: 10px;
                            font-weight: bold;
                            text-transform: uppercase;
                        }
                        .status.pending { background-color: #fff3cd; color: #856404; }
                        .status.quoted { background-color: #d4edda; color: #155724; }
                        .status.accepted { background-color: #d1ecf1; color: #0c5460; }
                        .status.declined { background-color: #f8d7da; color: #721c24; }
                        .status.expired { background-color: #e2e3e5; color: #383d41; }
                        .price { text-align: right; font-weight: bold; color: #28a745; }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid #dee2e6;
                            text-align: center;
                            color: #666;
                            font-size: 11px;
                        }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>My Quotes List</h1>
                    </div>
                    
                    <div class="summary">
                        <p><strong>Generated on:</strong> ${new Date().toLocaleDateString(
                            "en-US",
                            {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}</p>
                        <p><strong>Total Quotes:</strong> ${quotes.length}</p>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Quote #</th>
                                <th>Service</th>
                                <th>Provider</th>
                                <th>Requested Date</th>
                                <th>Quote Price</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quotes
                                .map(
                                    (quote) => `
                                <tr>
                                    <td>${
                                        quote.quote_number ||
                                        `Q${String(quote.id).padStart(6, "0")}`
                                    }</td>
                                    <td>
                                        ${quote.service_title || "Service"}
                                        ${
                                            quote.service_category
                                                ? `<br><small style="color: #666;">${quote.service_category}</small>`
                                                : ""
                                        }
                                    </td>
                                    <td>
                                        ${quote.provider?.name || (quote.provider?.first_name + ' ' + (quote.provider?.last_name || '')) || "Provider"}
                                        ${(quote.provider_profile?.business_name || quote.provider?.provider_profile?.business_name) ? 
                                            '<br><small style="color: #666;">' + (quote.provider_profile?.business_name || quote.provider?.provider_profile?.business_name) + '</small>' : ''}
                                        ${
                                            (quote.provider_verified || quote.provider?.verified)
                                                ? '<br><small style="color: #28a745;">✓ Verified</small>'
                                                : ""
                                        }
                                    </td>
                                    <td>
                                        ${formatDate(quote.requested_date)}
                                        ${
                                            quote.requested_time
                                                ? `<br><small>${formatTime(
                                                      quote.requested_time
                                                  )}</small>`
                                                : ""
                                        }
                                    </td>
                                    <td class="price">
                                        ${formatPrice(quote.quoted_price)}
                                        ${
                                            quote.travel_fee &&
                                            quote.travel_fee > 0
                                                ? `<br><small>+ Rs. ${quote.travel_fee}</small>`
                                                : ""
                                        }
                                    </td>
                                    <td>
                                        <span class="status ${
                                            quote.status
                                        }">${getStatusText(quote.status)}</span>
                                        ${
                                            quote.expires_at &&
                                            quote.status === "quoted"
                                                ? `<br><small>Exp: ${formatDate(
                                                      quote.expires_at
                                                  )}</small>`
                                                : ""
                                        }
                                    </td>
                                    <td>
                                        ${formatDate(quote.created_at)}
                                    </td>
                                </tr>
                            `
                                )
                                .join("")}
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>This report was generated automatically by the HireMe platform.</p>
                    </div>

                    <div class="no-print" style="margin-top: 30px; text-align: center;">
                        <button onclick="window.print()" 
                                style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                            Print PDF
                        </button>
                        <button onclick="window.close()" 
                                style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Close
                        </button>
                    </div>
                </body>
                </html>
            `;

            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();

            if (onDownload) {
                onDownload(quotes);
            }
        } catch (error) {
            console.error("Error generating quotes list PDF:", error);
            if (onError) {
                onError(error);
            }
        }
    };

    const handleDownload = () => {
        if (disabled) return;

        if (quote) {
            downloadSingleQuotePDF(quote);
        } else if (quotes && quotes.length > 0) {
            downloadQuotesListPDF(quotes);
        }
    };

    const getButtonText = () => {
        if (buttonText) return buttonText;

        if (quotes) {
            return `Download ${quotes.length} Quote${
                quotes.length > 1 ? "s" : ""
            } PDF`;
        }

        return "Download PDF";
    };

    if (variant === "custom") {
        return (
            <div onClick={handleDownload} className={className}>
                {children}
            </div>
        );
    }

    if (variant === "link") {
        return (
            <button
                type="button"
                className={`btn-link text-decoration-none ${className}`}
                onClick={handleDownload}
                disabled={disabled}
            >
                {getButtonText()}
            </button>
        );
    }

    return (
        <button
            type="button"
            className={`btn btn-outline-success ${className}`}
            onClick={handleDownload}
            disabled={disabled}
        >
            <i className="fas fa-download me-2"></i>
            {getButtonText()}
        </button>
    );
};

export default QuotesPDFDownloader;
