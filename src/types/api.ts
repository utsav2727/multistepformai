import type { FormSchema, FormSettings } from "@/lib/form-schema/types";

export interface CreateFormRequest {
  title?: string;
  description?: string;
  schema?: FormSchema;
  settings?: Partial<FormSettings>;
}

export interface UpdateFormRequest {
  title?: string;
  description?: string;
  schema?: FormSchema;
  settings?: Partial<FormSettings>;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface FormListItem {
  id: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  submission_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}
