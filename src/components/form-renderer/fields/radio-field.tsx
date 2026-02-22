"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function RadioField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-muted-foreground text-xs">{field.description}</p>
      )}
      <RadioGroup
        value={typeof value === "string" ? value : undefined}
        onValueChange={(val) => onChange(val)}
        onBlur={onBlur}
      >
        {(field.options || []).map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${field.id}-${option.id}`}
            />
            <Label
              htmlFor={`${field.id}-${option.id}`}
              className="cursor-pointer font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
