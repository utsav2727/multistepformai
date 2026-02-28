"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2, GitBranch, Type } from "lucide-react";
import { toast } from "sonner";
import type { FormSchema, FormStep, FormField } from "@/lib/form-schema/types";

type Tone = "friendly" | "corporate" | "startup" | "medical";

const TONES: { value: Tone; label: string; description: string }[] = [
  { value: "friendly", label: "Friendly", description: "Warm & conversational" },
  { value: "corporate", label: "Corporate", description: "Professional & formal" },
  { value: "startup", label: "Startup", description: "Casual & energetic" },
  { value: "medical", label: "Medical", description: "Clinical & precise" },
];

interface AiToolbarProps {
  schema: FormSchema;
  formTitle: string;
  onApplyRewrite: (result: {
    title: string;
    steps: { id: string; title: string; description?: string | null; fields: { id: string; label: string; description?: string | null; placeholder?: string | null }[] }[];
  }) => void;
  onApplyFlow: (steps: FormStep[]) => void;
}

export function AiToolbar({ schema, formTitle, onApplyRewrite, onApplyFlow }: AiToolbarProps) {
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const [flowOpen, setFlowOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<Tone>("friendly");
  const [loading, setLoading] = useState(false);
  const [flowPreview, setFlowPreview] = useState<{ steps: { id: string; title: string; description?: string | null; fieldIds: string[] }[]; explanation: string } | null>(null);

  const handleRewrite = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/rewrite-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tone: selectedTone,
          formTitle,
          formSchema: {
            steps: schema.steps.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description ?? null,
              fields: s.fields.map((f) => ({
                id: f.id,
                type: f.type,
                label: f.label,
                description: f.description ?? null,
                placeholder: f.placeholder ?? null,
              })),
            })),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      onApplyRewrite(data);
      toast.success("Form copy rewritten successfully");
      setRewriteOpen(false);
    } catch {
      toast.error("Failed to rewrite copy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeFlow = async () => {
    setLoading(true);
    setFlowPreview(null);
    try {
      const res = await fetch("/api/ai/optimize-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formTitle,
          formSchema: {
            steps: schema.steps.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description ?? null,
              fields: s.fields.map((f) => ({
                id: f.id,
                type: f.type,
                label: f.label,
                required: f.required,
              })),
            })),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFlowPreview(data);
    } catch {
      toast.error("Failed to optimize flow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFlow = () => {
    if (!flowPreview) return;

    // Build a lookup of all fields across all steps
    const allFields: Record<string, FormField> = {};
    for (const step of schema.steps) {
      for (const field of step.fields) {
        allFields[field.id] = field;
      }
    }

    // Map AI-suggested steps to actual FormStep objects
    const newSteps: FormStep[] = flowPreview.steps.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description ?? undefined,
      fields: s.fieldIds.map((fid) => allFields[fid]).filter(Boolean),
    }));

    onApplyFlow(newSteps);
    toast.success("Form flow optimized");
    setFlowOpen(false);
    setFlowPreview(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 hover:from-indigo-500/20 hover:via-purple-500/20 hover:to-pink-500/20"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden sm:inline">AI Tools</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">AI Features</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setRewriteOpen(true)}>
            <Type className="mr-2 size-4 text-purple-500" />
            Rewrite Copy
            <span className="ml-auto text-[10px] text-muted-foreground">Tone</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => { setFlowOpen(true); handleOptimizeFlow(); }}>
            <GitBranch className="mr-2 size-4 text-indigo-500" />
            Optimize Flow
            <span className="ml-auto text-[10px] text-muted-foreground">Steps</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rewrite Copy Dialog */}
      <Dialog open={rewriteOpen} onOpenChange={setRewriteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="size-5 text-purple-500" />
              AI Copywriter
            </DialogTitle>
            <DialogDescription>
              Rewrite all form labels, descriptions, and placeholders in the selected tone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-sm font-medium">Select tone</Label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone.value}
                  onClick={() => setSelectedTone(tone.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    selectedTone === tone.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs font-medium">{tone.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{tone.description}</p>
                </button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewriteOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleRewrite}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
            >
              {loading ? <><Loader2 className="size-4 mr-2 animate-spin" /> Rewriting...</> : <><Sparkles className="size-4 mr-2" /> Rewrite</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Optimize Flow Dialog */}
      <Dialog open={flowOpen} onOpenChange={(open) => { setFlowOpen(open); if (!open) setFlowPreview(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="size-5 text-indigo-500" />
              AI Flow Designer
            </DialogTitle>
            <DialogDescription>
              AI will analyze your form fields and suggest an optimized step structure for better completion rates.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-[120px] py-2">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Analyzing your form...</span>
              </div>
            )}
            {!loading && flowPreview && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{flowPreview.explanation}</p>
                <div className="space-y-2">
                  {flowPreview.steps.map((step, i) => (
                    <div key={step.id} className="rounded-lg border bg-muted/30 p-3">
                      <p className="text-xs font-semibold">Step {i + 1}: {step.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {step.fieldIds.length} field{step.fieldIds.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setFlowOpen(false); setFlowPreview(null); }}>
              Cancel
            </Button>
            <Button
              onClick={handleApplyFlow}
              disabled={loading || !flowPreview}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0"
            >
              <Sparkles className="size-4 mr-2" />
              Apply Flow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
