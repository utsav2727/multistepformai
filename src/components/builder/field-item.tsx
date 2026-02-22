"use client";

import type { FormField } from "@/lib/form-schema/types";
import { FIELD_REGISTRY } from "@/lib/form-schema/field-registry";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Asterisk,
  Type,
  Mail,
  Phone,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  ListChecks,
  CircleDot,
  CheckSquare,
  Upload,
  Star,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  Mail,
  Phone,
  AlignLeft,
  Hash,
  Calendar,
  ChevronDown,
  ListChecks,
  CircleDot,
  CheckSquare,
  Upload,
  Star,
};

interface FieldItemProps {
  field: FormField;
  index: number;
  totalFields: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export function FieldItem({
  field,
  index,
  totalFields,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}: FieldItemProps) {
  const fieldInfo = FIELD_REGISTRY[field.type];
  const IconComponent = ICON_MAP[fieldInfo.icon];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border hover:border-primary/30 hover:bg-muted/50"
      )}
      onClick={onSelect}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        {IconComponent && (
          <IconComponent className="size-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{field.label}</span>
          {field.required && (
            <Asterisk className="size-3 text-destructive shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {fieldInfo.label}
          </Badge>
          {field.description && (
            <span className="text-[11px] text-muted-foreground truncate">
              {field.description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={index === 0}
          title="Move up"
        >
          <ArrowUp className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={index === totalFields - 1}
          title="Move down"
        >
          <ArrowDown className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete field"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
