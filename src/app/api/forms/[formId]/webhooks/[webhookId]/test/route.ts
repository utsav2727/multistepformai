import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { fireWebhook } from "@/lib/notifications/fire-webhook";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string; webhookId: string }> }
) {
  const { formId, webhookId } = await params;
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: webhook } = await supabase
    .from("webhooks")
    .select("url, secret")
    .eq("id", webhookId)
    .eq("form_id", formId)
    .single();

  if (!webhook) return NextResponse.json({ error: "Webhook not found" }, { status: 404 });

  const result = await fireWebhook(
    webhook.url,
    {
      event: "form.submission",
      formId,
      submissionId: "test-" + Date.now(),
      data: { example_field: "Test value" },
      metadata: { test: true },
      submittedAt: new Date().toISOString(),
    },
    webhook.secret,
    1 // single attempt for test
  );

  return NextResponse.json(result);
}
