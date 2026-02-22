"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";
import { SubmissionsTable } from "@/components/submissions/submissions-table";
import { SubmissionsStats } from "@/components/submissions/submissions-stats";
import { ExportButton } from "@/components/submissions/export-button";
import { useSubmissions } from "@/hooks/use-submissions";
import { useForm } from "@/hooks/use-forms";

export default function SubmissionsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { submissions, loading, error } = useSubmissions(formId);
  const { form } = useForm(formId);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Submissions" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          <ExportButton formId={formId} disabled={!submissions.length} />
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
              completedSubmissions={
                submissions.filter((s) => s.isComplete).length
              }
            />
            <div className="overflow-x-auto">
              <SubmissionsTable
                submissions={submissions}
                formSchema={form?.schema}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
