"use client";

import { use, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { SubmissionsStats } from "@/components/submissions/submissions-stats";
import { ExportButton } from "@/components/submissions/export-button";
import { useSubmissions } from "@/hooks/use-submissions";
import { useForm } from "@/hooks/use-forms";
import { toast } from "sonner";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { submissions, loading, error, mutate } = useSubmissions(formId);
  const { form } = useForm(formId);

  const handleDelete = useCallback(
    async (ids: string[]) => {
      try {
        const res = await fetch(
          `/api/forms/${formId}/submissions/bulk-delete`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
          }
        );
        if (!res.ok) throw new Error("Delete failed");
        toast.success(`Deleted ${ids.length} submission${ids.length !== 1 ? "s" : ""}`);
        mutate();
      } catch {
        toast.error("Failed to delete submissions");
      }
    },
    [formId, mutate]
  );

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Submissions" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/builder/${formId}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Submissions
              </h2>
              <p className="text-sm text-muted-foreground">
                {form?.title ?? "Loading..."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <Link href={`/builder/${formId}/analytics`}>
                <BarChart2 className="size-3.5" />
                Analytics
              </Link>
            </Button>
            <ExportButton formId={formId} disabled={!submissions.length} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <>
            <SubmissionsStats
              totalSubmissions={submissions.length}
              completedSubmissions={submissions.filter((s) => s.isComplete).length}
            />
            <SubmissionsTable
              submissions={submissions}
              formSchema={form?.schema}
              onDelete={handleDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
