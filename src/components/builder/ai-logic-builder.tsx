"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import type { FormSchema, LogicRule } from "@/lib/form-schema/types";

interface AiLogicBuilderProps {
  formSchema: FormSchema;
  onAddRules: (rules: LogicRule[]) => void;
}

export function AiLogicBuilder({ formSchema, onAddRules }: AiLogicBuilderProps) {
  const [expanded, setExpanded] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ rules: LogicRule[]; explanation: string } | null>(null);

  const handleGenerate = async () => {
    if (instruction.trim().length < 5) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-logic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: instruction.trim(),
          formSchema: {
            steps: formSchema.steps.map((s) => ({
              id: s.id,
              title: s.title,
              fields: s.fields.map((f) => ({
                id: f.id,
                type: f.type,
                label: f.label,
                options: f.options,
              })),
            })),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data);
    } catch {
      toast.error("Failed to generate logic. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result?.rules.length) return;
    onAddRules(result.rules);
    toast.success(`Added ${result.rules.length} logic rule${result.rules.length !== 1 ? "s" : ""}`);
    setInstruction("");
    setResult(null);
  };

  return (
    <div className="rounded-lg border border-purple-200 dark:border-purple-500/30 bg-purple-500/5 overflow-hidden">
      <button
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="size-3.5 text-purple-500" />
          <span className="text-xs font-medium text-purple-700 dark:text-purple-300">AI Logic Builder</span>
        </div>
        {expanded ? (
          <ChevronUp className="size-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-3.5 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-purple-200 dark:border-purple-500/30 pt-2.5">
          <p className="text-[11px] text-muted-foreground">
            Describe your logic in plain English and AI will generate the rules.
          </p>
          <Textarea
            value={instruction}
            onChange={(e) => { setInstruction(e.target.value); setResult(null); }}
            placeholder="e.g. Show the employment section only if the user selects 'Yes' for employed"
            className="text-xs min-h-[72px] resize-none"
          />
          {result && (
            <div className="rounded-md bg-muted/60 p-2.5 space-y-1.5 text-xs">
              <p className="text-muted-foreground">{result.explanation}</p>
              {result.rules.length > 0 ? (
                <p className="font-medium text-emerald-600 dark:text-emerald-400">
                  ✓ {result.rules.length} rule{result.rules.length !== 1 ? "s" : ""} ready to apply
                </p>
              ) : (
                <p className="text-amber-600 dark:text-amber-400">
                  No rules could be generated for this instruction.
                </p>
              )}
            </div>
          )}
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-7 text-xs"
              onClick={handleGenerate}
              disabled={loading || instruction.trim().length < 5}
            >
              {loading ? (
                <><Loader2 className="size-3 mr-1 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="size-3 mr-1" /> Generate</>
              )}
            </Button>
            {result && result.rules.length > 0 && (
              <Button
                size="sm"
                className="flex-1 h-7 text-xs bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 gap-1"
                onClick={handleApply}
              >
                <Check className="size-3" />
                Apply Rules
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
