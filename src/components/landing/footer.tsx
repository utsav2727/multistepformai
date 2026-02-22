import { Logo } from "@/components/shared/logo";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} formAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
