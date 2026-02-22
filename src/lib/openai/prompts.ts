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
