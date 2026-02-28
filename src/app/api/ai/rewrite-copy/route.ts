import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/client";
import { COPYWRITER_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { z } from "zod";

const requestSchema = z.object({
  tone: z.enum(["friendly", "corporate", "startup", "medical"]),
  formTitle: z.string(),
  formSchema: z.object({
    steps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional().nullable(),
      fields: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        description: z.string().optional().nullable(),
        placeholder: z.string().optional().nullable(),
      })),
    })),
  }),
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

  const { tone, formTitle, formSchema } = parsed.data;

  const userMessage = `Tone: ${tone}
Form title: "${formTitle}"
Schema: ${JSON.stringify(formSchema, null, 2)}

Rewrite all copy in the ${tone} tone.`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: COPYWRITER_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI rewrite copy error:", error);
    return NextResponse.json({ error: "Failed to rewrite copy" }, { status: 500 });
  }
}
