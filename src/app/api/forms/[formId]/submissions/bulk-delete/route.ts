import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";
import mongoose from "mongoose";

export async function POST(
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

  await connectDB();
  try {
    // Verify form ownership
    const form = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    // Validate all submission IDs
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return NextResponse.json({ error: "No valid submission IDs provided" }, { status: 400 });
    }

    const result = await Submission.deleteMany({
      formId: new mongoose.Types.ObjectId(formId),
      _id: { $in: validIds.map(id => new mongoose.Types.ObjectId(id)) }
    });

    // Update form submission count
    if (result.deletedCount > 0) {
      await Form.findByIdAndUpdate(formId, {
        $inc: { submissionCount: -result.deletedCount }
      });
    }

    return NextResponse.json({ success: true, deleted: result.deletedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
