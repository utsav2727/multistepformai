"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sparkles, Loader2, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import type { FormField } from "@/lib/form-schema/types";
import { cn } from "@/lib/utils";

type Tone = "friendly" | "corporate" | "startup" | "medical";

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "corporate", label: "Corporate", emoji: "🏢" },
  { value: "startup", label: "Startup", emoji: "🚀" },
  { value: "medical", label: "Medical", emoji: "🏥" },
];

interface AiFieldImproverProps {
  field: FormField;
  formTitle?: string;
  onApply: (updates: { label: string; description?: string | null; placeholder?: string | null }) => void;
}

export function AiFieldImprover({ field, formTitle, onApply }: AiFieldImproverProps) {
  const [open, setOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>("friendly");
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<{ label: string; description?: string | null; placeholder?: string | null } | null>(null);

  const handleImprove = async () => {
    setLoading(true);
    setSuggestion(null);
    try {
      const res = await fetch("/api/ai/improve-field", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: {
            id: field.id,
            type: field.type,
            label: field.label,
            description: field.description ?? null,
            placeholder: field.placeholder ?? null,
          },
          tone: selectedTone,
          formTitle,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setSuggestion(data.improvement);
    } catch {
      toast.error("Failed to improve field. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!suggestion) return;
    onApply(suggestion);
    toast.success("Field updated with AI suggestion");
    setOpen(false);
    setSuggestion(null);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
        >
          <Sparkles className="size-3" />
          Improve
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">AI Field Improver</p>
            <p className="text-xs text-muted-foreground mt-0.5">Suggest better copy for this field</p>
          </div>

          {/* Tone selector */}
          <div className="grid grid-cols-2 gap-1.5">
            {TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => { setSelectedTone(tone.value); setSuggestion(null); }}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-left text-xs transition-colors",
                  selectedTone === tone.value
                    ? "border-primary bg-primary/5 font-medium"
                    : "border-border hover:border-primary/40"
                )}
              >
                {tone.emoji} {tone.label}
              </button>
            ))}
          </div>

          {/* Generate button */}
          {!suggestion && (
            <Button
              size="sm"
              className="w-full gap-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 h-8"
              onClick={handleImprove}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="size-3 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="size-3" /> Generate</>
              )}
            </Button>
          )}

          {/* Suggestion preview */}
          {suggestion && (
            <div className="space-y-2">
              <div className="rounded-md bg-muted/60 p-2.5 space-y-1.5 text-xs">
                <div>
                  <span className="text-muted-foreground">Label: </span>
                  <span className="font-medium">{suggestion.label}</span>
                </div>
                {suggestion.description && (
                  <div>
                    <span className="text-muted-foreground">Description: </span>
                    <span>{suggestion.description}</span>
                  </div>
                )}
                {suggestion.placeholder && (
                  <div>
                    <span className="text-muted-foreground">Placeholder: </span>
                    <span className="italic text-muted-foreground">{suggestion.placeholder}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs gap-1"
                  onClick={handleImprove}
                  disabled={loading}
                >
                  <RefreshCw className="size-3" />
                  Retry
                </Button>
                <Button
                  size="sm"
                  className="flex-1 h-7 text-xs gap-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
                  onClick={handleApply}
                >
                  <Check className="size-3" />
                  Apply
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
