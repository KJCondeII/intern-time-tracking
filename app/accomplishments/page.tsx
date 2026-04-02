"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProfileMenu from "@/components/ProfileMenu";
import { useAuth } from "@/hooks/useAuth";

interface DailyAccomplishment {
  id: string;
  date: string;
  accomplishment: string;
  files: Array<{
    name: string;
    url: string;
    type: "image" | "file";
  }>;
}

export default function AccomplishmentsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [accomplishment, setAccomplishment] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [accomplishments, setAccomplishments] = useState<DailyAccomplishment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Fetch accomplishments on mount
  useEffect(() => {
    fetchAccomplishments();
  }, []);

  const fetchAccomplishments = async () => {
    try {
      const response = await fetch("/api/accomplishments");
      if (response.ok) {
        const data = await response.json();
        setAccomplishments(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch accomplishments:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accomplishment.trim()) {
      alert("Please enter an accomplishment");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("date", selectedDate);
      formData.append("accomplishment", accomplishment);

      uploadedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/accomplishments", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setAccomplishment("");
        setUploadedFiles([]);
        await fetchAccomplishments();
        alert("Accomplishment saved successfully!");
      } else {
        alert("Failed to save accomplishment");
      }
    } catch (error) {
      console.error("Failed to save accomplishment:", error);
      alert("Error saving accomplishment");
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAccomplishmentForDate = (date: string) => {
    return accomplishments.find((acc) => acc.date === date);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-black">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-black">
          Please log in to access accomplishments
        </p>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    calendarDays.push(date.toISOString().split("T")[0]);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition text-black">
                ← Home
              </button>
            </Link>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              📝 Daily Accomplishments
            </h1>
          </div>
          <ProfileMenu userEmail={user?.email || ""} onLogout={logout} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
                >
                  ← Prev
                </button>
                <h2 className="text-2xl font-bold text-black">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition"
                >
                  Next →
                </button>
              </div>

              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-black py-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  const hasAccomplishment = date && getAccomplishmentForDate(date);
                  const isSelected = date === selectedDate;
                  const isToday =
                    date === new Date().toISOString().split("T")[0];

                  return (
                    <button
                      key={index}
                      onClick={() => date && setSelectedDate(date)}
                      className={`aspect-square rounded-lg font-semibold text-sm transition border-2 flex flex-col items-center justify-center ${
                        date === null
                          ? "bg-gray-50 cursor-default border-transparent"
                          : isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : isToday
                          ? "bg-indigo-100 text-indigo-800 border-indigo-400"
                          : hasAccomplishment
                          ? "bg-green-100 text-green-800 border-green-400"
                          : "bg-white text-black border-gray-200 hover:border-blue-400 cursor-pointer"
                      }`}
                    >
                      {date && (
                        <>
                          <span>{new Date(date).getDate()}</span>
                          {hasAccomplishment && (
                            <span className="text-xs">✓</span>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected date accomplishment */}
            {selectedDate && getAccomplishmentForDate(selectedDate) && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-400 rounded-lg">
                <h3 className="font-bold text-green-800 mb-2">
                  📌 Accomplishment for {selectedDate}
                </h3>
                <p className="text-green-700 mb-3">
                  {getAccomplishmentForDate(selectedDate)?.accomplishment}
                </p>
                {getAccomplishmentForDate(selectedDate)?.files &&
                  getAccomplishmentForDate(selectedDate)!.files.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold text-green-800 mb-2">
                        Attachments:
                      </p>
                      <div className="space-y-2">
                        {getAccomplishmentForDate(selectedDate)!.files.map(
                          (file, idx) => (
                            <a
                              key={idx}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              {file.type === "image" ? "🖼️" : "📄"}
                              {file.name}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              📝 Add Accomplishment
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Date Display */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  📅 Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium"
                />
              </div>

              {/* Accomplishment Text */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  ✨ Daily Accomplishment
                </label>
                <textarea
                  value={accomplishment}
                  onChange={(e) => setAccomplishment(e.target.value)}
                  placeholder="Describe what you accomplished today..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-32 bg-white text-black placeholder-black font-medium"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-bold text-black mb-2 uppercase tracking-wider">
                  📎 Attach Files/Images
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black font-medium"
                />
                <p className="text-xs text-black mt-2 font-semibold">
                  ✓ Images, PDFs, Word docs, Excel files supported
                </p>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div className="p-4 bg-blue-100 rounded-lg border-2 border-blue-300">
                  <p className="text-sm font-bold text-blue-900 mb-3">
                    📦 Files to upload:
                  </p>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm text-blue-900 bg-white p-3 rounded border-2 border-blue-300 font-medium"
                      >
                        <span>📎 {file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(idx)}
                          className="text-red-600 hover:text-red-800 font-bold text-lg"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition shadow-md hover:shadow-lg"
              >
                {isLoading ? "Saving..." : "Save Accomplishment"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
