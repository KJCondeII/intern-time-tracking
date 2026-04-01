import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { UserQuota, ApiResponse } from "@/types";

/**
 * GET /api/quota - Fetch user's hourly quota
 */
export async function GET(
  req: NextRequest
): Promise<NextResponse<ApiResponse<UserQuota>>> {
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

    // Fetch user's quota
    const { data, error } = await supabase
      .from("user_quotas")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return NextResponse.json(
      { success: true, data: data || { monthly_hours_quota: 0 } },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET quota error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch quota" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quota - Create or update user's quota
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<UserQuota>>> {
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
    const { monthly_hours_quota } = body;

    if (!monthly_hours_quota || monthly_hours_quota <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid quota value" },
        { status: 400 }
      );
    }

    // Try to update first, if not found, create
    let data, error;

    // Check if quota exists
    const { data: existingQuota } = await supabase
      .from("user_quotas")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (existingQuota) {
      // Update existing quota
      const result = await supabase
        .from("user_quotas")
        .update({ monthly_hours_quota, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select()
        .single();
      data = result.data;
      error = result.error;
    } else {
      // Create new quota
      const result = await supabase
        .from("user_quotas")
        .insert({
          user_id: user.id,
          monthly_hours_quota,
        })
        .select()
        .single();
      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return NextResponse.json(
      { success: true, data, message: "Quota updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST quota error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update quota" },
      { status: 500 }
    );
  }
}
