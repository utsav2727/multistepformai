"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Save,
  Plus,
  Trash2,
  Zap,
  Mail,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Topbar } from "@/components/dashboard/topbar";
import { useForm } from "@/hooks/use-forms";
import { toast } from "sonner";
import type { FormSettings } from "@/lib/form-schema/types";

interface Webhook {
  id: string;
  url: string;
  secret: string | null;
  enabled: boolean;
  created_at: string;
}

interface WebhookLog {
  id: string;
  status_code: number | null;
  success: boolean;
  error: string | null;
  attempt: number;
  created_at: string;
}

export default function FormSettingsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { form, loading: formLoading } = useForm(formId);

  // General
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [savingGeneral, setSavingGeneral] = useState(false);

  // Notifications
  const [emailOnSubmission, setEmailOnSubmission] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("");
  const [savingNotifications, setSavingNotifications] = useState(false);

  // Webhooks
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [webhooksLoading, setWebhooksLoading] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookSecret, setNewWebhookSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [addingWebhook, setAddingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [logs, setLogs] = useState<Record<string, WebhookLog[]>>({});

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description);
      const n = form.settings?.notifications;
      if (n) {
        setEmailOnSubmission(n.emailOnSubmission ?? false);
        setNotificationEmail(n.notificationEmail ?? "");
        setSlackWebhookUrl(n.slackWebhookUrl ?? "");
      }
    }
  }, [form]);

  useEffect(() => {
    if (!formId) return;
    setWebhooksLoading(true);
    fetch(`/api/forms/${formId}/webhooks`)
      .then((r) => r.json())
      .then(setWebhooks)
      .catch(() => {})
      .finally(() => setWebhooksLoading(false));
  }, [formId]);

  const saveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("General settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingGeneral(false);
    }
  };

  const saveNotifications = async () => {
    if (!form) return;
    setSavingNotifications(true);
    try {
      const settings: FormSettings = {
        ...form.settings,
        notifications: {
          emailOnSubmission,
          notificationEmail: notificationEmail.trim() || null,
          slackWebhookUrl: slackWebhookUrl.trim() || null,
        },
      };
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("Notification settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSavingNotifications(false);
    }
  };

  const addWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    setAddingWebhook(true);
    try {
      const res = await fetch(`/api/forms/${formId}/webhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newWebhookUrl.trim(), secret: newWebhookSecret.trim() || null }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const wh: Webhook = await res.json();
      setWebhooks((prev) => [wh, ...prev]);
      setNewWebhookUrl("");
      setNewWebhookSecret("");
      toast.success("Webhook added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add webhook");
    } finally {
      setAddingWebhook(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const res = await fetch(`/api/forms/${formId}/webhooks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
      toast.success("Webhook removed");
    } catch {
      toast.error("Failed to remove webhook");
    }
  };

  const toggleWebhook = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/forms/${formId}/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, enabled } : w)));
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  const testWebhook = async (id: string) => {
    setTestingWebhook(id);
    try {
      const res = await fetch(`/api/forms/${formId}/webhooks/${id}/test`, { method: "POST" });
      const result = await res.json();
      if (result.success) {
        toast.success(`Webhook responded with HTTP ${result.statusCode}`);
      } else {
        toast.error(`Webhook failed: ${result.error || `HTTP ${result.statusCode}`}`);
      }
    } catch {
      toast.error("Failed to test webhook");
    } finally {
      setTestingWebhook(null);
    }
  };

  const loadLogs = async (id: string) => {
    if (expandedLogs === id) {
      setExpandedLogs(null);
      return;
    }
    setExpandedLogs(id);
    if (logs[id]) return;
    try {
      const res = await fetch(`/api/forms/${formId}/webhooks/${id}/logs`);
      const data: WebhookLog[] = await res.json();
      setLogs((prev) => ({ ...prev, [id]: data }));
    } catch {
      toast.error("Failed to load logs");
    }
  };

  if (formLoading) {
    return (
      <div className="flex flex-col h-full">
        <Topbar title="Settings" />
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Topbar title="Form Settings" />
      <div className="flex-1 p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/builder/${formId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-sm text-muted-foreground">Configure your form</p>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* General */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-base">General</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Form Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={saveGeneral} disabled={savingGeneral} size="sm" className="gap-1.5">
                  {savingGeneral ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Email Notifications</CardTitle>
              </div>
              <CardDescription>
                Get notified by email when someone submits your form.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notif" className="cursor-pointer">
                  Send notification email on submission
                </Label>
                <Switch
                  id="email-notif"
                  checked={emailOnSubmission}
                  onCheckedChange={setEmailOnSubmission}
                />
              </div>
              {emailOnSubmission && (
                <div className="space-y-2">
                  <Label htmlFor="notif-email">Notification email address</Label>
                  <Input
                    id="notif-email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Slack */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Slack Notifications</CardTitle>
              </div>
              <CardDescription>
                Post a message to Slack when a form is submitted. Paste your{" "}
                <a
                  href="https://api.slack.com/messaging/webhooks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  Slack Incoming Webhook URL
                </a>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Input
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveNotifications} disabled={savingNotifications} size="sm" className="gap-1.5">
              {savingNotifications ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Save className="size-3.5" />
              )}
              Save Notification Settings
            </Button>
          </div>

          {/* Webhooks */}
          <Card>
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-muted-foreground" />
                <CardTitle className="text-base">Webhooks</CardTitle>
              </div>
              <CardDescription>
                Send a POST request to your endpoint on every submission. Optionally add a secret for HMAC-SHA256 signature verification via{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">X-FormAI-Signature</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-4">
              {/* Add form */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Add Endpoint
                </p>
                <Input
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  placeholder="https://your-server.com/webhook"
                />
                <div className="relative">
                  <Input
                    value={newWebhookSecret}
                    onChange={(e) => setNewWebhookSecret(e.target.value)}
                    type={showSecret ? "text" : "password"}
                    placeholder="Secret key (optional)"
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Button
                  size="sm"
                  onClick={addWebhook}
                  disabled={addingWebhook || !newWebhookUrl.trim()}
                  className="gap-1.5"
                >
                  {addingWebhook ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Plus className="size-3.5" />
                  )}
                  Add Webhook
                </Button>
              </div>

              {/* List */}
              {webhooksLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : webhooks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No webhooks configured.
                </p>
              ) : (
                <div className="space-y-2">
                  {webhooks.map((wh) => (
                    <div key={wh.id} className="rounded-lg border bg-background">
                      <div className="flex items-center gap-2 p-3">
                        <Switch
                          checked={wh.enabled}
                          onCheckedChange={(v) => toggleWebhook(wh.id, v)}
                          className="shrink-0"
                        />
                        <span className="flex-1 min-w-0 text-sm font-mono truncate text-muted-foreground">
                          {wh.url}
                        </span>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => testWebhook(wh.id)}
                          disabled={testingWebhook === wh.id}
                          title="Send test payload"
                        >
                          {testingWebhook === wh.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <FlaskConical className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => loadLogs(wh.id)}
                          title="View delivery logs"
                          className={expandedLogs === wh.id ? "text-primary" : ""}
                        >
                          {expandedLogs === wh.id ? (
                            <ChevronUp className="size-3.5" />
                          ) : (
                            <ChevronDown className="size-3.5" />
                          )}
                        </Button>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          onClick={() => deleteWebhook(wh.id)}
                          className="text-destructive hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      {/* Delivery logs */}
                      {expandedLogs === wh.id && (
                        <div className="border-t bg-muted/30 px-3 py-2.5">
                          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                            Delivery Logs
                          </p>
                          {!logs[wh.id] ? (
                            <div className="flex justify-center py-2">
                              <Loader2 className="size-4 animate-spin text-muted-foreground" />
                            </div>
                          ) : logs[wh.id].length === 0 ? (
                            <p className="text-xs text-muted-foreground py-1">No deliveries yet.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {logs[wh.id].map((log) => (
                                <div key={log.id} className="flex items-center gap-2 text-xs">
                                  {log.success ? (
                                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-500" />
                                  ) : (
                                    <XCircle className="size-3.5 shrink-0 text-destructive" />
                                  )}
                                  <Badge
                                    variant={log.success ? "default" : "destructive"}
                                    className="text-[10px] px-1.5 py-0"
                                  >
                                    {log.status_code ?? "—"}
                                  </Badge>
                                  <span className="flex-1 truncate text-muted-foreground">
                                    {log.error || (log.success ? "Delivered" : "Failed")}
                                  </span>
                                  <span className="text-muted-foreground whitespace-nowrap flex items-center gap-0.5 shrink-0">
                                    <Clock className="size-3" />
                                    {new Date(log.created_at).toLocaleString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
