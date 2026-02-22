import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const supabase = createAdminClient();

  const { data: form } = await supabase
    .from("forms")
    .select("id, schema, settings, status")
    .eq("id", formId)
    .eq("status", "published")
    .single();

  if (!form) {
    return NextResponse.json(
      { error: "Form not found or not published" },
      { status: 404, headers: corsHeaders }
    );
  }

  return NextResponse.json(
    { schema: form.schema, settings: form.settings },
    { headers: corsHeaders }
  );
}
