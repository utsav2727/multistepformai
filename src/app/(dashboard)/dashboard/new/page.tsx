"use client";

import { Topbar } from "@/components/dashboard/topbar";
import { PromptInput } from "@/components/ai/prompt-input";
import { Sparkles } from "lucide-react";

export default function NewFormPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="New Form" />
      <div className="relative flex-1 flex items-start justify-center p-4 sm:p-6 overflow-hidden">
        {/* Subtle background effects */}
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]" />
        <div className="relative w-full max-w-2xl space-y-4 sm:space-y-6 pt-4 sm:pt-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 mx-auto">
              <Sparkles className="h-6 w-6 text-purple-500" />
            </div>
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
