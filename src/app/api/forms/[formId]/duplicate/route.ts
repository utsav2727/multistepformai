import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
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

  // Get original form
  const { data: original } = await supabase
    .from("forms")
    .select("title, description, schema, settings")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();

  if (!original) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Create duplicate
  const { data, error } = await supabase
    .from("forms")
    .insert({
      user_id: user.id,
      title: `${original.title} (Copy)`,
      description: original.description,
      schema: original.schema,
      settings: original.settings,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
