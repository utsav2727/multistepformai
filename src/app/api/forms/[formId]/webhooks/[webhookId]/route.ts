import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Webhook } from "@/models/Webhook";
import mongoose from "mongoose";

// PATCH: update webhook (url, secret, enabled)
export async function PATCH(
  request: NextRequest,
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

    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (body.url !== undefined) update.url = body.url;
    if (body.secret !== undefined) update.secret = body.secret;
    if (body.enabled !== undefined) update.enabled = body.enabled;

    const webhook = await Webhook.findOneAndUpdate(
      { _id: webhookId, formId: form._id },
      { $set: update },
      { new: true }
    );

    if (!webhook) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...webhook.toObject(),
      id: (webhook as any)._id.toString(),
      form_id: formId,
      created_at: webhook.createdAt,
      updated_at: webhook.updatedAt
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: remove webhook
export async function DELETE(
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

    const result = await Webhook.deleteOne({ _id: webhookId, formId: form._id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
