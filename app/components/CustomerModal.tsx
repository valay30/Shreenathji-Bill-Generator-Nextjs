"use client";

import { Customer } from "@/app/types";

interface CustomerModalProps {
  searchTerm: string;
  searchResults: Customer[];
  isSearching: boolean;
  onSearchChange: (value: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  onNewCustomer: () => void;
  onClose: () => void;
}

export default function CustomerModal({
  searchTerm,
  searchResults,
  isSearching,
  onSearchChange,
  onSelectCustomer,
  onNewCustomer,
  onClose,
}: CustomerModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Customer Management</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by customer name or phone..."
          />
          <div
            className={`mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md ${
              searchTerm.trim().length === 0 ? "hidden" : ""
            }`}
          >
            {isSearching ? (
              <div className="p-3 text-gray-500 text-center text-sm">Searching...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-3 text-gray-500 text-center text-sm">No customers found</div>
            ) : (
              searchResults.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                  onClick={() => onSelectCustomer(customer)}
                >
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.mobile_number}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <button
            onClick={onNewCustomer}
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
          >
            + New Customer
          </button>
        </div>
      </div>
    </div>
  );
}
