"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmbedCodeDisplay } from "./embed-code-display";

interface EmbedOptionsProps {
  formId: string;
  appUrl: string;
}

export function EmbedOptions({ formId, appUrl }: EmbedOptionsProps) {
  const [mode] = useState<"script" | "iframe" | "popup">("script");

  const scriptEmbed = `<script src="${appUrl}/embed.js" data-formai-id="${formId}" data-mode="inline"></script>`;

  const iframeEmbed = `<iframe src="${appUrl}/embed/${formId}" width="100%" height="600" frameborder="0" style="border:none;" title="Form"></iframe>`;

  const popupEmbed = `<script src="${appUrl}/embed.js" data-formai-id="${formId}" data-mode="popup"></script>
<button onclick="window.FormAI.open()">Open Form</button>`;

  const slideEmbed = `<script src="${appUrl}/embed.js" data-formai-id="${formId}" data-mode="slide"></script>
<button onclick="window.FormAI.open()">Open Form</button>`;

  const directLink = `${appUrl}/f/${formId}`;

  return (
    <Tabs defaultValue="script" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="script">Script</TabsTrigger>
        <TabsTrigger value="popup">Popup</TabsTrigger>
        <TabsTrigger value="slide">Slide-in</TabsTrigger>
        <TabsTrigger value="link">Direct Link</TabsTrigger>
      </TabsList>

      <TabsContent value="script" className="mt-4">
        <EmbedCodeDisplay
          label="Paste this script tag into your HTML"
          code={scriptEmbed}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Renders the form natively in your page — no iframe. Works in Webflow
          custom code, WordPress, or any HTML page.
        </p>
      </TabsContent>

      <TabsContent value="popup" className="mt-4">
        <EmbedCodeDisplay
          label="Add the script and trigger button"
          code={popupEmbed}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          The form opens in a centered modal overlay. Customize the button as needed.
        </p>
      </TabsContent>

      <TabsContent value="slide" className="mt-4">
        <EmbedCodeDisplay
          label="Add the script and trigger button"
          code={slideEmbed}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          The form slides in from the right side. Customize the button as needed.
        </p>
      </TabsContent>

      <TabsContent value="link" className="mt-4">
        <EmbedCodeDisplay label="Share this link directly" code={directLink} />
        <p className="mt-2 text-xs text-muted-foreground">
          Share this URL directly via email, social media, or messaging.
        </p>
      </TabsContent>
    </Tabs>
  );
}
