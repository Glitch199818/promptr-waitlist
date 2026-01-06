import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseServer";

const corsHeaders = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin ?? "*",
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
});

const getUserFromRequest = async (req: NextRequest) => {
  const supabase = await createSupabaseRouteHandlerClient();
  const authHeader = req.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (bearer) {
    const { data, error } = await supabase.auth.getUser(bearer);
    if (!error && data.user) return data.user;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
};

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders(origin) }
      );
    }

    // Try to select with name, model, variables, and variable_defaults first, fallback if columns don't exist
    let { data, error } = await supabase
      .from("memories")
      .select("id,text,tool,name,model,variables,variable_defaults,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // If some columns don't exist, retry without them
    if (error && (error.message?.includes("name") || error.message?.includes("model") || error.message?.includes("variables") || error.message?.includes("variable_defaults"))) {
      const retry = await supabase
        .from("memories")
        .select("id,text,tool,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Ensure all items have name, model, variables, and variable_defaults fields (null if not present or empty)
    const normalizedData = (data ?? []).map((item: any) => ({
      ...item,
      name: (item.name && item.name.trim()) ? item.name.trim() : null,
      model: (item.model && item.model.trim()) ? item.model.trim() : null,
      variables: item.variables || null,
      variable_defaults: item.variable_defaults || null,
    }));

    return NextResponse.json(normalizedData, { headers: corsHeaders(origin) });
  } catch (err) {
    console.error("GET /api/memories failed", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders(origin) }
      );
    }

    const body = await req.json();
    if (!body?.text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const text = body.text.trim();
    const tool = body.tool?.trim() || "Unknown";
    
    // Only save the name if the user explicitly provided one (non-empty), otherwise save null
    // Do not auto-generate names - let the UI handle fallback for display
    const nameValue = body.name?.trim();
    const name = (nameValue && nameValue.length > 0) ? nameValue : null;
    const modelValue = body.model?.trim();
    const model = (modelValue && modelValue.length > 0) ? modelValue : null;
    
    // Handle variables and variableDefaults
    const variables = Array.isArray(body.variables) ? body.variables : null;
    const variableDefaults = body.variableDefaults && typeof body.variableDefaults === "object" ? body.variableDefaults : null;

    // Try to insert with name, model, variables, and variable_defaults first
    let insertData: any = {
      user_id: user.id,
      text,
      tool,
      name,
      model,
      variables,
      variable_defaults: variableDefaults,
    };

    let { error } = await supabase.from("memories").insert(insertData);

    // If some columns don't exist, retry without them
    if (error && (error.message?.includes("name") || error.message?.includes("model") || error.message?.includes("variables") || error.message?.includes("variable_defaults"))) {
      insertData = {
        user_id: user.id,
        text,
        tool,
      };
      const retry = await supabase.from("memories").insert(insertData);
      error = retry.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders(origin) }
    );
  } catch (err) {
    console.error("POST /api/memories failed", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    const supabase = await createSupabaseRouteHandlerClient();
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders(origin) }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Memory ID is required" },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const { error } = await supabase
      .from("memories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    return NextResponse.json(
      { success: true },
      { headers: corsHeaders(origin) }
    );
  } catch (err) {
    console.error("DELETE /api/memories failed", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
