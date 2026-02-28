export default function PublicFormLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl animate-pulse">
        {/* Title skeleton */}
        <div className="mb-6 sm:mb-8 text-center space-y-3">
          <div className="h-6 sm:h-7 bg-muted rounded-lg w-48 mx-auto" />
          <div className="h-4 bg-muted rounded w-64 mx-auto" />
        </div>

        {/* Progress bar skeleton */}
        <div className="space-y-1.5 mb-6">
          <div className="flex justify-between">
            <div className="h-3 bg-muted rounded w-12" />
            <div className="h-3 bg-muted rounded w-8" />
          </div>
          <div className="h-1 bg-muted rounded-full w-full" />
        </div>

        {/* Field skeleton */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-48" />
          </div>
          <div className="h-10 bg-muted rounded-md w-full" />
        </div>

        {/* Button skeleton */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-9 bg-muted rounded-md w-24" />
        </div>
      </div>
    </div>
  );
}
