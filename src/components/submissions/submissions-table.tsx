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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trash2, Filter } from "lucide-react";

interface SubmissionsTableProps {
  submissions: Submission[];
  formSchema?: FormSchema;
  onDelete?: (ids: string[]) => Promise<void>;
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

type FilterStatus = "all" | "complete" | "partial";

export function SubmissionsTable({
  submissions,
  formSchema,
  onDelete,
}: SubmissionsTableProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      return fields.slice(0, 4);
    }
    if (submissions.length > 0) {
      const keys = Object.keys(submissions[0].data);
      return keys.slice(0, 4).map((key) => ({
        id: key,
        label: fieldMap.get(key) || key,
      }));
    }
    return [];
  }, [formSchema, submissions, fieldMap]);

  const filtered = useMemo(() => {
    return submissions.filter((s) => {
      if (filterStatus === "complete" && !s.isComplete) return false;
      if (filterStatus === "partial" && s.isComplete) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const values = Object.values(s.data).map((v) => formatValue(v).toLowerCase());
        return values.some((v) => v.includes(q));
      }
      return true;
    });
  }, [submissions, search, filterStatus]);

  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.add(s.id));
        return next;
      });
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (!onDelete || selected.size === 0) return;
    setDeleting(true);
    try {
      await onDelete(Array.from(selected));
      setSelected(new Set());
    } finally {
      setDeleting(false);
    }
  };

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
      {/* Search + Filter toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search responses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="size-3.5 text-muted-foreground" />
          <div className="flex items-center rounded-md border bg-muted/50 p-0.5 gap-0.5">
            {(["all", "complete", "partial"] as FilterStatus[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-2.5 py-0.5 rounded text-xs font-medium capitalize transition-colors ${
                  filterStatus === f
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {selected.size > 0 && onDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="h-7 text-xs gap-1"
              onClick={handleBulkDelete}
              disabled={deleting}
            >
              <Trash2 className="size-3" />
              Delete {selected.size}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <ScrollArea className="w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {onDelete && (
                  <th className="px-3 py-3 w-8">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </th>
                )}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                {columns.map((col) => (
                  <th key={col.id} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onDelete ? 4 : 3)}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No matching submissions.
                  </td>
                </tr>
              ) : (
                filtered.map((submission, index) => (
                  <tr
                    key={submission.id}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    {onDelete && (
                      <td
                        className="px-3 py-3 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selected.has(submission.id)}
                          onCheckedChange={() => toggleOne(submission.id)}
                          aria-label="Select row"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-muted-foreground">{index + 1}</td>
                    {columns.map((col) => (
                      <td key={col.id} className="max-w-[180px] truncate px-4 py-3">
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
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* Detail dialog */}
      <Dialog
        open={selectedSubmission !== null}
        onOpenChange={(open) => { if (!open) setSelectedSubmission(null); }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission Detail</DialogTitle>
            <DialogDescription>
              {selectedSubmission ? `Submitted ${formatDate(selectedSubmission.createdAt)}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 pr-4">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {fieldMap.get(key) || key}
                    </p>
                    <p className="text-sm">{formatValue(value)}</p>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedSubmission.isComplete ? "default" : "secondary"} className="text-[10px]">
                      {selectedSubmission.isComplete ? "Complete" : "Partial"}
                    </Badge>
                  </div>
                  {selectedSubmission.metadata?.duration != null && (
                    <p className="text-xs text-muted-foreground">
                      Completion time: {selectedSubmission.metadata.duration}s
                    </p>
                  )}
                  {selectedSubmission.metadata?.referrer && (
                    <p className="text-xs text-muted-foreground truncate">
                      Referrer: {selectedSubmission.metadata.referrer}
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
