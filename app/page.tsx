// app/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabaseClient } from "@/app/lib/supabase";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import {
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WhatsAppIcon,
  DownloadIcon,
  DatabaseIcon,
  SpinnerIcon,
} from "@/app/components/Icons"; // Create a new file for SVG icons

interface Customer {
  id: string;
  name: string;
  mobile_number: string;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState(new Map<string, number>());
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState(50);
  const [wholeMonth, setWholeMonth] = useState(false);
  const [literModal, setLiterModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [profileModal, setProfileModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalLiters, setModalLiters] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const updateBill = useCallback(() => {
    // This function will be triggered by state changes.
    // The calculations are now done in the rendering logic.
  }, []);

  useEffect(() => {
    updateBill();
  }, [selectedDays, pricePerLiter, wholeMonth, updateBill]);

  const handleDayClick = (dateStr: string) => {
    if (selectedDays.has(dateStr)) {
      setModalDate(dateStr);
      setModalLiters(selectedDays.get(dateStr) || 1);
      setLiterModal(true);
    } else {
      setSelectedDays((prev) => new Map(prev).set(dateStr, 1));
    }
  };

  const handleSaveLiter = () => {
    const newLiters = parseFloat(String(modalLiters));
    if (newLiters > 0) {
      setSelectedDays((prev) => new Map(prev).set(modalDate, newLiters));
    } else {
      const newDays = new Map(selectedDays);
      newDays.delete(modalDate);
      setSelectedDays(newDays);
    }
    setLiterModal(false);
  };

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertModal(true);
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
    setSelectedDays(new Map());
    setWholeMonth(false);
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
    setSelectedDays(new Map());
    setWholeMonth(false);
  };

  useEffect(() => {
    if (wholeMonth) {
      const newSelectedDays = new Map();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          day
        ).padStart(2, "0")}`;
        newSelectedDays.set(dateStr, 1);
      }
      setSelectedDays(newSelectedDays);
    } else {
      // Keep selected days if whole month is unchecked, or clear if the user wants.
      // Your original code clears them, so we'll do the same for consistency.
      if (selectedDays.size > 0) {
        setSelectedDays(new Map());
      }
    }
  }, [wholeMonth, currentDate]);

  const totalLiters = useMemo(
    () =>
      Array.from(selectedDays.values()).reduce(
        (sum, liters) => sum + liters,
        0
      ),
    [selectedDays]
  );
  const totalAmount = useMemo(
    () => totalLiters * pricePerLiter,
    [totalLiters, pricePerLiter]
  );

  const handleDownloadPdf = () => {
    if (selectedDays.size === 0) {
      showAlert("Please select at least one day to generate a PDF.");
      return;
    }

    const doc = new jsPDF();
    // PDF generation logic (from your original code)
    const customer = customerName || "Customer";
    const phone = "91" + phoneNumber;
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const year = currentDate.getFullYear();

    const colors = {
      primary: [26, 188, 156],
      secondary: [44, 62, 80],
      accent: [231, 76, 60],
      success: [39, 174, 96],
      dark: [52, 73, 94],
      medium: [149, 165, 166],
      light: [236, 240, 241],
      white: [255, 255, 255],
    };

    const setColor = (color: number[]) =>
      doc.setTextColor(color[0], color[1], color[2]);
    const setFillColor = (color: number[]) =>
      doc.setFillColor(color[0], color[1], color[2]);
    const setDrawColor = (color: number[]) =>
      doc.setDrawColor(color[0], color[1], color[2]);

    // Page 1
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
    doc.text(
      "Fresh Milk Delivery Service",
      doc.internal.pageSize.width / 2,
      28,
      { align: "center" }
    );
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
    doc.text(`${totalLiters.toFixed(1)} L`, 110, yPos + 10, {
      align: "center",
    });
    doc.text(`Rs. ${pricePerLiter.toFixed(2)}`, 140, yPos + 10, {
      align: "center",
    });
    doc.text(`Rs. ${totalAmount.toFixed(2)}`, 175, yPos + 10, {
      align: "center",
    });

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
    doc.text("TOTAL AMOUNT", totalBoxCenter, totalBoxY + 9, {
      align: "center",
    });
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

    // Page 2
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
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekdayColors = [
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

    const firstDayOfMonthIndex = new Date(
      year,
      currentDate.getMonth(),
      1
    ).getDay();
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
      const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(dayCounter).padStart(2, "0")}`;
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
        doc.text(`${liters.toFixed(1)} L`, x + cellWidth / 2, y + 20, {
          align: "center",
        });
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
  };

const handleAddData = async () => {
    // Basic validation remains the same
    if (!customerName || !phoneNumber || selectedDays.size === 0) {
        showAlert("Please fill customer details and select at least one day.");
        return;
    }

    // Set loading state immediately
    setIsLoading(true);

    const googleSheetsData = {
        customerName,
        mobileNumber: phoneNumber,
        billingPeriod: currentDate.toLocaleString("default", {
            month: "long",
            year: "numeric",
        }),
        milkQuantity: totalLiters.toFixed(2),
        pricePerLiter: pricePerLiter.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
    };

    // Start all operations in parallel without awaiting them immediately
    const customerPromise = saveCustomerToDatabase();
    const billPromise = saveBillToDatabase();
    const sheetsPromise = fetch("/api/add-data", {
        method: "POST",
        body: JSON.stringify(googleSheetsData),
        headers: { "Content-Type": "application/json" },
    });

    // Optimistically show success message and clear state
    showAlert("✅ Data submission initiated! Please wait a moment for the data to reflect.");
    
    // Clear the form and reset state for a new entry
    setCustomerName("");
    setPhoneNumber("");
    setPricePerLiter(50);
    setWholeMonth(false);
    setSelectedDays(new Map());

    // Restore the button to its original state after a short delay
    // to give the user time to read the alert.
    setTimeout(() => {
        setIsLoading(false);
    }, 1500); // 1.5 seconds delay

    // We still await all promises in the background to catch any potential errors
    try {
        await Promise.allSettled([customerPromise, billPromise, sheetsPromise]);
    } catch (error) {
        // Log any unexpected errors in the console
        console.error("An error occurred during background data saving:", error);
    }
};

  const handleSearchCustomers = async () => {
    if (searchTerm.length < 1) {
      setSearchResults([]);
      return;
    }
    try {
      const { data, error } = await supabaseClient
        .from("customers")
        .select("*")
        .ilike("name", `%${searchTerm}%`)
        .limit(10);
      if (error) throw error;
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching customers:", error);
      showAlert("Error searching customers. Please try again.");
    }
  };

  const saveCustomerToDatabase = async () => {
    const name = customerName.trim();
    const mobile = phoneNumber.trim();
    if (!name || !mobile || mobile.length !== 10) {
      showAlert("Please enter valid customer name and 10-digit mobile number.");
      throw new Error("Invalid customer details.");
    }
    const { data, error } = await supabaseClient
      .from("customers")
      .upsert([{ name, mobile_number: mobile }], {
        onConflict: "mobile_number",
      });
    if (error) throw error;
    return data;
  };

  const saveBillToDatabase = async () => {
    const name = customerName.trim();
    const mobile = phoneNumber.trim();
    const billingPeriod = currentDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    const quantity = totalLiters;
    const price = pricePerLiter;
    const amount = totalAmount;

    if (!name || !mobile || selectedDays.size === 0) {
      showAlert("Please fill customer details and select at least one day.");
      throw new Error("Invalid bill details.");
    }

    const { data, error } = await supabaseClient.from("bill_details").insert([
      {
        customer_name: name,
        mobile_number: mobile,
        billing_period: billingPeriod,
        milk_quantity: quantity,
        price_per_liter: price,
        total_amount: amount,
      },
    ]);
    if (error) {
      console.error("Supabase error details:", error);
      throw error;
    }
    return data;
  };

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setPhoneNumber(customer.mobile_number);
    setProfileModal(false);
  };

  const getBillAsText = () => {
    // ... (Your existing getBillAsText logic)
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
      const allQuantitiesAreOne = Array.from(selectedDays.values()).every(
        (l) => l === 1
      );
      const sortedDays = Array.from(selectedDays.keys()).sort();

      if (allQuantitiesAreOne) {
        billText += `*Delivery Dates (1L each)*\n`;
        const dates = sortedDays.map((dateStr) =>
          new Date(dateStr + "T00:00:00").getDate()
        );
        const detailsChunks = [];
        const chunkSize = 8;
        for (let i = 0; i < dates.length; i += chunkSize) {
          const chunk = dates.slice(i, i + chunkSize);
          detailsChunks.push(chunk.join(", "));
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
          const dates = standardDays.map((dateStr) =>
            new Date(dateStr + "T00:00:00").getDate()
          );
          const detailsChunks = [];
          const chunkSize = 8;
          for (let i = 0; i < dates.length; i += chunkSize) {
            const chunk = dates.slice(i, i + chunkSize);
            detailsChunks.push(chunk.join(", "));
          }
          billText += detailsChunks.join("\n");
        }
      }
      billText += `\n\n`;
    }
    billText += `Thank you! 🙏`;
    return billText;
  };

  const handleSendWhatsapp = () => {
    const phone = phoneNumber.trim();
    if (!phone || phone.length < 10) {
      showAlert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (selectedDays.size === 0) {
      showAlert("Please select at least one day to generate a bill.");
      return;
    }
    const billText = getBillAsText();
    const encodedText = encodeURIComponent(billText);
    const whatsappUrl = `https://wa.me/91${phone}?text=${encodedText}`;
    window.open(whatsappUrl, "_blank");
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = firstDayOfMonth.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const isSelected = selectedDays.has(dateStr);
      const liters = selectedDays.get(dateStr);

      days.push(
        <div
          key={dateStr}
          className={`calendar-day p-2 cursor-pointer flex items-center justify-center h-10 w-10 mx-auto relative ${
            isSelected ? "selected" : ""
          }`}
          onClick={() => handleDayClick(dateStr)}
        >
          {day}
          {liters !== 1 && liters !== undefined && (
            <span className="absolute text-xs -mt-6 ml-6 bg-red-500 text-white rounded-full px-1.5 py-0.5">
              {liters}L
            </span>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl font-inter">
      <header className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
              Bill Generator
            </h1>
            <p className="text-gray-600 mt-2">
              Create and send monthly milk bills with ease.
            </p>
          </div>
          <div>
            <button
              id="profile-btn"
              onClick={() => setProfileModal(true)}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
              Customer Details
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Customer Name
                </label>
                <input
                  type="text"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., Valay Patel"
                />
              </div>
              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    maxLength={10}
                    minLength={10}
                    pattern="\d{10}"
                    title="Enter a 10-digit phone number"
                    className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="9999999999"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div id="calendar-container">
                <div className="flex items-center justify-between mb-4">
                  <button
                    id="prev-month"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <ChevronLeftIcon />
                  </button>
                  <h3 id="month-year" className="text-xl font-semibold">
                    {currentDate.toLocaleString("default", { month: "long" })}{" "}
                    {currentDate.getFullYear()}
                  </h3>
                  <button
                    id="next-month"
                    onClick={handleNextMonth}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <ChevronRightIcon />
                  </button>
                </div>
                <div
                  id="calendar"
                  className="grid grid-cols-7 gap-1 text-center"
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="font-bold text-gray-600 day-name"
                      >
                        {day}
                      </div>
                    )
                  )}
                  {renderCalendarDays()}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <input
                  id="whole-month-checkbox"
                  type="checkbox"
                  checked={wholeMonth}
                  onChange={(e) => setWholeMonth(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="whole-month-checkbox"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Bill for the whole month (1 Liter/day)
                </label>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">
              Bill Summary
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pricePerLiter"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price per Liter (₹)
                </label>
                <input
                  type="number"
                  id="pricePerLiter"
                  value={pricePerLiter}
                  onChange={(e) =>
                    setPricePerLiter(parseFloat(e.target.value) || 0)
                  }
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Selected Days
                </p>
                <p id="total-days" className="text-lg font-bold text-blue-600">
                  {selectedDays.size}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Milk Quantity
                </p>
                <p
                  id="total-liters"
                  className="text-lg font-bold text-blue-600"
                >
                  {totalLiters.toFixed(2)} Liters
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-lg font-medium text-gray-700">
                  Total Amount
                </p>
                <p
                  id="total-amount"
                  className="text-3xl font-bold text-green-600"
                >
                  ₹ {totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <button
                onClick={handleSendWhatsapp}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all flex items-center justify-center"
              >
                <WhatsAppIcon />
                Send Bill on WhatsApp
              </button>
              <button
                onClick={handleDownloadPdf}
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center"
              >
                <DownloadIcon />
                Download PDF
              </button>
              <button
                onClick={handleAddData}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <SpinnerIcon /> : <DatabaseIcon />}
                {isLoading ? "Processing..." : "Add Data"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {literModal && (
        <div className="modal-backdrop">
          <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              Update Milk Quantity
            </h3>
            <p id="modal-date-text" className="mb-4 text-sm text-gray-600">
              For{" "}
              {new Date(modalDate + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div>
              <label
                htmlFor="liter-input"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity (Liters)
              </label>
              <input
                type="number"
                id="liter-input"
                value={modalLiters}
                onChange={(e) =>
                  setModalLiters(parseFloat(e.target.value) || 0)
                }
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
                step="0.5"
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setLiterModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveLiter}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {alertModal && (
        <div className="modal-backdrop">
          <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm text-center">
            <p id="alert-message" className="text-lg text-gray-800 mb-6">
              {alertMessage}
            </p>
            <button
              onClick={() => setAlertModal(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {profileModal && (
        <div className="modal-backdrop">
          <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Customer Management
              </h3>
              <button
                onClick={() => setProfileModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Customer
              </label>
              <input
                type="text"
                id="customer-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={handleSearchCustomers}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Type customer name..."
              />
              <div
                id="search-results"
                className={`mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md ${
                  searchResults.length === 0 ? "hidden" : ""
                }`}
              >
                {searchResults.length === 0 ? (
                  <div className="p-3 text-gray-500 text-center">
                    No customers found
                  </div>
                ) : (
                  searchResults.map((customer) => (
                    <div
                      key={customer.id}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">
                        {customer.mobile_number}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="border-t pt-4">
              <button
                onClick={() => {
                  setCustomerName("");
                  setPhoneNumber("");
                  setProfileModal(false);
                }}
                className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
              >
                + New Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
