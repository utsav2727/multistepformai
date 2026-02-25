"use client";

import type { FieldProps } from "../field-renderer";

export function SliderField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const min = field.min ?? 0;
  const max = field.max ?? 100;
  const step = field.step ?? 1;
  const numericValue = typeof value === "number" ? value : min;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">
          {field.label}
          {field.required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <span className="text-sm font-semibold tabular-nums text-primary">
          {numericValue}
        </span>
      </div>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground w-8 text-right">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
          className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-muted [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--color-primary, #6366f1) 0%, var(--color-primary, #6366f1) ${((numericValue - min) / (max - min)) * 100}%, hsl(var(--muted)) ${((numericValue - min) / (max - min)) * 100}%, hsl(var(--muted)) 100%)`,
          }}
        />
        <span className="text-xs text-muted-foreground w-8">{max}</span>
      </div>
      {touched && error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
