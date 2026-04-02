"use client";

import { useState } from "react";
import TimePickerInput from "./TimePickerInput";
import { TimeFormState, ValidationResult } from "@/types";
import { validateTimeRecord, calculateDailyHours } from "@/utils/timeUtils";

interface TimeFormProps {
  onSubmit: (data: {
    date: string;
    am_in: string;
    am_out: string;
    pm_in: string;
    pm_out: string;
    total_hours: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export default function TimeForm({ onSubmit, isLoading = false }: TimeFormProps) {
  const [form, setForm] = useState<TimeFormState>({
    date: "",
    am_in: "",
    am_out: "",
    pm_in: "",
    pm_out: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleInputChange = (field: keyof TimeFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate form
    const validation: ValidationResult = validateTimeRecord(
      form.date,
      form.am_in,
      form.am_out,
      form.pm_in,
      form.pm_out
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      setMessage({
        type: "error",
        text: "Please correct all errors before submitting",
      });
      return;
    }

    // Calculate total hours
    const total_hours = calculateDailyHours(
      form.am_in,
      form.am_out,
      form.pm_in,
      form.pm_out
    );

    try {
      await onSubmit({
        ...form,
        total_hours,
      });

      // Reset form on success
      setForm({
        date: "",
        am_in: "",
        am_out: "",
        pm_in: "",
        pm_out: "",
      });
      setErrors({});
      setMessage({
        type: "success",
        text: "Time record saved successfully!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save record",
      });
    }
  };

  const renderTimeInput = (
    label: string,
    field: keyof TimeFormState,
    defaultPeriod: "AM" | "PM"
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-black uppercase tracking-wider">{label}</label>
      <TimePickerInput
        value={form[field]}
        onChange={(value) => handleInputChange(field, value)}
        disabled={isLoading}
        error={!!errors[field]}
        period={defaultPeriod}
      />
      {errors[field] && (
        <span className="text-xs font-semibold text-red-600">{errors[field]}</span>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 rounded-xl shadow-lg border-2 border-blue-100 space-y-5"
    >
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add Time Record</h2>
        <p className="text-sm text-black mt-1">Track your daily work hours</p>
      </div>

      {/* Date Input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-black flex items-center gap-2">
          <span className="text-lg">📅</span> Date
        </label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleInputChange("date", e.target.value)}
          className={`px-4 py-3 text-base border-2 rounded-lg focus:outline-none focus:ring-2 transition font-medium ${
            errors.date
              ? "border-red-500 focus:ring-red-500 bg-red-50 text-red-900"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
          }`}
          disabled={isLoading}
        />
        {errors.date && (
          <span className="text-xs font-medium text-red-600">{errors.date}</span>
        )}
      </div>

      {/* Morning Session */}
      <div className="bg-gradient-to-br from-orange-50 to-white border-2 border-orange-200 rounded-xl p-5">
        <h3 className="text-base font-bold text-orange-700 mb-4 flex items-center gap-2">
          <span className="text-xl">🌅</span> Morning Session
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderTimeInput("In Time", "am_in", "AM")}
          {renderTimeInput("Out Time", "am_out", "AM")}
        </div>
      </div>

      {/* Afternoon Session */}
      <div className="bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-200 rounded-xl p-5">
        <h3 className="text-base font-bold text-indigo-700 mb-4 flex items-center gap-2">
          <span className="text-xl">🌤️</span> Afternoon Session
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {renderTimeInput("In Time", "pm_in", "PM")}
          {renderTimeInput("Out Time", "pm_out", "PM")}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
          <span>💡</span>
          <span>Hour (1-12) → Minute (0-59) → Toggle AM/PM. Morning defaults to AM, Afternoon to PM.</span>
        </p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg font-semibold text-sm transition border-2 ${
            message.type === "success"
              ? "bg-green-100 border-green-500 text-green-800"
              : "bg-red-100 border-red-500 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 rounded-xl font-bold text-lg transition-all transform ${
          isLoading
            ? "bg-gray-400 text-black cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 active:scale-95 shadow-xl hover:shadow-2xl"
        }`}
      >
        {isLoading ? "Saving..." : "Save Entry"}
      </button>
    </form>
  );
}
