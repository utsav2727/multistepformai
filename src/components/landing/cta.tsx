import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-t py-16 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Ready to build smarter forms?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Join thousands of businesses using AI to create forms that convert.
            Start for free in 30 seconds.
          </p>
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href="/signup">
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
