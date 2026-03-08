import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Webhook, WebhookLog } from "@/models/Webhook";
import mongoose from "mongoose";

export async function GET(
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
    // Verify form ownership
    const form = await Form.findOne({ _id: formId, userId: session.user.id });
    if (!form) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Verify webhook belongs to this form
    const webhook = await Webhook.findOne({ _id: webhookId, formId: form._id });
    if (!webhook) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const logs = await WebhookLog.find({ webhookId: webhook._id })
      .select("statusCode success error attempt createdAt")
      .sort({ createdAt: -1 })
      .limit(50);

    const mappedLogs = logs.map(log => ({
      id: (log as any)._id.toString(),
      status_code: log.statusCode,
      success: log.success,
      error: log.error,
      attempt: log.attempt,
      created_at: log.createdAt
    }));

    return NextResponse.json(mappedLogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
