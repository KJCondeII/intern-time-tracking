"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TimeForm from "@/components/TimeForm";
import Table from "@/components/Table";
import ProfileMenu from "@/components/ProfileMenu";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import { generatePDF, exportToCSV } from "@/utils/exportUtils";
import { TimeRecord, ApiResponse } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, loading: authLoading, logout, isNewUser } = useAuth();
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Edit/Delete state
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch records on component mount
  useEffect(() => {
    fetchRecords();
  }, []);

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

  const handleSubmit = async (formData: {
    date: string;
    am_in: string;
    am_out: string;
    pm_in: string;
    pm_out: string;
    total_hours: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/time-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<TimeRecord> = await response.json();

      if (data.success && data.data) {
        setRecords((prev) => [data.data!, ...prev]);
      } else {
        throw new Error(data.error || "Failed to save record");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      generatePDF(records);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportToCSV(records);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/time-records?id=${id}`, {
        method: "DELETE",
      });

      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        // Reset to page 1 if current page has no records
        if (paginatedRecords.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } else {
        alert("Failed to delete record: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Error deleting record");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditRecord = async (updatedRecord: TimeRecord) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/time-records", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRecord),
      });

      const data: ApiResponse<TimeRecord> = await response.json();

      if (data.success && data.data) {
        setRecords((prev) =>
          prev.map((r) => (r.id === updatedRecord.id ? data.data! : r))
        );
        setEditingRecord(null);
      } else {
        throw new Error(data.error || "Failed to update record");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update record");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = records.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with User Info */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Intern Time Tracker
            </h1>
            <p className="text-black">
              Track your daily time in and out, calculate hours worked, and export reports.
            </p>
          </div>
          
          {/* User Profile Section with Menu */}
          {!authLoading && user && (
            <div className="flex flex-col items-end gap-4">
              {/* Welcoming Message */}
              <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                {isNewUser ? (
                  <div>
                    <p className="text-sm font-semibold text-blue-700 mb-1">🎉 Welcome to DTR System!</p>
                    <p className="text-xs text-blue-600">
                      Great to have you on board! Start tracking your internship hours now.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Welcome back!</p>
                    <p className="text-xs text-indigo-600">
                      Keep up the great work tracking your time.
                    </p>
                  </div>
                )}
              </div>

              {/* Profile Menu Circle */}
              <ProfileMenu userEmail={user.email || "User"} onLogout={logout} />
            </div>
          )}
        </div>

        {authLoading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-black mt-4">Loading...</p>
          </div>
        ) : (
          <>
            {/* Stats Section - Top */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-600">
                <p className="text-black text-sm font-semibold uppercase tracking-wide">Total Records</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{records.length}</p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-green-600">
                <p className="text-black text-sm font-semibold uppercase tracking-wide">Total Hours</p>
                <p className="text-4xl font-bold text-green-600 mt-2">
                  {records.reduce((sum, r) => sum + Number(r.total_hours), 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Form and Export Section - Middle */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <TimeForm onSubmit={handleSubmit} isLoading={isLoading} />
              </div>

              {/* Export Section */}
              <div>
                <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col justify-between">
                  <h3 className="font-bold text-black mb-6 text-lg">Options</h3>
                  <div className="space-y-3 flex flex-col justify-end flex-1">
                    <button
                      onClick={handleExportPDF}
                      disabled={records.length === 0 || isExporting}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-sm"
                    >
                      {isExporting ? "Exporting..." : "Export PDF"}
                    </button>
                    <button
                      onClick={handleExportCSV}
                      disabled={records.length === 0 || isExporting}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-semibold text-sm"
                    >
                      {isExporting ? "Exporting..." : "Export CSV"}
                    </button>
                    <Link href="/accomplishments">
                      <button
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
                      >
                        📝 Daily Accomplishments
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard */}
            <div className="mt-8">
              <AnalyticsDashboard records={records} isLoading={isLoading} />
            </div>

            {/* Time Records with Pagination */}
            <div className="mt-8">
              <div className="bg-white rounded-xl shadow-xl p-8 border-2 border-gray-100">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-8">
                  Time Records
                </h2>

                {isLoading && records.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-block">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-black mt-4">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-16 text-black">
                    <p className="text-lg">📋 No time records yet. Start by creating your first record!</p>
                  </div>
                ) : (
                  <>
                    {/* Records Table */}
                    <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
                      <table className="w-full text-sm">
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-black font-bold">Date</th>
                            <th className="px-6 py-4 text-left text-black font-bold">AM In</th>
                            <th className="px-6 py-4 text-left text-black font-bold">AM Out</th>
                            <th className="px-6 py-4 text-left text-black font-bold">PM In</th>
                            <th className="px-6 py-4 text-left text-black font-bold">PM Out</th>
                            <th className="px-6 py-4 text-left text-black font-bold">Total</th>
                            <th className="px-6 py-4 text-center text-black font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecords.map((record, index) => (
                            <tr
                              key={record.id}
                              className={`border-b transition hover:bg-blue-50 ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                              }`}
                            >
                              <td className="px-6 py-4 text-black font-semibold">{record.date}</td>
                              <td className="px-6 py-4 text-black font-medium">{record.am_in}</td>
                              <td className="px-6 py-4 text-black font-medium">{record.am_out}</td>
                              <td className="px-6 py-4 text-black font-medium">{record.pm_in}</td>
                              <td className="px-6 py-4 text-black font-medium">{record.pm_out}</td>
                              <td className="px-6 py-4 font-bold">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                                  {Number(record.total_hours).toFixed(2)} hrs
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => setEditingRecord(record)}
                                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold hover:bg-blue-600 transition shadow hover:shadow-md"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => record.id && handleDeleteRecord(record.id)}
                                    disabled={isDeleting || !record.id}
                                    className="px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition shadow hover:shadow-md disabled:opacity-50"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="text-sm text-black">
                          <span className="font-semibold">Page {currentPage}</span> of{" "}
                          <span className="font-semibold">{totalPages}</span> ({records.length} total
                          records)
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                            Previous
                          </button>

                          <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1"
                          >
                            Next
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Edit Modal */}
            {editingRecord && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-black">Edit Time Record</h3>
                    <button
                      onClick={() => setEditingRecord(null)}
                      className="text-black hover:text-black text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updated: TimeRecord = {
                        ...editingRecord,
                        am_in: formData.get("am_in") as string,
                        am_out: formData.get("am_out") as string,
                        pm_in: formData.get("pm_in") as string,
                        pm_out: formData.get("pm_out") as string,
                      };
                      handleEditRecord(updated);
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editingRecord.date}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          AM In
                        </label>
                        <input
                          type="time"
                          name="am_in"
                          defaultValue={editingRecord.am_in}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          AM Out
                        </label>
                        <input
                          type="time"
                          name="am_out"
                          defaultValue={editingRecord.am_out}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          PM In
                        </label>
                        <input
                          type="time"
                          name="pm_in"
                          defaultValue={editingRecord.pm_in}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          PM Out
                        </label>
                        <input
                          type="time"
                          name="pm_out"
                          defaultValue={editingRecord.pm_out}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setEditingRecord(null)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                      >
                        {isLoading ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}