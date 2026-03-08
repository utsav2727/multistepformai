import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { openai } from "@/lib/openai/client";
import { LOGIC_GENERATE_SYSTEM_PROMPT } from "@/lib/openai/prompts";
import { z } from "zod";

const requestSchema = z.object({
  instruction: z.string().min(5).max(500),
  formSchema: z.object({
    steps: z.array(z.object({
      id: z.string(),
      title: z.string(),
      fields: z.array(z.object({
        id: z.string(),
        type: z.string(),
        label: z.string(),
        options: z.array(z.object({ id: z.string(), label: z.string(), value: z.string() })).optional(),
      })),
    })),
  }),
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

  const { instruction, formSchema } = parsed.data;

  // Build form context string
  const formContext = formSchema.steps.map((step, i) => {
    const fields = step.fields.map((f) => {
      const opts = f.options?.map((o) => o.value).join(", ");
      return `  - [${f.id}] ${f.label} (${f.type})${opts ? `: options=[${opts}]` : ""}`;
    }).join("\n");
    return `Step ${i + 1}: [${step.id}] "${step.title}"\n${fields}`;
  }).join("\n\n");

  const userMessage = `Form structure:\n${formContext}\n\nInstruction: "${instruction}"`;

  try {
    const response = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: LOGIC_GENERATE_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Empty response from AI");

    const result = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AI logic generate error:", error);
    return NextResponse.json({ error: "Failed to generate logic" }, { status: 500 });
  }
}
