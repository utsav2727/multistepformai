"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function MultiSelectField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const selectedValues: string[] = Array.isArray(value) ? value : [];

  const handleToggle = (optionValue: string, checked: boolean) => {
    let newValues: string[];
    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter((v) => v !== optionValue);
    }
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-muted-foreground text-xs">{field.description}</p>
      )}
      <div className="space-y-2" onBlur={onBlur}>
        {(field.options || []).map((option) => {
          const isChecked = selectedValues.includes(option.value);
          return (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${field.id}-${option.id}`}
                checked={isChecked}
                onCheckedChange={(checked) =>
                  handleToggle(option.value, checked === true)
                }
              />
              <Label
                htmlFor={`${field.id}-${option.id}`}
                className="cursor-pointer font-normal"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
