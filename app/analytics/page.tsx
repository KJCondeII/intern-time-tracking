"use client";

import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { TimeRecord, ApiResponse, UserQuota } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [quota, setQuota] = useState<number>(0);
  const [newQuota, setNewQuota] = useState<string>("");
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  // Fetch quota and records on mount
  useEffect(() => {
    if (user) {
      fetchQuota();
      fetchRecords();
    }
  }, [user]);

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

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/time-records");
      const data: ApiResponse<TimeRecord[]> = await response.json();
      if (data.success && data.data) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch records:", error);
    } finally {
      setIsLoading(false);
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
  const workPercentage = quota > 0 ? ((totalHours / quota) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Analytics & Time Quota
          </h1>
          <p className="text-gray-600">
            Track your progress towards your monthly time quota
          </p>
        </div>

        {authLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Quota Input */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Set Monthly Quota</h2>
              
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
                      message.type === "success" ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              )}

              <form onSubmit={handleSaveQuota} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Hours Quota
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newQuota}
                    onChange={(e) => setNewQuota(e.target.value)}
                    placeholder="e.g., 160"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    disabled={isSaving}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your target monthly work hours
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {isSaving ? "Saving..." : "Save Quota"}
                </button>
              </form>

              {/* Current Stats */}
              <div className="mt-6 space-y-3 border-t pt-6">
                <div>
                  <p className="text-sm text-gray-600">Monthly Quota</p>
                  <p className="text-2xl font-bold text-indigo-600">{quota} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                  <p className="text-2xl font-bold text-blue-600">{totalHours.toFixed(2)} hrs</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hours Remaining</p>
                  <p className={`text-2xl font-bold ${remainingHours <= 0 ? "text-red-600" : "text-green-600"}`}>
                    {remainingHours.toFixed(2)} hrs
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{workPercentage}%</p>
                </div>
              </div>
            </div>

            {/* Right: Pie Chart */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Time Quota Progress</h2>
              
              {quota > 0 ? (
                <div className="flex flex-col items-center justify-center h-96">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value.toFixed(1)}h (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(2)} hours`}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Status Message */}
                  <div className="mt-6 text-center">
                    {totalHours >= quota ? (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-700">
                          ✓ Quota Achieved!
                        </p>
                        <p className="text-xs text-green-600">
                          You've reached your monthly target
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-700">
                          {remainingHours.toFixed(1)} hours to go
                        </p>
                        <p className="text-xs text-blue-600">
                          {((quota - totalHours) / (quota / 30)).toFixed(1)} hours per day
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">No quota set yet</p>
                    <p className="text-sm text-gray-500">
                      Set your monthly quota on the left to see your progress chart
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Records Summary */}
        {!authLoading && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Time Records</h2>
            {records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-700">Date</th>
                      <th className="px-4 py-2 text-left text-gray-700">AM In</th>
                      <th className="px-4 py-2 text-left text-gray-700">AM Out</th>
                      <th className="px-4 py-2 text-left text-gray-700">PM In</th>
                      <th className="px-4 py-2 text-left text-gray-700">PM Out</th>
                      <th className="px-4 py-2 text-left text-gray-700">Total Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(0, 5).map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-gray-800">{record.date}</td>
                        <td className="px-4 py-2 text-gray-600">{record.am_in}</td>
                        <td className="px-4 py-2 text-gray-600">{record.am_out}</td>
                        <td className="px-4 py-2 text-gray-600">{record.pm_in}</td>
                        <td className="px-4 py-2 text-gray-600">{record.pm_out}</td>
                        <td className="px-4 py-2 font-semibold text-blue-600">
                          {Number(record.total_hours).toFixed(2)} hrs
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No time records yet. Start tracking your hours!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
