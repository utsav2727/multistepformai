import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { FormRenderer } from "@/components/form-renderer/form-renderer";
import { ViewTracker } from "@/components/form-renderer/view-tracker";
import { buildThemeCSSVars } from "@/lib/theme-utils";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";

interface PublicFormPageProps {
  params: Promise<{ formId: string }>;
}

export default async function PublicFormPage({ params }: PublicFormPageProps) {
  const { formId } = await params;
  const supabase = createAdminClient();

  const { data: form, error } = await supabase
    .from("forms")
    .select("id, title, description, schema, settings, status")
    .eq("id", formId)
    .single();

  if (error || !form || form.status !== "published") {
    notFound();
  }

  const schema = form.schema as FormSchema;
  const settings = form.settings as FormSettings;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-3 sm:p-4"
      style={buildThemeCSSVars(settings.theme)}
    >
      <ViewTracker formId={formId} />
      <div className="w-full max-w-2xl">
        <div className="mb-6 sm:mb-8 text-center">
          {settings.theme.logoUrl && (
            <img
              src={settings.theme.logoUrl}
              alt="Logo"
              className="mx-auto mb-4 h-10 sm:h-12"
            />
          )}
          <h1 className="text-xl sm:text-2xl font-bold">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-sm sm:text-base text-muted-foreground">{form.description}</p>
          )}
        </div>
        <FormRenderer
          schema={schema}
          settings={settings}
          submitUrl={`/api/forms/${formId}/submissions`}
        />
      </div>
    </div>
  );
}
