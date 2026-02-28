import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string; webhookId: string }> }
) {
  const { formId, webhookId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify webhook belongs to this form + user
  const { data: webhook } = await supabase
    .from("webhooks")
    .select("id")
    .eq("id", webhookId)
    .eq("form_id", formId)
    .single();
  if (!webhook) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase
    .from("webhook_logs")
    .select("id, status_code, success, error, attempt, created_at")
    .eq("webhook_id", webhookId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
