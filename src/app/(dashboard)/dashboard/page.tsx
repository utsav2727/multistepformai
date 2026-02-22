"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/dashboard/topbar";
import { FormList } from "@/components/dashboard/form-list";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useForms } from "@/hooks/use-forms";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardPage() {
  const { forms, loading, error, mutate } = useForms();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDuplicate = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/duplicate`, {
        method: "POST",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to duplicate form");
      }
      toast.success("Form duplicated successfully");
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate form"
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/forms/${deleteId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete form");
      }
      toast.success("Form deleted successfully");
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete form"
      );
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dashboard" />
      <div className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Your Forms</h2>
            <p className="text-sm text-muted-foreground">
              Create and manage your AI-powered forms.
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/new">
              <Plus className="h-4 w-4" />
              New Form
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-xl border p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={mutate}>
              Try Again
            </Button>
          </div>
        ) : (
          <FormList
            forms={forms}
            onDuplicate={handleDuplicate}
            onDelete={(id) => setDeleteId(id)}
          />
        )}
      </div>

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        title="Delete Form"
        description="Are you sure you want to delete this form? This action cannot be undone. All submissions will also be deleted."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
