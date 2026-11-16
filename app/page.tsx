// app/page.tsx
"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { supabaseClient } from "@/app/lib/supabase";
import { generatePdf } from "@/app/utils/generatePdf";
import { formatWhatsAppMessage, sanitizePhone } from "@/app/utils/formatWhatsApp";
import { getStoredSettings, fetchRemoteSettings } from "@/app/utils/settings";
import CalendarGrid from "@/app/components/CalendarGrid";
import QuantityModal from "@/app/components/QuantityModal";
import {
  UserIcon,
  WhatsAppIcon,
  DownloadIcon,
  DatabaseIcon,
  SpinnerIcon,
} from "@/app/components/Icons";
import { Customer } from "@/app/types";
import packageInfo from "@/package.json";

const emptySubscribe = () => () => { };

export default function Home() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDays, setSelectedDays] = useState(new Map<string, number>());
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState<number | string>(() => {
    return getStoredSettings().defaultPricePerLiter;
  });
  const [upiId, setUpiId] = useState(() => {
    return getStoredSettings().upiId;
  });
  const [wholeMonth, setWholeMonth] = useState(false);
  const [literModal, setLiterModal] = useState(false);
  const [alertModal, setAlertModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalLiters, setModalLiters] = useState(1);
  const [alertMessage, setAlertMessage] = useState("");
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Sync cloud settings & preload customers on load ─────────────────────
  useEffect(() => {
    // 1. Sync latest cloud settings from Supabase
    fetchRemoteSettings().then((remote) => {
      if (remote) {
        setPricePerLiter(remote.defaultPricePerLiter);
        setUpiId(remote.upiId);
      }
    });

    // 2. Preload customers in memory on load for 0ms instant search
    async function preloadCustomers() {
      try {
        const { data, error } = await supabaseClient
          .from("customers")
          .select("*")
          .order("name", { ascending: true });
        if (!error && data) {
          setAllCustomers(data);
        }
      } catch (err) {
        console.error("Error preloading customers:", err);
      }
    }
    preloadCustomers();
  }, []);


  // ── Instant in-memory search (derived via useMemo - 0ms delay) ────────────
  const customerSuggestions = useMemo(() => {
    const raw = phoneNumber.trim().replace(/[\s\-\(\)]/g, "").replace(/^(\+91|91|0)/, "");
    if (raw.length < 2) return [];
    return allCustomers.filter((c) => c.mobile_number.includes(raw)).slice(0, 5);
  }, [phoneNumber, allCustomers]);

  // ── Whole-month selector ────────────────────────────────────────────────
  const handleWholeMonthToggle = (checked: boolean) => {
    setWholeMonth(checked);
    if (checked) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const newSelectedDays = new Map<string, number>();
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        newSelectedDays.set(dateStr, 1);
      }
      setSelectedDays(newSelectedDays);
    } else {
      setSelectedDays(new Map());
    }
  };

  // ── Derived totals ──────────────────────────────────────────────────────
  const totalLiters = useMemo(
    () => Array.from(selectedDays.values()).reduce((sum, l) => sum + l, 0),
    [selectedDays]
  );
  const numericPrice = parseFloat(String(pricePerLiter)) || 0;
  const totalAmount = useMemo(
    () => totalLiters * numericPrice,
    [totalLiters, numericPrice]
  );

  // ── Helpers ─────────────────────────────────────────────────────────────
  const showAlert = (message: string) => {
    setAlertMessage(message);
    setAlertModal(true);
  };

  // ── Calendar handlers ───────────────────────────────────────────────────
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

  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDays(new Map());
    setWholeMonth(false);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDays(new Map());
    setWholeMonth(false);
  };

  // ── Save bill via server API route (keeps service key off the browser) ──
  const handleAddData = async () => {
    const mobile = sanitizePhone(phoneNumber);
    if (!customerName.trim() || !mobile || mobile.length !== 10 || selectedDays.size === 0) {
      showAlert("Please fill customer details and select at least one day.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/save-bill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          mobileNumber: mobile,
          billingPeriod: currentDate.toLocaleString("default", { month: "long", year: "numeric" }),
          milkQuantity: totalLiters,
          pricePerLiter: numericPrice,
          totalAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Server error while saving bill.");
      }
      showAlert("✅ Bill details saved to database successfully!");
      // Update local memory cache with saved customer
      setAllCustomers((prev) => {
        const trimmedName = customerName.trim();
        const exists = prev.some((c) => c.mobile_number === mobile);
        if (exists) {
          return prev.map((c) => (c.mobile_number === mobile ? { ...c, name: trimmedName } : c));
        }
        return [...prev, { id: Date.now().toString(), name: trimmedName, mobile_number: mobile }];
      });
      setCustomerName("");
      setPhoneNumber("");
      setShowSuggestions(false);
      setPricePerLiter(getStoredSettings().defaultPricePerLiter);
      setWholeMonth(false);
      setSelectedDays(new Map());
    } catch (error: unknown) {
      console.error("Error saving data:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      showAlert(`❌ Failed to save: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Customer selection from suggestions ──────────────────────────────────
  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setPhoneNumber(customer.mobile_number);
    setShowSuggestions(false);
  };

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  const handleSendWhatsapp = () => {
    const cleanPhone = sanitizePhone(phoneNumber);
    if (!cleanPhone || cleanPhone.length !== 10) {
      showAlert("Please enter a valid 10-digit phone number.");
      return;
    }
    if (selectedDays.size === 0) {
      showAlert("Please select at least one day to generate a bill.");
      return;
    }
    const settings = getStoredSettings();
    const billText = formatWhatsAppMessage({
      customerName,
      currentDate,
      selectedDays,
      totalLiters,
      totalAmount,
      pricePerLiter: numericPrice,
      upiId,
      dairyName: settings.dairyName,
    });
    window.open(
      `https://api.whatsapp.com/send/?phone=91${cleanPhone}&text=${encodeURIComponent(billText)}`,
      "_blank"
    );
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (selectedDays.size === 0) {
      showAlert("Please select at least one day to generate a PDF.");
      return;
    }
    const settings = getStoredSettings();
    await generatePdf({
      customerName,
      phoneNumber,
      currentDate,
      selectedDays,
      totalLiters,
      totalAmount,
      pricePerLiter: numericPrice,
      upiId,
      dairyName: settings.dairyName,
      tagline: settings.tagline,
      contactPhone: settings.contactPhone,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl font-inter flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 px-4 pb-6 sm:p-6 lg:p-8 max-w-4xl font-inter">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div className="w-10"></div>
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">
              Bill Generator
            </h1>
            <p className="text-gray-600 mt-2">
              Milk Billing Made Easy!
            </p>
          </div>
          <div className="w-10 flex justify-end">
            <Link
              href="/settings"
              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-all hover:scale-105 shadow-sm"
              title="Settings"
              aria-label="Open settings"
            >
              <UserIcon />
            </Link>
          </div>
        </div >
      </header >

      <main className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Customer Details + Calendar */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
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
              <div className="relative">
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
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
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[\s\-\(\)]/g, "");
                      const cleaned = raw.replace(/^(\+91|91|0)/, "").slice(0, 10);
                      setPhoneNumber(cleaned);
                      if (cleaned.length < 2) {
                        setShowSuggestions(false);
                      } else {
                        setShowSuggestions(true);
                        // Auto-fill customer name if exact 10-digit match exists and name is currently empty
                        if (cleaned.length === 10 && !customerName.trim()) {
                          const exact = allCustomers.find((c) => c.mobile_number === cleaned);
                          if (exact) setCustomerName(exact.name);
                        }
                      }
                    }}
                    onFocus={() => {
                      if (customerSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    maxLength={15}
                    minLength={10}
                    pattern="\d{10}"
                    title="Enter a 10-digit phone number"
                    className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="9999999999"
                    autoComplete="off"
                  />
                </div>

                {/* Saved Customers Suggestions Dropdown */}
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
                    {/* Header with Title on Left and Close at the far end */}
                    <div className="px-3.5 py-2 bg-gray-50/90 border-b border-gray-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setShowSuggestions(false)}
                        className="text-gray-400 hover:text-gray-700 text-xs font-medium hover:bg-gray-200/60 rounded px-1.5 py-0.5 transition-colors ml-auto"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Customer list: Single line with name and phone */}
                    {customerSuggestions.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="group flex items-center justify-between px-3.5 py-2.5 hover:bg-blue-50/80 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center shrink-0">
                            {cust.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-900 text-sm truncate">
                            {cust.name}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500 text-xs font-mono shrink-0">
                            +91 {cust.mobile_number}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <CalendarGrid
              currentDate={currentDate}
              selectedDays={selectedDays}
              wholeMonth={wholeMonth}
              onDayClick={handleDayClick}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onWholeMonthChange={handleWholeMonthToggle}
            />
          </div>

          {/* Right column: Bill Summary */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Bill Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <label htmlFor="pricePerLiter" className="block text-sm font-medium text-gray-700">
                    Price per Liter (₹)
                  </label>
                </div>
                <input
                  type="number"
                  id="pricePerLiter"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="0.5"
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-semibold text-gray-800"
                />
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Days</p>
                    <p className="text-lg font-bold text-blue-600">{selectedDays.size}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Milk Quantity</p>
                    <p className="text-lg font-bold text-blue-600">{totalLiters.toFixed(2)} Liters</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-lg font-medium text-gray-700">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">₹ {totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={handleSendWhatsapp}
                  className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon />
                  Send Bill on WhatsApp
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center gap-2"
                >
                  <DownloadIcon />
                  Download PDF
                </button>
                <button
                  onClick={handleAddData}
                  disabled={isLoading}
                  className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <SpinnerIcon /> : <DatabaseIcon />}
                  {isLoading ? "Processing..." : "Add Data"}
                </button>
              </div>
            </div>
          </div>
      </main>

      <footer className="text-center mt-6 pb-4 text-xs text-gray-400">
        <p>Version {packageInfo.version}</p>
      </footer>

      {/* Quantity Modal */}
      {
        literModal && (
          <QuantityModal
            modalDate={modalDate}
            modalLiters={modalLiters}
            onLitersChange={setModalLiters}
            onSave={handleSaveLiter}
            onCancel={() => setLiterModal(false)}
          />
        )
      }

      {/* Alert Modal */}
      {
        alertModal && (
          <div className="modal-backdrop">
            <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm text-center">
              <p className="text-lg text-gray-800 mb-6">{alertMessage}</p>
              <button
                onClick={() => setAlertModal(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full"
              >
                OK
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
}
