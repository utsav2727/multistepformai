"use client";

import type {
  FormStep,
  FormField,
  SubmissionData,
  SubmissionValue,
} from "@/lib/form-schema/types";
import { FieldRenderer } from "./field-renderer";

interface StepRendererProps {
  step: FormStep;
  visibleFields: FormField[];
  values: SubmissionData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  onValueChange: (fieldId: string, value: SubmissionValue) => void;
  onFieldBlur: (fieldId: string) => void;
}

export function StepRenderer({
  step,
  visibleFields,
  values,
  errors,
  touched,
  onValueChange,
  onFieldBlur,
}: StepRendererProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {(step.title || step.description) && (
        <div className="space-y-1 sm:space-y-2">
          {step.title && (
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
              {step.title}
            </h2>
          )}
          {step.description && (
            <p className="text-muted-foreground text-sm">
              {step.description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 sm:space-y-5">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className={field.width === "half" ? "w-full sm:w-1/2 sm:inline-block sm:pr-2 align-top" : "w-full"}
          >
            <FieldRenderer
              field={field}
              value={values[field.id] ?? null}
              onChange={(value) => onValueChange(field.id, value)}
              onBlur={() => onFieldBlur(field.id)}
              error={errors[field.id]}
              touched={touched[field.id]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
