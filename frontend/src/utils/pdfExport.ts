import { jsPDF } from "jspdf";
import { User, ProduceListing, Order, Cooperative, CooperativeMessage } from "../types";

export function exportFarmerReportPDF(
  user: User,
  listings: ProduceListing[],
  orders: Order[],
  coops: Cooperative[],
  coopMessages: CooperativeMessage[]
) {
  // Create an A4 PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let y = 15;
  let pageNumber = 1;

  // Helper to draw Header on each page
  const drawPageHeader = (pageNum: number) => {
    // Top primary bar accent
    doc.setFillColor(88, 28, 135); // Deep Purple
    doc.rect(0, 0, pageWidth, 6, "F");

    // Title / Logo text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(88, 28, 135);
    doc.text("KRISHI ASSIST - SMART DIGITAL AGRI PLATFORM", 14, 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("OFFLINE LEDGER & TRANSACTION RECORD", 14, 17);

    // Date
    const today = new Date().toLocaleString();
    doc.text(`Generated: ${today}`, pageWidth - 14, 15, { align: "right" });

    // Header divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, 20, pageWidth - 14, 20);
  };

  // Helper to draw Footer on each page
  const drawPageFooter = (pageNum: number) => {
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("This document is a certified system ledger export for offline record-keeping.", 14, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - 14, pageHeight - 10, { align: "right" });
  };

  // Helper to check for page overflow
  const ensureSpace = (heightNeeded: number) => {
    if (y + heightNeeded > pageHeight - 20) {
      drawPageFooter(pageNumber);
      doc.addPage();
      pageNumber++;
      y = 25; // Reset y for new page
      drawPageHeader(pageNumber);
    }
  };

  // Draw first page header
  drawPageHeader(pageNumber);
  y = 28;

  // --- REPORT TITLE & FARMER PROFILE ---
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text("OFFLINE RECORD-KEEPING LEDGER", 14, y);
  y += 6;

  doc.setFont("helvetica", "medium");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Comprehensive summary of active listings, B2B transactions, and cooperative networks.", 14, y);
  y += 10;

  // Profile Card Box
  doc.setFillColor(248, 250, 252); // soft slate bg
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, y, pageWidth - 28, 25, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(88, 28, 135);
  doc.text(`Farmer Profile: ${user.fullName}`, 18, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Username: ${user.username}`, 18, y + 12);
  doc.text(`Phone: ${user.phone}`, 18, y + 18);
  doc.text(`District: ${user.district}`, 100, y + 12);
  
  const verifiedStr = user.verified ? "VERIFIED (Active B2B Trading Enabled)" : "UNVERIFIED / PENDING";
  doc.setFont("helvetica", "bold");
  if (user.verified) {
    doc.setTextColor(5, 150, 105); // Green
  } else {
    doc.setTextColor(225, 29, 72); // Rose
  }
  doc.text(`Status: ${verifiedStr}`, 100, y + 18);

  y += 33;

  // --- SECTION 1: CROP LISTINGS ---
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(88, 28, 135);
  doc.text("1. ACTIVE & PUBLISHED CROP LISTINGS", 14, y);
  y += 5;

  if (listings.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No crop listings recorded in this ledger.", 14, y);
    y += 10;
  } else {
    // Draw listings table headers
    ensureSpace(12);
    doc.setFillColor(88, 28, 135);
    doc.rect(14, y, pageWidth - 28, 7, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Crop Name", 18, y + 5);
    doc.text("Quantity", 65, y + 5);
    doc.text("Target Price", 100, y + 5);
    doc.text("Expected Revenue", 135, y + 5);
    doc.text("Status", 175, y + 5);
    y += 7;

    // Populate rows
    listings.forEach((l) => {
      ensureSpace(8);
      // Alternate light background
      doc.setFillColor(255, 255, 255);
      doc.rect(14, y, pageWidth - 28, 7, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(l.crop, 18, y + 5);
      doc.text(`${l.quantity} ${l.unit || "KG"}`, 65, y + 5);
      doc.text(`NRs. ${l.target_price} / KG`, 100, y + 5);
      
      const expectedTotal = l.quantity * l.target_price;
      doc.setFont("helvetica", "bold");
      doc.text(`NRs. ${expectedTotal.toLocaleString()}`, 135, y + 5);
      
      doc.setFont("helvetica", "semibold");
      doc.text(l.status.toUpperCase(), 175, y + 5);

      // Bottom cell border
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(14, y + 7, pageWidth - 14, y + 7);
      
      y += 7;
    });
    y += 6;
  }

  // --- SECTION 2: TRANSACTION & ORDER HISTORY ---
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(88, 28, 135);
  doc.text("2. B2B TRANSACTION & ORDER HISTORY", 14, y);
  y += 5;

  if (orders.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No transactions recorded in this ledger.", 14, y);
    y += 10;
  } else {
    // Draw orders table headers
    ensureSpace(12);
    doc.setFillColor(49, 46, 129); // Indigo-900
    doc.rect(14, y, pageWidth - 28, 7, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Crop", 18, y + 5);
    doc.text("Buyer Name", 55, y + 5);
    doc.text("Volume", 95, y + 5);
    doc.text("Agreed Price", 125, y + 5);
    doc.text("Total Value", 155, y + 5);
    doc.text("Status", 182, y + 5, { align: "right" });
    y += 7;

    // Populate rows
    orders.forEach((o) => {
      ensureSpace(8);
      doc.setFillColor(255, 255, 255);
      doc.rect(14, y, pageWidth - 28, 7, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(o.crop, 18, y + 5);
      doc.text(o.buyerName || "Direct Buyer", 55, y + 5);
      doc.text(`${o.quantity} ${o.unit || "KG"}`, 95, y + 5);
      doc.text(`NRs. ${o.agreed_price}`, 125, y + 5);
      
      const totalVal = o.quantity * o.agreed_price;
      doc.setFont("helvetica", "bold");
      doc.text(`NRs. ${totalVal.toLocaleString()}`, 155, y + 5);
      
      // Status formatting colors
      let statusColor = [100, 116, 139]; // Default Slate
      if (o.status === "confirmed" || o.status === "completed") {
        statusColor = [5, 150, 105]; // Green
      } else if (o.status === "pending" || o.status === "negotiating") {
        statusColor = [217, 119, 6]; // Amber
      } else if (o.status === "cancelled") {
        statusColor = [225, 29, 72]; // Rose
      }
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(o.status.toUpperCase(), 182, y + 5, { align: "right" });

      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(14, y + 7, pageWidth - 14, y + 7);

      y += 7;
    });
    y += 6;
  }

  // --- SECTION 3: COOPERATIVE NETWORKS & MESSAGES ---
  ensureSpace(40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(88, 28, 135);
  doc.text("3. COOPERATIVE NETWORKING & COMMUNICATIONS", 14, y);
  y += 5;

  if (coops.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text("No associated farmer cooperatives found in your region.", 14, y);
    y += 10;
  } else {
    // List cooperatives
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("Associated Regional Cooperatives:", 14, y);
    y += 5;

    coops.forEach((c) => {
      ensureSpace(12);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(88, 28, 135);
      doc.text(`• ${c.name}`, 16, y);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(` (Contact: ${c.contact_person} | Phone: ${c.phone})`, 50, y);
      y += 5;
    });
    y += 4;
  }

  // Cooperative communications
  if (coopMessages.length > 0) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.text("Recent Cooperative Logistics Communications:", 14, y);
    y += 5;

    coopMessages.forEach((m) => {
      ensureSpace(15);
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, pageWidth - 28, 12, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(88, 28, 135);
      doc.text(`To: ${m.cooperativeName} | Crop: ${m.crop}`, 16, y + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text(`"${m.message}"`, 16, y + 8);
      
      const msgDate = new Date(m.created_at).toLocaleDateString();
      doc.setFont("helvetica", "italic");
      doc.text(msgDate, pageWidth - 18, y + 4, { align: "right" });

      y += 13;
    });
  }

  // Draw final page footer
  drawPageFooter(pageNumber);

  // Trigger browser download of PDF
  const filename = `Krishi_Assist_Report_${user.username}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
