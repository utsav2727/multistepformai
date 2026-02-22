import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { nanoid } from "nanoid";

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

  // Get current form
  const { data: form } = await supabase
    .from("forms")
    .select("status, slug")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const isPublishing = form.status !== "published";

  const updateData: Record<string, unknown> = {
    status: isPublishing ? "published" : "draft",
  };

  if (isPublishing) {
    updateData.published_at = new Date().toISOString();
    if (!form.slug) {
      updateData.slug = nanoid(10);
    }
  }

  const { data, error } = await supabase
    .from("forms")
    .update(updateData)
    .eq("id", formId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
