import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { PLAN_LIMITS } from "@/lib/constants";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("forms")
    .select(
      "id, title, description, status, submission_count, view_count, created_at, updated_at"
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan limit
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, forms_count")
    .eq("id", user.id)
    .single();

  if (profile) {
    const plan = profile.plan as keyof typeof PLAN_LIMITS;
    const limit = PLAN_LIMITS[plan]?.maxForms ?? 3;
    if (profile.forms_count >= limit) {
      return NextResponse.json(
        { error: `Free plan limit reached (${limit} forms). Upgrade to create more.` },
        { status: 403 }
      );
    }
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      title: body.title || "Untitled Form",
      description: body.description || "",
      schema: body.schema || {
        version: "1.0",
        steps: [],
        logicRules: [],
      },
      ...(body.settings ? { settings: body.settings } : {}),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
