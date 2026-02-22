import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

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

  // Get form to validate ownership and get field labels
  const { data: form } = await supabase
    .from("forms")
    .select("title, schema")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();

  if (!form) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  // Get submissions
  const { data: submissions, error } = await supabase
    .from("submissions")
    .select("data, created_at")
    .eq("form_id", formId)
    .eq("is_complete", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const schema = form.schema as { steps: Array<{ fields: Array<{ id: string; label: string }> }> };
  const fields = schema.steps.flatMap((step) => step.fields);
  const headers = ["Submitted At", ...fields.map((f) => f.label)];

  const rows = (submissions || []).map((sub) => {
    const data = sub.data as Record<string, unknown>;
    return [
      sub.created_at,
      ...fields.map((f) => {
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
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
