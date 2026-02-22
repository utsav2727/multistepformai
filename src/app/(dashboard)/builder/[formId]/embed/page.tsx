"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Code, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Topbar } from "@/components/dashboard/topbar";
import { toast } from "sonner";

export default function EmbedPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const iframeCode = `<iframe
  src="${baseUrl}/f/${formId}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const scriptCode = `<div id="formai-${formId}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${baseUrl}/f/${formId}';
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    document.getElementById('formai-${formId}').appendChild(iframe);
  })();
</script>`;

  const directLink = `${baseUrl}/f/${formId}`;

  const copyToClipboard = async (text: string, tab: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tab);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedTab(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Embed Form" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/builder/${formId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Embed</h2>
            <p className="text-sm text-muted-foreground">
              Share or embed your form on any website
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <Tabs defaultValue="iframe">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="iframe" className="gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
                <Code className="h-3.5 w-3.5" />
                iFrame
              </TabsTrigger>
              <TabsTrigger value="script" className="gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
                <Code className="h-3.5 w-3.5" />
                Script
              </TabsTrigger>
              <TabsTrigger value="link" className="gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm">
                <Globe className="h-3.5 w-3.5" />
                Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="iframe" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">iFrame Embed</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Paste this code into your HTML to embed the form as an
                    iframe.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 sm:p-4 text-xs sm:text-sm">
                    <code>{iframeCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(iframeCode, "iframe")}
                    className="w-full sm:w-auto"
                  >
                    {copiedTab === "iframe" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="script" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Script Embed</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Paste this script tag into your HTML. It will dynamically
                    create the form embed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                  <pre className="overflow-x-auto rounded-md bg-muted p-3 sm:p-4 text-xs sm:text-sm">
                    <code>{scriptCode}</code>
                  </pre>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(scriptCode, "script")}
                    className="w-full sm:w-auto"
                  >
                    {copiedTab === "script" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="link" className="mt-4">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Direct Link</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Share this link directly with anyone to access the form.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
                  <div className="flex items-center gap-2 rounded-md bg-muted p-3 sm:p-4">
                    <code className="flex-1 text-xs sm:text-sm break-all">
                      {directLink}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(directLink, "link")}
                    className="w-full sm:w-auto"
                  >
                    {copiedTab === "link" ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
