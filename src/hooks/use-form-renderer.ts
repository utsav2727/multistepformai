"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type {
  FormSchema,
  FormStep,
  FormField,
  SubmissionData,
  SubmissionValue,
  ValidationRule,
} from "@/lib/form-schema/types";
import {
  evaluateLogicRules,
  shouldFieldBeRequired,
  getSkipToStep,
} from "@/lib/form-schema/logic-evaluator";

interface FormRendererState {
  currentStepIndex: number;
  values: SubmissionData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  startedAt: string;
}

export interface UseFormRendererReturn {
  currentStepIndex: number;
  values: SubmissionData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitError: string | null;
  startedAt: string;
  visibleSteps: FormStep[];
  visibleFields: FormField[];
  currentStep: FormStep | undefined;
  totalSteps: number;
  progress: number;
  setValue: (fieldId: string, value: SubmissionValue) => void;
  setTouched: (fieldId: string) => void;
  validateStep: () => boolean;
  validateField: (field: FormField) => string | null;
  nextStep: () => boolean;
  prevStep: () => void;
  submit: (submitUrl: string) => Promise<void>;
}

function validateFieldValue(
  field: FormField,
  value: SubmissionValue,
  isRequired: boolean
): string | null {
  const isEmpty =
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0);

  if (isRequired && isEmpty) {
    const requiredRule = field.validation.find((r) => r.type === "required");
    return requiredRule?.message || `${field.label} is required`;
  }

  if (isEmpty) return null;

  for (const rule of field.validation) {
    switch (rule.type) {
      case "required":
        // Already handled above
        break;

      case "min_length": {
        const strValue = String(value);
        if (strValue.length < Number(rule.value)) {
          return rule.message;
        }
        break;
      }

      case "max_length": {
        const strValue = String(value);
        if (strValue.length > Number(rule.value)) {
          return rule.message;
        }
        break;
      }

      case "min": {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue < Number(rule.value)) {
          return rule.message;
        }
        break;
      }

      case "max": {
        const numValue = Number(value);
        if (isNaN(numValue) || numValue > Number(rule.value)) {
          return rule.message;
        }
        break;
      }

      case "pattern": {
        const strValue = String(value);
        try {
          const regex = new RegExp(String(rule.value));
          if (!regex.test(strValue)) {
            return rule.message;
          }
        } catch {
          // Invalid regex pattern, skip validation
        }
        break;
      }

      case "file_size":
      case "file_types":
        // These are handled at the field component level
        break;
    }
  }

  return null;
}

export function useFormRenderer(schema: FormSchema): UseFormRendererReturn {
  const [state, setState] = useState<FormRendererState>({
    currentStepIndex: 0,
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isSubmitted: false,
    submitError: null,
    startedAt: new Date().toISOString(),
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const visibleSteps = useMemo(() => {
    return schema.steps.filter((step) => {
      const allRules = [
        ...(step.logicRules || []),
        ...schema.logicRules.filter((r) => r.targetId === step.id),
      ];
      return evaluateLogicRules(
        allRules.length > 0 ? allRules : undefined,
        state.values
      );
    });
  }, [schema.steps, schema.logicRules, state.values]);

  const currentStep = visibleSteps[state.currentStepIndex];

  const visibleFields = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.fields.filter((field) => {
      const allRules = [
        ...(field.logicRules || []),
        ...schema.logicRules.filter((r) => r.targetId === field.id),
      ];
      return evaluateLogicRules(
        allRules.length > 0 ? allRules : undefined,
        state.values
      );
    });
  }, [currentStep, schema.logicRules, state.values]);

  const totalSteps = visibleSteps.length;

  const progress = useMemo(() => {
    if (totalSteps === 0) return 0;
    if (state.isSubmitted) return 100;
    return Math.round(((state.currentStepIndex + 1) / totalSteps) * 100);
  }, [state.currentStepIndex, totalSteps, state.isSubmitted]);

  const setValue = useCallback(
    (fieldId: string, value: SubmissionValue) => {
      setState((prev) => {
        const newValues = { ...prev.values, [fieldId]: value };
        const newErrors = { ...prev.errors };

        // Find the field to validate on change if already touched
        if (prev.touched[fieldId]) {
          const field = schema.steps
            .flatMap((s) => s.fields)
            .find((f) => f.id === fieldId);
          if (field) {
            const allRules = [
              ...(field.logicRules || []),
              ...schema.logicRules.filter((r) => r.targetId === field.id),
            ];
            const isRequired = shouldFieldBeRequired(
              allRules.length > 0 ? allRules : undefined,
              newValues,
              field.required
            );
            const error = validateFieldValue(field, value, isRequired);
            if (error) {
              newErrors[fieldId] = error;
            } else {
              delete newErrors[fieldId];
            }
          }
        }

        return { ...prev, values: newValues, errors: newErrors };
      });
    },
    [schema.steps, schema.logicRules]
  );

  const setTouched = useCallback((fieldId: string) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [fieldId]: true },
    }));
  }, []);

  const validateField = useCallback(
    (field: FormField): string | null => {
      const currentState = stateRef.current;
      const allRules = [
        ...(field.logicRules || []),
        ...schema.logicRules.filter((r) => r.targetId === field.id),
      ];
      const isRequired = shouldFieldBeRequired(
        allRules.length > 0 ? allRules : undefined,
        currentState.values,
        field.required
      );
      return validateFieldValue(field, currentState.values[field.id], isRequired);
    },
    [schema.logicRules]
  );

  const validateStep = useCallback((): boolean => {
    const currentState = stateRef.current;
    const step = visibleSteps[currentState.currentStepIndex];
    if (!step) return true;

    const fieldsToValidate = step.fields.filter((field) => {
      const allRules = [
        ...(field.logicRules || []),
        ...schema.logicRules.filter((r) => r.targetId === field.id),
      ];
      return evaluateLogicRules(
        allRules.length > 0 ? allRules : undefined,
        currentState.values
      );
    });

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = { ...currentState.touched };
    let isValid = true;

    for (const field of fieldsToValidate) {
      newTouched[field.id] = true;
      const allRules = [
        ...(field.logicRules || []),
        ...schema.logicRules.filter((r) => r.targetId === field.id),
      ];
      const isRequired = shouldFieldBeRequired(
        allRules.length > 0 ? allRules : undefined,
        currentState.values,
        field.required
      );
      const error = validateFieldValue(
        field,
        currentState.values[field.id],
        isRequired
      );
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    }

    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, ...newErrors },
      touched: newTouched,
    }));

    return isValid;
  }, [visibleSteps, schema.logicRules]);

  const nextStep = useCallback((): boolean => {
    if (!validateStep()) return false;

    const currentState = stateRef.current;
    const step = visibleSteps[currentState.currentStepIndex];

    // Check for skip_to_step logic
    if (step) {
      const allRules = [
        ...(step.logicRules || []),
        ...schema.logicRules,
      ];
      const skipToStepId = getSkipToStep(allRules, currentState.values);
      if (skipToStepId) {
        const targetIndex = visibleSteps.findIndex(
          (s) => s.id === skipToStepId
        );
        if (targetIndex !== -1) {
          setState((prev) => ({
            ...prev,
            currentStepIndex: targetIndex,
          }));
          return true;
        }
      }
    }

    if (currentState.currentStepIndex < visibleSteps.length - 1) {
      setState((prev) => ({
        ...prev,
        currentStepIndex: prev.currentStepIndex + 1,
      }));
      return true;
    }
    return false;
  }, [validateStep, visibleSteps, schema.logicRules]);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
    }));
  }, []);

  const submit = useCallback(
    async (submitUrl: string) => {
      if (!validateStep()) return;

      setState((prev) => ({
        ...prev,
        isSubmitting: true,
        submitError: null,
      }));

      try {
        const currentState = stateRef.current;
        const now = new Date().toISOString();
        const startTime = new Date(currentState.startedAt).getTime();
        const duration = Math.round((Date.now() - startTime) / 1000);

        const payload = {
          data: currentState.values,
          metadata: {
            userAgent:
              typeof navigator !== "undefined" ? navigator.userAgent : "",
            referrer:
              typeof document !== "undefined" ? document.referrer || null : null,
            startedAt: currentState.startedAt,
            completedAt: now,
            duration,
          },
        };

        const response = await fetch(submitUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Submission failed (${response.status})`
          );
        }

        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          isSubmitted: true,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          submitError:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred",
        }));
      }
    },
    [validateStep]
  );

  return {
    currentStepIndex: state.currentStepIndex,
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isSubmitting: state.isSubmitting,
    isSubmitted: state.isSubmitted,
    submitError: state.submitError,
    startedAt: state.startedAt,
    visibleSteps,
    visibleFields,
    currentStep,
    totalSteps,
    progress,
    setValue,
    setTouched,
    validateStep,
    validateField,
    nextStep,
    prevStep,
    submit,
  };
}
