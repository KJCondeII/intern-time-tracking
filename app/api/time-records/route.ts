import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { TimeRecord, ApiResponse } from "@/types";

/**
 * GET /api/time-records - Fetch all time records for authenticated user
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<TimeRecord[]>>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's records from Supabase
    const { data, error } = await supabase
      .from("time_records")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      { success: true, data: data || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/time-records - Create a new time record for authenticated user
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<TimeRecord>>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { date, am_in, am_out, pm_in, pm_out, total_hours } = body;

    // Validate required fields
    if (!date || !am_in || !am_out || !pm_in || !pm_out || !total_hours) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert record into Supabase
    const { data, error } = await supabase
      .from("time_records")
      .insert([
        {
          user_id: user.id,
          date,
          am_in,
          am_out,
          pm_in,
          pm_out,
          total_hours,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        return NextResponse.json(
          { success: false, error: "Record for this date already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Record created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create record" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/time-records - Update a time record for authenticated user
 */
export async function PUT(
  req: NextRequest
): Promise<NextResponse<ApiResponse<TimeRecord>>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, date, am_in, am_out, pm_in, pm_out, total_hours } = body;

    // Validate required fields
    if (!id || !date || !am_in || !am_out || !pm_in || !pm_out || !total_hours) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update record in Supabase
    const { data, error } = await supabase
      .from("time_records")
      .update({
        date,
        am_in,
        am_out,
        pm_in,
        pm_out,
        total_hours,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data,
        message: "Record updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update record" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/time-records - Delete a time record for authenticated user
 */
export async function DELETE(
  req: NextRequest
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Record ID is required" },
        { status: 400 }
      );
    }

    // Delete record from Supabase
    const { error } = await supabase
      .from("time_records")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: null,
        message: "Record deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete record" },
      { status: 500 }
    );
  }
}
