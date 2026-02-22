export const PLAN_LIMITS = {
  free: { maxForms: 3, aiGenerations: 10 },
  pro: { maxForms: Infinity, aiGenerations: Infinity },
  growth: { maxForms: Infinity, aiGenerations: Infinity },
} as const;

export const APP_NAME = "formAI";
export const APP_DESCRIPTION =
  "AI-powered multi-step form builder for modern websites";
