import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Server not configured: missing Supabase environment variables" },
        { status: 500 }
      );
    }

    // Use service role to bypass RLS for waitlist
    const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: normalizedEmail })
      .select("id")
      .single();

    if (error) {
      // Duplicate email handling
      if (error.code === "23505" || error.message?.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ code: "duplicate", error: "Already on the waitlist" }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

