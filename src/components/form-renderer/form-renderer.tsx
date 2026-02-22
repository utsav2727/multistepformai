"use client";

import { useEffect, useRef } from "react";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";
import { buildThemeCSSVars, type ThemeOverrides } from "@/lib/theme-utils";
import { useFormRenderer } from "@/hooks/use-form-renderer";
import { StepProgress } from "./step-progress";
import { StepRenderer } from "./step-renderer";
import { StepNavigation } from "./step-navigation";
import { FormSuccess } from "./form-success";
import { FormError } from "./form-error";

export interface FormRendererProps {
  schema: FormSchema;
  settings: FormSettings;
  submitUrl: string;
  onSubmitted?: () => void;
  themeOverrides?: ThemeOverrides;
}

export function FormRenderer({ schema, settings, submitUrl, onSubmitted, themeOverrides }: FormRendererProps) {
  const form = useFormRenderer(schema);
  const onSubmittedRef = useRef(onSubmitted);
  onSubmittedRef.current = onSubmitted;

  useEffect(() => {
    if (form.isSubmitted) {
      onSubmittedRef.current?.();
    }
  }, [form.isSubmitted]);

  if (form.isSubmitted) {
    return (
      <FormSuccess
        message={settings.behavior.successMessage}
        redirectUrl={settings.behavior.successRedirectUrl}
      />
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-2xl space-y-4 sm:space-y-6 px-1 sm:px-0"
      style={buildThemeCSSVars(settings.theme, themeOverrides)}
    >
      {settings.behavior.showProgressBar && form.totalSteps > 1 && (
        <StepProgress
          currentStep={form.currentStepIndex}
          totalSteps={form.totalSteps}
          progress={form.progress}
          showStepNumbers={settings.behavior.showStepNumbers}
        />
      )}

      {form.currentStep && (
        <StepRenderer
          step={form.currentStep}
          visibleFields={form.visibleFields}
          values={form.values}
          errors={form.errors}
          touched={form.touched}
          onValueChange={form.setValue}
          onFieldBlur={form.setTouched}
        />
      )}

      {form.submitError && (
        <FormError message={form.submitError} />
      )}

      <StepNavigation
        currentStepIndex={form.currentStepIndex}
        totalSteps={form.totalSteps}
        isSubmitting={form.isSubmitting}
        submitButtonText={settings.behavior.submitButtonText}
        onPrev={form.prevStep}
        onNext={form.nextStep}
        onSubmit={() => form.submit(submitUrl)}
      />
    </div>
  );
}
