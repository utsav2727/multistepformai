import { Logo } from "@/components/shared/logo";

export function Footer() {
  return (
    <footer className="border-t py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Logo size="sm" />
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} formAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
