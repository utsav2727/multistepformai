import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 sm:px-4 py-1.5 text-xs sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            <span>AI-powered form generation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight">
            Build forms with AI.
            <br />
            <span className="text-primary">Embed anywhere.</span>
          </h1>

          <p className="mx-auto max-w-xl text-base sm:text-lg text-muted-foreground">
            Describe your form in plain English. AI generates a beautiful
            multi-step form in seconds. Customize and embed it on any website
            with one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/signup">
                Start Building Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#features">See How It Works</Link>
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground">
            No credit card required. 3 forms free forever.
          </p>
        </div>

        {/* Demo preview */}
        <div className="mx-auto mt-10 sm:mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-3 sm:px-4 py-2 sm:py-3">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-400" />
            </div>
            <div className="p-4 sm:p-8">
              <div className="mx-auto max-w-md space-y-4 text-left">
                <div className="rounded-lg bg-muted/50 p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    &ldquo;Create a customer feedback form with rating, comments,
                    and follow-up preferences&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                  <span className="text-xs sm:text-sm text-primary">
                    Generating your form...
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-3 rounded-lg border p-3 sm:p-4">
                  <div className="h-2.5 sm:h-3 w-3/4 rounded bg-muted" />
                  <div className="h-7 sm:h-8 rounded bg-muted/70" />
                  <div className="h-2.5 sm:h-3 w-1/2 rounded bg-muted" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-5 w-5 sm:h-6 sm:w-6 rounded bg-primary/20"
                      />
                    ))}
                  </div>
                  <div className="h-2.5 sm:h-3 w-2/3 rounded bg-muted" />
                  <div className="h-16 sm:h-20 rounded bg-muted/70" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
