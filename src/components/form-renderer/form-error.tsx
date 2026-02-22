"use client";

import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-900/20">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-300">
          Submission Error
        </p>
        <p className="text-sm text-red-700 dark:text-red-400">
          {message}
        </p>
      </div>
    </div>
  );
}
