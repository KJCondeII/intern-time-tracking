import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("sb-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from auth.getUser() using the session
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionCookie);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch accomplishments for this user
    const { data, error } = await supabase
      .from("accomplishments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error fetching accomplishments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("sb-session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from auth
    const { data: { user }, error: userError } = await supabase.auth.getUser(sessionCookie);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const date = formData.get("date") as string;
    const accomplishment = formData.get("accomplishment") as string;
    const files = formData.getAll("files") as File[];

    if (!date || !accomplishment) {
      return NextResponse.json(
        { success: false, error: "Date and accomplishment are required" },
        { status: 400 }
      );
    }

    // Upload files if any
    const uploadedFiles: Array<{ name: string; url: string; type: "image" | "file" }> = [];

    for (const file of files) {
      try {
        const fileName = `${user.id}/${date}/${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("accomplishments")
          .upload(fileName, file, { upsert: true });

        if (uploadError) {
          console.error("File upload error:", uploadError);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("accomplishments")
          .getPublicUrl(fileName);

        const fileType = file.type.startsWith("image") ? "image" : "file";
        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
          type: fileType,
        });
      } catch (error) {
        console.error("Error processing file:", error);
      }
    }

    // Check if accomplishment already exists for this date
    const { data: existingData } = await supabase
      .from("accomplishments")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", date)
      .single();

    let result;

    if (existingData) {
      // Update existing
      const { data, error } = await supabase
        .from("accomplishments")
        .update({
          accomplishment,
          files: uploadedFiles,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from("accomplishments")
        .insert({
          user_id: user.id,
          date,
          accomplishment,
          files: uploadedFiles,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error saving accomplishment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
