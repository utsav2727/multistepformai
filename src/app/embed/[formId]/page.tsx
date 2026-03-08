import connectDB from "@/lib/db";
import { Form } from "@/models/Form";
import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { EmbedFormClient } from "./embed-form-client";
import type { FormSchema, FormSettings } from "@/lib/form-schema/types";
import type { ThemeOverrides } from "@/lib/theme-utils";

export default async function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { formId } = await params;
  const sp = await searchParams;

  if (!mongoose.Types.ObjectId.isValid(formId)) {
    notFound();
  }

  await connectDB();
  const form = await Form.findOne({ _id: formId, status: "published" });

  if (!form) {
    notFound();
  }

  // Parse theme overrides from URL params (set by embed.js data attributes)
  const themeOverrides: ThemeOverrides = {};
  if (typeof sp.primary === "string") themeOverrides.primaryColor = `#${sp.primary}`;
  if (typeof sp.bg === "string") themeOverrides.backgroundColor = `#${sp.bg}`;
  if (typeof sp.text === "string") themeOverrides.textColor = `#${sp.text}`;
  if (typeof sp.font === "string") themeOverrides.fontFamily = sp.font;
  if (typeof sp.radius === "string") themeOverrides.borderRadius = sp.radius;

  const hasOverrides = Object.keys(themeOverrides).length > 0;

  return (
    <EmbedFormClient
      formId={(form as any)._id.toString()}
      schema={form.jsonSchema as unknown as FormSchema}
      settings={form.settings as unknown as FormSettings}
      themeOverrides={hasOverrides ? themeOverrides : undefined}
    />
  );
}
