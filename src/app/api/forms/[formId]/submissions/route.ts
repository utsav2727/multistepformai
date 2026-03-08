import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";
import { Webhook, WebhookLog } from "@/models/Webhook";
import type { FormSettings, FormSchema } from "@/lib/form-schema/types";
import { fireWebhook } from "@/lib/notifications/fire-webhook";
import { sendSubmissionNotification } from "@/lib/notifications/send-email";
import { sendSlackNotification } from "@/lib/notifications/send-slack";
import mongoose from "mongoose";

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
  }

  await connectDB();
  try {
    const submissions = await Submission.find({ formId: new mongoose.Types.ObjectId(formId) })
      .sort({ createdAt: -1 });

    const mappedSubmissions = submissions.map(s => ({
      ...s.toObject(),
      id: (s as any)._id.toString(),
      form_id: s.formId.toString(),
      is_complete: s.isComplete,
      completed_step: s.completedStep,
      created_at: s.createdAt
    }));

    return NextResponse.json(mappedSubmissions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json(
      { error: "Invalid Form ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  await connectDB();

  // Verify form exists and is published
  const form = await Form.findOne({ _id: formId, status: "published" });

  if (!form) {
    return NextResponse.json(
      { error: "Form not found or not published" },
      { status: 404, headers: corsHeaders }
    );
  }

  const body = await request.json();

  try {
    const newSubmission = new Submission({
      formId: new mongoose.Types.ObjectId(formId),
      data: body.data,
      metadata: body.metadata || {},
      isComplete: body.isComplete ?? true,
      completedStep: body.completedStep ?? null,
    });

    await newSubmission.save();
    const submissionId = (newSubmission as any)._id.toString();
    const submittedAt = newSubmission.createdAt.toISOString();

    // Fire notifications in background (don't block response)
    if (newSubmission.isComplete !== false) {
      const schema = form.jsonSchema as FormSchema;
      const settings = form.settings as FormSettings;

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
        const webhooks = await Webhook.find({ formId, enabled: true });

        for (const wh of webhooks) {
          const result = await fireWebhook(
            wh.url as string,
            {
              event: "form.submission",
              formId,
              submissionId,
              data: body.data,
              metadata: body.metadata || {},
              submittedAt,
            },
            wh.secret as string | null
          );

          await WebhookLog.create({
            webhookId: wh._id,
            submissionId: newSubmission._id,
            statusCode: result.statusCode ?? null,
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
      { id: submissionId, success: true },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
