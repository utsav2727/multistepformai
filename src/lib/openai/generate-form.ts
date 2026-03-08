import { openai } from "./client";
import { FORM_GENERATION_SYSTEM_PROMPT } from "./prompts";
import { formSchemaSchema } from "@/lib/form-schema/validation";
import type { GenerateFormResponse } from "@/lib/form-schema/types";

const VALID_VALIDATION_TYPES = new Set([
  "required", "min_length", "max_length", "min", "max", "pattern", "file_size", "file_types",
]);

const VALID_CONJUNCTIONS = new Set(["and", "or"]);
const VALID_ACTIONS = new Set(["show", "hide", "skip_to_step", "require"]);
const VALID_OPERATORS = new Set([
  "equals", "not_equals", "contains", "not_contains", "greater_than", "less_than", "is_empty", "is_not_empty",
]);

function sanitizeSchema(schema: GenerateFormResponse["schema"]): GenerateFormResponse["schema"] {
  return {
    ...schema,
    steps: schema.steps.map((step) => ({
      ...step,
      fields: step.fields.map((field) => ({
        ...field,
        validation: (field.validation ?? []).filter(
          (rule) => rule && VALID_VALIDATION_TYPES.has(rule.type)
        ),
      })),
    })),
    logicRules: (schema.logicRules ?? []).filter((rule) => {
      if (!rule || !Array.isArray(rule.conditions)) return false;

      const validConditions = rule.conditions.every((c) =>
        c &&
        c.fieldId &&
        VALID_OPERATORS.has(c.operator) &&
        c.value !== null &&
        c.value !== undefined
      );

      return (
        validConditions &&
        VALID_CONJUNCTIONS.has(rule.conjunction) &&
        VALID_ACTIONS.has(rule.action) &&
        typeof rule.targetId === "string"
      );
    }),
  };
}

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
    model: "google/gemini-2.0-flash-001",
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
  if ((normalized as any).description === null) (normalized as any).description = "";
  normalized.schema = sanitizeSchema(normalized.schema);

  // Ensure each field has required arrays/defaults and handle nulls
  for (const step of normalized.schema.steps) {
    if ((step as any).id === null) {
      (step as any).id = `step_${Math.random().toString(36).slice(2, 10)}`;
    }
    if ((step as any).description === null) (step as any).description = undefined;
    if ((step as any).title === null) (step as any).title = "Untitled Step";

    for (const field of step.fields) {
      if ((field as any).id === null) {
        (field as any).id = `field_${Math.random().toString(36).slice(2, 10)}`;
      }
      if (!field.validation) field.validation = [];
      if (!field.options) field.options = undefined;

      // AI sometimes returns null for optional fields, which fails Zod validation
      if ((field as any).description === null) (field as any).description = undefined;
      if ((field as any).placeholder === null) (field as any).placeholder = undefined;
    }
  }
  if (normalized.suggestedTheme) {
    if ((normalized.suggestedTheme as any).primaryColor === null) {
      delete (normalized.suggestedTheme as any).primaryColor;
    }
    if ((normalized.suggestedTheme as any).fontFamily === null) {
      delete (normalized.suggestedTheme as any).fontFamily;
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
