/**
 * Quote PDF Templates
 * HTML template generation utilities for quote PDFs
 */

export const generateQuotePDFHeader = (quote, role, config) => {
    const quoteNumber = quote.quote_number || `Q${String(quote.id).padStart(6, '0')}`;
    const statusText = getStatusText(quote.status);
    
    return `
        <div class="header">
            <h1>${config.companyName} - Quote Details</h1>
            <div class="subtitle">Quote ${quoteNumber} | ${statusText}</div>
        </div>
        <div class="meta">
            Generated on: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit", 
                minute: "2-digit",
            })} | ${role.charAt(0).toUpperCase() + role.slice(1)} View
        </div>
    `;
};

export const generateQuoteInfoSection = (quote, role) => {
    const quoteNumber = quote.quote_number || `Q${String(quote.id).padStart(6, '0')}`;
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };
    
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return `
        <div class="section">
            <div class="section-header">Quote Information</div>
            <div class="section-body">
                <div class="info-row">
                    <div class="info-label">Quote ID:</div>
                    <div class="info-value">${quoteNumber}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value">
                        <span class="badge badge-${quote.status}">${getStatusText(quote.status)}</span>
                    </div>
                </div>
                <div class="info-row">
                    <div class="info-label">Created:</div>
                    <div class="info-value">${formatDateTime(quote.created_at)}</div>
                </div>
                ${quote.responded_at ? `
                <div class="info-row">
                    <div class="info-label">Responded:</div>
                    <div class="info-value">${formatDateTime(quote.responded_at)}</div>
                </div>
                ` : ''}
                ${quote.expires_at && quote.status === 'quoted' ? `
                <div class="info-row">
                    <div class="info-label">Expires:</div>
                    <div class="info-value">${formatDateTime(quote.expires_at)}</div>
                </div>
                ` : ''}
                ${quote.urgency && quote.urgency !== 'normal' ? `
                <div class="info-row">
                    <div class="info-label">Urgency:</div>
                    <div class="info-value">
                        <span class="badge" style="background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;">
                            ${quote.urgency.toUpperCase()}
                        </span>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export const generateServiceDetailsSection = (quote) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric", 
            month: "short",
            day: "numeric",
        });
    };

    return `
        <div class="section">
            <div class="section-header">Service Information</div>
            <div class="section-body">
                <div class="info-row">
                    <div class="info-label">Service:</div>
                    <div class="info-value"><strong>${quote.service_title || quote.service?.title || 'N/A'}</strong></div>
                </div>
                ${quote.service_category ? `
                <div class="info-row">
                    <div class="info-label">Category:</div>
                    <div class="info-value">${quote.service_category.name || quote.service_category}</div>
                </div>
                ` : ''}
                ${quote.requested_date ? `
                <div class="info-row">
                    <div class="info-label">Requested Date:</div>
                    <div class="info-value">${formatDate(quote.requested_date)}</div>
                </div>
                ` : ''}
                ${quote.requested_time ? `
                <div class="info-row">
                    <div class="info-label">Requested Time:</div>
                    <div class="info-value">${quote.requested_time}</div>
                </div>
                ` : ''}
                ${quote.location_summary ? `
                <div class="info-row">
                    <div class="info-label">Location:</div>
                    <div class="info-value">${quote.location_summary}</div>
                </div>
                ` : ''}
                ${quote.message ? `
                <div class="info-row">
                    <div class="info-label">Description:</div>
                    <div class="info-value">
                        <div class="quote-details">${quote.message}</div>
                    </div>
                </div>
                ` : ''}
                ${quote.client_requirements ? `
                <div class="info-row">
                    <div class="info-label">Special Requirements:</div>
                    <div class="info-value">
                        <div class="quote-details">${quote.client_requirements}</div>
                    </div>
                </div>
                ` : ''}
                ${quote.description && !quote.message ? `
                <div class="info-row">
                    <div class="info-label">Requirements:</div>
                    <div class="info-value">
                        <div class="quote-details">${quote.description}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export const generateClientDetailsSection = (quote, role) => {
    return `
        <div class="section">
            <div class="section-header">Client Information</div>
            <div class="section-body">
                <div class="info-row">
                    <div class="info-label">Name:</div>
                    <div class="info-value">
                        <strong>${quote.client_name || 'N/A'}</strong>
                        ${quote.client_verified ? ' <span class="badge" style="background: #d4edda; color: #155724; border: 1px solid #c3e6cb;">✓ Verified</span>' : ''}
                    </div>
                </div>
                ${quote.client?.email ? `
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${quote.client.email}</div>
                </div>
                ` : ''}
                ${quote.client?.contact_number ? `
                <div class="info-row">
                    <div class="info-label">Phone:</div>
                    <div class="info-value">${quote.client.contact_number}</div>
                </div>
                ` : ''}
                ${quote.client?.created_at ? `
                <div class="info-row">
                    <div class="info-label">Member Since:</div>
                    <div class="info-value">${new Date(quote.client.created_at).getFullYear()}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export const generateQuoteResponseSection = (quote, role) => {
    if (quote.status === 'pending') {
        return `
            <div class="section">
                <div class="section-header">Quote Response</div>
                <div class="section-body">
                    <div style="text-align: center; padding: 20px; color: #666;">
                        <em>Quote response pending</em>
                    </div>
                </div>
            </div>
        `;
    }

    const formatPrice = (price) => {
        if (!price) return 'Rs. 0';
        return `Rs. ${parseInt(price).toLocaleString()}`;
    };

    const totalAmount = (parseFloat(quote.quoted_price) || 0) + (parseFloat(quote.travel_fee) || 0);

    return `
        <div class="section">
            <div class="section-header">Your Quote Response</div>
            <div class="section-body">
                <div class="two-column">
                    <div>
                        <div class="info-row">
                            <div class="info-label">Quoted Price:</div>
                            <div class="info-value price-large">${formatPrice(quote.quoted_price)}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">Duration:</div>
                            <div class="info-value">${quote.duration_hours || quote.estimated_duration || 'N/A'} hour(s)</div>
                        </div>
                        ${quote.travel_fee && quote.travel_fee > 0 ? `
                        <div class="info-row">
                            <div class="info-label">Travel Fee:</div>
                            <div class="info-value">${formatPrice(quote.travel_fee)}</div>
                        </div>
                        ` : ''}
                    </div>
                    <div>
                        <div class="price-summary">
                            <div class="price-row">
                                <span>Service Price:</span>
                                <span>${formatPrice(quote.quoted_price)}</span>
                            </div>
                            ${quote.travel_fee && quote.travel_fee > 0 ? `
                            <div class="price-row">
                                <span>Travel Fee:</span>
                                <span>${formatPrice(quote.travel_fee)}</span>
                            </div>
                            ` : ''}
                            <div class="price-row total">
                                <span>Total:</span>
                                <span class="price-large">${formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${quote.quote_details || quote.provider_response ? `
                <div class="info-row" style="margin-top: 16px;">
                    <div class="info-label">Description:</div>
                    <div class="info-value">
                        <div class="quote-details">${quote.quote_details || quote.provider_response}</div>
                    </div>
                </div>
                ` : ''}
                ${quote.terms_and_conditions ? `
                <div class="info-row">
                    <div class="info-label">Terms:</div>
                    <div class="info-value">
                        <div class="quote-details">${quote.terms_and_conditions}</div>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export const generateQuoteTimelineSection = (quote, role) => {
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric", 
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return `
        <div class="timeline">
            <div class="timeline-header">Quote Timeline</div>
            
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-title">Quote Request Received</div>
                    <div class="timeline-date">${formatDateTime(quote.created_at)}</div>
                </div>
            </div>

            ${quote.status !== 'pending' && quote.responded_at ? `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-title">Quote Sent</div>
                    <div class="timeline-date">${formatDateTime(quote.responded_at)}</div>
                </div>
            </div>
            ` : ''}

            ${quote.status === 'accepted' && quote.client_responded_at ? `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-title">Quote Accepted</div>
                    <div class="timeline-date">${formatDateTime(quote.client_responded_at)}</div>
                </div>
            </div>
            ` : ''}

            ${quote.status === 'rejected' && quote.client_responded_at ? `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-title">Quote Declined</div>
                    <div class="timeline-date">${formatDateTime(quote.client_responded_at)}</div>
                </div>
            </div>
            ` : ''}

            ${quote.status === 'withdrawn' ? `
            <div class="timeline-item">
                <div class="timeline-content">
                    <div class="timeline-title">Quote Withdrawn</div>
                    <div class="timeline-date">You withdrew this quote</div>
                </div>
            </div>
            ` : ''}
        </div>
    `;
};

export const generateQuoteSummarySection = (quote, role) => {
    // This is already included in the response section, so return empty
    return '';
};

export const generatePrintButtons = () => {
    return `
        <div class="print-buttons">
            <button class="print-button" onclick="window.print()">🖨️ Print PDF</button>
            <button class="print-button" onclick="window.close()">✕ Close</button>
        </div>
    `;
};

// Helper function to get status text
const getStatusText = (status) => {
    const statusTexts = {
        pending: 'Awaiting Response',
        quoted: 'Quote Sent',
        accepted: 'Accepted',
        rejected: 'Declined',
        withdrawn: 'Withdrawn',
        expired: 'Expired',
    };
    return statusTexts[status] || status.replace('_', ' ').toUpperCase();
};