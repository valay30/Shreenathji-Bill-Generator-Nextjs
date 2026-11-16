"use client";

interface QuantityModalProps {
  modalDate: string;
  modalLiters: number;
  onLitersChange: (liters: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function QuantityModal({
  modalDate,
  modalLiters,
  onLitersChange,
  onSave,
  onCancel,
}: QuantityModalProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Update Milk Quantity
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          For{" "}
          {new Date(modalDate + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div>
          <label htmlFor="liter-input" className="block text-sm font-medium text-gray-700">
            Quantity (Liters)
          </label>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="number"
              id="liter-input"
              value={modalLiters === 0 ? "" : modalLiters}
              placeholder="0"
              autoFocus
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseFloat(e.target.value);
                onLitersChange(isNaN(val) ? 0 : Math.max(0, val));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSave();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  onCancel();
                }
              }}
              className="flex-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-semibold text-gray-800"
              min="0"
              step="0.5"
            />
            {/* Decrease (-) Button */}
            <button
              type="button"
              onClick={() => onLitersChange(Math.max(0, Math.round((modalLiters - 0.5) * 10) / 10))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-bold text-xl rounded-md transition-colors flex items-center justify-center border border-gray-300 shrink-0 select-none shadow-sm"
              title="Decrease by 0.5 Liter"
              aria-label="Decrease quantity"
            >
              −
            </button>
            {/* Increase (+) Button */}
            <button
              type="button"
              onClick={() => onLitersChange(Math.round((modalLiters + 0.5) * 10) / 10)}
              className="w-10 h-10 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-600 font-bold text-xl rounded-md transition-colors flex items-center justify-center border border-blue-200 shrink-0 select-none shadow-sm"
              title="Increase by 0.5 Liter"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
