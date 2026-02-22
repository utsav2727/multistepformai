"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Star, Heart, ThumbsUp } from "lucide-react";
import type { FieldProps } from "../field-renderer";

export function RatingField({ field, value, onChange, onBlur, error, touched }: FieldProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRating = field.ratingMax || 5;
  const iconType = field.ratingIcon || "star";
  const currentValue = typeof value === "number" ? value : 0;

  const getIcon = (index: number) => {
    const isFilled = hoveredIndex !== null ? index <= hoveredIndex : index <= currentValue;
    const className = `size-6 cursor-pointer transition-colors ${
      isFilled
        ? iconType === "heart"
          ? "fill-red-500 text-red-500"
          : iconType === "thumb"
            ? "fill-blue-500 text-blue-500"
            : "fill-yellow-400 text-yellow-400"
        : "text-muted-foreground/40"
    }`;

    switch (iconType) {
      case "heart":
        return <Heart className={className} />;
      case "thumb":
        return <ThumbsUp className={className} />;
      case "star":
      default:
        return <Star className={className} />;
    }
  };

  const handleClick = (index: number) => {
    // Allow deselecting by clicking the same value
    if (index === currentValue) {
      onChange(0);
    } else {
      onChange(index);
    }
    if (onBlur) onBlur();
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
      <div
        className="flex gap-1"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            className="rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Rate ${index} of ${maxRating}`}
          >
            {getIcon(index)}
          </button>
        ))}
      </div>
      {currentValue > 0 && (
        <p className="text-muted-foreground text-xs">
          {currentValue} / {maxRating}
        </p>
      )}
      {touched && error && (
        <p className="text-destructive text-xs">{error}</p>
      )}
    </div>
  );
}
