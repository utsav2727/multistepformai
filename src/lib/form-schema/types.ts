export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "textarea"
  | "number"
  | "date"
  | "dropdown"
  | "multi_select"
  | "radio"
  | "checkbox"
  | "file_upload"
  | "rating";

export interface ValidationRule {
  type:
    | "required"
    | "min_length"
    | "max_length"
    | "min"
    | "max"
    | "pattern"
    | "file_size"
    | "file_types";
  value: string | number | boolean;
  message: string;
}

export type LogicOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export interface LogicCondition {
  fieldId: string;
  operator: LogicOperator;
  value: string | number | boolean | string[];
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conjunction: "and" | "or";
  action: "show" | "hide" | "skip_to_step" | "require";
  targetId: string;
}

export interface FieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  required: boolean;
  validation: ValidationRule[];
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  ratingMax?: number;
  ratingIcon?: "star" | "heart" | "thumb";
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  rows?: number;
  width?: "full" | "half";
  logicRules?: LogicRule[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  logicRules?: LogicRule[];
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  logoUrl?: string;
}

export interface FormSettings {
  theme: FormTheme;
  behavior: {
    showProgressBar: boolean;
    showStepNumbers: boolean;
    submitButtonText: string;
    successMessage: string;
    successRedirectUrl: string | null;
    autoSaveProgress: boolean;
  };
  notifications: {
    emailOnSubmission: boolean;
    notificationEmail: string | null;
  };
}

export interface FormSchema {
  version: "1.0";
  steps: FormStep[];
  logicRules: LogicRule[];
}

export interface Form {
  id: string;
  userId: string;
  title: string;
  description: string;
  schema: FormSchema;
  settings: FormSettings;
  status: "draft" | "published" | "archived";
  slug: string | null;
  submissionCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export type SubmissionValue =
  | string
  | number
  | boolean
  | string[]
  | null;

export interface SubmissionData {
  [fieldId: string]: SubmissionValue;
}

export interface SubmissionMetadata {
  userAgent: string;
  referrer: string | null;
  startedAt: string;
  completedAt: string;
  duration: number;
}

export interface Submission {
  id: string;
  formId: string;
  data: SubmissionData;
  metadata: SubmissionMetadata;
  completedStep: number | null;
  isComplete: boolean;
  createdAt: string;
}

export interface GenerateFormRequest {
  prompt: string;
  context?: string;
}

export interface GenerateFormResponse {
  title: string;
  description: string;
  schema: FormSchema;
  suggestedTheme?: Partial<FormTheme>;
}
