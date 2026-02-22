"use client";

import { Progress } from "@/components/ui/progress";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  progress: number;
  showStepNumbers: boolean;
}

export function StepProgress({
  currentStep,
  totalSteps,
  progress,
  showStepNumbers,
}: StepProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {showStepNumbers && (
          <span className="text-muted-foreground text-sm font-medium">
            Step {currentStep + 1} of {totalSteps}
          </span>
        )}
        <span className="text-muted-foreground ml-auto text-sm">
          {progress}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
