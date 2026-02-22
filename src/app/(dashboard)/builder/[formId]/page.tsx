"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import type { Form, FormSchema, FormSettings } from "@/lib/form-schema/types";
import {
  createDefaultSchema,
  createDefaultSettings,
} from "@/lib/form-schema/defaults";
import { useFormBuilder } from "@/hooks/use-form-builder";
import { useAutoSave } from "@/hooks/use-auto-save";
import { BuilderTopbar } from "@/components/builder/builder-topbar";
import { BuilderLayout } from "@/components/builder/builder-layout";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BuilderPage() {
  const params = useParams<{ formId: string }>();
  const formId = params.formId;

  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "editor";

  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(initialTab);

  // Fetch form data
  useEffect(() => {
    async function fetchForm() {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${formId}`);
        if (!response.ok) {
          throw new Error("Failed to load form");
        }
        const data = await response.json();
        setForm(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load form");
      } finally {
        setLoading(false);
      }
    }

    fetchForm();
  }, [formId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-destructive">{error || "Form not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <BuilderPageInner
      form={form}
      setForm={setForm}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

function BuilderPageInner({
  form,
  setForm,
  activeTab,
  onTabChange,
}: {
  form: Form;
  setForm: (form: Form) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  const initialSchema: FormSchema = form.schema || createDefaultSchema();
  const initialSettings: FormSettings = form.settings || createDefaultSettings();

  const builder = useFormBuilder(initialSchema, initialSettings);

  const { saving, lastSaved } = useAutoSave({
    formId: form.id,
    schema: builder.schema,
    settings: builder.settings,
    isDirty: builder.isDirty,
    onSaved: () => {
      builder.markClean();
    },
  });

  const handleTitleChange = useCallback(
    async (newTitle: string) => {
      try {
        const response = await fetch(`/api/forms/${form.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
        if (response.ok) {
          const updated = await response.json();
          setForm(updated);
        }
      } catch (err) {
        console.error("Failed to update title:", err);
      }
    },
    [form.id, setForm]
  );

  const handlePublishToggle = useCallback(async () => {
    try {
      const response = await fetch(`/api/forms/${form.id}/publish`, {
        method: "POST",
      });
      if (response.ok) {
        const updated = await response.json();
        setForm(updated);
        if (updated.status === "published") {
          const publicUrl = `${window.location.origin}/f/${form.id}`;
          toast.success("Form published!", {
            description: "Your form is now live and accepting submissions.",
            action: {
              label: "Copy Link",
              onClick: () => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied to clipboard");
              },
            },
            duration: 8000,
          });
        } else {
          toast.info("Form unpublished", {
            description: "Your form is no longer publicly accessible.",
          });
        }
      }
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      toast.error("Failed to update publish status");
    }
  }, [form.id, setForm]);

  return (
    <div className="flex h-full flex-col">
      <BuilderTopbar
        formId={form.id}
        title={form.title}
        onTitleChange={handleTitleChange}
        saving={saving}
        lastSaved={lastSaved}
        isDirty={builder.isDirty}
        status={form.status}
        onPublishToggle={handlePublishToggle}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      <BuilderLayout
        builder={builder}
        activeTab={activeTab}
        formId={form.id}
        formStatus={form.status}
      />
    </div>
  );
}
