"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function NumberField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(null);
    } else {
      const num = parseFloat(raw);
      onChange(isNaN(num) ? null : num);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-muted-foreground text-xs">{field.description}</p>
      )}
      <Input
        id={field.id}
        type="number"
        placeholder={field.placeholder || ""}
        value={value !== null && value !== undefined ? String(value) : ""}
        onChange={handleChange}
        onBlur={onBlur}
        min={field.min}
        max={field.max}
        step={field.step}
        aria-invalid={touched && !!error}
      />
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
