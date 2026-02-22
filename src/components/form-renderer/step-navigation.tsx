"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface StepNavigationProps {
  currentStepIndex: number;
  totalSteps: number;
  isSubmitting: boolean;
  submitButtonText: string;
  onPrev: () => void;
  onNext: () => boolean;
  onSubmit: () => void;
}

export function StepNavigation({
  currentStepIndex,
  totalSteps,
  isSubmitting,
  submitButtonText,
  onPrev,
  onNext,
  onSubmit,
}: StepNavigationProps) {
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-4">
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
          >
            <ChevronLeft className="mr-1 size-4" />
            Previous
          </Button>
        )}
      </div>

      <div>
        {isLastStep ? (
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1 size-4 animate-spin" />
                Submitting...
              </>
            ) : (
              submitButtonText || "Submit"
            )}
          </Button>
        ) : (
          <Button type="button" onClick={onNext} disabled={isSubmitting}>
            Next
            <ChevronRight className="ml-1 size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
