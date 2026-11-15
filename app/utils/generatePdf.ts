// app/utils/generatePdf.ts
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface GeneratePdfParams {
  customerName: string;
  phoneNumber: string;
  currentDate: Date;
  selectedDays: Map<string, number>;
  totalLiters: number;
  totalAmount: number;
  pricePerLiter: number;
}

export function generatePdf({
  customerName,
  phoneNumber,
  currentDate,
  selectedDays,
  totalLiters,
  totalAmount,
  pricePerLiter,
}: GeneratePdfParams): void {
  const doc = new jsPDF();
  const customer = customerName || "Customer";
  const phone = "91" + phoneNumber;
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const colors = {
    primary: [26, 188, 156] as [number, number, number],
    secondary: [44, 62, 80] as [number, number, number],
    accent: [231, 76, 60] as [number, number, number],
    success: [39, 174, 96] as [number, number, number],
    dark: [52, 73, 94] as [number, number, number],
    medium: [149, 165, 166] as [number, number, number],
    light: [236, 240, 241] as [number, number, number],
    white: [255, 255, 255] as [number, number, number],
  };

  const setColor = (color: [number, number, number]) =>
    doc.setTextColor(color[0], color[1], color[2]);
  const setFillColor = (color: [number, number, number] | number[]) =>
    doc.setFillColor(color[0], color[1], color[2]);
  const setDrawColor = (color: [number, number, number] | number[]) =>
    doc.setDrawColor(color[0], color[1], color[2]);

  // ── Page 1: Invoice ──────────────────────────────────────────────────────
  setFillColor(colors.primary);
  doc.rect(0, 0, doc.internal.pageSize.width, 45, "F");
  setColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Shreenathji Gir Gaushala", doc.internal.pageSize.width / 2, 17, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("Fresh Milk Delivery Service", doc.internal.pageSize.width / 2, 28, {
    align: "center",
  });
  setColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Invoice", doc.internal.pageSize.width / 2, 38, {
    align: "center",
  });

  let yPos = 70;
  setFillColor(colors.light);
  setDrawColor(colors.medium);
  doc.setLineWidth(0.5);
  doc.rect(20, yPos, 85, 40, "FD");
  setColor(colors.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 25, yPos + 10);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(customer, 25, yPos + 20);
  doc.text(`Phone: +${phone}`, 25, yPos + 28);

  setFillColor([248, 249, 250]);
  doc.rect(110, yPos, 85, 40, "FD");
  setColor(colors.dark);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Summary:", 115, yPos + 10);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Period: ${monthName} ${year}`, 115, yPos + 20);
  doc.text(`Total Quantity: ${totalLiters.toFixed(1)} L`, 115, yPos + 28);
  doc.text(`Rate: Rs. ${pricePerLiter.toFixed(2)}/L`, 115, yPos + 36);

  yPos += 60;
  setFillColor(colors.primary);
  setDrawColor(colors.primary);
  doc.rect(20, yPos, 175, 12, "FD");
  setColor(colors.white);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Description", 25, yPos + 8);
  doc.text("Days", 80, yPos + 8, { align: "center" });
  doc.text("Quantity", 110, yPos + 8, { align: "center" });
  doc.text("Rate", 140, yPos + 8, { align: "center" });
  doc.text("Amount", 175, yPos + 8, { align: "center" });

  yPos += 12;
  setFillColor(colors.white);
  setDrawColor(colors.light);
  doc.rect(20, yPos, 175, 15, "FD");
  setColor(colors.dark);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Fresh Gir Cow Milk", 25, yPos + 10);
  doc.text(selectedDays.size.toString(), 80, yPos + 10, { align: "center" });
  doc.text(`${totalLiters.toFixed(1)} L`, 110, yPos + 10, { align: "center" });
  doc.text(`Rs. ${pricePerLiter.toFixed(2)}`, 140, yPos + 10, { align: "center" });
  doc.text(`Rs. ${totalAmount.toFixed(2)}`, 175, yPos + 10, { align: "center" });

  yPos += 25;
  const totalBoxX = 65;
  const totalBoxY = yPos;
  const totalBoxWidth = 80;
  const totalBoxHeight = 25;
  const totalBoxCenter = totalBoxX + totalBoxWidth / 2;
  setFillColor(colors.accent);
  setDrawColor(colors.accent);
  doc.rect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, "FD");
  setColor(colors.white);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL AMOUNT", totalBoxCenter, totalBoxY + 9, { align: "center" });
  doc.setFontSize(18);
  doc.text(`Rs. ${totalAmount.toFixed(2)}`, totalBoxCenter, totalBoxY + 19, {
    align: "center",
  });

  yPos = doc.internal.pageSize.height - 40;
  setColor(colors.medium);
  doc.setFontSize(10);
  doc.text(
    "Thank you for choosing Shreenathji Gir Gaushala!",
    doc.internal.pageSize.width / 2,
    yPos,
    { align: "center" }
  );
  doc.text(
    "For any queries, please contact us.",
    doc.internal.pageSize.width / 2,
    yPos + 8,
    { align: "center" }
  );

  // ── Page 2: Daily Delivery Schedule ──────────────────────────────────────
  doc.addPage();
  setFillColor(colors.secondary);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
  setColor(colors.white);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Daily Delivery Schedule", doc.internal.pageSize.width / 2, 20, {
    align: "center",
  });
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${monthName} ${year}`, doc.internal.pageSize.width / 2, 30, {
    align: "center",
  });

  yPos = 60;
  const startX = 20;
  const cellWidth = (doc.internal.pageSize.width - 40) / 7;
  const cellHeight = 30;
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekdayColors: [number, number, number][] = [
    colors.accent,
    colors.primary,
    colors.primary,
    colors.primary,
    colors.primary,
    colors.primary,
    colors.success,
  ];

  for (let i = 0; i < weekdays.length; i++) {
    setFillColor(weekdayColors[i]);
    doc.rect(startX + i * cellWidth, yPos, cellWidth, 15, "F");
    setColor(colors.white);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(weekdays[i], startX + i * cellWidth + cellWidth / 2, yPos + 10, {
      align: "center",
    });
  }
  yPos += 15;

  const firstDayOfMonthIndex = new Date(year, currentDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, currentDate.getMonth() + 1, 0).getDate();

  let dayCounter = 1;
  let currentDayInWeek = firstDayOfMonthIndex;
  let currentWeekRow = 0;
  doc.setLineWidth(0.2);

  for (let i = 0; i < firstDayOfMonthIndex; i++) {
    const x = startX + i * cellWidth;
    const y = yPos + currentWeekRow * cellHeight;
    setFillColor([250, 250, 250]);
    setDrawColor(colors.medium);
    doc.rect(x, y, cellWidth, cellHeight, "FD");
  }

  while (dayCounter <= daysInMonth) {
    const x = startX + currentDayInWeek * cellWidth;
    const y = yPos + currentWeekRow * cellHeight;
    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;
    const liters = selectedDays.get(dateStr) || 0;

    if (liters > 0) {
      setFillColor([232, 245, 233]);
    } else {
      setFillColor(colors.white);
    }
    setDrawColor(colors.medium);
    doc.rect(x, y, cellWidth, cellHeight, "FD");

    setColor(colors.dark);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(String(dayCounter), x + 3, y + 8);

    if (liters > 0) {
      setColor(colors.success);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${liters.toFixed(1)} L`, x + cellWidth / 2, y + 20, { align: "center" });
      setFillColor(colors.success);
      doc.circle(x + cellWidth - 8, y + 8, 2, "F");
    } else {
      setColor(colors.medium);
      doc.setFontSize(8);
      doc.text("No Delivery", x + cellWidth / 2, y + 20, { align: "center" });
    }

    dayCounter++;
    currentDayInWeek++;
    if (currentDayInWeek > 6) {
      currentDayInWeek = 0;
      currentWeekRow++;
    }
  }

  const legendY = yPos + (currentWeekRow + 1) * cellHeight + 10;
  setFillColor([232, 245, 233]);
  doc.rect(20, legendY, 8, 8, "F");
  setColor(colors.dark);
  doc.setFontSize(10);
  doc.text("Delivery Day", 32, legendY + 6);
  setFillColor(colors.white);
  setDrawColor(colors.light);
  doc.rect(20, legendY + 13, 8, 8, "FD");
  doc.text("No Delivery", 32, legendY + 19);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    setColor(colors.medium);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  const pdfName = `${customer} ${monthName} Bill.pdf`;
  doc.save(pdfName);
}
