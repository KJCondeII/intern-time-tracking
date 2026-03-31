import jsPDF from "jspdf";

export function generatePDF(records) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Intern Daily Time Record", 20, 20);

  doc.setFontSize(12);

  let y = 40;

  records.forEach((r, i) => {
    doc.text(
      `${i + 1}. ${r.date} | ${r.am_in}-${r.am_out} | ${r.pm_in}-${r.pm_out} | ${r.total_hours} hrs`,
      20,
      y
    );
    y += 10;
  });

  const total = records.reduce((sum, r) => sum + Number(r.total_hours), 0);

  doc.text(`Total Hours: ${total.toFixed(2)}`, 20, y + 10);

  doc.save("DTR.pdf");
}