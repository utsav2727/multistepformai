import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH: update webhook (url, secret, enabled)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string; webhookId: string }> }
) {
  const { formId, webhookId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (body.url !== undefined) update.url = body.url;
  if (body.secret !== undefined) update.secret = body.secret;
  if (body.enabled !== undefined) update.enabled = body.enabled;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("webhooks")
    .update(update)
    .eq("id", webhookId)
    .eq("form_id", formId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE: remove webhook
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string; webhookId: string }> }
) {
  const { formId, webhookId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { error } = await admin
    .from("webhooks")
    .delete()
    .eq("id", webhookId)
    .eq("form_id", formId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
