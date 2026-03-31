import { NextRequest, NextResponse } from "next/server";
import { TimeRecord, ApiResponse } from "@/types";

// This is a demo implementation using in-memory storage
// In production, replace with actual database (Supabase, PostgreSQL, etc.)
let timeRecords: TimeRecord[] = [];
let nextId = 1;

/**
 * GET /api/time-records - Fetch all time records
 */
export async function GET(): Promise<NextResponse<ApiResponse<TimeRecord[]>>> {
  try {
    // Sort by date descending
    const sortedRecords = [...timeRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(
      {
        success: true,
        data: sortedRecords,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch records",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/time-records - Create a new time record
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<TimeRecord>>> {
  try {
    const body = await req.json();
    const { date, am_in, am_out, pm_in, pm_out, total_hours } = body;

    // Validate required fields
    if (!date || !am_in || !am_out || !pm_in || !pm_out || !total_hours) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    // Check for duplicate entry (same date)
    const existingRecord = timeRecords.find((r) => r.date === date);
    if (existingRecord) {
      return NextResponse.json(
        {
          success: false,
          error: "Record for this date already exists",
        },
        { status: 409 }
      );
    }

    const newRecord: TimeRecord = {
      id: String(nextId++),
      date,
      am_in,
      am_out,
      pm_in,
      pm_out,
      total_hours,
      created_at: new Date().toISOString(),
    };

    timeRecords.push(newRecord);

    return NextResponse.json(
      {
        success: true,
        data: newRecord,
        message: "Record created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create record",
      },
      { status: 500 }
    );
  }
}
