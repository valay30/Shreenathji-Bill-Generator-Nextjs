// app/settings/page.tsx
"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  AppSettings,
  getStoredSettings,
  saveStoredSettings,
} from "@/app/utils/settings";

const emptySubscribe = () => () => { };

export default function SettingsPage() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [settings, setSettings] = useState<AppSettings>(() => getStoredSettings());
  const [savedNotification, setSavedNotification] = useState(false);

  const handleChange = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSettings(settings);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  if (!isMounted) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl font-inter flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400 text-sm">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-3xl font-inter">
      {/* Header with Back button and centered Settings title */}
      <header className="mb-8 flex items-center justify-between">
        <div className="w-24 flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
            title="Back to Bill Generator"
          >
            <svg
              className="w-4 h-4 mr-1.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center flex-1">
          Settings
        </h1>
        <div className="w-24"></div>
      </header>

      {/* Floating Toast Notification (Light Theme) */}
      <div
        aria-live="polite"
        className={`fixed top-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-50 transition-all duration-300 ease-out ${savedNotification
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-4 pointer-events-none"
          }`}
      >
        <div className="bg-white text-gray-800 px-5 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-medium border border-green-200 ring-1 ring-black/5">
          <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span>Saved</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Billing & Rates */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Billing & Rates
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label
                htmlFor="defaultPrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Price per Liter (₹)
              </label>
              <div className="relative rounded-md shadow-sm">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  id="defaultPrice"
                  min="1"
                  step="0.5"
                  value={settings.defaultPricePerLiter}
                  onChange={(e) =>
                    handleChange("defaultPricePerLiter", parseFloat(e.target.value) || 0)
                  }
                  className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="upiId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                UPI ID for Payment
              </label>
              <input
                type="text"
                id="upiId"
                value={settings.upiId}
                onChange={(e) => handleChange("upiId", e.target.value)}
                placeholder="e.g., yourname@okhdfcbank"
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dairy & Invoice Details */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-gray-200/80">
          <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-6">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                Dairy & Invoice Details
              </h2>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="dairyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="dairyName"
                value={settings.dairyName}
                onChange={(e) => handleChange("dairyName", e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., ABC Dairy"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="tagline"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  id="tagline"
                  value={settings.tagline}
                  onChange={(e) => handleChange("tagline", e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., Fresh Milk Delivery Service"
                />
              </div>

              <div>
                <label
                  htmlFor="contactPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contact Number for Support
                </label>
                <input
                  type="text"
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="e.g., 9876543210"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Gaushala / Farm Address (Optional)
              </label>
              <input
                type="text"
                id="address"
                value={settings.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="e.g., Near Swaminarayan Temple, Highway Road"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
