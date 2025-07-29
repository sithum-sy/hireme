/**
 * Industry-Standard Invoice PDF Templates
 * Provides professional invoice templates following industry best practices
 */

export const formatInvoiceDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch (error) {
        return dateString;
    }
};

export const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount || 0);
    return `Rs. ${numAmount.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

export const generateInvoiceHeader = (invoice, config = {}) => {
    const {
        companyName = "HireMe Services",
        companyAddress = "Colombo, Sri Lanka",
        companyPhone = "+94 11 234 5678",
        companyEmail = "info@hireme.lk",
        logoUrl = null,
    } = config;

    return `
        <div class="invoice-header">
            <div class="company-info">
                ${
                    logoUrl
                        ? `<img src="${logoUrl}" alt="${companyName}" class="company-logo">`
                        : ""
                }
                <div class="company-details">
                    <h1 class="company-name">${companyName}</h1>
                    <div class="company-contact">
                        <div>${companyAddress}</div>
                        <div>Phone: ${companyPhone}</div>
                        <div>Email: ${companyEmail}</div>
                    </div>
                </div>
            </div>
            <div class="invoice-title">
                <h1>INVOICE</h1>
                <div class="invoice-number">#${
                    invoice.invoice_number || invoice.id
                }</div>
                ${
                    invoice.status
                        ? `<div class="invoice-status status-${
                              invoice.status
                          }">${invoice.status.toUpperCase()}</div>`
                        : ""
                }
            </div>
        </div>
    `;
};

export const generateInvoiceDetails = (invoice) => {
    return `
        <div class="invoice-details">
            <div class="detail-section">
                <h3>Invoice Details</h3>
                <div class="detail-row">
                    <span class="label">Invoice Number:</span>
                    <span class="value">${
                        invoice.invoice_number || invoice.id
                    }</span>
                </div>
                <div class="detail-row">
                    <span class="label">Issue Date:</span>
                    <span class="value">${formatInvoiceDate(
                        invoice.issued_at || invoice.created_at
                    )}</span>
                </div>
                <div class="detail-row">
                    <span class="label">Due Date:</span>
                    <span class="value">${formatInvoiceDate(
                        invoice.due_date
                    )}</span>
                </div>
                ${
                    invoice.appointment?.id
                        ? `
                <div class="detail-row">
                    <span class="label">Appointment ID:</span>
                    <span class="value">#${invoice.appointment.id}</span>
                </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
};

export const generateBillingAddresses = (invoice, role) => {
    const showProviderDetails =
        role === "client" || role === "admin" || role === "staff";
    const showClientDetails =
        role === "provider" || role === "admin" || role === "staff";

    return `
        <div class="billing-addresses">
            ${
                showProviderDetails
                    ? `
            <div class="address-section">
                <h3>Service Provider</h3>
                <div class="address-content">
                    <div class="name">${invoice.provider?.first_name || ""} ${
                          invoice.provider?.last_name || ""
                      }</div>
                    ${
                        invoice.provider?.provider_profile?.business_name
                            ? `
                    <div class="business">${invoice.provider.provider_profile.business_name}</div>
                    `
                            : ""
                    }
                    ${
                        invoice.provider?.email
                            ? `<div>${invoice.provider.email}</div>`
                            : ""
                    }
                    ${
                        invoice.provider?.contact_number
                            ? `<div>Phone: ${invoice.provider.contact_number}</div>`
                            : ""
                    }
                    ${
                        invoice.provider?.provider_profile?.address
                            ? `<div>${invoice.provider.provider_profile.address}</div>`
                            : ""
                    }
                </div>
            </div>
            `
                    : ""
            }

            ${
                showClientDetails
                    ? `
            <div class="address-section">
                <h3>Bill To</h3>
                <div class="address-content">
                    <div class="name">${invoice.client?.first_name || ""} ${
                          invoice.client?.last_name || ""
                      }</div>
                    ${
                        invoice.client?.email
                            ? `<div>${invoice.client.email}</div>`
                            : ""
                    }
                    ${
                        invoice.appointment?.client_phone
                            ? `<div>Phone: ${invoice.appointment.client_phone}</div>`
                            : ""
                    }
                    ${
                        invoice.appointment?.client_address
                            ? `<div>${invoice.appointment.client_address}</div>`
                            : ""
                    }
                    ${
                        invoice.appointment?.client_city
                            ? `<div>${invoice.appointment.client_city}</div>`
                            : ""
                    }
                </div>
            </div>
            `
                    : ""
            }
        </div>
    `;
};

export const generateServiceDetails = (invoice) => {
    const appointment = invoice.appointment;
    if (!appointment) return "";

    const formatTime = (timeStr) => {
        if (!timeStr) return "N/A";
        try {
            const timeParts = timeStr.split(":");
            if (timeParts.length >= 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = timeParts[1];
                const ampm = hours >= 12 ? "PM" : "AM";
                const displayHour =
                    hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
                return `${displayHour}:${minutes} ${ampm}`;
            }
            return timeStr;
        } catch (error) {
            return timeStr;
        }
    };

    return `
        <div class="service-details">
            <h3>Service Information</h3>
            <div class="service-grid">
                <div class="service-item">
                    <span class="label">Service:</span>
                    <span class="value">${
                        appointment.service?.title || "Service"
                    }</span>
                </div>
                <div class="service-item">
                    <span class="label">Date:</span>
                    <span class="value">${formatInvoiceDate(
                        appointment.appointment_date
                    )}</span>
                </div>
                <div class="service-item">
                    <span class="label">Time:</span>
                    <span class="value">${formatTime(
                        appointment.appointment_time
                    )}</span>
                </div>
                <div class="service-item">
                    <span class="label">Duration:</span>
                    <span class="value">${
                        appointment.duration_hours || 1
                    } hour${
        (appointment.duration_hours || 1) > 1 ? "s" : ""
    }</span>
                </div>
                ${
                    appointment.client_address
                        ? `
                <div class="service-item">
                    <span class="label">Location:</span>
                    <span class="value">${appointment.client_address.replace(
                        /_/g,
                        " "
                    )}</span>
                </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
};

export const generateLineItems = (invoice) => {
    const lineItems = invoice.line_items || [];

    // If no line items, create default from appointment
    const items =
        lineItems.length > 0
            ? lineItems
            : [
                  {
                      description:
                          invoice.appointment?.service?.title || "Service",
                      quantity: 1,
                      rate: invoice.subtotal || invoice.total_amount,
                      amount: invoice.subtotal || invoice.total_amount,
                  },
              ];

    return `
        <div class="line-items">
            <h3>Items & Services</h3>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th class="center">Qty</th>
                        <th class="right">Rate</th>
                        <th class="right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${items
                        .map(
                            (item) => `
                        <tr>
                            <td>${item.description}</td>
                            <td class="center">${item.quantity}</td>
                            <td class="right">${formatCurrency(item.rate)}</td>
                            <td class="right">${formatCurrency(
                                item.amount
                            )}</td>
                        </tr>
                    `
                        )
                        .join("")}
                </tbody>
            </table>
        </div>
    `;
};

export const generateTotalsSection = (invoice) => {
    const subtotal = parseFloat(invoice.subtotal || invoice.total_amount || 0);
    const taxAmount = parseFloat(invoice.tax_amount || 0);
    const discountAmount = parseFloat(invoice.discount_amount || 0);
    const totalAmount = parseFloat(invoice.total_amount || 0);
    const paidAmount = parseFloat(invoice.paid_amount || 0);
    const balanceDue = totalAmount - paidAmount;

    return `
        <div class="totals-section">
            <div class="totals-table">
                <div class="total-row">
                    <span class="label">Subtotal:</span>
                    <span class="value">${formatCurrency(subtotal)}</span>
                </div>
                ${
                    taxAmount > 0
                        ? `
                <div class="total-row">
                    <span class="label">Tax:</span>
                    <span class="value">${formatCurrency(taxAmount)}</span>
                </div>
                `
                        : ""
                }
                ${
                    discountAmount > 0
                        ? `
                <div class="total-row discount">
                    <span class="label">Discount:</span>
                    <span class="value">-${formatCurrency(
                        discountAmount
                    )}</span>
                </div>
                `
                        : ""
                }
                <div class="total-row total">
                    <span class="label">Total:</span>
                    <span class="value">${formatCurrency(totalAmount)}</span>
                </div>
                ${
                    paidAmount > 0
                        ? `
                <div class="total-row">
                    <span class="label">Paid:</span>
                    <span class="value">${formatCurrency(paidAmount)}</span>
                </div>
                <div class="total-row balance ${
                    balanceDue > 0 ? "due" : "paid"
                }">
                    <span class="label">${
                        balanceDue > 0 ? "Balance Due:" : "Paid in Full"
                    }</span>
                    <span class="value">${
                        balanceDue > 0 ? formatCurrency(balanceDue) : "✓"
                    }</span>
                </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
};

export const generatePaymentInformation = (invoice) => {
    return `
        <div class="payment-info">
            <h3>Payment Information</h3>
            <div class="payment-grid">
                <div class="payment-item">
                    <span class="label">Payment Method:</span>
                    <span class="value">${
                        invoice.payment_method
                            ? invoice.payment_method.charAt(0).toUpperCase() +
                              invoice.payment_method.slice(1)
                            : "Not specified"
                    }</span>
                </div>
                <div class="payment-item">
                    <span class="label">Payment Status:</span>
                    <span class="value status-${invoice.payment_status}">${
        invoice.payment_status
            ? invoice.payment_status.charAt(0).toUpperCase() +
              invoice.payment_status.slice(1)
            : "Pending"
    }</span>
                </div>
                ${
                    invoice.paid_at
                        ? `
                <div class="payment-item">
                    <span class="label">Paid Date:</span>
                    <span class="value">${formatInvoiceDate(
                        invoice.paid_at
                    )}</span>
                </div>
                `
                        : ""
                }
                ${
                    invoice.transaction_id
                        ? `
                <div class="payment-item">
                    <span class="label">Transaction ID:</span>
                    <span class="value">${invoice.transaction_id}</span>
                </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
};

export const generatePaymentTerms = (invoice, config = {}) => {
    const {
        paymentTerms = "Payment is due within 30 days of invoice date.",
        lateFeesPolicy = "Late fees may apply after due date.",
        paymentMethods = "We accept cash, bank transfer, and online payments.",
    } = config;

    return `
        <div class="payment-terms">
            <h3>Payment Terms & Conditions</h3>
            <div class="terms-content">
                <div class="term-item">• ${paymentTerms}</div>
                <div class="term-item">• ${lateFeesPolicy}</div>
                <div class="term-item">• ${paymentMethods}</div>
                ${
                    invoice.notes
                        ? `
                <div class="term-item">
                    <strong>Notes:</strong> ${invoice.notes}
                </div>
                `
                        : ""
                }
            </div>
        </div>
    `;
};

export const generateInvoiceFooter = (config = {}) => {
    const {
        companyName = "HireMe Services",
        websiteUrl = "www.hireme.lk",
        supportEmail = "support@hireme.lk",
    } = config;

    return `
        <div class="invoice-footer">
            <div class="footer-content">
                <div class="footer-section">
                    <div>Thank you for choosing ${companyName}!</div>
                    <div>Questions? Contact us at ${supportEmail}</div>
                </div>
                <div class="footer-section">
                    <div>${websiteUrl}</div>
                    <div>Generated on ${new Date().toLocaleDateString()}</div>
                </div>
            </div>
        </div>
    `;
};

export const generateCompactPaymentInfo = (invoice) => {
    return `
        <div class="compact-payment-info">
            <div class="payment-detail">
                <span class="label">Payment:</span>
                <span class="value status-${invoice.payment_status}">${
                    invoice.payment_method ? 
                    `${invoice.payment_method.charAt(0).toUpperCase() + invoice.payment_method.slice(1)} - ${invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}` :
                    invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)
                }</span>
            </div>
            ${invoice.paid_at ? `
            <div class="payment-detail">
                <span class="label">Paid:</span>
                <span class="value">${formatInvoiceDate(invoice.paid_at)}</span>
            </div>
            ` : ''}
        </div>
    `;
};

export const generateCompactFooter = (invoice, config = {}) => {
    const {
        companyName = "HireMe Services",
        supportEmail = "support@hireme.lk",
        paymentTerms = "Payment due within 30 days"
    } = config;

    return `
        <div class="compact-footer">
            <div class="footer-info">
                <span>Thank you for choosing ${companyName}! • ${paymentTerms} • ${supportEmail}</span>
                ${invoice.notes ? `<div class="invoice-notes"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}
            </div>
        </div>
    `;
};

export const generateFullInvoicePDF = (invoice, role, config = {}) => {
    return `
        <div class="invoice-pdf-container" id="invoice-content">
            ${generateInvoiceHeader(invoice, config)}
            
            <div class="invoice-main">
                <div class="main-content">
                    ${generateBillingAddresses(invoice, role)}
                    ${generateServiceDetails(invoice)}
                    ${generateLineItems(invoice)}
                </div>
                
                <div class="sidebar-content">
                    ${generateTotalsSection(invoice)}
                    ${generateCompactPaymentInfo(invoice)}
                </div>
            </div>
            
            ${generateCompactFooter(invoice, config)}
        </div>
    `;
};
