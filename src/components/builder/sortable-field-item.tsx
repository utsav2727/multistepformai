"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FormField } from "@/lib/form-schema/types";
import { FieldItem } from "./field-item";
import { GripVertical } from "lucide-react";

interface SortableFieldItemProps {
  field: FormField;
  index: number;
  totalFields: number;
  isSelected: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableFieldItem(props: SortableFieldItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-1">
      <div
        {...attributes}
        {...listeners}
        className="flex cursor-grab items-center text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing shrink-0 touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <FieldItem {...props} />
      </div>
    </div>
  );
}
