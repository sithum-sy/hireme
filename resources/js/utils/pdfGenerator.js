import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadInvoicePDF = async (
    elementId,
    filename = "invoice.pdf"
) => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error("Invoice element not found");
        }

        // Show loading indicator
        const loadingToast = document.createElement("div");
        loadingToast.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; background: #007bff; color: white; padding: 10px 20px; border-radius: 5px; z-index: 9999;">
                <i class="fas fa-spinner fa-spin me-2"></i>
                Generating PDF...
            </div>
        `;
        document.body.appendChild(loadingToast);

        // Configure html2canvas options for better quality
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: 0,
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
        });

        // Calculate PDF dimensions
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 295; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const pdf = new jsPDF("p", "mm", "a4");
        let position = 0;

        // Add the image to PDF
        pdf.addImage(
            canvas.toDataURL("image/png"),
            "PNG",
            0,
            position,
            imgWidth,
            imgHeight
        );
        heightLeft -= pageHeight;

        // Add new pages if content is longer than one page
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(
                canvas.toDataURL("image/png"),
                "PNG",
                0,
                position,
                imgWidth,
                imgHeight
            );
            heightLeft -= pageHeight;
        }

        // Download the PDF
        pdf.save(filename);

        // Remove loading indicator
        document.body.removeChild(loadingToast);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Failed to generate PDF. Please try again.");

        // Remove loading indicator if it exists
        const loadingElement = document.querySelector(
            '[style*="Generating PDF"]'
        )?.parentElement;
        if (loadingElement) {
            document.body.removeChild(loadingElement);
        }
    }
};

// Alternative: Generate PDF with better formatting
export const downloadFormattedInvoicePDF = async (
    invoiceData,
    filename = "invoice.pdf"
) => {
    try {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Add company logo/header
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("INVOICE", pageWidth / 2, 30, { align: "center" });

        // Invoice details
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");

        let yPosition = 50;

        // Invoice info
        pdf.text(`Invoice #: ${invoiceData.invoice_number}`, 20, yPosition);
        pdf.text(`Date: ${invoiceData.created_at}`, 20, yPosition + 7);
        pdf.text(`Due Date: ${invoiceData.due_date}`, 20, yPosition + 14);

        // Client info
        yPosition += 30;
        pdf.setFont("helvetica", "bold");
        pdf.text("Bill To:", 20, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(invoiceData.client_name, 20, yPosition + 7);
        if (invoiceData.client_address) {
            pdf.text(invoiceData.client_address, 20, yPosition + 14);
        }

        // Service details table
        yPosition += 40;
        pdf.setFont("helvetica", "bold");
        pdf.text("Description", 20, yPosition);
        pdf.text("Amount", pageWidth - 50, yPosition, { align: "right" });

        // Line
        pdf.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);

        yPosition += 10;
        pdf.setFont("helvetica", "normal");
        pdf.text(invoiceData.service_title, 20, yPosition);
        pdf.text(`Rs. ${invoiceData.amount}`, pageWidth - 50, yPosition, {
            align: "right",
        });

        // Total
        yPosition += 20;
        pdf.line(pageWidth - 80, yPosition, pageWidth - 20, yPosition);
        yPosition += 7;
        pdf.setFont("helvetica", "bold");
        pdf.text("Total:", pageWidth - 80, yPosition);
        pdf.text(`Rs. ${invoiceData.total_amount}`, pageWidth - 50, yPosition, {
            align: "right",
        });

        pdf.save(filename);
    } catch (error) {
        console.error("Error generating formatted PDF:", error);
        alert("Failed to generate PDF. Please try again.");
    }
};
