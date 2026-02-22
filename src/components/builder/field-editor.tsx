"use client";

import type { FormField, FormStep, FieldOption } from "@/lib/form-schema/types";
import { FIELD_REGISTRY } from "@/lib/form-schema/field-registry";
import { createDefaultOption } from "@/lib/form-schema/defaults";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ValidationEditor } from "./validation-editor";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface FieldEditorProps {
  field: FormField;
  step: FormStep;
  onUpdateField: (
    stepId: string,
    fieldId: string,
    updates: Partial<FormField>
  ) => void;
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: FieldOption[];
  onChange: (options: FieldOption[]) => void;
}) {
  const addOption = () => {
    onChange([...options, createDefaultOption(options.length)]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 1) return;
    onChange(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    onChange(
      options.map((opt, i) => (i === index ? { ...opt, ...updates } : opt))
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Options
        </Label>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={addOption}
          title="Add option"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>

      {options.map((option, index) => (
        <div key={option.id} className="flex items-center gap-2">
          <GripVertical className="size-3.5 text-muted-foreground shrink-0" />
          <Input
            value={option.label}
            onChange={(e) => {
              updateOption(index, {
                label: e.target.value,
                value: e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, "_")
                  .replace(/[^a-z0-9_]/g, ""),
              });
            }}
            placeholder={`Option ${index + 1}`}
            className="h-8 text-xs flex-1"
          />
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => removeOption(index)}
            disabled={options.length <= 1}
            className="text-muted-foreground hover:text-destructive shrink-0"
            title="Remove option"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addOption}
        className="w-full text-xs h-7"
      >
        <Plus className="size-3" />
        Add Option
      </Button>
    </div>
  );
}

export function FieldEditor({
  field,
  step,
  onUpdateField,
}: FieldEditorProps) {
  const fieldInfo = FIELD_REGISTRY[field.type];

  const update = (updates: Partial<FormField>) => {
    onUpdateField(step.id, field.id, updates);
  };

  const isChoiceField =
    field.type === "dropdown" ||
    field.type === "radio" ||
    field.type === "multi_select";

  return (
    <div className="flex h-full w-full md:w-[320px] flex-col border-l bg-muted/30">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Field Properties</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fieldInfo.label}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="field-label" className="text-xs">
              Label
            </Label>
            <Input
              id="field-label"
              value={field.label}
              onChange={(e) => update({ label: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="field-description" className="text-xs">
              Description
            </Label>
            <Input
              id="field-description"
              value={field.description || ""}
              onChange={(e) =>
                update({
                  description: e.target.value || undefined,
                })
              }
              placeholder="Help text for this field"
              className="h-8 text-sm"
            />
          </div>

          {/* Placeholder */}
          {field.type !== "checkbox" &&
            field.type !== "radio" &&
            field.type !== "file_upload" &&
            field.type !== "rating" && (
              <div className="space-y-1.5">
                <Label htmlFor="field-placeholder" className="text-xs">
                  Placeholder
                </Label>
                <Input
                  id="field-placeholder"
                  value={field.placeholder || ""}
                  onChange={(e) =>
                    update({
                      placeholder: e.target.value || undefined,
                    })
                  }
                  placeholder="Placeholder text"
                  className="h-8 text-sm"
                />
              </div>
            )}

          {/* Required toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="field-required" className="text-xs">
              Required
            </Label>
            <Switch
              id="field-required"
              checked={field.required}
              onCheckedChange={(checked: boolean) =>
                update({ required: checked })
              }
              size="sm"
            />
          </div>

          <Separator />

          {/* Choice field options */}
          {isChoiceField && field.options && (
            <>
              <OptionsEditor
                options={field.options}
                onChange={(options) => update({ options })}
              />
              <Separator />
            </>
          )}

          {/* Number-specific options */}
          {field.type === "number" && (
            <>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Number Settings
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="field-min" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="field-min"
                      type="number"
                      value={field.min ?? ""}
                      onChange={(e) =>
                        update({
                          min:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="field-max" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="field-max"
                      type="number"
                      value={field.max ?? ""}
                      onChange={(e) =>
                        update({
                          max:
                            e.target.value === ""
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="field-step" className="text-xs">
                    Step
                  </Label>
                  <Input
                    id="field-step"
                    type="number"
                    value={field.step ?? ""}
                    onChange={(e) =>
                      update({
                        step:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                    placeholder="1"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Rating-specific options */}
          {field.type === "rating" && (
            <>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rating Settings
                </Label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="field-ratingMax" className="text-xs">
                      Max Rating
                    </Label>
                    <Input
                      id="field-ratingMax"
                      type="number"
                      min={1}
                      max={10}
                      value={field.ratingMax ?? 5}
                      onChange={(e) =>
                        update({
                          ratingMax: Number(e.target.value) || 5,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="field-ratingIcon" className="text-xs">
                      Icon Style
                    </Label>
                    <Select
                      value={field.ratingIcon || "star"}
                      onValueChange={(value: "star" | "heart" | "thumb") =>
                        update({ ratingIcon: value })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="star">Star</SelectItem>
                        <SelectItem value="heart">Heart</SelectItem>
                        <SelectItem value="thumb">Thumb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Textarea-specific options */}
          {field.type === "textarea" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="field-rows" className="text-xs">
                  Rows
                </Label>
                <Input
                  id="field-rows"
                  type="number"
                  min={2}
                  max={20}
                  value={field.rows ?? 4}
                  onChange={(e) =>
                    update({ rows: Number(e.target.value) || 4 })
                  }
                  className="h-8 text-xs"
                />
              </div>
              <Separator />
            </>
          )}

          {/* File upload-specific options */}
          {field.type === "file_upload" && (
            <>
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Upload Settings
                </Label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="field-maxFileSize" className="text-xs">
                      Max File Size (MB)
                    </Label>
                    <Input
                      id="field-maxFileSize"
                      type="number"
                      min={1}
                      value={field.maxFileSize ?? 10}
                      onChange={(e) =>
                        update({
                          maxFileSize: Number(e.target.value) || 10,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="field-maxFiles" className="text-xs">
                      Max Files
                    </Label>
                    <Input
                      id="field-maxFiles"
                      type="number"
                      min={1}
                      max={20}
                      value={field.maxFiles ?? 1}
                      onChange={(e) =>
                        update({
                          maxFiles: Number(e.target.value) || 1,
                        })
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="field-allowedFileTypes" className="text-xs">
                      Allowed File Types
                    </Label>
                    <Input
                      id="field-allowedFileTypes"
                      value={
                        field.allowedFileTypes?.join(", ") ||
                        ".pdf, .jpg, .png, .doc, .docx"
                      }
                      onChange={(e) =>
                        update({
                          allowedFileTypes: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder=".pdf, .jpg, .png"
                      className="h-8 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Comma-separated list of extensions
                    </p>
                  </div>
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Validation rules */}
          <ValidationEditor
            rules={field.validation}
            onChange={(rules) => update({ validation: rules })}
          />
        </div>
      </ScrollArea>
    </div>
  );
}
