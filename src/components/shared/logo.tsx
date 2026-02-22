import { Sparkles } from "lucide-react";
import Link from "next/link";

export function Logo({ size = "default" }: { size?: "default" | "sm" }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Sparkles
        className={size === "sm" ? "h-5 w-5 text-primary" : "h-6 w-6 text-primary"}
      />
      <span
        className={`font-bold ${size === "sm" ? "text-lg" : "text-xl"}`}
      >
        formAI
      </span>
    </Link>
  );
}
