import { Logo } from "@/components/shared/logo";
import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Templates", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Support", href: "mailto:support@formai.app" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container mx-auto px-4 py-10 sm:py-14">
        {/* Top row */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Logo size="sm" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-50">
              The AI form builder built for modern websites and Webflow projects.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group} className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} formAI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
