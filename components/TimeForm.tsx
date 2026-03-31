"use client";

import { useState } from "react";
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

  const renderInput = (
    label: string,
    field: keyof TimeFormState,
    type: "date" | "time"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
          errors[field]
            ? "border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:ring-blue-500"
        }`}
        disabled={isLoading}
      />
      {errors[field] && (
        <span className="text-xs text-red-600">{errors[field]}</span>
      )}
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-xl font-bold text-gray-800">Add Time Record</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput("Date", "date", "date")}
        {renderInput("AM - In", "am_in", "time")}
        {renderInput("AM - Out", "am_out", "time")}
        {renderInput("PM - In", "pm_in", "time")}
        {renderInput("PM - Out", "pm_out", "time")}
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 rounded-lg font-medium transition ${
          isLoading
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
        }`}
      >
        {isLoading ? "Saving..." : "Save Entry"}
      </button>
    </form>
  );
}
