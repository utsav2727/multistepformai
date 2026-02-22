"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function EmailField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
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
        type="email"
        placeholder={field.placeholder || "you@example.com"}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={touched && !!error}
      />
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
