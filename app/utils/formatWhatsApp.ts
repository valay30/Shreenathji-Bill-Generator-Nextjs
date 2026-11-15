// app/utils/formatWhatsApp.ts

interface FormatWhatsAppParams {
  customerName: string;
  currentDate: Date;
  selectedDays: Map<string, number>;
  totalLiters: number;
  totalAmount: number;
  pricePerLiter: number;
}

export function formatWhatsAppMessage({
  customerName,
  currentDate,
  selectedDays,
  totalLiters,
  totalAmount,
  pricePerLiter,
}: FormatWhatsAppParams): string {
  const name = customerName || "Valued Customer";
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const totalLitersFormatted = totalLiters.toFixed(2);
  const pricePerLiterFormatted = pricePerLiter.toFixed(2);
  const totalAmountFormatted = totalAmount.toFixed(2);

  let billText = `🐄 *Milk Bill - ${monthName} ${year}* 🐄\n\n`;
  billText += `Hi *${name}*,\n\n`;
  billText += `*Summary*\n`;
  billText += `Total Milk: *${totalLitersFormatted} L*\n`;
  billText += `Total Amount: *₹${totalAmountFormatted}*\n`;
  billText += `(Rate: ₹${pricePerLiterFormatted}/L)\n\n`;

  if (selectedDays.size > 0) {
    const allQuantitiesAreOne = Array.from(selectedDays.values()).every((l) => l === 1);
    const sortedDays = Array.from(selectedDays.keys()).sort();

    if (allQuantitiesAreOne) {
      billText += `*Delivery Dates (1L each)*\n`;
      const dates = sortedDays.map((dateStr) => new Date(dateStr + "T00:00:00").getDate());
      const chunkSize = 8;
      const detailsChunks: string[] = [];
      for (let i = 0; i < dates.length; i += chunkSize) {
        detailsChunks.push(dates.slice(i, i + chunkSize).join(", "));
      }
      billText += detailsChunks.join("\n");
    } else {
      const specialDays: string[] = [];
      const standardDays: string[] = [];
      sortedDays.forEach((dateStr) => {
        const liters = selectedDays.get(dateStr);
        if (liters !== 1) {
          specialDays.push(dateStr);
        } else {
          standardDays.push(dateStr);
        }
      });

      billText += `*Bill Details*\n`;
      if (specialDays.length > 0) {
        specialDays.forEach((dateStr) => {
          const day = new Date(dateStr + "T00:00:00").getDate();
          const liters = selectedDays.get(dateStr);
          billText += `  - Date ${day}: *${liters}L*\n`;
        });
      }

      if (standardDays.length > 0) {
        billText += `*Standard Delivery (1L each):*\n`;
        const dates = standardDays.map((dateStr) => new Date(dateStr + "T00:00:00").getDate());
        const chunkSize = 8;
        const detailsChunks: string[] = [];
        for (let i = 0; i < dates.length; i += chunkSize) {
          detailsChunks.push(dates.slice(i, i + chunkSize).join(", "));
        }
        billText += detailsChunks.join("\n");
      }
    }
    billText += `\n\n`;
  }

  billText += `Thank you! 🙏`;
  return billText;
}

export function sanitizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-\(\)]/g, "").replace(/^(\+91|91|0)/, "");
}
