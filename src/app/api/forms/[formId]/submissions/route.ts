import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FormSettings, FormSchema } from "@/lib/form-schema/types";
import { fireWebhook } from "@/lib/notifications/fire-webhook";
import { sendSubmissionNotification } from "@/lib/notifications/send-email";
import { sendSlackNotification } from "@/lib/notifications/send-slack";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = createAdminClient();

  // Verify form exists and is published
  const { data: form } = await supabase
    .from("forms")
    .select("id, title, status, schema, settings, user_id")
    .eq("id", formId)
    .eq("status", "published")
    .single();

  if (!form) {
    return NextResponse.json(
      { error: "Form not found or not published" },
      { status: 404, headers: corsHeaders }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      form_id: formId,
      data: body.data,
      metadata: body.metadata || {},
      is_complete: body.isComplete ?? true,
      completed_step: body.completedStep ?? null,
    })
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  // Fire notifications in background (don't block response)
  if (body.isComplete !== false) {
    const schema = form.schema as FormSchema;
    const settings = form.settings as FormSettings;
    const submittedAt = data.created_at as string;

    (async () => {
      // 1. Email notification
      if (settings.notifications?.emailOnSubmission && settings.notifications?.notificationEmail) {
        try {
          await sendSubmissionNotification({
            toEmail: settings.notifications.notificationEmail,
            formTitle: form.title as string,
            formId,
            schema,
            data: body.data,
            submittedAt,
          });
        } catch (e) {
          console.error("[Email notification failed]", e);
        }
      }

      // 2. Custom webhooks
      const { data: webhooks } = await supabase
        .from("webhooks")
        .select("id, url, secret")
        .eq("form_id", formId)
        .eq("enabled", true);

      for (const wh of webhooks ?? []) {
        const result = await fireWebhook(
          wh.url as string,
          {
            event: "form.submission",
            formId,
            submissionId: data.id,
            data: body.data,
            metadata: body.metadata || {},
            submittedAt,
          },
          wh.secret as string | null
        );
        await supabase.from("webhook_logs").insert({
          webhook_id: wh.id,
          submission_id: data.id,
          status_code: result.statusCode ?? null,
          success: result.success,
          error: result.error ?? null,
          attempt: result.attempt,
        });
      }

      // 3. Slack notification
      const slackUrl = settings.notifications?.slackWebhookUrl;
      if (slackUrl) {
        try {
          await sendSlackNotification({
            webhookUrl: slackUrl,
            formTitle: form.title as string,
            formId,
            schema,
            data: body.data,
            submittedAt,
          });
        } catch (e) {
          console.error("[Slack notification failed]", e);
        }
      }
    })();
  }

  return NextResponse.json(
    { id: data.id, success: true },
    { status: 201, headers: corsHeaders }
  );
}
