"use client";

import type { FormStep } from "@/lib/form-schema/types";
import { StepItem } from "./step-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

interface StepSidebarProps {
  steps: FormStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onAddStep: () => void;
  onRemoveStep: (stepId: string) => void;
  onReorderSteps: (fromIndex: number, toIndex: number) => void;
}

export function StepSidebar({
  steps,
  selectedStepId,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  onReorderSteps,
}: StepSidebarProps) {
  return (
    <div className="flex h-full w-full md:w-[250px] flex-col border-r bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Steps</h2>
        <Button variant="ghost" size="icon-xs" onClick={onAddStep} title="Add step">
          <Plus className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
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
      </ScrollArea>

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
