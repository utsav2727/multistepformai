import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { FLOW_OPTIMIZE_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { z } from "zod";

const requestSchema = z.object({
  formSchema: z.object({
    steps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional().nullable(),
      fields: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        required: z.boolean().optional(),
      })),
    })),
  }),
  formTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { formSchema, formTitle } = parsed.data;

  const allFields = formSchema.steps.flatMap((s) =>
    s.fields.map((f) => `[${f.id}] ${f.label} (${f.type})${f.required ? " *required" : ""}`)
  );

  const userMessage = `Form: "${formTitle || "Untitled Form"}"

All fields:
${allFields.join("\n")}

Current steps:
${formSchema.steps.map((s, i) =>
  `Step ${i + 1} [${s.id}]: "${s.title}" — ${s.fields.map((f) => f.id).join(", ")}`
).join("\n")}

Suggest an optimized step grouping for better completion rates.`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: FLOW_OPTIMIZE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI optimize flow error:", error);
    return NextResponse.json({ error: "Failed to optimize flow" }, { status: 500 });
  }
}
