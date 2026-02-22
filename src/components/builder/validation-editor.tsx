"use client";

import { useState } from "react";
import type { ValidationRule } from "@/lib/form-schema/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface ValidationEditorProps {
  rules: ValidationRule[];
  onChange: (rules: ValidationRule[]) => void;
}

const VALIDATION_TYPES: {
  value: ValidationRule["type"];
  label: string;
  valueType: "string" | "number" | "boolean";
}[] = [
  { value: "required", label: "Required", valueType: "boolean" },
  { value: "min_length", label: "Min Length", valueType: "number" },
  { value: "max_length", label: "Max Length", valueType: "number" },
  { value: "min", label: "Min Value", valueType: "number" },
  { value: "max", label: "Max Value", valueType: "number" },
  { value: "pattern", label: "Pattern (Regex)", valueType: "string" },
  { value: "file_size", label: "Max File Size (MB)", valueType: "number" },
  { value: "file_types", label: "Allowed File Types", valueType: "string" },
];

export function ValidationEditor({ rules, onChange }: ValidationEditorProps) {
  const addRule = () => {
    const newRule: ValidationRule = {
      type: "min_length",
      value: "",
      message: "",
    };
    onChange([...rules, newRule]);
  };

  const removeRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    onChange(updated);
  };

  const updateRule = (
    index: number,
    updates: Partial<ValidationRule>
  ) => {
    const updated = rules.map((rule, i) =>
      i === index ? { ...rule, ...updates } : rule
    );
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Validation Rules
        </Label>
        <Button variant="ghost" size="icon-xs" onClick={addRule} title="Add rule">
          <Plus className="size-3.5" />
        </Button>
      </div>

      {rules.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No validation rules. Click + to add one.
        </p>
      )}

      {rules.map((rule, index) => (
        <div
          key={index}
          className="space-y-2 rounded-md border border-border p-3"
        >
          <div className="flex items-center gap-2">
            <Select
              value={rule.type}
              onValueChange={(value: ValidationRule["type"]) =>
                updateRule(index, {
                  type: value,
                  value: value === "required" ? true : "",
                })
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VALIDATION_TYPES.map((vt) => (
                  <SelectItem key={vt.value} value={vt.value}>
                    {vt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => removeRule(index)}
              className="text-muted-foreground hover:text-destructive shrink-0"
              title="Remove rule"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>

          {rule.type !== "required" && (
            <Input
              placeholder="Value"
              value={String(rule.value)}
              onChange={(e) => {
                const typeInfo = VALIDATION_TYPES.find(
                  (vt) => vt.value === rule.type
                );
                const newValue =
                  typeInfo?.valueType === "number"
                    ? Number(e.target.value) || 0
                    : e.target.value;
                updateRule(index, { value: newValue });
              }}
              className="h-8 text-xs"
            />
          )}

          <Input
            placeholder="Error message"
            value={rule.message}
            onChange={(e) =>
              updateRule(index, { message: e.target.value })
            }
            className="h-8 text-xs"
          />
        </div>
      ))}
    </div>
  );
}
