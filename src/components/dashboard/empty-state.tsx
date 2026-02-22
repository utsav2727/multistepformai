import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: React.ReactNode;
  heading?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon,
  heading = "No forms yet",
  description = "Get started by creating your first AI-powered form.",
  actionLabel = "Create your first form",
  actionHref = "/dashboard/new",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon ?? <FileText className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}
