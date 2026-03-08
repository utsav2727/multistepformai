import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Webhook } from "@/models/Webhook";
import { fireWebhook } from "@/lib/notifications/fire-webhook";
import mongoose from "mongoose";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string; webhookId: string }> }
) {
  const { formId, webhookId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(formId) || !mongoose.Types.ObjectId.isValid(webhookId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await connectDB();
  try {
    // Verify ownership
    const form = await Form.findOne({ _id: formId, userId: session.user.id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const webhook = await Webhook.findOne({ _id: webhookId, formId: form._id });
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
      webhook.secret || undefined,
      1 // single attempt for test
    );

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
