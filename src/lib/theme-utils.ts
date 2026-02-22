import type { FormTheme } from "@/lib/form-schema/types";

export interface ThemeOverrides {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  borderRadius?: string;
}

/**
 * Converts a FormTheme (+ optional overrides) into CSS custom properties
 * that override shadcn/ui's design tokens. When applied as inline styles
 * on a wrapper element, all descendant shadcn components inherit the theme.
 */
export function buildThemeCSSVars(
  theme: FormTheme,
  overrides?: ThemeOverrides
): React.CSSProperties {
  const primary = overrides?.primaryColor || theme.primaryColor;
  const bg = overrides?.backgroundColor || theme.backgroundColor;
  const text = overrides?.textColor || theme.textColor;
  const font = overrides?.fontFamily || theme.fontFamily;
  const radius = overrides?.borderRadius || theme.borderRadius;

  const primaryFg = getContrastColor(primary);

  // Derive muted colors from background
  const mutedBg = adjustBrightness(bg, -0.03);
  const mutedFg = blendColors(text, bg, 0.45);

  return {
    // Primary button, checkbox, radio, progress, focus ring
    "--primary": primary,
    "--primary-foreground": primaryFg,
    "--ring": primary,
    // Page / card background
    "--background": bg,
    "--card": bg,
    "--popover": bg,
    // Text colors
    "--foreground": text,
    "--card-foreground": text,
    "--popover-foreground": text,
    // Muted (labels, descriptions, secondary text)
    "--muted": mutedBg,
    "--muted-foreground": mutedFg,
    // Input border, general border
    "--border": adjustBrightness(bg, -0.08),
    "--input": adjustBrightness(bg, -0.08),
    // Accent (hover states on ghost buttons, etc.)
    "--accent": adjustBrightness(bg, -0.03),
    "--accent-foreground": text,
    // Secondary
    "--secondary": adjustBrightness(bg, -0.03),
    "--secondary-foreground": text,
    // Radius
    "--radius": radius,
    // Font
    fontFamily: font,
    // Background + text on the element itself
    backgroundColor: bg,
    color: text,
  } as React.CSSProperties;
}

/**
 * Returns white or black depending on the luminance of the input hex color.
 */
export function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return null;
  return {
    r: parseInt(cleaned.slice(0, 2), 16),
    g: parseInt(cleaned.slice(2, 4), 16),
    b: parseInt(cleaned.slice(4, 6), 16),
  };
}

/**
 * Adjusts brightness of a hex color. Positive = lighter, negative = darker.
 */
function adjustBrightness(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const adjust = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + 255 * amount)));
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
}

/**
 * Blends two hex colors. ratio=0 returns color1, ratio=1 returns color2.
 */
function blendColors(hex1: string, hex2: string, ratio: number): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return hex1;
  const blend = (c1: number, c2: number) =>
    Math.round(c1 * (1 - ratio) + c2 * ratio);
  return rgbToHex(
    blend(rgb1.r, rgb2.r),
    blend(rgb1.g, rgb2.g),
    blend(rgb1.b, rgb2.b)
  );
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
  );
}
