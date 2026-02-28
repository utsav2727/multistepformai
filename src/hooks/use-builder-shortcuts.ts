"use client";

import { useEffect } from "react";
import type { UseFormBuilderReturn } from "./use-form-builder";

export function useBuilderShortcuts(builder: UseFormBuilderReturn) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when focused in an input/textarea/select
      const target = e.target as HTMLElement;
      const isEditing =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      if (isEditing) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+D — duplicate selected field
      if (ctrl && e.key === "d") {
        e.preventDefault();
        if (builder.selectedField && builder.selectedStep) {
          builder.duplicateField(builder.selectedStep.id, builder.selectedField.id);
        }
        return;
      }

      // Delete / Backspace — delete selected field (when not editing)
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditing) {
        if (builder.selectedField && builder.selectedStep) {
          e.preventDefault();
          builder.removeField(builder.selectedStep.id, builder.selectedField.id);
        }
        return;
      }

      // Escape — deselect field
      if (e.key === "Escape") {
        builder.selectField(null);
        return;
      }

      // ArrowUp/ArrowDown — move field up/down
      if (e.key === "ArrowUp" && ctrl) {
        e.preventDefault();
        if (builder.selectedField && builder.selectedStep) {
          const idx = builder.selectedStep.fields.findIndex(
            (f) => f.id === builder.selectedField!.id
          );
          if (idx > 0) {
            builder.reorderFields(builder.selectedStep.id, idx, idx - 1);
          }
        }
        return;
      }

      if (e.key === "ArrowDown" && ctrl) {
        e.preventDefault();
        if (builder.selectedField && builder.selectedStep) {
          const idx = builder.selectedStep.fields.findIndex(
            (f) => f.id === builder.selectedField!.id
          );
          if (idx < builder.selectedStep.fields.length - 1) {
            builder.reorderFields(builder.selectedStep.id, idx, idx + 1);
          }
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [builder]);
}
