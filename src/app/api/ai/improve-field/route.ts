import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai/client";
import { FIELD_IMPROVE_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { z } from "zod";

const requestSchema = z.object({
  field: z.object({
    id: z.string(),
    type: z.string(),
    label: z.string(),
    description: z.string().optional().nullable(),
    placeholder: z.string().optional().nullable(),
  }),
  tone: z.enum(["friendly", "corporate", "startup", "medical"]),
  formTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { field, tone, formTitle } = parsed.data;

  const userMessage = `Form: "${formTitle || "Untitled Form"}"
Field type: ${field.type}
Current label: ${field.label}
Current description: ${field.description || "none"}
Current placeholder: ${field.placeholder || "none"}
Desired tone: ${tone}

Improve this field's copy.`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: FIELD_IMPROVE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const result = JSON.parse(content);
    return NextResponse.json({ improvement: result });
  } catch (error) {
    console.error("AI field improve error:", error);
    return NextResponse.json({ error: "Failed to improve field" }, { status: 500 });
  }
}
