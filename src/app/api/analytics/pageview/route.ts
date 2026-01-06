import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { path, timestamp, referrer, userAgent } = await req.json();

    if (!path || typeof path !== "string") {
      return NextResponse.json({ error: "Path is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      // Silently fail if Supabase is not configured
      return NextResponse.json({ success: false }, { status: 200 });
    }

    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    // Try to insert page view
    // Note: You'll need to create a 'page_views' table in Supabase
    // with columns: id (uuid, primary key), path (text), timestamp (timestamptz), 
    // referrer (text, nullable), user_agent (text, nullable), created_at (timestamptz, default now())
    const { error } = await supabase
      .from("page_views")
      .insert({
        path,
        timestamp: timestamp || new Date().toISOString(),
        referrer: referrer || null,
        user_agent: userAgent || null,
      });

    if (error) {
      // If table doesn't exist, that's okay - just log and continue
      console.error("Page view tracking error:", error);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    // Silently fail - don't break the user experience
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
