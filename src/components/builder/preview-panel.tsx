"use client";

import { useState } from "react";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { buildThemeCSSVars } from "@/lib/theme-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

interface PreviewPanelProps {
  schema: FormSchema;
  settings: FormSettings;
}

export function PreviewPanel({ schema, settings }: PreviewPanelProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  return (
    <ScrollArea className="flex-1 min-h-0 h-full w-full">
      <div className="flex flex-col items-center p-4 sm:p-6">
        {/* Device toggle */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Live Preview
          </span>
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5 gap-0.5">
            <Button
              variant={device === "desktop" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setDevice("desktop")}
              title="Desktop preview"
              className="h-6 w-6"
            >
              <Monitor className="size-3.5" />
            </Button>
            <Button
              variant={device === "mobile" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setDevice("mobile")}
              title="Mobile preview"
              className="h-6 w-6"
            >
              <Smartphone className="size-3.5" />
            </Button>
          </div>
        </div>

        {device === "desktop" ? (
          <div className="w-full max-w-2xl">
            <div
              className="rounded-xl border border-border bg-background shadow-sm overflow-hidden"
              style={buildThemeCSSVars(settings.theme)}
            >
              <div className="p-4 sm:p-6">
                <FormRenderer
                  key="desktop"
                  schema={schema}
                  settings={settings}
                  submitUrl="#preview"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Mobile device frame */
          <div className="flex justify-center">
            <div className="relative">
              {/* Phone shell */}
              <div className="rounded-[2.5rem] border-[6px] border-foreground/20 bg-foreground/10 shadow-xl overflow-hidden"
                style={{ width: 375, minHeight: 667 }}>
                {/* Status bar */}
                <div className="flex items-center justify-between bg-muted/50 px-5 py-2">
                  <span className="text-[10px] font-medium text-muted-foreground">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-4 rounded-sm border border-muted-foreground/50 bg-muted-foreground/30" />
                  </div>
                </div>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-foreground/20 rounded-b-xl" />
                {/* Content */}
                <div
                  className="bg-background overflow-y-auto"
                  style={{ ...buildThemeCSSVars(settings.theme), height: 580 }}
                >
                  <div className="p-4">
                    <FormRenderer
                      key="mobile"
                      schema={schema}
                      settings={settings}
                      submitUrl="#preview"
                    />
                  </div>
                </div>
                {/* Home indicator */}
                <div className="flex justify-center py-2 bg-background">
                  <div className="h-1 w-24 rounded-full bg-foreground/20" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
