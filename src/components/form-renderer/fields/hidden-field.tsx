"use client";

import { useEffect } from "react";
import type { FieldProps } from "../field-renderer";

export function HiddenField({ field, value, onChange }: FieldProps) {
  // On mount, set the default value from field.placeholder (used as default value for hidden fields)
  useEffect(() => {
    if (value === null || value === undefined) {
      const defaultValue = field.placeholder ?? "";
      // Auto-fill UTM params from URL if the field label hints at it
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const label = field.label.toLowerCase();
        const utmKey = label.startsWith("utm_") ? label : null;
        const paramValue = utmKey ? (params.get(utmKey) ?? params.get(label) ?? defaultValue) : (params.get(label) ?? defaultValue);
        onChange(paramValue);
      } else {
        onChange(defaultValue);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hidden fields render nothing visible
  return null;
}
