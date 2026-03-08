import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import { Submission } from "@/models/Submission";
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
    // Get form to validate ownership and get field labels
    const form = await Form.findOne({ _id: formId, userId: session.user.id });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Get submissions
    const submissions = await Submission.find({
      formId: new mongoose.Types.ObjectId(formId),
      isComplete: true
    }).sort({ createdAt: -1 });

    // Build CSV
    const schema = form.jsonSchema as any;
    const fields = (schema?.steps || []).flatMap((step: any) => step.fields || []);
    const headers = ["Submitted At", ...fields.map((f: any) => f.label)];

    const rows = (submissions || []).map((sub) => {
      const data = sub.data as Record<string, unknown>;
      return [
        sub.createdAt.toISOString(),
        ...fields.map((f: any) => {
          const val = data[f.id];
          if (Array.isArray(val)) return val.join("; ");
          return String(val ?? "");
        }),
      ];
    });

    const csvContent = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${form.title || "submissions"}.csv"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
