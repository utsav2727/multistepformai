"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebounce } from "./use-debounce";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";

interface UseAutoSaveOptions {
  formId: string;
  schema: FormSchema;
  settings: FormSettings;
  isDirty: boolean;
  onSaved?: () => void;
}

interface UseAutoSaveReturn {
  saving: boolean;
  lastSaved: Date | null;
}

export function useAutoSave({
  formId,
  schema,
  settings,
  isDirty,
  onSaved,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  const debouncedSchema = useDebounce(schema, 2000);
  const debouncedSettings = useDebounce(settings, 2000);
  const debouncedIsDirty = useDebounce(isDirty, 2000);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema: debouncedSchema, settings: debouncedSettings }),
      });

      if (!response.ok) {
        throw new Error(`Save failed: ${response.status}`);
      }

      setLastSaved(new Date());
      onSavedRef.current?.();
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setSaving(false);
    }
  }, [formId, debouncedSchema, debouncedSettings]);

  useEffect(() => {
    if (debouncedIsDirty) {
      save();
    }
  }, [debouncedIsDirty, save]);

  return { saving, lastSaved };
}
