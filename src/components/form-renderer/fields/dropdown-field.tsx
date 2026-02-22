"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { FieldProps } from "../field-renderer";

export function DropdownField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-muted-foreground text-xs">{field.description}</p>
      )}
      <Select
        value={typeof value === "string" ? value : undefined}
        onValueChange={(val) => onChange(val)}
        onOpenChange={(open) => {
          if (!open && onBlur) onBlur();
        }}
      >
        <SelectTrigger
          id={field.id}
          className="w-full"
          aria-invalid={touched && !!error}
        >
          <SelectValue placeholder={field.placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {(field.options || []).map((option) => (
            <SelectItem key={option.id} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
