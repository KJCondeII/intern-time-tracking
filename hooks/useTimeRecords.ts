import { useState, useCallback } from "react";
import { TimeRecord, ApiResponse } from "@/types";

export function useTimeRecords() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/time-records");
      const data: ApiResponse<TimeRecord[]> = await response.json();

      if (data.success && data.data) {
        setRecords(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch records");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRecord = useCallback(
    async (formData: {
      date: string;
      am_in: string;
      am_out: string;
      pm_in: string;
      pm_out: string;
      total_hours: string;
    }) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/time-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data: ApiResponse<TimeRecord> = await response.json();

        if (data.success && data.data) {
          setRecords((prev) => [data.data!, ...prev]);
          return data.data;
        } else {
          throw new Error(data.error || "Failed to save record");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteRecord = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/time-records/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        throw new Error("Failed to delete record");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    records,
    isLoading,
    error,
    fetchRecords,
    addRecord,
    deleteRecord,
    clearError,
  };
}
