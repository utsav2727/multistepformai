import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
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

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return NextResponse.json(
      { error: "Invalid Form ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  await connectDB();
  try {
    const form = await Form.findOne({
      _id: formId,
      status: "published"
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found or not published" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { schema: form.jsonSchema, settings: form.settings },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
