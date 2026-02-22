import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("form_id", formId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params;
  const supabase = createAdminClient();

  // Verify form exists and is published
  const { data: form } = await supabase
    .from("forms")
    .select("id, status")
    .eq("id", formId)
    .eq("status", "published")
    .single();

  if (!form) {
    return NextResponse.json(
      { error: "Form not found or not published" },
      { status: 404, headers: corsHeaders }
    );
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("submissions")
    .insert({
      form_id: formId,
      data: body.data,
      metadata: body.metadata || {},
      is_complete: body.isComplete ?? true,
      completed_step: body.completedStep ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
  return NextResponse.json(
    { id: data.id, success: true },
    { status: 201, headers: corsHeaders }
  );
}
