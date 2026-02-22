"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface EmbedCodeDisplayProps {
  code: string;
  label: string;
}

export function EmbedCodeDisplay({ code, label }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="mr-1 h-3 w-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
