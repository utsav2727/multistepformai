"use client";

import type { FormSchema, FormSettings } from "@/lib/form-schema/types";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { buildThemeCSSVars } from "@/lib/theme-utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PreviewPanelProps {
  schema: FormSchema;
  settings: FormSettings;
}

export function PreviewPanel({ schema, settings }: PreviewPanelProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col items-center p-4 sm:p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-4 flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Live Preview
            </span>
          </div>

          <div
            className="rounded-xl border border-border bg-background shadow-sm overflow-hidden"
            style={buildThemeCSSVars(settings.theme)}
          >
            <div className="p-4 sm:p-6">
              <FormRenderer
                schema={schema}
                settings={settings}
                submitUrl="#preview"
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
