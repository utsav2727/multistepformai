import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Webhook } from "@/models/Webhook";
import mongoose from "mongoose";

// GET: list webhooks for a form
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
  }

  await connectDB();
  try {
    // Verify ownership
    const form = await Form.findOne({ _id: formId, userId: session.user.id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const webhooks = await Webhook.find({ formId: form._id })
      .sort({ createdAt: -1 });

    const mappedWebhooks = webhooks.map(w => ({
      ...w.toObject(),
      id: (w as any)._id.toString(),
      form_id: formId,
      created_at: w.createdAt,
      updated_at: w.updatedAt
    }));

    return NextResponse.json(mappedWebhooks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: create a webhook
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json({ error: "Invalid Form ID" }, { status: 400 });
  }

  await connectDB();
  try {
    // Verify ownership
    const form = await Form.findOne({ _id: formId, userId: session.user.id });
    if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

    const { url, secret } = await request.json();
    if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

    const newWebhook = new Webhook({
      formId: form._id,
      url,
      secret: secret || undefined,
      enabled: true
    });

    await newWebhook.save();

    const savedWebhook = newWebhook.toObject();
    return NextResponse.json({
      ...savedWebhook,
      id: (newWebhook as any)._id.toString(),
      form_id: formId,
      created_at: newWebhook.createdAt,
      updated_at: newWebhook.updatedAt
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
