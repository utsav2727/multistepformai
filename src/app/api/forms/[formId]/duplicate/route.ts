import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import mongoose from "mongoose";

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
    // Get original form
    const original = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!original) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Create duplicate
    const newForm = new Form({
      userId: session.user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      jsonSchema: original.jsonSchema,
      settings: original.settings,
      status: "draft",
      submissionCount: 0,
      viewCount: 0
    });

    await newForm.save();

    const mappedForm = {
      ...newForm.toObject(),
      id: (newForm as any)._id.toString(),
      schema: newForm.jsonSchema,
      submission_count: newForm.submissionCount,
      view_count: newForm.viewCount,
      created_at: newForm.createdAt,
      updated_at: newForm.updatedAt
    };

    return NextResponse.json(mappedForm, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
