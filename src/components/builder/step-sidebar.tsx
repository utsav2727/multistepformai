"use client";

import type { FormStep } from "@/lib/form-schema/types";
import { StepItem } from "./step-item";
import { Button } from "@/components/ui/button";
import { Plus, PanelLeftClose } from "lucide-react";

interface StepSidebarProps {
  steps: FormStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
  onCollapse?: () => void;
}

export function StepSidebar({
  steps,
  selectedStepId,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  onReorderSteps,
  onCollapse,
}: StepSidebarProps) {
  return (
    <div className="flex h-full w-full md:w-64 flex-col border-r bg-muted/30 shrink-0">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Steps</h2>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-xs" onClick={onAddStep} title="Add step">
            <Plus className="size-4" />
          </Button>
          {onCollapse && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onCollapse}
              title="Collapse steps panel"
              className="hidden md:inline-flex text-muted-foreground hover:text-foreground"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-2 p-3">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              totalSteps={steps.length}
              isSelected={step.id === selectedStepId}
              onSelect={() => onSelectStep(step.id)}
              onMoveUp={() => onReorderSteps(index, index - 1)}
              onMoveDown={() => onReorderSteps(index, index + 1)}
              onDelete={() => onRemoveStep(step.id)}
            />
          ))}
        </div>
      </div>

      <div className="border-t p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onAddStep}
          className="w-full"
        >
          <Plus className="size-4" />
          Add Step
        </Button>
      </div>
    </div>
  );
}
