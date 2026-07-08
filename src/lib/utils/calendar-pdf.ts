import { jsPDF } from "jspdf";

import type { ScheduledCalendarItem } from "@/features/assortment-plan/store/plan-store";

const MONTHS = [
  "Nov", "Dec", "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug", "Sep", "Oct",
];

export function getCalendarPdfFilename(versionName: string): string {
  const slug = versionName.replace(/\s+/g, "-");
  return `Assortment-Calendar-FY2025-26-${slug}.pdf`;
}

function buildCalendarPdf(
  versionName: string,
  scheduledItems: ScheduledCalendarItem[],
): jsPDF {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Assortment Calendar FY 2025-26 — ${versionName}`, 40, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Category", 40, 58);
  doc.text("Item Type", 140, 58);
  doc.text("Launch Window", 380, 58);

  doc.setDrawColor(200);
  doc.line(40, 62, 802, 62);

  let y = 78;
  for (const item of scheduledItems) {
    if (y > pageHeight - 40) {
      doc.addPage();
      y = 40;
    }

    const start = MONTHS[item.startMonth] ?? "";
    const endMonth = Math.min(item.startMonth + item.span - 1, 11);
    const end = MONTHS[endMonth] ?? "";
    const label = item.label.length > 48 ? `${item.label.slice(0, 45)}…` : item.label;

    doc.text(item.row, 40, y);
    doc.text(label, 140, y);
    doc.text(`${start} – ${end}`, 380, y);
    y += 16;
  }

  if (scheduledItems.length === 0) {
    doc.text("No items scheduled on the calendar.", 40, 78);
  }

  return doc;
}

export function downloadCalendarPdf(
  versionName: string,
  scheduledItems: ScheduledCalendarItem[],
): void {
  buildCalendarPdf(versionName, scheduledItems).save(getCalendarPdfFilename(versionName));
}
