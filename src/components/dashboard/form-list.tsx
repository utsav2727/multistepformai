"use client";

import { FormCard } from "./form-card";
import { EmptyState } from "./empty-state";
import type { FormListItem } from "@/types/api";

interface FormListProps {
  forms: FormListItem[];
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
}

export function FormList({ forms, onDuplicate, onDelete }: FormListProps) {
  if (forms.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <FormCard
          key={form.id}
          form={form}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
