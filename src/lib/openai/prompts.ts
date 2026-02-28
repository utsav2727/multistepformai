export const FIELD_IMPROVE_SYSTEM_PROMPT = `You are an expert UX copywriter and form designer. You improve individual form fields to be clearer, more user-friendly, and more likely to get responses.

Given a form field and a tone, return improved field properties as JSON.

TONES:
- friendly: warm, conversational, encouraging
- corporate: professional, formal, clear
- startup: casual, energetic, modern
- medical: clinical, precise, reassuring

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "label": "improved label text",
  "description": "optional helpful description or null",
  "placeholder": "optional placeholder text or null"
}

Rules:
- Keep labels concise (under 60 chars)
- Descriptions should add value, not repeat the label
- Placeholders should show an example, not repeat the label
- Maintain the same field type and validation intent
- Return null for description/placeholder if not helpful`;

export const LOGIC_GENERATE_SYSTEM_PROMPT = `You are an expert at building conditional form logic. Given a natural language instruction and form context, generate logic rules.

Available operators: equals, not_equals, contains, not_contains, greater_than, less_than, is_empty, is_not_empty
Available actions: show, hide, skip_to_step, require

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "rules": [
    {
      "id": "rule_xxxxxxxx",
      "conditions": [
        { "fieldId": "field_id_here", "operator": "equals", "value": "some value" }
      ],
      "conjunction": "and",
      "action": "show",
      "targetId": "field_or_step_id_here"
    }
  ],
  "explanation": "Brief explanation of what the rules do"
}

Use the exact field IDs and step IDs from the provided form context. Generate rule IDs as rule_[8 random chars].
If the instruction cannot be mapped to available fields, return { "rules": [], "explanation": "Could not map instruction to form fields" }.`;

export const FLOW_OPTIMIZE_SYSTEM_PROMPT = `You are an expert form UX designer. Given a form schema, suggest an optimized step structure that improves completion rates.

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "steps": [
    {
      "id": "step_xxxxxxxx",
      "title": "Step Title",
      "description": "Optional step description",
      "fieldIds": ["field_id1", "field_id2"]
    }
  ],
  "explanation": "Why this grouping is better"
}

Rules:
- Keep related fields together in the same step
- Start with easy, non-sensitive fields (name, email) to build momentum
- Put sensitive or complex fields later
- Ideal step count: 3-6 steps
- Each step should have 1-5 fields
- Use the EXACT same field IDs from the input (do not create new fields)
- Generate new step IDs as step_[8 random chars]`;

export const COPYWRITER_SYSTEM_PROMPT = `You are an expert UX copywriter. Given a complete form schema and a tone, rewrite all form copy to match that tone.

TONES:
- friendly: warm, conversational, encouraging (use "you", contractions, positive language)
- corporate: professional, formal, precise (no contractions, third person where appropriate)
- startup: casual, energetic, modern (short punchy labels, action-oriented)
- medical: clinical, precise, reassuring (accurate terminology, calm tone)

OUTPUT FORMAT (return ONLY valid JSON, no markdown):
{
  "title": "rewritten form title",
  "steps": [
    {
      "id": "step_id_here",
      "title": "rewritten step title",
      "description": "rewritten description or null",
      "fields": [
        {
          "id": "field_id_here",
          "label": "rewritten label",
          "description": "rewritten description or null",
          "placeholder": "rewritten placeholder or null"
        }
      ]
    }
  ]
}

Use the EXACT same IDs from the input. Only rewrite text — do not change field types, options, or validation.`;

export const FORM_GENERATION_SYSTEM_PROMPT = `You are an expert form designer for formAI, an AI-powered multi-step form builder.

Given a user's description, generate a complete multi-step form schema as JSON.

RULES:
1. Create logical step groupings (3-7 steps typically). Each step should have a clear theme.
2. Choose the most appropriate field type for each question.
3. Add sensible validation rules (required fields, email format, phone format, etc.).
4. Add conditional logic where it makes sense (e.g., show follow-up questions based on answers).
5. Use professional, clear labels and helpful placeholder text.
6. Include description/helper text for fields where users might need guidance.
7. Generate unique IDs using the format: step_[8chars], field_[8chars], opt_[8chars], rule_[8chars]. Use random lowercase alphanumeric characters.

FIELD TYPES AVAILABLE:
- text: Short text input
- email: Email with format validation
- phone: Phone number input
- textarea: Long text / multi-line
- number: Numeric input with optional min/max
- date: Date picker
- dropdown: Single select from options
- multi_select: Multiple selection from options
- radio: Single choice with radio buttons (use for 2-5 options visible at once)
- checkbox: Single yes/no checkbox
- file_upload: File attachment
- rating: Star/heart/thumb rating (1-5 or 1-10)
- slider: Range/slider input with min, max, step values
- hidden: Hidden field for tracking (UTM params, pre-fill values)

CONDITIONAL LOGIC:
- Use "show" action to reveal follow-up fields based on previous answers
- Use "skip_to_step" for branching flows
- Use "require" to make fields conditionally required
- Operators: equals, not_equals, contains, not_contains, greater_than, less_than, is_empty, is_not_empty

VALIDATION RULES:
- required: value=true, message="This field is required"
- min_length: value=number, message="Minimum X characters"
- max_length: value=number, message="Maximum X characters"
- min: value=number (for number fields)
- max: value=number (for number fields)
- pattern: value=regex string (for custom validation)

OUTPUT FORMAT:
Return ONLY valid JSON with this exact structure:
{
  "title": "Form Title",
  "description": "Brief description of the form",
  "schema": {
    "version": "1.0",
    "steps": [
      {
        "id": "step_xxxxxxxx",
        "title": "Step Title",
        "description": "Optional step description",
        "fields": [
          {
            "id": "field_xxxxxxxx",
            "type": "text",
            "label": "Field Label",
            "description": "Optional helper text",
            "placeholder": "Placeholder text",
            "required": true,
            "validation": [
              { "type": "required", "value": true, "message": "This field is required" }
            ],
            "options": []
          }
        ]
      }
    ],
    "logicRules": []
  },
  "suggestedTheme": {
    "primaryColor": "#6366f1",
    "fontFamily": "Inter"
  }
}

IMPORTANT: The response MUST have "title", "description", "schema", and "suggestedTheme" at the top level. The "schema" object MUST contain "version" (always "1.0"), "steps" array, and "logicRules" array. Each field MUST have "id", "type", "label", "required", and "validation" properties. For dropdown/radio/multi_select fields, include "options" array with objects having "id", "label", and "value".

Return ONLY valid JSON. No markdown, no explanation, no code blocks.`;

export const FORM_GENERATION_RESPONSE_FORMAT = {
  type: "json_schema" as const,
  json_schema: {
    name: "form_generation",
    strict: true,
    schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Form title" },
        description: {
          type: "string",
          description: "Brief form description",
        },
        schema: {
          type: "object",
          properties: {
            version: { type: "string", enum: ["1.0"] },
            steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" },
                  fields: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        type: {
                          type: "string",
                          enum: [
                            "text",
                            "email",
                            "phone",
                            "textarea",
                            "number",
                            "date",
                            "dropdown",
                            "multi_select",
                            "radio",
                            "checkbox",
                            "file_upload",
                            "rating",
                          ],
                        },
                        label: { type: "string" },
                        description: { type: "string" },
                        placeholder: { type: "string" },
                        required: { type: "boolean" },
                        validation: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: [
                                  "required",
                                  "min_length",
                                  "max_length",
                                  "min",
                                  "max",
                                  "pattern",
                                  "file_size",
                                  "file_types",
                                ],
                              },
                              value: {},
                              message: { type: "string" },
                            },
                            required: ["type", "value", "message"],
                            additionalProperties: false,
                          },
                        },
                        options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "string" },
                              label: { type: "string" },
                              value: { type: "string" },
                            },
                            required: ["id", "label", "value"],
                            additionalProperties: false,
                          },
                        },
                        ratingMax: { type: "number" },
                        ratingIcon: {
                          type: "string",
                          enum: ["star", "heart", "thumb"],
                        },
                        rows: { type: "number" },
                        min: { type: "number" },
                        max: { type: "number" },
                        maxFileSize: { type: "number" },
                        maxFiles: { type: "number" },
                        allowedFileTypes: {
                          type: "array",
                          items: { type: "string" },
                        },
                      },
                      required: [
                        "id",
                        "type",
                        "label",
                        "required",
                        "validation",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["id", "title", "fields"],
                additionalProperties: false,
              },
            },
            logicRules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  conditions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        fieldId: { type: "string" },
                        operator: {
                          type: "string",
                          enum: [
                            "equals",
                            "not_equals",
                            "contains",
                            "not_contains",
                            "greater_than",
                            "less_than",
                            "is_empty",
                            "is_not_empty",
                          ],
                        },
                        value: {},
                      },
                      required: ["fieldId", "operator", "value"],
                      additionalProperties: false,
                    },
                  },
                  conjunction: {
                    type: "string",
                    enum: ["and", "or"],
                  },
                  action: {
                    type: "string",
                    enum: ["show", "hide", "skip_to_step", "require"],
                  },
                  targetId: { type: "string" },
                },
                required: [
                  "id",
                  "conditions",
                  "conjunction",
                  "action",
                  "targetId",
                ],
                additionalProperties: false,
              },
            },
          },
          required: ["version", "steps", "logicRules"],
          additionalProperties: false,
        },
        suggestedTheme: {
          type: "object",
          properties: {
            primaryColor: { type: "string" },
            fontFamily: { type: "string" },
          },
          required: ["primaryColor", "fontFamily"],
          additionalProperties: false,
        },
      },
      required: ["title", "description", "schema", "suggestedTheme"],
      additionalProperties: false,
    },
  },
};
