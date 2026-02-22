"use client";

import type { FormTheme } from "@/lib/form-schema/types";
import { getContrastColor } from "@/lib/theme-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ThemeEditorProps {
  theme: FormTheme;
  onChange: (theme: FormTheme) => void;
}

const BORDER_RADIUS_OPTIONS = [
  { value: "0px", label: "None (0px)" },
  { value: "4px", label: "Small (4px)" },
  { value: "8px", label: "Medium (8px)" },
  { value: "12px", label: "Large (12px)" },
  { value: "16px", label: "Extra Large (16px)" },
];

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter (Default)" },
  { value: "system-ui, sans-serif", label: "System Default" },
  { value: "'Roboto', sans-serif", label: "Roboto" },
  { value: "'Open Sans', sans-serif", label: "Open Sans" },
  { value: "'Lato', sans-serif", label: "Lato" },
  { value: "'Poppins', sans-serif", label: "Poppins" },
  { value: "'Playfair Display', serif", label: "Playfair Display" },
  { value: "Georgia, serif", label: "Georgia" },
];

export function ThemeEditor({ theme, onChange }: ThemeEditorProps) {
  const update = (updates: Partial<FormTheme>) => {
    onChange({ ...theme, ...updates });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Theme</h3>

      <div className="space-y-3">
        {/* Primary Color */}
        <div className="space-y-1.5">
          <Label htmlFor="theme-primary" className="text-xs">
            Primary Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="theme-primary"
              type="color"
              value={theme.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="h-8 w-12 p-1 cursor-pointer"
            />
            <Input
              value={theme.primaryColor}
              onChange={(e) => update({ primaryColor: e.target.value })}
              className="h-8 text-xs flex-1"
              placeholder="#6366f1"
            />
          </div>
        </div>

        {/* Background Color */}
        <div className="space-y-1.5">
          <Label htmlFor="theme-bg" className="text-xs">
            Background Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="theme-bg"
              type="color"
              value={theme.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="h-8 w-12 p-1 cursor-pointer"
            />
            <Input
              value={theme.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })}
              className="h-8 text-xs flex-1"
              placeholder="#ffffff"
            />
          </div>
        </div>

        {/* Text Color */}
        <div className="space-y-1.5">
          <Label htmlFor="theme-text" className="text-xs">
            Text Color
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="theme-text"
              type="color"
              value={theme.textColor}
              onChange={(e) => update({ textColor: e.target.value })}
              className="h-8 w-12 p-1 cursor-pointer"
            />
            <Input
              value={theme.textColor}
              onChange={(e) => update({ textColor: e.target.value })}
              className="h-8 text-xs flex-1"
              placeholder="#0f172a"
            />
          </div>
        </div>

        {/* Font Family */}
        <div className="space-y-1.5">
          <Label htmlFor="theme-font" className="text-xs">
            Font Family
          </Label>
          <Select
            value={theme.fontFamily}
            onValueChange={(value) => update({ fontFamily: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-1.5">
          <Label htmlFor="theme-radius" className="text-xs">
            Border Radius
          </Label>
          <Select
            value={theme.borderRadius}
            onValueChange={(value) => update({ borderRadius: value })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_RADIUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-1.5">
        <Label className="text-xs">Preview</Label>
        <div
          className="rounded-md border p-4 space-y-3"
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            fontFamily: theme.fontFamily,
            borderRadius: theme.borderRadius,
          }}
        >
          <p className="text-sm font-medium">Sample question label</p>
          <div
            className="h-9 rounded border px-3 flex items-center text-xs opacity-50"
            style={{
              borderColor: theme.textColor + "30",
              borderRadius: theme.borderRadius,
            }}
          >
            Placeholder text...
          </div>
          <div className="flex gap-2">
            <span
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-medium"
              style={{
                backgroundColor: theme.primaryColor,
                color: getContrastColor(theme.primaryColor),
                borderRadius: theme.borderRadius,
              }}
            >
              Submit
            </span>
            <span
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-xs font-medium border"
              style={{
                borderColor: theme.textColor + "20",
                color: theme.textColor,
                borderRadius: theme.borderRadius,
              }}
            >
              Previous
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
