"use client";

import { useState, useEffect } from "react";
import TimeForm from "@/components/TimeForm";
import Table from "@/components/Table";
import { generatePDF, exportToCSV } from "@/utils/exportUtils";
import { TimeRecord, ApiResponse } from "@/types";

export default function Home() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Intern Time Tracker
          </h1>
          <p className="text-gray-600">
            Track your daily time in and out, calculate hours worked, and export reports.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <TimeForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Stats Section */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{records.length}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-600 text-sm">Total Hours</p>
              <p className="text-3xl font-bold text-green-600">
                {records.reduce((sum, r) => sum + Number(r.total_hours), 0).toFixed(2)}
              </p>
            </div>

            <div className="col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-800 mb-4">Export Options</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleExportPDF}
                    disabled={records.length === 0 || isExporting}
                    className="flex-1 min-w-fit px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                  >
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </button>
                  <button
                    onClick={handleExportCSV}
                    disabled={records.length === 0 || isExporting}
                    className="flex-1 min-w-fit px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
                  >
                    {isExporting ? "Exporting..." : "Export CSV"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div>
          {isLoading && records.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 mt-4">Loading records...</p>
            </div>
          ) : (
            <Table data={records} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}