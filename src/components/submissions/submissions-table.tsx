"use client";

import { useState, useMemo } from "react";
import type { Submission, FormSchema, SubmissionValue } from "@/lib/form-schema/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SubmissionsTableProps {
  submissions: Submission[];
  formSchema?: FormSchema;
}

function formatValue(value: SubmissionValue): string {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function SubmissionsTable({
  submissions,
  formSchema,
}: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  const fieldMap = useMemo(() => {
    const map = new Map<string, string>();
    if (formSchema) {
      for (const step of formSchema.steps) {
        for (const field of step.fields) {
          map.set(field.id, field.label);
        }
      }
    }
    return map;
  }, [formSchema]);

  const columns = useMemo(() => {
    if (formSchema) {
      const fields: { id: string; label: string }[] = [];
      for (const step of formSchema.steps) {
        for (const field of step.fields) {
          fields.push({ id: field.id, label: field.label });
        }
      }
      return fields.slice(0, 5);
    }

    if (submissions.length > 0) {
      const keys = Object.keys(submissions[0].data);
      return keys.slice(0, 5).map((key) => ({
        id: key,
        label: fieldMap.get(key) || key,
      }));
    }

    return [];
  }, [formSchema, submissions, fieldMap]);

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
        <p className="text-sm text-muted-foreground">
          No submissions yet. Share your form to start collecting responses.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <ScrollArea className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={col.id}
                    className="px-4 py-3 text-left font-medium text-muted-foreground"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr
                  key={submission.id}
                  className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.id} className="max-w-[200px] truncate px-4 py-3">
                      {formatValue(submission.data[col.id])}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <Badge
                      variant={submission.isComplete ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {submission.isComplete ? "Complete" : "Partial"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatDate(submission.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      <Dialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmission(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Detail</DialogTitle>
            <DialogDescription>
              {selectedSubmission
                ? `Submitted ${formatDate(selectedSubmission.createdAt)}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {fieldMap.get(key) || key}
                    </p>
                    <p className="text-sm">{formatValue(value)}</p>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Status:{" "}
                    {selectedSubmission.isComplete ? "Complete" : "Partial"}
                  </p>
                  {selectedSubmission.metadata?.duration != null && (
                    <p className="text-xs text-muted-foreground">
                      Duration: {selectedSubmission.metadata.duration}s
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
