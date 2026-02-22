import { z } from "zod";

export const fieldTypeEnum = z.enum([
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
]);

export const validationRuleSchema = z.object({
  type: z.enum([
    "required",
    "min_length",
    "max_length",
    "min",
    "max",
    "pattern",
    "file_size",
    "file_types",
  ]),
  value: z.union([z.string(), z.number(), z.boolean()]),
  message: z.string(),
});

export const logicConditionSchema = z.object({
  fieldId: z.string(),
  operator: z.enum([
    "equals",
    "not_equals",
    "contains",
    "not_contains",
    "greater_than",
    "less_than",
    "is_empty",
    "is_not_empty",
  ]),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
  ]),
});

export const logicRuleSchema = z.object({
  id: z.string(),
  conditions: z.array(logicConditionSchema),
  conjunction: z.enum(["and", "or"]),
  action: z.enum(["show", "hide", "skip_to_step", "require"]),
  targetId: z.string(),
});

export const fieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
});

export const formFieldSchema = z.object({
  id: z.string(),
  type: fieldTypeEnum,
  label: z.string().min(1),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean(),
  validation: z.array(validationRuleSchema),
  options: z.array(fieldOptionSchema).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
  ratingMax: z.number().optional(),
  ratingIcon: z.enum(["star", "heart", "thumb"]).optional(),
  allowedFileTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().optional(),
  maxFiles: z.number().optional(),
  rows: z.number().optional(),
  width: z.enum(["full", "half"]).optional(),
  logicRules: z.array(logicRuleSchema).optional(),
});

export const formStepSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(formFieldSchema).min(1),
  logicRules: z.array(logicRuleSchema).optional(),
});

export const formSchemaSchema = z.object({
  version: z.literal("1.0"),
  steps: z.array(formStepSchema).min(1),
  logicRules: z.array(logicRuleSchema),
});

export const generateFormRequestSchema = z.object({
  prompt: z.string().min(10).max(2000),
  context: z.string().max(1000).optional(),
});
