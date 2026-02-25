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
import { AnimatePresence, motion } from "framer-motion";

export interface FormRendererProps {
  schema: FormSchema;
  settings: FormSettings;
  submitUrl: string;
  onSubmitted?: () => void;
  themeOverrides?: ThemeOverrides;
}

const stepVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export function FormRenderer({ schema, settings, submitUrl, onSubmitted, themeOverrides }: FormRendererProps) {
  const form = useFormRenderer(schema);
  const onSubmittedRef = useRef(onSubmitted);
  onSubmittedRef.current = onSubmitted;

  const prevStepRef = useRef(form.currentStepIndex);
  const directionRef = useRef(1);
  if (prevStepRef.current !== form.currentStepIndex) {
    directionRef.current = form.currentStepIndex > prevStepRef.current ? 1 : -1;
    prevStepRef.current = form.currentStepIndex;
  }

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

      <div className="overflow-hidden">
        <AnimatePresence mode="wait" custom={directionRef.current}>
          {form.currentStep && (
            <motion.div
              key={form.currentStep.id}
              custom={directionRef.current}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <StepRenderer
                step={form.currentStep}
                visibleFields={form.visibleFields}
                values={form.values}
                errors={form.errors}
                touched={form.touched}
                onValueChange={form.setValue}
                onFieldBlur={form.setTouched}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
