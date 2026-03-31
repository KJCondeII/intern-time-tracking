import jsPDF from "jspdf";
import { TimeRecord } from "@/types";

/**
 * Generates PDF report of time records in DTR format
 */
export function generatePDF(records: TimeRecord[]): void {
  if (records.length === 0) {
    alert("No records to export");
    return;
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Header
  doc.setFontSize(18);
  doc.text("Daily Time Record (DTR)", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Total Records: ${records.length}`, 14, 36);

  // Table headers
  const colWidths = [15, 25, 20, 20, 20, 20, 20];
  const headers = ["#", "Date", "AM In", "AM Out", "PM In", "PM Out", "Hours"];
  const rowHeight = 8;
  let yPosition = 45;

  // Draw header row with background
  doc.setFillColor(41, 128, 185);
  doc.rect(14, yPosition - 6, pageWidth - 28, rowHeight, "F");

  // Draw header text
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");

  let xPosition = 14;
  headers.forEach((header, idx) => {
    doc.text(header, xPosition + 2, yPosition);
    xPosition += colWidths[idx];
  });

  // Draw data rows
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  yPosition += rowHeight;

  records.forEach((record, rowIdx) => {
    // Alternate row background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(14, yPosition - 6, pageWidth - 28, rowHeight, "F");
    }

    // Draw row data
    xPosition = 14;
    const rowData = [
      String(rowIdx + 1),
      record.date,
      record.am_in,
      record.am_out,
      record.pm_in,
      record.pm_out,
      record.total_hours,
    ];

    rowData.forEach((cell, colIdx) => {
      const align =
        colIdx === 0 || colIdx === 6 ? "center" : colIdx === 1 ? "left" : "center";
      doc.text(cell, xPosition + 2, yPosition, { align });
      xPosition += colWidths[colIdx];
    });

    yPosition += rowHeight;

    // Add new page if we run out of space
    if (yPosition > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Add summary footer
  yPosition += 5;
  const total = records.reduce((sum, r) => sum + Number(r.total_hours), 0);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(`Total Hours: ${total.toFixed(2)}`, 14, yPosition);

  // Footer
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "This is an automated report. Please verify accuracy before submission.",
    14,
    pageHeight - 10
  );

  doc.save(`DTR_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Exports records to CSV format (Excel compatible)
 */
export function exportToCSV(records: TimeRecord[]): void {
  if (records.length === 0) {
    alert("No records to export");
    return;
  }

  const headers = ["Date", "AM In", "AM Out", "PM In", "PM Out", "Total Hours"];
  const rows = records.map((r) => [
    r.date,
    r.am_in,
    r.am_out,
    r.pm_in,
    r.pm_out,
    r.total_hours,
  ]);

  // Convert to CSV format
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `DTR_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
