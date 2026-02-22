"use client";

import { useEffect, useRef, useCallback } from "react";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { buildThemeCSSVars, type ThemeOverrides } from "@/lib/theme-utils";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";

interface EmbedFormClientProps {
  formId: string;
  schema: FormSchema;
  settings: FormSettings;
  themeOverrides?: ThemeOverrides;
}

export function EmbedFormClient({
  formId,
  schema,
  settings,
  themeOverrides,
}: EmbedFormClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Send height to parent for iframe resize
  const sendHeight = useCallback(() => {
    if (!containerRef.current) return;
    const height = containerRef.current.scrollHeight;
    window.parent.postMessage(
      { source: "formai", type: "resize", formId, height },
      "*"
    );
  }, [formId]);

  useEffect(() => {
    // Signal to parent that the form is ready
    window.parent.postMessage(
      { source: "formai", type: "ready", formId },
      "*"
    );
    sendHeight();

    const observer = new ResizeObserver(() => {
      sendHeight();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [sendHeight, formId]);

  const handleSubmitted = () => {
    window.parent.postMessage(
      { source: "formai", type: "submitted", formId },
      "*"
    );
    sendHeight();
  };

  return (
    <div
      ref={containerRef}
      className="p-4"
      style={buildThemeCSSVars(settings.theme, themeOverrides)}
    >
      <FormRenderer
        schema={schema}
        settings={settings}
        submitUrl={`/api/forms/${formId}/submissions`}
        onSubmitted={handleSubmitted}
        themeOverrides={themeOverrides}
      />
    </div>
  );
}
