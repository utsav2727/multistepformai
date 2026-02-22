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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 px-4 text-center bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10">
        {icon ?? <FileText className="h-8 w-8 text-purple-500" />}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{heading}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <Button asChild className="mt-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 border-0 text-white glow transition-all duration-300">
        <Link href={actionHref}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      </Button>
    </div>
  );
}
