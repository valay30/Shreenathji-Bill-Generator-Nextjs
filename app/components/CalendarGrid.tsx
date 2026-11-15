"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/app/components/Icons";

interface CalendarGridProps {
  currentDate: Date;
  selectedDays: Map<string, number>;
  wholeMonth: boolean;
  onDayClick: (dateStr: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onWholeMonthChange: (checked: boolean) => void;
}

export default function CalendarGrid({
  currentDate,
  selectedDays,
  wholeMonth,
  onDayClick,
  onPrevMonth,
  onNextMonth,
  onWholeMonthChange,
}: CalendarGridProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay();

  const days = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isSelected = selectedDays.has(dateStr);
    const liters = selectedDays.get(dateStr);

    days.push(
      <div
        key={dateStr}
        className={`calendar-day p-2 cursor-pointer flex items-center justify-center h-10 w-10 mx-auto relative ${
          isSelected ? "selected" : ""
        }`}
        onClick={() => onDayClick(dateStr)}
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

  return (
    <div className="mt-8">
      <div id="calendar-container">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onPrevMonth}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </button>
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </h3>
          <button
            onClick={onNextMonth}
            className="p-2 rounded-full hover:bg-gray-200"
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="font-bold text-gray-600 day-name">
              {d}
            </div>
          ))}
          {days}
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <input
          id="whole-month-checkbox"
          type="checkbox"
          checked={wholeMonth}
          onChange={(e) => onWholeMonthChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="whole-month-checkbox" className="ml-2 block text-sm text-gray-900">
          Bill for the whole month (1 Liter/day)
        </label>
      </div>
    </div>
  );
}
