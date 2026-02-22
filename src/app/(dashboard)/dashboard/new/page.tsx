"use client";

import { Topbar } from "@/components/dashboard/topbar";
import { PromptInput } from "@/components/ai/prompt-input";

export default function NewFormPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="New Form" />
      <div className="flex-1 flex items-start justify-center p-4 sm:p-6">
        <div className="w-full max-w-2xl space-y-4 sm:space-y-6 pt-4 sm:pt-8">
          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Create a new form
            </h2>
            <p className="text-sm text-muted-foreground">
              Describe your form and AI will build it for you
            </p>
          </div>
          <PromptInput />
        </div>
      </div>
    </div>
  );
}
