"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PromptSuggestions } from "./prompt-suggestions";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function PromptInput() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.trim().length < 10) {
      toast.error("Please describe your form in at least 10 characters.");
      return;
    }

    setLoading(true);

    try {
      // Generate form schema via AI
      const genResponse = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!genResponse.ok) {
        const err = await genResponse.json();
        throw new Error(err.error || "Failed to generate form");
      }

      const generated = await genResponse.json();

      // Save the generated form
      const saveResponse = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generated.title,
          description: generated.description,
          schema: generated.schema,
        }),
      });

      if (!saveResponse.ok) {
        const err = await saveResponse.json();
        throw new Error(err.error || "Failed to save form");
      }

      const savedForm = await saveResponse.json();
      toast.success("Form generated successfully!");
      router.push(`/builder/${savedForm.id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Textarea
          placeholder="Describe the form you want to create... e.g., 'Create a healthcare onboarding form with insurance upload and eligibility questions'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none text-base"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {prompt.length}/2000 characters
          </p>
          <Button
            onClick={handleGenerate}
            disabled={loading || prompt.trim().length < 10}
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Form
              </>
            )}
          </Button>
        </div>
      </div>

      {!loading && <PromptSuggestions onSelect={setPrompt} />}

      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="relative">
            <Sparkles className="h-8 w-8 animate-pulse text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            AI is designing your form...
          </p>
          <p className="text-xs text-muted-foreground">
            This usually takes 5-15 seconds
          </p>
        </div>
      )}
    </div>
  );
}
