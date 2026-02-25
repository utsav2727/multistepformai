"use client";

import type { FormStep } from "@/lib/form-schema/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepItemProps {
  step: FormStep;
  index: number;
  totalSteps: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function StepItem({
  step,
  index,
  totalSteps,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: StepItemProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-2.5 cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border hover:border-primary/30 hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      {/* Top row: title + delete */}
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium truncate flex-1 min-w-0">
          {step.title}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          disabled={totalSteps <= 1}
          title="Delete step"
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>

      {/* Bottom row: badge + reorder buttons */}
      <div className="flex items-center gap-1.5 mt-1">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
          {step.fields.length} {step.fields.length === 1 ? "field" : "fields"}
        </Badge>
        {step.description && (
          <span className="text-[11px] text-muted-foreground truncate flex-1 min-w-0">
            {step.description}
          </span>
        )}
        <div className="flex items-center gap-0.5 ml-auto shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={index === 0}
            title="Move up"
          >
            <ArrowUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={index === totalSteps - 1}
            title="Move down"
          >
            <ArrowDown className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
