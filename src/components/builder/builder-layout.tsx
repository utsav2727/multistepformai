"use client";

import { useState } from "react";
import type { UseFormBuilderReturn } from "@/hooks/use-form-builder";
import { StepSidebar } from "./step-sidebar";
import { FieldList } from "./field-list";
import { FieldEditor } from "./field-editor";
import { PreviewPanel } from "./preview-panel";
import { ThemeEditor } from "./theme-editor";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Layers,
  ListChecks,
  Settings2,
  Code,
  Globe,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { toast } from "sonner";

interface BuilderLayoutProps {
  builder: UseFormBuilderReturn;
  activeTab: string;
  formId?: string;
  formStatus?: "draft" | "published" | "archived";
}

function SettingsPanel({ builder }: { builder: UseFormBuilderReturn }) {
  const { settings, updateSettings } = builder;

  return (
    <ScrollArea className="flex-1 min-h-0 h-full w-full">
      <div className="mx-auto max-w-2xl space-y-8 p-4 sm:p-6">
        {/* Theme */}
        <ThemeEditor
          theme={settings.theme}
          onChange={(theme) => updateSettings({ theme })}
        />

        <Separator />

        {/* Behavior */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Behavior</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Progress Bar</Label>
              <Switch
                checked={settings.behavior.showProgressBar}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({
                    behavior: {
                      ...settings.behavior,
                      showProgressBar: checked,
                    },
                  })
                }
                size="sm"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Step Numbers</Label>
              <Switch
                checked={settings.behavior.showStepNumbers}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({
                    behavior: {
                      ...settings.behavior,
                      showStepNumbers: checked,
                    },
                  })
                }
                size="sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Submit Button Text</Label>
              <Input
                value={settings.behavior.submitButtonText}
                onChange={(e) =>
                  updateSettings({
                    behavior: {
                      ...settings.behavior,
                      submitButtonText: e.target.value,
                    },
                  })
                }
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Success Message</Label>
              <Input
                value={settings.behavior.successMessage}
                onChange={(e) =>
                  updateSettings({
                    behavior: {
                      ...settings.behavior,
                      successMessage: e.target.value,
                    },
                  })
                }
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Success Redirect URL</Label>
              <Input
                value={settings.behavior.successRedirectUrl || ""}
                onChange={(e) =>
                  updateSettings({
                    behavior: {
                      ...settings.behavior,
                      successRedirectUrl: e.target.value || null,
                    },
                  })
                }
                placeholder="https://example.com/thank-you"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Notifications</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Email on Submission</Label>
              <Switch
                checked={settings.notifications.emailOnSubmission}
                onCheckedChange={(checked: boolean) =>
                  updateSettings({
                    notifications: {
                      ...settings.notifications,
                      emailOnSubmission: checked,
                    },
                  })
                }
                size="sm"
              />
            </div>

            {settings.notifications.emailOnSubmission && (
              <div className="space-y-1.5">
                <Label className="text-xs">Notification Email</Label>
                <Input
                  type="email"
                  value={settings.notifications.notificationEmail || ""}
                  onChange={(e) =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        notificationEmail: e.target.value || null,
                      },
                    })
                  }
                  placeholder="you@example.com"
                  className="h-8 text-sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

type EmbedMode = "inline" | "popup" | "slide";

function EmbedPanel({
  formId,
  formStatus,
  settings,
}: {
  formId: string;
  formStatus: "draft" | "published" | "archived";
  settings?: import("@/lib/form-schema/types").FormSettings;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const [embedMode, setEmbedMode] = useState<EmbedMode>("inline");
  const [includeTheme, setIncludeTheme] = useState(false);

  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : "";
  const publicUrl = `${baseUrl}/f/${formId}`;
  const embedScriptUrl = `${baseUrl}/embed.js`;

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  // Build theme data attributes string
  const themeAttrs = (() => {
    if (!includeTheme || !settings) return "";
    const t = settings.theme;
    const attrs: string[] = [];
    if (t.primaryColor && t.primaryColor !== "#6366f1")
      attrs.push(`  data-primary-color="${t.primaryColor.replace("#", "")}"`);
    if (t.backgroundColor && t.backgroundColor !== "#ffffff")
      attrs.push(`  data-bg-color="${t.backgroundColor.replace("#", "")}"`);
    if (t.textColor && t.textColor !== "#0f172a")
      attrs.push(`  data-text-color="${t.textColor.replace("#", "")}"`);
    if (t.fontFamily && t.fontFamily !== "Inter")
      attrs.push(`  data-font="${t.fontFamily}"`);
    if (t.borderRadius && t.borderRadius !== "8px")
      attrs.push(`  data-border-radius="${t.borderRadius}"`);
    return attrs.length > 0 ? "\n" + attrs.join("\n") : "";
  })();

  // Generate embed code based on mode
  const getEmbedCode = () => {
    if (embedMode === "inline") {
      return `<script\n  src="${embedScriptUrl}"\n  data-formai-id="${formId}"\n  data-mode="inline"${themeAttrs}\n></script>`;
    }
    if (embedMode === "popup") {
      return `<script\n  src="${embedScriptUrl}"\n  data-formai-id="${formId}"\n  data-mode="popup"${themeAttrs}\n></script>\n\n<!-- Add this button wherever you want the trigger -->\n<button onclick="FormAI.open()">Open Form</button>`;
    }
    // slide
    return `<script\n  src="${embedScriptUrl}"\n  data-formai-id="${formId}"\n  data-mode="slide"${themeAttrs}\n></script>\n\n<!-- Add this button wherever you want the trigger -->\n<button onclick="FormAI.open()">Contact Us</button>`;
  };

  const embedCode = getEmbedCode();

  const EMBED_MODES: { id: EmbedMode; label: string; description: string }[] = [
    { id: "inline", label: "Inline", description: "Renders directly in the page" },
    { id: "popup", label: "Popup", description: "Opens in a centered modal" },
    { id: "slide", label: "Slide-in", description: "Slides in from the right" },
  ];

  if (formStatus !== "published") {
    return (
      <ScrollArea className="flex-1 min-h-0 h-full w-full">
        <div className="mx-auto max-w-2xl p-4 sm:p-6">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center space-y-3">
            <AlertCircle className="size-8 text-muted-foreground" />
            <h3 className="text-sm font-medium">Form not published</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              You need to publish your form before you can share or embed it.
              Click the Publish button in the toolbar above.
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0 h-full w-full">
      <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
        <div>
          <h3 className="text-lg font-semibold">Share & Embed</h3>
          <p className="text-sm text-muted-foreground">
            Add your form to any website with a single script tag
          </p>
        </div>

        {/* Direct Link */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="size-4" />
              Direct Link
            </CardTitle>
            <CardDescription className="text-xs">
              Share this link directly via email, social media, or messaging
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2 space-y-3">
            <div className="flex items-center gap-2 rounded-md bg-muted p-3">
              <code className="flex-1 text-xs break-all">{publicUrl}</code>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(publicUrl, "link")}
              >
                {copied === "link" ? (
                  <><Check className="size-3.5 mr-1.5" /> Copied</>
                ) : (
                  <><Copy className="size-3.5 mr-1.5" /> Copy Link</>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(publicUrl, "_blank")}
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Embed Mode Selection */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Code className="size-4" />
              Embed on Your Website
            </CardTitle>
            <CardDescription className="text-xs">
              Choose how the form appears and copy the code
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2 space-y-4">
            {/* Mode selector */}
            <div>
              <Label className="text-xs font-medium mb-2 block">Display Mode</Label>
              <div className="grid grid-cols-3 gap-2">
                {EMBED_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setEmbedMode(mode.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      embedMode === mode.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <p className="text-xs font-medium">{mode.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {mode.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme override toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs">Include theme in embed</Label>
                <p className="text-[10px] text-muted-foreground">
                  Override colors and fonts via data attributes
                </p>
              </div>
              <Switch
                checked={includeTheme}
                onCheckedChange={setIncludeTheme}
                size="sm"
              />
            </div>

            {/* Generated code */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Embed Code</Label>
              <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
                <code>{embedCode}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(embedCode, "embed")}
                className="w-full sm:w-auto"
              >
                {copied === "embed" ? (
                  <><Check className="size-3.5 mr-1.5" /> Copied</>
                ) : (
                  <><Copy className="size-3.5 mr-1.5" /> Copy Code</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-base">Preview</CardTitle>
            <CardDescription className="text-xs">
              How your form looks when embedded
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 sm:pt-2">
            <div className="rounded-lg border overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-muted/50 px-3 py-2 flex items-center gap-2 border-b">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-red-400/60" />
                  <div className="size-2.5 rounded-full bg-yellow-400/60" />
                  <div className="size-2.5 rounded-full bg-green-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded-md px-3 py-1 text-[10px] text-muted-foreground truncate">
                    yourwebsite.com
                  </div>
                </div>
              </div>
              {/* Iframe preview */}
              <iframe
                src={`${baseUrl}/embed/${formId}`}
                className="w-full border-none bg-white"
                style={{ height: "400px" }}
                title="Embed preview"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// Mobile panel selector for the editor tab
type MobilePanel = "steps" | "fields" | "properties";

export function BuilderLayout({
  builder,
  activeTab,
  formId,
  formStatus,
}: BuilderLayoutProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("fields");
  const [stepsOpen, setStepsOpen] = useState(true);

  if (activeTab === "preview") {
    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <PreviewPanel schema={builder.schema} settings={builder.settings} />
      </div>
    );
  }

  if (activeTab === "embed" && formId) {
    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <EmbedPanel
          formId={formId}
          formStatus={formStatus || "draft"}
          settings={builder.settings}
        />
      </div>
    );
  }

  if (activeTab === "settings") {
    return (
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <SettingsPanel builder={builder} />
      </div>
    );
  }

  // Editor tab (default)
  return (
    <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
      {/* Mobile panel selector - visible only on small screens */}
      <div className="flex border-b md:hidden">
        <Button
          variant={mobilePanel === "steps" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 rounded-none text-xs gap-1.5"
          onClick={() => setMobilePanel("steps")}
        >
          <Layers className="size-3.5" />
          Steps
        </Button>
        <Button
          variant={mobilePanel === "fields" ? "secondary" : "ghost"}
          size="sm"
          className="flex-1 rounded-none text-xs gap-1.5"
          onClick={() => setMobilePanel("fields")}
        >
          <ListChecks className="size-3.5" />
          Fields
        </Button>
        {builder.selectedField && (
          <Button
            variant={mobilePanel === "properties" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 rounded-none text-xs gap-1.5"
            onClick={() => setMobilePanel("properties")}
          >
            <Settings2 className="size-3.5" />
            Properties
          </Button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left sidebar: Steps - collapsible on desktop, toggled on mobile */}
        <div className={`${mobilePanel === "steps" ? "flex" : "hidden"} md:flex shrink-0`}>
          {stepsOpen ? (
            <StepSidebar
              steps={builder.schema.steps}
              selectedStepId={builder.selectedStepId}
              onSelectStep={(stepId) => {
                builder.selectStep(stepId);
                setMobilePanel("fields");
              }}
              onAddStep={builder.addStep}
              onRemoveStep={builder.removeStep}
              onReorderSteps={builder.reorderSteps}
              onCollapse={() => setStepsOpen(false)}
            />
          ) : (
            <div className="hidden md:flex flex-col items-center gap-2 border-r bg-muted/30 px-1.5 py-3 w-10">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setStepsOpen(true)}
                title="Expand steps panel"
                className="text-muted-foreground hover:text-foreground"
              >
                <PanelLeftOpen className="size-4" />
              </Button>
              <div className="flex flex-col items-center gap-1 mt-1">
                {builder.schema.steps.map((step, index) => (
                  <button
                    key={step.id}
                    onClick={() => {
                      builder.selectStep(step.id);
                      setStepsOpen(true);
                    }}
                    title={step.title}
                    className={`w-6 h-6 rounded text-[10px] font-semibold flex items-center justify-center transition-colors ${
                      step.id === builder.selectedStepId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted-foreground/20 text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center: Field list - always visible on desktop, toggled on mobile */}
        <div className={`${mobilePanel === "fields" ? "flex" : "hidden"} md:flex flex-1 min-w-0`}>
          <FieldList
            step={builder.selectedStep}
            selectedFieldId={builder.selectedFieldId}
            onSelectField={(fieldId) => {
              builder.selectField(fieldId);
              if (fieldId) setMobilePanel("properties");
            }}
            onAddField={builder.addField}
            onRemoveField={builder.removeField}
            onDuplicateField={builder.duplicateField}
            onReorderFields={builder.reorderFields}
          />
        </div>

        {/* Right: Field editor - always visible on desktop when field selected, toggled on mobile */}
        {builder.selectedField && builder.selectedStep && (
          <div className={`${mobilePanel === "properties" ? "flex" : "hidden"} md:flex w-full md:w-auto`}>
            <FieldEditor
              field={builder.selectedField}
              step={builder.selectedStep}
              onUpdateField={builder.updateField}
            />
          </div>
        )}
      </div>
    </div>
  );
}
