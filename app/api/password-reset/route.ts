import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Log password reset request (optional)
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";

    const { error: logError } = await supabase
      .from("password_reset_logs")
      .insert({
        email,
        ip_address: clientIp,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    if (logError) {
      console.error("Error logging password reset:", logError);
      // Don't fail if logging fails
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (resetError) {
      return NextResponse.json(
        { error: resetError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Error sending password reset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
