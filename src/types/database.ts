export interface DbProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro" | "growth";
  forms_count: number;
  created_at: string;
  updated_at: string;
}

export interface DbForm {
  id: string;
  user_id: string;
  title: string;
  description: string;
  schema: Record<string, unknown>;
  settings: Record<string, unknown>;
  status: "draft" | "published" | "archived";
  slug: string | null;
  submission_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface DbSubmission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  metadata: Record<string, unknown>;
  completed_step: number | null;
  is_complete: boolean;
  created_at: string;
}
