import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import mongoose from "mongoose";

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
    const form = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const mappedForm = {
      ...form.toObject(),
      id: (form as any)._id.toString(),
      schema: form.jsonSchema,
      submission_count: form.submissionCount,
      view_count: form.viewCount,
      created_at: form.createdAt,
      updated_at: form.updatedAt
    };

    return NextResponse.json(mappedForm);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
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

  const body = await request.json();

  await connectDB();
  try {
    const updateData: Record<string, unknown> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.schema !== undefined) updateData.jsonSchema = body.schema;
    if (body.settings !== undefined) updateData.settings = body.settings;
    if (body.status !== undefined) updateData.status = body.status;

    const form = await Form.findOneAndUpdate(
      { _id: formId, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const mappedForm = {
      ...form.toObject(),
      id: (form as any)._id.toString(),
      schema: form.jsonSchema,
      submission_count: form.submissionCount,
      view_count: form.viewCount,
      created_at: form.createdAt,
      updated_at: form.updatedAt
    };

    return NextResponse.json(mappedForm);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const result = await Form.deleteOne({ _id: formId, userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
