"use client";

import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  {
    label: "Contact Form",
    prompt:
      "Create a professional contact form with name, email, phone, subject, and message fields",
  },
  {
    label: "Job Application",
    prompt:
      "Create a job application form with personal details, education, work experience, resume upload, and cover letter",
  },
  {
    label: "Customer Feedback",
    prompt:
      "Create a customer feedback survey with product rating, satisfaction score, and improvement suggestions",
  },
  {
    label: "Event Registration",
    prompt:
      "Create an event registration form with attendee details, ticket type selection, dietary preferences, and payment info",
  },
  {
    label: "Healthcare Intake",
    prompt:
      "Create a patient intake form with personal info, medical history, insurance details, and consent",
  },
  {
    label: "SaaS Onboarding",
    prompt:
      "Create a SaaS onboarding form with company info, team size, use case, and integration preferences",
  },
];

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Try a template:</p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button
            key={s.label}
            variant="outline"
            size="sm"
            onClick={() => onSelect(s.prompt)}
            className="text-xs transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
