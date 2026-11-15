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
          <input
            type="number"
            id="liter-input"
            value={modalLiters}
            onChange={(e) => onLitersChange(parseFloat(e.target.value) || 0)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            min="0"
            step="0.5"
          />
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
