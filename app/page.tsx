// app/page.tsx
"use client";

import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { supabaseClient } from "@/app/lib/supabase";
import { generatePdf } from "@/app/utils/generatePdf";
import { formatWhatsAppMessage, sanitizePhone } from "@/app/utils/formatWhatsApp";
import CalendarGrid from "@/app/components/CalendarGrid";
import QuantityModal from "@/app/components/QuantityModal";
import CustomerModal from "@/app/components/CustomerModal";
import {
  UserIcon,
  WhatsAppIcon,
  DownloadIcon,
  DatabaseIcon,
  SpinnerIcon,
} from "@/app/components/Icons";
import { Customer } from "@/app/types";
import packageInfo from "@/package.json";

const emptySubscribe = () => () => {};

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
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // ── Debounced customer search ───────────────────────────────────────────
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabaseClient
          .from("customers")
          .select("*")
          .or(`name.ilike.%${trimmed}%,mobile_number.ilike.%${trimmed}%`)
          .limit(10);
        if (error) throw error;
        setSearchResults(data || []);
      } catch (err) {
        console.error("Error searching customers:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Derived totals ──────────────────────────────────────────────────────
  const totalLiters = useMemo(
    () => Array.from(selectedDays.values()).reduce((sum, l) => sum + l, 0),
    [selectedDays]
  );
  const totalAmount = useMemo(
    () => totalLiters * pricePerLiter,
    [totalLiters, pricePerLiter]
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
          pricePerLiter,
          totalAmount,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Server error while saving bill.");
      }
      showAlert("✅ Bill details saved to database successfully!");
      setCustomerName("");
      setPhoneNumber("");
      setPricePerLiter(50);
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

  // ── Customer modal ────────────────────────────────────────────────────────
  const handleSelectCustomer = (customer: Customer) => {
    setCustomerName(customer.name);
    setPhoneNumber(customer.mobile_number);
    setProfileModal(false);
    setSearchTerm("");
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
    const billText = formatWhatsAppMessage({
      customerName,
      currentDate,
      selectedDays,
      totalLiters,
      totalAmount,
      pricePerLiter,
    });
    window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(billText)}`, "_blank");
  };

  // ── PDF ───────────────────────────────────────────────────────────────────
  const handleDownloadPdf = () => {
    if (selectedDays.size === 0) {
      showAlert("Please select at least one day to generate a PDF.");
      return;
    }
    generatePdf({
      customerName,
      phoneNumber,
      currentDate,
      selectedDays,
      totalLiters,
      totalAmount,
      pricePerLiter,
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl font-inter">
      <header className="text-center mb-8">
        <div className="flex justify-between items-center mb-4">
          <div />
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-600">Bill Generator</h1>
            <p className="text-gray-600 mt-2">Create and send monthly milk bills.</p>
          </div>
          <div>
            <button
              onClick={() => setProfileModal(true)}
              className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
              aria-label="Open customer management"
            >
              <UserIcon />
            </button>
          </div>
        </div>
      </header>

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
              <div>
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
                    }}
                    maxLength={15}
                    minLength={10}
                    pattern="\d{10}"
                    title="Enter a 10-digit phone number"
                    className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="9999999999"
                  />
                </div>
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
                <label htmlFor="pricePerLiter" className="block text-sm font-medium text-gray-700">
                  Price per Liter (₹)
                </label>
                <input
                  type="number"
                  id="pricePerLiter"
                  value={pricePerLiter}
                  onChange={(e) => setPricePerLiter(parseFloat(e.target.value) || 0)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Selected Days</p>
                <p className="text-lg font-bold text-blue-600">{selectedDays.size}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Total Milk Quantity</p>
                <p className="text-lg font-bold text-blue-600">{totalLiters.toFixed(2)} Liters</p>
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
      {literModal && (
        <QuantityModal
          modalDate={modalDate}
          modalLiters={modalLiters}
          onLitersChange={setModalLiters}
          onSave={handleSaveLiter}
          onCancel={() => setLiterModal(false)}
        />
      )}

      {/* Alert Modal */}
      {alertModal && (
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
      )}

      {/* Customer Modal */}
      {profileModal && (
        <CustomerModal
          searchTerm={searchTerm}
          searchResults={searchResults}
          isSearching={isSearching}
          onSearchChange={handleSearchChange}
          onSelectCustomer={handleSelectCustomer}
          onNewCustomer={() => {
            setCustomerName("");
            setPhoneNumber("");
            setProfileModal(false);
            setSearchTerm("");
          }}
          onClose={() => { setProfileModal(false); setSearchTerm(""); }}
        />
      )}
    </div>
  );
}
