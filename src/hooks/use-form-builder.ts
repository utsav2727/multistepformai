"use client";

import { useState, useCallback, useMemo } from "react";
import type {
  FormSchema,
  FormSettings,
  FormStep,
  FormField,
  FieldType,
} from "@/lib/form-schema/types";
import {
  createDefaultStep,
  createDefaultField,
  generateId,
} from "@/lib/form-schema/defaults";

export interface FormBuilderState {
  schema: FormSchema;
  settings: FormSettings;
  selectedStepId: string | null;
  selectedFieldId: string | null;
  isDirty: boolean;
}

export interface UseFormBuilderReturn extends FormBuilderState {
  // Step operations
  addStep: () => void;
  removeStep: (stepId: string) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;

  // Field operations
  addField: (stepId: string, fieldType: FieldType) => void;
  removeField: (stepId: string, fieldId: string) => void;
  duplicateField: (stepId: string, fieldId: string) => void;
  updateField: (
    stepId: string,
    fieldId: string,
    updates: Partial<FormField>
  ) => void;
  reorderFields: (stepId: string, fromIndex: number, toIndex: number) => void;

  // Selection
  selectStep: (stepId: string | null) => void;
  selectField: (fieldId: string | null) => void;

  // Computed
  selectedStep: FormStep | undefined;
  selectedField: FormField | undefined;

  // Settings
  updateSettings: (updates: Partial<FormSettings>) => void;

  // Schema replacement
  setSchema: (schema: FormSchema) => void;

  // Reset dirty
  markClean: () => void;
}

export function useFormBuilder(
  initialSchema: FormSchema,
  initialSettings: FormSettings
): UseFormBuilderReturn {
  const [state, setState] = useState<FormBuilderState>({
    schema: initialSchema,
    settings: initialSettings,
    selectedStepId: initialSchema.steps[0]?.id ?? null,
    selectedFieldId: null,
    isDirty: false,
  });

  // --- Step operations ---

  const addStep = useCallback(() => {
    setState((prev) => {
      const newStep = createDefaultStep(prev.schema.steps.length);
      return {
        ...prev,
        schema: {
          ...prev.schema,
          steps: [...prev.schema.steps, newStep],
        },
        selectedStepId: newStep.id,
        selectedFieldId: null,
        isDirty: true,
      };
    });
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setState((prev) => {
      const steps = prev.schema.steps.filter((s) => s.id !== stepId);
      if (steps.length === 0) return prev; // Don't remove the last step

      const wasSelected = prev.selectedStepId === stepId;
      return {
        ...prev,
        schema: { ...prev.schema, steps },
        selectedStepId: wasSelected ? steps[0]?.id ?? null : prev.selectedStepId,
        selectedFieldId: wasSelected ? null : prev.selectedFieldId,
        isDirty: true,
      };
    });
  }, []);

  const reorderSteps = useCallback((fromIndex: number, toIndex: number) => {
    setState((prev) => {
      const steps = [...prev.schema.steps];
      if (
        fromIndex < 0 ||
        fromIndex >= steps.length ||
        toIndex < 0 ||
        toIndex >= steps.length
      ) {
        return prev;
      }
      const [moved] = steps.splice(fromIndex, 1);
      steps.splice(toIndex, 0, moved);
      return {
        ...prev,
        schema: { ...prev.schema, steps },
        isDirty: true,
      };
    });
  }, []);

  const updateStep = useCallback(
    (stepId: string, updates: Partial<FormStep>) => {
      setState((prev) => ({
        ...prev,
        schema: {
          ...prev.schema,
          steps: prev.schema.steps.map((s) =>
            s.id === stepId ? { ...s, ...updates } : s
          ),
        },
        isDirty: true,
      }));
    },
    []
  );

  // --- Field operations ---

  const addField = useCallback((stepId: string, fieldType: FieldType) => {
    setState((prev) => {
      const newField = createDefaultField(fieldType);
      return {
        ...prev,
        schema: {
          ...prev.schema,
          steps: prev.schema.steps.map((s) =>
            s.id === stepId
              ? { ...s, fields: [...s.fields, newField] }
              : s
          ),
        },
        selectedFieldId: newField.id,
        isDirty: true,
      };
    });
  }, []);

  const removeField = useCallback((stepId: string, fieldId: string) => {
    setState((prev) => {
      const wasSelected = prev.selectedFieldId === fieldId;
      return {
        ...prev,
        schema: {
          ...prev.schema,
          steps: prev.schema.steps.map((s) =>
            s.id === stepId
              ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
              : s
          ),
        },
        selectedFieldId: wasSelected ? null : prev.selectedFieldId,
        isDirty: true,
      };
    });
  }, []);

  const duplicateField = useCallback((stepId: string, fieldId: string) => {
    setState((prev) => {
      const step = prev.schema.steps.find((s) => s.id === stepId);
      if (!step) return prev;
      const fieldIndex = step.fields.findIndex((f) => f.id === fieldId);
      if (fieldIndex === -1) return prev;
      const original = step.fields[fieldIndex];
      const duplicate: FormField = {
        ...original,
        id: generateId("field"),
        label: `${original.label} (copy)`,
        logicRules: [],
      };
      const fields = [...step.fields];
      fields.splice(fieldIndex + 1, 0, duplicate);
      return {
        ...prev,
        schema: {
          ...prev.schema,
          steps: prev.schema.steps.map((s) =>
            s.id === stepId ? { ...s, fields } : s
          ),
        },
        selectedFieldId: duplicate.id,
        isDirty: true,
      };
    });
  }, []);

  const updateField = useCallback(
    (stepId: string, fieldId: string, updates: Partial<FormField>) => {
      setState((prev) => ({
        ...prev,
        schema: {
          ...prev.schema,
          steps: prev.schema.steps.map((s) =>
            s.id === stepId
              ? {
                  ...s,
                  fields: s.fields.map((f) =>
                    f.id === fieldId ? { ...f, ...updates } : f
                  ),
                }
              : s
          ),
        },
        isDirty: true,
      }));
    },
    []
  );

  const reorderFields = useCallback(
    (stepId: string, fromIndex: number, toIndex: number) => {
      setState((prev) => {
        const step = prev.schema.steps.find((s) => s.id === stepId);
        if (!step) return prev;

        const fields = [...step.fields];
        if (
          fromIndex < 0 ||
          fromIndex >= fields.length ||
          toIndex < 0 ||
          toIndex >= fields.length
        ) {
          return prev;
        }

        const [moved] = fields.splice(fromIndex, 1);
        fields.splice(toIndex, 0, moved);

        return {
          ...prev,
          schema: {
            ...prev.schema,
            steps: prev.schema.steps.map((s) =>
              s.id === stepId ? { ...s, fields } : s
            ),
          },
          isDirty: true,
        };
      });
    },
    []
  );

  // --- Selection ---

  const selectStep = useCallback((stepId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedStepId: stepId,
      selectedFieldId: null,
    }));
  }, []);

  const selectField = useCallback((fieldId: string | null) => {
    setState((prev) => ({
      ...prev,
      selectedFieldId: fieldId,
    }));
  }, []);

  // --- Computed ---

  const selectedStep = useMemo(
    () => state.schema.steps.find((s) => s.id === state.selectedStepId),
    [state.schema.steps, state.selectedStepId]
  );

  const selectedField = useMemo(() => {
    if (!state.selectedFieldId) return undefined;
    for (const step of state.schema.steps) {
      const field = step.fields.find((f) => f.id === state.selectedFieldId);
      if (field) return field;
    }
    return undefined;
  }, [state.schema.steps, state.selectedFieldId]);

  // --- Settings ---

  const updateSettings = useCallback((updates: Partial<FormSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...updates,
        theme: updates.theme
          ? { ...prev.settings.theme, ...updates.theme }
          : prev.settings.theme,
        behavior: updates.behavior
          ? { ...prev.settings.behavior, ...updates.behavior }
          : prev.settings.behavior,
        notifications: updates.notifications
          ? { ...prev.settings.notifications, ...updates.notifications }
          : prev.settings.notifications,
      },
      isDirty: true,
    }));
  }, []);

  // --- Schema replacement ---

  const setSchema = useCallback((schema: FormSchema) => {
    setState((prev) => ({
      ...prev,
      schema,
      selectedStepId: schema.steps[0]?.id ?? null,
      selectedFieldId: null,
      isDirty: true,
    }));
  }, []);

  // --- Mark clean ---

  const markClean = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isDirty: false,
    }));
  }, []);

  return {
    schema: state.schema,
    settings: state.settings,
    selectedStepId: state.selectedStepId,
    selectedFieldId: state.selectedFieldId,
    isDirty: state.isDirty,
    addStep,
    removeStep,
    reorderSteps,
    updateStep,
    addField,
    removeField,
    duplicateField,
    updateField,
    reorderFields,
    selectStep,
    selectField,
    selectedStep,
    selectedField,
    updateSettings,
    setSchema,
    markClean,
  };
}
