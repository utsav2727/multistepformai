"use client";

import { useState } from "react";
import type { FieldType } from "@/lib/form-schema/types";
import { FIELD_TYPES_BY_CATEGORY } from "@/lib/form-schema/field-registry";
import type { FieldTypeInfo } from "@/lib/form-schema/field-registry";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
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

interface FieldTypePickerProps {
  onSelectType: (type: FieldType) => void;
}

function FieldTypeCard({
  info,
  onClick,
}: {
  info: FieldTypeInfo;
  onClick: () => void;
}) {
  const IconComponent = ICON_MAP[info.icon];

  return (
    <button
      className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
        {IconComponent && (
          <IconComponent className="size-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{info.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {info.description}
        </p>
      </div>
    </button>
  );
}

export function FieldTypePicker({ onSelectType }: FieldTypePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (type: FieldType) => {
    onSelectType(type);
    setOpen(false);
  };

  const categories = [
    { key: "basic" as const, label: "Basic Fields" },
    { key: "choice" as const, label: "Choice Fields" },
    { key: "advanced" as const, label: "Advanced Fields" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="size-4" />
          Add Field
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Field</DialogTitle>
          <DialogDescription>
            Choose a field type to add to your form.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
          {categories.map((category) => (
            <div key={category.key}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category.label}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FIELD_TYPES_BY_CATEGORY[category.key].map((info) => (
                  <FieldTypeCard
                    key={info.type}
                    info={info}
                    onClick={() => handleSelect(info.type)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
