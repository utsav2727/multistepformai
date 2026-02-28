import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
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

  // Verify form ownership
  const { data: form } = await supabase
    .from("forms")
    .select("id")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  const { error } = await supabase
    .from("submissions")
    .delete()
    .eq("form_id", formId)
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, deleted: ids.length });
}
