"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

interface FormSuccessProps {
  message: string;
  redirectUrl: string | null;
}

export function FormSuccess({ message, redirectUrl }: FormSuccessProps) {
  useEffect(() => {
    if (redirectUrl) {
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [redirectUrl]);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="size-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Thank you!
        </h2>
        <p className="text-muted-foreground max-w-md text-sm">
          {message || "Your response has been submitted successfully."}
        </p>
      </div>
      {redirectUrl && (
        <p className="text-muted-foreground text-xs">
          Redirecting you shortly...
        </p>
      )}
    </div>
  );
}
