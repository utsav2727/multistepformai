import { openai } from "./client";
import { FORM_GENERATION_SYSTEM_PROMPT } from "./prompts";
import { formSchemaSchema } from "@/lib/form-schema/validation";
import type { GenerateFormResponse } from "@/lib/form-schema/types";

function normalizeResponse(raw: Record<string, unknown>): GenerateFormResponse {
  // If the response already has the correct structure
  if (raw.title && raw.schema && typeof raw.schema === "object") {
    return raw as unknown as GenerateFormResponse;
  }

  // If the model returned steps at the top level (flat structure)
  if (raw.steps && Array.isArray(raw.steps)) {
    return {
      title: (raw.title as string) || "Untitled Form",
      description: (raw.description as string) || "",
      schema: {
        version: "1.0",
        steps: raw.steps as GenerateFormResponse["schema"]["steps"],
        logicRules: (raw.logicRules as GenerateFormResponse["schema"]["logicRules"]) || [],
      },
      suggestedTheme: (raw.suggestedTheme as GenerateFormResponse["suggestedTheme"]) || {
        primaryColor: "#6366f1",
        fontFamily: "Inter",
      },
    };
  }

  // If wrapped in a "form" key
  if (raw.form && typeof raw.form === "object") {
    return normalizeResponse(raw.form as Record<string, unknown>);
  }

  throw new Error("Unrecognized AI response structure");
}

export async function generateForm(
  prompt: string,
  context?: string
): Promise<GenerateFormResponse> {
  const userMessage = context
    ? `${prompt}\n\nAdditional context: ${context}`
    : prompt;

  const response = await openai.chat.completions.create({
    model: "arcee-ai/trinity-large-preview:free",
    messages: [
      { role: "system", content: FORM_GENERATION_SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 8000,
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("Empty response from AI");

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("Failed to parse AI response as JSON:", content.slice(0, 500));
    throw new Error("AI returned invalid JSON. Please try again.");
  }

  console.log("AI response keys:", Object.keys(parsed));

  const normalized = normalizeResponse(parsed);

  // Ensure each field has required arrays/defaults
  for (const step of normalized.schema.steps) {
    for (const field of step.fields) {
      if (!field.validation) field.validation = [];
      if (!field.options) field.options = undefined;
    }
  }
  if (!normalized.schema.logicRules) {
    normalized.schema.logicRules = [];
  }

  // Validate the generated schema
  const validation = formSchemaSchema.safeParse(normalized.schema);
  if (!validation.success) {
    console.error("Schema validation failed:", JSON.stringify(validation.error.format(), null, 2));
    console.error("Normalized schema keys:", Object.keys(normalized.schema));
    console.error("First step:", JSON.stringify(normalized.schema.steps?.[0], null, 2).slice(0, 500));
    throw new Error("AI generated an invalid form schema. Please try again.");
  }

  return normalized;
}
