import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import mongoose from "mongoose";
import { nanoid } from "nanoid";

export async function POST(
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
    // Get current form
    const form = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const isPublishing = form.status !== "published";

    const updateData: Record<string, unknown> = {
      status: isPublishing ? "published" : "draft",
    };

    if (isPublishing) {
      updateData.publishedAt = new Date();
      if (!form.slug) {
        updateData.slug = nanoid(10);
      }
    }

    const updatedForm = await Form.findOneAndUpdate(
      { _id: formId, userId: session.user.id },
      { $set: updateData },
      { new: true }
    );

    if (!updatedForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const mappedForm = {
      ...updatedForm.toObject(),
      id: (updatedForm as any)._id.toString(),
      schema: updatedForm.jsonSchema,
      submission_count: updatedForm.submissionCount,
      view_count: updatedForm.viewCount,
      created_at: updatedForm.createdAt,
      updated_at: updatedForm.updatedAt,
      published_at: updatedForm.publishedAt
    };

    return NextResponse.json(mappedForm);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
