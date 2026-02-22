"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Code, Copy, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import type { FormListItem } from "@/types/api";
import { toast } from "sonner";

interface FormCardProps {
  form: FormListItem;
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusVariant(
  status: FormListItem["status"]
): "default" | "secondary" | "outline" {
  switch (status) {
    case "published":
      return "default";
    case "draft":
      return "secondary";
    case "archived":
      return "outline";
    default:
      return "secondary";
  }
}

export function FormCard({ form, onDuplicate, onDelete }: FormCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <Link
        href={`/builder/${form.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Edit ${form.title}`}
      />
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1 pr-8">
            <CardTitle className="line-clamp-1 text-sm sm:text-base">
              {form.title || "Untitled Form"}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs">
              {form.description || "No description"}
            </CardDescription>
          </div>
          <div className="relative z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/builder/${form.id}`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                {form.status === "published" && (
                  <DropdownMenuItem
                    onClick={() => window.open(`/f/${form.id}`, "_blank")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Published
                  </DropdownMenuItem>
                )}
                {form.status === "published" && (
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(
                          `${window.location.origin}/f/${form.id}`
                        );
                        toast.success("Form link copied");
                      } catch {
                        toast.error("Failed to copy link");
                      }
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href={`/builder/${form.id}?tab=embed`}>
                    <Code className="mr-2 h-4 w-4" />
                    Embed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate(form.id)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(form.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant={statusVariant(form.status)} className="text-[10px]">
              {form.status}
            </Badge>
            <span>{form.submission_count} submissions</span>
          </div>
          <span className="hidden sm:inline">Updated {formatDate(form.updated_at)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
