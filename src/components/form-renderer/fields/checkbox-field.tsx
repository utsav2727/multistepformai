"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function CheckboxField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const isChecked = value === true || value === "true";

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-2" onBlur={onBlur}>
        <Checkbox
          id={field.id}
          checked={isChecked}
          onCheckedChange={(checked) => onChange(checked === true)}
          aria-invalid={touched && !!error}
        />
        <div className="grid gap-1 leading-none">
          <Label htmlFor={field.id} className="cursor-pointer font-normal">
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {field.description && (
            <p className="text-muted-foreground text-xs">{field.description}</p>
          )}
        </div>
      </div>
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
