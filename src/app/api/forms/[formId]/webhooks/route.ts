import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET: list webhooks for a form
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("webhooks")
    .select("id, url, secret, enabled, created_at, updated_at")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: create a webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const { data: form } = await supabase
    .from("forms").select("id").eq("id", formId).eq("user_id", user.id).single();
  if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

  const { url, secret } = await request.json();
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhooks")
    .insert({ form_id: formId, url, secret: secret || null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
