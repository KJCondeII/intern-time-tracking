"use client";

import { useState, useEffect } from "react";

interface TimePickerInputProps {
  value: string; // Expected format: "HH:MM" (24-hour)
  timeOnly?: string; // Just the time without period
  period?: "AM" | "PM"; // AM/PM stored separately
  onChange: (value: string) => void;
  onPeriodChange?: (period: "AM" | "PM") => void;
  disabled?: boolean;
  error?: boolean;
}

export default function TimePickerInput({
  value,
  timeOnly,
  period = "AM",
  onChange,
  onPeriodChange,
  disabled = false,
  error = false,
}: TimePickerInputProps) {
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(period);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":").map(Number);
      let displayHours = h;
      let displayPeriod: "AM" | "PM" = "AM";

      if (h === 0) {
        displayHours = 12;
      } else if (h > 12) {
        displayHours = h - 12;
        displayPeriod = "PM";
      } else if (h === 12) {
        displayPeriod = "PM";
      }

      setHours(String(displayHours));
      setMinutes(String(m).padStart(2, "0"));
      setSelectedPeriod(displayPeriod);
    }
  }, [value]);

  // Update time and convert to 24-hour format
  const updateTime = (h: string, m: string, p: "AM" | "PM") => {
    if (!h || !m) return;

    const hour = parseInt(h);
    const minute = parseInt(m);

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return;

    let hour24 = hour;
    if (p === "PM" && hour !== 12) {
      hour24 = hour + 12;
    } else if (p === "AM" && hour === 12) {
      hour24 = 0;
    }

    const formattedTime = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    onChange(formattedTime);

    if (onPeriodChange) {
      onPeriodChange(p);
    }
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = e.target.value;
    setHours(newHours);
    updateTime(newHours, minutes, selectedPeriod);
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = e.target.value;
    setMinutes(newMinutes);
    updateTime(hours, newMinutes, selectedPeriod);
  };

  const handlePeriodChange = (newPeriod: "AM" | "PM") => {
    setSelectedPeriod(newPeriod);
    updateTime(hours, minutes, newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-lg border-2 border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition">
      <input
        type="number"
        min="1"
        max="12"
        placeholder="HH"
        value={hours}
        onChange={handleHourChange}
        disabled={disabled}
        className={`w-14 px-2 py-2 text-center text-base font-bold border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-transparent text-black ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "text-red-600" : ""}`}
      />

      <span className="text-xl font-bold text-black">:</span>

      <input
        type="number"
        min="0"
        max="59"
        placeholder="MM"
        value={minutes}
        onChange={handleMinuteChange}
        disabled={disabled}
        className={`w-14 px-2 py-2 text-center text-base font-bold border-0 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-transparent text-black ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${error ? "text-red-600" : ""}`}
      />

      <div className="flex gap-1 ml-1">
        <button
          type="button"
          onClick={() => handlePeriodChange("AM")}
          disabled={disabled}
          className={`px-2.5 py-2 font-bold text-xs rounded-lg transition ${
            selectedPeriod === "AM"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-black hover:bg-gray-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => handlePeriodChange("PM")}
          disabled={disabled}
          className={`px-2.5 py-2 font-bold text-xs rounded-lg transition ${
            selectedPeriod === "PM"
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-100 text-black hover:bg-gray-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          PM
        </button>
      </div>
    </div>
  );
}
