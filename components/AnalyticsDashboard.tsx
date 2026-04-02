"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { TimeRecord, ApiResponse, UserQuota } from "@/types";

interface AnalyticsDashboardProps {
  records: TimeRecord[];
  isLoading?: boolean;
}

export default function AnalyticsDashboard({
  records,
  isLoading = false,
}: AnalyticsDashboardProps) {
  const [quota, setQuota] = useState<number>(0);
  const [newQuota, setNewQuota] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  // Fetch quota on mount
  useEffect(() => {
    fetchQuota();
  }, []);

  const fetchQuota = async () => {
    try {
      const response = await fetch("/api/quota");
      const data: ApiResponse<UserQuota> = await response.json();
      if (data.success && data.data) {
        setQuota(data.data.monthly_hours_quota || 0);
        setNewQuota(String(data.data.monthly_hours_quota || ""));
      }
    } catch (error) {
      console.error("Failed to fetch quota:", error);
    }
  };

  const handleSaveQuota = async (e: React.FormEvent) => {
    e.preventDefault();

    const quotaValue = parseFloat(newQuota);
    if (!newQuota || quotaValue <= 0) {
      setMessage({ type: "error", text: "Please enter a valid quota value" });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_hours_quota: quotaValue }),
      });

      const data: ApiResponse<UserQuota> = await response.json();
      if (data.success) {
        setQuota(quotaValue);
        setMessage({ type: "success", text: "Quota updated successfully!" });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save quota" });
      }
    } catch (error) {
      console.error("Error saving quota:", error);
      setMessage({ type: "error", text: "An error occurred while saving" });
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate total hours worked
  const totalHours = records.reduce((sum, record) => {
    return sum + (parseFloat(String(record.total_hours)) || 0);
  }, 0);

  // Calculate remaining hours
  const remainingHours = Math.max(0, quota - totalHours);

  // Prepare pie chart data
  const chartData = [
    { name: "Hours Worked", value: Math.min(totalHours, quota), fill: "#3b82f6" },
    {
      name: "Remaining",
      value: remainingHours,
      fill: "#e5e7eb",
    },
  ];

  // Calculate percentage
  const workPercentage =
    quota > 0 ? ((totalHours / quota) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-black mb-6">
        Analytics & Time Quota
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quota Input */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-bold text-black mb-4">
            Internship Hours Quota
          </h3>

          {message && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <p
                className={`text-sm ${
                  message.type === "success"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSaveQuota} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Total Internship Hours
              </label>
              <input
                type="number"
                step="0.5"
                value={newQuota}
                onChange={(e) => setNewQuota(e.target.value)}
                placeholder="e.g., 486"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-black placeholder-black bg-white"
                disabled={isSaving}
              />
              <p className="text-xs text-black mt-1">
                Enter your total internship hours (e.g., 486 hours for a 3-month internship)
              </p>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition text-sm"
            >
              {isSaving ? "Saving..." : "Set Quota"}
            </button>
          </form>

          {/* Current Stats */}
          <div className="mt-6 space-y-3 border-t pt-4">
            <div>
              <p className="text-xs text-black">Internship Quota</p>
              <p className="text-xl font-bold text-indigo-600">{quota} hrs</p>
            </div>
            <div>
              <p className="text-xs text-black">Hours Worked</p>
              <p className="text-xl font-bold text-blue-600">
                {totalHours.toFixed(2)} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-black">Hours Remaining</p>
              <p
                className={`text-xl font-bold ${
                  remainingHours <= 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {remainingHours.toFixed(2)} hrs
              </p>
            </div>
            <div>
              <p className="text-xs text-black">Progress</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(Number(workPercentage), 100)}%` }}
                  ></div>
                </div>
                <p className="text-lg font-bold text-black w-12 text-right">
                  {workPercentage}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pie Chart */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-bold text-black mb-4">
            Time Quota Progress
          </h3>

          {quota > 0 ? (
            <div className="flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => {
                      const displayPercent = ((percent ?? 0) * 100).toFixed(0);
                      return `${name}: ${value.toFixed(1)}h (${displayPercent}%)`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => {
                      if (typeof value === "number") {
                        return `${value.toFixed(2)} hours`;
                      }
                      return "0 hours";
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>

              {/* Status Message */}
              <div className="mt-4 w-full">
                {totalHours >= quota ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-sm font-semibold text-green-700">
                      ✓ Quota Achieved!
                    </p>
                    <p className="text-xs text-green-600">
                      You've reached your monthly target
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <p className="text-sm font-semibold text-blue-700">
                      {remainingHours.toFixed(1)} hours to go
                    </p>
                    <p className="text-xs text-blue-600">
                      {((quota - totalHours) / (quota / 30)).toFixed(1)} hours
                      per day needed
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-black mb-2">No quota set yet</p>
              <p className="text-sm text-black font-medium">
                  Set your monthly quota on the left to see your progress
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
