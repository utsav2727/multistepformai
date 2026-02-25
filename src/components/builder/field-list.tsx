"use client";

import type { FormStep, FormField, FieldType } from "@/lib/form-schema/types";
import { FieldItem } from "./field-item";
import { FieldTypePicker } from "./field-type-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Layers } from "lucide-react";

interface FieldListProps {
  step: FormStep | undefined;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onAddField: (stepId: string, fieldType: FieldType) => void;
  onRemoveField: (stepId: string, fieldId: string) => void;
  onDuplicateField: (stepId: string, fieldId: string) => void;
  onReorderFields: (stepId: string, fromIndex: number, toIndex: number) => void;
}

export function FieldList({
  step,
  selectedFieldId,
  onSelectField,
  onAddField,
  onRemoveField,
  onDuplicateField,
  onReorderFields,
}: FieldListProps) {
  if (!step) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Layers className="mx-auto size-12 mb-3 opacity-40" />
          <p className="text-sm font-medium">No step selected</p>
          <p className="text-xs mt-1">Select a step from the sidebar to manage its fields.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="border-b px-6 py-3">
        <h2 className="text-base font-semibold">{step.title}</h2>
        {step.description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {step.description}
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 min-h-0 h-full">
        <div className="flex flex-col gap-2 p-6">
          {step.fields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No fields in this step yet.
              </p>
              <FieldTypePicker
                onSelectType={(type) => onAddField(step.id, type)}
              />
            </div>
          ) : (
            <>
              {step.fields.map((field, index) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  index={index}
                  totalFields={step.fields.length}
                  isSelected={field.id === selectedFieldId}
                  onSelect={() => onSelectField(field.id)}
                  onMoveUp={() => onReorderFields(step.id, index, index - 1)}
                  onMoveDown={() => onReorderFields(step.id, index, index + 1)}
                  onDelete={() => onRemoveField(step.id, field.id)}
                  onDuplicate={() => onDuplicateField(step.id, field.id)}
                />
              ))}
              <div className="mt-2">
                <FieldTypePicker
                  onSelectType={(type) => onAddField(step.id, type)}
                />
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
